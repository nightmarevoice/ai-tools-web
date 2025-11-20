# AI Tools Tabs API Integration

## 概述

将 `ai-tools-tabs.tsx` 组件的 **trending** 标签页改为使用动态数据，通过 `statsApi.getTopApps` 接口获取热门应用。

## 修改内容

### 1. 导入新的依赖

```typescript
import { useState, useEffect } from "react"
import { statsApi } from "@/lib/api/stats"
import type { TopApp } from "@/types/api"
```

### 2. 添加状态管理

```typescript
const [trendingApps, setTrendingApps] = useState<TopApp[]>([])
const [loading, setLoading] = useState(false)
```

### 3. 获取热门应用数据

使用 `useEffect` 在组件挂载时获取数据：

```typescript
useEffect(() => {
  const fetchTrendingApps = async () => {
    setLoading(true)
    try {
      const response = await statsApi.getTopApps({
        metric: 'visits',      // 按访问量排序
        limit: 10              // 获取前 10 个应用
      })
      setTrendingApps(response.apps)
    } catch (error) {
      console.error('Failed to fetch trending apps:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchTrendingApps()
}, [])
```

### 4. 数据转换

将 API 返回的 `TopApp` 格式转换为组件需要的 `Tool` 格式：

```typescript
const convertToTool = (app: TopApp) => ({
  id: app.id,
  name: app.app_name,
  description: `Monthly visits: ${app.monthly_visits.toLocaleString()} | Rating: ${app.rating}/5`,
  category: t("categories.aiAssistant"), // 可以根据实际情况扩展
  pricing: t("pricing.free"),             // 可以根据实际情况扩展
  isNew: false,
  isTrending: true,
})

const tools = {
  trending: trendingApps.map(convertToTool),
  // ... 其他 tabs 保持静态数据
}
```

### 5. 添加加载和空状态

```typescript
{loading && activeTab === "trending" ? (
  // 加载状态
  <div className="col-span-full flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0057FF]"></div>
      <p className="text-sm text-muted-foreground">Loading trending tools...</p>
    </div>
  </div>
) : currentTools.length === 0 && activeTab === "trending" ? (
  // 空状态
  <div className="col-span-full flex items-center justify-center py-12">
    <p className="text-muted-foreground">No trending tools available</p>
  </div>
) : (
  // 正常显示工具卡片
  currentTools.map((tool) => (
    <ToolCard key={tool.id} tool={tool} />
  ))
)}
```

## API 接口说明

### `statsApi.getTopApps(params)`

**参数：**

```typescript
interface TopAppsParams {
  metric?: 'visits' | 'duration' | 'rating'  // 排序指标
  limit?: number                              // 返回数量
}
```

**返回：**

```typescript
interface TopAppsResponse {
  apps: TopApp[]
  metric: TopAppsMetric
  total: number
}

interface TopApp {
  id: number
  app_name: string
  monthly_visits: number
  avg_duration_seconds: number
  rating: number
  rank: number
}
```

## 使用场景

### 当前实现

- **Trending Tab**: 使用 API 动态数据（`metric: 'visits', limit: 10`）
- **Recent Tab**: 使用静态数据（可以后续改为 API）
- **Featured Tab**: 使用静态数据（可以后续改为 API）

## 数据映射

### API 数据 → Tool Card 显示

| API 字段 | 组件字段 | 说明 |
|---------|---------|------|
| `app.id` | `tool.id` | 应用 ID |
| `app.app_name` | `tool.name` | 应用名称 |
| `app.monthly_visits` | `tool.description` | 显示访问量和评分 |
| `app.rating` | `tool.description` | 显示访问量和评分 |
| - | `tool.category` | 使用翻译（待扩展） |
| - | `tool.pricing` | 使用翻译（待扩展） |
| `true` | `tool.isTrending` | trending 标签总是 true |
| `false` | `tool.isNew` | 默认为 false |

## 优化建议

### 1. 添加 Category 映射

如果 API 返回包含 category 信息，可以添加映射逻辑：

