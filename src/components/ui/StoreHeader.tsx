import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface StoreHeaderProps {
  title?: string;
  subtitle?: string;
  cartCount?: number;
  onCartPress?: () => void;
  /** Light style (dark text, light bg) to match Home */
  light?: boolean;
  style?: ViewStyle;
}

export function StoreHeader({
  title = 'Parts Store',
  subtitle = 'Find parts for your car',
  cartCount = 0,
  onCartPress,
  light = false,
  style,
}: StoreHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
        <Text style={[styles.subtitle, light && styles.subtitleLight]}>{subtitle}</Text>
      </View>
      <TouchableOpacity
        style={[styles.cartButton, light && styles.cartButtonLight]}
        onPress={onCartPress}
        activeOpacity={0.8}
        accessibilityLabel={cartCount > 0 ? `Cart with ${cartCount} items` : 'Cart'}
      >
        <MaterialCommunityIcons
          name="cart-outline"
          size={24}
          color={light ? theme.colors.textOnLight : theme.colors.white}
        />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
    lineHeight: 30,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  titleLight: {
    color: theme.colors.textOnLight,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  subtitleLight: {
    color: theme.colors.muted,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  cartButtonLight: {
    backgroundColor: theme.colors.lightAccent,
    borderColor: theme.colors.border,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
  },
});
