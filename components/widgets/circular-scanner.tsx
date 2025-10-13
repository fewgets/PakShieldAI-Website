"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CircularScanner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const cvs = canvasRef.current!
    const ctx = cvs.getContext("2d")!
    let t = 0
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true

    const resize = () => {
      const rect = cvs.getBoundingClientRect()
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
      cvs.width = Math.max(1, Math.floor(rect.width * dpr))
      cvs.height = Math.max(1, Math.floor(rect.height * dpr))
    }
    const ro = new ResizeObserver(resize)
    ro.observe(cvs)
    resize()

    const getCssVar = (name: string, fallback: string) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      return v && v.length > 0 ? v : fallback
    }

    const draw = () => {
      const w = cvs.width
      const h = cvs.height
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) * 0.45

      const primary = getCssVar("--color-primary", "#3b82f6")
      const accent = getCssVar("--color-chart-1", "#60a5fa")
      const danger = "#ef4444"

      ctx.clearRect(0, 0, w, h)

      ctx.save()
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = primary
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (r * i) / 5, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(cx - r, cy)
      ctx.lineTo(cx + r, cy)
      ctx.moveTo(cx, cy - r)
      ctx.lineTo(cx, cy + r)
      ctx.stroke()
      ctx.restore()

      const angle = (t / 90) * Math.PI * 2
      const sweep = Math.PI / 8
      let grad: CanvasGradient | null = null
      try {
        grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0, accent)
        grad.addColorStop(1, "rgba(0,0,0,0)")
      } catch {
        grad = null
      }

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, -sweep, sweep)
      ctx.closePath()
      ctx.fillStyle = grad ? grad : accent
      ctx.globalAlpha = grad ? 0.6 : 0.25
      ctx.fill()
      ctx.restore()

      ctx.globalAlpha = 0.95
      for (let i = 0; i < 10; i++) {
        const a = ((i * Math.PI * 2) / 10 + (t / 120) * 0.9) % (Math.PI * 2)
        const rr = r * (0.25 + ((i * 0.11 + t / 240) % 0.65))
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        ctx.beginPath()
        ctx.arc(x, y, 3 * Math.max(1, Math.floor(window.devicePixelRatio || 1)), 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.fill()
      }

      ctx.globalAlpha = 1
      for (let i = 0; i < 3; i++) {
        const seed = t * 0.02 + i * 1.7
        const a = seed % (Math.PI * 2)
        const rr = r * (0.4 + ((i * 0.23 + (t % 100) / 100) % 0.5))
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr

        ctx.beginPath()
        ctx.arc(x, y, 4 * Math.max(1, Math.floor(window.devicePixelRatio || 1)), 0, Math.PI * 2)
        ctx.fillStyle = danger
        ctx.fill()

        ctx.globalAlpha = 0.5
        ctx.beginPath()
        const pr = 8 + (t % 20)
        ctx.arc(x, y, pr, 0, Math.PI * 2)
        ctx.strokeStyle = danger
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      t++
      if (!reduce) {
        raf.current = requestAnimationFrame(draw)
      }
    }

    if (reduce) {
      draw()
    } else {
      raf.current = requestAnimationFrame(draw)
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      ro.disconnect()
    }
  }, [])

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm">Threat Scanner</CardTitle>
      </CardHeader>
      <CardContent className="relative h-64">
        <canvas ref={canvasRef} className="h-full w-full rounded-md" />
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
          Scanning…
        </div>
      </CardContent>
    </Card>
  )
}
