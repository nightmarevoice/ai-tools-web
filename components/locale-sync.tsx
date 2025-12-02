'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { locales } from '@/i18n'

interface LocaleSyncProps {
  currentLocale: string
}

/**
 * 客户端组件：同步 URL 中的语言到 localStorage 和 cookie
 * 优先使用 URL 中的语言，而不是 localStorage 中的语言
 * 这样可以确保直接链接访问时不会跳转到其他语言
 */
export function LocaleSync({ currentLocale }: LocaleSyncProps) {
  const router = useRouter()
  const pathname = usePathname()
  const hasSynced = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasSynced.current) return // 防止重复同步

    // 优先使用 URL 中的语言（currentLocale），更新 localStorage 和 cookie
    // 这样可以确保直接链接访问时（如 /en/tools/6066）不会跳转到其他语言
    if (currentLocale && locales.includes(currentLocale as any)) {
      hasSynced.current = true

      // 从 localStorage 读取 preferredLanguage
      const preferredLanguage = window.localStorage.getItem('preferredLanguage')

      // 如果 URL 中的语言与 localStorage 中的语言不匹配，更新 localStorage 和 cookie
      // 这样可以确保下次访问时使用正确的语言
      if (preferredLanguage !== currentLocale) {
        window.localStorage.setItem('preferredLanguage', currentLocale)
        document.cookie = `NEXT_LOCALE=${currentLocale}; path=/; max-age=31536000; SameSite=Lax`
      } else {
        // 即使语言匹配，也确保 cookie 是最新的
        document.cookie = `NEXT_LOCALE=${currentLocale}; path=/; max-age=31536000; SameSite=Lax`
      }
    }
  }, [currentLocale, pathname, router])

  return null
}

