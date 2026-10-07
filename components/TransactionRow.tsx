import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { categoryMeta, palette, radius, spacing } from '../theme';
import { CurrencyCode, ExpenseItem } from '../types';
import { formatCurrency, formatTime } from '../utils/format';

interface TransactionRowProps {
  expense: ExpenseItem;
  currency: CurrencyCode;
  onPress?: () => void;
  onDelete?: () => void;
}

export const TransactionRow = ({ expense, currency, onPress, onDelete }: TransactionRowProps) => {
  const meta = categoryMeta[expense.category];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${expense.label}, ${formatCurrency(expense.amount, currency)}. Tap to edit.`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.soft }]}>
        <Ionicons name={meta.icon} size={18} color={meta.color} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.label} numberOfLines={1}>
          {expense.label}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {expense.category}
          {expense.note ? ` • ${expense.note}` : ` • ${formatTime(expense.date)}`}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount, currency)}</Text>
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${expense.label}`}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color={palette.textFaint} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.65,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.textFaint,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
  },
});
