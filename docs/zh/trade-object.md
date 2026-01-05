
# 交易对象 (Trade Object)

## 交易 (Trade)

Freqtrade 进入的仓位存储在 `Trade` 对象中 —— 该对象会持久化到数据库。
它是 Freqtrade 的核心概念 —— 您会在文档的许多部分遇到它，这些部分很可能会引导您到此位置。

在许多 [策略回调函数](strategy-callbacks.md) 中，它都会被传递给策略。传递给策略的对象不能直接修改。间接修改可能会根据回调结果发生。

## 交易 - 可用属性 (Trade - Available attributes)

每个单独的交易都有以下属性/属性可用 —— 并且可以使用 `trade.<属性>`（例如 `trade.pair`）来访问。

|  属性 | 数据类型 | 描述 |
|------------|-------------|-------------|
| `pair` | string | 该交易的交易对。 |
| `safe_base_currency` | string | 基础货币的兼容层。 |
| `safe_quote_currency` | string | 报价货币的兼容层。 |
| `is_open` | boolean | 交易目前是开启状态，还是已经结束。 |
| `exchange` | string | 执行该交易的交易所。 |
| `open_rate` | float | 进入该交易的价格（在交易调整的情况下为平均入场价格）。 |
| `open_rate_requested` | float | 开启交易时请求的价格。 |
| `open_trade_value` | float | 开启交易的价值，包括手续费。 |
| `close_rate` | float | 结束价格 —— 仅在 `is_open = False` 时设置。 |
| `close_rate_requested` | float | 请求的结束价格。 |
| `safe_close_rate` | float | 结束价格或 `close_rate_requested`，或在两者都不可用时为 0.0。仅在交易结束后才有意义。 |
| `stake_amount` | float | 投入金额（投入或报价货币）。 |
| `max_stake_amount` | float | 该交易中使用的最大投入金额（所有已成交入场订单的总和）。 |
| `amount` | float | 当前拥有的资产/基础货币数量。在初始订单成交前为 0.0。 |
| `amount_requested` | float | 作为第一个入场订单的一部分，最初为该交易请求的数量。 |
| `open_date` | datetime | 交易开启的时间戳 **请改用 `open_date_utc`** |
| `open_date_utc` | datetime | 交易开启的时间戳 —— UTC 时间。 |
| `close_date` | datetime | 交易结束的时间戳 **请改用 `close_date_utc`** |
| `close_date_utc` | datetime | 交易结束的时间戳 —— UTC 时间。 |
| `close_profit` | float | 交易结束时的相对利润。`0.01` == 1% |
| `close_profit_abs` | float | 交易结束时的绝对利润（以投入货币计）。 |
| `realized_profit` | float | 在交易仍然开启时，绝对已经实现的利润（以投入货币计）。 |
| `leverage` | float | 该交易使用的杠杆 —— 在现货市场默认为 1.0。 |
| `enter_tag` | string | 通过数据框中的 `enter_tag` 列在入场时提供的标签。 |
| `exit_reason` | string | 交易退出的原因。 |
| `exit_order_status` | string | 离场订单的状态。 |
| `strategy` | string | 该交易使用的策略名称。 |
| `timeframe` | int | 该交易使用的时间框架。 |
| `is_short` | boolean | 对于做空交易为 True，否则为 False。 |
| `orders` | Order[] | 附加到该交易的订单对象列表（包括已成交和已取消的订单）。 |
| `date_last_filled_utc` | datetime | 最后一次成交订单的时间。 |
| `date_entry_fill_utc` | datetime | 第一个成交的入场订单的日期。 |
| `entry_side` | "buy" / "sell" | 交易进入时的订单侧。 |
| `exit_side` | "buy" / "sell" | 将导致交易退出/头寸减少的订单侧。 |
| `trade_direction` | "long" / "short" | 文本格式的交易方向 —— long (做多) 或 short (做空)。 |
| `max_rate` | float | 该交易期间达到的最高价格。不保证 100% 准确。 |
| `min_rate` | float | 该交易期间达到的最低价格。不保证 100% 准确。 |
| `nr_of_successful_entries` | int | 成功（已成交）的入场订单数量。 |
| `nr_of_successful_exits` | int | 成功（已成交）的离场订单数量。 |
| `has_open_position` | boolean | 如果该交易有开启的仓位（数量 > 0）则为 True。仅在初始入场订单未成交时为 False。 |
| `has_open_orders` | boolean | 交易是否有开启的订单（不包括止损订单）。 |
| `has_open_sl_orders` | boolean | 如果该交易有开启的止损订单，则为 True。 |
| `open_orders` | Order[] | 该交易的所有开启订单，不包括止损订单。 |
| `open_sl_orders` | Order[] | 该交易的所有开启止损订单。 |
| `fully_canceled_entry_order_count` | int | 完全取消的入场订单数量。 |
| `canceled_exit_order_count` | int | 已取消的离场订单数量。 |

