"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface MetricCardProps {
  title: string
  value: string
  target: string
  color: string
  icon: LucideIcon
}

export function MetricCard({ title, value, target, color, icon: Icon }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = Number.parseFloat(value)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const increment = numericValue / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [numericValue])

  return (
    <Card className="group relative p-6 bg-card/50 backdrop-blur-sm border-border/50 glow-border hover:scale-[1.05] transition-all duration-500 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
          color === "chart-1" && "bg-gradient-to-br from-chart-1 to-transparent",
          color === "chart-2" && "bg-gradient-to-br from-chart-2 to-transparent",
          color === "chart-3" && "bg-gradient-to-br from-chart-3 to-transparent",
        )}
      />

      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-radar",
          color === "chart-1" && "bg-gradient-conic from-chart-1 to-transparent",
          color === "chart-2" && "bg-gradient-conic from-chart-2 to-transparent",
          color === "chart-3" && "bg-gradient-conic from-chart-3 to-transparent",
        )}
        style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Icon className={cn("w-6 h-6 animate-pulse-glow", `text-${color}`)} />
            <div className={cn("absolute inset-0 blur-lg opacity-50", `bg-${color}`)} />
          </div>
          <span className="text-xs font-mono text-muted-foreground px-2 py-1 rounded bg-secondary/50">
            Target: {target}
          </span>
        </div>

        <h3 className="text-sm font-medium text-muted-foreground mb-2 text-balance">{title}</h3>

        <p
          className={cn(
            "text-3xl font-bold tabular-nums transition-all duration-300 group-hover:scale-110",
            `text-${color}`,
          )}
        >
          {displayValue.toFixed(1)}%
        </p>

        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden relative">
          <div
            className={cn("h-full rounded-full transition-all duration-1000 relative", `bg-${color}`)}
            style={{ width: value }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          <div className={cn("absolute inset-0 blur-md opacity-50", `bg-${color}`)} style={{ width: value }} />
        </div>
      </div>
    </Card>
  )
}
