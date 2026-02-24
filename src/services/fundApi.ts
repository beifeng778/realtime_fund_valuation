import type { FundGzRaw, FundValuation } from "@/types";

// ---------- 基金 → 期货合约映射表 ----------

/**
 * symbol: Sina 期货主力连续合约代码
 * AG0=白银主力  AU0=黄金主力  CU0=沪铜主力 等
 */
const FUND_FUTURES_MAP: Record<string, { symbol: string; name: string }> = {
  "161226": { symbol: "AG0", name: "国投瑞银白银期货(LOF)A" },
  "019005": { symbol: "AG0", name: "国投瑞银白银期货(LOF)C" },
};

// ---------- 天天基金估值 API ----------

function parseJsonp(text: string): FundGzRaw | null {
  const match = text.match(/jsonpgz\((.+)\);?/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function toValuation(raw: FundGzRaw): FundValuation {
  return {
    code: raw.fundcode,
    name: raw.name,
    navDate: raw.jzrq,
    nav: parseFloat(raw.dwjz),
    estimatedNav: parseFloat(raw.gsz),
    estimatedChangePercent: parseFloat(raw.gszzl),
    estimatedTime: raw.gztime,
    isEstimated: true,
  };
}

// ---------- Sina 期货行情 API ----------

/**
 * Sina 期货行情返回格式 (GBK 编码):
 * var hq_str_nf_AG0="白银连续,150000,今开,最高,最低,最新,买一,卖一,结算,昨结算,昨收,...";
 * 字段5=最新价  字段10=昨收盘价
 */
interface FuturesQuote {
  name: string;
  changePercent: number;
}

async function fetchFuturesQuote(symbol: string): Promise<FuturesQuote | null> {
  try {
    const resp = await fetch(`/api/sina/list=nf_${symbol}`);
    const buffer = await resp.arrayBuffer();
    const text = new TextDecoder("gbk").decode(buffer);

    // 解析: var hq_str_nf_XX0="字段0,字段1,...";
    const match = text.match(/"([^"]+)"/);
    if (!match || !match[1]) return null;

    const fields = match[1].split(",");
    const name = fields[0]; // 期货名称
    const latestPrice = parseFloat(fields[5]); // 最新价
    const prevClose = parseFloat(fields[10]); // 昨收

    if (!latestPrice || !prevClose) return null;

    return {
      name,
      changePercent: ((latestPrice - prevClose) / prevClose) * 100,
    };
  } catch (err) {
    console.error(`获取期货 ${symbol} 行情失败:`, err);
    return null;
  }
}

// ---------- 东方财富净值 API ----------

interface LsjzItem {
  FSRQ: string;
  DWJZ: string;
  JZZZL: string;
}

interface LsjzResponse {
  Data: { LSJZList: LsjzItem[] };
  ErrCode: number;
}

async function fetchLatestNav(
  code: string,
): Promise<{ nav: number; date: string } | null> {
  try {
    const resp = await fetch(
      `/api/nav/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=1`,
      { headers: { Referer: "https://fund.eastmoney.com" } },
    );
    const data: LsjzResponse = await resp.json();
    if (data.ErrCode !== 0 || !data.Data?.LSJZList?.length) return null;

    const item = data.Data.LSJZList[0];
    return { nav: parseFloat(item.DWJZ), date: item.FSRQ };
  } catch (err) {
    console.error(`获取基金 ${code} 净值失败:`, err);
    return null;
  }
}

// ---------- 期货估值计算 ----------

async function estimateByFutures(code: string): Promise<FundValuation | null> {
  const mapping = FUND_FUTURES_MAP[code];
  if (!mapping) return null;

  const [futuresQuote, navInfo] = await Promise.all([
    fetchFuturesQuote(mapping.symbol),
    fetchLatestNav(code),
  ]);

  if (!futuresQuote || !navInfo) return null;

  const estimatedNav = navInfo.nav * (1 + futuresQuote.changePercent / 100);

  return {
    code,
    name: mapping.name,
    navDate: navInfo.date,
    nav: navInfo.nav,
    estimatedNav: parseFloat(estimatedNav.toFixed(4)),
    estimatedChangePercent: parseFloat(futuresQuote.changePercent.toFixed(2)),
    estimatedTime: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isEstimated: true,
    futuresSource: futuresQuote.name,
  };
}

// ---------- 公共接口 ----------

/**
 * 回退链: 天天基金估值 → 期货估值 → null（暂无）
 */
export async function fetchFundValuation(
  code: string,
): Promise<FundValuation | null> {
  try {
    const resp = await fetch(`/api/fund/${code}.js?rt=${Date.now()}`);
    const text = await resp.text();
    const raw = parseJsonp(text);
    if (raw) return toValuation(raw);
  } catch (err) {
    console.error(`天天基金估值 ${code} 失败:`, err);
  }

  try {
    const futuresResult = await estimateByFutures(code);
    if (futuresResult) return futuresResult;
  } catch (err) {
    console.error(`期货估值 ${code} 失败:`, err);
  }

  return null;
}

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
