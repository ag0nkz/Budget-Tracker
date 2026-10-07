import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { palette, radius, spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; border: string; text: string }> = {
  primary: { bg: palette.cyan, border: palette.cyan, text: '#04141f' },
  secondary: { bg: palette.surface, border: palette.border, text: palette.text },
  ghost: { bg: 'transparent', border: 'transparent', text: palette.textMuted },
  danger: { bg: palette.dangerSoft, border: 'rgba(248,113,113,0.5)', text: palette.danger },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; icon: number }> = {
  sm: { height: 38, paddingHorizontal: spacing.md, fontSize: 13, icon: 15 },
  md: { height: 48, paddingHorizontal: spacing.lg, fontSize: 15, icon: 18 },
  lg: { height: 54, paddingHorizontal: spacing.xl, fontSize: 16, icon: 20 },
};

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
}: ButtonProps) => {
  const tokens = VARIANT_STYLES[variant];
  const dims = SIZE_STYLES[size];
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={isInactive ? undefined : onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          backgroundColor: tokens.bg,
          borderColor: tokens.border,
        },
        fullWidth && styles.fullWidth,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tokens.text} />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={dims.icon} color={tokens.text} style={styles.icon} />
          ) : null}
          <Text style={[styles.label, { fontSize: dims.fontSize, color: tokens.text }]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: spacing.sm,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  icon: {
    marginRight: -2,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