```typescript
const getCategoryLabel = (categoryId: string) => {
  const categoryMap: Record<string, string> = {
    'ai-assistant': t("categories.aiAssistant"),
    'image-generation': t("categories.imageGeneration"),
    'code-generation': t("categories.codeGeneration"),
    // ... 更多分类
  }
  return categoryMap[categoryId] || t("categories.aiAssistant")
}
```

### 2. 添加 Pricing 映射

如果 API 返回包含 pricing 信息，可以添加映射逻辑：

```typescript
const getPricingLabel = (pricing: string) => {
  const pricingMap: Record<string, string> = {
    'free': t("pricing.free"),
    'freemium': t("pricing.freemium"),
    'paid': t("pricing.paid"),
  }
  return pricingMap[pricing] || t("pricing.free")
}
```

### 3. 改进描述显示

当前描述显示访问量和评分，可以改为更友好的格式：

```typescript
const formatDescription = (app: TopApp) => {
  const visits = app.monthly_visits.toLocaleString()
  const rating = app.rating.toFixed(1)
  return t("tools.statsDescription", { visits, rating })
}
```

然后在翻译文件中添加：

```json
{
  "home.aiToolsTabs": {
    "tools": {
      "statsDescription": "{visits} monthly visits | {rating}⭐"
    }
  }
}
```

### 4. 添加错误处理 UI

```typescript
const [error, setError] = useState<string | null>(null)

// 在 useEffect 中
catch (error) {
  console.error('Failed to fetch trending apps:', error)
  setError('Failed to load trending tools')
}

// 在渲染中
{error && activeTab === "trending" ? (
  <div className="col-span-full flex items-center justify-center py-12">
    <div className="text-center">
      <p className="text-red-500 mb-2">{error}</p>
      <button 
        onClick={fetchTrendingApps}
        className="text-sm text-blue-600 hover:underline"
      >
        Retry
      </button>
    </div>
  </div>
) : ...}
```

### 5. 添加缓存机制

避免每次组件挂载都重新请求：

```typescript
import { useEffect, useMemo } from "react"

const CACHE_KEY = 'trending-apps'
const CACHE_DURATION = 5 * 60 * 1000 // 5 分钟

useEffect(() => {
  const fetchTrendingApps = async () => {
    // 检查缓存
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < CACHE_DURATION) {
        setTrendingApps(data)
        return
      }
    }

    setLoading(true)
    try {
      const response = await statsApi.getTopApps({
        metric: 'visits',
        limit: 10
      })
      setTrendingApps(response.apps)
      
      // 保存到缓存
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: response.apps,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to fetch trending apps:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchTrendingApps()
}, [])
```

### 6. 添加刷新功能

```typescript
const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

const refreshTrendingApps = async () => {
  // ... 重新获取数据
  setLastUpdated(new Date())
}

// 在 UI 中显示
{activeTab === "trending" && lastUpdated && (
  <div className="text-xs text-muted-foreground mb-4">
    Last updated: {lastUpdated.toLocaleTimeString()}
    <button 
      onClick={refreshTrendingApps}
      className="ml-2 text-blue-600 hover:underline"
    >
      Refresh
    </button>
  </div>
)}
```

## Recent 和 Featured 标签页改造

### Recent Tab - 使用最近添加的应用

可以扩展 API 支持按创建时间排序：

```typescript
const [recentApps, setRecentApps] = useState<TopApp[]>([])

useEffect(() => {
  const fetchRecentApps = async () => {
    // 假设 API 支持按创建时间排序
    const response = await statsApi.getRecentApps({
      limit: 10
    })
    setRecentApps(response.apps)
  }
  
  if (activeTab === 'recent') {
    fetchRecentApps()
  }
}, [activeTab])
```

### Featured Tab - 使用精选应用

```typescript
const [featuredApps, setFeaturedApps] = useState<TopApp[]>([])

useEffect(() => {
  const fetchFeaturedApps = async () => {
    // 使用评分排序获取精选应用
    const response = await statsApi.getTopApps({
      metric: 'rating',
      limit: 10
    })
    setFeaturedApps(response.apps)
  }
  
  if (activeTab === 'featured') {
    fetchFeaturedApps()
  }
}, [activeTab])
```

## 性能优化

### 1. 懒加载数据

