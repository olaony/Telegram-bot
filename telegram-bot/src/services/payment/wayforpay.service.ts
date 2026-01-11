import crypto from 'crypto';

const {
  WFP_ACCOUNT,
  WFP_SECRET,
  BASE_URL
} = process.env;

function createSignature(data: any) {
  const fields = [
    data.merchantAccount,
    data.merchantDomainName,
    data.orderReference,
    data.orderDate,
    data.amount,
    data.currency
  ];

  return crypto
    .createHmac('md5', WFP_SECRET!)
    .update(fields.join(';'))
    .digest('hex');
}

export function createWayForPayPayment(
  userId: number,
  amount: number // amount в UAH (например, 600 для 600₴)
) {
  const payload: any = {
    merchantAccount: WFP_ACCOUNT,
    merchantDomainName: 'yourdomain.com',
    orderReference: `wfp_${userId}_${Date.now()}`,
    orderDate: Math.floor(Date.now() / 1000),
    amount, // ✅ WayForPay принимает сумму в гривнах (600 для 600₴)
    currency: 'UAH',
    productName: ['Telegram subscription'],
    productPrice: [amount], // цена одного продукта
    productCount: [1],
    serviceUrl: `${BASE_URL}/webhook/wayforpay`
  };

  payload.merchantSignature = createSignature(payload);

  return {
    orderId: payload.orderReference,
    payload
  };
}