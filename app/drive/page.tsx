"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, FileText, Download, Calendar, HardDrive } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
}

export default function DrivePage() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("access_token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Errore di autenticazione: ${errorParam}`);
    }

    if (token) {
      setAccessToken(token);
      fetchFiles(token);
    }
  }, [searchParams]);

  const fetchFiles = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/drive/files?access_token=${token}`);
      const data = await response.json();

      if (data.success) {
        setFiles(data.files);
      } else {
        setError(data.error || "Errore nel caricamento dei file");
      }
    } catch (err) {
      setError("Errore di connessione");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-primary" />
            Volantini su Google Drive
          </h2>
          <p className="text-muted-foreground mt-2">
            Visualizza e scarica i PDF dei volantini caricati su Google Drive
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive bg-destructive/10 p-4 mb-6">
            <p className="text-destructive font-medium">⚠️ {error}</p>
          </Card>
        )}

        {/* Login Button */}
        {!accessToken && (
          <Card className="p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <HardDrive className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Accedi a Google Drive</h3>
              <p className="text-muted-foreground">
                Autorizza l'accesso al tuo Google Drive per visualizzare i volantini
              </p>
              <Button onClick={handleLogin} size="lg" className="mt-4">
                🔐 Accedi con Google
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Files Grid */}
        {accessToken && !loading && files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Trovati <strong>{files.length}</strong> volantini
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchFiles(accessToken)}
              >
                🔄 Ricarica
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    {/* File Icon */}
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Apri su Drive
                      </a>
                    </div>

                    {/* File Name */}
                    <div>
                      <h3 className="font-semibold text-sm truncate" title={file.name}>
                        {file.name}
                      </h3>
                    </div>

                    {/* File Info */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Visualizza PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {accessToken && !loading && files.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Nessun volantino trovato</h3>
              <p className="text-muted-foreground">
                Non sono stati trovati file PDF nella cartella "flyers" del tuo Google Drive
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
