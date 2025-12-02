import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '@/i18n'
import { Toaster } from '@/components/ui/sonner'
import { LoginPromptProvider } from '@/components/login-prompt-provider'
import { LocaleSync } from '@/components/locale-sync'
import type { Metadata } from 'next'
import { generateMultilangAlternates } from '@/lib/seo/multilang'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"
  
  // 为根路径生成多语言 alternates
  const alternates = generateMultilangAlternates(locale, '')
  
  return {
    alternates,
    openGraph: {
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locales
        .filter(l => l !== locale)
        .map(l => l === 'zh' ? 'zh_CN' : l === 'ja' ? 'ja_JP' : l === 'ko' ? 'ko_KR' : 'en_US'),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // 验证 locale 是否有效
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // 获取翻译消息
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        {/* 在页面加载时立即检查 localStorage 并同步 cookie */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var preferredLanguage = localStorage.getItem('preferredLanguage');
                  var supportedLocales = ['zh', 'en', 'ja', 'ko'];
                  if (preferredLanguage && supportedLocales.includes(preferredLanguage)) {
                    document.cookie = 'NEXT_LOCALE=' + preferredLanguage + '; path=/; max-age=31536000; SameSite=Lax';
                  }
                } catch (e) {
                  // localStorage 可能不可用，忽略错误
                }
              })();
            `,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <LocaleSync currentLocale={locale} />
          {children}
          <Toaster />
          <LoginPromptProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

