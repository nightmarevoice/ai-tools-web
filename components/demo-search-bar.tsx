"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { Search, Flame, MessageSquare, Bot, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { searchApi } from "@/lib/api/search"
import { appsApi } from "@/lib/api/apps"
import type { QuotaStatus, Application } from "@/types/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DemoSearchBar() {
  const t = useTranslations("home.searchBar")
  const tQuota = useTranslations("quota")
  const tLoginPrompt = useTranslations("loginPrompt")
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mode, setMode] = useState<"chat" | "agent">("chat")
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [showQuotaWarning, setShowQuotaWarning] = useState(false)
  const [isCheckingQuota, setIsCheckingQuota] = useState(false)
  const [searchResults, setSearchResults] = useState<Application[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const checkQuotaStatus = async () => {
    setIsCheckingQuota(true)
    try {
      const status = await searchApi.checkQuota()
      setQuotaStatus(status)
      setShowQuotaWarning(false)
    } catch (error) {
      console.error("Failed to check quota status:", error)
      // 如果检查失败,允许继续搜索
      setQuotaStatus(null)
    } finally {
      setIsCheckingQuota(false)
    }
  }

  // 当下拉打开时检查配额状态
  useEffect(() => {
    if (isOpen) {
      checkQuotaStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])


  // 计算下拉菜单位置
  useEffect(() => {
    if (isOpen && containerRef.current && inputRef.current) {
      const updatePosition = () => {
        const rect = containerRef.current!.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8, // mt-2 = 8px
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
      
      updatePosition()
      window.addEventListener("resize", updatePosition)
      window.addEventListener("scroll", updatePosition, true)
      
      return () => {
        window.removeEventListener("resize", updatePosition)
        window.removeEventListener("scroll", updatePosition, true)
      }
    }
  }, [isOpen])

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        dropdownRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  // 监听搜索输入，使用 debounce 调用搜索接口
  useEffect(() => {
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 如果搜索框为空，清空搜索结果
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // 设置 debounce，500ms 后执行搜索
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await appsApi.search(searchQuery.trim(), {
          lang: locale,
          limit: 6,
        })
        setSearchResults(response.items || [])
      } catch (error) {
        console.error("Search failed:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    // 清理函数
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, locale])

  // 点击搜索结果项
  const handleSearchResultClick = useCallback((app: Application) => {
    setIsOpen(false)
    setSearchQuery("")
    setSearchResults([])
    // 在新窗口打开应用详情页
    window.open(`/${locale}/tools/${app.id}`, '_blank')
  }, [locale])

  const handleInputClick = () => {
    setIsOpen(true)
  }

  const handleSearch = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    // 先查询配额
    let currentQuotaStatus = quotaStatus
    if (!currentQuotaStatus) {
      try {
        currentQuotaStatus = await searchApi.checkQuota()
        setQuotaStatus(currentQuotaStatus)
      } catch (error) {
        console.error("Failed to check quota status:", error)
        // 如果检查失败,允许继续搜索
        currentQuotaStatus = null
      }
    }

    // 检查配额是否允许
    if (currentQuotaStatus && !currentQuotaStatus.allowed) {
      setShowQuotaWarning(true)
      return
    }

    

    setIsOpen(false)
    const dest = mode === "chat" ? "/categories" : "/dashboard"
    router.push(`${dest}?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogin = () => {
    setShowQuotaWarning(false)
    setIsOpen(false)
    router.push("/login")
  }

  const handlePopularSearchClick = async (searchTerm: string) => {
    setSearchQuery(searchTerm)

    // 先查询配额
    let currentQuotaStatus = quotaStatus
    if (!currentQuotaStatus) {
      try {
        currentQuotaStatus = await searchApi.checkQuota()
        setQuotaStatus(currentQuotaStatus)
      } catch (error) {
        console.error("Failed to check quota status:", error)
        // 如果检查失败,允许继续搜索
        currentQuotaStatus = null
      }
    }

    // 检查配额是否允许
    if (currentQuotaStatus && !currentQuotaStatus.allowed) {
      setShowQuotaWarning(true)
      setIsOpen(false)
      return
    }


    setIsOpen(false)
    const dest = mode === "chat" ? "/categories" : "/dashboard"
    router.push(`${dest}?q=${encodeURIComponent(searchTerm)}`)
  }

  const popularSearches = [
    t("popularKeywords.travelPlanning"),
    t("popularKeywords.interiorDesign"),
    t("popularKeywords.podcastProduction"),
    t("popularKeywords.imageGeneration"),
    t("popularKeywords.languageTranslation")
  ]

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          className="w-full flex items-center justify-start pl-4 pr-12 h-15 rounded-xl border border-input bg-background px-4 py-2 text-base hover:border-[#0057FF] focus:border-[#0057FF] focus:border-[0.5px] focus:outline-none focus-visible:outline-none transition-colors cursor-pointer"
          onClick={handleInputClick}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e)
            }
          }}
          placeholder={mode === "chat" ? t("placeholder") : t("agentPlaceholder")}
        />
        <button
          type="button"
          onClick={handleSearch}
          style={{color:searchQuery.trim() ? "#0057FF" : "#c5c5c5"}}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-[#0057FF] transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Dropdown Panel - 使用 Portal 渲染到 body */}
      {isOpen && typeof window !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          className="absolute  bg-background border border-border rounded-xl shadow-lg z-[49] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          style={{
            top: `25rem`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxWidth: '672px',
          }}
        >
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Mode Selection */}
            <div className="space-y-3">
              
              <div className="flex gap-2 items-center">
                <h3 className="text-sm font-medium text-muted-foreground">{t("mode")}</h3>
                <Button
                  type="button"
                  variant={mode === "chat" ? "default" : "outline"}
                  onClick={() => setMode("chat")}
                  className={mode === "chat" ? "bg-[#0057FF] text-[#fff] cursor-pointer" : "bg-transparent"}
                  style={{ backgroundColor: mode === "chat" ? "#0057FF" : "transparent" }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{t("chatMode")}</span>
                </Button>
                <Button
                  type="button"
                  variant={mode === "agent" ? "default" : "outline"}
                  onClick={() => setMode("agent")}
                  className={mode === "agent" ? "bg-[#0057FF] text-[#fff] cursor-pointer" : "bg-transparent"}
                  style={{ backgroundColor: mode === "agent" ? "#0057FF" : "transparent" }}
                >
                  <Bot className="h-4 w-4" />
                  <span>{t("agentMode")}</span>
                </Button>
              </div>
            </div>

            {/*模糊查询工具*/}
            {searchQuery.trim() && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-[#0057FF]" />
                  <h3 className="font-bold text-lg">搜索结果</h3>
                  {isSearching && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {isSearching ? (
                  <div className="text-sm text-muted-foreground py-4">
                    正在搜索...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-4 grid-cols-3">
                    {searchResults.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleSearchResultClick(app)}
                        className="w-full text-left px-4 py-3 rounded-lg border border-input bg-background hover:bg-[#0057ff]/90 hover:text-white transition-colors cursor-pointer flex flex-col gap-2"
                      >
                        {/* 图标 + 名称 */}
                        <div className="flex items-center gap-2">
                          {app.icon_url ? (
                            <img
                              src={app.icon_url}
                              alt={app.app_name}
                              className="w-5 h-5 rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded bg-[#0057FF] flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">
                                {app.app_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="font-medium truncate">{app.app_name}</div>
                        </div>
                        {/* 描述 - 单行省略 */}
                        {app.short_description && (
                          <div className="text-sm  line-clamp-1">
                            {app.short_description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4">
                    未找到相关工具
                  </div>
                )}
              </div>
            )}

            {/* Popular Searches */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-lg">{t("popularSearches")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSearchClick(search)}
                    className="px-4 py-2 cursor-pointer rounded-lg border border-input bg-background hover:bg-[#0057ff] hover:text-white transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Quota Warning Dialog */}
      <Dialog open={showQuotaWarning} onOpenChange={setShowQuotaWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                    {tLoginPrompt("title")}
                </DialogTitle>
                <DialogDescription className="text-base pt-2 ">
                    {tLoginPrompt("description")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {quotaStatus?.need_login && (
           
              <div className="flex justify-center" >
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="bg-primary text-[#fff] hover:text-[#fff] cursor-pointer hover:bg-primary/90"
                >
                  {tQuota("warning.loginButton")}
                </Button>
              </div>
          )}
        </DialogContent>
      </Dialog>

     
    </div>
  )
}
