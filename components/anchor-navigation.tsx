'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnchorNavigationProps {
  items: Array<{
    id: string
    label: string
  }>
  className?: string
}

export function AnchorNavigation({ items, className }: AnchorNavigationProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200 // Offset for fixed header and navigation

      // Find which section is currently in view
      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id)
        if (element) {
          const rect = element.getBoundingClientRect()
          const offsetTop = rect.top + window.scrollY
          if (scrollPosition >= offsetTop - 50) {
            setActiveId(items[i].id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const rect = element.getBoundingClientRect()
      const offsetTop = rect.top + window.scrollY - 120 // Offset for fixed header and navigation
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth',
      })
      // Update active state immediately
      setActiveId(id)
    }
  }

  return (
    <div className={cn('sticky top-4 z-20 mb-6 flex', className)}>
      <div className="bg-white border border-blue-100 p-1 rounded-lg shadow-sm">
        <div className="flex gap-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={cn(
                'px-4 py-2 w-25 text-sm font-medium rounded-md transition-all cursor-pointer text-center',
                'hover:bg-blue-50 hover:text-blue-700',
                activeId === item.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm font-semibold'
                  : 'text-gray-600'
              )}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

