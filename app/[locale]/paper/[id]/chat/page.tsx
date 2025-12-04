import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PaperChatHeader } from "@/components/paper-chat-header"
import { PaperChatInterface } from "@/components/paper-chat-interface"
import { PaperSummaryPanel } from "@/components/paper-summary-panel"
import { PaperSwitcher } from "@/components/paper-switcher"
import { locales } from "@/i18n"
import { notFound } from "next/navigation"

interface PaperChatPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

// 为静态导出生成静态参数 - 必须在文件顶部
export async function generateStaticParams(): Promise<Array<{ id: string; locale: string }>> {
  // 返回一个示例值，确保函数被正确识别
  return locales.map(locale => ({ id: 'example', locale }))
}

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateMetadata({ params }: PaperChatPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: "Chat with Paper | AI Tools search assistant",
    description: "Ask questions and get AI-powered insights about this research paper",
  }
}

export default async function PaperChatPage({ params }: PaperChatPageProps) {
  const { id: paperId, locale } = await params

  // 验证 locale 是否有效
  if (!locales.includes(locale as any)) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href={`/${locale}/paper/${paperId}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to paper details
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <PaperSwitcher />
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export Chat
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                View PDF
              </Button>
            </div>
          </div>

          <PaperChatHeader
            title="Attention Is All You Need: Transformer Networks and Their Impact on Natural Language Processing"
            authors={[
              "Ashish Vaswani",
              "Noam Shazeer",
              "Niki Parmar",
              "Jakob Uszkoreit",
              "Llion Jones",
              "Aidan N. Gomez",
              "Łukasz Kaiser",
              "Illia Polosukhin",
            ]}
            journal="Advances in Neural Information Processing Systems (NeurIPS 2017)"
            year="2017"
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
            <PaperChatInterface />
            <PaperSummaryPanel />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

