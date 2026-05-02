import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

const c = theme.colors.cartoon;

interface CartoonStoreHeaderProps {
  userName: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  cartCount?: number;
  onCartPress?: () => void;
  style?: ViewStyle;
}

export function CartoonStoreHeader({
  userName,
  notificationCount = 0,
  onNotificationPress,
  cartCount = 0,
  onCartPress,
  style,
}: CartoonStoreHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        {/* Cartoon Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <MaterialCommunityIcons name="account" size={28} color={c.red} />
          </View>
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.greeting}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.rightIcons}>
        {onCartPress != null && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={onCartPress}
            activeOpacity={0.7}
            accessibilityLabel={cartCount > 0 ? `${cartCount} items in cart` : 'Cart'}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color={c.charcoal} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.bellWrapper}>
          <View style={styles.bellShadow}>
            <SketchFill />
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
            accessibilityLabel={
              notificationCount > 0
                ? `${notificationCount} notifications`
                : 'Notifications'
            }
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={c.charcoal} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2.5,
    borderColor: c.cream,
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md + 4,
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 3,
    backgroundColor: c.red,
    position: 'relative',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: c.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: c.mint,
    borderWidth: 3,
    borderColor: c.cream,
  },
  greeting: {
    gap: 1,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.gray,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 24,
  },
  bellWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  bellShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 24,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
