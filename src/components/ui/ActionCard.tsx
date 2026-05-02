import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  bgColor: string;
  onPress: () => void;
  lightBackground?: boolean;
  style?: ViewStyle;
}

export function ActionCard({
  title,
  subtitle,
  icon,
  bgColor,
  onPress,
  lightBackground = false,
  style,
}: ActionCardProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.shadowWrapper}>
        <View style={styles.shadowOffset} />
        <Pressable
          style={({ pressed }) => [
            styles.card,
            lightBackground && styles.cardLight,
            pressed && (lightBackground ? styles.cardLightPressed : styles.cardPressed),
          ]}
          onPress={onPress}
        >
          <View style={[styles.iconWrapper, { backgroundColor: `${bgColor}33` }]}>
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={bgColor}
            />
          </View>
          <Text style={[styles.title, lightBackground && styles.titleLight]}>{title}</Text>
          <Text style={[styles.subtitle, lightBackground && styles.subtitleLight]}>{subtitle}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    margin:0,
    padding:0,
  },
  shadowWrapper: {
    width: '96.5%',
    position: 'relative',
  },
  shadowOffset: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  card: {
    flex: 1,
   
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderCardDark,
    minHeight: 120,
    
  },
  cardPressed: {
    opacity: 0.95,
    backgroundColor: theme.colors.surfaceDarkLight,
  },
  cardLight: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.borderCardLight,
  },
  cardLightPressed: {
    opacity: 0.95,
    backgroundColor: theme.colors.lightAccent,
  },
  titleLight: {
    color: theme.colors.textOnLight,
  },
  subtitleLight: {
    color: theme.colors.textOnLight,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    
  },
   
  title: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});
