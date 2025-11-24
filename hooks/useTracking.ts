/**
 * React Hook for tracking events
 */

import { useCallback, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  trackPageView,
  trackEvent,
  trackUserAction,
  trackSearch,
  trackToolInteraction,
  trackNavigation,
  trackAuth,
  trackError,
  trackDownload,
  trackShare,
  type TrackingEvent,
  type EventAction,
} from '@/lib/analytics/tracking'

/**
 * 页面访问追踪 Hook
 * 自动追踪页面变化
 */
export function usePageTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 追踪页面访问
    trackPageView({
      path: pathname,
      searchParams: searchParams.toString(),
    })
  }, [pathname, searchParams])
}

/**
 * 通用事件追踪 Hook
 */
export function useTracking() {
  const track = useCallback((event: TrackingEvent) => {
    trackEvent(event)
  }, [])

  const trackAction = useCallback((action: EventAction, options?: Record<string, any>) => {
    trackUserAction(action, options)
  }, [])

  const trackSearchEvent = useCallback((query: string, options?: Record<string, any>) => {
    trackSearch(query, options)
  }, [])

  const trackTool = useCallback(
    (
      toolId: number | string,
      toolName: string,
      action: 'view' | 'click' | 'visit_website' | 'view_alternatives',
      options?: Record<string, any>
    ) => {
      trackToolInteraction(toolId, toolName, action, options)
    },
    []
  )

  const trackNav = useCallback((to: string, from?: string) => {
    trackNavigation(to, from)
  }, [])

  const trackAuthEvent = useCallback((action: 'login' | 'logout' | 'signup', method?: string) => {
    trackAuth(action, method)
  }, [])

  const trackErrorEvent = useCallback((error: Error | string, context?: Record<string, any>) => {
    trackError(error, context)
  }, [])

  const trackDownloadEvent = useCallback((fileName: string, fileType?: string) => {
    trackDownload(fileName, fileType)
  }, [])

  const trackShareEvent = useCallback((platform: string, content?: string) => {
    trackShare(platform, content)
  }, [])

  return {
    track,
    trackAction,
    trackSearch: trackSearchEvent,
    trackTool,
    trackNav,
    trackAuth: trackAuthEvent,
    trackError: trackErrorEvent,
    trackDownload: trackDownloadEvent,
    trackShare: trackShareEvent,
  }
}

