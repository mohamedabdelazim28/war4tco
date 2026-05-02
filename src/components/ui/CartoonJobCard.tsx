import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';
import { CartoonActionButton } from './CartoonActionButton';

/* ─── types ─── */

type JobStatus = 'on_the_way' | 'working' | 'completed';

interface CartoonJobCardProps {
  customerName: string;
  problem: string;
  status: JobStatus;
  eta: string;
  distanceKm: number | null;
  startTime?: string;
  endTime?: string;
  /** UI-only fields for richer card content */
  priceLabel?: string;
  serviceType?: string;
  locationLabel?: string;
  scheduledTime?: string;
  onPress?: () => void;
  onStartJob?: () => void;
  onCompleteJob?: () => void;
  onViewDetails?: () => void;
}

const c = theme.colors.cartoon;

const statusStyleMap: Record<
  JobStatus,
  { label: string; color: string; bg: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }
> = {
  on_the_way: { label: 'On the way', color: c.blue, bg: c.blueBg, icon: 'truck-delivery-outline' },
  working: { label: 'Working', color: c.orange, bg: c.orangeBg, icon: 'wrench-outline' },
  completed: { label: 'Completed', color: c.red, bg: c.creamDark, icon: 'check-circle-outline' },
};

/** Maps status to contextual CTA config using CartoonActionButton variants */
const ctaConfig: Record<
  JobStatus,
  {
    label: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    handler: 'start' | 'complete' | 'details';
  }
> = {
  on_the_way: { label: 'Start Work', icon: 'play-circle-outline', handler: 'start' },
  working: { label: 'Complete Job', icon: 'check-decagram-outline', handler: 'complete' },
  completed: { label: 'View Details', icon: 'eye-outline', handler: 'details' },
};

/* ─── main component ─── */

export function CartoonJobCard({
  customerName,
  problem,
  status,
  eta,
  distanceKm,
  startTime,
  endTime,
  priceLabel,
  serviceType,
  locationLabel,
  scheduledTime,
  onPress,
  onStartJob,
  onCompleteJob,
  onViewDetails,
}: CartoonJobCardProps) {
  const statusUi = statusStyleMap[status];
  const cta = ctaConfig[status];

  const handleCta = () => {
    if (cta.handler === 'start') onStartJob?.();
    else if (cta.handler === 'complete') onCompleteJob?.();
    else onViewDetails?.();
  };

  return (
    <Pressable onPress={onPress} style={styles.shadowWrapper}>
      {/* Offset shadow with SketchFill — matching app pattern */}
      <View style={styles.shadowOffset}>
        <SketchFill opacity={0.2} />
      </View>

      <View style={styles.card}>
        {/* ── Top row: customer name + price ── */}
        <View style={styles.topRow}>
          <View style={styles.customerRow}>
            <View style={[styles.avatar, { backgroundColor: statusUi.bg }]}>
              <MaterialCommunityIcons name="account" size={18} color={statusUi.color} />
            </View>
            <Text style={styles.customerName} numberOfLines={1}>
              {customerName}
            </Text>
          </View>
          {priceLabel ? (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{priceLabel}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Service type / problem ── */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="car-wrench" size={16} color={c.orange} />
          <Text style={styles.infoText} numberOfLines={2}>
            {serviceType || problem}
          </Text>
        </View>

        {/* ── Time row ── */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={c.purple} />
          <Text style={styles.infoText}>
            {scheduledTime ?? eta}
            {startTime && status !== 'on_the_way' ? `  ·  Started ${startTime}` : ''}
            {endTime ? `  ·  Ended ${endTime}` : ''}
          </Text>
        </View>

        {/* ── Location row ── */}
        {locationLabel ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color={c.blue} />
            <Text style={styles.infoText} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        ) : distanceKm != null ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color={c.blue} />
            <Text style={styles.infoText}>{distanceKm.toFixed(1)} km away</Text>
          </View>
        ) : null}

        {/* ── Meta row: distance + status badge ── */}
        <View style={styles.metaRow}>
          {locationLabel && distanceKm != null ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={14} color={c.blue} />
              <Text style={styles.metaText}>{distanceKm.toFixed(1)} km</Text>
            </View>
          ) : null}

          <View style={[styles.statusPill, { backgroundColor: statusUi.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusUi.color }]} />
            <Text style={styles.statusLabel}>{statusUi.label}</Text>
          </View>
        </View>

        {/* ── Contextual CTA ── */}
        <CartoonActionButton
          label={cta.label}
          variant="dark"
          icon={cta.icon}
          onPress={handleCta}
          fullWidth
        />
      </View>
    </Pressable>
  );
}

/* ─── skeleton placeholder ─── */

export function CartoonJobCardSkeleton() {
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.shadowOffset}>
        <SketchFill opacity={0.12} />
      </View>
      <View style={[styles.card, styles.skeletonCard]}>
        <View style={styles.topRow}>
          <View style={styles.customerRow}>
            <View style={[styles.avatar, styles.skeletonBlock]} />
            <View style={[styles.skeletonBlock, { width: 120, height: 14, borderRadius: 7 }]} />
          </View>
          <View style={[styles.skeletonBlock, { width: 48, height: 20, borderRadius: 10 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: '80%', height: 12, borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { width: '65%', height: 12, borderRadius: 6 }]} />
        <View style={[styles.skeletonBlock, { width: '50%', height: 12, borderRadius: 6 }]} />
        <View style={styles.metaRow}>
          <View style={[styles.skeletonBlock, { width: 80, height: 22, borderRadius: 999 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: '100%', height: 44, borderRadius: 14 }]} />
      </View>
    </View>
  );
}

/* ─── styles ─── */

const styles = StyleSheet.create({
  /* Offset shadow wrapper — same as CartoonRequestCard, 2% smaller */
  shadowWrapper: {
    position: 'relative',
    marginBottom: 14,
    width: '97%',
    alignSelf: 'center',
  },
  shadowOffset: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 20,
    backgroundColor: c.redLight,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },

  /* Card body — 2% smaller */
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: theme.colors.white,
    padding: 14,
    gap: 7,
  },

  /* Top row */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    color: c.charcoal,
    flex: 1,
  },
  priceTag: {
    backgroundColor: c.yellowBg,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: c.charcoal,
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: c.charcoal,
    flex: 1,
  },

  /* Meta row */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  /* Status badge */
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: c.charcoal,
  },

  /* Skeleton */
  skeletonCard: {
    opacity: 0.55,
  },
  skeletonBlock: {
    backgroundColor: c.creamDark,
  },
});

export type { CartoonJobCardProps, JobStatus };
