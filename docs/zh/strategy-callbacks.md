
# 策略回调 (Strategy Callbacks)

虽然主要的策略函数 (`populate_indicators()`、`populate_entry_trend()`、`populate_exit_trend()`) 应该以向量化的方式使用，并且在[回测期间仅调用一次](bot-basics.md#回测--超参数优化执行逻辑)，但回调函数 (callbacks) 是在“需要时”调用的。

因此，您应当避免在回调中进行繁重的计算，以避免运行期间出现延迟。
根据所使用的回调，它们可能会在进场/离场交易时被调用，或者在整个交易持续期间被调用。

目前可用的回调：

* [`bot_start()`](#机器人启动-bot-start)
* [`bot_loop_start()`](#机器人循环启动-bot-loop-start)
* [`custom_stake_amount()`](#投入金额管理-stake-size-management)
* [`custom_exit()`](#自定义离场信号-custom-exit-signal)
* [`custom_stoploss()`](#自定义止损-custom-stoploss)
* [`custom_roi()`](#自定义-roi-custom-roi)
* [`custom_entry_price()` 和 `custom_exit_price()`](#自定义订单价格规则-custom-order-price-rules)
* [`check_entry_timeout()` 和 `check_exit_timeout()`](#自定义订单超时规则-custom-order-timeout-rules)
* [`confirm_trade_entry()`](#交易进场确认-trade-entry-buy-order-confirmation)
* [`confirm_trade_exit()`](#交易离场确认-trade-exit-sell-order-confirmation)
* [`adjust_trade_position()`](#调整交易仓位-adjust-trade-position)
* [`adjust_entry_price()`](#调整进场价格-adjust-entry-price)
* [`leverage()`](#杠杆回调-leverage-callback)
* [`order_filled()`](#订单成交回调-order-filled-callback)

::: tip 回调调用序列
您可以在 [bot-basics](bot-basics.md#机器人执行逻辑) 中找到回调调用序列。
:::

## 策略所需的导入项

在创建策略时，您需要导入必要的模块和类。以下是策略所需的导入项：

默认情况下，我们推荐将以下导入作为策略的基础架构：
这将覆盖 Freqtrade 功能运行所需的所有导入项。
显而易见，您可以根据策略需要添加更多导入。

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

## 出场逻辑对比

Freqtrade 允许您的策略使用基于信号或基于回调的函数来实现不同的离场逻辑。
本节旨在对比每种不同的函数，帮助您选择最适合您需求的函数。

* **`populate_exit_trend()`** - 使用主数据帧中的指标进行向量化的、基于信号的离场逻辑。
  ✅ **适用场景**：用于定义基于指标或其他可以进行向量化计算的数据的离场信号。
  🚫 **建议避免**：用于为每个单独的交易自定义离场条件，或者需要交易数据来做出离场决策。
* **`custom_exit()`** - 自定义离场逻辑，将立即完全退出交易。在交易关闭前，每次机器人循环迭代都会为每个开仓交易调用。
  ✅ **适用场景**：用于为每个单独交易指定离场条件（包括使用 `adjust_trade_position()` 的任何额外调整订单），或者需要交易数据来做出离场决策（例如使用利润数据离场）。
  🚫 **建议避免**：当您希望使用向量化的基于指标的数据时（请使用 `populate_exit_trend()` 信号）；作为 `custom_stoploss()` 的代理使用；并且要注意，回测中基于价格 (rate) 的离场可能不够准确。
* **`custom_stoploss()`** - 自定义追踪止损，在交易关闭前，每次迭代都会为每个开仓交易调用。此处返回的值也用于 [交易所端止损 (stoploss on exchange)](stoploss.md#交易所端止损-stop-loss-on-exchange)。
  ✅ **适用场景**：用于自定义止损逻辑，根据交易数据或其他条件设置动态止损。
  🚫 **建议避免**：用于根据特定条件立即退出交易。此类需求请使用 `custom_exit()`。
* **`custom_roi()`** - 自定义 ROI (投资回报率)，在交易关闭前，每次迭代都会为每个开仓交易调用。
  ✅ **适用场景**：用于指定最小 ROI 阈值（“止盈”），以便在交易期间的某个时间点根据利润或其他条件以该 ROI 水平退出交易。
  🚫 **建议避免**：用于根据特定条件立即退出交易（请使用 `custom_exit()`）；用于静态 ROI（请使用 `minimal_roi`）。

## 机器人启动 (Bot start)

一个简单的回调，在策略加载时调用一次。
这可以用于执行必须且仅需执行一次的操作，在 dataprovider 和 wallet 设置完成后运行。

``` python
import requests

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def bot_start(self, **kwargs) -> None:
        """
        在机器人实例化后仅调用一次。
        :param **kwargs: 确保保留此项，以便未来的更新不会破坏您的策略。
        """
        if self.config["runmode"].value in ("live", "dry_run"):
            # 使用 self.* 赋值给类
            # 随后可由 populate_* 方法使用
            self.custom_remote_data = requests.get("https://some_remote_source.example.com")
```

在超参数优化期间，此函数仅在启动时运行一次。

## 机器人循环启动 (Bot loop start)

一个简单的回调，在模拟/实盘模式下的每次机器人频率迭代开始时调用一次（除非另有配置，否则大约每 5 秒一次），或者在回测/超参数优化模式下每根 K 线调用一次。
这可以用于执行与交易对无关的计算（适用于所有交易对）、加载外部数据等。

``` python
# 默认导入项
import requests

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def bot_loop_start(self, current_time: datetime, **kwargs) -> None:
        """
        在机器人迭代（一次循环）开始时调用。
        可能用于执行与交易对无关的任务
        （例如收集某些远程资源进行对比）
        :param current_time: datetime 对象，包含当前日期时间
        :param **kwargs: 确保保留此项，以便未来的更新不会破坏您的策略。
        """
        if self.config["runmode"].value in ("live", "dry_run"):
            # 使用 self.* 赋值给类
            # 随后可由 populate_* 方法使用
            self.remote_data = requests.get("https://some_remote_source.example.com")
```

## 投入金额管理 (Stake size management)

在进入交易前调用，可以在下达新交易时管理您的头寸大小。

```python
# 默认导入项

class AwesomeStrategy(IStrategy):
    def custom_stake_amount(self, pair: str, current_time: datetime, current_rate: float,
                            proposed_stake: float, min_stake: float | None, max_stake: float,
                            leverage: float, entry_tag: str | None, side: str,
                            **kwargs) -> float:

        dataframe, _ = self.dp.get_analyzed_dataframe(pair=pair, timeframe=self.timeframe)
        current_candle = dataframe.iloc[-1].squeeze()

        if current_candle["fastk_rsi_1h"] > current_candle["fastd_rsi_1h"]:
            if self.config["stake_amount"] == "unlimited":
                # 在复利模式下的有利条件下，使用钱包中的全部可用资金。
                return max_stake
            else:
                # 在有利条件下复利利润，而不是使用固定的投入金额。
                return self.wallets.get_total_stake_amount() / self.config["max_open_trades"]

        # 使用默认投入金额。
        return proposed_stake
```

如果您的代码引发异常，Freqtrade 将回退到 `proposed_stake` 值。异常本身将被记录到日志中。

::: tip
您不*一定*要确保 `min_stake <= 返回值 <= max_stake`。交易仍会成功，因为返回值将被限制在支持的范围内，且该操作将被记录到日志中。
:::

::: tip
返回 `0` 或 `None` 将阻止下达交易订单。
:::

## 自定义离场信号 (Custom exit signal)

在交易关闭前，每次频率迭代（大约每 5 秒）都会为处于开启状态的交易调用。

允许定义自定义离场信号，指示应关闭指定的仓位（完全离场）。当我们需要为每个单独交易自定义离场条件，或者需要交易数据来做出离场决策时，这非常有用。

例如，您可以使用 `custom_exit()` 实现 1:2 的风险回报 ROI。

不过，*不推荐*使用 `custom_exit()` 信号来代替止损。在这方面，使用 `custom_stoploss()` 是更好的方法，它还允许您在交易所端保留止损单。

::: info
从此方法返回一个（非空）`string` 或 `True` 等同于在指定时间的 K 线上设置离场信号。如果已经设置了离场信号，或者禁用了离场信号 (`use_exit_signal=False`)，则不会调用此方法。`string` 的最大长度为 64 个字符。超过此限制将导致消息被截断为 64 个字符。
`custom_exit()` 将忽略 `exit_profit_only`，并且除非 `use_exit_signal=False`，否则始终会被调用，即使有新的进场信号也是如此。
:::

以下是一个示例，展示如何根据当前利润使用不同的指标，并离场已开启超过一天的交易：

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):
    def custom_exit(self, pair: str, trade: Trade, current_time: datetime, current_rate: float,
                    current_profit: float, **kwargs):
        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
        last_candle = dataframe.iloc[-1].squeeze()

        # 利润超过 20% 时，在 RSI < 80 时卖出
        if current_profit > 0.2:
            if last_candle["rsi"] < 80:
                return "rsi_below_80"

        # 利润在 2% 到 10% 之间时，如果 EMA-long 在 EMA-short 之上则卖出
        if 0.02 < current_profit < 0.1:
            if last_candle["emalong"] > last_candle["emashort"]:
                return "ema_long_below_80"

        # 如果持有超过一天且处于亏损状态，离场该头寸。
        if current_profit < 0.0 and (current_time - trade.open_date_utc).days >= 1:
            return "unclog"
```

有关策略回调中数据帧使用的更多信息，请参阅[数据帧访问](strategy-advanced.md#数据帧访问)。

## 自定义止损 (Custom stoploss)

在交易关闭前，每次迭代（大约每 5 秒）都会为处于开启状态的交易调用。

必须通过在策略对象上设置 `use_custom_stoploss=True` 来启用自定义止损方法的使用。

止损价格只能向上移动——如果从 `custom_stoploss` 返回的止损值会导致止损价格低于之前设置的价格，则该值将被忽略。传统的 `stoploss` 值作为绝对最低水位，并将被设置为初始止损（在为一笔交易首次调用此方法之前），且它仍然是强制要求的。
由于自定义止损的作用类似于常规的、变动的止损，其行为类似于 `trailing_stop`（追踪止损）——因此由于此原因退出的交易，离场原因将为 `"trailing_stop_loss"`。

该方法必须返回一个止损值（float / number），作为当前价格的百分比。
例如：如果 `current_rate` 为 200 USD，返回 `0.02` 将把止损价格设置得低 2%，即 196 USD。
在回测期间，`current_rate`（和 `current_profit`）是根据 K 线的最高价（做空交易则为最低价）提供的，而生成的止损点则根据 K 线的最低价（做空交易则为最高价）进行评估。

使用返回值的绝对值（忽略正负号），因此返回 `0.05` 或 `-0.05` 结果相同，即止损位在当前价格下方 5%。
返回 `None` 将被解释为“不希望更改”，这是您不想修改止损时唯一安全的返回方式。
`NaN` 和 `inf` 值被视为无效并会被忽略（等同于 `None`）。

交易所端止损的工作原理类似于 `trailing_stop`，交易所端的止损会根据 `stoploss_on_exchange_interval` 中配置的频率进行更新（[关于交易所端止损的更多细节](stoploss.md#交易所端止损-stop-loss-on-exchange)）。

如果您在期货市场交易，请注意[止损与杠杆](stoploss.md#止损与杠杆)部分，因为从 `custom_stoploss` 返回的止损值是该笔交易的风险比例，而不是相对价格变动百分比。

::: info 日期的使用
所有基于时间的计算都应基于 `current_time` 进行——不建议使用 `datetime.now()` 或 `datetime.utcnow()`，因为这会破坏回测支持。
:::

::: tip 追踪止损
建议在启用自定义止损值时禁用 `trailing_stop`。两者可以协作运行，但您可能会遇到追踪止损将价格抬高而您的自定义函数不希望这样做的情况，从而导致冲突行为。
:::

### 在仓位调整后调整止损

根据您的策略，您可能发现在[仓位调整](#调整交易仓位)后需要在两个方向上调整止损。
为此，Freqtrade 会在订单成交后进行一次带有 `after_fill=True` 的额外调用，这将允许策略在任何方向上移动止损（也可以扩大止损与当前价格之间的差距，这在其他情况下是不允许的）。

::: info 向后兼容性
仅当 `after_fill` 参数是您的 `custom_stoploss` 函数定义的一部分时，才会进行此调用。
因此，这不会影响（也就不会让其感到意外）现有的、正在运行的策略。
:::

### 自定义止损示例

下一节将展示一些通过自定义止损函数可以实现的示例。
当然，还能实现更多功能，所有示例都可以随意组合。

#### 通过自定义止损实现追踪止损

要模拟 4% 的常规追踪止损（追踪至最高已达到价格下方 4%），您可以使用以下非常简单的方法：

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool, 
                        **kwargs) -> float | None:
        """
        自定义止损逻辑，返回相对于 current_rate 的新距离（作为比率）。
        例如：返回 -0.05 将在 current_rate 下方创建 5% 的止损。
        自定义止损永远不能低于 self.stoploss（硬性最大亏损限制）。

        完整文档请参阅 https://www.freqtrade.io/en/latest/strategy-advanced/

        如果策略未实现，则返回初始止损值。
        仅当 use_custom_stoploss 设置为 True 时调用。

        :param pair: 当前分析的交易对
        :param trade: 交易对象
        :param current_time: datetime 对象，包含当前日期时间
        :param current_rate: 价格，基于 exit_pricing 中的定价设置计算得出。
        :param current_profit: 当前利润（作为比率），基于 current_rate 计算得出。
        :param after_fill: 如果止损是在订单成交后调用的，则为 True。
        :param **kwargs: 确保保留此项，以便未来的更新不会破坏您的策略。
        :return float: 相对于 current_rate 的新止损值
        """
        return -0.04 * trade.leverage
```

#### 基于时间的追踪止损

前 60 分钟使用初始止损，之后改为 10% 的追踪止损，2 小时（120 分钟）后使用 5% 的追踪止损。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool, 
                        **kwargs) -> float | None:

        # 确保最长的时间间隔排在最前面——这些条件是从上到下进行评估的。
        if current_time - timedelta(minutes=120) > trade.open_date_utc:
            return -0.05 * trade.leverage
        elif current_time - timedelta(minutes=60) > trade.open_date_utc:
            return -0.10 * trade.leverage
        return None
```

#### 带有成交后调整的基于时间的追踪止损

前 60 分钟使用初始止损，之后改为 10% 的追踪止损，2 小时（120 分钟）后使用 5% 的追踪止损。
如果有额外订单成交，则将止损设置为新 `open_rate` 下方 -10%（[所有入场的平均值](#仓位调整计算)）。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool, 
                        **kwargs) -> float | None:

        if after_fill: 
            # 额外订单成交后，从新开仓价下方 10% 的止损开始
            return stoploss_from_open(0.10, current_profit, is_short=trade.is_short, leverage=trade.leverage)
        # 确保最长的时间间隔排在最前面
        if current_time - timedelta(minutes=120) > trade.open_date_utc:
            return -0.05 * trade.leverage
        elif current_time - timedelta(minutes=60) > trade.open_date_utc:
            return -0.10 * trade.leverage
        return None
```

#### 每个交易对不同的止损

根据交易对使用不同的止损。
在此示例中，我们对 `ETH/BTC` 和 `XRP/BTC` 使用 10% 的追踪止损，对 `LTC/BTC` 使用 5%，对所有其他交易对使用 15%。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool,
                        **kwargs) -> float | None:

        if pair in ("ETH/BTC", "XRP/BTC"):
            return -0.10 * trade.leverage
        elif pair in ("LTC/BTC"):
            return -0.05 * trade.leverage
        return -0.15 * trade.leverage
```

#### 带有正利润偏移量的追踪止损

在利润超过 4% 之前使用初始止损，之后使用当前利润的 50% 作为追踪止损，最小值为 2.5%，最大值为 5%。

请注意，止损位只能提高，低于当前止损位的值将被忽略。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool,
                        **kwargs) -> float | None:

        if current_profit < 0.04:
            return None # 返回 None 以继续使用初始止损

        # 达到预期偏移量后，允许止损追踪利润的一半
        desired_stoploss = current_profit / 2

        # 使用最小值 2.5% 和最大值 5%
        return max(min(desired_stoploss, 0.05), 0.025) * trade.leverage
```

#### 阶梯止损 (Stepped stoploss)

与持续追踪当前价格不同，此示例根据当前利润设置固定的止损价格水平。

* 在达到 20% 利润之前使用常规止损
* 一旦利润 > 20% - 将止损设置为开仓价上方 7%。
* 一旦利润 > 25% - 将止损设置为开仓价上方 15%。
* 一旦利润 > 40% - 将止损设置为开仓价上方 25%。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool,
                        **kwargs) -> float | None:

        # 从最高到最低进行评估，以便使用最高可能的止损点
        if current_profit > 0.40:
            return stoploss_from_open(0.25, current_profit, is_short=trade.is_short, leverage=trade.leverage)
        elif current_profit > 0.25:
            return stoploss_from_open(0.15, current_profit, is_short=trade.is_short, leverage=trade.leverage)
        elif current_profit > 0.20:
            return stoploss_from_open(0.07, current_profit, is_short=trade.is_short, leverage=trade.leverage)

        # 返回最大止损值，保持当前止损价格不变
        return None
```

#### 使用数据帧中的指标自定义止损示例

绝对止损值可以衍生自存储在数据帧中的指标。示例中使用价格下方的抛物线转向指标 (Parabolic SAR) 作为止损点。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # <...>
        dataframe["sar"] = ta.SAR(dataframe)

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool,
                        **kwargs) -> float | None:

        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
        last_candle = dataframe.iloc[-1].squeeze()

        # 使用抛物线 sar 作为绝对止损价
        stoploss_price = last_candle["sar"]

        # 将绝对价格转换为相对于 current_rate 的百分比
        if stoploss_price < current_rate:
            return stoploss_from_absolute(stoploss_price, current_rate, is_short=trade.is_short)

        # 返回最大止损值，保持当前止损价格不变
        return None
```

有关策略回调中数据帧使用的更多信息，请参阅[数据帧访问](strategy-advanced.md#数据帧访问)。

### 止损计算常用助手函数

#### 相对于开盘价的止损 (Stoploss relative to open price)

从 `custom_stoploss()` 返回的止损值必须指定相对于 `current_rate` 的百分比，但有时您可能希望指定相对于入场（开仓）价格的止损。
`stoploss_from_open()` 是一个助手函数，用于计算可以从 `custom_stoploss` 返回的止损值，该值等同于入场点上方所需的交易利润。

::: tip 从自定义止损函数中返回相对于开仓价的止损值
假设开仓价为 $100，`current_price` 为 $121（`current_profit` 将为 `0.21`）。

如果我们希望止损价在开仓价上方 7%，我们可以调用 `stoploss_from_open(0.07, current_profit, False)`，它将返回 `0.1157024793`。$121 下方 11.57% 的位置即为 $107，这与 $100 上方 7% 的位置相同。

该函数会考虑杠杆——因此在 10 倍杠杆下，实际止损点将会在 $100 上方 0.7% (0.7% * 10x = 7%)。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    use_custom_stoploss = True

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool,
                        **kwargs) -> float | None:

        # 一旦利润升至 10% 以上，将止损保持在开盘价上方 7% 的水平
        if current_profit > 0.10:
            return stoploss_from_open(0.07, current_profit, is_short=trade.is_short, leverage=trade.leverage)

        return 1
```

完整的示例可以在文档的[自定义止损](strategy-callbacks.md#自定义止损-custom-stoploss)部分找到。
:::

::: info
向 `stoploss_from_open()` 提供无效输入可能会导致“CustomStoploss 函数未返回有效的止损”警告。
如果 `current_profit` 参数低于指定的 `open_relative_stop`，就可能会发生这种情况。当离场交易被 `confirm_trade_exit()` 方法拦截时，可能会出现此类情况。可以通过检查 `confirm_trade_exit()` 中的 `exit_reason` 从而不阻断止损卖出，或者通过使用 `return stoploss_from_open(...) or 1` 特性来解决警告，该特性将在 `current_profit < open_relative_stop` 时请求不更改止损。
:::

#### 绝对价格的止损百分比 (Stoploss percentage from absolute price)

从 `custom_stoploss()` 返回的止损值始终指定相对于 `current_rate` 的百分比。为了在指定的绝对价格水平上设置止损，我们需要使用 `stop_rate` 来计算相对于 `current_rate` 的百分比，以便得到与从开盘价指定百分比相同的结果。

助手函数 `stoploss_from_absolute()` 可用于将绝对价格转换为相对于当前价格的止损百分比，该值可从 `custom_stoploss()` 返回。

::: tip 从自定义止损函数中返回使用绝对价格的止损值
如果我们想在当前价格下方 2xATR 处设置追踪止损，我们可以调用 `stoploss_from_absolute(current_rate + (side * candle["atr"] * 2), current_rate=current_rate, is_short=trade.is_short, leverage=trade.leverage)`。
对于期货，我们需要调整方向（向上或向下），并针对杠杆进行调整，因为 [`custom_stoploss`](strategy-callbacks.md#自定义止损-custom-stoploss) 回调返回的是“该笔交易的风险”，而不是相对价格变动幅度。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    use_custom_stoploss = True

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe["atr"] = ta.ATR(dataframe, timeperiod=14)
        return dataframe

    def custom_stoploss(self, pair: str, trade: Trade, current_time: datetime,
                        current_rate: float, current_profit: float, after_fill: bool,
                        **kwargs) -> float | None:
        dataframe, _ = self.dp.get_analyzed_dataframe(pair, self.timeframe)
        trade_date = timeframe_to_prev_date(self.timeframe, trade.open_date_utc)
        candle = dataframe.iloc[-1].squeeze()
        side = 1 if trade.is_short else -1
        return stoploss_from_absolute(current_rate + (side * candle["atr"] * 2), 
                                      current_rate=current_rate, 
                                      is_short=trade.is_short,
                                      leverage=trade.leverage)
```
:::

---

## 自定义 ROI (Custom ROI)

在交易关闭前，每次迭代（大约每 5 秒）都会为处于开启状态的交易调用。

必须通过在策略对象上设置 `use_custom_roi=True` 来启用自定义 ROI 方法的使用。

该方法允许您定义用于交易离场的自定义最低 ROI 阈值，以比率表示（例如 5% 利润表示为 `0.05`）。如果同时定义了 `minimal_roi` 和 `custom_roi`，则两者中的较低阈值将触发离场。例如，如果 `minimal_roi` 设置为 `{"0": 0.10}`（0 分钟时 10%），而 `custom_roi` 返回 `0.05`，那么当利润达到 5% 时交易将离场。反之，如果 `custom_roi` 返回 `0.10` 且 `minimal_roi` 设置为 `{"0": 0.05}`，利润达到 5% 时该交易也将被平仓。

该方法必须返回代表新 ROI 阈值的 float 比率，或者返回 `None` 以回退到 `minimal_roi` 逻辑。返回 `NaN` 或 `inf` 值被视为无效，并将被视为 `None`，从而导致机器人使用 `minimal_roi` 配置。

### 自定义 ROI 示例

以下示例说明了如何使用 `custom_roi` 函数实现不同的 ROI 逻辑。

#### 按方向设置自定义 ROI (Custom ROI per side)

根据 `side`（方向）使用不同的 ROI 阈值。在此示例中，做多入场为 5%，做空入场为 2%。

```python
# 默认导入项

class AwesomeStrategy(IStrategy):

    use_custom_roi = True

    # ... populate_* 方法

    def custom_roi(self, pair: str, trade: Trade, current_time: datetime, trade_duration: int,
                   entry_tag: str | None, side: str, **kwargs) -> float | None:
        """
        自定义 ROI 逻辑，返回新的最低 ROI 阈值（作为比率，例如 0.05 表示 +5%）。
        仅当 use_custom_roi 设置为 True 时调用。

        如果与 minimal_roi 同时使用，则在达到较低阈值时将触发离场。
        示例：如果 minimal_roi = {"0": 0.01} 且 custom_roi 返回 0.05，
        且利润达到 5% 时将触发离场。

        :param pair: 当前分析的交易对。
        :param trade: 交易对象。
        :param current_time: datetime 对象，包含当前日期时间。
        :param trade_duration: 当前交易持续时间（分钟）。
        :param entry_tag: 如果随买入信号提供了可选的 entry_tag (buy_tag)。
        :param side: 'long' 或 'short' - 指示当前交易的方向。
        :param **kwargs: 确保保留此项，以便未来的更新不会破坏您的策略。
        :return float: 作为比率的新 ROI 值，或返回 None 以回退到 minimal_roi 逻辑。
        """
        return 0.05 if side == "long" else 0.02
```

#### 按交易对设置自定义 ROI (Custom ROI per pair)

根据交易对 (`pair`) 使用不同的 ROI 阈值。

```python
# 默认导入项

class AwesomeStrategy(IStrategy):

    use_custom_roi = True

    # ... populate_* 方法

    def custom_roi(self, pair: str, trade: Trade, current_time: datetime, trade_duration: int,
                   entry_tag: str | None, side: str, **kwargs) -> float | None:

        stake = trade.stake_currency
        roi_map = {
            f"BTC/{stake}": 0.02, # BTC 为 2%
            f"ETH/{stake}": 0.03, # ETH 为 3%
            f"XRP/{stake}": 0.04, # XRP 为 4%
        }

        return roi_map.get(pair, 0.01) # 其他交易对为 1%
```

#### 按进场标签设置自定义 ROI (Custom ROI per entry tag)

根据随买入信号提供的 `entry_tag`（进场标签）使用不同的 ROI 阈值。

```python
# 默认导入项

class AwesomeStrategy(IStrategy):

    use_custom_roi = True

    # ... populate_* 方法

    def custom_roi(self, pair: str, trade: Trade, current_time: datetime, trade_duration: int,
                   entry_tag: str | None, side: str, **kwargs) -> float | None:

        roi_by_tag = {
            "breakout": 0.08,       # 标签为 "breakout" 时为 8%
            "rsi_overbought": 0.05, # 标签为 "rsi_overbought" 时为 5%
            "mean_reversion": 0.03, # 标签为 "mean_reversion" 时为 3%
        }

        return roi_by_tag.get(entry_tag, 0.01)  # 标签未知时为 1%
```

## 自定义订单价格规则 (Custom order price rules)

在进入或退出交易时调用，允许您在下达新订单时自定义订单价格。

如果您的自定义价格函数返回 `None` 或无效值，价格将回退到 `proposed_rate`，该价格基于常规定价配置。

::: info
使用 `custom_entry_price()` 时，一旦创建了与该交易关联的第一笔进场订单，`Trade` 对象立即可用。对于第一次进场，`trade` 参数值将为 `None`。
:::

### 自定义订单进场和出场价格示例

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def custom_entry_price(self, pair: str, trade: Trade | None, current_time: datetime, proposed_rate: float,
                           entry_tag: str | None, side: str, **kwargs) -> float:

        dataframe, last_updated = self.dp.get_analyzed_dataframe(pair=pair,
                                                                timeframe=self.timeframe)
        new_entryprice = dataframe["bollinger_10_lowerband"].iat[-1]

        return new_entryprice

    def custom_exit_price(self, pair: str, trade: Trade,
                          current_time: datetime, proposed_rate: float,
                          current_profit: float, exit_tag: str | None, **kwargs) -> float:

        dataframe, last_updated = self.dp.get_analyzed_dataframe(pair=pair,
                                                                timeframe=self.timeframe)
        new_exitprice = dataframe["bollinger_10_upperband"].iat[-1]

        return new_exitprice
```

::: warning
修改进场和离场价格仅对限价单有效。根据所选价格，这可能会导致大量订单无法成交。默认情况下，当前价格与自定义价格之间允许的最大距离为 2%，此值可以通过配置中的 `custom_price_max_distance_ratio` 参数进行更改。
**示例**：
如果 `new_entryprice` 为 97，`proposed_rate` 为 100，且 `custom_price_max_distance_ratio` 设置为 2%，保留的有效自定义进场价格将为 98，即比当前（建议）价格低 2%。
:::

::: warning 回测
回测支持自定义价格（从 2021.12 版本开始），如果价格落在 K 线的最高/最低范围内，订单将成交。
未立即成交的订单将遵循常规超时处理，每根（精细）K 线处理一次。
`custom_exit_price()` 仅对类型为 `exit_signal` 的卖出、自定义离场及部分离场调用。所有其他离场类型将使用常规回测价格。
:::

## 自定义订单超时规则 (Custom order timeout rules)

简单的、基于时间的订单超时可以通过策略或配置中的 `unfilledtimeout` 部分进行配置。

然而，Freqtrade 还为两种订单类型提供自定义回调，允许您根据自定义标准决定订单是否超时。

::: info
回测中，如果订单价格落在 K 线的最高/最低范围内，则会成交。
对于未立即成交（使用了自定义价格）的订单，以下回调在每根（精细）K 线调用一次。
:::

### 自定义订单超时示例

为每个挂单调用，直到该订单成交或取消。
`check_entry_timeout()` 为交易进入时调用，而 `check_exit_timeout()` 为交易离场订单调用。

下面的简单示例根据资产价格应用不同的未成交超时限制。
它对高价资产应用较严的超时限制，而允许廉价代币有更多时间成交。

函数必须返回 `True`（取消订单）或 `False`（保持订单有效）。

``` python
    # 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    # 将 unfilledtimeout 设置为 25 小时，因为下方的最大超时是 24 小时。
    unfilledtimeout = {
        "entry": 60 * 25,
        "exit": 60 * 25
    }

    def check_entry_timeout(self, pair: str, trade: Trade, order: Order,
                            current_time: datetime, **kwargs) -> bool:
        if trade.open_rate > 100 and trade.open_date_utc < current_time - timedelta(minutes=5):
            return True
        elif trade.open_rate > 10 and trade.open_date_utc < current_time - timedelta(minutes=3):
            return True
        elif trade.open_rate < 1 and trade.open_date_utc < current_time - timedelta(hours=24):
           return True
        return False


    def check_exit_timeout(self, pair: str, trade: Trade, order: Order,
                           current_time: datetime, **kwargs) -> bool:
        if trade.open_rate > 100 and trade.open_date_utc < current_time - timedelta(minutes=5):
            return True
        elif trade.open_rate > 10 and trade.open_date_utc < current_time - timedelta(minutes=3):
            return True
        elif trade.open_rate < 1 and trade.open_date_utc < current_time - timedelta(hours=24):
           return True
        return False
```

::: info
在上面的示例中，`unfilledtimeout` 必须设置为大于 24 小时的值，否则该类型的超时将首先生效。
:::

## 机器人订单确认 (Bot order confirmation)

确认交易进入/退出。
这些是下达订单前最后调用的方法。

### 交易进入（买单）确认

`confirm_trade_entry()` 可用于在最后一秒（可能是因为价格不符合预期）中止交易进入。

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def confirm_trade_entry(self, pair: str, order_type: str, amount: float, rate: float,
                            time_in_force: str, current_time: datetime, entry_tag: str | None,
                            side: str, **kwargs) -> bool:
        """
        在下达进入订单之前调用。
        此函数的时间关键性极高，因此请避免在此方法中进行大量计算或网络请求。

        完整文档请参阅 https://www.freqtrade.io/en/latest/strategy-advanced/

        未在策略中实现时，返回 True（始终确认）。

        :param pair: 即将买入/做空的交易对。
        :param order_type: 订单类型（由 order_types 配置）。通常为 limit 或 market。
        :param amount: 即将交易的目标（基准）货币金额。
        :param rate: 限价单使用的价格，或市价单的当前价格。
        :param time_in_force: 有效时间。默认为 GTC (永不过期)。
        :param current_time: datetime 对象，包含当前日期时间
        :param entry_tag: 如果随买入信号提供了可选的 entry_tag (buy_tag)。
        :param side: "long" 或 "short" - 指示拟议交易的方向
        :param **kwargs: 确保保留此项，以便未来的更新不会破坏您的策略。
        :return bool: 返回 True 时，买单将下达到交易所。返回 False 则中止流程。
        """
        return True
```

### 交易离场（卖单）确认

`confirm_trade_exit()` 可用于在最后一秒（可能是因为价格不符合预期）中止交易离场（卖出）。

如果在同一个交易中适用不同的离场原因，`confirm_trade_exit()` 可能会在一次迭代中被调用多次。
适用时的离场原因按以下顺序排列：

* `exit_signal` / `custom_exit`
* `stop_loss`
* `roi`
* `trailing_stop_loss`

``` python
# 默认导入项

class AwesomeStrategy(IStrategy):

    # ... populate_* 方法

    def confirm_trade_exit(self, pair: str, trade: Trade, order_type: str, amount: float,
                           rate: float, time_in_force: str, exit_reason: str,
                           current_time: datetime, **kwargs) -> bool:
        """
        在下达常规离场订单之前调用。
        此函数的时间关键性极高，因此请避免在此方法中进行大量计算或网络请求。

        未在策略中实现时，返回 True（始终确认）。

        :param pair: 即将离场的交易对。
        :param trade: 交易对象。
        :param order_type: 订单类型。
        :param amount: 基准货币金额。
        :param rate: 限价单使用的价格，或市价单的当前价格。
        :param exit_reason: 离场原因。
            可以是 ["roi", "stop_loss", "stoploss_on_exchange", "trailing_stop_loss",
                           "exit_signal", "force_exit", "emergency_exit"] 中的任意一个。
        :return bool: 返回 True 时，离场订单将下达到交易所。返回 False 则中止流程。
        """
        if exit_reason == "force_exit" and trade.calc_profit_ratio(rate) < 0:
            # 拒绝负利润的强制卖出
            return False
        return True
```

::: warning
`confirm_trade_exit()` 可以阻止止损离场，由于忽略了止损离场，这可能会导致重大损失。
`confirm_trade_exit()` 不会为“爆仓 (Liquidations)”调用——因为爆仓是由交易所强制执行的，因此无法拒绝。
:::

## 调整交易仓位 (Adjust trade position)

`position_adjustment_enable` 策略属性用于启用策略中的 `adjust_trade_position()` 回调。
出于性能原因，它默认是禁用的，如果启用，Freqtrade 在启动时会显示一条警告信息。
`adjust_trade_position()` 可用于执行额外订单，例如通过 DCA（定投/补仓）管理风险，或增加/减少仓位。

额外订单会导致产生额外手续费，且这些订单不计入 `max_open_trades`（最大开仓数限制）。

当有挂单（买入或卖出）等待执行时，也会调用此回调——如果金额、价格或方向不同，它将取消现有的挂订单以放置新订单。部分成交的订单也将被取消，并根据回调返回的新金额进行替换。

`adjust_trade_position()` 在交易持续期间会被非常频繁地调用，因此您必须保持实现的性能尽可能高。

仓位调整将始终沿交易方向应用，因此正值总是增加您的头寸（负值减少您的头寸），无论它是做多还是做空交易。
调整订单可以通过返回一个包含 2 个元素的元组来分配标签，其中第一个元素是调整金额，第二个元素是标签（例如 `return 250, "increase_favorable_conditions"`）。

无法修改杠杆，且假设返回的投入金额 (stake-amount) 是在应用杠杆之前的。

当前分配给该头寸的总投入金额保存在 `trade.stake_amount` 中。因此，通过 `adjust_trade_position()` 每进行一次额外的进入或部分离场，`trade.stake_amount` 都会更新。

::: danger 宽松的逻辑
在模拟和实盘运行中，此函数每隔 `throttle_process_secs`（默认为 5 秒）就会被调用一次。如果您采用了较为宽松的逻辑（例如，如果上一根 K 线 RSI 低于 30 就增加仓位），您的机器人在每 5 秒都会进行一次额外的入场，直到钱花光、达到 `max_position_adjustment` 限制，或是迎来 RSI 大于 30 的新 K 线。

部分离场也可能发生同样的情况。
因此请确保逻辑严密，并/或检查最后一笔成交的订单以及是否有订单已经开启。
:::

::: warning 仓位调整过多时的性能问题
仓位调整是提高策略产出的一种好方法，但如果过度使用此功能，也会带来弊端。
每笔订单都会在交易存续期间附着在交易对象上，从而增加内容占用。
因此不建议进行存续期很长且伴随 10 次甚至上百次仓位调整的交易，应当定期平仓以避免影响性能。
:::

::: warning 回测
在回测期间，此回调会在 `timeframe` 或 `timeframe_detail` 下的每根 K 线被调用，因此运行性能会受到影响。这还可能导致实盘与回测之间的结果偏差，因为回测每根 K 线只能调整一次交易，而实盘每根 K 线可以调整多次。
:::

### 增加仓位 (Increase position)

如果需要创建额外的进入订单（仓位增加 -> 做多为买入，做空为卖出），策略预计返回一个介于 `min_stake` 和 `max_stake` 之间的正数 **stake_amount**。

如果钱包中资金不足（返回值高于 `max_stake`），信号将被忽略。
`max_entry_position_adjustment` 属性用于限制机器人除了第一次入场订单外，每笔交易所能执行的额外入场次数。默认值为 -1，表示机器人对调整入场次数没有限制。

一旦达到您设置的 `max_entry_position_adjustment` 最大额外入场次数，额外的入场信号将被忽略，但回调仍会被调用以便寻找部分离场机会。

::: info 关于投入金额大小
使用固定投入金额意味着它将是第一次订单使用的金额，就像没有仓位调整一样。
如果您希望通过 DCA 买入额外的订单，请确保在钱包中留有足够的资金。
在 DCA 订单中使用 `"unlimited"`（无限额）投入金额，需要您同时实现 `custom_stake_amount()` 回调，以避免将所有资金分配给初始订单。
:::

### 减少仓位 (Decrease position)

对于部分离场，策略预计返回一个负的 stake_amount（以投入货币计）。
返回当时拥有的全部份额 (`-trade.stake_amount`) 将导致完全离场。
返回超过上述值（导致剩余 stake_amount 变为负数）将导致机器人忽略该信号。

对于部分离场需要知道，计算该币种部分离场订单金额的公式为：`部分离场金额 = 负的 stake_amount * trade.amount / trade.stake_amount`。公式并不关心头寸当前的盈亏，只关心 `trade.amount` 和 `trade.stake_amount`，它们不受价格波动的影响。

::: warning 止损计算
止损仍然是从初始开盘价计算的，而不是平均价格。常规止损规则仍然适用（不能向下移动）。
虽然 `/stopentry` 命令会阻止机器人进入新交易，但仓位调整功能将继续为现有交易买入新订单。
:::

``` python
# 示例代码 (略，见英文原文)
```

### 仓位调整计算

* 入场价格使用加权平均值计算。
* 离场不会影响平均入场价格。
* 部分离场的相对利润是相对于当时平均入场价格计算的。
* 最终离场的相对利润是根据总投资资本计算的。

::: tip 计算示例
(假设 0 手续费、做多)
1. 8$ 买 100
2. 9$ 买 100 -> 均价 8.5$
3. 10$ 卖 100 -> 均价 8.5$，已实现利润 150$，17.65%
4. 11$ 买 150 -> 均价 10$，已实现利润 150$，17.65%
5. 12$ 卖 100 -> 均价 10$，总实现利润 350$，20%
6. 14$ 卖 150 -> 均价 10$，总实现利润 950$，40%

本笔交易总投资 3350$，利润 950$，最终相对利润 28.35% (`950 / 3350`)。
:::

## 调整订单价格 (Adjust order Price)

`adjust_order_price()` 回调可供策略开发者在每根新 K 线到来时刷新/替换限价单。
除非在该 K 线内已经下过或调整过订单，否则此回调每轮执行一次——将每个订单的最大调整瓶颈限制在每根 K 线一次。
这也意味着第一次调用将在初始订单下达后的下一根 K 线开始时。

请注意，在信号发出时，`custom_entry_price()`/`custom_exit_price()` 仍然是主导初始限价单价格目标的那个。

可以通过返回 `None` 来从该回调中取消订单。
返回 `current_order_rate` 将使订单保持在交易所。
返回任何其他价格都将取消现有订单，并以新价格替换。

不填时默认维持当前价格。不支持该功能与 `adjust_*_price()` 同时实现。

## 杠杆回调 (Leverage Callback)

在允许杠杆的市场交易时，此方法必须返回所需的杠杆（默认为 1 -> 无杠杆）。
所有利润计算、止损/ROI 均包含杠杆。

## 订单成交回调 (Order filled Callback)

`order_filled()` 回调可用于在订单成交后根据当前交易状态执行特定操作。不论订单类型（入场、离场、止损或仓位调整）均会被调用。

## 图表标注回调 (Plot annotations callback)

每当 FreqUI 请求数据显示图表时，都会调用图表标注回调。
该回调可以返回一组 `AnnotationType` 对象（区域 area 或 连线 line）以显示在图表上。

::: warning 标注过多
使用过多的标注会导致 UI 卡死，尤其是在绘制大量历史数据时。
:::

### 下一步

有关存储自定义交易数据的更多信息，请参阅相关高级文档。