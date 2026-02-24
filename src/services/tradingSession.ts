import dayjs from "dayjs";
import type { TradingSessionInfo, TradingStatus } from "@/types";

/** 交易时段配置 */
const SESSION_CONFIG: Record<
  TradingStatus,
  Omit<TradingSessionInfo, "status">
> = {
  "pre-market": { label: "盘前", isTrading: false, color: "#8b95a5" },
  morning: { label: "交易中", isTrading: true, color: "#00d4aa" },
  "noon-break": { label: "午间休市", isTrading: false, color: "#f0a030" },
  afternoon: { label: "交易中", isTrading: true, color: "#00d4aa" },
  closed: { label: "已收盘", isTrading: false, color: "#8b95a5" },
  "nav-updated": { label: "净值已更新", isTrading: false, color: "#4a90d9" },
};

/**
 * 判断当前交易时段状态
 * 交易日 09:30-11:30 上午盘、13:00-15:00 下午盘
 */
export function getTradingSession(now?: dayjs.Dayjs): TradingSessionInfo {
  const t = now || dayjs();
  const day = t.day(); // 0=Sun, 6=Sat

  // 周末直接返回休市
  if (day === 0 || day === 6) {
    return { status: "closed", ...SESSION_CONFIG["closed"] };
  }

  const hour = t.hour();
  const minute = t.minute();
  const timeValue = hour * 60 + minute; // 当天分钟数

  const MORNING_OPEN = 9 * 60 + 30; // 09:30
  const MORNING_CLOSE = 11 * 60 + 30; // 11:30
  const AFTERNOON_OPEN = 13 * 60; // 13:00
  const AFTERNOON_CLOSE = 15 * 60; // 15:00

  let status: TradingStatus;

  if (timeValue < MORNING_OPEN) {
    status = "pre-market";
  } else if (timeValue < MORNING_CLOSE) {
    status = "morning";
  } else if (timeValue < AFTERNOON_OPEN) {
    status = "noon-break";
  } else if (timeValue < AFTERNOON_CLOSE) {
    status = "afternoon";
  } else {
    status = "closed";
  }

  return { status, ...SESSION_CONFIG[status] };
}

/** 获取刷新间隔（毫秒） */
export function getRefreshInterval(session: TradingSessionInfo): number {
  if (session.isTrading) return 30_000; // 盘中 30 秒
  if (session.status === "noon-break") return 60_000; // 午休 1 分钟检查
  return 5 * 60_000; // 非交易 5 分钟
}
