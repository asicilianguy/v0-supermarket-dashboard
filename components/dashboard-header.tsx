import { Store } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="border-b-2 border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scraping Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitora lo stato dei supermercati per pianificare lo scraping
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
