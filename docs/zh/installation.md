
# 安装 (Installation)

本页说明如何准备运行机器人的环境。

Freqtrade 文档描述了多种安装方式：

* [Docker 镜像](docker_quickstart.md)（推荐，见专用页面）
- [脚本安装](#脚本安装)
- [手动安装](#手动安装)
- [使用 Conda 安装](#使用-conda-安装)

在评估 Freqtrade 如何工作时，请考虑使用预构建的 [Docker 镜像](docker_quickstart.md) 以快速开始。

------

## 基本信息

对于 Windows 系统，请使用 [Windows 安装指南](windows_installation.md)。

安装和运行 Freqtrade 最简单的方法是克隆 GitHub 仓库，然后运行 `./setup.sh` 脚本（如果支持您的平台）。

::: info 版本说明
克隆仓库时，默认的分支是 `develop`。该分支包含所有最新功能，由于有自动化测试，通常被认为是相对稳定的。
`stable` 分支包含上一个发布的版本代码（通常每月发布一次），可能更加稳定。
:::

::: info
假定您已安装了 [uv](https://docs.astral.sh/uv/)，或 Python 3.11 及以上版本和对应的 `pip`。安装脚本会在不满足条件时发出警告。还需要 `git` 来克隆仓库。
此外，必须安装 Python 头文件（如 `python3-dev`）才能顺利完成安装。
:::

::: warning 时钟同步
运行机器人的系统时钟必须准确，并应频繁与 NTP 服务器同步，以避免与交易所通信时出现问题。
:::

------

## 要求 (Requirements)

这些要求适用于[脚本安装](#脚本安装)和[手动安装](#手动安装)。

::: info ARM64 系统
如果您使用的是 ARM64 系统（如 MacOS M1/M2 或 Oracle VM），请使用 [Docker](docker_quickstart.md) 运行 Freqtrade。目前官方暂不支持原生直接安装，尽管经过手动配置是可能的。
:::

### 必备软件
- [Python >= 3.11](http://docs.python-guide.org/en/latest/starting/installation/)
- [pip](https://pip.pypa.io/en/stable/installing/)
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [virtualenv](https://virtualenv.pypa.io/en/stable/installation.html) (推荐)

### 操作系统依赖

=== "Debian/Ubuntu"
    ```bash
    sudo apt-get update
    sudo apt install -y python3-pip python3-venv python3-dev python3-pandas git curl
    ```

=== "MacOS"
    安装 [Homebrew](https://brew.sh/)：
    ```bash
    brew install gettext libomp
    ```
    ::: info
    如果您安装了 brew，`setup.sh` 脚本可以自动为您安装这些依赖。
    :::

------

## Freqtrade 仓库

```bash
# 下载 develop 分支
git clone https://github.com/freqtrade/freqtrade.git
cd freqtrade

# 选择分支
git checkout stable  # 普通用户推荐
# git checkout develop # 开发者/想要尝试新功能的用户
```

------

## 脚本安装

这是 Linux/MacOS 用户的首选方式，使用 `./setup.sh` 脚本。

### 运行安装脚本
```bash
./setup.sh -i
```

### 激活虚拟环境
每次打开新终端时，必须运行：
```bash
source .venv/bin/activate
```

### 常用操作
- `./setup.sh -u`: 更新代码。
- `./setup.sh -r`: 硬重置分支并重建虚拟环境。

---

## 手动安装

### 设置虚拟环境
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 安装 Python 依赖
```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
python3 -m pip install -e .
```

---

## 使用 Conda 安装

Freqtrade 也可以使用 Miniconda 或 Anaconda 安装。

```bash
# 创建环境
conda create --name freqtrade python=3.12
conda activate freqtrade

# 安装依赖项
python3 -m pip install -r requirements.txt
python3 -m pip install -e .
```

---

## 准备就绪 (You are ready)

### 初始化配置
```bash
# 创建用户目录
freqtrade create-userdir --userdir user_data

# 创建新配置文件
freqtrade new-config --config user_data/config.json
```

### 启动机器人
```bash
freqtrade trade --config user_data/config.json --strategy SampleStrategy
```

::: warning 建议
在投入真金白银之前，请阅读完整文档，进行回测 (Backtest)，并先使用模拟模式 (Dry-run)。
:::

---

## 故障排除

### "command not found" (未找到命令)
确保您已激活了虚拟环境：
```bash
source ./.venv/bin/activate
```

### MacOS 安装错误
如果遇到 `g++` 失败，可能需要安装特定的 SDK 头文件（ MacOS 10.14 及更早版本）：
```bash
open /Library/Developer/CommandLineTools/Packages/macOS_SDK_headers_for_macOS_10.14.pkg
```
如果是更新的系统，请参考社区解决方案。
