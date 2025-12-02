import { locales, defaultLocale } from '@/i18n'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"

/**
 * 生成多语言 alternates 配置
 * 用于 SEO 优化，生成 hreflang 标签
 * 
 * @param currentLocale 当前语言
 * @param path 当前路径（不包含语言前缀），例如 '/categories' 或 '/tools/123'
 * @returns alternates 配置对象
 */
export function generateMultilangAlternates(
  currentLocale: string,
  path: string = ''
): {
  canonical: string
  languages: Record<string, string>
} {
  // 处理路径：空字符串或 '/' 表示根路径
  let normalizedPath = path.trim()
  if (normalizedPath === '' || normalizedPath === '/') {
    normalizedPath = ''
  } else {
    // 确保 path 以 / 开头
    normalizedPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  }
  
  // 生成所有语言版本的 URL
  const languages: Record<string, string> = {}
  
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}${normalizedPath}`
  })
  
  // 添加 x-default，指向默认语言版本
  languages['x-default'] = `${baseUrl}/${defaultLocale}${normalizedPath}`
  
  return {
    canonical: `${baseUrl}/${currentLocale}${normalizedPath}`,
    languages,
  }
}

/**
 * 获取语言对应的 OpenGraph locale 代码
 */
export function getOpenGraphLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    'zh': 'zh_CN',
    'en': 'en_US',
    'ja': 'ja_JP',
    'ko': 'ko_KR',
  }
  return localeMap[locale] || 'en_US'
}

