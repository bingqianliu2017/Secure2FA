# Secure2FA

轻量级 GitHub 2FA 验证码生成器，桌面版（Tauri 2 + React）。  
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
（浏览器模式下无持久化存储，数据不保存）

### 桌面应用（需安装 Rust）

1. 安装 [Rust](https://www.rust-lang.org/tools/install)（含 cargo）
2. 安装 [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（Windows 10/11 通常已内置）

```bash
npm install
npm run tauri dev    # 开发模式（热重载）
npm run tauri build  # 打包（输出 exe / NSIS / MSI）
```

打包产物：

- **直接运行**：`src-tauri/target/release/app.exe`
- **NSIS 安装包**：`src-tauri/target/release/bundle/nsis/*.exe`
- **MSI 安装包**：`src-tauri/target/release/bundle/msi/*.msi`

## 项目结构

```
src/
├── core/           # TOTP、存储（storage.ts）
├── components/     # CodeDisplay、EntryCard、EntryForm、TitleBar
├── App.tsx
└── ...
src-tauri/
├── capabilities/   # 权限配置（fs scope、写入权限等）
├── nsis/           # NSIS 卸载钩子（卸载时删除密钥）
└── ...
```

## 存储与安全

### 存储位置

- **路径**：`%APPDATA%\{identifier}\Secure2FA\vault.json`  
  即：`C:\Users\<用户>\AppData\Roaming\com.secure2fa.app\Secure2FA\vault.json`
- 纯本地 JSON 文件，不联网、不上传

### 权限配置

桌面版通过 Tauri 的 `fs` 插件写入 AppData，需在 `capabilities/default.json` 中配置：

- `fs:allow-appdata-write-recursive`：对 AppData 的写入权限
- `fs:scope`：将可写范围限制在 `$APPDATA/Secure2FA` 及其子路径

### 卸载时清除密钥

**NSIS 安装包**在卸载时，会通过自定义钩子 `src-tauri/nsis/hooks.nsh` 自动删除：

`%APPDATA%\com.secure2fa.app`

即：使用 NSIS 安装后，卸载时密钥文件会被一并删除，不会残留。  
（MSI 安装包需单独配置 WiX 自定义操作，当前仅 NSIS 实现了此行为）

---

## 开发说明

### 存储问题排查（历史）

如遇「保存失败」或「关闭后数据丢失」，常见原因：

1. **`isTauri()` 误判**：Tauri 2 默认不注入 `window.__TAURI__`，需在 `tauri.conf.json` 中设置 `"withGlobalTauri": true`
2. **缺少写入权限**：需在 capabilities 中显式添加 `fs:allow-appdata-write-recursive`
3. **fs:scope 格式**：`allow` 建议使用 `{ "path": "$APPDATA/Secure2FA/**" }` 形式

当前项目已按上述方式配置完成。
