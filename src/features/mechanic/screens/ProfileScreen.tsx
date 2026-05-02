import React, { useEffect, useState, useCallback } from 'react';
import {
  Image, Pressable, ScrollView, StyleSheet, Switch, Text, View,
  useWindowDimensions, type ViewStyle, TouchableOpacity, TextInput,
  Modal, Alert, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  CartoonActionButton, CartoonEmptyState, CartoonProfileAvatar,
  FloatingIconsBackground, ScreenContainer, SketchFill,
} from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { theme } from '../../../theme';
import {
  getMechanicId, getMechanicProfile, getMechanicStats, updateAvailability,
  getSkills, addSkill, deleteSkill, getServiceAreas, addServiceArea,
  deleteServiceArea, getPortfolio, addPortfolioItem, deletePortfolioItem,
  uploadPortfolioImage, type MechanicFullProfile, type MechanicStats,
  type PortfolioItem,
} from '../../../lib/mechanicHelpers';
import * as ImagePicker from 'expo-image-picker';

const c = theme.colors.cartoon;

function BentoCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.cardWrap, style]}>
      <View style={styles.cardShadow}><SketchFill /></View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function AddModal({ visible, onClose, onAdd, title, placeholder }: {
  visible: boolean; onClose: () => void; onAdd: (val: string) => void;
  title: string; placeholder: string;
}) {
  const [value, setValue] = useState('');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalInputWrap}>
            <TextInput style={styles.modalInput} value={value} onChangeText={setValue}
              placeholder={placeholder} placeholderTextColor={c.gray} autoFocus />
          </View>
          <View style={styles.modalActions}>
            <CartoonActionButton label="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <CartoonActionButton label="Add" variant="accept" icon="plus"
              onPress={() => { if (value.trim()) { onAdd(value.trim()); setValue(''); onClose(); } }}
              style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function MechanicProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 920;

  const [profile, setProfile] = useState<MechanicFullProfile | null>(null);
  const [stats, setStats] = useState<MechanicStats | null>(null);
  const [skills, setSkills] = useState<{ id: string; skill_name: string }[]>([]);
  const [areas, setAreas] = useState<{ id: string; area_name: string }[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [availability, setAvailability] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mechanicId, setMechanicId] = useState<string | null>(null);

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('');

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    services: true, portfolio: true, stats: true,
  });
  const toggleExpand = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const loadAll = useCallback(async () => {
    const mid = await getMechanicId();
    setMechanicId(mid);
    if (!mid) { setLoading(false); return; }

    const [prof, st, sk, ar, port] = await Promise.all([
      getMechanicProfile(), getMechanicStats(mid), getSkills(mid),
      getServiceAreas(mid), getPortfolio(mid),
    ]);
    setProfile(prof);
    setStats(st);
    setSkills(sk);
    setAreas(ar);
    setPortfolio(port);
    setAvailability(prof?.availabilityStatus === 'available');
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await loadAll(); setRefreshing(false);
  }, [loadAll]);

  async function handleToggleAvailability(val: boolean) {
    setAvailability(val);
    if (mechanicId) await updateAvailability(mechanicId, val ? 'available' : 'offline');
  }

  async function handleAddSkill(name: string) {
    if (!mechanicId) return;
    const item = await addSkill(mechanicId, name);
    if (item) setSkills((p) => [...p, item]);
  }

  async function handleDeleteSkill(id: string) {
    Alert.alert('Delete Skill', 'Are you sure you want to remove this skill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSkill(id);
          setSkills((p) => p.filter((s) => s.id !== id));
        },
      },
    ]);
  }

  async function handleAddArea(name: string) {
    if (!mechanicId) return;
    const item = await addServiceArea(mechanicId, name);
    if (item) setAreas((p) => [...p, item]);
  }

  async function handleDeleteArea(id: string) {
    Alert.alert('Delete Area', 'Are you sure you want to remove this service area?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteServiceArea(id);
          setAreas((p) => p.filter((a) => a.id !== id));
        },
      },
    ]);
  }

  async function handleAddPortfolio() {
    if (!mechanicId || !user?.id || !portfolioTitle.trim()) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7, allowsEditing: true, aspect: [16, 9],
      });
      if (result.canceled || !result.assets?.[0]) return;
      const imageUrl = await uploadPortfolioImage(user.id, result.assets[0].uri);
      const item = await addPortfolioItem(mechanicId, portfolioTitle.trim(), imageUrl);
      if (item) setPortfolio((p) => [item, ...p]);
      setPortfolioTitle('');
      setShowPortfolioModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add portfolio item');
    }
  }

  async function handleDeletePortfolio(id: string) {
    Alert.alert('Delete Item', 'Are you sure you want to remove this portfolio item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePortfolioItem(id);
          setPortfolio((p) => p.filter((i) => i.id !== id));
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        <FloatingIconsBackground />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.caption}>Loading profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <FloatingIconsBackground />
      <View style={styles.blobRed} /><View style={styles.blobPurple} /><View style={styles.blobMint} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.red} />}>

        {/* Hero */}
        <BentoCard style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <CartoonProfileAvatar avatarUrl={profile?.avatarUrl ?? undefined} />
            <Text style={styles.name}>{profile?.name ?? user?.name ?? 'Mechanic'}</Text>
            <Text style={styles.workshop}>{profile?.workshopName ?? 'Workshop'}</Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <MaterialCommunityIcons key={i}
                  name={i < Math.round(profile?.rating ?? 0) ? 'star' : 'star-outline'}
                  size={18} color={c.yellow} />
              ))}
              <Text style={styles.ratingValue}>{(profile?.rating ?? 0).toFixed(1)}</Text>
            </View>
            <Text style={styles.caption}>{profile?.experienceYears ?? 0} years experience</Text>
            <View style={styles.editButtonWrapper}>
              <View style={styles.editButtonShadow}><SketchFill /></View>
              <TouchableOpacity style={styles.editButton}
                onPress={() => navigation.getParent()?.navigate('EditProfile')} activeOpacity={0.8}>
                <MaterialCommunityIcons name="pencil" size={16} color={c.red} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BentoCard>

        {/* Availability + Contact */}
        <View style={[styles.bentoRow, isTablet && styles.bentoRowTablet]}>
          <BentoCard style={isTablet ? styles.bentoHalf : undefined}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Switch value={availability} onValueChange={handleToggleAvailability} />
            </View>
            <Text style={styles.sectionBody}>
              {availability ? 'Available for nearby requests' : 'Temporarily unavailable'}
            </Text>
          </BentoCard>
          <BentoCard style={isTablet ? styles.bentoHalf : undefined}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.sectionBody}>{profile?.email ?? user?.email ?? '—'}</Text>
            <Text style={styles.sectionBody}>{profile?.phone ?? user?.phone ?? 'Phone not set'}</Text>
          </BentoCard>
        </View>

        {/* Skills */}
        <BentoCard>
          <Pressable style={styles.sectionHeader} onPress={() => toggleExpand('services')}>
            <Text style={styles.sectionTitle}>Skills and services</Text>
            <MaterialCommunityIcons name={expanded.services ? 'chevron-up' : 'chevron-down'}
              size={20} color={c.charcoal} />
          </Pressable>
          {expanded.services ? (
            <>
              <View style={styles.tagWrap}>
                {skills.length === 0 && <Text style={styles.sectionBody}>No skills added yet</Text>}
                {skills.map((s) => (
                  <View key={s.id} style={styles.tag}>
                    <Text style={styles.tagText}>{s.skill_name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteSkill(s.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <MaterialCommunityIcons name="close-circle" size={16} color={c.red} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <CartoonActionButton label="Add skill" variant="secondary" icon="plus-circle-outline"
                onPress={() => setShowSkillModal(true)} fullWidth />
            </>
          ) : null}
        </BentoCard>

        {/* Service Areas */}
        <BentoCard>
          <Text style={styles.sectionTitle}>Service areas</Text>
          <View style={styles.areaRow}>
            {areas.length === 0 && <Text style={styles.sectionBody}>No service areas added</Text>}
            {areas.map((a) => (
              <View key={a.id} style={styles.areaBadge}>
                <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={c.blue} />
                <Text style={styles.areaText}>{a.area_name}</Text>
                <TouchableOpacity onPress={() => handleDeleteArea(a.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={c.red} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <CartoonActionButton label="Add area" variant="secondary" icon="plus-circle-outline"
            onPress={() => setShowAreaModal(true)} fullWidth />
        </BentoCard>

        {/* Portfolio */}
        <BentoCard>
          <Pressable style={styles.sectionHeader} onPress={() => toggleExpand('portfolio')}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <MaterialCommunityIcons name={expanded.portfolio ? 'chevron-up' : 'chevron-down'}
              size={20} color={c.charcoal} />
          </Pressable>
          {expanded.portfolio ? (
            <>
              {portfolio.length === 0 ? (
                <CartoonEmptyState icon="image-off-outline" title="No portfolio items"
                  message="Add photos of your work to showcase your skills." />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {portfolio.map((item) => (
                    <View key={item.id} style={styles.portfolioCard}>
                      <TouchableOpacity 
                        style={styles.portfolioDeleteBtn} 
                        onPress={() => handleDeletePortfolio(item.id)}
                      >
                        <MaterialCommunityIcons name="close-circle" size={20} color={c.red} />
                      </TouchableOpacity>
                      {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={styles.portfolioImage} />
                      ) : (
                        <View style={[styles.portfolioImage, { justifyContent: 'center', alignItems: 'center' }]}>
                          <MaterialCommunityIcons name="image-off" size={28} color={c.gray} />
                        </View>
                      )}
                      <Text style={styles.portfolioTitle} numberOfLines={1}>{item.title}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
              <CartoonActionButton label="Add portfolio item" variant="primary" icon="plus-circle-outline"
                onPress={() => setShowPortfolioModal(true)} fullWidth />
            </>
          ) : null}
        </BentoCard>

        {/* Stats */}
        <BentoCard>
          <Pressable style={styles.sectionHeader} onPress={() => toggleExpand('stats')}>
            <Text style={styles.sectionTitle}>Stats</Text>
            <MaterialCommunityIcons name={expanded.stats ? 'chevron-up' : 'chevron-down'}
              size={20} color={c.charcoal} />
          </Pressable>
          {expanded.stats && stats ? (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.jobsCompleted}</Text>
                <Text style={styles.statLabel}>Jobs completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(stats.rating ?? 0).toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.activeJobs}</Text>
                <Text style={styles.statLabel}>Active jobs</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalRequests}</Text>
                <Text style={styles.statLabel}>Total requests</Text>
              </View>
            </View>
          ) : null}
        </BentoCard>

        <CartoonActionButton label="Sign Out" variant="reject" icon="logout"
          onPress={() => { logout(); }} fullWidth />
      </ScrollView>

      {/* Modals */}
      <AddModal visible={showSkillModal} onClose={() => setShowSkillModal(false)}
        onAdd={handleAddSkill} title="Add Skill" placeholder="e.g. Engine diagnostics" />
      <AddModal visible={showAreaModal} onClose={() => setShowAreaModal(false)}
        onAdd={handleAddArea} title="Add Service Area" placeholder="e.g. Downtown" />

      {/* Portfolio Modal */}
      <Modal visible={showPortfolioModal} transparent animationType="fade"
        onRequestClose={() => setShowPortfolioModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPortfolioModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Portfolio Item</Text>
            <View style={styles.modalInputWrap}>
              <TextInput style={styles.modalInput} value={portfolioTitle}
                onChangeText={setPortfolioTitle} placeholder="Title (e.g. Engine rebuild)"
                placeholderTextColor={c.gray} />
            </View>
            <Text style={styles.sectionBody}>An image picker will open after you tap Add</Text>
            <View style={styles.modalActions}>
              <CartoonActionButton label="Cancel" variant="secondary"
                onPress={() => setShowPortfolioModal(false)} style={{ flex: 1 }} />
              <CartoonActionButton label="Add" variant="accept" icon="camera"
                onPress={handleAddPortfolio} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.cream },
  blobRed: { position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: `${c.red}12` },
  blobPurple: { position: 'absolute', top: '40%', right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: `${c.purple}12` },
  blobMint: { position: 'absolute', bottom: '20%', left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: `${c.mint}12` },
  content: { gap: theme.spacing.md, paddingHorizontal: theme.spacing.md + 4, paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight },
  cardWrap: { position: 'relative' },
  cardShadow: { position: 'absolute', top: 6, left: 6, right: -6, bottom: -6, borderRadius: 20, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  heroWrap: { marginBottom: 2 },
  heroCard: { alignItems: 'center', paddingVertical: theme.spacing.lg, gap: 4 },
  name: { fontSize: 20, lineHeight: 26, fontWeight: '800', color: c.charcoal },
  workshop: { ...theme.typography.body, color: c.gray },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 6 },
  ratingValue: { marginLeft: 6, ...theme.typography.caption, fontWeight: '800', color: c.charcoal },
  caption: { ...theme.typography.caption, color: c.gray },
  editButtonWrapper: { position: 'relative', marginTop: 16 },
  editButtonShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 24, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: theme.colors.borderCardLight },
  editButtonText: { fontSize: 14, fontWeight: '800', color: c.red },
  sectionCard: { borderWidth: 2, borderColor: theme.colors.borderCardLight, borderRadius: 18, backgroundColor: '#FFFFFF', padding: theme.spacing.md, gap: 10 },
  bentoRow: { gap: theme.spacing.md },
  bentoRowTablet: { flexDirection: 'row', alignItems: 'stretch' },
  bentoHalf: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800', color: c.charcoal },
  sectionBody: { ...theme.typography.body, color: c.gray },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.blueBg, borderWidth: 1, borderColor: theme.colors.borderCardLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { ...theme.typography.caption, color: c.charcoal, fontWeight: '700' },
  areaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderCardLight, backgroundColor: c.yellowBg, paddingHorizontal: 8, paddingVertical: 6 },
  areaText: { ...theme.typography.caption, color: c.charcoal },
  portfolioCard: { width: 180, marginRight: theme.spacing.sm, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: theme.colors.borderCardLight, backgroundColor: '#FFFFFF', position: 'relative' },
  portfolioDeleteBtn: { position: 'absolute', top: 5, right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10 },
  portfolioImage: { width: '100%', height: 100, backgroundColor: c.lightGray },
  portfolioTitle: { padding: theme.spacing.sm, ...theme.typography.caption, fontWeight: '700', color: c.charcoal },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: { width: '48%', borderWidth: 1, borderColor: theme.colors.borderCardLight, borderRadius: 12, backgroundColor: c.mintBg, padding: theme.spacing.sm },
  statValue: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: c.charcoal },
  statLabel: { ...theme.typography.caption, color: c.gray },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: theme.colors.borderCardLight, padding: 24, width: '100%', maxWidth: 400, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: c.charcoal, textAlign: 'center' },
  modalInputWrap: { borderWidth: 2, borderColor: theme.colors.borderCardLight, borderRadius: 14, overflow: 'hidden' },
  modalInput: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: c.charcoal },
  modalActions: { flexDirection: 'row', gap: 12 },
});
