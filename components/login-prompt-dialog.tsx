"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface LoginPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: () => void
}

export function LoginPromptDialog({ 
  open, 
  onOpenChange, 
  onLogin 
}: LoginPromptDialogProps) {
  const t = useTranslations("loginPrompt")

  const handleLogin = () => {
    onOpenChange(false)
    onLogin()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl">{t("title")}</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        
       

        <div className="flex justify-center">
        <Button
            type="button"
            onClick={handleLogin}
            className="bg-primary cursor-pointer hover:bg-primary/90"
          >
            {t("login")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}



