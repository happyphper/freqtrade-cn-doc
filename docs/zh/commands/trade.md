# 交易 (trade)

``` output
用法: freqtrade trade [-h] [-v] [--no-color] [--logfile FILE] [-V] [-c PATH]
                     [-d PATH] [--userdir PATH] [-s NAME]
                     [--strategy-path PATH] [--recursive-strategy-search]
                     [--freqaimodel NAME] [--freqaimodel-path PATH]
                     [--db-url PATH] [--sd-notify] [--dry-run]

选项:
  -h, --help            显示此帮助消息并退出
  --db-url PATH         指定数据库 URL (默认: `sqlite:///user_data/tradesv3.sqlite`)。
  --sd-notify           通过 systemd 调用 sd_notify。
  --dry-run             在模拟模式下运行机器人。

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
