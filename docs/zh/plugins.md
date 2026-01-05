# 插件 (Plugins)

## 交易对列表与交易对列表处理器 (Pairlists and Pairlist Handlers)

交易对列表处理器（Pairlist Handlers）定义了机器人应该交易的交易对列表（交易对列表）。它们在配置设置的 `pairlists` 部分进行配置。

在您的配置中，您可以使用静态交易对列表（由 [`StaticPairList`](#static-pair-list) 处理器定义）和动态交易对列表（由 [`VolumePairList`](#volume-pair-list) 和 [`PercentChangePairList`](#percent-change-pair-list) 处理器定义）。

此外，[`AgeFilter`](#agefilter)、[`DelistFilter`](#delistfilter)、[`PrecisionFilter`](#precisionfilter)、[`PriceFilter`](#precisionfilter)、[`ShuffleFilter`](#shufflefilter)、[`SpreadFilter`](#spreadfilter) 和 [`VolatilityFilter`](#volatilityfilter) 作为交易对列表过滤器（Pairlist Filters），用于移除某些交易对和/或移动它们在交易对列表中的位置。

如果使用多个交易对列表处理器，它们会被链接起来，所有处理器的组合构成了机器人用于交易和回测的最终交易对列表。交易对列表处理器按它们被配置的顺序执行。您可以将 `StaticPairList`、`VolumePairList`、`ProducerPairList`、`RemotePairList`、`MarketCapPairList` 或 `PercentChangePairList` 定义为起始处理器。

不活跃的市场总是会从生成的交易对列表中移除。明确列入黑名单的交易对（配置设置 `pair_blacklist` 中的交易对）也总是会从生成的交易对列表中移除。

### 交易对黑名单 (Pair blacklist)

交易对黑名单（通过配置中的 `exchange.pair_blacklist` 配置）禁止交易某些交易对。这可以简单到排除 `DOGE/BTC` —— 这将精确移除该交易对。

交易对黑名单还支持通配符（正则风格） —— 因此 `BNB/.*` 将排除所有以 BNB 开头的交易对。您也可以使用类似 `.*DOWN/BTC` 或 `.*UP/BTC` 的值来排除杠杆代币（请检查您交易所的命名约定！）。

### 可用的交易对列表处理器 (Available Pairlist Handlers)

* [`StaticPairList`](#static-pair-list) (默认，如果未另行配置)
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
交易对列表配置可能非常难以正确设置。最好在 [webserver 模式](freq-ui.md#webserver-mode) 下使用 freqUI 或使用 [`test-pairlist`](utils.md#test-pairlist) 实用子命令来快速测试您的交易对列表配置。
:::

#### 静态交易对列表 (Static Pair List)

默认情况下使用 `StaticPairList` 方法，它使用配置中静态定义的交易对白名单。该交易对列表也支持通配符（正则风格） —— 因此 `.*/BTC` 将包含所有以 BTC 作为计价货币的交易对。

它使用来自 `exchange.pair_whitelist` 和 `exchange.pair_blacklist` 的配置。在下面的示例中，这将交易 BTC/USDT 和 ETH/USDT —— 并阻止 BNB/USDT 交易。

这两个 `pair_*list` 参数都支持正则 —— 因此像 `.*/USDT` 这样的值将启用交易所有不在黑名单中的交易对。

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

默认情况下，仅允许当前已启用的交易对。要跳过针对活跃市场的交易对校验，请在 `StaticPairList` 配置中设置 `"allow_inactive": true`。这对于回测已到期的交易对（如季度现货市场）非常有用。

当用于“后续”位置时（例如在 VolumePairList 之后），`'pair_whitelist'` 中的所有交易对都将添加到交易对列表的末尾。

#### 成交量交易对列表 (Volume Pair List)

`VolumePairList` 采用通过交易成交量对交易对进行排序/过滤的方法。它根据 `sort_key`（只能是 `quoteVolume`）选择排名前 `number_assets` 的交易对。

当在非领先位置的交易对列表处理器链中使用时（在 StaticPairList 和其他过滤之后），`VolumePairList` 会考虑之前处理器的输出，并添加其按成交量进行的排序/选择。

当在链的领先位置使用时，`pair_whitelist` 配置设置将被忽略。相反，`VolumePairList` 会从交易所所有具有匹配计价货币的可用市场中选择顶级资产。

`refresh_period` 设置允许定义刷新交易对列表的周期（以秒为单位）。默认为 1800 秒（30 分钟）。`VolumePairList` 的交易对列表缓存（`refresh_period`）仅适用于生成交易对列表。过滤实例（不在列表首位）将不应用任何缓存（除了在高级模式下在 K 线持续期间缓存 K 线），并将始终使用最新数据。

`VolumePairList` 默认基于来自交易所的 ticker 数据，正如 ccxt 库所报告的：

* `quoteVolume` 是过去 24 小时内交易（买入或卖出）的计价（计步）货币金额。

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

您可以使用 `min_value` 定义最小成交量 —— 这将过滤掉在指定时间范围内成交量低于指定值的对。除此之外，您还可以使用 `max_value` 定义最大成交量 —— 这将过滤掉在指定时间范围内成交量高于指定值的对。

##### VolumePairList 高级模式

`VolumePairList` 也可以在高级模式下运行，以在给定的时间范围内根据指定的 K 线大小建立成交量。它利用交易所的历史 K 线数据，构建典型价格（通过 (open+high+low)/3 计算）并将典型价格与每根 K 线的成交量相乘。其总和即为给定范围内的 `quoteVolume`。这允许不同的场景，例如使用具有更大 K 线大小的较长范围以获得更平滑的成交量，或者在使用小 K 线进行短范围时反之。

为了方便起见，可以指定 `lookback_days`，这意味着 1d K 线将用于回看。在下面的示例中，交易对列表将基于过去 7 天生成：

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

::: warning 范围回看与刷新周期
当与 `lookback_days` 和 `lookback_timeframe` 结合使用时，`refresh_period` 不能小于以秒为单位的 K 线大小。因为这将导致对交易所 API 进行不必要的请求。
:::

::: warning 使用回看范围时的性能影响
如果与回看结合用于第一位置，则基于范围的成交量计算可能会耗费时间和资源，因为它会下载所有可交易对的 K 线。因此，强烈建议使用带有 `VolumeFilter` 的标准方法来缩小交易对列表，以便进行进一步的范围成交量计算。
:::

::: tip 不支持的交易所
在某些交易所（如 Gemini），常规 VolumePairList 无法运行，因为 api 本身不提供 24 小时成交量。这可以通过使用 K 线数据构建成交量来解决。要粗略模拟 24 小时成交量，可以使用以下配置。请注意，这些交易对列表每天仅刷新一次。

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

更高阶的方法是可以使用的，通过使用 `lookback_timeframe` 代表 K 线大小，以及 `lookback_period` 指定 K 线数量。此示例将基于 1 小时 K 线的滚动周期（3 天）构建成交量对：

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
`VolumePairList` 不支持回测模式。
:::

#### 涨跌幅交易对列表 (Percent Change Pair List)

`PercentChangePairList` 根据过去 24 小时或作为高级选项一部分定义的任何时间范围内的价格变动百分比对交易对进行过滤和排序。这允许交易者专注于经历过剧烈价格波动（无论是正向还是负向）的资产。

**配置选项**

* `number_assets`: 指定根据 24 小时涨跌百分比选择的顶级资产数量。
* `min_value`: 设置最小涨跌百分比阈值。百分比变动低于此值的交易对将被过滤掉。
* `max_value`: 设置最大涨跌百分比阈值。百分比变动高于此值的交易对将被过滤掉。
* `sort_direction`: 指定交易对根据涨跌百分比排序的顺序。接受两个值：`asc` 代表升序，`desc` 代表降序。
* `refresh_period`: 定义交易对列表刷新的间隔（秒）。默认值为 1800 秒（30 分钟）。
* `lookback_days`: 回看的周期天数。选择 `lookback_days` 时，`lookback_timeframe` 默认为 1d。
* `lookback_timeframe`: 用于回看周期的时间框架。
* `lookback_period`: 回看的周期数量。

当在其他交易对列表处理器之后使用 PercentChangePairList 时，它将对这些处理器的输出执行操作。如果是领先的处理器，它将从具有指定计价货币的所有可用市场中选择交易对。

`PercentChangePairList` 使用来自交易所的 ticker 数据，通过 ccxt 库提供：价格涨跌百分比被计算为过去 24 小时内的价格变动。

::: info 不支持的交易所
在某些交易所（如 HTX），常规 PercentChangePairList 无法运行，因为 api 本身不提供 24 小时价格变动百分比。这可以通过使用 K 线数据计算百分比变动来解决。要粗略模拟 24 小时百分比变动，可以使用以下配置。请注意，这些交易对列表每天仅刷新一次。
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

1. 根据过去 24 小时内最高的变化百分比选择前 15 个交易对。
2. 仅考虑涨跌幅在 -10% 到 50% 之间的交易对。

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

此示例通过使用 `lookback_timeframe` 代表 K 线大小以及 `lookback_period` 指定 K 线数量，基于 1 小时 K 线的滚动周期（3 天）构建涨跌百分比交易对。

价格变化百分比使用以下公式计算，该公式表示当前 K 线收盘价与之前某根 K 线收盘价（由指定的时间框架和回看周期定义）之间的百分比差异：

$$ Percent Change = (\frac{Current Close - Previous Close}{Previous Close}) * 100 $$

::: warning 范围回看与刷新周期
当与 `lookback_days` 和 `lookback_timeframe` 结合使用时，`refresh_period` 不能小于以秒为单位的 K 线大小。因为这将导致对交易所 API 进行不必要的请求。
:::

::: warning 使用回看范围时的性能影响
如果与回看结合用于第一位置，则基于范围的百分比变动计算可能会耗费时间和资源，因为它会下载所有可交易对的 K 线。因此，强烈建议使用 `PercentChangePairList` 的标准方法来缩小交易对列表，以便进行进一步的百分比变动计算。
:::

::: info 回测
`PercentChangePairList` 不支持回测模式。
:::

#### 生产者交易对列表 (ProducerPairList)

使用 `ProducerPairList`，您可以重复使用来自 [生产者](producer-consumer.md) 的交易对列表，而无需在每个消费者上显式定义。

此列表需要启用 [消费者模式](producer-consumer.md) 才能运行。

它会对照当前的交易所配置检查活跃交易对，以避免尝试在无效市场上进行交易。

您可以使用可选参数 `number_assets` 限制列表的长度。使用 `"number_assets"=0` 或省略此键将导致重复使用所有对当前设置有效的生产者对。

```json
"pairlists": [
    {
        "method": "ProducerPairList",
        "number_assets": 5,
        "producer_name": "default",
    }
],
```

::: tip 组合交易对列表
此列表可以与所有其他列表和过滤器组合以进一步减少对数，也可以作为已定义交易对之上的“额外”列表。`ProducerPairList` 也可以连续多次使用，组合来自多个生产者的对。显然，在复杂的此类配置中，生产者可能无法为所有对提供数据，因此策略必须适应这种情况。
:::

#### 远程交易对列表 (RemotePairList)

它允许用户从远程服务器或 freqtrade 目录中本地存储的 json 文件获取交易对列表，从而实现交易对列表的动态更新和自定义。

RemotePairList 在配置定义的 pairlists 部分定义。它使用以下配置选项：

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

可选的 `mode` 选项指定列表应作为 `blacklist`（黑名单）还是 `whitelist`（白名单）使用。默认值为 "whitelist"。

RemotePairList 配置中的可选 `processing_mode` 选项决定如何处理检索到的列表。它可以有两个值："filter"（过滤）或 "append"（追加）。默认值为 "filter"。

在 "filter" 模式下，检索到的列表用作过滤器。包含在最终列表中的仅是同时出现在原始列表和检索到的列表中的交易对。其他资产将被过滤掉。

在 "append" 模式下，检索到的列表将添加到原始列表中。来自两个列表的所有项都包含在最终列表中，不做任何过滤。

`pairlist_url` 选项指定远程服务器的 URL（如果前缀为 file:///，则指定本地文件的路径）。这允许用户使用远程服务器或本地文件作为来源。

如果提供了有效的执行名，`save_to_file` 选项会将处理后的列表以 JSON 格式保存到该文件中。此选项是可选的，默认不保存到文件。

::: tip 多机器人共享列表示例
`save_to_file` 可用于 Bot1 保存列表：

```json
"pairlists": [
    {
        "method": "RemotePairList",
        "mode": "whitelist",
        "pairlist_url": "https://example.com/pairlist",
        "number_assets": 10,
        "refresh_period": 1800,
        "keep_pairlist_on_failure": true,
        "read_timeout": 60,
        "save_to_file": "user_data/filename.json" 
    }
]
```

此保存的列表文件可以由 Bot2 或具有此配置的任何其他机器人加载：

```json
"pairlists": [
    {
        "method": "RemotePairList",
        "mode": "whitelist",
        "pairlist_url": "file:///user_data/filename.json",
        "number_assets": 10,
        "refresh_period": 10,
        "keep_pairlist_on_failure": true,
    }
]
```    
:::

用户负责提供一个返回具有以下结构的 JSON 对象的服务器或本地文件：

```json
{
    "pairs": ["XRP/USDT", "ETH/USDT", "LTC/USDT"],
    "refresh_period": 1800
}
```

`pairs` 属性应包含机器人要使用的交易对列表。`refresh_period` 是可选的，指定缓存刷新前的秒数。

可选的 `keep_pairlist_on_failure` 指定在远程不可达或报错时，是否保留之前接收到的列表。默认值为 true。

可选的 `read_timeout` 指定等待远程响应的最大时长（秒）。默认值为 60。

可选的 `bearer_token` 将包含在请求的 Authorization Header 中。

::: info
如果发生服务器错误，若 `keep_pairlist_on_failure` 设置为 true，则保留最后接收到的列表；若设置为 false，则返回空列表。
:::

#### 市值交易对列表 (MarketCapPairList)

`MarketCapPairList` 利用 CoinGecko 提供的市值排名对比交易对进行排序/过滤。如果使用 `whitelist` (白名单) 模式，返回的列表将根据市值排名进行排序。

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

如果在 `whitelist` 模式下运行，`number_assets` 定义返回列表的最大个数。在 `blacklist` 模式下，此设置将被忽略。

`max_rank` 将决定创建/过滤列表时使用的最大排名。由于并非所有包含在 `max_rank` 前的币种在您首选的市场/计价/交易所组合中都有活跃订单簿，因此部分币种可能会被忽略。使用大于 250 的 `max_rank` 是支持的，但不推荐，因为它会导致多次 API 调用，可能会触发报错。

`refresh_period` 设置定义了刷新市值排名数据的间隔（秒）。默认值为 86,400 秒（1 天）。缓存（`refresh_period`）同样适用于生成列表（首位）和过滤（非首位）。

`mode` 设置决定插件是在 `whitelist` 模式（过滤选入）还是 `blacklist` 模式（过滤排除）。默认状态下，插件处于白名单模式。

`categories` 设置指定从中选择币种的 [coingecko 分类](https://www.coingecko.com/en/categories)。默认值为空列表 `[]`，意味着不应用任何分类过滤。如果选择了不正确的字符串，插件将打印可用分类并报错。分类应为 ID 形式，例如 `layer-1`。您可以传递多个分类，如 `["layer-1", "meme-token"]`。

像 1000PEPE/USDT 或 KPEPE/USDT:USDT 这样的币种会尽力侦测，使用前缀 `1000` 和 `K` 进行识别。

::: warning 分类过多
每个添加的分类都对应一次 API 调用。分类越多，生成列表所需时间越长，可能会触发报错。
:::

::: danger CoinGecko 中的符号重复
CoinGecko 经常有重复符号。Freqtrade 将使用该符号并在交易所进行搜索。如果存在该符号，它将被使用。但 Freqtrade 并不会检查该符号是否正是 CoinGecko 指代的那个。这有时会导致意外结果，尤其是在低成交量币种或模因币分类中。
:::

#### 上市时长过滤器 (AgeFilter)

移除在交易所上市时间短于 `min_days_listed` 天（默认为 `10`）或超过 `max_days_listed` 天（默认为 `None`，意味着无限）的交易对。

当新币上市时，前几天可能会经历巨大的价格下跌和剧烈波动。机器人经常容易在下跌结束前买入。此过滤器允许 freqtrade 忽略上市不足 `min_days_listed` 天或超过 `max_days_listed` 天的币种。

#### 下架过滤器 (DelistFilter)

移除距离现在最长 `max_days_from_now` 天内将下架的交易对（默认为 `0`，这意味着无论距离多远，都将移除所有未来将下架的交易对）。目前此过滤器仅支持以下交易所：

::: info 适用交易所
下架过滤器可用于 Bybit 永续、Bitget 永续和 Binance，其中 Binance 永续将在模拟和实盘中运行，而 Binance 现货受技术原因限制仅可用于实盘运行。
:::

::: warning 回测
`DelistFilter` 不支持回测模式。
:::

#### 满额过滤器 (FullTradesFilter)

当交易槽位已满（且配置中 `max_open_trades` 设置不为 `-1`）时，将白名单缩小到仅包含已在交易中的对。

当满仓时，无需计算其余对的指标（除辅助对 `informative pairs` 外），因为无法开新仓。通过缩小白名单，可以提高计算速度并降低 CPU 占用。当空出槽位后，列表将恢复正常。

当使用多个过滤器时，建议将此过滤器放在首个动态列表下的第二位，这样满仓时，它就不必再为后续过滤下载数据。

::: warning 回测
`FullTradesFilter` 不支持回测模式。
:::

#### 偏移过滤器 (OffsetFilter)

将输入的列表偏移指定的 `offset` 值。例如，可以与 `VolumeFilter` 结合以移除成交量前 X 的资产，或者将较大的列表分配到两个机器人实例中。示例移除前 10 个并将后续 20 个（即原列表第 10-30 项）作为最终列表：

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

::: warning
当用于将列表分到多个机器人时，不保证不会重合，因为每个实例的刷新频率可能略有不同。
:::

::: info
如果偏移量大于列表总长度，将返回空列表。
:::

#### 表现过滤器 (PerformanceFilter)

根据过去的成交表现对列表进行排序：

1. 正向收益表现。
2. 尚未有关闭成交。
3. 负向收益表现。

成交次数被用作打破平局的机制。您可以使用 `minutes` 参数来仅考虑过去 X 分钟的表现（滚动窗口）。不定义或设置为 0 将使用所有时间的历史表现。可选的 `min_profit` (比率，`0.01` 代表 1%) 参数定义了资产被考虑所需的最小利润。在不配合 `minutes` 的情况下使用此项可能导致列表被清空且无法恢复，因此极不推荐。

```json
"pairlists": [
    // ...
    {
        "method": "PerformanceFilter",
        "minutes": 1440,  // 滚动 24 小时
        "min_profit": 0.01  // 最低 1% 利润
    }
],
```

由于它使用过往表现，因此需要一段时间的累计，且建议在数据库中有几百笔成交后使用。

::: warning 回测
`PerformanceFilter` 不支持回测模式。
:::

#### 精度过滤器 (PrecisionFilter)

过滤掉由于价格精度太低而不允许设置止损的低价值币种。如果交易所舍入导致的止损价偏差达到 1% 或更多（即 `rounded(stop_price) <= rounded(stop_price * 0.99)`），该对将被列入黑名单。

::: tip 精度过滤器对于期货交易没有意义
上述规则不适用于做空交易。而对于做多，理论上仓位会先被清算。
:::

::: warning 回测
`PrecisionFilter` 不支持使用多个策略的回测模式。
:::

#### 价格过滤器 (PriceFilter)

`PriceFilter` 允许通过价格过滤资产。目前支持：

* `min_price`
* `max_price`
* `max_value`
* `low_price_ratio`

`low_price_ratio` 设置在 1 个价格单位（pip/点）的变化占总价比例超过该比率时移除该对。

计算示例：SHITCOIN/BTC 最小精度为 8 小数位。如果价格为 0.00000011 —— 上涨一阶为 0.00000012，变化约为 9%。如果您将 `low_price_ratio` 设置为 0.09 (9%)，该对将被排除。

::: warning 低价对
具有高“1 pip 涨跌”比例的低价对很危险，因为它们通常流动性不佳，且止损可能由于价格舍入而出现巨大偏差（例如预想 -5%，实际变成了 -9%）。
:::

#### 随机过滤器 (ShuffleFilter)

对列表进行随机重洗。如果想同等对待所有资产而非让某些资产频繁被选到，可以使用此项。默认每根 K 线重洗一次。如果要在每次循环迭代时重洗，将 `"shuffle_frequency"` 设置为 `"iteration"`。

``` json
    {
        "method": "ShuffleFilter", 
        "shuffle_frequency": "candle",
        "seed": 42
    }
```

::: tip
您可以设置 `seed` (随机数种子) 以获得可重现的结果。此项会自动侦测，且仅在回测模式下应用设定的种子。
:::

#### 价差过滤器 (SpreadFilter)

移除挂单价（Ask）和买单价（Bid）之差超过指定比率 `max_spread_ratio`（默认为 `0.005`）的资产。示例：如果买一价为 0.00000026，卖一价为 0.00000027，比例约为 0.037，大于 0.005，该对将被排除。

#### 波动范围稳定过滤器 (RangeStabilityFilter)

移除过去 `lookback_days` 天内的最低价与最高价之差低于 `min_rate_of_change` 或高于 `max_rate_of_change` 的资产。缓存时间为 `refresh_period`。

示例（过去 10 天波动小于 1% 或大于 99% 则移除）：

```json
"pairlists": [
    {
        "method": "RangeStabilityFilter",
        "lookback_days": 10,
        "min_rate_of_change": 0.01,
        "max_rate_of_change": 0.99,
        "refresh_period": 86400
    }
]
```

#### 波动率过滤器 (VolatilityFilter)

波动率是资产历史变动的程度，通过每日对数收益率的标准差衡量。默认假设呈正态分布。该过滤器移除过去 `lookback_days` 天内平均波动率低于 `min_volatility` 或高于 `max_volatility` 的资产。

示例（过去 10 天波动率不在 0.05-0.50 范围则移除，每 24 小时检查一次）：

```json
"pairlists": [
    {
        "method": "VolatilityFilter",
        "lookback_days": 10,
        "min_volatility": 0.05,
        "max_volatility": 0.50,
        "refresh_period": 86400
    }
]
```

### 综合示例

以下示例将 `BNB/BTC` 列入黑名单，使用 `VolumePairList` 选取前 20，接着使用 `DelistFilter` 过滤下架，`AgeFilter` 移除上市不足 10 天，随后应用 `PrecisionFilter` 和 `PriceFilter`。然后应用 `SpreadFilter` 和 `VolatilityFilter`，最后使用确定的种子进行随机排序。

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

## 保护 (Protections)

保护机制将通过暂时停止某个或所有资产的交易，在市场突发状况下保护您的策略。所有保护截止时间都会向上舍入到下一根 K 线。

::: tip 使用提示
并非所有保护都适用于所有策略。每个保护可以针对不同的级别（短期/长期）进行多次配置。
:::

::: info 回测
保护机制由回测和 hyperopt 支持，但必须显式使用 `--enable-protections` 标志。
:::

### 可用保护 (Available Protections)

* [`StoplossGuard`](#stoploss-guard): 如果一定时间内发生了一定次数的止损，则停止交易。
* [`MaxDrawdown`](#maxdrawdown): 当回撤达到上限时停止。
* [`LowProfitPairs`](#low-profit-pairs): 锁定低利润资产。
* [`CooldownPeriod`](#cooldown-period): 卖出后不要立即买回。

#### 止损保护 (Stoploss Guard)

如果在 `lookback_period` 内发生了 `trade_limit` 次止损，交易将停止 `stop_duration`。
默认分析所有交易对和买卖双方，除非 `only_per_pair` 或 `only_per_side` 被设为真。

示例（24 根 K 线内亏损止损达 4 次，则全球停交易 4 根 K 线）：

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

#### 最大回撤 (MaxDrawdown)

如果回撤超过 `max_allowed_drawdown` 且成交不少于 `trade_limit` 次，则停止交易。

#### 低利润交易对 (Low Profit Pairs)

如果某资产利润率低于 `required_profit` 且不少于 `trade_limit` 次，则锁定。

#### 冷却期 (Cooldown Period)

平仓后将资产锁定 `stop_duration`，常用于防止立即再买入（追涨杀跌或其他算法循环）。

### 综合示例

``` python
from freqtrade.strategy import IStrategy

class AwesomeStrategy(IStrategy)
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
            }
        ]
```
