import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer, SketchFill } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { MechanicWithProfile } from '../../../types';
import type { UserStackScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;

type Props = UserStackScreenProps<'MechanicList'>;

export function MechanicListScreen({ navigation }: Props) {
  const [mechanics, setMechanics] = useState<MechanicWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMechanics() {
      const { data: mechanicsData, error: mechanicsError } = await supabase
        .from('mechanics')
        .select('id, user_id, workshop_name, experience_years, rating, availability_status, created_at, updated_at');

      if (cancelled) return;
      if (mechanicsError) {
        setError(mechanicsError.message);
        setLoading(false);
        return;
      }
      if (!mechanicsData?.length) {
        setMechanics([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(mechanicsData.map((m) => m.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (cancelled) return;
      const profileMap = new Map(
        (profilesData || []).map((p) => [p.id, { name: p.name, email: p.email }])
      );
      const withProfile: MechanicWithProfile[] = mechanicsData.map((m) => ({
        ...m,
        profile: profileMap.get(m.user_id) ?? null,
      }));
      setMechanics(withProfile);
      setLoading(false);
    }

    fetchMechanics();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectMechanic(mechanicId: string) {
    navigation.navigate('MechanicProfile', { mechanicId });
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={c.red} style={styles.centered} />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <Text style={styles.error}>{error}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Select a mechanic</Text>
      <Text style={styles.subtitle}>Tap to view profile and book</Text>
      <FlatList
        data={mechanics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No mechanics available.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          // cycle through colors for variety
          const bgColors = [c.blueBg, c.yellowBg, c.mintBg, c.purpleBg, c.orangeBg, c.creamDark];
          const borderColors = [c.blue, c.yellow, c.mint, c.purple, c.orange, c.red];
          const cardBg = bgColors[index % bgColors.length];
          const badgeColor = borderColors[index % borderColors.length];

          return (
            <TouchableOpacity
              onPress={() => handleSelectMechanic(item.id)}
              activeOpacity={0.8}
              style={styles.cardWrapper}
            >
              <View style={styles.cardShadow}>
                <SketchFill />
              </View>
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.workshopName}>
                    {item.profile?.name || item.workshop_name || 'Mechanic'}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>
                      {item.rating != null ? `⭐ ${Number(item.rating).toFixed(1)}` : '⭐ New'}
                    </Text>
                  </View>
                </View>

                {item.workshop_name && item.workshop_name !== item.profile?.name && (
                  <Text style={styles.metaWorkshop}>{item.workshop_name}</Text>
                )}

                <View style={styles.detailsRow}>
                  <Text style={styles.meta}>
                    {item.experience_years != null ? `${item.experience_years} years exp.` : 'Exp. not specified'}
                  </Text>
                  <View style={[styles.statusDot, { backgroundColor: item.availability_status === 'available' ? c.mint : item.availability_status === 'busy' ? c.yellow : c.gray }]} />
                  <Text style={styles.meta}>
                    {item.availability_status ? item.availability_status.charAt(0).toUpperCase() + item.availability_status.slice(1) : 'Offline'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: c.charcoal,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.gray,
    marginTop: 4,
    marginBottom: theme.spacing.xl,
  },
  list: {
    paddingBottom: theme.spacing.xl * 2,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  cardShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  workshopName: {
    fontSize: 18,
    fontWeight: '800',
    color: c.charcoal,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.charcoal,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: c.charcoal,
  },
  metaWorkshop: {
    fontSize: 14,
    fontWeight: '600',
    color: c.charcoal,
    marginBottom: theme.spacing.xs,
    opacity: 0.8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  meta: {
    fontSize: 13,
    fontWeight: '700',
    color: c.gray,
  },
  empty: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: c.gray,
  },
  error: {
    fontSize: 16,
    fontWeight: '700',
    color: c.red,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  centered: {
    marginTop: theme.spacing.xl,
  },
});
