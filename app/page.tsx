import { NextIntlClientProvider } from "next-intl"
import { defaultLocale } from "@/i18n"
import { HomeContent } from "@/components/home-content"
import { RootLocaleRedirect } from "@/components/root-locale-redirect"

// 根页面：提供国际化上下文，因为 / 不在 [locale] 路由组下
// 虽然中间件会重定向到 /[locale]，但在构建时仍需要预渲染此页面
export default async function Home() {
  // 获取默认语言的翻译消息
  const messages = (await import(`@/messages/${defaultLocale}.json`)).default

  return (
    <NextIntlClientProvider messages={messages} locale={defaultLocale}>
      <RootLocaleRedirect />
      <HomeContent />
    </NextIntlClientProvider>
  )
}

















