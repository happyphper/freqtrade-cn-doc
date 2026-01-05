
# 启动机器人

本页解释了机器人的不同参数以及如何运行它。

::: info
如果您使用了 `setup.sh`，在运行 freqtrade 命令之前，请不要忘记激活您的虚拟环境 (`source .venv/bin/activate`)。
:::

::: warning 时钟同步
运行机器人的系统时钟必须准确，且应足够频繁地与 NTP 服务器同步，以避免与交易所通信时出现问题。
:::

## 机器人命令

``` output
用法: freqtrade [-h] [-V]
                 {trade,create-userdir,new-config,show-config,new-strategy,download-data,convert-data,convert-trade-data,trades-to-ohlcv,list-data,backtesting,backtesting-show,backtesting-analysis,edge,hyperopt,hyperopt-list,hyperopt-show,list-exchanges,list-markets,list-pairs,list-strategies,list-hyperoptloss,list-freqaimodels,list-timeframes,show-trades,test-pairlist,convert-db,install-ui,plot-dataframe,plot-profit,webserver,strategy-updater,lookahead-analysis,recursive-analysis} ...

免费、开源的加密货币交易机器人

位置参数:
  {trade,create-userdir,new-config,show-config,new-strategy,download-data,convert-data,convert-trade-data,trades-to-ohlcv,list-data,backtesting,backtesting-show,backtesting-analysis,edge,hyperopt,hyperopt-list,hyperopt-show,list-exchanges,list-markets,list-pairs,list-strategies,list-hyperoptloss,list-freqaimodels,list-timeframes,show-trades,test-pairlist,convert-db,install-ui,plot-dataframe,plot-profit,webserver,strategy-updater,lookahead-analysis,recursive-analysis}
    trade               交易模块。
    create-userdir      创建用户数据目录。
    new-config          创建新配置文件。
    show-config         显示解析后的配置。
    new-strategy        创建新策略。
    download-data       下载回测数据。
    convert-data        将 K 线 (OHLCV) 数据从一种格式转换为另一种格式。
    convert-trade-data  将交易数据从一种格式转换为另一种格式。
    trades-to-ohlcv     将交易实体数据转换为 OHLCV 数据。
    list-data           列出已下载的数据。
    backtesting         回测模块。
    backtesting-show    显示过去的回测结果。
    backtesting-analysis
                        回测分析模块。
    edge                Edge 模块（不再是 Freqtrade 的一部分）。
    hyperopt            超参数优化模块。
    hyperopt-list       列出超参数优化结果。
    hyperopt-show       显示超参数优化结果详情。
    list-exchanges      列出可用的交易所。
    list-markets        列出交易所的市场。
    list-pairs          列出交易所的交易对。
    list-strategies     列出可用的策略。
    list-hyperoptloss   列出可用的超参数优化损失函数。
    list-freqaimodels   列出可用的 FreqAI 模型。
    list-timeframes     列出交易所可用的时间框架。
    show-trades         显示交易。
    test-pairlist       测试您的交易对列表配置。
    convert-db          将数据库迁移到不同的系统。
    install-ui          安装 FreqUI。
    plot-dataframe      绘制带有指标的 K 线图。
    plot-profit         生成显示利润的图表。
    webserver           Web 服务器模块。
    strategy-updater    将过时的策略文件更新为当前版本。
    lookahead-analysis  检查潜在的未来函数 (Look-ahead bias) 偏差。
    recursive-analysis  检查潜在的递归公式问题。

选项:
  -h, --help            显示帮助信息并退出。
  -V, --version         显示程序的版本号并退出。
```

### 机器人交易命令

``` output
用法: freqtrade trade [-h] [-v] [--no-color] [--logfile FILE] [-V] [-c PATH]
                       [-d PATH] [--userdir PATH] [-s NAME]
                       [--strategy-path PATH] [--recursive-strategy-search]
                       [--freqaimodel NAME] [--freqaimodel-path PATH]
                       [--db-url PATH] [--sd-notify] [--dry-run]
                       [--dry-run-wallet DRY_RUN_WALLET] [--fee FLOAT]

选项:
  -h, --help            显示帮助信息并退出。
  --db-url PATH         覆盖交易数据库 URL，这在自定义部署中很有用（默认实盘模式为 `sqlite:///tradesv3.sqlite`，模拟运行模式为 `sqlite:///tradesv3.dryrun.sqlite`）。
  --sd-notify           通知 systemd 服务管理器。
  --dry-run             强制以模拟运行模式进行交易（移除交易所密钥并模拟交易）。
  --dry-run-wallet, --starting-balance DRY_RUN_WALLET
                        初始余额，用于回测 / 超参数优化和模拟运行。
  --fee FLOAT           指定手续费率。将应用两次（进场和离场交易）。

