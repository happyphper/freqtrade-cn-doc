# 主命令 (main)

``` output
用法: freqtrade [-h] [-v] [--no-color] [--logfile FILE] [-V]
                 {trade,create-userdir,new-config,new-strategy,download-data,convert-data,convert-trade-data,list-data,convert-db,backtesting,edge,hyperopt,hyperopt-list,hyperopt-show,list-exchanges,list-markets,list-pairs,list-strategies,list-timeframes,list-hyperoptloss,list-freqaimodels,show-config,show-trades,test-pairlist,install-ui,webserver,plot-dataframe,plot-profit,lookahead-analysis,recursive-analysis,backtesting-analysis,backtesting-show,strategy-updater,trades-to-ohlcv}
                 ...

Freqtrade 是一个免费且开源的一站式加密货币交易机器人，旨在为您提供快速和安全的交易体验。

位置参数:
  {trade,create-userdir,new-config,new-strategy,download-data,convert-data,convert-trade-data,list-data,convert-db,backtesting,edge,hyperopt,hyperopt-list,hyperopt-show,list-exchanges,list-markets,list-pairs,list-strategies,list-timeframes,list-hyperoptloss,list-freqaimodels,show-config,show-trades,test-pairlist,install-ui,webserver,plot-dataframe,plot-profit,lookahead-analysis,recursive-analysis,backtesting-analysis,backtesting-show,strategy-updater,trades-to-ohlcv}
    trade               启动机器人进行实盘或模拟交易。
    create-userdir      创建一个包含示例的用户数据目录。
    new-config          通过执行交互式问卷创建一个新的配置文件。
    new-strategy        基于模板创建一个新的策略文件。
    download-data       从交易所下载历史 K 线（OHLCV）数据。
    convert-data        在不同的 OHLCV 存储格式之间进行转换。
    convert-trade-data  在不同的交易数据（Trade data）存储格式之间进行转换。
    list-data           列出本地存储的 OHLCV / 交易数据。
    convert-db          迁移历史离场交易到另一个数据库。
    backtesting         在历史数据上测试您的策略。
    edge                计算您的策略在特定时间范围内的优势（Edge）。
    hyperopt            通过寻找策略参数的最佳表现来优化您的策略。
    hyperopt-list       列出之前的优化结果。
    hyperopt-show       展示特定优化试验的结果。
    list-exchanges      列出 CCXT 及此机器人支持的所有交易所。
    list-markets        列出指定交易所的可用市场。
    list-pairs          根据过滤条件列出交易对。
    list-strategies     列出所有可用的策略类。
    list-timeframes     列出指定交易所支持的时间框架。
    list-hyperoptloss   列出所有可用的超参数优化（Hyperopt）损失函数。
    list-freqaimodels   列出所有可用的 FreqAI 预测模型。
    show-config         显示当前的配置。
    show-trades         显示存储在数据库中的离场交易。
    test-pairlist       测试您的交易对列表配置。
    install-ui          安装 FreqUI。
    webserver           启动一个轻量级的 Web 服务器来显示结果（并非运行机器人所必需）。
    plot-dataframe      绘制回测结果数据。
    plot-profit         绘制回测结果利润图。
    lookahead-analysis  分析策略是否存在前瞻偏差（Lookahead bias）。
    recursive-analysis  分析策略是否存在递归指标导致的不准确性。
    backtesting-analysis
                        分析回测结果并将其分解为子集。
    backtesting-show    显示之前的回测结果。
    strategy-updater    更新策略。
    trades-to-ohlcv     将从交易所下载的原始交易数据转换为 OHLCV K 线。

选项:
  -h, --help            显示此帮助消息并退出
  -v, --verbose         详细模式 (-vv 更多信息, -vvv 获取所有消息)。
  --no-color            禁用 hyperopt 结果的着色。在将输出重定向到文件时可能很有用。
  --logfile, --log-file FILE
                        记录到指定的文件。特殊值有：'syslog', 'journald'。
                        更多详情请参阅文档。
  -V, --version         显示程序版本号并退出。
```
