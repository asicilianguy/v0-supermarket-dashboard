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
    'https://www.googleapis.com/auth/drive.file', // Permette upload e gestione file
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
 * Lista tutti i file PDF (opzionalmente nella cartella "flyers")
 */
export async function listFlyerPdfs(accessToken: string) {
  const drive = getDriveClient(accessToken);
  
  try {
    // Prima prova a trovare la cartella "flyers"
    const foldersResponse = await drive.files.list({
      q: "name='flyers' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const flyersFolder = foldersResponse.data.files?.[0];
    
    let query;
    if (flyersFolder) {
      console.log(`✅ Cartella "flyers" trovata: ${flyersFolder.id}`);
      // Cerca solo dentro la cartella flyers
      query = `'${flyersFolder.id}' in parents and mimeType='application/pdf' and trashed=false`;
    } else {
      console.log('⚠️ Cartella "flyers" non trovata, cerco tutti i PDF nel Drive');
      // Cerca tutti i PDF in tutto il Drive
      query = "mimeType='application/pdf' and trashed=false";
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const files = response.data.files || [];
    console.log(`📄 Trovati ${files.length} file PDF`);
    
    return files;
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

/**
 * Trova o crea la cartella "flyers"
 */
async function getOrCreateFlyersFolder(drive: any) {
  // Cerca la cartella esistente
  const foldersResponse = await drive.files.list({
    q: "name='flyers' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const existingFolder = foldersResponse.data.files?.[0];
  
  if (existingFolder) {
    console.log(`✅ Cartella "flyers" esistente: ${existingFolder.id}`);
    return existingFolder.id;
  }

  // Crea la cartella se non esiste
  console.log('📁 Creazione cartella "flyers"...');
  const folderMetadata = {
    name: 'flyers',
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  console.log(`✅ Cartella "flyers" creata: ${folder.data.id}`);
  return folder.data.id;
}

/**
 * Upload di un PDF nella cartella "flyers" e lo rende pubblico
 */
export async function uploadPdfToFlyers(
  accessToken: string,
  fileBuffer: Buffer,
  fileName: string
) {
  const drive = getDriveClient(accessToken);

  try {
    // Ottieni o crea la cartella flyers
    const folderId = await getOrCreateFlyersFolder(drive);

    console.log(`📤 Upload del file: ${fileName}`);

    // Metadata del file
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/pdf',
    };

    // Upload del file
    const media = {
      mimeType: 'application/pdf',
      body: require('stream').Readable.from(fileBuffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    console.log(`✅ File caricato: ${file.data.id}`);

    // Rendi il file pubblico
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log(`✅ File reso pubblico`);

    // Ottieni il link pubblico diretto
    const fileDetails = await drive.files.get({
      fileId: file.data.id,
      fields: 'id, name, webViewLink, webContentLink, size, createdTime',
    });

    // Genera link di download diretto
    const directLink = `https://drive.google.com/uc?export=download&id=${file.data.id}`;

    return {
      success: true,
      file: {
        id: fileDetails.data.id,
        name: fileDetails.data.name,
        webViewLink: fileDetails.data.webViewLink,
        webContentLink: fileDetails.data.webContentLink,
        directDownloadLink: directLink,
        size: fileDetails.data.size,
        createdTime: fileDetails.data.createdTime,
      },
    };
  } catch (error) {
    console.error('❌ Errore nell\'upload del file:', error);
    throw error;
  }
}

/**
 * Ottieni il link di visualizzazione condivisa pubblica per un file
 */
export function getPublicShareLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}

/**
 * Ottieni il link diretto di download pubblico per un file
 */
export function getPublicDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Rende un file pubblico (reader per anyone)
 */
export async function makeFilePublic(accessToken: string, fileId: string) {
  const drive = getDriveClient(accessToken);

  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log(`✅ File ${fileId} reso pubblico`);
    return { success: true };
  } catch (error) {
    console.error('❌ Errore nel rendere il file pubblico:', error);
    throw error;
  }
}
