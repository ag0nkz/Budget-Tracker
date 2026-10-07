import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { palette, radius, spacing } from '../../theme';

type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const TONES: Record<BadgeTone, { bg: string; border: string; color: string }> = {
  success: { bg: palette.emeraldSoft, border: 'rgba(52,211,153,0.45)', color: palette.emerald },
  danger: { bg: palette.crimsonSoft, border: 'rgba(251,113,133,0.45)', color: palette.crimson },
  warning: { bg: palette.amberSoft, border: 'rgba(245,158,11,0.45)', color: palette.amber },
  info: { bg: palette.cyanSoft, border: 'rgba(103,232,249,0.4)', color: palette.cyan },
  neutral: { bg: palette.surface, border: palette.borderSoft, color: palette.textMuted },
};

export const Badge = ({ label, tone = 'neutral', icon, style }: BadgeProps) => {
  const tokens = TONES[tone];
  return (
    <View style={[styles.base, { backgroundColor: tokens.bg, borderColor: tokens.border }, style]}>
      {icon ? <Ionicons name={icon} size={13} color={tokens.color} /> : null}
      <Text style={[styles.label, { color: tokens.color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
