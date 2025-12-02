"use client"

import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search, ArrowRight } from "lucide-react"
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
  Edit,
  Music,
  Share2,
  TrendingUp,
  Heart,
  Sparkles,
} from "lucide-react"
import { categoriesApi } from "@/lib/api/categories"
import { appsApi } from "@/lib/api/apps"
import type { Application, Category, Language, SemanticSearchResponse } from "@/types/api"
import { useTranslations, useLocale } from "next-intl"
import { useCategoryContext } from "@/components/category-context"

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // 一级分类图标映射（基于 key）
  "writing-content": Edit,
  "image-design": ImageIcon,
  "video": Video,
  "audio-music": Music,
  "social-media": Share2,
  "marketing-sales": TrendingUp,
  "productivity-office": Briefcase,
  "development-tech": Code2,
  "education-research": BookOpen,
  "business-services": Building2,
  "lifestyle-health": Heart,
  "ai-tools-fun": Sparkles,
  // 保留旧的映射以兼容
  "chat-agents": MessageSquare,
  productivity: Briefcase,
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


const DEFAULT_APP_LIMIT = 30

// 将 slug 转换为分类 key（slug 和 key 格式相同，都是 kebab-case）
function slugToKey(slug: string): string {
  return slug.toLowerCase().trim()
}

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
  const categoryContext = useCategoryContext()
  const [primaryCategories, setPrimaryCategories] = useState<Category[]>([])
  const [secondaryCategories, setSecondaryCategories] = useState<Record<string, Category[]>>({})
  const [loadingSecondaryCategories, setLoadingSecondaryCategories] = useState<Record<string, boolean>>({})
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number | null>(null) // 实际选中的分类 id（用于 API 调用）
  const [selectedPrimaryCategoryKey, setSelectedPrimaryCategoryKey] = useState<string | null>(null) // 选中的一级分类 key（用于 primary_category 查询）
  const [query, setQuery] = useState<string>("")
  const [inputValue, setInputValue] = useState<string>("")
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<string>("category")
  const [hoveredPrimaryCategoryId, setHoveredPrimaryCategoryId] = useState<string | number | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // 从 Context 中获取 slug
  const parentCategorySlug = categoryContext?.parentCategorySlug
  const categorySlug = categoryContext?.categorySlug
  
  // 用于存储解析后的分类信息
  const [resolvedParentCategory, setResolvedParentCategory] = useState<Category | null>(null)
  const [resolvedCategory, setResolvedCategory] = useState<Category | null>(null)
  
  // 优先从 Context 读取，如果没有则从 URL 查询参数读取
  // 如果 Context 中有 categoryId，使用它；如果只有 parentCategoryId，也使用它作为 typeParam
  const typeParam = categoryContext?.categoryId?.toString() ?? 
                    (categoryContext?.parentCategoryId && !categoryContext?.categoryId 
                      ? categoryContext.parentCategoryId.toString() 
                      : undefined) ??
                    searchParams?.get("type") ?? undefined
  const parentCategoryParam = categoryContext?.parentCategoryId?.toString() ?? searchParams?.get("parent_category") ?? undefined
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
  
  // 解析 slug 并找到对应的分类
  useEffect(() => {
    if (!parentCategorySlug || primaryCategories.length === 0) {
      setResolvedParentCategory(null)
      setResolvedCategory(null)
      return
    }

    // 查找一级分类
    const parentKey = slugToKey(parentCategorySlug)
    const parentCategory = primaryCategories.find(cat => cat.key === parentKey)
    
    if (!parentCategory) {
      console.warn(`Parent category not found for slug: ${parentCategorySlug}`)
      setResolvedParentCategory(null)
      setResolvedCategory(null)
      return
    }

    setResolvedParentCategory(parentCategory)

    // 如果有二级分类 slug，查找二级分类
    if (categorySlug) {
      const secondaryCats = secondaryCategories[parentCategory.key!] || []
      const categoryKey = slugToKey(categorySlug)
      const category = secondaryCats.find(cat => cat.key === categoryKey)
      
      if (!category) {
        console.warn(`Category not found for slug: ${categorySlug}`)
        setResolvedCategory(null)
      } else {
        setResolvedCategory(category)
      }
    } else {
      setResolvedCategory(null)
    }
  }, [parentCategorySlug, categorySlug, primaryCategories, secondaryCategories])
  
  // 根据解析后的分类设置状态
  // 注意：这个 useEffect 会在 loadSecondaryCategories 定义之后再次使用
  const resolvedParentCategoryRef = useRef(resolvedParentCategory)
  const resolvedCategoryRef = useRef(resolvedCategory)
  
  useEffect(() => {
    resolvedParentCategoryRef.current = resolvedParentCategory
    resolvedCategoryRef.current = resolvedCategory
  }, [resolvedParentCategory, resolvedCategory])
  
  useEffect(() => {
    if (!resolvedParentCategory) return

    // 设置激活的一级分类
    if (resolvedParentCategory.key && activeCategoryKey !== resolvedParentCategory.key) {
      setActiveCategoryKey(resolvedParentCategory.key)
    }

    // 设置选中的分类用于查询
    if (resolvedCategory) {
      // 有二级分类，使用二级分类 ID 查询
      if (selectedCategoryId !== resolvedCategory.id) {
        setSelectedCategoryId(resolvedCategory.id)
        setSelectedPrimaryCategoryKey(null) // 清除一级分类 key
      }
    } else if (parentCategorySlug && !categorySlug) {
      // 只有一级分类，使用一级分类 key 查询
      if (selectedPrimaryCategoryKey !== resolvedParentCategory.key) {
        setSelectedPrimaryCategoryKey(resolvedParentCategory.key!)
        setSelectedCategoryId(null) // 清除二级分类 ID
      }
    }
  }, [resolvedParentCategory, resolvedCategory, categorySlug, parentCategorySlug, activeCategoryKey, selectedCategoryId, selectedPrimaryCategoryKey])
  
  // 远程拉取一级分类数据（只加载分类，不加载应用数据）
  useEffect(() => {
    let aborted = false
    const fetchData = async () => {
      try {
        setLoadingCategories(true)
        setCategoriesError(null)
        setAppsError(null)

        // 只加载一级分类列表，不加载应用列表
        // 应用列表将在二级分类选中后由另一个 useEffect 加载
        const categoriesResponse = await categoriesApi.listPrimary(resolvedLang)

        if (aborted) return

        const cats = categoriesResponse.primary_categories ?? []
        setPrimaryCategories(cats)

        // 检查是否有搜索参数 q，如果有则不设置默认分类
        const qParam = searchParams?.get("q") ?? ""
        if (qParam.trim()) {
          // 有搜索参数时，不设置默认分类
          return
        }

        // 优先处理 slug 路由模式
        if (parentCategorySlug) {
          // 有 parentCategorySlug，说明是 /categories/[parent] 或 /categories/[parent]/[category]
          const parentKey = slugToKey(parentCategorySlug)
          const parentCategory = cats.find(c => c.key === parentKey)
          
          if (parentCategory?.key) {
            setActiveCategoryKey(parentCategory.key)
            // 不在这里设置 selectedCategoryId，等待 slug 解析完成后再设置
          }
          return
        }

        // 如果没有 slug，说明是 /categories 路由，不设置任何默认分类
        // 用户需要手动选择分类
      } catch (e: any) {
        if (aborted) return
        setCategoriesError(e?.message || t("loadAppsFailed"))
        setAppsError(e?.message ?? t("loadAppsFailed"))
      } finally {
        if (!aborted) {
          setLoadingCategories(false)
        }
      }
    }
    fetchData()
    return () => {
      aborted = true
    }
  }, [resolvedLang, t, typeParam, searchParams])

  // 移除了鼠标悬停时自动加载二级分类的逻辑，现在只在点击时加载





  // 加载二级分类的辅助函数
  // 使用 ref 来跟踪已加载的分类，避免重复加载
  const loadedCategoriesRef = useRef<Set<string | number>>(new Set())
  const loadingCategoriesRef = useRef<Set<string | number>>(new Set())

  const loadSecondaryCategories = useCallback(async (categoryKey: string) => {
    // 如果已经加载过或正在加载，直接返回
    if (loadedCategoriesRef.current.has(categoryKey) || loadingCategoriesRef.current.has(categoryKey)) {
      return
    }

    // 找到对应的一级分类
    const primaryCategory = primaryCategories.find(cat => cat.key === categoryKey)
    if (!primaryCategory || !primaryCategory.key) return

    // 标记为正在加载
    loadingCategoriesRef.current.add(categoryKey)
    setLoadingSecondaryCategories(prev => ({ ...prev, [categoryKey]: true }))

    try {
      const response = await categoriesApi.listSecondary(primaryCategory.key!, resolvedLang)

      // 标记为已加载
      loadedCategoriesRef.current.add(categoryKey)
      loadingCategoriesRef.current.delete(categoryKey)

      setSecondaryCategories(prev => ({
        ...prev,
        [categoryKey]: response.categories ?? []
      }))
    } catch (e: any) {
      console.error(`Failed to load secondary categories for ${categoryKey}:`, e)
      // 如果加载失败，也标记为已加载（避免重复尝试），设置为空数组
      loadedCategoriesRef.current.add(categoryKey)
      loadingCategoriesRef.current.delete(categoryKey)
      setSecondaryCategories(prev => ({
        ...prev,
        [categoryKey]: []
      }))
    } finally {
      setLoadingSecondaryCategories(prev => {
        const next = { ...prev }
        delete next[categoryKey]
        return next
      })
    }
  }, [primaryCategories, resolvedLang])

  // 初始化时（没有参数的情况下，或者有 typeParam 且是一级分类时），自动加载第一个一级分类的二级分类
  useEffect(() => {
    // 检查是否有搜索参数 q，如果有则不自动加载
    const qParam = searchParams?.get("q") ?? ""
    if (qParam.trim()) {
      return
    }

    // 如果没有 parentCategoryParam，且 activeCategoryKey 已设置
    // 这包括两种情况：
    // 1. 没有参数时，自动加载第一个一级分类的二级分类
    // 2. 有 typeParam 且是一级分类时，自动加载该一级分类的二级分类
    if (!parentCategoryParam && activeCategoryKey) {
      // 检查是否已经加载过该分类的二级分类
      const secondaryCats = secondaryCategories[activeCategoryKey] ?? []
      const isLoading = loadingSecondaryCategories[activeCategoryKey] ?? false
      
      // 如果还没有加载过且不在加载中，则加载二级分类
      if (secondaryCats.length === 0 && !isLoading) {
        loadSecondaryCategories(activeCategoryKey)
      }
    }
  }, [activeCategoryKey, parentCategoryParam, secondaryCategories, loadingSecondaryCategories, loadSecondaryCategories, searchParams])

  // 当有 categorySlug 时，加载对应的二级分类
  useEffect(() => {
    if (!categorySlug || !resolvedParentCategoryRef.current?.key) return
    
    const parentKey = resolvedParentCategoryRef.current.key
    const secondaryCats = secondaryCategories[parentKey] ?? []
    const isLoading = loadingSecondaryCategories[parentKey] ?? false
    
    // 如果还没有加载过且不在加载中，则加载二级分类
    if (secondaryCats.length === 0 && !isLoading) {
      loadSecondaryCategories(parentKey)
    }
  }, [categorySlug, secondaryCategories, loadingSecondaryCategories, loadSecondaryCategories])

  // 当二级分类加载完成且没有选中任何分类时，自动选中第一个二级分类
  // 注意：这个逻辑只在没有 slug 的情况下执行（旧的查询参数模式）
  useEffect(() => {
    if (!activeCategoryKey) return

    // 如果有 slug，不执行自动选中逻辑（slug 路由由另一个 useEffect 处理）
    if (parentCategorySlug) {
      return
    }

    // 检查是否有搜索参数 q，如果有则不自动选中分类
    const qParam = searchParams?.get("q") ?? ""
    if (qParam.trim()) {
      return
    }

    const secondaryCats = secondaryCategories[activeCategoryKey] ?? []

    // 如果有 parent_category 和 type 参数，说明是通过二级分类链接跳转过来的
    if (parentCategoryParam && typeParam) {
      // 在二级分类中查找对应的分类
      const targetSecondaryCategory = secondaryCats.find(cat => cat.id === typeParam || String(cat.id) === typeParam)
      if (targetSecondaryCategory) {
        // 找到对应的二级分类，选中它
        if (selectedCategoryId !== targetSecondaryCategory.id) {
          setSelectedCategoryId(targetSecondaryCategory.id)
        }
        return
      }
      // 如果找不到对应的二级分类，选中第一个
      if (secondaryCats.length > 0 && selectedCategoryId !== secondaryCats[0].id) {
        const firstSecondaryCategory = secondaryCats[0]
        if (firstSecondaryCategory) {
          setSelectedCategoryId(firstSecondaryCategory.id)
        }
      }
      return
    }

    // 如果有 typeParam 但没有 parent_category，说明可能是一级分类
    if (typeParam && !parentCategoryParam) {
      // 检查是否是一级分类
      const isPrimaryCategory = primaryCategories.some(cat => cat.id === typeParam)
      if (isPrimaryCategory) {
        // 如果是一级分类，且有二级分类，自动选中第一个（覆盖一级分类的 id）
        if (secondaryCats.length > 0 && selectedCategoryId !== secondaryCats[0].id) {
          const firstSecondaryCategory = secondaryCats[0]
          if (firstSecondaryCategory) {
            setSelectedCategoryId(firstSecondaryCategory.id)
          }
        }
        // 如果没有二级分类，保持使用一级分类的 id（已在初始加载时设置）
        return
      }
      // 如果不是一级分类，可能是二级分类，尝试查找
      const targetSecondaryCategory = secondaryCats.find(cat => cat.id === typeParam || String(cat.id) === typeParam)
      if (targetSecondaryCategory) {
        if (selectedCategoryId !== targetSecondaryCategory.id) {
          setSelectedCategoryId(targetSecondaryCategory.id)
        }
        return
      }
    }

    // 如果没有选中分类，且有二级分类，自动选中第一个
    if (!selectedCategoryId && secondaryCats.length > 0) {
      const firstSecondaryCategory = secondaryCats[0]
      if (firstSecondaryCategory) {
        setSelectedCategoryId(firstSecondaryCategory.id)
      }
    }
  }, [activeCategoryKey, secondaryCategories, selectedCategoryId, typeParam, parentCategoryParam, primaryCategories, searchParams, parentCategorySlug])

  const handleNavClick = useCallback(async (e: React.MouseEvent, key: string | number) => {
    e.preventDefault()

    // 清空浏览器 URL 参数
    if (pathname) {
      router.push(pathname)
    }

    // 点击分类时，清空搜索状态，切换到分类浏览模式
    setQuery("")
    setSearchResults([])
    setSearchType("category")
    setInputValue("")

    // 检查是否是一级分类（用 key 比较）
    const primaryCategory = primaryCategories.find(cat => cat.key === key)
    const isPrimaryCategory = !!primaryCategory

    if (isPrimaryCategory && primaryCategory) {
      // 如果当前一级菜单已经是选中状态，不需要做任何操作
      if (activeCategoryKey === primaryCategory.key) {
        return
      }
      // 如果是一级分类，使用 primary_category 参数查询
      setSelectedCategoryId(null) // 清空二级分类
      setSelectedPrimaryCategoryKey(primaryCategory.key!) // 设置一级分类 key
      hasLoadedAppsRef.current = null // 重置已加载标记
      // 显示二级菜单（使用 key）
      setHoveredPrimaryCategoryId(primaryCategory.key!)
      setActiveCategoryKey(primaryCategory.key!)
      // 加载二级分类
      await loadSecondaryCategories(key as string)
      return
    }
    // 二级分类，传入的 key 实际上是 id，找到所属的一级分类并设置 activeCategoryKey
    const categoryId = key
    // 如果切换了分类，重置已加载标记
    const loadKey = `category:${categoryId}`
    if (hasLoadedAppsRef.current !== loadKey) {
      hasLoadedAppsRef.current = null
    }
    setSelectedCategoryId(categoryId) // 保存实际选中的分类 id（用于 API 调用）
    setSelectedPrimaryCategoryKey(null) // 清空一级分类 key
    // 找到该二级分类所属的一级分类
    let parentCategoryKey: string | null = null
    for (const [primaryKey, secondaryCats] of Object.entries(secondaryCategories)) {
      if (secondaryCats.some(cat => cat.id === categoryId)) {
        parentCategoryKey = primaryKey
        break
      }
    }
    // 如果找到一级分类，设置其 key；否则尝试从 primaryCategories 中查找
    if (parentCategoryKey) {
      setActiveCategoryKey(parentCategoryKey)
    } else {
      // 如果没找到，可能是数据还没加载，尝试从 primaryCategories 中查找
      const primaryCategory = primaryCategories.find(cat => cat.id === categoryId)
      if (primaryCategory?.key) {
        setActiveCategoryKey(primaryCategory.key)
        setSelectedCategoryId(categoryId) // 如果是一级分类，也保存其 id
      }
    }
    const element = document.getElementById(`category-card-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [primaryCategories, loadSecondaryCategories, activeCategoryKey, secondaryCategories, router, pathname])

  // 移除此 useEffect，因为 activeCategoryKey 现在在初始加载时设置
  // useEffect(() => {
  //   if (categories.length === 0) return
  //   if (typeParam && categories.some((category) => category.id === typeParam)) {
  //     setActiveCategoryKey(typeParam)
  //     return
  //   }
  //   if (!activeCategoryKey) {
  //     setActiveCategoryKey(categories[0].key)
  //   }
  // }, [categories, typeParam, activeCategoryKey])

  useEffect(() => {
    if (!typeParam) return
    // 检查是否在一级分类或二级分类中
    const isInPrimary = primaryCategories.some((category) => category.id === typeParam)
    const isInSecondary = Object.values(secondaryCategories).some(cats =>
      cats.some(cat => cat.id === typeParam)
    )
    if (!isInPrimary && !isInSecondary) return
    const navEl = navRef.current
    if (!navEl) return
    const activeItem = navEl.querySelector<HTMLElement>(`[data-category-id="${typeParam}"]`)
    if (!activeItem) return
    const targetScroll = activeItem.offsetTop - navEl.clientHeight / 2 + activeItem.offsetHeight / 2
    navEl.scrollTo({
      top: Math.max(targetScroll, 0),
      behavior: "smooth",
    })
  }, [typeParam, primaryCategories, secondaryCategories])

  // 获取所有分类（一级+二级）用于查找activeCategory
  const allCategories = useMemo(() => {
    const all: Category[] = [...primaryCategories]
    Object.values(secondaryCategories).forEach(cats => {
      all.push(...cats)
    })
    return all
  }, [primaryCategories, secondaryCategories])

  const activeCategory = useMemo(() => {
    // 根据 activeCategoryKey 找到一级分类
    if (!activeCategoryKey) return null
    return primaryCategories.find((category) => category.key === activeCategoryKey) ?? null
  }, [primaryCategories, activeCategoryKey])

  // 拉取分类下的应用列表（仅在选中分类后执行）
  // 使用 ref 来跟踪是否已经加载过，避免重复加载
  const hasLoadedAppsRef = useRef<string | null>(null)

  useEffect(() => {
    // 如果既没有选中二级分类，也没有选中一级分类，不执行
    if (!selectedCategoryId && !selectedPrimaryCategoryKey) return

    // 生成唯一的加载标识
    const loadKey = selectedCategoryId 
      ? `category:${selectedCategoryId}` 
      : `primary:${selectedPrimaryCategoryKey}`

    // 如果已经加载过，不重复加载
    if (hasLoadedAppsRef.current === loadKey) return

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

        // 根据不同的查询模式使用不同的参数
        const params: any = {
          lang: (resolvedLang as Language | undefined) ?? undefined,
          page: 1,
          limit: DEFAULT_APP_LIMIT,
        }

        if (selectedCategoryId) {
          // 有二级分类，使用 category 参数
          params.category = selectedCategoryId
        } else if (selectedPrimaryCategoryKey) {
          // 只有一级分类，使用 primary_category 参数
          params.primary_category = selectedPrimaryCategoryKey
        }

        const response = await appsApi.list(params)
        if (aborted) return
        setApps(response.items ?? [])
        setAppsPage(response.page ?? 1)
        setAppsPages(response.pages ?? 1)
        setAppsTotal(response.total ?? 0)
        setSearchType("category")
        // 标记已加载
        hasLoadedAppsRef.current = loadKey
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
  }, [selectedCategoryId, selectedPrimaryCategoryKey, resolvedLang, t])

  const loadMoreApps = useCallback(async () => {
    if (!selectedCategoryId && !selectedPrimaryCategoryKey) return
    if (appsLoadingMore) return
    if (appsPage >= appsPages) return
    let aborted = false
    setAppsLoadingMore(true)
    setAppsError(null)
    try {
      const nextPage = appsPage + 1
      
      // 根据不同的查询模式使用不同的参数
      const params: any = {
        lang: (resolvedLang as Language | undefined) ?? undefined,
        page: nextPage,
        limit: DEFAULT_APP_LIMIT,
      }

      if (selectedCategoryId) {
        // 有二级分类，使用 category 参数
        params.category = selectedCategoryId
      } else if (selectedPrimaryCategoryKey) {
        // 只有一级分类，使用 primary_category 参数
        params.primary_category = selectedPrimaryCategoryKey
      }

      const response = await appsApi.list(params)
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
  }, [selectedCategoryId, selectedPrimaryCategoryKey, appsLoadingMore, appsPage, appsPages, apps, resolvedLang, appsTotal, t])
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
    // 搜索时清空分类选择
    if (page === 1) {
      setActiveCategoryKey(null)
      setSelectedCategoryId(null)
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchPage(1)
    setSearchResults([])
    // 清空分类选择
    setActiveCategoryKey(null)
    setSelectedCategoryId(null)
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
      // 清空分类选择
      setActiveCategoryKey(null)
      setSelectedCategoryId(null)
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
            <div className=" grid gap-8 md:grid-cols-[180px_1fr] lg:grid-cols-[180px_1fr]">
              <aside className="sticky top-20 h-max">
                <div className="relative">
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
                      primaryCategories.map((category) => {
                        // 搜索时不显示选中状态
                        const isSearching = searchType === "search" && query.trim() !== ""
                        const isActive = !isSearching && activeCategoryKey ? activeCategoryKey === category.key : false
                        const Icon: LucideIcon = (category.key && CATEGORY_ICON_MAP[category.key]) || Bot

                      return (
                          <div
                          key={category.id}
                            className="relative group"
                            onMouseEnter={() => setHoveredPrimaryCategoryId(category.key ?? null)}
                            onMouseLeave={() => setHoveredPrimaryCategoryId(null)}
                          >
                            <a
                          href={category.key ? `/categories/${category.key}` : "javascript:void(0)"}
                          data-category-id={category.id}
                              onClick={(e) => {
                                // 如果有一级分类，点击一级分类不切换，等待选择二级分类
                                // 传入 key 用于判断和加载二级分类
                                handleNavClick(e, category.key ?? category.id)
                              }}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors ${isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                              <span className="truncate flex-1">{category.name}</span>
                          
                        </a>
                          </div>
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
                </div>
              </aside>
              <div className="space-y-8">
                 {/* 查询 */}
                 <div className="rounded-lg max-w-2xl mx-auto bg-card p-3">
                   <div className="mb-2 text-center p-6">
                     <div className="text-lg font-medium">{t("searchBox.title")}</div>
                     <div className="text-xs text-muted-foreground">{t("searchBox.subtitle")}</div>
                   </div>
                   <div className="flex justify-center items-center gap-2">
                    <div className="relative " style={{ width: 500 }}>
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

                
                 <div className="rounded-xl border bg-card p-5">
                  {/* 二级分类菜单 */}
                  {activeCategoryKey && searchType !== "search" && (
                    <div className="mb-4 pb-4 border-b">
                      {loadingSecondaryCategories[activeCategoryKey] ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : (secondaryCategories[activeCategoryKey] ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(secondaryCategories[activeCategoryKey] ?? []).map((childCategory) => {
                            const isChildActive = selectedCategoryId === childCategory.id
                            return (
                              <a
                                key={childCategory.id}
                                href={activeCategoryKey && childCategory.key ? `/categories/${activeCategoryKey}/${childCategory.key}` : "javascript:void(0)"}
                                onClick={(e) => {
                                  handleNavClick(e, childCategory.id)
                                }}
                                className={`inline-flex items-center  rounded-md px-3 py-1.5 text-sm transition-colors ${isChildActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:text-white hover:bg-[#0057FF] hover:border-[#0057FF]"
                                  }`}
                              >
                                {childCategory.name}
                              </a>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  )}

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
                    <div className="grid gap-4 sm:grid-cols-3">
                     {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-2">
                          {/* 缩略图占位符 */}
                          <div className="mb-3 w-full aspect-video rounded-lg bg-muted animate-pulse" />
                         <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted animate-pulse" />
                           <div className="flex-1 space-y-2">
                             <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                             <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                           </div>
                         </div>
                          <div className="mt-4 flex items-center p-2 justify-between text-xs">
                           <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                           <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                         </div>
                       </div>
                     ))}
                   </div>
                  )}
                  {
                    searchType === "category" && apps.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-3">
                       {apps.map((app: Application) => (
                          <Link
                            key={app.id}
                            href={`/${locale}/tools/${app.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-lg border p-2 transition hover:border-primary cursor-pointer block"
                          >
                            {/* 缩略图 */}
                            {app.screenshot_url && (
                              <div className="mb-3 w-full aspect-video overflow-hidden rounded-lg border border-gray-200/60">
                                  <img
                                  src={app.screenshot_url.replace(/^http:\/\//, "https://")}
                                    alt={app.app_name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  referrerPolicy="no-referrer"
                                  />
                              </div>
                            )}
                              <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                                  <img
                                    src={app.icon_url?.replace(/^http:\/\//, "https://")}
                                    alt={app.app_name}
                                    className="h-full w-full rounded-lg object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="text-base hover:text-[#0057FF] font-semibold line-clamp-1 flex-1">
                                  {app.app_name}
                                </div>
                              </div>
                                {app.product_description ? (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {app.product_description}
                                  </p>
                                ) : null}
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {app.categories?.slice(0, 2).map((cat, index) => (
                                    <span
                                      key={`${cat.category}-${index}`}
                                    className="rounded-full border px-2 py-0.5 whitespace-nowrap"
                                    >
                                      {cat.name}
                                    </span>
                                  ))}
                                {app.categories && app.categories.length > 2 && (
                                  <span className="rounded-full border px-2 py-0.5 whitespace-nowrap">
                                    ...
                                  </span>
                                )}
                                </div>
                              </div>
                          </Link>
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
                          <Link
                            key={app.id}
                            href={`/${locale}/tools/${app.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-lg border p-2 transition hover:border-primary cursor-pointer block"
                          >
                            {/* 缩略图 */}
                            {app.screenshot_url && (
                              <div className="mb-3 w-full aspect-video overflow-hidden rounded-lg border border-gray-200/60">
                                  <img
                                  src={app.screenshot_url.replace(/^http:\/\//, "https://")}
                                    alt={app.app_name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  referrerPolicy="no-referrer"
                                  />
                              </div>
                            )}
                              <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                                  <img
                                    src={app.icon_url?.replace(/^http:\/\//, "https://")}
                                    alt={app.app_name}
                                    className="h-full w-full rounded-lg object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="text-base font-semibold line-clamp-1 flex-1">
                                  {app.app_name}
                                </div>
                              </div>
                                {app.product_description ? (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {app.product_description}
                                  </p>
                                ) : null}
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {app.categories?.slice(0, 2).map((cat, index) => (
                                    <span
                                      key={`${cat.category}-${index}`}
                                    className="rounded-full border px-2 py-0.5 whitespace-nowrap"
                                    >
                                      {cat.name}
                                    </span>
                                  ))}
                                {app.categories && app.categories.length > 2 && (
                                  <span className="rounded-full border px-2 py-0.5 whitespace-nowrap">
                                    ...
                                  </span>
                                )}
                                </div>
                              </div>
                          </Link>
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

