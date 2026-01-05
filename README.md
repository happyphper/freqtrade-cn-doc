# Freqtrade 中文文档 (Freqtrade Chinese Documentation)

本项目是 [Freqtrade](https://www.freqtrade.io/) 官方文档的中文翻译版本，基于 VitePress 构建，旨在为中文用户提供更好的阅读体验和学习资源。

## 🚀 特性

- **同步更新**: 提供自动化脚本，可随时同步官方最新的英文文档。
- **转换工具**: 内置 MkDocs 到 VitePress 的转换逻辑，自动处理警告框、代码片段和图标。
- **现代化体验**: 使用 VitePress 驱动，支持搜索、响应式布局和极速加载。

## 🛠️ 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 同步文档

从 Freqtrade 仓库获取最新的英文原文：

```bash
pnpm sync
```

### 3. 初始化翻译 (可选)

将英文文档同步到 `zh` 目录并添加占位符：

```bash
pnpm translate
```

### 4. 本地开发

启动 VitePress 开发服务器：

```bash
pnpm docs:dev
```

访问 `http://localhost:5173` 预览文档。

### 5. 构建与部署

生成静态站点：

```bash
pnpm docs:build
```

---

## 📂 项目结构

- `docs/`: 文档源文件。
  - `en/`: 英文原文镜像。
  - `zh/`: 中文翻译文档。
  - `docs/.vitepress/`: VitePress 配置文件。
- `scripts/`: 工具脚本。
  - `sync.ts`: 同步官方文档逻辑。
  - `translate.ts`: 批量生成翻译占位符。
  - `normalize_docs.ts`: 格式化 Markdown 兼容性处理。

## 📖 贡献指南

1. 运行 `pnpm sync` 获取最新原文。
2. 在 `docs/zh` 目录下找到对应的 `.md` 文件进行翻译。
3. 确保删除文件顶部的 "自动翻译" 警告框。

## 📄 许可

本项目遵循与原项目一致的开源许可。
