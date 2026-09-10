/**
 * Formats a number as Indian Rupee (INR)
 */
export const formatCurrency = (amount: number | undefined | null, emptyState: string = "₹0"): string => {
  if (amount === undefined || amount === null || amount === 0) return emptyState;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number with suffixes (K, M, etc.)
 */
export const formatNumber = (num: number | undefined | null, emptyState: string = "0"): string => {
  if (num === undefined || num === null || num === 0) return emptyState;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculates growth percentage
 */
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous * 100).toFixed(1));
};
