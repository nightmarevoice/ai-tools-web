import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import { Toaster } from '@/components/ui/sonner'
import { LoginPromptProvider } from '@/components/login-prompt-provider'

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
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
          <LoginPromptProvider />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

