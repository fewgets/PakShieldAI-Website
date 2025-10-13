"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const items = [
  { id: 1, t: "12:01:24", source: "Email Protection", msg: "Phishing URL blocked", level: "high" },
  { id: 2, t: "12:03:08", source: "Video Anomaly", msg: "Unusual motion detected - Zone B", level: "med" },
  { id: 3, t: "12:05:16", source: "Border ANPR", msg: "Plate PK-AB123 flagged", level: "high" },
  { id: 4, t: "12:06:02", source: "Dark Web", msg: "Credential dump mention", level: "low" },
  { id: 5, t: "12:07:31", source: "Crowd Analysis", msg: "Density spike near Gate 3", level: "med" },
]

function Badge({ level }: { level: "low" | "med" | "high" }) {
  const styles =
    level === "high"
      ? "bg-destructive/20 text-destructive-foreground"
      : level === "med"
        ? "bg-accent/30 text-accent-foreground"
        : "bg-secondary/40 text-secondary-foreground"
  return <span className={`rounded px-2 py-0.5 text-[10px] ${styles}`}>{level.toUpperCase()}</span>
}

export function ActivityLog({ sources }: { sources?: string[] }) {
  const filtered = sources?.length ? items.filter((it) => sources.includes(it.source)) : items
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Detection Activity</CardTitle>
      </CardHeader>
      <CardContent className="max-h-64 overflow-auto">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No recent events for this module.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xs tabular-nums text-muted-foreground">{it.t}</span>
                  <span className="flex-1 truncate text-sm">
                    <span className="font-medium">{it.source}:</span> {it.msg}
                  </span>
                </div>
                <Badge level={it.level as any} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
