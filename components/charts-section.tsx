"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupermarketChart } from "@/components/charts/supermarket-chart"
import { ExpirationChart } from "@/components/charts/expiration-chart"
import { BrandChart } from "@/components/charts/brand-chart"
import { PriceDistributionChart } from "@/components/charts/price-distribution-chart"
import { TrendChart } from "@/components/charts/trend-chart"
import { AisleChart } from "@/components/charts/aisle-chart"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartsData {
  supermarketDistribution: Array<{ name: string; count: number }>
  expirationData: Array<{ period: string; count: number }>
  brandDistribution: Array<{ name: string; count: number }>
  priceDistribution: Array<{ range: string; count: number }>
  insertionTrend: Array<{ date: string; count: number }>
  aisleDistribution: Array<{ name: string; count: number }>
}

export function ChartsSection() {
  const [data, setData] = useState<ChartsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/charts")
        if (!response.ok) throw new Error("Failed to fetch data")
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("[v0] Error fetching charts data:", err)
        setError("Errore nel caricamento dei grafici")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-center text-muted-foreground py-8">{error || "Nessun dato disponibile"}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prodotti per Supermercato</CardTitle>
          </CardHeader>
          <CardContent>
            <SupermarketChart data={data.supermarketDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scadenze Prossime</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpirationChart data={data.expirationData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandChart data={data.brandDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Prezzi</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceDistributionChart data={data.priceDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend Inserimenti (Ultimi 30 Giorni)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={data.insertionTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prodotti per Corsia</CardTitle>
          </CardHeader>
          <CardContent>
            <AisleChart data={data.aisleDistribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
