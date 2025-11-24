"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { ToolCard } from "./tool-card"
import { statsApi } from "@/lib/api/stats"
import type { TopApp, TrendingApp } from "@/types/api"

type TabKey = "trending" | "recent" | "featured"

export function AiToolsTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("trending")
  const [trendingApps, setTrendingApps] = useState<TopApp[]>([])
  const [featuredApps, setFeaturedApps] = useState<TrendingApp[]>([])
  const [loading, setLoading] = useState(false)
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const t = useTranslations("home.aiToolsTabs")
  const locale = useLocale()

  // 获取热门应用数据
  useEffect(() => {
    const fetchTrendingApps = async () => {
      setLoading(true)
      try {
        const response = await statsApi.getTopApps({
          metric: 'visits',
          limit: 9,
          lang: locale
        })
        setTrendingApps(response.apps)
      } catch (error) {
        console.error('Failed to fetch trending apps:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingApps()
  }, [locale])

  // 获取增长趋势应用数据
  useEffect(() => {
    const fetchFeaturedApps = async () => {
      setFeaturedLoading(true)
      try {
        const response = await statsApi.getTrendingApps({
          limit: 9,
          lang: locale
        })
        setFeaturedApps(response.apps)
      } catch (error) {
        console.error('Failed to fetch featured apps:', error)
      } finally {
        setFeaturedLoading(false)
      }
    }

    fetchFeaturedApps()
  }, [locale])

  // 将 API 返回的 TopApp 转换为 Tool 格式
  const convertToTool = (app: TopApp) => ({
    id: app.id,
    name: app.app_name,
    monthly_visits: app.monthly_visits,
    categories: app.categories ? (typeof app.categories === 'string' ? [app.categories] : app.categories) : undefined,
    description: app.short_description || "",
    icon: app.icon_url,
    screenshot_url:app.screenshot_url,
    category: t("categories.aiAssistant"), // 可以根据实际情况从 app 数据中获取
    pricing: t("pricing.free"), // 可以根据实际情况从 app 数据中获取
    isNew: false,
    isTrending: true,
  })

  // 将 API 返回的 TrendingApp 转换为 Tool 格式
  const convertTrendingAppToTool = (app: TrendingApp) => ({
    id: app.id,
    name: app.app_name,
    monthly_visits: app.monthly_visits,
    categories: app.categories.map(cat => cat.translations[locale] || cat.translations['zh'] || cat.category_key),
    description: app.short_description || "",
    icon: app.icon_url,
    screenshot_url: app.screenshot_url,
    pricing: t("pricing.free"), // 可以根据实际情况从 app 数据中获取
    isNew: false,
    isTrending: true,
  })

  const tools = {
    trending: trendingApps.map(convertToTool),
    featured: featuredApps.map(convertTrendingAppToTool),
  }

  const currentTools = tools[activeTab as keyof typeof tools]

  return (
    <section className="py-6 sm:py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题与描述 */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground md:text-lg mt-3">
            {t("subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-12 border-b border-border">
          {[
            { id: "trending", label: t("tabs.trending") },
            { id: "featured", label: t("tabs.featured") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`relative px-6 py-3 border-b-2 font-medium transition ${
                activeTab === tab.id
                  ? "border-transparent text-[#0057FF]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`${
                  activeTab === tab.id
                    ? "text-[#0057FF]"
                    : ""
                }`}
              >
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <span className="pointer-events-none absolute left-0 right-0 -bottom-[2px] h-[2px] bg-[#0057FF]" />
              )}
            </button>
          ))}
        </div>

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading && activeTab === "trending") || (featuredLoading && activeTab === "featured") ? (
            // 加载状态
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0057FF]"></div>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "trending" ? "Loading trending tools..." : "Loading featured tools..."}
                </p>
              </div>
            </div>
          ) : currentTools.length === 0 ? (
            // 空状态
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {activeTab === "trending" ? "No trending tools available" : "No featured tools available"}
              </p>
            </div>
          ) : (
            // 正常显示工具卡片
            currentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}


