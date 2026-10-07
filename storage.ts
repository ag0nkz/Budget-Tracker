import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  CycleBudget,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  ExpenseItem,
  IncomeStream,
  UserProfile,
} from './types';
import { monthKey, monthLabel } from './utils/format';
import { createId } from './utils/id';

export const STORAGE_KEY = 'budget-tracker-v2';
export const LEGACY_KEY = 'budget-tracker-v1';
export const STATE_VERSION = 2;

export const createDefaultProfile = (): UserProfile => ({
  name: 'My Budget',
  currency: 'PHP',
});

export const createEmptyCycle = (date = new Date()): CycleBudget => ({
  cycleKey: monthKey(date),
  cycleLabel: monthLabel(date),
  incomes: [
    { id: createId('inc'), name: 'Primary Income', amount: 0 },
    { id: createId('inc'), name: 'Secondary Income', amount: 0 },
  ],
  expectedExpenditure: 0,
  expectedSavings: 0,
  actualSavings: 0,
  expenses: [],
});

export const createDefaultState = (): AppState => {
  const cycle = createEmptyCycle();
  return {
    version: STATE_VERSION,
    profile: createDefaultProfile(),
    cycles: { [cycle.cycleKey]: cycle },
    activeCycleKey: cycle.cycleKey,
  };
};

const isCategory = (value: unknown): value is ExpenseCategory =>
  typeof value === 'string' && EXPENSE_CATEGORIES.includes(value as ExpenseCategory);

const toNumber = (value: unknown, fallback = 0): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const sanitizeIncomes = (value: unknown): IncomeStream[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: toString(item.id) || createId('inc'),
      name: toString(item.name, 'Income'),
      amount: Math.max(0, toNumber(item.amount)),
    }));
};

const sanitizeExpenses = (value: unknown): ExpenseItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: toString(item.id) || createId('exp'),
      category: isCategory(item.category) ? item.category : 'Other',
      label: toString(item.label, 'Expense'),
      amount: Math.max(0, toNumber(item.amount)),
      date: toString(item.date, new Date().toISOString()),
      note: typeof item.note === 'string' ? item.note : undefined,
    }));
};

const sanitizeCycle = (value: unknown, fallbackDate = new Date()): CycleBudget | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const key = toString(record.cycleKey) || monthKey(fallbackDate);

  return {
    cycleKey: key,
    cycleLabel: toString(record.cycleLabel) || monthLabel(fallbackDate),
    incomes: sanitizeIncomes(record.incomes),
    expectedExpenditure: Math.max(0, toNumber(record.expectedExpenditure)),
    expectedSavings: Math.max(0, toNumber(record.expectedSavings)),
    actualSavings: Math.max(0, toNumber(record.actualSavings)),
    expenses: sanitizeExpenses(record.expenses),
  };
};

const sanitizeProfile = (value: unknown): UserProfile => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const currency = record.currency === 'USD' ? 'USD' : 'PHP';
  return {
    name: toString(record.name, 'My Budget'),
    currency,
  };
};

export const sanitizeState = (value: unknown): AppState | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const cyclesRecord = record.cycles;
  if (!cyclesRecord || typeof cyclesRecord !== 'object') return null;

  const cycles: Record<string, CycleBudget> = {};
  Object.values(cyclesRecord as Record<string, unknown>).forEach((entry) => {
    const cycle = sanitizeCycle(entry);
    if (cycle) cycles[cycle.cycleKey] = cycle;
  });

  const keys = Object.keys(cycles);
  if (keys.length === 0) return null;

  const activeCycleKey = keys.includes(toString(record.activeCycleKey))
    ? toString(record.activeCycleKey)
    : keys[keys.length - 1];

  return {
    version: STATE_VERSION,
    profile: sanitizeProfile(record.profile),
    cycles,
    activeCycleKey,
  };
};

const migrateLegacy = (raw: string): AppState | null => {
  try {
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    if (!legacy || typeof legacy !== 'object') return null;

    const today = new Date();
    const cycle: CycleBudget = {
      cycleKey: monthKey(today),
      cycleLabel: toString(legacy.cycleLabel) || monthLabel(today),
      incomes: sanitizeIncomes(legacy.incomes),
      expectedExpenditure: Math.max(0, toNumber(legacy.expectedExpenditure)),
      expectedSavings: Math.max(0, toNumber(legacy.expectedSavings)),
      actualSavings: Math.max(0, toNumber(legacy.actualSavings)),
      expenses: sanitizeExpenses(legacy.expenses),
    };

    if (cycle.incomes.length === 0) {
      cycle.incomes = createEmptyCycle(today).incomes;
    }

    return {
      version: STATE_VERSION,
      profile: createDefaultProfile(),
      cycles: { [cycle.cycleKey]: cycle },
      activeCycleKey: cycle.cycleKey,
    };
  } catch (error) {
    console.warn('Failed to migrate legacy budget data:', error);
    return null;
  }
};

export const loadState = async (): Promise<{ state: AppState; migrated: boolean }> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sanitized = sanitizeState(JSON.parse(stored));
      if (sanitized) return { state: sanitized, migrated: false };
    }

    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migratedState = migrateLegacy(legacy);
      if (migratedState) return { state: migratedState, migrated: true };
    }
  } catch (error) {
    console.warn('Failed to load budget state:', error);
  }

  return { state: createDefaultState(), migrated: false };
};

export const saveState = async (state: AppState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist budget state:', error);
  }
};
