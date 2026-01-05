# 开发帮助 (Development Help)

本页面面向 Freqtrade 的开发人员、希望为 Freqtrade 代码库或文档做出贡献的人员，以及希望了解他们所运行应用程序源代码的人员。

欢迎所有的贡献、错误报告、错误修复、文档改进、增强功能和创意。我们在 [GitHub](https://github.com/freqtrade/freqtrade/issues) 上 [跟踪问题](https://github.com/freqtrade/freqtrade/issues)，并在 [Discord](https://discord.gg/p7nuUNVfP7) 上设有一个开发频道，您可以在那里提问。

## 文档 (Documentation)

文档位于 [https://freqtrade.io](https://www.freqtrade.io/)，每个新功能的 PR 都需要提供相应的文档。

有关文档特殊字段（如笔记框等）的信息可以从 [此处](https://squidfunk.github.io/mkdocs-material/reference/admonitions/) 找到。

要在本地测试文档，请使用以下命令。

``` bash
pip install -r docs/requirements-docs.txt
mkdocs serve
```

这将启动一个本地服务器（通常在 8000 端口），以便您可以查看一切是否符合您的预期。

## 开发者设置 (Developer setup)

要配置开发环境，您可以使用提供的 [开发容器 (DevContainer)](#开发容器设置)，或使用 `setup.sh` 脚本并在询问“是否要安装用于开发的依赖项 [y/N]？”时回答“y”。
或者（例如，如果您的系统不支持 `setup.sh` 脚本），遵循手动安装过程并运行 `pip3 install -r requirements-dev.txt` —— 然后运行 `pip3 install -e .[all]`。

这将安装开发所需的所有工具，包括 `pytest`、`ruff`、`mypy` 和 `coveralls`。

运行以下命令安装 git hook 脚本：

``` bash
pre-commit install
```

这些 pre-commit 脚本会在每次提交前自动检查您的更改。
如果发现任何格式问题，提交将失败并提示修复。
这减少了不必要的 CI 失败，减轻了维护负担，并提高了代码质量。

必要时，您可以使用 `pre-commit run -a` 手动运行检查。

在开启拉取请求 (pull request) 之前，请先熟悉我们的 [贡献指南 (Contributing Guidelines)](https://github.com/freqtrade/freqtrade/blob/develop/CONTRIBUTING.md)。

### 开发容器设置 (Devcontainer setup)

开始使用的最快最简单的方法是使用带有远程容器扩展的 [VSCode](https://code.visualstudio.com/)。
这使开发人员能够启动带有所有必需依赖项的机器人，而*无需*在本地机器上安装任何 freqtrade 特定的依赖项。

#### 开发容器依赖项 (Devcontainer dependencies)

* [VSCode](https://code.visualstudio.com/)
* [Docker](https://docs.docker.com/install/)
* [远程容器扩展文档](https://code.visualstudio.com/docs/remote)

有关 [远程容器扩展](https://code.visualstudio.com/docs/remote) 的更多信息，最好参考其文档。

### 测试 (Tests)

新代码应由基础单元测试覆盖。根据功能的复杂程度，审查者可能会要求更深入的单元测试。
如有必要，Freqtrade 团队可以协助并指导编写好的测试（但请不要指望有人为您编写测试）。

#### 如何运行测试 (How to run tests)

在根目录下使用 `pytest` 运行所有可用的测试案例，并确认您的本地环境设置正确。

::: info 功能分支 (Feature branches)
测试预计在 `develop` 和 `stable` 分支上通过。其他分支可能是正在进行中的工作，测试可能尚无法运行。
:::

#### 检查测试中的日志内容 (Checking log content in tests)

Freqtrade 使用 2 种主要方法来检查测试中的日志内容：`log_has()` 和 `log_has_re()`（用于使用正则检查动态日志消息）。
这些方法可从 `conftest.py` 获得，并可导入到任何测试模块中。

示例检查如下所示：

``` python
from tests.conftest import log_has, log_has_re

def test_method_to_test(caplog):
    method_to_test()

    assert log_has("This event happened", caplog)
    # 检查带有末尾数字的正则...
    assert log_has_re(r"This dynamic event happened and produced \d+", caplog)

```

### 调试配置 (Debug configuration)

要调试 freqtrade，我们推荐使用带有 Python 扩展的 VSCode，并使用以下启动配置（位于 `.vscode/launch.json`）。
细节显然会因设置而异 —— 但这应该足以让您开始。

``` json
{
    "name": "freqtrade trade",
    "type": "debugpy",
    "request": "launch",
    "module": "freqtrade",
    "console": "integratedTerminal",
    "args": [
        "trade",
        // 可选:
        // "--userdir", "user_data",
        "--strategy", 
        "MyAwesomeStrategy",
    ]
}
```

命令行参数可以添加到 `"args"` 数组中。
这种方法也可以用于调试策略，方法是在策略中设置断点。

对于 PyCharm 也可以采用类似的设置 —— 使用 `freqtrade` 作为模块名称，并将命令行参数设置为“参数 (parameters)”。

::: tip 正确使用虚拟环境 (venv)
使用虚拟环境时（您应该这么做），请确保您的编辑器使用的是正确的虚拟环境，以避免问题或“未知导入”错误。

#### VSCode
您可以使用命令“Python: Select Interpreter”在 VSCode 中选择正确的环境 —— 这将向您显示扩展检测到的环境。
如果您的环境未被检测到，您也可以手动选择路径。

#### PyCharm
在 PyCharm 中，您可以在“运行/调试配置 (Run/Debug Configurations)”窗口中选择适当的环境。
![Pycharm debug configuration](./assets/pycharm_debug.png)
:::

::: info 启动目录 (Startup directory)
这假设您已经检出了仓库，并且编辑器是在仓库根目录级别启动的（因此 `pyproject.toml` 位于仓库的顶层）。
:::

## 错误处理 (ErrorHandling)

Freqtrade 的异常都继承自 `FreqtradeException`。
然而，不应直接使用这个通用的错误类。相反，存在多个专门的子异常。

以下是异常继承体系的概览：

```
+ FreqtradeException
|
+---+ OperationalException
|   |
|   +---+ ConfigurationError
|
+---+ DependencyException
|   |
|   +---+ PricingError
|   |
|   +---+ ExchangeError
|       |
|       +---+ TemporaryError
|       |
|       +---+ DDosProtection
|       |
|       +---+ InvalidOrderException
|           |
|           +---+ RetryableOrderError
|           |
|           +---+ InsufficientFundsError
|
+---+ StrategyError
```

---

## 插件 (Plugins)

### 交易对列表 (Pairlists)

您有一个关于新交易对选择算法的好主意并想尝试一下？太棒了。
希望您也想将此贡献回上游。

无论您的动机是什么 —— 这都应该能让您开始尝试开发一个新的交易对列表处理器 (Pairlist Handler)。

首先，看一下 [VolumePairList](https://github.com/freqtrade/freqtrade/blob/develop/freqtrade/plugins/pairlist/VolumePairList.py) 处理器，最好用您新处理器名复制该文件。

这是一个简单的处理器，但可以作为一个很好的开发起始示例。

接下来，修改处理器的类名（理想情况下与模块文件名保持一致）。

基类提供了一个交易所实例 (`self._exchange`)、交易对列表管理器 (`self._pairlistmanager`)，以及主配置 (`self._config`)、交易对列表专用配置 (`self._pairlistconfig`) 以及在交易对列表链中的绝对位置。

```python
        self._exchange = exchange
        self._pairlistmanager = pairlistmanager
        self._config = config
        self._pairlistconfig = pairlistconfig
        self._pairlist_pos = pairlist_pos
```

::: tip
别忘了在 `constants.py` 的变量 `AVAILABLE_PAIRLISTS` 下注册您的交易对列表 —— 否则它将无法被选择。
:::

现在，让我们逐步了解需要采取行动的方法：

#### 交易对列表配置 (Pairlist configuration)

交易对列表处理器链的配置在机器人的配置文件中，位于 `"pairlists"` 元素中，这是链中每个交易对列表处理器的配置参数数组。

按照惯例，`"number_assets"` 用于指定交易对列表中要保留的最大交易对数量。请遵循此项以确保一致的用户体验。

可以根据需要配置其他参数。例如，`VolumePairList` 使用 `"sort_key"` 来指定排序值 —— 尽情根据您的出色算法指定任何成功且动态所需的参数。

#### short_desc

返回用于 Telegram 消息的描述。

这应包含处理器的名称，以及包含资产数量的简短描述。请遵循格式 `"PairlistName - top/bottom X pairs"`。

#### gen_pairlist

如果该处理器可以用作链中的主处理器，则覆盖此方法，定义最初的交易对列表，然后由链中的所有处理器处理。例如 `StaticPairList` 和 `VolumePairList`。

该方法在机器人的每次迭代中被调用（仅当处理器位于第一位时） —— 因此请考虑为计算/网络密集型计算实现缓存。

它必须返回结果交易对列表（然后该列表可能会传递到链中的下一个处理器）。

验证是可选的，父类公开了 `verify_blacklist(pairlist)` 和 `_whitelist_for_active_markets(pairlist)` 用于执行默认过滤。如果您限制结果中的交易对数量，请使用此方法 —— 这样最终结果不会比预期短。

#### filter_pairlist

此方法由交易对列表管理器为链中的每个处理器调用。

它在机器人的每次迭代中被调用 —— 因此请考虑为计算/网络密集型计算实现缓存。

它接收一个交易对列表（可以是上一个处理器的结果）以及 `tickers`（`get_tickers()` 的预抓取版本）。

基类中的默认实现只是为列表中的每个交易对调用 `_validate_pair()` 方法，但您可以覆盖它。因此，您应该在自己的处理器中实现 `_validate_pair()` 或覆盖 `filter_pairlist()` 来执行其他操作。

如果覆盖，它必须返回结果交易对列表（随后会被传递给链中的下一个处理器）。

验证是可选的，父类公开了 `verify_blacklist(pairlist)` 和 `_whitelist_for_active_markets(pairlist)` 用于执行默认过滤。如果您限制结果中的交易对数量，请使用此方法 —— 这样最终结果不会比预期短。

在 `VolumePairList` 中，这实现了不同的排序方法，执行早期验证，以便仅返回预期数量的交易对。

##### 示例

``` python
    def filter_pairlist(self, pairlist: list[str], tickers: dict) -> List[str]:
        # 生成动态白名单
        pairs = self._calculate_pairlist(pairlist, tickers)
        return pairs
```

### 保护 (Protections)

最好阅读 [保护文档](plugins.md#保护-protections) 以了解保护功能。
本指南面向希望开发新保护措施的开发人员。

任何保护都不应直接使用 datetime，而应使用提供的 `date_now` 变量进行日期计算。这保留了对保护进行回测的能力。

::: tip 编写新的保护
最好复制一个现有的保护措施作为参考示例。
:::

#### 实现新的保护 (Implementation of a new protection)

所有保护实现必须将 `IProtection` 作为 parent class（父类）。
因此，它们必须实现以下方法：

* `short_desc()`
* `global_stop()`
* `stop_per_pair()`。

`global_stop()` 和 `stop_per_pair()` 必须返回一个 `ProtectionReturn` 对象，该对象由以下部分组成：

* 锁定交易对 - 布尔值
* 锁定截止时间 - datetime - 该交易对应被锁定到什么时候（将向上取整到下一个新 K 线）
* 原因 - 字符串，用于日志记录和存储在数据库中
* 锁定方向 (lock_side) - 'long'、'short' 或 '*'。

`until`（截止时间）部分应使用提供的 `calculate_lock_end()` 方法计算。

所有保护都应使用 `"stop_duration"` / `"stop_duration_candles"` 来定义一个交易对（或所有交易对）应被锁定多久。
其内容通过 `self._stop_duration` 被提供给每个保护。

如果您的保护需要回溯期，请使用 `"lookback_period"` / `"lockback_period_candles"` 来保持所有保护的一致性。

#### 全局停用 vs. 局部停用 (Global vs. local stops)

保护措施可以有 2 种不同的方式来在有限时间内停止交易：

* 按交易对 (local)
* 为所有交易对 (globally)

##### 保护 - 按交易对 (local)

实现按交易对方式的保护必须设置 `has_local_stop=True`。
每当一笔交易平仓（离场订单完成）时，`stop_per_pair()` 方法都会被调用。

##### 保护 - 全局保护 (global)

这些保护应跨所有交易对执行评估，并相应地锁定所有交易对的交易（称为全局 PairLock）。
全局保护必须设置 `has_global_stop=True` 才能被评估为全局停用。
每当一笔交易平仓（离场订单完成）时，`global_stop()` 方法都会被调用。

##### 保护 - 计算锁定结束时间 (calculating lock end time)

保护应根据它考虑的最后一笔交易来计算锁定结束时间。
这避免了如果回溯期长于实际锁定周期而导致的重新锁定。

`IProtection` 父类在 `calculate_lock_end()` 中为此提供了一个辅助方法。

---

## 实现一个新的交易所 (Implement a new Exchange - WIP)

::: info
本节尚在编写中 (WIP)，并非测试新交易所与 Freqtrade 配合使用的完整指南。
:::

::: info
在运行以下任何测试之前，请确保使用的是 CCXT 的最新版本。
您可以通过在激活的虚拟环境中运行 `pip install -U ccxt` 来获取最新版本的 ccxt。
这些测试不支持原生 Docker，但可用的开发容器将支持所有必需的操作以及最终必要的更改。
:::

CCXT 支持的大多数交易所都应能开箱即用。

如果您需要实现特定的交易所类，这些类位于 `freqtrade/exchange` 源码文件夹中。您还需要将导入添加到 `freqtrade/exchange/__init__.py` 中，以使加载逻辑感知到新的交易所。
我们建议查看现有的交易所实现以了解可能需要什么。

::: warning
实现和测试某个交易所可能会经历大量的尝试和错误，因此请记住这一点。
您还应该具备一定的开发经验，因为这不是一项初学者的任务。
:::

要快速测试交易所的公共端点，请在 `tests/exchange_online/conftest.py` 中为您的交易所添加配置，并使用 `pytest --longrun tests/exchange_online/test_ccxt_compat.py` 运行这些测试。
成功完成这些测试是一个很好的基础（实际上是一项要求），但这些测试并不能保证交易所功能完全正确，因为这仅测试了公共端点，没有测试私有端点（如生成订单或类似操作）。

还可以尝试使用 `freqtrade download-data` 下载较长时间范围（数个月）的数据，并验证数据下载是否正确（没有缺漏，实际下载了指定的时间范围）。

这些是将交易所列为“支持 (Supported)”或“社区测试过 (Community tested)”（列在首页上）的前提条件。
以下是“额外”项，它们能让交易所更完善（功能齐全）—— 但对于上述两类并不是绝对必需的。

待完成的其他测试/步骤：

* 验证 `fetch_ohlcv()` 提供的数据 —— 并最终为该交易所调整 `ohlcv_candle_limit`
* 检查 L2 订单簿限制范围（API 文档）—— 并根据需要进行相应设置
* 检查余额是否正确显示 (*)
* 创建市价单 (*)
* 创建限价单 (*)
* 取消订单 (*)
* 完成交易（入场 + 离场）(*)
  * 比较交易所和机器人之间的结果计算
  * 确保费用应用正确（对照交易所检查数据库）

(*) 需要交易所的 API 密钥和余额。

### 交易所止损 (Stoploss On Exchange)

检查新交易所是否通过其 API 支持“交易所止损订单 (Stoploss on Exchange orders)”。

由于 CCXT 尚未提供“交易所止损”的统一封装，我们需要自己实现特定于交易所的参数。最好参考 `binance.py` 来了解这一点的示例实现。您需要查阅交易所 API 文档，了解具体如何实现。[CCXT 的 Issue](https://github.com/ccxt/ccxt/issues) 也可能大有帮助，因为其他人可能已经为他们的项目实现了类似的东西。

### 不完整的 K 线 (Incomplete candles)

在抓取 K 线 (OHLCV) 数据时，我们最终可能会得到不完整的 K 线（取决于交易所）。
为了演示这一点，我们将使用日线 (`"1d"`) 来保持简单。
我们向 API (`ct.fetch_ohlcv()`) 查询该时间框架并查看最后一项的日期。如果该项发生变化或显示某个“不完整的” K 线日期，那么我们就应该丢弃它，因为拥有不完整的 K 线会产生问题，因为指标假设只传递完整的 K 线给它们，否则会产生大量的错误买入信号。因此默认情况下，我们会移除最后一根 K 线，假设它是不完整的。

要检查新交易所的行为，您可以使用以下代码片段：

``` python
import ccxt
from datetime import datetime, timezone
from freqtrade.data.converter import ohlcv_to_dataframe
ct = ccxt.binance()  # 使用您正在测试的交易所
timeframe = "1d"
pair = "BTC/USDT"  # 确保使用该交易所上存在的交易对！
raw = ct.fetch_ohlcv(pair, timeframe=timeframe)

# 转换为 dataframe
df1 = ohlcv_to_dataframe(raw, timeframe, pair=pair, drop_incomplete=False)

print(df1.tail(1))
print(datetime.now(timezone.utc))
```

``` output
                         date      open      high       low     close  volume  
499 2019-06-08 00:00:00+00:00  0.000007  0.000007  0.000007  0.000007   26264344.0  
2019-06-09 12:30:27.873327
```

输出将显示交易所的最后一项以及当前的 UTC 日期。
如果显示的日期是同一天，那么可以假设最后一根 K 线是不完整的，应予以丢弃（保持交易所类中的设置 `"ohlcv_partial_candle"` 不变/为 True）。否则，将 `"ohlcv_partial_candle"` 设置为 `False` 以便不丢弃 K 线（如上例所示）。
另一种方法是连续多次运行此命令，观察交易量是否在变化（而日期保持不变）。

### 更新币安缓存的杠杆层级 (Update binance cached leverage tiers)

更新杠杆层级应定期进行 —— 并且需要一个启用期货的功能齐全的身份验证帐户。

``` python
import ccxt
import json
from pathlib import Path

exchange = ccxt.binance({
    'apiKey': '<apikey>',
    'secret': '<secret>',
    'options': {'defaultType': 'swap'}
    })
_ = exchange.load_markets()

lev_tiers = exchange.fetch_leverage_tiers()

# 假设在仓库根运行。
file = Path('freqtrade/exchange/binance_leverage_tiers.json')
json.dump(dict(sorted(lev_tiers.items())), file.open('w'), indent=2)

```

该文件随后应贡献回上游，以便其他人也能从中受益。

## 更新示例 Notebook (Updating example notebooks)

为了保持 Jupyter notebook 与文档同步，在更新示例 notebook 后应运行以下操作：

``` bash
jupyter nbconvert --ClearOutputPreprocessor.enabled=True --inplace freqtrade/templates/strategy_analysis_example.ipynb
jupyter nbconvert --ClearOutputPreprocessor.enabled=True --to markdown freqtrade/templates/strategy_analysis_example.ipynb --stdout > docs/zh/strategy_analysis_example.md
```

## 回测文档结果 (Backtest documentation results)

要生成回测输出，请使用以下命令：

``` bash
# 假设有一个专门的用户目录用于此输出
freqtrade create-userdir --userdir user_data_bttest/
# 设置 can_short = True
sed -i "s/can_short: bool = False/can_short: bool = True/" user_data_bttest/strategies/sample_strategy.py

freqtrade download-data --timerange 20250625-20250801 --config tests/testdata/config.tests.usdt.json --userdir user_data_bttest/ -t 5m

freqtrade backtesting --config tests/testdata/config.tests.usdt.json -s SampleStrategy --userdir user_data_bttest/ --cache none --timerange 20250701-20250801
```

## 持续集成 (Continuous integration)

这记录了为 CI 管道做出的一些决定。

* CI 在所有操作系统变体上运行，包括 Linux (Ubuntu)、macOS 和 Windows。
* 为分支 `stable` 和 `develop` 构建 Docker 镜像，并作为多架构构建，通过同一个标签支持多个平台。
* 包含绘图依赖项的 Docker 镜像也可以通过 `stable_plot` 和 `develop_plot` 获得。
* Docker 镜像包含一个文件 `/freqtrade/freqtrade_commit`，其中包含该镜像基于的提交。
* 每周通过计划任务运行一次完整的 Docker 镜像重构。
* 部署在 Ubuntu 上运行。
* 只有所有测试都通过，PR 才能合并到 `stable` 或 `develop`。

## 创建一个发布版本 (Creating a release)

文档的这一部分针对维护者，展示了如何创建一个发布版本。

### 创建发布分支 (Create release branch)

::: info
确保 `stable` 分支是最新的！
:::

首先，选择大约一周前的提交（为了不包括最后添加的内容到发布中）。

``` bash
# 创建新分支
git checkout -b new_release <commitid>
```

确定在该提交与当前状态之间是否进行了关键的错误修复，并最终择友挑选（cherry-pick）这些修复。

* 将发布分支 (stable) 合并到此分支中。
* 编辑 `freqtrade/__init__.py` 并添加与当前日期匹配的版本（例如 2025 年 7 月版本为 `2025.7`）。如果该月需要进行第二次发布，微版本号可以是 `2025.7.1`。版本号必须遵循 PEP0440 允许的版本，以避免推送到 pypi 时失败。
* 提交此部分。
* 将该分支推送到远程仓库，并针对 **stable 分支** 创建一个 PR。
* 将开发版本更新为遵循模式 `2025.8-dev` 的下一个版本。

### 从 git commit 创建变更日志 (Create changelog from git commits)

``` bash
# 需要在合并/拉取该分支之前完成。
git log --oneline --no-decorate --no-merges stable..new_release
```

为了保持发布日志简短，最好将完整的 git 变更日志封装到可折叠的详情 (details) 部分中。

```markdown
<details>
<summary>展开完整变更日志</summary>

... 完整的 git 变更日志

</details>
```

### FreqUI 发布 (FreqUI release)

如果 FreqUI 有实质性的更新，请确保在合并发布分支之前创建一个发布版本。
在合并发布之前，确保发布版本上的 freqUI CI 已完成并通过。

### 创建 GitHub 发布/标签 (Create github release / tag)

一旦针对 stable 分支的 PR 被合并（最好在合并后立即）：

* 在 GitHub UI 中使用“Draft a new release”按钮（在发布子栏目下）。
* 使用指定的版本号作为标签。
* 使用 "stable" 作为参考（此步骤在上述 PR 合并后进行）。
* 使用上述变更日志作为发布说明（以代码块形式）。
* 使用以下代码片段作为新发布内容：

::: tip 发布模板
````
# 更改亮点 (Highlighted changes)

- ...

## 如何更新 (How to update)

与往常一样，您可以使用以下命令之一更新您的机器人：

### docker-compose
```bash
docker-compose pull
docker-compose up -d
```

### 通过设置脚本安装 (Installation via setup script)
``` bash
# 停用虚拟环境并在其中运行
./setup.sh --update
```

### 普通原生安装 (Plain native installation)
``` bash
git pull
pip install -U -r requirements.txt
```

<details>
<summary>展开完整变更日志</summary>

```
<在此处粘贴您的变更日志>
```

</details>
````
:::

## 发布 (Releases)

### pypi

::: warning 手动发布
此过程已作为 GitHub Actions 的一部分自动化。
手动推送到 pypi 应是不必要的。
:::

::: tip 手动发布
要手动创建 pypi 发布版本，请运行以下命令：

额外要求：`wheel`、`twine`（用于上传），具有相应权限的 pypi 帐户。

``` bash
pip install -U build
python -m build --sdist --wheel

# 用于 pypi 测试（检查安装的某些更改是否有效）
twine upload --repository-url https://test.pypi.org/legacy/ dist/*

# 用于生产环境:
twine upload dist/*
```

请不要将非发布版本推送到生产或真实的 pypi 实例中。
:::