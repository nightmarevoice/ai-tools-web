"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
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

export function HomeContent() {
  const t = useTranslations("home")
  
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

      
     

      <section className="relative z-10 bg-white">
        <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-left mb-12 space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t("semanticSearch.title")}
              </h2>
              <p className="text-muted-foreground md:text-lg">
                {t("semanticSearch.description")}
            </p>
          </div>
            
            <div className="grid gap-8 md:grid-cols-2 items-start">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop"
                  alt={t("semanticSearch.imageAlt")}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="p-4 text-xs text-muted-foreground">
                  {t("semanticSearch.imageCaption")}
                </div>
              </div>

              <div className="space-y-4">
               
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">{t("semanticSearch.matchedTools")}</div>
                  <ul className="mt-3 space-y-3">
                    <li className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{t("semanticSearch.tool1.name")}</div>
                        <div className="text-sm text-muted-foreground">{t("semanticSearch.tool1.description")}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.nlp")}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.analysis")}</span>
                      </div>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{t("semanticSearch.tool2.name")}</div>
                        <div className="text-sm text-muted-foreground">{t("semanticSearch.tool2.description")}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.orchestration")}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.pipeline")}</span>
                      </div>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{t("semanticSearch.tool3.name")}</div>
                        <div className="text-sm text-muted-foreground">{t("semanticSearch.tool3.description")}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.visualization")}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.charts")}</span>
                      </div>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{t("semanticSearch.tool4.name")}</div>
                        <div className="text-sm text-muted-foreground">{t("semanticSearch.tool4.description")}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.data")}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">{t("semanticSearch.tags.processing")}</span>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-4 text-xs text-muted-foreground">
                    {t("semanticSearch.exampleNote")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 使用的风评*/}
      <section className="relative z-10 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className= "  space-y-4 text-left">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t("testimonials.title")}
            </h2>
            <p className="text-muted-foreground md:text-lg">
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

