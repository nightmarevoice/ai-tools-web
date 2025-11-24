import { MetadataRoute } from 'next'
import { locales } from '@/i18n'
import { appsApi } from '@/lib/api/apps'
import { categoriesApi } from '@/lib/api/categories'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://research-ai-assistant.vercel.app'

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
  try {
    const categoriesResponse = await categoriesApi.list()
    const categories = categoriesResponse.categories || []
    
    for (const category of categories) {
      for (const locale of locales) {
        sitemapEntries.push({
          url: `${baseUrl}/${locale}/categories?category=${category.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              locales.map(loc => [loc, `${baseUrl}/${loc}/categories?category=${category.id}`])
            ),
          },
        })
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
    { path: 'dashboard', priority: 0.6 },
    { path: 'pricing', priority: 0.7 },
    { path: 'privacy', priority: 0.5 },
    { path: 'service', priority: 0.6 },
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

