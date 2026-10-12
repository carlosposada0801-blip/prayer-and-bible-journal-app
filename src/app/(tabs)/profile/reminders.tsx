import { Stack } from 'expo-router';
import { Alert, Linking, Switch, View } from 'react-native';

import type { IconName } from '@/components/icons/icon';
import { AppText, Card, IconBadge, Screen } from '@/components/ui';
import { DateField } from '@/components/ui/date-field';
import { requestPermission, rescheduleReminders } from '@/lib/notifications';
import { setPreference, usePreferences, type ReminderKind } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

const KINDS: { kind: ReminderKind; title: string; subtitle: string; icon: IconName; tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy' }[] = [
  { kind: 'study', title: 'Daily Study', subtitle: 'Your 5-minute Bible lesson', icon: 'lightbulb', tone: 'sky' },
  { kind: 'prayer', title: 'Prayer', subtitle: 'A nudge to talk with God', icon: 'hands', tone: 'sage' },
  { kind: 'practice', title: 'Verse Practice', subtitle: 'Keep your memory verses fresh', icon: 'heart', tone: 'rose' },
  { kind: 'person', title: 'Pray for Someone', subtitle: 'One person from your prayer list', icon: 'people', tone: 'sky' },
  { kind: 'plan', title: 'Reading Plan', subtitle: 'Today’s plan reading', icon: 'calendar', tone: 'gold' },
];

/** Separate daily reminder times for study, prayer, practice and more. */
export default function RemindersScreen() {
  const prefs = usePreferences();
  const { colors } = useTheme();

  const update = async (kind: ReminderKind, patch: Partial<{ enabled: boolean; hour: number; minute: number }>) => {
    if (patch.enabled && !(await requestPermission())) {
      Alert.alert('Notifications are off', 'To get reminders, allow notifications for Expo Go (or Abide) in Settings.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    setPreference('reminders', { ...prefs.reminders, [kind]: { ...prefs.reminders[kind], ...patch } });
    rescheduleReminders();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Reminders' }} />
      <AppText variant="callout" color="textSecondary">
        Gentle daily reminders, never guilt. Choose a time for each.
      </AppText>
      {KINDS.map((k) => {
        const r = prefs.reminders[k.kind];
        const time = new Date();
        time.setHours(r.hour, r.minute, 0, 0);
        return (
          <Card key={k.kind} style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <IconBadge name={k.icon} tone={k.tone} size={40} />
              <View style={{ flex: 1 }}>
                <AppText variant="headline">{k.title}</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {k.subtitle}
                </AppText>
              </View>
              <Switch value={r.enabled} trackColor={{ true: colors.gold }} onValueChange={(on) => update(k.kind, { enabled: on })} />
            </View>
            {r.enabled && (
              <DateField label="Time" mode="time" value={time} onChange={(d) => update(k.kind, { hour: d.getHours(), minute: d.getMinutes() })} />
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
