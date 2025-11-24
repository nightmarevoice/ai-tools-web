"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {Search,ArrowRight} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { searchApi } from "@/lib/api/search"
import { BackgroundPattern } from "@/components/background-pattern"
import {
  Bot,
  MessageSquare,
  Briefcase,
  Code2,
  Image as ImageIcon,
  Loader2,
  Video,
  Megaphone,
  Headphones,
  BookOpen,
  Building2,
  ShoppingCart,
  Scale,
  Shield,
  Globe,
  LayoutDashboard,
  Wand2,
  Folder,
} from "lucide-react"
import { categoriesApi } from "@/lib/api/categories"
import { appsApi } from "@/lib/api/apps"
import type { Application, Category, Language, SemanticSearchResponse } from "@/types/api"
import { useTranslations, useLocale } from "next-intl"

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "chat-agents": MessageSquare,
  productivity: Briefcase,
  "image-design": ImageIcon,
  video: Video,
  audio: Headphones,
  coding: Code2,
  "app-builder": LayoutDashboard,
  writing: Wand2,
  detection: Shield,
  translate: Globe,
  education: BookOpen,
  business: Building2,
  marketing: Megaphone,
  jobs: Briefcase,
  "legal-finance": Scale,
  ecommerce: ShoppingCart,
  social: Megaphone,
  lifestyle: Folder,
}

const DEFAULT_APP_LIMIT = 50

export function CategoriesContent() {
  const t = useTranslations("categories")

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t("loadingPage")}</p>
          </main>
          <Footer />
        </div>
      }
    >
      <CategoriesPageContent />
    </Suspense>
  )
}

