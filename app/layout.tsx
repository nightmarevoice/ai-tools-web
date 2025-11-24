import type React from "react"
import "./globals.css"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://research-ai-assistant.vercel.app"

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI Research Assistant - Discover & Analyze AI Tools",
    template: "%s | AI Research Assistant",
  },
  description:
    "Discover the best AI tools and applications. Explore trending AI assistants, research tools, and productivity apps. Compare features, ratings, and find the perfect AI solution for your needs.",
  keywords: [
    "AI tools",
    "artificial intelligence",
    "AI applications",
    "research assistant",
    "AI productivity tools",
    "machine learning tools",
    "AI software",
    "trending AI",
    "best AI tools",
    "AI comparison",
  ],
  authors: [{ name: "ResearchAI Team" }],
  creator: "ResearchAI",
  publisher: "ResearchAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AI Research Assistant - Discover & Analyze AI Tools",
    description:
      "Discover the best AI tools and applications. Explore trending AI assistants, research tools, and productivity apps.",
    siteName: "AI Research Assistant",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AI Research Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Research Assistant - Discover & Analyze AI Tools",
    description:
      "Discover the best AI tools and applications. Explore trending AI assistants, research tools, and productivity apps.",
    creator: "@researchai",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      en: `${baseUrl}/en`,
      zh: `${baseUrl}/zh`,
      ja: `${baseUrl}/ja`,
      ko: `${baseUrl}/ko`,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
