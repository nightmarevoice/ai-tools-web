/**
 * 统计分析 API
 */

import { apiClient } from './client'
import type {
  OverviewStats,
  CategoryStatsResponse,
  RegionStatsResponse,
  TrendsResponse,
  TopAppsResponse,
  TrendingAppsResponse,
  CategoryStatsParams,
  TrendsParams,
  TopAppsParams,
  TrendingAppsParams,
  FeaturedByCategoryResponse,
  FeaturedByCategoryParams,
} from '@/types/api'

export const statsApi = {
  /**
   * 总体统计
   */
  async getOverview(): Promise<OverviewStats> {
    return apiClient.get<OverviewStats>('/stats/overview')
  },

  /**
   * 分类统计
   */
  async getByCategory(params?: CategoryStatsParams): Promise<CategoryStatsResponse> {
    return apiClient.get<CategoryStatsResponse>('/stats/by-category', params)
  },

  /**
   * 地区统计
   */
  async getByRegion(): Promise<RegionStatsResponse> {
    return apiClient.get<RegionStatsResponse>('/stats/by-region')
  },

  /**
   * 趋势分析
   */
  async getTrends(params?: TrendsParams): Promise<TrendsResponse> {
    return apiClient.get<TrendsResponse>('/stats/trends', params)
  },

  /**
   * 热门应用排行
   */
  async getTopApps(params?: TopAppsParams): Promise<TopAppsResponse> {
    return apiClient.get<TopAppsResponse>('/stats/top-apps', params)
  },

  /**
   * 增长趋势应用（最近访问量增长较快的应用）
   */
  async getTrendingApps(params?: TrendingAppsParams): Promise<TrendingAppsResponse> {
    return apiClient.get<TrendingAppsResponse>('/stats/trending-apps', params)
  },

  /**
   * 按分类获取精选应用
   */
  async getFeaturedByCategory(params?: FeaturedByCategoryParams): Promise<FeaturedByCategoryResponse> {
    return apiClient.get<FeaturedByCategoryResponse>('/stats/featured-by-category', params)
  },
}


