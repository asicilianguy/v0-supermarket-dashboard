"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  Play,
  Calendar as CalendarIcon,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ChevronsUpDown,
  Check,
  Rocket,
} from "lucide-react";
import { VALID_SUPERMARKETS } from "@/lib/valid-supermarkets";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePair {
  id: string;
  startDate: string;
  endDate: string;
}

interface DriveFile {
  id: string;
  name: string;
  shareLink?: string;
}

interface ScrapingRequest {
  id: string;
  chainName: string;
  fileCount: number;
  status: "sending" | "sent" | "error";
  timestamp: Date;
  error?: string;
}

interface GenericScraperFormProps {
  files: DriveFile[];
}

export function GenericScraperForm({ files }: GenericScraperFormProps) {
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [datePairs, setDatePairs] = useState<DatePair[]>([
    { id: crypto.randomUUID(), startDate: "", endDate: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [scrapingRequests, setScrapingRequests] = useState<ScrapingRequest[]>([]);

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateForAPI = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Add new date pair
  const addDatePair = () => {
    setDatePairs([
      ...datePairs,
      { id: crypto.randomUUID(), startDate: "", endDate: "" },
    ]);
  };

  // Remove date pair
  const removeDatePair = (id: string) => {
    if (datePairs.length > 1) {
      setDatePairs(datePairs.filter((pair) => pair.id !== id));
    }
  };

  // Update date pair
  const updateDatePair = (
    id: string,
    field: "startDate" | "endDate",
    value: string
  ) => {
    setDatePairs(
      datePairs.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  };

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!selectedChain) {
      return "Seleziona una catena di supermercati";
    }

    if (selectedFiles.length === 0) {
      return "Seleziona almeno un file PDF da processare";
    }

    if (selectedFiles.length !== datePairs.length) {
      return `Devi avere ${selectedFiles.length} coppie di date (una per ogni file selezionato)`;
    }

    for (let i = 0; i < datePairs.length; i++) {
      const pair = datePairs[i];
      if (!pair.startDate || !pair.endDate) {
        return `Compila entrambe le date per la coppia ${i + 1}`;
      }

      const start = new Date(pair.startDate);
      const end = new Date(pair.endDate);

      if (start > end) {
        return `La data di inizio deve essere precedente alla data di fine (coppia ${
          i + 1
        })`;
      }
    }

    return null;
  };

  // Submit scraping request
  const handleSubmit = async () => {
    setError(null);

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create a new request tracker
    const requestId = crypto.randomUUID();
    const newRequest: ScrapingRequest = {
      id: requestId,
      chainName: selectedChain,
      fileCount: selectedFiles.length,
      status: "sending",
      timestamp: new Date(),
    };

    // Add to requests list
    setScrapingRequests((prev) => [newRequest, ...prev]);

    try {
      // Build Google Drive URLs
      const googleDriveUrls = selectedFiles.map((fileId) => {
        const file = files.find((f) => f.id === fileId);
        return (
          file?.shareLink ||
          `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
        );
      });

      // Format dates
      const offerStartDates = datePairs.map((pair) =>
        formatDateForAPI(pair.startDate)
      );
      const offerEndDates = datePairs.map((pair) =>
        formatDateForAPI(pair.endDate)
      );

      // Build payload
      const payload = {
        googleDriveUrls,
        offerStartDates,
        offerEndDates,
        chainName: selectedChain,
        storeName: selectedChain, // Same as chainName
      };

      console.log("📤 Sending scraping request:", payload);

      // Call API (non-blocking)
      const response = await fetch(
        "https://server-supermarket-app.onrender.com/api/scrape/generic",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Scraping request sent successfully:", data);
        
        // Update request status to sent
        setScrapingRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "sent" } : req
          )
        );
      } else {
        throw new Error(data.error || "Errore durante l'invio della richiesta");
      }
    } catch (err) {
      console.error("❌ Scraping error:", err);
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto";
      
      // Update request status to error
      setScrapingRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: "error", error: errorMessage }
            : req
        )
      );
      
      setError(errorMessage);
    }
  };

  // Filter supermarkets based on search
  const filteredSupermarkets = VALID_SUPERMARKETS.filter((chain) =>
    chain.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Get status icon for requests
  const getStatusIcon = (status: ScrapingRequest["status"]) => {
    switch (status) {
      case "sending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "sent":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get status text
  const getStatusText = (status: ScrapingRequest["status"]) => {
    switch (status) {
      case "sending":
        return "Invio in corso...";
      case "sent":
        return "Inviato - Controlla Telegram per il risultato";
      case "error":
        return "Errore nell'invio";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Play className="h-7 w-7 text-primary" />
          Scraping Generico Volantini
        </h2>
        <p className="text-muted-foreground mt-1">
          Processa PDF da Google Drive ed estrai prodotti in offerta
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Errore</p>
              <p className="text-sm text-destructive/90 mt-1">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Scraping Requests History */}
      {scrapingRequests.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Richieste di Scraping ({scrapingRequests.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScrapingRequests([])}
              className="h-7 text-xs"
            >
              Pulisci cronologia
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scrapingRequests.map((request) => (
              <div
                key={request.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  request.status === "sent" && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
                  request.status === "sending" && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
                  request.status === "error" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                )}
              >
                {getStatusIcon(request.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium uppercase">
                      {request.chainName}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {request.fileCount} PDF
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getStatusText(request.status)}
                  </p>
                  {request.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {request.error}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {request.timestamp.toLocaleString("it-IT")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          {/* Step 1: Select Chain with Combobox */}
          <div>
            <Label className="text-base font-semibold">
              1. Seleziona Catena Supermercato
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Cerca e scegli il supermercato di cui vuoi processare i volantini
            </p>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedChain ? (
                    <span className="font-semibold uppercase">
                      {selectedChain}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Cerca supermercato...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Cerca supermercato..."
                    value={searchValue}
                    onValueChange={(value) => {
                      console.log("Search value changed:", value);
                      setSearchValue(value);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>Nessun supermercato trovato.</CommandEmpty>
                    <CommandGroup>
                      {filteredSupermarkets.map((chain) => (
                        <CommandItem
                          key={chain}
                          value={chain}
                          onSelect={(currentValue) => {
                            setSelectedChain(
                              currentValue === selectedChain ? "" : currentValue
                            );
                            setSearchValue("");
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedChain === chain
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="uppercase font-medium">{chain}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedChain && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Selezionato: <strong className="ml-1 uppercase">{selectedChain}</strong>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedChain("")}
                  className="h-6 text-xs"
                >
                  Cambia
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Select Files */}
          <div>
            <Label className="text-base font-semibold">
              2. Seleziona PDF da Processare
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Clicca sui file per selezionarli ({selectedFiles.length}{" "}
              selezionati)
            </p>
            <div className="grid gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun file disponibile su Google Drive
                </p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFiles.includes(file.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedFiles.includes(file.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedFiles.includes(file.id) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1 truncate">
                      {file.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step 3: Date Pairs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label className="text-base font-semibold">
                  3. Imposta Date Offerte
                </Label>
                <p className="text-sm text-muted-foreground">
                  Una coppia di date per ogni file selezionato
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDatePair}
                disabled={datePairs.length >= selectedFiles.length}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi
              </Button>
            </div>

            <div className="space-y-3">
              {datePairs.map((pair, index) => (
                <Card key={pair.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor={`start-${pair.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Data Inizio
                        </Label>
                        <Input
                          id={`start-${pair.id}`}
                          type="date"
                          value={pair.startDate}
                          onChange={(e) =>
                            updateDatePair(pair.id, "startDate", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`end-${pair.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Data Fine
                        </Label>
                        <Input
                          id={`end-${pair.id}`}
                          type="date"
                          value={pair.endDate}
                          onChange={(e) =>
                            updateDatePair(pair.id, "endDate", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDatePair(pair.id)}
                      disabled={datePairs.length === 1}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {selectedFiles.length > 0 &&
              datePairs.length !== selectedFiles.length && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  ⚠️ Hai {selectedFiles.length} file selezionati ma{" "}
                  {datePairs.length} coppie di date. Devono essere uguali!
                </p>
              )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={!selectedChain || selectedFiles.length === 0}
              className="w-full"
              size="lg"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Avvia Nuovo Scraping
            </Button>

            {selectedChain && selectedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">📋 Riepilogo:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Catena: <strong className="uppercase">{selectedChain}</strong></li>
                  <li>• File da processare: <strong>{selectedFiles.length}</strong></li>
                  <li>• Coppie di date: <strong>{datePairs.length}</strong></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">ℹ️ Come funziona:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Cerca e seleziona la catena di supermercati</li>
              <li>Scegli uno o più PDF da Google Drive</li>
              <li>Imposta una coppia di date (inizio/fine offerta) per ogni PDF</li>
              <li>Avvia lo scraping per estrarre automaticamente i prodotti</li>
            </ol>
            <p className="mt-3 font-semibold text-green-700 dark:text-green-400">
              ✅ Puoi inviare multiple richieste contemporaneamente!
            </p>
            <p className="mt-1 text-xs">
              I risultati verranno notificati su Telegram. Puoi continuare a inviare nuove richieste mentre altre sono in elaborazione.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
