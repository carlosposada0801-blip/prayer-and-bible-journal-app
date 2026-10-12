import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { ScriptureQuote } from '@/components/scripture-quote';
import { Appear, AppText, EmptyState, PressableScale, Screen } from '@/components/ui';
import { useLive } from '@/db/live';
import { answeredPrayers } from '@/db/prayers';
import { daysBetween, formatDate } from '@/lib/dates';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** A timeline of answered prayers – a record of God's faithfulness. */
export default function AnsweredTimeline() {
  const prayers = useLive(answeredPrayers, ['prayers']);
  const { colors, shadow } = useTheme();

  // Group by month.
  const groups = new Map<string, typeof prayers>();
  prayers.forEach((p) => {
    const key = new Date(p.answered_at!).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    groups.set(key, [...(groups.get(key) ?? []), p]);
  });

  let index = 0;
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Answered Prayers' }} />
      <Appear index={0}>
        <View style={{ paddingVertical: space.md }}>
          <ScriptureQuote reference="Psalm 77:11" />
        </View>
      </Appear>

      {prayers.length === 0 && (
        <EmptyState icon="sparkle" tone="sage" title="Nothing here yet" message="When God answers a prayer, mark it answered and it will appear here." />
      )}

      {[...groups.entries()].map(([month, items]) => (
        <View key={month} style={{ gap: space.md }}>
          <AppText variant="overline" color="gold">
            {month}
          </AppText>
          <View style={{ paddingLeft: 22 }}>
            {/* The timeline line */}
            <View style={{ position: 'absolute', left: 6, top: 8, bottom: 8, width: 2, borderRadius: 1, backgroundColor: colors.sageSoft }} />
            {items.map((p) => {
              const waited = daysBetween(new Date(p.created_at), new Date(p.answered_at!));
              return (
                <Appear key={p.id} index={Math.min(++index, 8)}>
                  <View style={{ marginBottom: space.md }}>
                    <View
                      style={{
                        position: 'absolute',
                        left: -22,
                        top: 18,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: colors.sage,
                        borderWidth: 3,
                        borderColor: colors.background,
                      }}
                    />
                    <PressableScale
                      onPress={() => router.push({ pathname: '/prayer/[id]', params: { id: p.id } })}
                      style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', padding: space.lg, gap: space.sm }, shadow.low]}>
                      <AppText variant="caption" color="textTertiary">
                        {formatDate(p.answered_at!)} · prayed {waited <= 0 ? 'the same day' : `${waited} day${waited === 1 ? '' : 's'}`}
                      </AppText>
                      <AppText variant="headline">{p.title}</AppText>
                      {p.answer_note ? (
                        <AppText variant="scripture" style={{ fontSize: 16, lineHeight: 25 }} numberOfLines={4}>
                          {p.answer_note}
                        </AppText>
                      ) : null}
                    </PressableScale>
                  </View>
                </Appear>
              );
            })}
          </View>
        </View>
      ))}
    </Screen>
  );
}
