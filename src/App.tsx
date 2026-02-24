import React, { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import type {
  FundValuation,
  TrendPoint,
  TradingSessionInfo,
  UserHolding,
} from "@/types";
import {
  loadHoldings,
  saveHoldings,
  addHolding,
  removeHolding,
} from "@/services/holdingStore";
import { fetchAllFundValuations } from "@/services/fundApi";
import {
  getTradingSession,
  getRefreshInterval,
} from "@/services/tradingSession";
import { ValuationCard } from "@/components/ValuationCard";
import { TrendChart } from "@/components/TrendChart";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FundSearchModal } from "@/components/FundSearchModal";
import { HoldingEditor } from "@/components/HoldingEditor";

const App: React.FC = () => {
  const [holdings, setHoldings] = useState<UserHolding[]>(() => loadHoldings());
  const [valuations, setValuations] = useState<Map<string, FundValuation>>(
    new Map(),
  );
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<Map<string, TrendPoint[]>>(
    new Map(),
  );
  const [session, setSession] =
    useState<TradingSessionInfo>(getTradingSession());
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm:ss"));
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 持仓变动时保存到 localStorage
  useEffect(() => {
    saveHoldings(holdings);
  }, [holdings]);

  // 取当前持仓的所有基金代码
  const fundCodes = holdings.map((h) => h.fundCode);

  // 加载估值数据
  const loadValuations = useCallback(async () => {
    const codes = holdings.map((h) => h.fundCode);
    if (codes.length === 0) {
      setLoading(false);
      return;
    }
    const data = await fetchAllFundValuations(codes);
    setValuations(data);
    setLoading(false);

    if (data.size > 0) {
      // 自动回填缺失的 fundName（兼容旧版 localStorage 持仓）
      setHoldings((prev) => {
        let changed = false;
        const updated = prev.map((h) => {
          if (!h.fundName) {
            const val = data.get(h.fundCode);
            if (val?.name) {
              changed = true;
              return { ...h, fundName: val.name };
            }
          }
          return h;
        });
        return changed ? updated : prev;
      });

      // 记录走势数据点
      setTrendData((prev) => {
        const next = new Map(prev);
        const nowTime = dayjs().format("HH:mm");
        data.forEach((val, code) => {
          const existing = next.get(code) || [];
          if (
            existing.length === 0 ||
            existing[existing.length - 1].time !== nowTime
          ) {
            next.set(code, [
              ...existing,
              {
                time: nowTime,
                estimatedNav: val.estimatedNav,
                estimatedChangePercent: val.estimatedChangePercent,
              },
            ]);
          }
        });
        return next;
      });
    }
  }, [holdings]);

  // 定时刷新
  useEffect(() => {
    loadValuations();

    const scheduleNext = () => {
      const currentSession = getTradingSession();
      setSession(currentSession);
      const interval = getRefreshInterval(currentSession);

      timerRef.current = setTimeout(() => {
        loadValuations();
        scheduleNext();
      }, interval);
    };

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadValuations]);

  // 时钟更新
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(dayjs().format("HH:mm:ss"));
      setSession(getTradingSession());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 持仓操作
  const handleAddFund = (code: string, name: string) => {
    setHoldings((prev) => addHolding(prev, code, name, 1000, 1.0));
  };

  const handleUpdateHolding = (
    fundCode: string,
    shares: number,
    costNav: number,
  ) => {
    const existingName =
      holdings.find((h) => h.fundCode === fundCode)?.fundName ||
      valuations.get(fundCode)?.name ||
      fundCode;
    setHoldings((prev) =>
      addHolding(prev, fundCode, existingName, shares, costNav),
    );
  };

  const handleRemoveFund = (code: string) => {
    setHoldings((prev) => removeHolding(prev, code));
    // 清理走势数据
    setTrendData((prev) => {
      const next = new Map(prev);
      next.delete(code);
      return next;
    });
    if (selectedFund === code) setSelectedFund(null);
  };

  const selectedValuation = selectedFund
    ? (valuations.get(selectedFund) ?? null)
    : null;
  const selectedTrend = selectedFund ? (trendData.get(selectedFund) ?? []) : [];
  const selectedName = selectedValuation?.name ?? "";

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__logo">
          <div className="app-header__icon">📊</div>
          <h1 className="app-header__title">基金实时估值</h1>
        </div>
        <div className="app-header__right">
          <span className="app-header__time">{currentTime}</span>
          <div
            className={`trading-status ${session.isTrading ? "trading-status--trading" : ""}`}
            style={{ color: session.color }}
          >
            <span
              className="trading-status__dot"
              style={{ backgroundColor: session.color }}
            />
            {session.label}
          </div>
        </div>
      </header>

      {/* 合规声明 */}
      <DisclaimerBanner />

      {/* 持仓管理 */}
      <HoldingEditor
        holdings={holdings}
        valuations={valuations}
        onUpdate={handleUpdateHolding}
        onRemove={handleRemoveFund}
        onAddClick={() => setShowSearch(true)}
      />

      {/* 估值卡片网格 */}
      {fundCodes.length > 0 && (
        <>
          <div className="section-label">实时估值</div>
          <div className="fund-grid">
            {fundCodes.map((code) => {
              const holding = holdings.find((h) => h.fundCode === code);
              return (
                <ValuationCard
                  key={code}
                  fundCode={code}
                  fundName={holding?.fundName || ""}
                  valuation={valuations.get(code) ?? null}
                  isSelected={selectedFund === code}
                  onClick={() =>
                    setSelectedFund(selectedFund === code ? null : code)
                  }
                  loading={loading}
                />
              );
            })}
          </div>
        </>
      )}

      {/* 分时走势图 */}
      <TrendChart
        fundName={selectedName}
        trendData={selectedTrend}
        currentValuation={selectedValuation}
      />

      {/* 持仓盈亏 */}
      <PortfolioSummary valuations={valuations} holdings={holdings} />

      {/* 基金搜索弹窗 */}
      <FundSearchModal
        visible={showSearch}
        existingCodes={fundCodes}
        onAdd={handleAddFund}
        onClose={() => setShowSearch(false)}
      />
    </div>
  );
};

export default App;
