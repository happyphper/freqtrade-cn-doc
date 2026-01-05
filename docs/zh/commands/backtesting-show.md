# 回测展示 (backtesting-show)

``` output
用法: freqtrade backtesting-show [-h] [-v] [--no-color] [--logfile FILE] [-V]
                                  [-c PATH] [-d PATH] [--userdir PATH]
                                  [--backtest-filename PATH]
                                  [--backtest-directory PATH]
                                  [--show-pair-list PAIRS [PAIRS ...]]

选项:
  -h, --help            显示此帮助消息并退出
  --backtest-filename, --export-filename PATH
                        指定回测结果文件名。例如：
                        `--backtest-filename=backtest_results_2020-09-27_16-20-48.json`。
                        假定基础目录为 `user_data/backtest_results/` 或
                        `--export-directory` 指定的目录。
  --backtest-directory, --export-directory PATH
                        用于回测结果的目录。示例：
                        `--export-directory=user_data/backtest_results/`。
  --show-pair-list PAIRS [PAIRS ...]
                        显示特定交易对的详细结果列表。可用值为：
                        'all' 或空格分隔的交易对列表。示例：
                        'BTC/USDT ETH/USDT'

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
