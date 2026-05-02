import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Input, SketchFill } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import type { AuthStackParamList } from '../../../types/navigation';
import { theme } from '../../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    setLoading(true);
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 15000)
    );

    try {
      // Race the sign in against the timeout
      await Promise.race([
        signIn(data.email.trim(), data.password),
        timeoutPromise
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your AutoAssist account</Text>
          </View>

          <View style={styles.form}>
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

            {submitError ? (
              <Text style={styles.errorText}>{submitError}</Text>
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
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.footerLink}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.footerLinkText}>
                Don&apos;t have an account?{' '}
                <Text style={styles.footerLinkTextEmphasis}>Create one</Text>
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
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'flex-start',
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
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
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
  footerLink: {
    marginTop: theme.spacing.lg,
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