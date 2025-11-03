const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatHours(hours: number): string {
  return `${decimalFormatter.format(hours)}時間`;
}

export function formatMinutes(minutes: number): string {
  return `${decimalFormatter.format(minutes)}分`;
}

