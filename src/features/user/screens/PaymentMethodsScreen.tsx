import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Button } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  is_default: boolean;
};

type Props = UserStackScreenProps<'PaymentMethods'>;

export function PaymentMethodsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [last4, setLast4] = useState('');
  const [brand, setBrand] = useState('Visa');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('id, brand, last4, is_default')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (error) throw error;
      setMethods((data ?? []) as PaymentMethod[]);
    } catch {
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!user?.id || !last4.trim() || last4.length !== 4) {
      Alert.alert('Invalid', 'Please enter the last 4 digits of your card.');
      return;
    }
    setSaving(true);
    try {
      const isFirst = methods.length === 0;
      await supabase.from('user_payment_methods').insert({
        user_id: user.id,
        brand,
        last4: last4.trim(),
        is_default: isFirst,
      });
      setModalVisible(false);
      setLast4('');
      load();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add card');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(m: PaymentMethod) {
    if (!user?.id) return;
    try {
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);
      await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', m.id);
      load();
    } catch {
      Alert.alert('Error', 'Failed to update default card');
    }
  }

  function handleDelete(m: PaymentMethod) {
    Alert.alert(
      'Remove Card',
      `Remove ${m.brand} ending in ${m.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('user_payment_methods').delete().eq('id', m.id);
            load();
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
          <Text style={styles.title}>Payment Methods</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color={c.red} />
            <Text style={styles.addText}>Add Card</Text>
          </TouchableOpacity>
        </View>
        {methods.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="credit-card-off-outline" size={48} color={c.gray} />
            <Text style={styles.emptyText}>No payment methods</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>Add your first card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          methods.map((m) => (
            <View key={m.id} style={styles.cardRow}>
              <View style={styles.cardBox}>
                <MaterialCommunityIcons name="credit-card" size={24} color={c.blue} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardBrand}>{m.brand} •••• {m.last4}</Text>
                  {m.is_default && <Text style={styles.defaultBadge}>Default</Text>}
                </View>
              </View>
              <View style={styles.cardActions}>
                {!m.is_default && (
                  <TouchableOpacity onPress={() => handleSetDefault(m)}>
                    <Text style={styles.setDefault}>Set default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(m)}>
                  <MaterialCommunityIcons name="delete-outline" size={22} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Card</Text>
            <Text style={styles.modalHint}>Enter last 4 digits only (for demo)</Text>
            <TextInput
              style={styles.input}
              value={last4}
              onChangeText={(t) => setLast4(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="4242"
              keyboardType="number-pad"
              maxLength={4}
            />
            <View style={styles.modalRow}>
              <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              <Button title="Add" onPress={handleAdd} loading={saving} disabled={saving} />
            </View>
          </View>
        </View>
      </Modal>
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  cardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardInfo: {
    gap: 4,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: c.charcoal,
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: c.mint,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  setDefault: {
    fontSize: 14,
    fontWeight: '600',
    color: c.red,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: c.cream,
    width: '90%',
    maxWidth: 340,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: c.charcoal,
    marginBottom: theme.spacing.sm,
  },
  modalHint: {
    fontSize: 14,
    color: c.gray,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 18,
    marginBottom: theme.spacing.lg,
  },
  modalRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
  },
});
