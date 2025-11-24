/**
 * AI应用管理平台 API 类型定义
 * 版本: 1.2.0
 * 基础URL: http://localhost:8000
 */

// ==================== 通用类型 ====================

export type Language = 'en' | 'zh' | 'zh-TW' | 'ja' | 'ko'

export type SortField = 'created_at' | 'monthly_visits' | 'app_name'

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sort?: SortField
  order?: SortOrder
}

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiError {
  detail: string | Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

// ==================== 用户认证 ====================

export interface User {
  id: number
  supabase_id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_login_at?: string | null
}

export interface Session {
  access_token: string
  token_type: 'bearer'
  expires_in: number
  refresh_token: string
}

export interface SignupRequest {
  email: string
  password: string
  name?: string
  user_metadata?: Record<string, any>
}

export interface SigninRequest {
  email: string
  password: string
}

export interface SigninOtpRequest {
  email: string
}

export interface SignupResponse {
  user: User
  session: Session
  message: string
}

export interface SigninResponse extends SignupResponse {}

export interface UpdateUserRequest {
  name?: string
  status?: 'active' | 'inactive' | 'suspended'
}

// ==================== API密钥管理 ====================

export type ApiKeyScope =
  | 'apps:read'
  | 'apps:write'
  | 'stats:read'
  | 'query_history:read'
  | 'api_keys:read'
  | 'api_keys:write'

export interface ApiKey {
  id: number
  user_id: number
  key_id: string
  secret_key?: string // 仅在创建时返回
  scopes: ApiKeyScope[]
  status: 'active' | 'revoked' | 'expired'
  description?: string
  created_at: string
  last_used_at?: string | null
  expires_at?: string
  is_active: boolean
}

export interface CreateApiKeyRequest {
  scopes: ApiKeyScope[]
  description?: string
  expires_days?: number // 1-3650
}

export interface UpdateApiKeyRequest {
  description?: string
  scopes?: ApiKeyScope[]
  status?: 'active' | 'revoked'
}

export interface ListApiKeysParams {
  include_deleted?: boolean
}

// ==================== 应用管理 ====================

export interface Application {
  // 基础信息
  id: number
  app_name: string
  url: string
  official_website?: string
  region: string
  short_description?:string;
  // 描述信息
  categories: string[]
  product_description?: string
  main_features?: string

  // 统计数据
  monthly_visits?: number
  avg_duration_seconds?: number
  category_rank?: number
  bounce_rate?: number

  // 趋势和分布
  trend_data?: Record<string, number>
  geographic_distribution?: Record<string, number>

  // 媒体资源
  screenshot_url?: string
  icon_url?: string

  // 开发者信息
  developer_name?: string
  rating?: number
  downloads?: number
  price?: number

  // 元数据
  scrape_time?: string
  created_at: string
  updated_at: string
  is_deleted?: boolean

  // 多语言支持
  language?: string
}

export interface SimilarApplication {
  id: number
  app_name: string
  product_description: string
  icon_url?: string
  categories: string[]
  monthly_visits: number
  similarity_score: number
}

export interface SimilarApplicationsResponse {
  total: number
  items: SimilarApplication[]
}

export interface ListAppsParams extends PaginationParams, SortParams {
  lang?: Language
  category?: string
  region?: string
  search?: string
}

export interface CreateAppRequest {
  app_name: string
  url: string
  official_website?: string
  region: string
  categories: string[]
  product_description?: string
  main_features?: string
  monthly_visits?: number
  avg_duration_seconds?: number
  category_rank?: number
  bounce_rate?: number
  screenshot_url?: string
  icon_url?: string
  developer_name?: string
  rating?: number
  downloads?: number
  price?: number
}

export interface UpdateAppRequest extends Partial<CreateAppRequest> {}

// ==================== 类别管理 ====================

export interface Category {
  id: string
  name: string
  description?: string
  language?: string
}

export interface CategoriesResponse {
  categories: Category[]
  total: number
  language: string
}

export interface CategoryTranslations {
  id: string
  translations: Record<string, string>
}

// ==================== 统计分析 ====================

export interface OverviewStats {
  total_apps: number
  total_visits: number
  avg_visits_per_app: number
  total_categories: number
  active_regions: number
  last_updated: string
}

export interface CategoryStatsResponse extends Array<{
  category: string
  category_name: string
  app_count: number
  total_visits: number
  avg_rating?: number | null
}> {}

export type CategoryStats = CategoryStatsResponse[number]


export interface RegionStats {
  region: string
  app_count: number
  total_visits: number
  avg_visits: number
}

export interface RegionStatsResponse {
  regions: RegionStats[]
  total_regions: number
}

export type TrendPeriod = 'day' | 'week' | 'month'

export interface TrendData {
  period: string
  total_apps: number
  new_apps: number
  total_visits: number
  avg_visits_per_app: number
}

export interface TrendsResponse {
  trends: TrendData[]
  period: TrendPeriod
  count: number
}

export type TopAppsMetric = 'visits' | 'duration' | 'rating'

export interface TopApp {
  id: number
  app_name: string
  icon_url: string
  monthly_visits: number
  avg_duration_seconds: number
  rating: number
  rank: number
  categories?:string
  short_description?:string
  screenshot_url?:string
}

export interface TopAppsResponse {
  apps: TopApp[]
  metric: TopAppsMetric
  total: number
}

export interface CategoryStatsParams {
  top?: number
  lang?: Language
}

export interface TrendsParams {
  period?: TrendPeriod
  limit?: number
}

export interface TopAppsParams {
  metric?: TopAppsMetric
  limit?: number
  lang?: Language
}

// ==================== 增长趋势应用 ====================

export interface TrendingAppCategory {
  category_key: string
  translations: Record<string, string>
}

export interface TrendingApp {
  id: number
  app_name: string
  url: string
  icon_url: string
  categories: TrendingAppCategory[]
  region: string
  short_description?: string
  monthly_visits: number
  rating?: number | null
  growth_rate: number
  trend_data?: Record<string, number>
  screenshot_url?:string
}

export interface TrendingAppsResponse {
  apps: TrendingApp[]
  total: number
}

export interface TrendingAppsParams {
  category?: string
  limit?: number
  lang?: Language
}

// ==================== 智能搜索 ====================

export interface SemanticSearchRequest {
  user_query: string
  region?: string
  enable_llm_summary?: boolean
  top_k?: number
  lang?: Language
}

export interface SearchResult {
  id: number
  app_name: string
  product_description: string
  relevance_score: number
  url: string
  icon_url?: string
}

export interface SemanticSearchResponse {
  results: SearchResult[]
  total: number
  query: string
  llm_summary?: string
}

export interface SearchHealth {
  status: 'healthy' | 'unhealthy'
  vespa_connected: boolean
  embedding_service: 'available' | 'unavailable'
  timestamp: string
}

// ==================== 查询历史与分析 ====================

export type QueryStatus = 'success' | 'error' | 'degraded'

export interface QueryHistory {
  id: number
  user_id: number
  session_id: string
  user_query: string
  parsed_query: string
  result_count: number
  top_result_id?: number
  latency_ms: number
  status: QueryStatus
  llm_summary_enabled: boolean
  llm_summary_tokens?: number
  created_at: string
}

export interface QueryHistoryListResponse extends ListResponse<QueryHistory> {}

export interface QueryAnalytics {
  total_queries: number
  successful_queries: number
  failed_queries: number
  avg_latency_ms: number
  avg_result_count: number
  total_llm_tokens: number
  success_rate: number
  period_days: number
}

export interface PopularQuery {
  user_query: string
  query_count: number
  avg_result_count: number
  avg_latency_ms: number
}

export interface StatusDistribution {
  status: QueryStatus
  count: number
  percentage: number
}

export interface PerformanceTrend {
  date: string
  query_count: number
  avg_latency_ms: number
  avg_result_count: number
}

export interface MyHistoryParams extends PaginationParams {}

export interface RecentQueriesParams extends PaginationParams {
  status?: QueryStatus
}

export interface AnalyticsParams {
  days?: number // 1-365
  user_id?: number
}

export interface PopularQueriesParams {
  days?: number // 1-365
  limit?: number // 1-100
}

export interface StatusDistributionParams {
  days?: number // 1-365
}

export interface PerformanceTrendsParams {
  days?: number // 1-365
}


export interface PerformanceTrendsParams {
  days?: number // 1-365
}

// ==================== 配额管理 ====================

export interface QuotaStatus {
  allowed: boolean          // 是否允许下次搜索
  remaining: number          // 剩余搜索次数
  need_login: boolean        // 是否需要登录
  current_count: number      // 当前已使用次数
  is_authenticated: boolean  // 用户是否已认证
  limit: number              // 该用户类型的总限制次数
  quota_exceeded: boolean    // 是否已超过配额
  quota_enabled: boolean     // 配额功能是否启用
}


