import { prisma } from '../db/prisma.js';

// Тип подписки
export interface Subscription {
  telegramId: number;
  username: string;
  startDate: Date;
  endDate: Date;
  notified: boolean;
  plan?: string | null; // добавляем опциональное поле
}

// Единый объект db для подписок и платежей
export const db = {
  // --- ПОДПИСКИ ---
  async addSubscription(sub: Subscription) {
    await prisma.subscription.create({
      data: {
        ...sub,
        notified: false, // по умолчанию
      },
    });
  },

  async getActiveSubscriptions() {
    return prisma.subscription.findMany({
      where: {
        endDate: { gt: new Date() }, // только действующие
      },
    });
  },

  // --- ПЛАТЕЖИ ---
  async isPaymentProcessed(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });
    return !!payment;
  },

  async markPaymentProcessed(data: {
    orderId: string;
    userId: string;
    provider: string;
    amount: number;
    currency: string;
  }) {
    await prisma.payment.create({
      data,
    });
  },
};