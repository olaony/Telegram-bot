import crypto from 'crypto';
import axios from 'axios';

const {
  FONDY_MERCHANT_ID,
  FONDY_SECRET,
  BASE_URL
} = process.env;

function createSignature(data: Record<string, any>) {
  const ordered = Object.keys(data)
    .sort()
    .map(k => data[k])
    .join('|');

  return crypto
    .createHash('sha1')
    .update(`${FONDY_SECRET}|${ordered}`)
    .digest('hex');
}

export async function createFondyPayment(
  userId: number,
  amount: number // amount в EUR (например, 12 для 12€)
) {
  const payload: Record<string, any> = {
    merchant_id: FONDY_MERCHANT_ID,
    order_id: `fondy_${userId}_${Date.now()}`,
    order_desc: 'Telegram subscription',
    amount: amount * 100, // ✅ Fondy требует сумму в центах (12€ → 1200 центов)
    currency: 'EUR',
    server_callback_url: `${BASE_URL}/webhook/fondy`
  };

  payload.signature = createSignature(payload);

  const res = await axios.post(
    'https://pay.fondy.eu/api/checkout/url/',
    { request: payload }
  );

  return {
    orderId: payload.order_id,
    url: res.data.response.checkout_url
  };
}