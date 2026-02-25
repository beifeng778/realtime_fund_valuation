import type { VercelRequest, VercelResponse } from "@vercel/node";

const NAV_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url, options, NAV_TIMEOUT_MS);
      if (res.ok) return res;
      // 非 200 但不是网络错误，直接返回让调用方处理
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(
        `NAV fetch attempt ${i + 1}/${retries + 1} failed:`,
        err.message,
      );
      if (i < retries) {
        // 短暂等待后重试（200ms、400ms）
        await new Promise((r) => setTimeout(r, (i + 1) * 200));
      }
    }
  }
  throw lastError;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { pathRemainder } = request.query;
  let targetPath = "";

  if (pathRemainder) {
    // Vercel 路由捕获的情况
    targetPath = Array.isArray(pathRemainder)
      ? pathRemainder.join("/")
      : pathRemainder;
    // 补回查询参数
    const queryIdx = request.url?.indexOf("?") ?? -1;
    if (queryIdx !== -1) {
      // 需要移除 Vercel 注入的 pathRemainder 参数以防干扰后端
      const fullQuery = request.url!.slice(queryIdx + 1);
      const cleanQuery = fullQuery
        .split("&")
        .filter((p: string) => !p.startsWith("pathRemainder="))
        .join("&");
      if (cleanQuery) targetPath += "?" + cleanQuery;
    }
  } else {
    // 兜底：从路径中截取
    const urlParts = request.url?.split("/api/nav/");
    targetPath = urlParts && urlParts.length > 1 ? urlParts[1] : "";
  }

  if (!targetPath) {
    return response.status(400).send("Missing NAV path/parameters");
  }

  const targetUrl = `https://api.fund.eastmoney.com/${targetPath}`;
  console.log(`NAV Proxy: Fetching from ${targetUrl}`);

  try {
    const res = await fetchWithRetry(
      targetUrl,
      {
        headers: {
          Referer: "https://fund.eastmoney.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
      MAX_RETRIES,
    );

    if (!res.ok) {
      return response.status(res.status).send(`NAV API Error: ${res.status}`);
    }

    const data = await res.json();

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    return response.status(200).json(data);
  } catch (error: any) {
    const isTimeout = error.name === "AbortError";
    console.error(
      `NAV Proxy Error [${isTimeout ? "TIMEOUT" : "NETWORK"}]:`,
      error.message,
    );
    return response
      .status(isTimeout ? 504 : 502)
      .send(
        `NAV Proxy ${isTimeout ? "Timeout" : "Network Error"}: ${error.message}`,
      );
  }
}
