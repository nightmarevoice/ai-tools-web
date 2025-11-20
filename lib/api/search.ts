/**
 * 智能搜索 API
 */

import { apiClient } from "./client"
import type {
  SemanticSearchRequest,
  SemanticSearchResponse,
  SearchHealth,
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





