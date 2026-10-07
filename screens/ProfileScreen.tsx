import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IncomeStreamRow } from '../components/IncomeStreamRow';
import { AppHeader } from '../components/ui/AppHeader';
import { AmountField } from '../components/ui/AmountField';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { GlassCard } from '../components/ui/GlassCard';
import { Logo } from '../components/ui/Logo';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TextField } from '../components/ui/TextField';
import { useToast } from '../components/ui/Toast';
import { RootNavigation } from '../navigation/types';
import { useBudget } from '../store/BudgetContext';
import { palette, radius, spacing, typography } from '../theme';
import { CurrencyCode, IncomeStream } from '../types';
import { formatCurrency } from '../utils/format';

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: 'PHP', label: '₱ PHP' },
  { code: 'USD', label: '$ USD' },
];

export const ProfileScreen = () => {
  const navigation = useNavigation<RootNavigation>();
  const {
    profile,
    activeCycle,
    totalIncome,
    updateProfile,
    deleteIncome,
    setExpectedExpenditure,
    setExpectedSavings,
    setActualSavings,
    resetActiveCycle,
    resetAll,
  } = useBudget();
  const { showToast } = useToast();

  const [pendingIncome, setPendingIncome] = useState<IncomeStream | null>(null);
  const [pendingReset, setPendingReset] = useState<'cycle' | 'all' | null>(null);

  const currency = profile.currency;

  const confirmDeleteIncome = () => {
    if (!pendingIncome) return;
    deleteIncome(pendingIncome.id);
    showToast({ message: `Removed "${pendingIncome.name}"`, tone: 'danger' });
    setPendingIncome(null);
  };

  const confirmReset = () => {
    if (pendingReset === 'all') {
      resetAll();
      showToast({ message: 'All data reset', tone: 'danger' });
    } else if (pendingReset === 'cycle') {
      resetActiveCycle();
      showToast({ message: `${activeCycle.cycleLabel} reset`, tone: 'danger' });
    }
    setPendingReset(null);
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <AppHeader eyebrow="Settings" title="Profile" subtitle="Manage your budget preferences" />

      <GlassCard>
        <View style={styles.brandRow}>
          <Logo size={56} />
          <View style={styles.brandText}>
            <Text style={styles.brandName}>Budget Tracker</Text>
            <Text style={styles.brandCaption}>Personal finance companion</Text>
          </View>
        </View>

        <TextField
          label="Profile name"
          value={profile.name}
          onChangeText={(name) => updateProfile({ name })}
          placeholder="My Budget"
          maxLength={40}
          returnKeyType="done"
        />

        <View style={styles.block}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.segment}>
            {CURRENCIES.map((option) => {
              const active = profile.currency === option.code;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => updateProfile({ currency: option.code })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Use ${option.code}`}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </GlassCard>

      <SectionHeader title="Income streams" />
      <GlassCard padded={false} contentStyle={styles.listCard}>
        {activeCycle.incomes.length === 0 ? (
          <Text style={styles.emptyText}>No income streams. Add one below.</Text>
        ) : (
          activeCycle.incomes.map((stream, index) => (
            <View key={stream.id} style={index > 0 && styles.divider}>
              <IncomeStreamRow
                stream={stream}
                currency={currency}
                accent={index % 2 === 0 ? palette.emerald : palette.cyan}
                onEdit={() => navigation.navigate('IncomeForm', { incomeId: stream.id })}
                onDelete={() => setPendingIncome(stream)}
              />
            </View>
          ))
        )}
      </GlassCard>

      <View style={styles.totalRow}>
        <Text style={styles.label}>Total monthly income</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalIncome, currency)}</Text>
      </View>

      <Button
        label="Add income stream"
        icon="add"
        variant="secondary"
        fullWidth
        onPress={() => navigation.navigate('IncomeForm', {})}
      />

      <SectionHeader title="Budget targets" />
      <GlassCard>
        <View style={styles.fields}>
          <AmountField
            label="Expected expenditure"
            value={activeCycle.expectedExpenditure}
            onChange={setExpectedExpenditure}
            currency={currency}
            helper="Your planned spending cap for this cycle."
          />
          <AmountField
            label="Expected savings"
            value={activeCycle.expectedSavings}
            onChange={setExpectedSavings}
            currency={currency}
            helper="How much you aim to put away."
          />
          <AmountField
            label="Actual savings"
            value={activeCycle.actualSavings}
            onChange={setActualSavings}
            currency={currency}
            helper="How much you have saved so far."
          />
        </View>
      </GlassCard>

      <SectionHeader title="Danger zone" />
      <GlassCard>
        <Text style={styles.dangerText}>
          Resetting removes data permanently and cannot be undone.
        </Text>
        <View style={styles.dangerActions}>
          <Button
            label={`Reset ${activeCycle.cycleLabel}`}
            variant="danger"
            fullWidth
            icon="refresh-outline"
            onPress={() => setPendingReset('cycle')}
          />
          <Button
            label="Reset all data"
            variant="danger"
            fullWidth
            icon="warning-outline"
            onPress={() => setPendingReset('all')}
          />
        </View>
      </GlassCard>

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={14} color={palette.textFaint} />
        <Text style={styles.footerText}>Saved on this device • Budget Tracker v1.0</Text>
      </View>

      <ConfirmDialog
        visible={Boolean(pendingIncome)}
        title="Remove income stream?"
        message={pendingIncome ? `"${pendingIncome.name}" will be deleted.` : undefined}
        confirmLabel="Remove"
        destructive
        icon="trash-outline"
        onConfirm={confirmDeleteIncome}
        onCancel={() => setPendingIncome(null)}
      />

      <ConfirmDialog
        visible={pendingReset !== null}
        title={pendingReset === 'all' ? 'Reset all data?' : `Reset ${activeCycle.cycleLabel}?`}
        message={
          pendingReset === 'all'
            ? 'Every cycle, income stream, and transaction will be permanently deleted.'
            : 'All income, targets, savings, and transactions for this cycle will be cleared.'
        }
        confirmLabel="Reset"
        destructive
        icon="warning-outline"
        onConfirm={confirmReset}
        onCancel={() => setPendingReset(null)}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl * 2,
  },
  block: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.borderSoft,
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
  },
  brandCaption: {
    ...typography.caption,
  },
  label: {
    ...typography.label,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSoft,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  segmentItemActive: {
    backgroundColor: palette.cyanSoft,
  },
  segmentText: {
    color: palette.textMuted,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: palette.cyan,
  },
  listCard: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: palette.borderSoft,
  },
  emptyText: {
    ...typography.caption,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.emerald,
  },
  fields: {
    gap: spacing.lg,
  },
  dangerText: {
    ...typography.caption,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  dangerActions: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    fontSize: 11,
  },
});
