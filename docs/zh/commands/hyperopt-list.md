# 超参数优化列表 (hyperopt-list)

``` output
用法: freqtrade hyperopt-list [-h] [-v] [--no-color] [--logfile FILE] [-V]
                               [-c PATH] [-d PATH] [--userdir PATH]
                               [--hyperopt-filename PATH]
                               [--best] [--profitable] [--min-avg-time FLOAT]
                               [--max-avg-time FLOAT] [--min-total-profit FLOAT]
                               [--max-total-profit FLOAT] [--no-details]
```

选项:
  -h, --help            显示此帮助消息并退出
  --hyperopt-filename PATH
                        指定要加载的 hyperopt 结果文件名。
                        例如：`--hyperopt-filename=hyperopt_results_2020-09-27_16-20-48.json`。
                        假定基础目录为 `user_data/hyperopt_results/`。
  --best                仅显示最佳结果。
  --profitable          仅显示盈利（总利润 > 0）的结果。
  --min-avg-time FLOAT  仅显示平均持续时间大于此值的结果。
  --max-avg-time FLOAT  仅显示平均持续时间小于此值的结果。
  --min-total-profit FLOAT
                        仅显示总利润大于此值的结果。
  --max-total-profit FLOAT
                        仅显示总利润小于此值的结果。
  --no-details          不显示策略选择代码。

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
