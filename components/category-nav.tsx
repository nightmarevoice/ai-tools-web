import Link from "next/link"

const CATEGORIES: { key: string; label: string }[] = [
  { key: "chat-agents", label: "AI聊天与智能体" },
  { key: "productivity", label: "AI办公与生产力" },
  { key: "image-design", label: "图像与设计" },
  { key: "video", label: "AI视频工具" },
  { key: "audio", label: "语音与音频" },
  { key: "coding", label: "编程辅助" },
  { key: "app-builder", label: "网页和应用生成" },
  { key: "writing", label: "AI写作" },
  { key: "detection", label: "AI检测" },
  { key: "translate", label: "AI翻译" },
  { key: "education", label: "教育与学习" },
  { key: "business", label: "商业经营" },
  { key: "marketing", label: "营销与广告" },
  { key: "jobs", label: "求职与招聘" },
  { key: "legal-finance", label: "法律与财务" },
  { key: "ecommerce", label: "电商工具" },
  { key: "social", label: "社交媒体" },
  { key: "lifestyle", label: "生活和其他" },
]

export function CategoryNav() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max py-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={{ pathname: "/categories", query: { type: c.key } }}
            className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
          >
            {c.label}
          </Link>
        ))}
        <Link
          href="/categories"
          className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium whitespace-nowrap"
        >
          查看全部
        </Link>
      </div>
    </div>
  )
}



