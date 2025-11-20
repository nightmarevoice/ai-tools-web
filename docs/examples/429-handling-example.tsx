/**
 * 429 错误处理使用示例
 * 
 * 这个文件展示了如何在实际应用中使用 429 错误处理机制
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiClient, ApiError } from '@/lib/api/client'
import { searchApi } from '@/lib/api'

/**
 * 示例 1：搜索组件 - 自动处理 429 错误
 * 
 * 当搜索请求返回 429 时：
 * 1. API 客户端自动清除认证信息
 * 2. 显示 Toast 提示
 * 3. 导航栏自动更新为未登录状态
 */
export function SearchWithAutoHandling() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 发起搜索请求
      const results = await searchApi.semanticSearch({
        user_query: query,
        lang: 'zh'
      })
      
      console.log('搜索结果:', results)
      
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          // 429 错误已被自动处理：
          // - localStorage 已清除 ✓
          // - Toast 提示已显示 ✓
          // - 导航栏已更新 ✓
          
          // 这里只需要更新组件内部的错误状态
          setError('请求频率超限，请稍后再试')
          
        } else {
          // 处理其他 API 错误
          setError(err.message)
        }
      } else {
        setError('搜索失败')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="输入搜索关键词..."
        className="w-full px-4 py-2 border rounded"
      />
      
      <Button 
        onClick={handleSearch} 
        disabled={loading || !query}
      >
        {loading ? '搜索中...' : '搜索'}
      </Button>
      
      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}

/**
 * 示例 2：批量请求 - 自动处理 429 错误
 * 
 * 即使在循环中发起多个请求，429 错误也会被自动处理
 */
export function BatchRequestWithAutoHandling() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleBatchRequest = async () => {
    try {
      setLoading(true)
      const queries = ['AI 工具', '机器学习', '数据分析']
      const batchResults = []

      for (const query of queries) {
        try {
          const result = await searchApi.semanticSearch({
            user_query: query,
            lang: 'zh'
          })
          batchResults.push(result)
        } catch (err) {
          if (err instanceof ApiError && err.status === 429) {
            // 429 错误已自动处理，停止后续请求
            console.log('请求频率超限，停止批量请求')
            break
          }
          throw err
        }
      }

      setResults(batchResults)
      
    } catch (err) {
      console.error('批量请求失败:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleBatchRequest} disabled={loading}>
        {loading ? '请求中...' : '批量搜索'}
      </Button>
      
      <div>
        {results.map((result, index) => (
          <div key={index} className="p-4 border rounded mb-2">
            查询 {index + 1}: {result.total} 个结果
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 示例 3：自定义 API 调用 - 使用 apiClient
 * 
 * 直接使用 apiClient 的调用也会自动处理 429 错误
 */
export function CustomApiCallWithAutoHandling() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 使用 apiClient 发起自定义请求
      const response = await apiClient.get('/api/custom-endpoint', {
        param1: 'value1',
        param2: 'value2'
      })
      
      setData(response)
      
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        // 429 已自动处理，用户会看到：
        // 1. Toast 提示："请求频率超限，请登录账号"
        // 2. 导航栏变为未登录状态
        // 3. localStorage 已清空
        console.log('Rate limit exceeded - auto handled')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={fetchData} disabled={loading}>
        {loading ? '加载中...' : '获取数据'}
      </Button>
      
      {data && (
        <pre className="p-4 bg-gray-100 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

/**
 * 示例 4：监听认证事件（高级用法）
 * 
 * 如果需要在组件中监听认证事件，可以这样做
 */
export function ComponentWithEventListener() {
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)

  // 在实际使用中，应该在 useEffect 中订阅
  // useEffect(() => {
  //   const unsubscribe = authEventManager.subscribe((event, data) => {
  //     if (event === 'RATE_LIMIT_EXCEEDED') {
  //       setRateLimitMessage(data?.message)
  //       
  //       // 可以执行自定义逻辑，比如：
  //       // - 重定向到登录页
  //       // - 显示自定义 UI
  //       // - 记录日志等
  //     }
  //   })
  //   
  //   return () => unsubscribe()
  // }, [])

  return (
    <div>
      {rateLimitMessage && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
          <strong>提示：</strong> {rateLimitMessage}
        </div>
      )}
      
      {/* 其他组件内容 */}
    </div>
  )
}

/**
 * 最佳实践总结：
 * 
 * 1. ✅ 使用 apiClient 或封装的 API 方法（如 searchApi）
 * 2. ✅ 不需要在每个调用处手动处理 429 错误
 * 3. ✅ 系统会自动清理认证信息和更新 UI
 * 4. ✅ 可选：捕获 429 错误进行组件级别的自定义处理
 * 5. ✅ 可选：订阅认证事件执行高级自定义逻辑
 * 
 * ❌ 避免：
 * - 不要手动清除 localStorage（系统会自动处理）
 * - 不要手动调用 logout（系统会自动更新状态）
 * - 不要重复显示错误提示（Toast 会自动显示）
 */



