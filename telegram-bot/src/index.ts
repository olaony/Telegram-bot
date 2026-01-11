console.log('🚀 RUNNING NEW TYPESCRIPT BOT');

import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { setupBot } from './bot.js';
import { startNotificationScheduler } from './scheduler/notificationScheduler.js';
import express from 'express';
import bodyParser from 'body-parser';
import { fondyWebhookHandler } from './webhooks/fondy.webhook.js';
import { wayForPayWebhookHandler } from './webhooks/wayforpay.webhook.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);
setupBot(bot);
startNotificationScheduler(bot);

bot.launch();
console.log('Bot started');

const app = express();
app.use(bodyParser.json());

// Webhook endpoints
app.post('/webhook/fondy', fondyWebhookHandler);
app.post('/webhook/wayforpay', wayForPayWebhookHandler);

app.listen(3000, () => console.log('Server started on port 3000'));