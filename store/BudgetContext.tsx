import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, CycleBudget, ExpenseItem, IncomeStream, UserProfile } from '../types';
import {
  createDefaultState,
  createEmptyCycle,
  loadState,
  saveState,
} from '../storage';
import { createId } from '../utils/id';
import {
  addMonths,
  clampAmount,
  cycleNet,
  hasCycleData,
  monthKey,
  monthLabel,
  percent,
  roundMoney,
  sumExpenses,
  sumIncomes,
} from '../utils/format';

export interface DeleteExpenseResult {
  item: ExpenseItem;
  index: number;
}

interface BudgetContextValue {
  isReady: boolean;
  state: AppState;
  profile: UserProfile;
  activeCycle: CycleBudget;
  totalIncome: number;
  actualExpenditure: number;
  openingBalance: number;
  closingBalance: number;
  remainingBalance: number;
  variance: number;
  savingsProgress: number;
  monthsWithData: string[];
  addIncome: (name?: string, amount?: number) => IncomeStream;
  updateIncome: (id: string, patch: Partial<Omit<IncomeStream, 'id'>>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (input: Omit<ExpenseItem, 'id'>) => ExpenseItem;
  updateExpense: (id: string, patch: Partial<Omit<ExpenseItem, 'id'>>) => void;
  deleteExpense: (id: string) => DeleteExpenseResult | null;
  restoreExpense: (item: ExpenseItem, index?: number) => void;
  setExpectedExpenditure: (value: number) => void;
  setExpectedSavings: (value: number) => void;
  setActualSavings: (value: number) => void;
  setActiveCycle: (key: string) => void;
  shiftCycle: (delta: number) => void;
  resetActiveCycle: () => void;
  resetAll: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

const dateFromKey = (key: string): Date => {
  const [year, month] = key.split('-').map(Number);
  if (!year || !month) return new Date();
  return new Date(year, month - 1, 1);
};

export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(createDefaultState);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    mountedRef.current = true;

    const bootstrap = async () => {
      const { state: loaded } = await loadState();
      if (!mountedRef.current) return;
      setState(loaded);
      setIsReady(true);
    };

    bootstrap();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const handle = setTimeout(() => {
      saveState(state);
    }, 400);

    return () => clearTimeout(handle);
  }, [state, isReady]);

  const updateActiveCycle = useCallback(
    (updater: (cycle: CycleBudget) => CycleBudget) => {
      setState((prev) => {
        const current = prev.cycles[prev.activeCycleKey];
        if (!current) return prev;
        return {
          ...prev,
          cycles: { ...prev.cycles, [prev.activeCycleKey]: updater(current) },
        };
      });
    },
    [],
  );

  const ensureCycle = useCallback((key: string) => {
    setState((prev) => {
      if (prev.cycles[key]) return prev;
      const cycle = createEmptyCycle(dateFromKey(key));
      return {
        ...prev,
        cycles: { ...prev.cycles, [key]: cycle },
      };
    });
  }, []);

  const addIncome = useCallback(
    (name = 'New Income', amount = 0) => {
      const stream: IncomeStream = { id: createId('inc'), name, amount };
      updateActiveCycle((cycle) => ({
        ...cycle,
        incomes: [...cycle.incomes, stream],
      }));
      return stream;
    },
    [updateActiveCycle],
  );

  const updateIncome = useCallback(
    (id: string, patch: Partial<Omit<IncomeStream, 'id'>>) => {
      updateActiveCycle((cycle) => ({
        ...cycle,
        incomes: cycle.incomes.map((stream) =>
          stream.id === id ? { ...stream, ...patch } : stream,
        ),
      }));
    },
    [updateActiveCycle],
  );

  const deleteIncome = useCallback(
    (id: string) => {
      updateActiveCycle((cycle) => ({
        ...cycle,
        incomes: cycle.incomes.filter((stream) => stream.id !== id),
      }));
    },
    [updateActiveCycle],
  );

  const addExpense = useCallback(
    (input: Omit<ExpenseItem, 'id'>) => {
      const item: ExpenseItem = { ...input, id: createId('exp') };
      updateActiveCycle((cycle) => ({
        ...cycle,
        expenses: [item, ...cycle.expenses],
      }));
      return item;
    },
    [updateActiveCycle],
  );

  const updateExpense = useCallback(
    (id: string, patch: Partial<Omit<ExpenseItem, 'id'>>) => {
      updateActiveCycle((cycle) => ({
        ...cycle,
        expenses: cycle.expenses.map((expense) =>
          expense.id === id ? { ...expense, ...patch } : expense,
        ),
      }));
    },
    [updateActiveCycle],
  );

  const deleteExpense = useCallback(
    (id: string): DeleteExpenseResult | null => {
      const currentState = stateRef.current;
      const cycle = currentState.cycles[currentState.activeCycleKey];
      if (!cycle) return null;
      const index = cycle.expenses.findIndex((expense) => expense.id === id);
      if (index < 0) return null;
      const item = cycle.expenses[index];
      updateActiveCycle((current) => ({
        ...current,
        expenses: current.expenses.filter((expense) => expense.id !== id),
      }));
      return { item, index };
    },
    [updateActiveCycle],
  );

  const restoreExpense = useCallback(
    (item: ExpenseItem, index = 0) => {
      updateActiveCycle((cycle) => {
        if (cycle.expenses.some((expense) => expense.id === item.id)) return cycle;
        const next = [...cycle.expenses];
        const insertAt = Math.min(Math.max(index, 0), next.length);
        next.splice(insertAt, 0, item);
        return { ...cycle, expenses: next };
      });
    },
    [updateActiveCycle],
  );

  const setExpectedExpenditure = useCallback(
    (value: number) => updateActiveCycle((cycle) => ({ ...cycle, expectedExpenditure: clampAmount(value) })),
    [updateActiveCycle],
  );

  const setExpectedSavings = useCallback(
    (value: number) => updateActiveCycle((cycle) => ({ ...cycle, expectedSavings: clampAmount(value) })),
    [updateActiveCycle],
  );

  const setActualSavings = useCallback(
    (value: number) => updateActiveCycle((cycle) => ({ ...cycle, actualSavings: clampAmount(value) })),
    [updateActiveCycle],
  );

  const setActiveCycle = useCallback(
    (key: string) => {
      ensureCycle(key);
      setState((prev) => ({ ...prev, activeCycleKey: key }));
    },
    [ensureCycle],
  );

  const shiftCycle = useCallback(
    (delta: number) => {
      const current = dateFromKey(state.activeCycleKey);
      const next = addMonths(current, delta);
      const key = monthKey(next);
      ensureCycle(key);
      setState((prev) => ({ ...prev, activeCycleKey: key }));
    },
    [ensureCycle, state.activeCycleKey],
  );

  const resetActiveCycle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cycles: {
        ...prev.cycles,
        [prev.activeCycleKey]: {
          ...createEmptyCycle(dateFromKey(prev.activeCycleKey)),
          cycleKey: prev.activeCycleKey,
          cycleLabel: prev.cycles[prev.activeCycleKey]?.cycleLabel ?? monthLabel(dateFromKey(prev.activeCycleKey)),
        },
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(createDefaultState());
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const fallbackCycle = useMemo(
    () => createEmptyCycle(dateFromKey(state.activeCycleKey)),
    [state.activeCycleKey],
  );
  const activeCycle = state.cycles[state.activeCycleKey] ?? fallbackCycle;

  const totalIncome = useMemo(() => sumIncomes(activeCycle.incomes), [activeCycle.incomes]);

  const actualExpenditure = useMemo(
    () => sumExpenses(activeCycle.expenses),
    [activeCycle.expenses],
  );

  const openingBalance = useMemo(() => {
    const keys = Object.keys(state.cycles).sort();
    return roundMoney(
      keys
        .filter((key) => key < state.activeCycleKey)
        .reduce((sum, key) => sum + cycleNet(state.cycles[key]), 0),
    );
  }, [state.cycles, state.activeCycleKey]);

  const closingBalance = roundMoney(
    openingBalance + totalIncome - actualExpenditure - activeCycle.actualSavings,
  );
  const remainingBalance = closingBalance;
  const variance = roundMoney(activeCycle.expectedExpenditure - actualExpenditure);
  const savingsProgress = percent(activeCycle.actualSavings, activeCycle.expectedSavings);

  const monthsWithData = useMemo(
    () => Object.keys(state.cycles).filter((key) => hasCycleData(state.cycles[key])).sort(),
    [state.cycles],
  );

  const value = useMemo<BudgetContextValue>(
    () => ({
      isReady,
      state,
      profile: state.profile,
      activeCycle,
      totalIncome,
      actualExpenditure,
      openingBalance,
      closingBalance,
      remainingBalance,
      variance,
      savingsProgress,
      monthsWithData,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      setExpectedExpenditure,
      setExpectedSavings,
      setActualSavings,
      setActiveCycle,
      shiftCycle,
      resetActiveCycle,
      resetAll,
      updateProfile,
    }),
    [
      isReady,
      state,
      activeCycle,
      totalIncome,
      actualExpenditure,
      openingBalance,
      closingBalance,
      remainingBalance,
      variance,
      savingsProgress,
      monthsWithData,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      setExpectedExpenditure,
      setExpectedSavings,
      setActualSavings,
      setActiveCycle,
      shiftCycle,
      resetActiveCycle,
      resetAll,
      updateProfile,
    ],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = (): BudgetContextValue => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
