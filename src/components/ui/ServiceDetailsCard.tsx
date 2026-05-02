import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ServiceDetailsCardProps {
  title: string;
  vehicleDescription: string;
  price: string;
  priceLabel?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: ViewStyle;
}

export function ServiceDetailsCard({
  title,
  vehicleDescription,
  price,
  priceLabel = 'Base Fee',
  icon = 'car-wrench',
  style,
}: ServiceDetailsCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.vehicle} numberOfLines={1}>
          {vehicleDescription}
        </Text>
      </View>
      <View style={styles.priceBlock}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.priceLabel}>{priceLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.backgroundDark}CC`,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: `${theme.colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
  },
  vehicle: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontWeight: '700',
  },
  priceLabel: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.gray,
    marginTop: 2,
  },
});
