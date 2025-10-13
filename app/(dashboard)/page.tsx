"use client"

import { MetricCard } from "@/components/cards/metric-card"
import { LineSine } from "@/components/widgets/line-sine"
import { MapGrid } from "@/components/widgets/map-grid"
import { ActivityLog } from "@/components/widgets/activity-log"
import { CircularScanner } from "@/components/widgets/circular-scanner"
import { RealtimeThreatLine } from "@/components/widgets/realtime-line"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Camera, Map, Bot } from "lucide-react"

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* header + quick links */}
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-balance text-2xl font-semibold">Defence AI Overview</h2>
          <p className="text-pretty text-sm text-muted-foreground">
            High-level insights across Threat Intelligence, Video Analytics, and Border Security.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/threat-intelligence">
            <Button
              variant="default"
              className="ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover-glow"
            >
              Threat Intelligence
            </Button>
          </Link>
          <Link href="/video-analytics">
            <Button
              variant="secondary"
              className="ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 hover-glow"
            >
              Video Analytics
            </Button>
          </Link>
          <Link href="/border-security">
            <Button
              variant="outline"
              className="ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-primary/40 bg-transparent hover-glow"
            >
              Border Security
            </Button>
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard title="Active Alerts" value="68.0" target="75%" color="chart-1" icon={Shield} />
        <MetricCard title="Cameras Online" value="91.4" target="100%" color="chart-2" icon={Camera} />
        <MetricCard title="Border Sectors" value="80.0" target="100%" color="chart-3" icon={Map} />
        <MetricCard title="Intel Sources" value="62.0" target="80%" color="chart-1" icon={Bot} />
      </section>

      {/* Realtime + histogram + scanner */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4">
          <RealtimeThreatLine />
          <LineSine />
        </div>
        <CircularScanner />
      </section>

      {/* Map + Activity */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MapGrid />
        <div className="lg:col-span-2">
          <ActivityLog />
        </div>
      </section>

      {/* Domain summary widgets */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 transition hover-glow bg-card/90 backdrop-blur glow-border">
          <h3 className="mb-2 text-sm font-semibold">Threat Intelligence</h3>
          <p className="text-xs text-muted-foreground">Email, Intrusion, Social, Dark Web</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-primary ring-1 ring-primary/30 bg-primary/10">
            Status: Operational • Last update: just now
          </div>
        </div>
        <div className="rounded-lg border p-4 transition hover-glow bg-card/90 backdrop-blur glow-border">
          <h3 className="mb-2 text-sm font-semibold">Video Analytics</h3>
          <p className="text-xs text-muted-foreground">Face, Weapons, Crowd, Anomaly</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-primary ring-1 ring-primary/30 bg-primary/10">
            Status: Degraded • Last update: 1m ago
          </div>
        </div>
        <div className="rounded-lg border p-4 transition hover-glow bg-card/90 backdrop-blur glow-border">
          <h3 className="mb-2 text-sm font-semibold">Border Anomaly</h3>
          <p className="text-xs text-muted-foreground">Drones, Vehicles, Thermal</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs text-primary ring-1 ring-primary/30 bg-primary/10">
            Status: Operational • Last update: 12s ago
          </div>
        </div>
      </section>
    </div>
  )
}
