import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 获取完整的查询字符串
  const search = request.url?.split("?")[1] || "";

  if (!search) {
    return response.status(400).send("Missing query parameters");
  }

  const targetUrl = `https://api.fund.eastmoney.com/${search}`;
  console.log(`NAV Proxy: Fetching from ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://fund.eastmoney.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `NAV API Error: ${res.status} ${res.statusText}`,
        errorText,
      );
      return response
        .status(res.status)
        .send(`NAV API Error: ${res.status} - ${errorText}`);
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
