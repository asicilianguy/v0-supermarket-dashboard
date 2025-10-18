"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TrendChartProps {
  data: Array<{ date: string; count: number }>
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--chart-1))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
