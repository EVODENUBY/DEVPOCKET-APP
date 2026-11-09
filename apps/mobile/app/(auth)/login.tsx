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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { login } = useAuth();
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(null);
    try {
      await login(values);
      router.replace('/(tabs)');
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : 'Sign in failed.',
      );
    }
  });

  return (
    <Screen>
      <View style={styles.page}>
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
              SECURE SIGN IN
            </Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            YOUR WORKSPACE AWAITS
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome{'\n'}back.
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Pick up right where your work left off.
          </Text>
        </View>

        <GlassPanel intense style={styles.formCard}>
          <View style={styles.formHeading}>
            <View style={styles.formHeadingText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Sign in to DevPocket
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: colors.secondaryText }]}
              >
                Use your account credentials to continue.
              </Text>
            </View>
            <View
              style={[
                styles.branchIcon,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <Feather name="git-branch" size={16} color={colors.accent} />
            </View>
          </View>

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
            name="email"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <FormField
                label="Email address"
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
                autoComplete="current-password"
                textContentType="password"
                placeholder="Enter your password"
                error={error?.message}
              />
            )}
          />

          <PrimaryButton
            label="Continue to DevPocket"
            onPress={() => void onSubmit()}
            loading={isSubmitting}
          />

          <SocialAuthButtons />

          <View style={styles.privacyNote}>
            <Feather name="lock" size={12} color={colors.mutedText} />
            <Text style={[styles.privacyText, { color: colors.mutedText }]}>
              Your credentials are encrypted and never shared.
            </Text>
          </View>
        </GlassPanel>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/register')}
          style={styles.createAccount}
        >
          <Text style={[styles.link, { color: colors.secondaryText }]}>
            New to DevPocket?{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              Create an account
            </Text>
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <View
            style={[styles.footerLine, { backgroundColor: colors.hairline }]}
          />
          <Text style={[styles.footerText, { color: colors.mutedText }]}>
            BUILT FOR THE WAY YOU BUILD
          </Text>
          <View
            style={[styles.footerLine, { backgroundColor: colors.hairline }]}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { paddingTop: 4 },
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
  formHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formHeadingText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, lineHeight: 18, marginTop: 4, maxWidth: 230 },
  branchIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  error: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, lineHeight: 19 },
  privacyNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
  },
  privacyText: { fontSize: 10, lineHeight: 15 },
  createAccount: {
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
