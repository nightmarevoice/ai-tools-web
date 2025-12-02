import type { Metadata } from "next"
import { CategoriesContent } from "@/components/categories-content"
import { getTranslations } from "next-intl/server"

// 本地化 categories 页面：直接使用客户端组件，因为已经在 [locale] 路由组下，有国际化上下文
export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"
  
  // 生成分类页结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI Tool Categories",
    "description": "Browse AI tools organized by category. Discover the best AI applications for different use cases.",
    "url": `${baseUrl}/${locale}/categories`,
    "inLanguage": locale,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CategoriesContent />
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"
  
  // 使用默认值，因为翻译文件中可能没有 metadata
  const title = "AI Tool Categories | AI application search assistant"
  const description = "Browse AI tools by category. Discover the best AI applications organized by category including AI assistants, productivity tools, research tools, and more."

  return {
    title,
    description,
    keywords: [
      "AI categories",
      "AI tool categories",
      "artificial intelligence tools",
      "AI software categories",
      "best AI tools by category",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/categories`,
      siteName: "AI application search assistant",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "AI Tool Categories",
        },
      ],
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : locale === 'ko' ? 'ko_KR' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/categories`,
      languages: {
        en: `${baseUrl}/en/categories`,
        zh: `${baseUrl}/zh/categories`,
        ja: `${baseUrl}/ja/categories`,
        ko: `${baseUrl}/ko/categories`,
      },
    },
  }
}

