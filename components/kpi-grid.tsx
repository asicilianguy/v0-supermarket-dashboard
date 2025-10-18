"use client"

import { useEffect, useState } from "react"
import { KPICard } from "@/components/kpi-card"
import { Package, Store, AlertTriangle, Calendar, TrendingUp, DollarSign, Award } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KPIData {
  totalProducts: number
  activeSupermarkets: number
  totalSupermarkets: number
  expiringTomorrow: number
  expiringIn3Days: number
  expiringIn7Days: number
  productsLast7Days: number
  averagePrice: number
  minPrice: number
  maxPrice: number
  topBrand: { name: string; count: number }
  topSupermarket: { name: string; count: number }
}

export function KPIGrid() {
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) throw new Error("Failed to fetch data")
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("[v0] Error fetching KPI data:", err)
        setError("Errore nel caricamento dei dati")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-center text-muted-foreground py-8">{error || "Nessun dato disponibile"}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Totale Prodotti"
        value={data.totalProducts.toLocaleString("it-IT")}
        icon={Package}
        trend={`+${data.productsLast7Days} ultimi 7 giorni`}
        trendUp={data.productsLast7Days > 0}
      />
      <KPICard
        title="Supermercati Attivi"
        value={data.activeSupermarkets.toString()}
        icon={Store}
        description={`su ${data.totalSupermarkets} totali`}
      />
      <KPICard
        title="Scadono Domani"
        value={data.expiringTomorrow.toString()}
        icon={AlertTriangle}
        trend="Richiede attenzione"
        trendUp={false}
        variant="warning"
      />
      <KPICard
        title="Scadono in 3 Giorni"
        value={data.expiringIn3Days.toString()}
        icon={Calendar}
        description="Offerte in scadenza"
        variant="warning"
      />
      <KPICard
        title="Scadono in 7 Giorni"
        value={data.expiringIn7Days.toString()}
        icon={Calendar}
        description="Pianifica promozioni"
      />
      <KPICard
        title="Prezzo Medio"
        value={`€${data.averagePrice.toFixed(2)}`}
        icon={DollarSign}
        trend={`€${data.minPrice.toFixed(2)} - €${data.maxPrice.toFixed(2)}`}
      />
      <KPICard
        title="Top Brand"
        value={data.topBrand.name}
        icon={Award}
        description={`${data.topBrand.count} prodotti`}
      />
      <KPICard
        title="Top Supermercato"
        value={data.topSupermarket.name.toUpperCase()}
        icon={TrendingUp}
        description={`${data.topSupermarket.count} prodotti`}
      />
    </div>
  )
}
