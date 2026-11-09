import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';
import { GlassPanel } from './GlassPanel';

type EmptyStateProps = {
  title: string;
  description: string;
  label?: string;
};

export function EmptyState({ title, description, label }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <GlassPanel style={styles.card}>
      <View style={[styles.marker, { backgroundColor: colors.accentSoft }]}>
        <Text style={[styles.markerText, { color: colors.accent }]}>i</Text>
      </View>
      {label ? (
        <Text style={[styles.label, { color: colors.warning }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.secondaryText }]}>
        {description}
      </Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18 },
  marker: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 14,
  },
  markerText: { fontSize: 17, fontWeight: '800' },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 7 },
  description: { fontSize: 14, lineHeight: 21 },
});
