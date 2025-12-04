'use client'

import { useState } from 'react'
import { appsApi } from '@/lib/api/apps'
import type { Application } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, AlertCircle, Image, CheckCircle2 } from 'lucide-react'

interface ScreenshotIssue {
  app: Application
  reason: 'empty' | 'small' | 'error'
  size?: number
  error?: string
  localPath?: string
}

export default function TestScreenshotPage() {
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState<ScreenshotIssue[]>([])
  const [totalApps, setTotalApps] = useState(0)
  const [checkedCount, setCheckedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 检查图片大小（下载到本地检查）
  const checkImageSize = async (
    url: string,
    appId: number
  ): Promise<{ size: number; filePath?: string }> => {
    try {
      const response = await fetch('/api/check-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, appId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '检查失败')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || '检查失败')
      }

      return {
        size: result.size,
        filePath: result.filePath,
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('未知错误')
    }
  }

  const checkScreenshots = async () => {
    setLoading(true)
    setError(null)
    setIssues([])
    setCheckedCount(0)

    try {
      // 获取所有应用（可能需要分页获取）
      let allApps: Application[] = []
      let page = 1
      const limit = 100
      let hasMore = true

      while (hasMore) {
        const response = await appsApi.list({ page, limit })
        allApps = [...allApps, ...response.items]
        setTotalApps(response.total)
        setCheckedCount(allApps.length)

        if (response.items.length < limit || allApps.length >= response.total) {
          hasMore = false
        } else {
          page++
        }
      }

      // 检查每个应用的 screenshot_url
      const foundIssues: ScreenshotIssue[] = []

      for (let i = 0; i < allApps.length; i++) {
        const app = allApps[i]
        setCheckedCount(i + 1)

        // 检查 screenshot_url 是否为空
        if (!app.screenshot_url || app.screenshot_url.trim() === '') {
          foundIssues.push({
            app,
            reason: 'empty',
          })
          continue
        }

        // 检查图片大小（下载到本地）
        try {
          const result = await checkImageSize(app.screenshot_url, app.id)
          const sizeKB = result.size / 1024

          if (sizeKB < 10) {
            foundIssues.push({
              app,
              reason: 'small',
              size: sizeKB,
              localPath: result.filePath,
            })
          }
        } catch (err) {
          // 如果检查失败，也记录为问题
          foundIssues.push({
            app,
            reason: 'error',
            error: err instanceof Error ? err.message : '未知错误',
          })
        }

        // 更新状态以显示进度
        if (i % 10 === 0) {
          setIssues([...foundIssues])
        }
      }

      setIssues(foundIssues)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const emptyIssues = issues.filter((i) => i.reason === 'empty')
  const smallIssues = issues.filter((i) => i.reason === 'small')
  const errorIssues = issues.filter((i) => i.reason === 'error')

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="size-5" />
            截图链接检查工具
          </CardTitle>
          <CardDescription>
            筛选 screenshot_url 为空或图片大小小于 10KB 的应用。图片将下载到本地
            /public/image 目录进行检查。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={checkScreenshots} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  检查中...
                </>
              ) : (
                '开始检查'
              )}
            </Button>
            {loading && (
              <div className="text-sm text-muted-foreground">
                已检查: {checkedCount} / {totalApps || '...'}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-4" />
                <span className="font-medium">错误</span>
              </div>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          )}

          {issues.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{emptyIssues.length}</div>
                    <div className="text-sm text-muted-foreground">
                      截图链接为空
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{smallIssues.length}</div>
                    <div className="text-sm text-muted-foreground">
                      图片小于 10KB
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{errorIssues.length}</div>
                    <div className="text-sm text-muted-foreground">
                      检查失败
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">问题应用列表 ({issues.length})</h3>
                <div className="max-h-[600px] space-y-2 overflow-y-auto">
                  {issues.map((issue) => (
                    <Card key={issue.app.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="font-medium">{issue.app.app_name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {issue.app.id}
                            </div>
                            {issue.app.screenshot_url && (
                              <div className="text-xs text-muted-foreground break-all">
                                链接: {issue.app.screenshot_url}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {issue.reason === 'empty' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                  <AlertCircle className="size-3" />
                                  链接为空
                                </span>
                              )}
                              {issue.reason === 'small' && issue.size !== undefined && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                  <AlertCircle className="size-3" />
                                  图片大小: {issue.size.toFixed(2)} KB
                                </span>
                              )}
                              {issue.reason === 'error' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  <AlertCircle className="size-3" />
                                  检查失败: {issue.error}
                                </span>
                              )}
                            </div>
                          </div>
                          {issue.localPath && (
                            <img
                              src={issue.localPath}
                              alt={issue.app.app_name}
                              className="h-20 w-32 rounded border object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {!issue.localPath &&
                            issue.app.screenshot_url &&
                            issue.reason !== 'empty' &&
                            issue.reason !== 'error' && (
                              <img
                                src={issue.app.screenshot_url}
                                alt={issue.app.app_name}
                                className="h-20 w-32 rounded border object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && issues.length === 0 && totalApps > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-50 p-4 dark:bg-green-900/10">
              <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-400">
                所有应用的截图链接都正常！
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

