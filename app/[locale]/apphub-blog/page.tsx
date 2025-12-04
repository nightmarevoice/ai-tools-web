import type { Metadata } from "next"
import { BlogContent } from "@/components/blog-content"

export default function BlogPage() {
  return <BlogContent />
}

export const metadata: Metadata = {
  title: "AI Hub Blog - AI Tools search assistant",
  description: "AI Hub Blog - Latest news and updates about AI tools",
}

