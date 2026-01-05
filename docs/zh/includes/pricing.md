
## 订单使用的价格 (Prices used for orders)

常规订单的价格可以通过交易进入的 `entry_pricing` 参数结构和交易退出的 `exit_pricing` 参数结构进行控制。
价格总是会在下订单前通过查询交易所行情 (tickes) 或使用订单簿 (orderbook) 数据获取。

::: info
:::
Freqtrade 使用的订单簿数据是通过 ccxt 的 `fetch_order_book()` 函数从交易所获取的，即通常是 L2 聚合订单簿的数据；而行情数据是由 ccxt 的 `fetch_ticker()`/`fetch_tickers()` 函数返回的结构。有关更多详细信息，请参阅 ccxt 库 [文档](https://github.com/ccxt/ccxt/wiki/Manual#market-data)。
:::

::: warning 使用市价订单
:::
使用市价订单时，请阅读 [市价订单定价](#市价订单定价) 章节。
:::

### 入场价格 (Entry price)

#### 入场价格侧 (Enter price side)

配置项 `entry_pricing.price_side` 定义了机器人在买入时查看订单簿的哪一侧。

以下展示了一个订单簿示例：

``` explanation
...
103
102
101  # 卖一价 (ask)
-------------当前点差 (spread)
99   # 买一价 (bid)
98
97
...
```

如果 `entry_pricing.price_side` 设置为 `"bid"`，机器人将使用 99 作为入场价格。
同理，如果设置为 `"ask"`，机器人将使用 101 作为入场价格。

根据交易方向（*看多/看空*），这将导致不同的结果。因此，我们建议在此配置中使用 `"same"`（同侧）或 `"other"`（对侧）。
这将产生如下定价矩阵：

| 方向 | 订单 | 设置 | 价格 | 是否跨越点差 |
|------ |--------|-----|-----|-----|
| 多 (long)  | 买入 | ask   | 101 | 是 |
| 多 (long)  | 买入 | bid   | 99  | 否 |
| 多 (long)  | 买入 | same  | 99  | 否 |
| 多 (long)  | 买入 | other | 101 | 是 |
| 空 (short) | 卖出 | ask   | 101 | 否 |
| 空 (short) | 卖出 | bid   | 99  | 是 |
| 空 (short) | 卖出 | same  | 101 | 否 |
| 空 (short) | 卖出 | other | 99  | 是 |

使用订单簿的对侧通常能保证订单更快成交，但机器人最终支付的费用可能会超过必要水平。
即使使用限价买单，也极有可能会产生吃单费 (Taker fees) 而非挂单费 (Maker fees)。
此外，订单簿中“对侧”的价格高于“同侧”的价格，因此该订单的行为类似于市价订单（但带有最高价格限制）。

#### 启用订单簿时的入场价格

启用订单簿进场时 (`entry_pricing.use_order_book=True`)，Freqtrade 会从订单簿中获取 `entry_pricing.order_book_top` 条目，并使用在配置侧 (`entry_pricing.price_side`) 指定的深度的价格。1 表示订单簿中最顶部的条目，而 2 表示使用第 2 个条目，依此类推。

#### 未启用订单簿时的入场价格

本节使用 `side` 作为配置的 `entry_pricing.price_side`（默认为 `"same"`）。

当不使用订单簿时 (`entry_pricing.use_order_book=False`)，如果行情数据中的最佳 `side` 价格低于上次成交价 `last`，则 Freqtrade 使用该价格。否则（当 `side` 价格高于 `last` 价格时），它将根据 `entry_pricing.price_last_balance` 在 `side` 价格和 `last` 价格之间计算一个值。

`entry_pricing.price_last_balance` 配置参数控制这一行为。`0.0` 将使用 `side` 价格，而 `1.0` 将使用 `last` 价格，中间的值将在两者之间进行插值。

#### 检查市场深度 (Check depth of market)

启用检查市场深度时 (`entry_pricing.check_depth_of_market.enabled=True`)，进场信号将根据订单簿每一侧的深度（所有金额的总和）进行过滤。

订单簿 `bid`（买入）侧的深度随后除以 `ask`（卖出）侧的深度，将结果与 `entry_pricing.check_depth_of_market.bids_to_ask_delta` 参数进行比较。仅当订单簿 delta 大于或等于配置值时，才会执行进场订单。

::: info
:::
delta 值低于 1 意味着 `ask`（卖出）侧深度大于 `bid`（买入）侧深度；而大于 1 则意味着反之（买入侧深度高于卖出侧深度）。
:::

### 出场价格 (Exit price)

#### 出场价格侧 (Exit price side)

配置项 `exit_pricing.price_side` 定义了机器人在退出交易时查看点差的哪一侧。

以下展示了一个订单簿示例：

``` explanation
...
103
102
101  # 卖一价 (ask)
-------------当前点差 (spread)
99   # 买一价 (bid)
98
97
...
```

如果 `exit_pricing.price_side` 设置为 `"ask"`，机器人将使用 101 作为退出价格。
同理，如果设置为 `"bid"`，机器人将使用 99 作为退出价格。

根据交易方向（*看多/看空*），这将导致不同的结果。因此，我们建议在此配置中使用 `"same"` 或 `"other"`。
这将产生如下定价矩阵：

| 方向 | 订单 | 设置 | 价格 | 是否跨越点差 |
|------ |--------|-----|-----|-----|
| 多 (long)  | 卖出 | ask   | 101 | 否 |
| 多 (long)  | 卖出 | bid   | 99  | 是 |
| 多 (long)  | 卖出 | same  | 101 | 否 |
| 多 (long)  | 卖出 | other | 99  | 是 |
| 空 (short) | 买入 | ask   | 101 | 是 |
| 空 (short) | 买入 | bid   | 99  | 否 |
| 空 (short) | 买入 | same  | 99  | 否 |
| 空 (short) | 买入 | other | 101 | 是 |

#### 启用订单簿时的出场价格

启用订单簿出场时 (`exit_pricing.use_order_book=True`)，Freqtrade 会从订单簿配置侧 (`exit_pricing.price_side`) 获取第 `exit_pricing.order_book_top` 个条目作为退出价格。

1 表示订单簿中最顶部的条目，2 表示使用第 2 个条目，以此类推。

#### 未启用订单簿时的出场价格

本节使用 `side` 作为配置的 `exit_pricing.price_side`（默认为 `"ask"`）。

当不使用订单簿时 (`exit_pricing.use_order_book=False`)，如果行情数据中的最佳 `side` 价格高于上次成交价 `last`，则 Freqtrade 使用该价格。否则（当 `side` 价格低于 `last` 价格时），它将根据 `exit_pricing.price_last_balance` 在两者之间计算一个值。

`exit_pricing.price_last_balance` 配置参数控制这一行为。`0.0` 将使用 `side` 价格，而 `1.0` 将使用 `last` 价格。

### 市价订单定价 (Market order pricing)

使用市价订单时，应配置使用订单簿的“正确”一侧，以便进行现实的价格检测。
假设进场和出场都使用市价订单，则必须使用类似于以下的配置：

``` jsonc
  "order_types": {
    "entry": "market",
    "exit": "market"
    // ...
  },
  "entry_pricing": {
    "price_side": "other",
    // ...
  },
  "exit_pricing":{
    "price_side": "other",
    // ...
  },
```

显而易见，如果你只是一侧使用限价单，则可以使用不同的定价组合。
