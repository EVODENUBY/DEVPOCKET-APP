import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';
import type { ReactNode } from 'react';
import { useAppTheme } from '../../theme/useAppTheme';

type CardProps = ViewProps & {
  children: ReactNode;
  intense?: boolean;
};

export function Card({
  children,
  style,
  intense = false,
  ...props
}: CardProps) {
  const { colors } = useAppTheme();
  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: intense
            ? colors.glassSurfaceStrong
            : colors.glassSurface,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors.cardSheen}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
});
