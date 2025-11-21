# OAuth 重定向到 localhost 问题修复指南

## 🔍 问题描述

部署到生产环境后，Google OAuth 登录重定向到了 `http://localhost:3000/?code=...` 而不是生产环境的域名。

## 🎯 问题原因

这个问题通常由以下原因导致：

1. **Supabase Dashboard 中未配置生产环境的回调 URL**
2. **Google Cloud Console 中未配置生产环境的回调 URL**
3. **环境变量配置不正确**

## ✅ 解决方案

### 步骤 1: 配置 Supabase 回调 URL

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **URL Configuration**
4. 在 **Redirect URLs** 部分，添加以下 URL（根据你的实际域名修改）：

   ```
   # 开发环境（如果还没有）
   http://localhost:3000/auth/callback
   http://localhost:3000/zh/auth/callback
   http://localhost:3000/en/auth/callback
   
   # 生产环境（必须添加）
   https://ai-tool-web.zeabur.app/auth/callback
   https://ai-tool-web.zeabur.app/zh/auth/callback
   https://ai-tool-web.zeabur.app/en/auth/callback
   ```

   **注意**：如果你的应用支持多语言，需要为每种语言的路径添加回调 URL。

5. 点击 **Save** 保存配置

### 步骤 2: 配置 Google Cloud Console 回调 URL

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 选择你的项目
3. 进入 **APIs & Services** > **Credentials**
4. 找到你的 OAuth 2.0 客户端 ID，点击编辑
5. 在 **Authorized redirect URIs** 部分，添加以下 URL：

   ```
   # Supabase 的回调 URL（必须）
   https://your-project.supabase.co/auth/v1/callback
   
   # 你的应用回调 URL（如果 Google 直接回调到你的应用）
   https://ai-tool-web.zeabur.app/auth/callback
   https://ai-tool-web.zeabur.app/zh/auth/callback
   https://ai-tool-web.zeabur.app/en/auth/callback
   ```

   **注意**：将 `your-project.supabase.co` 替换为你的实际 Supabase 项目 URL。

6. 点击 **Save** 保存配置

### 步骤 3: 验证环境变量

确保在 Zeabur（或你的部署平台）的环境变量中配置了：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8000
```

**在 Zeabur 中配置环境变量：**

1. 登录 Zeabur Dashboard
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 添加或更新上述环境变量
5. 重新部署应用

### 步骤 4: 清除缓存并重新部署

1. 在 Zeabur 中触发重新部署
2. 清除浏览器缓存和 Cookie
3. 重新测试 Google 登录

## 🔍 调试方法

### 检查当前使用的回调 URL

在浏览器控制台（F12）中，查看 Network 标签页，找到 OAuth 请求，检查：

1. **请求的 redirectTo 参数**：应该包含你的生产环境域名
2. **返回的 OAuth URL**：检查是否包含 localhost

### 检查 Supabase 配置

在 Supabase Dashboard 中：

1. 进入 **Authentication** > **URL Configuration**
2. 确认 **Site URL** 设置正确（应该是你的生产环境域名）
3. 确认 **Redirect URLs** 列表包含所有需要的回调 URL

### 检查代码中的回调 URL

代码使用 `window.location.origin` 来构建回调 URL，这应该能自动获取正确的域名。如果仍然重定向到 localhost，可能是：

1. Supabase 配置中缺少该 URL
2. 浏览器缓存了旧的配置
3. Supabase 使用了默认的 Site URL

## 📝 常见问题

### Q: 为什么需要配置多个回调 URL？

A: 如果你的应用支持多语言（如 `/zh/auth/callback` 和 `/en/auth/callback`），需要为每种语言的路径配置回调 URL。

### Q: 我已经配置了，但还是重定向到 localhost？

A: 请检查：
1. 是否在 Supabase 和 Google Cloud Console 中都配置了
2. 是否清除了浏览器缓存
3. 是否重新部署了应用
4. 环境变量是否正确配置

### Q: 如何确认配置是否生效？

A: 
1. 在浏览器控制台查看 Network 请求
2. 检查 OAuth 请求中的 `redirectTo` 参数
3. 检查返回的 OAuth URL 是否包含正确的域名

### Q: 开发环境和生产环境需要分别配置吗？

A: 是的，需要分别配置：
- 开发环境：`http://localhost:3000/auth/callback`
- 生产环境：`https://your-domain.com/auth/callback`

## 🚀 快速检查清单

- [ ] Supabase Dashboard > Authentication > URL Configuration 中添加了生产环境回调 URL
- [ ] Google Cloud Console > Credentials 中添加了生产环境回调 URL
- [ ] Zeabur 环境变量中配置了 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 已重新部署应用
- [ ] 已清除浏览器缓存
- [ ] 测试 Google 登录功能

## 📚 相关文档

- [Supabase Authentication 文档](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)

