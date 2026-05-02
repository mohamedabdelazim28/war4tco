import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export interface VehicleCardProps {
  title: string;
  subtitle: string;
  licensePlate: string;
  verified?: boolean;
  imageUri?: string | null;
  onHistoryPress?: () => void;
  onSchedulePress?: () => void;
  onMorePress?: () => void;
  style?: ViewStyle;
}

export function VehicleCard({
  title,
  subtitle,
  licensePlate,
  verified = true,
  imageUri,
  onHistoryPress,
  onSchedulePress,
  onMorePress,
  style,
}: VehicleCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.main}>
        <View style={styles.thumbnail}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.thumbnailImage}
              accessibilityLabel={`${title} vehicle`}
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <MaterialCommunityIcons
                name="car-side"
                size={36}
                color={theme.colors.textSecondary}
              />
            </View>
          )}
        </View>
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
            {onMorePress && (
              <TouchableOpacity onPress={onMorePress} hitSlop={12}>
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.plate}>
              <Text style={styles.plateText}>{licensePlate}</Text>
            </View>
            {verified && (
              <View style={styles.verified}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={14}
                  color={theme.colors.green}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {(onHistoryPress || onSchedulePress) && (
        <View style={styles.actions}>
          {onHistoryPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onHistoryPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="history"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
          )}
          {onSchedulePress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSchedulePress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="calendar-today"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.actionLabel}>Schedule</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  main: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceDarkLight,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.white,
    fontWeight: '700',
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  plate: {
    backgroundColor: theme.colors.surfaceDarkLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  plateText: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    color: theme.colors.textSecondary,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${theme.colors.green}1A`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.green,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceDarkLight,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  actionLabel: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
