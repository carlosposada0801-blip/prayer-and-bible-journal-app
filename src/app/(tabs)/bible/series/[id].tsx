import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, EmptyState, IconBadge, ProgressRing, Screen } from '@/components/ui';
import { formatReference, ref } from '@/data/bible/references';
import { getSeries, isPublished } from '@/data/studies';
import { useLive } from '@/db/live';
import { completedLessonIds } from '@/db/study';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export default function SeriesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const series = getSeries(id);
  const done = useLive(completedLessonIds, ['study_progress']);
  const { colors } = useTheme();

  if (!series) {
    return (
      <Screen>
        <EmptyState icon="bookClosed" title="Series not found" message="It may have been renamed." />
      </Screen>
    );
  }

  const published = isPublished(series);
  const complete = series.lessons.filter((l) => done.has(l.id)).length;
  const nextIndex = series.lessons.findIndex((l) => !done.has(l.id));

  return (
    <Screen>
      <Stack.Screen options={{ title: '' }} />
      <Appear index={0}>
        <View style={{ alignItems: 'center', gap: space.md }}>
          <ProgressRing progress={published ? complete / series.lessons.length : 0} size={112} stroke={8}>
            <IconBadge name={series.icon} tone={series.tone} size={72} />
          </ProgressRing>
          <View style={{ alignItems: 'center', gap: space.xs }}>
            <AppText variant="title1" align="center">
              {series.title}
            </AppText>
            <AppText variant="subhead" color="gold" weight="600">
              {published ? `${complete} of ${series.lessons.length} complete` : 'Coming soon'}
            </AppText>
          </View>
          <AppText variant="callout" color="textSecondary" align="center">
            {series.description}
          </AppText>
        </View>
      </Appear>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
        {series.lessons.map((lesson, i) => {
          const isDone = done.has(lesson.id);
          const isNext = published && i === nextIndex;
          return (
            <Pressable
              key={lesson.id}
              disabled={!published}
              onPress={() => router.push({ pathname: '/bible/lesson/[id]', params: { id: lesson.id } })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                padding: space.lg,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.separator,
                backgroundColor: pressed ? colors.surfaceMuted : isNext ? colors.goldSoft : 'transparent',
              })}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone ? colors.sage : colors.surfaceMuted,
                }}>
                {isDone ? (
                  <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.6} />
                ) : (
                  <AppText variant="subhead" weight="700" color="textSecondary">
                    {i + 1}
                  </AppText>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="headline">{lesson.title}</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {formatReference(ref(lesson.passage))}
                </AppText>
              </View>
              {published && <Icon name="chevronRight" size={16} color={colors.textTertiary} />}
            </Pressable>
          );
        })}
      </View>
      {!published && (
        <AppText variant="footnote" color="textTertiary" align="center">
          These lessons are being written. Check back soon!
        </AppText>
      )}
    </Screen>
  );
}
