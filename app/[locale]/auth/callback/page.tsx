'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { authApi } from '@/lib/api'
import { setAccessToken, setUser } from '@/lib/auth/storage'

/**
 * OAuth 回调页面
 * 处理 Google OAuth 登录后的回调
 */
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary/20" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-900">正在加载...</p>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()

        // 从 URL 中获取 code 和 state 参数（如果有）
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // 如果 URL 中有错误参数，直接跳转到登录页
        if (error) {
          console.error('OAuth 错误:', error, errorDescription)
          router.push(`/${locale}/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        // 如果有 code 参数，说明是 OAuth 回调
        // Supabase 客户端会自动处理，但我们也可以显式等待
        if (code) {
          // 等待 Supabase 处理 OAuth 回调
          // getSession() 会自动交换 code 获取 session
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError) {
            console.error('获取 session 失败:', sessionError)
            setErrorMessage(sessionError.message)
            setTimeout(() => {
              router.push(`/${locale}/login?error=session_failed`)
            }, 2000)
            return
          }

          if (!session) {
            // 如果还没有 session，等待一下再试（可能还在处理中）
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const {
              data: { session: retrySession },
              error: retryError,
            } = await supabase.auth.getSession()

            if (retryError || !retrySession) {
              console.error('未获取到 session')
              setErrorMessage('未获取到登录会话，请重试')
              setTimeout(() => {
                router.push(`/${locale}/login?error=no_session`)
              }, 2000)
              return
            }

            // 使用重试获取的 session
            await processSession(retrySession)
            return
          }

          // 成功获取 session
          await processSession(session)
        } else {
          // 没有 code 参数，可能是直接访问或已经处理过
          // 尝试获取现有 session
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError || !session) {
            console.error('未找到有效的 session')
            setErrorMessage('未找到有效的登录会话')
            setTimeout(() => {
              router.push(`/${locale}/login?error=no_session`)
            }, 2000)
            return
          }

          await processSession(session)
        }
      } catch (error) {
        console.error('OAuth 回调处理失败:', error)
        const message = error instanceof Error ? error.message : '未知错误'
        setErrorMessage(message)
        setTimeout(() => {
          router.push(`/${locale}/login?error=sync_failed&message=${encodeURIComponent(message)}`)
        }, 2000)
      }
    }

    const processSession = async (session: any) => {
      try {
        console.log('Google OAuth 成功,access_token:', session.access_token.substring(0, 20) + '...')

        // 同步用户到后端(调用 GET /auth/me)
        // 后端会验证 Supabase token 并自动创建本地用户
        const user = await authApi.syncGoogleUser(session.access_token)

        console.log('用户同步成功:', user)

        // 存储到浏览器 localStorage
        setAccessToken(session.access_token)
        setUser(user)

        // 跳转到首页（带 locale 前缀）
        router.push(`/${locale}`)
      } catch (error) {
        console.error('处理 session 失败:', error)
        throw error
      }
    }

    handleCallback()
  }, [router, searchParams, locale])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center space-y-4">
        {errorMessage ? (
          <div className="space-y-2">
            <div className="text-red-500 text-xl">⚠️</div>
            <p className="text-lg font-medium text-red-600">登录失败</p>
            <p className="text-sm text-slate-600">{errorMessage}</p>
            <p className="text-xs text-slate-500">正在跳转到登录页面...</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary/20" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-900">正在完成 Google 登录</p>
              <p className="text-sm text-slate-500">请稍候,正在同步您的账户信息...</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}



