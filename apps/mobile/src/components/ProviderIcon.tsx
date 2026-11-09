import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

export type ProviderKey = 'github' | 'gitlab' | 'vercel' | 'render';

type IconName = ComponentProps<typeof Ionicons>['name'];

const iconNames: Partial<Record<ProviderKey, IconName>> = {
  github: 'logo-github',
  gitlab: 'logo-gitlab',
  vercel: 'logo-vercel',
};

export const providerLabels: Record<ProviderKey, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  vercel: 'Vercel',
  render: 'Render',
};

type ProviderIconProps = {
  provider: ProviderKey;
  size?: number;
};

export function ProviderIcon({ provider, size = 40 }: ProviderIconProps) {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const brand: Record<ProviderKey, string> = {
    github: isDark ? '#E6EDF3' : '#24292F',
    gitlab: '#FC6D26',
    vercel: isDark ? '#FFFFFF' : '#000000',
    render: isDark ? '#A78BFA' : '#7C3AED',
  };

  const color = brand[provider];
  const iconSize = Math.round(size * 0.78);
  const iconName = iconNames[provider];

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {iconName ? (
        <Ionicons name={iconName} size={iconSize} color={color} />
      ) : (
        <Text
          style={{
            color,
            fontSize: Math.round(size * 0.72),
            fontWeight: '900',
            letterSpacing: -0.5,
          }}
        >
          R
        </Text>
      )}
    </View>
  );
}
