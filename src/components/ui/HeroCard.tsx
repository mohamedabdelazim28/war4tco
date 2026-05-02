import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface HeroCardProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  buttonText: string;
  onPress: () => void;
  badge?: string;
  backgroundImageUri?: string;
  loading?: boolean;
  lightBackground?: boolean;
  style?: ViewStyle;
}

export function HeroCard({
  title,
  description,
  icon,
  buttonText,
  onPress,
  badge,
  backgroundImageUri,
  loading = false,
  lightBackground = false,
  style,
}: HeroCardProps) {
  const content = (
    <>
      {badge ? (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name={icon}
          size={28}
          color={lightBackground ? theme.colors.primary : theme.colors.text}
        />
      </View>
      <Text style={[styles.title, lightBackground && styles.titleLight]}>{title}</Text>
      <Text style={[styles.description, lightBackground && styles.descriptionLight]} numberOfLines={2}>
        {description}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={lightBackground ? theme.colors.primary : theme.colors.text} />
        ) : (
          <>
            <Text style={[styles.buttonText, lightBackground && styles.buttonTextLight]}>{buttonText}</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color={theme.colors.white}
          />
          </>
        )}
      </Pressable>
    </>
  );

  const wrapperStyle = [styles.shadowWrapper, style];
  const cardStyle = [styles.card, lightBackground && styles.cardLight];

  if (backgroundImageUri) {
    return (
      <View style={wrapperStyle}>
        <View style={styles.shadowOffset} />
        <View style={cardStyle}>
          <ImageBackground
            source={{ uri: backgroundImageUri }}
            style={styles.backgroundImage}
            imageStyle={styles.backgroundImageStyle}
          >
            <View style={styles.overlay} />
            <View style={styles.primaryOverlay} />
            <View style={styles.content}>{content}</View>
          </ImageBackground>
        </View>
      </View>
    );
  }

  return (
    <View style={wrapperStyle}>
      <View style={styles.shadowOffset} />
      <View style={[cardStyle, !lightBackground && styles.gradientOnly]}>
        <View style={styles.content}>{content}</View>
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
    top: 9,
    left: 8,
    right: -8,
    bottom: -9,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  card: {
    width: '100%',
    height: 254,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    marginTop: 5,
    borderColor: theme.colors.borderCardDark,
  },
  gradientOnly: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.borderCardDark,
  },
  cardLight: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
  },
  titleLight: {
    color: theme.colors.textOnLight,
  },
  descriptionLight: {
    color: theme.colors.textOnLight,
  },
  buttonTextLight: {
    color: theme.colors.white,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backgroundImageStyle: {
    opacity: 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  primaryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${theme.colors.primary}1A`,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.red}1A`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: `${theme.colors.red}33`,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.red,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    fontSize: 24,
    lineHeight: 30,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderBlockColor: theme.colors.border,
    borderWidth: 1.9,
    borderColor: theme.colors.border,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    fontWeight: '700',
  },
});
