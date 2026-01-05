![freqai-logo](./assets/freqai_doc_logo.svg)

# FreqAI

## 简介

FreqAI 是一款旨在通过自动化各种任务来训练预测性机器学习模型的软件，从而在给定一组输入信号的情况下生成市场预测。总的来说，FreqAI 旨在成为一个沙盒，用于在实时数据上轻松部署强大的机器学习库（[详情见下文](#freqai-在开源机器学习领域中的地位)）。

::: info
FreqAI 现在是，并且永远是一个非营利性的开源项目。FreqAI *没有* 加密代币，FreqAI *不* 出售信号，并且 FreqAI 除了当前的 [freqtrade 文档](https://www.freqtrade.io/zh/freqai/) 之外没有其他域名。
:::

功能包括：

* **自适应重新训练** - 在 [实盘部署](freqai-running.md#实盘部署) 期间重新训练模型，以受监督的方式自适应市场。
* **快速特征工程** - 基于简单的用户创建策略创建大规模丰富的 [特征集](freqai-feature-engineering.md#特征工程)（10,000+ 特征）。
* **高性能** - 多线程允许在与模型推理（预测）和机器人交易操作分开的线程（或 GPU，如果可用）上进行自适应模型重新训练。最新的模型和数据保存在内存中以进行快速推理。
* **真实回测** - 使用自动执行重新训练的 [回测模块](freqai-running.md#回测) 在历史数据上模拟自适应训练。
* **可扩展性** - 通用且强大的架构允许整合 Python 中可用的任何 [机器学习库/方法](freqai-configuration.md#使用不同的预测模型)。目前提供八个示例，包括分类器、回归器和卷积神经网络。
* **智能离群值移除** - 使用各种 [离群值检测技术](freqai-feature-engineering.md#离群值检测) 从训练和预测数据集中移除离群值。
* **故障恢复能力** - 将训练好的模型存储到磁盘，使故障后重新加载快速且容易，并 [清理过时的文件](freqai-running.md#清理旧模型数据) 以进行持续的模拟/实盘运行。
* **自动数据归一化** - 以智能且统计安全的方式 [归一化数据](freqai-feature-engineering.md#构建数据流水线)。
* **自动数据下载** - 计算数据下载的时间范围并更新历史数据（在实盘部署中）。
* **输入数据清洗** - 在训练和模型推理之前安全地处理 NaN（空值）。
* **降维** - 通过 [主成分分析](freqai-feature-engineering.md#使用主成分分析进行数据降维) 缩小训练数据的规模。
* **部署机器人集群** - 设置一个机器人训练模型，同时让一个 [消费者](producer-consumer.md) 集群使用信号。

## 快速开始

快速测试 FreqAI 的最简单方法是使用以下命令在模拟模式下运行它：

```bash
freqtrade trade --config config_examples/config_freqai.example.json --strategy FreqaiExampleStrategy --freqaimodel LightGBMRegressor --strategy-path freqtrade/templates
```

您将看到自动数据下载的启动过程，随后是同步进行的训练和交易。

::: danger 非生产用途
警告！
Freqtrade 源代码提供的示例策略旨在展示/测试 FreqAI 的各种功能。它也设计为在小型计算机上运行，以便作为开发人员和用户之间的基准。它 *不* 适合在生产环境中运行。
:::

可供参考的示例策略、预测模型和配置分别位于：
`freqtrade/templates/FreqaiExampleStrategy.py`, `freqtrade/freqai/prediction_models/LightGBMRegressor.py`, 以及
`config_examples/config_freqai.example.json`。

## 通用方法

您为 FreqAI 提供一组自定义的 *基础指标*（方式与 [典型的 Freqtrade 策略](strategy-customization.md) 相同）以及目标值（*标签 (labels)*）。对于白名单中的每个交易对，FreqAI 都会根据输入的自定义指标训练一个模型来预测目标值。随后，模型将以预定的频率不断重新训练，以适应市场状况。FreqAI 提供回测策略（通过在历史数据上定期重新训练来模拟现实）和部署模拟/实盘运行的能力。在模拟/实盘条件下，FreqAI 可以设置为在后台线程中不断重新训练，以保持模型尽可能更新。

下面显示了算法概览，解释了数据处理流程和模型使用情况。

![freqai-algo](./assets/freqai_algo.jpg)

### 重要的机器学习词汇

**特征 (Features)** - 模型所基于的、由历史数据组成的参数。单根 K 线的所有特征都存储为一个向量。在 FreqAI 中，您可以利用策略中能够构建的任何内容来构建特征数据集。

**标签 (Labels)** - 模型训练的目标值。每个特征向量都与您在策略中定义的单个标签相关联。这些标签有意地查看未来，它们就是您训练模型希望能够预测的内容。

**训练 (Training)** - “教导”模型将特征集与相关标签匹配的过程。不同类型的模型以不同的方式“学习”，这意味着对于特定应用，某种模型可能比另一种更好。有关 FreqAI 中已实现的各种模型的更多信息，可见 [此处](freqai-configuration.md#使用不同的预测模型)。

**训练数据 (Train data)** - 在训练期间输入模型以“教导”模型如何预测目标的特征数据集子集。这些数据直接影响模型中的权重连接。

**测试数据 (Test data)** - 特征数据集的子集，用于在训练后评估模型的表现。这些数据不影响模型内的节点权重。

**推理 (Inferencing)** - 将新的、未见过的数据输入经过训练的模型，由其进行预测的过程。

## 安装先决条件

普通的 Freqtrade 安装过程会询问您是否希望安装 FreqAI 依赖项。如果您希望使用 FreqAI，应对此问题回答 "yes"。如果您当时没有回答 "yes"，可以在安装后手动安装这些依赖项：

``` bash
pip install -r requirements-freqai.txt
```

::: info
Catboost 不会安装在低功耗的 ARM 设备（如树莓派）上，因为它不为该平台提供 wheel 文件。
:::

### 使用 Docker

如果您使用 Docker，可以通过 `:freqai` 标签获取包含 FreqAI 依赖项的专用镜像。因此，您可以将 Docker Compose 文件中的 image 行替换为 `image: freqtradeorg/freqtrade:stable_freqai`。此镜像包含常规的 FreqAI 依赖项。与原生安装类似，Catboost 在基于 ARM 的设备上不可用。如果您想使用 PyTorch 或强化学习，应使用 torch 或 RL 标签：`image: freqtradeorg/freqtrade:stable_freqaitorch`, `image: freqtradeorg/freqtrade:stable_freqairl`。

::: info docker-compose-freqai.yml
我们在 `docker/docker-compose-freqai.yml` 中为此提供了一个显式的 Docker Compose 文件 —— 可以通过 `docker compose -f docker/docker-compose-freqai.yml run ...` 使用 —— 或者可以将其复制以替换原始的 Docker 文件。此 Docker Compose 文件还包含一个（禁用的）部分，用于在 Docker 容器中启用 GPU 资源。这显然假设系统具有可用的 GPU 资源。
:::

### FreqAI 在开源机器学习领域中的地位

预测像股票/加密货币市场这样的混乱时间序列系统，需要一套广泛的工具来测试各种假设。幸运的是，随着近期鲁棒机器学习库（如 `scikit-learn`）的成熟，开启了广泛的研究可能性。来自不同领域的科学家现在可以轻松地在大量成熟的机器学习算法上原型化他们的研究。同样，这些用户友好的库使得“草根科学家”能够使用其基础的 Python 技能进行数据探索。然而，在历史和实时混乱数据源上利用这些机器学习库在逻辑上可能很困难且成本高昂。此外，可靠的数据收集、存储和处理也提出了巨大的挑战。[`FreqAI`](#freqai) 旨在提供一个通用且可扩展的开源框架，面向市场预测的自适应建模实盘部署。`FreqAI` 框架实际上是丰富开源机器学习库世界的沙盒。在 `FreqAI` 沙盒内，用户会发现他们可以结合多种第三方库，在免费、全天候 24/7 的实时混乱数据源（即加密货币交易所数据）上测试创意假设。

### 引用 FreqAI

FreqAI [发表在《Journal of Open Source Software》上](https://joss.theoj.org/papers/10.21105/joss.04864)。如果您在研究中发现 FreqAI 有所帮助，请使用以下引用：

```bibtex
@article{Caulk2022, 
    doi = {10.21105/joss.04864},
    url = {https://doi.org/10.21105/joss.04864},
    year = {2022}, publisher = {The Open Journal},
    volume = {7}, number = {80}, pages = {4864},
    author = {Robert A. Caulk and Elin Törnquist and Matthias Voppichler and Andrew R. Lawless and Ryan McMullan and Wagner Costa Santos and Timothy C. Pogue and Johan van der Vlugt and Stefan P. Gehring and Pascal Schmidt},
    title = {FreqAI: generalizing adaptive modeling for chaotic time-series market forecasts},
    journal = {Journal of Open Source Software} } 
```

## 常见隐患

FreqAI 不能与动态 `VolumePairlists`（或任何动态增加和删除交易对的交易对列表过滤器）结合使用。
这是出于性能原因 —— FreqAI 依赖于进行快速预测/重新训练。为了有效地做到这一点，
它需要在模拟/实盘实例开始时下载所有的训练数据。FreqAI 会自动存储并追加
新 K 线以备将来重新训练之用。这意味着如果由于交易量对列表而在模拟运行后期增加了新交易对，它将没有准备好数据。但是，FreqAI 确实可以与 `ShufflePairlist` 或保持总交易对列表恒定（但根据成交量重新排序交易对）的 `VolumePairlist` 配合使用。

## 其他学习材料

在这里，我们整理了一些外部材料，提供了对 FreqAI 各种组件的深入研究：

- [实时面对面：使用 XGBoost 和 CatBoost 对金融市场数据进行自适应建模](https://emergentmethods.medium.com/real-time-head-to-head-adaptive-modeling-of-financial-market-data-using-xgboost-and-catboost-995a115a7495)
- [FreqAI - 从价格到预测](https://emergentmethods.medium.com/freqai-from-price-to-prediction-6fadac18b665)

## 支持

您可以在多个地方找到针对 FreqAI 的支持，包括 [Freqtrade Discord](https://discord.gg/Jd8JYeWHc4)、专门的 [FreqAI Discord](https://discord.gg/7AMWACmbjT) 以及 [GitHub Issues](https://github.com/freqtrade/freqtrade/issues)。

## 致谢

FreqAI 由一群为项目提供特定技能的个人开发。

构思与软件开发：
Robert Caulk @robcaulk

理论集思广益与数据分析：
Elin Törnquist @th0rntwig

代码审查与软件架构集思广益：
@xmatthias

软件开发：
Wagner Costa @wagnercosta
Emre Suzen @aemr3
Timothy Pogue @wizrds

测试与错误报告：
Stefan Gehring @bloodhunter4rc, @longyu, Andrew Lawless @paranoidandy, Pascal Schmidt @smidelis, Ryan McMullan @smarmau, Juha Nykänen @suikula, Johan van der Vlugt @jooopiert, Richárd Józsa @richardjosza
