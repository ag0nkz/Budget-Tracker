import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import logoSource from '../../assets/logo.png';

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

export const Logo = ({
  size = 32,
  style,
  accessibilityLabel = 'Budget Tracker logo',
}: LogoProps) => {
  return (
    <Image
      source={logoSource}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    />
  );
};
