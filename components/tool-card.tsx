"use client"

import React, { useState } from "react"
import { ExternalLink, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"

export interface Tool {
  id: number
  name: string
  monthly_visits?: number
  description: string
  category: string
  pricing: string  
  isHot: boolean,
  isTrending: boolean,
  isCategory:boolean,
  categories?: string[]
  icon?: string
  icon_url?: string
  screenshot_url?:string
}

export function ToolCard({ tool }: { tool: Tool }) {
  const t = useTranslations("common")
  const locale = useLocale()
  const [iconError, setIconError] = useState(false)
  
  const iconUrl = tool.icon || tool.icon_url
  const showIcon = iconUrl && !iconError
  
  const pricingBadgeStyle = {
    Free: "bg-green-100/80 text-green-700 border border-green-300/50",
    Freemium: "bg-yellow-100/80 text-yellow-700 border border-yellow-300/50",
    Paid: "bg-blue-100/80 text-blue-700 border border-blue-300/50",
  }

  return (
    <Link
      href={`/${locale}/tools/${tool.id}`}
      target="_blank"
      rel="noopener noreferrer"
      prefetch={true}
      className="group  rounded-xl border border-blue-200/40 bg-white/60 backdrop-blur-sm hover:border-blue-400/70 shadow-md hover:shadow-xl hover:shadow-blue-300/40 hover:bg-white transition-all duration-150 hover:-translate-y-1 block"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 ">
            {/*缩略图*/}
            <div className="pb-2">
              {tool.screenshot_url && (
                  <div className="w-full aspect-video overflow-hidden rounded-lg border border-gray-200/60">
                    <img
                      src={tool.screenshot_url}
                      alt={tool.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
            </div>
            <div className="flex items-center gap-2 py-2 px-4">
              
              {/* 图标 */}
              <div className="flex-shrink-0">
                {showIcon ? (
                  <img
                    src={iconUrl}
                    alt={tool.name}
                    className="w-8 h-8  border border-gray-200/60 object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setIconError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/40">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>
                )}
              </div>
              <h3 className="text-lg  font-semibold text-gray-900 group-hover:text-blue-600 transition">{tool.name}</h3>
              {tool.isTrending && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100/90 text-green-700 rounded-full border border-green-300/50">
                    ✨ {t("trending")}
                </span>
              )}
              {tool.isHot && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100/90 text-red-700 rounded-full border border-red-300/50">
                  🔥 {t("hot")}
                </span>
              )}
            </div>
            <p className="text-sm  px-4 text-gray-600 leading-relaxed mb-2 line-clamp-1">{tool.description}</p>
            
            {tool.categories && tool.categories.length > 0 && (
              <div className="flex  px-4 mb-4 flex-wrap items-center gap-1.5">
                {tool.categories.slice(0, 2).map((category, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs font-medium bg-[#0057FF]/10 text-[#0057FF] rounded-lg border border-[#0057FF]/30"
                  >
                    {category}
                  </span>
                ))}
                {tool.categories.length > 2 && (
                  <span className=" text-xs font-medium text-gray-500">
                    ...
                  </span>
                )}
              </div>
            )} 
          </div>
         
        </div>

       
      </div>
    </Link>
  )
}