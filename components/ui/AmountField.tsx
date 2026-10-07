import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { StyleProp, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { CurrencyCode } from '../../types';
import { clampAmount, CURRENCY_SYMBOL, parseAmount, sanitizeAmountInput } from '../../utils/format';
import { TextField } from './TextField';

interface AmountFieldProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  currency: CurrencyCode;
  placeholder?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  maxLength?: number;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onBlur?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

export const AmountField = forwardRef<TextInput, AmountFieldProps>(
  (
    {
      label,
      value,
      onChange,
      currency,
      placeholder = '0.00',
      error,
      helper,
      required = false,
      maxLength = 15,
      returnKeyType,
      onSubmitEditing,
      onBlur,
      containerStyle,
      autoFocus,
    },
    ref,
  ) => {
    const [text, setText] = useState(value ? String(value) : '');
    const focusedRef = useRef(false);

    useEffect(() => {
      if (!focusedRef.current) {
        setText(value ? String(value) : '');
      }
    }, [value]);

    const handleChange = (raw: string) => {
      const sanitized = sanitizeAmountInput(raw);
      setText(sanitized);
      if (sanitized === '' || sanitized === '.') return;
      onChange(clampAmount(parseAmount(sanitized)));
    };

    const handleBlur = () => {
      focusedRef.current = false;
      const clamped = clampAmount(parseAmount(text));
      setText(clamped ? String(clamped) : '');
      onChange(clamped);
      onBlur?.();
    };

    return (
      <TextField
        ref={ref}
        label={label}
        value={text}
        onChangeText={handleChange}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={handleBlur}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        prefix={CURRENCY_SYMBOL[currency]}
        error={error}
        helper={helper}
        required={required}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        containerStyle={containerStyle}
        autoFocus={autoFocus}
      />
    );
  },
);

AmountField.displayName = 'AmountField';
