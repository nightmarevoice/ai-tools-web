/**
 * 认证事件管理器
 * 用于处理全局认证状态变化，如 429 错误导致的强制登出
 */

type AuthEventType = 'FORCE_LOGOUT' | 'TOKEN_EXPIRED' | 'RATE_LIMIT_EXCEEDED'

type AuthEventListener = (event: AuthEventType, data?: any) => void

class AuthEventManager {
  private listeners: Set<AuthEventListener> = new Set()

  /**
   * 订阅认证事件
   */
  subscribe(listener: AuthEventListener) {
    this.listeners.add(listener)
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 发布认证事件
   */
  emit(event: AuthEventType, data?: any) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('Auth event listener error:', error)
      }
    })
  }

  /**
   * 清空所有监听器
   */
  clear() {
    this.listeners.clear()
  }
}

// 导出单例
export const authEventManager = new AuthEventManager()

// 导出事件类型
export type { AuthEventType, AuthEventListener }



