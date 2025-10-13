"use client"

import { useEffect, useRef } from "react"

type Point = { x: number; y: number; vx: number; vy: number }

export function NeuralBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let width = (canvas.width = window.innerWidth * devicePixelRatio)
    let height = (canvas.height = window.innerHeight * devicePixelRatio)
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    const count = Math.max(48, Math.floor((window.innerWidth * window.innerHeight) / 22000))
    const points: Point[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
    }))

    const resize = () => {
      width = canvas.width = window.innerWidth * devicePixelRatio
      height = canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = "100%"
      canvas.style.height = "100%"
    }
    window.addEventListener("resize", resize)

    const step = () => {
      // read CSS variables for colors
      const styles = getComputedStyle(document.documentElement)
      const primary = styles.getPropertyValue("--color-primary").trim()
      const accent = styles.getPropertyValue("--color-accent").trim()

      ctx.clearRect(0, 0, width, height)

      // move
      for (const p of points) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      }

      // connect near points
      for (let i = 0; i < points.length; i++) {
        const a = points[i]
        // draw node
        ctx.beginPath()
        ctx.arc(a.x, a.y, 1.6 * devicePixelRatio, 0, Math.PI * 2)
        ctx.fillStyle = primary
        ctx.globalAlpha = 0.8
        ctx.fill()

        for (let j = i + 1; j < points.length; j++) {
          const b = points[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          const maxDist = 120 * devicePixelRatio
          if (d2 < maxDist * maxDist) {
            const t = 1 - Math.sqrt(d2) / maxDist
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = accent
            ctx.globalAlpha = 0.15 * t
            ctx.lineWidth = 1 * devicePixelRatio * (0.5 + t)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      window.removeEventListener("resize", resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10 opacity-60 will-change-transform [mask-image:radial-gradient(60%_60%_at_50%_50%,#000_60%,transparent_100%)]"
      aria-hidden="true"
    />
  )
}
