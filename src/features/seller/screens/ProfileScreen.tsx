import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, SketchFill, CartoonProfileAvatar, CartoonMenuRow } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { getSellerIdForUser, getSellerRow, fetchSellerStats, type SellerStats, type SellerRow } from '../../../lib/sellerHelpers';
import { theme } from '../../../theme';
import type { SellerTabScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;
const APP_VERSION = '2.4.0 (Build 392)';

type Props = SellerTabScreenProps<'Profile'>;

export function SellerProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [sellerRow, setSellerRow] = useState<SellerRow | null>(null);
  const [stats, setStats] = useState<SellerStats>({ totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.name ?? 'Seller Store';
  const displayEmail = user?.email ?? 'seller@example.com';
  const shopName = sellerRow?.shop_name ?? displayName;

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const seller = await getSellerRow(user.id);
    setSellerRow(seller);
    if (seller) {
      const s = await fetchSellerStats(seller.id);
      setStats(s);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function handleEdit() {
    navigation.getParent()?.navigate('EditProfile');
  }

  function handleSettings() {
    Alert.alert('Settings', 'Settings screen coming soon.');
  }

  function handleHelpSupport() {
    Alert.alert('Help & Support', 'Contact us at partners@autoassist.com');
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Decorative background blobs */}
      <View style={styles.blobRed} />
      <View style={styles.blobPurple} />
      <View style={styles.blobMint} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.red} />
        }
      >
        {/* Identity Section */}
        <View style={styles.identity}>
          <CartoonProfileAvatar
            avatarUrl={user?.avatar_url}
            onCameraPress={() => Alert.alert('Camera', 'Update photo')}
          />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          {shopName !== displayName && (
            <Text style={styles.shopName}>{shopName}</Text>
          )}
          <View style={styles.badge}>
            <MaterialCommunityIcons name="store" size={14} color={c.yellow} />
            <Text style={styles.badgeText}>Verified Seller</Text>
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

        {/* Stats Row - Real Data */}
        {loading ? (
          <ActivityIndicator size="small" color={c.red} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statWrapper}>
              <View style={styles.statShadow}><SketchFill /></View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: c.blueBg }]}>
                  <MaterialCommunityIcons name="package-variant" size={22} color={c.blue} />
                </View>
                <Text style={styles.statValue}>{stats.totalOrders}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
            </View>
            <View style={styles.statWrapper}>
              <View style={styles.statShadow}><SketchFill /></View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: c.mintBg }]}>
                  <MaterialCommunityIcons name="cube-outline" size={22} color={c.mint} />
                </View>
                <Text style={styles.statValue}>{stats.totalProducts}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
            </View>
            <View style={styles.statWrapper}>
              <View style={styles.statShadow}><SketchFill /></View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: c.yellowBg }]}>
                  <MaterialCommunityIcons name="cash" size={22} color={c.yellow} />
                </View>
                <Text style={styles.statValue}>${stats.totalRevenue.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Setup</Text>
          </View>
          <View style={styles.menuCardWrapper}>
            <View style={styles.menuCardShadow}>
              <SketchFill />
            </View>
            <View style={styles.menuCard}>
              <CartoonMenuRow
                icon="bank"
                iconBgColor={c.blueBg}
                iconColor={c.blue}
                title="Payout Methods"
                subtitle="Manage how you get paid"
                onPress={() => {}}
              />
              <View style={styles.menuDivider} />
              <CartoonMenuRow
                icon="store-cog"
                iconBgColor={c.orangeBg}
                iconColor={c.orange}
                title="Store Settings"
                subtitle="Business hours, policies"
                onPress={() => {}}
              />
              <View style={styles.menuDivider} />
              <CartoonMenuRow
                icon="cog"
                iconBgColor={c.purpleBg}
                iconColor={c.purple}
                title="App Settings"
                subtitle="Notifications, Privacy"
                onPress={handleSettings}
              />
              <View style={styles.menuDivider} />
              <CartoonMenuRow
                icon="help-circle"
                iconBgColor={c.mintBg}
                iconColor={c.mint}
                title="Partner Support"
                subtitle="Contact seller support"
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
  screen: { flex: 1, backgroundColor: c.cream },
  blobRed: { position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: `${c.red}12` },
  blobPurple: { position: 'absolute', top: '40%', right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: `${c.purple}12` },
  blobMint: { position: 'absolute', bottom: '20%', left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: `${c.mint}12` },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight, paddingTop: theme.spacing.xl },
  identity: { alignItems: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md, position: 'relative' },
  name: { fontSize: 26, fontWeight: '900', color: c.charcoal, marginTop: 14, lineHeight: 32 },
  email: { fontSize: 14, fontWeight: '600', color: c.gray, marginTop: 4 },
  shopName: { fontSize: 13, fontWeight: '700', color: c.blue, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: c.yellowBg },
  badgeText: { fontSize: 12, fontWeight: '800', color: c.yellow, letterSpacing: 0.5 },
  editButtonWrapper: { position: 'relative', marginTop: 16 },
  editButtonShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 24, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: theme.colors.borderCardLight },
  editButtonText: { fontSize: 14, fontWeight: '800', color: c.red },
  statsRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, gap: 12, marginBottom: theme.spacing.lg },
  statWrapper: { flex: 1, position: 'relative' },
  statShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 20, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  statCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 8, borderWidth: 2, borderColor: theme.colors.borderCardLight },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '900', color: c.charcoal, lineHeight: 24 },
  statLabel: { fontSize: 11, fontWeight: '700', color: c.gray, marginTop: 2 },
  section: { marginBottom: theme.spacing.lg, paddingHorizontal: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: c.charcoal },
  menuCardWrapper: { position: 'relative' },
  menuCardShadow: { position: 'absolute', top: 6, left: 6, right: -6, bottom: -6, borderRadius: 24, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: theme.colors.borderCardLight },
  menuDivider: { height: 1, backgroundColor: c.creamDark, marginHorizontal: 16 },
  signOutSection: { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
  signOutWrapper: { position: 'relative' },
  signOutShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 20, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  signOutButton: { width: '100%', paddingVertical: 14, borderRadius: 20, backgroundColor: c.red, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.borderCardLight },
  signOutContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  signOutIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  version: { fontSize: 11, fontWeight: '600', color: c.gray, textAlign: 'center', marginTop: theme.spacing.md },
});
