import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { defaultLocale } from "@/i18n"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileTabs } from "@/components/profile-tabs"

export const metadata: Metadata = {
  title: "User Profile | AI Research Assistant",
  description: "Manage your account, saved papers, and subscription settings",
  openGraph: {
    title: "User Profile | AI Research Assistant",
    description: "Manage your account, saved papers, and subscription settings",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Research Assistant - User Profile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "User Profile | AI Research Assistant",
    description: "Manage your account, saved papers, and subscription settings",
    images: ["/og-image.png"],
  },
}

// 根 profile 页面：提供国际化上下文，因为 /profile 不在 [locale] 路由组下
// 虽然中间件会重定向到 /[locale]/profile，但在构建时仍需要预渲染此页面
export default async function ProfilePage() {
  // 获取默认语言的翻译消息
  const messages = (await import(`@/messages/${defaultLocale}.json`)).default
  
  return (
    <NextIntlClientProvider messages={messages} locale={defaultLocale}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <ProfileHeader />
          <div className="container px-4 py-6 md:px-6 md:py-8">
            <ProfileTabs />
          </div>
        </div>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
