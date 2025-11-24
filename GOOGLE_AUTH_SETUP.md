# Google OAuth 登录配置指南

本文档说明如何配置和使用 Google OAuth 登录功能。

## 📋 目录

1. [功能概述](#功能概述)
2. [前端配置](#前端配置)
3. [Supabase 配置](#supabase-配置)
4. [Google OAuth 配置](#google-oauth-配置)
5. [后端配置](#后端配置)
6. [测试流程](#测试流程)
7. [故障排除](#故障排除)

## 🎯 功能概述

本项目实现了基于 Supabase 的 Google OAuth 登录功能:

- ✅ **无需后端改动**: 后端已支持 Supabase JWT 验证
- ✅ **自动用户同步**: 后端自动创建本地用户记录
- ✅ **统一认证流程**: Google OAuth 和密码登录使用相同的 token 机制
- ✅ **安全可靠**: 符合 OAuth 2.0 PKCE 标准

### 认证流程

```
用户点击"Google登录"
  ↓
前端调用 Supabase.auth.signInWithOAuth()
  ↓
重定向到 Google 授权页面
  ↓
用户授权后回调到 /auth/callback
  ↓
前端获取 Supabase access_token
  ↓
调用后端 GET /auth/me (携带 Bearer token)
  ↓
后端验证 token → 自动创建/获取本地用户
  ↓
登录完成,跳转到首页
```

## 🔧 前端配置

### 1. 安装依赖

依赖已安装:
```bash
npm install @supabase/supabase-js @supabase/ssr --legacy-peer-deps
```

### 2. 配置环境变量

复制环境变量示例文件:
```bash
cp .env.local.example .env.local
```

编辑 `.env.local`,填入配置:
```env
# 后端 API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 实现的文件

| 文件 | 说明 |
|------|------|
| `lib/supabase/client.ts` | Supabase 客户端配置 |
| `lib/api/auth.ts` | 认证 API(新增 `signInWithGoogle()` 和 `syncGoogleUser()`) |
| `app/auth/callback/page.tsx` | OAuth 回调页面 |
| `app/login/page.tsx` | 登录页面(含 Google 登录按钮) |
| `app/signup/page.tsx` | 注册页面(含 Google 注册按钮) |

## 🔐 Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或选择现有项目
3. 记录项目 URL 和 API Key

### 2. 获取配置信息

进入 **Settings > API**:
- **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 启用 Google Provider

进入 **Authentication > Providers**:

1. 找到 **Google** provider
2. 点击启用开关
3. 配置 Google OAuth 凭据:
   - **Client ID**: 从 Google Cloud Console 获取
   - **Client Secret**: 从 Google Cloud Console 获取
4. 添加授权回调 URL (自动配置):
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

### 4. 配置重定向 URL

进入 **Authentication > URL Configuration**:

添加允许的重定向 URL:
```
http://localhost:3000/auth/callback   (开发环境)
https://your-domain.com/auth/callback (生产环境)
```

## 🔑 Google OAuth 配置

### 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目

### 2. 启用 Google+ API

1. 进入 **APIs & Services > Library**
2. 搜索 "Google+ API"
3. 点击启用

### 3. 创建 OAuth 2.0 客户端

1. 进入 **APIs & Services > Credentials**
2. 点击 **Create Credentials > OAuth client ID**
3. 选择 **Application type**: Web application
4. 配置:
   - **Name**: AppHub AI (或自定义名称)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-domain.com
     https://your-project.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     https://your-project.supabase.co/auth/v1/callback
     ```

5. 点击 **Create**
6. 复制 **Client ID** 和 **Client Secret**
7. 将这两个值配置到 Supabase 的 Google Provider 设置中

### 4. 配置 OAuth 同意屏幕

1. 进入 **APIs & Services > OAuth consent screen**
2. 选择 **External** (除非你有 Google Workspace)
3. 填写应用信息:
   - **App name**: AppHub AI
   - **User support email**: 你的邮箱
   - **Developer contact information**: 你的邮箱
4. 保存并继续

## 🖥️ 后端配置

后端已完全支持 Supabase 认证,无需修改代码。

### 确认后端配置

检查 `backend/.env` 文件包含:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

### 后端工作原理

1. **JWT 验证**: `common/auth.py` 中的 `verify_supabase_jwt()` 验证所有 Supabase token
2. **用户同步**: `services/auth_service.py` 的 `sign_in_with_password()` 会自动创建本地用户
3. **无需新接口**: 前端直接使用现有的 `GET /auth/me` 接口

## 🧪 测试流程

### 1. 启动开发环境

**后端**:
```bash
cd backend
python main.py
```

**前端**:
```bash
cd ai-research-assistant
npm run dev
```

### 2. 测试 Google 登录

1. 访问 http://localhost:3000/login
2. 点击 **"使用 Google 账号登录"** 按钮
3. 在 Google 授权页面选择账号
4. 授权后自动跳转到 `/auth/callback`
5. 页面显示 "正在完成 Google 登录..."
6. 自动跳转到首页,登录完成

### 3. 验证用户同步

登录成功后,检查:

**前端控制台** (F12):
```
Google OAuth 成功,access_token: eyJhbGc...
用户同步成功: { id: 1, email: "user@gmail.com", ... }
```

**后端日志**:
```
INFO: User signed in successfully: user@gmail.com (ID: 1)
```

**数据库**:
```sql
SELECT * FROM ai_apps.users WHERE email = 'user@gmail.com';
-- 应该看到新创建的用户记录,包含 supabase_user_id
```

### 4. 测试注册流程

1. 访问 http://localhost:3000/signup
2. 点击 **"使用 Google 账号注册"** 按钮
3. 流程与登录相同(Supabase 会自动区分新用户和现有用户)

## 🐛 故障排除

### 问题 1: "获取 session 失败"

**原因**: Supabase 配置不正确

**解决方案**:
1. 检查 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 确认 URL 格式: `https://xxx.supabase.co` (无尾部斜杠)
3. 确认 Key 是 **anon** key,不是 **service_role** key

### 问题 2: "未获取到 OAuth URL"

**原因**: Supabase Google Provider 未启用或配置错误

**解决方案**:
1. 在 Supabase Dashboard > Authentication > Providers
2. 确认 Google Provider 已启用
3. 确认填入了正确的 Client ID 和 Client Secret

### 问题 3: Google 授权页面报错 "redirect_uri_mismatch"

**原因**: Google OAuth 重定向 URI 配置不匹配

**解决方案**:
1. 在 Google Cloud Console > Credentials
2. 编辑 OAuth 2.0 客户端
3. 确认 **Authorized redirect URIs** 包含:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. 注意: URI 必须**完全匹配**(包括 http/https, 端口, 路径)

### 问题 4: 回调后 "sync_failed"

**原因**: 后端 API 调用失败

**解决方案**:
1. 检查后端是否运行: `curl http://localhost:8000/health`
2. 检查前端 API 配置: `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL`
3. 查看浏览器控制台和后端日志的详细错误信息
4. 确认后端 Supabase 配置与前端一致

### 问题 5: CORS 错误

**原因**: 后端 CORS 配置未包含前端域名

**解决方案**:
1. 检查 `backend/.env` 中的 `CORS_ORIGINS`
2. 开发环境应包含: `http://localhost:3000`
3. 生产环境添加实际域名

### 问题 6: Token 验证失败

**原因**: 后端 JWT_SECRET 配置错误

**解决方案**:
1. 确认 `backend/.env` 中的 `SUPABASE_JWT_SECRET` 与 Supabase 项目的 JWT Secret 一致
2. JWT Secret 位置: Supabase Dashboard > Settings > API > JWT Secret
3. 修改后重启后端服务

## 📚 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [后端 API 文档](./lib/api/README.md)

## 🔗 API 端点

### 前端 API 方法

```typescript
import { authApi } from '@/lib/api'

// Google OAuth 登录
const { url } = await authApi.signInWithGoogle()
window.location.href = url

// 同步用户到后端
const user = await authApi.syncGoogleUser(accessToken)

// 获取当前用户
const user = await authApi.getMe()
```

### 后端 API 端点

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | `/auth/me` | 获取当前用户信息 | Bearer Token |
| POST | `/auth/signup` | 邮箱注册 | 无 |
| POST | `/auth/signin` | 密码登录 | 无 |
| POST | `/auth/signout` | 登出 | Bearer Token |

## 💡 最佳实践

1. **生产环境安全**:
   - 使用 HTTPS
   - 启用 Supabase Row Level Security (RLS)
   - 配置正确的 CORS 策略
   - 使用环境变量管理敏感信息

2. **用户体验**:
   - 登录失败时显示清晰的错误信息
   - 提供邮箱登录作为备用选项
   - 回调页面添加加载动画

3. **监控和日志**:
   - 记录认证失败日志
   - 监控用户同步异常
   - 跟踪 OAuth 流程各阶段

## 📞 支持

如有问题,请:
1. 查看本文档的故障排除部分
2. 检查浏览器控制台和后端日志
3. 参考 Supabase 和 Google OAuth 官方文档
