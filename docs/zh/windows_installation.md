
# Windows 安装 (Windows Installation)

我们 **强烈** 建议 Windows 用户使用 [Docker](docker_quickstart.md)，因为这会运行得更轻松、顺畅（也更安全）。

如果无法使用 Docker，请尝试使用 Windows 的 Linux 子系统 (WSL) - 此时可以参考 Ubuntu 的安装说明。
否则，请按照以下说明进行操作。

所有说明均假设已安装并可以使用 Python 3.11+。

## 克隆 Git 仓库 (Clone the git repository)

首先，运行以下命令克隆仓库：

``` powershell
git clone https://github.com/freqtrade/freqtrade.git
```

现在，选择您的安装方法，是使用脚本自动安装（推荐）还是按照相应的说明手动安装。

## 自动安装 Freqtrade

### 运行安装脚本

脚本将向您询问几个问题，以确定应安装哪些部分。

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass
cd freqtrade
. .\setup.ps1
```

## 手动安装 Freqtrade

::: info 64 位 Python 版本
请务必使用 64 位 Windows 和 64 位 Python，以避免由于 32 位应用程序在 Windows 下的内存限制而导致的路由回测或超参数优化问题。
Windows 下不再支持 32 位 Python 版本。
:::

::: info
在 Windows 下使用 [Anaconda 发行版](https://www.anaconda.com/distribution/) 可以极大地帮助解决安装问题。有关更多信息，请查看文档中的 [Anaconda 安装部分](installation.md#installation-with-conda)。
:::

### Windows 安装过程中的错误

``` bash
error: Microsoft Visual C++ 14.0 is required. Get it with "Microsoft Visual C++ Build Tools": http://landinghub.visualstudio.com/visual-cpp-build-tools
```

不幸的是，许多需要编译的包不提供预构建的 wheel。因此，必须安装 C/C++ 编译器并供您的 Python 环境使用。

您可以从 [此处](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 下载 Visual C++ 生成工具，并以默认配置安装“使用 C++ 的桌面开发”。不幸的是，这是一个很大的下载/依赖项，因此您可能需要首先考虑使用 WSL2 或 [Docker Compose](docker_quickstart.md)。

![Windows 安装](./assets/windows_install.png)
