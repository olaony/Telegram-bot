# Telegram Fitness Subscription Bot

Telegram-бот для продажи подписок на фитнес-тренировки с интеграцией платежных систем Fondy и WayForPay.

## Возможности

- Выбор тарифных планов (1, 3, 6 месяцев)
- Оплата через Fondy (EUR) или WayForPay (UAH)
- Автоматические уведомления об истечении подписки
- Безопасная обработка платежей с проверкой подписи
- Хранение данных в SQLite через Prisma ORM

## Технологии

- **Node.js** + **TypeScript**
- **Telegraf** - Telegram Bot API framework
- **Prisma** - Modern ORM
- **Express** - HTTP server для webhooks
- **SQLite** - База данных

## Установка

### 1. Клонировать репозиторий

```bash
git clone <your-repo-url>
cd telegram-bot
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

Обязательные переменные:
- `BOT_TOKEN` - токен от @BotFather
- `FONDY_MERCHANT_ID`, `FONDY_SECRET` - данные от Fondy
- `WFP_ACCOUNT`, `WFP_SECRET` - данные от WayForPay
- `BASE_URL` - URL вашего сервера для webhooks

### 4. Настроить базу данных

```bash
npx prisma migrate dev
```

### 5. Запустить бота

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Структура проекта

```
telegram-bot/
├── src/
│   ├── index.ts                    # Точка входа
│   ├── bot.ts                      # Обработчики команд
│   ├── db/prisma.ts                # Prisma client
│   ├── services/
│   │   ├── subscriptionService.ts  # Логика подписок
│   │   └── payment/                # Платежные сервисы
│   ├── storage/                    # Database layer
│   ├── scheduler/                  # Планировщик уведомлений
│   └── webhooks/                   # Payment webhooks
├── prisma/schema.prisma            # Database schema
└── package.json
```

## API Endpoints

### Webhooks

- `POST /webhook/fondy` - Fondy payment callback
- `POST /webhook/wayforpay` - WayForPay payment callback

### Health Checks

- `GET /health` - Health check endpoint (TODO)
- `GET /ready` - Readiness probe (TODO)

## Разработка

### Доступные скрипты

```bash
npm run dev     # Запуск в development режиме
npm run build   # Сборка TypeScript
npm start       # Запуск production версии
```

## Безопасность

- Никогда не коммитьте `.env` файл
- Все секретные ключи храните в environment variables
- Webhook endpoints проверяют криптографическую подпись

## TODO / Roadmap

См. [CODE_REVIEW.md](CODE_REVIEW.md) для полного списка улучшений.

Критические задачи:
- [ ] Исправить длительность подписки (использовать параметр plan)
- [ ] Реализовать функцию `grantTelegramAccess`
- [ ] Добавить обработку ошибок
- [ ] Создавать подписку после оплаты, а не до
- [ ] Добавить unit тесты

## Лицензия

ISC

## Контакты

Для вопросов и предложений создайте issue в этом репозитории.
