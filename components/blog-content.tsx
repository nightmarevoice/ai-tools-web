"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"

export function BlogContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // 设置超时，如果 10 秒后还没加载完成，显示错误
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [loading])

  return (
      
      <main className="flex-1 relative w-full" style={{ minHeight: "100vh" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">无法加载博客内容</p>
              <a
                href="https://ai-apphub-blog.zeabur.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                在新窗口中打开
              </a>
            </div>
          </div>
        )}
        <iframe
          src="https://ai-apphub-blog.zeabur.app/"
          className="w-full h-full border-0"
          title="AI Hub Blog"
          allow="fullscreen"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          onLoad={() => {
            setLoading(false)
            setError(false)
          }}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
          style={{ 
            display: error ? "none" : "block",
            minHeight: "100vh"
          }}
        />
      </main>
  )
}

