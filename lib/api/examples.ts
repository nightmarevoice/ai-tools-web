/**
 * API 使用示例
 * 这些示例展示了如何使用各个 API 模块
 */

import {
  apiClient,
  authApi,
  appsApi,
  categoriesApi,
  statsApi,
  searchApi,
  queryHistoryApi,
  apiKeysApi,
} from './index'

// ==================== 认证示例 ====================

export async function authExamples() {
  // 1. 用户注册
  const signupResponse = await authApi.signup({
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe',
    user_metadata: {
      company: 'Example Corp',
    },
  })

  // 2. 用户登录
  const signinResponse = await authApi.signin({
    email: 'user@example.com',
    password: 'securePassword123',
  })

  // 3. 设置访问令牌
  apiClient.setAccessToken(signinResponse.session.access_token)

  // 4. 获取当前用户信息
  const user = await authApi.getMe()

  // 5. 更新用户信息
  const updatedUser = await authApi.updateMe({
    name: 'John Smith',
    status: 'active',
  })

  // 6. OTP登录
  await authApi.signinOtp({
    email: 'user@example.com',
  })

  // 7. 登出
  await authApi.signout()

  // 8. 删除用户
  await authApi.deleteMe()
}

// ==================== 应用管理示例 ====================

export async function appsExamples() {
  // 1. 获取应用列表（支持多种筛选和排序）
  const appsList = await appsApi.list({
    page: 1,
    limit: 20,
    lang: 'zh',
    category: 'ai_assistant',
    region: 'US',
    search: 'ChatGPT',
    sort: 'monthly_visits',
    order: 'desc',
  })

  // 2. 获取应用详情
  const app = await appsApi.get(1, 'zh')

  // 3. 按分类查询应用
  const categoryApps = await appsApi.getByCategory('ai_assistant', {
    lang: 'zh',
    page: 1,
    limit: 10,
  })

  // 4. 获取相似应用
  const similarApps = await appsApi.getSimilar(1, {
    lang: 'zh',
    limit: 10,
  })

  // 5. 创建应用
  const newApp = await appsApi.create({
    app_name: 'New AI App',
    url: 'https://example.com',
    official_website: 'https://example.com',
    region: 'US',
    categories: ['ai_assistant', 'productivity'],
    product_description: 'A revolutionary AI application',
    main_features: 'Feature 1, Feature 2, Feature 3',
    monthly_visits: 1000000,
    avg_duration_seconds: 300,
    category_rank: 10,
    bounce_rate: 0.25,
    screenshot_url: 'https://example.com/screenshot.png',
    icon_url: 'https://example.com/icon.png',
    developer_name: 'Example Corp',
    rating: 4.5,
    downloads: 100000,
    price: 9.99,
  })

  // 6. 更新应用
  const updatedApp = await appsApi.update(1, {
    monthly_visits: 2000000000,
    rating: 4.9,
  })

  // 7. 删除应用
  await appsApi.delete(1)
}

// ==================== 类别管理示例 ====================

export async function categoriesExamples() {
  // 1. 获取所有类别
  const categories = await categoriesApi.list('zh')

  // 2. 获取单个类别
  const category = await categoriesApi.get('ai_assistant', 'zh')

  // 3. 获取类别的所有翻译
  const translations = await categoriesApi.getTranslations('ai_assistant')
  // 返回: { id: 'ai_assistant', translations: { en: 'AI Assistant', zh: 'AI助手', ... } }
}

// ==================== 统计分析示例 ====================

export async function statsExamples() {
  // 1. 总体统计
  const overview = await statsApi.getOverview()
  // 返回: { total_apps, total_visits, avg_visits_per_app, ... }

  // 2. 分类统计
  const categoryStats = await statsApi.getByCategory({ top: 10, lang: 'zh' })

  // 3. 地区统计
  const regionStats = await statsApi.getByRegion()

  // 4. 趋势分析
  const trends = await statsApi.getTrends({
    period: 'month',
    limit: 12,
  })

  // 5. 热门应用排行
  const topApps = await statsApi.getTopApps({
    metric: 'visits',
    limit: 10,
  })
}

