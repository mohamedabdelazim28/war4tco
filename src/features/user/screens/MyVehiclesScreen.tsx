import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, SketchFill } from '../../../components/ui';
import { CartoonVehicleCard } from '../../../components/ui/CartoonVehicleCard';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string | null;
};

type Props = UserStackScreenProps<'MyVehicles'>;

export function MyVehiclesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_vehicles')
        .select('id, make, model, year, license_plate')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVehicles((data ?? []) as Vehicle[]);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  React.useEffect(() => {
    const sub = navigation.addListener('focus', loadVehicles);
    return sub;
  }, [loadVehicles, navigation]);

  function handleDelete(v: Vehicle) {
    Alert.alert(
      'Remove Vehicle',
      `Remove ${v.make} ${v.model} (${v.year})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('user_vehicles').delete().eq('id', v.id);
            loadVehicles();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={c.red} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>My Garage</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddVehicle')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color={c.red} />
            <Text style={styles.addText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
        {vehicles.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="car-off" size={48} color={c.gray} />
            <Text style={styles.emptyText}>No vehicles yet</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddVehicle')}
            >
              <Text style={styles.emptyBtnText}>Add your first vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((v) => (
            <View key={v.id} style={styles.cardWrapper}>
              <View style={styles.cardShadow}>
                <SketchFill />
              </View>
              <View style={styles.card}>
                <CartoonVehicleCard
                  title={`${v.make} ${v.model}`}
                  subtitle={`${v.year}`}
                  licensePlate={v.license_plate ?? '—'}
                  verified={false}
                  onHistoryPress={() => {}}
                  onSchedulePress={() => navigation.navigate('UserTabs', { screen: 'Bookings' })}
                />
                <TouchableOpacity
                  style={styles.trashBtn}
                  onPress={() => handleDelete(v)}
                >
                  <MaterialCommunityIcons name="delete-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: c.charcoal,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.red,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: c.gray,
    marginTop: theme.spacing.md,
  },
  emptyBtn: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: c.red,
    borderRadius: theme.radius.md,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  cardShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    position: 'relative',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  trashBtn: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
});
