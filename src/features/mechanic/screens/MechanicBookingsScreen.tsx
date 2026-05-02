import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ScreenContainer,
  CartoonEmptyState,
  CartoonActionButton,
  FloatingIconsBackground,
  SketchFill,
  Spinner,
} from '../../../components/ui';
import { theme } from '../../../theme';
import {
  getMechanicId,
  fetchMechanicBookings,
  updateBookingStatus,
  type MechanicBooking,
} from '../../../lib/mechanicHelpers';

const c = theme.colors.cartoon;

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: c.yellowBg, text: c.orange, label: 'Pending' },
  confirmed: { bg: c.mintBg, text: c.mint, label: 'Confirmed' },
  completed: { bg: c.creamDark, text: c.gray, label: 'Completed' },
  cancelled: { bg: `${c.red}15`, text: c.red, label: 'Cancelled' },
};

export function MechanicBookingsScreen() {
  const [bookings, setBookings] = useState<MechanicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mechanicId, setMechanicId] = useState<string | null>(null);

  useEffect(() => {
    getMechanicId().then(setMechanicId);
  }, []);

  const loadBookings = useCallback(async () => {
    if (!mechanicId) return;
    const data = await fetchMechanicBookings(mechanicId);
    setBookings(data);
    setLoading(false);
  }, [mechanicId]);

  useEffect(() => {
    if (mechanicId) {
      loadBookings();
    }
  }, [mechanicId, loadBookings]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [loadBookings]);

  async function handleConfirm(bookingId: string) {
    const success = await updateBookingStatus(bookingId, 'confirmed');
    if (success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b)),
      );
    }
  }

  async function handleCancel(bookingId: string) {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          const success = await updateBookingStatus(bookingId, 'cancelled');
          if (success) {
            setBookings((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)),
            );
          }
        },
      },
    ]);
  }

  async function handleComplete(bookingId: string) {
    const success = await updateBookingStatus(bookingId, 'completed');
    if (success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b)),
      );
    }
  }

  function formatDate(d: string) {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatTime(t: string) {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <FloatingIconsBackground />
        <Spinner style={styles.centered} />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <FloatingIconsBackground />
        <Text style={styles.error}>{error}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <FloatingIconsBackground />

      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <Text style={styles.headerSubtitle}>{bookings.length} total</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={c.red}
          />
        }
        ListEmptyComponent={
          <CartoonEmptyState
            icon="calendar-blank-outline"
            title="No bookings yet"
            message="Bookings from customers will appear here."
          />
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
          return (
            <View style={styles.cardWrap}>
              <View style={styles.cardShadow}>
                <SketchFill />
              </View>
              <View style={styles.cardItem}>
                {/* Header: Customer name + status badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.customerInfo}>
                    <MaterialCommunityIcons name="account-circle" size={28} color={c.blue} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerName} numberOfLines={1}>
                        {item.customerName}
                      </Text>
                      {item.customerPhone && (
                        <Text style={styles.customerPhone}>{item.customerPhone}</Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {statusStyle.label}
                    </Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View style={styles.dateRow}>
                  <View style={styles.dateItem}>
                    <MaterialCommunityIcons name="calendar" size={16} color={c.blue} />
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                  </View>
                  <View style={styles.dateItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={c.purple} />
                    <Text style={styles.dateText}>{formatTime(item.time)}</Text>
                  </View>
                </View>

                {/* Actions based on status */}
                {item.status === 'pending' && (
                  <View style={styles.actionsRow}>
                    <View style={{ flex: 1 }}>
                      <CartoonActionButton
                        label="Confirm"
                        variant="accept"
                        icon="check-circle-outline"
                        onPress={() => handleConfirm(item.id)}
                        fullWidth
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <CartoonActionButton
                        label="Cancel"
                        variant="reject"
                        icon="close-circle-outline"
                        onPress={() => handleCancel(item.id)}
                        fullWidth
                      />
                    </View>
                  </View>
                )}
                {item.status === 'confirmed' && (
                  <View style={styles.actionsRow}>
                    <View style={{ flex: 1 }}>
                      <CartoonActionButton
                        label="Mark Done"
                        variant="accept"
                        icon="check-all"
                        onPress={() => handleComplete(item.id)}
                        fullWidth
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <CartoonActionButton
                        label="Cancel"
                        variant="reject"
                        icon="close-circle-outline"
                        onPress={() => handleCancel(item.id)}
                        fullWidth
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md + 4,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: c.charcoal,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: c.gray,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: theme.spacing.md + 4,
    paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight,
  },
  cardWrap: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  cardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  cardItem: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: c.charcoal,
  },
  customerPhone: {
    ...theme.typography.caption,
    color: c.gray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: c.charcoal,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  centered: {
    marginTop: theme.spacing.xl,
  },
});
