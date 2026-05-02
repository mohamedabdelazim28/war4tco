import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { ScreenContainer, HomeHeader, Button, Card, Spinner, FloatingIconsBackground } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store';
import { theme } from '../../../theme';
import type { Booking } from '../../../types';
import type { UserTabScreenProps } from '../../../types/navigation';

type BookingWithMechanic = Booking & { mechanicName?: string };
type Props = UserTabScreenProps<'Bookings'>;

const PLACEHOLDER_USER = { name: 'Alex Mitchell', avatarUri: undefined as string | undefined };

export function BookingsScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const [bookings, setBookings] = useState<BookingWithMechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function fetchBookings() {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('id, user_id, mechanic_id, date, time, status, created_at')
        .eq('user_id', user!.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (cancelled) return;
      if (error) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const bookings = bookingsData ?? [];
      if (bookings.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const mechanicIds = [...new Set(bookings.map((b) => b.mechanic_id))];
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, user_id, workshop_name')
        .in('id', mechanicIds);

      if (cancelled) return;
      const userIds = (mechanicsData ?? []).map((m) => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (cancelled) return;
      const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p.name]));
      const mechanicMap = new Map(
        (mechanicsData ?? []).map((m) => [
          m.id,
          m.workshop_name || profileMap.get(m.user_id) || 'Mechanic',
        ])
      );

      const enriched = bookings.map((b) => ({
        ...b,
        mechanicName: mechanicMap.get(b.mechanic_id) ?? 'Mechanic',
      }));
      setBookings(enriched);
      setLoading(false);
    }

    fetchBookings();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function handleNewBooking() {
    const stack = navigation.getParent();
    if (stack && 'navigate' in stack) {
      (stack as { navigate: (name: string) => void }).navigate('MechanicList');
    }
  }

  function formatDate(d: string) {
    const date = new Date(d + 'Z');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  const displayUser = {
    name: user?.name ?? PLACEHOLDER_USER.name,
    avatarUri: PLACEHOLDER_USER.avatarUri,
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <FloatingIconsBackground />
        <HomeHeader user={displayUser} notifications={{ unread: false }} onNotificationPress={() => {}} light />
        <Spinner style={styles.centered} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <FloatingIconsBackground />
      <HomeHeader user={displayUser} notifications={{ unread: false }} onNotificationPress={() => {}} light />
      <Text style={styles.pageTitle}>My bookings</Text>
      <Text style={styles.pageSubtitle}>Schedule and manage your appointments</Text>
      <Button
        title="Book a mechanic"
        onPress={handleNewBooking}
        style={styles.topButton}
      />
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No bookings yet. Tap "Book a mechanic" to schedule.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.cardItem}>
            <Text style={styles.date}>{formatDate(item.date)} at {item.time}</Text>
            <Text style={styles.mechanic}>{item.mechanicName ?? 'Mechanic'}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
  },
  pageTitle: {
    ...theme.typography.title,
    color: theme.colors.textOnLight,
    marginBottom: theme.spacing.xs,
  },
  pageSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
  },
  topButton: {
    marginBottom: theme.spacing.lg,
  },
  list: {
    paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight,
  },
  cardItem: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  date: {
    ...theme.typography.body,
    fontWeight: theme.typography.subtitle.fontWeight,
    color: theme.colors.textOnLight,
  },
  mechanic: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  status: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  centered: {
    marginTop: theme.spacing.xl,
  },
});
