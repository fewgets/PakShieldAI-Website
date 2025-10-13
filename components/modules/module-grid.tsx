"use client"

import Link from "next/link"
import { ModuleCard } from "@/components/cards/module-card"
import { useState } from "react"
import {
  Shield,
  Activity,
  Radar,
  Hash,
  Mail,
  Send,
  Moon,
  Globe,
  LinkIcon,
  User,
  Crosshair,
  UsersIcon,
  AlertTriangle,
  Wallet as Wall,
  Radio,
  Search,
  Car,
  MoonStar,
  MapIcon,
} from "lucide-react"
import type { DomainKey, ModuleItem } from "@/lib/modules"

export function ModuleGrid({
  domain,
  modules,
}: {
  domain: DomainKey
  modules: ModuleItem[]
}) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const ICONS: Record<string, any> = {
    hash: Hash,
    mail: Mail,
    shield: Shield,
    send: Send,
    moon: Moon,
    globe: Globe,
    link: LinkIcon,
    user: User,
    activity: Activity,
    crosshair: Crosshair,
    users: UsersIcon,
    "alert-triangle": AlertTriangle,
    wall: Wall,
    radio: Radio,
    search: Search,
    car: Car,
    "moon-star": MoonStar,
    map: MapIcon,
  }

  function resolveIcon(icon: any) {
    if (typeof icon === "string") {
      return ICONS[icon] ?? Shield
    }
    return icon || Shield
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((m, idx) => {
        const isExpanded = expanded === idx
        const features = [
          { icon: Shield, label: "Hardened", color: "text-chart-1" },
          { icon: Activity, label: "Live telemetry", color: "text-chart-2" },
          { icon: Radar, label: "Signal tracking", color: "text-chart-3" },
        ]
        return (
          <div key={m.slug} className="flex h-full flex-col gap-2">
            <ModuleCard
              title={m.title}
              description={m.description}
              icon={resolveIcon(m.icon)}
              color={"chart-1"}
              features={features}
              isExpanded={isExpanded}
              onToggle={() => setExpanded((prev) => (prev === idx ? null : idx))}
            />
            <Link href={`/${domain}/${m.slug}`} className="w-full">
              <button
                className="btn-cyber cursor-pointer inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:glow hover:ripple"
                data-ripple="true"
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect()
                  const rx = ((e.clientX - rect.left) / rect.width) * 100 + "%"
                  const ry = ((e.clientY - rect.top) / rect.height) * 100 + "%"
                  e.currentTarget.style.setProperty("--rx", rx)
                  e.currentTarget.style.setProperty("--ry", ry)
                }}
              >
                Open Module
              </button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
