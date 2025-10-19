"use client";

import { useState } from "react";
import { SUPERMARKETS } from "@/lib/supermarketsData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Search, MapPin } from "lucide-react";

export function FlyersQuickAccess() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter supermarkets based on search query
  const filteredSupermarkets = SUPERMARKETS.filter((supermarket) =>
    supermarket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supermarket.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenFlyer = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            Accesso Rapido Volantini
          </h2>
          <p className="text-muted-foreground mt-1">
            Clicca su un punto vendita per visualizzare i volantini online
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {filteredSupermarkets.length} Punti Vendita
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cerca per nome o località..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Supermarkets Grid */}
      {filteredSupermarkets.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Nessun punto vendita trovato
          </h3>
          <p className="text-muted-foreground">
            Prova a modificare la ricerca
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSupermarkets.map((supermarket) => (
            <Card
              key={supermarket.id}
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary"
              onClick={() => handleOpenFlyer(supermarket.volantino)}
              style={{
                borderColor: `${supermarket.color}20`,
              }}
            >
              {/* Color Accent Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
                style={{ backgroundColor: supermarket.color }}
              />

              <div className="p-5 pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: supermarket.color }}
                    />
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-2">
                      {supermarket.name}
                    </h3>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                </div>

                {/* Location Badge */}
                {supermarket.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{supermarket.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                  <FileText className="h-4 w-4" />
                  <span>Visualizza volantino</span>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Suggerimento:</strong> I volantini si apriranno in una
          nuova scheda del browser. Cerca per nome o località per trovare il punto vendita più vicino.
        </p>
      </Card>
    </div>
  );
}
