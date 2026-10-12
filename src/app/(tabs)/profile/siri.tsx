import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { router, Stack } from 'expo-router';
import { Linking, View } from 'react-native';

import { AppText, Button, Card, IconBadge, Screen } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

const LINK = 'abide://votd?speak=1';

/** How to ask Siri: "Give me today's verse." */
export default function SiriScreen() {
  const { colors } = useTheme();
  const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  const steps = [
    'Open the Shortcuts app and tap + to make a new shortcut.',
    'Tap “Add Action”, search for “Open URLs”, and add it.',
    `Paste this link as the URL: ${LINK}`,
    'Tap the shortcut’s name at the top and rename it “Give me today’s verse”.',
    'Done! Now say, “Hey Siri, give me today’s verse.” Abide opens and reads today’s verse aloud.',
  ];

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Siri & Shortcuts' }} />
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <IconBadge name="sparkle" tone="gold" size={68} />
        <AppText variant="title2" align="center">
          “Hey Siri, give me today’s verse”
        </AppText>
        <AppText variant="callout" color="textSecondary" align="center">
          Set it up once in the Shortcuts app. It takes about a minute.
        </AppText>
      </View>

      <Card style={{ gap: space.lg }}>
        {steps.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.md }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="caption" color="gold" weight="700">
                {i + 1}
              </AppText>
            </View>
            <AppText variant="callout" style={{ flex: 1, lineHeight: 22 }}>
              {s}
            </AppText>
          </View>
        ))}
      </Card>

      <View style={{ backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: space.md }}>
        <AppText variant="footnote" color="textSecondary" style={{ fontFamily: 'Menlo' }} selectable>
          {LINK}
        </AppText>
      </View>
      <Button
        title="Copy Link"
        icon="copy"
        variant="secondary"
        onPress={async () => {
          await Clipboard.setStringAsync(LINK);
          haptics.success();
        }}
      />
      <Button title="Open Shortcuts" icon="share" onPress={() => Linking.openURL('shortcuts://')} />
      <Button title="Try It Now" variant="ghost" onPress={() => router.push({ pathname: '/votd', params: { speak: '1' } })} />

      {inExpoGo && (
        <AppText variant="footnote" color="textTertiary" align="center">
          The abide:// link works in your own installed build of the app (a development build), not inside Expo Go. “Try It Now” works anywhere.
        </AppText>
      )}
    </Screen>
  );
}
