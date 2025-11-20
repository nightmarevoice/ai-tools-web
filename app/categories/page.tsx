import { NextIntlClientProvider } from "next-intl"
import { defaultLocale } from "@/i18n"
import { CategoriesContent } from "@/components/categories-content"

// 根 categories 页面：提供国际化上下文，因为 /categories 不在 [locale] 路由组下
// 虽然中间件会重定向到 /[locale]/categories，但在构建时仍需要预渲染此页面
export default async function CategoriesPage() {
  // 获取默认语言的翻译消息
  const messages = (await import(`@/messages/${defaultLocale}.json`)).default
  
  return (
    <NextIntlClientProvider messages={messages} locale={defaultLocale}>
      <CategoriesContent />
    </NextIntlClientProvider>
  )
}
