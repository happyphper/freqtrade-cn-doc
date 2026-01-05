# 绘图 (Plotting)

本页面介绍了如何绘制价格、指标和利润图表。

::: warning 已弃用
本页面描述的命令（`plot-dataframe`、`plot-profit`）应被视为已弃用，目前处于维护模式。这主要是因为即使是中等规模的图表也可能导致的性能问题，也因为“存储文件并在浏览器中打开”从 UI 的角度来看并不直观。

虽然目前没有移除它们的计划，但它们并未得到积极维护。如果需要进行重大更改以保持其运行，它们可能会在短期内被移除。

请使用 [FreqUI](freq-ui.md) 进行绘图，它不存在同样的性能问题。
:::

## 安装与设置 (Installation / Setup)

绘图模块使用 Plotly 库。您可以通过运行以下命令来安装/升级它：

``` bash
pip install -U -r requirements-plot.txt
```

## 绘制价格和指标 (Plot price and indicators)

`freqtrade plot-dataframe` 子命令显示一个具有三个子图的交互式图表：

* 带有 K 线和跟随价格的指标（sma/ema）的主图
* 成交量柱状图
* 由 `--indicators2` 指定的其他指标

![plot-dataframe](./assets/plot-dataframe.png)

可用参数：

``` output
usage: freqtrade plot-dataframe [-h] [-v] [--no-color] [--logfile FILE] [-V]
                                [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                                [--strategy-path PATH]
                                [--recursive-strategy-search]
                                [--freqaimodel NAME] [--freqaimodel-path PATH]
                                [-p PAIRS [PAIRS ...]]
                                [--indicators1 INDICATORS1 [INDICATORS1 ...]]
                                [--indicators2 INDICATORS2 [INDICATORS2 ...]]
                                [--plot-limit INT] [--db-url PATH]
                                [--trade-source {DB,file}]
                                [--export {none,trades,signals}]
                                [--backtest-filename PATH]
                                [--timerange TIMERANGE] [-i TIMEFRAME]
                                [--no-trades]

options:
  -h, --help            显示此帮助消息并退出
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。交易对用空格分隔。
  --indicators1 INDICATORS1 [INDICATORS1 ...]
                        设置策略中要在图表第一行显示的指标。空格分隔的列表。示例：`ema3 ema5`。默认：`['sma', 'ema3', 'ema5']`。
  --indicators2 INDICATORS2 [INDICATORS2 ...]
                        设置策略中要在图表第三行显示的指标。空格分隔的列表。示例：`fastd fastk`。默认：`['macd', 'macdsignal']`。
  --plot-limit INT      指定绘图的 tick 限制。注意：过高的值会导致文件庞大。默认值：750。
  --db-url PATH         覆盖交易数据库 URL，这在自定义部署中很有用（实盘模式默认：`sqlite:///tradesv3.sqlite`，模拟模式：`sqlite:///tradesv3.dryrun.sqlite`）。
  --trade-source {DB,file}
                        指定交易来源（可以是数据库 DB 或文件 (回测文件)）。默认值：file。
  --export {none,trades,signals}
                        导出回测结果（默认：trades）。
  --backtest-filename, --export-filename PATH
                        用于回测结果的文件名。示例：`--backtest-filename=backtest_results_2020-09-27_16-20-48.json`。假定基础目录为 `user_data/backtest_results/` 或 `--export-directory`。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  -i, --timeframe TIMEFRAME
                        指定时间框架 (`1m`, `5m`, `30m`, `1h`, `1d`)。
  --no-trades           跳过使用来自回测文件和数据库的交易。

通用参数：
  -v, --verbose         详细模式（-vv 增加，-vvv 获取所有消息）。
  --no-color            禁用 hyperopt 结果的着色。
  --logfile, --log-file FILE
                        记录到指定文件。
  -V, --version         显示程序版本号并退出
  -c, --config PATH     指定配置文件。
  -d, --datadir, --data-dir PATH
                        包含历史回测数据的交易所基础目录路径。
  --userdir, --user-data-dir PATH
                        用户数据目录路径。
