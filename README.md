# 📊 基金实时估值

一个基于 React + TypeScript + Vite 的基金实时估值看板，支持自选基金管理、盘中实时估值展示和持仓盈亏计算。

## ✨ 功能特性

- **实时估值** — 盘中自动刷新，展示预估净值和涨跌幅
- **智能刷新** — 根据交易时段（盘前/上午/午休/下午/收盘）自动调整刷新频率
- **基金搜索** — 支持按代码、名称、拼音首字母搜索，覆盖全市场基金
- **自选管理** — 添加/删除基金，编辑持有份额和成本净值
- **持仓盈亏** — 基于实时估值自动计算盈亏金额和收益率
- **分时走势** — 选中基金可查看当日分时估值走势图
- **数据持久化** — 用户持仓自动保存到 localStorage

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 图表 | ECharts 5 |
| 时间 | Day.js |
| 样式 | 原生 CSS（暗色主题 + 毛玻璃效果） |

## 📁 项目结构

```
src/
├── App.tsx                     # 主应用组件
├── main.tsx                    # 入口文件
├── index.css                   # 全局样式
├── types/
│   └── index.ts                # TypeScript 类型定义
├── components/
│   ├── ValuationCard.tsx        # 估值卡片
│   ├── TrendChart.tsx           # 分时走势图
│   ├── PortfolioSummary.tsx     # 持仓盈亏汇总
│   ├── HoldingEditor.tsx        # 持仓编辑器
│   ├── FundSearchModal.tsx      # 基金搜索弹窗
│   └── DisclaimerBanner.tsx     # 合规声明
└── services/
    ├── fundApi.ts               # 估值 API 调用
    ├── fundSearch.ts            # 基金列表搜索
    ├── holdingStore.ts          # 持仓数据持久化
    └── tradingSession.ts        # 交易时段判断
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

启动后访问 `http://localhost:3000`。

## 📡 数据来源

| 数据 | 来源 | 代理路径 |
|------|------|----------|
| 基金实时估值 | fundgz.1234567.com.cn | `/api/fund/` |
| 基金列表搜索 | fund.eastmoney.com | `/api/search/` |

> **⚠️ 免责声明**：估值数据来自第三方平台，仅供个人参考，不构成投资建议。实际净值以基金公司公布为准。

## 📄 License

MIT
