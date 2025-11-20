# API 封装使用指南

本文档介绍如何使用项目中的 API 封装。

## 快速开始

### 1. 基础使用

```typescript
import { appsApi, authApi, searchApi } from '@/lib/api'

// 获取应用列表
const apps = await appsApi.list({ page: 1, limit: 20, lang: 'zh' })

// 用户登录
const response = await authApi.signin({
  email: 'user@example.com',
  password: 'password123'
})

// 设置访问令牌
import { apiClient } from '@/lib/api'
apiClient.setAccessToken(response.session.access_token)

// 语义搜索
const results = await searchApi.query({
  user_query: 'AI图像生成工具',
  top_k: 10
})
```

### 2. 认证方式

#### Bearer Token 认证（用户认证）

```typescript
import { apiClient, authApi } from '@/lib/api'

// 登录获取token
const { session } = await authApi.signin({
  email: 'user@example.com',
  password: 'password123'
})

// 设置token（后续请求自动携带）
apiClient.setAccessToken(session.access_token)

// 现在可以调用需要认证的接口
const user = await authApi.getMe()
```

#### API Key 认证（服务端调用）

```typescript
import { apiClient } from '@/lib/api'

// 设置API密钥
apiClient.setApiKey('ak_1234567890abcdef', 'sk_abcdef1234567890...')

// 现在所有请求都会使用API Key认证
const apps = await appsApi.list()
```

### 3. 多语言支持

```typescript
import { appsApi, categoriesApi } from '@/lib/api'

// 方式1: 通过参数指定语言
const apps = await appsApi.list({ lang: 'zh' })
const categories = await categoriesApi.list('zh')

// 方式2: 设置默认语言
apiClient.setDefaultLanguage('zh')
const apps = await appsApi.list() // 自动使用中文
```

### 4. 错误处理

```typescript
import { appsApi, ApiError } from '@/lib/api'

try {
  const app = await appsApi.get(99999)
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API错误:', error.message)
    console.error('状态码:', error.status)
    console.error('错误详情:', error.data)
  } else {
    console.error('未知错误:', error)
  }
}
```

## API 模块

### 认证 API (`authApi`)

```typescript
// 用户注册
await authApi.signup({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
})

// 用户登录
await authApi.signin({ email, password })

// 获取当前用户
await authApi.getMe()

// 更新用户信息
await authApi.updateMe({ name: 'New Name' })
```

### 应用管理 API (`appsApi`)

```typescript
// 获取应用列表（支持分页、排序、筛选）
await appsApi.list({
  page: 1,
  limit: 20,
  lang: 'zh',
  category: 'ai_assistant',
  region: 'US',
  search: 'ChatGPT',
  sort: 'monthly_visits',
  order: 'desc'
})

// 获取应用详情
await appsApi.get(1, 'zh')

// 获取相似应用
await appsApi.getSimilar(1, { lang: 'zh', limit: 10 })

// 创建应用
await appsApi.create({
  app_name: 'New App',
  url: 'https://example.com',
  region: 'US',
  categories: ['ai_assistant']
})
```

### 类别管理 API (`categoriesApi`)

```typescript
// 获取所有类别
await categoriesApi.list('zh')

// 获取单个类别
await categoriesApi.get('ai_assistant', 'zh')

// 获取所有翻译
await categoriesApi.getTranslations('ai_assistant')
```

### 统计分析 API (`statsApi`)

```typescript
// 总体统计
await statsApi.getOverview()

// 分类统计
await statsApi.getByCategory({ top: 10, lang: 'zh' })

// 地区统计
await statsApi.getByRegion()

// 趋势分析
await statsApi.getTrends({ period: 'month', limit: 12 })

// 热门应用排行
await statsApi.getTopApps({ metric: 'visits', limit: 10 })
```

### 智能搜索 API (`searchApi`)

```typescript
// 语义搜索
await searchApi.query({
  user_query: '能够生成图像的AI工具',
  region: '中国',
  enable_llm_summary: true,
  top_k: 10
})

// 健康检查
await searchApi.health()
```

### 查询历史 API (`queryHistoryApi`)

```typescript
// 获取我的查询历史
await queryHistoryApi.getMyHistory({ page: 1, limit: 20 })

// 查询分析统计
await queryHistoryApi.getAnalytics({ days: 7 })

// 热门查询
await queryHistoryApi.getPopularQueries({ days: 7, limit: 20 })

// 性能趋势
await queryHistoryApi.getPerformanceTrends({ days: 30 })
```

### API密钥管理 API (`apiKeysApi`)

```typescript
// 创建API密钥
const apiKey = await apiKeysApi.create({
  scopes: ['apps:read', 'stats:read'],
  description: '生产环境API密钥',
  expires_days: 365
})

// 列出所有密钥
await apiKeysApi.list()

// 撤销密钥
await apiKeysApi.revoke(apiKey.key_id)
```

## 环境变量配置

在 `.env.local` 文件中配置 API 基础URL：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 在 React 组件中使用

### 使用 Server Components (Next.js App Router)

```typescript
// app/apps/page.tsx
import { appsApi } from '@/lib/api'

export default async function AppsPage() {
  const { items } = await appsApi.list({ lang: 'zh', page: 1, limit: 20 })
  
  return (
    <div>
      {items.map(app => (
        <div key={app.id}>{app.app_name}</div>
      ))}
    </div>
  )
}
```

### 使用 Client Components

```typescript
'use client'

import { useState, useEffect } from 'react'
import { appsApi } from '@/lib/api'
import type { Application } from '@/lib/api'

export default function AppsList() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApps() {
      try {
        const { items } = await appsApi.list({ lang: 'zh' })
        setApps(items)
      } catch (error) {
        console.error('获取应用列表失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  if (loading) return <div>加载中...</div>

  return (
    <div>
      {apps.map(app => (
        <div key={app.id}>{app.app_name}</div>
      ))}
    </div>
  )
}
```

## 类型安全

所有 API 方法都有完整的 TypeScript 类型定义：

```typescript
import type { Application, ListAppsParams, ListResponse } from '@/lib/api'

// 类型推断
const apps: ListResponse<Application> = await appsApi.list()

// 参数类型检查
await appsApi.list({
  page: 1,
  limit: 20,
  lang: 'zh', // ✅ 类型安全
  // lang: 'fr' // ❌ TypeScript 错误
})
```

## 注意事项

1. **认证令牌管理**: 建议将 access_token 存储在安全的地方（如 httpOnly cookie 或 secure storage）
2. **错误处理**: 始终使用 try-catch 处理 API 调用
3. **类型导入**: 使用 `import type` 导入类型，避免影响打包体积
4. **环境变量**: API 基础URL 通过环境变量配置，便于不同环境切换


