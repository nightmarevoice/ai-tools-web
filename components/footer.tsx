'use client'

import { useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Logo } from "@/components/logo"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Copy, Mail } from "lucide-react"
import { toast } from "sonner"

export function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const locale = useLocale()
  const t = useTranslations("footer")
  const email = "xuanfeng.tech.x@gmail.com"

  const handleCopyEmail = async () => {
    setIsCopying(true)
    try {
      // 模拟一个短暂的延迟，让用户看到加载动画
      await new Promise(resolve => setTimeout(resolve, 500))
      await navigator.clipboard.writeText(email)
      toast.success("邮箱已复制到剪贴板")
    } catch (err) {
      toast.error("复制失败，请手动复制")
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <footer className="border-t bg-background">
      <div className="w-full px-4 py-4 md:px-6 md:py-10 max-w-7xl  mx-auto">
        <div className="grid gap-8 sm:grid-cols-4 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold">AI ToolsHub</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("product.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                
                <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  
                  Canva
                </a>
              </li>
              <li>
                <a href="https://readdy.ai/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  Readdy
                </a>
              </li>
              <li>
                <a href="https://www.lovart.ai/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  Lovart
                </a>
              </li>
             
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("legal.title")}</h3>
            <ul className="space-y-2 text-sm">
              
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-foreground">
                  {t("legal.privacy")}
                </Link>
              </li>
             
              <li>
                <Link href={`/${locale}/service`} className="text-muted-foreground hover:text-foreground">
                  {t("legal.service")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("company.title")}</h3>
            <ul className="space-y-2 text-sm">
              
              <li>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsContactOpen(true)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("company.contact")}
                </Link>
              </li>
            </ul>
          </div>
         
        </div>
       
      </div>
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="text-xl">联系我们</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              请通过以下邮箱地址与我们联系
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-3 py-4">
            <div className="flex-1 px-4 py-3 bg-muted rounded-md border">
              <span className="text-sm font-mono text-foreground">{email}</span>
            </div>
            <Button
              type="button"
              onClick={handleCopyEmail}
              variant="outline"
              size="icon"
              className="shrink-0"
              disabled={isCopying}
            >
              {isCopying ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">复制邮箱</span>
            </Button>
          </div>
          
          {isCopying && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Spinner className="h-3 w-3" />
              <span>正在复制...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  )
}
      
      