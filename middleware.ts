import createMiddleware from 'next-intl/middleware'
import {locales, defaultLocale} from './i18n'
import {NextRequest, NextResponse} from 'next/server'


// 创建 next-intl 中间件
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // 所有页面都使用带前缀的形式 /zh/... /en/...
  localePrefix: 'always',
  // 禁用语言检测（不使用 Accept-Language 头检测）
  localeDetection: false,
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

  // 如果没有语言前缀和 cookie，使用默认语言并重定向
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  
  // 设置 cookie，以便下次访问时使用
  const response = NextResponse.redirect(url)
  response.cookies.set('NEXT_LOCALE', defaultLocale, {
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




