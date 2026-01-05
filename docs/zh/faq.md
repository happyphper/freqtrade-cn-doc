
# Freqtrade 常见问题解答 (FAQ)

## 支持的市场 (Supported Markets)

Freqtrade 支持现货交易 (spot trading)，以及部分选定交易所的（全仓/逐仓）期货交易。请参阅 [文档首页](index.md#supported-futures-exchanges-experimental) 获取支持交易所的最新列表。

### 我的机器人可以开空投头寸吗？ (Can my bot open short positions?)

Freqtrade 可以在期货市场开启空投（做空）头寸。
这要求策略为此进行编写，并在配置中设置 `"trading_mode": "futures"`。
请务必先阅读 [相关文档页面](leverage.md)。

在现货市场，在某些情况下，您可以使用杠杆现货代币 (leveraged spot tokens)，它们反映了一个反转的交易对（例如 BTCUP/USD, BTCDOWN/USD, ETHBULL/USD, ETHBEAR/USD...），这些代币可以通过 Freqtrade 进行交易。

### 我的机器人可以交易期权或期货吗？ (Can my bot trade options or futures?)

选定的交易所支持期货交易。请参阅 [文档首页](index.md#supported-futures-exchanges-experimental) 获取支持交易所的最新列表。目前不支持期权。

## 初学者提示与技巧 (Beginner Tips & Tricks)

* 当您处理策略和超参数优化文件时，您应该使用专业的代码编辑器，如 VSCode 或 PyCharm。好的代码编辑器将提供语法高亮以及行号，使查找语法错误（最可能由 Freqtrade 在启动期间指出）变得容易。

## Freqtrade 常见问题 (Freqtrade common questions)

### Freqtrade 是否可以并行开启同一个交易对的多个头寸？

不可以。Freqtrade 每次只能每个交易对开启一个头寸。
但是，您可以使用 [`adjust_trade_position()` 回调](strategy-callbacks.md#adjust-trade-position) 来调整一个未平仓头寸。

回测在 `--eps` 中为提供了此选项 - 然而，这仅用于突出显示“隐藏”信号，在实盘中不起作用。

### 机器人无法启动

运行带有 `freqtrade trade --config config.json` 的机器人显示输出 `freqtrade: command not found`。

这可能是由以下原因引起的：

* 虚拟环境未激活。
  * 运行 `source .venv/bin/activate` 激活虚拟环境。
* 安装未成功完成。
  * 请检查 [安装文档](installation.md)。

### 机器人启动，但处于 STOPPED（已停止）模式

请确保在您的 `config.json` 中将 `initial_state` 配置选项设置为 `"running"`。

### 我已经等了 5 分钟，为什么机器人还没有进行任何交易？

* 取决于进场策略、白名单币种的数量、市场状况等，找到一个好的进场点可能需要数小时或数天。请保持耐心！
* 回测会大致告诉您预期有多少笔交易 - 但这并不能保证它们会在时间上均匀分布 - 所以您可能在一天内有 20 笔交易，而本周余下的时间为 0。
* 可能由于配置错误。最好检查日志，它们通常会告诉您机器人是否只是没有收到买入信号（只有心跳消息），或者是否有问题（日志中的错误/异常）。

### 我已经做了 12 笔交易，为什么我的总利润是负的？

我理解您的失望，但不幸的是，12 笔交易不足以说明任何问题。如果您运行回测，您可以看到当前算法确实会让您处于盈利状态，但那是在成千上万次交易之后，即使在那里，您也会在特定币种上留下亏损。我们不断致力于改进机器人，但交易永远是一场博弈，它应该能让您每月获得可观的收益，但您无法从几次交易中看出太多。

### 我想对配置进行更改。我可以在不杀死机器人的情况下做到吗？

可以。您可以编辑配置并使用 `/reload_config` 命令重新加载配置。机器人将停止、重新加载配置和策略，并使用新的配置和策略重新启动。

### 为什么我的机器人没有卖掉它买入的所有东西？

这被称为“代币粉尘 (coin dust)”，在所有交易所都会发生。
它发生是因为许多交易所从“接收货币”中扣除手续费 - 所以您买了 100 个 COIN - 但您只得到了 99.9 个 COIN。
由于 COIN 以整手大小进行交易（1 个 COIN 步长），您不能卖出 0.9 个 COIN（或 99.9 个 COIN）- 而是需要向下舍入到 99 个 COIN。
这不是机器人问题，在手动交易时也会发生。
虽然 Freqtrade 可以处理此问题（它会卖出 99 个 COIN），但手续费通常低于最小可交易手数（您只能交易完整的 COIN，而不能交易 0.9 个 COIN）。
在交易所留下这些粉尘 (0.9 个 COIN) 通常是有意义的，因为下次 Freqtrade 买入该 COIN 时，它会动用剩余的小额余额，这次卖掉买入的所有东西，从而缓慢减少粉尘余额。

在可能的情况下（例如在币安上），使用交易所专用的手续费货币将解决此问题。在币安上，只要您的账户里有 BNB，并且在您的个人资料中启用了“使用 BNB 支付手续费”就足够了。您的 BNB 余额会缓慢下降（因为用来支付手续费）- 但您将不再遇到粉尘问题（Freqtrade 将在利润计算中包含手续费）。其他交易所不提供此类可能性，在这种情况下，您只能选择接受或转移到不同的交易所。

### 我在交易所存入了更多资金，但我的机器人没有识别出这一点

Freqtrade 将在必要时（如下单前）更新交易所余额。
RPC 调用（Telegram 的 `/balance`，API 调用 `/balance`）最多每小时触发一次更新。
如果启用了 `adjust_trade_position`（且机器人有符合仓位调整条件的未平仓交易）- 则钱包将每小时刷新一次。
要强制立即更新，您可以使用 `/reload_config` - 这将重新启动机器人。

### 我想使用不完整的 K 线 (incomplete candles)

Freqtrade 不会向策略提供不完整的 K 线。使用不完整的 K 线会导致重绘，从而导致产生“幽灵”买入的策略，这些在回测中既无法测试，在发生后也无法验证。
您可以使用 [dataprovider](strategy-customization.md#orderbookpair-maximum) 的 orderbook 或 ticker 方法来使用“当前”市场数据 - 但这些无法在回测期间使用。

### 是否有一个设置可以仅退出持有的交易而不执行任何新的进场？

您可以使用 Telegram 中的 `/stopentry` 命令阻止未来的交易进场，然后使用 `/forceexit all`（卖出所有未平仓交易）。

### 我卖掉了机器人的资金，现在日志中有错误

Freqtrade 假设它开启的交易仅通过机器人管理。
如果您（无意中）卖掉了机器人的资金，Freqtrade 会尝试通过重新查找交易所订单来恢复。
这是一种尽力而为的方法，在所有情况下都不起作用，特别是当使用 Freqtrade 不支持的订单类型（OCO, iceberg 等）时，或者处理较旧的交易时（交易所不再提供完整的订单信息）。
确切的限制在交易所之间有所不同 - 细节通常记录在交易所的 API 文档中。

### 我想在同一台机器上运行多个机器人

请查看 [高级安装文档页面](advanced-setup.md#running-multiple-instances-of-freqtrade)。

### 启动机器人时出现 "Impossible to load Strategy" 错误

当机器人无法加载策略时显示此错误消息。
通常，您可以使用 `freqtrade list-strategies` 列出所有可用的策略。
此命令的输出还将包含状态列，显示策略是否可以加载。

请检查以下内容：
* 您是否使用了正确的策略名称？策略名称区分大小写，且必须对应策略类 (Strategy class) 名称（而不是文件名！）。
* 策略是否在 `user_data/strategies` 目录中，并且文件扩展名为 `.py`？
* 机器人在发生此错误之前是否显示了其他警告？也许您的策略缺少一些依赖项 - 这会在日志中突出显示。
* 在 Docker 的情况下 - 策略目录是否已正确挂载（检查 docker-compose 文件的 volumes 部分）？

### 日志中出现 "Missing data fillup" 消息

此消息只是一个警告，表示最新的 K 线中有丢失的 K 线。
取决于交易所，这可能表示该交易对在您使用的时间框架内没有交易 - 并且交易所仅返回有成交量的 K 线。
在低成交量的交易对上，这是一个相当常见的情况。
如果交易对列表中的所有交易对都发生此情况，这可能表示最近的交易所停机。请检查您的交易所官方频道了解详情。
无论原因如何，Freqtrade 都会用“空”K 线填充这些丢失的 K 线，其中开盘价、最高价、最低价和收盘价都设置为前一根 K 线的收盘价 - 且成交量为空。在图表中，这将看起来像一个 `_` - 并且与交易所通常表示 0 成交量 K 线的方式一致。

### 我收到 "Price jump between 2 candles detected" 提示

此消息是一个警告，表示 K 线的价格跳变超过了 30%。
这可能是交易对停止交易并发生了某种代币交换的迹象。
此消息通常伴随着 ["Missing data fillup"](#日志中出现-missing-data-fillup-消息) - 因为此类交易对通常会停牌一段时间。

### 我想重置机器人的数据库

要重置机器人的数据库，您可以删除数据库文件（默认情况下为 `tradesv3.sqlite` 或 `tradesv3.dryrun.sqlite`），或通过 `--db-url` 使用不同的数据库 url（例如 `sqlite:///mynewdatabase.sqlite`）。

### 日志中出现 "Outdated history for pair xxx" 提示

机器人正试图告诉您，它得到了一根过时的最后一根 K 线（不是最后一根完整的 K 线）。
因此，Freqtrade 不会为该交易对进入交易 - 因为根据旧信息进行交易通常不是所希望的。
此警告可能指向以下问题之一：
* 交易所停机 -> 查看交易所状态页面/博客/推特。
* 错误的系统时间 -> 确保您的系统时间准确。
* 极少交易的交易对 -> 在交易所网页上查看该交易对，查看策略使用的时间框架。如果某些 K 线没有成交量（通常可视化为“成交量 0”的柱线，并用 `_` 表示 K 线），则该交易对在此时间框架内没有任何交易。理想情况下应避免这些交易对。
* API 问题 -> API 返回数据有误。

### 日志中出现 "Couldn't reuse watch for xxx" 消息

这是一条信息性消息，表示机器人尝试使用来自 websocket 的 K 线，但交易所没有提供正确的信息。
如果 websocket 连接中断，或者该交易对在您使用的时间框架内没有发生任何交易，就会发生这种情况。
Freqtrade 会优雅地处理此问题，回退到使用 REST API。
虽然这由于 REST API 调用而使迭代略慢 - 但它不会对机器人的运行造成任何问题。

### 收到 "Exchange XXX does not support market orders." 消息且无法运行策略

由消息可知，您的交易所不支持市价单，而您的 [订单类型](configuration.md/#understand-order_types) 之一设置为了 "market"。您的策略可能是在考虑其他交易所的情况下编写的，并为 "stoploss" 订单设置了 "market"，这对于大多数支持市价单的交易所来说是正确且首选的（但不适用于 Gate.io）。
要解决此问题，请在策略中重新定义订单类型，使用 "limit" 而不是 "market"：
``` python
    order_types = {
        ...
        "stoploss": "limit",
        ...
    }
```

### 我尝试启动实盘交易，但出现 API 权限错误

类似于 `Invalid API-key, IP, or permissions for action` 的错误正如字面意思。
您的 API 密钥无效（复制/粘贴错误？检查配置中是否有前导/尾随空格）、已过期，或者您运行机器人的 IP 未在交易所 API 控制台中启用。
通常，“Spot Trading”（或交易所中的等效项）权限是必需的。期货交易通常需要专门开启。

### 如何在机器人日志中搜索某些内容？

默认情况下，机器人将其日志写入 stderr 流。如果您需要使用 grep 工具搜索日志消息，您需要将 stderr 重定向到 stdout。
* 在 Unix shell 中：
```shell
$ freqtrade --some-options 2>&1 >/dev/null | grep 'something'
```
* 您也可以使用 `--logfile` 选项将日志写入文件，然后使用 grep。

## 超参数优化模块 (Hyperopt module)

### 为什么 Freqtrade 不支持 GPU？

首先，大多数指标库都不支持 GPU - 因此，指标计算几乎没有收益。
GPU 只擅长数值计算。对于超参数优化，我们需要数值计算（寻找下一组参数）和运行 python 代码（运行回测）。
因此，GPU 并不太适合超参数优化的大部分环节。
引入 GPU 支持的复杂性与其能带来的微小收益不成正比。

### 我需要多少个 epoch 才能获得好的 Hyperopt 结果？

默认情况下，运行不带 `-e`/`--epochs` 命令行选项的 Hyperopt 将仅运行 100 个 epoch（即 100 次对您的触发器和保护条件的评估）。
这对于找到好的结果来说太少了（除非您非常幸运），所以您可能需要运行 10000 次或更多。
由于 Hyperopt 使用贝叶斯优化，运行太多的 epoch 可能不会产生更好的结果。
建议反复运行 500-1000 个 epoch，直到总计达到 10000 个左右（或您满意为止）。

## 官方渠道 (Official channels)

Freqtrade 仅使用以下官方渠道：
* [Freqtrade discord server](https://discord.gg/p7nuUNVfP7)
* [Freqtrade documentation (https://freqtrade.io)](https://freqtrade.io)
* [Freqtrade github organization](https://github.com/freqtrade)

Freqtrade 项目关联人员绝不会询问您的交易所密钥或任何可能令您的资金面临风险的信息。

## 支持政策 (Support policy)

我们在 Discord 服务器和 GitHub issues 上为 Freqtrade 提供免费支持。
我们仅支持最近的发布版本和当前的开发分支。如果您使用的是旧版本，请先升级。

## "Freqtrade token" (关于 Freqtrade 代币)

Freqtrade **没有** 发行加密代币。
您在网上找到的任何提到 Freqtrade, FreqAI 或 freqUI 的代币发行都应被视为恶意诈骗，旨在利用 Freqtrade 的名气谋取不义之财。
