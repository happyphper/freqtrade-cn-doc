
# 在 Docker 中使用 Freqtrade (Using Freqtrade with Docker)

本页说明了如何使用 Docker 运行机器人。这并不是为了开箱即用，您仍需要阅读文档并理解如何正确配置它。

## 安装 Docker

首先为您的平台下载并安装 Docker / Docker Desktop：

* [Mac](https://docs.docker.com/docker-for-mac/install/)
* [Windows](https://docs.docker.com/docker-for-windows/install/)
* [Linux](https://docs.docker.com/install/)

::: info Docker Compose 安装
Freqtrade 文档假设您使用的是 Docker Desktop（或 Docker Compose 插件）。
虽然独立的 docker-compose 安装仍然有效，但需要将所有 `docker compose` 命令更改为 `docker-compose` 才能工作（例如 `docker compose up -d` 变为 `docker-compose up -d`）。
:::

::: warning Windows 上的 Docker
如果您刚在 Windows 系统上安装了 Docker，请务必重启系统，否则您可能会遇到与 Docker 容器网络连接相关的无法解释的问题。
:::

## 带有 Docker 的 Freqtrade

Freqtrade 在 [Dockerhub](https://hub.docker.com/r/freqtradeorg/freqtrade/) 上提供官方镜像，并提供了一个可以直接使用的 [docker-compose 文件](https://github.com/freqtrade/freqtrade/blob/stable/docker-compose.yml)。

::: info
- 以下部分假设已安装 `docker` 且当前登录用户可以使用。
- 以下所有命令都使用相对目录，必须在包含 `docker-compose.yml` 文件的目录中执行。
:::

### Docker 快速入门

创建一个新目录并将 [docker-compose 文件](https://raw.githubusercontent.com/freqtrade/freqtrade/stable/docker-compose.yml) 放置在该目录中。

``` bash
mkdir ft_userdata
cd ft_userdata/
# 从仓库下载 docker-compose 文件
curl https://raw.githubusercontent.com/freqtrade/freqtrade/stable/docker-compose.yml -o docker-compose.yml

# 拉取 freqtrade 镜像
docker compose pull

# 创建用户目录结构
docker compose run --rm freqtrade create-userdir --userdir user_data

# 创建配置 - 需要回答交互式问题
docker compose run --rm freqtrade new-config --config user_data/config.json
```

上述代码创建了一个名为 `ft_userdata` 的新目录，下载了最新的 compose 文件并拉取了镜像。
最后两步创建了 `user_data` 目录以及基于您选择的默认配置。

::: info 如何编辑机器人配置？
您可以随时编辑位于 `ft_userdata/user_data/config.json` 的配置文件。
您还可以通过编辑 `docker-compose.yml` 文件中的 `command` 部分来更改策略和命令。
:::

#### 添加自定义策略

1. 配置文件现在位于 `user_data/config.json`。
2. 将自定义策略复制到 `user_data/strategies/` 目录。
3. 将策略的类名添加到 `docker-compose.yml` 文件中。

默认运行的是 `SampleStrategy`。

::: danger `SampleStrategy` 仅供演示！
`SampleStrategy` 供您参考并为您提供策略开发的思路。
在拿真钱冒险之前，请务必回测您的策略并进行一段时间的模拟运行 (Dry-run)！
您可以在 [策略文档](strategy-customization.md) 中找到更多关于策略开发的信息。
:::

完成这些后，您就可以准备以交易模式启动机器人（模拟运行或实盘交易，取决于您之前的设置）。

``` bash
docker compose up -d
```

::: warning 默认配置
虽然生成的配置大多是功能性的，但在启动机器人之前，您仍需要验证所有选项（如定价、交易对列表等）是否符合您的要求。
:::

#### 访问界面 (UI)

如果您在 `new-config` 步骤中选择了启用 FreqUI，您可以在 `localhost:8080` 访问它。

::: info 在远程服务器上访问 UI
如果您是在 VPS 上运行，应考虑使用 SSH 隧道或设置 VPN 来连接。由于安全原因，不建议直接将 FreqUI 暴露在互联网上（它不自带 HTTPS 支持）。
另请阅读 [在 Docker 中配置 API](rest-api.md#configuration-with-docker) 部分以了解更多信息。
:::

#### 监控机器人

您可以使用 `docker compose ps` 检查正在运行的实例。
这应该会将 `freqtrade` 服务列为 `running`。如果不是，请检查日志。

#### Docker Compose 日志 (Logs)

日志将写入：`user_data/logs/freqtrade.log`。
您也可以使用命令 `docker compose logs -f` 查看最新日志。

#### 数据库 (Database)

数据库将位于：`user_data/tradesv3.sqlite`。

#### 使用 Docker 更新 Freqtrade

使用 Docker 时，更新 Freqtrade 非常简单：

``` bash
# 下载最新镜像
docker compose pull
# 重启容器
docker compose up -d
```

::: warning 检查更新日志 (Changelog)
始终检查更新日志中是否有破坏性更改或需要手动干预的操作，并确保更新后机器人能正常启动。
:::

### 编辑 docker-compose 文件

高级用户可以进一步编辑 docker-compose 文件以包含所有可能的选项或参数。

运行 `docker compose run --rm freqtrade <command> <optional arguments>` 可以使用所有 Freqtrade 参数。

::: warning 交易命令使用 docker compose
交易命令 (`freqtrade trade <...>`) 不应通过 `docker compose run` 运行，而应使用 `docker compose up -d`。
这可确保容器正确启动（包括端口转发）并在系统重启后自动重新启动。
如果您打算使用 FreqUI，请确保相应地调整 [配置](rest-api.md#configuration-with-docker)，否则界面将不可用。
:::

::: info `docker compose run --rm`
包含 `--rm` 标志将在完成后移除容器，除交易模式外，强烈建议在所有模式下使用。
:::

#### 示例：使用 Docker 下载数据

从 Binance 下载 ETH/BTC 对、1 小时时间框架、5 天的历史数据。数据将存储在主机的 `user_data/data/` 目录中。

``` bash
docker compose run --rm freqtrade download-data --pairs ETH/BTC --exchange binance --days 5 -t 1h
```

#### 示例：使用 Docker 进行回测

在 Docker 容器中运行 SampleStrategy 的回测：

``` bash
docker compose run --rm freqtrade backtesting --config user_data/config.json --strategy SampleStrategy --timerange 20190801-20191001 -i 5m
```

### 带有 Docker 的附加依赖项

如果您的策略需要默认镜像中未包含的依赖项，则需要在主机上构建镜像。
请创建一个包含额外安装步骤的 Dockerfile（参考 [docker/Dockerfile.custom](https://github.com/freqtrade/freqtrade/blob/develop/docker/Dockerfile.custom)）。

然后，您还需要修改 `docker-compose.yml` 文件，取消注释 `build` 步骤并重命名镜像。

### 绘图与分析

绘图命令 `plot-profit` 和 `plot-dataframe` 可以通过将 `docker-compose.yml` 中的镜像更改为 `*_plot` 来使用。

Freqtrade 还提供了一个 docker-compose 文件，用于启动 Jupyter Lab 服务器进行数据分析：
``` bash
docker compose -f docker/docker-compose-jupyter.yml up
```

## 故障排除 (Troubleshooting)

### Windows 上的 Docker

* 错误：`"Timestamp for this request is outside of the recvWindow."`
  市场 API 请求需要同步的时钟，但 Docker 容器中的时间会随时间变慢。
  临时解决方法：运行 `wsl --shutdown` 并重启 Docker。
  永久解决方法：在 Linux 主机上运行或定期重启 WSL。

* 无法连接到 API (Windows)
  如果您刚安装了 Docker Desktop，请务必重启系统。

::: warning
由于上述原因，我们不建议在 Windows 生产环境中使用 Docker，它仅适用于实验、数据下载和回测。运行 Freqtrade 建议使用 Linux VPS。
:::