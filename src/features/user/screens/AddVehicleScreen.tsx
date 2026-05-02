import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Screen, Input, SketchFill } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;

type Props = UserStackScreenProps<'AddVehicle'>;

export function AddVehicleScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!user?.id) return;
    const yearNum = parseInt(year, 10);
    if (!make.trim() || !model.trim() || isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      setError('Please enter valid make, model, and year.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from('user_vehicles').insert({
        user_id: user.id,
        make: make.trim(),
        model: model.trim(),
        year: yearNum,
        license_plate: licensePlate.trim() || null,
      });
      if (insertError) throw insertError;
      navigation.goBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen style={styles.screenContainer}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add Vehicle</Text>
            <Text style={styles.subtitle}>Enter your car details</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Input
                label="Make"
                value={make}
                onChangeText={setMake}
                placeholder="e.g. Toyota"
                containerStyle={styles.inputContainer}
                labelStyle={styles.inputLabel}
                inputStyle={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Input
                label="Model"
                value={model}
                onChangeText={setModel}
                placeholder="e.g. Camry"
                containerStyle={styles.inputContainer}
                labelStyle={styles.inputLabel}
                inputStyle={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Input
                label="Year"
                value={year}
                onChangeText={setYear}
                placeholder="e.g. 2021"
                keyboardType="number-pad"
                containerStyle={styles.inputContainer}
                labelStyle={styles.inputLabel}
                inputStyle={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Input
                label="License Plate (optional)"
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="e.g. 4XYZ123"
                autoCapitalize="characters"
                containerStyle={styles.inputContainer}
                labelStyle={styles.inputLabel}
                inputStyle={styles.input}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            <View style={styles.primaryButtonWrapper}>
              <View style={styles.primaryButtonShadow}>
                <SketchFill opacity={0.16} />
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.9}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? 'Adding...' : 'Add Vehicle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.cartoon.cream,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  field: {
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    color: theme.colors.black,
  },
  input: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: theme.colors.cartoon.creamDark,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  actions: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  primaryButtonWrapper: {
    width: '100%',
    maxWidth: 480,
    position: 'relative',
  },
  primaryButtonShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  primaryButton: {
    width: '100%',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.cartoon.red,
  },
});
