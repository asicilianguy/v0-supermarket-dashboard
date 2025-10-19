import { DashboardHeader } from "@/components/dashboard-header";
import { SupermarketStatus } from "@/components/supermarket-status";
import { ProductSearch } from "@/components/product-search";
import { FlyersQuickAccess } from "@/components/flyers-quick-access";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Sezione Stato Supermercati */}
        <SupermarketStatus />

        {/* Sezione Accesso Rapido Volantini */}
        <div className="border-t-2 border-border pt-12">
          <FlyersQuickAccess />
        </div>

        {/* Sezione Ricerca Prodotti */}
        <div className="border-t-2 border-border pt-12">
          <ProductSearch />
        </div>
      </main>
    </div>
  );
}
