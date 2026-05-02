import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';
import { CartoonActionButton } from './CartoonActionButton';

type RequestStatus = 'pending' | 'accepted' | 'rejected';

interface CartoonRequestCardProps {
  customerName: string;
  problem: string;
  distanceKm: number | null;
  requestTime: string;
  status: RequestStatus;
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}

const c = theme.colors.cartoon;

const statusConfig: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: c.yellow, bg: c.yellowBg },
  accepted: { label: 'Accepted', color: c.mint, bg: c.mintBg },
  rejected: { label: 'Rejected', color: c.red, bg: c.creamDark },
};

export function CartoonRequestCard({
  customerName,
  problem,
  distanceKm,
  requestTime,
  status,
  onPress,
  onAccept,
  onReject,
}: CartoonRequestCardProps) {
  const statusUi = statusConfig[status];
  const canRespond = status === 'pending';

  return (
    <Pressable onPress={onPress} style={styles.shadowWrapper}>
      <View style={styles.shadowOffset}>
        <SketchFill opacity={0.2} />
      </View>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.customerRow}>
            <MaterialCommunityIcons name="account-circle" size={20} color={c.blue} />
            <Text style={styles.customer} numberOfLines={1}>
              {customerName}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusUi.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusUi.color }]} />
            <Text style={[styles.statusText, { color: c.charcoal }]}>{statusUi.label}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="car-wrench" size={16} color={c.orange} />
          <Text style={styles.problem} numberOfLines={2}>
            {problem}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={c.blue} />
            <Text style={styles.metaText}>
              {distanceKm == null ? 'Distance N/A' : `${distanceKm.toFixed(1)} km`}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={c.purple} />
            <Text style={styles.metaText}>{requestTime}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <CartoonActionButton
            label="Accept"
            variant="accept"
            icon="check-circle-outline"
            onPress={onAccept}
            disabled={!canRespond}
            fullWidth
          />
          <CartoonActionButton
            label="Reject"
            variant="reject"
            icon="close-circle-outline"
            onPress={onReject}
            disabled={!canRespond}
            fullWidth
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  shadowOffset: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: c.cream,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  customer: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: c.charcoal,
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  problem: {
    ...theme.typography.body,
    color: c.charcoal,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...theme.typography.caption,
    color: c.gray,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export type { CartoonRequestCardProps, RequestStatus };
