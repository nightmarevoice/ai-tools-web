"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SearchResult } from "@/types/api"
import { useTranslations, useLocale } from "next-intl"

// 推荐工具静态数据（不包含需要国际化的文本）
const RECOMMENDED_TOOLS = [
  {
    id: 1199,
    app_name: "google-gemini",
    relevance_score: 0.95,
    url: "https://gemini.google/",
    icon_url: "http://cdn.deepinsightqa.com/collect_icon/google-gemini.png",
    descriptionKey: "googleGemini" as const,
  },
  {
    id: 394,
    app_name: "DALL-E 3",
    relevance_score: 0.92,
    url: "https://openai.com/dall-e-3",
    icon_url: "http://cdn.deepinsightqa.com/collect_icon/dall-e-3.png",
    descriptionKey: "dalle3" as const,
  },
  {
    id: 4450,
    app_name: "GitHub Copilot",
    relevance_score: 0.90,
    url: "https://github.com/features/copilot",
    icon_url: "http://cdn.deepinsightqa.com/collect_icon/github-copilot.png",
    descriptionKey: "githubCopilot" as const,
  },
  {
    id: 223,
    app_name: "Midjourney",
    relevance_score: 0.88,
    url: "https://www.midjourney.com",
    icon_url: "http://cdn.deepinsightqa.com/collect_icon/midjourney.png",
    descriptionKey: "midjourney" as const,
  },
  {
    id: 4525,
    app_name: "Claude Code",
    relevance_score: 0.85,
    url: "https://www.claude.com",
    icon_url: "http://cdn.deepinsightqa.com/collect_icon/claude-code.png",
    descriptionKey: "claudeCode" as const,
  },
] as const

export function RecommendedTools() {
  const t = useTranslations("recommendedTools")
  const locale = useLocale()
  
  return (
    <div className="sticky top-6">
      <Card className="border-blue-200/40 bg-white/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {RECOMMENDED_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="group"
            >
              <div className="p-3 rounded-lg border border-gray-200/60 bg-white/40 hover:border-blue-400/70 hover:bg-white/80 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/${locale}/tools/${tool.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      {tool.icon_url ? (
                        <img
                          src={tool.icon_url}
                          alt={tool.app_name}
                          className="w-6 h-6 rounded-sm border border-gray-200 flex-shrink-0"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                        {tool.app_name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {t(`tools.${tool.descriptionKey}`)}
                    </p>
                  </Link>
                  {tool.url && (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-1.5 hover:bg-blue-100/60 rounded transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}





















