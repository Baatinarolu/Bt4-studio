import * as crypto from 'crypto';

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verify Telegram Login Widget authorization data
 * See: https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(data: Partial<TelegramAuthData>, botToken: string): boolean {
  if (!botToken || !data.hash) {
    return false;
  }

  const { hash, ...rest } = data as any;

  // Build the data-check string
  const dataCheckArr = Object.keys(rest)
    .filter(key => rest[key] !== undefined && rest[key] !== null)
    .sort()
    .map(key => `${key}=${rest[key]}`);

  const dataCheckString = dataCheckArr.join('\n');

  // secret_key = SHA256(bot_token)
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  // HMAC-SHA256(data_check_string, secret_key)
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}

/**
 * Generate a deterministic email for a Telegram user
 */
export function getTelegramEmail(telegramId: number): string {
  return `tg_${telegramId}@bt4.studio`;
}

/**
 * Generate a strong deterministic password for Telegram users.
 * This is only known to the server (derived from bot token + id).
 */
export function getTelegramPassword(telegramId: number, botToken: string): string {
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required for Telegram auth');
  }
  return crypto
    .createHmac('sha256', botToken)
    .update(telegramId.toString())
    .digest('hex');
}
