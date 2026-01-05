# 看前分析 (Lookahead analysis)

本页面介绍了如何验证您的策略是否存在看前偏差 (Lookahead bias)。

看前偏差是任何策略的克星，因为有时很容易引入这种偏差，但却很难检测到。

回测会初始化所有时间戳（将整个数据帧加载到内存中）并一次性计算所有指标。
这意味着，如果您的指标或入场/离场信号查阅了未来的 K 线，这将使您的回测结果失真。

`lookahead-analysis` 命令需要可用的历史数据。
要了解如何获取您感兴趣的交易对和交易所的数据，请参阅文档的 [数据下载](data-download.md) 部分。
`lookahead-analysis` 也支持 freqai 策略。

此命令在内部链接回测并对策略进行探测，以诱导其显示出看前偏差。
这是通过不查阅策略代码本身，而是通过与完整回测相比，观察发生变化的指标值和移动的入场/离场点来实现的。

`lookahead-analysis` 可以使用 [回测 (Backtesting)](backtesting.md) 的典型选项，但会强制执行以下选项：

- `--cache` 强制设置为 "none"。
- `--max-open-trades` 强制设置为至少等于交易对的数量。
- `--dry-run-wallet` 强制设置为基本无限（10 亿）。
- `--stake-amount` 强制设置为静态的 10000 (10k)。
- `--enable-protections` 强制设置为关闭。
- `order_types` 强制设置为 "market"（延迟入场），除非设置了 `--allow-limit-orders`。

设置这些是为了避免用户意外产生误报。

## Lookahead-analysis 命令参考

``` output
usage: freqtrade lookahead-analysis [-h] [-v] [--no-color] [--logfile FILE]
                                    [-V] [-c PATH] [-d PATH] [--userdir PATH]
                                    [-s NAME] [--strategy-path PATH]
                                    [--recursive-strategy-search]
                                    [--freqaimodel NAME]
                                    [--freqaimodel-path PATH] [-i TIMEFRAME]
                                    [--timerange TIMERANGE]
                                    [--data-format-ohlcv {json,jsongz,feather,parquet}]
                                    [--max-open-trades INT]
                                    [--stake-amount STAKE_AMOUNT]
                                    [--fee FLOAT] [-p PAIRS [PAIRS ...]]
                                    [--enable-protections]
                                    [--enable-dynamic-pairlist]
                                    [--dry-run-wallet DRY_RUN_WALLET]
                                    [--timeframe-detail TIMEFRAME_DETAIL]
                                    [--strategy-list STRATEGY_LIST [STRATEGY_LIST ...]]
                                    [--export {none,trades,signals}]
                                    [--backtest-filename PATH]
                                    [--backtest-directory PATH]
                                    [--freqai-backtest-live-models]
                                    [--minimum-trade-amount INT]
                                    [--targeted-trade-amount INT]
                                    [--lookahead-analysis-exportfilename LOOKAHEAD_ANALYSIS_EXPORTFILENAME]
                                    [--allow-limit-orders]

选项:
  -h, --help            显示此帮助消息并退出
  -i, --timeframe TIMEFRAME
                        指定时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 K 线 (OHLCV) 数据存储格式 (默认: `feather`)。
  --max-open-trades INT
                        覆盖配置设置中的 `max_open_trades` 值。
  --stake-amount STAKE_AMOUNT
                        覆盖配置设置中的 `stake_amount` 值。
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
                        指定回测的详细时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  --strategy-list STRATEGY_LIST [STRATEGY_LIST ...]
                        提供要回测的策略列表（空格分隔）。请注意，时间框架需要在配置中或通过命令行设置。当与 `--export trades` 一起使用时，策略名称会注入到文件名中。
  --export {none,trades,signals}
                        导出回测结果 (默认: trades)。
  --backtest-filename, --export-filename PATH
                        回测结果的文件名。例如：`--backtest-filename=backtest_results_2020-09-27_16-20-48.json`。
  --backtest-directory, --export-directory PATH
                        用于存储回测结果的目录。
  --freqai-backtest-live-models
                        使用现成模型运行回测。
  --minimum-trade-amount INT
                        看前分析的最小交易数量。
  --targeted-trade-amount INT
                        看前分析的目标交易数量。
  --lookahead-analysis-exportfilename LOOKAHEAD_ANALYSIS_EXPORTFILENAME
                        用于存储看前分析结果的 csv 文件名。
  --allow-limit-orders  在看前分析中允许限价单（可能在结果中导致误报）。

通用参数:
  -v, --verbose         详细模式 (-vv 更多, -vvv 获取所有消息)。
  -V, --version         显示程序版本号并退出
  -c, --config PATH     指定配置文件。
  -d, --datadir, --data-dir PATH
                        历史回测数据的交易所基础目录路径。
  --userdir, --user-data-dir PATH
                        用户数据目录路径。
```

