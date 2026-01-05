
# Freqtrade 基础知识

本页为您提供一些关于 Freqtrade 如何工作及其运行的基本概念。

## Freqtrade 专业术语

* **策略 (Strategy)**：您的交易策略，告诉机器人该做什么。
* **交易 (Trade)**：已开启的仓位。
* **挂单 (Open Order)**：当前已下达到交易所但尚未完成的订单。
* **交易对 (Pair)**：可交易的资产对，通常格式为“基准货币/计价货币”（例如现货的 `XRP/USDT`，期货的 `XRP/USDT:USDT`）。
* **时间框架 (Timeframe)**：使用的 K 线长度（例如 `"5m"`、`"1h"` 等）。
* **指标 (Indicators)**：技术指标（SMA、EMA、RSI 等）。
* **限价单 (Limit order)**：按定义的限价或更优价格执行的订单。
* **市价单 (Market order)**：保证成交，可能会根据订单大小移动价格。
* **当前利润 (Current Profit)**：该笔交易当前待定（未实现）的利润。这主要用于整个机器人和 UI 中。
* **已实现利润 (Realized Profit)**：已经实现的利润。仅在结合使用[部分出场 (partial exits)](strategy-callbacks.md#adjust-trade-position)时才有意义——该链接也解释了其计算逻辑。
* **总利润 (Total Profit)**：已实现和未实现利润的组合。相对百分比 (%) 是根据该笔交易的总投资额计算的。

## 手续费处理

Freqtrade 的所有利润计算都包含手续费。对于回测 (Backtesting) / 超参数优化 (Hyperopt) / 模拟运行 (Dry-run) 模式，使用交易所默认手续费（交易所最低级别）。对于实盘操作，将使用交易所实际收取的手续费（包括 BNB 返利等）。

## 交易对命名

Freqtrade 遵循货币的 [ccxt 命名规范](https://docs.ccxt.com/#/README?id=consistency-of-base-and-quote-currencies)。
在错误的市场使用错误的命名规范通常会导致机器人无法识别该交易对，通常会导致类似于“该交易对不可用”的错误。

### 现货交易对命名

对于现货交易对，命名格式为 `基准货币/计价货币`（例如 `ETH/USDT`）。

### 期货交易对命名

对于期货交易对，命名格式为 `基准货币/计价货币:结算货币`（例如 `ETH/USDT:USDT`）。

## 机器人执行逻辑

以模拟运行或实盘模式启动 freqtrade（使用 `freqtrade trade`）将启动机器人并开始机器人迭代循环。
这也将运行 `bot_start()` 回调。

默认情况下，机器人循环每隔几秒运行一次 (`internals.process_throttle_secs`) 并执行以下操作：

* 从持久化存储中获取开启的交易。
* 计算当前可交易的交易对列表。
* 下载交易对列表的 OHLCV 数据，包括所有[信息性交易对 (informative pairs)](strategy-customization.md#get-data-for-non-tradeable-pairs)。
  为了避免不必要的网络流量，该步骤在每根 K 线期间仅执行一次。
* 调用策略回调 `bot_loop_start()`。
* 对每个交易对进行策略分析。
  * 调用 `populate_indicators()`
  * 调用 `populate_entry_trend()`
  * 调用 `populate_exit_trend()`
* 从交易所更新交易的挂单状态。
  * 为已成交订单调用 `order_filled()` 策略回调。
  * 检查挂单是否超时。
    * 为挂单中的进场订单调用 `check_entry_timeout()` 策略回调。
    * 为挂单中的出场订单调用 `check_exit_timeout()` 策略回调。
    * 为挂单调用 `adjust_order_price()` 策略回调。
      * 为挂单中的进场订单调用 `adjust_entry_price()` 策略回调。*仅在未实现 `adjust_order_price()` 时调用*
      * 为挂单中的出场订单调用 `adjust_exit_price()` 策略回调。*仅在未实现 `adjust_order_price()` 时调用*
* 验证现有仓位，并最终下达离场订单。
  * 考虑止损 (stoploss)、投资回报率 (ROI) 和离场信号、`custom_exit()` 及 `custom_stoploss()`。
  * 根据 `exit_pricing` 配置设置或使用 `custom_exit_price()` 回调确定离场价格。
  * 在下达离场订单之前，调用 `confirm_trade_exit()` 策略回调。
* 如果已启用，通过调用 `adjust_trade_position()` 检查未平仓位的仓位调整，并在需要时下达额外订单。
* 检查交易槽位是否仍然可用（是否已达到 `max_open_trades`）。
* 验证入场信号，尝试建立新仓位。
  * 根据 `entry_pricing` 配置设置或使用 `custom_entry_price()` 回调确定进场价格。
  * 在全仓杠杆和期货模式下，调用 `leverage()` 策略回调以确定所需的杠杆。
  * 通过调用 `custom_stake_amount()` 回调确定投入金额大小。
  * 在下达进场订单之前，调用 `confirm_trade_entry()` 策略回调。

该循环将周而复始，直到机器人停止。

## 回测 / 超参数优化执行逻辑

[回测](backtesting.md)或[超参数优化](hyperopt.md)仅执行上述逻辑的一部分，因为大多数交易操作都是完全模拟的。

* 为配置的交易对列表加载历史数据。
* 调用一次 `bot_start()`。
* 计算指标（每个交易对调用一次 `populate_indicators()`）。
* 计算进场 / 离场信号（每个交易对调用一次 `populate_entry_trend()` 和 `populate_exit_trend()`）。
* 针对每根 K 线循环，模拟进场点和离场点。
  * 调用策略回调 `bot_loop_start()`。
  * 检查订单超时，可以通过 `unfilledtimeout` 配置，也可以通过 `check_entry_timeout()` / `check_exit_timeout()` 策略回调。
  * 为挂单调用 `adjust_order_price()` 策略回调。
    * 为挂单中的进场订单调用 `adjust_entry_price()` 策略回调。*仅在未实现 `adjust_order_price()` 时调用！*
    * 为挂单中的出场订单调用 `adjust_exit_price()` 策略回调。*仅在未实现 `adjust_order_price()` 时调用！*
  * 检查交易入场信号（`enter_long` / `enter_short` 列）。
  * 确认交易进场 / 离场（如果在策略中实现了 `confirm_trade_entry()` 和 `confirm_trade_exit()` 则调用它们）。
  * 调用 `custom_entry_price()`（如果在策略中实现）以确定进场价格（价格会被移动到开盘 K 线范围内）。
  * 在全仓杠杆和期货模式下，调用 `leverage()` 策略回调以确定所需的杠杆。
  * 通过调用 `custom_stake_amount()` 回调确定投入金额大小。
  * 如果已启用，检查未平仓位的仓位调整，并调用 `adjust_trade_position()` 以确定是否需要额外订单。
  * 为已成交的进场订单调用 `order_filled()` 策略回调。
  * 调用 `custom_stoploss()` 和 `custom_exit()` 以寻找自定义离场点。
  * 对于基于离场信号、自定义离场和部分离场的情况：调用 `custom_exit_price()` 确定离场价格（价格会被移动到收盘 K 线范围内）。
  * 为已成交的离场订单调用 `order_filled()` 策略回调。
* 生成回测报告输出。

::: info
回测和超参数优化都在计算中包含交易所默认手续费。可以通过指定 `--fee` 参数将自定义手续费传递给回测 / 超参数优化。
:::

::: warning 回调调用频率
回测最多会为每根 K 线调用一次每个回调（`--timeframe-detail` 会将此行为修改为每根详细 K 线调用一次）。
在实盘中，大多数回调在每次迭代时都会被调用（通常每 5 秒左右）——这可能会导致回测结果不一致。
:::