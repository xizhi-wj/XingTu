# 星图 (XingTu) - 多功能图片处理工具

<p align="center">
  <img src="./src-tauri/assets/logo.png" width="200" alt="星图 Logo">
</p>

## 📝 项目介绍

星图（XingTu）是一款集成多种图像处理工具的跨平台桌面应用，基于 Tauri 和 Vue.js 开发。提供了丰富的图像处理功能，包括背景去除、图片增强、裁剪、拆分、格式转换和压缩等，帮助用户高效处理各类图片需求。

## ✨ 主要功能

- **背景去除**：一键去除图片背景，支持自定义背景颜色
- **图片增强**：使用 AI 技术提升图片质量和分辨率
- **图片裁剪**：灵活裁剪图片尺寸和比例
- **图片拆分**：将大图拆分为多个小图
- **格式转换**：支持多种图片格式之间的转换
- **图片压缩**：减小图片文件大小，保持适当质量

## 🔧 技术栈

- **前端**：Vue 3 + TypeScript + Arco Design
- **后端**：Rust + Tauri
- **构建工具**：Vite
- **包管理**：pnpm
- **CI/CD**：GitHub Actions

## 📦 安装

### 从发布版本安装

访问 [GitHub Releases](https://github.com/用户名/星凪图片工具/releases) 下载最新版本的安装包：

- Windows: `.exe` 或 `.msi` 安装包
- macOS: `.dmg` 安装包
- Linux: `.AppImage`, `.deb` 或 `.rpm` 安装包

### 从源码构建

#### 前提条件

- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://www.rust-lang.org/)
- [pnpm](https://pnpm.io/)

#### 构建步骤

1. 克隆仓库

```bash
git clone https://github.com/用户名/星凪图片工具.git
cd 星凪图片工具
```

2. 安装依赖

```bash
pnpm install
```

3. 开发模式运行

```bash
pnpm tauri dev
```

4. 构建应用

```bash
pnpm tauri build
```

## 🚀 使用说明

1. 启动应用后，从左侧菜单选择需要的图片处理功能
2. 上传需要处理的图片
3. 根据功能设置相应参数
4. 点击开始处理
5. 处理完成后可以预览和保存结果

## 🔄 自动更新

应用内置自动更新功能，当有新版本发布时，应用会自动提示更新。

## 🌐 支持的平台

- Windows (x64, x86, ARM64)
- macOS (Intel, Apple Silicon)
- Linux (x64)

## 📄 许可证

本项目采用 [Apache License 2.0](./LICENSE) 许可证。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/xizhi-wj/XingTu/issues)

---
