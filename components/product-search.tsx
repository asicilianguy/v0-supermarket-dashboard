"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  productName: string
  brand: string
  chainName: string
  offerPrice: number | null
  pricePerKg: number | null
  productQuantity: string | null
  offerEndDate: string
  supermarketAisle: string[]
  createdAt: string
}

interface ProductSearchData {
  products: Product[]
  filters: {
    brands: string[]
    aisles: string[]
  }
  total: number
}

export function ProductSearch() {
  const [data, setData] = useState<ProductSearchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [brand, setBrand] = useState("")
  const [aisle, setAisle] = useState("")
  const [chainName, setChainName] = useState("")

  const validSupermarkets = [
  "aldi",
  "bennet",
  "centesimo",
  "crai",
  "decomarket",
  "decosupermercati",
  "despar",
  "esselunga",
  "eurospar",
  "eurospin",
  "famila",
  "familamarket",
  "familasuperstore",
  "gigante",
  "gulliver",
  "ins",
  "interspar",
  "iper",
  "lidl",
  "md",
  "mercatobig",
  "mercatoextra",
  "mercatolocal",
  "naturasi",
  "paghipoco",
  "pam",
  "pampanorama",
  "pamsuperstore",
  "penny",
  "prestofresco",
  "tigros",
  "todis",
  "unes",
]

  useEffect(() => {
    fetchProducts()
  }, [search, brand, aisle, chainName])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (brand) params.append("brand", brand)
      if (aisle) params.append("aisle", aisle)
      if (chainName) params.append("chainName", chainName)

      const response = await fetch(`/api/products?${params.toString()}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString("it-IT")
    } catch {
      return "N/A"
    }
  }

  const clearFilters = () => {
    setSearch("")
    setBrand("")
    setAisle("")
    setChainName("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ricerca Prodotti</h2>
          <p className="text-muted-foreground mt-1">Cerca e filtra i prodotti per nome, brand e categoria</p>
        </div>
        {data && (
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{data.total}</div>
            <div className="text-sm text-muted-foreground">Prodotti trovati</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6 border-2 border-border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-foreground mb-2 block">Cerca per nome</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Es: Salame, Pasta, Latte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Brand</label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Tutti i brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i brand</SelectItem>
                {data?.filters.brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aisle Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Categoria</label>
            <Select value={aisle} onValueChange={setAisle}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Tutte le categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {data?.filters.aisles.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supermarket Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Supermercato</label>
            <Select value={chainName} onValueChange={setChainName}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="Tutti i supermercati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i supermercati</SelectItem>
                {validSupermarkets.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters */}
        {(search || brand || aisle || chainName) && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters} className="border-2 bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Pulisci filtri
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Caricamento prodotti...</p>
        </div>
      ) : data && data.products.length > 0 ? (
        <div className="grid gap-4">
          {data.products.map((product) => (
            <Card key={product.id} className="p-4 border-2 border-border hover:border-primary transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Product Info */}
                <div className="md:col-span-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg border-2 border-primary/20">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg leading-tight">{product.productName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                    </div>
                  </div>
                </div>

                {/* Price & Quantity */}
                <div className="md:col-span-2">
                  <div className="text-2xl font-bold text-primary">
                    {product.offerPrice != null ? `€${product.offerPrice.toFixed(2)}` : "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">{product.productQuantity || "N/A"}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {product.pricePerKg != null ? `€${product.pricePerKg.toFixed(2)}/kg` : "N/A"}
                  </div>
                </div>

                {/* Supermarket */}
                <div className="md:col-span-2">
                  <Badge variant="outline" className="border-2 border-primary text-primary font-semibold">
                    {product.chainName.toUpperCase()}
                  </Badge>
                </div>

                {/* Categories */}
                <div className="md:col-span-2">
                  <div className="flex flex-wrap gap-1">
                    {product.supermarketAisle.map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs border border-border">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="md:col-span-2 text-right">
                  <div className="text-sm font-medium text-foreground">Scade il</div>
                  <div className="text-sm text-muted-foreground">{formatDate(product.offerEndDate)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Aggiunto: {formatDate(product.createdAt)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nessun prodotto trovato</h3>
          <p className="text-muted-foreground">Prova a modificare i filtri di ricerca</p>
        </Card>
      )}
    </div>
  )
}
