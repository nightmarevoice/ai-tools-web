"use client"

import { useState } from "react"
import { ToolCard } from "../components/tool-card"

export function ToolsList() {
  const [activeTab, setActiveTab] = useState("trending")

  const tools = {
    trending: [
      {
        id: 1,
        name: "ChatGPT",
        description: "A powerful AI chat assistant that helps with a wide range of tasks",
        category: "🤖 AI Assistant",
        pricing: "Free",
        isNew: false,
        isTrending: true,
      },
      {
        id: 2,
        name: "DALL-E 3",
        description: "Generate high‑quality AI images from text prompts",
        category: "🎨 Image Generation",
        pricing: "Freemium",
        isNew: false,
        isTrending: true,
      },
      {
        id: 3,
        name: "GitHub Copilot",
        description: "Your AI coding assistant for faster, smarter code",
        category: "💻 Code Generation",
        pricing: "Paid",
        isNew: false,
        isTrending: true,
      },
      {
        id: 4,
        name: "Midjourney",
        description: "Professional‑grade AI art generation tool",
        category: "🎨 Image Generation",
        pricing: "Paid",
        isNew: false,
        isTrending: true,
      },
    ],
    recent: [
      {
        id: 5,
        name: "Claude 3.5",
        description: "Next‑generation AI assistant with stronger performance",
        category: "🤖 AI Assistant",
        pricing: "Free",
        isNew: true,
        isTrending: false,
      },
      {
        id: 6,
        name: "Runway",
        description: "AI video generation and editing platform",
        category: "🎬 AI Video",
        pricing: "Freemium",
        isNew: true,
        isTrending: false,
      },
      {
        id: 7,
        name: "Jasper",
        description: "Enterprise‑grade AI copywriting tool",
        category: "✍️ AI Writing",
        pricing: "Paid",
        isNew: true,
        isTrending: false,
      },
      {
        id: 8,
        name: "Synthesia",
        description: "Create AI videos without a camera",
        category: "🎬 AI Video",
        pricing: "Paid",
        isNew: true,
        isTrending: false,
      },
    ],
    featured: [
      {
        id: 9,
        name: "Perplexity",
        description: "Search and AI chat combined in one tool",
        category: "🤖 AI Assistant",
        pricing: "Free",
        isNew: false,
        isTrending: false,
      },
      {
        id: 10,
        name: "Copy.ai",
        description: "Generate marketing copy quickly with AI",
        category: "✍️ AI Writing",
        pricing: "Free",
        isNew: false,
        isTrending: false,
      },
      {
        id: 11,
        name: "Murf.ai",
        description: "AI voice generation and text‑to‑speech",
        category: "🎵 Music Creation",
        pricing: "Freemium",
        isNew: false,
        isTrending: false,
      },
      {
        id: 12,
        name: "Beautiful.ai",
        description: "Automatically create professional presentations",
        category: "📊 Data Analysis",
        pricing: "Freemium",
        isNew: false,
        isTrending: false,
      },
    ],
  }

  const currentTools = tools[activeTab as keyof typeof tools]

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-12 border-b border-border">
          {[
            { id: "trending", label: "🔥 Trending" },
            { id: "recent", label: "⭐ Recently Added" },
            { id: "featured", label: "✨ Editor's Picks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-b-2 font-medium transition ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tool cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
