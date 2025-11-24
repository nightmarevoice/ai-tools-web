"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { ExternalLink, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { SearchResult, SemanticSearchResponse } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations, useLocale } from "next-intl"

interface PaperResultsProps {
  results: SemanticSearchResponse | null
  loading: boolean
  error: string | null
  query: string
}

export function PaperResults({ results, loading, error, query }: PaperResultsProps) {
  const t = useTranslations("paperResults")
  const locale = useLocale()
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
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <FileText className="h-16 w-16 text-primary" />
                  {/* 文字生成动画效果 */}
                  <motion.div
                    className="absolute -right-2 -top-2 flex space-x-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1 w-1 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
                {/* 脉冲效果 */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </motion.div>
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-base font-medium text-foreground"
                >
                  {t("generating")}
                </motion.div>
                <motion.div
                  className="flex space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="text-base font-medium text-foreground"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    >
                      .
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                            href={`/${locale}/tools/${appId}`}
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
                            href={`/${locale}/tools/${appNameMatch[1]}`}
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





