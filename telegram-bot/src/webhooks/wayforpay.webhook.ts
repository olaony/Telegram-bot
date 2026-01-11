import type { Request, Response } from 'express';
import crypto from 'crypto';
import { grantTelegramAccess } from '../bot.js';
import { db } from '../storage/subscriptionStore.js';

function verifyWayForPaySignature(data: any, secret: string): boolean {
  const receivedSignature = data.merchantSignature;

  const fields = [
    data.merchantAccount,
    data.orderReference,
    data.amount,
    data.currency,
    data.transactionStatus,
  ];

  const expectedSignature = crypto
    .createHmac('md5', secret)
    .update(fields.join(';'))
    .digest('hex');

  return receivedSignature === expectedSignature;
}

export async function wayForPayWebhookHandler(req: Request, res: Response) {
  const data = req.body;

  if (!verifyWayForPaySignature(data, process.env.WFP_SECRET!)) {
    return res.status(403).json({ status: 'signature_error' });
  }

  if (data.transactionStatus !== 'Approved') return res.json({ status: 'ignored' });

  const orderId = data.orderReference;
  const userId = orderId.split('_')[1];

  const alreadyProcessed = await db.isPaymentProcessed(orderId);
  if (alreadyProcessed) return res.json({ status: 'already_processed' });

  // Выдаём доступ
  await grantTelegramAccess(userId);

  // Сохраняем платёж
  await db.markPaymentProcessed({
    orderId,
    userId,
    provider: 'wayforpay',
    amount: data.amount,
    currency: data.currency,
  });

  res.json({ status: 'accept' });
}