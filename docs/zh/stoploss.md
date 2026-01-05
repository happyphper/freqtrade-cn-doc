
# 止损 (Stop Loss)

`stoploss` 配置参数是代表触发卖出的亏损比例。
例如，`-0.10` 的值将导致如果某笔交易的利润跌破 -10% 时立即卖出。此参数是可选的。
止损计算已包含手续费，因此 -10% 的止损是设置在进场点下方正好 10% 的位置。

大多数策略文件已经包含了最佳的 `stoploss` 值。

::: info 优先级提示
本文件中提到的所有止损属性都可以在策略 (Strategy) 中设置，也可以在配置 (Config) 中设置。
**配置文件中的值将覆盖策略中的值。**
:::

## 交易所止损 vs 机器人内止损 (Stop Loss On-Exchange/Freqtrade)

止损模式可以是 **在交易所执行 (on exchange)** 或 **不在交易所执行 (off exchange)**。

可以使用以下值配置这些模式：

``` python
    'emergency_exit': 'market',
    'stoploss_on_exchange': False,
    'stoploss_on_exchange_interval': 60,
    'stoploss_on_exchange_limit_ratio': 0.99
```

只有部分交易所支持“在交易所执行止损”，且并非所有交易所都同时支持止损限价单 (stop-limit) 和止损市价单 (stop-market)。如果仅有一种模式可用，则订单类型将被忽略。

::: info 支持的交易所和止损类型

