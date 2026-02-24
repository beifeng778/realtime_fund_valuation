/** 天天基金 API 原始返回字段 */
export interface FundGzRaw {
  fundcode: string;
  name: string;
  jzrq: string; // 净值日期
  dwjz: string; // 单位净值
  gsz: string; // 估算净值
  gszzl: string; // 估算涨跌幅 %
  gztime: string; // 估算时间
}

/** 解析后的基金估值数据 */
export interface FundValuation {
  code: string;
  name: string;
  navDate: string; // 净值日期
  nav: number; // 最新单位净值
  estimatedNav: number; // 预估净值（估值模式）或最新净值（净值模式）
  estimatedChangePercent: number; // 预估涨跌幅 %
  estimatedTime: string; // 估算截止时间
  isEstimated: boolean; // true=盘中实时估值 false=净值数据
  futuresSource?: string; // 期货关联来源名称（如"白银连续"）
}

/** 用户持仓 */
export interface UserHolding {
  fundCode: string;
  fundName: string; // 基金名称
  shares: number; // 持有份额
  costNav: number; // 成本净值
}

/** 分时走势点 */
export interface TrendPoint {
  time: string; // HH:mm
  estimatedNav: number;
  estimatedChangePercent: number;
}

/** 交易时段状态 */
export type TradingStatus =
  | "pre-market" // 盘前
  | "morning" // 上午盘中 09:30-11:30
  | "noon-break" // 午间休市 11:30-13:00
  | "afternoon" // 下午盘中 13:00-15:00
  | "closed" // 已收盘
  | "nav-updated"; // 净值已更新

export interface TradingSessionInfo {
  status: TradingStatus;
  label: string;
  isTrading: boolean; // 是否在交易中（需要刷新数据）
  color: string;
}

/** 基金持仓配置 */
export interface FundConfig {
  code: string;
  name: string;
  type: "stock" | "index" | "hybrid"; // 基金类型
  riskTags: string[]; // 风险标签
}
