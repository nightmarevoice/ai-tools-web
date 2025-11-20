# 429 错误处理机制说明

## 概述

当 API 返回 429 状态码（请求频率超限）时，系统会自动执行以下操作：

1. 清除本地存储的认证信息（`auth_user` 和 `auth_access_token`）
2. 重置登录状态为未登录
3. 显示提示消息："请求频率超限，请登录账号"
4. 自动更新导航栏显示为未登录状态

## 技术实现

### 1. 事件管理系统 (`lib/auth/auth-events.ts`)

创建了一个全局的认证事件管理器，用于在不同组件之间传递认证相关事件。

```typescript
// 订阅认证事件
const unsubscribe = authEventManager.subscribe((event, data) => {
  if (event === 'RATE_LIMIT_EXCEEDED') {
    // 处理 429 错误
  }
})

// 取消订阅
unsubscribe()
```

### 2. API 客户端处理 (`lib/api/client.ts`)

在 API 客户端的错误处理函数中，专门处理 429 状态码：

```typescript
// 处理 429 错误（请求频率超限）
if (response.status === 429) {
  // 1. 清除本地认证信息
  clearAuth()
  this.setAccessToken(null)
  
  // 2. 触发全局登出事件
  authEventManager.emit('RATE_LIMIT_EXCEEDED', {
    message: '请求频率超限，请登录账号',
    status: 429
  })
  
  // 3. 抛出错误
  throw new ApiError('请求频率超限，请登录账号', 429, error)
}
```

### 3. 认证状态管理 (`hooks/useAuth.ts`)

`useAuth` Hook 监听认证事件，并在收到 `RATE_LIMIT_EXCEEDED` 事件时更新状态：

```typescript
// 监听认证事件
const unsubscribe = authEventManager.subscribe((event, data) => {
  if (event === 'RATE_LIMIT_EXCEEDED') {
    // 清除状态
    setAccessTokenState(null)
    setUserState(null)
    apiClient.setAccessToken(null)
    
    // 显示提示消息
    toast.error(data?.message || '请求频率超限，请登录账号')
  }
})
```

### 4. 导航栏自动更新 (`components/navbar.tsx`)

导航栏组件使用 `useAuth` Hook，当认证状态改变时会自动重新渲染：

- 登录状态：显示用户头像和下拉菜单
- 未登录状态：显示"登录"按钮

## 工作流程

```
1. 用户发起 API 请求
   ↓
2. 后端返回 429 状态码
   ↓
3. API 客户端捕获错误
   ↓
4. 清除 localStorage 中的认证信息
   ├─ auth_user
   └─ auth_access_token
   ↓
5. 发送 RATE_LIMIT_EXCEEDED 事件
   ↓
6. useAuth Hook 接收事件
   ↓
7. 更新认证状态
   ├─ user → null
   ├─ accessToken → null
   └─ isAuthenticated → false
   ↓
8. 显示 Toast 提示消息
   ↓
9. 导航栏自动更新为未登录状态
```

## 使用场景

### 场景 1：搜索请求频率超限

```typescript
// 用户频繁搜索
try {
  await searchApi.semanticSearch({ user_query: 'AI tools', lang: 'zh' })
} catch (error) {
  if (error instanceof ApiError && error.status === 429) {
    // 系统已自动处理：
    // - 清除认证信息 ✓
    // - 显示提示消息 ✓
    // - 更新导航栏状态 ✓
  }
}
```

### 场景 2：API 调用频率超限

```typescript
// 任何 API 调用都会自动处理 429 错误
try {
  await appsApi.list({ page: 1, limit: 20 })
} catch (error) {
  // 429 错误已被自动处理
}
```

## 跨标签页同步

系统监听 `localStorage` 的 `storage` 事件，确保在多个标签页之间同步登录状态：

```typescript
// 监听 localStorage 变化（跨标签页同步）
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'auth_access_token' || e.key === 'auth_user') {
    loadAuth() // 重新加载认证状态
  }
}

window.addEventListener('storage', handleStorageChange)
```

## 优点

1. **自动化处理**：无需在每个 API 调用处手动处理 429 错误
2. **全局一致性**：所有组件自动同步认证状态
3. **用户友好**：清晰的错误提示，引导用户登录
4. **跨标签页同步**：多个标签页的状态保持一致
5. **解耦设计**：使用事件系统实现组件间通信

## 测试建议

### 手动测试

1. 登录系统
2. 快速连续发起多个 API 请求触发 429 错误
3. 验证：
   - localStorage 中的 `auth_user` 和 `auth_access_token` 已清除
   - 显示 Toast 提示消息
   - 导航栏显示"登录"按钮

### 模拟 429 错误

在开发环境中，可以临时修改 API 客户端来模拟 429 错误：

```typescript
// 仅用于测试
async get<T>(endpoint: string, params?: Record<string, any>) {
  // 模拟 429 错误
  const mockResponse = new Response(
    JSON.stringify({ detail: 'Rate limit exceeded' }),
    { status: 429 }
  )
  await this.handleError(mockResponse)
}
```

## 注意事项

1. 确保所有 API 调用都通过 `apiClient` 实例进行
2. Toast 消息依赖 `sonner` 库，需要在根组件中配置 `<Toaster />`
3. 认证事件只在客户端环境中触发（检查 `typeof window !== 'undefined'`）



