"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { searchApi } from "@/lib/api/search"
import ReactMarkdown from "react-markdown"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations, useLocale } from "next-intl"
import { FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

interface QuestionPageProps {
  question: string
  questionKey: string
}

export function QuestionPage({ question, questionKey }: QuestionPageProps) {
  const t = useTranslations("questionPage")
  const locale = useLocale()
  const [answer, setAnswer] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnswer = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await searchApi.query({
          user_query: question,
          enable_llm_summary: true,
          top_k: 10,
          lang: locale as any,
        })

        // 处理 API 响应
        if (response && typeof response === 'object') {
          const apiResponse = response as any
          const summary = apiResponse.llm_summary || ""
          setAnswer(summary)
        } else {
          const searchResponse = response as any
          setAnswer(searchResponse.llm_summary || "")
        }
      } catch (err) {
        console.error("Failed to fetch answer:", err)
        setError(err instanceof Error ? err.message : t("error.fetchFailed"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnswer()
  }, [question, locale, t])

  return (
    <div className="flex min-h-screen flex-col theme-0057ff">
      <Navbar />
      <main className="flex-1">
        <div className="relative py-8 md:py-12 z-10 mx-auto px-3 max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t("backToDashboard")}
            </Link>
          </div>

          {/* Question Section */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {t("question")}
                  </h1>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {question}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Section */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                {t("answer")}
              </h2>

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-red-800 font-medium">{t("error.title")}</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              ) : answer ? (
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
                    {answer}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("noAnswer")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

