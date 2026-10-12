import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useTheme } from '@/theme/use-theme';

/**
 * The navigation stack inside each tab, with Apple-style large titles that
 * shrink into the bar as you scroll. Pages pushed inside a tab (e.g. a
 * lesson) get the native swipe-back gesture for free.
 */
export function TabStack({ title }: { title: string }) {
  const { colors } = useTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerTransparent: isIOS,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerTintColor: colors.gold,
        headerStyle: { backgroundColor: isIOS ? 'transparent' : colors.background },
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerTitleStyle: { color: colors.text },
        headerLargeTitleStyle: { color: colors.text },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="index" options={{ title }} />
    </Stack>
  );
}
