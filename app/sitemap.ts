import { MetadataRoute } from 'next'
import { locales } from '@/i18n'
import { appsApi } from '@/lib/api/apps'
import { categoriesApi } from '@/lib/api/categories'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-apphub.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // 添加首页（所有语言版本）
  for (const locale of locales) {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          locales.map(loc => [loc, `${baseUrl}/${loc}`])
        ),
      },
    })
  }

  // 添加分类页面（所有语言版本）
  // 策略：只添加有实际应用的二级分类到 sitemap
  try {
    const categoriesResponse = await categoriesApi.listPrimary()
    const primaryCategories = categoriesResponse.primary_categories || []

    // 遍历每个一级分类，获取其二级分类
    for (const primaryCategory of primaryCategories) {
      if (!primaryCategory.key) continue

      try {
        const secondaryResponse = await categoriesApi.listSecondary(primaryCategory.key)
        const secondaryCategories = secondaryResponse.categories || []

        // 为每个二级分类添加 sitemap 条目
        for (const secondaryCategory of secondaryCategories) {
          for (const locale of locales) {
            // URL中的&符号需要转义为&amp;以符合XML规范
            const categoryUrl = `${baseUrl}/${locale}/categories?parent_category=${primaryCategory.id}&amp;type=${secondaryCategory.id}`
            const alternateUrls = Object.fromEntries(
              locales.map(loc => [loc, `${baseUrl}/${loc}/categories?parent_category=${primaryCategory.id}&amp;type=${secondaryCategory.id}`])
            )

            sitemapEntries.push({
              url: categoryUrl,
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
              alternates: {
                languages: alternateUrls,
              },
            })
          }
        }
      } catch (error) {
        console.error(`Failed to fetch secondary categories for ${primaryCategory.key}:`, error)
      }
    }
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error)
  }

  // 添加工具详情页（所有语言版本）
  try {
    // 获取所有工具，使用分页获取
    let page = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      try {
        const response = await appsApi.list({
          page,
          limit,
        })

        const apps = response.items || []

        for (const app of apps) {
          for (const locale of locales) {
            sitemapEntries.push({
              url: `${baseUrl}/${locale}/tools/${app.id}`,
              lastModified: app.updated_at ? new Date(app.updated_at) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
              alternates: {
                languages: Object.fromEntries(
                  locales.map(loc => [loc, `${baseUrl}/${loc}/tools/${app.id}`])
                ),
              },
            })
          }
        }

        hasMore = page < response.pages
        page++
      } catch (error) {
        console.error(`Failed to fetch apps page ${page} for sitemap:`, error)
        hasMore = false
      }
    }
  } catch (error) {
    console.error('Failed to fetch apps for sitemap:', error)
  }

  // 添加其他重要页面
  const otherPages = [
    { path: 'pricing', priority: 0.7 },
    { path: 'privacy', priority: 0.5 },
    { path: 'service', priority: 0.6 },
    { path: 'apphub-blog', priority: 0.6 },
    { path: 'dataanalysis', priority: 0.6 },
  ]

  for (const page of otherPages) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${page.path}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${baseUrl}/${loc}/${page.path}`])
          ),
        },
      })
    }
  }

  return sitemapEntries
}

