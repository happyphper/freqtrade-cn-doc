# 参数表 (Parameter table)

下表列出了 FreqAI 可用的所有配置参数。部分参数在 `config_examples/config_freqai.example.json` 中有示例说明。

强制性参数标为 **Required**，必须通过建议的方式之一进行设置。

### 通用配置参数 (General configuration parameters)

| 参数 | 描述 |
|------------|-------------|
| | **`config.freqai` 树下的通用配置参数** |
| `freqai` | **Required.** <br> 包含所有控制 FreqAI 参数的父级字典。 <br> **数据类型:** 字典。 |
| `train_period_days` | **Required.** <br> 用于训练数据的时间天数（滑动窗口的宽度）。 <br> **数据类型:** 正整数。 |
| `backtest_period_days` | **Required.** <br> 在滑动上面定义的 `train_period_days` 窗口并在回测期间重新训练模型之前，从训练模型进行推理的天数（更多信息见[此处](freqai-running.md#backtesting)）。这可以是小数天，但请注意，提供的 `timerange` 将被此数字除，从而得出完成回测所需的训练次数。 <br> **数据类型:** 浮点数。 |
| `identifier` | **Required.** <br> 当前模型的唯一 ID。如果模型保存到磁盘，`identifier` 允许重新加载特定的预训练模型/数据。 <br> **数据类型:** 字符串。 |
| `live_retrain_hours` | 模拟/实盘运行期间重新训练的频率。 <br> **数据类型:** 大于 0 的浮点数。 <br> 默认值: `0`（模型尽可能频繁地重新训练）。 |
| `expiration_hours` | 如果模型超过 `expiration_hours` 小时，则避免进行预测。 <br> **数据类型:** 正整数。 <br> 默认值: `0`（模型永不过期）。 |
| `purge_old_models` | 保留在磁盘上的模型数量（与回测无关）。默认值为 2，这意味着模拟/实盘运行将在磁盘上保留最新的 2 个模型。设置为 0 则保留所有模型。该参数也接受布尔值以保持向后兼容性。 <br> **数据类型:** 整数。 <br> 默认值: `2`。 |
| `save_backtest_models` | 运行回测时将模型保存到磁盘。通过保存预测数据并在随后的运行中直接重复使用它们（当您希望调整进场/离场参数时），回测运行效率最高。将回测模型保存到磁盘还允许使用相同的模型文件启动具有相同模型 `identifier` 的模拟/实盘实例。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`（不保存模型）。 |
| `fit_live_predictions_candles` | 用于从预测数据计算目标（标签）统计信息的历史 K 线数量，而不是从训练数据集中计算（更多信息见[此处](freqai-configuration.md#creating-a-dynamic-target-threshold)）。 <br> **数据类型:** 正整数。 |
| `continual_learning` | 使用最近训练模型的最终状态作为新模型的起点，从而允许增量学习（更多信息见[此处](freqai-running.md#continual-learning)）。请注意，这目前是一种简单的增量学习方法，随着市场偏离您的模型，极有可能出现过拟合/陷入局部最小值。我们主要出于实验目的提供此连接，以便为在加密市场等混乱系统中更成熟的持续学习方法做好准备。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `write_metrics_to_disk` | 在 json 文件中收集训练时间、推理时间和 cpu 使用情况。 <br> **数据类型:** 布尔值。 <br> 默认值: `False` |
| `data_kitchen_thread_count` | <br> 指定要用于数据处理（离群值方法、归一化等）的线程数。这对用于训练的线程数没有影响。如果用户未设置（默认），FreqAI 将使用最大线程数 - 2（留出 1 个物理内核供 Freqtrade 机器人和 FreqUI 使用）。 <br> **数据类型:** 正整数。 |
| `activate_tensorboard` | <br> 指示是否为启用了 tensorboard 的模块（目前为强化学习、XGBoost、Catboost 和 PyTorch）激活 tensorboard。Tensorboard 需要安装 Torch，这意味着您将需要 torch/RL 镜像，或者在安装问题中对是否希望安装 Torch 回答“yes”。 <br> **数据类型:** 布尔值。 <br> 默认值: `True`。 |
| `wait_for_training_iteration_on_reload` | <br> 使用 /reload 或 ctrl-c 时，在完成优雅停机之前等待当前训练迭代结束。如果设置为 `False`，FreqAI 将中断当前训练迭代，从而允许您更快地优雅停机，但您将丢失当前的训练迭代。 <br> **数据类型:** 布尔值。 <br> 默认值: `True`。 |

### 特征参数 (Feature parameters)

| 参数 | 描述 |
|------------|-------------|
| | **`freqai.feature_parameters` 子字典中的特征参数** |
| `feature_parameters` | 包含用于工程特征集的参数的字典。详情和示例请见[此处](freqai-feature-engineering.md)。 <br> **数据类型:** 字典。 |
| `include_timeframes` | 一个时间框架列表，将为其中的所有指标在 `feature_engineering_expand_*()` 中创建指标。该列表作为特征添加到基础指标数据集中。 <br> **数据类型:** 时间框架列表（字符串）。 |
| `include_corr_pairlist` | FreqAI 将作为附加特征添加到所有 `pair_whitelist` 交易对的相关代币列表。在特征工程期间（详见[此处](freqai-feature-engineering.md)）在 `feature_engineering_expand_*()` 中设置的所有指标都将为每个相关代币创建。相关代币特征将添加到基础指标数据集中。 <br> **数据类型:** 资产列表（字符串）。 |
| `label_period_candles` | 为其创建标签的未来 K 线数量。这可以用于 `set_freqai_targets()`（详细用法见 `templates/FreqaiExampleStrategy.py`）。此参数不一定是必需的，您可以创建自定义标签并选择是否利用此参数。请参阅 `templates/FreqaiExampleStrategy.py` 以查看示例用法。 <br> **数据类型:** 正整数。 |
| `include_shifted_candles` | 将之前 K 线中的特征添加到随后的 K 线中，目的是添加历史信息。如果使用，FreqAI 将复制并偏移 `include_shifted_candles` 之前所有 K 线的特征，以便信息可用于随后的 K 线。 <br> **数据类型:** 正整数。 |
| `weight_factor` | 根据训练数据点的近期性对其进行加权（详见[此处](freqai-feature-engineering.md#weighting-features-for-temporal-importance)）。 <br> **数据类型:** 正浮点数（通常 &lt; 1）。 |
| `indicator_max_period_candles` | **不再使用 (#7325)**。被[策略](freqai-configuration.md#building-a-freqai-strategy)中设置的 `startup_candle_count` 取代。`startup_candle_count` 与时间框架无关，定义了 `feature_engineering_*()` 中用于指标创建的最大 *周期 (period)*。FreqAI 将此参数与 `include_time_frames` 中的最大时间框架结合使用，以计算要下载的数据点数量，使第一个数据点不包含 NaN。 <br> **数据类型:** 正整数。 |
| `indicator_periods_candles` | 计算指标的时间周期。指标将添加到基础指标数据集中。 <br> **数据类型:** 正整数列表。 |
| `principal_component_analysis` | 使用主成分分析自动降低数据集的维数。有关其运作方式的详情请见[此处](freqai-feature-engineering.md#data-dimensionality-reduction-with-principal-component-analysis) <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `plot_feature_importances` | 为每个模型的前/后 `plot_feature_importances` 个特征创建一个特征重要性图表。图表存储在 `user_data/models/&lt;identifier&gt;/sub-train-&lt;COIN&gt;_&lt;timestamp&gt;.html`。 <br> **数据类型:** 整数。 <br> 默认值: `0`。 |
| `DI_threshold` | 当设置为 &gt; 0 时，激活离群值检测的相似度指数 (Dissimilarity Index) 使用。有关其运作方式的详情请见[此处](freqai-feature-engineering.md#identifying-outliers-with-the-dissimilarity-index-di)。 <br> **数据类型:** 正浮点数（通常 &lt; 1）。 |
| `use_SVM_to_remove_outliers` | 训练支持向量机以从训练数据集以及传入的数据点中检测并移除离群值。有关其运作方式的详情请见[此处](freqai-feature-engineering.md#identifying-outliers-using-a-support-vector-machine-svm)。 <br> **数据类型:** 布尔值。 |
| `svm_params` | Sklearn 的 `SGDOneClassSVM()` 中可用的所有参数。有关某些选定参数的详情请见[此处](freqai-feature-engineering.md#identifying-outliers-using-a-support-vector-machine-svm)。 <br> **数据类型:** 字典。 |
| `use_DBSCAN_to_remove_outliers` | 使用 DBSCAN 算法对数据进行聚类，以识别并从训练和预测数据中移除离群值。有关其运作方式的详情请见[此处](freqai-feature-engineering.md#identifying-outliers-with-dbscan)。 <br> **数据类型:** 布尔值。 |
| `noise_standard_deviation` | 如果设置，FreqAI 会向训练特征添加噪声，目的是防止过拟合。FreqAI 从标准差为 `noise_standard_deviation` 的高斯分布中生成随机偏差，并将其添加到所有数据点。`noise_standard_deviation` 应保持相对于归一化空间的比例，即在 -1 和 1 之间。换句话说，由于 FreqAI 中的数据总是归一化到 -1 和 1 之间，因此 `noise_standard_deviation: 0.05` 将导致 32% 的数据被随机增加/减少超过 2.5%（即落入第一个标准差内的数据百分比）。 <br> **数据类型:** 整数。 <br> 默认值: `0`。 |
| `outlier_protection_percentage` | 启用此项以防止离群值检测方法丢弃过多数据。如果超过 `outlier_protection_percentage` % 的点被 SVM 或 DBSCAN 检测为离群值，FreqAI 将记录警告消息并忽略离群值检测，即保留原始数据集完整。如果触发了离群值保护，则不会基于该训练数据集进行预测。 <br> **数据类型:** 浮点数。 <br> 默认值: `30`。 |
| `reverse_train_test_order` | 拆分特征数据集（见下文），并使用最新的数据切片进行训练，对历史切片进行测试。这允许模型训练到最近的数据点，同时避免过拟合。但是，在采用此参数之前，您应当仔细了解其非传统性质。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`（不反转）。 |
| `shuffle_after_split` | 将数据拆分为训练集和测试集，然后分别对两组执行洗牌。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `buffer_train_data_candles` | 在指标填充 *之后*，从训练数据的开头和结尾切掉 `buffer_train_data_candles`。主要的示例用法是预测极大值和极小值时，argrelextrema 函数无法知道时间范围边缘的极大值/极小值。为了提高模型准确性，最好在完整时间范围内计算 argrelextrema，然后使用此函数切掉边缘（缓冲区）。在另一种情况下，如果目标设置为偏移的价格变动，则此缓冲区是不必要的，因为时间范围末尾偏移的 K 线将是 NaN，FreqAI 将自动从训练数据集中切掉它们。<br> **数据类型:** 整数。 <br> 默认值: `0`。 |

### 数据拆分参数 (Data split parameters)

| 参数 | 描述 |
|------------|-------------|
| | **`freqai.data_split_parameters` 子字典中的数据拆分参数** |
| `data_split_parameters` | 包含 scikit-learn `test_train_split()` 中可用的任何其他参数，详见[此处](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)（外部网站）。 <br> **数据类型:** 字典。 |
| `test_size` | 应用于测试而非训练的数据比例。 <br> **数据类型:** 小于 1 的正浮点数。 |
| `shuffle` | 在训练过程中对训练数据点进行洗牌。通常，为了不移除时间序列预测中数据的年代顺序，此项设置为 `False`。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |

### 模型训练参数 (Model training parameters)

| 参数 | 描述 |
|------------|-------------|
| | **`freqai.model_training_parameters` 子字典中的模型训练参数** |
| `model_training_parameters` | 一个灵活的字典，包含所选模型库中可用的所有参数。例如，如果您使用 `LightGBMRegressor`，此字典可以包含 [此处](https://lightgbm.readthedocs.io/en/latest/pythonapi/lightgbm.LGBMRegressor.html)（外部网站）提供的 `LightGBMRegressor` 的任何参数。如果您选择不同的模型，此字典可以包含该模型中的任何参数。当前可用模型的列表见[此处](freqai-configuration.md#using-different-prediction-models)。 <br> **数据类型:** 字典。 |
| `n_estimators` | 模型训练中拟合的增强树数量。 <br> **数据类型:** 整数。 |
| `learning_rate` | 模型训练期间的增强学习率。 <br> **数据类型:** 浮点数。 |
| `n_jobs`, `thread_count`, `task_type` | 设置并行处理的线程数和 `task_type`（`gpu` 或 `cpu`）。不同模型库使用不同的参数名称。 <br> **数据类型:** 浮点数。 |

### 强化学习参数 (Reinforcement Learning parameters)

| 参数 | 描述 |
|------------|-------------|
| | **`freqai.rl_config` 子字典中的强化学习参数** |
| `rl_config` | 一个包含强化学习模型控制参数的字典。 <br> **数据类型:** 字典。 |
| `train_cycles` | 训练时间步长将基于 `train_cycles` * 训练数据点数量进行设置。 <br> **数据类型:** 整数。 |
| `max_trade_duration_candles`| 引导代理训练将交易保持在期望长度以下。示例用法展示在 `prediction_models/ReinforcementLearner.py` 的可自定义 `calculate_reward()` 函数中。 <br> **数据类型:** 整数。 |
| `model_type` | 来自 stable_baselines3 或 SBcontrib 的模型字符串。可用字符串包括：`'TRPO', 'ARS', 'RecurrentPPO', 'MaskablePPO', 'PPO', 'A2C', 'DQN'`。用户应通过访问对应的 stable_baselines3 文档确保 `model_training_parameters` 与其提供的匹配。[PPO 文档](https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html)（外部网站） <br> **数据类型:** 字符串。 |
| `policy_type` | 来自 stable_baselines3 的可用策略类型之一 <br> **数据类型:** 字符串。 |
| `max_training_drawdown_pct` | 代理在训练期间允许体验的最大回撤。 <br> **数据类型:** 浮点数。 <br> 默认值: 0.8 |
| `cpu_count` | 专门用于强化学习训练过程的线程/cpu 数量（取决于是否选择了 `ReinforcementLearner_multiproc`）。建议保持原样，默认情况下，此值设置为物理核心总数减 1。 <br> **数据类型:** 整数。 |
| `model_reward_parameters` | 在 `ReinforcementLearner.py` 中可自定义的 `calculate_reward()` 函数中使用的参数 <br> **数据类型:** 整数。 |
| `add_state_info` | 告诉 FreqAI 在用于训练和推理的特征集中包含状态信息。当前状态变量包括交易时长、当前利润、交易仓位。这仅在模拟/实盘运行中可用，在回测中自动切换为 false。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `net_arch` | 网络架构，在 [`stable_baselines3` 文档](https://stable-baselines3.readthedocs.io/en/master/guide/custom_policy.html#examples) 中有详细描述。摘要如下：`[&lt;shared layers&gt;, dict(vf=[&lt;non-shared value network layers&gt;], pi=[&lt;non-shared policy network layers&gt;])]`。默认设置为 `[128, 128]`，定义了 2 个各自具有 128 个单元的共享隐藏层。 |
| `randomize_starting_position` | 随机化每个回合的起点以避免过拟合。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `drop_ohlc_from_features` | 不在传递给代理进行训练的特征集中包含归一化后的 ohlc 数据（ohlc 在所有情况下仍将用于驱动环境） <br> **数据类型:** 布尔值。 <br> 默认值: `False` |
| `progress_bar` | 显示包含当前进度、耗时和预计剩余时间的进度条。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |

### PyTorch 参数 (PyTorch parameters)

#### 通用 (general)

| 参数 | 描述 |
|------------|-------------|
| | **`freqai.model_training_parameters` 子字典中的模型训练参数** |
| `learning_rate` | 要传递给优化器的学习率。 <br> **数据类型:** 浮点数。 <br> 默认值: `3e-4`。 |
| `model_kwargs` | 要传递给模型类的参数。 <br> **数据类型:** 字典。 <br> 默认值: `{}`。 |
| `trainer_kwargs` | 要传递给训练器类的参数。 <br> **数据类型:** 字典。 <br> 默认值: `{}`。 |

#### 训练器参数 (trainer_kwargs)

| 参数 | 描述 |
|--------------|-------------|
| | **`freqai.model_training_parameters.model_kwargs` 子字典中的模型训练参数** |
| `n_epochs` | `n_epochs` 参数是 PyTorch 训练循环中的关键设置，它决定了整个训练数据集将用于更新模型参数的次数。一个 epoch 代表完整经过一次整个训练数据集。覆盖 `n_steps`。必须设置 `n_epochs` 或 `n_steps` 之一。 <br><br> **数据类型:** 整数。可选。 <br> 默认值: `10`。 |
| `n_steps` | 设置 `n_epochs` 的另一种方式 —— 要运行的训练迭代次数。这里的迭代是指我们调用 `optimizer.step()` 的次数。如果设置了 `n_epochs`，则忽略此项。函数的简化版：<br><br> n_epochs = n_steps / (n_obs / batch_size) <br><br> 动机是 `n_steps` 在不同的 n_obs（数据点数量）之间更容易优化且保持稳定。 <br> <br> **数据类型:** 整数。可选。 <br> 默认值: `None`。 |
| `batch_size` | 训练期间使用的批次大小。 <br><br> **数据类型:** 整数。 <br> 默认值: `64`。 |

### 附加参数 (Additional parameters)

| 参数 | 描述 |
|------------|-------------|
| | **外部参数** |
| `freqai.keras` | 如果所选模型使用了 Keras（对于基于 TensorFlow 的预测模型很常见），则需要激活此标志，以便模型保存/加载遵循 Keras 标准。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `freqai.conv_width` | 神经网络输入张量的宽度。这取代了通过将历史数据点作为张量的第二维输入来偏移 K线的需求（`include_shifted_candles`）。从技术上讲，该参数也可以用于回归器，但它只会增加计算开销，而不会改变模型训练/预测。 <br> **数据类型:** 整数。 <br> 默认值: `2`。 |
| `freqai.reduce_df_footprint` | 将所有数值列重新转换为 float32/int32，目的是减少内存/磁盘占用并缩短训练/推理时间。此参数在 Freqtrade 配置文件的主层级设置（不在 FreqAI 内部）。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
| `freqai.override_exchange_check` | 覆盖交易所检查，强制 FreqAI 使用可能没有足够历史数据的交易所。如果您知道您的 FreqAI 模型和策略不需要历史数据，请将其设为 True。 <br> **数据类型:** 布尔值。 <br> 默认值: `False`。 |
