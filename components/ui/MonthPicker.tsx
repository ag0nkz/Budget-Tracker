import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing, typography } from '../../theme';
import { monthKey } from '../../utils/format';
import { Button } from './Button';
import { IconButton } from './IconButton';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

interface MonthPickerProps {
  visible: boolean;
  activeKey: string;
  monthsWithData: string[];
  onSelect: (key: string) => void;
  onClose: () => void;
}

const yearFromKey = (key: string): number => {
  const [year] = key.split('-').map(Number);
  return year || new Date().getFullYear();
};

export const MonthPicker = ({
  visible,
  activeKey,
  monthsWithData,
  onSelect,
  onClose,
}: MonthPickerProps) => {
  const [year, setYear] = useState(() => yearFromKey(activeKey));

  useEffect(() => {
    if (visible) setYear(yearFromKey(activeKey));
  }, [visible, activeKey]);

  const dataSet = useMemo(() => new Set(monthsWithData), [monthsWithData]);

  const step = (delta: number) => {
    Haptics.selectionAsync().catch(() => undefined);
    setYear((prev) => Math.min(MAX_YEAR, Math.max(MIN_YEAR, prev + delta)));
  };

  const goToday = () => {
    Haptics.selectionAsync().catch(() => undefined);
    const now = new Date();
    setYear(now.getFullYear());
  };

  const handleSelect = (month: number) => {
    const key = monthKey(new Date(year, month - 1, 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onSelect(key);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Jump to month</Text>
            <IconButton
              icon="close"
              accessibilityLabel="Close month picker"
              onPress={onClose}
              backgroundColor="transparent"
            />
          </View>

          <View style={styles.yearRow}>
            <IconButton
              icon="chevron-back"
              accessibilityLabel="Previous year"
              onPress={() => step(-1)}
              backgroundColor="transparent"
            />
            <Text style={styles.yearLabel}>{year}</Text>
            <IconButton
              icon="chevron-forward"
              accessibilityLabel="Next year"
              onPress={() => step(1)}
              backgroundColor="transparent"
            />
          </View>

          <View style={styles.grid}>
            {MONTH_LABELS.map((label, index) => {
              const key = monthKey(new Date(year, index, 1));
              const isActive = key === activeKey;
              const hasData = dataSet.has(key);
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} ${year}`}
                  accessibilityState={{ selected: isActive }}
                  onPress={() => handleSelect(index + 1)}
                  style={({ pressed }) => [
                    styles.cell,
                    isActive && styles.cellActive,
                    pressed && !isActive && styles.cellPressed,
                  ]}
                >
                  <Text style={[styles.cellLabel, isActive && styles.cellLabelActive]}>
                    {label}
                  </Text>
                  {hasData ? (
                    <View style={[styles.dot, isActive && styles.dotActive]} />
                  ) : (
                    <View style={styles.dotPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Button
            label="Current month"
            variant="secondary"
            icon="calendar-outline"
            onPress={goToday}
            style={styles.todayButton}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: palette.overlay,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    backgroundColor: palette.sheet,
    borderWidth: 1,
    borderColor: palette.border,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  yearLabel: {
    minWidth: 90,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cell: {
    width: '31.5%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    gap: spacing.xs,
  },
  cellActive: {
    backgroundColor: palette.cyanSoft,
    borderColor: palette.cyan,
  },
  cellPressed: {
    backgroundColor: palette.surfaceStrong,
  },
  cellLabel: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  cellLabelActive: {
    color: palette.cyan,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.textFaint,
  },
  dotActive: {
    backgroundColor: palette.cyan,
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
  todayButton: {
    marginTop: spacing.xs,
  },
});
