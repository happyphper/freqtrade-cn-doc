# 弃用功能 (Deprecated features)

本页面包含对命令行参数、配置参数以及机器人开发团队声明为已弃用且不再受支持的机器人功能的描述。请避免在您的配置中使用它们。

## 已移除的功能 (Removed features)

### `--refresh-pairs-cached` 命令行选项

在回测、超参数优化 (hyperopt) 和 edge 模块的语境下，`--refresh-pairs-cached` 允许刷新回测用的 K 线数据。
由于这引起了很多混淆并降低了回测速度（而且它本身不属于回测的一部分），这一功能已被拆分为一个单独的 freqtrade 子命令 `freqtrade download-data`。

此命令行选项在 2019.7-dev (develop 分支) 中被弃用，并在 2019.9 中移除。

### `--dynamic-whitelist` 命令行选项

该命令行选项在 2018 年被弃用，并在 freqtrade 2019.6-dev (develop 分支) 和 freqtrade 2019.7 中移除。
请参考 [交易对列表 (pairlists)](plugins.md#pairlists-and-pairlist-handlers)。

### `--live` 命令行选项

在回测语境下，`--live` 允许下载最新的 Tick 数据用于回测。
但它仅下载最近的 500 根 K 线，因此在获取良好的回测数据方面是无效的。
已在 2019-7-dev (develop 分支) 和 freqtrade 2018.8 中移除。

### `ticker_interval` (现为 `timeframe`)

对 `ticker_interval` 术语的支持在 2020.6 中被弃用，取而代之的是 `timeframe` —— 且兼容性代码已在 2022.3 中移除。

### 允许按顺序运行多个交易对列表 (pairlists)

配置中旧的 `"pairlist"` 部分已被移除，并由 `"pairlists"` 取而代之 —— 后者是一个用于指定交易对列表序列的列表。

旧的配置参数部分 (`"pairlist"`) 在 2019.11 中被弃用，并在 2020.4 中移除。

### 从成交量交易对列表 (volume-pairlist) 中弃用 bidVolume 和 askVolume

由于资产之间只能比较 quoteVolume（报价成交量），其他选项（bidVolume, askVolume）已在 2020.4 中弃用，并在 2020.9 中移除。

### 实用订单簿档位确定离场价格 (Using order book steps for exit price)

使用 `order_book_min` 和 `order_book_max` 曾允许步进订单簿并尝试寻找下一个 ROI 插槽 —— 尝试尽早下达卖单。
由于这增加了风险且没有带来任何好处，为了可维护性，已在 2021.7 中将其移除。

### 传统超参数优化模式 (Legacy Hyperopt mode)

使用单独的 hyperopt 文件在 2021.4 中被弃用，并在 2021.9 中移除。
请切换到新的 [参数化策略](hyperopt.md) 以从新的 hyperopt 界面中获益。

## V2 和 V3 之间的策略变化 (Strategy changes between V2 and V3)

逐仓期货/做空交易在 2022.4 中引入。这需要对配置设置、策略界面等进行重大更改。

我们做出了巨大努力来保持与现有策略的兼容性，因此如果您只想继续在现货市场中使用 freqtrade，则不需要进行任何更改。
虽然我们将来可能会停止对当前界面的支持，但我们会单独宣布并有适当的过渡期。

请遵循 [策略迁移 (Strategy migration)](strategy_migration.md) 指南将您的策略迁移到新格式，以开始使用新功能。

### 网络钩子 (webhooks) - 2022.4 的变化

#### `buy_tag` 已重命名为 `enter_tag`

这应仅适用于您的策略以及可能的 Web 钩子。
我们将保留 1-2 个版本的兼容层（因此 `buy_tag` 和 `enter_tag` 仍将有效），但之后 Web 钩子将不再支持此项。

#### 命名变更 (Naming changes)

Web 钩子术语从 "sell"（卖）改为 "exit"（离场），从 "buy"（买）改为 "entry"（入场），过程中移除了 "webhook"。

* `webhookbuy`, `webhookentry` -> `entry`
* `webhookbuyfill`, `webhookentryfill` -> `entry_fill`
* `webhookbuycancel`, `webhookentrycancel` -> `entry_cancel`
* `webhooksell`, `webhookexit` -> `exit`
* `webhooksellfill`, `webhookexitfill` -> `exit_fill`
* `webhooksellcancel`, `webhookexitcancel` -> `exit_cancel`

## 移除 `populate_any_indicators`

2023.3 版本移除了 `populate_any_indicators`，取而代之的是用于特征工程和目标的拆分方法。请阅读 [迁移文档](strategy_migration.md#freqai-strategy) 以获取完整详细信息。

## 从配置中移除 `protections` (保护)

通过 `"protections": [],` 在配置中设置保护功能已在 2024.10 中移除，此前已发出弃用警告超过 3 年。

## hdf5 数据存储 (hdf5 data storage)

使用 hdf5 作为数据存储在 2024.12 中被弃用，并在 2025.1 中移除。我们建议切换到 feather 数据格式。

在更新前，请使用 [`convert-data` 子命令](data-download.md#sub-command-convert-data) 将现有数据转换为受支持的格式之一。

## 通过配置设置高级日志 (Configuring advanced logging via config)

分别通过 `--logfile syslog` 和 `--logfile journald` 配置 syslog 和 journald 已在 2025.3 中弃用。
请改用基于配置的 [日志设置](advanced-setup.md#advanced-logging)。

## 移除 edge 模块 (Removal of the edge module)

edge 模块在 2023.9 中被弃用，并在 2025.6 中移除。
edge 的所有功能都已移除，配置 edge 将导致错误。

## 调整动态资金费率处理 (Adjustment to dynamic funding rate handling)

在 2025.12 版本中，动态资金费率的处理已调整，以支持低至 1 小时资金费率间隔的动态资金费率。
因此，每个受支持的期货交易所的标记价格 (mark price) 和资金费率时间框架都已更改为 1 小时。

由于标记价格和资金费率 (funding_fee) K 线的时间框架都发生了变化（通常从 8 小时改为 1 小时） —— 已经下载的数据将必须进行调整或部分重新下载。
您可以重新下载所有内容 (`freqtrade download-data [...] --erase` —— :warning: 可能需要很长时间）—— 或选择性地下载更新的数据。

### 策略 (Strategy)

大多数策略应该不需要调整即可继续按预期工作 —— 但是，使用 `@informative("8h", candle_type="funding_rate")` 或类似内容的策略将必须将时间框架切换为 1h。
`dp.get_pair_dataframe(metadata["pair"], "8h", candle_type="funding_rate")` 也是如此 —— 这也需要切换到 1h。

freqtrade 会自动调整时间框架，尽管给出了错误的时间框架，也会返回 `funding_rates`。它会发出警告 —— 并且仍可能破坏您的策略。

### 选择性数据重新下载 (Selective data re-download)

下面的脚本应该作为一个示例 —— 您可能需要根据需要调整时间框架和交易所！

``` bash
# 清理不再需要的数据
rm user_data/data/&lt;exchange&gt;/futures/*-mark-*
rm user_data/data/&lt;exchange&gt;/futures/*-funding_rate-*

# 下载新数据（仅需执行一次即可修复标记价格和资金费率数据）
freqtrade download-data -t 1h --trading-mode futures --candle-types funding_rate mark [...] --timerange &lt;您拥有其他数据的完整时间范围&gt;

```

上述操作的结果是您的 funding_rates 和 mark 数据将具有 1h 的时间框架。
您可以通过 `freqtrade list-data --exchange &lt;yourexchange&gt; --show` 验证这一点。

::: info 其他参数
上述命令可能需要其他参数，例如配置文件或显式的 user_data（如果它们偏离默认值）。
:::

**Hyperliquid** 现在是一个特例 —— 它将不再需要 1h 标记数据 —— 而是使用常规 K 线代替（这些数据从未存在过，且与 1h 期货 K 线相同）。由于我们不支持 Hyperliquid 的数据下载（它们不提供历史数据） —— Hyperliquid 用户不需要采取任何行动。

## freqAI 中的 Catboost 模型 (Catboost models in freqAI)

CatBoost 模型已在 2025.12 版本中移除，不再受到积极支持。
如果您有使用 CatBoost 模型的现有机器人，您仍然可以通过从 git 历史记录（如下面的链接）中复制并粘贴它们，并手动安装 Catboost 库来在自定义模型中使用它们。
然而，我们建议切换到其他受支持的模型库，如 LightGBM 或 XGBoost，以获得更好的支持和未来的兼容性。

* [CatboostRegressor](https://github.com/freqtrade/freqtrade/blob/c6f3b0081927e161a16b116cc47fb663f7831d30/freqtrade/freqai/prediction_models/CatboostRegressor.py)
* [CatboostClassifier](https://github.com/freqtrade/freqtrade/blob/c6f3b0081927e161a16b116cc47fb663f7831d30/freqtrade/freqai/prediction_models/CatboostClassifier.py)
* [CatboostClassifierMultiTarget](https://github.com/freqtrade/freqtrade/blob/c6f3b0081927e161a16b116cc47fb663f7831d30/freqtrade/freqai/prediction_models/CatboostClassifierMultiTarget.py)
