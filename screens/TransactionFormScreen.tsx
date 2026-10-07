import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AmountField } from '../components/ui/AmountField';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { IconButton } from '../components/ui/IconButton';
import { Screen } from '../components/ui/Screen';
import { TextField } from '../components/ui/TextField';
import { RootStackParamList } from '../navigation/types';
import { useBudget } from '../store/BudgetContext';
import { categoryMeta, palette, radius, spacing, typography } from '../theme';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../types';
import { CURRENCY_SYMBOL, dateForCycle, MAX_AMOUNT } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionForm'>;

interface FieldErrors {
  label?: string;
  amount?: string;
}

export const TransactionFormScreen = ({ route, navigation }: Props) => {
  const { activeCycle, profile, addExpense, updateExpense, deleteExpense } = useBudget();
  const currency = profile.currency;

  const expenseId = route.params?.expenseId;
  const existing = useMemo(
    () => activeCycle.expenses.find((expense) => expense.id === expenseId),
    [activeCycle.expenses, expenseId],
  );
  const isEditing = Boolean(existing);

  const [category, setCategory] = useState<ExpenseCategory>(existing?.category ?? 'Food');
  const [label, setLabel] = useState(existing?.label ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [note, setNote] = useState(existing?.note ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const submittingRef = useRef(false);

  const labelRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const trimmed = label.trim();
    if (!trimmed) {
      next.label = 'Add a title for this expense.';
    } else if (trimmed.length > 60) {
      next.label = 'Keep it under 60 characters.';
    }
    if (!(amount > 0)) {
      next.amount = `Amount must be more than ${CURRENCY_SYMBOL[currency]}0.`;
    } else if (amount > MAX_AMOUNT) {
      next.amount = `Amount looks too large. Max is ${CURRENCY_SYMBOL[currency]}${MAX_AMOUNT.toLocaleString()}.`;
    }
    return next;
  };

  const handleSave = () => {
    if (submittingRef.current) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
      const message = nextErrors.label ?? nextErrors.amount ?? 'Please fix the errors above.';
      AccessibilityInfo.announceForAccessibility(message);
      if (nextErrors.label) labelRef.current?.focus();
      else amountRef.current?.focus();
      return;
    }

    submittingRef.current = true;
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);

    const trimmed = label.trim();
    if (existing) {
      updateExpense(existing.id, {
        category,
        label: trimmed,
        amount,
        note: note.trim() || undefined,
      });
    } else {
      addExpense({
        category,
        label: trimmed,
        amount,
        date: dateForCycle(activeCycle.cycleKey),
        note: note.trim() || undefined,
      });
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing || submittingRef.current) return;
    submittingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    deleteExpense(existing.id);
    navigation.goBack();
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.content} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{isEditing ? 'Edit expense' : 'Add expense'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <GlassCard>
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {EXPENSE_CATEGORIES.map((option) => {
            const active = category === option;
            const color = categoryMeta[option].color;
            return (
              <Pressable
                key={option}
                onPress={() => setCategory(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Category ${option}`}
                style={[
                  styles.chip,
                  active && { backgroundColor: `${color}22`, borderColor: `${color}88` },
                ]}
              >
                <Ionicons
                  name={categoryMeta[option].icon}
                  size={15}
                  color={active ? color : palette.textMuted}
                />
                <Text style={[styles.chipText, active && { color }]}>{option}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.fields}>
          <TextField
            ref={labelRef}
            label="Title"
            required
            value={label}
            onChangeText={(text) => {
              setLabel(text);
              if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
            }}
            placeholder="e.g. Groceries"
            autoFocus={!isEditing}
            maxLength={60}
            returnKeyType="next"
            onSubmitEditing={() => amountRef.current?.focus()}
            error={errors.label}
          />
          <AmountField
            ref={amountRef}
            label="Amount"
            required
            value={amount}
            onChange={(value) => {
              setAmount(value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            currency={currency}
            error={errors.amount}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <TextField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Weekly groceries"
            maxLength={200}
            returnKeyType="done"
          />
        </View>
      </GlassCard>

      <View style={styles.actions}>
        <Button
          label={isEditing ? 'Save changes' : 'Add expense'}
          icon="checkmark"
          fullWidth
          onPress={handleSave}
        />
        {isEditing ? (
          <Button
            label="Delete expense"
            variant="danger"
            icon="trash-outline"
            fullWidth
            onPress={handleDelete}
          />
        ) : null}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
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
  fields: {
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
