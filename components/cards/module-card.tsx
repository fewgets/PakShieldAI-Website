"use client"

import { Card } from "@/components/ui/card"
import { type LucideIcon, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
  icon: LucideIcon
  label: string
  color: string
}

interface ModuleCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  features: Feature[]
  isExpanded: boolean
  onToggle: () => void
}

export function ModuleCard({ title, description, icon: Icon, color, features, isExpanded, onToggle }: ModuleCardProps) {
  return (
    <Card
      className={cn(
        "group relative p-6 bg-card/50 backdrop-blur-sm border-border/50 glow-border transition-all duration-500 cursor-pointer hover:scale-[1.03] overflow-hidden",
        isExpanded && "ring-2 ring-offset-2 ring-offset-background",
        color === "chart-1" && "ring-chart-1",
        color === "chart-2" && "ring-chart-2",
        color === "chart-3" && "ring-chart-3",
      )}
      onClick={onToggle}
    >
      <div className="absolute inset-0 holographic-grid pointer-events-none" />

      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div
        className={cn(
          "absolute top-0 left-0 w-20 h-20 opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-150",
          color === "chart-1" && "bg-chart-1",
          color === "chart-2" && "bg-chart-2",
          color === "chart-3" && "bg-chart-3",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 right-0 w-20 h-20 opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-150",
          color === "chart-1" && "bg-chart-1",
          color === "chart-2" && "bg-chart-2",
          color === "chart-3" && "bg-chart-3",
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative animate-float">
              <Icon className={cn("w-8 h-8 transition-all duration-300 group-hover:scale-110", `text-${color}`)} />
              <div
                className={cn(
                  "absolute inset-0 blur-xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse-glow",
                  `bg-${color}`,
                )}
              />
            </div>
            <h3 className="text-xl font-bold text-balance group-hover:text-primary transition-colors">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground animate-pulse" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:animate-bounce" />
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 text-pretty leading-relaxed">{description}</p>

        {isExpanded && (
          <div className="space-y-3 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300 hover:translate-x-1 group/feature"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <feature.icon
                  className={cn("w-4 h-4 group-hover/feature:scale-125 transition-transform", feature.color)}
                />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
