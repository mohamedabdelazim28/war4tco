import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ProfileScreenHeaderProps {
  title?: string;
  onEditPress?: () => void;
  style?: ViewStyle;
}

export function ProfileScreenHeader({
  title = 'Profile',
  onEditPress,
  style,
}: ProfileScreenHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {onEditPress ? (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.7}
          accessibilityLabel="Edit profile"
        >
          <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.editButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
