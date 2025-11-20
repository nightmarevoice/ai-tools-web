"use client"

import { motion } from "framer-motion"

export function HeroAnimation() {
  return (
    <div className="relative h-[400px] w-full max-w-[600px]">
      <motion.div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Animated circles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.5], opacity: [0, 1, 0] }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating papers */}
      {[...Array(5)].map((_, i) => {
        const size = 80 + Math.random() * 40
        const angle = (i / 5) * Math.PI * 2
        const radius = 120
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        return (
          <motion.div
            key={`paper-${i}`}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
            style={{
              width: size,
              height: size * 1.3,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              rotate: Math.random() * 20 - 10,
            }}
            animate={{
              x: x,
              y: y,
              opacity: 1,
              rotate: [Math.random() * 10 - 5, Math.random() * 10 - 5],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              rotate: {
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              },
              y: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
          >
            <motion.div
              className="h-full w-full rounded-md bg-background shadow-md"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        )
      })}

      {/* Central brain/network icon */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary text-primary-foreground"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-full w-full p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 14.5 2Z" />
          <path d="M4 12h16" />
        </motion.svg>
      </motion.div>
    </div>
  )
}
