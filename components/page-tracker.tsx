'use client'

import { usePageTracking } from '@/hooks/useTracking'

/**
 * 页面访问追踪组件
 * 自动追踪页面变化
 */
export function PageTracker() {
  usePageTracking()
  return null
}

