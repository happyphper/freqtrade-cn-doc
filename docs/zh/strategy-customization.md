
# 策略自定义

本页介绍了如何自定义您的策略、添加新指标并设置交易规则。

如果您还不熟悉以下内容，请先了解：

- [Freqtrade 策略 101](strategy-101.md)，它提供了策略开发的快速入门
- [Freqtrade 机器人基础](bot-basics.md)，它提供了关于机器人如何运行的整体信息

## 开发您自己的策略

机器人包含一个默认策略文件。

此外，在 [策略仓库](https://github.com/freqtrade/freqtrade-strategies) 中还可以找到其他几种策略。

然而，您很可能对自己想要什么样的策略有自己的想法。

本文档旨在帮助您将想法转换为可工作的策略。

### 生成策略模板

要开始，您可以使用以下命令：

```bash
freqtrade new-strategy --strategy AwesomeStrategy
```

这将根据模板创建一个名为 `AwesomeStrategy` 的新策略，该策略的文件名为 `user_data/strategies/AwesomeStrategy.py`。

::: info
策略的*名称*和文件名是有区别的。在大多数命令中，Freqtrade 使用的是策略的*名称*，而不是*文件名*。
:::

::: info
`new-strategy` 命令生成的初始示例并不能直接盈利。
:::

::: info 不同的模板级别
`freqtrade new-strategy` 有一个额外的参数 `--template`，它控制创建的策略中包含的预构建信息的数量。使用 `--template minimal` 获取没有任何指标示例的空策略，或者使用 `--template advanced` 获取定义了更复杂功能的模板。
:::

### 策略剖析

策略文件包含构建策略逻辑所需的所有信息：

- OHLCV 格式的 K 线数据
- 指标 (Indicators)
- 进场逻辑 (Entry logic)
  - 信号 (Signals)
- 离场逻辑 (Exit logic)
  - 信号 (Signals)
  - 最小投资回报率 (Minimal ROI)
  - 回调函数 (Callbacks / "custom functions")
- 止损 (Stoploss)
  - 固定/绝对止损
  - 追踪止损
  - 回调函数
- 定价 [可选]
- 仓位调整 [可选]

机器人包含一个名为 `SampleStrategy` 的示例策略，您可以将其作为基础：`user_data/strategies/sample_strategy.py`。
您可以使用参数 `--strategy SampleStrategy` 来测试它。记住使用策略类名，而不是文件名。

此外，还有一个名为 `INTERFACE_VERSION` 的属性，它定义了机器人应使用的策略接口版本。
当前版本为 3——这也是未在策略中显式设置时的默认版本。

您可能会看到旧策略设置为接口版本 2，这些策略需要更新到 v3 术语，因为未来的版本将要求设置此项。

使用 `trade` 命令以模拟或实盘模式启动机器人：

```bash
freqtrade trade --strategy AwesomeStrategy
```

### 机器人模式

Freqtrade 策略可以由 Freqtrade 机器人在 5 种主要模式下处理：

- 回测 (backtesting)
- 超参数优化 (hyperopting)
- 模拟运行 (dry-run / "forward testing")
- 实盘 (live)
- FreqAI (此处不涉及)

请查看[配置文档](configuration.md)了解如何将机器人设置为模拟或实盘模式。

**在测试时请务必始终使用模拟运行模式，因为这可以为您提供策略在现实中运行效果的概念，而不会承担资本风险。**

## 深入探究

**在接下来的部分中，我们将使用 [user_data/strategies/sample_strategy.py](https://github.com/freqtrade/freqtrade/blob/develop/freqtrade/templates/sample_strategy.py) 文件作为参考。**

::: info 策略与回测
为了避免回测与模拟/实盘模式之间出现问题和意外差异，请注意在回测期间，完整的时间范围会一次性传递给 `populate_*()` 方法。
因此，最好使用向量化操作（跨越整个数据帧，而不是循环），并避免使用索引引用 (`df.iloc[-1]`)，而是使用 `df.shift()` 来获取前一根 K 线。
:::

::: warning 警告：使用未来数据
由于回测会将完整时间范围传递给 `populate_*()` 方法，策略作者需要小心避免策略利用来自未来的数据。本文档的[常见错误](#常见错误)部分列出了一些此类常见模式。
:::

::: info 未来函数与递归分析
Freqtrade 包含两个有用的命令，用于评估常见的未来函数 (Look-ahead bias) 和递归偏差（指标值的方差）问题。在以模拟或实盘方式运行策略之前，请先使用这些命令。请查看 [lookahead](lookahead-analysis.md) 和 [recursive](recursive-analysis.md) 分析的相关文档。
:::

### 数据帧 (Dataframe)

Freqtrade 使用 [pandas](https://pandas.pydata.org/) 来存储/提供 K 线 (OHLCV) 数据。
Pandas 是一个为处理表格格式的大量数据而开发的优秀库。

数据帧中的每一行对应图表上的一根 K 线，最新完成的 K 线始终是数据帧中的最后一行（按日期排序）。

如果您想使用 Python 代码来查看数据帧，Pandas 会提供非常方便的操作。

``` python
    dataframe.loc[
        (dataframe['rsi'] > 30)
    , 'enter_long'] = 1
```

通过这一部分，您在数据帧中创建了一个新列，每当 RSI 高于 30 时，该列就会被赋值为 `1`。

Freqtrade 使用这个新列作为进场信号，假设随后会在下一根 K 线开盘时开仓。

Pandas 提供了计算指标的高速方式，即“向量化”。为了享受这种速度，建议不要使用循环，而是使用向量化方法。

向量化操作跨越整个数据范围执行计算，因此与遍历每一行相比，计算指标时要快得多。

::: info 信号 vs 交易
- 信号是在 K 线收盘时根据指标生成的，代表进入交易的意图。
- 交易是执行的订单（在实盘模式下的交易所），将在下一根 K 线开盘时尽可能早地开启交易。
:::

::: warning 交易订单假设
在回测中，信号在 K 线收盘时生成。交易随后会立即在下一根 K 线开盘时启动。

在模拟和实盘中，这可能会延迟，因为需要先分析所有交易对的数据帧，然后处理每个交易对。这意味着在模拟/实盘中，您需要考虑到尽可能低的计算延迟，通常通过运行较少数量表达的交易对和拥有良好时钟频率的 CPU 来实现。
:::

#### 为什么我看不见“实时” K 线数据？

Freqtrade 不会在数据帧中存储不完整/未完成的 K 线。

利用不完整数据进行策略决策被称为“重绘” (repainting)，您可能会看到其他平台允许这样做。

Freqtrade 则不允许。数据帧中仅提供已完成/结束的 K 线数据。

### 自定义指标

进场和离场信号需要指标。您可以通过扩展策略文件中 `populate_indicators()` 方法中包含的列表来添加更多指标。

您应该只添加在 `populate_entry_trend()`、`populate_exit_trend()` 或用于填充其他指标中用到的指标，否则性能可能会受损。

重要的是，始终从这三个函数返回数据帧，不要移除/修改 `"open", "high", "low", "close", "volume"` 列。

::: info 想要更多指标示例？
请查看 [user_data/strategies/sample_strategy.py](https://github.com/freqtrade/freqtrade/blob/develop/freqtrade/templates/sample_strategy.py)，然后取消注释您需要的指标。
:::

#### 指标库

Freqtrade 开箱即用地安装了以下技术分析库：

- [ta-lib](https://ta-lib.github.io/ta-lib-python/)
- [pandas-ta](https://twopirllc.github.io/pandas-ta/)
- [technical](https://technical.freqtrade.io)

可以根据需要安装额外的库，或者策略作者可以自行编写/发明自定义指标。

### 策略启动周期 (Startup period)

有些指标有一个不稳定的启动周期，在此期间没有足够的 K 线数据来计算任何值 (NaN)，或者计算结果是不正确的。这可能导致不一致，因为 Freqtrade 不知道这个不稳定周期有多长，它会直接使用数据帧中的任何指标值。

为了解决这个问题，可以给策略分配 `startup_candle_count` 属性。

该属性应设置为策略计算稳定指标所需的最大 K 线数量。如果用户包含带有信息性交易对的更高时间框架，`startup_candle_count` 不一定需要改变。该值应是计算稳定指标所需的所有信息性时间框架中的最大周期（以 K 线计）。

您可以使用 [recursive-analysis](recursive-analysis.md) 来检查并找到要使用的正确 `startup_candle_count`。当递归分析显示方差为 0% 时，您就可以确定已经有足够的启动 K 线数据了。

在这个示例策略中，由于 ema100 计算需要至少 400 根 K 线历史才能确保值正确，因此应将其设置为 400 (`startup_candle_count = 400`)。

``` python
    dataframe['ema100'] = ta.EMA(dataframe, timeperiod=100)
```

通过让机器人知道需要多少历史数据，回测交易可以从回测和超参数优化期间指定的计时范围内开始。

::: warning 使用多轮调用获取 OHLCV
如果您收到类似 `WARNING - Using 3 calls to get OHLCV...` 的警告——您应该考虑策略信号是否真的需要这么多历史数据。
这样做会导致 Freqtrade 对同一个交易对进行多次调用，这显然比一次网络请求要慢。后果是 Freqtrade 刷新 K 线所需的时间会变长。为了避免交易所过载或使 Freqtrade 太慢，总调用次数限制为 5 次。
:::

::: warning
`startup_candle_count` 应低于 `ohlcv_candle_limit * 5`（大多数交易所为 500 * 5）——因为在模拟/实盘交易操作期间仅提供该数量的 K 线。
:::

#### 示例

假设 `startup_candle_count` 设置为 400。回测知道它需要 400 根 K 线来生成有效的进场信号。

::: info 启动周期数据不可用
如果启动周期的数据不可用，则时间范围会调整以适应此启动周期。
:::

### 进场信号规则

编辑策略文件中的 `populate_entry_trend()` 方法以更新您的进场策略。

该方法还将定义一个新列 `"enter_long"`（做空为 `"enter_short"`），其中需要包含进场信号 `1` 和“无操作”信号 `0`。

您可以通过使用 `"enter_tag"` 列给进场信号命名，这可以帮助日后调试和评估策略。

### 离场信号规则

编辑策略文件中的 `populate_exit_trend()` 方法以更新您的离场策略。

离场信号可以通过在配置或策略中将 `use_exit_signal` 设置为 false 来禁用。

该方法还将定义一个新列 `"exit_long"`（做空为 `"exit_short"`），其中需要包含离场信号 `1` 和“无操作”信号 `0`。

您可以通过使用 `"exit_tag"` 列给离场信号命名。

### 最小投资回报率 (Minimal ROI)

`minimal_roi` 策略变量定义了交易在离场前应达到的最小投资回报率 (ROI)，这与离场信号无关。

其格式如下：

```python
minimal_roi = {
    "40": 0.0,
    "30": 0.01,
    "20": 0.02,
    "0": 0.04
}
```

计算过程包含手续费。

### 止损 (Stoploss)

强烈建议设置止损，以保护您的资金免受剧烈波动的损害。

设置 10% 止损的示例：

``` python
stoploss = -0.10
```

有关止损功能的完整文档，请参阅专门的[止损页面](stoploss.md)。

### 时间框架 (Timeframe)

这是机器人应在策略中使用的 K 线周期。

### 是否可以做空 (Can short)

要在期货市场使用做空信号，您必须设置 `can_short = True`。

### 元数据字典 (Metadata dict)

`metadata` 字典包含了额外的信息，如 `pair`。

## 策略所需的导入项

当创建策略时，您需要导入必要的模块和类。

``` python
# flake8: noqa: F401
# isort: skip_file
# --- 请勿删除这些导入项 ---
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from pandas import DataFrame
from typing import Dict, Optional, Union, Tuple

from freqtrade.strategy import (
    IStrategy,
    Trade, 
    Order,
    PairLocks,
    informative,  # @informative 装饰器
    # 超参数优化参数
    BooleanParameter,
    CategoricalParameter,
    DecimalParameter,
    IntParameter,
    RealParameter,
    # 时间框架辅助工具
    timeframe_to_minutes,
    timeframe_to_next_date,
    timeframe_to_prev_date,
    # 策略辅助函数
    merge_informative_pair,
    stoploss_from_absolute,
    stoploss_from_open,
)

# --------------------------------
# 在此处添加您的库导入
import talib.abstract as ta
from technical import qtpylib
```

## 策略文件加载

默认情况下，Freqtrade 会尝试从 `user_data/strategies` 加载策略。

```bash
freqtrade trade --strategy AwesomeStrategy
```

注意我们使用的是类名，而不是文件名。

## 信息性交易对 (Informative Pairs)

### 为非交易对获取数据

数据可以为额外的、信息性交易对（参考对）获取，这对于某些策略来说很有好处。

这些对的 OHLCV 数据将在常规白名单刷新过程中一同下载。

``` python
def informative_pairs(self):
    return [("ETH/USDT", "5m"),
            ("BTC/TUSD", "15m"),
            ]
```

::: warning
由于这些对将作为常规刷新的一部分，请保持列表精简，以避免过多请求。
:::

### 信息性对装饰器 (`@informative()`)

``` python
    @informative('1h')
    def populate_indicators_1h(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        return dataframe

    @informative('1h', 'BTC/{stake}')
    def populate_indicators_btc_1h(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        return dataframe
```

::: warning 重复的方法名
带有 `@informative()` 装饰器的方法必须始终具有唯一名称！重用相同名称会覆盖之前定义的方法。
:::

### *merge_informative_pair()*

该方法帮助您将信息性交易对安全且一致地合并到常规主数据帧中，且不会产生未来函数 (lookahead bias)。

::: tip 列重命名
假设 `inf_tf = '1h'`，结果列将包含原始列和带有 `_1h` 后缀的信息性列。
:::

::: warning 信息性时间框架 < 主时间框架
不建议使用比主时间框架更小的信息性时间框架，因为此方法不会利用它提供的额外信息。
:::

## 附加数据 (DataProvider)

策略可以通过 `DataProvider` 访问额外的数据。

### DataProvider 的可选选项

- `current_whitelist()` - 返回当前白名单列表。
- `get_pair_dataframe(pair, timeframe)` - 返回历史或实时数据。
- `orderbook(pair, maximum)` - 返回当前盘口数据。
- `ticker(pair)` - 返回当前 Ticker 数据。
- `funding_rate(pair)` - 返回期货资金费率。
- `runmode` - 当前运行模式。

### 示例用法

#### *current_whitelist()*

当白名单是动态的（如 `VolumePairList`）且您需要获取其每日 RSI 时，这非常有用。

```python
    def informative_pairs(self):
        pairs = self.dp.current_whitelist()
        return [(pair, '1d') for pair in pairs]
```

#### *orderbook(pair, maximum)*

``` python
if self.dp.runmode.value in ('live', 'dry_run'):
    ob = self.dp.orderbook(metadata['pair'], 1)
    dataframe['best_bid'] = ob['bids'][0][0]
    dataframe['best_ask'] = ob['asks'][0][0]
```

::: warning 警告关于回测
盘口并不属于历史数据，因此在回测中返回实时值可能导致结果偏差。
:::

#### 发送通知

``` python
    self.dp.send_msg(f"{metadata['pair']} 热度上升！")
```

通知仅在实盘/模拟运行模式下发送。

## 附加数据 (Wallets)

提供对 `wallets` 对象的访问，包含交易所中的当前余额。

``` python
if self.wallets:
    free_eth = self.wallets.get_free('ETH')
```

## 附加数据 (Trades)

可以通过查询数据库获取交易历史。

```python
from freqtrade.persistence import Trade
# ...
trades = Trade.get_trades_proxy(pair=metadata['pair'], is_open=False)
```

## 为特定交易对锁定交易

Freqtrade 会在交易对离场后自动将其锁定一个 K 线周期，以防止立即重复进场。

### 在策略内部锁定交易对

``` python
self.lock_pair(pair, until, [reason])
```

## 常见错误

### 回测时的未来函数 (Looking into the future)

回测会一次性分析整个时间范围，作者必须确保策略不会利用未来的数据。

- 不要使用 `shift(-1)`。
- 不要使用 `.iloc[-1]` 或其他绝对位置。
- 不要计算包含全量数据的均值，如 `df['vol'].mean()`，请使用 `rolling().mean()`。
- `.resample()` 请配合 `label='right'` 使用。

::: tip 识别问题
建议使用 `lookahead-analysis` 和 `recursive-analysis` 助手命令。
:::

### 信号冲突

当进场和离场信号同时触发时，Freqtrade 将忽略进场信号，以避免立即离场引发的无效交易。

## 下一步

现在您有了完美的策略，下一步是学习[如何使用回测](backtesting.md)。
