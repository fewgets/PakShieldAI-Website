"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiCard({
  title,
  value,
  delta,
}: {
  title: string
  value: string
  delta?: string
}) {
  return (
    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{value}</div>
          {delta && <div className="text-xs text-muted-foreground">vs last 24h: {delta}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
