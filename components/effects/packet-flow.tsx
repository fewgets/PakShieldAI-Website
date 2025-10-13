"use client"

import { useEffect, useRef } from "react"

type Packet = {
  x: number
  y: number
  vx: number
  alive: boolean
  evil: boolean
  life: number
  kind: "Benign" | "DDoS" | "PortScan" | "Botnet" | "FTP-Patator"
}

export function PacketFlow() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext("2d")!
    const packets: Packet[] = []
    let t = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * devicePixelRatio)
      canvas.height = Math.floor(rect.height * devicePixelRatio)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const spawn = () => {
      const evil = Math.random() < 0.25
      const kinds = evil ? (["DDoS", "PortScan", "Botnet", "FTP-Patator"] as const) : (["Benign"] as const)
      const kind = kinds[Math.floor(Math.random() * kinds.length)]
      packets.push({
        x: 0,
        y: canvas.height * (0.2 + Math.random() * 0.6),
        vx: (1.5 + Math.random() * 2.2) * devicePixelRatio,
        alive: true,
        evil,
        life: 1,
        kind,
      })
      if (packets.length > 60) packets.shift()
    }

    const draw = () => {
      const styles = getComputedStyle(document.documentElement)
      const good = styles.getPropertyValue("--color-primary").trim()
      const bad = styles.getPropertyValue("--color-destructive").trim()
      const bg = getComputedStyle(document.body).getPropertyValue("background-color")

      ctx.fillStyle = bg
      ctx.globalAlpha = 0.85
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1

      // path
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
      const goodAlpha = good.replace(")", " / 0.22)")
      ctx.strokeStyle = goodAlpha
      ctx.lineWidth = 2 * devicePixelRatio
      ctx.beginPath()
      ctx.moveTo(0, canvas.height * 0.5)
      ctx.bezierCurveTo(
        canvas.width * 0.33,
        canvas.height * 0.2,
        canvas.width * 0.66,
        canvas.height * 0.8,
        canvas.width,
        canvas.height * 0.5,
      )
      ctx.stroke()

      // packets
      for (const p of packets) {
        if (!p.alive) {
          p.life -= 0.05
          if (p.life <= 0) continue
        } else {
          p.x += p.vx
          // fake IDS intercept waypoint
          const interceptX = canvas.width * 0.55
          if (p.evil && p.x > interceptX && p.alive) {
            p.alive = false
            p.vx = 0
            p.life = 1
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, 4 * devicePixelRatio, 0, Math.PI * 2)
        if (p.alive) {
          ctx.fillStyle = p.evil ? bad : good
          ctx.globalAlpha = p.evil ? 0.9 : 0.8
          ctx.fill()
        } else {
          // multi-ring burst with fade
          ctx.strokeStyle = bad
          ctx.globalAlpha = p.life
          ctx.lineWidth = 2 * devicePixelRatio
          for (let ring = 1; ring <= 2; ring++) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, (1 - p.life) * (ring * 12) * devicePixelRatio, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
        ctx.globalAlpha = 1
      }

      t++
      if (t % (reduce ? 28 : 14) === 0) spawn()
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="h-64 w-full rounded-md border" aria-label="Packet flow visualization" />
}
