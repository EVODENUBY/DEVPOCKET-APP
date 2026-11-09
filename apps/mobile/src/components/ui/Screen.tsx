import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/useAppTheme';
import { AuroraBackground } from './AuroraBackground';

type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
};

export function Screen({ children, title, subtitle, eyebrow }: ScreenProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AuroraBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {title ? (
            <View style={styles.header}>
              {eyebrow ? (
                <Text style={[styles.eyebrow, { color: colors.primary }]}>
                  {eyebrow.toUpperCase()}
                </Text>
              ) : null}
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={[styles.subtitle, { color: colors.secondaryText }]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  header: { marginBottom: 22 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 9,
  },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.9 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 6 },
});
