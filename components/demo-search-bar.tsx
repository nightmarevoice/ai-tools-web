"use client"

import type React from "react"

import { useState } from "react"
import { Search, ArrowRight, Flame, MessageSquare, Bot } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export function DemoSearchBar() {
  const t = useTranslations("home.searchBar")
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mode, setMode] = useState<"chat" | "agent">("chat")
  const router = useRouter()

  const handleInputClick = () => {
    setIsOpen(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsOpen(false)
    const dest = mode === "chat" ? "/categories" : "/dashboard"
    router.push(`${dest}?q=${encodeURIComponent(searchQuery.trim())}`)
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
            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-4 pr-12 h-14 rounded-xl border-[#c6c3c3] border-[0.5px]  bg-background px-4 py-2 text-base hover:border-primary focus:border-primary focus:border-[0.5px] transition-colors cursor-pointer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
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
