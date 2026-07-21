/**
 * BT4 Studio — Telegram Delivery (Private Channel)
 * 
 * All files are stored in a private Telegram channel.
 * We deliver using sendDocument with the stored file_id.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID;

interface DeliverOptions {
  chatId: string | number;
  fileId: string;           // telegramFileId from DB
  caption?: string;
  filename?: string;
}

export async function sendTelegramDocument(opts: DeliverOptions): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.error('[telegram] TELEGRAM_BOT_TOKEN missing');
    return false;
  }

  const { chatId, fileId, caption = 'Your purchased file from BT4 Studio', filename = 'product.zip' } = opts;

  try {
    const formData = new FormData();
    formData.append('chat_id', String(chatId));
    formData.append('document', fileId);           // IMPORTANT: passing file_id directly
    formData.append('caption', caption);
    if (filename) formData.append('filename', filename);

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!data.ok) {
      console.error('[telegram] sendDocument failed:', data);
      return false;
    }

    console.log(`[telegram] Delivered file ${fileId} to ${chatId}`);
    return true;
  } catch (err) {
    console.error('[telegram] Delivery error:', err);
    return false;
  }
}

/**
 * Deliver a purchased product to a buyer via Telegram.
 * This is the main function used after payment confirmation.
 */
export async function deliverProductToBuyer(
  buyerTelegramChatId: string | number,
  telegramFileId: string,
  productTitle: string,
  orderId?: string
): Promise<boolean> {
  if (!telegramFileId) {
    console.error('[telegram] No telegramFileId provided for delivery');
    return false;
  }

  const caption = [
    `✅ *${productTitle}*`,
    orderId ? `Order: \`${orderId}\`` : '',
    '',
    'Thank you for your purchase!',
    'If you have any issues, contact support.',
  ].filter(Boolean).join('\n');

  return sendTelegramDocument({
    chatId: buyerTelegramChatId,
    fileId: telegramFileId,
    caption,
    filename: `${productTitle.replace(/[^a-z0-9]/gi, '_')}.zip`,
  });
}

/**
 * Notify admin about a new order / proof
 */
export async function notifyAdmin(message: string): Promise<void> {
  if (!ADMIN_ID || !BOT_TOKEN) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (e) {
    console.warn('[telegram] Failed to notify admin');
  }
}

/**
 * Send a simple message (used by bot webhook)
 */
export async function sendMessage(chatId: string | number, text: string, extra?: any) {
  if (!BOT_TOKEN) return;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...extra,
    }),
  });
}
