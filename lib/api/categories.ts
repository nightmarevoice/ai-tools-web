/**
 * 类别管理 API
 */

import { apiClient } from './client'
import type {
  Category,
  CategoriesResponse,
  CategoryTranslations,
} from '@/types/api'

export const categoriesApi = {
  /**
   * 获取所有类别
   */
  async list(lang?: string): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>('/categories', lang ? { lang } : undefined)
  },

  /**
   * 获取单个类别
   */
  async get(categoryId: string, lang?: string): Promise<Category> {
    return apiClient.get<Category>(
      `/categories/${categoryId}`,
      lang ? { lang } : undefined
    )
  },

  /**
   * 获取类别的所有翻译
   */
  async getTranslations(categoryId: string): Promise<CategoryTranslations> {
    return apiClient.get<CategoryTranslations>(
      `/categories/${categoryId}/translations`
    )
  },
}


