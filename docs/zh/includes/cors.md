
## CORS (跨域资源共享)

本章节仅在跨域情况下是必要的（例如您在 `localhost:8081`、`localhost:8082` 等端口运行了多个机器人 API，并希望将它们整合到一个 FreqUI 实例中）。

::: info 技术解释
:::
所有基于 Web 的前端都受 [CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)（跨域资源共享）的约束。
由于对 Freqtrade API 的大多数请求都必须经过身份验证，因此正确的 CORS 策略是避免安全问题的关键。
此外，标准不允许对带凭据的请求使用 `*` CORS 策略，因此必须适当设置此选项。
:::

用户可以通过 `CORS_origins` 配置项允许不同的来源 URL 访问机器人 API。
它包含一个允许从机器人 API 消耗资源的 URL 列表。

假设您的应用程序部署在 `https://frequi.freqtrade.io/home/` —— 这意味着需要进行以下配置：

```jsonc
{
    //...
    "jwt_secret_key": "somethingrandom",
    "CORS_origins": ["https://frequi.freqtrade.io"],
    //...
}
```

在下面这个（非常常见的）案例中，FreqUI 可通过 `http://localhost:8080/trade` 访问（这也是您在导航到 FreqUI 时在浏览器地址栏中看到的内容）。

![freqUI url](../assets/frequi_url.png)

这种情况下的正确配置是 `http://localhost:8080` —— 即包含端口号的 URL 主体部分。

```jsonc
{
    //...
    "jwt_secret_key": "somethingrandom",
    "CORS_origins": ["http://localhost:8080"],
    //...
}
```

::: tip 尾随斜杠
:::
`CORS_origins` 配置中不允许出现尾随斜杠（例如 `"http://localhost:8080/"`）。
这样的配置将不会生效，CORS 错误依然会存在。
:::

::: info
:::
我们强烈建议将 `jwt_secret_key` 设置为一个随机且仅为您自己所知的字符串，以避免机器人被未经授权访问。
:::