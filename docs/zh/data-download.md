
# 数据下载 (Data Downloading)

## 获取用于回测和超优化的数据

要下载用于回测和超参数优化的数据（K 线 / OHLCV），请使用 `freqtrade download-data` 命令。

如果未指定其他参数，Freqtrade 将默认下载过去 30 天内 `"1m"` 和 `"5m"` 时间框架的数据。
交易所和交易对将来自 `config.json`（如果使用 `-c/--config` 指定）。
如果没有提供配置，则必须使用 `--exchange` 参数。

您可以使用相对时间范围（`--days 20`）或绝对起点（`--timerange 20200101-`）。对于增量下载，应使用相对方式。

::: tip 提示：更新现有数据
如果您在数据目录中已有回测数据并希望将其更新至今天，Freqtrade 将自动计算现有对的缺失时间范围，并从最新的可用点开始下载，直到“现在”。此时不需要 `--days` 或 `--timerange` 参数。Freqtrade 会保留已有数据，仅下载缺失的部分。
如果您在插入了没有数据的新对后更新数据，请使用 `--new-pairs-days xx` 参数。新对将下载指定天数的数据，而旧对仅更新缺失的数据。
:::

### 用法

``` output
用法: freqtrade download-data [-h] [-v] [--no-color] [--logfile FILE] [-V]
                               [-c PATH] [-d PATH] [--userdir PATH]
                               [-p PAIRS [PAIRS ...]] [--pairs-file FILE]
                               [--days INT] [--new-pairs-days INT]
                               [--include-inactive-pairs]
                               [--no-parallel-download]
                               [--timerange TIMERANGE] [--dl-trades]
                               [--convert] [--exchange EXCHANGE]
                               [-t TIMEFRAMES [TIMEFRAMES ...]] [--erase]
                               [--data-format-ohlcv {json,jsongz,feather,parquet}]
                               [--data-format-trades {json,jsongz,feather,parquet}]
                               [--trading-mode {spot,margin,futures}]
                               [--candle-types {spot,futures,mark,index,premiumIndex,funding_rate} ...]
                               [--prepend]
```

### 常用选项

- `-p/--pairs`: 限制这些交易对。空格分隔。
- `--pairs-file`: 包含交易对列表的文件。
- `--days`: 下载过去几天的结果。
- `--timerange`: 指定下载的时间范围。
- `--dl-trades`: 下载逐笔交易数据而非 OHLCV。
- `--exchange`: 交易所名称。
- `-t/--timeframes`: 指定时间框架。默认 `1m 5m`。
- `--trading-mode`: 选择交易模式（spot, margin, futures）。
- `--candle-types`: 指定 K 线类型（mark, funding_rate 等）。

::: tip 下载特定计价币的所有数据
如果您想下载特定计价币（如 USDT）的所有对，可以使用通配符：`freqtrade download-data --exchange binance --pairs ".*/USDT" <...>`。
:::

### 数据格式 (Data format)

Freqtrade 目前支持以下数据格式：
- `feather`: 基于 Apache Arrow 的格式（**默认和推荐**）。性能最佳。
- `json`: 普通文本 JSON 文件。
- `jsongz`: JSON 的压缩版本。
- `parquet`: 列式存储格式。

可以通过 `--data-format-ohlcv` 指定，或在配置中设置 `"dataformat_ohlcv": "feather"`。

| 格式 | 大小 (BTC/USDT 1m) | 读取时间 |
|------------|-------------|-------------|
| `feather` | 72Mb | 3.5s |
| `json` | 149Mb | 25.6s |
| `jsongz` | 39Mb | 27s |
| `parquet` | 83Mb | 3.8s |

### 转换数据 (Convert data)

您可以在不同格式之间转换数据：
``` bash
freqtrade convert-data --format-from json --format-to feather --datadir user_data/data/binance --erase
```

### 逐笔交易数据 (Trades data)

默认情况下下载的是 K 线数据。部分交易所（如 Kraken）不提供长期的历史 K 线，因此需要下载逐笔交易数据 (`--dl-trades`)，然后将其转换为 K 线：
```bash
freqtrade download-data --exchange kraken --pairs XRP/EUR --days 20 --dl-trades
```

下载完成后，可以使用 `trades-to-ohlcv` 转换或者在下载时带上 `--convert` 标志。

### 列出已下载数据 (List data)

使用 `list-data` 查看已下载的内容：
```bash
freqtrade list-data --userdir user_data/
```

## 下一步

现在您已下载了数据，可以开始[回测](backtesting.md)您的策略了。
