# 下载数据 (download-data)

``` output
用法: freqtrade download-data [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH]
                             [-p PAIRS [PAIRS ...]] [--pairs-file FILE]
                             [--trading-mode {spot,futures}]
                             [--days INT] [--timerange TIMERANGE]
                             [--dl-trades]
                             [--data-format-ohlcv {json,jsongz,feather,parquet}]
                             [--data-format-trades {json,jsongz,feather,parquet}]
                             [-i TIMEFRAME [TIMEFRAME ...]] [--erase]
                             [--check-candle-limit]

选项:
  -h, --help            显示此帮助消息并退出
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --pairs-file FILE     提供包含要下载交易对列表的文件。
  --trading-mode {spot,futures}
                        指定交易模式（默认：`spot`）。
  --days INT            指定要下载多少天的数据。
  --timerange TIMERANGE
                        指定要下载的数据时间范围。
  --dl-trades           下载交易所的交易数据（Trade data）而不是 K 线数据（OHLCV 数据）。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 OHLCV 数据的存储格式（默认：`feather`）。
  --data-format-trades {json,jsongz,feather,parquet}
                        下载的交易数据的存储格式（默认：`feather`）。
  -i, --timeframe, --timeframes TIMEFRAME [TIMEFRAME ...]
                        指定时间框架（`1m`, `5m`, `30m`, `1h`, `1d`）。
  --erase               下载前清除现有数据。
  --check-candle-limit  对照交易所对历史数据的限制检查时间范围。

通用参数:
  -v, --verbose         详细模式 (-vv 更多信息, -vvv 获取所有消息)。
  --no-color            禁用 hyperopt 结果的着色。在将输出重定向到文件时可能很有用。
  --logfile, --log-file FILE
                        记录到指定的文件。特殊值有：'syslog', 'journald'。
                        更多详情请参阅文档。
  -V, --version         显示程序版本号并退出。
  -c, --config PATH     指定配置文件（默认：`userdir/config.json` 或 `config.json`，
                        以存在者为准）。可以使用多个 --config 选项。
                        可以设置为 `-` 以从标准输入 (stdin) 读取配置。
  -d, --datadir, --data-dir PATH
                        包含历史回测数据的交易所基础目录路径。
                        要查看期货数据，需同时使用 trading-mode。
  --userdir, --user-data-dir PATH
                        用户数据目录路径。
```
