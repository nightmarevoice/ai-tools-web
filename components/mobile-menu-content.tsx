"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface MobileMenuContentProps {
  routes: {
    href: string
    label: string
    active: boolean
    icon?: LucideIcon
    openInNewTab?: boolean
  }[]
  onClose: () => void
}

export default function MobileMenuContent({ routes, onClose }: MobileMenuContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {routes.map((route) => {
        const Icon = route.icon
        
        // 如果需要在新的标签页打开，使用 <a> 标签
        if (route.openInNewTab) {
          return (
            <a
              key={route.href}
              href={route.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
              onClick={onClose}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {route.label}
            </a>
          )
        }
        
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
            onClick={onClose}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {route.label}
          </Link>
        )
      })}
      <div className="flex flex-col gap-2 mt-4">
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <Link href="/login" onClick={onClose}>
            Log in
          </Link>
        </Button>
        <Button size="sm" className="w-full justify-start" asChild>
          <Link href="/signup" onClick={onClose}>
            Sign up
          </Link>
        </Button>
      </div>
    </div>
  )
}
