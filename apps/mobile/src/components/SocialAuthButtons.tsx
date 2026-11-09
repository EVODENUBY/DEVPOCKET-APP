import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import type { OAuthProvider } from '../auth/authApi';
import { useAppTheme } from '../theme/useAppTheme';

const options = [
  { key: 'github', label: 'GitHub', icon: 'logo-github' },
  { key: 'google', label: 'Google', icon: 'logo-google' },
] as const;

export function SocialAuthButtons() {
  const { colors } = useAppTheme();
  const { loginWithProvider } = useAuth();
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const busy = pending !== null;

  const connect = async (provider: OAuthProvider) => {
    setPending(provider);
    try {
      const session = await loginWithProvider(provider);
      if (session) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert(
        'Sign-in failed',
        error instanceof Error
          ? error.message
          : 'Could not complete sign-in with this provider.',
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: colors.hairline }]} />
        <Text style={[styles.dividerLabel, { color: colors.mutedText }]}>
          OR CONTINUE WITH
        </Text>
        <View style={[styles.line, { backgroundColor: colors.hairline }]} />
      </View>

      <View style={styles.row}>
        {options.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={`Continue with ${option.label}`}
            accessibilityState={{
              disabled: busy,
              busy: pending === option.key,
            }}
            disabled={busy}
            onPress={() => void connect(option.key)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.glassSurface,
                borderColor: colors.glassBorder,
                opacity: busy ? 0.6 : pressed ? 0.7 : 1,
              },
            ]}
          >
            {pending === option.key ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Ionicons name={option.icon} size={18} color={colors.text} />
            )}
            <Text style={[styles.label, { color: colors.text }]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 18 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  line: { height: StyleSheet.hairlineWidth, flex: 1 },
  dividerLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  label: { fontSize: 13, fontWeight: '700' },
});
