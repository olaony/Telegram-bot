import { db } from '../storage/subscriptionStore.js';
import type { Subscription } from '../storage/subscriptionStore.js';

export async function createSubscription(data: { 
  telegramId: number; 
  username: string; 
  plan?: string | null; // ← добавлено
}) {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const subscription: Subscription = {
    telegramId: data.telegramId,
    username: data.username,
    startDate,
    endDate,
    notified: false,
    plan: data.plan ?? null, // null по умолчанию, если не указан 
  };

  // вызываем метод через db
  await db.addSubscription(subscription);

  console.log(
    `Создана подписка: ${data.username}, с ${startDate.toISOString()} по ${endDate.toISOString()}`
  );
}
