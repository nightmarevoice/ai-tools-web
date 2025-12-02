import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-apphub.com"

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI application search assistant - Discover & Analyze AI Tools",
    template: "",
  },
  description:
    "Discover the best AI tools and applications. Explore trending AI assistants, research tools, and productivity apps. Compare features, ratings, and find the perfect AI solution for your needs.",
  keywords: [
    "AI tools",
    "AI applications",
    "AI productivity tools",
    "AI software",
    "trending AI",
    "best AI tools",
  ],
  authors: [{ name: "ResearchAI Team" }],
  creator: "ResearchAI",
  publisher: "ResearchAI",
  icons: {
    icon: "/apphub-fav.ico",
    shortcut: "/apphub-fav.ico",
    apple: "/apphub-fav.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AI application search assistant - Discover & Analyze AI Tools",
    description:
      "Discover the best AI tools and applications. Explore trending AI assistants, research tools, and productivity apps.",
    siteName: "AI application search assistant",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AI application search assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI application search assistant - Discover & Analyze AI Tools",
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
      'x-default': `${baseUrl}/en`,
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
