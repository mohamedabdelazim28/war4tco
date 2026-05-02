import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ScreenContainer, Button } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { MechanicWithProfile } from '../../../types';
import type { UserStackScreenProps } from '../../../types/navigation';

type Props = UserStackScreenProps<'MechanicProfile'>;

export function MechanicProfileScreen({ route, navigation }: Props) {
  const { mechanicId } = route.params;
  const [mechanic, setMechanic] = useState<MechanicWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMechanic() {
      const { data: mechanicData, error: mechanicError } = await supabase
        .from('mechanics')
        .select('id, user_id, workshop_name, experience_years, rating, availability_status, created_at, updated_at')
        .eq('id', mechanicId)
        .single();

      if (cancelled) return;
      if (mechanicError || !mechanicData) {
        setError(mechanicError?.message ?? 'Mechanic not found');
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', mechanicData.user_id)
        .single();

      if (cancelled) return;
      setMechanic({
        ...mechanicData,
        profile: profileData ? { name: profileData.name, email: profileData.email } : null,
      });
      setLoading(false);
    }

    fetchMechanic();
    return () => {
      cancelled = true;
    };
  }, [mechanicId]);

  function handleBook() {
    navigation.navigate('Booking', { mechanicId });
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />
      </ScreenContainer>
    );
  }

  if (error || !mechanic) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <Text style={styles.error}>{error ?? 'Not found'}</Text>
      </ScreenContainer>
    );
  }

  const displayName = mechanic.workshop_name || mechanic.profile?.name || 'Mechanic';

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{displayName}</Text>
        {mechanic.workshop_name && mechanic.profile?.name && (
          <Text style={styles.subtitle}>{mechanic.profile.name}</Text>
        )}
        {mechanic.rating != null && (
          <Text style={styles.rating}>Rating: {Number(mechanic.rating).toFixed(1)}</Text>
        )}
        {mechanic.experience_years != null && (
          <Text style={styles.meta}>{mechanic.experience_years} years experience</Text>
        )}
        {mechanic.profile?.email && (
          <Text style={styles.meta}>{mechanic.profile.email}</Text>
        )}
        <Button
          title="Book appointment"
          onPress={handleBook}
          style={styles.button}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
  },
  scroll: {
    paddingBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textOnLight,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  rating: {
    ...theme.typography.body,
    color: theme.colors.textOnLight,
    marginTop: theme.spacing.md,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  centered: {
    marginTop: theme.spacing.xl,
  },
});
