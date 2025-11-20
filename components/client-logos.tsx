"use client"

import { motion } from "framer-motion"

export function ClientLogos() {
  const logos = ["Stanford University", "MIT", "Harvard", "Oxford", "Cambridge", "Princeton"]

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-center gap-8 py-8">
        {logos.map((logo, index) => (
          <motion.div
            key={logo}
            className="flex h-12 items-center justify-center rounded-md bg-muted px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <span className="text-lg font-semibold text-muted-foreground">{logo}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
