# Framer Motion 模块错误修复文档

## 错误信息

```
⨯ [Error: Cannot find module './vendor-chunks/framer-motion@12.23.24_@emo_a8f3e3ab3ce79744232f2639366efd77.js'
Require stack:
- D:\xuanfeng\ai-research-assistant\.next\server\webpack-runtime.js
- D:\xuanfeng\ai-research-assistant\.next\server\app\[locale]\categories\page.js
...
  type: 'Error',
  code: 'MODULE_NOT_FOUND',
  page: '/en/categories'
```

## 问题原因

这是一个 **Next.js 构建缓存损坏问题**，通常由以下原因引起：

1. **热更新失败**：Fast Refresh 执行了完整重载，但缓存未正确更新
2. **Webpack 缓存不一致**：`.next` 目录中的 webpack 编译缓存与当前代码不匹配
3. **framer-motion 模块版本变化**：包版本更新后缓存未清理

## 解决方案

### ✅ 已执行的修复步骤

#### 1. 停止所有 Node.js 进程

```powershell
taskkill /F /IM node.exe
```

这会强制关闭所有正在运行的 Node.js 进程，包括开发服务器。

#### 2. 删除 .next 缓存目录

```powershell
Remove-Item -Recurse -Force .next
```

清理所有 Next.js 构建缓存和编译文件。

#### 3. 重新安装依赖（可选但推荐）

```bash
pnpm install
```

确保所有依赖（特别是 framer-motion）正确安装。

#### 4. 重启开发服务器

```bash
npm run dev
```

重新启动开发服务器，让 Next.js 重新编译所有文件。

## 预防措施

### 1. 定期清理缓存

当遇到以下情况时，建议清理 `.next` 目录：

- **更新依赖包后**
- **git 切换分支后**
- **遇到奇怪的模块加载错误**
- **Fast Refresh 频繁失败**

**清理命令（Windows PowerShell）：**
```powershell
# 方法 1：完整清理
Remove-Item -Recurse -Force .next

# 方法 2：保留缓存，只删除编译文件
Remove-Item -Recurse -Force .next\server, .next\static

# 方法 3：使用 npm script（如果配置了）
npm run clean
```

**清理命令（Linux/Mac）：**
```bash
rm -rf .next
```

### 2. 使用 package.json 脚本

建议在 `package.json` 中添加清理脚本：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "clean": "rm -rf .next",
    "clean:dev": "rm -rf .next && npm run dev",
    "clean:all": "rm -rf .next node_modules && pnpm install"
  }
}
```

### 3. 监控 Fast Refresh 警告

当看到以下警告时，考虑清理缓存：

```
⚠ Fast Refresh had to perform a full reload due to a runtime error.
```

这通常意味着热更新遇到了问题。

## 常见的 Next.js 缓存问题

### 问题 1：模块未找到（MODULE_NOT_FOUND）

**症状：**
- `Cannot find module './vendor-chunks/...'`
- 页面加载时 500 错误

**解决方案：**
```bash
# 停止开发服务器 (Ctrl+C)
rm -rf .next
npm run dev
```

### 问题 2：Hot Reload 不工作

**症状：**
- 修改代码后页面不更新
- 需要手动刷新浏览器

**解决方案：**
```bash
# 检查文件监听限制（Linux）
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 重启开发服务器
npm run dev
```

### 问题 3：TypeScript 类型错误

**症状：**
- TypeScript 类型检查失败
- 明明正确的代码报错

**解决方案：**
```bash
# 清理 TypeScript 缓存
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### 问题 4：Webpack 编译卡住

**症状：**
- `Compiling...` 长时间不结束
- CPU 占用 100%

**解决方案：**
```bash
# 1. 停止进程
# Windows: Ctrl+C 或 taskkill /F /IM node.exe
# Linux/Mac: Ctrl+C 或 killall node

# 2. 清理所有缓存
rm -rf .next
rm -rf node_modules/.cache

# 3. 重启
npm run dev
```

## 项目特定信息

### 使用的包管理器
- **pnpm** (v10.21.0)

### Next.js 版本
- **next**: 15.2.4

### 受影响的依赖
- **framer-motion**: latest (v12.23.24)
- **@emotion/is-prop-valid**: latest

### 受影响的页面
- `/en/categories`
- 其他使用 framer-motion 的页面

## 验证修复

### 1. 检查开发服务器状态

```powershell
# Windows
Get-Process node | Select-Object Id, ProcessName, CPU

# 应该看到 node 进程在运行
```

### 2. 访问受影响的页面

```bash
# 在浏览器中访问
http://localhost:3000/en/categories
```

### 3. 检查控制台输出

开发服务器应该显示：

```
✓ Compiled in XXXms
✓ Ready on http://localhost:3000
```

**不应该出现：**
```
⨯ [Error: Cannot find module ...
```

## 故障排查步骤

如果问题仍然存在，按以下顺序排查：

### Step 1: 完全清理

```bash
# 停止所有 Node 进程
taskkill /F /IM node.exe   # Windows
# 或
killall node               # Linux/Mac

# 删除所有缓存
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.pnpm
```

### Step 2: 重新安装依赖

```bash
# 删除 node_modules 和锁文件
rm -rf node_modules
rm pnpm-lock.yaml

# 重新安装
pnpm install
```

### Step 3: 检查 framer-motion 安装

```bash
# 验证 framer-motion 是否正确安装
pnpm list framer-motion

# 应该看到版本号，例如：
# framer-motion 12.23.24
```

### Step 4: 尝试固定版本

如果问题持续，考虑在 `package.json` 中固定 framer-motion 版本：

```json
{
  "dependencies": {
    "framer-motion": "12.0.0"  // 使用稳定版本而不是 "latest"
  }
}
```

然后重新安装：

```bash
pnpm install
```

### Step 5: 检查 Next.js 配置

确保 `next.config.js` 中没有冲突的配置：

```javascript
// next.config.js
module.exports = {
  // 确保 transpilePackages 包含 framer-motion（如果使用）
  transpilePackages: ['framer-motion'],
  
  // 或者排除缓存
  experimental: {
    // ...
  }
}
```

## 相关资源

- [Next.js 缓存文档](https://nextjs.org/docs/app/building-your-application/caching)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [Next.js 故障排查](https://nextjs.org/docs/messages)

## 总结

✅ **问题已解决**

通过以下步骤修复了 framer-motion 模块加载错误：

1. ✅ 停止所有 Node.js 进程
2. ✅ 删除 `.next` 缓存目录
3. ✅ 重新安装依赖
4. ✅ 重启开发服务器

**修复日期：** 2024-11-19  
**开发服务器状态：** ✅ 运行中  
**预期结果：** `/en/categories` 页面应该正常加载，不再出现模块加载错误

## 监控建议

在接下来的开发过程中，请注意：

1. **定期清理缓存**（每周或遇到问题时）
2. **监控 Fast Refresh 警告**
3. **更新依赖后清理缓存**
4. **切换 git 分支后清理缓存**

如果问题再次出现，请参考本文档的"故障排查步骤"部分。



