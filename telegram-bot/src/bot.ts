import { Telegraf, Markup } from 'telegraf';
import { createSubscription } from './services/subscriptionService.js';
import { createFondyPayment } from './services/payment/fondy.service.js';
import { createWayForPayPayment } from './services/payment/wayforpay.service.js';

// enum для типов подписки
export enum SubscriptionType {
  HOME_1_MONTH = 'HOME_1_MONTH',
  HOME_3_MONTHS = 'HOME_3_MONTHS',
  HOME_6_MONTHS = 'HOME_6_MONTHS'
}

export function setupBot(bot: Telegraf) {
  // /start (в том числе при переходе по ссылке)
  bot.start(async (ctx) => {
    const firstName = ctx.from?.first_name ?? 'друг';

    await ctx.reply(
      `Привет, ${firstName}! Спасибо, что выбрал(а) меня в качестве своего тренера!\n\n` +
        `Выбери ниже программу тренировок в записи, которая тебе подходит.`,
      Markup.inlineKeyboard([
        [Markup.button.callback('1 месяц - 12€', SubscriptionType.HOME_1_MONTH)],
        [Markup.button.callback('3 месяца - 30€', SubscriptionType.HOME_3_MONTHS)],
        [Markup.button.callback('6 месяцев - 55€', SubscriptionType.HOME_6_MONTHS)]
      ])
    );
  });

  // обработчик выбора подписки
  bot.action(
    [
      SubscriptionType.HOME_1_MONTH,
      SubscriptionType.HOME_3_MONTHS,
      SubscriptionType.HOME_6_MONTHS
    ],
    async (ctx) => {
      const user = ctx.from;
      if (!user) return;

      const selectedPlan =
        ctx.match?.[0] || (ctx.callbackQuery as any)?.data as SubscriptionType;

      // создаём подписку во внутренней системе
      await createSubscription({
        telegramId: user.id,
        username:
          user.username ?? `${user.first_name} ${user.last_name ?? ''}`.trim(),
        plan: selectedPlan 
      });

      await ctx.answerCbQuery();

      await ctx.reply(
        'Для продолжения перейдите к оплате:',
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              '💳 Картой (Fondy)',
              `pay_fondy:${selectedPlan}`
            )
          ],
          [
            Markup.button.callback(
              '🇺🇦 Картой (WayForPay)',
              `pay_wayforpay:${selectedPlan}`
            )
          ]
        ])
      );
    }
  );

  // обработка callback_query для оплаты
  bot.on('callback_query', async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const userId = ctx.from!.id;

    // Fondy
    if (data.startsWith('pay_fondy:')) {
      const plan = data.split(':')[1] as SubscriptionType;
      const amount = getAmountByPlan(plan, 'EUR');
      const payment = await createFondyPayment(userId, amount);

      await ctx.answerCbQuery();
      await ctx.reply(
        '💳 Оплата подписки (Fondy):',
        Markup.inlineKeyboard([Markup.button.url('Перейти к оплате', payment.url)])
      );
    }

    // WayForPay
    if (data.startsWith('pay_wayforpay:')) {
      const plan = data.split(':')[1] as SubscriptionType;
      const amount = getAmountByPlan(plan, 'UAH');
      const payment = await createWayForPayPayment(userId, amount);

      await ctx.answerCbQuery();
      await ctx.reply(
        '🇺🇦 Оплата подписки (WayForPay):',
        Markup.inlineKeyboard([
          Markup.button.url(
            'Перейти к оплате',
            `${process.env.BASE_URL}/pay/wayforpay/${payment.orderId}`
          )
        ])
      );
    }
  });
}

// функция для расчёта суммы по плану
// Возвращает сумму в основных единицах валюты (EUR в евро, UAH в гривнах)
// Конвертация в центы/копейки происходит в payment сервисах
function getAmountByPlan(plan: SubscriptionType, currency: 'EUR' | 'UAH'): number {
  const prices: Record<SubscriptionType, { EUR: number; UAH: number }> = {
    [SubscriptionType.HOME_1_MONTH]: { EUR: 12, UAH: 600 },    // 12€ или 600₴
    [SubscriptionType.HOME_3_MONTHS]: { EUR: 30, UAH: 1500 },  // 30€ или 1500₴
    [SubscriptionType.HOME_6_MONTHS]: { EUR: 55, UAH: 2800 }   // 55€ или 2800₴
  };
  return prices[plan][currency];
}

// функция для тестового предоставления доступа (можно интегрировать позже)
export async function grantTelegramAccess(userId: string) {
  console.log(`Access granted to ${userId}`);
}
