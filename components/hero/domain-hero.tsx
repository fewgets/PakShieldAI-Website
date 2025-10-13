"use client"

import { cn } from "@/lib/utils"

export function DomainHero({
  title,
  subtitle,
  variant,
}: {
  title: string
  subtitle: string
  variant: "threat" | "video" | "border"
}) {
  const bgQuery =
    variant === "threat"
      ? "/glowing-neural-ai-brain-network.jpg"
      : variant === "video"
        ? "/surveillance-camera-grid-overlay.jpg"
        : "/border-radar-drone-perimeter-visual.jpg"

  return (
    <section
      className={cn("relative overflow-hidden rounded-xl border", "bg-gradient-to-b from-background to-background/60")}
      aria-label={`${title} hero`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={bgQuery || "/placeholder.svg?height=640&width=1280&query=thematic%20hero%20background"}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn("h-full w-full object-cover opacity-30", "mix-blend-overlay")}
        />
        <div className="absolute inset-0 bg-[radial-gradient(transparent,transparent,rgba(0,0,0,0.3))] dark:bg-[radial-gradient(transparent,transparent,rgba(0,0,0,0.6))]" />
      </div>
      <div className="relative p-6 md:p-8">
        <h1 className="text-balance text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-pretty text-muted-foreground">{subtitle}</p>
        <div className="mt-4 h-1 w-24 bg-[hsl(var(--chart-2))] rounded-full shadow-[0_0_12px_2px_rgba(0,0,0,0.15)]" />
      </div>
    </section>
  )
}
