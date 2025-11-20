/**
 * Supabase 浏览器客户端
 * 用于客户端组件的 Supabase 操作
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * 获取 Supabase 环境变量
 * 如果环境变量未配置，会抛出清晰的错误信息
 */
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const missing = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    throw new Error(
      `缺少 Supabase 环境变量: ${missing.join(', ')}\n\n` +
        `请在 .env.local 文件中配置以下变量:\n` +
        `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here\n\n` +
        `获取这些值:\n` +
        `1. 访问 https://app.supabase.com\n` +
        `2. 选择你的项目\n` +
        `3. 进入 Settings > API\n` +
        `4. 复制 Project URL 和 anon public key`
    )
  }

  return { url, anonKey }
}

export function createClient() {
  const { url, anonKey } = getSupabaseConfig()
  return createBrowserClient(url, anonKey)
}
