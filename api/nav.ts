import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 截取 `/api/nav/` 之后的所有内容作为目标路径和参数
  const urlParts = request.url?.split("/api/nav/");
  const targetPath = urlParts && urlParts.length > 1 ? urlParts[1] : "";

  if (!targetPath) {
    return response.status(400).send("Missing NAV path/parameters");
  }

  const targetUrl = `https://api.fund.eastmoney.com/${targetPath}`;
  console.log(`NAV Proxy Action: Fetching from ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://fund.eastmoney.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return response.status(res.status).send(`NAV API Error: ${res.status}`);
    }

    const data = await res.json();

    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return response.status(200).json(data);
  } catch (error: any) {
    console.error("NAV Proxy Internal Error:", error);
    return response.status(500).send(`Internal Proxy Error: ${error.message}`);
  }
}
