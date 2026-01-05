
# 高级回测分析

## 分析买入/进场和卖出/离场标签

了解策略在不同买入进场条件下的表现非常有帮助。您可能希望看到比默认回测输出提供的更复杂的各买入和离场条件的统计数据。您还可能希望确定导致交易开启的信号 K 线上的指标值。

::: info
以下买入原因分析仅适用于回测，*不适用于超参数优化 (Hyperopt)*。
:::

我们需要在运行回测时设置 `--export` 选项为 `signals`，以启用信号 **和** 交易的导出：

``` bash
freqtrade backtesting -c <config.json> --timeframe <tf> --strategy <strategy_name> --timerange=<timerange> --export=signals
```

这将告诉 Freqtrade 输出一个包含策略、交易对以及导致进入和离场信号的 K 线 DataFrame 的 pickle 字典。
根据您的策略产生的进场次数，此文件可能会变得相当大，因此请定期检查您的 `user_data/backtest_results` 文件夹以删除旧的导出文件。

在运行下次回测之前，请确保删除旧的回测结果，或者使用 `--cache none` 选项运行回测，以确保没有使用缓存的结果。

如果一切顺利，您现在应该在 `user_data/backtest_results` 文件夹中看到 `backtest-result-{timestamp}_signals.pkl` 和 `backtest-result-{timestamp}_exited.pkl` 文件。

要分析进场/离场标签，我们现在需要使用 `freqtrade backtesting-analysis` 命令，并提供由空格分隔的 `--analysis-groups` 选项参数：

``` bash
freqtrade backtesting-analysis -c <config.json> --analysis-groups 0 1 2 3 4 5
```

此命令将读取最近的回测结果。`--analysis-groups` 选项用于指定显示每个组或交易利润的各种表格输出，从最简单 (0) 到最详细的按对、按买入和按卖出标签 (4)：

* 0: 按 enter_tag 分类的总体胜率和利润摘要
* 1: 按 enter_tag 分组的利润摘要
* 2: 按 enter_tag 和 exit_tag 分组的利润摘要
* 3: 按交易对和 enter_tag 分组的利润摘要
* 4: 按交易对、enter_tag 和 exit_tag 分组的利润摘要（这可能会变得非常庞大）
* 5: 按 exit_tag 分组的利润摘要

运行 `-h` 选项可以查看更多选项。

### 使用回测文件名 (backtest-filename)

默认情况下，`backtesting-analysis` 处理 `user_data/backtest_results` 目录中最近的回测结果。
如果您想分析更早的回测结果，请使用 `--backtest-filename` 选项指定所需的文件。通过提供相关回测结果的文件名，这让您可以随时重新访问和重新分析历史回测输出：

``` bash
freqtrade backtesting-analysis -c <config.json> --timeframe <tf> --strategy <strategy_name> --timerange <timerange> --export signals --backtest-filename backtest-result-2025-03-05_20-38-34.zip
```

您应该在日志中看到类似于以下内容的输出，显示已导出的带有时间戳的文件名：

```
2022-06-14 16:28:32,698 - freqtrade.misc - INFO - dumping json to "mystrat_backtest-2022-06-14_16-28-32.json"
```

然后您可以在 `backtesting-analysis` 中使用该文件名：

```
freqtrade backtesting-analysis -c <config.json> --backtest-filename=mystrat_backtest-2022-06-14_16-28-32.json
```

若要使用来自不同结果目录的结果，可以使用 `--backtest-directory` 指定目录：

``` bash
freqtrade backtesting-analysis -c <config.json> --backtest-directory custom_results/ --backtest-filename mystrat_backtest-2022-06-14_16-28-32.json
```

### 调整要显示的买入和卖出标签

若要在显示的输出中仅显示某些买入和卖出标签，请使用以下两个选项：

```
--enter-reason-list : 空格分隔的要分析的进场信号列表。默认值："all"
--exit-reason-list : 空格分隔的要分析的离场信号列表。默认值："all"
```

例如：

```bash
freqtrade backtesting-analysis -c <config.json> --analysis-groups 0 2 --enter-reason-list enter_tag_a enter_tag_b --exit-reason-list roi custom_exit_tag_a stop_loss
```

### 输出信号 K 线指标值

`freqtrade backtesting-analysis` 的真正强大之处在于能够打印出信号 K 线上的指标值，从而允许对买入信号指标进行精细的调查和调整。要为给定的指标集打印一列，请使用 `--indicator-list` 选项：

```bash
freqtrade backtesting-analysis -c <config.json> --analysis-groups 0 2 --enter-reason-list enter_tag_a enter_tag_b --exit-reason-list roi custom_exit_tag_a stop_loss --indicator-list rsi rsi_1h bb_lowerband ema_9 macd macdsignal
```