只在切换到对应 tab 时才加载数据：

```typescript
useEffect(() => {
  if (activeTab === 'trending' && trendingApps.length === 0) {
    fetchTrendingApps()
  } else if (activeTab === 'recent' && recentApps.length === 0) {
    fetchRecentApps()
  } else if (activeTab === 'featured' && featuredApps.length === 0) {
    fetchFeaturedApps()
  }
}, [activeTab])
```

### 2. 使用 SWR 或 React Query

考虑使用数据获取库来简化状态管理：

```typescript
import useSWR from 'swr'

const { data, error, isLoading } = useSWR(
  ['top-apps', 'visits', 10],
  () => statsApi.getTopApps({ metric: 'visits', limit: 10 }),
  {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 分钟去重
  }
)
```

## 测试建议

### 1. 单元测试

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { AiToolsTabs } from './ai-tools-tabs'

jest.mock('@/lib/api/stats', () => ({
  statsApi: {
    getTopApps: jest.fn(),
  },
}))

test('displays trending apps from API', async () => {
  const mockApps = [
    {
      id: 1,
      app_name: 'Test App',
      monthly_visits: 1000000,
      rating: 4.5,
      rank: 1,
    },
  ]

  statsApi.getTopApps.mockResolvedValue({
    apps: mockApps,
    metric: 'visits',
    total: 1,
  })

  render(<AiToolsTabs />)

  await waitFor(() => {
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })
})
```

### 2. 集成测试

- 测试 API 请求是否正确发送
- 测试加载状态是否正确显示
- 测试错误处理是否正常
- 测试 tab 切换功能

### 3. E2E 测试

```typescript
test('trending tab shows real-time data', async () => {
  // 访问首页
  await page.goto('http://localhost:3000')
  
  // 等待 trending 数据加载
  await page.waitForSelector('[data-testid="tool-card"]')
  
  // 验证显示了工具卡片
  const cards = await page.$$('[data-testid="tool-card"]')
  expect(cards.length).toBeGreaterThan(0)
})
```

## 监控和日志

### 添加性能监控

```typescript
useEffect(() => {
  const fetchTrendingApps = async () => {
    const startTime = performance.now()
    setLoading(true)
    
    try {
      const response = await statsApi.getTopApps({
        metric: 'visits',
        limit: 10
      })
      
      const endTime = performance.now()
      console.log(`Fetched trending apps in ${endTime - startTime}ms`)
      
      // 发送到分析服务
      // analytics.track('trending_apps_loaded', {
      //   duration: endTime - startTime,
      //   count: response.apps.length
      // })
      
      setTrendingApps(response.apps)
    } catch (error) {
      console.error('Failed to fetch trending apps:', error)
      // 发送错误到监控服务
      // errorReporting.captureException(error)
    } finally {
      setLoading(false)
    }
  }

  fetchTrendingApps()
}, [])
```

## 部署注意事项

1. **API 端点配置**：确保生产环境的 API 端点正确配置
2. **错误处理**：添加友好的错误提示
3. **加载性能**：考虑使用 SSR 或 ISR 预获取数据
4. **缓存策略**：配置合适的 CDN 和浏览器缓存
5. **降级方案**：API 失败时显示静态数据作为降级

## 相关文件

- `components/ai-tools-tabs.tsx` - 主组件
- `lib/api/stats.ts` - API 客户端
- `types/api.ts` - 类型定义
- `components/tool-card.tsx` - 工具卡片组件

## 总结

✅ **已完成：**

1. 集成 `statsApi.getTopApps` 接口
2. 使用参数 `metric: 'visits'` 和 `limit: 10`
3. 添加加载状态和空状态 UI
4. 实现数据格式转换
5. 保持代码类型安全

🔄 **可选优化：**

1. 添加 category 和 pricing 映射
2. 实现缓存机制
3. 添加错误重试功能
4. 改造 Recent 和 Featured 标签页
5. 使用数据获取库（SWR/React Query）
6. 添加性能监控和分析

📝 **后续任务：**

1. 测试 API 集成功能
2. 添加单元测试和集成测试
3. 优化用户体验
4. 监控性能和错误率



