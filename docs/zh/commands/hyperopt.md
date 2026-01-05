# 超参数优化 (hyperopt)

``` output
用法: freqtrade hyperopt [-h] [-v] [--no-color] [--logfile FILE] [-V] [-c PATH]
                         [-d PATH] [--userdir PATH] [-s NAME]
                         [--strategy-path PATH] [--recursive-strategy-search]
                         [--freqaimodel NAME] [--freqaimodel-path PATH]
                         [-i TIMEFRAME] [--timerange TIMERANGE]
                         [--data-format-ohlcv {json,jsongz,feather,parquet}]
                         [--max-open-trades INT] [--stake-amount STAKE_AMOUNT]
                         [--fee FLOAT] [-p PAIRS [PAIRS ...]]
                         [--enable-protections] [--enable-dynamic-pairlist]
                         [--dry-run-wallet DRY_RUN_WALLET]
                         [--timeframe-detail TIMEFRAME_DETAIL]
                         [--hyperopt-filename PATH] [-e INT]
                         [--spaces {all,buy,sell,roi,stoploss,trailing,protection,default} [{all,buy,sell,roi,stoploss,trailing,protection,default} ...]]
                         [--hyperopt NAME] [--hyperopt-path PATH]
                         [--hyperopt-loss NAME] [--random-state INT]
                         [--min-trades INT] [--continue] [--analyze-per-epoch]
                         [--no-details] [--print-all] [--print-colorized]
                         [--print-json] [--profile] [-j INT]
```

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
  --hyperopt-filename PATH
                        指定要保存结果的文件名。
  -e, --epochs INT      指定 hyperopt 的迭代次数（默认：`100`）。
  --spaces {all,buy,sell,roi,stoploss,trailing,protection,default} [{all,buy,sell,roi,stoploss,trailing,protection,default} ...]
                        指定要优化的参数空间。可以用空格分隔提供多个空间。
                        默认：`buy roi stoploss`。
  --hyperopt NAME       指定要使用的自定义 Hyperopt 类名（虽然不再推荐）。
  --hyperopt-path PATH  指定超参数优化文件的附加目录路径。
  --hyperopt-loss NAME  指定要使用的 Hyperopt 损失函数类名。
  --random-state INT    为模拟运行设置固定种子（seed）。
  --min-trades INT      丢弃交易次数少于指定数量的迭代（默认：`1`）。
  --continue            继续之前的 hyperopt 运行。
  --analyze-per-epoch   为每次迭代分析策略。这很慢。
  --no-details          不显示策略选择代码。
  --print-all           打印所有迭代，而不仅仅是最佳迭代。
  --print-colorized     打印彩色结果表。
  --print-json          打印 JSON 格式的结果（仅限试验/迭代数据）。
  --profile             启用 cProfile 分析。
  -j, --job INT         计算时使用的并行工作进程数。`-1` 表示所有可用的 CPU (默认: `-1`)。

策略参数:
  -s, --strategy NAME   指定要使用的策略类名。将在 `user_data/strategies` 中查找该类。
  --strategy-path PATH  指定策略文件的附加目录路径。
  --recursive-strategy-search
                        递归搜索策略。
  --freqaimodel NAME    指定要使用的 FreqAI 模型名。
  --freqaimodel-path PATH
                        指定 FreqAI 模型文件的附加目录路径。

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
