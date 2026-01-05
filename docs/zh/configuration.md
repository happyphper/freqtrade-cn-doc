
# 配置机器人 (Configure the bot)

Freqtrade 拥有许多可配置的功能和可能性。默认情况下，这些设置通过配置文件进行配置。

## Freqtrade 配置文件

机器人通常从文件（Freqtrade 配置文件）中读取其运行所需的参数。

默认情况下，机器人从当前工作目录中的 `config.json` 文件加载配置。您可以使用 `-c/--config` 命令行选项指定不同的配置文件。

如果您使用 [快速开始](docker_quickstart.md#docker-快速开始) 方法，安装脚本应该已经为您创建了默认配置。如果没有，我们推荐使用 `freqtrade new-config --config user_data/config.json` 来生成基础配置文件。

配置采用 JSON 格式，除了标准语法外，还支持单行 `//` 和多行 `/* */` 注释，以及列表末尾的多余逗号。

### 环境变量

您可以通过环境变量设置配置项。环境变量始终优先于对应的配置文件或策略值。

- 前缀：`FREQTRADE__`
- 级别分隔符：`__` (双下划线)
- 格式：`FREQTRADE__{部分}__{键}`

例如，`export FREQTRADE__STAKE_AMOUNT=200` 对应 `{stake_amount: 200}`。
更复杂的例子：`export FREQTRADE__EXCHANGE__KEY=<您的API密钥>` 会映射到 `exchange.key`。

### 多个配置文件

您可以指定多个配置文件，Freqtrade 会按顺序合并它们（后面的覆盖前面的）。

```json
"add_config_files": [
    "config1.json",
    "config-private.json"
]
```

### 编辑器自动完成和验证

如果您的编辑器支持 JSON Schema，可以在配置顶部添加一行以获得自动补全：
```json
{
    "$schema": "https://schema.freqtrade.io/schema.json",
}
```

## 配置参数 (Configuration parameters)

下表列出了所有可用的配置参数。

### 参数优先级
- 命令行参数 (CLI) > 环境变量 > 配置文件 > 策略

### 参数表 (摘要)

| 参数 | 说明 |
|------------|-------------|
| `max_open_trades` | **必填**。最大允许的同时开仓数。 |
| `stake_currency` | **必填**。交易使用的计价币（如 USDT, BTC）。 |
| `stake_amount` | **必填**。每笔交易的投入金额。设置为 `"unlimited"` 则使用全部可用资金并由 `max_open_trades` 均分。 |
| `tradable_balance_ratio` | 允许用于交易的账户余额比例（默认 0.99）。 |
| `dry_run` | **必填**。是否为模拟模式（默认 true）。 |
| `dry_run_wallet` | 模拟模式下的初始资金量。 |
| `minimal_roi` | **必填**。最小投资回报率退出表（字典格式）。 |
| `stoploss` | **必填**。止损比例。 |
| `timeframe` | 使用的时间框架（如 5m, 1h）。 |
| `exchange.name` | **必填**。使用的交易所名称（如 binance）。 |

... (此处省略表中完整内容，详见英文原档对照)

## 配置每笔交易的金额

### 动态投入金额 (Dynamic stake amount)
将 `stake_amount` 设置为 `"unlimited"`。机器人将把可用余额均分为 `max_open_trades` 份。这可以实现利润复利。

### tradable_balance_ratio
配置机器人锁定的金额比例。例如 `0.5` 表示只使用账户一半的资金进行交易。

### available_capital (分配可用资本)
当在同一个交易所账户运行多个机器人时，使用此项指定各机器人的初始启动资金。这比 `tradable_balance_ratio` 更适合多机器人场景。

## 订单价格 (Pricing)

- `entry_pricing`: 进场定价控制。
- `exit_pricing`: 离场定价控制。
- `price_side`: 定义查看订单簿的哪一侧。`same` 表示和下单方向相同（Maker），`other` 表示另一侧（Taker，更快成交）。

## 最小投资回报率 (minimal_roi)

```json
"minimal_roi": {
    "40": 0.0,    // 40 分钟后利润不为负则退出
    "30": 0.01,   // 30 分钟后利润达 1% 则退出
    "0":  0.04    // 立即达 4% 利润则退出
},
```

## 模拟模式 vs 生产模式

### 模拟模式 (Dry-run)
不产生真实交易，仅在本地数据库中记录模拟结果。
```json
"dry_run": true,
"db_url": "sqlite:///tradesv3.dryrun.sqlite",
```

### 生产模式 (Production)
执行真实的买入卖出操作。
1. 将 `dry_run` 设为 `false`。
2. 填写交易所 API Key 和 Secret。
3. 使用全新的数据库文件以防统计混乱。

::: warning 安全建议
永远不要共享您的 API 密钥或包含私密信息的文件。建议将私密信息放在单独的 `config-private.json` 中。
:::

## 下一步
配置完成后，您可以学习[如何使用机器人](bot-usage.md)。
