/**
 * 应用管理 API
 */

import { apiClient } from './client'
import type {
  Application,
  ListAppsParams,
  ListResponse,
  CreateAppRequest,
  UpdateAppRequest,
  SimilarApplicationsResponse,
} from '@/types/api'

export const appsApi = {
  /**
   * 查询应用列表
   */
  async list(params?: ListAppsParams): Promise<ListResponse<Application>> {
    return apiClient.get<ListResponse<Application>>('/apps', params)
  },

  /**
   * 获取应用详情
   */
  async get(appId: number, lang?: string): Promise<Application> {
    return apiClient.get<Application>(`/apps/${appId}`, lang ? { lang } : undefined)
  },

  /**
   * 按分类查询应用
   */
  async getByCategory(
    category: string,
    params?: { lang?: string; page?: number; limit?: number }
  ): Promise<ListResponse<Application>> {
    return apiClient.get<ListResponse<Application>>(
      `/apps/category/${category}`,
      params
    )
  },

  /**
   * 创建应用
   */
  async create(data: CreateAppRequest): Promise<Application> {
    return apiClient.post<Application>('/apps', data)
  },

  /**
   * 更新应用
   */
  async update(appId: number, data: UpdateAppRequest): Promise<Application> {
    return apiClient.put<Application>(`/apps/${appId}`, data)
  },

  /**
   * 删除应用
   */
  async delete(appId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/apps/${appId}`)
  },

  /**
   * 获取相似应用
   */
  async getSimilar(
    appId: number,
    params?: { lang?: string; limit?: number }
  ): Promise<SimilarApplicationsResponse> {
    return apiClient.get<SimilarApplicationsResponse>(
      `/apps/${appId}/similar`,
      params
    )
  },
}


