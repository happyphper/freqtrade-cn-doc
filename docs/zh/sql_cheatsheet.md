# SQL 速查表 (SQL Helper)

本页包含一些如果您想查询 sqlite 数据库时的帮助信息。

::: tip 其他数据库系统
要使用其他数据库系统，如 PostgreSQL 或 MariaDB，您可以使用相同的查询，但需要使用对应数据库系统的客户端。[点击此处](advanced-setup.md#使用不同的数据库系统) 了解如何为 Freqtrade 设置不同的数据库系统。
:::

::: warning 警告
如果您不熟悉 SQL，在数据库上运行查询时应非常小心。在运行任何查询之前，请始终确保已备份数据库。
:::

## 安装 sqlite3

Sqlite3 是一个基于终端的 sqlite 应用程序。
如果您觉得使用可视化数据库编辑器更舒服，请随意使用 SqliteBrowser 等工具。

### Ubuntu/Debian 安装

```bash
sudo apt-get install sqlite3
```

### 通过 Docker 使用 sqlite3

Freqtrade 的 Docker 镜像中包含 sqlite3，因此您无需在宿主系统上安装任何东西即可编辑数据库。

``` bash
docker compose exec freqtrade /bin/bash
sqlite3 &lt;database-file&gt;.sqlite
```

## 打开数据库

```bash
sqlite3
.open &lt;filepath&gt;
```

## 表结构

### 列出所有表

```bash
.tables
```

### 显示表结构

```bash
.schema &lt;table_name&gt;
```

### 获取表中的所有交易

```sql
SELECT * FROM trades;
```

## 破坏性查询

即向数据库写入数据的查询。
这些查询通常是不必要的，因为 Freqtrade 会尝试自行处理所有数据库操作 —— 或者通过 API 或 Telegram 命令公开这些操作。

::: warning 警告
在运行以下任何查询之前，请确保已备份数据库。
:::

::: danger 危险
当机器人正连接到数据库时，**绝对不要** 运行任何写入查询（`update`, `insert`, `delete`）。
这可以而且将会导致数据损坏 —— 极有可能无法恢复。
:::

### 修复在交易所手动平仓后机器人中仍处于开启状态的交易

::: warning 警告
在交易所手动卖出交易对不会被机器人检测到，机器人仍会尝试卖出。只要有可能，应使用 `/forceexit &lt;tradeid&gt;` 来完成同样的操作。强烈建议在进行任何手动更改之前备份数据库文件。
:::

::: info
在使用 `/forceexit` 后，这通常是不必要的，因为 `force_exit` 订单会在下一次迭代时被机器人自动关闭。
:::

```sql
UPDATE trades
SET is_open=0,
  close_date=&lt;close_date&gt;,
  close_rate=&lt;close_rate&gt;,
  close_profit = close_rate / open_rate - 1,
  close_profit_abs = (amount * &lt;close_rate&gt; * (1 - fee_close) - (amount * (open_rate * (1 - fee_open)))),
  exit_reason=&lt;exit_reason&gt;
WHERE id=&lt;trade_ID_to_update&gt;;
```

#### 示例

```sql
UPDATE trades
SET is_open=0,
  close_date='2020-06-20 03:08:45.103418',
  close_rate=0.19638016,
  close_profit=0.0496,
  close_profit_abs = (amount * 0.19638016 * (1 - fee_close) - (amount * (open_rate * (1 - fee_open)))),
  exit_reason='force_exit'  
WHERE id=31;
```

### 从数据库中删除交易

::: tip 使用 RPC 方法删除交易
可以考虑通过 Telegram 或 REST API 使用 `/delete &lt;tradeid&gt;`。这是删除交易的推荐方式。
:::

如果您仍想直接从数据库中删除交易，可以使用以下查询。

::: danger 危险
某些系统（如 Ubuntu）在其 sqlite3 包中禁用了外键。使用 sqlite 时 —— 请确保在执行上述查询之前运行 `PRAGMA foreign_keys = ON` 以启用外键。
:::

```sql
DELETE FROM trades WHERE id = &lt;tradeid&gt;;

DELETE FROM trades WHERE id = 31;
```

::: warning 警告
这将从数据库中移除此笔交易。请确保 ID 正确，并且 **绝对不要** 在没有 `where` 子句的情况下运行此查询。
:::