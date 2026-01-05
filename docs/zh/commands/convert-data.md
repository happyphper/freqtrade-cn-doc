# 数据转换 (convert-data)

``` output
用法: freqtrade convert-data [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH]
                             [-p PAIRS [PAIRS ...]] [--trading-mode {spot,futures}]
                             [-i TIMEFRAME [TIMEFRAME ...]]
                             [--format-from {json,jsongz,feather,parquet}]
                             [--format-to {json,jsongz,feather,parquet}]
                             [--erase]

选项:
  -h, --help            显示此帮助消息并退出
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --trading-mode {spot,futures}
                        指定交易模式 (默认: `spot`)。
  -i, --timeframe, --timeframes TIMEFRAME [TIMEFRAME ...]
                        指定时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  --format-from {json,jsongz,feather,parquet}
                        源数据存储格式 (默认: `json`)。
  --format-to {json,jsongz,feather,parquet}
                        目标数据存储格式 (默认: `feather`)。
  --erase               转换完成后删除源数据。

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
