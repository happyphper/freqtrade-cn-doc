# 运行 FreqAI

有两种方式可以训练和部署自适应机器学习模型：实盘部署和历史回测。在两种情况下，FreqAI 都会按周期运行/模拟模型的重新训练，如下图所示：

![freqai-window](./assets/freqai_moving-window.jpg)

## 实盘部署

可以使用以下命令以模拟/实盘模式运行 FreqAI：

```bash
freqtrade trade --strategy FreqaiExampleStrategy --config config_freqai.example.json --freqaimodel LightGBMRegressor
```

启动后，FreqAI 将根据配置设置开始训练一个具有新 `identifier`（标识符）的新模型。在训练之后，该模型将用于对进入的 K 线进行预测，直到新模型可用。新模型通常会尽可能频繁地生成，FreqAI 会管理一个内部交易对队列，尝试让所有模型都保持最新状态。FreqAI 始终使用最近训练的模型对进入的实时数据进行预测。如果您不希望 FreqAI 尽可能频繁地重新训练新模型，可以设置 `live_retrain_hours` 来告诉 FreqAI 在训练新模型之前至少等待多少小时。此外，您可以设置 `expired_hours` 来告诉 FreqAI 避免在使用时间超过该小时数的模型上进行预测。

默认情况下，训练好的模型会保存到磁盘，以便在回测期间或崩溃后重复使用。您可以通过在配置中设置 `"purge_old_models": true` 来选择 [清理旧模型](#清理旧模型数据) 以节省磁盘空间。

要从保存的回测模型（或之前崩溃的模拟/实盘会话）启动模拟/实盘运行，您只需指定特定模型的 `identifier`：

```json
    "freqai": {
        "identifier": "example",
        "live_retrain_hours": 0.5
    }
```

在这种情况下，虽然 FreqAI 将使用预训练模型启动，但它仍会检查模型训练以来经过了多长时间。如果自加载模型结束以来已满 `live_retrain_hours`，FreqAI 将开始训练新模型。

### 自动数据下载

FreqAI 会根据定义的 `train_period_days` 和 `startup_candle_count` 自动下载确保模型训练所需的适当数据量（详见 [参数表](freqai-parameter-table.md) 以了解这些参数的详细说明）。

### 保存预测数据

在特定 `identifier` 模型生命周期内做出的所有预测都存储在 `historic_predictions.pkl` 中，以便在崩溃或更改配置后重新加载。

### 清理旧模型数据

FreqAI 在每次成功训练后都会存储新的模型文件。随着新模型的生成以适应新的市场条件，这些文件会变得过时。如果您计划让 FreqAI 以高频重新训练长时间运行，则应在配置中启用 `purge_old_models`：

```json
    "freqai": {
        "purge_old_models": 4,
    }
```

这将自动清理除了最近训练的四个模型之外的所有旧模型，以节省磁盘空间。输入 "0" 则永远不会清理任何模型。

## 回测

FreqAI 回测模块可以使用以下命令执行：

```bash
freqtrade backtesting --strategy FreqaiExampleStrategy --strategy-path freqtrade/templates --config config_examples/config_freqai.example.json --freqaimodel LightGBMRegressor --timerange 20210501-20210701
```

如果从未配合现有配置文件执行过此命令，FreqAI 将为 `--timerange` 时间范围内的每个回测窗口、每个交易对训练一个新模型。

回测模式需要在部署前 [下载必要的数据](#下载涵盖完整回测周期的数据)（不像模拟/实盘模式下 FreqAI 会自动处理数据下载）。您应该仔细考虑，下载数据的时间范围要多于回测的时间范围。这是因为 FreqAI 需要在所需的回测时间范围之前的数据，以便训练出能够在回测时间范围的第一根 K 线就进行预测的模型。关于如何计算要下载的数据量的更多详情，详见 [此处](#确定滑动训练窗口的大小和回测时长)。

::: info 模型重用
训练完成后，您可以使用相同的配置文件再次执行回测，FreqAI 将找到训练好的模型并加载它们，而不是花时间进行训练。如果您想微调（甚至超优）策略内部的买入和卖出标准，这非常有用。如果您 *想* 使用相同的配置文件重新训练新模型，只需更改 `identifier` 即可。这样，您只需指定 `identifier` 就可以回到使用任何您想要的模型。
:::

::: info
回测会为每个回测窗口（窗口数量是总回测时间范围除以 `backtest_period_days` 参数）调用一次 `set_freqai_targets()`。这样做意味着目标值可以模拟模拟/实盘行为，而没有前瞻偏差。但是，`feature_engineering_*()` 中的特征定义是在整个训练时间范围内执行一次的。这意味着您应该确保特征不会看到未来的信息。关于前瞻偏差的更多详情，请参见 [开发策略时的常见错误](strategy-customization.md#开发策略时的常见错误)。
:::

---

### 保存回测预测数据

为了允许微调您的策略（**不是**特征！），FreqAI 将在回测期间自动保存预测，以便在使用相同 `identifier` 模型的未来回测和实盘运行中重复使用。这提供了一种旨在实现入场/离场标准的 **高级别超参数优化 (high-level hyperopting)** 的性能增强。

在 `unique-id` 文件夹中将创建一个名为 `backtesting_predictions` 的附加目录，其中包含以 `feather` 格式存储的所有预测。

要更改您的 **特征**，您 **必须** 在配置中设置一个新的 `identifier`，以向 FreqAI 发出训练新模型的信号。

要保存特定回测期间生成的模型，以便您可以从其中一个模型启动实盘部署而不是训练新模型，您必须在配置中将 `save_backtest_models` 设置为 `True`。

::: info
为了确保模型可以重用，FreqAI 会用长度为 1 的数据帧调用您的策略。如果您的策略需要比这更多的数据来生成相同的特征，则不能将回测预测用于实盘部署，并且需要为每个新回测更新 `identifier`。
:::

### 对实盘收集的预测进行回测

FreqAI 允许您通过回测参数 `--freqai-backtest-live-models` 重用实盘历史预测。当您想重用模拟/实盘中生成的预测进行比较或其他研究时，这非常有用。

不应告知 `--timerange` 参数，因为它将通过历史预测文件中的数据自动计算。

### 下载涵盖完整回测周期的数据

对于实盘/模拟部署，FreqAI 会自动下载必要的数据。但是，要使用回测功能，您需要使用 `download-data` 下载必要的数据（详情见 [此处](data-download.md)）。您需要仔细注意并理解需要下载多少 *额外* 数据，以确保在回测时间范围开始 *之前* 有足够的训练数据。额外的数据量可以通过将时间范围的开始日期从所需回测时间范围的开头向后移动 `train_period_days` 和 `startup_candle_count` 来粗略估计（详见 [参数表](freqai-parameter-table.md) 以了解这些参数的详细说明）。

例如，要使用将 `train_period_days` 设置为 30，且在最大 `include_timeframes` 为 1h 时 `startup_candle_count: 40` 的 [示例配置](freqai-configuration.md#配置文件设置) 来回测 `--timerange 20210501-20210701`，下载数据的开始日期需要是 `20210501` - 30 天 - 40 * 1h / 24 小时 = 20210330（比所需训练时间范围的开始早 31.7 天）。

### 确定滑动训练窗口的大小和回测时长

回测时间范围在配置文件中用典型的 `--timerange` 参数定义。滑动训练窗口的时长由 `train_period_days` 设置，而 `backtest_period_days` 是滑动回测窗口，两者都是天数（`backtest_period_days` 可以是浮点数，表示模拟/实盘模式下在不到一天的时间内重新训练）。在提供的 [示例配置](freqai-configuration.md#配置文件设置)（位于 `config_examples/config_freqai.example.json`）中，用户要求 FreqAI 使用 30 天的训练周期，并在随后的 7 天进行回测。模型训练完成后，FreqAI 将对随后的 7 天进行回测。然后，“滑动窗口”向前移动一周（模拟 FreqAI 在实盘模式下每周重新训练一次），新模型使用前 30 天（包括前一个模型用于回测的 7 天）进行训练。这一过程会一直重复直到 `--timerange` 结束。这意味着如果您设置 `--timerange 20210501-20210701`，FreqAI 在 `--timerange` 结束时将总共训练 8 个独立的模型（因为整个范围包含 8 周）。

::: info
虽然允许分数形式的 `backtest_period_days`，但您应该意识到，`--timerange` 会除以该值来确定 FreqAI 为了完成全范围回测而需要训练的模型数量。例如，通过将 `--timerange` 设置为 10 天，并将 `backtest_period_days` 设置为 0.1，FreqAI 将需要为每个交易对训练 100 个模型才能完成完整回测。正因如此，对 FreqAI 自适应训练的真实回测会花费 *非常* 长的时间。全面测试模型的最佳方法是运行模拟运行并让其不断训练。在这种情况下，回测所花费的时间将与模拟运行完全相同。
:::

## 定义模型过期时间

在模拟/实盘模式下，FreqAI 会按顺序训练每个币种对（在与主 Freqtrade 机器人分开的线程/GPU 上）。这意味着模型之间总是存在年龄差异。如果您在 50 个对上进行训练，并且每个对需要 5 分钟来训练，那么最旧的模型将超过 4 小时历史。如果某个策略的特征时间尺度（交易时长目标）小于 4 小时，这可能是不可取的。您可以通过在配置文件中设置 `expiration_hours` 来决定仅在模型存在时间少于一定小时数的情况下才进行交易入场：

```json
    "freqai": {
        "expiration_hours": 0.5,
    }
```

在提供的示例配置中，用户将仅允许在使用时间少于半小时的模型上进行预测。

## 控制模型学习过程

模型训练参数对于所选的机器学习库是唯一的。FreqAI 允许您使用配置中的 `model_training_parameters` 字典为任何库设置任何参数。示例配置（位于 `config_examples/config_freqai.example.json`）显示了一些与 `Catboost` 和 `LightGBM` 相关的示例参数，但您可以添加这些库中可用的任何参数，或者您选择实现的任何其他机器学习库的任何参数。

数据拆分参数定义在 `data_split_parameters` 中，它可以是与 scikit-learn 的 `train_test_split()` 函数相关的任何参数。`train_test_split()` 有一个名为 `shuffle` 的参数，允许对数据进行洗牌或保持不洗牌。这在避免使用时间自相关数据导致训练偏差时特别有用。有关这些参数的更多详情可以在 [scikit-learn 网站](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html)（外部网站）找到。

FreqAI 特有的参数 `label_period_candles` 定义了用于 `labels`（标签）的偏移量（未来 K 线的数量）。在提供的 [示例配置](freqai-configuration.md#配置文件设置) 中，用户要求获得未来 24 根 K 线的 `labels`。

## 持续学习 (Continual learning)

您可以通过在配置中设置 `"continual_learning": true` 来选择采用持续学习方案。通过启用 `continual_learning`，在从头开始训练初始模型后，后续的训练将从前一个训练的最终模型状态开始。这使得新模型对之前的状态有了“记忆”。默认情况下，此项设置为 `False`，这意味着所有新模型都是从头开始训练的，不参考之前的模型输入。

???+ danger "持续学习强制执行恒定的参数空间"
    由于 `continual_learning` 意味着模型参数空间在两次训练之间 *不能* 改变，因此启用 `continual_learning` 时会自动禁用 `principal_component_analysis`（主成分分析）。提示：PCA 会改变参数空间和特征数量，在 [此处](freqai-feature-engineering.md#使用主成分分析进行数据降维) 了解更多关于 PCA 的信息。

???+ danger "实验性功能"
    请注意，这目前是一种简单的增量学习方法，随着市场偏离您的模型，它极有可能出现过拟合或陷入局部最小值。我们在 FreqAI 中提供这些机制主要是出于实验目的，以便为加密市场等混乱系统中更成熟的持续学习方法做好准备。

## 超参数优化 (Hyperopt)

您可以使用与 [典型的 Freqtrade 超参数优化](hyperopt.md) 相同的命令来进行超参数优化：

```bash
freqtrade hyperopt --hyperopt-loss SharpeHyperOptLoss --strategy FreqaiExampleStrategy --freqaimodel LightGBMRegressor --strategy-path freqtrade/templates --config config_examples/config_freqai.example.json --timerange 20220428-20220507
```

`hyperopt` 要求您按照 [回测](#回测) 的方式预先下载数据。此外，在尝试对 FreqAI 策略进行超参数优化时，您必须考虑一些限制：

- `--analyze-per-epoch` 超参数优化参数与 FreqAI 不兼容。
- 不可能在 `feature_engineering_*()` 和 `set_freqai_targets()` 函数中对指标进行超参数优化。这意味着您无法使用 hyperopt 优化模型参数。除了这个例外，优化所有其他 [空间 (spaces)](hyperopt.md#缩小搜索空间运行) 是可能的。
- 回测说明也适用于超参数优化。

结合超参数优化和 FreqAI 的最佳方法是专注于优化入场/离场阈值/标准。您需要专注于优化特征中未使用的参数。例如，您不应该尝试优化特征创建中的滚动窗口长度，或 FreqAI 配置中改变预测的任何部分。为了高效地对 FreqAI 策略进行超参数优化，FreqAI 将预测存储为数据帧并重复使用它们。因此要求仅对入场/离场阈值/标准进行超参数优化。

FreqAI 中一个很好的可超优参数示例是 [相似度指数 (DI)](freqai-feature-engineering.md#相似度指数-di) 的阈值 `DI_values`，超过该阈值我们认为数据点为离群值：

```python
di_max = IntParameter(low=1, high=20, default=10, space='buy', optimize=True, load=True)
dataframe['outlier'] = np.where(dataframe['DI_values'] > self.di_max.value/10, 1, 0)
```

这种特定的超参数优化将帮助您理解适合特定参数空间的 `DI_values`。

## 使用 Tensorboard

::: info 可用性
FreqAI 为多种模型提供了 Tensorboard 支持，包括 XGBoost、所有 PyTorch 模型、强化学习和 Catboost。如果您希望在另一种模型类型中集成 Tensorboard，请在 [Freqtrade GitHub](https://github.com/freqtrade/freqtrade/issues) 上开一个 issue。
:::

::: danger 要求
Tensorboard 日志记录需要 FreqAI 的 torch 安装/docker 镜像。
:::

使用 Tensorboard 最简单的方法是确保配置文件中 `freqai.activate_tensorboard` 设置为 `True`（默认设置），运行 FreqAI，然后打开一个单独的 shell 并运行：

```bash
cd freqtrade
tensorboard --logdir user_data/models/unique-id
```

其中 `unique-id` 是 `freqai` 配置文件中设置的 `identifier`。如果您希望在浏览器中访问 127.0.0.1:6060（6060 是 Tensorboard 使用的默认端口）查看输出，则必须在单独的 shell 中运行此命令。

![tensorboard](./assets/tensorboard.jpg)

::: info 停用以提高性能
Tensorboard 日志记录可能会减慢训练速度，在生产环境中使用时应将其停用。
:::