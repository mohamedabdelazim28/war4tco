import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { CartoonActionButton } from './CartoonActionButton';

interface CartoonMapMiniCardProps {
  customerName: string;
  problem: string;
  distanceKm: number | null;
  onAccept?: () => void;
}

const c = theme.colors.cartoon;

export function CartoonMapMiniCard({
  customerName,
  problem,
  distanceKm,
  onAccept,
}: CartoonMapMiniCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-circle" size={18} color={c.charcoal} />
        <Text style={styles.name} numberOfLines={1}>
          {customerName}
        </Text>
      </View>
      <View style={styles.problemRow}>
        <MaterialCommunityIcons name="car-wrench" size={16} color={c.orange} />
        <Text style={styles.problem} numberOfLines={2}>
          {problem}
        </Text>
      </View>
      <View style={styles.distanceRow}>
        <MaterialCommunityIcons name="map-marker-distance" size={14} color={c.blue} />
        <Text style={styles.distance}>
          {distanceKm == null ? 'Distance unavailable' : `${distanceKm.toFixed(1)} km away`}
        </Text>
      </View>
      <CartoonActionButton
        label="Accept"
        icon="check-circle-outline"
        variant="accept"
        onPress={onAccept}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 230,
    maxWidth: 270,
    backgroundColor: c.cream,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: c.charcoal,
    flex: 1,
  },
  problemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  problem: {
    ...theme.typography.caption,
    color: c.gray,
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  distance: {
    ...theme.typography.caption,
    color: c.charcoal,
  },
});

export type { CartoonMapMiniCardProps };
