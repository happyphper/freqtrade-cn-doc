# 使用 Jupyter notebook 分析机器人数据 (Analyzing bot data with Jupyter notebooks)

您可以使用 Jupyter notebook 轻松分析回测结果和交易历史。在实用 `freqtrade create-userdir --userdir user_data` 初始化用户目录后，示例 notebook 位于 `user_data/notebooks/`。

## 使用 Docker 快速开始 (Quick start with docker)

Freqtrade 提供了一个启动 Jupyter Lab 服务器的 docker-compose 文件。
您可以使用以下命令运行此服务器：`docker compose -f docker/docker-compose-jupyter.yml up`

这将创建一个运行 Jupyter Lab 的 docker 容器，可通过 `https://127.0.0.1:8888/lab` 访问。
请使用启动后控制台中打印的链接进行简化的登录。

有关更多信息，请访问 [使用 Docker Compose 进行数据分析](docker_quickstart.md#data-analysis-using-docker-compose) 章节。

### 专家提示 (Pro tips)

* 有关使用说明，请参阅 [jupyter.org](https://jupyter.org/documentation)。
* 别忘了从您的 conda 或 venv 环境中启动 Jupyter notebook 服务器，或者使用 [nb_conda_kernels](https://github.com/Anaconda-Platform/nb_conda_kernels)*
* 实用前先复制示例 notebook，以免您的更改在下次 freqtrade 更新时被覆盖。

### 结合系统范围的 Jupyter 安装使用虚拟环境 (Using virtual environment with system-wide Jupyter installation)

有时可能希望使用系统范围安装的 Jupyter notebook，并使用来自虚拟环境的 Jupyter 内核 (kernel)。
这可以防止按系统多次安装完整的 Jupyter 套件，并提供了一种在任务（freqtrade / 其他分析任务）之间切换的简便方法。

要实现这一点，首先激活您的虚拟环境并运行以下命令：

``` bash
# 激活虚拟环境
source .venv/bin/activate

pip install ipykernel
ipython kernel install --user --name=freqtrade
# 重启 Jupyter (lab / notebook)
# 在 notebook 中选择内核 "freqtrade"
```

::: info
本节内容是为了完整性而提供的，Freqtrade 团队不会为此设置的问题提供完整支持，并建议直接在虚拟环境中安装 Jupyter，因为这是启动和运行 Jupyter notebook 最简单的方法。有关此设置的帮助，请参考 [Project Jupyter](https://jupyter.org/) [文档](https://jupyter.org/documentation) 或 [帮助频道](https://jupyter.org/community)。
:::

::: warning
有些任务在 notebook 中执行效果并不理想。例如，任何使用异步执行的内容对于 Jupyter 来说都是个问题。此外，freqtrade 的主要入口点是 shell 命令行界面 (CLI)，因此在 notebook 中使用纯 Python 会绕过为辅助函数提供必需对象和参数的参数。您可能需要手动设置这些值或创建预期的对象。
:::

## 推荐的工作流程 (Recommended workflow)

| 任务 | 工具 |
| --- | --- |
| 机器人操作 | CLI |
| 重复性任务 | Shell 脚本 |
| 数据分析与可视化 | Notebook |

1. 使用 CLI 来

    * 下载历史数据
    * 运行回测
    * 使用实时数据运行
    * 导出结果

1. 在 Shell 脚本中收集这些操作

    * 保存带有参数的复杂命令
    * 执行多步操作
    * 自动测试策略并准备用于分析的数据

1. 使用 Notebook 来

    * 可视化数据
    * 整理并绘图以产生见解

## 示例实用程序代码片段 (Example utility snippets)

### 更改目录到根目录 (Change directory to root)

Jupyter notebook 从 notebook 目录执行。以下片段寻找项目根目录，以便相对路径保持一致。

```python
import os
from pathlib import Path

# 更改目录
# 修改此单元格以确保输出显示正确的路径。
# 定义相对于单元格输出中显示的项目根目录的所有路径
project_root = "somedir/freqtrade"
i=0
try:
    os.chdir(project_root)
    assert Path('LICENSE').is_file()
except:
    while i<4 and (not Path('LICENSE').is_file()):
        os.chdir(Path(Path.cwd(), '../'))
        i+=1
    project_root = Path.cwd()
print(Path.cwd())
```

### 加载多个配置文件 (Load multiple configuration files)

此选项对于检查传入多个配置的结果非常有用。
这也将运行整个配置初始化，因此配置已完全初始化，可以传递给其他方法。

``` python
import json
from freqtrade.configuration import Configuration

# 从多个文件加载配置
config = Configuration.from_files(["config1.json", "config2.json"])

# 显示内存中的配置
print(json.dumps(config['original_config'], indent=2))
```

对于交互式环境，准备一个指定 `user_data_dir` 的额外配置并最后传入，这样您在运行机器人时就不必更改目录。
最好避免使用相对路径，因为除非更改了目录，否则这将从 Jupyter notebook 的存储位置开始。

``` json
{
    "user_data_dir": "~/.freqtrade/"
}
```

### 更多数据分析文档 (Further Data analysis documentation)

* [策略调试 (Strategy debugging)](strategy_analysis_example.md) —— 也提供 Jupyter notebook 版 (`user_data/notebooks/strategy_analysis_example.ipynb`)
* [绘图 (Plotting)](plotting.md)
* [标签分析 (Tag Analysis)](advanced-backtesting.md)

如果您想分享关于如何最好地分析数据的想法，欢迎提交 issue 或拉取请求 (Pull Request) 来增强此文档。
