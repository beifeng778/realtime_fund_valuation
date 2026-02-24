import type { UserHolding } from "@/types";

const STORAGE_KEY = "fund_valuation_holdings";

/** 从 localStorage 读取用户持仓 */
export function loadHoldings(): UserHolding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultHoldings();
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) return getDefaultHoldings();
    // 兼容旧版数据：缺少 fundName 字段时补充空字符串
    return data.map((h: Record<string, unknown>) => ({
      fundCode: h.fundCode as string,
      fundName: (h.fundName as string) || "",
      shares: h.shares as number,
      costNav: h.costNav as number,
    }));
  } catch {
    return getDefaultHoldings();
  }
}

/** 保存用户持仓到 localStorage */
export function saveHoldings(holdings: UserHolding[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}

/** 添加一只基金到持仓 */
export function addHolding(
  holdings: UserHolding[],
  fundCode: string,
  fundName: string,
  shares: number,
  costNav: number,
): UserHolding[] {
  const existing = holdings.find((h) => h.fundCode === fundCode);
  if (existing) {
    return holdings.map((h) =>
      h.fundCode === fundCode ? { ...h, fundName, shares, costNav } : h,
    );
  }
  return [...holdings, { fundCode, fundName, shares, costNav }];
}

/** 删除一只基金 */
export function removeHolding(
  holdings: UserHolding[],
  fundCode: string,
): UserHolding[] {
  return holdings.filter((h) => h.fundCode !== fundCode);
}

/** 默认持仓（首次使用） */
function getDefaultHoldings(): UserHolding[] {
  return [];
}
