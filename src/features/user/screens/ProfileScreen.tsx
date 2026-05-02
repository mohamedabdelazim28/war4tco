import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, SketchFill } from '../../../components/ui';
import { CartoonStoreHeader } from '../../../components/ui/CartoonStoreHeader';
import { CartoonProfileAvatar } from '../../../components/ui/CartoonProfileAvatar';
import { CartoonVehicleCard } from '../../../components/ui/CartoonVehicleCard';
import { CartoonMenuRow } from '../../../components/ui/CartoonMenuRow';
import { useAuth } from '../../../hooks/useAuth';
import { authStore } from '../../../store';
import { supabase } from '../../../lib/supabase';
import { fetchProfile, authUserFromSession } from '../../../lib/authHelpers';
import { theme } from '../../../theme';
import type { UserTabScreenProps } from '../../../types/navigation';

type Props = UserTabScreenProps<'Profile'>;

const c = theme.colors.cartoon;

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string | null;
};

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  is_default: boolean;
};

const APP_VERSION = '2.4.0 (Build 392)';

export function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [defaultCard, setDefaultCard] = useState<PaymentMethod | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activityCount, setActivityCount] = useState<number | null>(null);
  const [bookingsCount, setBookingsCount] = useState<number | null>(null);

  const loadVehicles = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('user_vehicles')
        .select('id, make, model, year, license_plate')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      setVehicles((data ?? []) as Vehicle[]);
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicle(false);
    }
  }, [user?.id]);

  const loadDefaultCard = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('user_payment_methods')
        .select('id, brand, last4, is_default')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();
      setDefaultCard(data as PaymentMethod | null);
    } catch {
      setDefaultCard(null);
    }
  }, [user?.id]);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [reqRes, bookRes] = await Promise.all([
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setActivityCount(reqRes.count ?? 0);
      setBookingsCount(bookRes.count ?? 0);
    } catch {
      setActivityCount(0);
      setBookingsCount(0);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadVehicles();
    loadDefaultCard();
    loadStats();
  }, [loadVehicles, loadDefaultCard, loadStats]);

  React.useEffect(() => {
    const sub = navigation.addListener('focus', () => {
      loadVehicles();
      loadDefaultCard();
      loadStats();
    });
    return sub;
  }, [loadVehicles, loadDefaultCard, loadStats, navigation]);

  async function handleEdit() {
    navigation.getParent()?.navigate('EditProfile');
  }

  async function handleCamera() {
    if (!user?.id) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingPhoto(true);
    try {
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = urlData?.publicUrl ?? null;
      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      const profile = await fetchProfile(user.id);
      const { data: { session } } = await supabase.auth.getSession();
      if (session && profile) {
        const authUser = authUserFromSession(session, profile);
        authStore.getState().setSession(session, profile, authUser);
      }
    } catch (e: unknown) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not update photo.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleAddVehicle() {
    navigation.getParent()?.navigate('MyVehicles');
  }

  function handlePaymentMethods() {
    navigation.getParent()?.navigate('PaymentMethods');
  }

  function handleServiceHistory() {
    navigation.navigate('Bookings');
  }

  function handleSettings() {
    navigation.getParent()?.navigate('Settings');
  }

  function handleHelpSupport() {
    Alert.alert('Help & Support', 'Contact us at support@autoassist.com');
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  const displayName = user?.name ?? 'Alex Johnson';
  const displayEmail = user?.email ?? 'alex.j@example.com';
  const firstVehicle = vehicles[0];
  const paymentSubtitle = defaultCard ? `${defaultCard.brand} ending in ${defaultCard.last4}` : 'Add a payment method';

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Decorative background blobs */}
      <View style={styles.blobRed} />
      <View style={styles.blobPurple} />
      <View style={styles.blobMint} />

      {/* Header */}
      <CartoonStoreHeader
        userName={displayName.split(' ')[0]}
        notificationCount={0}
        onNotificationPress={() => {}}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Section */}
        <View style={styles.identity}>
          {uploadingPhoto ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="large" color={c.red} />
            </View>
          ) : null}
          <CartoonProfileAvatar
            avatarUrl={user?.avatar_url}
            onCameraPress={handleCamera}
          />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="crown" size={14} color={c.yellow} />
            <Text style={styles.badgeText}>Premium Member</Text>
          </View>

          {/* Edit Profile Button */}
          <View style={styles.editButtonWrapper}>
            <View style={styles.editButtonShadow}>
              <SketchFill />
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="pencil" size={16} color={c.red} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statWrapper}>
            <View style={styles.statShadow}>
              <SketchFill />
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.blueBg }]}>
                <MaterialCommunityIcons name="car" size={22} color={c.blue} />
              </View>
              <Text style={styles.statValue}>{loadingVehicle ? '—' : vehicles.length}</Text>
              <Text style={styles.statLabel}>Vehicle</Text>
            </View>
          </View>
          <View style={styles.statWrapper}>
            <View style={styles.statShadow}>
              <SketchFill />
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.mintBg }]}>
                <MaterialCommunityIcons name="clipboard-list" size={22} color={c.mint} />
              </View>
              <Text style={styles.statValue}>{activityCount === null ? '—' : activityCount}</Text>
              <Text style={styles.statLabel}>Activity</Text>
            </View>
          </View>
          <View style={styles.statWrapper}>
            <View style={styles.statShadow}>
              <SketchFill />
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: c.yellowBg }]}>
                <MaterialCommunityIcons name="calendar-check" size={22} color={c.yellow} />
              </View>
              <Text style={styles.statValue}>{bookingsCount === null ? '—' : bookingsCount}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
          </View>
        </View>

        {/* My Garage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Garage</Text>
            <TouchableOpacity onPress={handleAddVehicle} activeOpacity={0.7}>
              <View style={styles.addNewButton}>
                <MaterialCommunityIcons name="plus" size={16} color={c.red} />
                <Text style={styles.sectionLink}>Add New</Text>
              </View>
            </TouchableOpacity>
          </View>
          {firstVehicle ? (
            <CartoonVehicleCard
              title={`${firstVehicle.make} ${firstVehicle.model}`}
              subtitle={String(firstVehicle.year)}
              licensePlate={firstVehicle.license_plate ?? '—'}
              verified={false}
              onHistoryPress={() => navigation.navigate('Bookings')}
              onSchedulePress={() => navigation.navigate('Bookings')}
            />
          ) : (
            <TouchableOpacity
              style={styles.emptyGarageCard}
              onPress={handleAddVehicle}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="car-side" size={40} color={c.gray} />
              <Text style={styles.emptyGarageText}>Add your first vehicle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <View style={styles.menuCardWrapper}>
            <View style={styles.menuCardShadow}>
              <SketchFill />
            </View>
            <View style={styles.menuCard}>
              <CartoonMenuRow
                icon="credit-card"
                iconBgColor={c.blueBg}
                iconColor={c.blue}
                title="Payment Methods"
                subtitle={paymentSubtitle}
                onPress={handlePaymentMethods}
              />
              <View style={styles.menuDivider} />
              <CartoonMenuRow
                icon="wrench"
                iconBgColor={c.orangeBg}
                iconColor={c.orange}
                title="Service History"
                subtitle="View all past repairs"
                onPress={handleServiceHistory}
              />
              <View style={styles.menuDivider} />
              <CartoonMenuRow
                icon="cog"
                iconBgColor={c.purpleBg}
                iconColor={c.purple}
                title="Settings"
                subtitle="Notifications, Privacy"
                onPress={handleSettings}
              />
              <View style={styles.menuDivider} />
            <CartoonMenuRow
              icon="help-circle"
              iconBgColor={c.mintBg}
              iconColor={c.mint}
              title="Help & Support"
              subtitle="FAQ, Contact us"
              onPress={handleHelpSupport}
            />
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <View style={styles.signOutWrapper}>
            <View style={styles.signOutShadow}>
              <SketchFill />
            </View>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <View style={styles.signOutContent}>
                <View style={styles.signOutIconBox}>
                  <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.signOutText}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
  },
  // Decorative blobs
  blobRed: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${c.red}12`,
  },
  blobPurple: {
    position: 'absolute',
    top: '40%',
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${c.purple}12`,
  },
  blobMint: {
    position: 'absolute',
    bottom: '20%',
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${c.mint}12`,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight,
  },
  // Identity
  identity: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: 0,
    right: 0,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: c.charcoal,
    marginTop: 14,
    lineHeight: 32,
  },
  email: {
    fontSize: 14,
    fontWeight: '600',
    color: c.gray,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: c.yellowBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: c.yellow,
    letterSpacing: 0.5,
  },
  // Edit button with offset shadow
  editButtonWrapper: {
    position: 'relative',
    marginTop: 16,
  },
  editButtonShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: c.red,
  },
  // Stats with offset shadows
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  statWrapper: {
    flex: 1,
    position: 'relative',
  },
  statShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: c.charcoal,
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: c.gray,
    marginTop: 2,
  },
  // Sections
  section: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: c.charcoal,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${c.red}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: c.red,
  },
  emptyGarageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    borderStyle: 'dashed',
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGarageText: {
    fontSize: 14,
    fontWeight: '600',
    color: c.gray,
    marginTop: theme.spacing.sm,
  },
  // Menu card with offset shadow
  menuCardWrapper: {
    position: 'relative',
  },
  menuCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 24,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  menuDivider: {
    height: 1,
    backgroundColor: c.creamDark,
    marginHorizontal: 16,
  },
  // Sign Out with offset shadow
  signOutSection: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  signOutWrapper: {
    position: 'relative',
  },
  signOutShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  signOutButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: c.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signOutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  version: {
    fontSize: 11,
    fontWeight: '600',
    color: c.gray,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
