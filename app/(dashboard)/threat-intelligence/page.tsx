"use client"

import { DOMAIN_SUMMARIES, MODULES } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"
import { ModuleGrid } from "@/components/modules/module-grid"
import { DomainHero } from "@/components/hero/domain-hero"

const domain: DomainKey = "threat-intelligence"

export default function ThreatIntelligencePage() {
  return (
    <div className="space-y-6">
      <DomainHero
        title="Threat Intelligence AI"
        subtitle="Email, intrusion, social and darknet insights unified in one situational picture."
        variant="threat"
      />
      <div>
        <h2 className="text-2xl font-semibold">Threat Intelligence AI</h2>
        <p className="text-sm text-muted-foreground">{DOMAIN_SUMMARIES[domain]}</p>
      </div>
      <ModuleGrid domain={domain} modules={MODULES[domain]} />
    </div>
  )
}
