import createMiddleware from 'next-intl/middleware'
import {locales, defaultLocale} from './i18n'

// 使用 next-intl 提供的中间件，根据路径 / cookie / 请求头 解析语言，
// 并将无前缀路径（如 /, /categories）重定向到带 [locale] 前缀的路径（如 /zh, /zh/categories）
export default createMiddleware({
  locales,
  defaultLocale,
  // 所有页面都使用带前缀的形式 /zh/... /en/...
  localePrefix: 'always',
})

export const config = {
  // 需要参与多语言处理的路径
  matcher: [
    // 首页和所有非静态资源路径都进入多语言中间件
    '/((?!_next|api|.*\\..*).*)',
  ],
}




