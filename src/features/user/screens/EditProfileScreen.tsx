import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TextInput, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, SketchFill } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { authStore } from '../../../store';
import { supabase } from '../../../lib/supabase';
import { fetchProfile, authUserFromSession } from '../../../lib/authHelpers';
import { theme } from '../../../theme';

const c = theme.colors.cartoon;

export function EditProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const isMechanic = user?.role === 'mechanic';
  const isSeller = user?.role === 'seller';

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [workshopName, setWorkshopName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');

    if (isMechanic) {
      // Fetch mechanic-specific data
      (async () => {
        const { data } = await supabase
          .from('mechanics')
          .select('workshop_name, experience_years, phone')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setWorkshopName((data as any).workshop_name ?? '');
          setExperienceYears((data as any).experience_years?.toString() ?? '');
          if ((data as any).phone) setPhone((data as any).phone);
        }
      })();
    }

    if (isSeller) {
      // Fetch seller-specific data
      (async () => {
        const { data } = await supabase
          .from('sellers')
          .select('shop_name, address')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setShopName((data as any).shop_name ?? '');
          setShopAddress((data as any).address ?? '');
        }
      })();
    }
  }, [user?.id]);

  async function handleSave() {
    if (!user?.id) return;
    setError(null);
    setSaving(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: name.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
        })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // Update mechanics table if mechanic
      if (isMechanic) {
        const { error: mechError } = await supabase
          .from('mechanics')
          .update({
            workshop_name: workshopName.trim() || null,
            experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
            phone: phone.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        if (mechError) throw mechError;
      }

      // Update sellers table if seller
      if (isSeller) {
        const { error: sellerError } = await supabase
          .from('sellers')
          .update({
            shop_name: shopName.trim() || null,
            address: shopAddress.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        if (sellerError) throw sellerError;
      }

      // Refresh auth store
      const profile = await fetchProfile(user.id);
      const { data: { session } } = await supabase.auth.getSession();
      if (session && profile) {
        const authUser = authUserFromSession(session, profile);
        authStore.getState().setSession(session, profile, authUser);
      }
      navigation.goBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer style={styles.screen} edges={['left', 'right']}>
      <View style={styles.blobRed} />
      <View style={styles.blobMint} />
      <KeyboardAvoidingView style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputShadow}><SketchFill /></View>
                <TextInput style={styles.input} value={name} onChangeText={setName}
                  placeholder="e.g. Alex Johnson" placeholderTextColor={c.gray} autoCapitalize="words" />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputShadow}><SketchFill /></View>
                <TextInput style={styles.input} value={email} onChangeText={setEmail}
                  placeholder="your@email.com" placeholderTextColor={c.gray}
                  keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputShadow}><SketchFill /></View>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone}
                  placeholder="+1 234 567 890" placeholderTextColor={c.gray}
                  keyboardType="phone-pad" />
              </View>
            </View>

            {/* Mechanic-only fields */}
            {isMechanic && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Workshop Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputShadow}><SketchFill /></View>
                    <TextInput style={styles.input} value={workshopName}
                      onChangeText={setWorkshopName} placeholder="e.g. TurboFix Garage"
                      placeholderTextColor={c.gray} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Experience (years)</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputShadow}><SketchFill /></View>
                    <TextInput style={styles.input} value={experienceYears}
                      onChangeText={setExperienceYears} placeholder="e.g. 5"
                      placeholderTextColor={c.gray} keyboardType="numeric" />
                  </View>
                </View>
              </>
            )}

            {/* Seller-only fields */}
            {isSeller && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Shop Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputShadow}><SketchFill /></View>
                    <TextInput style={styles.input} value={shopName}
                      onChangeText={setShopName} placeholder="e.g. AutoParts Plus"
                      placeholderTextColor={c.gray} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Shop Address</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputShadow}><SketchFill /></View>
                    <TextInput style={styles.input} value={shopAddress}
                      onChangeText={setShopAddress} placeholder="e.g. 123 Main St, Cairo"
                      placeholderTextColor={c.gray} />
                  </View>
                </View>
              </>
            )}
            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={c.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <View style={styles.saveWrapper}>
                <View style={styles.saveShadow}><SketchFill /></View>
                <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSave} disabled={saving} activeOpacity={0.8}>
                  <View style={styles.saveContent}>
                    <View style={styles.saveIconBox}>
                      <MaterialCommunityIcons name={saving ? 'loading' : 'content-save'}
                        size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.cream },
  keyboard: { flex: 1 },
  scroll: { padding: theme.spacing.xl },
  blobRed: { position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: `${c.red}12` },
  blobMint: { position: 'absolute', bottom: -20, right: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: `${c.mint}12` },
  formCard: { marginTop: 20, gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 15, fontWeight: '800', color: c.charcoal, marginLeft: 4 },
  inputWrapper: { position: 'relative' },
  inputShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: theme.colors.borderCardLight, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, fontWeight: '700', color: c.charcoal },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${c.red}15`, padding: 12, borderRadius: 12 },
  errorText: { fontSize: 13, fontWeight: '700', color: c.red, flex: 1 },
  buttonRow: { marginTop: 10 },
  saveWrapper: { position: 'relative' },
  saveShadow: { position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 20, backgroundColor: theme.colors.lightAccent, borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden' },
  saveButton: { width: '100%', paddingVertical: 14, borderRadius: 20, backgroundColor: c.red, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.borderCardLight },
  saveButtonDisabled: { opacity: 0.7 },
  saveContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
