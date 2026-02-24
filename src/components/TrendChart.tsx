import React, { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { TrendPoint, FundValuation } from "@/types";

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface TrendChartProps {
  fundName: string;
  trendData: TrendPoint[];
  currentValuation: FundValuation | null;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  fundName,
  trendData,
  currentValuation,
}) => {
  const option = useMemo(() => {
    if (!trendData.length) return null;

    const times = trendData.map((p) => p.time);
    const navData = trendData.map((p) => p.estimatedNav);
    const changeData = trendData.map((p) => p.estimatedChangePercent);

    // 基准净值（第一个点）
    const baseNav = navData[0];
    const navMin = Math.min(...navData);
    const navMax = Math.max(...navData);
    const navPadding = (navMax - navMin) * 0.2 || 0.001;

    return {
      backgroundColor: "transparent",
      legend: {
        show: true,
        top: 4,
        right: 0,
        textStyle: { color: "#9ca3af", fontSize: 11 },
        itemWidth: 16,
        itemHeight: 2,
      },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        textStyle: { color: "#e5e7eb", fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0];
          if (!p) return "";
          const idx = p.dataIndex;
          const change = changeData[idx];
          const nav = navData[idx];
          const color = change >= 0 ? "#ef4444" : "#22c55e";
          const sign = change >= 0 ? "+" : "";
          return `
            <div style="font-family: Inter, sans-serif;">
              <div style="color:#9ca3af;margin-bottom:6px;">${times[idx]}</div>
              <div style="font-size:16px;font-weight:700;color:${color}">${sign}${change.toFixed(2)}%</div>
              <div style="color:#e5e7eb;margin-top:4px;">预估净值: ${nav.toFixed(4)}</div>
            </div>
          `;
        },
      },
      grid: {
        top: 36,
        right: 16,
        bottom: 24,
        left: 56,
      },
      xAxis: {
        type: "category" as const,
        data: times,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          interval: Math.floor(times.length / 6),
        },
      },
      yAxis: {
        type: "value" as const,
        min: (navMin - navPadding).toFixed(4),
        max: (navMax + navPadding).toFixed(4),
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          formatter: (v: number) => v.toFixed(4),
        },
      },
      series: [
        {
          name: "预估净值",
          type: "line",
          data: navData,
          smooth: true,
          symbol: "none",
          lineStyle: {
            width: 2,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#818cf8" },
            ]),
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(99, 102, 241, 0.15)" },
              { offset: 1, color: "rgba(99, 102, 241, 0)" },
            ]),
          },
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: "rgba(255,255,255,0.1)", type: "dashed" },
            data: [{ yAxis: baseNav }],
            label: {
              show: true,
              formatter: `昨收 {c}`,
              color: "#6b7280",
              fontSize: 10,
            },
          },
        },
      ],
    };
  }, [trendData, fundName]);

  if (!trendData.length) {
    return (
      <div className="trend-panel">
        <div className="trend-panel__header">
          <div className="trend-panel__title">📈 分时走势</div>
        </div>
        <div className="trend-panel__placeholder">
          点击上方基金卡片查看分时走势
        </div>
      </div>
    );
  }

  return (
    <div className="trend-panel">
      <div className="trend-panel__header">
        <div>
          <div className="trend-panel__title">📈 {fundName} · 分时走势</div>
          <div className="trend-panel__subtitle">
            {currentValuation
              ? `最新估值 ${currentValuation.estimatedNav.toFixed(4)} | 截止 ${currentValuation.estimatedTime}`
              : ""}
          </div>
        </div>
      </div>
      {option && (
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: 320 }}
          notMerge
          lazyUpdate
        />
      )}
    </div>
  );
};
