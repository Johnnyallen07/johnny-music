# Johnny Music

一个专注于古典音乐与纯音乐的平台，主打简洁、轻量化体验。

## ✨ 项目特色

- **纯粹体验**: 收录各类经典乐曲与纯音乐，界面简洁，无广告打扰。
- **即开即用**: 无需注册和登录，打开应用即可畅享音乐。
- **离线播放**: 支持音乐缓存与下载功能，随时随地聆听。
- **多端支持**: 采用 Monorepo 架构，同时提供 Web 端与移动端 (App) 体验。

## 🛠️ 技术栈

本项目基于 **TurboRepo** 构建 Monorepo 仓库，主要包含以下部分：

- **Apps**
  - `apps/web`: 基于 **Next.js 16** (React 19)构建的现代 Web 应用，使用 TailwindCSS 与 Radix UI 进行界面设计。
  - `apps/mobile`: 基于 **Expo 54** (React Native) 构建的移动端应用，支持 iOS 与 Android，使用 Expo Router 进行路由管理。

- **Packages**
  - `@johnny/api`: 共享的 API 定义与类型接口。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

在根目录下运行以下命令，将同时启动 Web 和 Mobile 端的开发环境：

```bash
npm run dev
# 或者使用 turbo 直接运行
npx turbo run dev
```

### 3. 构建

```bash
npm run build
```

## 📂 目录结构

```
.
├── apps
│   ├── mobile    # Expo 移动端应用
│   └── web       # Next.js Web 应用
├── packages      # 共享包
│   └── api       # API 逻辑与类型
├── turbo.json    # TurboRepo 配置文件
└── package.json
```
