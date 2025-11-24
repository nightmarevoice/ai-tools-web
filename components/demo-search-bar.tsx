"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, ArrowRight, Flame, MessageSquare, Bot, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { searchApi } from "@/lib/api/search"
import type { QuotaStatus } from "@/types/api"
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
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mode, setMode] = useState<"chat" | "agent">("chat")
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [showQuotaWarning, setShowQuotaWarning] = useState(false)
  const [isCheckingQuota, setIsCheckingQuota] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0  mt-2 bg-background border border-border rounded-xl shadow-lg z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          style={{ width: '672px' }}
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
        </div>
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
