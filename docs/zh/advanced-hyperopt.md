
# 高级超参数优化 (Advanced Hyperopt)

本页解释了一些高级超参数优化主题，这些主题可能比创建普通超参数优化类需要更高的编码技能和 Python 知识。

## 创建并使用自定义损失函数 (Creating and using a custom loss function)

要使用自定义损失函数类，请确保在您的自定义超参数优化损失类中定义了函数 `hyperopt_loss_function`。
对于下面的示例，您需要在调用 hyperopt 时添加命令行参数 `--hyperopt-loss SuperDuperHyperOptLoss` 才能使用此函数。

示例（与默认超参数优化损失实现相同）：
``` python
from datetime import datetime
from typing import Any, Dict
from pandas import DataFrame
from freqtrade.constants import Config
from freqtrade.optimize.hyperopt import IHyperOptLoss

class SuperDuperHyperOptLoss(IHyperOptLoss):
    @staticmethod
    def hyperopt_loss_function(
        *,
        results: DataFrame,
        trade_count: int,
        min_date: datetime,
        max_date: datetime,
        config: Config,
        processed: dict[str, DataFrame],
        backtest_stats: dict[str, Any],
        starting_balance: float,
        **kwargs,
    ) -> float:
        # 目标函数，返回越小的数字代表结果越好
        total_profit = results['profit_ratio'].sum()
        trade_duration = results['trade_duration'].mean()
        # 这里进行您的自定义逻辑计算并返回一个 float 结果
        return result
```

## 覆盖预定义空间 (Overriding pre-defined spaces)

要覆盖预定义的空间（`roi_space`, `stoploss_space` 等），请在策略类中定义一个名为 `HyperOpt` 的嵌套类：

```python
class MyAwesomeStrategy(IStrategy):
    class HyperOpt:
        # 定义自定义止损空间
        def stoploss_space():
            return [SKDecimal(-0.05, -0.01, decimals=3, name='stoploss')]

        # 定义自定义 ROI 空间
        def roi_space() -> List[Dimension]:
             return [
                Integer(10, 120, name='roi_t1'),
                # ...
            ]
```

## 动态参数 (Dynamic parameters)

参数也可以动态定义，但必须在 [`bot_start()` 回调](strategy-callbacks.md#bot-start) 被调用后对实例可用。

## 自定义采样器 (Overriding Base estimator)

您可以通过在 `HyperOpt` 子类中实现 `generate_estimator()` 来定义自己的 Optuna 采样器。
可选值包括 `"NSGAIIISampler"`, `"TPESampler"`, `"CmaEsSampler"` 等。

## 空间选项 (Space options)

Freqtrade 提供了以下空间类型：
- `Categorical`: 从列表选取。
- `Integer`: 整数范围。
- `SKDecimal`: 具有限制精度的浮点数（推荐使用，比 `Real` 快）。
- `Real`: 全精度浮点数。

::: info SKDecimal vs. Real
我们建议在几乎所有情况下都使用 `SKDecimal` 而不是 `Real`。`Real` 的过高精度（小数点后 16 位）在大多数交易策略中并无必要，且会显著延长优化时间。
:::