import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AddExpenseFab } from '../components/AddExpenseFab';
import { TransactionRow } from '../components/TransactionRow';
import { AppHeader } from '../components/ui/AppHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { GlassCard } from '../components/ui/GlassCard';
import { Screen } from '../components/ui/Screen';
import { TextField } from '../components/ui/TextField';
import { useToast } from '../components/ui/Toast';
import { RootNavigation } from '../navigation/types';
import { useBudget } from '../store/BudgetContext';
import { categoryMeta, palette, radius, spacing, typography } from '../theme';
import { EXPENSE_CATEGORIES, ExpenseCategory, ExpenseItem } from '../types';
import { formatCurrency, formatDateLabel } from '../utils/format';

type Filter = 'All' | ExpenseCategory;

const FILTERS: Filter[] = ['All', ...EXPENSE_CATEGORIES];

export const TransactionsScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const { activeCycle, profile, deleteExpense, restoreExpense } = useBudget();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [pendingDelete, setPendingDelete] = useState<ExpenseItem | null>(null);

  const currency = profile.currency;

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...activeCycle.expenses]
      .filter((expense) => (filter === 'All' ? true : expense.category === filter))
      .filter((expense) =>
        search.length === 0
          ? true
          : expense.label.toLowerCase().includes(search) ||
            expense.category.toLowerCase().includes(search) ||
            (expense.note ?? '').toLowerCase().includes(search),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeCycle.expenses, filter, query]);

  const sections = useMemo(() => {
    const map = new Map<string, ExpenseItem[]>();
    filtered.forEach((expense) => {
      const key = formatDateLabel(expense.date) || 'Earlier';
      const bucket = map.get(key);
      if (bucket) bucket.push(expense);
      else map.set(key, [expense]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const total = useMemo(
    () => filtered.reduce((sum, expense) => sum + expense.amount, 0),
    [filtered],
  );

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const result = deleteExpense(pendingDelete.id);
    const label = pendingDelete.label;
    setPendingDelete(null);
    if (result) {
      showToast({
        message: `Deleted "${label}"`,
        tone: 'danger',
        actionLabel: 'Undo',
        onAction: () => restoreExpense(result.item, result.index),
      });
    }
  };

  return (
    <View style={styles.root}>
      <Screen contentContainerStyle={styles.content}>
        <AppHeader
          eyebrow={activeCycle.cycleLabel}
          title="Transactions"
          subtitle={`${filtered.length} item${filtered.length === 1 ? '' : 's'} • ${formatCurrency(total, currency)}`}
        />

        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder="Search transactions"
          returnKeyType="search"
          autoCorrect={false}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((option) => {
            const active = filter === option;
            const color = option === 'All' ? palette.cyan : categoryMeta[option].color;
            return (
              <Pressable
                key={option}
                onPress={() => setFilter(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter ${option}`}
                style={[
                  styles.chip,
                  active && { backgroundColor: `${color}22`, borderColor: `${color}88` },
                ]}
              >
                <Text style={[styles.chipText, active && { color }]}>{option}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtered.length === 0 ? (
          <GlassCard>
            <EmptyState
              icon="receipt-outline"
              title="Nothing here yet"
              message={
                activeCycle.expenses.length === 0
                  ? 'Tap the + button to log your first expense for this cycle.'
                  : 'No transactions match your search or filter.'
              }
            />
          </GlassCard>
        ) : (
          sections.map(([label, items]) => (
            <View key={label} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{label}</Text>
                <Text style={styles.sectionTotal}>
                  {formatCurrency(
                    items.reduce((sum, item) => sum + item.amount, 0),
                    currency,
                  )}
                </Text>
              </View>
              <GlassCard padded={false} contentStyle={styles.listCard}>
                {items.map((expense, index) => (
                  <View key={expense.id} style={index > 0 && styles.divider}>
                    <TransactionRow
                      expense={expense}
                      currency={currency}
                      onPress={() =>
                        navigation.navigate('TransactionForm', { expenseId: expense.id })
                      }
                      onDelete={() => setPendingDelete(expense)}
                    />
                  </View>
                ))}
              </GlassCard>
            </View>
          ))
        )}
      </Screen>

      <AddExpenseFab />

      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="Delete transaction?"
        message={
          pendingDelete
            ? `"${pendingDelete.label}" will be removed from ${activeCycle.cycleLabel}. You can undo this right after.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        icon="trash-outline"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl * 3,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    backgroundColor: palette.surface,
  },
  chipText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: palette.textMuted,
  },
  sectionTotal: {
    ...typography.caption,
    fontWeight: '700',
  },
  listCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: palette.borderSoft,
  },
});
