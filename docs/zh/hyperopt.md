
# 超参数优化 (Hyperopt)

本页说明如何通过寻找最佳参数来优化您的策略，这一过程称为超参数优化。机器人使用 `optuna` 软件包中包含的算法来实现这一目标。
搜索过程将耗尽您的所有 CPU 核心，让您的笔记本电脑听起来像架战斗机，而且仍然需要很长时间。

通常，最佳参数的搜索从几个随机组合开始（详见[下文](#可重复的结果)），然后使用 optuna 的一种采样算法（目前为 NSGAIIISampler）在搜索超空间中快速找到一组使 [损失函数](#损失函数-loss-functions) 值最小的参数组合。

超参数优化需要历史数据可用，就像回测一样（超优化多次运行回测，每次使用不同的参数）。
要了解如何获取感兴趣的交易对和交易所的数据，请转到文档的 [数据下载](data-download.md) 部分。

::: info
根据 [Issue #1133](https://github.com/freqtrade/freqtrade/issues/1133) 的发现，仅使用 1 个 CPU 核心时，超参数优化可能会崩溃。
:::

::: info
自 2021.4 版本起，您不再需要编写单独的超参数优化类，可以直接在策略中配置参数。
旧方法支持到 2021.8 版本，并已在 2021.9 版本中移除。
:::

## 安装超参数优化依赖项

由于运行机器人本身并不需要超参数优化依赖项，且其体积较大，且在某些平台（如 Raspberry Pi）上不易构建，因此默认不安装它们。在运行超参数优化之前，您需要按照本节下文所述安装相应的依赖项。

::: info
由于超参数优化是一个资源密集型系统，不建议也不支持在 Raspberry Pi 上运行。
:::

### Docker

Docker 镜像中已包含超参数优化依赖项，无需进一步操作。

### 简易安装脚本 (setup.sh) / 手动安装

```bash
source .venv/bin/activate
pip install -r requirements-hyperopt.txt
```

## 超参数优化命令参考

``` output
用法: freqtrade hyperopt [-h] [-v] [--no-color] [--logfile FILE] [-V]
                          [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                          [--strategy-path PATH] [--recursive-strategy-search]
                          [--freqaimodel NAME] [--freqaimodel-path PATH]
                          [-i TIMEFRAME] [--timerange TIMERANGE]
                          [--data-format-ohlcv {json,jsongz,feather,parquet}]
                          [--max-open-trades INT]
                          [--stake-amount STAKE_AMOUNT] [--fee FLOAT]
                          [-p PAIRS [PAIRS ...]] [--hyperopt-path PATH]
                          [--eps] [--enable-protections]
                          [--dry-run-wallet DRY_RUN_WALLET]
                          [--timeframe-detail TIMEFRAME_DETAIL] [-e INT]
                          [--spaces SPACES [SPACES ...]] [--print-all]
                          [--print-json] [-j JOBS] [--random-state INT]
                          [--min-trades INT] [--hyperopt-loss NAME]
                          [--disable-param-export] [--ignore-missing-spaces]
                          [--analyze-per-epoch] [--early-stop INT]

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
                        将命令限制在这些交易对。交易对之间用空格分隔。
  --hyperopt-path PATH  为超参数优化损失函数指定额外的查找路径。
  --eps, --enable-position-stacking
                        允许多次买入同一个交易对（仓位堆叠）。仅适用于回测和超参数优化。由此获得的结果无法在模拟/实盘交易中重现。
  --enable-protections, --enableprotections
                        为回测启用保护设置。会显著减慢回测速度，但会包含配置的保护措施。
  --dry-run-wallet, --starting-balance DRY_RUN_WALLET
                        起始余额，用于回测/超优化和模拟运行。
  --timeframe-detail TIMEFRAME_DETAIL
                        指定回测的精细时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  -e, --epochs INT      指定迭代次数 (默认: 100)。
  --spaces SPACES [SPACES ...]
                        指定要优化的参数空间。空格分隔列表。可用内置选项: default, all, buy, sell, enter, exit, roi, stoploss, trailing, protection, trades。默认: `default` - 包含除 'trailing', 'protection', 和 'trades' 之外的所有空间。
  --print-all           打印所有结果，而不仅仅是最好的结果。
  --print-json          以 JSON 格式打印输出。
  -j, --job-workers JOBS
                        并发运行超优化的作业数。如果为 -1 (默认)，使用所有 CPU；为 -2，使用除一个以外的所有 CPU，依此类推。如果为 1，则不使用并行计算代码。
  --random-state INT    为可重复的结果设置随机状态正整数。
  --min-trades INT      为评估设置最小期望交易数 (默认: 1)。
  --hyperopt-loss, --hyperoptloss NAME
                        指定损失函数类的名称。不同的函数会产生完全不同的结果，因为优化的目标不同。
  --disable-param-export
                        禁用自动参数导出。
  --ignore-missing-spaces, --ignore-unparameterized-spaces
                        忽略不包含任何参数的请求空间的错误。
  --analyze-per-epoch   每个 epoch 运行一次 populate_indicators。
  --early-stop INT      如果在此次数内没有改进，则提前停止 (默认: 0)。
```

### 超参数优化清单

根据您要优化的空间，只需满足以下部分要求：

* 定义 `space='buy'` 的参数 - 用于进入信号优化
* 定义 `space='sell'` 的参数 - 用于离场信号优化
* 定义 `space='enter'` 的参数 - 用于进入信号优化
* 定义 `space='exit'` 的参数 - 用于离场信号优化
* 定义 `space='protection'` 的参数 - 用于保护设置优化
* 定义 `space='random_spacename'` 的参数 - 以更好地控制哪些参数一起优化

::: info
`populate_indicators` 需要创建任何空间可能使用的所有指标，否则超参数优化将无法工作。
:::

很少情况下，您可能还需要创建一个名为 `HyperOpt` 的 [嵌套类](advanced-hyperopt.md#覆盖预定义空间) 并实现：

* `roi_space` - 用于自定义 ROI 优化
* `generate_roi_table` - 用于自定义 ROI 表生成
* `stoploss_space` - 用于自定义止损优化
* `trailing_space` - 用于自定义追踪止损优化
* `max_open_trades_space` - 用于自定义最大开仓数优化

::: tip 快速优化 ROI、止损和追踪止损
您可以快速优化 `roi`, `stoploss` 和 `trailing` 空间，而无需更改策略中的任何内容。

``` bash
freqtrade hyperopt --hyperopt-loss SharpeHyperOptLossDaily --spaces roi stoploss trailing --strategy MyWorkingStrategy --config config.json -e 100
```
:::

### 超参数优化执行逻辑

超参数优化首先会将数据加载到内存中，并为每个交易对运行一次 `populate_indicators()` 以生成所有指标，除非指定了 `--analyze-per-epoch`。

然后，超参数优化将衍生出不同的进程，并一遍又一遍地运行回测，改变定义的 `--spaces` 部分中的参数。

对于每一组新参数，Freqtrade 首先运行 `populate_entry_trend()`，接着运行 `populate_exit_trend()`，然后运行常规回测流程来模拟交易。

回测结束后，结果被传递到 [损失函数](#损失函数-loss-functions)，该函数将评估此结果比之前的更好还是更差。基于损失函数的结果，超参数优化将决定下一轮回测要尝试的一组新参数。

### 配置您的守卫 (Guards) 和触发器 (Triggers)

您需要在策略文件中更改两个地方来添加一个新的超参数优化参数：

* 在类级别定义超优化应优化的参数。
* 在 `populate_entry_trend()` 中使用定义的参数值代替原始常量。

通常有两种类型的指标：1. `guards`（守卫）和 2. `triggers`（触发器）。

1. 守卫是像 "如果 ADX < 10 则永不进场" 或 "如果当前价格超过 EMA10 则永不进场" 这样的条件。
2. 触发器是在特定时刻实际触发进场的条件，如 "当 EMA5 金叉 EMA10 时进场" 或 "当收盘价触及布林带下轨时进场"。

::: info 守卫和触发器
从技术上讲，守卫和触发器之间没有区别。然而，本指南做出这种区分是为了明确信号不应该是“粘性”的。粘性信号是指多根 K 线都处于激活状态的信号。这可能导致延迟进场。
:::

#### 离场信号优化

离场信号也可以类似进行优化。
* 在类级别定义参数，命名为 `sell_*` 或显式定义 `space='sell'`。
* 在 `populate_exit_trend()` 中使用定义的参数值。

## 揭开谜团

假设您很好奇：应该使用 MACD 交叉还是布林带下轨来触发做多进场。
您还想知道是否应该使用 RSI 或 ADX 来辅助决策。如果是，应该使用什么值？

### 定义要使用的指标

``` python
class MyAwesomeStrategy(IStrategy):
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['adx'] = ta.ADX(dataframe)
        dataframe['rsi'] = ta.RSI(dataframe)
        macd = ta.MACD(dataframe)
        dataframe['macd'] = macd['macd']
        dataframe['macdsignal'] = macd['macdsignal']
        # ...
        return dataframe
```

### 可超优化的参数

```python
class MyAwesomeStrategy(IStrategy):
    buy_adx = DecimalParameter(20, 40, decimals=1, default=30.1, space="buy")
    buy_rsi = IntParameter(20, 40, default=30, space="buy")
    buy_adx_enabled = BooleanParameter(default=True, space="buy")
    buy_rsi_enabled = CategoricalParameter([True, False], default=False, space="buy")
    buy_trigger = CategoricalParameter(["bb_lower", "macd_cross_signal"], default="bb_lower", space="buy")
```

::: info 参数空间分配
参数必须分配给名为 `buy_*`, `sell_*`, `enter_*`, `exit_*` 或 `protection_*` 的变量，或者显式指定 `space`。
:::

## 参数类型

* `IntParameter` - 整数。
* `DecimalParameter` - 带有有限位小数的浮点数（默认 3 位）。
* `RealParameter` - 无精度限制的浮点数（由于可能性接近无限，很少使用）。
* `CategoricalParameter` - 预定选项。
* `BooleanParameter` - `CategoricalParameter([True, False])` 的简写。

::: warning
超优化参数不能在 `populate_indicators` 中使用，因为超优化不会为每个 epoch 重新计算指标。
:::

## 优化指标参数

(此处内容演示了如何在 `populate_indicators` 中通过循环生成一系列候选指标列，从而实现对指标周期的优化。)

::: info 性能提示
移动计算到 `populate_entry_trend()` 或使用 `--analyze-per-epoch` 可以减少 RAM 使用，但会增加 CPU 负载。
:::

## 优化保护设置 (Protections)

Freqtrade 还可以优化保护设置。策略需要将 "protections" 定义为返回配置列表的属性。

## 损失函数 (Loss-functions)

每次超参数调优都需要一个目标，通常定义为损失函数。它应该随结果理想程度的提高而减小。

内置损失函数：
* `ShortTradeDurHyperOptLoss` - 侧重于短交易周期和避免亏损（默认）。
* `OnlyProfitHyperOptLoss` - 仅考虑利润。
* `SharpeHyperOptLoss` / `SharpeHyperOptLossDaily` - 优化夏普比率。
* `SortinoHyperOptLoss` / `SortinoHyperOptLossDaily` - 优化索提诺比率。
* `MaxDrawDownHyperOptLoss` - 最小化最大回撤。
* `MaxDrawDownPerPairHyperOptLoss` - 每对回撤优化，防止单对主导结果。
* `MultiMetricHyperOptLoss` - 平衡多种指标（利润、回撤、胜率等）。

## 执行超参数优化

```bash
freqtrade hyperopt --config config.json --hyperopt-loss <hyperoptlossname> --strategy <strategyname> -e 500 --spaces all
```

`-e` 选项设置迭代次数。经验表明，500-1000 次后通常不会有太大改进。
`--early-stop` 可用于在没有改进时提前停止。

### 使用不同的历史数据源

使用 `--datadir PATH`。

### 使用更小的数据子集或搜索空间

使用 `--timerange` 限制时间，或使用 `--spaces` 限制优化范围（如 `roi stoploss`）。

## 理解超参数优化结果

一旦完成，您将看到最佳结果及对应的参数块，例如 `buy_params`。

### 自动将参数应用于策略

超优化运行的结果会写入策略旁的 JSON 文件（如 `MyAwesomeStrategy.json`）。机器人会自动加载它。您也可以手动将结果复制到策略类的类变量中。

优先级：配置 > 参数文件 > 策略中的 `*_params` > 参数默认值。

### 理解 ROI 和止损结果

如果您优化了 ROI 或止损，结果将包含一个 `minimal_roi` 表或一个 `stoploss` 值。

## 可重复的结果

通过 `--random-state` 设置种子。如果不设置，Freqtrade 会随机选择一个并在日志中显示。

## 位置堆叠和禁用最大仓位限制

使用 `--eps` 允许买入同一个交易对多次。使用极大的 `--max-open-trades` 来解除开仓限制。

## 内存不足 (OOM) 错误

* 减少交易对。
* 缩短时间范围。
* 避免使用 `--timeframe-detail`。
* 减少并行任务数 (`-j`)。
* 使用 `--analyze-per-epoch`。

## 验证回测结果

将优化后的参数应用到策略后，务必进行一次常规回测以确认一切正常。确保回测使用的配置（时间范围、时间框架等）与超优化时一致。
