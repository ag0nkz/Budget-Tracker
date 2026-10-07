import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
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
import { spacing, typography } from '../theme';
import { CURRENCY_SYMBOL, MAX_AMOUNT } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'IncomeForm'>;

interface FieldErrors {
  name?: string;
  amount?: string;
}

export const IncomeFormScreen = ({ route, navigation }: Props) => {
  const { activeCycle, profile, addIncome, updateIncome, deleteIncome } = useBudget();
  const currency = profile.currency;

  const incomeId = route.params?.incomeId;
  const existing = useMemo(
    () => activeCycle.incomes.find((stream) => stream.id === incomeId),
    [activeCycle.incomes, incomeId],
  );
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const submittingRef = useRef(false);

  const nameRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const trimmed = name.trim();
    if (!trimmed) {
      next.name = 'Give this income stream a name.';
    } else if (trimmed.length > 60) {
      next.name = 'Keep it under 60 characters.';
    }
    if (amount > MAX_AMOUNT) {
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
      const message = nextErrors.name ?? nextErrors.amount ?? 'Please fix the errors above.';
      AccessibilityInfo.announceForAccessibility(message);
      if (nextErrors.name) nameRef.current?.focus();
      else amountRef.current?.focus();
      return;
    }

    submittingRef.current = true;
    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);

    const trimmed = name.trim();
    if (existing) {
      updateIncome(existing.id, { name: trimmed, amount });
    } else {
      addIncome(trimmed, amount);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existing || submittingRef.current) return;
    submittingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    deleteIncome(existing.id);
    navigation.goBack();
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={styles.content} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{isEditing ? 'Edit income' : 'Add income'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <GlassCard>
        <View style={styles.fields}>
          <TextField
            ref={nameRef}
            label="Name"
            required
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Primary Salary"
            autoFocus={!isEditing}
            maxLength={60}
            returnKeyType="next"
            onSubmitEditing={() => amountRef.current?.focus()}
            error={errors.name}
          />
          <AmountField
            ref={amountRef}
            label="Monthly amount"
            value={amount}
            onChange={(value) => {
              setAmount(value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            currency={currency}
            helper="Expected take-home for this cycle."
            error={errors.amount}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>
      </GlassCard>

      <View style={styles.actions}>
        <Button
          label={isEditing ? 'Save changes' : 'Add income'}
          icon="checkmark"
          fullWidth
          onPress={handleSave}
        />
        {isEditing ? (
          <Button
            label="Delete income"
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
  fields: {
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
});
