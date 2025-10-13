"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Ping = { x: number; y: number; r: number; life: number }

export function MapGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pings = useRef<Ping[]>([])

  useEffect(() => {
    const cvs = canvasRef.current!
    const ctx = cvs.getContext("2d")!
    let raf = 0

    function resize() {
      const rect = cvs.getBoundingClientRect()
      cvs.width = Math.floor(rect.width * devicePixelRatio)
      cvs.height = Math.floor(rect.height * devicePixelRatio)
    }

    function addPing() {
      pings.current.push({
        x: Math.random(),
        y: Math.random(),
        r: 0,
        life: 1,
      })
      if (pings.current.length > 12) pings.current.shift()
    }

    function draw() {
      const { width: w, height: h } = cvs
      ctx.clearRect(0, 0, w, h)

      // grid
      const step = 32 * devicePixelRatio
      ctx.strokeStyle = getComputedStyle(cvs).getPropertyValue("--border")
      ctx.globalAlpha = 0.5
      for (let x = 0; x < w; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // pings
      for (const ping of pings.current) {
        ping.r += 2 * devicePixelRatio
        ping.life -= 0.01
        const cx = ping.x * w
        const cy = ping.y * h

        // outer ring
        ctx.beginPath()
        ctx.arc(cx, cy, ping.r, 0, Math.PI * 2)
        ctx.strokeStyle = "oklch(var(--chart-3))"
        ctx.globalAlpha = Math.max(0, ping.life)
        ctx.lineWidth = 2 * devicePixelRatio
        ctx.stroke()

        // core
        ctx.beginPath()
        ctx.arc(cx, cy, 4 * devicePixelRatio, 0, Math.PI * 2)
        ctx.fillStyle = "oklch(var(--chart-3))"
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1
      }
      pings.current = pings.current.filter((p) => p.life > 0)

      raf = requestAnimationFrame(draw)
    }

    const resizeObs = new ResizeObserver(resize)
    resizeObs.observe(cvs)
    resize()
    const timer = setInterval(addPing, 1200)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
      resizeObs.disconnect()
    }
  }, [])

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm">Operations Map</CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <canvas ref={canvasRef} className="h-full w-full rounded-md" />
      </CardContent>
    </Card>
  )
}
