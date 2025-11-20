import type { Metadata } from "next"
import { CategoriesContent } from "@/components/categories-content"

// 本地化 categories 页面：直接使用客户端组件，因为已经在 [locale] 路由组下，有国际化上下文
export default function CategoriesPage() {
  return <CategoriesContent />
}

// 如果需要为本地化 categories 提供独立的 SEO，可在这里补充元数据
export const metadata: Metadata = {
  title: "CategoriesPage - AI Research Assistant",
}

