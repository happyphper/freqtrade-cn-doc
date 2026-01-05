
# 辅助子命令 (Utility Subcommands)

除了实盘分析 (`Live-Trade`) 和模拟运行 (`Dry-Run`) 模式，回测 (`backtesting`) 和超参数优化 (`hyperopt`) 子命令，以及准备历史数据的下载数据 (`download-data`) 子命令外，机器人还包含许多辅助子命令。本节将对它们进行说明。

## 创建用户目录 (Create userdir)

创建用于存放 Freqtrade 文件的目录结构。也会为您创建策略和超参数优化的示例以供入门。可以多次使用 —— 使用 `--reset` 将重置示例策略和超参数优化文件为默认状态。

``` output
用法: freqtrade create-userdir [-h] [--userdir PATH] [--reset]

选项:
  -h, --help            显示此帮助消息并退出
  --userdir, --user-data-dir PATH
                        指向 userdata 目录的路径。
  --reset               将示例文件重置为原始状态。
```

::: warning
使用 `--reset` 可能会导致数据丢失，因为这将在不再次询问的情况下覆盖所有示例文件。
:::

```
├── backtest_results
├── data
├── hyperopt_results
├── hyperopts
│   ├── sample_hyperopt_loss.py
├── notebooks
│   └── strategy_analysis_example.ipynb
├── plot
└── strategies
    └── sample_strategy.py
```

## 创建新配置 (Create new config)

创建一个新的配置文件，并询问一些对于配置非常重要的选择。

``` output
用法: freqtrade new-config [-h] [-c PATH]

选项:
  -h, --help         显示此帮助消息并退出
  -c, --config PATH  指定配置文件（默认：`userdir/config.json` 或 `config.json`，视存在情况而定）。可以使用多个 --config 选项。可以设置为 `-` 从标准输入读取配置。
```

::: warning
此命令仅询问核心问题。Freqtrade 提供了更多的配置可能性，这些都在 [配置文档](configuration.md#配置参数) 中列出。
:::

### 创建配置示例

```bash
$ freqtrade new-config --config user_data/config_binance.json

? 您想启用模拟运行（Dry-run）吗？ 是
? 请输入您的投入货币（stake currency）：BTC
? 请输入您的单笔投入金额（stake amount）：0.05
? 请输入最大持仓数（整数，或 -1 表示不限制）：3
? 请输入您期望的时间框架（例如 5m）：5m
? 请输入您的显示货币（用于报告）：USD
? 选择交易所：binance
? 您想启用 Telegram 吗？ 否
```

## 显示配置 (Show config)

显示配置文件（默认脱敏敏感值）。在使用 [拆分配置文件](configuration.md#多个配置文件) 或 [环境变量](configuration.md#环境变量) 时特别有用，因为此命令将显示合并后的最终配置。

![Show config output](./assets/show-config-output.png)

``` output
用法: freqtrade show-config [-h] [--userdir PATH] [-c PATH] [--show-sensitive]

选项:
  -h, --help            显示此帮助消息并退出
  --userdir, --user-data-dir PATH
                        指向 userdata 目录的路径。
  -c, --config PATH     指定配置文件。
  --show-sensitive      在输出中显示敏感信息（如 API 密钥）。
```

::: warning 分享此命令提供的信息
我们尝试从默认输出中移除所有已知的敏感信息（不带 `--show-sensitive`）。但请务必再次检查输出中的值，确保您没有意外暴露某些私人信息。
:::

## 创建新策略 (Create new strategy)

从类似于 `SampleStrategy` 的模板创建一个新策略。文件名将与您的类名保持一致，且不会覆盖现有文件。结果将位于 `user_data/strategies/<策略类名>.py`。

``` output
用法: freqtrade new-strategy [-h] [--userdir PATH] [-s NAME]
                              [--strategy-path PATH]
                              [--template {full,minimal,advanced}]

选项:
  -s, --strategy NAME   指定机器人将使用的策略类名。
  --template {full,minimal,advanced}
                        使用模板：`minimal` (极简), `full` (默认，包含多个示例指标) 或 `advanced` (高级)。
```

## 列出策略 (List Strategies)

使用 `list-strategies` 子命令查看特定目录中的所有策略。这对于排查策略加载问题非常有用：包含错误且加载失败的模块名会显示为红色 (LOAD FAILED)，同名策略会显示为黄色 (DUPLICATE NAME)。

## 列出超参数优化损失函数 (List Hyperopt-Loss functions)

使用 `list-hyperoptloss` 子命令查看环境中所有可用的超参数优化损失函数。

## 列出 FreqAI 模型 (List freqAI models)

使用 `list-freqaimodels` 子命令查看所有可用的 FreqAI 模型。

## 列出交易所 (List Exchanges)

使用 `list-exchanges` 子命令查看机器人可用的交易所。

```
$ freqtrade list-exchanges
Freqtrade 可用的交易所：
交易所名称         支持情况      市场                   原因
------------------  -----------  ----------------------  ------------------------------------------------------------------------
binance             官方支持      现货, 隔离期货
bitmart             官方支持      现货
bybit                            现货, 隔离期货
...
```

## 列出时间框架 (List Timeframes)

查看特定交易所支持的时间框架列表。

## 列出交易对/列出市场 (List pairs/list markets)

查看交易所可用的交易对或市场。Freqtrade 中的交易对通常带有 `/`（如 ETH/BTC）。

## 测试对等列表 (Test pairlist)

用于测试 [动态对等列表](plugins.md#对等列表) 的配置。可以用来生成用于回测或超参数优化的静态对等列表。

## 转换数据库 (Convert database)

`freqtrade convert-db` 可用于在不同系统之间转换数据库（例如 sqlite 迁移到 postgres），迁移所有交易记录、订单和交易锁定。

## Web 服务器模式 (Webserver mode)

这是一项实验性功能，用于提高回测和策略开发效率。Freqtrade 将启动 Web 服务器，允许通过 FreqUI 控制回测过程。优点是只要时间框架和范围不变，数据就不会在回测运行之间重新加载。

## 显示之前的回测结果 (Show previous Backtest results)

允许您显示之前的回测结果。添加 `--show-pair-list` 会输出按利润排序的交易对列表，您可以将其复制到配置文件的黑名单中（剔除表现糟糕的对）。

## 详细回测分析 (Detailed backtest analysis)

提供高级的回测结果分析。更多详情请参考 [回测分析](advanced-backtesting.md#分析买入入场和卖出离场标签) 章节。

## 列出超参数优化结果 (List Hyperopt results)

使用 `hyperopt-list` 子命令列出之前在超优化模块中评估的迭代（Epochs）。

## 显示超参数优化结果详情 (Show details of Hyperopt results)

使用 `hyperopt-show` 子命令显示特定超优化迭代的详细信息（包括参数块）。

## 显示交易记录 (Show trades)

将选定的（或全部）交易记录从数据库打印到屏幕上。

## 策略更新工具 (Strategy-Updater)

将列出的策略（或 strategies 文件夹中的所有策略）更新为兼容 V3 版本的格式。原始策略将保留在 `user_data/strategies_orig_updater/` 目录中。
