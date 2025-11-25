import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { HomeContent } from "@/components/home-content"

// 本地化首页：使用共享的 HomeContent 组件
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://research-ai-assistant.vercel.app"
  
  // 生成首页结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI application search assistant",
    "description": "Discover the best AI tools and applications. Explore trending AI assistants, research tools, and productivity apps.",
    "url": `${baseUrl}/${locale}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${locale}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    "inLanguage": locale,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeContent />
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "home.metadata" })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://research-ai-assistant.vercel.app"

  const title = t("title")
  const description = t("description")

  return {
    title,
    description,
    keywords: [
      "AI tools",
      "artificial intelligence",
      "AI applications",
      "trending AI tools",
      "best AI software",
      "AI productivity tools",
      "machine learning tools",
      "AI research",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}`,
      siteName: "AI application search assistant",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t("ogAlt"),
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
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        zh: `${baseUrl}/zh`,
        ja: `${baseUrl}/ja`,
        ko: `${baseUrl}/ko`,
      },
    },
  }
}




















