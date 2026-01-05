
## 策略所需的导入项 (Imports necessary for a strategy)

在创建策略时，您需要导入必要的模块和类。以下是策略所需的导入项：

默认情况下，我们推荐将以下导入作为策略的基础架构：
这将覆盖 Freqtrade 功能运行所需的所有导入项。
显而易见，您可以根据策略需要添加更多导入。

``` python
# flake8: noqa: F401
# isort: skip_file
# --- 请勿删除这些导入项 ---
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from pandas import DataFrame
from typing import Dict, Optional, Union, Tuple

from freqtrade.strategy import (
    IStrategy,
    Trade, 
    Order,
    PairLocks,
    informative,  # @informative 装饰器
    # 超参数优化参数 (Hyperopt Parameters)
    BooleanParameter,
    CategoricalParameter,
    DecimalParameter,
    IntParameter,
    RealParameter,
    # 时间框架辅助工具 (timeframe helpers)
    timeframe_to_minutes,
    timeframe_to_next_date,
    timeframe_to_prev_date,
    # 策略辅助函数 (Strategy helper functions)
    merge_informative_pair,
    stoploss_from_absolute,
    stoploss_from_open,
)

# --------------------------------
# 在此处添加您的库导入
import talib.abstract as ta
from technical import qtpylib
```
