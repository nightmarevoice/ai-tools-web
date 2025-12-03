import { MetadataRoute } from 'next'
import { categoriesApi } from '@/lib/api/categories'
import { appsApi } from '@/lib/api/apps'
import type { Language } from '@/types/api'

const languages: Language[] = ['zh', 'en', 'ja', 'ko']
const baseUrl = 'https://ai-apphub.com'
const blogUrl = 'https://blog.ai-apphub.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date()

  // 1. 生成首页 URL（不带语言前缀）
  const homeRoute: MetadataRoute.Sitemap[0] = {
    url: `${baseUrl}/`,
    lastModified: today,
    changeFrequency: 'daily',
    priority: 1.0,
  }

  // 2. 获取所有分类数据并生成 URL
  const categoryRoutes: MetadataRoute.Sitemap = []

  try {
    // 遍历所有语言
    for (const lang of languages) {
      try {
        // 2.1 添加分类列表页：/{lang}/categories
        categoryRoutes.push({
          url: `${baseUrl}/${lang}/categories`,
          lastModified: today,
          changeFrequency: 'daily' as const,
          priority: 0.9,
        })

        // 2.2 获取一级分类
        const primaryResponse = await categoriesApi.listPrimary(lang)
        const primaryCategories = primaryResponse.primary_categories || []

        console.log(`[Sitemap] Found ${primaryCategories.length} primary categories for ${lang}`)

        // 对每个一级分类
        for (const primaryCategory of primaryCategories) {
          if (!primaryCategory.key) {
            console.warn(`[Sitemap] Primary category missing key:`, primaryCategory)
            continue
          }

          // 2.3 添加一级分类页：/{lang}/categories/{primaryCategory.key}
          categoryRoutes.push({
            url: `${baseUrl}/${lang}/categories/${primaryCategory.key}`,
            lastModified: today,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          })

          try {
            // 获取该一级分类下的二级分类
            const secondaryResponse = await categoriesApi.listSecondary(primaryCategory.key, lang)
            const secondaryCategories = secondaryResponse.categories || []

            console.log(`[Sitemap] Found ${secondaryCategories.length} secondary categories for ${primaryCategory.key} in ${lang}`)
            
            if (secondaryCategories.length === 0) {
              console.warn(`[Sitemap] No secondary categories found for ${primaryCategory.key} in ${lang}`)
            }

            // 2.4 为每个二级分类生成 URL：/{lang}/categories/{primaryCategory.key}/{secondaryCategory.key}
            for (const secondaryCategory of secondaryCategories) {
              if (!secondaryCategory.key) {
                console.warn(`[Sitemap] Secondary category missing key:`, secondaryCategory)
                continue
              }

              const secondaryUrl = `${baseUrl}/${lang}/categories/${primaryCategory.key}/${secondaryCategory.key}`
              categoryRoutes.push({
                url: secondaryUrl,
                lastModified: today,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
              })
              
              console.log(`[Sitemap] Added secondary category URL: ${secondaryUrl}`)
            }
          } catch (error) {
            // 如果获取二级分类失败，记录详细错误但继续处理其他分类
            console.error(`[Sitemap] Failed to fetch secondary categories for ${primaryCategory.key} in ${lang}:`, error)
            if (error instanceof Error) {
              console.error(`[Sitemap] Error details: ${error.message}`, error.stack)
            }
          }
        }
      } catch (error) {
        // 如果获取一级分类失败，记录错误但继续处理其他语言
        console.error(`[Sitemap] Failed to fetch primary categories for ${lang}:`, error)
      }
    }
  } catch (error) {
    // 如果获取分类数据失败，至少返回首页
    console.error('[Sitemap] Failed to fetch categories for sitemap:', error)
  }

  console.log(`[Sitemap] Generated ${categoryRoutes.length} category routes`)

  // 3. 添加 Dashboard 路径（四种语言）
  const dashboardRoutes: MetadataRoute.Sitemap = []
  for (const lang of languages) {
    dashboardRoutes.push({
      url: `${baseUrl}/${lang}/dashboard`,
      lastModified: today,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })
  }
  console.log(`[Sitemap] Generated ${dashboardRoutes.length} dashboard routes`)

  // 4. 添加 Blog 路径（外部链接）
  const blogRoute: MetadataRoute.Sitemap[0] = {
    url: `${blogUrl}/`,
    lastModified: today,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }

  // 5. 获取所有工具并生成工具详情页 URL
  const toolRoutes: MetadataRoute.Sitemap = []
  try {
    // 获取所有工具（使用较大的 limit 值，如果工具数量很多可能需要分页）
    for (const lang of languages) {
      try {
        let page = 1
        const limit = 100 // 每页获取 100 个工具
        let hasMore = true

        while (hasMore) {
          const response = await appsApi.list({ 
            lang, 
            page, 
            limit 
          })
          
          const tools = response.items || []
          
          for (const tool of tools) {
            if (tool.id) {
              toolRoutes.push({
                url: `${baseUrl}/${lang}/tools/${tool.id}`,
                lastModified: today,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
              })
            }
          }

          // 检查是否还有更多页面
          hasMore = page < response.pages
          page++
          
          // 安全限制：最多获取 10 页（1000 个工具）
          if (page > 80) {
            console.warn(`[Sitemap] Reached page limit for tools in ${lang}`)
            break
          }
        }
        
        console.log(`[Sitemap] Generated tool routes for ${lang}`)
      } catch (error) {
        console.error(`[Sitemap] Failed to fetch tools for ${lang}:`, error)
      }
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch tools for sitemap:', error)
  }
  console.log(`[Sitemap] Generated ${toolRoutes.length} tool routes`)

  // 6. 添加问题页路径（video 和 message，四种语言）
  const questionRoutes: MetadataRoute.Sitemap = []
  const questionSlugs = ['video', 'message']
  for (const lang of languages) {
    for (const slug of questionSlugs) {
      questionRoutes.push({
        url: `${baseUrl}/${lang}/question/${slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })
    }
  }
  console.log(`[Sitemap] Generated ${questionRoutes.length} question routes`)

  // 7. 合并所有路由并返回
  const totalRoutes = 1 + categoryRoutes.length + dashboardRoutes.length + 1 + toolRoutes.length + questionRoutes.length
  console.log(`[Sitemap] Total routes: ${totalRoutes}`)
  
  return [
    homeRoute,
    ...categoryRoutes,
    ...dashboardRoutes,
    blogRoute,
    ...toolRoutes,
    ...questionRoutes,
  ]
}

