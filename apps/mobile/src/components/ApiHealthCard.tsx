import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiNetworkError, fetchApiHealth } from '../api/health';
import { useAppTheme } from '../theme/useAppTheme';
import { Card } from './ui/Card';

export function ApiHealthCard() {
  const { colors } = useAppTheme();
  const healthQuery = useQuery({
    queryKey: ['api', 'health'],
    queryFn: ({ signal }) => fetchApiHealth(signal),
    retry: (failureCount, error) =>
      error instanceof ApiNetworkError && failureCount < 1,
  });
  const connected = healthQuery.isSuccess;
  const statusColor = connected
    ? colors.success
    : healthQuery.isError
      ? colors.error
      : colors.warning;
  const statusLabel = connected
    ? 'API connected'
    : healthQuery.isError
      ? 'API unavailable'
      : 'Checking API';

  return (
    <Card>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>
          Backend status
        </Text>
        <View
          style={[styles.badge, { backgroundColor: colors.selectedSurface }]}
        >
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
      {healthQuery.isPending ? (
        <Text style={[styles.detail, { color: colors.secondaryText }]}>
          Checking the configured API address…
        </Text>
      ) : healthQuery.isError ? (
        <>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.detail, { color: colors.error }]}
          >
            {healthQuery.error.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void healthQuery.refetch()}
            style={[styles.retryButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.retryLabel, { color: colors.text }]}>
              Try again
            </Text>
          </Pressable>
        </>
      ) : (
        <Text style={[styles.detail, { color: colors.secondaryText }]}>
          Responding since{' '}
          {new Date(healthQuery.data.timestamp).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
          . Provider data is not connected.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  title: { fontSize: 15, fontWeight: '700' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  detail: { fontSize: 13, lineHeight: 19 },
  retryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },
  retryLabel: { fontSize: 12, fontWeight: '600' },
});
