
# 高级安装后任务 (Advanced Post-installation Tasks)

本页说明了在安装机器人后可以执行的一些高级任务和配置选项，这些在某些环境中可能非常有用。

如果您不明白这里提到的内容，您可能不需要它。

## 运行多个 Freqtrade 实例 (Running multiple instances of Freqtrade)

本节将向您展示如何在同一台机器上同时运行多个机器人。

### 需要考虑的事项

- **使用不同的数据库文件**。
- **使用不同的 Telegram 机器人**（需要多个不同的配置文件；仅在启用 Telegram 时适用）。
- **使用不同的端口**（仅在启用 Freqtrade REST API webserver 时适用）。

### 不同的数据库文件

为了跟踪您的交易、利润等，Freqtrade 使用一个 SQLite 数据库。默认情况下，Freqtrade 会为模拟运行和实盘运行使用不同的数据库文件。
- 实盘运行：默认数据库为 `tradesv3.sqlite`。
- 模拟运行：默认数据库为 `tradesv3.dryrun.sqlite`。

使用 `--db-url` 命令行参数来指定这些文件的路径。

例如，如果您想启动两个机器人，一个在 USDT 交易，另一个在 BTC 交易，您必须使用不同的数据库运行它们：

``` bash
# 终端 1 (BTC):
freqtrade trade -c configBTC.json --db-url sqlite:///user_data/tradesBTC.dryrun.sqlite
# 终端 2 (USDT):
freqtrade trade -c configUSDT.json --db-url sqlite:///user_data/tradesUSDT.dryrun.sqlite
```

### 使用 Docker 运行多个实例

要使用 Docker 运行多个实例，您需要编辑 `docker-compose.yml` 文件并将所有实例添加为单独的服务。

``` yml
services:
  freqtrade1:
    image: freqtradeorg/freqtrade:stable
    restart: always
    container_name: freqtrade1
    volumes:
      - "./user_data:/freqtrade/user_data"
    ports:
      - "127.0.0.1:8080:8080"
    command: >
      trade
      --db-url sqlite:////freqtrade/user_data/tradesv3_freqtrade1.sqlite
      --config /freqtrade/user_data/config.json
      --config /freqtrade/user_data/config.freqtrade1.json
      --strategy SampleStrategy
  
  freqtrade2:
    image: freqtradeorg/freqtrade:stable
    restart: always
    container_name: freqtrade2
    volumes:
      - "./user_data:/freqtrade/user_data"
    ports:
      - "127.0.0.1:8081:8080"
    command: >
      trade
      --db-url sqlite:////freqtrade/user_data/tradesv3_freqtrade2.sqlite
      --config /freqtrade/user_data/config.json
      --config /freqtrade/user_data/config.freqtrade2.json
      --strategy SampleStrategy
```

## 使用不同的数据库系统

Freqtrade 使用 SQLAlchemy，因此支持多种数据库。以下系统经过测试：
- **SQLite**（默认）
- **PostgreSQL**
- **MariaDB / MySQL**

::: warning 责任声明
使用上述数据库系统，即表示您承认自己知道如何管理此类系统。Freqtrade 团队不会提供设置或维护方面的支持。
:::

### PostgreSQL

安装：`pip install "psycopg[binary]"`
使用：`... --db-url postgresql+psycopg://<username>:<password>@localhost:5432/<database>`

### MariaDB / MySQL

安装：`pip install pymysql`
使用：`... --db-url mysql+pymysql://<username>:<password>@localhost:3306/<database>`

## 将机器人配置为 systemd 服务

将 `freqtrade.service` 文件复制到您的 systemd 用户目录（通常是 `~/.config/systemd/user`），并根据您的设置更新 `WorkingDirectory` 和 `ExecStart`。

之后您可以用以下命令启动启动守护进程：
```bash
systemctl --user start freqtrade
```
要使服务在用户退出登录后继续运行，您需要为用户启用 `linger`：
```bash
sudo loginctl enable-linger "$USER"
```

## 高级日志 (Advanced Logging)

Freqtrade 使用 Python 默认的 logging 模块。如果您对默认设置（终端彩色输出或 RotatingFileHandler）不满意，可以通过在配置文件中添加 `log_config` 来进行定制。

我们建议将日志配置从主配置文件中提取出来，并通过 [多个配置文件](configuration.md#multiple-configuration-files) 功能提供给机器人。

### 日志输出到 syslog 或 journald

在 Linux 系统上，可以将日志发送到 `syslog` 或 `journald`。
- **syslog**：适合大多数系统。配置 `address` 为 `/dev/log` (Linux) 或 `/var/run/syslog` (MacOS)。
- **journald**：需要安装 `cysystemd` (`pip install cysystemd`)。Windows 不支持此功能。

### JSON 格式日志

您还可以配置输出流使用 JSON 格式，这在某些自动化分析场景中非常有用。
