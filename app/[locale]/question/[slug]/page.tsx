import type { Metadata } from "next"
import { QuestionPage as QuestionPageComponent } from "@/components/question-page"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

interface QuestionPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

// 支持的问题类型
const SUPPORTED_SLUGS = ["video", "message"] as const
type SupportedSlug = (typeof SUPPORTED_SLUGS)[number]

// 支持的语言列表
const LOCALES = ["zh", "en", "ja", "ko"] as const

// 生成静态路径 - 预生成所有支持的 slug 和 locale 组合
export async function generateStaticParams(): Promise<Array<{ slug: string; locale: string }>> {
  const params: Array<{ slug: string; locale: string }> = []

  for (const locale of LOCALES) {
    for (const slug of SUPPORTED_SLUGS) {
      params.push({ slug, locale })
    }
  }

  return params
}

// 允许动态参数，支持未预生成的路径（但会验证 slug 是否有效）
export const dynamicParams = true

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { locale, slug } = await params

  // 验证 slug 是否支持
  if (!SUPPORTED_SLUGS.includes(slug as SupportedSlug)) {
    notFound()
  }

  // 验证 locale 是否支持
  if (!LOCALES.includes(locale as any)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: `questionPage.${slug}` })

  // 根据 slug 获取对应的问题
  const question = t("question")

  return <QuestionPageComponent question={question} questionKey={slug} />
}

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { locale, slug } = await params

  // 验证 slug 是否支持
  if (!SUPPORTED_SLUGS.includes(slug as SupportedSlug)) {
    return {
      title: "Not Found",
    }
  }

  // 验证 locale 是否支持
  if (!LOCALES.includes(locale as any)) {
    return {
      title: "Not Found",
    }
  }

  const t = await getTranslations({ locale, namespace: `questionPage.${slug}` })

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  }
}

