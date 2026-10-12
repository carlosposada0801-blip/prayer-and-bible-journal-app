import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, Confetti, Screen } from '@/components/ui';
import { formatReference, type Reference } from '@/data/bible/references';
import { checkAchievements } from '@/db/achievements';
import { useLive } from '@/db/live';
import { getPlanState, setDayComplete } from '@/db/plans';
import { usePassage } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { haptics } from '@/lib/haptics';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** Read one day of a plan right here, then mark it complete. */
export default function PlanDay() {
  const params = useLocalSearchParams<{ plan: string; day: string }>();
  const day = Number(params.day);
  const state = useLive(() => getPlanState(params.plan), ['plans', 'plan_days'], [params.plan]);
  const { colors } = useTheme();
  const [burst, setBurst] = useState(0);
  if (!state) return null;

  const readings = state.plan.schedule(state.options.pace)[day - 1] ?? [];
  const done = state.completed.has(day);
  const hasNext = day < state.totalDays;

  return (
    <View style={{ flex: 1 }}>
      <Screen contentContainerStyle={{ gap: space.xl }}>
        <Stack.Screen options={{ title: `Day ${day}` }} />
        <Appear index={0}>
          <View style={{ gap: space.xs }}>
            <AppText variant="overline" color="gold">
              {state.plan.title}
            </AppText>
            <AppText variant="title1">{readings.map((r) => formatReference(r)).join(' · ')}</AppText>
          </View>
        </Appear>
        {readings.map((r, i) => (
          <Appear key={formatReference(r)} index={i + 1}>
            <Passage reference={r} />
          </Appear>
        ))}
        {done ? (
          <View style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm }}>
              <Icon name="check" size={20} color={colors.sage} strokeWidth={2.6} />
              <AppText variant="headline" color="sage">
                Day {day} complete
              </AppText>
            </View>
            {hasNext && (
              <Button title={`Continue to Day ${day + 1}`} variant="secondary" onPress={() => router.setParams({ day: String(day + 1) })} />
            )}
          </View>
        ) : (
          <Button
            title="Mark Day Complete"
            icon="check"
            onPress={() => {
              const after = setDayComplete(state.plan.id, day, true);
              haptics.success();
              setBurst((b) => b + 1);
              checkAchievements();
              if (after?.done) setTimeout(() => router.back(), 1500);
            }}
          />
        )}
      </Screen>
      <Confetti burstKey={burst} count={24} />
    </View>
  );
}

function Passage({ reference }: { reference: Reference }) {
  const prefs = usePreferences();
  const { colors } = useTheme();
  const { data, loading } = usePassage(reference);
  return (
    <Card style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AppText variant="headline" color="gold" style={{ flex: 1 }}>
          {formatReference(reference)}
        </AppText>
        <Pressable onPress={() => openReader(reference.book, reference.chapter, reference.verseStart)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <AppText variant="footnote" color="textTertiary">
            {prefs.translation}
          </AppText>
          <Icon name="openBook" size={16} color={colors.textTertiary} />
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        <AppText variant="scripture" style={{ fontSize: 18, lineHeight: 30 }}>
          {data?.map((v, i) => {
            const newChapter = i > 0 && v.chapter !== data[i - 1].chapter;
            return (
              <Text key={`${v.chapter}.${v.verse}`}>
                {newChapter ? '\n\n' : ''}
                <AppText variant="caption" color="gold" weight="700">
                  {v.verse === 1 ? `${v.chapter}:1` : v.verse}{' '}
                </AppText>
                {v.text}{' '}
              </Text>
            );
          })}
        </AppText>
      )}
    </Card>
  );
}