| 交易所 | 模式 | 保证金模式 | 止损类型 |
|---------|---------|------|------------------|
| [Binance](exchanges.md#binance) | 现货 | | 限价 (limit) |
| [Binance](exchanges.md#binance) | 期货 | 逐仓, 全仓 | 市价 (market), 限价 (limit) |
| [Bingx](exchanges.md#bingx) | 现货 | | 市价 (market), 限价 (limit) |
| [Bitmart](exchanges.md#bitmart) | 现货 | | ❌ (不支持) |
| [Bitget](exchanges.md#bitget) | 现货 | | 市价 (market), 限价 (limit) |
| [Bitget](exchanges.md#bitget) | 期货 | 逐仓 | 市价 (market), 限价 (limit) |
| [Bybit](exchanges.md#bybit) | 现货 | | ❌ (不支持) |
| [Bybit](exchanges.md#bybit) | 期货 | 逐仓 | 市价 (market), 限价 (limit) |
| [Gate.io](exchanges.md#gateio) | 现货 | | 限价 (limit) |
| [Gate.io](exchanges.md#gateio) | 期货 | 逐仓 | 限价 (limit) |
| [HTX](exchanges.md#htx) | 现货 | | 限价 (limit) |
| [Hyperliquid](exchanges.md#hyperliquid) | 现货 | | ❌ (不支持) |
| [Hyperliquid](exchanges.md#hyperliquid) | 期货 | 逐仓, 全仓 | 限价 (limit) |
| [Kraken](exchanges.md#kraken) | 现货 | | 市价 (market), 限价 (limit) |
| [OKX](exchanges.md#okx) | 现货 | | 限价 (limit) |
| [OKX](exchanges.md#okx) | 期货 | 逐仓 | 限价 (limit) |
| [Bitvavo](exchanges.md#bitvavo) | 现货 | | ❌ (不支持) |
| [Kucoin](exchanges.md#kucoin) | 现货 | | 市价 (market), 限价 (limit) |

:::

::: info 紧凑止损 (Tight stoploss)
使用交易所止损时，请勿设置过低/过紧的止损值！如果设置得太紧，订单未成交的风险会增加，止损可能失效。
:::

::: warning 宽松止损 (Loose stoploss)
使用由于交易所限制，使用非常宽的止损（例如 -1）在交易所放置止损订单可能会失败。在这种情况下，机器人将回退到使用 `emergency_exit` 订单类型来下达市价单。目前 Freqtrade 未实现规避这种情况的限制，因此请确保您的止损值在交易所的合理范围内，或禁用交易所止损。
:::

### stoploss_on_exchange 和 stoploss_on_exchange_limit_ratio

启用或禁用交易所止损。
如果止损在 **交易所内**，这意味着在买入订单成交后立即在交易所下达止损限价单。这将保护您免受市场突然崩盘的影响，因为订单执行纯粹在交易所内部发生，没有潜在的网络开销。

如果 `stoploss_on_exchange` 使用限价单，交易所需要两个价格：止损触发价 (stoploss_price) 和限价 (Limit price)。
`stoploss` 定义了放置限价单的触发点 - 而限价应略低于此点。
如果交易所同时支持限价和市价止损订单，则 `stoploss` 的值将用于确定止损类型。

计算示例：我们以 100\$ 买入资产。
触发价为 95\$，则限价将为 `95 * 0.99 = 94.05$` - 因此限价单的成交可以发生在 95\$ 到 94.05\$ 之间。

::: info 手动操作提示
如果启用了 `stoploss_on_exchange` 并且在交易所手动取消了止损订单，机器人将创建一个新的止损订单。
:::

### stoploss_on_exchange_interval

在使用交易所止损的情况下，机器人会以一定的时间间隔检查并更新止损（默认为 60 秒）。机器人无法每 5 秒（每次迭代）执行一次，否则会被交易所禁止。

### stoploss_price_type (仅限期货)

`stoploss_price_type` 仅适用于期货市场。支持的价格类型因交易所而异。可选值为 `"last"`（最新价/合同价）、`"mark"`（标记价格）和 `"index"`（指数价格）。

### emergency_exit (紧急退出)

`emergency_exit` 是一个可选值，默认为 `market` (市价)，当创建交易所止损订单失败时使用。

### 示例配置 (Strategy):

``` python
order_types = {
    "entry": "limit",
    "exit": "limit",
    "emergency_exit": "market",
    "stoploss": "market",
    "stoploss_on_exchange": True,
    "stoploss_on_exchange_interval": 60,
    "stoploss_on_exchange_limit_ratio": 0.99
}
```

## 止损类型 (Stop Loss Types)

机器人支持以下止损模式：

1. **静态止损 (Static stop loss)**。
2. **移动止损 (Trailing stop loss)**。
3. **具有不同正向亏损比例的移动止损**。
4. **仅在达到一定偏移量后才启动的移动止损**。
5. **[自定义止损函数 (Custom stoploss function)](strategy-callbacks.md#custom-stoploss)**。

### 静态止损 (Static Stop Loss)

非常简单，您定义一个止损比例 x。一旦亏损超过定义的比例，机器人将尝试卖出资产。
``` python
    stoploss = -0.10  # -10% 止损
```

### 移动止损 (Trailing Stop Loss)

移动止损将根据资产价格的上涨自动上移止损点。
``` python
    stoploss = -0.10
    trailing_stop = True
```
例如：
* 100\$ 买入，止损 -10% (90\$)。
* 价格涨到 102\$，止损变为 102\$ 的 -10% = 91.8\$。
* 价格跌回 101\$，止损保持在 91.8\$。
止损将始终根据观察到的最高价格调整为 -10%。

### 移动止损：不同的正向亏损比例

您可以设置当处于亏损状态时使用默认止损，而一旦进入盈利状态（或达到定义的偏移量）时，使用不同的止损比例。
``` python
    stoploss = -10
    trailing_stop = True
    trailing_stop_positive = 0.02
    trailing_stop_positive_offset = 0.0
```
一旦价格上涨，将使用 0.02 (-2%) 作为移动止损。

::: tip 使用偏移量锁定利润
使用 `trailing_stop_positive_offset` 确保您的新移动止损在利润丰厚时才触发。将 offset 设置为高于 `trailing_stop_positive` 比率的值。
:::

### 仅在达到一定偏移量后才启动移动止损

您可以保持静态止损，直到达到某个偏移量，然后开始移动止损以在市场反转时获利。
``` python
    stoploss = -0.10
    trailing_stop = True
    trailing_stop_positive = 0.02
    trailing_stop_positive_offset = 0.03
    trailing_only_offset_is_reached = True
```
直到价格上涨 3% 之前，止损都保持在 90\$ 不变。一旦达到 103\$，移动止损就会激活并设置为 100.94\$ (103\$ - 2%)。

## 止损与杠杆 (Stoploss and Leverage)

止损应被视为“该笔交易承担的风险”。当使用杠杆时，同样的原则适用。
**10 倍杠杆下 10% 的止损意味着当价格波动 1% 时就会触发。**
因为 1% 的价格波动在 10 倍杠杆下代表了您自有本金的 10% 亏损。请务必意识到这一点，避免使用太紧的止损。

## 在运行中更改止损

可以通过修改配置或策略并使用 `/reload_config` 命令来更改运行中交易的止损。
**注意：** 如果已启用移动止损且止损点已经上移，则无法再通过此方法更改该笔交易的止损。
