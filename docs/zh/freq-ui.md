# FreqUI

Freqtrade 提供了一个内置的 Web 服务器，它可以托管 [FreqUI](https://github.com/freqtrade/frequi) —— 即 freqtrade 的前端界面。

默认情况下，UI 会作为安装（脚本或 Docker）的一部分自动安装。
您也可以使用 `freqtrade install-ui` 命令手动安装 freqUI。
该命令同样可用于将 freqUI 更新到新版本。

一旦机器人以交易/模拟运行模式启动（使用 `freqtrade trade`），UI 将在配置的 API 端口（默认为 `http://127.0.0.1:8080`）下可用。

::: info 想要为 freqUI 贡献代码？
开发人员不应使用此方法，而应根据 [freqUI 仓库](https://github.com/freqtrade/frequi) 中描述的方法克隆并使用相应源码。构建前端需要可用的 node 环境。
:::

::: tip 运行 freqtrade 并不强制要求 freqUI
freqUI 是 freqtrade 的一个可选组件，并不是运行机器人所必需的。
它是一个可以用来监控和与机器人互动的前端界面 —— 但 freqtrade 本身在没有它的情况下也能完美运行。
:::

## 配置 (Configuration)

freqUI 没有自己的配置文件 —— 而是假定已经可以使用 [rest-api](rest-api.md) 的有效设置。
请参考相应的文档页面来设置 freqUI。

## 用户界面 (UI)

freqUI 是一个现代响应式的 Web 应用程序，可用于监控和与您的机器人互动。

freqUI 提供了浅色和深色主题。
可以通过页面顶部的一个显著按钮轻松切换主题。
本页面截图的主题将适应所选的文档主题，因此要查看深色（或浅色）版本，请切换文档的主题。

### 登录 (Login)

下面的截图展示了 freqUI 的登录屏幕。

![FreqUI - login](./assets/frequi-login-CORS.png#only-dark)
![FreqUI - login](./assets/frequi-login-CORS-light.png#only-light)

::: info CORS
此截图中显示的 CORS 错误是因为 UI 运行在与 API 不同的端口上，并且 [CORS](#cors) 尚未正确设置。
:::

### 交易视图 (Trade view)

交易视图允许您可视化机器人正在进行的交易并与机器人进行互动。
在此页面上，您还可以通过启动和停止机器人来与之互动，并且——如果已配置——强制执行交易的入场和离场。

![FreqUI - trade view](./assets/freqUI-trade-pane-dark.png#only-dark)
![FreqUI - trade view](./assets/freqUI-trade-pane-light.png#only-light)

### 绘图配置器 (Plot Configurator)

freqUI 的图表可以通过策略中的 `plot_config` 配置对象（可以通过“来自策略”按钮加载）或通过 UI 进行配置。
可以创建多种绘图配置并随意切换 —— 从而可以灵活、不同地查看您的图表。

可以通过交易视图右上角的“绘图配置器”（齿轮图标）按钮访问绘图配置。

![FreqUI - plot configuration](./assets/freqUI-plot-configurator-dark.png#only-dark)
![FreqUI - plot configuration](./assets/freqUI-plot-configurator-light.png#only-light)

### 设置 (Settings)

可以通过访问设置页面更改几个与 UI 相关的设置。

您可以更改（以及其他）：

* UI 的时区
* 将开启的交易可视化为 favicon（浏览器标签页）的一部分
* K 线颜色（涨/跌 -> 红/绿）
* 启用/禁用应用内通知类型

![FreqUI - Settings view](./assets/frequi-settings-dark.png#only-dark)
![FreqUI - Settings view](./assets/frequi-settings-light.png#only-light)

## Web 服务器模式 (Webserver mode)

当 freqtrade 以 [Web 服务器模式](utils.md#webserver-mode) 启动（使用 `freqtrade webserver` 启动频率贸易）时，Web 服务器将以特殊模式启动，允许使用额外功能，例如：

* 下载数据
* 测试交易对列表 (pairlists)
* [回测策略](#backtesting)
* ...待扩展

### 回测 (Backtesting)

当 freqtrade 以 [Web 服务器模式](utils.md#webserver-mode) 启动（使用 `freqtrade webserver` 启动频率贸易）时，回测视图将变得可用。
此视图允许您回测策略并可视化结果。

您还可以加载和可视化以前的回测结果，并相互比较结果。

![FreqUI - Backtesting](./assets/freqUI-backtesting-dark.png#only-dark)
![FreqUI - Backtesting](./assets/freqUI-backtesting-light.png#only-light)

## CORS

整个章节仅在跨域情况下是必需的（即您有多个机器人 API 运行在 `localhost:8081`, `localhost:8082`, ...），并希望将它们合并到一个 freqUI 实例中。

::: info 技术解释
所有基于 Web 的前端都受 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)（跨源资源共享）的约束。

由于对 Freqtrade API 的大多数请求必须经过身份验证，因此正确的 CORS 策略是避免安全问题的关键。

此外标准不允许对带有凭据的请求使用 `*` CORS 策略，因此必须适当设置此设置。
:::

用户可以通过 `CORS_origins` 配置设置允许从不同的源 URL 访问机器人 API。
它由允许从机器人 API 消耗资源的授权 URL 列表组成。

假设您的应用程序部署为 `https://frequi.freqtrade.io/home/` —— 这意味着需要进行以下配置：

```jsonc
{
    //...
    "jwt_secret_key": "somethingrandom",
    "CORS_origins": ["https://frequi.freqtrade.io"],
    //...
}
```

在以下（非常常见的）情况下，可以通过 `http://localhost:8080/trade` 访问 freqUI（这是您导航到 freqUI 时在导航栏中看到的内容）。
![freqUI url](./assets/frequi_url.png)

这种情况下的正确配置是 `http://localhost:8080` —— 即包含端口的 URL 的主要部分。

```jsonc
{
    //...
    "jwt_secret_key": "somethingrandom",
    "CORS_origins": ["http://localhost:8080"],
    //...
}
```

::: tip 尾随斜杠 (trailing Slash)
`CORS_origins` 配置中不允许末尾有斜杠（例如 `"http://localhost:8080/"`）。
这样的配置将不会生效，CORS 错误将依然存在。
:::

::: info
我们强烈建议还将 `jwt_secret_key` 设置为随机且仅由您自己知道的内容，以避免未经授权访问您的机器人。
:::