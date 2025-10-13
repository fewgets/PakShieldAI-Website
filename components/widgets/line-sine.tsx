"use client"

import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"

function generateSine(len = 64, phase = 0) {
  return Array.from({ length: len }, (_, i) => {
    const x = i / len
    const y = Math.sin(x * Math.PI * 4 + phase) * 0.8 + Math.random() * 0.1
    return { x: i, y: Number(y.toFixed(3)) }
  })
}

export function LineSine() {
  const [phase, setPhase] = useState(0)
  const data = useMemo(() => generateSine(64, phase), [phase])

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => p + 0.2), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Signal Strength (Sine)</CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" hide />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="y"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              dot={{ r: 3, stroke: "var(--color-primary)", fill: "var(--color-primary)" }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
