"use client"

import type React from "react"
import { useEffect } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {Search,ArrowRight} from "lucide-react"
import { useTranslations } from "next-intl"
interface DashboardSearchProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

export function DashboardSearch({ onSearch, initialQuery }: DashboardSearchProps) {
  const t = useTranslations("dashboard")
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // 同步外部初始查询到输入框
  useEffect(() => {
    if (typeof initialQuery === 'string') {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isSearching) return

    setIsSearching(true)
    try {
      await onSearch(query)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative transition-all duration-300 transform group-hover:-translate-y-0.5 group-hover:shadow-lg rounded-xl shadow-md bg-white">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-5 w-5 text-primary/60" />
        </div>
        <input
          type="text"
          className="w-full h-14 pl-12 border hover:border-[#0057FF] focus:border-[#0057FF] pr-12 rounded-xl border-0.5 bg-transparent text-base placeholder:text-muted-foreground  focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
          placeholder={t("placeholder")}
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          disabled={query.trim() === "" || isSearching}
          style={{color:query.trim() ? "#0057FF" : ""}}
          
        >
          {isSearching ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
    
  )
}