// ==================== 智能搜索示例 ====================

export async function searchExamples() {
  // 1. 语义搜索
  const searchResults = await searchApi.query({
    user_query: '能够生成图像的AI工具',
    region: '中国',
    enable_llm_summary: true,
    top_k: 10,
  })

  // 2. 健康检查
  const health = await searchApi.health()
}

// ==================== 查询历史示例 ====================

export async function queryHistoryExamples() {
  // 1. 获取我的查询历史
  const myHistory = await queryHistoryApi.getMyHistory({
    page: 1,
    limit: 20,
  })

  // 2. 获取会话历史
  const sessionHistory = await queryHistoryApi.getSession('sess_abc123')

  // 3. 获取最近查询
  const recentQueries = await queryHistoryApi.getRecent({
    page: 1,
    limit: 100,
    status: 'success',
  })

  // 4. 查询分析统计
  const analytics = await queryHistoryApi.getAnalytics({
    days: 7,
    user_id: 1,
  })

  // 5. 热门查询
  const popularQueries = await queryHistoryApi.getPopularQueries({
    days: 7,
    limit: 20,
  })

  // 6. 状态分布
  const statusDist = await queryHistoryApi.getStatusDistribution({
    days: 7,
  })

  // 7. 性能趋势
  const performanceTrends = await queryHistoryApi.getPerformanceTrends({
    days: 30,
  })

  // 8. 获取单个查询详情
  const query = await queryHistoryApi.getQuery(12345)
}

// ==================== API密钥管理示例 ====================

export async function apiKeysExamples() {
  // 1. 创建API密钥
  const apiKey = await apiKeysApi.create({
    scopes: ['apps:read', 'stats:read'],
    description: '生产环境API密钥',
    expires_days: 365,
  })
  // ⚠️ 注意: secret_key 仅在创建时返回一次，请妥善保管！

  // 2. 列出所有API密钥
  const keys = await apiKeysApi.list({ include_deleted: false })

  // 3. 获取API密钥详情
  const keyDetail = await apiKeysApi.get(apiKey.key_id)

  // 4. 更新API密钥
  const updatedKey = await apiKeysApi.update(apiKey.key_id, {
    description: '更新后的描述',
    scopes: ['apps:read', 'apps:write'],
    status: 'active',
  })

  // 5. 撤销API密钥
  await apiKeysApi.revoke(apiKey.key_id)

  // 6. 轮换API密钥（创建新密钥并撤销旧密钥）
  const newKey = await apiKeysApi.rotate(apiKey.key_id)

  // 7. 删除API密钥
  await apiKeysApi.delete(apiKey.key_id)
}

// ==================== 错误处理示例 ====================

export async function errorHandlingExample() {
  try {
    const app = await appsApi.get(99999)
  } catch (error) {
    if (error instanceof Error) {
      if ('status' in error) {
        // ApiError
        console.error('API错误:', error.message)
        console.error('状态码:', (error as any).status)
      } else {
        // 其他错误
        console.error('未知错误:', error)
      }
    }
  }
}

// ==================== 多语言支持示例 ====================

export async function i18nExamples() {
  // 方式1: 通过参数指定语言
  const appsZh = await appsApi.list({ lang: 'zh' })
  const appsEn = await appsApi.list({ lang: 'en' })

  // 方式2: 设置默认语言
  apiClient.setDefaultLanguage('zh')
  const apps = await appsApi.list() // 自动使用中文

  // 方式3: 使用 Accept-Language Header（已在客户端中自动处理）
}

// ==================== API Key 认证示例 ====================

export async function apiKeyAuthExample() {
  // 设置API密钥（用于服务端调用）
  apiClient.setApiKey('ak_1234567890abcdef', 'sk_abcdef1234567890...')

  // 现在所有请求都会使用API Key认证
  const apps = await appsApi.list()
  const stats = await statsApi.getOverview()
}


