import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Razorpay keys not found in production environment');
    }
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
};

export const createOrder = async (params: {
  amount: number; // Amount in INR (will be converted to paise)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}) => {
  const options = {
    amount: Math.round(params.amount * 100), // Convert to paise
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes,
  };

  const rzp = getRazorpayInstance();
  if (!rzp) throw new Error('Razorpay client not initialized');

  return rzp.orders.create(options);
};

export const createPaymentLink = async (params: {
  amount: number; // In INR (will be converted to paise)
  currency?: string;
  referenceId: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  callbackUrl?: string;
  expireByMinutes?: number;
}) => {
  const rzp = getRazorpayInstance();
  if (!rzp) throw new Error('Razorpay client not initialized');

  const expireBy = params.expireByMinutes 
    ? Math.floor(Date.now() / 1000) + params.expireByMinutes * 60
    : Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours default

  const payload: any = {
    amount: Math.round(params.amount * 100),
    currency: params.currency || 'INR',
    accept_partial: false,
    reference_id: params.referenceId,
    description: params.description,
    customer: {
      name: params.customer.name,
      email: params.customer.email,
      contact: params.customer.contact || undefined,
    },
    notify: {
      sms: false,
      email: true,
    },
    reminder_enable: true,
    notes: params.notes || {},
    callback_url: params.callbackUrl,
    callback_method: 'get',
    expire_by: expireBy,
  };

  return (rzp as any).paymentLink.create(payload);
};

export const fetchPaymentLink = async (paymentLinkId: string) => {
  const rzp = getRazorpayInstance();
  if (!rzp) throw new Error('Razorpay client not initialized');
  return (rzp as any).paymentLink.fetch(paymentLinkId);
};

export const verifyPayment = async (params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');

  return validatePaymentVerification(
    { order_id: params.orderId, payment_id: params.paymentId },
    params.signature,
    (process.env.RAZORPAY_KEY_SECRET || '').trim()
  );
};

export const validateWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
) => {
  const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
  return validateWebhookSignature(payload, signature, secret);
};

export const fetchOrder = async (orderId: string) => {
  const rzp = getRazorpayInstance();
  if (!rzp) throw new Error('Razorpay client not initialized');
  return rzp.orders.fetch(orderId);
};

export const fetchPayment = async (paymentId: string) => {
  const rzp = getRazorpayInstance();
  if (!rzp) throw new Error('Razorpay client not initialized');
  return rzp.payments.fetch(paymentId);
};
