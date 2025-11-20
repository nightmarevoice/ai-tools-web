/**
 * API密钥管理 API
 */

import { apiClient } from './client'
import type {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  ListApiKeysParams,
} from '@/types/api'

export const apiKeysApi = {
  /**
   * 创建API密钥
   */
  async create(data: CreateApiKeyRequest): Promise<ApiKey> {
    return apiClient.post<ApiKey>('/auth/api-keys', data)
  },

  /**
   * 列出API密钥
   */
  async list(params?: ListApiKeysParams): Promise<ApiKey[]> {
    return apiClient.get<ApiKey[]>('/auth/api-keys', params)
  },

  /**
   * 获取API密钥详情
   */
  async get(keyId: string): Promise<ApiKey> {
    return apiClient.get<ApiKey>(`/auth/api-keys/${keyId}`)
  },

  /**
   * 更新API密钥
   */
  async update(keyId: string, data: UpdateApiKeyRequest): Promise<ApiKey> {
    return apiClient.put<ApiKey>(`/auth/api-keys/${keyId}`, data)
  },

  /**
   * 撤销API密钥
   */
  async revoke(keyId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `/auth/api-keys/${keyId}/revoke`
    )
  },

  /**
   * 轮换API密钥
   */
  async rotate(keyId: string): Promise<ApiKey> {
    return apiClient.post<ApiKey>(`/auth/api-keys/${keyId}/rotate`)
  },

  /**
   * 删除API密钥
   */
  async delete(keyId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/auth/api-keys/${keyId}`)
  },
}


