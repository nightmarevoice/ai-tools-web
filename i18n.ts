import {getRequestConfig} from 'next-intl/server'

export const locales = ['zh','en', 'ja', 'ko'] as const
export type AppLocale = (typeof locales)[number]
export const defaultLocale: AppLocale = 'zh'

// next-intl 全局配置文件，供服务端 getMessages / 中间件等使用
export default getRequestConfig(async ({requestLocale}: {requestLocale: Promise<string>}) => {
  let locale = await requestLocale

  // 确保 locale 是有效的，如果不是则使用默认 locale
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})




















