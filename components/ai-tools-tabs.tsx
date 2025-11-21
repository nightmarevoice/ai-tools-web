"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { ToolCard } from "./tool-card"
import { statsApi } from "@/lib/api/stats"
import type { TopApp } from "@/types/api"

type TabKey = "trending" | "recent" | "featured"

export function AiToolsTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("trending")
  const [trendingApps, setTrendingApps] = useState<TopApp[]>([])
  const [loading, setLoading] = useState(false)
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

  // 将 API 返回的 TopApp 转换为 Tool 格式
  const convertToTool = (app: TopApp) => ({
    id: app.id,
    name: app.app_name,
    monthly_visits: app.monthly_visits,
    categories: app.categories ,
    description: app.short_description || "",
    icon: app.icon_url,
    category: t("categories.aiAssistant"), // 可以根据实际情况从 app 数据中获取
    pricing: t("pricing.free"), // 可以根据实际情况从 app 数据中获取
    isNew: false,
    isTrending: true,
  })

  const tools = {
    trending: trendingApps.map(convertToTool),
   
    featured: [
      {
        id: 1004,
        name: 'matterport',
        description:"3D空间数字化平台,采集环境数据并生成可交互的三维模型",
        categories: [
          "ai-digital-marketing",
          "ai-3d-model-generator",
          "ai-interior-design"
        ],
        icon: "http://cdn.deepinsightqa.com/collect_icon/matterport.png",
        monthly_visits:11730000,
        pricing: t("pricing.free"),
        isNew: false,
        isTrending: false,
      },
      {
        id: 4745,
        name: "cloudflare",
        description: "云网络服务平台,提供内容分发、DDoS防护、Web应用防火墙和边缘计算功能",
        categories: [
          "ai-agent-development",
          "ai-developer-tools",
          "ai-web-scraper"
        ],
        icon: "http://cdn.deepinsightqa.com/collect_icon/cloudflare.png",
        monthly_visits:32850000,
        pricing: t("pricing.free"),
        isNew: false,
        isTrending: false,
      },
      {
        id: 125,
        name: t("tools.murf.name"),
        description: "全栈Web应用生成平台,根据自然语言描述自动生成前端代码并部署",
        categories:  [
          "ai-app-builder",
          "ai-low-code-no-code"
        ],
        icon: "http://cdn.deepinsightqa.com/collect_icon/lovabledev.png",
        monthly_visits:19890000,
        pricing: t("pricing.freemium"),
        isNew: false,
        isTrending: false,
      },
      {
        id: 6560,
        name: t("tools.beautiful.name"),
        description: "AI文本检测工具,识别ChatGPT等模型生成的文本内容",
        categories: [
          "ai-plagiarism-detector",
          "ai-grammar-checker",
          "ai-detector",
          "ai-content-detector",
          "ai-essay-checker"
        ],
        icon: "http://cdn.deepinsightqa.com/collect_icon/zerogpt.png",
        monthly_visits: 28910000,
        pricing: t("pricing.freemium"),
        isNew: false,
        isTrending: false,
      },
    ],
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
          {loading && activeTab === "trending" ? (
            // 加载状态
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0057FF]"></div>
                <p className="text-sm text-muted-foreground">Loading trending tools...</p>
              </div>
            </div>
          ) : currentTools.length === 0 && activeTab === "trending" ? (
            // 空状态
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-muted-foreground">No trending tools available</p>
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


