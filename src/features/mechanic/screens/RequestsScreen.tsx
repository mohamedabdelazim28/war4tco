import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '../../../components/ui';
import { theme } from '../../../theme';

export function RequestsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Requests</Text>
      <Text style={styles.role}>Mechanic</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  role: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
});
