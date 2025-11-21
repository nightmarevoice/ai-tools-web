"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { SearchResult, SemanticSearchResponse } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

interface PaperResultsProps {
  results: SemanticSearchResponse | null
  loading: boolean
  error: string | null
  query: string
}

export function PaperResults({ results, loading, error, query }: PaperResultsProps) {
  const t = useTranslations("paperResults")
  const searchResults = results?.results ?? []
  const summary = results?.llm_summary ?? ""

  const renderContent = () => {
    if (!query) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {t("emptyPrompt")} <span className="font-medium">{t("emptyExample")}</span>
          </CardContent>
        </Card>
      )
    }

    if (loading) {
      return (
        <>
          {[1].map((i) => (
            <Card key={`skeleton-${i}`}>
              <CardHeader className="pb-2">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </>
      )
    }

    if (searchResults.length === 0) {
      return (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">{t("noResults")}</CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {query 
            ? (loading ? t("searching") : t("foundResults", { count: searchResults.length })) 
            : t("findTools")
          }
        </p>
      </div>

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("aiSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  // 自定义链接组件，支持内部链接和外部链接
                  a: ({ node, href, children, ...props }) => {
                    // 将形如 http(s)://<host[:port]>/apps/:id 或 /apps/:id 的链接替换为站内链接 /tools/:id
                    if (href) {
                      const absoluteAppsPathMatch = href.match(/^https?:\/\/[^/]+\/apps\/(\d+)(?:[\/?#]|$)/)
                      const relativeAppsPathMatch = href.match(/^\/apps\/(\d+)(?:[\/?#]|$)/)
                      const appId = absoluteAppsPathMatch?.[1] ?? relativeAppsPathMatch?.[1]
                      if (appId) {
                        return (
                          <Link
                            href={`/tools/${appId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                            {...props}
                          >
                            {children}
                          </Link>
                        )
                      }
                    }
                    // 检查是否是内部链接（格式：`[**app-name**](https://moge.ai/zh/product/app-name)`）
                    if (href && href.includes('moge.ai')) {
                      // 提取 app name 从 URL
                      const appNameMatch = href.match(/product\/([^/]+)/)
                      if (appNameMatch) {
                        return (
                          <Link
                            href={`/tools/${appNameMatch[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                            {...props}
                          >
                            {children}
                          </Link>
                        )
                      }
                    }
                    // 外部链接
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  },
                  // 自定义代码块样式
                  code: ({ node, className, children, ...props }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">{renderContent()}</div>
    </div>
  )
}





