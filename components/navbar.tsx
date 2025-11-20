"use client"

import dynamic from "next/dynamic"
import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, User as UserIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/useAuth"
import { useLocale, useTranslations } from "next-intl"
import { locales } from "@/i18n"

// Lazy load the sheet content for mobile menu
const MobileMenuContent = dynamic(() => import("@/components/mobile-menu-content"), {
  loading: () => <div className="p-6">Loading...</div>,
  ssr: false,
})

export function Navbar({ transparentAtTop = false }: { transparentAtTop?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  // 首页现在不再带有 locale 前缀，直接使用根路径判断
  const isHome = pathname === "/" || pathname === ""
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  const tCommon = useTranslations("common")

  // 生成并存储唯一 key (IP + UUID)
  React.useEffect(() => {
    const STORAGE_KEY = "user_unique_key"
    
    // 检查是否已存在
    if (typeof window !== "undefined") {
      const existingKey = window.localStorage.getItem(STORAGE_KEY)
      if (existingKey) {
        // 已存在，不需要再生成
        return
      }

      // 生成唯一 key
      const generateUniqueKey = async () => {
        try {
          // 获取真实 IP 地址
          const ipResponse = await fetch("https://api.ipify.org?format=json")
          const ipData = await ipResponse.json()
          const userIP = ipData.ip || "unknown"

          // 生成 UUID
          const uuid = crypto.randomUUID()

          // 组合成唯一 key
          const uniqueKey = `${userIP}_${uuid}`

          // 存储到 localStorage
          window.localStorage.setItem(STORAGE_KEY, uniqueKey)
        } catch (error) {
          // 如果获取 IP 失败，使用 fallback
          console.warn("Failed to fetch IP address, using fallback:", error)
          const uuid = crypto.randomUUID()
          const fallbackKey = `unknown_${uuid}`
          window.localStorage.setItem(STORAGE_KEY, fallbackKey)
        }
      }

      generateUniqueKey()
    }
  }, [])

  // 同步 localStorage 中的 preferredLanguage 到 cookie
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const preferredLanguage = window.localStorage.getItem("preferredLanguage")
      if (preferredLanguage && locales.includes(preferredLanguage as any)) {
        // 检查 cookie 是否已存在且与 localStorage 一致
        const cookieLocale = document.cookie
          .split("; ")
          .find((row) => row.startsWith("NEXT_LOCALE="))
          ?.split("=")[1]
        
        // 如果 cookie 不存在或与 localStorage 不一致，则更新 cookie
        if (cookieLocale !== preferredLanguage) {
          document.cookie = `NEXT_LOCALE=${preferredLanguage}; path=/; max-age=31536000; SameSite=Lax`
        }
      }
    }
  }, [])

  const languageLabelMap: Record<string, string> = {
    en: tCommon("language.en"),
    zh: tCommon("language.zh"),
    "zh-TW": tCommon("language.zh-TW"),
    ja: tCommon("language.ja"),
    ko: tCommon("language.ko"),
  }

  const handleSelectLanguage = (nextLocale: string) => {
    // 检查语言是否支持，如果不支持则忽略
    if (!locales.includes(nextLocale as any)) {
      console.warn(`Locale ${nextLocale} is not supported. Supported locales:`, locales)
      setIsLangOpen(false)
      return
    }
    
    // 如果选择的是当前语言，直接关闭菜单
    if (nextLocale === locale) {
      setIsLangOpen(false)
      return
    }
    
    // 更新 localStorage 中的 preferredLanguage
    // 同时设置 cookie，以便 next-intl middleware 能够读取
    if (typeof window !== "undefined") {
      window.localStorage.setItem("preferredLanguage", nextLocale)
      // 设置 cookie，next-intl 会读取这个 cookie
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`
    }
    
    // 从当前 pathname 中提取路径部分（去掉 locale 前缀）
    // next-intl 的 usePathname 可能返回带或不带 locale 前缀的路径
    // 例如: /zh/dashboard -> /dashboard, /en/categories -> /categories, 或直接是 /dashboard
    const currentPath = pathname
    let pathWithoutLocale = currentPath
    
    // 移除开头的 locale 前缀（如果存在）
    // 匹配格式: /en, /zh, /zh-TW 等
    const localePattern = /^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/
    if (localePattern.test(currentPath)) {
      // 提取 /locale 之后的部分
      const match = currentPath.match(/^\/[a-z]{2}(-[A-Z]{2})?\/(.*)$/)
      if (match && match[2]) {
        // 有路径部分，保留它
        pathWithoutLocale = `/${match[2]}`
      } else {
        // 如果路径是 /locale 或 /locale/，则设为根路径
        pathWithoutLocale = '/'
      }
    }
    
    // 如果 pathWithoutLocale 为空或只有斜杠，设为根路径
    if (!pathWithoutLocale || pathWithoutLocale === '' || pathWithoutLocale === '/') {
      pathWithoutLocale = '/'
    }
    
    // 构建新的 URL：/${nextLocale}${pathWithoutLocale}
    // 如果 pathWithoutLocale 已经是根路径，则直接使用 /${nextLocale}
    const newPath = pathWithoutLocale === '/' 
      ? `/${nextLocale}` 
      : `/${nextLocale}${pathWithoutLocale}`
    
    // 导航到新的 URL
    router.push(newPath)
    setIsLangOpen(false)
  }

  React.useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // 路由需要包含 locale 前缀，以保持语言一致性
  const routes = [
    {
      href: `/${locale}`,
      label: tCommon("nav.home"),
      active: pathname === `/${locale}` || pathname === "/" || pathname === "",
    },
    {
      href: `/${locale}/categories`,
      label: tCommon("nav.categories"),
      active: pathname.startsWith(`/${locale}/categories`) || pathname.startsWith("/categories"),
    },
    {
      href: `/${locale}/dashboard`,
      label: tCommon("nav.intelligentTools"),
      active: pathname === `/${locale}/dashboard` || pathname === "/dashboard",
    },
    {
      href: `/${locale}/dataanalysis`,
      label: tCommon("nav.dataanalysis"),
      active: pathname.startsWith(`/${locale}/dataanalysis`) || pathname.startsWith("/dataanalysis"),
    },
  ]

  const shouldElevate = transparentAtTop ? isScrolled : (!isHome || isScrolled)

  return (
    <header
      className={cn(
        isHome && !isScrolled ? "absolute" : "sticky",
        "top-0 z-50 flex w-full justify-center transition-all duration-300",
        "text-slate-900",
        shouldElevate ? "border-b border-white/60" : "border-b border-transparent",
        shouldElevate
          ? "bg-white/95 shadow-lg shadow-slate-200/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      {shouldElevate && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-white/92" />
          <div className="absolute -left-[35%] -top-[55%] h-[26rem] w-[45rem] rounded-full bg-[radial-gradient(circle_at_center,hsla(var(--primary)_/_0.28),transparent_65%)] blur-3xl" />
          <div className="absolute right-[-25%] top-[-120%] h-[28rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,hsla(var(--primary)_/_0.22),transparent_65%)] blur-3xl" />
          <div className="absolute inset-0 opacity-45 bg-[linear-gradient(135deg,hsla(var(--primary)_/_0.18)_0%,rgba(255,255,255,0)_60%)]" />
        </div>
      )}
      <div style={{ width: "80rem" }} className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <Link
          href={`/${locale}`}
          className={cn(
            "mr-6 flex items-center space-x-2 transition-colors",
            "text-[#0057FF] hover:text-primary",
          )}
        >
          <Logo
            className={cn(
              "text-primary",
            )}
            glowClassName={
              "bg-primary/20"
            }
          />
          <span className="hidden font-bold sm:inline-block">AI Tool Navigation</span>
        </Link>
        <nav className="hidden md:flex md:items-center md:justify-between">
          <div className="flex gap-6 justify-center">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                aria-current={route.active ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors",
                  route.active
                    ? "text-primary"
                    : "text-slate-600 hover:text-[#0057FF]",
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </nav>
        <nav className="flex items-center">
          <div
            className="relative mr-2"
            onMouseEnter={() => setIsLangOpen(true)}
            onMouseLeave={() => setIsLangOpen(false)}
            onFocus={() => setIsLangOpen(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsLangOpen(false)
              }
            }}
          >
            <span
              className="group hover:text-white cursor-pointer inline-flex items-center rounded-md  px-2 py-1.5 text-sm hover:bg-[#0057FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-haspopup="menu"
              aria-expanded={isLangOpen}
              aria-label={tCommon("chooseLanguage")}
              title={tCommon("chooseLanguage")}
              onClick={() => setIsLangOpen((prev) => !prev)}
            >
              <span className="text-slate-600 group-hover:text-white" role="img" aria-hidden="true">🌐</span>
              <span className="ml-2 text-slate-700 group-hover:text-white">{languageLabelMap[locale] ?? languageLabelMap.zh}</span>
            </span>
            <div
              className={`absolute top-7 right--3 z-50 mt-1 w-48 overflow-hidden rounded-md border bg-white shadow-md transition-opacity ${
                isLangOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              role="menu"
              aria-hidden={!isLangOpen}
            >
              <ul className="py-1" role="none">
                {locales.map((supportedLocale, index) => (
                  <React.Fragment key={supportedLocale}>
                    <li
                      role="menuitem"
                      className={cn(
                        "flex cursor-pointer rounded-md items-center px-4 py-2 text-sm transition-colors",
                        locale === supportedLocale
                          ? "bg-[#0057FF] text-white font-medium"
                          : "text-slate-700 hover:bg-[#0057FF] hover:text-[#fff]"
                      )}
                      onClick={() => handleSelectLanguage(supportedLocale)}
                    >
                      {languageLabelMap[supportedLocale] ?? supportedLocale}
                    </li>
                    {index < locales.length - 1 && (
                      <li className="mx-3 h-px bg-slate-200" role="presentation" />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          </div>
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-slate-200 rounded" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center border-0 cursor-pointer gap-2 h-auto p-1.5 hover:bg-transition-colors",
                    "text-slate-700 transition-colors hover:text-primary",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={user.name || user.email} />
                    <AvatarFallback className="bg-[#0057FF]/80 hover:bg-[#0057FF]/90 text-white text-sm font-medium">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                 
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/profile`} className="flex items-center cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{tCommon("nav.profile")}</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard`} className="flex items-center cursor-pointer">
                      <span>{tCommon("nav.dashboard")}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{tCommon("nav.logOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "bg-[#0057FF]/80 text-white transition-colors  hover:bg-[#0057FF] hover:text-white cursor-pointer",
                )}
              >
                <Link href={`/${locale}/login`}>{tCommon("nav.logIn")}</Link>
              </Button>
             
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
