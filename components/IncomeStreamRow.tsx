import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '../theme';
import { CurrencyCode, IncomeStream } from '../types';
import { formatCurrency } from '../utils/format';
import { IconButton } from './ui/IconButton';

interface IncomeStreamRowProps {
  stream: IncomeStream;
  currency: CurrencyCode;
  accent?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const IncomeStreamRow = ({
  stream,
  currency,
  accent = palette.emerald,
  onEdit,
  onDelete,
}: IncomeStreamRowProps) => {
  return (
    <View style={styles.row}>
      <View style={[styles.swatch, { backgroundColor: accent }]} />
      <Pressable
        style={styles.middle}
        onPress={onEdit}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${stream.name}`}
      >
        <Text style={styles.name} numberOfLines={1}>
          {stream.name}
        </Text>
        <Text style={styles.amount}>{formatCurrency(stream.amount, currency)}</Text>
      </Pressable>
      <View style={styles.actions}>
        <IconButton
          icon="create-outline"
          size={17}
          color={palette.textMuted}
          backgroundColor="rgba(255,255,255,0.04)"
          onPress={onEdit}
          accessibilityLabel={`Edit ${stream.name}`}
        />
        <IconButton
          icon="trash-outline"
          size={17}
          color={palette.danger}
          backgroundColor={palette.dangerSoft}
          onPress={onDelete}
          accessibilityLabel={`Delete ${stream.name}`}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  swatch: {
    width: 6,
    height: 40,
    borderRadius: 999,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  amount: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