```

示例：

``` bash
freqtrade plot-dataframe -p BTC/ETH --strategy AwesomeStrategy
```

`-p/--pairs` 参数可用于指定您想要绘制的交易对。

::: info
`freqtrade plot-dataframe` 子命令为每个交易对生成一个绘图文件。
:::

指定自定义指标。
主图使用 `--indicators1`，下方子图使用 `--indicators2`（如果数值范围与价格不同）。

``` bash
freqtrade plot-dataframe --strategy AwesomeStrategy -p BTC/ETH --indicators1 sma ema --indicators2 macd
```

### 更多使用示例

要绘制多个交易对，请用空格分隔：

``` bash
freqtrade plot-dataframe --strategy AwesomeStrategy -p BTC/ETH XRP/ETH
```

绘制特定时间范围（以放大查看）：

``` bash
freqtrade plot-dataframe --strategy AwesomeStrategy -p BTC/ETH --timerange=20180801-20180805
```

要绘制存储在数据库中的交易，请结合使用 `--db-url` 和 `--trade-source DB`：

``` bash
freqtrade plot-dataframe --strategy AwesomeStrategy --db-url sqlite:///tradesv3.dry_run.sqlite -p BTC/ETH --trade-source DB
```

绘制回测结果中的交易，请使用 `--export-filename &lt;filename&gt;`：

``` bash
freqtrade plot-dataframe --strategy AwesomeStrategy --export-filename user_data/backtest_results/backtest-result.json -p BTC/ETH
```

### 数据帧绘图基础 (Plot dataframe basics)

![plot-dataframe2](./assets/plot-dataframe2.png)

`plot-dataframe` 子命令需要回测数据、策略以及包含与该策略对应的交易的回测结果文件或数据库。

生成的图表将包含以下元素：

* 绿色三角形：策略填写的买入信号。（注意：并非每个买入信号都会生成交易，请与青色圆圈比较。）
* 红色三角形：策略填写的离场信号。（同样，并非每个离场信号都会终止交易，请与红色和绿色正方形比较。）
* 青色圆圈：交易入场点。
* 红色正方形：亏损或 0% 利润交易的离场点。
* 绿色正方形：盈利交易的离场点。
* 与 K 线刻度对应的指标（如 SMA/EMA），由 `--indicators1` 指定。
* 成交量（主图底部的柱状图）。
* 不同刻度的指标（如 MACD、RSI），位于成交量柱下方，由 `--indicators2` 指定。

::: info 布林带 (Bollinger Bands)
如果列 `bb_lowerband` 和 `bb_upperband` 存在，布林带会自动添加到图表中，并被绘制为跨越下带到上带的浅蓝色区域。
:::

#### 高级绘图配置 (Advanced plot configuration)

可以在策略的 `plot_config` 参数中指定高级绘图配置。

使用 `plot_config` 的其他功能包括：

* 指定每个指标的颜色
* 指定额外的子图
* 指定指标对以填充其间区域

下面的示例绘图配置为指标指定了固定颜色。否则，连续的绘图每次可能会产生不同的配色方案，从而难以进行比较。它还允许同时显示多个子图，以同时显示 MACD 和 RSI。

可以使用 `type` 键配置绘图类型。可能的类型有：

* `scatter` 对应 `plotly.graph_objects.Scatter` 类（默认）。
* `bar` 对应 `plotly.graph_objects.Bar` 类。

可以在 `plotly` 字典中指定 `plotly.graph_objects.*` 构造函数的额外参数。

包含详细注释的示例配置：

``` python
@property
def plot_config(self):
    """
        有很多方法可以构建返回字典。
        唯一重要的一点是返回值。
        示例：
            plot_config = {'main_plot': {}, 'subplots': {}}
    """
    plot_config = {}
    plot_config['main_plot'] = {
        # 主图指标配置。
        # 假设指定了 2 个参数，emashort 和 emalong。
        f'ema_{self.emashort.value}': {'color': 'red'},
        f'ema_{self.emalong.value}': {'color': '#CCCCCC'},
        # 省略颜色时，将选择随机颜色。
        'sar': {},
        # 填充 senkou_a 和 senkou_b 之间的区域
        'senkou_a': {
            'color': 'green', # 可选
            'fill_to': 'senkou_b',
            'fill_label': 'Ichimoku Cloud', # 可选
            'fill_color': 'rgba(255,76,46,0.2)', # 可选
        },
        # 同样绘制 senkou_b。不仅仅是填充到它的区域。
        'senkou_b': {}
    }
    plot_config['subplots'] = {
         # 创建子图 MACD
        "MACD": {
            'macd': {'color': 'blue', 'fill_to': 'macdhist'},
            'macdsignal': {'color': 'orange'},
            'macdhist': {'type': 'bar', 'plotly': {'opacity': 0.9}}
        },
        # 额外的子图 RSI
        "RSI": {
            'rsi': {'color': 'red'}
        }
    }

    return plot_config
