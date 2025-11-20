import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Star, TrendingUp, Clock, Globe, BarChart3, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { appsApi } from "@/lib/api/apps"
import { notFound } from "next/navigation"

interface ToolPageProps {
  params: Promise<{
    slug: string
  }>
}

// 为静态导出生成静态参数 - 必须在文件顶部
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  // 返回一个示例值，确保函数被正确识别
  return [{ slug: 'example' }]
}

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const appId = parseInt(slug)
    if (isNaN(appId)) {
      return {
        title: "Tool Not Found",
      }
    }

    const app = await appsApi.get(appId, 'en')

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
    return {
      title: "Tool Not Found",
    }
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params
  
  // Parse the slug as app ID
  const appId = parseInt(slug)
  if (isNaN(appId)) {
    notFound()
  }

  let app
  try {
    app = await appsApi.get(appId, 'en')
  } catch (error) {
    console.error(`Failed to fetch app ${appId}:`, error)
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
    const similarResponse = await appsApi.getSimilar(appId, { lang: 'en', limit: 6 })
    similarApps = similarResponse.items || []
  } catch (error) {
    console.error(`Failed to fetch similar apps for ${appId}:`, error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
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
                        by {app.developer_name}
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
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </Button>
                  </a>
                  {app.official_website && app.official_website !== app.url && (
                    <a
                      href={app.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="outline" className="gap-2">
                        <Globe className="w-4 h-4" />
                        Official Site
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Visits</p>
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
                  <p className="text-sm text-gray-600">Avg. Duration</p>
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
                  <p className="text-sm text-gray-600">Category Rank</p>
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
                  <p className="text-sm text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {app.bounce_rate ? `${(app.bounce_rate * 100).toFixed(1)}%` : "N/A"}
                  </p>
                </div>
                      </div>
                          </div>
                        </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="bg-white  p-1 ">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                {app.app_name}
              </TabsTrigger>
              <TabsTrigger value="alternatives" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                Alternative Tools
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Product Description */}
                  {app.product_description && (
                    <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        About {app.app_name}
                      </h2>
                      <div className="prose prose-blue max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {app.product_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Main Features */}
                  {app.main_features && (
                    <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Key Features
                      </h2>
                      <div className="prose prose-blue max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {app.main_features}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Screenshot */}
                  {app.screenshot_url && (
                    <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Screenshot
                      </h2>
                      <img
                        src={app.screenshot_url}
                        alt={`${app.app_name} screenshot`}
                        className="w-full rounded-lg border border-gray-200"
                      />
                      </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Info Card */}
                  <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Information
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-gray-600">Region</dt>
                        <dd className="text-sm font-medium text-gray-900 mt-1">
                          {app.region}
                        </dd>
                      </div>
                      {app.downloads && (
                        <div>
                          <dt className="text-sm text-gray-600">Downloads</dt>
                          <dd className="text-sm font-medium text-gray-900 mt-1">
                            {formatNumber(app.downloads)}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-sm text-gray-600">Website</dt>
                        <dd className="text-sm font-medium mt-1">
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                          >
                            Visit
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </dd>
                      </div>
                    </dl>
                        </div>
                      </div>
                    </div>
            </TabsContent>

            {/* Alternatives Tab */}
            <TabsContent value="alternatives" className="mt-6">
              <div className="bg-white rounded-xl border border-blue-100 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Alternative Tools to {app.app_name}
                </h2>
                
                {similarApps.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                   {similarApps.map((similar) => (
                     <Link
                       key={similar.id}
                       href={`/tools/${similar.id}`}
                       className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group bg-white"
                     >
                       {/* 左侧图标 */}
                       <div className="flex-shrink-0">
                         {similar.icon_url ? (
                           <img
                             src={similar.icon_url}
                             alt={similar.app_name}
                             className="w-16 h-16 rounded-xl border border-gray-200 group-hover:border-blue-300 transition"
                           />
                         ) : (
                           <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center group-hover:shadow-md transition">
                             <span className="text-2xl font-bold text-white">
                               {similar.app_name.charAt(0).toUpperCase()}
                             </span>
                          </div>
                         )}
                            </div>
                       
                       {/* 右侧内容 */}
                       <div className="flex-1 min-w-0">
                         {/* 名称 */}
                         <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 mb-1 transition truncate">
                           {similar.app_name}
                         </h3>
                         
                         {/* 描述 */}
                         {similar.product_description && (
                           <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                             {similar.product_description}
                           </p>
                         )}

                         {/* 分类 */}
                         {similar.categories && similar.categories.length > 0 && (
                           <div className="flex flex-wrap gap-1 mb-2">
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
                         
                         {/* 浏览量和相似度 */}
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
                               <span className="font-medium">{(similar.similarity_score * 100).toFixed(0)}% match</span>
                            </div>
                           )}
                            </div>
                          </div>
                     </Link>
                   ))}
                        </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No alternative tools found yet. Check back later!
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

