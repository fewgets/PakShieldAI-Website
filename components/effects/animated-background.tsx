"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      pulsePhase: number
    }> = []

    const colors = [
      "rgba(100, 150, 255, 0.6)", // cyber blue
      "rgba(255, 80, 120, 0.6)", // crimson red
      "rgba(80, 255, 150, 0.6)", // emerald green
      "rgba(200, 100, 255, 0.5)", // purple
      "rgba(255, 200, 80, 0.5)", // gold
    ]

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    let scanLineY = 0
    let scanDirection = 1

    function animate() {
      if (!ctx || !canvas) return

      ctx.fillStyle = "rgba(10, 10, 20, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgba(100, 150, 255, 0.03)"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      scanLineY += scanDirection * 2
      if (scanLineY > canvas.height || scanLineY < 0) {
        scanDirection *= -1
      }

      const gradient = ctx.createLinearGradient(0, scanLineY - 50, 0, scanLineY + 50)
      gradient.addColorStop(0, "rgba(100, 150, 255, 0)")
      gradient.addColorStop(0.5, "rgba(100, 150, 255, 0.3)")
      gradient.addColorStop(1, "rgba(100, 150, 255, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, scanLineY - 50, canvas.width, 100)

      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.pulsePhase += 0.05

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        const pulseSize = particle.size + Math.sin(particle.pulsePhase) * 1

        const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, pulseSize * 4)
        glowGradient.addColorStop(0, particle.color)
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulseSize * 4, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        particles.forEach((otherParticle, j) => {
          if (i === j) return
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            const lineGradient = ctx.createLinearGradient(particle.x, particle.y, otherParticle.x, otherParticle.y)
            lineGradient.addColorStop(0, particle.color)
            lineGradient.addColorStop(1, otherParticle.color)

            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = lineGradient
            ctx.globalAlpha = 0.3 * (1 - distance / 200)
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40" style={{ zIndex: 0 }} />
}

export default AnimatedBackground
