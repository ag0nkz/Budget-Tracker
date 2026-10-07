import { CurrencyCode, CycleBudget } from '../types';

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  PHP: 'en-PH',
  USD: 'en-US',
};

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  PHP: '₱',
  USD: '$',
};

export const formatCurrency = (
  value: number,
  currency: CurrencyCode = 'PHP',
  fractionDigits = 2,
): string => {
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safe);
  } catch {
    const symbol = CURRENCY_SYMBOL[currency];
    return `${symbol}${safe.toFixed(fractionDigits)}`;
  }
};

export const formatSignedCurrency = (
  value: number,
  currency: CurrencyCode = 'PHP',
  fractionDigits = 2,
): string => {
  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${prefix}${formatCurrency(Math.abs(value), currency, fractionDigits)}`;
};

export const parseAmount = (raw: string): number => {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const MAX_AMOUNT = 999_999_999.99;

export const sanitizeAmountInput = (raw: string): string => {
  let value = raw.replace(/[^0-9.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot !== -1) {
    value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '');
  }
  const [intPart, decPart] = value.split('.');
  if (decPart !== undefined) {
    return `${intPart}.${decPart.slice(0, 2)}`;
  }
  return value;
};

export const clampAmount = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), MAX_AMOUNT);
};

export const formatDateLabel = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfDate) / 86400000);

  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const monthLabel = (date: Date): string =>
  `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;

export const cycleLabelFromKey = (key: string): string => {
  const [year, month] = key.split('-').map(Number);
  if (!year || !month) return key;
  return monthLabel(new Date(year, month - 1, 1));
};

export const addMonths = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

export const buildRecentCycleKeys = (count = 12, from = new Date()): string[] => {
  const keys: string[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    keys.push(monthKey(addMonths(from, -index)));
  }
  return keys;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const percent = (value: number, target: number): number => {
  if (target <= 0) return value > 0 ? 100 : 0;
  return clamp((value / target) * 100, 0, 100);
};

export const roundMoney = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const sumIncomes = (incomes: { amount: number }[]): number =>
  roundMoney(incomes.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0));

export const sumExpenses = (expenses: { amount: number }[]): number =>
  roundMoney(expenses.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0));

export const cycleNet = (cycle: {
  incomes: { amount: number }[];
  expenses: { amount: number }[];
  actualSavings: number;
}): number => roundMoney(sumIncomes(cycle.incomes) - sumExpenses(cycle.expenses) - cycle.actualSavings);

export const dateForCycle = (cycleKey: string): string => {
  const now = new Date();
  const [year, month] = cycleKey.split('-').map(Number);
  if (!year || !month) return now.toISOString();
  if (year === now.getFullYear() && month === now.getMonth() + 1) return now.toISOString();
  return new Date(year, month - 1, 1, 12, 0, 0).toISOString();
};

export const hasCycleData = (cycle: CycleBudget): boolean =>
  cycle.expenses.length > 0 ||
  cycle.incomes.some((stream) => stream.amount > 0) ||
  cycle.expectedExpenditure > 0 ||
  cycle.expectedSavings > 0 ||
  cycle.actualSavings > 0;


