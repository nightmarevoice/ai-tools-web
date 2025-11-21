"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, ArrowRight, Flame, MessageSquare, Bot, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { searchApi } from "@/lib/api/search"
import type { QuotaStatus } from "@/types/api"

export function DemoSearchBar() {
  const t = useTranslations("home.searchBar")
  const tQuota = useTranslations("quota")
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mode, setMode] = useState<"chat" | "agent">("chat")
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null)
  const [showQuotaWarning, setShowQuotaWarning] = useState(false)
  const [isCheckingQuota, setIsCheckingQuota] = useState(false)
  const router = useRouter()

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

  // 当弹窗打开时检查配额状态
  useEffect(() => {
    if (isOpen) {
      checkQuotaStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleInputClick = () => {
    setIsOpen(true)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // 预检查配额
    if (quotaStatus && !quotaStatus.allowed) {
      setShowQuotaWarning(true)
      return
    }

    setIsOpen(false)
    const dest = mode === "chat" ? "/categories" : "/dashboard"
    router.push(`${dest}?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogin = () => {
    setIsOpen(false)
    router.push("/login")
  }

  const handlePopularSearchClick = (searchTerm: string) => {
    setSearchQuery(searchTerm)
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
    <>
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative">
          <div
            
            className="w-full flex items-center justify-start pl-4 pr-12 h-15 rounded-xl border border-input bg-background px-4 py-2 text-base hover:border-[#0057FF] focus:border-[#0057FF] focus:border-[0.5px] transition-colors cursor-pointer"
           
            onClick={handleInputClick}
            
          >
          {t("placeholder")}
          </div>
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}  >
        <DialogContent className="w-4xl p-0 gap-0" style={{ width: '900px !important' }} showCloseButton={false}>
          <div className="p-6 space-y-6">
            {/* Quota Warning */}
            {showQuotaWarning && quotaStatus && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 text-base mb-1">
                        {quotaStatus.need_login
                          ? tQuota("warning.anonymousTitle")
                          : tQuota("warning.authenticatedTitle")}
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {quotaStatus.need_login
                          ? tQuota("warning.anonymousDescription", {
                              limit: quotaStatus.limit,
                              current: quotaStatus.current_count,
                              authLimit: 50
                            })
                          : tQuota("warning.authenticatedDescription", {
                              current: quotaStatus.current_count,
                              limit: quotaStatus.limit
                            })}
                      </p>
                    </div>
                    {quotaStatus.need_login && (
                      <Button
                        onClick={handleLogin}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {tQuota("warning.loginButton")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quota Info - Show remaining searches */}
            {!showQuotaWarning && quotaStatus && quotaStatus.quota_enabled && quotaStatus.remaining <= 2 && quotaStatus.remaining > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  {tQuota("info.remainingHint", { remaining: quotaStatus.remaining })}
                  {!quotaStatus.is_authenticated && tQuota("info.loginSuffix")}
                </p>
              </div>
            )}

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">

                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-4 pr-12 h-14 rounded-xl border-[#c6c3c3] border-[0.5px]  bg-background px-4 py-2 text-base hover:border-primary focus:border-primary focus:border-[0.5px] transition-colors cursor-pointer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isCheckingQuota}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCheckingQuota || !searchQuery.trim()}
                >
                  {isCheckingQuota ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Mode Selection */}
            <div className="space-y-3">
              
              <div className="flex gap-2 items-center">
                <h3 className="text-sm font-medium text-muted-foreground">{t("mode")}</h3>
                <Button
                  type="button"
                  variant={mode === "chat" ? "default" : "outline"}
                  onClick={() => setMode("chat")}
                  className=" gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{t("chatMode")}</span>
                </Button>
                <Button
                  type="button"
                  variant={mode === "agent" ? "default" : "outline"}
                  onClick={() => setMode("agent")}
                  className=" gap-2"
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
                    className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
