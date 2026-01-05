# 交易所列表 (list-exchanges)

``` output
用法: freqtrade list-exchanges [-h] [-v] [--no-color] [--logfile FILE] [-V]
                               [-c PATH] [-d PATH] [--userdir PATH]
                               [-a]

选项:
  -h, --help            显示此帮助消息并退出
  -a, --all             列すすべての交易所（CCXT 支援的所有系统）。
                        默认仅显示 Freqtrade 官方测试过的或有特定类实现的交易所。

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
