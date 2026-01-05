
# 订单流数据 (Orderflow data)

本指南向您介绍如何利用公共交易数据在 Freqtrade 中进行高级订单流分析。

::: warning 实验性功能
订单流功能目前处于测试阶段，在未来的版本中可能会有所变动。请在 [Freqtrade GitHub 仓库](https://github.com/freqtrade/freqtrade/issues) 上报告任何问题或反馈。
目前该功能尚未与 freqAI 进行测试。
:::

::: warning 性能提示
订单流需要原始交易数据 (raw trades data)。这些数据非常庞大，当 Freqtrade 需要下载过去 X 根 K 线的数据时，可能会导致初始启动缓慢。此外，启用此功能会增加内存占用。请确保拥有足够的资源。
:::

## 快速开始

### 启用公共交易数据

在您的 `config.json` 文件的 `exchange` 部分，将 `use_public_trades` 选项设置为 true。

```json
"exchange": {
   ...
   "use_public_trades": true,
}
```

### 配置订单流处理

在 `config.json` 的 `orderflow` 部分定义您的设置：
- `cache_size`: 缓存的订单流 K 线数量。
- `max_candles`: 获取交易数据的 K 线范围。
- `scale`: 控制足迹图 (footprint chart) 的价格档位大小。
- `imbalance_ratio`: 过滤买卖不平衡比例。

## 获取回测交易数据

使用 `--dl-trades` 标志下载回测所需的原始交易数据：
```bash
freqtrade download-data -p BTC/USDT:USDT --timerange 20230101- --trading-mode futures --timeframes 5m --dl-trades
```

## 访问订单流数据

激活后，数据框中会出现多个新列：
- `dataframe["bid"]`: 总买入成交量。
- `dataframe["ask"]`: 总卖出成交量。
- `dataframe["delta"]`: 卖出与买入成交量的差值。
- `dataframe["orderflow"]`: 代表足迹图字典。
- `dataframe["imbalances"]`: 包含订单流中的不平衡信息。

### 足迹图 (Footprint chart)

`orderflow` 列包含一个字典，详细列出了不同价格水平上的买入和卖出订单，为您提供订单流动态的宝贵见解。
::: info
键为价格档位，其间隔由配置中的 `scale` 参数决定。
:::

### 原始交易数据 (Raw trades data)

`dataframe["trades"]` 包含了 K 线期间内发生的每一笔独立交易的列表。
每个条目包含：`timestamp`, `price`, `amount`, `side`, `id` 等信息。
