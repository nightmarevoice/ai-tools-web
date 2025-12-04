import type { Metadata } from "next"
import { ParentCategorySlugHandler } from "@/components/parent-category-slug-handler"
import { getTranslations } from "next-intl/server"

// 将 slug 转换回分类名称（简单实现，实际可能需要更复杂的映射）
function deslugify(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// 本地化一级分类页面
export default async function ParentCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; parentCategory: string }>
}) {
  const { locale, parentCategory } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://i-toolshub.com"
  // 生成分类页结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `AI Tools - ${deslugify(parentCategory)}`,
    "description": `Browse AI tools in ${deslugify(parentCategory)} category.`,
    "url": `${baseUrl}/${locale}/categories/${parentCategory}`,
    "inLanguage": locale,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ParentCategorySlugHandler 
        parentCategorySlug={parentCategory}
        locale={locale}
      />
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; parentCategory: string }>
}): Promise<Metadata> {
  const { locale, parentCategory } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://i-toolshub.com"
  
  const parentCategoryName = deslugify(parentCategory)
  const title = `AI Tools - ${parentCategoryName} | AI Tools search assistant`
  const description = `Browse AI tools in ${parentCategoryName} category. Discover the best AI applications for your needs.`

  return {
    title,
    description,
    keywords: [
      parentCategoryName,
      "AI tools",
      "artificial intelligence",
      "AI applications",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/categories/${parentCategory}`,
      siteName: "AI Tools search assistant",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${parentCategoryName} AI Tools`,
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
      canonical: `${baseUrl}/${locale}/categories/${parentCategory}`,
      languages: {
        'x-default': `${baseUrl}/en/categories/${parentCategory}`,
        en: `${baseUrl}/en/categories/${parentCategory}`,
        zh: `${baseUrl}/zh/categories/${parentCategory}`,
        ja: `${baseUrl}/ja/categories/${parentCategory}`,
        ko: `${baseUrl}/ko/categories/${parentCategory}`,
      },
    },
  }
}

