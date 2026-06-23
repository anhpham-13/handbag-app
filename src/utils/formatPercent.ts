export const formatPercent = (value: number): string => {
  // Handles both decimal (0.42) and whole-number (42) formats from MockAPI
  const percent = value > 0 && value <= 1 ? Math.round(value * 100) : Math.round(value);
  return `${percent}%`;
};

export const getPercentAsDecimal = (value: number): number => {
  return value > 1 ? value / 100 : value;
};
