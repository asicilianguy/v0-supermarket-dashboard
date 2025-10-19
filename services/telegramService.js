import fetch from "node-fetch";

/**
 * Invia un messaggio Telegram
 * @param {string} chatId - ID della chat Telegram
 * @param {string} text - Testo del messaggio
 * @param {object} options - Opzioni aggiuntive
 * @returns {Promise<object>} - Risultato dell'invio
 */
export const sendTelegramMessage = async (chatId, text, options = {}) => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
          ...options,
        }),
      }
    );

    const result = await response.json();
    if (!result.ok) {
      console.error("❌ Error sending Telegram message:", result);
      return { success: false, error: result.description };
    }
    
    console.log("✅ Telegram message sent successfully");
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Formatta e invia notifica di scraping completato
 * @param {object} scrapingResult - Risultato dello scraping
 */
export const sendScrapingNotification = async (scrapingResult) => {
  const chatId = process.env.TELEGRAM_CHAT_ID || "1316245130";
  
  const { success, message, flyers, successCount, errorCount } = scrapingResult;
  
  if (success) {
    // Calcola prodotti totali inseriti
    let totalProducts = 0;
    let chainName = "N/A";
    
    if (flyers && flyers.length > 0) {
      chainName = flyers[0].storeName || "N/A";
      
      flyers.forEach((flyer) => {
        if (flyer.batchResults && flyer.batchResults.length > 0) {
          flyer.batchResults.forEach((batch) => {
            if (batch.success && batch.insertedCount) {
              totalProducts += batch.insertedCount;
            }
          });
        }
      });
    }
    
    // Messaggio di successo
    let messageText = 
      "*✅ Scraping Completato con Successo*\n" +
      "━━━━━━━━━━━━━━━━━━\n\n" +
      `*🏪 Supermercato:* ${chainName.toUpperCase()}\n` +
      `*📄 Volantini processati:* ${successCount}/${flyers?.length || 0}\n` +
      `*📦 Prodotti inseriti:* ${totalProducts}\n`;
    
    // Dettagli per volantino
    if (flyers && flyers.length > 0) {
      messageText += "\n*📋 Dettagli:*\n";
      
      flyers.forEach((flyer, index) => {
        if (flyer.success) {
          const productsCount = flyer.productsInfo?.length || 0;
          messageText += `• Volantino ${index + 1}: ${productsCount} prodotti estratti\n`;
          messageText += `  📅 ${flyer.offerStartDate} → ${flyer.offerEndDate}\n`;
          
          if (flyer.idFlyer) {
            messageText += `  🆔 ID: \`${flyer.idFlyer}\`\n`;
          }
        }
      });
    }
    
    if (errorCount > 0) {
      messageText += `\n⚠️ *${errorCount} volantini con errori*`;
    }
    
    messageText += "\n\n🤖 Notifica automatica - Sistema SpesaViva";
    
    return await sendTelegramMessage(chatId, messageText);
    
  } else {
    // Messaggio di errore
    let messageText = 
      "*❌ Scraping Fallito*\n" +
      "━━━━━━━━━━━━━━━━━━\n\n" +
      `*Errore:* ${message || "Errore sconosciuto"}\n`;
    
    if (flyers && flyers.length > 0) {
      const chainName = flyers[0].storeName || "N/A";
      messageText += `*🏪 Supermercato:* ${chainName.toUpperCase()}\n`;
      messageText += `*📄 Volantini tentati:* ${flyers.length}\n`;
      messageText += `*✅ Successi:* ${successCount}\n`;
      messageText += `*❌ Errori:* ${errorCount}\n`;
      
      // Mostra errori specifici
      messageText += "\n*🔍 Dettagli errori:*\n";
      flyers.forEach((flyer, index) => {
        if (!flyer.success && flyer.error) {
          messageText += `• Volantino ${index + 1}: ${flyer.error}\n`;
        }
      });
    }
    
    messageText += "\n\n🤖 Notifica automatica - Sistema SpesaViva";
    
    return await sendTelegramMessage(chatId, messageText);
  }
};
