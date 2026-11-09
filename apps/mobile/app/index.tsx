import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../src/auth/AuthProvider';
import { useSessionStore } from '../src/auth/sessionStore';
import {
  ProviderIcon,
  providerLabels,
  type ProviderKey,
} from '../src/components/ProviderIcon';
import { GlassPanel } from '../src/components/ui/GlassPanel';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { Screen } from '../src/components/ui/Screen';
import { fonts, useAppTheme } from '../src/theme/useAppTheme';

const providers: ProviderKey[] = ['github', 'gitlab', 'vercel', 'render'];

function BlinkingCursor({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 520,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.cursor, { backgroundColor: color, opacity }]}
    />
  );
}

export default function WelcomeScreen() {
  const { colors } = useAppTheme();
  const status = useSessionStore((state) => state.status);
  const restoreError = useSessionStore((state) => state.error);
  const { retryRestore } = useAuth();

  if (status === 'restoring') {
    return (
      <Screen>
        <View style={styles.center}>
          <GlassPanel style={styles.restorePanel}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.restoreText, { color: colors.secondaryText }]}>
              Restoring your secure session…
            </Text>
          </GlassPanel>
        </View>
      </Screen>
    );
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Screen>
      <View style={styles.brandRow}>
        <LinearGradient
          colors={colors.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandMark}
        >
          <Feather name="terminal" size={19} color={colors.onPrimary} />
        </LinearGradient>
        <Text style={[styles.brand, { color: colors.text }]}>devpocket</Text>
        <View
          style={[
            styles.workspaceBadge,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: colors.success }]}
          />
          <Text style={[styles.workspaceLabel, { color: colors.accent }]}>
            SECURE WORKSPACE
          </Text>
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          DEVELOPER COMMAND CENTER
        </Text>
        <Text style={[styles.headline, { color: colors.text }]}>
          Your code,{'\n'}in good company.
        </Text>
        <Text style={[styles.description, { color: colors.secondaryText }]}>
          Repositories, releases, and the work behind them — one private,
          considered view.
        </Text>
      </View>

      <GlassPanel intense style={styles.terminal}>
        <View style={styles.terminalChrome}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: colors.error }]} />
            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
          </View>
          <Text style={[styles.terminalTitle, { color: colors.mutedText }]}>
            devpocket — secure shell
          </Text>
          <Feather name="lock" size={13} color={colors.mutedText} />
        </View>

        <View style={styles.terminalBody}>
          <View style={styles.commandLine}>
            <Text style={[styles.prompt, { color: colors.accent }]}>$</Text>
            <Text style={[styles.command, { color: colors.text }]}>
              devpocket connect
            </Text>
            <BlinkingCursor color={colors.primary} />
          </View>
          <Text style={[styles.commandHint, { color: colors.mutedText }]}>
            Select a provider to begin.
          </Text>
        </View>

        <View style={styles.providerGrid}>
          {providers.map((provider) => (
            <View
              key={provider}
              style={[
                styles.providerChip,
                {
                  backgroundColor: colors.glassSurface,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <ProviderIcon provider={provider} size={24} />
              <Text style={[styles.providerName, { color: colors.text }]}>
                {providerLabels[provider]}
              </Text>
              <Text style={[styles.providerState, { color: colors.mutedText }]}>
                soon
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[styles.terminalFooter, { borderTopColor: colors.hairline }]}
        >
          <Feather name="shield" size={13} color={colors.accent} />
          <Text
            style={[styles.terminalFooterText, { color: colors.secondaryText }]}
          >
            OAuth tokens stay server-side, never on this device.
          </Text>
        </View>
      </GlassPanel>

      {status === 'error' ? (
        <GlassPanel style={styles.errorBox}>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.errorText, { color: colors.error }]}
          >
            {restoreError}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void retryRestore()}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry session restore
            </Text>
          </Pressable>
        </GlassPanel>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label="Sign in to your workspace"
          onPress={() => router.push('/(auth)/login')}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassSurface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="user-plus" size={15} color={colors.text} />
          <Text style={[styles.secondaryLabel, { color: colors.text }]}>
            Create an account
          </Text>
        </Pressable>
      </View>

      <View style={styles.trustRow}>
        <Feather name="shield" size={13} color={colors.mutedText} />
        <Text style={[styles.footer, { color: colors.mutedText }]}>
          Private by design · Connect providers on your terms
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  brandMark: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginRight: 10,
  },
  brand: { fontSize: 20, fontWeight: '800', letterSpacing: -0.7 },
  workspaceBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  workspaceLabel: { fontSize: 8, letterSpacing: 0.9, fontWeight: '800' },
  intro: { marginBottom: 22 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
  headline: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -1.8,
    marginTop: 12,
  },
  description: { fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 340 },
  terminal: { padding: 0, borderRadius: 26 },
  terminalChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5, opacity: 0.75 },
  terminalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    fontFamily: fonts.command,
  },
  terminalBody: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14 },
  commandLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prompt: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: fonts.command,
  },
  command: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: fonts.command,
  },
  cursor: { width: 8, height: 16, borderRadius: 2 },
  commandHint: {
    fontSize: 12,
    marginTop: 9,
    fontFamily: fonts.command,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  providerChip: {
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  providerName: { fontSize: 12, fontWeight: '700' },
  providerState: { fontSize: 9, fontWeight: '700', marginLeft: 'auto' },
  terminalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  terminalFooterText: { fontSize: 10, flex: 1, lineHeight: 15 },
  errorBox: { padding: 16, marginTop: 14 },
  errorText: { fontSize: 13, lineHeight: 19, marginBottom: 9 },
  retryText: { fontSize: 13, fontWeight: '700' },
  actions: { marginTop: 20, gap: 10 },
  secondaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
  },
  secondaryLabel: { fontSize: 14, fontWeight: '700' },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
    marginBottom: 8,
  },
  footer: { fontSize: 10, lineHeight: 16, textAlign: 'center' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 380,
  },
  restorePanel: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 34,
    gap: 14,
  },
  restoreText: { fontSize: 14 },
});
