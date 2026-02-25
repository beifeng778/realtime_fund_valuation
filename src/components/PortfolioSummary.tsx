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
  dailyProfit: number; // 当日预估收益 = 份额 × (预估净值 - 昨日净值)
  totalProfit: number; // 持仓总盈亏   = 份额 × (预估净值 - 成本净值)
  totalProfitPercent: number; // 总盈亏百分比
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

  const formatMoney = (v: number) => {
    const sign = v >= 0 ? "+" : "";
    return `${sign}${v.toFixed(2)}`;
  };

  return (
    <div className="portfolio-panel">
      <div className="portfolio-panel__header">
        <div className="portfolio-panel__title">💰 持仓盈亏预估</div>
        <div className="portfolio-panel__totals">
          <div className="portfolio-panel__total">
            <div className="portfolio-panel__total-label">当日预估收益</div>
            <div
              className={`portfolio-panel__total-value portfolio-panel__total-value--${
                totalDailyProfit > 0
                  ? "rise"
                  : totalDailyProfit < 0
                    ? "fall"
                    : ""
              } number-animate`}
            >
              {formatMoney(totalDailyProfit)} 元
            </div>
          </div>
          <div className="portfolio-panel__total">
            <div className="portfolio-panel__total-label">持仓总盈亏</div>
            <div
              className={`portfolio-panel__total-value portfolio-panel__total-value--${
                totalHoldingProfit > 0
                  ? "rise"
                  : totalHoldingProfit < 0
                    ? "fall"
                    : ""
              } number-animate`}
            >
              {formatMoney(totalHoldingProfit)} 元
              <span className="portfolio-panel__total-percent">
                ({formatMoney(totalHoldingProfitPercent)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="portfolio-list">
        {items.map((item) => (
          <div key={item.code} className="portfolio-item">
            <div className="portfolio-item__info">
              <div className="portfolio-item__name">{item.name}</div>
              <div className="portfolio-item__meta">
                {item.shares.toLocaleString()} 份 · 成本{" "}
                {item.costNav.toFixed(4)}
              </div>
            </div>
            <div className="portfolio-item__right">
              <span className="portfolio-item__label">当日</span>
              <span
                className="portfolio-item__pct"
                style={{
                  color:
                    item.changePercent > 0
                      ? "var(--color-rise)"
                      : item.changePercent < 0
                        ? "var(--color-fall)"
                        : "var(--color-flat)",
                }}
              >
                {item.changePercent >= 0 ? "+" : ""}
                {item.changePercent.toFixed(2)}%
              </span>
              <span
                className="portfolio-item__amt"
                style={{
                  color:
                    item.dailyProfit > 0
                      ? "var(--color-rise)"
                      : item.dailyProfit < 0
                        ? "var(--color-fall)"
                        : "var(--color-flat)",
                }}
              >
                {formatMoney(item.dailyProfit)}元
              </span>

              <span className="portfolio-item__label">总盈亏</span>
              <span
                className="portfolio-item__pct"
                style={{
                  color:
                    item.totalProfit > 0
                      ? "var(--color-rise)"
                      : item.totalProfit < 0
                        ? "var(--color-fall)"
                        : "var(--color-flat)",
                }}
              >
                {formatMoney(item.totalProfitPercent)}%
              </span>
              <span
                className="portfolio-item__amt"
                style={{
                  color:
                    item.totalProfit > 0
                      ? "var(--color-rise)"
                      : item.totalProfit < 0
                        ? "var(--color-fall)"
                        : "var(--color-flat)",
                }}
              >
                {formatMoney(item.totalProfit)}元
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
