/**
 * API客户端基础类
 * 处理认证、请求拦截、错误处理等
 */

import type { ApiError as ApiErrorResponse } from '@/types/api'
import { authEventManager } from '@/lib/auth/auth-events'
import { clearAuth } from '@/lib/auth/storage'

export interface ApiClientConfig {
  baseURL?: string
  accessToken?: string | null
  apiKey?: string | null
  apiSecret?: string | null
  defaultLanguage?: string
}

export class ApiClient {
  private baseURL: string
  private accessToken: string | null = null
  private apiKey: string | null = null
  private apiSecret: string | null = null
  private defaultLanguage: string = 'en'

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || 'http://172.16.3.94:8005'
    this.accessToken = config.accessToken || null
    this.apiKey = config.apiKey || null
    this.apiSecret = config.apiSecret || null
    this.defaultLanguage = config.defaultLanguage || 'en'
  }

  /**
   * 设置访问令牌（Bearer Token）
   */
  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  /**
   * 设置API密钥（API Key认证）
   */
  setApiKey(key: string | null, secret: string | null) {
    this.apiKey = key
    this.apiSecret = secret
  }

  /**
   * 设置默认语言
   */
  setDefaultLanguage(lang: string) {
    this.defaultLanguage = lang
  }

  /**
   * 构建请求头
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    }

    // Bearer Token认证
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    // API Key认证
    if (this.apiKey && this.apiSecret) {
      headers['X-API-Key'] = this.apiKey
      headers['X-API-Secret'] = this.apiSecret
    }

    // 默认语言
    if (this.defaultLanguage) {
      headers['Accept-Language'] = this.defaultLanguage
    }

    return headers
  }

  /**
   * 构建查询参数
   */
  private buildQueryParams(params?: Record<string, any>): string {
    if (!params) return ''

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)))
        } else {
          searchParams.set(key, String(value))
        }
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * 处理错误响应
   */
  private async handleError(response: Response): Promise<never> {
    let error: ApiErrorResponse

    try {
      error = await response.json()
    } catch {
      error = {
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    // 处理 429 错误（请求频率超限）
    if (response.status === 429) {
      // 清除本地认证信息
      if (typeof window !== 'undefined') {
        clearAuth()
        this.setAccessToken(null)
      }
      
      // 触发全局登出事件
      authEventManager.emit('RATE_LIMIT_EXCEEDED', {
        message: '请求频率超限，请登录账号',
        status: 429
      })
      
      throw new ApiError(
        '请求频率超限，请登录账号',
        response.status,
        error
      )
    }

    throw new ApiError(
      typeof error.detail === 'string' ? error.detail : '请求失败',
      response.status,
      error
    )
  }

  /**
   * 发送GET请求（带超时处理）
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}${this.buildQueryParams(params)}`
    
    try {
      // 创建带超时的 fetch 请求（30秒超时）
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(headers),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        await this.handleError(response)
      }

      return response.json()
    } catch (error) {
      // 处理超时或网络错误
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(
            '请求超时，请稍后重试',
            408,
            { detail: 'Request timeout after 30 seconds' }
          )
        }
        if (error.message.includes('fetch')) {
          throw new ApiError(
            `无法连接到服务器: ${this.baseURL}`,
            0,
            { detail: error.message }
          )
        }
      }
      throw error
    }
  }

  /**
   * 发送POST请求
   */
  async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    return response.json()
  }

  /**
   * 发送PUT请求
   */
  async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.buildHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    return response.json()
  }

  /**
   * 发送DELETE请求
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.buildHeaders(headers),
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    return response.json()
  }
}

/**
 * 自定义API错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 创建默认API客户端实例
 */
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.16.3.94:8005',
})

// 在客户端环境中，从 localStorage 读取 token 并设置
if (typeof window !== 'undefined') {
  try {
    const token = localStorage.getItem('auth_access_token')
    if (token) {
      apiClient.setAccessToken(token)
    }
  } catch (error) {
    // localStorage 可能不可用（如隐私模式），忽略错误
    console.warn('无法读取 localStorage:', error)
  }
}


