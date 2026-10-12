import { Stack } from 'expo-router';

import { AppText, Screen } from '@/components/ui';

export default function FastingScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Fasting' }} />
      <AppText color="textSecondary">The fasting tracker is coming next.</AppText>
    </Screen>
  );
}
