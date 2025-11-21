import createMiddleware from 'next-intl/middleware'
import {locales, defaultLocale} from './i18n'
import {NextRequest, NextResponse} from 'next/server'

// 检测浏览器语言并映射到支持的语言
function detectBrowserLocale(request: NextRequest): string {
  // 从 Accept-Language 头获取浏览器语言
  const acceptLanguage = request.headers.get('accept-language')
  
  if (!acceptLanguage) {
    return defaultLocale
  }

  // 解析 Accept-Language 头，格式如: "zh-CN,zh;q=0.9,en;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, q = 'q=1'] = lang.trim().split(';')
      const quality = parseFloat(q.split('=')[1] || '1')
      return { locale: locale.toLowerCase(), quality }
    })
    .sort((a, b) => b.quality - a.quality)

  // 语言映射：将浏览器语言代码映射到支持的语言
  const languageMap: Record<string, string> = {
    // 中文变体
    'zh': 'zh',
    'zh-cn': 'zh',
    'zh-hans': 'zh',
    'zh-hans-cn': 'zh',
    'zh-tw': 'zh', // 繁体中文也映射到 zh
    'zh-hant': 'zh',
    'zh-hant-tw': 'zh',
    // 英语
    'en': 'en',
    'en-us': 'en',
    'en-gb': 'en',
    'en-au': 'en',
    'en-ca': 'en',
    // 日语
    'ja': 'ja',
    'ja-jp': 'ja',
    // 韩语
    'ko': 'ko',
    'ko-kr': 'ko',
  }

  // 查找第一个匹配的语言
  for (const { locale } of languages) {
    // 精确匹配
    if (languageMap[locale]) {
      return languageMap[locale]
    }
    
    // 只匹配语言代码（如 zh-CN -> zh）
    const langCode = locale.split('-')[0]
    if (languageMap[langCode]) {
      return languageMap[langCode]
    }
  }

  // 如果没有匹配的语言，返回默认语言（英语）
  return defaultLocale
}

// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // 所有页面都使用带前缀的形式 /zh/... /en/...
  localePrefix: 'always',
  // 启用语言检测（会从 cookie 和 Accept-Language 头检测）
  localeDetection: true,
})

// 包装中间件以添加自定义浏览器语言检测
export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 检查 URL 中是否已经有语言前缀
  const hasLocalePrefix = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  // 如果已经有语言前缀，直接使用 next-intl 中间件
  if (hasLocalePrefix) {
    return intlMiddleware(request)
  }

  // 检查 cookie 中是否已有语言设置
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  
  // 如果 cookie 中有有效的语言设置，使用它
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${cookieLocale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // 如果没有语言前缀和 cookie，检测浏览器语言并重定向
  const detectedLocale = detectBrowserLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`
  
  // 设置 cookie，以便下次访问时使用
  const response = NextResponse.redirect(url)
  response.cookies.set('NEXT_LOCALE', detectedLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1年
    sameSite: 'lax',
  })
  
  return response
}

export const config = {
  // 需要参与多语言处理的路径
  matcher: [
    // 首页和所有非静态资源路径都进入多语言中间件
    '/((?!_next|api|.*\\..*).*)',
  ],
}




