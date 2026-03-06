# Secure2FA

轻量级 GitHub 2FA 验证码生成器，桌面版（Tauri + React）。  
数据仅存本地，不联网。

## 功能

- 输入 GitHub 2FA Secret，生成 6 位验证码
- 验证码底部进度条，30 秒内逐渐变空
- 命名管理、编辑、更换 Secret、删除
- 点击验证码一键复制
- **桌面版**：关闭窗口最小化到系统托盘（右下角），点击托盘图标恢复

## 快速开始

### 浏览器开发预览

```bash
npm install
npm run dev
```

访问 http://localhost:5173

### 桌面应用（需安装 Rust）

1. 安装 [Rust](https://www.rust-lang.org/tools/install)（含 cargo）
2. 安装 [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（Windows 10/11 通常已内置）

```bash
npm install
npm run tauri dev    # 开发模式
npm run tauri build  # 打包
```

## 项目结构

```
src/
├── core/           # TOTP、存储
├── components/     # CodeDisplay、EntryCard、EntryForm
├── hooks/          # useTOTP
└── App.tsx
```

## 存储与安全

- 数据存于 `%APPDATA%/Secure2FA/vault.json`，纯本地 JSON 文件
- 不联网、不上传
