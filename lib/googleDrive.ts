import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Configurazione OAuth2
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

/**
 * Genera URL per autenticazione OAuth
 */
export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Forza il consenso per ottenere refresh_token
  });
}

/**
 * Ottiene i token dall'authorization code
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Crea un client Google Drive autenticato
 */
export function getDriveClient(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Lista tutti i file PDF nella cartella "flyers"
 */
export async function listFlyerPdfs(accessToken: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    // Prima trova la cartella "flyers"
    const foldersResponse = await drive.files.list({
      q: "name='flyers' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const flyersFolder = foldersResponse.data.files?.[0];
    
    if (!flyersFolder) {
      console.log('⚠️ Cartella "flyers" non trovata');
      return [];
    }

    console.log(`✅ Cartella "flyers" trovata: ${flyersFolder.id}`);

    // Poi cerca tutti i PDF dentro quella cartella
    const response = await drive.files.list({
      q: `'${flyersFolder.id}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    return response.data.files || [];
  } catch (error) {
    console.error('❌ Errore nel recupero dei file:', error);
    throw error;
  }
}

/**
 * Ottiene metadata di un file specifico
 */
export async function getFileMetadata(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink',
    });

    return response.data;
  } catch (error) {
    console.error('❌ Errore nel recupero metadata:', error);
    throw error;
  }
}

/**
 * Download di un file (restituisce lo stream)
 */
export async function downloadFile(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Errore nel download del file:', error);
    throw error;
  }
}
