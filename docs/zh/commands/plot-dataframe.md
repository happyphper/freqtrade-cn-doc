# 数据帧绘图 (plot-dataframe)

``` output
用法: freqtrade plot-dataframe [-h] [-v] [--no-color] [--logfile FILE] [-V]
                               [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                               [--strategy-path PATH]
                               [--recursive-strategy-search] [-i TIMEFRAME]
                               [--timerange TIMERANGE]
                               [--data-format-ohlcv {json,jsongz,feather,parquet}]
                               [-p PAIRS [PAIRS ...]]
                               [--indicators1 INDICATORS1 [INDICATORS1 ...]]
                               [--indicators2 INDICATORS2 [INDICATORS2 ...]]
                               [--plot-config-file FILE] [--no-trades]
                               [--no-signals] [--rejected-signals]
                               [--export-filename PATH]

选项:
  -h, --help            显示此帮助消息并退出
  -i, --timeframe TIMEFRAME
                        指定时间框架（`1m`, `5m`, `30m`, `1h`, `1d`）。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 OHLCV 数据的存储格式（默认：`feather`）。
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --indicators1 INDICATORS1 [INDICATORS1 ...]
                        要在第一个图表中绘制的指标。用空格分隔。
                        例如：`ema10 ema20`。
  --indicators2 INDICATORS2 [INDICATORS2 ...]
                        要在第二个图表中绘制的指标。用空格分隔。
                        例如：`rsi macd`。
  --plot-config-file FILE
                        指定包含绘图配置的 JSON 文件。
  --no-trades           不要在图表上绘制交易。
  --no-signals          不要在图表上绘制入场/离场信号。
  --rejected-signals    在图表上绘制被拒绝的信号。
  --export-filename PATH
                        指定回测结果文件名。例如：
                        `--export-filename=backtest_results_2020-09-27_16-20-48.json`。
                        假定基础目录为 `user_data/backtest_results/`。

策略参数:
  -s, --strategy NAME   指定要使用的策略类名。将在 `user_data/strategies` 中查找该类。
  --strategy-path PATH  指定策略文件的附加目录路径。
  --recursive-strategy-search
                        递归搜索策略。

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
