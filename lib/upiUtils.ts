/**
 * Generate UPI Payment QR Code
 *
 * This utility creates a UPI payment link that can be encoded as a QR code
 * or used as a deep link for UPI apps.
 *
 * Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=<CURRENCY>&tn=<NOTE>
 */

export interface UPIPaymentParams {
  upiId: string; // Merchant UPI ID
  payeeName: string; // Merchant name
  amount: number; // Amount in rupees
  currency?: string; // Default: INR
  transactionNote: string; // Payment note/reference
  transactionRef?: string; // Optional transaction reference
}

export function generateUPILink(params: UPIPaymentParams): string {
  const { upiId, payeeName, amount, currency = 'INR', transactionNote, transactionRef } = params;

  // Encode parameters for URL
  const encodedPayeeName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);

  let upiLink = `upi://pay?pa=${upiId}&pn=${encodedPayeeName}&am=${amount}&cu=${currency}&tn=${encodedNote}`;

  if (transactionRef) {
    upiLink += `&tr=${encodeURIComponent(transactionRef)}`;
  }

  return upiLink;
}

/**
 * Generate QR Code Data URL using a simple QR code library
 * For production, use a proper QR code library like 'qrcode' or 'qrcode.react'
 *
 * This is a placeholder that returns the UPI link
 * In production, integrate with: npm install qrcode
 */
export function generateQRCodeDataURL(upiLink: string): string {
  // Placeholder - in production, use actual QR code generation
  // Example with 'qrcode' library:
  // import QRCode from 'qrcode';
  // return await QRCode.toDataURL(upiLink);

  return upiLink;
}

/**
 * Validate UPI ID format
 */
export function isValidUPIId(upiId: string): boolean {
  // UPI ID format: username@bankname
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId);
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate Order ID
 */
export function generateOrderId(): string {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `ANT-GRAV-${dateStr}-${randomStr}`;
}

/**
 * SARTHI UPI Configuration
 */
export const SARTHI_UPI_CONFIG = {
  upiId: 'techt98350085@barodampay',
  payeeName: 'SARTHI Education',
  currency: 'INR',
  adminWhatsApp: '919835019509',
  supportEmail: 'support@sarthi.com',
} as const;
