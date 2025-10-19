import { NextRequest, NextResponse } from 'next/server';
import { listFlyerPdfs } from '@/lib/googleDrive';

/**
 * GET /api/drive/files?access_token=...
 * Lista tutti i PDF dalla cartella "flyers" su Google Drive
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token mancante' },
        { status: 401 }
      );
    }

    console.log('📂 Recupero file da Google Drive...');

    const files = await listFlyerPdfs(accessToken);

    console.log(`✅ Trovati ${files.length} file PDF`);

    // Formatta i file per la risposta
    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size) : 0,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
    }));

    return NextResponse.json({
      success: true,
      files: formattedFiles,
      total: formattedFiles.length,
    });

  } catch (error) {
    console.error('❌ Errore nel recupero dei file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dei file da Google Drive',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
