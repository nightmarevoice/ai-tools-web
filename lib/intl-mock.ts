// Mock implementation for next-intl to maintain compatibility
// when the project structure doesn't use [locale] routing

export function useLocale(): string {
  return 'zh' // Default locale
}

export function useTranslations(namespace?: string) {
  // Mock translations - return the key as fallback
  return (key: string) => {
    // Simple translation map for common keys
    const translations: Record<string, string> = {
      'common.language.en': 'English',
      'common.language.zh': '中文',
      'common.language.zh-TW': '繁體中文',
      'common.language.ja': '日本語',
      'common.language.ko': '한국어',
      'common.chooseLanguage': '选择语言',
    }
    
    const fullKey = namespace ? `${namespace}.${key}` : key
    return translations[fullKey] || key
  }
}



