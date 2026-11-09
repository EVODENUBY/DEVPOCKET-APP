import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthProvider';
import { useSessionStore } from '../../src/auth/sessionStore';
import { ProviderIcon } from '../../src/components/ProviderIcon';
import { Card } from '../../src/components/ui/Card';
import { PrimaryButton } from '../../src/components/ui/PrimaryButton';
import { Screen } from '../../src/components/ui/Screen';
import { appInfo } from '../../src/config/appInfo';
import { useProviderConnections } from '../../src/providers/useProviders';
import { useAppTheme } from '../../src/theme/useAppTheme';
import {
  useSettingsStore,
  type ThemeMode,
} from '../../src/theme/settingsStore';

const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { logout, loginWithProvider } = useAuth();
  const user = useSessionStore((state) => state.user);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const connectionsQuery = useProviderConnections();
  const [connectingGithub, setConnectingGithub] = useState(false);

  const handleConnectGithub = async () => {
    setConnectingGithub(true);
    try {
      const session = await loginWithProvider('github');
      if (session) {
        await connectionsQuery.refetch();
      }
    } catch (error) {
      Alert.alert(
        'GitHub connection failed',
        error instanceof Error ? error.message : 'Could not connect GitHub.',
      );
    } finally {
      setConnectingGithub(false);
    }
  };

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

      <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          DevPocket
        </Text>
        <Text style={[styles.note, { color: colors.secondaryText }]}>
          Version {appInfo.version}
        </Text>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Integrations
      </Text>
      {connectionsQuery.isPending ? (
        <Card>
          <Text style={[styles.note, { color: colors.secondaryText }]}>
            Checking provider connections…
          </Text>
        </Card>
      ) : connectionsQuery.isError ? (
        <Card>
          <Text style={[styles.note, { color: colors.error }]}>
            {connectionsQuery.error.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void connectionsQuery.refetch()}
            style={[styles.retryButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.retryLabel, { color: colors.text }]}>
              Try again
            </Text>
          </Pressable>
        </Card>
      ) : (
        connectionsQuery.data.map((connection) => {
          const statusColor = connection.connected
            ? connection.tokenStored
              ? colors.success
              : colors.warning
            : colors.mutedText;
          return (
            <Card key={connection.key} style={styles.providerCard}>
              <View style={styles.providerRow}>
                <View style={styles.providerIdentity}>
                  <ProviderIcon provider={connection.key} size={26} />
                  <Text
                    style={[
                      styles.cardTitle,
                      styles.providerName,
                      { color: colors.text },
                    ]}
                  >
                    {connection.label}
                  </Text>
                </View>
                <Text style={[styles.connectionStatus, { color: statusColor }]}>
                  {connection.connected
                    ? connection.tokenStored
                      ? 'Connected'
                      : 'Reconnect'
                    : 'Not connected'}
                </Text>
              </View>
              <Text style={[styles.note, { color: colors.secondaryText }]}>
                {connection.connected
                  ? connection.repositoryAccess
                    ? 'Repository access is active and stored securely on the server.'
                    : connection.tokenStorageEnabled
                      ? 'Reconnect to renew repository access.'
                      : 'Repository access is not available yet. Please try again later.'
                  : connection.key === 'github'
                    ? 'Connect GitHub to load repositories on your dashboard.'
                    : 'This provider is not available yet.'}
              </Text>
              {connection.key === 'github' && !connection.repositoryAccess ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={connectingGithub}
                  onPress={() => void handleConnectGithub()}
                  style={[
                    styles.connectButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: connectingGithub ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.connectLabel, { color: colors.onPrimary }]}
                  >
                    {connectingGithub
                      ? 'Opening GitHub…'
                      : connection.connected
                        ? 'Reconnect GitHub'
                        : 'Connect GitHub'}
                  </Text>
                </Pressable>
              ) : null}
            </Card>
          );
        })
      )}
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
  note: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  providerCard: { marginBottom: 8 },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  providerName: { marginBottom: 0 },
  connectionStatus: { fontSize: 12, fontWeight: '600' },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },
  retryLabel: { fontSize: 12, fontWeight: '600' },
  connectButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 12,
  },
  connectLabel: { fontSize: 12, fontWeight: '700' },
  signOut: { marginTop: 16 },
});
