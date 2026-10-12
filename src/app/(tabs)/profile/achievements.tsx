import { Stack } from 'expo-router';

import { AppText, Screen } from '@/components/ui';

export default function AchievementsScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Achievements' }} />
      <AppText color="textSecondary">Achievements are coming next.</AppText>
    </Screen>
  );
}
