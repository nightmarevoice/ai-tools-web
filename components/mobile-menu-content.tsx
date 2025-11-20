"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MobileMenuContentProps {
  routes: {
    href: string
    label: string
    active: boolean
  }[]
  onClose: () => void
}

export default function MobileMenuContent({ routes, onClose }: MobileMenuContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
          onClick={onClose}
        >
          {route.label}
        </Link>
      ))}
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
