/**
 * 用户认证 API
 */

import { apiClient } from './client'
import { createClient } from '@/lib/supabase/client'
import type {
  User,
  SignupRequest,
  SigninRequest,
  SigninOtpRequest,
  SignupResponse,
  SigninResponse,
  UpdateUserRequest,
} from '@/types/api'

export const authApi = {
  /**
   * 用户注册
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return apiClient.post<SignupResponse>('/auth/signup', data)
  },

  /**
   * 用户登录（密码）
   */
  async signin(data: SigninRequest): Promise<SigninResponse> {
    return apiClient.post<SigninResponse>('/auth/signin', data)
  },

  /**
   * 用户登录（魔法链接/OTP）
   */
  async signinOtp(data: SigninOtpRequest): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/signin/otp', data)
  },

  /**
   * 用户登出
   */
  async signout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/signout')
  },

  /**
   * 获取当前用户信息
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  },

  /**
   * 更新当前用户信息
   */
  async updateMe(data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>('/auth/me', data)
  },

  /**
   * 删除当前用户
   */
  async deleteMe(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/auth/me')
  },

  /**
   * 获取用户信息（管理员）
   */
  async getUser(userId: number): Promise<User> {
    return apiClient.get<User>(`/auth/users/${userId}`)
  },

  /**
   * Google OAuth 登录
   * 使用 Supabase 的 Google OAuth 提供商
   * ⚠️ 注意：此方法只能在客户端环境中调用（使用了 window.location）
   *
   * @param locale 可选的语言代码（如 'en', 'zh'），用于构建正确的回调 URL
   * @returns Promise<{ url: string }> OAuth 重定向 URL
   */
  async signInWithGoogle(locale?: string): Promise<{ url: string }> {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      throw new Error(
        'signInWithGoogle() 只能在客户端环境中调用。请确保在 "use client" 组件中使用。'
      )
    }

    // 构建回调 URL：如果提供了 locale，使用带 locale 前缀的路径
    const callbackPath = locale ? `/${locale}/auth/callback` : '/auth/callback'
    const redirectTo = `${window.location.origin}${callbackPath}`

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        throw new Error(`Google OAuth 失败: ${error.message}`)
      }

      if (!data.url) {
        throw new Error('未获取到 OAuth URL')
      }

      return { url: data.url }
    } catch (error) {
      // 如果是环境变量配置错误，提供更清晰的提示
      if (error instanceof Error && error.message.includes('required')) {
        throw new Error(
          `Supabase 环境变量未配置。请检查 .env.local 文件中的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY。\n\n` +
            `详细配置说明请查看: ENV_SETUP.md`
        )
      }
      throw error
    }
  },

  /**
   * 同步 Google 用户到后端
   * 在 OAuth 回调后调用,使用 Supabase token 获取后端用户信息
   * 后端会自动创建本地用户记录(如果不存在)
   *
   * @param accessToken Supabase access token
   * @returns Promise<User> 用户信息
   */
  async syncGoogleUser(accessToken: string): Promise<User> {
    // 设置 token 到 API 客户端
    apiClient.setAccessToken(accessToken)

    // 调用现有的 GET /auth/me 接口
    // 后端会验证 Supabase token 并自动创建/获取本地用户
    return this.getMe()
  },
}


