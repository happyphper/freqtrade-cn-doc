# 市场列表 (list-markets)

``` output
用法: freqtrade list-markets [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH]
                             [--exchange EXCHANGE]
                             [--trading-mode {spot,futures}]
                             [--margin-mode {isolated,cross}]
                             [--print-json] [--columns COLUMNS [COLUMNS ...]]

选项:
  -h, --help            显示此帮助消息并退出
  --exchange EXCHANGE   指定交易所名称。
  --trading-mode {spot,futures}
                        指定交易模式（默认：`spot`）。
  --margin-mode {isolated,cross}
                        指定杠杆模式（默认：`isolated`）。
  --print-json          打印 JSON 格式的结果。
  --columns COLUMNS [COLUMNS ...]
                        指定要在输出表中显示的列。
                        可用列有：'id', 'symbol', 'base', 'quote', 
                        'settle', 'type', 'spot', 'margin', 'swap', 
                        'future', 'active', 'contract_size', 
                        'leverage', 'prec_price', 'prec_amount', 
                        'prec_cost', 'min_amount', 'max_amount', 
                        'min_cost', 'max_cost', 'min_price', 'max_price'。

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