这些指标必须存在于策略的主 DataFrame 中（无论是主时间框架还是信息性时间框架），否则它们在脚本输出中将被忽略。

::: info 指标列表
指标值将同时显示为进场点和离场点。如果指定了 `--indicator-list all`，为了避免由于列表过大，通常只显示进场点的指标。
:::

分析中包含了一系列 K 线和交易相关的字段，通过将其包含在指标列表中即可自动访问，包括：

- **open_date     :** 交易开启时间
- **close_date    :** 交易关闭时间
- **min_rate      :** 持仓期间的最低价格
- **max_rate      :** 持仓期间的最高价格
- **open          :** 信号 K 线的开盘价
- **close         :** 信号 K 线的收盘价
- **high          :** 信号 K 线的最高价
- **low           :** 信号 K 线的最低价
- **volume        :** 信号 K 线的成交量
- **profit_ratio  :** 交易利润率
- **profit_abs    :** 交易的绝对利润额

#### 指标值输出示例

```bash
freqtrade backtesting-analysis -c user_data/config.json --analysis-groups 0 --indicator-list chikou_span tenkan_sen 
```

在这个例子中，我们的目标是显示交易进场点和离场点的 `chikou_span` 和 `tenkan_sen` 指标值。

指标的示例输出可能如下所示：

| pair      | open_date                 | enter_reason | exit_reason | chikou_span (entry) | tenkan_sen (entry) | chikou_span (exit) | tenkan_sen (exit) |
|-----------|---------------------------|--------------|-------------|---------------------|--------------------|--------------------|-------------------|
| DOGE/USDT | 2024-07-06 00:35:00+00:00 |              | exit_signal | 0.105               | 0.106              | 0.105              | 0.107             |
| BTC/USDT  | 2024-08-05 14:20:00+00:00 |              | roi         | 54643.440           | 51696.400          | 54386.000          | 52072.010         |

如表所示，`chikou_span (entry)` 代表交易进场时的指标值，而 `chikou_span (exit)` 则反映了离场时的值。

针对不同点的指标添加了 `(entry)` 和 `(exit)` 后缀以示区别。

::: info 全局交易指标
某些全局交易指标没有 `(entry)` 或 `(exit)` 后缀。这些指标包括：`pair`, `stake_amount`, `max_stake_amount`, `amount`, `open_date`, `close_date`, `open_rate`, `close_rate`, `fee_open`, `fee_close`, `trade_duration`, `profit_ratio`, `profit_abs`, `exit_reason`, `initial_stop_loss_abs`, `initial_stop_loss_ratio`, `stop_loss_abs`, `stop_loss_ratio`, `min_rate`, `max_rate`, `is_open`, `enter_tag`, `leverage`, `is_short`, `open_timestamp`, `close_timestamp` 以及 `orders`。
:::

#### 根据进场或离场信号过滤指标

默认情况下，`--indicator-list` 选项显示进场和离场信号的指标值。若要仅显示进场信号的指标值，可以使用 `--entry-only` 参数。同样，若要仅显示离场信号的指标值，请使用 `--exit-only` 参数。

示例：显示进场信号的指标值：

```bash
freqtrade backtesting-analysis -c user_data/config.json --analysis-groups 0 --indicator-list chikou_span tenkan_sen --entry-only
```

::: info
使用这些过滤器时，指标名称将不会带有 `(entry)` 或 `(exit)` 后缀。
:::

### 按日期过滤交易输出

若要仅显示回测时间范围内特定日期间的交易，请提供通常的 `timerange` 选项，格式为 `YYYYMMDD-[YYYYMMDD]`：

```
--timerange : 过滤输出交易的时间范围，起始日期包含在内，结束日期不包含在内。例如：20220101-20221231
```

### 打印被拒绝的信号

使用 `--rejected-signals` 选项打印被拒绝的信号。

```bash
freqtrade backtesting-analysis -c <config.json> --rejected-signals
```

### 将表格写入 CSV

某些表格输出可能会变得非常庞大，因此直接在终端中打印并非首选。
使用 `--analysis-to-csv` 选项禁用表格向标准输出的打印，并将其写入 CSV 文件。

```bash
freqtrade backtesting-analysis -c <config.json> --analysis-to-csv
```

默认情况下，这将为您在 `backtesting-analysis` 命令中指定的每个输出表写入一个文件，例如：

```bash
freqtrade backtesting-analysis -c <config.json> --analysis-to-csv --rejected-signals --analysis-groups 0 1
```

这将在 `user_data/backtest_results` 中写入：

* rejected_signals.csv
* group_0.csv
* group_1.csv

若要覆盖文件写入的位置，请额外指定 `--analysis-csv-path` 选项。

```bash
freqtrade backtesting-analysis -c <config.json> --analysis-to-csv --analysis-csv-path another/data/path/
```