### 止损相关属性 (Stop Loss related attributes)

|  属性 | 数据类型 | 描述 |
|------------|-------------|-------------|
| `stop_loss` | float | 止损的绝对值。 |
| `stop_loss_pct` | float | 止损的相对值。 |
| `initial_stop_loss` | float | 初始止损的绝对值。 |
| `initial_stop_loss_pct` | float | 初始止损的相对值。 |
| `stoploss_last_update_utc` | datetime | 交易所为止损订单最后更新的时间戳。 |
| `stoploss_or_liquidation` | float | 返回止损价格或强平价格中更具限制性的那个，对应止损触发的价格。 |

### 期货/杠杆交易属性 (Futures/Margin trading attributes)

|  属性 | 数据类型 | 描述 |
|------------|-------------|-------------|
| `liquidation_price` | float | 杠杆交易的强平价格。 |
| `interest_rate` | float | 杠杆交易的利率。 |
| `funding_fees` | float | 期货交易的总资金费用。 |

## 类方法 (Class methods)

以下是类方法 —— 它们返回通用信息，通常会导致对数据库的显式查询。
它们可以作为 `Trade.<方法>` 使用 —— 例如 `open_trades = Trade.get_open_trade_count()`

::: warning 回测/超参数优化 (Backtesting/hyperopt)
大多数方法在回测/超参数优化和实盘/模拟模式下都能工作。
在回测期间，它仅限于在 [策略回调函数](strategy-callbacks.md) 中使用。不支持在 `populate_*()` 方法中使用，会导致错误的结果。
:::

### get_trades_proxy

当您的策略需要有关现有（开启或结束）交易的一些信息时 —— 最好使用 `Trade.get_trades_proxy()`。

用法：

``` python
from freqtrade.persistence import Trade
from datetime import timedelta

# ...
trade_hist = Trade.get_trades_proxy(pair='ETH/USDT', is_open=False, open_date=current_date - timedelta(days=2))

```

`get_trades_proxy()` 支持以下关键字参数。所有参数都是可选的 —— 不带参数调用 `get_trades_proxy()` 将返回数据库中所有交易的列表。

* `pair` 例如 `pair='ETH/USDT'`
* `is_open` 例如 `is_open=False`
* `open_date` 例如 `open_date=current_date - timedelta(days=2)`
* `close_date` 例如 `close_date=current_date - timedelta(days=5)`

### get_open_trade_count

获取当前开启的交易数量

``` python
from freqtrade.persistence import Trade
# ...
open_trades = Trade.get_open_trade_count()
```

### get_total_closed_profit

检索机器人到目前为止产生的总利润。
汇总所有已关闭交易的 `close_profit_abs`。

``` python
from freqtrade.persistence import Trade

# ...
profit = Trade.get_total_closed_profit()
```

### total_open_trades_stakes

检索当前在交易中的总投入金额 (stake_amount)。

``` python
from freqtrade.persistence import Trade

# ...
profit = Trade.total_open_trades_stakes()
```

