'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '@/i18n'

interface LocaleSyncProps {
  currentLocale: string
}

/**
 * 客户端组件：同步 localStorage 中的 preferredLanguage 到 URL
 * 如果 localStorage 中的语言与当前 URL 的语言不匹配，重定向到正确的语言
 */
export function LocaleSync({ currentLocale }: LocaleSyncProps) {
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasRedirected.current) return // 防止重复重定向

    // 从 localStorage 读取 preferredLanguage
    const preferredLanguage = window.localStorage.getItem('preferredLanguage')

    // 如果 localStorage 中有有效的语言设置，且与当前 URL 的语言不匹配
    if (
      preferredLanguage &&
      locales.includes(preferredLanguage as any) &&
      preferredLanguage !== currentLocale
    ) {
      hasRedirected.current = true

      // 同步到 cookie，以便中间件下次能正确识别
      document.cookie = `NEXT_LOCALE=${preferredLanguage}; path=/; max-age=31536000; SameSite=Lax`

      // 构建新的路径：将当前路径中的语言前缀替换为 preferredLanguage
      // 例如：/zh/dashboard -> /en/dashboard
      const pathWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/'
      const newPath = `/${preferredLanguage}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`

      // 如果新路径与当前路径不同，则重定向
      if (newPath !== pathname) {
        router.replace(newPath)
      }
    }
  }, [currentLocale, pathname, router])

  return null
}

