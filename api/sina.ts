import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 直接从 query 中获取 list 参数
  const { list } = request.query;

  if (!list) {
    return response.status(400).send("Missing list parameter");
  }

  const targetUrl = `https://hq.sinajs.cn/list=${list}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://finance.sina.com.cn",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Sina API responded with status: ${res.status}`);
      return response.status(res.status).send("Failed to fetch from Sina");
    }

    // 获取数据并强制以 Buffer 形式发送，确保编码不被破坏
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 设置正确的 Content-Type
    response.setHeader("Content-Type", "text/plain; charset=gbk");
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return response.status(200).send(buffer);
  } catch (error) {
    console.error("Sina Proxy Internal Error:", error);
    return response.status(500).send("Internal Server Error");
  }
}
