# 数据列表 (list-data)

``` output
用法: freqtrade list-data [-h] [-v] [--no-color] [--logfile FILE] [-V]
                         [-c PATH] [-d PATH] [--userdir PATH]
                         [--exchange EXCHANGE] [-p PAIRS [PAIRS ...]]
                         [--trading-mode {spot,futures}]
                         [--data-format-ohlcv {json,jsongz,feather,parquet}]
                         [--data-format-trades {json,jsongz,feather,parquet}]
                         [--show-all-timeframes]

选项:
  -h, --help            显示此帮助消息并退出
  --exchange EXCHANGE   指定交易所名称（默认：使用配置文件中的设置）。
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --trading-mode {spot,futures}
                        指定交易模式（默认：`spot`）。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 OHLCV 数据的存储格式（默认：`feather`）。
  --data-format-trades {json,jsongz,feather,parquet}
                        下载的交易数据的存储格式（默认：`feather`）。
  --show-all-timeframes
                        显示所有时间框架，包括那些只存在少量 K 线（通常是通过 fetch-ohlcv 产生的副作用）的时间框架。

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
