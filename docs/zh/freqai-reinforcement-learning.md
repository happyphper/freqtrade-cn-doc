# 强化学习 (Reinforcement Learning)

::: info 安装体积
强化学习的依赖包含大型包，如 `torch`。在运行 `./setup.sh -i` 时，应显式通过对问题 "Do you also want dependencies for freqai-rl (~700mb additional space required) [y/N]?" 回答 "y" 来请求安装。
偏好使用 Docker 的用户应确保使用以 `_freqairl` 结尾的镜像。
:::

## 背景与术语

### 什么是强化学习，为什么 FreqAI 需要它？

强化学习涉及两个重要组件：*代理 (agent)* 和训练 *环境 (environment)*。在代理训练期间，代理会逐根 K 线浏览历史数据，始终从一组操作中选择一个：做多入场 (Long entry)、做多离场 (Long exit)、做空入场 (Short entry)、做空离场 (Short exit)、观望 (Neutral)。在此训练过程中，环境会跟踪这些操作的表现，并根据用户自定义的 `calculate_reward()`（如果用户愿意，我们提供了一个默认奖励供其参考 [详情在此](#creating-a-custom-reward-function)）对代理进行奖励。该奖励用于训练神经网络中的权重。

FreqAI 强化学习实现的第二个重要组件是 *状态 (state)* 信息的使用。状态信息在每一步都会输入到网络中，包括当前利润、当前仓位和当前交易时长。这些信息用于在训练环境中训练代理，并在模拟/实盘中加强代理（此功能在回测中不可用）。*由于这些信息在实盘部署中很容易获得，因此 FreqAI + Freqtrade 是这种强化机制的完美搭配。*

强化学习是 FreqAI 的自然演进，因为它增加了分类器和回归器无法比拟的新一层适应性和市场反应能力。然而，分类器和回归器具有强化学习不具备的优势，例如鲁棒的预测。如果训练不当，强化学习代理可能会找到“作弊”和“窍门”来最大化奖励，而实际上并没有赢得任何交易。因此，强化学习比典型的分类器和回归器更复杂，需要更深层次的理解。

### 强化学习接口

在当前框架中，我们的目标是通过通用的“预测模型”文件公开训练环境，该文件是一个用户继承的 `BaseReinforcementLearner` 对象（例如 `freqai/prediction_models/ReinforcementLearner`）。在这个用户类中，强化学习环境是可用的，并可以通过 `MyRLEnv` 进行自定义，如下[所示](#creating-a-custom-reward-function)。

我们设想大多数用户将精力集中在 `calculate_reward()` 函数的创意设计上 [详情在此](#creating-a-custom-reward-function)，而保持环境的其余部分不变。其他用户可能根本不会接触环境，他们只会使用配置设置和 FreqAI 中已经存在的强大特征工程。与此同时，我们允许高级用户完全创建自己的模型类。

该框架基于 stable_baselines3 (torch) 和 OpenAI gym 构建基础环境类。但总的来说，模型类是很好隔离的。因此，添加其他竞争库可以很容易地集成到现有框架中。对于环境，它继承自 `gym.Env`，这意味着为了切换到不同的库，必须编写一个全新的环境。

### 重要注意事项

如上所述，代理是在人工交易“环境”中受训的。在我们的案例中，该环境可能看起来与真实的 Freqtrade 回测环境非常相似，但事实并非如此。事实上，强化学习训练环境要简化得多。它不包含任何复杂的策略逻辑，例如 `custom_exit`、`custom_stoploss` 等回调、杠杆控制等。相反，强化学习环境是真实市场的非常“原始”的表现，代理可以自由学习由 `calculate_reward()` 强制执行的策略（即止损、获利等）。因此，重要的是要考虑到代理训练环境与现实世界并不完全相同。

## 运行强化学习

设置和运行强化学习模型与运行回归器或分类器相同。必须在命令行上定义相同的两个标志，`--freqaimodel` 和 `--strategy`：

```bash
freqtrade trade --freqaimodel ReinforcementLearner --strategy MyRLStrategy --config config.json
```

其中 `ReinforcementLearner` 将使用来自 `freqai/prediction_models/ReinforcementLearner` 的模板 `ReinforcementLearner`（或位于 `user_data/freqaimodels` 中的用户自定义模型）。另一方面，该策略遵循与典型回归器相同的[特征工程 (feature engineering)](freqai-feature-engineering.md) 及 `feature_engineering_*`。区别在于目标的创建，强化学习不需要目标。但是，FreqAI 要求在 action 列中设置一个默认（中性）值：

```python
    def set_freqai_targets(self, dataframe, **kwargs) -> DataFrame:
        """
        *仅适用于启用了 FreqAI 的策略*
        设置模型目标的必要函数。
        所有目标必须以 `&` 开头才能被 FreqAI 内部识别。

        更多关于特征工程的详情请见：

        https://www.freqtrade.io/en/latest/freqai-feature-engineering

        :param df: 将接收目标的策略数据帧
        用法示例：dataframe["&-target"] = dataframe["close"].shift(-1) / dataframe["close"]
        """
        # 对于强化学习，没有直接可设置的目标。这只是一个填充物（中性）
        # 直到代理发送操作。
        dataframe["&-action"] = 0
        return dataframe
```

大部分函数与典型的回归器保持一致，但是，下面的函数显示了策略必须如何将原始价格数据传递给代理，以便代理在训练环境中可以访问原始 OHLCV：

```python
    def feature_engineering_standard(self, dataframe: DataFrame, **kwargs) -> DataFrame:
        # 以下特征对于强化学习模型是必需的
        dataframe[f"%-raw_close"] = dataframe["close"]
        dataframe[f"%-raw_open"] = dataframe["open"]
        dataframe[f"%-raw_high"] = dataframe["high"]
        dataframe[f"%-raw_low"] = dataframe["low"]
    return dataframe
```

最后，没有显式的“标签 (label)”需要制作 —— 相反，必须分配 `&-action` 列，该列在 `populate_entry/exit_trends()` 中被访问时将包含代理的操作。在本示例中，中性操作设置为 0。此值应与所使用的环境一致。FreqAI 提供了两个环境，均使用 0 作为中性操作。

在用户意识到没有标签需要设置后，他们很快就会明白代理正在做出它“自己”的入场和离场决定。这使得策略构建变得相当简单。入场和离场信号以整数形式来自代理 —— 直接用于决定策略中的入场和离场：

```python
    def populate_entry_trend(self, df: DataFrame, metadata: dict) -> DataFrame:

        enter_long_conditions = [df["do_predict"] == 1, df["&-action"] == 1]

        if enter_long_conditions:
            df.loc[
                reduce(lambda x, y: x & y, enter_long_conditions), ["enter_long", "enter_tag"]
            ] = (1, "long")

        enter_short_conditions = [df["do_predict"] == 1, df["&-action"] == 3]

        if enter_short_conditions:
            df.loc[
                reduce(lambda x, y: x & y, enter_short_conditions), ["enter_short", "enter_tag"]
            ] = (1, "short")

        return df

    def populate_exit_trend(self, df: DataFrame, metadata: dict) -> DataFrame:
        exit_long_conditions = [df["do_predict"] == 1, df["&-action"] == 2]
        if exit_long_conditions:
            df.loc[reduce(lambda x, y: x & y, exit_long_conditions), "exit_long"] = 1

        exit_short_conditions = [df["do_predict"] == 1, df["&-action"] == 4]
        if exit_short_conditions:
            df.loc[reduce(lambda x, y: x & y, exit_short_conditions), "exit_short"] = 1

        return df
```

需要注意的是，`&-action` 取决于他们选择使用哪个环境。上面的示例显示了 5 个操作，其中 0 为中性，1 为做多入场，2 为做多离场，3 为做空入场，4 为做空离场。

## 配置强化学习器

为了配置 `Reinforcement Learner`，`freqai` 配置中必须存在以下字典：

```json
        "rl_config": {
            "train_cycles": 25,
            "add_state_info": true,
            "max_trade_duration_candles": 300,
            "max_training_drawdown_pct": 0.02,
            "cpu_count": 8,
            "model_type": "PPO",
            "policy_type": "MlpPolicy",
            "model_reward_parameters": {
                "rr": 1,
                "profit_aim": 0.025
            }
        }
```

参数详情可以在[此处](freqai-parameter-table.md)找到，但一般来说，`train_cycles` 决定了代理在其人工环境中循环浏览 K 线数据以训练模型权重的次数。`model_type` 是一个字符串，用于选择 [stable_baselines](https://stable-baselines3.readthedocs.io/en/master/)(外部链接) 中可用的模型之一。

::: info
如果您想尝试 `continual_learning`（持续学习），则应在主 `freqai` 配置字典中将该值设置为 `true`。这将告诉强化学习库从先前模型的最终状态继续训练新模型，而不是每次启动重新训练时都从头开始重新训练新模型。
:::

::: info
请记住，通用的 `model_training_parameters` 字典应包含特定 `model_type` 的所有模型超参数自定义。例如，`PPO` 参数可以在[此处](https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html)找到。
:::

## 创建自定义奖励函数

::: danger 非生产用途
警告！
Freqtrade 源代码提供的奖励函数是一项功能的展示，旨在展示/测试尽可能多的环境控制功能。它还旨在小型计算机上快速运行。这是一个基准测试，*并非* 用于实盘生产。请注意，您将需要创建自己的 custom_reward() 函数，或使用由 Freqtrade 源代码之外的其他用户构建的模板。
:::

当您开始修改策略和预测模型时，您很快会意识到强化学习器与回归器/分类器之间的一些重要区别。首先，策略不设置目标值（没有标签！）。相反，您在 `MyRLEnv` 类中设置 `calculate_reward()` 函数（见下文）。`prediction_models/ReinforcementLearner.py` 中提供了一个默认的 `calculate_reward()`，以演示创建奖励所需的必要构建块，但这 *并非* 为生产而设计。用户 *必须* 创建自己的自定义强化学习模型类，或者从 Freqtrade 源代码之外使用预构建的模型类，并将其保存到 `user_data/freqaimodels`。在 `calculate_reward()` 内部，可以表达关于市场的创意理论。例如，当代理进行盈利交易时，您可以奖励它；当代理进行亏损交易时，您可以惩罚它。或者，您希望奖励代理入场，并惩罚代理在交易中停留太久。下面我们展示了如何计算这些奖励的示例：

::: info 提示
最好的奖励函数是连续可微且比例恰当的函数。换句话说，对罕见事件添加单一的大额负面惩罚并不是一个好主意，神经网络将无法学习该函数。相反，最好对常见事件添加较小的负面惩罚。这将有助于代理更快地学习。不仅如此，您还可以通过让奖励/惩罚根据某些线性/指数函数随严重程度成比例缩放，从而帮助提高奖励/惩罚的连续性。换句话说，随着交易时长的增加，您会缓慢增加惩罚。这比在单个时间点发生单一的大额惩罚要好。
:::

```python
from freqtrade.freqai.prediction_models.ReinforcementLearner import ReinforcementLearner
from freqtrade.freqai.RL.Base5ActionRLEnv import Actions, Base5ActionRLEnv, Positions


class MyCoolRLModel(ReinforcementLearner):
    """
    用户创建的强化学习预测模型。

    将此文件保存到 `freqtrade/user_data/freqaimodels`

    然后通过以下方式使用：

    freqtrade trade --freqaimodel MyCoolRLModel --config config.json --strategy SomeCoolStrat

    在这里，用户可以覆盖 `IFreqaiModel` 继承树中可用的任何函数。
    对于强化学习最重要的是，这是用户覆盖 `MyRLEnv`（见下文）的地方，
    以定义自定义的 `calculate_reward()` 函数，或覆盖环境的其他任何部分。

    该类还允许用户覆盖 IFreqaiModel 树的任何其他部分。
    例如，用户可以覆盖 `def fit()` 或 `def train()` 或 `def predict()`
    以对这些过程进行精细控制。

    另一个常见的覆盖可能是 `def data_cleaning_predict()`，用户可以在其中
    对数据处理流程进行精细控制。
    """
    class MyRLEnv(Base5ActionRLEnv):
        """
        用户自定义环境。该类继承自 BaseEnvironment 和 gym.Env。
        用户可以覆盖来自这些父类的任何函数。下面是一个用户自定义的 `calculate_reward()` 函数示例。

        警告！
        该函数是一项功能的展示，旨在展示尽可能多的环境控制功能。
        它还旨在小型计算机上快速运行。这是一个基准测试，*并非* 用于实盘生产。
        """
        def calculate_reward(self, action: int) -> float:
            # 首先，如果操作无效则惩罚
            if not self._is_valid(action):
                return -2
            pnl = self.get_unrealized_profit()

            factor = 100

            pair = self.pair.replace(':', '')

            # 您可以使用来自数据帧的特征值
            # 假设已经在策略中生成了偏移的 RSI 指标。
            rsi_now = self.raw_features[f"%-rsi-period_10_shift-1_{pair}_"
                            f"{self.config['timeframe']}"].iloc[self._current_tick]

            # 奖励代理入场交易
            if (action in (Actions.Long_enter.value, Actions.Short_enter.value)
                    and self._position == Positions.Neutral):
                if rsi_now < 40:
                    factor = 40 / rsi_now
                else:
                    factor = 1
                return 25 * factor

            # 劝阻代理不入场交易
            if action == Actions.Neutral.value and self._position == Positions.Neutral:
                return -1
            max_trade_duration = self.rl_config.get('max_trade_duration_candles', 300)
            trade_duration = self._current_tick - self._last_trade_tick
            if trade_duration <= max_trade_duration:
                factor *= 1.5
            elif trade_duration > max_trade_duration:
                factor *= 0.5
            # 劝阻持仓不动
            if self._position in (Positions.Short, Positions.Long) and \
            action == Actions.Neutral.value:
                return -1 * trade_duration / max_trade_duration
            # 平多
            if action == Actions.Long_exit.value and self._position == Positions.Long:
                if pnl > self.profit_aim * self.rr:
                    factor *= self.rl_config['model_reward_parameters'].get('win_reward_factor', 2)
                return float(pnl * factor)
            # 平空
            if action == Actions.Short_exit.value and self._position == Positions.Short:
                if pnl > self.profit_aim * self.rr:
                    factor *= self.rl_config['model_reward_parameters'].get('win_reward_factor', 2)
                return float(pnl * factor)
            return 0.
```

## 使用 Tensorboard

强化学习模型受益于跟踪训练指标。FreqAI 集成了 Tensorboard，允许用户跟踪所有代币以及所有重新训练的训练和评估表现。Tensorboard 通过以下命令激活：

```bash
tensorboard --logdir user_data/models/unique-id
```

其中 `unique-id` 是 `freqai` 配置文件中设置的 `identifier`。此命令必须在单独的 shell 中运行，以便在浏览器中访问 127.0.0.1:6006（6006 是 Tensorboard 使用的默认端口）查看输出。

![tensorboard](./assets/tensorboard.jpg)

## 自定义日志

FreqAI 还提供了一个内置的剧集总结记录器，名为 `self.tensorboard_log`，用于向 Tensorboard 日志添加自定义信息。默认情况下，该函数已经在环境内的每一步调用一次，以记录代理的操作。在一次剧集中为所有步骤累积的所有值都会在该剧集结束时报告，随后所有指标都会完全重置为 0，为后续剧集做准备。

`self.tensorboard_log` 也可以在环境内的任何地方使用，例如，可以将其添加到 `calculate_reward` 函数中，以收集关于奖励各个部分被调用频率的更详细信息：

```python
    class MyRLEnv(Base5ActionRLEnv):
        """
        用户自定义环境。该类继承自 BaseEnvironment 和 gym.Env。
        用户可以覆盖来自这些父类的任何函数。下面是一个用户自定义的 `calculate_reward()` 函数示例。
        """
        def calculate_reward(self, action: int) -> float:
            if not self._is_valid(action):
                self.tensorboard_log("invalid")
                return -2
```

::: info
`self.tensorboard_log()` 函数仅设计用于跟踪递增的对象，即训练环境内的事件、操作。如果感兴趣的事件是浮点数，则可以将该浮点数作为第二个参数传递，例如 `self.tensorboard_log("float_metric1", 0.23)`。在这种情况下，指标值不会递增。
:::

## 选择基础环境

FreqAI 提供了三种基础环境：`Base3ActionRLEnvironment`、`Base4ActionEnvironment` 和 `Base5ActionEnvironment`。顾名思义，这些环境是为可以从 3、4 或 5 个操作中进行选择的代理量身定制的。`Base3ActionEnvironment` 是最简单的，代理可以从持有、做多或做空。该环境也可以用于仅做多的机器人（它会自动遵循策略中的 `can_short` 标志），其中做多是入场条件，做空是离场条件。与此同时，在 `Base4ActionEnvironment` 中，代理可以做多入场、做空入场、保持中性或离场。最后，在 `Base5ActionEnvironment` 中，代理具有与 Base4 相同的操作，但它没有单一的离场操作，而是分开了做多离场和做空离场。环境选择引起的主要变化包括：

* `calculate_reward` 中可用的操作
* 用户策略消耗的操作

所有 FreqAI 提供的环境都继承自一个名为 `BaseEnvironment` 的与操作/仓位无关的环境对象，其中包含所有共享 logic。该架构旨在易于自定义。最简单的自定义是 `calculate_reward()`（详见[此处](#creating-a-custom-reward-function)）。然而，自定义还可以进一步延伸到环境内的任何函数。您可以通过简单地在预测模型文件的 `MyRLEnv` 中覆盖这些函数来实现。或者对于更高级的自定义，鼓励创建一个完全继承自 `BaseEnvironment` 的新环境。

::: info
只有 `Base3ActionRLEnv` 可以进行仅做多训练/交易（设置用户策略属性 `can_short = False`）。
:::