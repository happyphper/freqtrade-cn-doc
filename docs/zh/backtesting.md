
# 回测 (Backtesting)

本页说明如何使用回测来验证您的策略性能。

回测需要历史数据可用。
要了解如何获取您感兴趣的交易对和交易所的数据，请转到文档的 [数据下载](data-download.md) 部分。

回测也可以在 [Web 服务器模式](freq-ui.md#回测) 中使用，这允许您通过 Web 界面运行回测。

## 回测命令参考

``` output
用法: freqtrade backtesting [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                             [--strategy-path PATH]
                             [--recursive-strategy-search]
                             [--freqaimodel NAME] [--freqaimodel-path PATH]
                             [-i TIMEFRAME] [--timerange TIMERANGE]
                             [--data-format-ohlcv {json,jsongz,feather,parquet}]
                             [--max-open-trades INT]
                             [--stake-amount STAKE_AMOUNT] [--fee FLOAT]
                             [-p PAIRS [PAIRS ...]] [--eps]
                             [--enable-protections]
                             [--enable-dynamic-pairlist]
                             [--dry-run-wallet DRY_RUN_WALLET]
                             [--timeframe-detail TIMEFRAME_DETAIL]
                             [--strategy-list STRATEGY_LIST [STRATEGY_LIST ...]]
                             [--export {none,trades,signals}]
                             [--backtest-filename PATH]
                             [--backtest-directory PATH]
                             [--breakdown {day,week,month,year,weekday} [{day,week,month,year,weekday} ...]]
                             [--cache {none,day,week,month}]
                             [--freqai-backtest-live-models] [--notes TEXT]

选项:
  -h, --help            显示此帮助消息并退出
  -i, --timeframe TIMEFRAME
                        指定时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  --data-format-ohlcv {json,jsongz,feather,parquet}
                        下载的 K 线 (OHLCV) 数据的存储格式 (默认: `feather`)。
  --max-open-trades INT
                        覆盖配置设置中的 `max_open_trades` 值。
  --stake-amount STAKE_AMOUNT
                        覆盖配置设置中的 `stake_amount` 值。
  --fee FLOAT           指定手续费率。将应用两次（进场和离场）。
  -p, --pairs PAIRS [PAIRS ...]
                        限制这些交易对。
  --eps, --enable-position-stacking
                        允许多次买入同一个交易对（仓位堆叠）。仅适用于回测和超参数优化。
  --enable-protections, --enableprotections
                        为回测启用保护设置。
  --enable-dynamic-pairlist
                        在回测中启用动态交易对列表刷新。
  --dry-run-wallet, --starting-balance DRY_RUN_WALLET
                        起始余额。
  --timeframe-detail TIMEFRAME_DETAIL
                        指定用于回测的精细时间框架。
  --strategy-list STRATEGY_LIST [STRATEGY_LIST ...]
                        空格分隔的策略列表。
  --export {none,trades,signals}
                        导出回测结果 (默认: trades)。
  --cache {none,day,week,month}
                        加载缓存的回测结果 (默认: day)。
```

## 使用回测测试您的策略

现在您有了不错的进场和离场策略以及一些历史数据，您想针对真实数据进行测试。这就是我们所说的 [回测](https://en.wikipedia.org/wiki/Backtesting)。

回测将使用配置文件中的加密货币（交易对），并默认从 `user_data/data/<exchange>` 加载历史 K 线 (OHLCV) 数据。
如果没有可用的数据，回测会要求您先使用 `freqtrade download-data` 下载。

回测结果将确认您的机器人盈利的几率是否大于亏损的几率。
所有利润计算都包含手续费，Freqtrade 将使用交易所的默认手续费进行计算。

::: warning 在回测中使用动态交易对列表
使用动态交易对列表是可能的，但它依赖于当前的市场条件，这不会反映交易对列表的历史状态。此外，使用 StaticPairlist 以外的交易对列表时，无法保证回测结果的可重现性。详情请参考 [交易对列表文档](plugins.md#交易对列表和交易对列表处理程序)。
:::

::: info
默认情况下，Freqtrade 将回测结果导出到 `user_data/backtest_results`。导出的交易数据可用于 [进一步分析](#进一步的回测结果分析) 或用于 [绘图子命令](plotting.md#绘制价格和指标) 进行可视化。
:::

### 起始余额

回测需要起始余额，可以通过命令行参数 `--dry-run-wallet <balance>` 或配置设置 `dry_run_wallet` 提供。此金额必须高于 `stake_amount`。

### 动态投入金额

回测支持 [动态投入金额](configuration.md#动态投入金额)，将 `stake_amount` 设置为 `"unlimited"`，会将起始余额平均分成 `max_open_trades` 份。早期交易的利润会导致后续更高的投入金额，从而在回测期间实现复利。

### 示例回测命令

使用默认的 5 分钟 K 线数据：
```bash
freqtrade backtesting --strategy AwesomeStrategy
```

使用 1 分钟 K 线数据：
```bash
freqtrade backtesting --strategy AwesomeStrategy --timeframe 1m
```

提供 1000 的自定义起始余额：
```bash
freqtrade backtesting --strategy AwesomeStrategy --dry-run-wallet 1000
```

使用不同的磁盘历史数据源：
```bash
freqtrade backtesting --strategy AwesomeStrategy --datadir user_data/data/binance-20180101 
```

比较多个策略：
```bash
freqtrade backtesting --strategy-list SampleStrategy1 AwesomeStrategy --timeframe 5m
```

提供自定义手续费（例如 0.1%）：
```bash
freqtrade backtesting --fee 0.001
```

使用时间范围过滤回测数据集：
```bash
freqtrade backtesting --timerange=20190501-20190801
```

## 理解回测结果

回测中最重要的是理解结果。报告包含：

1. **BACKTESTING REPORT**: 包含所有交易（包括未平仓交易）汇总表。
2. **LEFT OPEN TRADES REPORT**: 回测结束时因强制离场而未平仓的交易。
3. **ENTER TAG STATS**: 按进场标签分类的统计。
4. **EXIT REASON STATS**: 按离场原因分类的统计。
5. **MIXED TAG STATS**: 进场标签和离场原因的组合统计。
6. **SUMMARY METRICS**: 整个策略的关键指标（夏普比率、回撤、利润因子等）。

### 回测报告表

显示每个交易对的交易次数、平均利润、总利润、平均持仓时间及胜/平/负统计。

### 摘要指标 (Summary Metrics)

- `Total profit %`: 总利润比例。
- `CAGR %`: 复合年增长率。
- `Sortino` / `Sharpe` / `Calmar`: 衡量风险调整后盈利能力的比率。
- `Profit factor`: 总赢利除以总亏损。
- `Expectancy`: 每笔交易的预期收益。
- `Absolute drawdown`: 最大绝对回撤值。
- `Market change`: 回测期间市场的整体变化。

### 日/周/月/年分析

使用 `--breakdown <>` 开关可以获得按阶段划分的结果：
``` bash
freqtrade backtesting --strategy MyAwesomeStrategy --breakdown month year
```

### 回测结果缓存

为了节省时间，当策略和配置未发生变化时，回测默认会重复使用最近一天内的缓存结果。使用 `--cache none` 强制刷新。

### 回测输出文件

Freqtrade 产生的是一个 zip 文件，包含：
- JSON 格式的回测报告。
- Feather 格式的市场变化数据。
- 策略文件和参数配置的副本。

## 回测的假设

由于回测缺乏 K 线内部的详细波动信息，它基于以下假设：
- 遵守交易所交易限制。
- 进场通常发生在开盘价。
- 订单按请求价格全额成交（无滑损）。
- 离场信号在下根 K 线开盘时触发。
- **离场优先级**: 离场信号 > 止损 > ROI > 追踪止损。
- **止损计算**: 即使低点更低，止损也恰好按止损价成交。
- 仓位反转（仅限期货）会在相同时间发生。

## 提高回测准确性

回测的最大局限是不知道 K 线内部的价格波动。为了缓解这一点，可以使用 `--timeframe-detail` 参数来模拟 K 线内部运动：

``` bash
freqtrade backtesting --strategy AwesomeStrategy --timeframe 1h --timeframe-detail 5m
```

这不仅提高了模拟的真实性，还能运行 `custom_exit` 等回调函数多次（例如在 1 小时主线下运行 12 次 5 分钟细线）。

## 下一步

如果您的策略已确认盈利，下一步是学习 [如何使用 Hyperopt 寻找最佳参数](hyperopt.md)。
