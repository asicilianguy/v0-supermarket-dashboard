"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { GenericScraperForm } from "@/components/generic-scraper-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  X,
  Play,
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
  shareLink?: string;
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
      console.log('📤 Inizio upload diretto a Google Drive...');

      // Step 1: Trova o crea la cartella "flyers"
      const folderResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='flyers' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const folderData = await folderResponse.json();
      let folderId: string;

      if (folderData.files && folderData.files.length > 0) {
        folderId = folderData.files[0].id;
        console.log(`✅ Cartella "flyers" trovata: ${folderId}`);
      } else {
        // Crea la cartella
        console.log('📁 Creazione cartella "flyers"...');
        const createFolderResponse = await fetch(
          'https://www.googleapis.com/drive/v3/files',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'flyers',
              mimeType: 'application/vnd.google-apps.folder',
            }),
          }
        );
        const newFolder = await createFolderResponse.json();
        folderId = newFolder.id;
        console.log(`✅ Cartella "flyers" creata: ${folderId}`);
      }

      // Step 2: Upload del file usando multipart upload
      const metadata = {
        name: selectedFile.name,
        parents: [folderId],
        mimeType: 'application/pdf',
      };

      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      formData.append('file', selectedFile);

      console.log(`📤 Upload file: ${selectedFile.name} (${selectedFile.size} bytes)`);

      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || 'Upload fallito');
      }

      const uploadedFile = await uploadResponse.json();
      console.log(`✅ File caricato con ID: ${uploadedFile.id}`);

      // Step 3: Rendi il file pubblico
      console.log('🔓 Rendendo il file pubblico...');
      const publicResponse = await fetch(
        `/api/drive/make-public?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId: uploadedFile.id }),
        }
      );

      if (!publicResponse.ok) {
        console.warn('⚠️ Impossibile rendere il file pubblico, ma upload completato');
      } else {
        console.log('✅ File reso pubblico');
      }

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

    } catch (err) {
      console.error('❌ Errore upload:', err);
      setError(err instanceof Error ? err.message : 'Errore durante l\'upload');
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
      console.error("Errore nella copia:", err);
      setError("Impossibile copiare il link");
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
            Gestione Volantini Drive
          </h2>
          <p className="text-muted-foreground mt-2">
            Carica, visualizza e processa PDF dei volantini
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive bg-destructive/10 p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive font-medium">⚠️ {error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
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

        {/* Login Required State */}
        {!accessToken ? (
          <Card className="p-12 text-center">
            <HardDrive className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Accedi a Google Drive
            </h3>
            <p className="text-muted-foreground mb-6">
              Connetti il tuo account Google per visualizzare e gestire i
              volantini PDF
            </p>
            <Button onClick={handleLogin} size="lg">
              <LinkIcon className="mr-2 h-4 w-4" />
              Accedi con Google
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="files" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">
                <FileText className="mr-2 h-4 w-4" />
                Gestione File
              </TabsTrigger>
              <TabsTrigger value="scraping">
                <Play className="mr-2 h-4 w-4" />
                Scraping Generico
              </TabsTrigger>
            </TabsList>

            {/* Tab: File Management */}
            <TabsContent value="files" className="space-y-6">
              {/* Upload Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Carica Nuovo Volantino PDF
                </h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      id="file-input"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      disabled={uploading}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        File selezionato: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Caricamento...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Carica PDF
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Loading State */}
              {loading ? (
                <Card className="p-12 text-center">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Caricamento file da Google Drive...
                  </p>
                </Card>
              ) : (
                <>
                  {/* Files List */}
                  {files.length === 0 ? (
                    <Card className="p-12 text-center">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Nessun volantino trovato
                      </h3>
                      <p className="text-muted-foreground">
                        Carica il primo PDF per iniziare
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {files.map((file) => (
                        <Card key={file.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">
                                {file.name}
                              </h4>
                              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span className="text-xs">
                                    {formatDate(file.createdTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3" />
                                  <span className="text-xs">
                                    {formatFileSize(file.size)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                window.open(file.webViewLink, "_blank")
                              }
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Apri
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  file.id,
                                  getPublicShareLink(file.id)
                                )
                              }
                            >
                              {copiedId === file.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Tab: Generic Scraping */}
            <TabsContent value="scraping">
              <GenericScraperForm files={files} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
