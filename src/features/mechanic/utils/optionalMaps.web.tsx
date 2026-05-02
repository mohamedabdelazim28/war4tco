import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme';

type GenericProps = {
  children?: React.ReactNode;
  style?: unknown;
  [key: string]: unknown;
};

function FallbackMapView({ children, style }: GenericProps) {
  return (
    <View style={[styles.fallbackMap, style as object]}>
      <Text style={styles.fallbackText}>Maps are currently disabled on Web.</Text>
      {children}
    </View>
  );
}

function FallbackMarker({ children }: GenericProps) {
  return <>{children}</>;
}

function FallbackCallout({ children }: GenericProps) {
  return <View>{children}</View>;
}

export const OptionalMapView = FallbackMapView as React.ComponentType<GenericProps>;
export const OptionalMarker = FallbackMarker as React.ComponentType<GenericProps>;
export const OptionalCallout = FallbackCallout as React.ComponentType<GenericProps>;

const styles = StyleSheet.create({
  fallbackMap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    borderRadius: 16,
    backgroundColor: theme.colors.cartoon.blueBg,
    minHeight: 180,
  },
  fallbackText: {
    ...theme.typography.caption,
    color: theme.colors.cartoon.charcoal,
    fontWeight: '700',
  },
});
