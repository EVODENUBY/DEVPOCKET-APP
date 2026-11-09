import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { useAuth } from '../../src/auth/AuthProvider';
import { SocialAuthButtons } from '../../src/components/SocialAuthButtons';
import { FormField } from '../../src/components/ui/FormField';
import { GlassPanel } from '../../src/components/ui/GlassPanel';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { Screen } from '../../src/components/ui/Screen';
import { useAppTheme } from '../../src/theme/useAppTheme';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters.').max(80),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(12, 'Use at least 12 characters.').max(1024),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colors } = useAppTheme();
  const { register } = useAuth();
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(null);
    try {
      await register(values);
      router.replace('/(tabs)');
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : 'Account creation failed.',
      );
    }
  });

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to welcome"
        onPress={() => router.replace('/')}
        style={({ pressed }) => [
          styles.backButton,
          {
            backgroundColor: colors.glassSurface,
            borderColor: colors.glassBorder,
            opacity: pressed ? 0.65 : 1,
          },
        ]}
      >
        <Feather name="arrow-left" size={18} color={colors.text} />
      </Pressable>

      <View style={styles.brandRow}>
        <LinearGradient
          colors={colors.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandMark}
        >
          <Feather name="terminal" size={18} color={colors.onPrimary} />
        </LinearGradient>
        <Text style={[styles.brand, { color: colors.text }]}>devpocket</Text>
        <View
          style={[
            styles.secureBadge,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <Feather name="shield" size={11} color={colors.accent} />
          <Text style={[styles.secureLabel, { color: colors.accent }]}>
            NEW ACCOUNT
          </Text>
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          START YOUR WORKSPACE
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Create your{'\n'}account.
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Your account is protected with secure sessions.
        </Text>
      </View>

      <GlassPanel intense style={styles.formCard}>
        {requestError ? (
          <View
            style={[
              styles.error,
              {
                backgroundColor: colors.glassSurface,
                borderColor: colors.error,
              },
            ]}
          >
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.errorText, { color: colors.error }]}
            >
              {requestError}
            </Text>
          </View>
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              placeholder="Your name"
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="you@example.com"
              error={error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              placeholder="At least 12 characters"
              error={error?.message}
            />
          )}
        />

        <View style={styles.helperRow}>
          <Feather name="info" size={13} color={colors.mutedText} />
          <Text style={[styles.helper, { color: colors.secondaryText }]}>
            Provider access is not requested during registration. You can
            connect providers later using their official authorization flow.
          </Text>
        </View>

        <PrimaryButton
          label="Create account"
          onPress={() => void onSubmit()}
          loading={isSubmitting}
        />

        <SocialAuthButtons />
      </GlassPanel>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/(auth)/login')}
        style={styles.linkButton}
      >
        <Text style={[styles.link, { color: colors.secondaryText }]}>
          Already have an account?{' '}
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            Sign in
          </Text>
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <View
          style={[styles.footerLine, { backgroundColor: colors.hairline }]}
        />
        <Text style={[styles.footerText, { color: colors.mutedText }]}>
          END-TO-END SECURE SESSIONS
        </Text>
        <View
          style={[styles.footerLine, { backgroundColor: colors.hairline }]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandMark: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    marginRight: 9,
  },
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  secureBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  secureLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  intro: { marginTop: 32, marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  title: {
    fontSize: 43,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -1.8,
    marginTop: 10,
  },
  subtitle: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  formCard: { padding: 20, borderRadius: 26 },
  error: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, lineHeight: 19 },
  helperRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  helper: { flex: 1, fontSize: 11, lineHeight: 17 },
  linkButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  link: { fontSize: 13, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  footerLine: { height: StyleSheet.hairlineWidth, flex: 1 },
  footerText: { fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
});
