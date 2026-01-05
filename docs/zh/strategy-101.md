
# Freqtrade 策略入门：策略开发快速指南 (Freqtrade Strategies 101)

为了进行快速入门，我们假设您已经熟悉交易的基础知识，并且已经阅读了 [Freqtrade 基础](bot-basics.md) 页面。

## 必备知识 (Required Knowledge)

Freqtrade 中的策略是一个 Python 类，它定义了买卖加密货币 **资产 (assets)** 的逻辑。

资产被定义为 **交易对 (pairs)**，代表 **币种 (coin)** 和 **本位币 (stake)**。币种是您使用另一种货币（本位币）进行交易的资产。

交易所提供的数据形式为 **K 线 (candles)**，由六个值组成：`date` (日期)、`open` (开盘价)、`high` (最高价)、`low` (最低价)、`close` (收盘价) 和 `volume` (成交量)。

**技术分析 (Technical analysis)** 函数使用各种计算和统计公式分析 K 线数据，并产生称为 **指标 (indicators)** 的次生值。

在资产交易对的 K 线上分析指标以生成 **信号 (signals)**。

信号转化为加密货币 **交易所 (exchange)** 上的 **订单 (orders)**，即 **交易 (trades)**。

我们使用 **进场 (entry)** 和 **离场 (exit)** 而不是 **买入 (buying)** 和 **卖出 (selling)**，因为 Freqtrade 同时支持 **做多 (long)** 和 **做空 (short)** 交易。

- **做多 (long)**：您以本位币买入某币种。例如，使用 USDT 作为本位币买入 BTC。您通过以高于买入价的价格卖出该币种来获利。在做多交易中，利润来自于币种价值相对于本位币的上涨。
- **做空 (short)**：您以币种的形式从交易所借入资金，稍后按照币种的本位币价值偿还。在做空交易中，利润来自于币种价值相对于本位币的下跌（您以更低的价格偿还贷款）。

虽然 Freqtrade 支持某些交易所的现货和期货市场，但为了简单起见，我们将仅专注于现货（做多）交易。

## 基础策略的结构 (Structure of a Basic Strategy)

### 主数据框 (Main dataframe)

Freqtrade 策略使用一种具有行和列的表格数据结构，称为 **数据框 (dataframe)**，来生成进场和离场交易的信号。

您配置的交易对列表中的每个交易对都有自己的数据框。数据框由 `date` 列建立索引，例如 `2024-06-31 12:00`。

接下来的 5 列代表 `open`、`high`、`low`、`close` 和 `volume` (OHLCV) 数据。

### 填充指标值 (Populate indicator values)

`populate_indicators` 函数向数据框添加代表技术分析指标值的列。

常见指标的例子包括相对强弱指数 (RSI)、布林带 (Bollinger Bands)、资金流量指数 (MFI)、移动平均线 (MA) 和平均真实范围 (ATR)。

通过调用技术分析函数（例如 ta-lib 的 RSI 函数 `ta.RSI()`）并将其分配给列名（例如 `rsi`），将列添加到数据框中。

```python
dataframe['rsi'] = ta.RSI(dataframe)
```

