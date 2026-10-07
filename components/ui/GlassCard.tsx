import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { palette, radius, shadow } from '../../theme';
import { useBlurTarget } from './BlurTargetContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  blurIntensity?: number;
  tint?: 'dark' | 'light' | 'default';
  padded?: boolean;
}

export const GlassCard = ({
  children,
  style,
  contentStyle,
  blurIntensity = 26,
  tint = 'dark',
  padded = true,
}: GlassCardProps) => {
  const targetRef = useBlurTarget();
  const androidBlurReady = Platform.OS === 'android' && targetRef != null;

  return (
    <BlurView
      intensity={blurIntensity}
      tint={tint}
      blurMethod={androidBlurReady ? 'dimezisBlurView' : undefined}
      blurTarget={androidBlurReady ? targetRef : undefined}
      style={[styles.blur, style]}
    >
      <View style={[padded && styles.padded, styles.content, contentStyle]}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blur: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.glassFallback,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow('#0b1526', 0.45, 18, 10),
  },
  content: {
    backgroundColor: palette.glassContent,
  },
  padded: {
    padding: 18,
  },
});
