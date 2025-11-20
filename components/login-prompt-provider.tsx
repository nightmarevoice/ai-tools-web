"use client"

import { useRouter } from "next/navigation"
import { LoginPromptDialog } from "@/components/login-prompt-dialog"
import { useLoginPrompt } from "@/hooks/useLoginPrompt"

export function LoginPromptProvider() {
  const router = useRouter()
  const { isOpen, setIsOpen } = useLoginPrompt()

  const handleLogin = () => {
    setIsOpen(false)
    router.push('/login')
  }

  return (
    <LoginPromptDialog 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      onLogin={handleLogin}
    />
  )
}


