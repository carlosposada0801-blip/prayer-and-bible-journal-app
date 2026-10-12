import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useTheme } from '@/theme/use-theme';

/**
 * The navigation stack inside each tab. The tab's home screen gets an
 * Apple-style large title that shrinks into the bar as you scroll. Pages
 * pushed inside a tab (e.g. a lesson) get the native swipe-back gesture.
 */
export function TabStack({ title }: { title: string }) {
  const { colors } = useTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <Stack
      screenOptions={{
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
      <Stack.Screen name="index" options={{ title, headerLargeTitleEnabled: true }} />
    </Stack>
  );
}
