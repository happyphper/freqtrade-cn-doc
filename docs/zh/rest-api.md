
# REST API

## FreqUI

FreqUI 现在拥有其专用的 [文档部分](freq-ui.md) - 有关 FreqUI 的所有信息请参考该部分。

## 配置 (Configuration)

通过在配置中添加 `api_server` 部分并将 `api_server.enabled` 设置为 `true` 来启用 REST API。

示例配置：

``` json
    "api_server": {
        "enabled": true,
        "listen_ip_address": "127.0.0.1",
        "listen_port": 8080,
        "verbosity": "error",
        "enable_openapi": false,
        "jwt_secret_key": "somethingrandom",
        "CORS_origins": [],
        "username": "Freqtrader",
        "password": "SuperSecret1!",
        "ws_token": "sercet_Ws_t0ken"
    },
```

::: danger 安全警告
默认情况下，配置仅监听 localhost（因此其他系统无法访问）。我们强烈建议不要将此 API 暴露在公网上，并选择一个强且唯一的密码，因为其他人可能会控制您的机器人。
:::

::: info 在远程服务器上访问 API/UI
如果您在 VPS 上运行，应考虑使用 SSH 隧道或设置 VPN (OpenVPN, Wireguard) 来连接您的机器人。这将确保 FreqUI 不会直接暴露在互联网上，出于安全考虑，不建议直接暴露（FreqUI 不自带 HTTPS 支持）。
:::

您可以通过在浏览器中访问 `http://127.0.0.1:8080/api/v1/ping` 来检查 API 是否运行正常。如果正常，应返回：
``` output
{"status":"pong"}
```

## 使用 API (Consuming the API)

我们建议使用受支持的 `freqtrade-client` 包（也可以作为 `scripts/rest_client.py` 使用）。

可以使用 `pip install freqtrade-client` 独立于任何运行中的 Freqtrade 机器人进行安装。此模块旨在保持轻量级，仅依赖 `requests` 和 `python-rapidjson` 模块。

### 命令行用法

``` bash
freqtrade-client &lt;command&gt; [可选参数]
```

### 程序化使用 (Programmatic use)

``` python
from freqtrade_client import FtRestClient

client = FtRestClient(server_url, username, password)

# 获取机器人状态
ping = client.ping()
print(ping)

# 将交易对加入黑名单
client.blacklist("BTC/USDT", "ETH/USDT")
```

## 可用端点 (Available endpoints)

下表显示了相关的 URL 端点和参数。所有端点都需要以前缀 `http://127.0.0.1:8080/api/v1/` 开头。

| 端点 | 方法 | 描述 |
|-----------|--------|--------------------------|
| `/ping` | GET | 测试 API 是否就绪 - 无需身份验证。 |
| `/start` | POST | 启动交易机器人。 |
| `/stop` | POST | 停止交易机器人。 |
| `/status` | GET | 列出所有未平仓交易。 |
| `/profit` | GET | 显示已关闭交易的利润/亏损摘要。 |
| `/balance` | GET | 显示每个币种的账户余额。 |
| `/daily` | GET | 显示每日利润或亏损。 |
| `/forceexit` | POST | 立即退出给定交易（忽略 ROI）。 |
| `/forceenter` | POST | 立即进场给定交易对。 |
| `/logs` | GET | 显示最新的日志消息。 |
| `/version` | GET | 显示机器人版本。 |

...（更多端点详见 OpenAPI 文档）

## WebSocket 消息

API 服务器包含一个 WebSocket 端点，用于订阅来自 Freqtrade 机器人的 RPC 消息。这可用于从您的机器人获取实时数据，如进场/离场成交消息、白名单更改等。

这也是 Freqtrade 中设置 [生产者/消费者模式](producer-consumer.md) 的基础。

## OpenAPI 界面 (Swagger UI)

要启用内置的 OpenAPI 界面，请在 `api_server` 配置中指定 `"enable_openapi": true`。之后可以在 `/docs` 端点访问 Swagger UI（例如 `http://localhost:8080/docs`）。
