import type { Request, Response } from 'express';
import crypto from 'crypto';
import { grantTelegramAccess } from '../bot.js'; // твоя функция выдачи доступа
import { db } from '../storage/subscriptionStore.js'; // твоя БД/хранилище

// Проверка подписи Fondy
function verifyFondySignature(data: any, secret: string): boolean {
  const receivedSignature = data.signature;
  delete data.signature;

  const ordered = Object.keys(data)
    .sort()
    .map((k) => data[k])
    .join('|');

  const expectedSignature = crypto
    .createHash('sha1')
    .update(secret + '|' + ordered)
    .digest('hex');

  return receivedSignature === expectedSignature;
}

// Express webhook handler
export async function fondyWebhookHandler(req: Request, res: Response) {
  const data = req.body;

  if (!verifyFondySignature({ ...data }, process.env.FONDY_SECRET!)) {
    return res.status(403).send('Invalid signature');
  }

  if (data.order_status !== 'approved') {
    return res.send('Ignored');
  }

  const orderId = data.order_id; // sub_userId_timestamp
  const userId = orderId.split('_')[1];

  const alreadyProcessed = await db.isPaymentProcessed(orderId);
  if (alreadyProcessed) return res.send('Already processed');

  // Выдаём доступ в Telegram
  await grantTelegramAccess(userId);

  // Сохраняем платёж
  await db.markPaymentProcessed({
    orderId,
    userId,
    provider: 'fondy',
    amount: data.amount, // ✅ Fondy возвращает сумму в центах (1200 для 12€)
    currency: data.currency,
  });

  res.send('OK');
}