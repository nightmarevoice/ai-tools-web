import { NextIntlClientProvider } from "next-intl"
import { defaultLocale } from "@/i18n"
import { DashboardContent } from "@/components/dashboard-content"

// 根 dashboard 页面：提供国际化上下文，因为 /dashboard 不在 [locale] 路由组下
// 虽然中间件会重定向到 /[locale]/dashboard，但在构建时仍需要预渲染此页面
export default async function DashboardPage() {
  // 获取默认语言的翻译消息
  const messages = (await import(`@/messages/${defaultLocale}.json`)).default

  return (
    <NextIntlClientProvider messages={messages} locale={defaultLocale}>
      <DashboardContent />
    </NextIntlClientProvider>
  )
}
