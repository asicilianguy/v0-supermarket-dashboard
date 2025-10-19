"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  FileText, 
  Download, 
  Calendar, 
  HardDrive,
  Upload,
  Copy,
  Check,
  Link as LinkIcon,
  X
} from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
  shareLink?: string; // Link condivisione pubblica
}

export default function DrivePage() {
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Seleziona solo file PDF');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('Il file non può superare i 50MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !accessToken) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/drive/upload?access_token=${accessToken}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        // Reset input file
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Refresh file list dopo 1 secondo
        setTimeout(() => {
          fetchFiles(accessToken);
          setUploadSuccess(false);
        }, 1500);
      } else {
        setError(data.error || 'Errore durante l\'upload');
      }
    } catch (err) {
      setError('Errore di connessione durante l\'upload');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (fileId: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Errore nella copia:', err);
      setError('Impossibile copiare il link');
    }
  };

  const getPublicShareLink = (fileId: string) => {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
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
            Visualizza, carica e scarica i PDF dei volantini
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive bg-destructive/10 p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive font-medium">⚠️ {error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Success Alert */}
        {uploadSuccess && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/20 p-4 mb-6">
            <p className="text-green-700 dark:text-green-400 font-medium">
              ✅ File caricato con successo!
            </p>
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
                Autorizza l'accesso al tuo Google Drive per visualizzare e caricare volantini
              </p>
              <Button onClick={handleLogin} size="lg" className="mt-4">
                🔐 Accedi con Google
              </Button>
            </div>
          </Card>
        )}

        {/* Upload Form */}
        {accessToken && !loading && (
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Carica Nuovo Volantino</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    id="file-input"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      📄 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="sm:w-auto w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Carica PDF
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                ℹ️ I file verranno caricati nella cartella "flyers" e resi pubblici automaticamente. Max 50MB.
              </p>
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
                disabled={loading}
              >
                🔄 Ricarica
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => {
                const publicLink = getPublicShareLink(file.id);
                const isCopied = copiedId === file.id;

                return (
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

                      {/* Public Link */}
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Link Pubblico:
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={publicLink}
                            readOnly
                            className="text-xs h-8"
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <Button
                            variant={isCopied ? "default" : "outline"}
                            size="sm"
                            onClick={() => copyToClipboard(file.id, publicLink)}
                            className="shrink-0"
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
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
                );
              })}
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
                Carica il tuo primo volantino usando il form qui sopra
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
