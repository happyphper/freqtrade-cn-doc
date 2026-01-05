# 递归分析 (Recursive analysis)

本页面介绍了如何验证您的策略，由于某些指标的递归问题而导致的误差。

递归公式根据其前面的项定义序列的任何项。递归公式的一个例子是 a<sub>n</sub> = a<sub>n-1</sub> + b。

为什么这对 Freqtrade 很重要？在回测中，机器人将根据指定的时间范围获取货币对的完整数据。但在模拟/实盘运行中，机器人受限于每个交易所提供的数据量。

例如，为了计算一个名为 `steps` 的非常基础的指标，第一行的值始终为 0，而随后各行的值等于前一行的值加 1。如果我使用最近的 1000 根 K 线来计算它，那么第一行的 `steps` 值为 0，而最后一根已关闭 K 线的 `steps` 值为 999。

如果计算仅使用最近的 500 根 K 线会发生什么？那么最后一根已关闭 K 线的 `steps` 值将是 499，而不是 999。数值的这种差异意味着您的回测结果可能与您的模拟/实盘运行结果不同。

`recursive-analysis` 命令需要可用的历史数据。要了解如何获取您感兴趣的交易对和交易所的数据，请参阅文档的 [数据下载](data-download.md) 部分。

此命令基于准备不同长度的数据并据此计算指标。它本身并不回测策略，而仅计算指标。在计算完不同启动 K 线数值 (`startup_candle_count`) 的指标后，将比较所有指定 `startup_candle_count` 中最后一行的值，以查看它们与基础计算相比显示出多少差异。

命令设置：

- 使用 `-p` 选项设置您想要分析的交易对。由于我们只关注指标值，因此使用多个交易对是多余的。最好使用价格相对较高且至少具有适度波动性的交易对（如 BTC 或 ETH），以避免可能导致结果不准确的舍入问题。如果命令中未设置交易对，则用于此分析的交易对是白名单中的第一个交易对。
- 建议设置较长的时间范围（至少 5000 根 K 线），以便作为基准的初始指标计算本身几乎没有或完全没有递归问题。例如，对于 5m 时间框架，5000 根 K 线的时间范围相当于 18 天。
- `--cache` 强制设置为 "none"，以避免自动加载之前的指标计算。

除了递归公式检查外，此命令还对指标值进行简单的回看偏差 (lookahead bias) 检查。如需完整的看前检查，请使用 [回看分析 (Lookahead-analysis)](lookahead-analysis.md)。

## Recursive-analysis 命令参考

``` output
usage: freqtrade recursive-analysis [-h] [-v] [--no-color] [--logfile FILE]
                                    [-V] [-c PATH] [-d PATH] [--userdir PATH]
                                    [-s NAME] [--strategy-path PATH]
                                    [--recursive-strategy-search]
                                    [--freqaimodel NAME]
                                    [--freqaimodel-path PATH] [-i TIMEFRAME]
                                    [--timerange TIMERANGE]
                                    [--data-format-ohlcv {json,jsongz,feather,parquet}]
                                    [-p PAIRS [PAIRS ...]]
                                    [--startup-candle STARTUP_CANDLE [STARTUP_CANDLE ...]]

options:
  -h, --help            显示此帮助消息并退出
  -i, --timeframe TIMEFRAME
                        指定时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 K 线 (OHLCV) 数据存储格式。 (默认: `feather`)。
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --startup-candle STARTUP_CANDLE [STARTUP_CANDLE ...]
                        指定要检查的启动 K 线数量 (`199`, `499`, `999`, `1999`)。

通用参数:
  -v, --verbose         详细模式 (-vv 增加, -vvv 获取所有消息)。
  --no-color            禁用 hyperopt 结果的着色。如果您要将输出重定向到文件，可能很有用。
  --logfile, --log-file FILE
                        记录到指定文件。特殊值为: 'syslog', 'journald'。详情请参阅文档。
  -V, --version         显示程序版本号并退出
  -c, --config PATH     指定配置文件 (默认: `userdir/config.json` 或 `config.json`, 以存在者为准)。可以使用多个 --config 选项。可以设置为 `-` 从标准输入读取配置。
  -d, --datadir, --data-dir PATH
                        包含历史回测数据的交易所基础目录路径。要查看期货数据，请额外使用 trading-mode。
  --userdir, --user-data-dir PATH
                        用户数据目录路径。

策略参数:
  -s, --strategy NAME   指定机器人将使用的策略类名。
  --strategy-path PATH  指定额外的策略查找路径。
  --recursive-strategy-search
                        在策略文件夹中递归搜索策略。
  --freqaimodel NAME    指定自定义 freqaimodels。
  --freqaimodel-path PATH
                        指定 freqaimodels 的额外查找路径。
```

