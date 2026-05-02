import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  style?: ViewStyle;
}

export function Header({ title, onBackPress, style }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {onBackPress ? (
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    minHeight: 44,
  },
  backButton: {
    marginRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
    fontWeight: theme.typography.subtitle.fontWeight,
  },
  title: {
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    fontWeight: theme.typography.title.fontWeight,
    color: theme.colors.text,
    flex: 1,
  },
});
