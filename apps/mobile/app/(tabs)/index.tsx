import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSessionStore } from '../../src/auth/sessionStore';
import { ApiHealthCard } from '../../src/components/ApiHealthCard';
import {
  ProviderIcon,
  type ProviderKey,
} from '../../src/components/ProviderIcon';
import { Card } from '../../src/components/ui/Card';
import { Screen } from '../../src/components/ui/Screen';
import { useAppTheme } from '../../src/theme/useAppTheme';

const providerCards: {
  key: ProviderKey;
  label: string;
  hint: string;
}[] = [
  { key: 'github', label: 'GitHub', hint: 'Repositories' },
  { key: 'gitlab', label: 'GitLab', hint: 'Repositories' },
  { key: 'vercel', label: 'Vercel', hint: 'Deployments' },
  { key: 'render', label: 'Render', hint: 'Services' },
];

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const user = useSessionStore((state) => state.user);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.secondaryText }]}>
            DEVELOPMENT OVERVIEW
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Your workspace'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Connect a provider to start monitoring your projects.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => router.push('/notifications')}
            style={[
              styles.settingsButton,
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
              styles.settingsButton,
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

      <ApiHealthCard />

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your connections
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedText }]}>
          LIVE DATA ONLY
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>—</Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
            Repositories
          </Text>
          <Text style={[styles.summaryState, { color: colors.warning }]}>
            Not connected
          </Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>—</Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
            Deployments
          </Text>
          <Text style={[styles.summaryState, { color: colors.warning }]}>
            Not connected
          </Text>
        </Card>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Connect a provider
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedText }]}>
          SECURE OAUTH
        </Text>
      </View>
      <View style={styles.providerGrid}>
        {providerCards.map((provider) => (
          <Card key={provider.key} style={styles.providerCard}>
            <View style={styles.providerTop}>
              <ProviderIcon provider={provider.key} size={38} />
              <View
                style={[
                  styles.soonPill,
                  {
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <Text style={[styles.soonText, { color: colors.accent }]}>
                  SOON
                </Text>
              </View>
            </View>
            <Text style={[styles.providerName, { color: colors.text }]}>
              {provider.label}
            </Text>
            <Text
              style={[styles.providerHint, { color: colors.secondaryText }]}
            >
              {provider.hint}
            </Text>
          </Card>
        ))}
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color={colors.accent}
          />
          <Text style={[styles.infoText, { color: colors.secondaryText }]}>
            Provider authorization and monitoring are not available yet. When
            they ship, OAuth tokens will stay server-side — never on this
            device.
          </Text>
        </View>
      </Card>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Delivery health
        </Text>
      </View>
      <Card>
        <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
          Deployment outcomes will be summarized here after Vercel or Render is
          securely connected.
        </Text>
      </Card>
      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent activity
        </Text>
      </View>
      <Card>
        <Text style={[styles.cardBody, { color: colors.secondaryText }]}>
          Activity will appear here after provider synchronization is
          implemented and configured.
        </Text>
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
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 280 },
  settingsButton: {
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
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1 },
  summaryValue: { fontSize: 26, fontWeight: '700', marginBottom: 3 },
  summaryLabel: { fontSize: 13, fontWeight: '600' },
  summaryState: { fontSize: 12, marginTop: 10 },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  providerCard: {
    flexGrow: 1,
    flexBasis: '46%',
    marginBottom: 0,
  },
  providerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  soonPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  soonText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  providerName: { fontSize: 15, fontWeight: '700' },
  providerHint: { fontSize: 12, marginTop: 3 },
  infoCard: { marginTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  cardBody: { fontSize: 14, lineHeight: 21 },
});
