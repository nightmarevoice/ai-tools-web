"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { statsApi } from "@/lib/api/stats"
import type { CategoryStats, Language } from "@/types/api"
import { useTranslations, useLocale } from "next-intl"

const CATEGORY_META: Record<
  string,
  {
    emoji: string
    description?: string
  }
> = {
  AI助手: { emoji: "🤖", description: "聊天、问答、办公助手" },
  生产力: { emoji: "⚙️", description: "自动化、效率工具" },
  图像设计: { emoji: "🎨", description: "图像生成与编辑" },
  视频: { emoji: "🎬", description: "视频生成、剪辑、字幕" },
  音频: { emoji: "🎵", description: "音乐创作与音频处理" },
  教育: { emoji: "🎓", description: "学习助手与内容生成" },
  商业: { emoji: "💼", description: "商务洞察与营销" },
  数据分析: { emoji: "📊", description: "分析、预测与可视化" },
  "ai-social-media-assistant": { emoji: "📱", description: "社交媒体内容与排程助手" },
  "ai-digital-marketing": { emoji: "📣", description: "营销创意与广告优化" },
  "ai-graphic-design": { emoji: "🖌️", description: "图形设计与视觉创作" },
  "large-language-models": { emoji: "🧠", description: "大语言模型与文本生成" },
  "ai-design-generation": { emoji: "✨", description: "设计灵感与生成工具" },
  "ai-presentation-tools": { emoji: "📊", description: "演示文稿与故事板辅助" },
  "ai-research-tools": { emoji: "🔬", description: "研究分析与信息整理" },
  "ai-design-assistant": { emoji: "📐", description: "设计流程与协作助手" },
}

const TOP_CATEGORY_LIMIT = 9

export function CategoryExploration() {
  const t = useTranslations("home.categoryExploration")
  const locale = useLocale()
  const [categories, setCategories] = useState<CategoryStats[]>([])
  const [totalCategories, setTotalCategories] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aborted = false

    async function fetchCategoryStats() {
      try {
        setLoading(true)
        setError(null)
        const response = await statsApi.getByCategory({
          top: TOP_CATEGORY_LIMIT,
          lang: locale as Language,
        })
        if (aborted) return
        const list = response ?? []
        setCategories(list)
        setTotalCategories(list.length ?? 0)
      } catch (err: any) {
        if (aborted) return
        setError(err?.message ?? t("error"))
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    fetchCategoryStats()
    return () => {
      aborted = true
    }
  }, [t, locale])

  const displayCategories = useMemo(() => {
    if (categories.length > 0) return categories
    return []
  }, [categories])

  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—"
    if (value >= 10000) {
      return Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    }
    return Intl.NumberFormat("zh-CN").format(value)
  }

  const formatVisits = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—"
    return Intl.NumberFormat("en-US").format(value)
  }

 
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("subtitle", { count: totalCategories })}
            </p>
          </div>
          <Link
            href="/categories"
            prefetch={true}
            className="text-sm font-medium text-[#0057FF] hover:text-white hover:bg-[#0057FF] border border-[#0057FF] rounded-full px-4 py-2"
          >
            {t("viewAll")}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: TOP_CATEGORY_LIMIT }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCategories.map((category) => {
              const meta = CATEGORY_META[category.category] ?? { emoji: "✨" }
              return (
                <Link
                  key={category.category}
                  href={`/categories?parent_category=${encodeURIComponent(category.parent_category)}&type=${encodeURIComponent(category.category)}`}
                  prefetch={true}
                  className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-150 hover:-translate-y-1 hover:border-[#0057FF]/50 hover:shadow-lg hover:shadow-blue-100/50 overflow-hidden"
                >
                  {/* 悬停背景渐变效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/80 group-hover:to-indigo-50/60 transition-all duration-150"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-150">
                        {meta.emoji}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0057FF] transition-colors duration-150">
                        {category.category_name}
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      
                      
                      <div className="flex items-center gap-2 pt-2 flex-wrap">
                        {/* 工具数量卡片 */}
                        <div className="flex items-center gap-1.5 px-3 py-1  bg-blue-50 rounded-full border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 group-hover:shadow-sm transition-all duration-150">
                          <span className="text-blue-600 text-xs group-hover:scale-110 transition-transform duration-150">
                            🔧
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base text-xs text-[#0057FF] group-hover:text-[#0046CC] transition-colors">
                              {formatNumber(category.app_count)} 
                            </span>
                            <span className="text-xs text-gray-500">{t("tools")}</span>
                          </div>
                        </div>
                        
                        {/* 访问量卡片 */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300 group-hover:shadow-sm transition-all duration-150">
                          <span className="text-xs group-hover:scale-110 transition-transform duration-150">
                            📊
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base text-xs text-emerald-600 group-hover:text-emerald-700 transition-colors">
                              {formatVisits(category.total_visits)}
                            </span>
                            <span className="text-xs text-gray-500">{t("timesVisited")}</span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}



