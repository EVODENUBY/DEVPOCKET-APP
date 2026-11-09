import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GithubRepository } from '../../api/providers';
import { useAppTheme } from '../../theme/useAppTheme';
import { Card } from '../ui/Card';

type GithubRepositoryListProps = {
  repositories: GithubRepository[] | undefined;
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
};

function formatUpdated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'unknown';
  }
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}

export function GithubRepositoryList({
  repositories,
  isPending,
  error,
  onRetry,
}: GithubRepositoryListProps) {
  const { colors } = useAppTheme();

  if (isPending) {
    return (
      <Card>
        <Text style={[styles.message, { color: colors.secondaryText }]}>
          Loading repositories from GitHub…
        </Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.message, { color: colors.error }]}
        >
          {error.message}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={[styles.retryButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.retryLabel, { color: colors.text }]}>
            Try again
          </Text>
        </Pressable>
      </Card>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <Card>
        <Text style={[styles.message, { color: colors.secondaryText }]}>
          No repositories were returned for this GitHub account.
        </Text>
      </Card>
    );
  }

  return (
    <View>
      {repositories.map((repository) => (
        <Pressable
          key={repository.id}
          accessibilityRole="link"
          accessibilityLabel={`Open ${repository.fullName} on GitHub`}
          onPress={() => void Linking.openURL(repository.url)}
        >
          <Card style={styles.repositoryCard}>
            <View style={styles.titleRow}>
              <View style={styles.titleGroup}>
                <Ionicons
                  name={repository.private ? 'lock-closed' : 'git-branch'}
                  size={15}
                  color={colors.primary}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.name, { color: colors.text }]}
                >
                  {repository.name}
                </Text>
              </View>
              {repository.private ? (
                <View
                  style={[styles.badge, { backgroundColor: colors.accentSoft }]}
                >
                  <Text style={[styles.badgeText, { color: colors.accent }]}>
                    PRIVATE
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              style={[styles.owner, { color: colors.mutedText }]}
            >
              {repository.fullName}
            </Text>
            {repository.description ? (
              <Text
                numberOfLines={2}
                style={[styles.description, { color: colors.secondaryText }]}
              >
                {repository.description}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {repository.language ? (
                <Text style={[styles.meta, { color: colors.secondaryText }]}>
                  {repository.language}
                </Text>
              ) : null}
              <Text style={[styles.meta, { color: colors.mutedText }]}>
                {repository.defaultBranch}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedText }]}>
                Updated {formatUpdated(repository.updatedAt)}
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: 13, lineHeight: 19 },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },
  retryLabel: { fontSize: 12, fontWeight: '600' },
  repositoryCard: { marginBottom: 10 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  name: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  owner: { fontSize: 11, marginTop: 3 },
  description: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  meta: { fontSize: 11, fontWeight: '600' },
});
