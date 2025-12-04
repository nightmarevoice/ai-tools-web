"use client"

import type React from "react"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DemoSearchBar } from "@/components/demo-search-bar"
import { AiToolsTabs } from "@/components/ai-tools-tabs"
import { CategoryExploration } from "../components/category-exploration"
import { TestimonialCard } from "@/components/testimonial-card"
import { CategoryNav } from "@/components/category-nav"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"

interface BlogPost {
  id: number
  title: {
    rendered: string
  }
  link: string
  excerpt: {
    rendered: string
  }
  date: string
  featured_media: number
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      media_details?: {
        sizes?: {
          medium?: { source_url: string }
          medium_large?: { source_url: string }
          large?: { source_url: string }
          full?: { source_url: string }
        }
      }
    }>
  }
}

export function HomeContent() {
  const t = useTranslations("home")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch(
          "https://blog.i-toolshub.com/wp-json/wp/v2/posts?per_page=4&_embed=true"
        )
        if (response.ok) {
          const data = await response.json()
          setBlogPosts(data)
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 清理 HTML 标签
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim()
  }

  // 获取文章特色图片
  const getFeaturedImage = (post: BlogPost): string | null => {
    const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0]
    if (!featuredMedia) return null
    
    // 优先使用 medium_large，如果没有则使用 medium，最后使用 full
    return (
      featuredMedia.media_details?.sizes?.medium_large?.source_url ||
      featuredMedia.media_details?.sizes?.medium?.source_url ||
      featuredMedia.media_details?.sizes?.large?.source_url ||
      featuredMedia.source_url
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col overflow-visible"
      style={
        {
          // Scope theme to this page (values as HSL triplets for Tailwind)
          ["--primary" as any]: "217 100% 54%",
          ["--primary-foreground" as any]: "0 0% 100%",
          ["--ring" as any]: "217 100% 54%",
          ["--sidebar-primary" as any]: "217 100% 54%",
          ["--sidebar-primary-foreground" as any]: "0 0% 100%",
        } as React.CSSProperties
      }
    >
      

      <Navbar />

      {/* Hero Section */}
      <section
        className="relative pt-24 md:pt-32 text-slate-900 z-10 overflow-visible"
      >
        {/* 背景层 - 固定定位，覆盖整个视口包括 Navbar */}
        <div className="pointer-events-none position h-full inset-0 z-0">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsla(var(--primary)_/_0.35),transparent_55%),radial-gradient(circle_at_top_right,hsla(var(--primary)_/_0.22),transparent_60%)] opacity-90" />
          <div className="absolute inset-0 opacity-35 bg-[linear-gradient(120deg,hsla(var(--primary)_/_0.18)_0%,rgba(255,255,255,0)_65%)]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,hsla(var(--primary)_/_0.14)_1px,transparent_1px),linear-gradient(to_bottom,hsla(var(--primary)_/_0.14)_1px,transparent_1px)] bg-[size:120px_120px]" />
          <div className="absolute inset-x-0 top-[60vh] h-[40vh] bg-gradient-to-b from-transparent via-white/85 to-white" />
        </div>
        <div className="relative w-full py-12 md:pb-32 px-8 md:px-10 overflow-visible" style={{ paddingBottom: '240px' }}>
          <div className="flex flex-col justify-center items-center overflow-visible">
            <div className="flex flex-col justify-center items-center space-y-10 text-center overflow-visible">
              <div className="space-y-5 flex flex-col justify-center items-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
                  {t("hero.title")}
                </h1>
                <p className="max-w-2xl text-base text-slate-600 md:text-xl">
                  {t("hero.subtitle")}
                </p>
              </div>
              <div className="w-full max-w-3xl overflow-visible">
                <DemoSearchBar />
              </div>
            </div>
          </div>
        </div>
      </section>

     

     


      {/* AI 工具区块（热门趋势 / 最新收录 / 编辑精选） */}
      <section className="relative z-10 bg-white">
        <div className="">
          <AiToolsTabs />
        </div>
      </section>

      {/* Categories Section (参考 category-exploration.tsx) */}
      <div className="relative z-10 bg-white">
        <CategoryExploration />
      </div>

      {/** blog文章区块*/}
      <section className="relative z-10 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="space-y-4 text-left mb-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-2xl md:text-3xl">
              {t("blog.title")}
            </h2>
            <p className="text-muted-foreground md:text-lg mt-3">
              {t("blog.description")}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg overflow-hidden animate-pulse flex flex-row"
                >
                  <div className="w-32 h-32 bg-gray-200 flex-shrink-0"></div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {blogPosts.map((post) => {
                const featuredImage = getFeaturedImage(post)
                return (
                  <a
                    key={post.id}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border rounded-lg p-3 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-row"
                  >
                    {featuredImage ? (
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden bg-gray-100">
                        <img
                          src={featuredImage}
                          alt={stripHtml(post.title.rendered)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <div className="text-primary/30 text-2xl font-bold">
                          {stripHtml(post.title.rendered).charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-grow min-w-0">
                      <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {stripHtml(post.title.rendered)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
                        {stripHtml(post.excerpt.rendered)}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.date)}
                        </span>
                       
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("blog.empty")}</p>
            </div>
          )}
        </div>
      </section>

      {/* 使用的风评*/}
      <section className="relative z-10 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className= "  space-y-4 text-left">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-2xl md:text-3xl">
              {t("testimonials.title")}
            </h2>
            <p className="text-muted-foreground md:text-lg mt-3">
              {t("testimonials.description")}
            </p>
          </div>
          <div className=" mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.raw("testimonials.items").map((item: any, index: number) => (
              <TestimonialCard
                key={index}
                quote={item.quote}
                author={item.author}
                role={item.role}
                avatarSrc={`https://i.pravatar.cc/100?img=${[5, 12, 22, 31, 45, 18][index]}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="relative z-10 overflow-hidden text-primary-foreground py-12 md:py-16"
        style={{
          background: `#0057FF`,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-45%] h-[120%] w-[220%] -translate-x-1/2 rounded-[50%] bg-white/8 blur-[120px]" />
          <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-white/25 via-white/10 to-transparent" />
        </div>
        <div className="relative px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="md:text-xl text-white">
              {t("cta.description")}
            </p>
           
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

