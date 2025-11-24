/**
 * 埋点追踪工具库
 * 支持多种分析平台：Vercel Analytics、自定义事件追踪
 */

// 事件类型定义
export type EventCategory =
  | 'page_view'
  | 'user_action'
  | 'search'
  | 'tool_interaction'
  | 'navigation'
  | 'authentication'
  | 'download'
  | 'share'
  | 'error'

export type EventAction =
  | 'view'
  | 'click'
  | 'search'
  | 'filter'
  | 'sort'
  | 'download'
  | 'share'
  | 'login'
  | 'logout'
  | 'signup'
  | 'view_tool'
  | 'visit_website'
  | 'view_alternatives'
  | 'change_language'
  | 'change_theme'
  | 'upload_file'
  | 'submit_form'
  | 'error_occurred'

export interface TrackingEvent {
  category: EventCategory
  action: EventAction
  label?: string
  value?: number
  [key: string]: any // 允许额外的自定义属性
}

// 页面访问追踪
export interface PageViewEvent {
  path: string
  title?: string
  locale?: string
  referrer?: string
  [key: string]: any
}

// 用户行为追踪
export interface UserActionEvent {
  action: EventAction
  element?: string
  elementId?: string
  elementText?: string
  category?: string
  [key: string]: any
}

// 搜索事件
export interface SearchEvent {
  query: string
  resultsCount?: number
  filters?: Record<string, any>
  [key: string]: any
}

// 工具交互事件
export interface ToolInteractionEvent {
  toolId: number | string
  toolName: string
  action: 'view' | 'click' | 'visit_website' | 'view_alternatives'
  [key: string]: any
}

/**
 * 检查是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 获取用户唯一标识
 */
function getUserIdentifier(): string {
  if (!isBrowser()) return 'unknown'
  
  const storageKey = 'user_unique_key'
  const existingKey = localStorage.getItem(storageKey)
  
  if (existingKey) {
    return existingKey
  }
  
  // 如果不存在，生成一个临时标识
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  return tempId
}

/**
 * 获取当前页面信息
 */
function getPageInfo(): {
  path: string
  title: string
  referrer: string
  locale?: string
} {
  if (!isBrowser()) {
    return {
      path: '/',
      title: '',
      referrer: '',
    }
  }

  return {
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    locale: document.documentElement.lang || undefined,
  }
}

/**
 * 发送事件到 Vercel Analytics
 */
function trackVercelEvent(event: TrackingEvent): void {
  if (!isBrowser()) return

  try {
    // Vercel Analytics 会自动追踪页面访问
    // 对于自定义事件，我们使用 track 方法
    if (typeof window !== 'undefined' && (window as any).va) {
      const { category, action, ...rest } = event
      ;(window as any).va('track', action, {
        category,
        label: event.label,
        value: event.value,
        ...rest,
      })
    }
  } catch (error) {
    console.warn('Failed to track event with Vercel Analytics:', error)
  }
}

/**
 * 发送事件到自定义分析端点（可选）
 */
async function trackCustomEvent(event: TrackingEvent): Promise<void> {
  if (!isBrowser()) return

  const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT

  if (!analyticsEndpoint) {
    // 如果没有配置端点，只使用 Vercel Analytics
    return
  }

  try {
    const userIdentifier = getUserIdentifier()
    const pageInfo = getPageInfo()

    await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        userIdentifier,
        pageInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      }),
    })
  } catch (error) {
    // 静默失败，不影响用户体验
    console.warn('Failed to send analytics event:', error)
  }
}

/**
 * 追踪页面访问
 */
export function trackPageView(event?: Partial<PageViewEvent>): void {
  if (!isBrowser()) return

  const pageInfo = getPageInfo()
  const pageViewEvent: PageViewEvent = {
    path: event?.path || pageInfo.path,
    title: event?.title || pageInfo.title,
    locale: event?.locale || pageInfo.locale,
    referrer: event?.referrer || pageInfo.referrer,
    ...event,
  }

  // Vercel Analytics 会自动追踪页面访问
  // 这里可以添加额外的自定义追踪逻辑
  trackCustomEvent({
    category: 'page_view' as EventCategory,
    action: 'view',
    ...pageViewEvent,
  })
}

/**
 * 追踪用户行为事件
 */
export function trackEvent(event: TrackingEvent): void {
  if (!isBrowser()) return

  // 发送到 Vercel Analytics
  trackVercelEvent(event)

  // 发送到自定义端点（如果配置了）
  trackCustomEvent(event)
}

/**
 * 追踪用户操作
 */
export function trackUserAction(action: EventAction, options?: Partial<UserActionEvent>): void {
  const { category, ...restOptions } = options || {}
  trackEvent({
    category: 'user_action' as EventCategory,
    action,
    ...restOptions,
  })
}

/**
 * 追踪搜索事件
 */
export function trackSearch(query: string, options?: Partial<SearchEvent>): void {
  trackEvent({
    category: 'search',
    action: 'search',
    label: query,
    query,
    ...options,
  })
}

/**
 * 追踪工具交互
 */
export function trackToolInteraction(
  toolId: number | string,
  toolName: string,
  action: 'view' | 'click' | 'visit_website' | 'view_alternatives',
  options?: Record<string, any>
): void {
  trackEvent({
    category: 'tool_interaction',
    action,
    label: toolName,
    toolId,
    toolName,
    ...options,
  })
}

/**
 * 追踪导航事件
 */
export function trackNavigation(to: string, from?: string): void {
  trackEvent({
    category: 'navigation',
    action: 'click',
    label: to,
    to,
    from,
  })
}

/**
 * 追踪认证事件
 */
export function trackAuth(action: 'login' | 'logout' | 'signup', method?: string): void {
  trackEvent({
    category: 'authentication',
    action,
    method,
  })
}

/**
 * 追踪错误事件
 */
export function trackError(error: Error | string, context?: Record<string, any>): void {
  const errorMessage = error instanceof Error ? error.message : error
  const errorStack = error instanceof Error ? error.stack : undefined

  trackEvent({
    category: 'error',
    action: 'error_occurred',
    label: errorMessage,
    errorMessage,
    errorStack,
    ...context,
  })
}

/**
 * 追踪下载事件
 */
export function trackDownload(fileName: string, fileType?: string): void {
  trackEvent({
    category: 'download',
    action: 'download',
    label: fileName,
    fileName,
    fileType,
  })
}

/**
 * 追踪分享事件
 */
export function trackShare(platform: string, content?: string): void {
  trackEvent({
    category: 'share',
    action: 'share',
    label: platform,
    platform,
    content,
  })
}

/**
 * 初始化埋点系统
 */
export function initAnalytics(): void {
  if (!isBrowser()) return

  // 追踪初始页面访问
  trackPageView()

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      trackPageView()
    }
  })

  // 监听错误事件
  window.addEventListener('error', (event) => {
    trackError(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // 监听未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    trackError(event.reason, {
      type: 'unhandled_promise_rejection',
    })
  })
}

