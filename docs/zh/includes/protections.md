
## 保护机制 (Protections)

保护机制通过临时停止单个交易对或所有交易对的交易，保护您的策略免受意外事件和不利市场条件的影响。
所有保护机制的结束时间都会向上取整到下一根 K 线，以避免由于 K 线内突然、意外的买入。

::: tip 使用建议
:::
并非所有保护机制都适用于所有策略，参数需要针对您的策略进行调整以提高性能。

每个保护机制都可以使用不同的参数配置多次，以实现不同级别的保护（短期/长期）。
:::

::: info 回测
:::
回测和超参数优化 (Hyperopt) 支持保护机制，但必须通过使用 `--enable-protections` 标志显式启用。
:::

### 可用的保护机制

* [`StoplossGuard`](#止损卫士-stoploss-guard) 如果在特定时间窗口内发生了特定数量的止损，则停止交易。
* [`MaxDrawdown`](#最大回撤-maxdrawdown) 如果达到最大回撤，则停止交易。
* [`LowProfitPairs`](#低利润交易对-low-profit-pairs) 锁定利润较低的交易对。
* [`CooldownPeriod`](#冷静期-cooldown-period) 在卖出交易后立即不进入新交易。

### 所有保护机制的通用设置

| 参数 | 描述 |
|------------|-------------|
| `method` | 要使用的保护机制名称。<br> **数据类型:** 字符串，从[可用保护机制](#可用的保护机制)中选择。 |
| `stop_duration_candles` | 锁定应设置多少根 K 线？<br> **数据类型:** 正整数（单位：K 线）。 |
| `stop_duration` | 保护机制应锁定多少分钟？<br>不能与 `stop_duration_candles` 同时使用。<br> **数据类型:** 浮点数（单位：分钟）。 |
| `lookback_period_candles` | 仅考虑在过去 `lookback_period_candles` 根 K 线内完成的交易。此设置可能会被某些保护机制忽略。<br> **数据类型:** 正整数（单位：K 线）。 |
| `lookback_period` | 仅考虑在 `current_time - lookback_period` 之后完成的交易。<br>不能与 `lookback_period_candles` 同时使用。<br>此设置可能会被某些保护机制忽略。<br> **数据类型:** 浮点数（单位：分钟）。 |
| `trade_limit` | 所需的最少交易次数（并非所有保护机制都使用）。<br> **数据类型:** 正整数。 |
| `unlock_at` | 定期解锁交易的时间（并非所有保护机制都使用）。<br> **数据类型:** 字符串 <br>**输入格式:** "HH:MM" (24小时制)。 |

::: info 持续时间
:::
持续时间（`stop_duration*` 和 `lookback_period*` 既可以用分钟定义，也可以用 K 线定义）。
为了在测试不同时间框架时获得更大的灵活性，以下所有示例都将使用 "candle"（K 线）定义。
:::

#### 止损卫士 (Stoploss Guard)

`StoplossGuard` 选取 `lookback_period`（分钟或 K 线）内的所有交易。
如果 `trade_limit` 次或更多交易导致止损，交易将停止 `stop_duration`（分钟或 K 线，或者直到 `unlock_at` 设置的时间）。

除非 `only_per_pair` 设置为 true（此时仅一次查看一个交易对），否则这适用于所有交易对。

同样，此保护机制默认会查看所有交易（做多和做空）。对于期货机器人，设置 `only_per_side` 将使机器人仅考虑一个方向，并仅锁定该方向。例如，在一系列多单止损后，允许空单继续运行。

`required_profit` 将确定止损需要考虑的相关利润（或亏损）。通常不应设置此项，默认为 0.0——这意味着所有亏损的止损都将触发锁定。

以下示例在过去 24 根 K 线内发生 4 次止损后，对所有交易对停止交易 4 根 K 线。

``` python
@property
def protections(self):
    return [
        {
            "method": "StoplossGuard",
            "lookback_period_candles": 24,
            "trade_limit": 4,
            "stop_duration_candles": 4,
            "required_profit": 0.0,
            "only_per_pair": False,
            "only_per_side": False
        }
    ]
```

::: info
:::
如果最终利润为负，`StoplossGuard` 会考虑结果为 `"stop_loss"`、`"stoploss_on_exchange"` 和 `"trailing_stop_loss"` 的所有交易。
`trade_limit` 和 `lookback_period` 需要针对您的策略进行调整。
:::

#### 最大回撤 (MaxDrawdown)

`MaxDrawdown` 使用 `lookback_period` 内的所有交易来确定最大回撤。如果回撤低于 `max_allowed_drawdown`（注：通常理解为回撤幅度超过该值，此处原文 below 可能指数值上的负向突破），交易将在最后一次交易后停止 `stop_duration`。这通常是假设机器人需要一些时间让市场恢复。

以下示例在过去 48 根 K 线内、且完成至少 `trade_limit` 次交易的情况下，如果所有资产的最大回撤 > 20%，则停止交易 12 根 K 线。

``` python
@property
def protections(self):
    return  [
        {
            "method": "MaxDrawdown",
            "lookback_period_candles": 48,
            "trade_limit": 20,
            "stop_duration_candles": 12,
            "max_allowed_drawdown": 0.2
        },
    ]
```

#### 低利润交易对 (Low Profit Pairs)

`LowProfitPairs` 使用 `lookback_period` 内某个交易对的所有交易来确定整体利润率。
如果该比率低于 `required_profit`，则该交易对将被锁定 `stop_duration`。

对于期货机器人，设置 `only_per_side` 将使机器人仅考虑其中一个方向。

以下示例中，如果某交易对在过去 6 根 K 线内未达到 2% 的所需利润（且至少进行了 2 次交易），则停止该交易对交易 60 分钟。

``` python
@property
def protections(self):
    return [
        {
            "method": "LowProfitPairs",
            "lookback_period_candles": 6,
            "trade_limit": 2,
            "stop_duration": 60,
            "required_profit": 0.02,
            "only_per_pair": False,
        }
    ]
```

#### 冷静期 (Cooldown Period)

`CooldownPeriod` 在出场后锁定由 `stop_duration` 指定的交易对，避免在该时间段内重新进入该交易对。

以下示例在关闭交易后停止该交易对 2 根 K 线，让该对“冷静下来”。

``` python
@property
def protections(self):
    return  [
        {
            "method": "CooldownPeriod",
            "stop_duration_candles": 2
        }
    ]
```

::: info
:::
此保护机制仅适用于交易对级别，绝不会全局锁定所有对。
此保护机制不考虑 `lookback_period`，因为它只查看最近的一次交易。
:::

### 保护机制的完整示例

所有保护机制都可以随意组合，甚至可以使用不同的参数，为表现不佳的交易对构筑一道递增的防御墙。所有保护机制都按定义顺序进行评估。

以下示例假设时间框架为 1 小时：

* 每个对卖出后锁定额外 5 根 K 线 (`CooldownPeriod`)，给其他对成交的机会。
* 如果过去 2 天 (`48h`) 内进行了 20 次交易导致最大回撤超过 20%，则停止交易 4 小时 (`MaxDrawdown`)。
* 如果 1 天 (`24h`) 内所有交易对发生超过 4 次止损，则停止交易 (`StoplossGuard`)。
* 锁定过去 6 小时内进行了 2 次交易且综合利润率低于 0.02 (<2%) 的所有对 (`LowProfitPairs`)。
* 对于过去 24 小时内进行了至少 4 次交易且利润低于 0.01 (<1%) 的所有对，锁定 2 根 K 线。

``` python
from freqtrade.strategy import IStrategy

class AwesomeStrategy(IStrategy):
    timeframe = '1h'
    
    @property
    def protections(self):
        return [
            {
                "method": "CooldownPeriod",
                "stop_duration_candles": 5
            },
            {
                "method": "MaxDrawdown",
                "lookback_period_candles": 48,
                "trade_limit": 20,
                "stop_duration_candles": 4,
                "max_allowed_drawdown": 0.2
            },
            {
                "method": "StoplossGuard",
                "lookback_period_candles": 24,
                "trade_limit": 4,
                "stop_duration_candles": 2,
                "only_per_pair": False
            },
            {
                "method": "LowProfitPairs",
                "lookback_period_candles": 6,
                "trade_limit": 2,
                "stop_duration_candles": 60,
                "required_profit": 0.02
            },
            {
                "method": "LowProfitPairs",
                "lookback_period_candles": 24,
                "trade_limit": 4,
                "stop_duration_candles": 2,
                "required_profit": 0.01
            }
        ]
    # ...
```
