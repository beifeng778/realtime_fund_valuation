import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 兼容两种请求方式：
  // 1. /api/sina?list=nf_AG0
  // 2. /api/sina/list=nf_AG0 (Vercel 会把后面的内容作为 path 传入)

  const { list, pathRemainder } = request.query;
  let queryString = "";

  if (list) {
    queryString = `list=${list}`;
  } else if (pathRemainder) {
    // 处理 Vercel 路由捕获的情况
    queryString = Array.isArray(pathRemainder)
      ? pathRemainder.join("/")
      : pathRemainder;
  } else {
    // 尝试从原始 URL 解析，兼容本地环境或其他情况
    const urlParts = request.url?.split("/api/sina/");
    if (urlParts && urlParts.length > 1) {
      queryString = urlParts[1];
    }
  }

  if (!queryString) {
    console.error("Sina Proxy: Missing parameters", request.url);
    return response.status(400).send("Missing query parameters");
  }

  const targetUrl = `https://hq.sinajs.cn/${queryString}`;
  console.log(`Sina Proxy Action: Fetching from ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://finance.sina.com.cn",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return response.status(res.status).send(`Sina API Error: ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    response.setHeader("Content-Type", "text/plain; charset=gbk");
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return response.status(200).send(buffer);
  } catch (error: any) {
    console.error("Sina Proxy Internal Error:", error);
    return response.status(500).send(`Internal Proxy Error: ${error.message}`);
  }
}
