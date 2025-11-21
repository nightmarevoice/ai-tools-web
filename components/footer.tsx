'use client'

import { useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Logo } from "@/components/logo"

export function Footer() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const locale = useLocale()
  const t = useTranslations("footer")

  return (
    <footer className="border-t bg-background">
      <div className="w-full px-4 py-4 md:px-6 md:py-10 max-w-7xl  mx-auto">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="font-bold">{t("brand")}</span>
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
          {/* <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("company.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://xfengai.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("company.about")}
                </a>
              </li>
              
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
          </div> */}
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
        </div>
       
      </div>
    </footer>
  )
}
      
      