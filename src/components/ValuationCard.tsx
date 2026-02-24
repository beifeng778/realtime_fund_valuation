import React from "react";
import type { FundValuation } from "@/types";

interface ValuationCardProps {
  fundCode: string;
  fundName: string;
  valuation: FundValuation | null;
  isSelected: boolean;
  onClick: () => void;
  loading: boolean;
}

export const ValuationCard: React.FC<ValuationCardProps> = ({
  fundCode,
  fundName,
  valuation,
  isSelected,
  onClick,
  loading,
}) => {
  // 状态1: 全局加载中（首次请求未返回）
  if (loading) {
    return (
      <div className="valuation-card valuation-card--loading">
        <div className="valuation-card__header">
          <div>
            <div
              className="skeleton"
              style={{ width: 160, height: 18, marginBottom: 6 }}
            />
            <div className="skeleton" style={{ width: 80, height: 14 }} />
          </div>
          <div
            className="skeleton"
            style={{ width: 50, height: 22, borderRadius: 12 }}
          />
        </div>
        <div className="valuation-card__body">
          <div className="skeleton" style={{ width: 120, height: 38 }} />
          <div className="skeleton" style={{ width: 80, height: 28 }} />
        </div>
      </div>
    );
  }

  // 状态2: 加载完成但该基金无估值数据（如商品期货LOF、QDII等）
  if (!valuation) {
    return (
      <div
        className={`valuation-card valuation-card--no-data ${isSelected ? "valuation-card--selected" : ""}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className="valuation-card__header">
          <div>
            <div className="valuation-card__name">{fundName || fundCode}</div>
            <div className="valuation-card__code">{fundCode}</div>
          </div>
        </div>
        <div className="valuation-card__body">
          <div className="valuation-card__no-data-tip">暂无实时估值</div>
          <div className="valuation-card__no-data-desc">
            可能尚未开盘或不支持盘中估值
          </div>
        </div>
      </div>
    );
  }

  // 状态3: 正常展示估值数据
  const changePercent = valuation.estimatedChangePercent;
  const isRise = changePercent > 0;
  const isFall = changePercent < 0;
  const direction = isRise ? "rise" : isFall ? "fall" : "flat";
  const sign = isRise ? "+" : "";

  return (
    <div
      className={`valuation-card valuation-card--${direction} ${isSelected ? "valuation-card--selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${valuation.name} 预估涨跌 ${sign}${changePercent.toFixed(2)}%`}
    >
      <div className="valuation-card__header">
        <div>
          <div className="valuation-card__name">{valuation.name}</div>
          <div className="valuation-card__code">{valuation.code}</div>
        </div>
      </div>

      <div className="valuation-card__body">
        <div
          className={`valuation-card__change valuation-card__change--${direction} number-animate`}
        >
          {sign}
          {changePercent.toFixed(2)}%
        </div>
        <div className="valuation-card__nav-section">
          <div className="valuation-card__nav-label">预估净值</div>
          <div className="valuation-card__nav-value number-animate">
            {valuation.estimatedNav.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="valuation-card__footer">
        <div className="valuation-card__time">
          截止{" "}
          {valuation.estimatedTime.split(" ")[1] || valuation.estimatedTime}
        </div>
        <div className="valuation-card__yesterday">
          上个交易日净值 {valuation.nav.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
