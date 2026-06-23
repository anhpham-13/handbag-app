export const formatCurrency = (amount: number): string => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${amount.toLocaleString('en-US')}`;
};

export const formatCurrencyFull = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDiscountedPrice = (cost: number, percentOff: number): number => {
  const discount = percentOff > 1 ? percentOff / 100 : percentOff;
  return Math.round(cost * (1 - discount));
};
