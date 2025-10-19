import { NextRequest, NextResponse } from 'next/server';
import { uploadPdfToFlyers } from '@/lib/googleDrive';

/**
 * POST /api/drive/upload
 * Upload di un PDF su Google Drive nella cartella "flyers" e lo rende pubblico
 */
export async function POST(request: NextRequest) {
  try {
    // Ottieni l'access token dai query params
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token mancante' },
        { status: 401 }
      );
    }

    // Parse del form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nessun file fornito' },
        { status: 400 }
      );
    }

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Il file deve essere un PDF' },
        { status: 400 }
      );
    }

    // Verifica dimensione (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Il file non può superare i 50MB' },
        { status: 400 }
      );
    }

    console.log(`📤 Upload richiesto per: ${file.name} (${file.size} bytes)`);

    // Converti il file in buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload su Google Drive
    const result = await uploadPdfToFlyers(accessToken, buffer, file.name);

    console.log(`✅ Upload completato: ${result.file.id}`);

    return NextResponse.json({
      success: true,
      message: 'File caricato con successo',
      file: result.file,
    });

  } catch (error) {
    console.error('❌ Errore nell\'upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante l\'upload del file',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
