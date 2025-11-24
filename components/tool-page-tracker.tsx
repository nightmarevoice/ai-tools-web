'use client'

import { useEffect } from 'react'
import { useTracking } from '@/hooks/useTracking'

interface ToolPageTrackerProps {
  toolId: number | string
  toolName: string
  locale?: string
}

/**
 * 工具详情页追踪组件
 * 自动追踪工具页面的查看
 */
export function ToolPageTracker({ toolId, toolName, locale }: ToolPageTrackerProps) {
  const { trackTool } = useTracking()

  useEffect(() => {
    // 追踪工具详情页查看
    trackTool(toolId, toolName, 'view', {
      locale,
      timestamp: new Date().toISOString(),
    })
  }, [toolId, toolName, locale, trackTool])

  return null
}

