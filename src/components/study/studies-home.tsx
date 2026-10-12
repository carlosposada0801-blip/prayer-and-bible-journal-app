import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Card, IconBadge, PressableScale, ProgressBar, SectionHeader } from '@/components/ui';
import { formatReference, ref } from '@/data/bible/references';
import { isPublished, STUDY_SERIES } from '@/data/studies';
import { useLive } from '@/db/live';
import { completedLessonIds, completedToday, todaysLesson } from '@/db/study';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** "Studies" section of the Bible tab. */
export function StudiesHome() {
  const { colors, shadow } = useTheme();
  const done = useLive(completedLessonIds, ['study_progress']);
  const today = useLive(todaysLesson, ['study_progress']);
  const finishedToday = useLive(completedToday, ['study_progress']);

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        {today ? (
          <PressableScale
            onPress={() => router.push({ pathname: '/bible/lesson/[id]', params: { id: today.lesson.id } })}
            accessibilityLabel={`Today's study: ${today.lesson.title}`}>
            <View style={[{ borderRadius: radius.xl, borderCurve: 'continuous' }, shadow.medium]}>
              <LinearGradient
                colors={colors.gradientDawn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.sm, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', right: -18, top: -6, opacity: 0.12 }}>
                  <Icon name="lightbulb" size={150} color={colors.gold} strokeWidth={1.1} />
                </View>
                <AppText variant="overline" color="gold">
                  {finishedToday ? 'Up next' : "Today's study"} · {today.series.title}
                </AppText>
                <AppText variant="title1">{today.lesson.title}</AppText>
                <AppText variant="subhead" color="textSecondary">
                  Lesson {today.index + 1} of {today.series.lessons.length} · {formatReference(ref(today.lesson.passage))} · 5 min
                </AppText>
                {finishedToday && (
                  <AppText variant="footnote" color="sage" weight="600">
                    You finished today’s lesson. Well done! Read ahead anytime.
                  </AppText>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm }}>
                  <AppText variant="headline" color="gold">
                    {finishedToday ? 'Read ahead' : 'Begin'}
                  </AppText>
                  <Icon name="chevronRight" size={16} color={colors.gold} strokeWidth={2.2} />
                </View>
              </LinearGradient>
            </View>
          </PressableScale>
        ) : (
          <Card style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.xl }}>
            <IconBadge name="trophy" tone="gold" size={60} />
            <AppText variant="title3">All caught up!</AppText>
            <AppText variant="callout" color="textSecondary" align="center">
              You’ve completed every published study. New series are on the way.
            </AppText>
          </Card>
        )}
      </Appear>

      <Appear index={1}>
        <SectionHeader title="Series" />
      </Appear>
      {STUDY_SERIES.map((series, i) => {
        const published = isPublished(series);
        const complete = series.lessons.filter((l) => done.has(l.id)).length;
        return (
          <Appear key={series.id} index={i + 2}>
            <Card
              onPress={() => router.push({ pathname: '/bible/series/[id]', params: { id: series.id } })}
              style={{ gap: space.md, opacity: published ? 1 : 0.85 }}>
              <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                <IconBadge name={series.icon} tone={series.tone} size={48} />
                <View style={{ flex: 1 }}>
                  <AppText variant="headline">{series.title}</AppText>
                  <AppText variant="subhead" color="textSecondary">
                    {series.subtitle}
                  </AppText>
                </View>
                {!published && (
                  <View style={{ backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <AppText variant="caption" color="textSecondary" weight="600">
                      Soon
                    </AppText>
                  </View>
                )}
              </View>
              {published && (
                <View style={{ gap: 6 }}>
                  <ProgressBar progress={complete / series.lessons.length} color={colors[series.tone === 'navy' ? 'primary' : series.tone]} />
                  <AppText variant="caption" color="textTertiary">
                    {complete} of {series.lessons.length} lessons
                  </AppText>
                </View>
              )}
            </Card>
          </Appear>
        );
      })}
    </View>
  );
}