通用参数:
  -v, --verbose         详细模式（-vv 显示更多，-vvv 获取所有消息）。
  --no-color            禁用超参数优化结果的着色。如果您要将输出重定向到文件，这可能很有用。
  --logfile, --log-file FILE
                        日志记录到指定文件。特殊值有：'syslog'、'journald'。更多详情请参阅文档。
  -V, --version         显示程序版本号并退出。
  -c, --config PATH     指定配置文件（默认：`userdir/config.json` 或 `config.json`，以存在者为准）。可以使用多个 --config 选项。可以设置为 `-` 以从标准输入读取配置。
  -d, --datadir, --data-dir PATH
                        带有历史回测数据的交易所基础目录路径。要查看期货数据，请额外使用 trading-mode。
  --userdir, --user-data-dir PATH
                        用户数据目录路径。

策略参数:
  -s, --strategy NAME   指定机器人将使用的策略类名。
  --strategy-path PATH  指定额外的策略查找路径。
  --recursive-strategy-search
                        递归搜索策略文件夹中的策略。
  --freqaimodel NAME    指定自定义 FreqAI 模型。
  --freqaimodel-path PATH
                        指定额外的 FreqAI 模型查找路径。
```

### 如何指定使用哪个配置文件？

机器人允许您通过 `-c/--config` 命令行选项来选择要使用的配置文件：

```bash
freqtrade trade -c path/far/far/away/config.json
```

默认情况下，机器人从当前工作目录加载 `config.json` 配置文件。

### 如何使用多个配置文件？

机器人允许您在命令行中通过指定多个 `-c/--config` 选项来使用多个配置文件。后面指定的配置文件中定义的配置参数将覆盖前面配置文件中定义的同名参数。

例如，您可以为用于交易的交易所密钥创建一个单独的配置文件，而在模拟运行模式（实际上不需要密钥）下使用密钥为空的默认配置文件：

```bash
freqtrade trade -c ./config.json
```

并在正常的实盘交易模式下指定这两个配置文件：

```bash
freqtrade trade -c ./config.json -c path/to/secrets/keys.config.json
```

这可以帮助您通过为包含实际密钥的文件设置适当的文件权限，在本地机器上隐藏您的私有交易所密钥。此外，当您在项目 issue 或互联网上发布配置示例时，可以防止敏感私有数据的意外泄露。

有关此技术的更多详细信息和示例，请参阅[配置](configuration.md)文档页面。

### 在何处存储自定义数据

Freqtrade 允许使用 `freqtrade create-userdir --userdir someDirectory` 创建用户数据目录。
该目录结构如下：

```
user_data/
├── backtest_results    # 回测结果
├── data                # 历史数据
├── hyperopts           # 超参数优化器
├── hyperopt_results    # 超参数优化结果
├── plot                # 绘图输出
└── strategies          # 交易策略
```

您可以在配置中添加 "user_data_dir" 设置，以便始终让机器人指向此目录。
或者，为每个命令传入 `--userdir`。
如果该目录不存在，机器人将无法启动，但它会创建必要的子目录。

该目录应包含您的自定义策略、自定义超参数优化器和损失函数、回测历史数据（使用回测命令或下载脚本下载）以及绘图输出。

建议使用版本控制（如 Git）来跟踪策略的更改。

### 如何使用 **--strategy**？

该参数允许您加载自定义策略类。
要测试机器人安装，您可以使用通过 `create-userdir` 子命令安装的 `SampleStrategy`（通常位于 `user_data/strategy/sample_strategy.py`）。

机器人将在 `user_data/strategies` 中搜索您的策略文件。
要使用其他目录，请阅读下一节关于 `--strategy-path` 的内容。

要加载策略，只需在此参数中传入类名（例如：`CustomStrategy`）。

**示例：**
在 `user_data/strategies` 中您有一个文件 `my_awesome_strategy.py`，其中包含一个名为 `AwesomeStrategy` 的策略类，加载它的命令为：

```bash
freqtrade trade --strategy AwesomeStrategy
```

如果机器人找不到您的策略文件，它将在错误消息中显示原因（找不到文件，或您的代码中有错误）。

在[策略自定义](strategy-customization.md)中了解有关策略文件的更多信息。

### 如何使用 **--strategy-path**？

该参数允许您添加额外的策略查找路径，该路径将在默认位置之前被检查（传入的路径必须是一个目录！）：

```bash
freqtrade trade --strategy AwesomeStrategy --strategy-path /some/directory
```

#### 如何安装策略？

这非常简单。将您的策略文件复制粘贴到 `user_data/strategies` 目录中，或者使用 `--strategy-path`。然后，机器人就可以使用它了。

### 如何使用 **--db-url**？

当您以模拟运行模式运行机器人时，默认情况下交易不会存储在数据库中。如果您想使用 `--db-url` 将机器人操作存储在数据库中，这也可以在生产模式下指定自定义数据库。示例命令：

```bash
freqtrade trade -c config.json --db-url sqlite:///tradesv3.dry_run.sqlite
```

## 下一步

机器人的最佳策略将随市场趋势而不断变化。下一步是[策略自定义](strategy-customization.md)。
