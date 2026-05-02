import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { useMechanicLocationUpdates } from '../../../lib/mechanicHelpers';
import { theme } from '../../../theme';
import type { MechanicStackScreenProps } from '../../../types/navigation';

type RequestRow = {
  id: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  problem_description: string | null;
  mechanic_id: string | null;
  created_at: string;
};

type Props = MechanicStackScreenProps<'ActiveJob'>;

export function MechanicActiveJobScreen({ route }: Props) {
  const { requestId } = route.params;
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useMechanicLocationUpdates();

  useEffect(() => {
    let cancelled = false;

    async function fetchRequest() {
      const { data, error: err } = await supabase
        .from('requests')
        .select('id, status, location_lat, location_lng, problem_description, mechanic_id, created_at')
        .eq('id', requestId)
        .single();

      if (cancelled) return;
      if (err) {
        setError(err.message);
        setRequest(null);
      } else {
        setRequest(data as RequestRow);
      }
      setLoading(false);
    }

    fetchRequest();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
      </Screen>
    );
  }

  if (error || !request) {
    return (
      <Screen>
        <Text style={styles.error}>{error ?? 'Request not found'}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Active job</Text>
      <Text style={styles.label}>Status</Text>
      <Text style={styles.value}>{request.status}</Text>
      {request.problem_description ? (
        <>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{request.problem_description}</Text>
        </>
      ) : null}
      {request.location_lat != null && request.location_lng != null && (
        <>
          <Text style={styles.label}>Customer location</Text>
          <Text style={styles.value}>
            {request.location_lat.toFixed(5)}, {request.location_lng.toFixed(5)}
          </Text>
        </>
      )}
      <Text style={styles.label}>Created</Text>
      <Text style={styles.value}>{new Date(request.created_at).toLocaleString()}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 48,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.muted,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.md,
  },
  value: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
});
