
# 如何更新 (How to update)

根据您的安装方法，请使用以下对应的方法之一来更新您的 Freqtrade。

::: info 跟踪更改
破坏性更改或行为变更将记录在随每个版本发布的更新日志 (Changelog) 中。
对于 `develop` 分支，请关注 PR 以避免被更改所困扰。
:::

## Docker

::: info 使用 `master` 镜像的旧版安装
我们将发行版镜像从 `master` 切换到了 `stable` - 请调整您的 docker 文件，将 `freqtradeorg/freqtrade:master` 替换为 `freqtradeorg/freqtrade:stable`。
:::

``` bash
docker compose pull
docker compose up -d
```

## 通过安装脚本安装

``` bash
./setup.sh --update
```

::: info
请确保在禁用虚拟环境的情况下运行此命令！
:::

## 纯原生安装

请确保您也更新了依赖项 - 否则可能会在您未察觉的情况下出现中断。

``` bash
git pull
pip install -U -r requirements.txt
pip install -e .

# 确保 freqUI 是最新版本
freqtrade install-ui 
```

### 更新中的问题

更新问题通常源于缺少依赖项（您未遵循上述说明）- 或源于更新后的依赖项无法安装（例如 TA-Lib）。
请参考相应的安装章节（下面链接了常见问题）。
