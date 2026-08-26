export type CurrencyCode = 'USD' | 'EUR' | 'RUB';

export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD — $' },
  { value: 'EUR', label: 'EUR — €' },
  { value: 'RUB', label: 'RUB — ₽' },
];

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
};

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const rounded = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${rounded}${CURRENCY_SYMBOLS[currency]}`;
}
