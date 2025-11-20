"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {Search} from "lucide-react"
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
import { useTranslations } from "next-intl"

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
  // 远程拉取分类数据
  useEffect(() => {
    let aborted = false
    const fetchData = async () => {
      try {
        setLoadingCategories(true)
        setCategoriesError(null)
        const response = await categoriesApi.list(resolvedLang)
        if (aborted) return
        setCategories(response.categories ?? [])
      } catch (e: any) {
        if (aborted) return
        setCategoriesError(e?.message || t("loadAppsFailed"))
      } finally {
        if (!aborted) setLoadingCategories(false)
      }
    }
    fetchData()
    return () => {
      aborted = true
    }
  }, [resolvedLang, t])

  

  

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

  useEffect(() => {
    if (categories.length === 0) return
    if (typeParam && categories.some((category) => category.id === typeParam)) {
      setActiveCategoryId(typeParam)
      return
    }
    if (!activeCategoryId) {
      setActiveCategoryId(categories[0].id)
    }
  }, [categories, typeParam, activeCategoryId])

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

  // 拉取分类下的应用列表（分页）
  useEffect(() => {
    if (!activeCategoryId) return
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
  }, [activeCategoryId, resolvedLang, t])

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
  const performSearch = async (term: string) => {
    const trimmed = term.trim()
    setQuery(trimmed)
    if (!trimmed) {
      setSearchResults([])
      setSearching(false)
      setSearchError(null)
      return
    }
    let aborted = false
    setSearching(true)
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
      const response = await searchApi.query({
        user_query: trimmed,
        enable_llm_summary: false,
        top_k: DEFAULT_APP_LIMIT,
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
      setSearchResults(appsFromApi)
      setSearchType("search")
    } catch (e: any) {
      if (aborted) return
      setSearchResults([])

      setSearchError(e?.message ?? t("searchFailed"))
    } finally {
      setSearchType("search")
      if (!aborted) setSearching(false)
    }
  }
  const handleSubmit = async(e: React.FormEvent) => {  
    e.preventDefault()
    await performSearch(inputValue)
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
      // 异步执行以确保状态更新后再搜索
      Promise.resolve().then(() => performSearch(qParam))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  
  return (
    <div
      className="flex min-h-screen flex-col"
      
    >
      <Navbar />
      <main className="flex-1">
        

        <section className="relative py-8 md:py-12 text-slate-900">
         
          <div className="relative z-10 mx-auto px-3">
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
                     <form onSubmit={handleSubmit} className="relative">
                        <div className="relative">
                        <input
                            type="text"
                            placeholder=""
                            className="h-11 file:text-foreground hover:border-[#0057FF] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex items-center justify-start text-2xl aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={searching}
                          />
                          <button
                            type="submit"
                            aria-label="Search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            disabled={searching}
                          >
                            {searching ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Search className="h-5 w-5 text-[#c5c5c5] cursor-pointer" />
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
                 {(appsLoading || searching ) && (
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
                    apps.length > 0 && (
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
                                  href={`/tools/${app.id}`}
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

                  {searchType !== "search" && !appsLoading && apps.length > 0 ? (
                    <div className="mt-6 flex items-center justify-center">
                      {appsPage < appsPages ? (
                        <Button
                          onClick={loadMoreApps}
                          disabled={appsLoadingMore}
                          variant="outline"
                        >
                          {appsLoadingMore ? t("loadingMore") : t("loadMore")}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{tCommon("loadedAll")}</span>
                      )}
                    </div>
                  ) : null}

                  {
                    searchResults?.length > 0 && (
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
                                  href={`/tools/${app.id}`}
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

