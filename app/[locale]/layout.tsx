import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import { Toaster } from '@/components/ui/sonner'
import { LoginPromptProvider } from '@/components/login-prompt-provider'
import { LocaleSync } from '@/components/locale-sync'

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

