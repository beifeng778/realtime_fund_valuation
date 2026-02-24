import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { query } = request;
  // 获取请求参数，例如 list=nf_AG0
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const targetUrl = `https://hq.sinajs.cn/${queryString}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://finance.sina.com.cn",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return response
        .status(res.status)
        .json({ error: "Failed to fetch from Sina" });
    }

    // 获取原始 ArrayBuffer 以保留 GBK 编码
    const buffer = await res.arrayBuffer();

    // 设置响应头，告诉浏览器这是 GBK 编码（或者直接透传，前端已经有 TextDecoder）
    // 为了保险，我们直接透传内容的二进制流
    response.setHeader("Content-Type", "text/plain; charset=gbk");
    return response.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error("Sina Proxy Error:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
