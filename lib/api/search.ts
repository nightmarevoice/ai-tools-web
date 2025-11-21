/**
 * 智能搜索 API
 */

import { apiClient } from "./client"
import type {
  SemanticSearchRequest,
  SemanticSearchResponse,
  SearchHealth,
  QuotaStatus,
} from "@/types/api"

function getVisitorId(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const value = window.localStorage.getItem("user_unique_key")
    return value ?? undefined
  } catch {
    return undefined
  }
}

export const searchApi = {
  /**
   * 检查搜索配额状态（不消耗次数）
   */
  async checkQuota(): Promise<QuotaStatus> {
    const visitorId = getVisitorId()
    const params: Record<string, string> = {}

    if (visitorId) {
      params.visitor_id = visitorId
    }

    return apiClient.get<QuotaStatus>(
      "/app-search/quota-status",
      params,
    )
  },

  /**
   * 语义搜索
   */
  async query(data: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    const visitorId = getVisitorId()
    return apiClient.post<SemanticSearchResponse>(
      "/app-search/query",
      data,
      visitorId ? { visitorId } : undefined,
    )
  },

  /**
   * 搜索服务健康检查
   */
  async health(): Promise<SearchHealth> {
    return apiClient.get<SearchHealth>("/app-search/health")
  },
}





