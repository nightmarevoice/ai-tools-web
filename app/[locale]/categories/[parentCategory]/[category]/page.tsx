import type { Metadata } from "next"
import { CategorySlugHandler } from "@/components/category-slug-handler"
import { getTranslations } from "next-intl/server"

// 将 slug 转换回分类名称（简单实现，实际可能需要更复杂的映射）
function deslugify(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// 本地化分类详情页面
export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; parentCategory: string; category: string }>
}) {
  const { locale, parentCategory, category } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"
  
  // 生成分类页结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `AI Tools - ${deslugify(parentCategory)} - ${deslugify(category)}`,
    "description": `Browse AI tools in ${deslugify(category)} category under ${deslugify(parentCategory)}.`,
    "url": `${baseUrl}/${locale}/categories/${parentCategory}/${category}`,
    "inLanguage": locale,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CategorySlugHandler 
        parentCategorySlug={parentCategory}
        categorySlug={category}
        locale={locale}
      />
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; parentCategory: string; category: string }>
}): Promise<Metadata> {
  const { locale, parentCategory, category } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"
  
  const parentCategoryName = deslugify(parentCategory)
  const categoryName = deslugify(category)
  const title = `${parentCategoryName} - ${categoryName}`
  const description = `Browse AI tools in ${categoryName} category under ${parentCategoryName}. Discover the best AI applications for your needs.`

  return {
    title,
    description,
    keywords: [
      categoryName,
      parentCategoryName,
      "AI tools",
      "artificial intelligence",
      "AI applications",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${locale}/categories/${parentCategory}/${category}`,
      siteName: "AI application search assistant",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${categoryName} AI Tools`,
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
      canonical: `${baseUrl}/${locale}/categories/${parentCategory}/${category}`,
      languages: {
        'x-default': `${baseUrl}/en/categories/${parentCategory}/${category}`,
        en: `${baseUrl}/en/categories/${parentCategory}/${category}`,
        zh: `${baseUrl}/zh/categories/${parentCategory}/${category}`,
        ja: `${baseUrl}/ja/categories/${parentCategory}/${category}`,
        ko: `${baseUrl}/ko/categories/${parentCategory}/${category}`,
      },
    },
  }
}