function CategoriesPageContent() {
  const locale = useLocale()
  const t = useTranslations("categories")
  const tCommon = useTranslations("common")
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [query, setQuery] = useState<string>("")
  const [inputValue, setInputValue] = useState<string>("")
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [searchType ,setSearchType] = useState<string>("category")
  const searchParams = useSearchParams()
  const typeParam = searchParams?.get("type") ?? undefined
  const navRef = useRef<HTMLDivElement | null>(null)
  const [resolvedLang, setResolvedLang] = useState<string | undefined>(() => {
    const urlLang = searchParams?.get("lang") ?? undefined
    if (urlLang) return urlLang
    if (typeof window === "undefined") return undefined
    return window.localStorage.getItem("preferredLanguage") ?? undefined
  })

  useEffect(() => {
    const urlLang = searchParams?.get("lang") ?? undefined
    if (urlLang) {
      setResolvedLang(urlLang)
      return
    }
    if (typeof window === "undefined") {
      setResolvedLang(undefined)
      return
    }
    const storedLang = window.localStorage.getItem("preferredLanguage") ?? undefined
    setResolvedLang(storedLang)
  }, [searchParams])

  const [apps, setApps] = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState<boolean>(false)
  const [appsError, setAppsError] = useState<string | null>(null)
  const [appsPage, setAppsPage] = useState<number>(1)
  const [appsPages, setAppsPages] = useState<number>(1)
  const [appsTotal, setAppsTotal] = useState<number>(0)
  const [appsLoadingMore, setAppsLoadingMore] = useState<boolean>(false)
  const [searching, setSearching] = useState<boolean>(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Application[]>([])
  const [searchPage, setSearchPage] = useState<number>(1)
  const [searchTotal, setSearchTotal] = useState<number>(0)
  const [searchLoadingMore, setSearchLoadingMore] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // 远程拉取分类数据（优化：并行加载初始数据）
  useEffect(() => {
    let aborted = false
    const fetchData = async () => {
      try {
        setLoadingCategories(true)
        setCategoriesError(null)
        setAppsError(null)

        // 检查是否有搜索查询参数
        const qParam = (searchParams?.get("q") ?? "").trim()
        
        if (qParam) {
          // 如果有搜索参数，只加载分类列表，不加载应用列表
          const categoriesResponse = await categoriesApi.list(resolvedLang)
          
          if (aborted) return
          
          const cats = categoriesResponse.categories ?? []
          setCategories(cats)
          
          // 如果有 URL 参数指定的分类，使用它；否则使用第一个分类
          const targetCategoryId = typeParam && cats.some(c => c.id === typeParam)
            ? typeParam
            : cats[0]?.id
          
          if (targetCategoryId) {
            setActiveCategoryId(targetCategoryId)
          }
        } else {
          // 如果没有搜索参数，并行获取分类列表和初始应用数据
          setAppsLoading(true)
          
          const [categoriesResponse, appsResponse] = await Promise.all([
            categoriesApi.list(resolvedLang),
            appsApi.list({
              lang: (resolvedLang as Language | undefined) ?? undefined,
              page: 1,
              limit: DEFAULT_APP_LIMIT,
            })
          ])

          if (aborted) return

          const cats = categoriesResponse.categories ?? []
          setCategories(cats)

          // 如果有 URL 参数指定的分类，使用它；否则使用第一个分类
          const targetCategoryId = typeParam && cats.some(c => c.id === typeParam)
            ? typeParam
            : cats[0]?.id

          if (targetCategoryId) {
            setActiveCategoryId(targetCategoryId)

            // 如果初始应用数据匹配目标分类，直接使用；否则重新获取
            setApps(appsResponse.items ?? [])
            setAppsPage(appsResponse.page ?? 1)
            setAppsPages(appsResponse.pages ?? 1)
            setAppsTotal(appsResponse.total ?? 0)
          }
        }
      } catch (e: any) {
        if (aborted) return
        setCategoriesError(e?.message || t("loadAppsFailed"))
        setAppsError(e?.message ?? t("loadAppsFailed"))
      } finally {
        if (!aborted) {
          setLoadingCategories(false)
          setAppsLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      aborted = true
    }
  }, [resolvedLang, t, typeParam, searchParams])

  

  

  const handleNavClick = useCallback((e: React.MouseEvent, key: string) => {
    e.preventDefault()
    setActiveCategoryId(key)
    const element = document.getElementById(`category-card-${key}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  // 移除此 useEffect，因为 activeCategoryId 现在在初始加载时设置
  // useEffect(() => {
  //   if (categories.length === 0) return
  //   if (typeParam && categories.some((category) => category.id === typeParam)) {
  //     setActiveCategoryId(typeParam)
  //     return
  //   }
  //   if (!activeCategoryId) {
  //     setActiveCategoryId(categories[0].id)
  //   }
  // }, [categories, typeParam, activeCategoryId])

  useEffect(() => {
    if (!typeParam) return
    if (!categories.some((category) => category.id === typeParam)) return
    const navEl = navRef.current
    if (!navEl) return
    const activeItem = navEl.querySelector<HTMLElement>(`[data-category-id="${typeParam}"]`)
    if (!activeItem) return
    const targetScroll = activeItem.offsetTop - navEl.clientHeight / 2 + activeItem.offsetHeight / 2
    navEl.scrollTo({
      top: Math.max(targetScroll, 0),
      behavior: "smooth",
    })
  }, [typeParam, categories])

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [categories, activeCategoryId]
  )

  // 拉取分类下的应用列表（仅在切换分类时执行，初始加载已在上面并行完成）
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  useEffect(() => {
    // 标记初始加载完成
    if (categories.length > 0 && activeCategoryId && !initialLoadDone) {
      setInitialLoadDone(true)
      return
    }

    // 仅在初始加载完成后，切换分类时才执行
    if (!activeCategoryId || !initialLoadDone) return

    let aborted = false

    async function fetchFirstPage() {
      try {
        setAppsLoading(true)
        setAppsError(null)
        setSearchError(null)
        // 重置分页
        setApps([])
        setAppsPage(1)
        setAppsPages(1)
        setAppsTotal(0)

        const response = await appsApi.list({
          category: activeCategoryId ?? undefined,
          lang: (resolvedLang as Language | undefined) ?? undefined,
          page: 1,
          limit: DEFAULT_APP_LIMIT,
        })
        if (aborted) return
        setApps(response.items ?? [])
        setAppsPage(response.page ?? 1)
        setAppsPages(response.pages ?? 1)
        setAppsTotal(response.total ?? 0)
        setSearchType("category")
      } catch (e: any) {
        if (aborted) return
        setApps([])
        setAppsError(e?.message ?? t("loadAppsFailed"))
      } finally {
        if (!aborted) setAppsLoading(false)
      }
    }

    fetchFirstPage()
    return () => {
      aborted = true
    }
  }, [activeCategoryId, resolvedLang, t, initialLoadDone, categories.length])

  const loadMoreApps = useCallback(async () => {
    if (!activeCategoryId) return
    if (appsLoadingMore) return
    if (appsPage >= appsPages) return
    let aborted = false
    setAppsLoadingMore(true)
    setAppsError(null)
    try {
      const nextPage = appsPage + 1
      const response = await appsApi.list({
        category: activeCategoryId ?? undefined,
        lang: (resolvedLang as Language | undefined) ?? undefined,
        page: nextPage,
        limit: DEFAULT_APP_LIMIT,
      })
      if (aborted) return
      const nextItems = response.items ?? []
      // 按 id 去重合并
      const merged = [...apps, ...nextItems].filter(
        (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index
      )
      setApps(merged)
      setAppsPage(response.page ?? nextPage)
      setAppsPages(response.pages ?? appsPages)
      setAppsTotal(response.total ?? appsTotal)
    } catch (e: any) {
      if (aborted) return
      setAppsError(e?.message ?? t("loadMoreFailed"))
    } finally {
      if (!aborted) setAppsLoadingMore(false)
    }
    return () => {
      aborted = true
    }
  }, [activeCategoryId, appsLoadingMore, appsPage, appsPages, apps, resolvedLang, appsTotal, t])
  const performSearch = useCallback(async (term: string, page: number = 1, append: boolean = false) => {
    const trimmed = term.trim()
    setQuery(trimmed)
    if (!trimmed) {
      setSearchResults([])
      setSearching(false)
      setSearchError(null)
      setSearchPage(1)
      setSearchTotal(0)
      return
    }
    let aborted = false
    if (page === 1) {
      setSearching(true)
    } else {
      setSearchLoadingMore(true)
    }
    setSearchError(null)
    try {
      const preferredLang = (() => {
        try {
          const v = typeof window !== "undefined" ? window.localStorage.getItem("preferredLanguage") : null
          const allowed: Language[] = ["en", "zh", "zh-TW", "ja", "ko"]
          return v && (allowed as string[]).includes(v) ? (v as Language) : (resolvedLang as Language | undefined)
        } catch {
          return resolvedLang as Language | undefined
        }
      })()
      // 计算 top_k：第一页使用默认值，后续页面增加
      const topK = page === 1 ? DEFAULT_APP_LIMIT : DEFAULT_APP_LIMIT * page
      const response = await searchApi.query({
        user_query: trimmed,
        enable_llm_summary: false,
        top_k: topK,
        lang: preferredLang,
      })
      if (aborted) return
      // 标准化：优先从 searchApi.query 的标准结果（results）取数；
      // 若服务端返回 { applications: [] }，则回退到 applications。
      let rawItems: any[] = []
      if (response && typeof response === "object") {
        const maybeApi: any = response as any
        if (Array.isArray(maybeApi.applications)) {
          rawItems = maybeApi.applications
        } else if (Array.isArray((response as SemanticSearchResponse).results)) {
          rawItems = (response as SemanticSearchResponse).results
        }
      }
      const appsFromApi: Application[] = rawItems.map((app: any, index: number) => ({
        id: typeof app.id === "number" ? app.id : index,
        app_name: app.app_name ?? "",
        url: app.url ?? app.official_website ?? "",
        official_website: app.official_website,
        region: app.region ?? "",
        categories: app.categories ?? [],
        product_description: app.product_description ?? "",
        monthly_visits: app.monthly_visits,
        avg_duration_seconds: app.avg_duration_seconds,
        category_rank: app.category_rank,
        bounce_rate: app.bounce_rate,
        trend_data: app.trend_data,
        geographic_distribution: app.geographic_distribution,
        screenshot_url: app.screenshot_url,
        icon_url: app.icon_url,
        developer_name: app.developer_name,
        rating: app.rating,
        downloads: app.downloads,
        price: app.price,
        scrape_time: app.scrape_time,
        created_at: app.created_at ?? "",
        updated_at: app.updated_at ?? "",
        is_deleted: app.is_deleted,
        language: app.language,
      }))
      
      // 处理结果：如果是追加模式，只添加新结果
      if (append) {
        // 使用函数式更新，避免依赖 searchResults
        setSearchResults(prev => {
          if (prev.length === 0) {
            return appsFromApi
          }
          // 找出新结果（不在现有结果中的）
          const existingIds = new Set(prev.map(app => app.id))
          const newApps = appsFromApi.filter(app => !existingIds.has(app.id))
          
          if (newApps.length > 0) {
            return [...prev, ...newApps]
          }
          // 如果没有新结果，说明已经加载完所有结果，返回原结果
          return prev
        })
      } else {
        setSearchResults(appsFromApi)
      }
      
      // 更新总数和页数
      const total = (response as SemanticSearchResponse)?.total ?? appsFromApi.length
      setSearchTotal(total)
      setSearchPage(page)
      setSearchType("search")
    } catch (e: any) {
      if (aborted) return
      if (page === 1) {
        setSearchResults([])
      }
      setSearchError(e?.message ?? t("searchFailed"))
    } finally {
      setSearchType("search")
      if (page === 1) {
        if (!aborted) setSearching(false)
      } else {
        if (!aborted) setSearchLoadingMore(false)
      }
    }
  }, [resolvedLang, t])
  
  const loadMoreSearchResults = useCallback(async () => {
    if (!query.trim()) return
    if (searchLoadingMore) return
    // 如果当前结果数已经达到或超过总数，不再加载
    if (searchTotal > 0 && searchResults.length >= searchTotal) return
    
    const nextPage = searchPage + 1
    await performSearch(query, nextPage, true)
  }, [query, searchLoadingMore, searchPage, searchResults.length, searchTotal, performSearch])
  const handleSubmit = async(e: React.FormEvent) => {  
    e.preventDefault()
    setSearchPage(1)
    setSearchResults([])
    await performSearch(inputValue, 1, false)
  }
  const formatNumber = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—"
    return value.toLocaleString()
  }

  // 移除 IntersectionObserver，因为现在只显示选中的分类
  const handleSearchClick = useCallback(() => {
    const trimmed = inputValue.trim()
    setQuery(trimmed)
  }, [inputValue])
  
  // 支持通过 URL 参数 q 触发搜索并回填输入框
  useEffect(() => {
    const qParam = (searchParams?.get("q") ?? "").trim()
    if (qParam) {
      setInputValue(qParam)
      setSearchPage(1)
      setSearchResults([])
      // 异步执行以确保状态更新后再搜索
      Promise.resolve().then(() => performSearch(qParam, 1, false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  
  // 滚动到底部自动加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // 当滚动到距离底部 200px 时触发加载
      const threshold = 200
      const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold
      
      if (isNearBottom) {
        if (searchType === "search") {
          // 搜索模式：加载更多搜索结果
          // 如果 searchTotal > 0，则检查是否还有更多结果
          // 如果 searchTotal === 0，则尝试加载（可能是首次加载或 API 未返回总数）
          const hasMore = searchTotal === 0 || searchResults.length < searchTotal
          if (!searchLoadingMore && !searching && searchResults.length > 0 && hasMore) {
            loadMoreSearchResults()
          }
        } else {
          // 分类模式：加载更多应用
          if (!appsLoadingMore && !appsLoading && appsPage < appsPages && apps.length > 0) {
            loadMoreApps()
          }
        }
      }
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [searchType, searchLoadingMore, searchResults.length, searchTotal, appsLoadingMore, appsPage, appsPages, apps.length, loadMoreSearchResults, loadMoreApps])
  
  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col"
      
    >
      <Navbar />
      <main className="flex-1">
        

        <section className="relative py-8 md:py-12 text-slate-900 ">
         
          <div className="relative z-10 mx-auto px-3 max-w-7xl">
            <div className=" grid gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr]">
              <aside className="sticky top-20 h-max">
                <nav
                  ref={navRef}
                  id="category-nav"
                  className="relative space-y-2 overflow-y-auto max-h-[calc(100vh-5rem)] pr-1"
                  aria-busy={loadingCategories}
                  aria-live="polite"
                >
                  {loadingCategories && appsLoading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : null}
                  {loadingCategories ? (
                    <div className="space-y-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-3">
                          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    categories.map((category) => {
                      const isActive = activeCategoryId ? activeCategoryId === category.id : false
                      const Icon = CATEGORY_ICON_MAP[category.id] ?? Bot
                      return (
                        <a
                          key={category.id}
                          href="javascript:void(0)"
                          data-category-id={category.id}
                          onClick={(e) => handleNavClick(e, category.id)}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors ${
                            isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{category.name}</span>
                          
                        </a>
                      )
                    })
                  )}
                </nav>
                <style jsx>{`
                  #category-nav {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                  }
                  #category-nav::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                  }
                `}</style>
              </aside>
              <div className="space-y-8">
                 {/* 查询 */}
                 <div className="rounded-lg max-w-2xl mx-auto bg-card p-3">
                   <div className="mb-2 text-center p-6">
                     <div className="text-lg font-medium">{t("searchBox.title")}</div>
                     <div className="text-xs text-muted-foreground">{t("searchBox.subtitle")}</div>
                   </div>
                   <div className="flex justify-center items-center gap-2">
                     <div className="relative " style={{width:500}}>
                     <form onSubmit={handleSubmit} className="relative group">
                      <div className="relative transition-all duration-300 transform group-hover:-translate-y-0.5 group-hover:shadow-lg rounded-xl shadow-md bg-white">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Search className="h-5 w-5 text-primary/60" />
                        </div>
                        <input
                          type="text"
                          className="w-full h-14 pl-12 border hover:border-[#0057FF] focus:border-[#0057FF] pr-12 rounded-xl border-0.5 bg-transparent text-base placeholder:text-muted-foreground  focus:outline-none"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          disabled={searching}
                          placeholder={t("searchBox.placeholder")}
                        />
                        <button
                          type="submit"
                          aria-label="Search"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 cursor-pointer rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                          disabled={inputValue.trim() === "" || searching}
                          
                        >
                          {searching ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <ArrowRight className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </form>

                      
                     </div>
                     
                   </div>
                   {loadingCategories ? (
                     <div className="mt-3 text-xs text-muted-foreground text-center">{t("loadingCategories")}</div>
                   ) : categoriesError ? (
                     <div className="mt-3 text-xs text-red-500 text-center">{categoriesError}</div>
                   ) : null}
                 </div>

                 {activeCategory ? (null) : (
                  <div className="rounded-xl border bg-card p-8 text-center">
                    <p className="text-muted-foreground">{t("chooseOnLeft")}</p>
                  </div>
                 )}

                 <div className="rounded-xl border bg-card p-5">
                   <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                     <div>
                       <h3 className="text-lg font-semibold">
                         {searchType === "search"
                           ? tCommon("searchResults")
                           : activeCategory
                           ? t("hotToolsOfCategory", { name: activeCategory.name })
                           : t("hotTools")}
                       </h3>
                       <p className="text-sm text-muted-foreground">
                         {searchType === "search"
                           ? (query
                               ? t("search.tipWithQuery", { query, limit: DEFAULT_APP_LIMIT })
                               : t("search.tip", { limit: DEFAULT_APP_LIMIT }))
                           : t("defaultLoadedCount", { loaded: apps.length, total: appsTotal })}
                       </p>
                     </div>
                     
                   </div>
                 {(appsLoading || searching || (searchType === "search" && searchLoadingMore && searchResults.length > 0)) && (
                   <div className="grid gap-4 sm:grid-cols-2">
                     {Array.from({ length: 6 }).map((_, i) => (
                       <div key={i} className="rounded-lg border p-4">
                         <div className="flex items-start gap-3">
                           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted animate-pulse" />
                           <div className="flex-1 space-y-2">
                             <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                             <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                           </div>
                         </div>
                         <div className="mt-4 flex items-center justify-between text-xs">
                           <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                           <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                         </div>
                       </div>
                     ))}
                   </div>
                  ) }
                  {
                    searchType === "category" && apps.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                       {apps.map((app: Application) => (
                          <div
                            key={app.id}
                            className="rounded-lg border p-4 transition hover:border-primary"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                                  <img
                                    src={app.icon_url}
                                    alt={app.app_name}
                                    className="h-full w-full rounded-lg object-cover"
                                    loading="lazy"
                                  />
                              </div>
                              <div className="space-y-2">
                                <Link
                                  href={`/${locale}/tools/${app.id}`}
                                  className="text-base hover:text-[#0057FF] font-semibold hover:underline line-clamp-1"
                                >
                                  {app.app_name}
                                </Link>
                                {app.product_description ? (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {app.product_description}
                                  </p>
                                ) : null}
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                 {app.categories?.slice(0, 3).map((cat: string) => (
                                    <span
                                      key={cat}
                                      className="rounded-full border px-2 py-0.5"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{tCommon("monthlyVisits")}：{formatNumber(app.monthly_visits)}</span>
                              <a
                                href={app.official_website ?? app.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                {tCommon("visitWebsite")}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  {/* 滚动加载提示 */}
                  {searchType === "search" && searchLoadingMore && searchResults.length > 0 ? (
                    <div className="mt-6 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("loadingMore")}</span>
                      </div>
                    </div>
                  ) : searchType === "search" && searchResults.length > 0 && searchResults.length >= searchTotal && searchTotal > 0 ? (
                    <div className="mt-6 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{tCommon("loadedAll")}</span>
                    </div>
                  ) : searchType !== "search" && appsLoadingMore ? (
                    <div className="mt-6 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("loadingMore")}</span>
                      </div>
                    </div>
                  ) : searchType !== "search" && !appsLoading && apps.length > 0 && appsPage >= appsPages ? (
                    <div className="mt-6 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{tCommon("loadedAll")}</span>
                    </div>
                  ) : null}

                  {
                    searchType === "search" && searchResults?.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                       {searchResults?.map((app: Application) => (
                          <div
                            key={app.id}
                            className="rounded-lg border p-4 transition hover:border-primary"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                                  <img
                                    src={app.icon_url}
                                    alt={app.app_name}
                                    className="h-full w-full rounded-lg object-cover"
                                    loading="lazy"
                                  />
                              </div>
                              <div className="space-y-2">
                                <Link
                                  href={`/${locale}/tools/${app.id}`}
                                  className="text-base font-semibold hover:underline line-clamp-1"
                                >
                                  {app.app_name}
                                </Link>
                                {app.product_description ? (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {app.product_description}
                                  </p>
                                ) : null}
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                 {app.categories?.slice(0, 3).map((cat: string) => (
                                    <span
                                      key={cat}
                                      className="rounded-full border px-2 py-0.5"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{tCommon("monthlyVisits")}：{formatNumber(app.monthly_visits)}</span>
                              <a
                                href={app.official_website ?? app.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                {tCommon("visitWebsite")}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) 
                  }
                 </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

