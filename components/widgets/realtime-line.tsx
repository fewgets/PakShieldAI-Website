"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Pt = { t: number; v: number }

export function RealtimeThreatLine() {
  const [data, setData] = useState<Pt[]>(() => Array.from({ length: 40 }, (_, i) => ({ t: i, v: 20 })))
  const [tick, setTick] = useState(0)
  const lastRef = useRef<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => {
        const lastV = d[d.length - 1]?.v ?? 20
        const next = Math.max(0, Math.round(lastV + (Math.random() - 0.5) * 6))
        return [...d.slice(1), { t: d[d.length - 1].t + 1, v: next }]
      })
      lastRef.current = new Date()
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const lastUpdate = useMemo(() => {
    const secs = Math.max(0, Math.round((Date.now() - lastRef.current.getTime()) / 1000))
    return secs === 0 ? "now" : `${secs}s ago`
  }, [tick])

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm">Realtime Threat Level</CardTitle>
        <span className="text-xs text-muted-foreground">Last update: {lastUpdate}</span>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="v" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
