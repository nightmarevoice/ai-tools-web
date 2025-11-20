"use client"

import { useEffect, useRef } from "react"

export function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const hslToRgb = (h: number, s: number, l: number) => {
      h = h % 360
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2
      let r = 0
      let g = 0
      let b = 0

      if (h < 60) {
        r = c
        g = x
      } else if (h < 120) {
        r = x
        g = c
      } else if (h < 180) {
        g = c
        b = x
      } else if (h < 240) {
        g = x
        b = c
      } else if (h < 300) {
        r = x
        b = c
      } else {
        r = c
        b = x
      }

      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
      }
    }

    const resolvePrimaryColor = () => {
      const fallback = { r: 0, g: 87, b: 255 }
      const stylesToCheck = [
        canvas,
        canvas.parentElement,
        document.documentElement,
        document.body,
      ].filter(Boolean) as Element[]

      for (const element of stylesToCheck) {
        const raw = getComputedStyle(element).getPropertyValue("--primary")?.trim()
        if (!raw) continue
        const match = raw.match(
          /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/,
        )
        if (!match) continue
        const [, hStr, sStr, lStr] = match
        const h = Number.parseFloat(hStr)
        const s = Number.parseFloat(sStr) / 100
        const l = Number.parseFloat(lStr) / 100
        if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) continue
        return hslToRgb(h, Math.min(Math.max(s, 0), 1), Math.min(Math.max(l, 0), 1))
      }

      return fallback
    }

    const primaryColor = resolvePrimaryColor()

    // Rendering configuration (kept lightweight)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let animationFrameId: number
    let t = 0
    // No aurora helpers — keep simple shapes only

    const animate = () => {
      t += 0.005

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create base background gradient
      const gradient = ctx.createLinearGradient(
        canvas.width * (0.5 + 0.5 * Math.sin(t * 0.5)),
        0,
        canvas.width * (0.5 + 0.5 * Math.cos(t * 0.3)),
        canvas.height,
      )

      // Add colors
      gradient.addColorStop(
        0,
        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.5)`,
      )
      gradient.addColorStop(
        0.5,
        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.2)`,
      )
      gradient.addColorStop(
        1,
        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.1)`,
      )

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Floating soft circles (original effect)
      for (let i = 0; i < 5; i++) {
        const x = canvas.width * (0.2 + 0.6 * Math.sin(t + i))
        const y = canvas.height * (0.2 + 0.6 * Math.cos(t + i * 0.7))
        const radius = 50 + 30 * Math.sin(t * 0.8 + i)

        const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        circleGradient.addColorStop(
          0,
          `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.05)`,
        )
        circleGradient.addColorStop(
          1,
          `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0)`,
        )

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = circleGradient
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }} />
}
