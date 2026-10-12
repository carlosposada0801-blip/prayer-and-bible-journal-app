import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AchievementToast } from '@/components/achievement-toast';
import { prepareDatabase } from '@/db/database';
import { warmUp } from '@/lib/bible/engine';
import { getPreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';

/**
 * Root of the app. A Stack wraps the tabs so native sheets and full-screen
 * experiences (a quiz, guided prayer) can open on top of any tab.
 */
export default function RootLayout() {
  const { colors, isDark } = useTheme();
  // In web previews, SQLite needs to load before the first screen renders.
  const [ready, setReady] = useState(Platform.OS !== 'web');
  useEffect(() => {
    if (ready) {
      warmUp(getPreferences().translation);
      return;
    }
    prepareDatabase()
      .then(() => warmUp(getPreferences().translation))
      .finally(() => setReady(true));
  }, [ready]);
  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.gold,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.separator,
    },
  };

  // Native iOS sheet with a grabber that can be dragged between half and full height.
  const sheet = {
    presentation: 'formSheet' as const,
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.6, 1],
    sheetCornerRadius: 28,
    contentStyle: { backgroundColor: colors.background },
  };
  const fullSheet = { ...sheet, sheetAllowedDetents: [1] };
  // Card-style modal for writing (swipe down to dismiss).
  const modal = { presentation: 'modal' as const, contentStyle: { backgroundColor: colors.background } };
  // Immersive full-screen experiences (no tab bar).
  const immersive = { presentation: 'fullScreenModal' as const, animation: 'fade' as const };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {ready && (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chapter-picker" options={fullSheet} />
          <Stack.Screen name="translation-picker" options={sheet} />
          <Stack.Screen name="reader-settings" options={sheet} />
          <Stack.Screen name="verse-note" options={fullSheet} />
          <Stack.Screen name="cross-references" options={sheet} />
          <Stack.Screen name="prayer-editor" options={modal} />
          <Stack.Screen name="prayer-answer" options={fullSheet} />
          <Stack.Screen name="person-editor" options={sheet} />
          <Stack.Screen name="guided-prayer" options={immersive} />
          <Stack.Screen name="practice" options={{ ...immersive, gestureEnabled: false }} />
          <Stack.Screen name="trivia-play" options={{ ...immersive, gestureEnabled: false }} />
          <Stack.Screen name="verse-level" options={{ ...sheet, sheetAllowedDetents: [0.55, 1] }} />
        </Stack>
        )}
        {ready && <AchievementToast />}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
