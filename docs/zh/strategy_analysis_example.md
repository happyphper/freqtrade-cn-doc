# 策略分析示例 (Strategy analysis example)

调试策略可能非常耗时。Freqtrade 提供了辅助函数来可视化原始数据。
以下内容假设您使用的是 `SampleStrategy`，交易对为 Binance 的 5m 时间框架数据，并且已将它们下载到默认位置的数据目录中。
请参阅 [文档](https://www.freqtrade.io/en/stable/data-download/) 了解更多详情。

## 设置 (Setup)

### 更改工作目录到仓库根目录


```python
import os
from pathlib import Path


# 更改目录
# 修改此单元格以确保输出显示正确的路径。
# 定义相对于单元格输出中显示的项目根目录的所有路径
project_root = "somedir/freqtrade"
i = 0
try:
    os.chdir(project_root)
    if not Path("LICENSE").is_file():
        i = 0
        while i < 4 and (not Path("LICENSE").is_file()):
            os.chdir(Path(Path.cwd(), "../"))
            i += 1
        project_root = Path.cwd()
except FileNotFoundError:
    print("请定义相对于当前目录的项目根目录")
print(Path.cwd())
```

### 配置 Freqtrade 环境


```python
from freqtrade.configuration import Configuration


# 根据您的需要自定义这些设置。

# 初始化空的配置对象
config = Configuration.from_files([])
# 可选（推荐），使用现有的配置文件
# config = Configuration.from_files(["user_data/config.json"])

# 定义一些常量
config["timeframe"] = "5m"
# 策略类名称
config["strategy"] = "SampleStrategy"
# 数据位置
data_location = config["datadir"]
# 要分析的交易对 - 此处仅使用一个交易对
pair = "BTC/USDT"
```


```python
# 使用上面设置的值加载数据
from freqtrade.data.history import load_pair_history
from freqtrade.enums import CandleType


candles = load_pair_history(
    datadir=data_location,
    timeframe=config["timeframe"],
    pair=pair,
    data_format="json",  # 请确保将其更新为您的数据格式
    candle_type=CandleType.SPOT,
)

# 确认成功
print(f"已加载来自 {data_location} 的 {pair} 数据共 {len(candles)} 行")
candles.head()
```

## 加载并运行策略 (Load and run strategy)
* 每次更改策略文件时请重新运行


```python
# 使用上面设置的值加载策略
from freqtrade.data.dataprovider import DataProvider
from freqtrade.resolvers import StrategyResolver


strategy = StrategyResolver.load_strategy(config)
strategy.dp = DataProvider(config, None, None)
strategy.ft_bot_start()

# 使用策略生成买入/卖出信号
df = strategy.analyze_ticker(candles, {"pair": pair})
df.tail()
```

### 显示交易详情

* 注意，使用 `data.head()` 也可以，但大多数指标在数据帧顶部会有一些“启动”数据。
* 一些可能存在的问题：
    * 数据帧末尾带有 NaN 值的列
    * 在 `crossed*()` 函数中使用的单位完全不同的列
* 与完整回测的比较：
    * `analyze_ticker()` 为一个交易对输出 200 个买入信号并不一定意味着在回测期间会进行 200 次交易。
    * 假设您仅使用一个条件，例如 `df['rsi'] < 30` 作为买入条件，这将连续为每个交易对生成多个“买入”信号（直到 RSI 返回 > 29）。机器人仅会在第一个信号上买入（前提是交易插槽 ("max_open_trades") 仍然可用），或者一旦有“插槽”变得可用，就在中间的一个信号上买入。



```python
# 报告结果
print(f"生成了 {df['enter_long'].sum()} 个进场信号")
data = df.set_index("date", drop=False)
data.tail()
```

## 将现有对象加载到 Jupyter notebook 中

以下单元格假设您已经使用命令行生成了数据。  
它们将允许您更深入地钻研结果，并执行分析，否则由于信息过载，输出将变得非常难以消化。

### 将回测结果加载到 pandas 数据帧

分析交易数据帧（下文也用于绘图）


```python
from freqtrade.data.btanalysis import load_backtest_data, load_backtest_stats


# 如果 backtest_dir 指向一个目录，它将自动加载最新的回测文件。
backtest_dir = config["user_data_dir"] / "backtest_results"
# backtest_dir 也可以指向一个特定文件
# backtest_dir = (
#   config["user_data_dir"] / "backtest_results/backtest-result-2020-07-01_20-04-22.json"
# )
```


```python
# 您可以使用以下命令获取完整的回测统计信息。
# 这包含了用于生成回测结果的所有信息。
stats = load_backtest_stats(backtest_dir)

strategy = "SampleStrategy"
# 所有统计数据均可按策略获取，因此如果在回测期间使用了 `--strategy-list`，
# 也会在这里体现。
# 用法示例：
print(stats["strategy"][strategy]["results_per_pair"])
# 获取此回测使用的交易对列表
print(stats["strategy"][strategy]["pairlist"])
# 获取市场变化（回测期间所有交易对从开始到结束的平均变化）
print(stats["strategy"][strategy]["market_change"])
# 最大回撤
print(stats["strategy"][strategy]["max_drawdown_abs"])
# 最大回撤开始和结束时间
print(stats["strategy"][strategy]["drawdown_start"])
print(stats["strategy"][strategy]["drawdown_end"])


# 获取策略比较（仅在比较了多个策略时才有意义）
print(stats["strategy_comparison"])
```


```python
# 将回测交易加载为数据帧
trades = load_backtest_data(backtest_dir)

# 显示每个交易对的值统计
trades.groupby("pair")["exit_reason"].value_counts()
```

## 绘制每日利润 / 净值曲线 (Plotting daily profit / equity line)


```python
# 绘制净值曲线（从第 1 天的 0 开始，并为每个回测日添加每日利润）

import pandas as pd
import plotly.express as px

from freqtrade.configuration import Configuration
from freqtrade.data.btanalysis import load_backtest_stats


# strategy = 'SampleStrategy'
# config = Configuration.from_files(["user_data/config.json"])
# backtest_dir = config["user_data_dir"] / "backtest_results"

stats = load_backtest_stats(backtest_dir)
strategy_stats = stats["strategy"][strategy]

df = pd.DataFrame(columns=["dates", "equity"], data=strategy_stats["daily_profit"])
df["equity_daily"] = df["equity"].cumsum()

fig = px.line(df, x="dates", y="equity_daily")
fig.show()
```

### 将实盘交易结果加载到 pandas 数据帧

如果您已经进行了一些交易并想要分析表现


```python
from freqtrade.data.btanalysis import load_trades_from_db


# 从数据库中获取交易
trades = load_trades_from_db("sqlite:///tradesv3.sqlite")

# 显示结果
trades.groupby("pair")["exit_reason"].value_counts()
```

## 分析已加载交易的交易并行度 (Analyze the loaded trades for trade parallelism)
当与极高的 `max_open_trades` 设置配合回测使用时，这对于寻找最佳的 `max_open_trades` 参数非常有用。

`analyze_trade_parallelism()` 返回一个带有 "open_trades" 列的时间序列数据帧，指定了每根 K 线的持仓交易数量。


```python
from freqtrade.data.btanalysis import analyze_trade_parallelism


# 分析上述数据
parallel_trades = analyze_trade_parallelism(trades, "5m")

parallel_trades.plot()
```

## 绘制结果 (Plot results)

Freqtrade 提供了基于 plotly 的交互式绘图功能。


```python
from freqtrade.plot.plotting import generate_candlestick_graph


# 限制图表周期以保持 plotly 快速响应

# 过滤一个交易对的交易
trades_red = trades.loc[trades["pair"] == pair]

data_red = data["2019-06-01":"2019-06-10"]
# 生成 K 线图
graph = generate_candlestick_graph(
    pair=pair,
    data=data_red,
    trades=trades_red,
    indicators1=["sma20", "ema50", "ema55"],
    indicators2=["rsi", "macd", "macdsignal", "macdhist"],
)
```


```python
# 在行内显示图表
# graph.show()

# 在单独的窗口中渲染图表
graph.show(renderer="browser")
```

## 将每笔交易的平均利润绘制为分布图 (Plot average profit per trade as distribution graph)


```python
import plotly.figure_factory as ff


hist_data = [trades.profit_ratio]
group_labels = ["profit_ratio"]  # 数据集名称

fig = ff.create_distplot(hist_data, group_labels, bin_size=0.01)
fig.show()
```

如果您愿意分享关于如何最好地分析数据的想法，欢迎提交 issue 或 Pull Request 来改进此文档。
