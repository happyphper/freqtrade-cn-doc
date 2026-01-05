
![freqtrade](./assets/freqtrade_poweredby.svg)

<div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 0;">

[![Freqtrade CI](https://github.com/freqtrade/freqtrade/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/freqtrade/freqtrade/actions/workflows/ci.yml)

[![DOI](https://joss.theoj.org/papers/10.21105/joss.04864/status.svg)](https://doi.org/10.21105/joss.04864)

[![Coverage Status](https://coveralls.io/repos/github/freqtrade/freqtrade/badge.svg?branch=develop&service=github)](https://coveralls.io/github/freqtrade/freqtrade?branch=develop)

</div>

<!-- GitHub action buttons -->

<div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin: 0;">

[<img src="https://img.shields.io/github/stars/freqtrade/freqtrade?style=social" style="display:inline-block">](https://github.com/freqtrade/freqtrade)

[<img src="https://img.shields.io/github/forks/freqtrade/freqtrade?style=social" style="display:inline-block">](https://github.com/freqtrade/freqtrade/fork)

[<img src="https://img.shields.io/badge/Download-Stable-white?logo=github" style="display:inline-block">](https://github.com/freqtrade/freqtrade/archive/stable.zip)

</div>

## 简介

Freqtrade 是一款用 Python 编写的免费开源加密货币交易机器人。它旨在支持所有主流交易所，并可通过 Telegram 或 WebUI 进行控制。它包含回测、绘图和资金管理工具，以及通过机器学习进行的策略优化。

::: danger 免责声明
本软件仅用于教育目的。请勿投入您无法承受损失的资金。使用本软件的风险由您自行承担。作者及所有关联方不对您的交易结果承担任何责任。

始终先在模拟运行 (Dry-run) 模式下运行交易机器人，在了解其工作原理以及预期的盈亏之前，请勿投入真实资金。

我们强烈建议您具备基础的编程技能和 Python 知识。请务必阅读源代码并理解此机器人的机制、算法及其实现的各种技术。
:::

![freqtrade screenshot](./assets/freqtrade-screenshot.png)

## 功能特性

- **开发您的策略**：使用 Python 和 [pandas](https://pandas.pydata.org/) 编写策略。您可以从 [策略仓库](https://github.com/freqtrade/freqtrade-strategies) 中获取灵感。
- **下载市场数据**：下载交易所的历史数据以及您可能想要交易的市场数据。
- **回测**：在下载的历史数据上测试您的策略。
- **优化**：使用机器学习方法进行超参数优化 (Hyperoptimization)，为策略找到最佳参数。您可以优化买入、卖出、止盈 (ROI)、止损和追踪止损参数。
- **选择市场**：创建静态列表或根据交易量和/或价格使用自动列表（回测期间不可用）。您还可以明确将不希望交易的市场列入黑名单。
- **运行**：使用模拟资金测试您的策略（模拟运行模式）或部署真实资金（实盘交易模式）。
- **控制/监控**：使用 Telegram 或 WebUI（启动/停止机器人，显示盈亏、每日摘要、当前未平仓交易结果等）。
- **分析**：可以对回测数据或 Freqtrade 交易历史（SQL 数据库）进行进一步分析，包括自动化标准绘图，以及将数据加载到 [交互式环境](data-analysis.md) 的方法。

## 支持的交易所市场

请阅读 [交易所特定说明](exchanges.md) 以了解每个交易所可能需要的特殊配置。

- ✅ [Binance](https://www.binance.com/)
- ✅ [BingX](https://bingx.com/invite/0EM9RX)
- ✅ [Bitget](https://www.bitget.com/)
- ✅ [Bitmart](https://bitmart.com/)
- ✅ [Bybit](https://bybit.com/)
- ✅ [Gate.io](https://www.gate.io/ref/6266643)
- ✅ [HTX](https://www.htx.com/)
- ✅ [Hyperliquid](https://hyperliquid.xyz/) (去中心化交易所，即 DEX)
- ✅ [Kraken](https://kraken.com/)
- ✅ [OKX](https://okx.com/)
- ✅ [MyOKX](https://okx.com/) (OKX EEA)
- ⬜ [通过 <img alt="ccxt" width="30px" src="./assets/ccxt-logo.svg" /> 可能支持许多其他交易所](https://github.com/ccxt/ccxt/)。_（我们无法保证它们一定能正常工作）_

### 支持的期货交易所 (实验性)

- ✅ [Binance](https://www.binance.com/)
- ✅ [Bitget](https://www.bitget.com/)
- ✅ [Bybit](https://bybit.com/)
- ✅ [Gate.io](https://www.gate.io/ref/6266643)
- ✅ [Hyperliquid](https://hyperliquid.xyz/) (去中心化交易所，即 DEX)
- ✅ [OKX](https://okx.com/)

请务必在开始之前阅读 [交易所特定说明](exchanges.md) 以及 [杠杆交易](leverage.md) 文档。

### 社区已测试

社区确认可工作的交易所：

- ✅ [Bitvavo](https://bitvavo.com/)
- ✅ [Kucoin](https://www.kucoin.com/)

## 社区展示

本节将展示来自社区成员的一些项目。

::: info
以下项目大多不由 Freqtrade 团队维护，因此使用前请谨慎。
:::

- [示例 Freqtrade 策略](https://github.com/freqtrade/freqtrade-strategies/)
- [FrequentHippo - 模拟/实盘运行和回测统计](http://frequenthippo.ddns.net) (作者：hippocritical)。
- [在线交易对列表生成器](https://remotepairlist.com/) (作者：Blood4rc)。
- [Freqtrade 回测项目](https://strat.ninja/) (作者：Blood4rc)。
- [Freqtrade 分析笔记本](https://github.com/froggleston/freqtrade_analysis_notebook) (作者：Froggleston)。
- [FTUI - Freqtrade 终端 UI](https://github.com/freqtrade/ftui) (作者：Froggleston)。
- [Bot Academy](https://botacademy.ddns.net/) (作者：stash86) - 关于加密机器人项目的博客。

## 要求

### 硬件要求

要运行此机器人，我们建议您使用具有以下最低配置的 Linux 云实例：

- 2GB 内存
- 1GB 硬盘空间
- 2vCPU

### 软件要求

- Docker（推荐）

或者

- Python 3.11+
- pip (pip3)
- git
- TA-Lib
- virtualenv（推荐）

## 支持

### 帮助 / Discord

对于文档中未涵盖的任何问题，或欲了解有关机器人的更多信息，或仅想与志同道合的人交流，我们鼓励您加入 Freqtrade [Discord 服务器](https://discord.gg/p7nuUNVfP7)。

## 准备好尝试了吗？

首先请阅读 [使用 Docker 的安装指南](docker_quickstart.md)（推荐），或 [不使用 Docker 的安装指南](installation.md)。
