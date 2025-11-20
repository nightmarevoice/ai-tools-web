"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardSearch } from "@/components/dashboard-search"
import { PaperResults } from "@/components/paper-results"
import { RecommendedTools } from "@/components/recommended-tools"
import { searchApi } from "@/lib/api/search"
import { BackgroundPattern } from "@/components/background-pattern"
import type { SemanticSearchResponse } from "@/types/api"
import { useTranslations, useLocale } from "next-intl"

export function DashboardContent() {
  const t = useTranslations("dashboard")
  const locale = useLocale()
  const [searchResults, setSearchResults] = useState<SemanticSearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState("")
  const searchParams = useSearchParams()

  const handleSearch = async (userQuery: string) => {
    if (!userQuery.trim()) return

    const query = userQuery.trim()
    setCurrentQuery(query)
    setIsSearching(true)
    setError(null)
    setSearchResults(null)

    try {
      const response = await searchApi.query({
        user_query: query,
        enable_llm_summary: true,
        top_k: 10,
        lang: locale,
      })
      // API 返回的数据结构：{ applications: [...], llm_summary: "..." }
      // 需要转换为 SemanticSearchResponse 格式
      if (response && typeof response === 'object') {
        const apiResponse = response as any
        const convertedResponse: SemanticSearchResponse = {
          results: (apiResponse.applications || []).map((app: any, index: number) => ({
            id: app.id || index,
            app_name: app.app_name || '',
            product_description: app.product_description || '',
            relevance_score: 1.0,
            url: app.url || app.official_website || '',
          })),
          total: apiResponse.applications?.length || 0,
          query: query,
          llm_summary: apiResponse.llm_summary || '',
        }
        setSearchResults(convertedResponse)
      } else {
        // 如果已经是正确的格式，直接使用
        setSearchResults(response as SemanticSearchResponse)
      }
    } catch (err) {
      console.error("Search failed:", err)
      setError(err instanceof Error ? err.message : t("searchFailed"))
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }

  // 支持通过 URL 参数 q 触发搜索并回填输入框
  useEffect(() => {
    const qParam = (searchParams?.get("q") ?? "").trim()
    if (qParam) {
      // 若与当前查询不同，则触发
      if (qParam !== currentQuery) {
        handleSearch(qParam)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col theme-0057ff">
      <Navbar />
      <section className="relative overflow-hidden pt-12 md:pt-16 text-slate-900">
        <BackgroundPattern />
        <div className="relative z-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto py-6 md:py-8">
            <div className="w-150 mx-auto">
              <DashboardSearch onSearch={handleSearch} initialQuery={(searchParams?.get("q") ?? "")} />
            </div>
          </div>
        </div>
      </section>
      <div className="flex-1">
        <div className="px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-6 py-6 md:py-8">
              {/* 左侧推荐工具列表 */}
              <aside className="hidden sticky top-20 lg:block w-64 flex-shrink-0">
                <RecommendedTools />
              </aside>
              
              {/* 右侧搜索结果 */}
              <div className="flex-1 min-w-0">
                <PaperResults 
                  results={searchResults}
                  loading={isSearching}
                  error={error}
                  query={currentQuery}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

