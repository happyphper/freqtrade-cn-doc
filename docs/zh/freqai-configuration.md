# 配置 (Configuration)

FreqAI 通过典型的 [Freqtrade 配置文件](configuration.md) 和标准 [Freqtrade 策略](strategy-customization.md) 进行配置。FreqAI 配置和策略文件的示例可以分别在 `config_examples/config_freqai.example.json` 和 `freqtrade/templates/FreqaiExampleStrategy.py` 中找到。

## 设置核心配置文件 (Setting up the configuration file)

尽管还有许多其他参数可供选择（如 [参数表](freqai-parameter-table.md#parameter-table) 中所示），但 FreqAI 配置必须至少包含以下参数（参数值仅为示例）：

```json
    "freqai": {
        "enabled": true,
        "purge_old_models": 2,
        "train_period_days": 30,
        "backtest_period_days": 7,
        "identifier" : "unique-id",
        "feature_parameters" : {
            "include_timeframes": ["5m","15m","4h"],
            "include_corr_pairlist": [
                "ETH/USD",
                "LINK/USD",
                "BNB/USD"
            ],
            "label_period_candles": 24,
            "include_shifted_candles": 2,
            "indicator_periods_candles": [10, 20]
        },
        "data_split_parameters" : {
            "test_size": 0.25
        }
    }
```

完整的示例配置可在 `config_examples/config_freqai.example.json` 中找到。

::: info
`identifier`（标识符）通常被新手忽视，然而，这个值在您的配置中起着重要作用。该值是您选择用来描述其中一次运行的唯一 ID。保持相同可以使您在崩溃后具备恢复能力，并加快回测速度。一旦您想尝试新的运行（新特征、新模型等），您应该更改此值（或删除 `user_data/models/unique-id` 文件夹）。更多详细信息请参阅 [参数表](freqai-parameter-table.md#feature-parameters)。
:::

## 构建 FreqAI 策略 (Building a FreqAI strategy)

FreqAI 策略需要在标准 [Freqtrade 策略](strategy-customization.md) 中包含以下代码行：

```python
    # 用户应定义最大启动 K 线数量（传递给任何单个指标的最大 K 线数量）
    startup_candle_count: int = 20

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:

        # 模型将返回由用户在 `set_freqai_targets()` 中创建的所有标签
        #（附加 & 的目标），一个关于预测是否应被接受的指示，
        # 用户在 `set_freqai_targets()` 中为每个训练期创建的每个标签的目标均值/标准差值。

        dataframe = self.freqai.start(dataframe, metadata, self)

        return dataframe

    def feature_engineering_expand_all(self, dataframe: DataFrame, period, **kwargs) -> DataFrame:
        """
        *仅在启用 FreqAI 的策略中有效*
        此函数将根据配置中定义的 `indicator_periods_candles`、`include_timeframes`、
        `include_shifted_candles` 和 `include_corr_pairs` 自动扩展定义的特征。
        换句话说，在此函数中定义的单个特征将自动扩展，总计添加
        `indicator_periods_candles` * `include_timeframes` * `include_shifted_candles` *
        `include_corr_pairs` 个特征到模型中。

        所有特征必须在前面冠以 `%` 才能被 FreqAI 内部识别。

        :param df: 将接收特征的策略数据帧
        :param period: 指标的周期 - 使用示例：
        dataframe["%-ema-period"] = ta.EMA(dataframe, timeperiod=period)
        """

        dataframe["%-rsi-period"] = ta.RSI(dataframe, timeperiod=period)
        dataframe["%-mfi-period"] = ta.MFI(dataframe, timeperiod=period)
        dataframe["%-adx-period"] = ta.ADX(dataframe, timeperiod=period)
        dataframe["%-sma-period"] = ta.SMA(dataframe, timeperiod=period)
        dataframe["%-ema-period"] = ta.EMA(dataframe, timeperiod=period)

        return dataframe

    def feature_engineering_expand_basic(self, dataframe: DataFrame, **kwargs) -> DataFrame:
        """
        *仅在启用 FreqAI 的策略中有效*
        此函数将根据配置中定义的 `include_timeframes`、`include_shifted_candles` 
        和 `include_corr_pairs` 自动扩展定义的特征。
        换句话说，在此函数中定义的单个特征将自动扩展，总计添加
        `include_timeframes` * `include_shifted_candles` * `include_corr_pairs`
        个特征到模型中。

        此处定义的特征 *不会* 在用户定义的 `indicator_periods_candles` 上自动重复。

        所有特征必须在前面冠以 `%` 才能被 FreqAI 内部识别。

        :param df: 将接收特征的策略数据帧
        dataframe["%-pct-change"] = dataframe["close"].pct_change()
        dataframe["%-ema-200"] = ta.EMA(dataframe, timeperiod=200)
        """
        dataframe["%-pct-change"] = dataframe["close"].pct_change()
        dataframe["%-raw_volume"] = dataframe["volume"]
        dataframe["%-raw_price"] = dataframe["close"]
        return dataframe

    def feature_engineering_standard(self, dataframe: DataFrame, **kwargs) -> DataFrame:
        """
        *仅在启用 FreqAI 的策略中有效*
        此可选函数将仅使用基础时间框架的数据帧调用一次。
        这是最后一个被调用的函数，这意味着进入此函数的数据帧将包含由所有
        其他 freqai_feature_engineering_* 函数创建的所有特征和列。

        此函数是进行自定义异域特征提取（例如 tsfresh）的好地方。
        此函数是编写任何不应被自动扩展的特征（例如星期几）的好地方。

        所有特征必须在前面冠以 `%` 才能被 FreqAI 内部识别。

        :param df: 将接收特征的策略数据帧
        使用示例: dataframe["%-day_of_week"] = (dataframe["date"].dt.dayofweek + 1) / 7
        """
        dataframe["%-day_of_week"] = (dataframe["date"].dt.dayofweek + 1) / 7
        dataframe["%-hour_of_day"] = (dataframe["date"].dt.hour + 1) / 25
        return dataframe

    def set_freqai_targets(self, dataframe: DataFrame, **kwargs) -> DataFrame:
        """
        *仅在启用 FreqAI 的策略中有效*
        设置模型目标（labels）的必需函数。
        所有目标必须在前面冠以 `&` 才能被 FreqAI 内部识别。

        :param df: 将接收目标的策略数据帧
        使用示例: dataframe["&-target"] = dataframe["close"].shift(-1) / dataframe["close"]
        """
        dataframe["&-s_close"] = (
            dataframe["close"]
            .shift(-self.freqai_info["feature_parameters"]["label_period_candles"])
            .rolling(self.freqai_info["feature_parameters"]["label_period_candles"])
            .mean()
            / dataframe["close"]
            - 1
            )
        return dataframe
```

请注意，`feature_engineering_*()` 是添加 [特征](freqai-feature-engineering.md#feature-engineering) 的地方。而 `set_freqai_targets()` 则添加标签/目标。完整的示例策略可以在 `templates/FreqaiExampleStrategy.py` 中找到。

::: info
`self.freqai.start()` 函数不能在 `populate_indicators()` 之外调用。
:::

::: info
特征 **必须** 在 `feature_engineering_*()` 中定义。在 `populate_indicators()` 
中定义 FreqAI 特征会导致算法在模拟/实盘模式下运行失败。为了添加不与特定交易对或时间框架关联的通用特征，
您应该使用 `feature_engineering_standard()`（如 `freqtrade/templates/FreqaiExampleStrategy.py` 中所示）。
:::

## 重要的 DataFrame 键模式 (Important dataframe key patterns)

以下是您希望在典型策略数据帧 (`df[]`) 中包含/使用的值：

| DataFrame 键 | 描述 |
|------------|-------------|
| `df['&*']` | 在 `set_freqai_targets()` 中以 `&` 开头的任何数据帧列在 FreqAI 内部都被视为训练目标（标签）（通常遵循 `&-s*` 命名约定）。例如，为了预测未来 40 根 K 线后的收盘价，您可以根据配置中的 `"label_period_candles": 40` 设置 `df['&-s_close'] = df['close'].shift(-self.freqai_info["feature_parameters"]["label_period_candles"])`。FreqAI 会在相同的键 (`df['&-s_close']`) 下做出预测并将其返回，用于 `populate_entry/exit_trend()`。 <br> **数据类型:** 取决于模型的输出。
| `df['&*_std/mean']` | 训练期间定义标签的标准差和平均值（或使用 `fit_live_predictions_candles` 进行实时跟踪）。通常用于理解预测的稀缺性（使用 `templates/FreqaiExampleStrategy.py` 中所示并在 [此处](#creating-a-dynamic-target-threshold) 解释的 z-score 来评估在训练期间或使用 `fit_live_predictions_candles` 时观测到特定预测的频率）。 <br> **数据类型:** 浮点数。
| `df['do_predict']` | 异常数据点的指示。返回值是 -2 到 2 之间的整数，告知您预测是否值得信赖。`do_predict==1` 表示预测值得信赖。如果输入数据点的不相似度指数（DI，详见 [此处](freqai-feature-engineering.md#identifying-outliers-with-the-dissimilarity-index-di)）高于配置中定义的阈值，FreqAI 将从 `do_predict` 中减去 1，导致 `do_predict==0`。如果启用了 `use_SVM_to_remove_outliers`，支持向量机（SVM，详见 [此处](freqai-feature-engineering.md#identifying-outliers-using-a-support-vector-machine-svm)）也可能在训练和预测数据中检测到异常值。在这种情况下，SVM 也会从 `do_predict` 中减去 1。如果输入数据点被 SVM 视为异常值而 DI 认为不是，反之亦然，结果将是 `do_predict==0`。如果 DI 和 SVM 都认为输入数据点是异常值，结果将是 `do_predict==-1`。与 SVM 同理，如果启用了 `use_DBSCAN_to_remove_outliers`，DBSCAN（详见 [此处](freqai-feature-engineering.md#identifying-outliers-with-dbscan)）也可能检测到异常值并从 `do_predict` 中减去 1。因此，如果 SVM 和 DBSCAN 都处于活动状态，并且将 DI 阈值以上的数据点识别为异常值，结果将是 `do_predict==-2`。一个特殊情况是 `do_predict == 2`，这意味着模型由于超过了 `expired_hours` 而过期。 <br> **数据类型:** -2 到 2 之间的整数。
| `df['DI_values']` | 不相似度指数 (DI) 值是 FreqAI 对预测信心水平的代理。较低的 DI 意味着预测接近训练数据，即预测信心较高。详见 DI [此处](freqai-feature-engineering.md#identifying-outliers-with-the-dissimilarity-index-di)。 <br> **数据类型:** 浮点数。
| `df['%*']` | 在 `feature_engineering_*()` 中以 `%` 开头的任何数据帧列都被视为训练特征。例如，通过设置 `df['%-rsi']`，您可以在训练特征集中包含 RSI（类似于 `templates/FreqaiExampleStrategy.py`）。更多关于如何操作的详细信息见 [此处](freqai-feature-engineering.md)。 <br> **注意:** 由于前面冠以 `%` 的特征数量会迅速增加（利用 `include_shifted_candles` 和 `include_timeframes` 等相乘功能，很容易构建出数以万计的特征，详见 [参数表](freqai-parameter-table.md)），这些特征会从 FreqAI 返回到策略的数据帧中被移除。为了保留特定类型的特征用于绘图，您应该在前面冠以 `%%`（详见下文）。 <br> **数据类型:** 取决于用户创建的特征。
| `df['%%*']` | 在 `feature_engineering_*()` 中以 `%%` 开头的任何数据帧列都被视为训练特征，就像上面的 `%` 前缀一样。但在这种情况下，特征会被返回到策略中，用于 FreqUI/plot-dataframe 绘图以及在模拟/实盘/回测中进行监控。 <br> **数据类型:** 取决于用户创建的特征。请注意，在 `feature_engineering_expand()` 中创建的特征将根据您配置的扩展具有自动的 FreqAI 命名方案（即 `include_timeframes`、`include_corr_pairlist`、`indicators_periods_candles`、`include_shifted_candles`）。因此，如果您想绘制 `feature_engineering_expand_all()` 中的 `%%-rsi`，您的绘图配置的最终命名方案将是：`%%-rsi-period_10_ETH/USDT:USDT_1h`（对于 `period=10`、`timeframe=1h`、`pair=ETH/USDT:USDT`（如果您使用期货对，则添加 `:USDT`）的 `rsi` 特征）。在 `self.freqai.start()` 之后的 `populate_indicators()` 中直接添加 `print(dataframe.columns)` 来查看返回给策略用于绘图的所有可用特征列表是很有用的。

## 设置 `startup_candle_count` (Setting the startup_candle_count)

FreqAI 策略中的 `startup_candle_count` 需要以与标准 Freqtrade 策略相同的方式进行设置（详见 [此处](strategy-customization.md#strategy-startup-period)）。Freqtrade 使用此值来确保在调用 `dataprovider` 时提供足够的数据，以避免在第一次训练开始时出现任何 NaN。您可以通过识别传递给指标创建函数（例如 TA-Lib 函数）的最长周期（以 K 线为单位）来轻松设置此值。在所示示例中，`startup_candle_count` 为 20，因为这是 `indicators_periods_candles` 中的最大值。

::: info
在某些情况下，TA-Lib 函数实际上需要比传递的 `period` 更多的数据，否则特征数据集会被填充为 NaN。据经验，将 `startup_candle_count` 乘以 2 总是能得到一个完全没有 NaN 的训练数据集。因此，通常最安全做法是将预期的 `startup_candle_count` 乘以 2。注意查看此日志消息以确认数据是干净的：
```
2022-08-31 15:14:04 - freqtrade.freqai.data_kitchen - INFO - dropped 0 training points due to NaNs in populated dataset 4319.
```
:::

## 创建动态目标阈值 (Creating a dynamic target threshold)

决定何时进入或退出交易可以采用动态方式来反映当前市场。FreqAI 允许您从模型训练中返回额外信息（更多信息见 [此处](freqai-feature-engineering.md#returning-additional-info-from-training)）。例如，`&*_std/mean` 返回值描述了 *在最近一次训练期间* 目标/标签的统计分布。将给定的预测与这些值进行比较点，可以知道预测的稀缺性。在 `templates/FreqaiExampleStrategy.py` 中，`target_roi` 和 `sell_roi` 被定义为距离均值 1.25 个 z-score，这会导致更接近均值的预测被过滤掉。

```python
dataframe["target_roi"] = dataframe["&-s_close_mean"] + dataframe["&-s_close_std"] * 1.25
dataframe["sell_roi"] = dataframe["&-s_close_mean"] - dataframe["&-s_close_std"] * 1.25
```

为了考虑 *历史预测* 集合来创建动态目标，而不是讨论如上所述的训练信息，您需要在配置中将 `fit_live_predictions_candles` 设置为您希望用来生成目标统计数据的历史预测 K 线数量。

```json
    "freqai": {
        "fit_live_predictions_candles": 300,
    }
```

如果设置了此值，FreqAI 最初会使用训练数据中的预测，随后开始引入实时预测数据。FreqAI 会保存此历史数据，以便在您使用相同的 `identifier` 停止并重新启动模型时重新加载。

## 使用不同的预测模型 (Using different prediction models)

FreqAI 有多个预测模型示例库，可以通过标志 `--freqaimodel` 直接使用。这些库包括 `LightGBM` 和 `XGBoost` 的回归、分类和多目标模型，可在 `freqai/prediction_models/` 中找到。

回归和分类模型的区别在于它们预测的目标内容——回归模型预测连续值目标，例如明天的 BTC价格是多少，而分类器预测离散值目标，例如明天的 BTC价格是否会上涨。这意味着您需要根据所使用的模型类型以不同方式指定目标值（详见 [下文](#setting-model-targets)）。

上述所有模型库都实现了梯度提升决策树（Gradient Boosted Decision Tree）算法。它们都基于集成学习（ensemble learning）的原则，通过结合多个简单学习器（simple learners）的预测来获得更稳定且更通用的最终预测。在本例中，简单学习器是决策树。梯度提升是指学习的方法，即每个简单学习器是按顺序构建的——随后的学习器用于改进前一个学习器的错误。如果您想了解关于不同模型库的更多信息，可以在它们各自的文档中找到：

* LightGBM: <https://lightgbm.readthedocs.io/en/v3.3.2/#>
* XGBoost: <https://xgboost.readthedocs.io/en/stable/#>
* CatBoost: <https://catboost.ai/en/docs/> (自 2025.12 起不再活跃支持)

网上也有许多描述和比较这些算法的文章。两个相对通俗的例子是 [CatBoost vs. LightGBM vs. XGBoost — Which is the best algorithm?](https://towardsdatascience.com/catboost-vs-lightgbm-vs-xgboost-c80f40662924#:~:text=In%20CatBoost%2C%20symmetric%20trees%2C%20or,the%20same%20depth%20can%20differ.) 和 [XGBoost, LightGBM or CatBoost — which boosting algorithm should I use?](https://medium.com/riskified-technology/xgboost-lightgbm-or-catboost-which-boosting-algorithm-should-i-use-e7fda7bb36bc)。请记住，每个模型的性能高度依赖于具体的应用，因此任何报道的指标可能不适用于您的特定模型用途。

除了 FreqAI 已有的模型外，还可以使用 `IFreqaiModel` 类自定义和创建您自己的预测模型。鼓励您继承 `fit()`、`train()` 和 `predict()` 来定制训练过程的各个方面。您可以将自定义 FreqAI 模型放在 `user_data/freqaimodels` 中——freqtrade 会根据提供的 `--freqaimodel` 名称（必须对应您自定义模型的类名）从中提取它们。请务必使用唯一的名称，以避免覆盖内置模型。

### 设置模型目标 (Setting model targets)

#### 回归模型 (Regressors)

如果您正在使用回归模型，您需要指定一个具有连续值的目标。FreqAI 包含多种回归模型，例如通过标志 `--freqaimodel LightGBMRegressor` 使用 `LightGBMRegressor`。设置预测未来 100 根 K 线后价格的回归目标的示例如下：

```python
df['&s-close_price'] = df['close'].shift(-100)
```

如果您想预测多个目标，您需要按照上述的语法定义多个标签。

#### 分类模型 (Classifiers)

如果您正在使用分类器，您需要指定一个具有离散值的目标。FreqAI 包含多种分类模型，例如通过标志 `--freqaimodel LightGBMClassifier` 使用 `LightGBMClassifier`。如果选择使用分类器，则类别需要使用字符串设置。例如，如果您想预测未来 100 根 K 线后的价格是上涨还是下跌，您可以设置：

```python
df['&s-up_or_down'] = np.where( df["close"].shift(-100) > df["close"], 'up', 'down')
```

如果您想预测多个目标，您必须在同一个标签列中指定所有标签。例如，您可以添加标签 `same` 来定义价格未变化的情况：

```python
df['&s-up_or_down'] = np.where( df["close"].shift(-100) > df["close"], 'up', 'down')
df['&s-up_or_down'] = np.where( df["close"].shift(-100) == df["close"], 'same', df['&s-up_or_down'])
```

## PyTorch 模块 (PyTorch Module)

### 快速开始 (Quick start)

快速运行 pytorch 模型的最简单方法是使用以下命令（针对回归任务）：

```bash
freqtrade trade --config config_examples/config_freqai.example.json --strategy FreqaiExampleStrategy --freqaimodel PyTorchMLPRegressor --strategy-path freqtrade/templates 
```

::: info 安装/Docker
PyTorch 模块需要大型包（如 `torch`），应在执行 `./setup.sh -i` 期间通过回答 "y" 来显式要求。
喜欢使用 docker 的用户应确保使用带有 `_freqaitorch` 后缀的 docker 镜像。
我们在 `docker/docker-compose-freqai.yml` 中为此提供了一个显式的 docker-compose 文件——可以通过 `docker compose -f docker/docker-compose-freqai.yml run ...` 使用——或者复制该文件来替代原有的 docker 文件。
由于该 docker-compose 文件包含一个（禁用的）部分来在 docker 容器内启用 GPU 资源。这显然假设系统有可用的 GPU 资源。

PyTorch 在 2.3 版本中停止了对 macOS x64（基于 intel 的 Apple 设备）的支持。随后，freqtrade 也停止了在该平台上对 PyTorch 的支持。
:::

### 结构 (Structure)

#### 模型 (Model)

您可以通过在自定义 [`IFreqaiModel` 文件](#using-different-prediction-models) 内部简单地定义您的 `nn.Module` 类并在 `def train()` 函数中使用该类，来在 PyTorch 中构建您自己的神经网络架构。以下是使用 PyTorch 实现逻辑回归模型（应于分类任务的 nn.BCELoss 准则配合使用）的示例。

```python

class LogisticRegression(nn.Module):
    def __init__(self, input_size: int):
        super().__init__()
        # 定义您的层
        self.linear = nn.Linear(input_size, 1)
        self.activation = nn.Sigmoid()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # 定义前向传播
        out = self.linear(x)
        out = self.activation(out)
        return out

class MyCoolPyTorchClassifier(BasePyTorchClassifier):
    """
    这是一个自定义的 IFreqaiModel，展示了用户如何为他们的训练设置
    自己的自定义神经网络架构。
    """

    @property
    def data_convertor(self) -> PyTorchDataConvertor:
        return DefaultPyTorchDataConvertor(target_tensor_type=torch.float)

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        config = self.freqai_info.get("model_training_parameters", {})
        self.learning_rate: float = config.get("learning_rate",  3e-4)
        self.model_kwargs: dict[str, Any] = config.get("model_kwargs",  {})
        self.trainer_kwargs: dict[str, Any] = config.get("trainer_kwargs",  {})

    def fit(self, data_dictionary: dict, dk: FreqaiDataKitchen, **kwargs) -> Any:
        """
        用户在此处设置训练和测试数据以适应其所需的模型
        :param data_dictionary: 包含训练、测试、标签、权重的字典
        :param dk: 当前币种/模型的 datakitchen 对象
        """

        class_names = self.get_class_names()
        self.convert_label_column_to_int(data_dictionary, dk, class_names)
        n_features = data_dictionary["train_features"].shape[-1]
        model = LogisticRegression(
            input_dim=n_features
        )
        model.to(self.device)
        optimizer = torch.optim.AdamW(model.parameters(), lr=self.learning_rate)
        criterion = torch.nn.CrossEntropyLoss()
        init_model = self.get_init_model(dk.pair)
        trainer = PyTorchModelTrainer(
            model=model,
            optimizer=optimizer,
            criterion=criterion,
            model_meta_data={"class_names": class_names},
            device=self.device,
            init_model=init_model,
            data_convertor=self.data_convertor,
            **self.trainer_kwargs,
        )
        trainer.fit(data_dictionary, self.splits)
        return trainer

```

#### 训练器 (Trainer)

`PyTorchModelTrainer` 执行惯用的 PyTorch 训练循环：
定义我们的模型、损失函数和优化器，然后将它们移动到适当的设备（GPU 或 CPU）。在循环内部，我们遍历 dataloader 中的批次，将数据移动到设备，计算预测和损失，反向传播，并使用优化器更新模型参数。

此外，训练器还负责以下工作：
 - 保存和加载模型
 - 将数据从 `pandas.DataFrame` 转换为 `torch.Tensor`。

#### 与 Freqai 模块集成 (Integration with Freqai module)

就像所有 freqai 模型一样，PyTorch 模型继承了 `IFreqaiModel`。`IFreqaiModel` 声明了三个抽象方法：`train`、`fit` 和 `predict`。我们在三个层次的继承体系中实现这些方法。
从上到下：

1. `BasePyTorchModel` - 实现 `train` 方法。所有 `BasePyTorch*` 都继承它。负责通用数据准备（如数据标准化）并调用 `fit` 方法。设置由子类使用的 `device` 属性。设置由父类使用的 `model_type` 属性。
2. `BasePyTorch*` - 实现 `predict` 方法。此处，`*` 代表一组算法，例如分类器或回归模型。负责数据预处理、预测，以及（如果需要）后处理。
3. `PyTorch*Classifier` / `PyTorch*Regressor` - 实现 `fit` 方法。负责主训练流程，我们在那里初始化训练器和模型对象。

![image](./assets/freqai_pytorch-diagram.png)

#### 完整示例 (Full example)

使用 MLP（多层感知机）模型、MSELoss 准则和 AdamW 优化器构建 PyTorch 回归模型。

```python
class PyTorchMLPRegressor(BasePyTorchRegressor):
    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        config = self.freqai_info.get("model_training_parameters", {})
        self.learning_rate: float = config.get("learning_rate",  3e-4)
        self.model_kwargs: dict[str, Any] = config.get("model_kwargs",  {})
        self.trainer_kwargs: dict[str, Any] = config.get("trainer_kwargs",  {})

    def fit(self, data_dictionary: dict, dk: FreqaiDataKitchen, **kwargs) -> Any:
        n_features = data_dictionary["train_features"].shape[-1]
        model = PyTorchMLPModel(
            input_dim=n_features,
            output_dim=1,
            **self.model_kwargs
        )
        model.to(self.device)
        optimizer = torch.optim.AdamW(model.parameters(), lr=self.learning_rate)
        criterion = torch.nn.MSELoss()
        init_model = self.get_init_model(dk.pair)
        trainer = PyTorchModelTrainer(
            model=model,
            optimizer=optimizer,
            criterion=criterion,
            device=self.device,
            init_model=init_model,
            target_tensor_type=torch.float,
            **self.trainer_kwargs,
        )
        trainer.fit(data_dictionary)
        return trainer
```

这里我们创建了一个实现 `fit` 方法的 `PyTorchMLPRegressor` 类。`fit` 方法指定了训练构建块：模型、优化器、准则和训练器。我们同时继承了 `BasePyTorchRegressor` 和 `BasePyTorchModel`，前者实现了适用于我们回归任务的 `predict` 方法，后者实现了训练方法。

::: info 为分类器设置类别名称
使用分类器时，用户必须通过覆盖 `IFreqaiModel.class_names` 属性来声明类别名称（或目标）。这可以通过在 FreqAI 策略内的 `set_freqai_targets` 方法中设置 `self.freqai.class_names` 来实现。

例如，如果您使用二分分类器来预测价格变动为上涨或下跌，您可以如下设置类别名称：
```python
def set_freqai_targets(self, dataframe: DataFrame, metadata: dict, **kwargs) -> DataFrame:
    self.freqai.class_names = ["down", "up"]
    dataframe['&s-up_or_down'] = np.where(dataframe["close"].shift(-100) >
                                              dataframe["close"], 'up', 'down')

    return dataframe
```
要查看完整示例，您可以参考 [分类器测试策略类](https://github.com/freqtrade/freqtrade/blob/develop/tests/strategy/strats/freqai_test_classifier.py)。
:::

#### 使用 `torch.compile()` 优化性能 (Improving performance with `torch.compile()`)

Torch 提供了一个 `torch.compile()` 方法，可用于提高特定 GPU 硬件的性能。更多详细信息可以在 [此处](https://pytorch.org/tutorials/intermediate/torch_compile_tutorial.html) 找到。简而言之，您只需将 `model` 包装在 `torch.compile()` 中：

```python
        model = PyTorchMLPModel(
            input_dim=n_features,
            output_dim=1,
            **self.model_kwargs
        )
        model.to(self.device)
        model = torch.compile(model)
```

然后像往常一样使用该模型。请记住，这样做会移除急切执行（eager execution），这意味着错误和回溯（tracebacks）可能不具备信息参考价值。
