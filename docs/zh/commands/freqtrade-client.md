# Freqtrade 客户端 (freqtrade-client)

``` output
用法: freqtrade-client [-h] [-v] [--no-color] [--logfile FILE] [-V] [-c PATH]
                       [--userdir PATH]
                       {status,profit,balance,start,stop,reload_config,logs,whitelist,blacklist,edge,forcebuy,forcesell,forcesell_all,show_config}
                       ...

位置参数:
  {status,profit,balance,start,stop,reload_config,logs,whitelist,blacklist,edge,forcebuy,forcesell,forcesell_all,show_config}
    status              显示所有开启交易的状态。
    profit              显示各交易对的利润详情。
    balance             显示当前资产余额。
    start               启动机器人。
    stop                停止机器人。
    reload_config       重新加载配置文件。
    logs                显示机器人的最近日志。
    whitelist           显示当前交易对白名单。
    blacklist           显示当前交易对黑名单。
    edge                显示 Edge 状态。
    forcebuy            强制按市价买入一个特定交易对。
    forcesell           强制按市价卖出一个处于开启状态的交易对。
    forcesell_all       强制按市价卖出所有处于开启状态的交易。
    show_config         显示当前的机器人配置。

选项:
  -h, --help            显示此帮助消息并退出

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
  --userdir, --user-data-dir PATH
                        用户数据目录路径。
```
