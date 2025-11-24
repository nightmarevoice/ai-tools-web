# Changelog - 429 错误处理机制

## 版本：v1.0.0
**日期：** 2024-11-19

## 🎯 概述

实现了完整的 429 状态码（请求频率超限）自动处理机制。当 API 返回 429 错误时，系统会自动清除用户认证信息，显示提示消息，并更新导航栏状态为未登录。

## ✨ 新增功能

### 1. 全局认证事件管理器
**文件：** `lib/auth/auth-events.ts`

- 创建了事件驱动的认证状态管理系统
- 支持订阅/取消订阅模式
- 事件类型：
  - `RATE_LIMIT_EXCEEDED` - 请求频率超限
  - `TOKEN_EXPIRED` - Token 过期（预留）
  - `FORCE_LOGOUT` - 强制登出（预留）

```typescript
// 使用示例
const unsubscribe = authEventManager.subscribe((event, data) => {
  if (event === 'RATE_LIMIT_EXCEEDED') {
    console.log('Rate limit exceeded:', data)
  }
})
```

### 2. API 客户端 429 错误拦截
**文件：** `lib/api/client.ts`

- 在 `handleError` 方法中添加 429 状态码特殊处理
- 自动清除 localStorage 中的认证信息
- 触发全局 `RATE_LIMIT_EXCEEDED` 事件
- 抛出友好的错误消息

**改动内容：**
```typescript
// 导入必要的模块
import { authEventManager } from '@/lib/auth/auth-events'
import { clearAuth } from '@/lib/auth/storage'

// 处理 429 错误
if (response.status === 429) {
  clearAuth()
  this.setAccessToken(null)
  authEventManager.emit('RATE_LIMIT_EXCEEDED', {
    message: '请求频率超限，请登录账号',
    status: 429
  })
  throw new ApiError('请求频率超限，请登录账号', 429, error)
}
```

### 3. useAuth Hook 事件监听
**文件：** `hooks/useAuth.ts`

- 订阅认证事件
- 监听 `RATE_LIMIT_EXCEEDED` 事件
- 自动更新认证状态（user, accessToken）
- 显示 Toast 提示消息

**改动内容：**
```typescript
// 导入 toast
import { toast } from 'sonner'
import { authEventManager } from '@/lib/auth/auth-events'

// 监听认证事件
const unsubscribe = authEventManager.subscribe((event, data) => {
  if (event === 'RATE_LIMIT_EXCEEDED') {
    setAccessTokenState(null)
    setUserState(null)
    apiClient.setAccessToken(null)
    toast.error(data?.message || '请求频率超限，请登录账号')
  }
})
```

### 4. Toast 通知组件
**文件：** `app/[locale]/layout.tsx`

- 添加 Sonner Toaster 组件到根布局
- 确保 Toast 消息能在全局显示

```typescript
import { Toaster } from '@/components/ui/sonner'

// 在 body 中添加
<Toaster />
```

## 🔄 工作流程

```
用户请求 → API 返回 429 → API 客户端拦截
    ↓
清除 localStorage (auth_user, auth_access_token)
    ↓
触发全局事件 (RATE_LIMIT_EXCEEDED)
    ↓
useAuth Hook 接收事件
    ↓
更新认证状态 → 导航栏自动变为未登录状态
    ↓
显示 Toast 提示："请求频率超限，请登录账号"
```

## 📁 新增文件

1. `lib/auth/auth-events.ts` - 认证事件管理器
2. `docs/429-error-handling.md` - 详细技术文档
3. `docs/429-error-flow.mermaid` - 流程图
4. `CHANGELOG-429-HANDLING.md` - 本文件

## 🔧 修改文件

1. `lib/api/client.ts`
   - 导入认证事件管理器和 clearAuth
   - 在 handleError 中添加 429 处理逻辑
   - 修复类型冲突（ApiError 重命名为 ApiErrorResponse）

2. `hooks/useAuth.ts`
   - 导入 authEventManager 和 toast
   - 在 useEffect 中订阅认证事件
   - 处理 RATE_LIMIT_EXCEEDED 事件

3. `app/[locale]/layout.tsx`
   - 导入 Toaster 组件
   - 在 body 中添加 `<Toaster />`

## 🎨 用户体验改进

1. **自动化处理**：开发者无需在每个 API 调用处手动处理 429 错误
2. **即时反馈**：Toast 消息立即通知用户发生了什么
3. **状态同步**：所有组件（导航栏等）自动同步认证状态
4. **清晰引导**：错误消息引导用户重新登录

## 🧪 测试建议

### 手动测试步骤

1. 登录系统
2. 快速连续发起多个 API 请求（如连续搜索）
3. 触发 429 错误
4. 验证：
   - ✅ 显示 Toast 提示："请求频率超限，请登录账号"
   - ✅ localStorage 中的 `auth_user` 和 `auth_access_token` 已清除
   - ✅ 导航栏显示"登录"按钮
   - ✅ 用户状态为未登录

### 模拟 429 错误（开发环境）

临时修改 API 客户端以模拟 429 响应：

```typescript
// 仅用于开发测试
async get<T>(endpoint: string) {
  // 模拟 429 错误
  if (endpoint.includes('/search')) {
    const mockResponse = new Response(
      JSON.stringify({ detail: 'Rate limit exceeded' }),
      { status: 429, statusText: 'Too Many Requests' }
    )
    await this.handleError(mockResponse)
  }
  // ... 正常逻辑
}
```

## 📊 影响范围

### 直接影响
- ✅ API 客户端（所有 API 调用）
- ✅ 认证状态管理
- ✅ 导航栏组件
- ✅ Toast 通知系统

### 间接影响
- ✅ 所有使用 `apiClient` 的组件
- ✅ 所有使用 `useAuth` Hook 的组件

## 🔒 安全性

1. **自动清理**：429 错误时立即清除认证信息
2. **事件隔离**：事件监听器错误不会影响其他监听器
3. **类型安全**：完整的 TypeScript 类型定义

## 🚀 性能优化

1. **事件驱动**：避免轮询，仅在事件发生时处理
2. **自动清理**：组件卸载时自动取消事件订阅
3. **轻量实现**：事件管理器使用原生 Set，性能开销极小

## 📖 相关文档

- [详细技术文档](./docs/429-error-handling.md)
- [流程图](./docs/429-error-flow.mermaid)

## 🐛 已知问题

无

## 🎯 未来改进

1. 可以扩展更多认证事件类型（如 TOKEN_EXPIRED）
2. 可以添加自动重试机制
3. 可以添加请求频率限制提示
4. 可以记录 429 错误日志用于分析

## 👥 贡献者

- AI Assistant

---

**注意：** 此功能已完全实现并通过类型检查，无 linter 错误。



