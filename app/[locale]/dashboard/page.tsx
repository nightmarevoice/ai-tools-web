import type { Metadata } from "next"
import { DashboardContent } from "@/components/dashboard-content"

// 本地化 dashboard 页面：直接使用客户端组件，因为已经在 [locale] 路由组下，有国际化上下文
export default function DashboardPage() {
  return <DashboardContent />
}

// 如果需要为本地化 dashboard 提供独立的 SEO，可在这里补充元数据
export const metadata: Metadata = {
  title: "Dashboard - AI Tools search assistant",
}



