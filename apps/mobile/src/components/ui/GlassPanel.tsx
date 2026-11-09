import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

type GlassPanelProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intense?: boolean;
};

export function GlassPanel({
  children,
  style,
  intense = false,
}: GlassPanelProps) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <BlurView
      intensity={isDark ? (intense ? 55 : 36) : intense ? 42 : 26}
      tint={isDark ? 'dark' : 'light'}
      blurMethod="dimezisBlurViewSdk31Plus"
      style={[
        styles.panel,
        {
          borderColor: colors.glassBorder,
          backgroundColor: intense
            ? colors.glassSurfaceStrong
            : colors.glassSurface,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors.sheen}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[styles.topEdge, { backgroundColor: colors.glassHighlight }]}
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: StyleSheet.hairlineWidth,
    opacity: 0.8,
  },
});
