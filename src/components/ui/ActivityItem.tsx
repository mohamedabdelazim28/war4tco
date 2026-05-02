import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ActivityItemProps {
  title: string;
  subtitle: string;
  amount: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor?: string;
  amountMuted?: boolean;
  /** Optional status or detail line (e.g. "Completed", "Scheduled for 2:00 PM") */
  status?: string;
  variant?: 'default' | 'dark' | 'light';
  /** Custom background; when set, border is black and text/icon follow useLightText or useRedText */
  backgroundColor?: string;
  /** Use light (white) text and icons; set true for dark backgrounds */
  useLightText?: boolean;
  /** Use red text and icon; set true for black cards */
  useRedText?: boolean;
  /** Override card border color when using custom background */
  borderColorOverride?: string;
  /** Background color for the offset shadow wrapper */
  shadowBackgroundColor?: string;
  /** Border color for the offset shadow wrapper */
  shadowBorderColor?: string;
  style?: ViewStyle;
}

export function ActivityItem({
  title,
  subtitle,
  amount,
  icon,
  iconColor = theme.colors.primary,
  amountMuted = false,
  status,
  variant = 'default',
  backgroundColor: customBg,
  useLightText = false,
  useRedText = false,
  borderColorOverride,
  shadowBackgroundColor,
  shadowBorderColor,
  style,
}: ActivityItemProps) {
  const hasRedText = customBg != null && useRedText;
  const hasCustomBg = customBg != null && customBg !== '';
  const isDark = !hasRedText && (variant === 'dark' || (customBg != null && useLightText));
  const isLight = !hasRedText && (variant === 'light' || (customBg != null && !useLightText));
  const containerStyle = [
    styles.inner,
    isDark && !hasCustomBg && styles.containerDark,
    isLight && !hasCustomBg && styles.containerLight,
    hasCustomBg && {
      backgroundColor: customBg,
      borderColor: borderColorOverride ?? '#000000',
    },
  ];
  const iconColorResolved = hasRedText
    ? theme.colors.primary
    : hasCustomBg && useLightText
      ? theme.colors.white
      : iconColor;
  const redTextStyle = { color: theme.colors.primary };
  // For cards with custom background (e.g. Home recent activity), use solid black behind the icon
  const iconCircleBg = hasCustomBg
    ? theme.colors.black
    : hasRedText
      ? `${theme.colors.primary}25`
      : hasCustomBg && useLightText
        ? 'rgba(255,255,255,0.25)'
        : `${iconColorResolved}1A`;
  const shadowStyles = [
    styles.shadowOffset,
    shadowBackgroundColor && { backgroundColor: shadowBackgroundColor },
    // Keep border black for red shadow boxes; only override when not red
    shadowBorderColor &&
      (!shadowBackgroundColor || shadowBackgroundColor !== theme.colors.red) && {
        borderColor: shadowBorderColor,
      },
  ];
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={shadowStyles} />
      <View style={containerStyle}>
        <View style={styles.left}>
          <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>
            <MaterialCommunityIcons
              name={icon}
              size={26}
              color={iconColorResolved}
            />
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.title, isDark && styles.titleDark, isLight && styles.titleLight, hasRedText && redTextStyle]}>{title}</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark, isLight && styles.subtitleLight, hasRedText && redTextStyle]}>{subtitle}</Text>
            {status != null && status !== '' && (
              <Text style={[styles.status, isDark && styles.statusDark, isLight && styles.statusLight, hasRedText && redTextStyle]}>{status}</Text>
            )}
          </View>
        </View>
        <View style={styles.amountBlock}>
          <Text style={[styles.amount, amountMuted && styles.amountMuted, isDark && styles.amountDark, amountMuted && isDark && styles.amountMutedDark, isLight && styles.amountLight, amountMuted && isLight && styles.amountMutedLight, hasRedText && redTextStyle]}>{amount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    width: '97.5%',
    position: 'relative',
  },
  shadowOffset: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 88,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderCardDark,
  },
  containerDark: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.borderCardDark,
  },
  containerLight: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.borderCardLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  titleDark: {
    color: theme.colors.textOnDark,
  },
  titleLight: {
    color: theme.colors.textOnLight,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  subtitleDark: {
    color: theme.colors.muted,
  },
  subtitleLight: {
    color: theme.colors.textOnLight,
  },
  status: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 2,
  },
  statusDark: {
    color: theme.colors.textOnDark,
    opacity: 0.8,
  },
  statusLight: {
    color: theme.colors.textOnLight,
    opacity: 0.85,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amount: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '700',
  },
  amountDark: {
    color: theme.colors.textOnDark,
  },
  amountMuted: {
    color: theme.colors.textSecondary,
  },
  amountMutedDark: {
    color: theme.colors.muted,
  },
  amountLight: {
    color: theme.colors.textOnLight,
  },
  amountMutedLight: {
    color: theme.colors.textSecondary,
  },
});