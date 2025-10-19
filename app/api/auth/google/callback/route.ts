import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/googleDrive';

/**
 * GET /api/auth/google/callback?code=...
 * Gestisce il callback OAuth di Google
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Gestione errori OAuth
    if (error) {
      console.error('❌ Errore OAuth:', error);
      return NextResponse.redirect(
        new URL(`/drive?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Verifica che ci sia il codice
    if (!code) {
      return NextResponse.redirect(
        new URL('/drive?error=missing_code', request.url)
      );
    }

    console.log('✅ Codice OAuth ricevuto, scambio token...');

    // Scambia il codice con i token
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      throw new Error('Nessun access token ricevuto');
    }

    console.log('✅ Token ricevuti con successo');

    // IMPORTANTE: Salva i token in un cookie sicuro o session
    // Per semplicità, li passiamo come query parameter (NON SICURO IN PRODUZIONE!)
    // In produzione, usa un sistema di sessioni o JWT
    
    const redirectUrl = new URL('/drive', request.url);
    redirectUrl.searchParams.set('access_token', tokens.access_token);
    
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Errore nel callback OAuth:', error);
    return NextResponse.redirect(
      new URL(
        `/drive?error=${encodeURIComponent('authentication_failed')}`,
        request.url
      )
    );
  }
}
