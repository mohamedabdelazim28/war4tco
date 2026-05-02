import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import type { MechanicTabParamList } from '../../../types/navigation';

type MechanicTabKey = keyof MechanicTabParamList;

interface MechanicTabPaginatorProps {
  currentTab: MechanicTabKey;
  onNavigate: (tab: MechanicTabKey) => void;
}

const ORDER: MechanicTabKey[] = ['Requests', 'Jobs', 'Bookings', 'Profile'];
const LABELS: Record<MechanicTabKey, string> = {
  Requests: 'Nearby Requests',
  Jobs: 'Jobs',
  Bookings: 'Bookings',
  Profile: 'Profile',
};

export function MechanicTabPaginator({ currentTab, onNavigate }: MechanicTabPaginatorProps) {
  const index = ORDER.indexOf(currentTab);
  const prev = index > 0 ? ORDER[index - 1] : null;
  const next = index < ORDER.length - 1 ? ORDER[index + 1] : null;

  return (
    <View style={styles.row}>
      <Pressable
        disabled={!prev}
        onPress={() => prev && onNavigate(prev)}
        style={[styles.arrow, !prev && styles.arrowDisabled]}
      >
        <MaterialCommunityIcons name="chevron-left" size={22} color={theme.colors.cartoon.charcoal} />
      </Pressable>
      <Text style={styles.title}>{LABELS[currentTab]}</Text>
      <Pressable
        disabled={!next}
        onPress={() => next && onNavigate(next)}
        style={[styles.arrow, !next && styles.arrowDisabled]}
      >
        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.cartoon.charcoal} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: theme.colors.cartoon.charcoal,
  },
});

