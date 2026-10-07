export type ExpenseCategory = 'Food' | 'Utilities' | 'Transport' | 'Leisure' | 'Other';

export type CurrencyCode = 'PHP' | 'USD';

export interface IncomeStream {
  id: string;
  name: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CycleBudget {
  cycleKey: string;
  cycleLabel: string;
  incomes: IncomeStream[];
  expectedExpenditure: number;
  expectedSavings: number;
  actualSavings: number;
  expenses: ExpenseItem[];
}

export interface UserProfile {
  name: string;
  currency: CurrencyCode;
}

export interface AppState {
  version: number;
  profile: UserProfile;
  cycles: Record<string, CycleBudget>;
  activeCycleKey: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Utilities',
  'Transport',
  'Leisure',
  'Other',
];
