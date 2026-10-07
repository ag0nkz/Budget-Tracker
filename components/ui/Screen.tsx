import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef } from 'react';
import {
  GestureResponderEvent,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gradient, palette, spacing } from '../../theme';
import { AnimatedBlob } from './AnimatedBlob';
import { BlurTargetContext } from './BlurTargetContext';
import { TouchTrail, useTouchTrail } from './TouchTrail';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  keyboardAware?: boolean;
  footer?: React.ReactNode;
}

export const Screen = ({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  edges = ['top'],
  keyboardAware = false,
  footer,
}: ScreenProps) => {
  const targetRef = useRef<View | null>(null);
  const containerRef = useRef<View | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const { points, spawn } = useTouchTrail();

  const measure = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      originRef.current = { x, y };
    });
  }, []);

  const handleTouch = useCallback(
    (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent;
      spawn(pageX - originRef.current.x, pageY - originRef.current.y);
    },
    [spawn],
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  const wrapped = keyboardAware ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <View
      ref={containerRef}
      onLayout={measure}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      style={[styles.background, style]}
    >
      <BlurTargetView
        ref={targetRef}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
        <AnimatedBlob
          color="rgba(52,211,153,0.55)"
          style={styles.blobEmerald}
          driftX={90}
          driftY={120}
          durationX={22000}
          durationY={28000}
        />
        <AnimatedBlob
          color="rgba(103,232,249,0.5)"
          style={styles.blobCyan}
          driftX={-110}
          driftY={90}
          durationX={26000}
          durationY={20000}
          delay={1500}
        />
        <AnimatedBlob
          color="rgba(192,132,252,0.45)"
          style={styles.blobViolet}
          driftX={120}
          driftY={-80}
          durationX={30000}
          durationY={24000}
          delay={800}
        />
        <TouchTrail points={points} />
      </BlurTargetView>

      <BlurTargetContext.Provider value={Platform.OS === 'android' ? targetRef : null}>
        <SafeAreaView style={styles.flex} edges={edges}>
          {wrapped}
          {footer}
        </SafeAreaView>
      </BlurTargetContext.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: palette.bgBase,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    gap: spacing.lg,
  },
  blobEmerald: {
    top: -70,
    left: -90,
  },
  blobCyan: {
    top: 180,
    right: -110,
  },
  blobViolet: {
    bottom: -80,
    left: 40,
  },
});
