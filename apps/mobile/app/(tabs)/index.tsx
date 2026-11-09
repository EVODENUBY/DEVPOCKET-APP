import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/auth/AuthProvider';
import { useSessionStore } from '../../src/auth/sessionStore';
import { GithubRepositoryList } from '../../src/components/dashboard/GithubRepositoryList';
import { ProviderConnectionGrid } from '../../src/components/dashboard/ProviderConnectionGrid';
import { Card } from '../../src/components/ui/Card';
import { Screen } from '../../src/components/ui/Screen';
import {
  useGithubRepositories,
  useProviderConnections,
} from '../../src/providers/useProviders';
import { useAppTheme } from '../../src/theme/useAppTheme';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const { loginWithProvider } = useAuth();
  const user = useSessionStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);

  const connectionsQuery = useProviderConnections();
  const githubConnection = connectionsQuery.data?.find(
    (connection) => connection.key === 'github',
  );
  const githubConnected = githubConnection?.connected ?? false;
  const githubRepositoryAccess = githubConnection?.repositoryAccess ?? false;
  const repositoriesQuery = useGithubRepositories(githubRepositoryAccess);
  const repositoryCount = repositoriesQuery.data?.repositories.length;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const handleConnectGithub = useCallback(async () => {
    setConnectingGithub(true);
    try {
      const session = await loginWithProvider('github');
      if (!session) {
        return;
      }
      if (user && session.user.id !== user.id) {
        Alert.alert(
          'Different account',
          'This GitHub account is linked to a different DevPocket account. DevPocket has switched to that account so repository data stays consistent.',
        );
      }
      await queryClient.invalidateQueries({ queryKey: ['providers'] });
    } catch (error) {
      Alert.alert(
        'GitHub connection failed',
        error instanceof Error ? error.message : 'Could not connect GitHub.',
      );
    } finally {
      setConnectingGithub(false);
    }
  }, [loginWithProvider, queryClient, user]);

  const repositoryState = !githubConnected
    ? 'GitHub not connected'
    : !githubRepositoryAccess
      ? 'Reconnect GitHub'
      : repositoriesQuery.isPending
        ? 'Loading from GitHub…'
        : repositoriesQuery.isError
          ? 'GitHub needs attention'
          : `${repositoryCount ?? 0} latest repositories`;

  return (
    <Screen refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.secondaryText }]}>
            DEVELOPMENT OVERVIEW
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Your workspace'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Live status from your workspace and connected providers.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => router.push('/notifications')}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.glassSurface,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              color={colors.text}
              size={21}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => router.push('/(tabs)/settings')}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.glassSurface,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Ionicons name="settings-outline" color={colors.text} size={21} />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {repositoriesQuery.isSuccess ? (repositoryCount ?? 0) : '—'}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
            Repositories
          </Text>
          <Text style={[styles.summaryState, { color: colors.mutedText }]}>
            {repositoryState}
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>—</Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
            Deployments
          </Text>
          <Text style={[styles.summaryState, { color: colors.mutedText }]}>
            No deployment provider
          </Text>
        </Card>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Version control
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedText }]}>
          GITHUB
        </Text>
      </View>

      {connectionsQuery.isPending ? (
        <Card>
          <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
            Checking your GitHub connection…
          </Text>
        </Card>
      ) : connectionsQuery.isError ? (
        <Card>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.cardBody, { color: colors.error }]}
          >
            {connectionsQuery.error.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void connectionsQuery.refetch()}
            style={[styles.inlineButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.inlineButtonLabel, { color: colors.text }]}>
              Try again
            </Text>
          </Pressable>
        </Card>
      ) : !githubConnected ? (
        <Card>
          <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
            Connect GitHub to see your repositories and recent branch activity.
            DevPocket keeps provider tokens on the server, never on this device.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: connectingGithub }}
            disabled={connectingGithub}
            onPress={() => void handleConnectGithub()}
            style={[
              styles.primaryAction,
              {
                backgroundColor: colors.primary,
                opacity: connectingGithub ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="logo-github" size={16} color={colors.onPrimary} />
            <Text
              style={[styles.primaryActionLabel, { color: colors.onPrimary }]}
            >
              {connectingGithub ? 'Opening GitHub…' : 'Connect GitHub'}
            </Text>
          </Pressable>
        </Card>
      ) : !githubRepositoryAccess ? (
        <Card>
          <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
            {githubConnection?.tokenStorageEnabled === false
              ? 'GitHub repository access is not available yet. Please try again later.'
              : 'GitHub is connected, but repository access needs to be renewed. Reconnect GitHub and approve repository access.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: connectingGithub }}
            disabled={connectingGithub}
            onPress={() => void handleConnectGithub()}
            style={[
              styles.primaryAction,
              {
                backgroundColor: colors.primary,
                opacity: connectingGithub ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="logo-github" size={16} color={colors.onPrimary} />
            <Text
              style={[styles.primaryActionLabel, { color: colors.onPrimary }]}
            >
              {connectingGithub ? 'Opening GitHub…' : 'Reconnect GitHub'}
            </Text>
          </Pressable>
        </Card>
      ) : (
        <GithubRepositoryList
          repositories={repositoriesQuery.data?.repositories}
          isPending={repositoriesQuery.isPending}
          error={repositoriesQuery.error}
          onRetry={() => void repositoriesQuery.refetch()}
        />
      )}

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Connections
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedText }]}>
          LIVE STATUS
        </Text>
      </View>

      {connectionsQuery.data ? (
        <ProviderConnectionGrid
          connections={connectionsQuery.data}
          onPressProvider={() => router.push('/(tabs)/settings')}
        />
      ) : (
        <Card>
          <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
            Connection status is unavailable right now. Pull down to refresh.
          </Text>
        </Card>
      )}

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color={colors.accent}
          />
          <Text style={[styles.infoText, { color: colors.secondaryText }]}>
            Provider tokens stay server-side. Pull down to refresh your
            connections and repositories.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  headerCopy: { flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 280 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionHint: { fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  summaryCard: { flex: 1, marginBottom: 0 },
  summaryValue: { fontSize: 26, fontWeight: '700', marginBottom: 3 },
  summaryLabel: { fontSize: 13, fontWeight: '600' },
  summaryState: { fontSize: 11, marginTop: 10, lineHeight: 15 },
  cardBody: { fontSize: 13, lineHeight: 20 },
  inlineButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },
  inlineButtonLabel: { fontSize: 12, fontWeight: '600' },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 14,
  },
  primaryActionLabel: { fontSize: 13, fontWeight: '700' },
  infoCard: { marginTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
