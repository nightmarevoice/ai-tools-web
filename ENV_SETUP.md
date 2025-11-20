# 环境变量配置指南

本文档说明如何配置项目所需的环境变量。

## 📋 必需的环境变量

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（此文件不会被 Git 提交）：

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Linux/Mac
touch .env.local
```

### 2. 配置环境变量

将以下内容复制到 `.env.local` 文件中，并填入实际值：

```env
# ============================================
# 后端 API 配置
# ============================================
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# ============================================
# Supabase 配置（用于 Google OAuth 登录）
# ============================================
# 获取方式：
# 1. 访问 https://app.supabase.com
# 2. 选择你的项目（或创建新项目）
# 3. 进入 Settings > API
# 4. 复制以下值：
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🔍 获取 Supabase 配置值

### 步骤 1: 创建或选择 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 登录你的账号
3. 创建新项目或选择现有项目

### 步骤 2: 获取配置值

1. 在项目 Dashboard 中，点击左侧菜单的 **Settings** (⚙️)
2. 选择 **API**
3. 在 **Project URL** 部分，复制 URL（例如：`https://abcdefghijklmnop.supabase.co`）
4. 在 **Project API keys** 部分，复制 **anon public** key（以 `eyJ...` 开头）

### 步骤 3: 配置到 `.env.local`

将复制的值填入 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ 验证配置

配置完成后，重启开发服务器：

```bash
npm run dev
```

如果配置正确，应用应该能正常启动。如果看到以下错误：

```
缺少 Supabase 环境变量: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

说明环境变量未正确配置，请检查：

1. `.env.local` 文件是否在项目根目录
2. 环境变量名称是否正确（注意大小写）
3. 值是否正确（没有多余的空格或引号）
4. 是否重启了开发服务器

## 🔒 安全提示

- ⚠️ **不要**将 `.env.local` 文件提交到 Git
- ⚠️ **不要**在代码中硬编码这些值
- ✅ `.env.local` 已在 `.gitignore` 中，不会被意外提交
- ✅ 使用环境变量管理敏感信息

## 📝 环境变量说明

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 基础 URL | ✅ | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ | `eyJhbGc...` |

## 🆘 常见问题

### Q: 为什么需要 Supabase？

A: 项目使用 Supabase 来处理 Google OAuth 登录。Supabase 提供了安全的 OAuth 流程和用户认证管理。

### Q: 如果我不使用 Google 登录，还需要配置 Supabase 吗？

A: 如果代码中调用了 `authApi.signInWithGoogle()`，则需要配置。如果只使用邮箱密码登录，理论上不需要，但建议还是配置以避免运行时错误。

### Q: 如何检查环境变量是否生效？

A: 在浏览器控制台（F12）中运行：

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

注意：在 Next.js 中，只有以 `NEXT_PUBLIC_` 开头的环境变量才能在客户端访问。

## 📚 相关文档

- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase 快速开始](https://supabase.com/docs/guides/getting-started)
- [Google OAuth 配置指南](./GOOGLE_AUTH_SETUP.md)

