import React from 'react';
import { ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface SpinnerProps {
  size?: 'small' | 'large';
  style?: ViewStyle;
}

export function Spinner({ size = 'large', style }: SpinnerProps) {
  return (
    <ActivityIndicator
      size={size}
      color={theme.colors.primary}
      style={style}
    />
  );
}
