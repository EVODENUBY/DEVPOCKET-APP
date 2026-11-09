import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { EmptyState } from '../src/components/ui/EmptyState';
import { Screen } from '../src/components/ui/Screen';
import { useAppTheme } from '../src/theme/useAppTheme';

export default function NotificationsScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen
      title="Notifications"
      subtitle="Updates that matter across your workspace."
    >
      <EmptyState
        title="Notifications are not available yet"
        description="No provider events or notifications are being generated. In-app delivery and user preferences will be added with activity synchronization."
        label="Waiting for integrations"
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/settings')}
        style={styles.button}
      >
        <Text style={[styles.link, { color: colors.primary }]}>
          Manage app settings
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  link: { fontSize: 14, fontWeight: '700' },
});
