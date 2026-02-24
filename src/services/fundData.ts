import type { FundConfig, UserHolding } from "@/types";

/** 预置基金列表 */
export const FUND_LIST: FundConfig[] = [
  {
    code: "005827",
    name: "易方达蓝筹精选混合",
    type: "stock",
    riskTags: [],
  },
  {
    code: "110020",
    name: "易方达沪深300ETF联接A",
    type: "index",
    riskTags: [],
  },
  {
    code: "163406",
    name: "兴全合润混合(LOF)A",
    type: "hybrid",
    riskTags: ["调仓窗口期"],
  },
  {
    code: "000961",
    name: "天际消费100指数A",
    type: "index",
    riskTags: [],
  },
  {
    code: "519674",
    name: "银河创新成长混合",
    type: "stock",
    riskTags: [],
  },
];

/** 模拟用户持仓数据 */
export const USER_HOLDINGS: UserHolding[] = [
  { fundCode: "005827", shares: 5200.0, costNav: 1.85 },
  { fundCode: "110020", shares: 10000.0, costNav: 1.72 },
  { fundCode: "163406", shares: 3000.0, costNav: 1.2 },
  { fundCode: "000961", shares: 8000.0, costNav: 0.95 },
  { fundCode: "519674", shares: 2000.0, costNav: 3.5 },
];

/** 基金类型标签映射 */
export const FUND_TYPE_LABELS: Record<FundConfig["type"], string> = {
  stock: "股票型",
  index: "指数型",
  hybrid: "混合型",
};