## 回测/超参数优化不支持的类方法 (Class methods not supported in backtesting/hyperopt)

以下类方法在回测/超参数优化模式下不受支持。

### get_overall_performance

检索总体表现 —— 类似于 `/performance` Telegram 命令。

``` python
from freqtrade.persistence import Trade

# ...
if self.config['runmode'].value in ('live', 'dry_run'):
    performance = Trade.get_overall_performance()
```

示例返回值：ETH/BTC 有 5 笔交易，总利润为 1.5%（比例为 0.015）。

``` json
{"pair": "ETH/BTC", "profit": 0.015, "count": 5}
```

### get_trading_volume

根据订单获取总交易量。

``` python
from freqtrade.persistence import Trade

# ...
volume = Trade.get_trading_volume()
```

## 订单对象 (Order Object)

`Order` 对象代表交易所上的订单（或模拟运行模式下的模拟订单）。
一个 `Order` 对象总是与其相应的 [`Trade`](#trade-object) 相关联，并且只有在交易的上下文中才有意义。

### 订单 - 可用属性 (Order - Available attributes)

订单对象通常附加到交易。
这里的大多数属性可以为 `None`，因为它们取决于交易所的响应。

|  属性 | 数据类型 | 描述 |
|------------|-------------|-------------|
| `trade` | Trade | 该订单附加到的交易对象 |
| `ft_pair` | string | 该订单所属的交易对 |
| `ft_is_open` | boolean | 订单是否仍处于开启状态？ |
| `ft_order_side` | string | 订单侧 ('buy', 'sell' 或 'stoploss') |
| `ft_cancel_reason` | string | 订单被取消的原因 |
| `ft_order_tag` | string | 自定义订单标签 |
| `order_id` | string | 交易所订单 ID |
| `order_type` | string | 交易所定义的订单类型 —— 通常是 market (市价), limit (限价) 或 stoploss (止损) |
| `status` | string | 由 [ccxt 的订单结构](https://docs.ccxt.com/#/README?id=order-structure) 定义的状态。通常是 open, closed, expired, canceled 或 rejected |
| `side` | string | buy (买入) 或 sell (卖出) |
| `price` | float | 订单下单时的价格 |
| `average` | float | 订单成交的平均价格 |
| `amount` | float | 基础货币的数量 |
| `filled` | float | 已成交数量（基础货币形式）（请改用 `safe_filled`） |
| `safe_filled` | float | 已成交数量（基础货币形式） —— 保证不为 None |
| `safe_amount` | float | 数量 —— 如果为 None 则回退到 `ft_amount` |
| `safe_price` | float | 价格 —— 按照 average, price, stop_price, ft_price 的顺序回退 |
| `safe_placement_price` | float | 订单下单时的价格 |
| `remaining` | float | 剩余数量（请改用 `safe_remaining`） |
| `safe_remaining` | float | 剩余数量 —— 从交易所获取或计算。 |
| `safe_cost` | float | 订单的成本 —— 保证不为 None |
| `safe_fee_base` | float | 基础货币的手续费 —— 保证不为 None |
| `safe_amount_after_fee` | float | 扣除手续费后的数量 |
| `cost` | float | 订单的成本 —— 通常是 average * filled (*取决于交易所的期货交易，可能包含也可能不包含杠杆，并且可能是以合约为单位。*) |
| `stop_price` | float | 止损订单的触发价格。对于非止损订单为空。 |
| `stake_amount` | float | 该订单使用的投入金额。 |
| `stake_amount_filled` | float | 该订单已成交的投入金额。 |
| `order_date` | datetime | 订单创建日期 **请改用 `order_date_utc`** |
| `order_date_utc` | datetime | 订单创建日期（UTC 时间） |
| `order_filled_date` | datetime | 订单成交日期 **请改用 `order_filled_utc`** |
| `order_filled_utc` | datetime | 订单成交日期 |
| `order_update_date` | datetime | 最后一次订单更新日期 |
