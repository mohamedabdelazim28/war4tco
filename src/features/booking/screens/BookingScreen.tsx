import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScreenContainer, Button } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

function getNextDays(count: number): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const value = `${y}-${m}-${day}`;
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    out.push({ label, value });
  }
  return out;
}

const DATE_OPTIONS = getNextDays(14);

type Props = UserStackScreenProps<'Booking'>;

export function BookingScreen({ route, navigation }: Props) {
  const { mechanicId } = route.params;
  const [selectedDate, setSelectedDate] = useState<string>(DATE_OPTIONS[0].value);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'You must be signed in to book.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          mechanic_id: mechanicId,
          date: selectedDate,
          time: selectedTime,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }
      navigation.replace('BookingSuccess', { bookingId: data?.id });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Date</Text>
        <View style={styles.chipRow}>
          {DATE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                selectedDate === opt.value && styles.chipSelected,
              ]}
              onPress={() => setSelectedDate(opt.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedDate === opt.value && styles.chipTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.sectionTitle, styles.sectionTitleTop]}>Time</Text>
        <View style={styles.chipRow}>
          {TIME_SLOTS.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.chip,
                selectedTime === time && styles.chipSelected,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedTime === time && styles.chipTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button
          title="Confirm booking"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
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
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.textOnLight,
    marginBottom: theme.spacing.sm,
  },
  sectionTitleTop: {
    marginTop: theme.spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.textOnLight,
  },
  chipTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.typography.subtitle.fontWeight,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
});
