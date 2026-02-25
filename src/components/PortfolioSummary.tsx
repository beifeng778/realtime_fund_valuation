import React from "react";
import type { FundValuation, UserHolding } from "@/types";

interface PortfolioSummaryProps {
  valuations: Map<string, FundValuation>;
  holdings: UserHolding[];
}

interface ProfitItem {
  name: string;
  code: string;
  shares: number;
  costNav: number;
  changePercent: number;
  dailyProfit: number;
  totalProfit: number;
  totalProfitPercent: number;
  estimatedNav: number;
  nav: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  valuations,
  holdings,
}) => {
  const items: ProfitItem[] = holdings
    .map((h) => {
      const val = valuations.get(h.fundCode);
      if (!val) return null;
      const dailyProfit = h.shares * (val.estimatedNav - val.nav);
      const totalProfit = h.shares * (val.estimatedNav - h.costNav);
      const totalCost = h.shares * h.costNav;
      const totalProfitPercent =
        totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
      return {
        name: val.name,
        code: val.code,
        shares: h.shares,
        costNav: h.costNav,
        changePercent: val.estimatedChangePercent,
        dailyProfit,
        totalProfit,
        totalProfitPercent,
        estimatedNav: val.estimatedNav,
        nav: val.nav,
      };
    })
    .filter(Boolean) as ProfitItem[];

  const totalDailyProfit = items.reduce(
    (sum, item) => sum + item.dailyProfit,
    0,
  );
  const totalHoldingProfit = items.reduce(
    (sum, item) => sum + item.totalProfit,
    0,
  );
  const totalCost = items.reduce(
    (sum, item) => sum + item.shares * item.costNav,
    0,
  );
  const totalHoldingProfitPercent =
    totalCost > 0 ? (totalHoldingProfit / totalCost) * 100 : 0;

  const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
  const colorOf = (v: number) =>
    v > 0
      ? "var(--color-rise)"
      : v < 0
        ? "var(--color-fall)"
        : "var(--text-muted)";

  return (
    <div className="pf-panel">
      {/* ---- 汇总区域 ---- */}
      <div className="pf-header">
        <div className="pf-header__title">💰 持仓盈亏预估</div>
        <div className="pf-header__cards">
          <div className="pf-stat-card">
            <span className="pf-stat-card__label">当日预估</span>
            <span
              className="pf-stat-card__value"
              style={{ color: colorOf(totalDailyProfit) }}
            >
              {fmt(totalDailyProfit)}
              <small>元</small>
            </span>
          </div>
          <div className="pf-stat-card">
            <span className="pf-stat-card__label">持仓总盈亏</span>
            <span
              className="pf-stat-card__value"
              style={{ color: colorOf(totalHoldingProfit) }}
            >
              {fmt(totalHoldingProfit)}
              <small>元</small>
              <span className="pf-stat-card__pct">
                {fmt(totalHoldingProfitPercent)}%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ---- 逐基金明细 ---- */}
      <div className="pf-list">
        {items.map((item) => {
          const accent = colorOf(item.dailyProfit);
          return (
            <div
              key={item.code}
              className="pf-fund"
              style={{ borderLeftColor: accent }}
            >
              <div className="pf-fund__left">
                <div className="pf-fund__name">{item.name}</div>
                <div className="pf-fund__meta">
                  {item.shares.toLocaleString()}份 · 成本{" "}
                  {item.costNav.toFixed(4)}
                </div>
              </div>
              <div className="pf-fund__right">
                <div className="pf-fund__row">
                  <span
                    className={`pf-fund__tag ${item.changePercent >= 0 ? "pf-fund__tag--rise" : "pf-fund__tag--fall"}`}
                  >
                    今日
                  </span>
                  <span
                    className="pf-fund__pct"
                    style={{ color: colorOf(item.changePercent) }}
                  >
                    {fmt(item.changePercent)}%
                  </span>
                  <span
                    className="pf-fund__amt"
                    style={{ color: colorOf(item.dailyProfit) }}
                  >
                    {fmt(item.dailyProfit)}元
                  </span>
                </div>
                <div className="pf-fund__row">
                  <span
                    className={`pf-fund__tag ${item.totalProfit >= 0 ? "pf-fund__tag--rise" : "pf-fund__tag--fall"}`}
                  >
                    总盈亏
                  </span>
                  <span
                    className="pf-fund__pct"
                    style={{ color: colorOf(item.totalProfit) }}
                  >
                    {fmt(item.totalProfitPercent)}%
                  </span>
                  <span
                    className="pf-fund__amt"
                    style={{ color: colorOf(item.totalProfit) }}
                  >
                    {fmt(item.totalProfit)}元
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
