import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 获取请求参数
  const { list } = request.query;

  if (!list) {
    console.error(
      "Sina Proxy: Missing [list] parameter in query",
      request.query,
    );
    return response
      .status(400)
      .send(
        `Missing list parameter. Received query: ${JSON.stringify(request.query)}`,
      );
  }

  const targetUrl = `https://hq.sinajs.cn/list=${list}`;
  console.log(`Sina Proxy: Fetching from ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        Referer: "https://finance.sina.com.cn",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `Sina API Error: ${res.status} ${res.statusText}`,
        errorText,
      );
      return response
        .status(res.status)
        .send(`Sina API Error: ${res.status} - ${errorText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 检查内容是否为空
    if (buffer.length < 10) {
      console.warn(
        `Sina Proxy: Received suspiciously short response for ${list}`,
      );
    }

    response.setHeader("Content-Type", "text/plain; charset=gbk");
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    return response.status(200).send(buffer);
  } catch (error: any) {
    console.error("Sina Proxy Internal Error:", error);
    return response.status(500).send(`Internal Proxy Error: ${error.message}`);
  }
}