::: info 技术分析库
不同的库以不同的方式生成指标值。请查看每个库的文档以了解如何将其集成到您的策略中。您还可以查看 [Freqtrade 示例策略](https://github.com/freqtrade/freqtrade-strategies) 以获取灵感。
:::

### 填充进场信号 (Populate entry signals)

`populate_entry_trend` 函数定义了进场信号的条件。

数据框列 `enter_long` 被添加到数据框中，当该列中的值为 `1` 时，Freqtrade 会识别为一个进场信号。

::: info 做空
要进入做空交易，请使用 `enter_short` 列。
:::

### 填充离场信号 (Populate exit signals)

`populate_exit_trend` 函数定义了离场信号的条件。

数据框列 `exit_long` 被添加到数据框中，当该列中的值为 `1` 时，Freqtrade 会识别为一个离场信号。

::: info 做空
要退出做空交易，请使用 `exit_short` 列。
:::

## 一个简单的策略 (A simple strategy)

这是一个最简单的 Freqtrade 策略示例：

```python
from freqtrade.strategy import IStrategy
from pandas import DataFrame
import talib.abstract as ta

class MyStrategy(IStrategy):

    timeframe = '15m'

    # 设置初始止损比例为 -10%
    stoploss = -0.10

    # 当利润大于 1% 时，随时退出盈利头寸
    minimal_roi = {"0": 0.01}

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 生成技术分析指标值
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 根据指标值生成进场信号
        dataframe.loc[
            (dataframe['rsi'] < 30),
            'enter_long'] = 1

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # 根据指标值生成离场信号
        dataframe.loc[
            (dataframe['rsi'] > 70),
            'exit_long'] = 1

        return dataframe
```

## 进行交易 (Making trades)

当发现信号（进场或离场列中有 `1`）时，Freqtrade 将尝试下一个订单，即 **交易 (trade)** 或 **头寸 (position)**。

每个新的交易头寸占用一个 **槽位 (slot)**。槽位代表可以同时开启的最大并发新交易数。

槽位的数量由 `max_open_trades` [配置](configuration.md) 选项定义。

然而，在某些情况下，生成信号并不总是会创建交易订单。这些情况包括：

- 没有足够的剩余本位币来购买资产，或者您的钱包中没有足够的资金来出售资产（包括任何费用）。
- 没有足够的剩余空闲槽位来开启新交易（您拥有的头寸数量等于 `max_open_trades` 选项）。
- 某个交易对已经有一个开启的交易（Freqtrade 不能堆叠头寸 - 但它可以 [调整现有头寸](strategy-callbacks.md#adjust-trade-position)）。
- 如果在同一根 K 线上同时出现进场和离场信号，则被视为 [冲突信号 (colliding)](strategy-customization.md#colliding-signals)，将不会发出订单。
- 策略由于您使用相关的 [进场确认](strategy-callbacks.md#trade-entry-buy-order-confirmation) 或 [离场确认](strategy-callbacks.md#trade-exit-sell-order-confirmation) 回调指定的逻辑而主动拒绝交易订单。

阅读 [策略自定义](strategy-customization.md) 文档以获取更多详情。

## 回测与前瞻测试 (Backtesting and forward testing)

策略开发可能是一个漫长而令人沮丧的过程，因为将我们人类的“直觉”转化为一个运转良好的计算机控制（“算法”）策略并非总是那么直接。

因此，应该测试策略以验证它是否能按预期工作。

Freqtrade 有两种测试模式：

- **回测 (backtesting)**：使用您 [从交易所下载](data-download.md) 的历史数据，回测是评估策略表现的快捷方式。然而，结果很容易失真，使策略看起来比实际更有盈利性。查看 [回测文档](backtesting.md) 获取更多信息。
- **模拟运行 (dry run)**：通常被称为 **前瞻测试 (forward testing)**，模拟运行使用来自交易所的实时数据。Freqtrade 会像往常一样跟踪任何会产生交易的信号，但不会在交易所本身开启任何交易。前瞻测试是实时运行的，虽然需要更长的时间才能获得结果，但它是衡量 **潜在** 表现的比回测更可靠的指标。

通过在您的 [配置](configuration.md#using-dry-run-mode) 中将 `dry_run` 设置为 true 来启用模拟运行。

::: warning 回测结果可能非常不准确
回测结果可能与现实不符，原因有很多。请查看 [回测假设](backtesting.md#assumptions-made-by-backtesting) 和 [常见的策略开发错误](strategy-customization.md#common-mistakes-when-developing-strategies) 文档。
一些列出和排名 Freqtrade 策略的网站展示了令人印象深刻的回测结果。不要假设这些结果是可实现的或现实的。
:::

::: info 有用命令
Freqtrade 包含两个有用的命令来检查策略中的基本缺陷：[前瞻分析 (lookahead-analysis)](lookahead-analysis.md) 和 [递归分析 (recursive-analysis)](recursive-analysis.md)。
:::

### 评估回测和模拟运行结果

在对策略进行回测后，务必进行模拟运行，看看回测和模拟运行的结果是否足够相似。

如果存在任何重大差异，请验证您的进场和离场信号是否一致，并且在两种模式下出现在相同的 K 线上。但是，模拟运行和回测之间总是存在差异：

- 回测假设所有订单成交。在模拟运行中，如果使用限价单或交易所没有成交量，情况可能并非如此。
- 跟随 K 线收盘时的进场信号，回测假设交易以下一根 K 线开盘价进场（除非您的策略中有自定义定价回调）。在模拟运行中，信号和交易开启之间通常会有延迟。这是因为当您的主时间框架内出现新 K 线（例如每 5 分钟）时，Freqtrade 分析所有交易对数据框需要时间。因此，Freqtrade 将在 K 线开盘后几秒钟（理想情况下延迟越短越好）尝试开启交易。
- 由于模拟运行中的进场价格可能与回测不匹配，这意味着利润计算也会有所不同。因此，ROI、止损、追踪止损和回调离场不完全相同是正常的。
- 在新 K 线进入、信号发出和交易开启之间的计算“延迟”越多，价格的不可预测性就越大。确保您的计算机足够强大，能够在合理的时间内处理您交易对列表中所有对的数据。如果存在显著的数据处理延迟，Freqtrade 会在日志中向您发出警告。

## 控制或监控运行中的机器人 (Controlling or monitoring a running bot)

一旦您的机器人以模拟或实盘模式运行，Freqtrade 有六种机制来控制或监控运行中的机器人：

- **[FreqUI](freq-ui.md)**：最容易上手的 web 界面，用于查看和控制机器人的当前活动。
- **[Telegram](telegram-usage.md)**：在移动设备上，可以使用 Telegram 集成来获取有关机器人活动的警报并控制某些方面。
- **[FTUI](https://github.com/freqtrade/ftui)**：FTUI 是 Freqtrade 的终端（命令行）界面，仅允许监控运行中的机器人。
- **[freqtrade-client](rest-api.md#consuming-the-api)**：REST API 的 python 实现，可以轻松地从您的 python 应用程序或命令行发出请求并消费机器人响应。
- **[REST API 端点](rest-api.md#available-endpoints)**：REST API 允许程序员开发自己的工具与 Freqtrade 机器人进行交互。
- **[Webhooks](webhook-config.md)**：Freqtrade 可以通过 webhook 将信息发送到其他服务，例如 discord。

### 日志 (Logs)

Freqtrade 会生成详细的调试日志以帮助您了解发生了什么。请熟悉您在机器人日志中可能看到的信息和错误消息。

默认情况下，日志记录在标准输出（命令行）。如果您想写入文件，许多 freqtrade 命令（包括 `trade` 命令）都接受 `--logfile` 选项来写入文件。

查看 [FAQ](faq.md#how-do-i-search-the-bot-logs-for-something) 寻找示例。

## 最后的话 (Final Thoughts)

算法交易是困难的，大多数公开策略的表现并不好，因为使策略在多种情况下盈利需要花费大量的时间和精力。

因此，采用公开策略并使用回测作为评估表现的方法通常是有问题的。但是，Freqtrade 提供了有用的方法来帮助您做出决定并进行尽职调查。

实现盈利有许多不同的方法，并没有哪一个单一的提示、技巧或配置选项可以修复表现不佳的策略。

Freqtrade 是一个开源平台，拥有庞大且热心的社区 - 请务必访问我们的 [discord 频道](https://discord.gg/p7nuUNVfP7) 与他人讨论您的策略！

一如既往，只投资您愿意承受损失的资金。

## 结论 (Conclusion)

在 Freqtrade 中开发策略涉及根据技术指标定义进场和离场信号。通过遵循上述结构和方法，您可以创建并测试您自己的交易策略。

常见问题解答可在我们的 [FAQ](faq.md) 中找到。

要继续学习，请参考更深入的 [Freqtrade 策略自定义文档](strategy-customization.md)。
