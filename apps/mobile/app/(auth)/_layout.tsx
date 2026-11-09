import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '../../src/auth/sessionStore';
import { useAppTheme } from '../../src/theme/useAppTheme';

export default function AuthLayout() {
  const { colors } = useAppTheme();
  const status = useSessionStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
