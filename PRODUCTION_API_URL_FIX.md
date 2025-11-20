# 生产环境 API URL 配置问题修复指南

## 🔍 问题描述

打包发布后，网络请求仍然连接到 `http://localhost:8000`，而不是生产环境的 API 地址。

## 📋 问题原因

在 Next.js 中，所有以 `NEXT_PUBLIC_` 开头的环境变量会在**构建时**被内联到客户端代码中。这意味着：

1. 如果构建时 `NEXT_PUBLIC_API_BASE_URL` 未设置或设置为 `http://localhost:8000`
2. 这个值会被直接编译到打包后的 JavaScript 代码中
3. 即使后来在服务器上设置了正确的环境变量，已经打包的代码也不会改变
4. 必须重新构建才能使用新的环境变量值

## ✅ 解决方案

### 方案 1：使用 .env.production 文件（推荐）

1. **创建生产环境配置文件**

   在项目根目录创建 `.env.production` 文件：

   ```bash
   cp .env.production.example .env.production
   ```

2. **配置正确的 API 地址**

   编辑 `.env.production` 文件，设置正确的生产环境 API 地址：

   ```env
   # ⚠️ 重要：不能使用 localhost！
   NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8000
   # 或
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
   ```

3. **重新构建项目**

   ```bash
   npm run build
   ```

   Next.js 会自动读取 `.env.production` 文件中的环境变量。

### 方案 2：在部署脚本中设置环境变量

在构建前设置环境变量：

```bash
export NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8000
npm run build
```

### 方案 3：使用环境变量文件优先级

Next.js 按以下优先级读取环境变量文件：
1. `.env.production.local`（最高优先级，不提交到 Git）
2. `.env.local`（不提交到 Git）
3. `.env.production`
4. `.env`

**推荐使用 `.env.production`**，因为它：
- 专门用于生产环境
- 可以提交到 Git（如果不需要敏感信息）
- 不会被开发环境的 `.env.local` 覆盖

## 🔧 修复步骤

### 步骤 1：检查当前配置

检查项目中是否有环境变量文件，以及 API URL 配置：

```bash
# 检查环境变量文件
ls -la .env*

# 查看 API URL 配置
grep NEXT_PUBLIC_API_BASE_URL .env* 2>/dev/null || echo "未找到配置"
```

### 步骤 2：创建/修改生产环境配置

如果使用部署脚本 `deploy.sh`：

1. 在服务器上创建 `.env.production` 文件：

   ```bash
   cd /home/ai-tool/ai-tools-web
   nano .env.production
   ```

2. 添加以下内容（替换为实际地址）：

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://69.5.14.25:8005
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 步骤 3：重新构建

```bash
# 清理旧的构建
rm -rf .next

# 重新构建（会自动读取 .env.production）
npm run build
```

### 步骤 4：重启服务

```bash
# 如果使用 PM2
pm2 restart ai-tools-web

# 或使用部署脚本
./deploy.sh
```

## 🧪 验证修复

### 方法 1：检查构建产物

构建后，检查生成的 JavaScript 文件：

```bash
# 搜索构建产物中的 API URL
grep -r "localhost:8000" .next/static/chunks/ 2>/dev/null

# 如果找到 localhost，说明构建时环境变量未正确设置
```

### 方法 2：浏览器控制台检查

1. 打开生产环境网站
2. 按 F12 打开开发者工具
3. 在控制台运行：

   ```javascript
   // 检查环境变量（注意：在 Next.js 中，环境变量在构建时内联，可能无法直接访问）
   // 更好的方法是检查网络请求
   ```

4. 打开 Network 标签，查看 API 请求的 URL
5. 确认请求地址不是 `localhost:8000`

### 方法 3：查看源代码

在浏览器中查看页面源代码（Ctrl+U），搜索 `localhost:8000`，如果找到说明构建时使用了错误的配置。

## 📝 部署脚本增强

部署脚本 `deploy.sh` 已经增强，会在构建前检查：

1. ✅ 检查环境变量文件是否存在
2. ✅ 检查 `NEXT_PUBLIC_API_BASE_URL` 是否配置
3. ✅ **检查是否包含 localhost（如果是则阻止构建）**
4. ✅ 在构建前再次验证

## ⚠️ 重要提示

1. **环境变量在构建时内联**：修改环境变量后必须重新构建
2. **不要使用 localhost**：生产环境绝对不能使用 `localhost` 或 `127.0.0.1`
3. **使用 .env.production**：专门用于生产环境的配置文件
4. **不要提交敏感信息**：`.env.production.local` 和 `.env.local` 不会被提交到 Git

## 🆘 常见问题

### Q: 为什么修改了 .env.production 后还是不行？

A: 必须重新构建项目。Next.js 的环境变量在构建时内联，运行时修改无效。

### Q: 可以使用相对路径吗？

A: 不可以。API URL 必须是完整的 URL（包含协议和域名）。

### Q: 开发环境和生产环境使用不同的 API 地址怎么办？

A: 
- 开发环境：使用 `.env.local`，设置 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- 生产环境：使用 `.env.production`，设置 `NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8000`

### Q: 如何确认当前使用的是哪个环境变量文件？

A: Next.js 会按优先级合并所有匹配的环境变量文件。查看构建日志或使用 `console.log(process.env.NEXT_PUBLIC_API_BASE_URL)`（在构建时）。

## 📚 相关文档

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Next.js 环境变量优先级](https://nextjs.org/docs/basic-features/environment-variables#environment-variable-load-order)

