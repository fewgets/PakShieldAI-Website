"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sample = Array.from({ length: 12 }, (_, i) => ({
  x: i + 1,
  count: Math.max(2, Math.round(10 + Math.sin(i) * 8 + (Math.random() * 4 - 2))),
}))

export function Histogram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Alerts Histogram</CardTitle>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sample} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" tickLine={false} />
            <YAxis tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" fill="oklch(var(--chart-2))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
