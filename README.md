# 📊 基金实时估值

一个基于 React + TypeScript + Vite 的基金实时估值看板，支持自选基金管理、盘中实时估值展示、**期货穿透估值**和持仓盈亏计算。部署在 Vercel 上。

## ✨ 功能特性

- **实时估值** — 盘中自动刷新，展示预估净值和涨跌幅
- **期货穿透估值** — 期货型基金（如白银 LOF）通过沪银主连等期货行情实时估值，天天基金无估值时自动切换
- **智能刷新** — 根据交易时段（盘前/上午/午休/下午/收盘）自动调整刷新频率
- **基金搜索** — 支持按代码、名称、拼音首字母搜索，覆盖全市场基金
- **自选管理** — 添加/删除基金，编辑持有份额和成本净值
- **持仓盈亏** — 同时展示当日预估收益和基于成本的持仓总盈亏
- **分时走势** — 选中基金可查看当日分时估值走势图
- **数据持久化** — 用户持仓自动保存到 localStorage

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 图表 | ECharts 5 |
| 时间 | Day.js |
| 样式 | 原生 CSS（浅色主题 + 毛玻璃效果） |
| 部署 | Vercel（Serverless Functions + Rewrites） |

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
│   ├── PortfolioSummary.tsx     # 持仓盈亏面板（当日 + 总盈亏）
│   ├── HoldingEditor.tsx        # 持仓编辑器
│   ├── FundSearchModal.tsx      # 基金搜索弹窗
│   └── DisclaimerBanner.tsx     # 合规声明
├── services/
│   ├── fundApi.ts               # 估值 API（天天基金 + 期货穿透）
│   ├── fundSearch.ts            # 基金列表搜索
│   ├── holdingStore.ts          # 持仓数据持久化
│   └── tradingSession.ts        # 交易时段判断
api/                             # Vercel Serverless Functions
├── sina.ts                      # 新浪期货行情代理（GBK → UTF-8）
└── nav.ts                       # 东方财富历史净值代理
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

## ☁️ Vercel 部署

项目通过 `vercel.json` 配置了 Rewrites 和 Serverless Functions：

| 路径 | 类型 | 说明 |
|------|------|------|
| `/api/fund/*` | Rewrite | 代理天天基金估值接口 |
| `/api/search/*` | Rewrite | 代理东方财富基金搜索 |
| `/api/sina/*` | Serverless | 新浪期货行情（GBK 解码） |
| `/api/nav/*` | Serverless | 东方财富历史净值 |

直接 `git push` 到关联的 Vercel 项目即可自动部署。

## 📡 数据来源

| 数据 | 来源 | 说明 |
|------|------|------|
| 基金实时估值 | fundgz.1234567.com.cn | 天天基金 JSONP 接口 |
| 基金列表搜索 | fund.eastmoney.com | 东方财富 JS 数据 |
| 期货实时行情 | hq.sinajs.cn | 新浪期货行情（沪银主连等） |
| 基金历史净值 | api.fund.eastmoney.com | 东方财富净值 API |

## 🔗 估值回退链

```
天天基金估值 → 期货穿透估值 → null
```

对于天天基金不提供估值的品种（如白银期货 LOF），系统自动通过期货行情计算预估净值：

> 预估净值 = 昨日净值 × (1 + 期货涨跌幅%)

> **⚠️ 免责声明**：估值数据来自第三方平台，仅供个人参考，不构成投资建议。实际净值以基金公司公布为准。

## 📄 License

MIT
