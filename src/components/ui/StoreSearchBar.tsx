import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface StoreSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  light?: boolean;
  style?: ViewStyle;
}

export function StoreSearchBar({
  placeholder = 'Search engine oil, tires, brakes...',
  value,
  onChangeText,
  light = false,
  style,
}: StoreSearchBarProps) {
  return (
    <View style={[styles.container, light && styles.containerLight, style]}>
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={light ? theme.colors.muted : theme.colors.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, light && styles.inputLight]}
        placeholder={placeholder}
        placeholderTextColor={light ? theme.colors.muted : theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: theme.spacing.md,
  },
  containerLight: {
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  icon: {
    position: 'absolute',
    left: theme.spacing.md,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    padding: 0,
  },
  inputLight: {
    color: theme.colors.textOnLight,
  },
});
