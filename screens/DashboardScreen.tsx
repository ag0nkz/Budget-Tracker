import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AddExpenseFab } from '../components/AddExpenseFab';
import { TransactionRow } from '../components/TransactionRow';
import { AppHeader } from '../components/ui/AppHeader';
import { Badge } from '../components/ui/Badge';
import { GlassCard } from '../components/ui/GlassCard';
import { IconButton } from '../components/ui/IconButton';
import { MonthPicker } from '../components/ui/MonthPicker';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { RootNavigation } from '../navigation/types';
import { useBudget } from '../store/BudgetContext';
import { palette, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/format';

export const DashboardScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const {
    profile,
    activeCycle,
    totalIncome,
    actualExpenditure,
    openingBalance,
    remainingBalance,
    variance,
    savingsProgress,
    monthsWithData,
    shiftCycle,
    setActiveCycle,
  } = useBudget();

  const currency = profile.currency;
  const [pickerVisible, setPickerVisible] = useState(false);

  const recentExpenses = useMemo(
    () =>
      [...activeCycle.expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4),
    [activeCycle.expenses],
  );

  const spendingProgress =
    activeCycle.expectedExpenditure > 0
      ? Math.min((actualExpenditure / activeCycle.expectedExpenditure) * 100, 100)
      : 0;

  const isUnderBudget = variance >= 0;

  const goToProfile = () => navigation.navigate('MainTabs', { screen: 'Profile' });
  const goToTransactions = () => navigation.navigate('MainTabs', { screen: 'Transactions' });

  const shift = (delta: number) => {
    Haptics.selectionAsync().catch(() => undefined);
    shiftCycle(delta);
  };

  return (
    <View style={styles.root}>
      <Screen contentContainerStyle={styles.content}>
        <AppHeader
          eyebrow="Budget pulse"
          title={profile.name}
          subtitle={activeCycle.cycleLabel}
          right={
            <IconButton
              icon="person-outline"
              accessibilityLabel="Open profile"
              onPress={goToProfile}
            />
          }
        />

        <GlassCard contentStyle={styles.monthRow} padded={false}>
          <View style={styles.monthInner}>
            <IconButton
              icon="chevron-back"
              accessibilityLabel="Previous month"
              onPress={() => shift(-1)}
              backgroundColor="transparent"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Change month, current ${activeCycle.cycleLabel}`}
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [styles.monthLabelWrap, pressed && styles.monthLabelPressed]}
            >
              <Text style={styles.monthLabel}>{activeCycle.cycleLabel}</Text>
              <View style={styles.monthHintRow}>
                <Text style={styles.monthHint}>Monthly cycle</Text>
                <Ionicons name="chevron-down" size={12} color={palette.textFaint} />
              </View>
            </Pressable>
            <IconButton
              icon="chevron-forward"
              accessibilityLabel="Next month"
              onPress={() => shift(1)}
              backgroundColor="transparent"
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.label}>Closing balance</Text>
            <View style={styles.balanceDot} />
          </View>
          <Text style={styles.balanceValue}>{formatCurrency(remainingBalance, currency)}</Text>
          <Text style={styles.balanceMeta}>Carried over + income − expenses − savings</Text>

          <View style={styles.carryRow}>
            <View style={styles.carryItem}>
              <Ionicons name="return-down-forward-outline" size={14} color={palette.cyan} />
              <Text style={styles.carryLabel}>Carried over</Text>
              <Text style={styles.carryValue}>{formatCurrency(openingBalance, currency)}</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{formatCurrency(totalIncome, currency)}</Text>
            </View>
            <View style={[styles.statPill, styles.statPillAccent]}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>{formatCurrency(actualExpenditure, currency)}</Text>
            </View>
          </View>
        </GlassCard>

        <SectionHeader title="Spending" />
        <GlassCard>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Actual vs expected</Text>
            <Badge
              label={isUnderBudget ? 'Under budget' : 'Over budget'}
              tone={isUnderBudget ? 'success' : 'danger'}
              icon={isUnderBudget ? 'trending-down' : 'trending-up'}
            />
          </View>
          <ProgressBar
            value={spendingProgress}
            color={isUnderBudget ? palette.emerald : palette.crimson}
            glowColor={isUnderBudget ? palette.emerald : palette.crimson}
            style={styles.bar}
          />
          <View style={styles.rowBetween}>
            <Text style={styles.metaText}>
              {formatCurrency(actualExpenditure, currency)} of{' '}
              {formatCurrency(activeCycle.expectedExpenditure, currency)}
            </Text>
            <Text style={[styles.metaStrong, { color: isUnderBudget ? palette.emerald : palette.crimson }]}>
              {formatCurrency(Math.abs(variance), currency)} {isUnderBudget ? 'left' : 'over'}
            </Text>
          </View>
        </GlassCard>

        <SectionHeader title="Savings" />
        <GlassCard>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Goal progress</Text>
            <Text style={styles.metaStrong}>{Math.round(savingsProgress)}%</Text>
          </View>
          <ProgressBar
            value={savingsProgress}
            color={palette.emerald}
            glowColor={palette.emerald}
            style={styles.bar}
          />
          <View style={styles.rowBetween}>
            <Text style={styles.metaText}>
              {formatCurrency(activeCycle.actualSavings, currency)} saved
            </Text>
            <Text style={styles.metaText}>
              Target {formatCurrency(activeCycle.expectedSavings, currency)}
            </Text>
          </View>
        </GlassCard>

        <SectionHeader title="Income" actionLabel="Manage" onAction={goToProfile} />
        <GlassCard>
          {activeCycle.incomes.length === 0 ? (
            <Text style={styles.metaText}>No income streams yet.</Text>
          ) : (
            activeCycle.incomes.map((stream, index) => (
              <View
                key={stream.id}
                style={[styles.incomeRow, index > 0 && styles.incomeRowBorder]}
              >
                <View
                  style={[
                    styles.incomeSwatch,
                    { backgroundColor: index % 2 === 0 ? palette.emerald : palette.cyan },
                  ]}
                />
                <Text style={styles.incomeName} numberOfLines={1}>
                  {stream.name}
                </Text>
                <Text style={styles.incomeAmount}>{formatCurrency(stream.amount, currency)}</Text>
              </View>
            ))
          )}
        </GlassCard>

        <SectionHeader title="Recent activity" actionLabel="See all" onAction={goToTransactions} />
        <GlassCard padded={false} contentStyle={styles.listCard}>
          {recentExpenses.length === 0 ? (
            <View style={styles.emptyInline}>
              <Ionicons name="receipt-outline" size={22} color={palette.textFaint} />
              <Text style={styles.metaText}>No transactions logged yet.</Text>
            </View>
          ) : (
            recentExpenses.map((expense, index) => (
              <View key={expense.id} style={index > 0 && styles.listDivider}>
                <TransactionRow
                  expense={expense}
                  currency={currency}
                  onPress={() =>
                    navigation.navigate('TransactionForm', { expenseId: expense.id })
                  }
                />
              </View>
            ))
          )}
        </GlassCard>
      </Screen>
      <AddExpenseFab />
      <MonthPicker
        visible={pickerVisible}
        activeKey={activeCycle.cycleKey}
        monthsWithData={monthsWithData}
        onSelect={setActiveCycle}
        onClose={() => setPickerVisible(false)}
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
  monthRow: {
    padding: 0,
  },
  monthInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  monthLabelWrap: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  monthLabelPressed: {
    backgroundColor: palette.surface,
  },
  monthLabel: {
    ...typography.h3,
  },
  monthHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monthHint: {
    ...typography.caption,
  },
  balanceCard: {
    backgroundColor: 'rgba(12,17,29,0.55)',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.cyan,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '800',
    color: palette.text,
    marginTop: spacing.sm,
    letterSpacing: -0.6,
  },
  balanceMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  carryRow: {
    marginTop: spacing.md,
  },
  carryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: palette.cyanSoft,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.28)',
  },
  carryLabel: {
    flex: 1,
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  carryValue: {
    color: palette.cyan,
    fontSize: 14,
    fontWeight: '800',
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statPill: {
    flex: 1,
    borderRadius: spacing.lg,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    gap: spacing.xs,
  },
  statPillAccent: {
    backgroundColor: palette.cyanSoft,
    borderColor: 'rgba(103,232,249,0.3)',
  },
  statLabel: {
    ...typography.label,
    fontSize: 11,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.text,
  },
  label: {
    ...typography.label,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  bar: {
    marginVertical: spacing.md,
  },
  metaText: {
    ...typography.caption,
  },
  metaStrong: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.text,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  incomeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: palette.borderSoft,
  },
  incomeSwatch: {
    width: 6,
    height: 34,
    borderRadius: 999,
  },
  incomeName: {
    flex: 1,
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  incomeAmount: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  listCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  listDivider: {
    borderTopWidth: 1,
    borderTopColor: palette.borderSoft,
  },
  emptyInline: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
