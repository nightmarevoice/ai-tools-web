/**
 * 用户认证状态管理 Hook
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/types/api'
import { getAccessToken, getUser, setAccessToken, setUser, clearAuth, isAuthenticated as checkAuth } from '@/lib/auth/storage'
import { apiClient } from '@/lib/api/client'
import { authApi } from '@/lib/api'
import { authEventManager } from '@/lib/auth/auth-events'
import { toast } from 'sonner'
import { trackAuth } from '@/lib/analytics/tracking'

export function useAuth() {
  const [user, setUserState] = useState<User | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 初始化：从 localStorage 读取数据
  useEffect(() => {
    const loadAuth = () => {
      const token = getAccessToken()
      const userData = getUser<User>()

      if (token && userData) {
        setAccessTokenState(token)
        setUserState(userData)
        // 同步设置到 apiClient
        apiClient.setAccessToken(token)
      } else {
        setAccessTokenState(null)
        setUserState(null)
        apiClient.setAccessToken(null)
      }
    }

    // 初始加载
    loadAuth()
    setLoading(false)

    // 监听 localStorage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_access_token' || e.key === 'auth_user') {
        loadAuth()
      }
    }

    // 监听认证事件（如 429 错误导致的强制登出）
    const unsubscribe = authEventManager.subscribe((event, data) => {
      if (event === 'RATE_LIMIT_EXCEEDED') {
        // 清除状态
        setAccessTokenState(null)
        setUserState(null)
        apiClient.setAccessToken(null)
        // 显示提示消息（弹窗由 LoginPromptProvider 处理）
        toast.error(data?.message || '请求频率超限，请登录账号')
      }
    })

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      unsubscribe()
    }
  }, [])

  // 登录：存储 token 和 user
  const login = useCallback((token: string, userData: User, method?: string) => {
    setAccessToken(token)
    setUser(userData)
    setAccessTokenState(token)
    setUserState(userData)
    // 同步设置到 apiClient
    apiClient.setAccessToken(token)
    // 追踪登录事件
    trackAuth('login', method)
  }, [])

  // 登出：清除所有数据
  const logout = useCallback(async () => {
    try {
      // 调用后端登出接口
      await authApi.signout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 无论后端是否成功，都清除本地数据
      clearAuth()
      setAccessTokenState(null)
      setUserState(null)
      apiClient.setAccessToken(null)
      // 追踪登出事件
      trackAuth('logout')
    }
  }, [])

  // 更新用户信息
  const updateUser = useCallback((userData: User) => {
    setUser(userData)
    setUserState(userData)
  }, [])

  return {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    loading,
    login,
    logout,
    updateUser,
  }
}

