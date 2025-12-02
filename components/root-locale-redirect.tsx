'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { locales } from '@/i18n'

/**
 * 客户端组件：处理根路径的语言重定向
 * 当用户访问根路径 / 时，检查 localStorage 和 cookie 中的语言设置
 * 如果用户之前选择过语言，重定向到对应的语言路径
 */
export function RootLocaleRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // 检查 localStorage 中的 preferredLanguage
      const preferredLanguage = window.localStorage.getItem('preferredLanguage')
      
      // 如果 localStorage 中有有效的语言设置，使用它
      if (preferredLanguage && locales.includes(preferredLanguage as any)) {
        // 设置 cookie，以便 middleware 能够读取
        document.cookie = `NEXT_LOCALE=${preferredLanguage}; path=/; max-age=31536000; SameSite=Lax`
        // 立即重定向到对应的语言路径
        router.replace(`/${preferredLanguage}`)
        return
      }
      
      // 如果没有 localStorage，检查 cookie
      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()
        if (cookie.startsWith('NEXT_LOCALE=')) {
          const cookieLocale = cookie.substring('NEXT_LOCALE='.length)
          if (locales.includes(cookieLocale as any)) {
            router.replace(`/${cookieLocale}`)
            return
          }
        }
      }
      
      // 如果都没有，让 middleware 处理（会重定向到默认语言）
    } catch (e) {
      // localStorage 或 cookie 可能不可用，忽略错误，让 middleware 处理
    }
  }, [router])

  return null
}

