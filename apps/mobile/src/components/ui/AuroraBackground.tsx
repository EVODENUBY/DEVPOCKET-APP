import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

export function AuroraBackground() {
  const { colors, mode } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const size = Math.max(width, height) * 0.95;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={colors.auroraBase}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.blob,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.auroraA,
            top: -size * 0.38,
            left: -size * 0.32,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: size * 0.41,
            backgroundColor: colors.auroraB,
            bottom: -size * 0.3,
            right: -size * 0.28,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: size * 0.58,
            height: size * 0.58,
            borderRadius: size * 0.29,
            backgroundColor: colors.auroraC,
            top: height * 0.26,
            right: -size * 0.2,
          },
        ]}
      />

      <BlurView
        intensity={mode === 'dark' ? 38 : 24}
        tint={mode === 'dark' ? 'dark' : 'light'}
        blurMethod="dimezisBlurViewSdk31Plus"
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={colors.auroraOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    opacity: 0.9,
  },
});
