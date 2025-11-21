import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Star, TrendingUp, Clock, Globe, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { appsApi } from "@/lib/api/apps"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

interface ToolPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

// 为静态导出生成静态参数
export async function generateStaticParams(): Promise<Array<{ slug: string; locale: string }>> {
  // 返回空数组，表示不预生成任何页面
  // 如果需要预生成特定工具页面，可以返回具体的参数组合
  return []
}

// 启用动态路由，允许动态参数
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations("tool.metadata")
  
  try {
    const appId = parseInt(slug)
    if (isNaN(appId)) {
      return {
        title: t("notFound"),
      }
    }

    const app = await appsApi.get(appId, locale)

    return {
      title: `${app.app_name} | AI Research Assistant`,
      description: app.short_description || app.product_description || `Explore ${app.app_name}`,
      openGraph: {
        title: app.app_name,
        description: app.short_description || app.product_description || '',
        type: "website",
        images: app.screenshot_url ? [
          {
            url: app.screenshot_url,
            width: 1200,
            height: 630,
            alt: app.app_name,
          },
        ] : [],
      },
    }
  } catch (error) {
    // 记录错误但不抛出，避免 500 错误
    console.error(`[generateMetadata] Failed to fetch app ${slug}:`, error)
    return {
      title: t("notFound"),
    }
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug, locale } = await params
  const t = await getTranslations("tool")
  
  // Parse the slug as app ID
  const appId = parseInt(slug)
  if (isNaN(appId)) {
    notFound()
  }

  let app
  try {
    app = await appsApi.get(appId, locale)
  } catch (error) {
    // 详细记录错误信息，便于排查
    console.error(`[ToolPage] Failed to fetch app ${appId} (locale: ${locale}):`, error)
    
    // 如果是网络错误或 API 错误，记录更多信息
    if (error instanceof Error) {
      console.error(`[ToolPage] Error message: ${error.message}`)
      if ('status' in error) {
        console.error(`[ToolPage] API status: ${(error as any).status}`)
      }
    }
    
    // 返回 404 而不是 500
    notFound()
  }
  
  // 验证 app 数据是否有效
  if (!app || !app.app_name) {
    console.error(`[ToolPage] Invalid app data for ID ${appId}`)
    notFound()
  }

  // Format numbers
  const formatNumber = (num?: number) => {
    if (!num) return "N/A"
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  // Get similar apps
  let similarApps: import('@/types/api').SimilarApplication[] = []
  try {
    const similarResponse = await appsApi.getSimilar(appId, { lang: locale, limit: 6 })
    similarApps = similarResponse.items || []
  } catch (error) {
    // 相似应用获取失败不影响主页面显示，只记录错误
    console.error(`[ToolPage] Failed to fetch similar apps for ${appId}:`, error)
    // 确保 similarApps 是空数组，避免渲染错误
    similarApps = []
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="relative z-10 mx-auto px-6 py-6 max-w-7xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={`/${locale}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                {t("backToHome")}
              </Button>
            </Link>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Icon/Screenshot */}
              {app.icon_url ? (
                <div className="flex-shrink-0">
                  <img
                    src={app.icon_url}
                    alt={app.app_name}
                    className="w-24 h-24 rounded-2xl border-2 border-blue-200 shadow-md"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-4xl font-bold text-white">
                    {app.app_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {app.app_name}
                    </h1>
                    {app.developer_name && (
                      <p className="text-sm text-gray-600">
                        {t("by")} {app.developer_name}
                      </p>
                    )}
                  </div>
                  {app.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{app.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {app.short_description && (
                  <p className="text-gray-700 mb-4 text-lg">
                    {app.short_description}
                  </p>
                )}

                {/* Categories */}
                {app.categories && app.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {app.categories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                 
                  {app.official_website && app.official_website !== app.url && (
                    <a
                      href={app.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="outline" className="gap-2 text-white hover:text-white bg-blue-600 hover:bg-blue-700">
                        <Globe className="w-4 h-4" />
                        {t("visitWebsite")}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
              <div className="flex-1" >
                {app.screenshot_url && (
                    <div className="bg-white rounded-xl border border-blue-100 p-1 shadow-sm">
                     
                      <img
                        src={app.screenshot_url}
                        alt={`${app.app_name} screenshot`}
                        className="w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
              </div>

            </div>
            {/*网站的跳转链接按钮*/ }
          </div>

         

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="bg-white border border-blue-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 cursor-pointer">
                {t("whatIs", { app: app.app_name })}
              </TabsTrigger>
              <TabsTrigger value="alternatives" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 cursor-pointer">
                {t("alternatives")}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
               {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("stats.monthlyVisits")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(app.monthly_visits)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("stats.avgDuration")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(app.avg_duration_seconds)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("stats.categoryRank")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {app.category_rank ? `#${app.category_rank}` : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("stats.bounceRate")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {app.bounce_rate ? `${(app.bounce_rate * 100).toFixed(1)}%` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
              <div className="grid gap-8">
               
                {app.product_description && (
                  <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {app.app_name}
                    </h2>
                    <div className="prose prose-blue max-w-none mb-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {app.product_description}
                      </p>
                    </div>

                    {/* Main Features with formatted list */}
                    {app.main_features && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">{t("mainFeatures")}</h3>
                        <div className="space-y-3">
                          {app.main_features.split('||').map((feature, index) => {
                            const trimmedFeature = feature.trim()
                            const colonIndex = trimmedFeature.indexOf(':')
                            
                            if (colonIndex > 0) {
                              const title = trimmedFeature.substring(0, colonIndex).trim()
                              const description = trimmedFeature.substring(colonIndex + 1).trim()
                              
                              return (
                                <div key={index} className="flex gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <div>
                                    <span className="font-bold text-gray-900">{title}:</span>
                                    <span className="text-gray-700"> {description}</span>
                                  </div>
                                </div>
                              )
                            } else {
                              return (
                                <div key={index} className="flex gap-2">
                                  <span className="text-blue-600 mt-1">•</span>
                                  <span className="text-gray-700">{trimmedFeature}</span>
                                </div>
                              )
                            }
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

               
              </div>
            </TabsContent>

            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="mt-6">
              <div className="bg-white rounded-xl border border-blue-100 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("alternativesTo", { app: app.app_name })}
                </h2>
                
                {similarApps.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6">
                    {similarApps.map((similar) => (
                      <Link
                        key={similar.id}
                        href={`/${locale}/tools/${similar.id}`}
                        className="block p-4 rounded-xl border-1 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group bg-white"
                      >
                        <div className="">
                          <div className="flex flex-row items-center text-left gap-2" >
                            {similar.icon_url ? (
                              <img
                                src={similar.icon_url}
                                alt={similar.app_name}
                                className="w-16 h-16 rounded-xl mb-4 border border-gray-200 group-hover:border-blue-300"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-md transition">
                                <span className="text-2xl font-bold text-white">
                                  {similar.app_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-2 transition">
                              {similar.app_name}
                            </h3>
                            {similar.product_description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {similar.product_description}
                              </p>
                            )}
                            </div>
                          </div>
                         
                          
                         
                         

                          <div className="flex flex-col gap-2">
                            {similar.categories && similar.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {similar.categories.slice(0, 2).map((category) => (
                                  <span
                                    key={category}
                                    className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full border border-blue-200"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {similar.monthly_visits && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{formatNumber(similar.monthly_visits)}</span>
                                </div>
                              )}
                              {similar.similarity_score && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                                  <span className="font-medium">{t("match", { percent: (similar.similarity_score * 100).toFixed(0) })}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      {t("similar.noAlternatives")}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  )
}

