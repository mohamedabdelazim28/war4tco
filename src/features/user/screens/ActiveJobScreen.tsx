import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer, Header, Card, Spinner } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

type RequestRow = {
  id: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  problem_description: string | null;
  mechanic_id: string | null;
  created_at: string;
};

type Props = UserStackScreenProps<'ActiveJob'>;

export function ActiveJobScreen({ navigation, route }: Props) {
  const { requestId } = route.params;
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <ScreenContainer>
        <Header title="Active job" onBackPress={() => navigation.goBack()} />
        <Spinner style={styles.spinner} />
      </ScreenContainer>
    );
  }

  if (error || !request) {
    return (
      <ScreenContainer>
        <Header title="Active job" onBackPress={() => navigation.goBack()} />
        <Text style={styles.error}>{error ?? 'Request not found'}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header title="Active job" onBackPress={() => navigation.goBack()} />
      <Card style={styles.card}>
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
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>
              {request.location_lat.toFixed(5)}, {request.location_lng.toFixed(5)}
            </Text>
          </>
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: theme.spacing.xl,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.muted,
  },
  card: {
    marginTop: theme.spacing.md,
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
