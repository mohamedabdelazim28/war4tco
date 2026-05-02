import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

interface StoreFeaturedBannerProps {
  badge?: string;
  title: string;
  description?: string;
  buttonText?: string;
  imageUri?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function StoreFeaturedBanner({
  badge = 'Limited Offer',
  title,
  description,
  buttonText = 'Shop Now',
  imageUri,
  onPress,
  style,
}: StoreFeaturedBannerProps) {
  const content = (
    <>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (imageUri) {
    return (
      <View style={[styles.wrapper, style]}>
        <ImageBackground
          source={{ uri: imageUri }}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          {content}
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, styles.wrapperSolid, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    minHeight: 160,
    ...theme.shadow.card,
  },
  wrapperSolid: {
    backgroundColor: theme.colors.surfaceDark,
  },
  background: {
    minHeight: 160,
    justifyContent: 'center',
  },
  backgroundImage: {
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surfaceDark,
    opacity: 0.85,
  },
  content: {
    padding: theme.spacing.md,
    minHeight: 160,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: `${theme.colors.primary}33`,
    marginBottom: theme.spacing.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    maxWidth: 180,
    marginBottom: theme.spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  buttonText: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '700',
  },
});
