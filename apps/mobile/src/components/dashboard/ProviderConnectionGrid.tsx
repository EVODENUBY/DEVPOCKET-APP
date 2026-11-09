import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProviderConnection, ProviderKey } from '../../api/providers';
import { useAppTheme } from '../../theme/useAppTheme';
import { ProviderIcon } from '../ProviderIcon';
import { Card } from '../ui/Card';

type ProviderConnectionGridProps = {
  connections: ProviderConnection[];
  onPressProvider: (provider: ProviderKey) => void;
};

export function ProviderConnectionGrid({
  connections,
  onPressProvider,
}: ProviderConnectionGridProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.grid}>
      {connections.map((connection) => {
        const statusColor = connection.connected
          ? connection.tokenStored
            ? colors.success
            : colors.warning
          : colors.mutedText;
        const statusLabel = connection.connected
          ? connection.tokenStored
            ? 'Connected'
            : 'Reconnect'
          : 'Not connected';
        const hint = connection.connected
          ? connection.repositoryAccess
            ? 'Repository access'
            : 'Token stored'
          : connection.key === 'github'
            ? 'Tap to connect'
            : 'Unavailable';

        return (
          <Pressable
            key={connection.key}
            accessibilityRole="button"
            accessibilityLabel={`${connection.label}: ${statusLabel}`}
            onPress={() => onPressProvider(connection.key)}
            style={styles.pressable}
          >
            <Card style={styles.card}>
              <View style={styles.top}>
                <ProviderIcon provider={connection.key} size={34} />
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: colors.selectedSurface },
                  ]}
                >
                  <View
                    style={[styles.dot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusLabel.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.name, { color: colors.text }]}>
                {connection.label}
              </Text>
              <Text style={[styles.hint, { color: colors.secondaryText }]}>
                {hint}
              </Text>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pressable: { flexGrow: 1, flexBasis: '46%' },
  card: { marginBottom: 0 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  name: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12, marginTop: 3 },
});
