import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedBlobProps {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  driftX?: number;
  driftY?: number;
  durationX?: number;
  durationY?: number;
  delay?: number;
  opacity?: number;
}

export const AnimatedBlob = ({
  color,
  size = 260,
  style,
  driftX = 90,
  driftY = 110,
  durationX = 24000,
  durationY = 30000,
  delay = 0,
  opacity = 0.5,
}: AnimatedBlobProps) => {
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      x.value = 0;
      y.value = 0;
      return;
    }

    x.value = withDelay(
      delay,
      withRepeat(
        withTiming(driftX, { duration: durationX, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    y.value = withDelay(
      delay,
      withRepeat(
        withTiming(driftY, { duration: durationY, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
  }, [reduceMotion, x, y, driftX, driftY, durationX, durationY, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          backgroundColor: color,
        },
        style,
        animatedStyle,
      ]}
    />
  );
};
