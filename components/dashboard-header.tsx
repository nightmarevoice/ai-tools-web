"use client"

import { motion } from "framer-motion"

export function DashboardHeader() {
  return (
    <div className="bg-muted/50 py-8">
      <motion.div
        className=" px-4 md:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-3xl space-y-2 text-center">
          
        </div>
      </motion.div>
    </div>
  )
}
