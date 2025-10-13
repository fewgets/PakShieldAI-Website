"use client"

import { DOMAIN_SUMMARIES, MODULES } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"
import { ModuleGrid } from "@/components/modules/module-grid"
import { DomainHero } from "@/components/hero/domain-hero"

const domain: DomainKey = "border-security"

export default function BorderSecurityPage() {
  return (
    <div className="space-y-6">
      <DomainHero
        title="Border Anomaly Detection"
        subtitle="Drones, ANPR vehicles, and perimeter threats monitored across sectors."
        variant="border"
      />
      <div>
        <h2 className="text-2xl font-semibold">Border Anomaly Detection</h2>
        <p className="text-sm text-muted-foreground">{DOMAIN_SUMMARIES[domain]}</p>
      </div>
      <ModuleGrid domain={domain} modules={MODULES[domain]} />
    </div>
  )
}
