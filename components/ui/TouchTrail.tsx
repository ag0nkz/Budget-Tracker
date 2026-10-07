import { Canvas, Circle } from '@shopify/react-native-skia';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import {
  SharedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

const MAX_POINTS = 26;
const FADE = 0.92;
const GROWTH = 0.7;
const START_ALPHA = 0.55;
const START_RADIUS = 8;

const COLORS = [
  { r: 103, g: 232, b: 249 },
  { r: 192, g: 132, b: 252 },
  { r: 52, g: 211, b: 153 },
];

export interface TrailPoint {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  hue: number;
}

const createEmptyPoints = (): TrailPoint[] =>
  Array.from({ length: MAX_POINTS }, () => ({
    x: -999,
    y: -999,
    radius: 0,
    alpha: 0,
    hue: 0,
  }));

export const useTouchTrail = () => {
  const points = useSharedValue<TrailPoint[]>(createEmptyPoints());
  const cursor = useSharedValue(0);

  const spawn = useCallback(
    (x: number, y: number) => {
      const index = cursor.value % MAX_POINTS;
      const next = points.value.slice();
      next[index] = {
        x,
        y,
        radius: START_RADIUS,
        alpha: START_ALPHA,
        hue: Math.floor(Math.random() * COLORS.length),
      };
      points.value = next;
      cursor.value = cursor.value + 1;
    },
    [cursor, points],
  );

  return { points, spawn };
};

const TrailDot = ({ index, points }: { index: number; points: SharedValue<TrailPoint[]> }) => {
  const outerColor = useDerivedValue(() => {
    const p = points.value[index];
    const { r, g, b } = COLORS[p?.hue ?? 0];
    return `rgba(${r},${g},${b},${((p?.alpha ?? 0) * 0.3).toFixed(3)})`;
  });
  const innerColor = useDerivedValue(() => {
    const p = points.value[index];
    const { r, g, b } = COLORS[p?.hue ?? 0];
    return `rgba(${r},${g},${b},${(p?.alpha ?? 0).toFixed(3)})`;
  });
  const cx = useDerivedValue(() => points.value[index]?.x ?? -999);
  const cy = useDerivedValue(() => points.value[index]?.y ?? -999);
  const innerR = useDerivedValue(() => points.value[index]?.radius ?? 0);
  const outerR = useDerivedValue(() => (points.value[index]?.radius ?? 0) * 2.1);

  return (
    <>
      <Circle cx={cx} cy={cy} r={outerR} color={outerColor} />
      <Circle cx={cx} cy={cy} r={innerR} color={innerColor} />
    </>
  );
};

export const TouchTrail = ({ points }: { points: SharedValue<TrailPoint[]> }) => {
  useFrameCallback(() => {
    'worklet';
    const current = points.value;
    let changed = false;
    const next = current.map((point) => {
      if (point.alpha === 0) return point;
      changed = true;
      if (point.alpha < 0.02) {
        return { ...point, alpha: 0, radius: 0 };
      }
      return { ...point, alpha: point.alpha * FADE, radius: point.radius + GROWTH };
    });
    if (changed) points.value = next;
  });

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: MAX_POINTS }, (_, index) => (
        <TrailDot key={index} index={index} points={points} />
      ))}
    </Canvas>
  );
};
