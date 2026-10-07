import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { gradient, glow, palette, spacing } from '../../theme';
import { Logo } from './Logo';

export const LoadingScreen = () => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] });

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
        <Logo size={128} />
      </Animated.View>
      <Text style={styles.name}>Budget Tracker</Text>
      <Text style={styles.tagline}>Plan. Spend. Save.</Text>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  logoWrap: {
    marginBottom: spacing.sm,
    ...glow(palette.cyan, 24),
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: palette.textFaint,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {
    backgroundColor: palette.cyan,
  },
});
