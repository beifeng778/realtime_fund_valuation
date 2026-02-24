import type { FundGzRaw, FundValuation } from "@/types";

/**
 * 解析天天基金 JSONP 响应
 * 格式: jsonpgz({"fundcode":"005827",...});
 */
function parseJsonp(text: string): FundGzRaw | null {
  const match = text.match(/jsonpgz\((.+)\);?/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** 将原始数据转换为类型安全的估值对象 */
function toValuation(raw: FundGzRaw): FundValuation {
  return {
    code: raw.fundcode,
    name: raw.name,
    navDate: raw.jzrq,
    nav: parseFloat(raw.dwjz),
    estimatedNav: parseFloat(raw.gsz),
    estimatedChangePercent: parseFloat(raw.gszzl),
    estimatedTime: raw.gztime,
  };
}

/**
 * 获取单只基金的实时估值
 * 通过 Vite 代理访问天天基金 API
 */
export async function fetchFundValuation(
  code: string,
): Promise<FundValuation | null> {
  try {
    const resp = await fetch(`/api/fund/${code}.js?rt=${Date.now()}`);
    const text = await resp.text();
    const raw = parseJsonp(text);
    if (!raw) return null;
    return toValuation(raw);
  } catch (err) {
    console.error(`获取基金 ${code} 估值失败:`, err);
    return null;
  }
}

/**
 * 批量获取多只基金的实时估值
 */
export async function fetchAllFundValuations(
  codes: string[],
): Promise<Map<string, FundValuation>> {
  const results = new Map<string, FundValuation>();
  const promises = codes.map(async (code) => {
    const val = await fetchFundValuation(code);
    if (val) results.set(code, val);
  });
  await Promise.all(promises);
  return results;
}
