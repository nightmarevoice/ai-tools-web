/**
 * 查询历史与分析 API
 */

import { apiClient } from './client'
import type {
  QueryHistory,
  QueryHistoryListResponse,
  QueryAnalytics,
  PopularQuery,
  StatusDistribution,
  PerformanceTrend,
  MyHistoryParams,
  RecentQueriesParams,
  AnalyticsParams,
  PopularQueriesParams,
  StatusDistributionParams,
  PerformanceTrendsParams,
} from '@/types/api'

export const queryHistoryApi = {
  /**
   * 获取我的查询历史
   */
  async getMyHistory(params?: MyHistoryParams): Promise<QueryHistoryListResponse> {
    return apiClient.get<QueryHistoryListResponse>(
      '/query-history/my-history',
      params
    )
  },

  /**
   * 获取会话历史
   */
  async getSession(sessionId: string): Promise<QueryHistory[]> {
    return apiClient.get<QueryHistory[]>(`/query-history/session/${sessionId}`)
  },

  /**
   * 获取最近查询
   */
  async getRecent(params?: RecentQueriesParams): Promise<QueryHistoryListResponse> {
    return apiClient.get<QueryHistoryListResponse>(
      '/query-history/recent',
      params
    )
  },

  /**
   * 查询分析统计
   */
  async getAnalytics(params?: AnalyticsParams): Promise<QueryAnalytics> {
    return apiClient.get<QueryAnalytics>('/query-history/analytics', params)
  },

  /**
   * 热门查询
   */
  async getPopularQueries(
    params?: PopularQueriesParams
  ): Promise<PopularQuery[]> {
    return apiClient.get<PopularQuery[]>('/query-history/popular-queries', params)
  },

  /**
   * 状态分布
   */
  async getStatusDistribution(
    params?: StatusDistributionParams
  ): Promise<StatusDistribution[]> {
    return apiClient.get<StatusDistribution[]>(
      '/query-history/status-distribution',
      params
    )
  },

  /**
   * 性能趋势
   */
  async getPerformanceTrends(
    params?: PerformanceTrendsParams
  ): Promise<PerformanceTrend[]> {
    return apiClient.get<PerformanceTrend[]>(
      '/query-history/performance-trends',
      params
    )
  },

  /**
   * 获取单个查询详情
   */
  async getQuery(queryId: number): Promise<QueryHistory> {
    return apiClient.get<QueryHistory>(`/query-history/${queryId}`)
  },
}


