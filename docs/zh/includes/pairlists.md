
## 交易对列表与处理器 (Pairlists and Pairlist Handlers)

交易对列表处理器 (Pairlist Handlers) 定义了机器人应该交易的交易对列表 (pairlist)。它们在配置文件的 `pairlists` 部分进行配置。

在配置中，您可以使用静态交易对列表（由 [`StaticPairList`](#static-pair-list) 处理器定义）和动态交易对列表（由 [`VolumePairList`](#volume-pair-list) 和 [`PercentChangePairList`](#percent-change-pair-list) 处理器定义）。

此外，[`AgeFilter`](#agefilter)、[`DelistFilter`](#delistfilter)、[`PrecisionFilter`](#precisionfilter)、[`PriceFilter`](#pricefilter)、[`ShuffleFilter`](#shufflefilter)、[`SpreadFilter`](#spreadfilter) 和 [`VolatilityFilter`](#volatilityfilter) 作为交易对列表过滤器 (Pairlist Filters)，用于删除某些交易对和/或调整它们在列表中的位置。

如果使用了多个交易对列表处理器，它们会形成链式结构，所有处理器的组合构成了机器人用于交易和回测的最终交易对列表。处理器按配置顺序执行。您可以定义 `StaticPairList`、`VolumePairList`、`ProducerPairList`、`RemotePairList`、`MarketCapPairList` 或 `PercentChangePairList` 作为起始处理器。

非活跃市场总是会从最终列表中移除。明确被列入黑名单的交易对（配置中的 `pair_blacklist` 设置）也总是会从最终列表中移除。

### 交易对黑名单 (Pair blacklist)

交易对黑名单（通过配置中的 `exchange.pair_blacklist` 配置）禁止交易某些对。
它可以像排除 `DOGE/BTC` 这样简单——这将精确删除该交易对。

交易对黑名单还支持通配符（正则风格）——因此 `BNB/.*` 将排除所有以 BNB 开头的交易对。
您也可以使用类似 `.*DOWN/BTC` 或 `.*UP/BTC` 的正则来排除杠杆代币（请检查您所用交易所的交易对命名约定！）。

### 可用的交易对列表处理器

* [`StaticPairList`](#static-pair-list) (默认，若未另行配置)
* [`VolumePairList`](#volume-pair-list)
* [`PercentChangePairList`](#percent-change-pair-list)
* [`ProducerPairList`](#producerpairlist)
* [`RemotePairList`](#remotepairlist)
* [`MarketCapPairList`](#marketcappairlist)
* [`AgeFilter`](#agefilter)
* [`DelistFilter`](#delistfilter)
* [`FullTradesFilter`](#fulltradesfilter)
* [`OffsetFilter`](#offsetfilter)
* [`PerformanceFilter`](#performancefilter)
* [`PrecisionFilter`](#precisionfilter)
* [`PriceFilter`](#pricefilter)
* [`ShuffleFilter`](#shufflefilter)
* [`SpreadFilter`](#spreadfilter)
* [`RangeStabilityFilter`](#rangestabilityfilter)
* [`VolatilityFilter`](#volatilityfilter)

::: tip 测试交易对列表
:::
交易对列表的配置可能相当微妙。建议使用 FreqUI 的 [Web 服务器模式](freq-ui.md#webserver-mode) 或 [`test-pairlist`](utils.md#test-pairlist) 工具子命令来快速测试您的配置。
:::

#### 静态交易对列表 (Static Pair List)

默认情况下使用 `StaticPairList` 方法，它使用配置文件中定义的静态对白名单。该列表也支持通配符（正则风格）——例如 `.*/BTC` 将包含所有以 BTC 作为本币 (stake) 的交易对。

它使用 `exchange.pair_whitelist` 和 `exchange.pair_blacklist` 的配置。在下面的示例中，它将交易 BTC/USDT 和 ETH/USDT，并禁止 BNB/USDT 的交易。

两个 `pair_*list` 参数都支持正则——因此像 `.*/USDT` 这样的值将允许交易所有不在黑名单中的对。

```json
"exchange": {
    "name": "...",
    // ... 
    "pair_whitelist": [
        "BTC/USDT",
        "ETH/USDT",
        // ...
    ],
    "pair_blacklist": [
        "BNB/USDT",
        // ...
    ]
},
"pairlists": [
    {"method": "StaticPairList"}
],
```

默认情况下，仅允许当前已启用的交易对。
如需跳过对活跃市场的验证，请在 `StaticPairList` 配置中设置 `"allow_inactive": true`。
这对于回测已过期的交易对（如季度现货市场）非常有用。

当作为“后续”处理器（例如在 VolumePairlist 之后）使用时，`'pair_whitelist'` 中的所有对将被添加到列表的末尾。

#### 成交量交易对列表 (Volume Pair List)

`VolumePairList` 根据交易量对交易对进行排序/过滤。它根据 `sort_key`（目前仅支持 `quoteVolume`）选择交易量排名前 `number_assets` 的资产。

当在处理器链中作为非起始位置（在 StaticPairList 或其他过滤器之后）使用时，`VolumePairList` 会考虑前一个处理器的输出，并在此基础上按交易量进行排序/选择。

当处于链条的起始位置时，`pair_whitelist` 配置将被忽略。相反，`VolumePairList` 会从交易所中所有具有匹配本币 (stake-currency) 的可用市场中选择顶级资产。

`refresh_period` 设置定义了刷新列表的时间间隔（以秒为单位）。默认为 1800s (30 分钟)。
`VolumePairList` 的缓存 (`refresh_period`) 仅适用于生成列表的阶段。
作为过滤实例（即不在列表第一位）时不会应用任何缓存（在高级模式下缓存 K 线除外），并且总是使用最新数据。

`VolumePairList` 默认基于 ccxt 库报告的交易所行情 (ticker) 数据：

* `quoteVolume` 是过去 24 小时内交易（买入或卖出）的本币（计价货币）金额。

```json
"pairlists": [
    {
        "method": "VolumePairList",
        "number_assets": 20,
        "sort_key": "quoteVolume",
        "min_value": 0,
        "max_value": 8000000,
        "refresh_period": 1800
    }
],
```

您可以通过 `min_value` 定义最小成交量——这将过滤掉在指定时间范围内成交量低于该值的对。
此外，您还可以通过 `max_value` 定义最大成交量——这将过滤掉成交量高于该值的对。

##### VolumePairList 高级模式

`VolumePairList` 还可以运行在高级模式下，在指定 K 线大小的时间范围内构建成交量。它利用交易所的历史 K 线数据，计算典型价格（即 (开盘+最高+最低)/3），并将其与每根 K 线的成交量相乘。其总和即为该范围内的 `quoteVolume`。这允许不同的场景，例如使用较长时间范围和大 K 线尺寸来获得更平滑的成交量，或者反之，使用短范围和小 K 线。

为了方便起见，可以指定 `lookback_days`，这将意味着使用 1d K 线进行追溯。在下面的示例中，将基于过去 7 天的数据创建列表：

```json
"pairlists": [
    {
        "method": "VolumePairList",
        "number_assets": 20,
        "sort_key": "quoteVolume",
        "min_value": 0,
        "refresh_period": 86400,
        "lookback_days": 7
    }
],
```

::: warning 追溯范围与刷新周期
:::
当与 `lookback_days` 和 `lookback_timeframe` 结合使用时，`refresh_period` 不能小于以秒为单位的 K 线尺寸。否则会导致对交易所 API 的不必要请求。
:::

::: warning 使用追溯范围的性能影响
:::
如果作为第一个位置并结合追溯使用，基于范围的成交量计算可能会消耗大量时间和资源，因为它会下载所有可交易对的 K 线。因此强烈建议先使用标准的 `VolumeFilter`（即基于 ticker 的）初步筛选列表，然后再进行进一步的范围成交量计算。
:::

::: tip 不支持的交易所
:::
在某些交易所（如 Gemini），常规的 `VolumePairList` 无法工作，因为其 API 不原生提供 24h 成交量。这可以通过使用 K 线数据构建成交量来解决。
要大致模拟 24h 成交量，您可以使用以下配置。请注意，这些列表每天仅刷新一次。

```json
"pairlists": [
    {
        "method": "VolumePairList",
        "number_assets": 20,
        "sort_key": "quoteVolume",
        "min_value": 0,
        "refresh_period": 86400,
        "lookback_days": 1
    }
],
```
:::

可以使用更复杂的方法，通过 `lookback_timeframe` 指定 K 线尺寸，并通过 `lookback_period` 指定 K 线数量。以下示例将基于 3 天的 1h K 线滚动周期构建列表：

```json
"pairlists": [
    {
        "method": "VolumePairList",
        "number_assets": 20,
        "sort_key": "quoteVolume",
        "min_value": 0,
        "refresh_period": 3600,
        "lookback_timeframe": "1h",
        "lookback_period": 72
    }
],
```

::: info
:::
`VolumePairList` 不支持回测模式。
:::

#### 涨跌幅交易对列表 (Percent Change Pair List)

`PercentChangePairList` 根据资产在过去 24 小时或高级选项中定义的任何时间范围内的价格涨跌幅进行过滤和排序。这使交易者能够专注于经历了显著价格波动（无论是上涨还是下跌）的资产。

**配置选项**

* `number_assets`: 指定基于 24 小时涨跌幅选择的顶部资产数量。
* `min_value`: 设置最小涨跌幅阈值。涨跌幅低于此值的资产将被过滤掉。
* `max_value`: 设置最大涨跌幅阈值。涨跌幅高于此值的资产将被过滤掉。
* `sort_direction`: 指定基于涨跌幅排序的方向。接受两个值：`asc` 代表升序，`desc` 代表降序。
* `refresh_period`: 定义刷新列表的时间间隔（以秒为单位）。默认为 1800s (30 分钟)。
* `lookback_days`: 追溯的天数。如果选择了 `lookback_days`，`lookback_timeframe` 默认设为 1 天。
* `lookback_timeframe`: 用于追溯周期的时间框架。
* `lookback_period`: 追溯的周期数量。

当 `PercentChangePairList` 在其他处理器之后使用时，它将对前置处理器的输出进行操作。如果作为起始处理器，它将从所有具有指定本币的可用市场中选择。

`PercentChangePairList` 默认基于 ccxt 库报告的交易所行情 (ticker) 数据：
涨跌幅计算为过去 24 小时内的价格变化。

::: info 不支持的交易所
:::
在某些交易所（如 HTX），常规的 `PercentChangePairList` 无法工作，因为其 API 不原生提供 24 小时价格变动百分比。这可以通过使用 K 线数据计算来解决。要大致模拟 24 小时涨跌幅，您可以使用以下配置。请注意，这些列表每天仅刷新一次。
```json
"pairlists": [
    {
        "method": "PercentChangePairList",
        "number_assets": 20,
        "min_value": 0,
        "refresh_period": 86400,
        "lookback_days": 1
    }
],
```
:::

**从 Ticker 读取的配置示例**

```json
"pairlists": [
    {
        "method": "PercentChangePairList",
        "number_assets": 15,
        "min_value": -10,
        "max_value": 50
    }
],
```

在此配置中：

1. 根据过去 24 小时最高的价格涨跌幅选择前 15 个交易对。
2. 仅考虑涨跌幅在 -10% 到 50% 之间的资产。

**从 K 线读取的配置示例**

```json
"pairlists": [
    {
        "method": "PercentChangePairList",
        "number_assets": 15,
        "sort_key": "percentage",
        "min_value": 0,
        "refresh_period": 3600,
        "lookback_timeframe": "1h",
        "lookback_period": 72
    }
],
```

此示例通过使用 `lookback_timeframe` 定义 K 线大小以及 `lookback_period` 定义 K 线数量，基于 3 天的 1h K 线滚动周期构建列表。

价格涨跌幅按以下公式计算，表达了当前 K 线收盘价与追溯周期前 K 线收盘价之间的百分比差异：

$$ 涨跌幅 = (\frac{当前收盘价 - 之前收盘价}{之前收盘价}) * 100 $$

::: warning 追溯范围与刷新周期
:::
当与 `lookback_days` 和 `lookback_timeframe` 结合使用时，`refresh_period` 不能小于以秒为单位的 K 线尺寸。
:::

::: warning 使用追溯范围的性能影响
:::
如果作为起始处理器并结合追溯使用，计算过程可能非常耗时，因为它需要下载所有对的 K 线。因此建议先使用标准方法缩减列表规模。
:::

::: info Backtesting
:::
`PercentChangePairList` 不支持回测模式。
:::

#### 生产者交易对列表 (ProducerPairList)

使用 `ProducerPairList`，您可以复用来自 [生产者 (Producer)](producer-consumer.md) 的列表，而无需在每个消费者上显式定义。

必须启用 [消费者模式 (Consumer mode)](producer-consumer.md) 才能使用此功能。

该列表会对活跃交易对进行检查，以确保不在无效市场上进行交易。

您可以使用可选参数 `number_assets` 限制列表长度。使用 `"number_assets"=0` 或省略此项将复用该生产者下所有适用于当前设置的有效对。

```json
"pairlists": [
    {
        "method": "ProducerPairList",
        "number_assets": 5,
        "producer_name": "default",
    }
],
```

::: tip 组合列表
:::
此处理器可以与所有其他列表和过滤器结合使用，甚至可以在已定义的列表之上作为“额外”的列表。`ProducerPairList` 也可以连续使用多次，以结合来自多个生产者的对。
:::

#### 远程交易对列表 (RemotePairList)

它允许用户从远程服务器或 freqtrade 目录中的本地 JSON 文件获取列表，从而实现交易对列表的动态更新。

`RemotePairList` 在配置中按如下方式定义：

```json
"pairlists": [
    {
        "method": "RemotePairList",
        "mode": "whitelist",
        "processing_mode": "filter",
        "pairlist_url": "https://example.com/pairlist",
        "number_assets": 10,
        "refresh_period": 1800,
        "keep_pairlist_on_failure": true,
        "read_timeout": 60,
        "bearer_token": "my-bearer-token",
        "save_to_file": "user_data/filename.json" 
    }
]
```

可选的 `mode` 指定是作为 `blacklist`（黑名单）还是 `whitelist`（白名单）使用。默认为 "whitelist"。

可选的 `processing_mode` 决定如何处理获取到的列表。可以是 "filter"（过滤）或 "append"（追加）。默认为 "filter"。

在 "filter" 模式下，获取的列表用作过滤器。只有同时存在于原始列表和远程列表中的对才会被保留。

在 "append" 模式下，远程列表会被添加到原始列表之后，不进行任何过滤。

`pairlist_url` 指定远程服务器的 URL 或本地文件的路径（如果以 `file:///` 开头）。

`save_to_file` 如果提供一个有效的文件名，则会将处理后的列表保存到该 JSON 文件中。

::: tip 共享列表的多个机器人示例
:::
可以使用 `save_to_file` 通过机器人 1 保存列表：

```json
"pairlists": [
    {
        "method": "RemotePairList",
        "mode": "whitelist",
        "pairlist_url": "https://example.com/pairlist",
        // ... 其他配置
        "save_to_file": "user_data/filename.json" 
    }
]
```

保存后的文件可以被机器人 2 或任何其他机器人通过 `file:///` 协议加载。
:::

用户负责提供一个返回如下结构的 JSON 对象：

```json
{
    "pairs": ["XRP/USDT", "ETH/USDT", "LTC/USDT"],
    "refresh_period": 1800
}
```

`refresh_period` 属性是可选的，指定列表在刷新前应缓存的秒数。

`keep_pairlist_on_failure` 指定如果远程服务器不可达，是否应保留上一次接收到的列表。默认为 true。

`bearer_token` 将包含在请求的 Authorization Header 中。

#### 市值交易对列表 (MarketCapPairList)

`MarketCapPairList` 基于 CoinGecko 的市值排名对交易对进行排序/过滤。如果在白名单模式下使用，返回的列表将按市值排名排序。

```json
"pairlists": [
    {
        "method": "MarketCapPairList",
        "number_assets": 20,
        "max_rank": 50,
        "refresh_period": 86400,
        "mode": "whitelist",
        "categories": ["layer-1"]
    }
]
```

`number_assets` 定义返回的最大对数。在黑名单模式下此设置无效。

`max_rank` 将决定用于过滤的最大市值排名。注意，并非前 `max_rank` 名中的所有代币都会包含在内，因为某些代币在您选择的交易所/本币对下可能没有活跃交易对。不建议设置超过 250 的 `max_rank`。

`refresh_period` 定义市值排名数据的刷新间隔。默认 1 天 (86,400 秒)。

`categories` 设置指定从中选择硬币的 [CoinGecko 类别](https://www.coingecko.com/en/categories)。默认为空列表 `[]`。

::: warning 类别过多
:::
每个添加的类别对应一次对 CoinGecko 的 API 调用。添加的类别越多，生成列表所需的时间就越长，且容易触及速率限制。
:::

::: danger CoinGecko 符号重复
:::
CoinGecko 经常会有符号重复的情况。Freqtrade 将直接使用符号并在交易所尝试搜索。这偶尔可能导致意外结果，尤其是低成交量代币。
:::

#### 币龄过滤器 (AgeFilter)

移除在交易所上市时间少于 `min_days_listed` 天（默认为 `10`）或多于 `max_days_listed` 天（默认 `None` 即无限）的对。

新上市的代币在最初几天往往处于价格发现阶段，可能遭受剧烈下跌或高波动性。该过滤器允许机器人跳过这些不稳定时期。

#### 下架过滤器 (DelistFilter)

移除将在 `max_days_from_now` 天内下架的交易对（默认为 `0`，即移除所有未来将下架的对）。目前仅支持以下交易所：

::: info 可用的交易所
:::
Delist 过滤器目前可用于 Bybit Futures、Bitget Futures 和 币安。其中币安期货同时支持模拟和实盘，而币安现货出于技术原因仅限于实盘模式。
:::

::: warning 回测
:::
`DelistFilter` 不支持回测模式。
:::

#### 满仓过滤器 (FullTradesFilter)

当交易仓位满时（即 `max_open_trades` 已满），将白名单缩小为仅包含当前正在交易的对。

这可以提高计算速度并降低 CPU 占用，因为无需为那些无法开仓的代币计算指标。当有仓位释放时，列表会自动恢复正常。

建议将此过滤器放在第二位（紧随主列表之后），以便在满仓时跳过后续所有过滤器的计算。

::: warning 回测
:::
`FullTradesFilter` 不支持回测模式。
:::

#### 偏移过滤器 (OffsetFilter)

按给定的 `offset`（偏移量）对输入的列表进行位移。

例如，可以结合 `VolumeFilter` 移除成交量排名前 X 的对，或者将一个大列表分给两个机器人实例。

以下示例将移除前 10 个对，并获取接下来的 20 个（即第 10-30 个）：

```json
"pairlists": [
    // ...
    {
        "method": "OffsetFilter",
        "offset": 10,
        "number_assets": 20
    }
],
```

#### 历史表现过滤器 (PerformanceFilter)

根据过去的交易表现对交易对进行排序，顺序如下：

1. 表现积极。
2. 尚未有关闭的交易。
3. 表现消极。

交易次数用作平局打破者。

使用 `minutes` 参数可以仅考虑过去 X 分钟的表现（滚动窗口）。未定义或设为 0 则使用全量表现数据。

`min_profit` 指定考虑该交易对所需的最小利润率（如 `0.01` 代表 1%）。低于此水平的对将被过滤掉。

::: warning 回测
:::
`PerformanceFilter` 不支持回测模式。
:::

#### 精度过滤器 (PrecisionFilter)

过滤掉由于精度问题无法设置止损的低价币。

即，如果交易所的舍入可能导致止损价产生 1% 或更多的偏差（即 `rounded(stop_price) <= rounded(stop_price * 0.99)`），则将其加入黑名单。

#### 价格过滤器 (PriceFilter)

支持以下价格过滤选项：

* `min_price`: 价格下限。
* `max_price`: 价格上限。
* `max_value`: 最小价格变动额上限。
* `low_price_ratio`: 1 pip（最小价格单位）相对于价格的比例上限。

计算示例：
假设 SHITCOIN/BTC 价格精度为 8 位。如果价格为 0.00000011，则上涨一个单位后的价格为 0.00000012，上涨了约 9%。您可以使用 `low_price_ratio` 设置为 0.09 来将其过滤。

::: warning 低价币
:::
高“pip 变动”的低价币是危险的，因为它们流动性通常较差，且难以设置理想的止损。由于价格必须舍入到下一个可交易单位，原本设想 -5% 的止损可能因精度问题变成 -9%。
:::

#### 随机过滤器 (ShuffleFilter)

对列表进行随机洗牌。这可以防止机器人在处理顺序靠前的对时频率高于靠后的对，从而确保所有对享有相同的优先级。

默认每根 K 线洗牌一次。设置 `"shuffle_frequency": "iteration"` 则每次迭代都洗牌。

#### 价差过滤器 (SpreadFilter)

移除买卖价差（买一价与卖一价之差）超过指定比例 `max_spread_ratio`（默认 `0.005`，即 0.5%）的对。

#### 波动稳定性过滤器 (RangeStabilityFilter)

移除在 `lookback_days` 天内，最低价与最高价之间的差异率低于 `min_rate_of_change` 或高于 `max_rate_of_change` 的对。

这可用于自动剔除收益极其困难的稳定币（波动范围过小），或剔除波动异常巨大的崩盘/暴涨币。

#### 波动率过滤器 (VolatilityFilter)

波动率是资产历史变动程度的量度。该过滤器移除在 `lookback_days` 天内的平均波动率不在 `min_volatility` 到 `max_volatility` 范围内的资产。

### 交易对列表处理器完整示例

以下示例黑名单了 `BNB/BTC`，使用 `VolumePairList` 挑选 20 个顶尖资产，然后依次应用下架过滤器、币龄过滤器、精度过滤器、价格过滤器、价差过滤器、稳定性过滤器和波动率过滤器，最后进行随机洗牌。

```json
"exchange": {
    "pair_whitelist": [],
    "pair_blacklist": ["BNB/BTC"]
},
"pairlists": [
    {
        "method": "VolumePairList",
        "number_assets": 20,
        "sort_key": "quoteVolume"
    },
    {
        "method": "DelistFilter",
        "max_days_from_now": 0,
    },
    {"method": "AgeFilter", "min_days_listed": 10},
    {"method": "PrecisionFilter"},
    {"method": "PriceFilter", "low_price_ratio": 0.01},
    {"method": "SpreadFilter", "max_spread_ratio": 0.005},
    {
        "method": "RangeStabilityFilter",
        "lookback_days": 10,
        "min_rate_of_change": 0.01,
        "refresh_period": 86400
    },
    {
        "method": "VolatilityFilter",
        "lookback_days": 10,
        "min_volatility": 0.05,
        "max_volatility": 0.50,
        "refresh_period": 86400
    },
    {"method": "ShuffleFilter", "seed": 42}
],
```