### 为什么使用奇数作为默认启动 K 线数量？

启动 K 线数量的默认值是奇数。当机器人从交易所 API 获取 K 线数据时，机器人检查的是最后一根 K 线，而其余数据是“启动 K 线”。

例如，Binance 每次 API 调用允许 1000 根 K 线。当机器人接收到 1000 根 K 线时，最后一根是“当前 K 线”，前面的 999 根是“启动 K 线”。如果将启动 K 线计数设置为 1000 而不是 999，机器人将尝试获取 1001 根 K 线。交易所 API 随后将以分页形式发送 K 线数据，例如在 Binance API 的情况下，这将分为两组——一组长度为 1000，另一组长度为 1。这导致机器人认为策略需要 1001 根 K 线的数据，因此它将下载 2000 根 K 线的数据，这意味着将有 1 根“当前 K 线”和 1999 根“启动 K 线”。

此外，交易所限制连续批量 API 调用的次数，例如 Binance 允许 5 次调用。在这种情况下，在不触及 API 速率限制的情况下，只能从 Binance API 下载 5000 根 K 线，这意味着您可以拥有的最大 `startup_candle_count` 为 4999。

请注意，此 K 线限制将来可能会由交易所在不事先通知的情况下更改。

### 命令如何运作？

- 首先使用提供的时间范围进行初始指标计算，以生成指标值的基准。
- 设置基准后，它将为每个不同的启动 K 线计数值进行额外的运行。
- 命令随后将比较最后一行 K 线处的指标值，并在表格中报告差异。

## 理解递归分析输出

这是一个其中至少一个指标存在递归公式问题的输出结果表示例：

```
| indicators   | 20      | 40      | 80     | 100    | 150     | 300     | 999    |
|--------------+---------+---------+--------+--------+---------+---------+--------|
| rsi_30       | nan%    | -6.025% | 0.612% | 0.828% | -0.140% | 0.000%  | 0.000% |
| rsi_14       | 24.141% | -0.876% | 0.070% | 0.007% | -0.000% | -0.000% | -      |
```

列标题表示分析中使用的不同 `startup_candle_count`。表格中的数值表示计算出的指标与基准值相比的偏差。

`nan%` 表示由于缺少数据而无法计算该指标的值。在此示例中，仅使用 21 根 K 线（1 根当前 K 线 + 20 根启动 K 线）无法计算长度为 30 的 RSI。

用户应评估每个指标的表格，以决定指定的 `startup_candle_count` 是否产生了足够小的偏差，从而使指标对入场和/或离场没有影响。

因此，追求绝对零偏差（由 `-` 值显示）可能不是最佳选择，因为某些指标可能需要您使用非常长的 `startup_candle_count` 才能达到零偏差。

## 注意事项

- `recursive-analysis` 仅计算并比较最后一行的指标值。输出表格报告了不同启动 K 线计数计算结果与原始基准计算结果之间的百分比差异。它是否对您的入场和离场有实际影响未包括在内。
- 理想情况是，尽管启动 K 线发生变化，指标仍没有偏差（或至少非常接近 0%）。实际上，EMA 等指标使用递归公式计算指标值，因此目标不一定是零百分比偏差，而是使偏差足够低（因此 `startup_candle_count` 足够高），从而使指标固有的递归不会对交易决策产生任何实际影响。
- `recursive-analysis` 仅在 `populate_indicators` 和 `@informative` 装饰器上运行计算。如果您将任何指标计算放在 `populate_entry_trend` 或 `populate_exit_trend` 中，它将不会被计算。