```

::: warning
`plotly` 参数仅在 plotly 库中受支持，不适用于 freq-ui。
:::

::: info 交易仓位调整 (Trade position adjustments)
如果使用了 `position_adjustment_enable` / `adjust_trade_position()`，初始买入价格是多个订单的平均值，交易起始价格很可能会出现在 K 线范围之外。
:::

## 绘制利润 (Plot profit)

![plot-profit](./assets/plot-profit.png)

`plot-profit` 子命令显示一个具有三个图表的交互式图：

* 所有交易对的平均收盘价。
* 回测产生的汇总利润。请注意，这不对应现实世界的利润，而更多是一种估算。
* 为每个交易对单独绘制的利润。
* 交易的并行度。
* 水下期 (Underwater)（回撤期）。

第一张图表有助于了解整体市场的进展。

第二张图表将显示您的算法是否有效。也许您想要一个稳步获取小额利润的算法，或者一个动作较少但波动较大的算法。这张图表还将突出最大回撤期的开始（和结束）。

第三张图表有助于发现离群值，以及导致利润飙升的交易对事件。

第四张图表可以帮助您分析交易并行度，显示 `max_open_trades` 达到上限的频率。

`freqtrade plot-profit` 子命令的可用选项：

``` output
usage: freqtrade plot-profit [-h] [-v] [--no-color] [--logfile FILE] [-V]
                             [-c PATH] [-d PATH] [--userdir PATH] [-s NAME]
                             [--strategy-path PATH]
                             [--recursive-strategy-search]
                             [--freqaimodel NAME] [--freqaimodel-path PATH]
                             [-p PAIRS [PAIRS ...]] [--timerange TIMERANGE]
                             [--export {none,trades,signals}]
                             [--backtest-filename PATH] [--db-url PATH]
                             [--trade-source {DB,file}] [-i TIMEFRAME]
                             [--auto-open]

options:
  -h, --help            显示此帮助消息并退出
  -p, --pairs PAIRS [PAIRS ...]
                        仅限这些交易对。
  --timerange TIMERANGE
                        指定要使用的数据时间范围。
  --export {none,trades,signals}
                        导出回测结果。
  --backtest-filename, --export-filename PATH
                        用于回测结果的文件名。
  --db-url PATH         覆盖交易数据库 URL。
  --trade-source {DB,file}
                        指定交易来源。
  -i, --timeframe TIMEFRAME
                        指定时间框架。
  --auto-open           自动打开生成的绘图。
```

示例：

使用自定义回测导出文件：

``` bash
freqtrade plot-profit  -p LTC/BTC --export-filename user_data/backtest_results/backtest-result.json
```

使用自定义数据库：

``` bash
freqtrade plot-profit  -p LTC/BTC --db-url sqlite:///tradesv3.sqlite --trade-source DB
```
