"use client"

import { DOMAIN_SUMMARIES, MODULES } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"
import { ModuleGrid } from "@/components/modules/module-grid"
import { DomainHero } from "@/components/hero/domain-hero"

const domain: DomainKey = "video-analytics"

export default function VideoAnalyticsPage() {
  return (
    <div className="space-y-6">
      <DomainHero
        title="Video Surveillance Analytics"
        subtitle="Live computer vision for faces, weapons, anomalies and crowd dynamics."
        variant="video"
      />
      <div>
        <h2 className="text-2xl font-semibold">Video Surveillance Analytics</h2>
        <p className="text-sm text-muted-foreground">{DOMAIN_SUMMARIES[domain]}</p>
      </div>
      <ModuleGrid domain={domain} modules={MODULES[domain]} />
    </div>
  )
}
