import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  bgColor?: string;
  light?: boolean;
  style?: ViewStyle;
}

export function PromoBanner({
  title,
  subtitle,
  icon,
  bgColor,
  light = false,
  style,
}: PromoBannerProps) {
  const backgroundColor = light ? theme.colors.white : (bgColor ?? theme.colors.indigo);
  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.shadowOffset} />
      <View style={[styles.container, { backgroundColor }, light && styles.containerLight]}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, light && styles.titleLight]}>{title}</Text>
          <Text style={[styles.subtitle, light && styles.subtitleLight]}>{subtitle}</Text>
        </View>
        <View style={[styles.iconCircle, light && styles.iconCircleLight]}>
          <MaterialCommunityIcons
            name={icon}
            size={28}
            color={light ? theme.colors.primary : theme.colors.white}
          />
        </View>
        {!light && <View style={styles.blob} />}
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
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderCardDark,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 100,
  },
  containerLight: {
    borderColor: theme.colors.borderCardLight,
  },
  textBlock: {
    flex: 1,
    zIndex: 1,
  },
  title: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.lightAccent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.lg,
    lineHeight: 22,
    color: theme.colors.white,
    fontWeight: '700',
  },
  titleLight: {
    color: theme.colors.primary,
  },
  subtitleLight: {
    color: theme.colors.textOnLight,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconCircleLight: {
    backgroundColor: theme.colors.lightAccent,
  },
  blob: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}4D`,
  },
});
