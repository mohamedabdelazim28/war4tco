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

export interface HomeHeaderUser {
  name: string;
  avatarUri?: string;
}

export interface HomeHeaderNotifications {
  unread: boolean;
}

interface HomeHeaderProps {
  user: HomeHeaderUser;
  notifications?: HomeHeaderNotifications;
  onNotificationPress?: () => void;
  light?: boolean;
  style?: ViewStyle;
}

export function HomeHeader({
  user,
  notifications = { unread: false },
  onNotificationPress,
  light = false,
  style,
}: HomeHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.userRow}>
        <View style={styles.avatarWrapper}>
          {user.avatarUri ? (
            <Image
              source={{ uri: user.avatarUri }}
              style={styles.avatar}
              accessibilityLabel="User profile"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={light ? theme.colors.textOnLight : theme.colors.surfaceDarkLight}
              />
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.greeting}>
          <Text style={[styles.welcome, light && styles.welcomeLight]}>Welcome back,</Text>
          <Text style={[styles.name, light && styles.nameLight]}>{user.name}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.notificationButton, light && styles.notificationButtonLight]}
        onPress={onNotificationPress}
        activeOpacity={0.7}
        accessibilityLabel="Notifications"
      >
        <MaterialCommunityIcons
          name="bell-outline"
          size={24}
          color={light ? theme.colors.textOnLight : theme.colors.gray}
        />
        {notifications.unread && <View style={styles.badge} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}33`,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceDarkLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${theme.colors.primary}33`,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.green,
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
  },
  greeting: {
    gap: 2,
  },
  welcome: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray,
    fontWeight: '500',
  },
  welcomeLight: {
    color: theme.colors.textOnLight,
  },
  name: {
    ...theme.typography.title,
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.xl,
    color: theme.colors.text,
  },
  nameLight: {
    color: theme.colors.textOnLight,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceDarkLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationButtonLight: {
    backgroundColor: theme.colors.lightAccent,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.red,
    borderWidth: 1,
    borderColor: theme.colors.surfaceDark,
  },
});
