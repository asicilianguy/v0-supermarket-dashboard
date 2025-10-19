import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/googleDrive';

/**
 * GET /api/auth/google
 * Inizia il flusso OAuth di Google
 */
export async function GET() {
  try {
    const authUrl = getAuthUrl();
    
    console.log('🔐 Reindirizzamento a Google OAuth...');
    
    // Reindirizza l'utente alla pagina di consenso Google
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('❌ Errore nell\'inizializzazione OAuth:', error);
    return NextResponse.json(
      { 
        error: 'Errore nell\'inizializzazione dell\'autenticazione',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
