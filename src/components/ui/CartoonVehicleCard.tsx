import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

const c = theme.colors.cartoon;

interface CartoonVehicleCardProps {
  title: string;
  subtitle: string;
  licensePlate: string;
  verified?: boolean;
  onHistoryPress?: () => void;
  onSchedulePress?: () => void;
  style?: ViewStyle;
}

export function CartoonVehicleCard({
  title,
  subtitle,
  licensePlate,
  verified = true,
  onHistoryPress,
  onSchedulePress,
  style,
}: CartoonVehicleCardProps) {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.shadowOffset}>
        <SketchFill />
      </View>
      <View style={styles.card}>
        <View style={styles.main}>
          {/* Car icon area */}
          <View style={styles.iconArea}>
            <View style={styles.iconBlob} />
            <MaterialCommunityIcons name="car-side" size={40} color={c.blue} />
          </View>

          {/* Details */}
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.plate}>
                <MaterialCommunityIcons
                  name="card-text-outline"
                  size={12}
                  color={c.charcoal}
                />
                <Text style={styles.plateText}>{licensePlate}</Text>
              </View>
              {verified && (
                <View style={styles.verified}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color={c.mint}
                  />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action buttons */}
        {(onHistoryPress || onSchedulePress) && (
          <View style={styles.actions}>
            {onHistoryPress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onHistoryPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: c.purpleBg }]}>
                  <MaterialCommunityIcons name="history" size={18} color={c.purple} />
                </View>
                <Text style={styles.actionLabel}>History</Text>
              </TouchableOpacity>
            )}
            {onSchedulePress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSchedulePress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: c.mintBg }]}>
                  <MaterialCommunityIcons
                    name="calendar-today"
                    size={18}
                    color={c.mint}
                  />
                </View>
                <Text style={styles.actionLabel}>Schedule</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
  },
  shadowOffset: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 24,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  main: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  iconArea: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: c.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  iconBlob: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: c.gray,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  plate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.creamDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: c.charcoal,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.mint,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: c.creamDark,
    backgroundColor: `${c.cream}80`,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: c.charcoal,
  },
});
