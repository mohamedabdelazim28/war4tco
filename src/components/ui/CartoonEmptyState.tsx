import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

interface CartoonEmptyStateProps {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  message: string;
}

const c = theme.colors.cartoon;

export function CartoonEmptyState({
  icon = 'emoticon-happy-outline',
  title,
  message,
}: CartoonEmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.illustrationShadow}>
        <SketchFill opacity={0.22} />
      </View>
      <View style={styles.illustration}>
        <MaterialCommunityIcons name={icon} size={42} color={c.blue} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: c.cream,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    marginTop: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  illustrationShadow: {
    position: 'absolute',
    top: 22,
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  illustration: {
    width: 74,
    height: 74,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: c.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: c.charcoal,
    textAlign: 'center',
  },
  message: {
    marginTop: theme.spacing.xs,
    ...theme.typography.body,
    color: c.gray,
    textAlign: 'center',
  },
});

export type { CartoonEmptyStateProps };
