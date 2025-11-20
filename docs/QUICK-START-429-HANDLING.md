# 429 错误处理 - 快速开始指南

## 🚀 30秒快速了解

当 API 返回 429 状态码时，系统会**自动**：
1. ✅ 清除 `localStorage` 中的 `auth_user` 和 `auth_access_token`
2. ✅ 显示 Toast 提示："请求频率超限，请登录账号"
3. ✅ 将导航栏更新为未登录状态

**你不需要做任何事情**，系统已经帮你处理好了！

## 📝 基本使用

### 方式 1：使用封装的 API 方法（推荐）

```typescript
import { searchApi } from '@/lib/api'

try {
  const results = await searchApi.semanticSearch({
    user_query: 'AI tools',
    lang: 'zh'
  })
} catch (error) {
  // 429 错误已自动处理
  // 这里只需要处理其他错误
}
```

### 方式 2：直接使用 apiClient

```typescript
import { apiClient } from '@/lib/api/client'

try {
  const data = await apiClient.get('/api/endpoint')
} catch (error) {
  // 429 错误已自动处理
}
```

## ✅ 已完成的工作（开箱即用）

| 功能 | 状态 | 说明 |
|------|------|------|
| API 客户端拦截 | ✅ | 自动检测 429 状态码 |
| 清除认证信息 | ✅ | localStorage 自动清空 |
| 显示 Toast 提示 | ✅ | 友好的错误消息 |
| 更新导航栏 | ✅ | 自动变为未登录状态 |
| 事件通知系统 | ✅ | 可选的高级功能 |
| TypeScript 支持 | ✅ | 完整类型定义 |

## 🎯 常见场景

### 场景 1：搜索功能

```typescript
'use client'

export function SearchComponent() {
  const handleSearch = async (query: string) => {
    try {
      const results = await searchApi.semanticSearch({
        user_query: query,
        lang: 'zh'
      })
      // 处理结果...
    } catch (error) {
      // 429 已自动处理 ✓
    }
  }

  return <div>...</div>
}
```

### 场景 2：数据列表加载

```typescript
'use client'

export function DataList() {
  const loadData = async () => {
    try {
      const data = await appsApi.list({ page: 1, limit: 20 })
      // 处理数据...
    } catch (error) {
      // 429 已自动处理 ✓
    }
  }

  return <div>...</div>
}
```

### 场景 3：表单提交

```typescript
'use client'

export function FormComponent() {
  const handleSubmit = async (formData: any) => {
    try {
      await apiClient.post('/api/submit', formData)
      // 提交成功...
    } catch (error) {
      // 429 已自动处理 ✓
    }
  }

  return <form>...</form>
}
```

## 🔧 高级用法（可选）

### 自定义处理 429 错误

如果你需要在组件中对 429 错误进行特殊处理：

```typescript
import { ApiError } from '@/lib/api/client'

try {
  const data = await apiClient.get('/api/endpoint')
} catch (error) {
  if (error instanceof ApiError && error.status === 429) {
    // 自定义处理（可选）
    // 注意：认证信息已被自动清除，Toast 已显示
    console.log('Rate limit exceeded - custom handling')
  }
}
```

### 监听认证事件

如果需要在特定组件中响应 429 事件：

```typescript
import { useEffect } from 'react'
import { authEventManager } from '@/lib/auth/auth-events'

useEffect(() => {
  const unsubscribe = authEventManager.subscribe((event, data) => {
    if (event === 'RATE_LIMIT_EXCEEDED') {
      // 自定义逻辑（可选）
      console.log('Rate limit event:', data)
    }
  })

  return () => unsubscribe()
}, [])
```

## ❓ 常见问题

### Q1: 我需要在每个 API 调用处理 429 错误吗？
**A:** 不需要！系统已经自动处理了。

### Q2: 429 错误后用户需要做什么？
**A:** 用户会看到提示消息，然后可以重新登录。

### Q3: 如何测试 429 错误处理？
**A:** 快速连续发起多个请求，或查看测试文档中的模拟方法。

### Q4: Toast 消息在哪里配置？
**A:** 已在 `app/[locale]/layout.tsx` 中添加了 `<Toaster />` 组件。

### Q5: 多个标签页会同步吗？
**A:** 是的，通过 `localStorage` 的 `storage` 事件自动同步。

## 📚 相关文档

- [详细技术文档](./429-error-handling.md)
- [代码示例](./examples/429-handling-example.tsx)
- [流程图](./429-error-flow.mermaid)
- [更新日志](../CHANGELOG-429-HANDLING.md)

## 🎉 总结

这是一个**零配置、开箱即用**的功能！

你只需要：
1. 使用 `apiClient` 或封装的 API 方法
2. 正常编写 try-catch（可选）
3. 系统会自动处理所有 429 错误

就这么简单！✨



