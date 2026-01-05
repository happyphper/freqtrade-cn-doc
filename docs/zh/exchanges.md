
# 交易所特定说明

本页总结了交易所特定的常见问题和信息。

## 支持的交易所功能概览

| 交易所 | 模式 | 保证金模式 | 止损类型 | 
|---------|---------|------|------------------|
| [Binance](exchanges.md#binance) | 现货 (spot) | | 限价 (limit) |
| [Binance](exchanges.md#binance) | 期货 (futures) | 逐仓 (isolated), 全仓 (cross) | 市价 (market), 限价 (limit) |
| [Bingx](exchanges.md#bingx) | 现货 (spot) | | 市价 (market), 限价 (limit) |
| [Bitmart](exchanges.md#bitmart) | 现货 (spot) | | ❌ (不支持) |
| [Bitget](exchanges.md#bitget) | 现货 (spot) | | 市价 (market), 限价 (limit) |
| [Bitget](exchanges.md#bitget) | 期货 (futures) | 逐仓 (isolated) | 市价 (market), 限价 (limit) |
| [Bybit](exchanges.md#bybit) | 现货 (spot) | | ❌ (不支持) |
| [Bybit](exchanges.md#bybit) | 期货 (futures) | 逐仓 (isolated) | 市价 (market), 限价 (limit) |
| [Gate.io](exchanges.md#gateio) | 现货 (spot) | | 限价 (limit) |
| [Gate.io](exchanges.md#gateio) | 期货 (futures) | 逐仓 (isolated) | 限价 (limit) |
| [HTX](exchanges.md#htx) | 现货 (spot) | | 限价 (limit) |
| [Hyperliquid](exchanges.md#hyperliquid) | 现货 (spot) | | ❌ (不支持) |
| [Hyperliquid](exchanges.md#hyperliquid) | 期货 (futures) | 逐仓 (isolated), 全仓 (cross) | 限价 (limit) |
| [Kraken](exchanges.md#kraken) | 现货 (spot) | | 市价 (market), 限价 (limit) |
| [OKX](exchanges.md#okx) | 现货 (spot) | | 限价 (limit) |
| [OKX](exchanges.md#okx) | 期货 (futures) | 逐仓 (isolated) | 限价 (limit) |
| [Bitvavo](exchanges.md#bitvavo) | 现货 (spot) | | ❌ (不支持) |
| [Kucoin](exchanges.md#kucoin) | 现货 (spot) | | 市价 (market), 限价 (limit) |

## 交易所配置

Freqtrade 基于 [CCXT 库](https://github.com/ccxt/ccxt)，该库支持 100 多个加密货币交易所和交易 API。完整的最新列表可以在 [CCXT 仓库主页](https://github.com/ccxt/ccxt/tree/master/python) 找到。
然而，开发团队仅对少数几个交易所进行了测试。这些交易所的当前列表可以在本文档的“主页”部分找到。

您可以随意测试其他交易所，并提交您的反馈或 PR 以改进机器人或确认交易所是否完美运行。

某些交易所需要特殊配置，如下所示。

### 交易所配置示例

“binance”的交易所配置如下所示：

```json
"exchange": {
    "name": "binance",
    "key": "your_exchange_key",
    "secret": "your_exchange_secret",
    "ccxt_config": {},
    "ccxt_async_config": {},
    // ... 
```

### 设置频率限制 (Rate limits)

通常，CCXT 设置的频率限制是可靠且运行良好的。
如果出现与频率限制相关的错误（通常在日志中显示为 DDOS 异常），可以按照如下方式更改 `rateLimit` 设置：

```json
"exchange": {
    "name": "kraken",
    "key": "your_exchange_key",
    "secret": "your_exchange_secret",
    "ccxt_config": {"enableRateLimit": true},
    "ccxt_async_config": {
        "enableRateLimit": true,
        "rateLimit": 3100
    },
```

此配置启用了 kraken 以及频率限制，以避免被交易所封禁。
`"rateLimit": 3100` 定义了两次调用之间的 3.1 秒等待。通过将 `"enableRateLimit"` 设置为 false，也可以完全禁用此功能。

::: info
频率限制的最佳设置取决于交易所和白名单的大小，因此理想参数会随各处设置而变化。我们尽可能为每个交易所提供合理的默认值。如果您遇到封禁，请确保启用了 `"enableRateLimit"` 并逐步增加 `"rateLimit"` 参数。
:::

## Binance (币安)

::: warning 服务器位置和地理 IP 限制
请注意，Binance 会根据服务器所在国家限制 API 访问。目前拦截的国家包括（不限于）加拿大、马来西亚、荷兰和美国。请前往 [Binance 条款 > b. 资格资格](https://www.binance.com/en/terms) 查看最新列表。
:::

Binance 支持 [time_in_force](configuration.md#理解-order_time_in_force)。

::: tip 交易所端止损
Binance 支持 `stoploss_on_exchange` 并使用 `stop-loss-limit` 订单。它具有巨大的优势，因此我们建议通过启用交易所止损来从中受益。
在期货市场，Binance 同时支持 `stop-limit` 和 `stop-market` 订单。您可以在 `order_types.stoploss` 配置中使用 `"limit"` 或 `"market"` 来决定使用哪种类型。
:::

### Binance 黑名单建议

对于 Binance，建议将 `"BNB/<STAKE>"` 加入黑名单，除非您愿意在账户中保留足够的额外 `BNB` 或愿意禁用使用 `BNB` 抵扣手续费的功能。
Binance 账户可以使用 `BNB` 支付手续费。如果某次交易恰好是 `BNB`，后续交易可能会消耗该头寸，导致初始 BNB 交易因余额不足而无法卖出。

如果没有足够的 `BNB` 来支付交易手续费，则手续费将不被 `BNB` 覆盖，也不会发生手续费减免。Freqtrade 永远不会为了支付手续费而买入 BNB，需要手动购买和监控。

### Binance 站点

Binance 分为两个站点，用户必须使用正确的 CCXT 交易所 ID，否则 API 密钥将不被识别：

* [binance.com](https://www.binance.com/) - 国际用户。使用交易所 ID: `binance`。
* [binance.us](https://www.binance.us/) - 美国用户。使用交易所 ID: `binanceus`。

### Binance RSA 密钥

Freqtrade 支持 Binance RSA API 密钥。我们建议将其作为环境变量使用：

``` bash
export FREQTRADE__EXCHANGE__SECRET="$(cat ./rsa_binance.private)"
```

也可以通过配置文件配置。由于 JSON 不支持多行字符串，您必须将所有换行符替换为 `\n`。

### Binance Futures (币安期货)

Binance 拥有特定的（且相当复杂的）[期货交易量化规则](https://www.binance.com/en/support/faq/4f462ebe6ff445d4a170be7d9e897272)，这些规则必须遵守，例如禁止对过多订单使用过低的投入金额。违反这些规则将导致交易限制。

在币安期货市场交易时，必须使用订单簿，因为期货没有价格行情 (Ticker) 数据。

``` jsonc
  "entry_pricing": {
      "use_order_book": true,
      "order_book_top": 1,
      // ...
  },
```

#### 币安逐仓期货设置

用户必须将期货设置中的“持仓模式”设为“单向模式”，“资产模式”设为“单资产模式”。Freqtrade 会在启动时检查这些设置，如果不正确则报错。

![Binance 期货设置](./assets/binance_futures_settings.png)

#### 币安 BNFCR 期货

BNFCR 模式是币安的一种特殊期货模式，用以绕过欧洲的监管问题。要使用它，配置如下：

``` jsonc
{
    "trading_mode": "futures",
    "margin_mode": "cross",
    "proxy_coin": "BNFCR",
    "stake_currency": "USDT" // 或 "USDC"
}
```

## BingX

BingX 支持 GTC, IOC 和 PO 订单。

::: tip 交易所端止损
BingX 支持 `stoploss_on_exchange`，可以使用 stop-limit 和 stop-market。
:::

## Kraken (海妖)

Kraken 支持 GTC, IOC 和 PO 订单。

::: tip 交易所端止损
Kraken 支持 `stoploss_on_exchange`，可以使用 stop-loss-market 和 stop-loss-limit 订单。
:::

### Kraken 历史数据

Kraken API 仅提供 720 条历史 K 线，对于回测来说不够。必须使用 `--dl-trades` 强制下载逐笔交易数据，否则无法获得足够数据。
为了加快速度，您可以从 Kraken 提供的 [下载中心](https://support.kraken.com/hc/en-us/articles/360047543791-Downloadable-historical-market-data-time-and-sales-) 获取历史 csv 并放置在 `user_data/data/kraken/trades_csv` 下，然后使用 `freqtrade convert-trade-data` 进行转换。

::: warning 频率限制调节
注意：`rateLimit` 配置条目保存的是请求之间的毫秒延迟。为了缓解报错，应增加此值而非减小。
:::

## Kucoin (库币)

Kucoin 为每个 API 密钥都需要一个 Passphrase（口令）：

```json
"exchange": {
    "name": "kucoin",
    "password": "your_exchange_api_key_password",
}
```

::: tip 交易所端止损
Kucoin 支持 `stoploss_on_exchange`，可选用市价或限价止损。
:::

### Kucoin 黑名单

建议将 `"KCS/<STAKE>"` 加入黑名单，机制类似于币安的 BNB 抵扣。

## HTX (火币)

::: tip 交易所端止损
HTX 支持 `stoploss_on_exchange` 并使用 `stop-limit` 订单。
:::

## OKX (欧易)

OKX 需要口令密码密码。如果注册在 my.okx.com (OKX EAA)，请使用 `"myokx"` 作为交易所名称。

::: warning
OKX 每次调用仅提供 100 条 K 线。
:::

::: warning 期货
OKX 期货有“买卖”模式和“开仓/平仓”模式。Freqtrade 建议使用“买卖”模式。中途更改模式会导致异常。
:::

## Gate.io (芝麻开门)

Gate.io 支持交易所端止损。
Gate.io 允许使用 `POINT` 支付手续费。由于这不是可交易货币，自动计算会失败。可以使用 `exchange.unknown_fee_rate` 设置汇率。

## Bybit

 Bybit 期货（仅限期货）支持交易所端止损。

::: warning 统一账户
Freqtrade 假设账户是机器人专用的。强烈建议为每个机器人使用一个子账户。
:::

### Bybit 期货

启动时会全账户设为“单向模式”。Bybit 不提供资金费率历史，因此使用模拟运行的计算方式。

## Bitmart

需要 API 密钥 Memo（UID 字段）：

```json
"exchange": {
    "name": "bitmart",
    "uid": "your_bitmart_api_key_memo",
}
```

::: warning 必要验证
Bitmart 需要 L2 身份验证才能通过 API 在现货市场交易。
:::

## Bitget

需要口令密码。支持交易所端止损。

## Hyperliquid

::: tip 交易所端止损
Hyperliquid 支持 `stoploss_on_exchange` 并使用 `stop-loss-limit` 订单。
:::

Hyperliquid 是一个去中心化交易所 (DEX)。它不使用 API 密钥，而是使用私钥签名。

```json
"exchange": {
    "name": "hyperliquid",
    "walletAddress": "your_eth_wallet_address",
    "privateKey": "your_api_private_key",
}
```

::: info
Hyperliquid 不支持市价单，CCXT 通过 5% 滑损的限价单模拟市价单。API 仅提供 5000 条历史 K 线。
:::

## 所有交易所

如果经常遇到 Nonce 错误（如 `InvalidNonce`），最好重新生成 API 密钥。

## 其他交易所杂项笔记

* The Ocean 交易所需要 `web3` 包。

### 获取最新价格 / 未完成 K 线

由于重绘风险，Freqtrade 不允许使用未完成的 K 线。如果策略需要最新价，请使用 `DataProvider`。

### 高级交易所配置

可以使用 `_ft_has_params` 覆盖默认行为。例如，为 Kraken 测试 FOK 类型并限制 K 线为 200：

```json
"exchange": {
    "name": "kraken",
    "_ft_has_params": {
        "order_time_in_force": ["GTC", "FOK"],
        "ohlcv_candle_limit": 200
    }
}
```

::: warning
请确保在修改这些设置前完全理解其影响。覆盖这些参数可能导致不可预测的行为甚至破坏机器人。
:::