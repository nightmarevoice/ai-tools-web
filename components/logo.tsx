"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  glowClassName?: string
}

export function Logo({ className, glowClassName }: LogoProps = {}) {
  return (
    <motion.div
      className={cn("relative h-8 w-8 text-primary", className)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8"
      >
        <motion.path
          d="M12 2L2 7l10 5 10-5-10-5z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.path
          d="M2 17l10 5 10-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.path
          d="M2 12l10 5 10-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </motion.svg>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full bg-primary/20",
          glowClassName,
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1.5 }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{ opacity: 0.3 }}
      />
    </motion.div>
  )
}
