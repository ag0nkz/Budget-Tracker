import React, { forwardRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { palette, radius, spacing } from '../../theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  prefix?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  (
    {
      label,
      prefix,
      error,
      helper,
      required = false,
      containerStyle,
      inputStyle,
      onFocus,
      onBlur,
      accessibilityLabel,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);

    const resolvedLabel =
      accessibilityLabel ??
      (label ? (required ? `${label}, required` : label) : rest.placeholder);
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? (
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
        ) : null}
        <View style={[styles.field, focused && styles.fieldFocused, hasError && styles.fieldError]}>
          {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
          <TextInput
            ref={ref}
            {...rest}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            placeholderTextColor={palette.textFaint}
            selectionColor={palette.cyan}
            style={[styles.input, inputStyle]}
            accessibilityLabel={resolvedLabel}
            accessibilityHint={hasError ? error : rest.accessibilityHint}
          />
        </View>
        {hasError ? (
          <Text
            style={styles.errorText}
            accessibilityLiveRegion="polite"
            accessibilityLabel={label ? `${label} error: ${error}` : error}
          >
            {error}
          </Text>
        ) : helper ? (
          <Text style={styles.helperText}>{helper}</Text>
        ) : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: palette.textMuted,
  },
  required: {
    color: palette.cyan,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  fieldFocused: {
    borderColor: 'rgba(103,232,249,0.55)',
    backgroundColor: 'rgba(103,232,249,0.06)',
  },
  fieldError: {
    borderColor: 'rgba(248,113,113,0.6)',
  },
  prefix: {
    color: palette.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: spacing.md,
  },
  errorText: {
    color: palette.danger,
    fontSize: 12,
  },
  helperText: {
    color: palette.textFaint,
    fontSize: 12,
  },
});
