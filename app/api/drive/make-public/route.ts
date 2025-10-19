import { NextRequest, NextResponse } from 'next/server';
import { makeFilePublic } from '@/lib/googleDrive';

/**
 * POST /api/drive/make-public
 * Rende un file pubblico dopo l'upload
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token mancante' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID mancante' },
        { status: 400 }
      );
    }

    console.log(`🔓 Rendendo pubblico il file: ${fileId}`);

    await makeFilePublic(accessToken, fileId);

    return NextResponse.json({
      success: true,
      message: 'File reso pubblico con successo',
    });

  } catch (error) {
    console.error('❌ Errore nel rendere il file pubblico:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel rendere il file pubblico',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
