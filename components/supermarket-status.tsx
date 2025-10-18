"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react"
import { Store } from "lucide-react" // Declaring the Store variable

interface SupermarketDetail {
  chainName: string
  productCount: number
  lastUpdate: string | undefined | null
  oldestOffer: string | undefined | null
  newestOffer: string | undefined | null
}

interface DashboardData {
  summary: {
    totalSupermarkets: number
    activeSupermarkets: number
    inactiveSupermarkets: number
    expiringTodayCount: number
    expiringTomorrowCount: number
    expiringDayAfterCount: number
    expiringIn3DaysCount: number
  }
  supermarketsWithProducts: SupermarketDetail[]
  supermarketsWithoutProducts: string[]
  expiringToday: SupermarketDetail[]
  expiringTomorrow: SupermarketDetail[]
  expiringDayAfter: SupermarketDetail[]
  expiringIn3Days: SupermarketDetail[]
}

export function SupermarketStatus() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Errore nel caricamento dei dati</p>
      </div>
    )
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"

      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("[v0] Error formatting date:", error)
      return "N/A"
    }
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-2 border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Supermercati Totali</p>
              <p className="text-4xl font-bold text-foreground">{data.summary.totalSupermarkets}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-7 w-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-green-500/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Con Prodotti</p>
              <p className="text-4xl font-bold text-green-500">{data.summary.activeSupermarkets}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-7 w-7 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border-2 border-red-500/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Senza Prodotti</p>
              <p className="text-4xl font-bold text-red-500">{data.summary.inactiveSupermarkets}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Expiring Products Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-red-600/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scadono Oggi</p>
              <p className="text-3xl font-bold text-red-600">{data.summary.expiringTodayCount}</p>
              <p className="text-xs text-muted-foreground mt-1">supermercati</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="border-2 border-orange-500/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scadono Domani</p>
              <p className="text-3xl font-bold text-orange-500">{data.summary.expiringTomorrowCount}</p>
              <p className="text-xs text-muted-foreground mt-1">supermercati</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="border-2 border-yellow-500/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scadono Dopodomani</p>
              <p className="text-3xl font-bold text-yellow-500">{data.summary.expiringDayAfterCount}</p>
              <p className="text-xs text-muted-foreground mt-1">supermercati</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="border-2 border-blue-500/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scadono in 3 Giorni</p>
              <p className="text-3xl font-bold text-blue-500">{data.summary.expiringIn3DaysCount}</p>
              <p className="text-xs text-muted-foreground mt-1">supermercati</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Supermarkets with Products */}
      <Card className="border-2 border-border bg-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Supermercati con Prodotti ({data.supermarketsWithProducts.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.supermarketsWithProducts.map((sm) => (
            <div
              key={sm.chainName}
              className="border-2 border-green-500/30 rounded-lg p-4 bg-green-500/5 hover:bg-green-500/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-foreground uppercase">{sm.chainName}</h3>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                  {sm.productCount} prodotti
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium">Ultimo aggiornamento:</span> {formatDate(sm.lastUpdate)}
                </p>
                <p>
                  <span className="font-medium">Offerta più vecchia:</span> {formatDate(sm.oldestOffer)}
                </p>
                <p>
                  <span className="font-medium">Offerta più recente:</span> {formatDate(sm.newestOffer)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Supermarkets without Products */}
      {data.supermarketsWithoutProducts.length > 0 && (
        <Card className="border-2 border-red-500/50 bg-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Supermercati Senza Prodotti ({data.supermarketsWithoutProducts.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.supermarketsWithoutProducts.map((sm) => (
              <Badge
                key={sm}
                variant="outline"
                className="bg-red-500/10 text-red-500 border-red-500/50 px-4 py-2 text-sm font-bold uppercase"
              >
                {sm}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Expiring Today */}
      {data.expiringToday.length > 0 && (
        <Card className="border-2 border-red-600/50 bg-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Prodotti in Scadenza Oggi ({data.expiringToday.length} supermercati)
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.expiringToday.map((sm) => (
              <div
                key={sm.chainName}
                className="border-2 border-red-600/30 rounded-lg p-4 bg-red-600/5 hover:bg-red-600/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground uppercase">{sm.chainName}</h3>
                  <Badge variant="outline" className="bg-red-600/20 text-red-600 border-red-600/50">
                    {sm.productCount} prodotti
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Ultimo aggiornamento:</span> {formatDate(sm.lastUpdate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expiring Tomorrow */}
      {data.expiringTomorrow.length > 0 && (
        <Card className="border-2 border-orange-500/50 bg-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Prodotti in Scadenza Domani ({data.expiringTomorrow.length} supermercati)
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.expiringTomorrow.map((sm) => (
              <div
                key={sm.chainName}
                className="border-2 border-orange-500/30 rounded-lg p-4 bg-orange-500/5 hover:bg-orange-500/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground uppercase">{sm.chainName}</h3>
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-500 border-orange-500/50">
                    {sm.productCount} prodotti
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Ultimo aggiornamento:</span> {formatDate(sm.lastUpdate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expiring Day After Tomorrow */}
      {data.expiringDayAfter.length > 0 && (
        <Card className="border-2 border-yellow-500/50 bg-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Prodotti in Scadenza Dopodomani ({data.expiringDayAfter.length} supermercati)
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.expiringDayAfter.map((sm) => (
              <div
                key={sm.chainName}
                className="border-2 border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground uppercase">{sm.chainName}</h3>
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                    {sm.productCount} prodotti
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Ultimo aggiornamento:</span> {formatDate(sm.lastUpdate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expiring in 3 Days */}
      {data.expiringIn3Days.length > 0 && (
        <Card className="border-2 border-blue-500/50 bg-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Prodotti in Scadenza tra 3 Giorni ({data.expiringIn3Days.length} supermercati)
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.expiringIn3Days.map((sm) => (
              <div
                key={sm.chainName}
                className="border-2 border-blue-500/30 rounded-lg p-4 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground uppercase">{sm.chainName}</h3>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/50">
                    {sm.productCount} prodotti
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium">Ultimo aggiornamento:</span> {formatDate(sm.lastUpdate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
