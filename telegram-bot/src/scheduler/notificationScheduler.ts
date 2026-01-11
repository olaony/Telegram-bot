import type { Telegraf } from 'telegraf';
import { db } from '../storage/subscriptionStore.js';
import type { Subscription } from '../storage/subscriptionStore.js';


const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export function startNotificationScheduler(bot: Telegraf) {
  setInterval(async () => {
    const now = new Date();

    // Берём актуальные подписки из базы
    const subscriptions: Subscription[] = await db.getActiveSubscriptions();

    for (const sub of subscriptions) {
      if (sub.notified) continue;

      const notifyAt = new Date(sub.endDate.getTime() - FIVE_DAYS_MS);
      if (now >= notifyAt) {
        try {
          await bot.telegram.sendMessage(
            sub.telegramId,
            `⏰ Напоминание!\n\nСрок действия вашей подписки истекает ${sub.endDate.toLocaleDateString()}.\nПродлите её, чтобы продолжить тренировки 💪`
          );

          // Отмечаем как уведомленное
          sub.notified = true;

          // Сохраняем изменение в базе (добавьте метод updateSubscription в db)
          await db.addSubscription(sub); // если есть updateSubscription, используйте его
        } catch (err) {
          console.error('Ошибка отправки уведомления', err);
        }
      }
    }
  }, 60 * 60 * 1000); // проверка раз в час
}
