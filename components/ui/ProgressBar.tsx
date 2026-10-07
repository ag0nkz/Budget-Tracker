import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { glow, palette, radius } from '../../theme';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  trackColor?: string;
  glowColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar = ({
  value,
  color = palette.emerald,
  height = 10,
  trackColor = 'rgba(255,255,255,0.08)',
  glowColor,
  style,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <View
      style={[styles.track, { height, borderRadius: radius.pill, backgroundColor: trackColor }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage) }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            height,
            borderRadius: radius.pill,
            backgroundColor: color,
            ...(glowColor ? glow(glowColor, 8) : null),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    minWidth: 0,
  },
});
