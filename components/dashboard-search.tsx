"use client"

import type React from "react"
import { useEffect } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {Search} from "lucide-react"
interface DashboardSearchProps {
  onSearch: (query: string) => void
  initialQuery?: string
}

export function DashboardSearch({ onSearch, initialQuery }: DashboardSearchProps) {
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
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
      <input
          type="text"
          placeholder=""
          className="h-11 file:text-foreground hover:border-[#0057FF] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex items-center justify-start text-2xl aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          disabled={!query.trim() || isSearching}
        >
          {isSearching ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Search className="h-5 w-5 text-[#c5c5c5] cursor-pointer" />
          )}
        </button>

        
      </div>
    </form>
  )
}
