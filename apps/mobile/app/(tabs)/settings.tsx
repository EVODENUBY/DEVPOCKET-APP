import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthProvider';
import { useSessionStore } from '../../src/auth/sessionStore';
import { ApiHealthCard } from '../../src/components/ApiHealthCard';
import { Card } from '../../src/components/ui/Card';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { Screen } from '../../src/components/ui/Screen';
import { useAppTheme } from '../../src/theme/useAppTheme';
import {
  useSettingsStore,
  type ThemeMode,
} from '../../src/theme/settingsStore';

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { logout } = useAuth();
  const user = useSessionStore((state) => state.user);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);

  return (
    <Screen title="Settings" subtitle="App preferences and connection status.">
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {user?.name}
        </Text>
        <Text style={[styles.note, { color: colors.secondaryText }]}>
          {user?.email}
        </Text>
        <View style={styles.signOut}>
          <PrimaryButton
            label="Sign out"
            onPress={() =>
              Alert.alert(
                'Sign out?',
                'You will need to sign in again to view your workspace.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: () => void logout(),
                  },
                ],
              )
            }
          />
        </View>
      </Card>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Appearance
      </Text>
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Theme</Text>
        <View style={styles.themeRow}>
          {themeModes.map((mode) => {
            const selected = themeMode === mode;
            return (
              <Pressable
                key={mode}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setThemeMode(mode)}
                style={[
                  styles.themeOption,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected
                      ? colors.selectedSurface
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.themeLabel,
                    { color: selected ? colors.primary : colors.secondaryText },
                  ]}
                >
                  {mode === 'system'
                    ? 'System'
                    : mode === 'light'
                      ? 'Light'
                      : 'Dark'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Backend</Text>
      <ApiHealthCard />
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          API address
        </Text>
        <Text
          selectable
          style={[styles.apiUrl, { color: colors.secondaryText }]}
        >
          {process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}
        </Text>
        <Text style={[styles.note, { color: colors.secondaryText }]}>
          Set EXPO_PUBLIC_API_URL in your local .env file. For a physical
          Android phone, use your development computer&apos;s LAN IP instead of
          localhost.
        </Text>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Integrations
      </Text>
      {['GitHub', 'GitLab', 'Vercel', 'Render'].map((provider) => (
        <Card key={provider} style={styles.providerCard}>
          <View style={styles.providerRow}>
            <Text
              style={[
                styles.cardTitle,
                styles.providerName,
                { color: colors.text },
              ]}
            >
              {provider}
            </Text>
            <Text style={[styles.connectionStatus, { color: colors.warning }]}>
              Not connected
            </Text>
          </View>
          <Text style={[styles.note, { color: colors.secondaryText }]}>
            Secure connection flow is not implemented yet.
          </Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  themeLabel: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  apiUrl: { fontSize: 13, fontFamily: 'monospace' },
  note: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  providerCard: { marginBottom: 8 },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: { marginBottom: 0 },
  connectionStatus: { fontSize: 12, fontWeight: '600' },
  signOut: { marginTop: 16 },
});
