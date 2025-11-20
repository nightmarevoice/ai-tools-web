/**
 * 登录提示弹窗管理 Hook
 */

'use client'

import { useState, useEffect } from 'react'
import { authEventManager } from '@/lib/auth/auth-events'

export function useLoginPrompt() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 监听认证事件（如 429 错误导致的强制登出）
    const unsubscribe = authEventManager.subscribe((event) => {
      if (event === 'RATE_LIMIT_EXCEEDED') {
        // 显示登录提示弹窗
        setIsOpen(true)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isOpen,
    setIsOpen,
  }
}



