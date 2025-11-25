import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { defaultLocale } from "@/i18n"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AdminHeader } from "@/components/admin-header"
import { AdminTabs } from "@/components/admin-tabs"

export const metadata: Metadata = {
  title: "Admin Dashboard | AI application search assistant",
  description: "Monitor system usage, manage users, and track subscriptions",
}

export default async function AdminPage() {
  // 获取默认语言的翻译消息，因为 /admin 不在 [locale] 路由组下
  // 直接导入消息文件以避免在非 [locale] 路由中使用 getMessages 的问题
  const messages = (await import(`@/messages/${defaultLocale}.json`)).default

  return (
    <NextIntlClientProvider messages={messages} locale={defaultLocale}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <AdminHeader />
          <div className="container px-4 py-6 md:px-6 md:py-8">
            <AdminTabs />
          </div>
        </div>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