::: info
上述输出减少到了 `lookahead-analysis` 在常规回测命令之上添加的选项。
:::

### 简介

许多策略在程序员不知情的情况下陷入了看前偏差的陷阱。这通常会使策略回测看起来有利可图，有时甚至达到极端，但这并不现实，因为策略通过查阅其在模拟或实盘模式下无法获得的数据来“作弊”。

策略可以“作弊”的原因是 freqtrade 回测过程在开始时填充了完整的数据帧，包括所有 K 线时间戳。如果程序员不小心或不清楚内部工作机制（有时确实很难发现），那么策略就会查阅未来数据。

此命令旨在以看前偏差的形式尝试验证策略的有效性。

### 命令如何运作？

它将首先对所有交易对进行回测，为指标和入场/离场生成基准 (baseline)。
在初始回测运行后，它将查看是否满足 `minimum-trade-amount`（最小交易数量），如果不满足，则取消此策略的看前分析。
如果发生这种情况，请使用更宽的时间范围以获取更多分析所需的交易，或使用发生更多交易的时间范围。

设置基准后，它将分别为每个入场和离场执行额外的回测运行。
当这些验证回测完成后，它将比较两个数据帧（基准和切片后的）中各列的值差异并报告偏差。
在所有信号都经过验证或证伪后，将生成一个结果表供用户查看。

### 如何找到并消除偏差？我能挽救一个有偏差的策略吗？

如果您在网上找到了一个有偏差的策略，并希望在没有偏差的情况下获得相同的结果，那么大多数情况下您都会失望。通常，策略中的偏差是“好得令人难以置信”的利润的驱动因素。消除那些提高偏差利润的条件或指标，通常会使策略显著变差。如果偏差指标或条件不是策略的核心，或者存在其他没有偏差的入场和离场信号，您或许可以部分挽救它。

### 看前偏差的例子

- `shift(-10)` 查阅未来 10 根 K 线。
- 在 populate_* 函数中使用 `iloc[]` 访问数据帧中的特定行。
- 如果不严密控制循环的数字，for 循环很容易引入看前偏差。
- 聚合函数如 `.mean()`、`.min()` 和 `.max()`，如果没有滚动窗口（rolling window），将计算 **整个** 数据帧的值，因此信号 K 线将“看到”包含未来 K 线的值。
  一个没有偏差的例子是使用 `rolling()` 回溯 K 线：
  例如 `dataframe['volume_mean_12'] = dataframe['volume'].rolling(12).mean()`
- `ta.MACD(dataframe, 12, 26, 1)` 在信号周期为 1 时会引入偏差。

### 结果表中的列是什么意思？

- `filename`: 检查的策略文件名
- `strategy`: 检查的策略类名
- `has_bias`: 看前分析的结果。`No` 是好的，`Yes` 是坏的。
- `total_signals`: 检查的信号数量（默认是 20）
- `biased_entry_signals`: 在这么多入场信号中发现了偏差
- `biased_exit_signals`: 在这么多离场信号中发现了偏差
- `biased_indicators`: 显示在 populate_indicators 中定义的指标本身

如果您有与某些离场配对的有偏差的入场信号，您可能会在 `biased_exit_signals` 中得到误报。然而，一个有偏差的入场通常也会导致一个有偏差的离场，即使离场本身并没有产生偏差 —— 尤其是当您的入场和离场条件使用相同的有偏差指标时。

**请先解决入场中的偏差，然后再处理离场。**

### 注意事项

- `lookahead-analysis` 只能验证/证伪它计算和验证的交易。如果策略有许多不同的信号/信号类型，则由您选择合适的参数，以确保所有信号至少触发一次。未触发的信号将无法得到验证。这会导致假阴性结果，即策略被报告为无偏差。
- `lookahead-analysis` 可以访问相同的回测选项，这可能会引入问题。请不要使用任何类似启用头寸叠加 (position stacking) 的选项，因为这会扭曲检查的信号数量。如果您决定这样做，请加倍确定您永远不会耗尽 `max_open_trades` 槽位，并且回测钱包配置中有足够的资金。
- 限价单结合 `custom_entry_price()` 和 `custom_exit_price()` 回调可能会导致延迟入场和离场，从而产生误报。为了避免这种情况 —— 此命令强制使用市价单 (market orders)。这隐含地意味着 `custom_entry_price()` 和 `custom_exit_price()` 回调不会被调用。
  使用 `--lookahead-allow-limit-orders` 将跳过覆盖并使用您配置的订单类型 —— 但已证明这最终可能会产生误报。
- 在结果表中，`biased_indicators` 列会错误地将 `set_freqai_targets()` 中定义的 FreqAI 目标指标标记为有偏差。
  **这些不是偏差，可以放心忽略。**
