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
  changePercent: number;
  profitAmount: number;
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
      const profitAmount = h.shares * (val.estimatedNav - val.nav);
      return {
        name: val.name,
        code: val.code,
        shares: h.shares,
        changePercent: val.estimatedChangePercent,
        profitAmount,
        estimatedNav: val.estimatedNav,
        nav: val.nav,
      };
    })
    .filter(Boolean) as ProfitItem[];

  const totalProfit = items.reduce((sum, item) => sum + item.profitAmount, 0);
  const isRise = totalProfit > 0;
  const isFall = totalProfit < 0;

  const formatMoney = (v: number) => {
    const sign = v >= 0 ? "+" : "";
    return `${sign}${v.toFixed(2)}`;
  };

  const getColorClass = (v: number) => (v > 0 ? "rise" : v < 0 ? "fall" : "");

  return (
    <div className="portfolio-panel">
      <div className="portfolio-panel__header">
        <div className="portfolio-panel__title">💰 持仓盈亏预估</div>
        <div className="portfolio-panel__total">
          <div className="portfolio-panel__total-label">当日预估总收益</div>
          <div
            className={`portfolio-panel__total-value portfolio-panel__total-value--${
              isRise ? "rise" : isFall ? "fall" : ""
            } number-animate`}
          >
            {formatMoney(totalProfit)} 元
          </div>
        </div>
      </div>

      <div className="portfolio-list">
        {items.map((item) => (
          <div key={item.code} className="portfolio-item">
            <div className="portfolio-item__name">{item.name}</div>
            <div className="portfolio-item__shares">
              {item.shares.toLocaleString()} 份
            </div>
            <div className="portfolio-item__right">
              <div
                className="portfolio-item__change"
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
              </div>
              <div
                className="portfolio-item__profit"
                style={{
                  color:
                    item.profitAmount > 0
                      ? "var(--color-rise)"
                      : item.profitAmount < 0
                        ? "var(--color-fall)"
                        : "var(--color-flat)",
                }}
              >
                {formatMoney(item.profitAmount)} 元
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
