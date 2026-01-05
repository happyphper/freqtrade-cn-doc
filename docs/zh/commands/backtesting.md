# 回测 (backtesting)

``` output
用法: freqtrade backtesting [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                             [--strategy-path PATH]
                             [--recursive-strategy-search] [--freqaimodel NAME]
                             [--freqaimodel-path PATH] [-i TIMEFRAME]
                             [--timerange TIMERANGE]
                             [--data-format-ohlcv {json,jsongz,feather,parquet}]
                             [--max-open-trades INT]
                             [--stake-amount STAKE_AMOUNT] [--fee FLOAT]
                             [-p PAIRS [PAIRS ...]] [--enable-protections]
                             [--enable-dynamic-pairlist]
                             [--dry-run-wallet DRY_RUN_WALLET]
                             [--timeframe-detail TIMEFRAME_DETAIL]
                             [--strategy-list STRATEGY_LIST [STRATEGY_LIST ...]]
                             [--export {none,trades,signals}]
                             [--backtest-filename PATH]
                             [--backtest-directory PATH]
                             [--check-candle-limit]
                             [--freqai-backtest-live-models]

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
                        启用回测保护。这会显著减慢回测速度，但会包含配置的保护。
  --enable-dynamic-pairlist
                        在回测中启用动态交易对列表刷新。如果您使用的交易对列表处理程序支持此功能（例如 ShuffleFilter），则会为每根新 K 线生成交易对列表。
  --dry-run-wallet, --starting-balance DRY_RUN_WALLET
                        起始余额，用于回测/hyperopt 和模拟运行。
  --timeframe-detail TIMEFRAME_DETAIL
                        指定用于回测的详细时间框架（`1m`, `5m`, `30m`, `1h`, `1d`）。
  --strategy-list STRATEGY_LIST [STRATEGY_LIST ...]
                        提供要回测的策略列表（空格分隔）。请注意，时间框架需要在配置中或通过命令行设置。当与 `--export trades` 一起使用时，策略名称会注入到文件名中。
  --export {none,trades,signals}
                        导出回测结果（默认：trades）。
  --backtest-filename, --export-filename PATH
                        指定回测结果文件名。例如：
                        `--backtest-filename=backtest_results_2020-09-27_16-20-48.json`。
                        假定基础目录为 `user_data/backtest_results/` 或
                        `--export-directory` 指定的目录。
  --backtest-directory, --export-directory PATH
                        用于存储回测结果的目录。
  --check-candle-limit  对照交易所对历史数据的限制检查时间范围。不适用于自托管的 OHLCV 数据（例如通过 download-data 获得的数据）。
  --freqai-backtest-live-models
                        使用现有模型运行回测。

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
