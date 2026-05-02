import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme';

type GenericProps = {
  children?: React.ReactNode;
  style?: unknown;
  [key: string]: unknown;
};

let mapsModule: null | {
  default: React.ComponentType<GenericProps>;
  Marker?: React.ComponentType<GenericProps>;
  Callout?: React.ComponentType<GenericProps>;
} = null;

try {
  mapsModule = require('react-native-maps');
} catch (error) {
  console.warn('[optionalMaps] react-native-maps unavailable, using fallback view.', error);
}

function FallbackMapView({ children, style }: GenericProps) {
  return (
    <View style={[styles.fallbackMap, style as object]}>
      <Text style={styles.fallbackText}>Map unavailable in this runtime.</Text>
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

export const OptionalMapView =
  mapsModule?.default ?? (FallbackMapView as React.ComponentType<GenericProps>);
export const OptionalMarker =
  mapsModule?.Marker ?? (FallbackMarker as React.ComponentType<GenericProps>);
export const OptionalCallout =
  mapsModule?.Callout ?? (FallbackCallout as React.ComponentType<GenericProps>);

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

