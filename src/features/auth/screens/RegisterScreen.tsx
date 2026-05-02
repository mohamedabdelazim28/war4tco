import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Input, SketchFill } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema';
import type { AuthStackParamList } from '../../../types/navigation';
import { theme } from '../../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: '', 
      email: '', 
      password: '', 
      phone: '',
      role: 'user' 
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    setLoading(true);
    
    try {
      const result = await signUp({
        email: data.email.trim(),
        password: data.password,
        name: data.name.trim(),
        phone: data.phone?.trim(),
        role: data.role,
      });

      if (result.needsEmailConfirmation) {
        setSubmitError('Success! Please check your email for a confirmation link.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join AutoAssist and get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    containerStyle={styles.inputContainer}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="you@example.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                    containerStyle={styles.inputContainer}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Phone Number (Optional)"
                    placeholder="+1 234 567 890"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    error={errors.phone?.message}
                    containerStyle={styles.inputContainer}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={errors.password?.message}
                    containerStyle={styles.inputContainer}
                    labelStyle={styles.inputLabel}
                    inputStyle={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.roleLabel}>I am a:</Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roleContainer}>
                    {(['user', 'mechanic', 'seller'] as const).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleButton,
                          value === role && styles.roleButtonActive
                        ]}
                        onPress={() => onChange(role)}
                      >
                        <Text style={[
                          styles.roleButtonText,
                          value === role && styles.roleButtonTextActive
                        ]}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {submitError ? (
              <Text style={[
                styles.errorText, 
                submitError.includes('Success') && { color: theme.colors.success }
              ]}>
                {submitError}
              </Text>
            ) : null}
          </View>

          <View style={styles.actions}>
            <View style={styles.primaryButtonWrapper}>
              <View style={styles.primaryButtonShadow}>
                <SketchFill opacity={0.16} />
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.7}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.cartoon.red} />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.footerLink}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.footerLinkText}>
                Already have an account?{' '}
                <Text style={styles.footerLinkTextEmphasis}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.cartoon.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  form: {
    marginBottom: theme.spacing.lg,
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
  field: {
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: theme.colors.cartoon.creamDark,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.cartoon.charcoal,
  },
  roleLabel: {
    ...theme.typography.caption,
    color: theme.colors.black,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  roleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: theme.colors.cartoon.creamDark,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: theme.colors.cartoon.red,
    borderColor: theme.colors.cartoon.red,
  },
  roleButtonText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.cartoon.charcoal,
  },
  roleButtonTextActive: {
    color: theme.colors.white,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  actions: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  primaryButtonWrapper: {
    width: '100%',
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
  footerLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerLinkText: {
    ...theme.typography.caption,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  footerLinkTextEmphasis: {
    fontWeight: '700',
    color: theme.colors.cartoon.red,
  },
});
