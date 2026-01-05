# 前瞻分析 (lookahead-analysis)

``` output
用法: freqtrade lookahead-analysis [-h] [-v] [--no-color] [--logfile FILE]
                                    [-V] [-c PATH] [-d PATH] [--userdir PATH]
                                    [-s NAME] [--strategy-path PATH]
                                    [--recursive-strategy-search]
                                    [-i TIMEFRAME] [--timerange TIMERANGE]
                                    [--data-format-ohlcv {json,jsongz,feather,parquet}]
                                    [--max-open-trades INT]
                                    [--stake-amount STAKE_AMOUNT] [--fee FLOAT]
                                    [-p PAIRS [PAIRS ...]] [--enable-protections]
                                    [--enable-dynamic-pairlist]
                                    [--dry-run-wallet DRY_RUN_WALLET]
                                    [--timeframe-detail TIMEFRAME_DETAIL]
                                    [--minimum-trade-count INT]
                                    [--targeted-trade-count INT]

选项:
  -h, --help            显示此帮助消息并退出
  -i, --timeframe TIMEFRAME
                        指定时间框架（`1m`, `5m`, `30m`, `1h`, `1d`）。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 OHLCV 数据的存储格式（默认：`feather`）。
  --max-open-trades INT
                        覆盖配置中的 `max_open_trades`。
  --stake-amount STAKE_AMOUNT
                        覆盖配置中的 `stake_amount`。
  --fee FLOAT           指定手续费率。将应用两次（入场和离场）。
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --enable-protections, --enableprotections
                        启用回测保护。
  --enable-dynamic-pairlist
                        在回测中启用动态交易对列表刷新。
  --dry-run-wallet, --starting-balance DRY_RUN_WALLET
                        起始余额。
  --timeframe-detail TIMEFRAME_DETAIL
                        指定用于回测的详细时间框架。
  --minimum-trade-count INT
                        执行分析所需的最小交易次数（默认：`10`）。
  --targeted-trade-count INT
                        目标交易次数。如果未提供，将使用 timerange 中的所有交易（默认：`2000`）。

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
