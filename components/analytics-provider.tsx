'use client'

import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { initAnalytics } from '@/lib/analytics/tracking'

/**
 * Analytics Provider 组件
 * 集成 Vercel Analytics 和初始化埋点系统
 */
export function AnalyticsProvider() {
  useEffect(() => {
    // 初始化埋点系统
    initAnalytics()
  }, [])

  return <Analytics />
}

