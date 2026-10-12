import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';

import { MascotSays } from '@/components/memorize/mascot';
import { Appear, AppText, Card, Chip, IconBadge, PressableScale, ProgressBar, SectionHeader } from '@/components/ui';
import { BOOKS } from '@/data/bible/books';
import { TRIVIA, TRIVIA_TOPICS, type TriviaLevel } from '@/data/trivia';
import { useLive } from '@/db/live';
import { bookOf, triviaStats, triviaStatsByLevel } from '@/db/trivia';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

const LEVELS: { level: TriviaLevel; title: string; subtitle: string; tone: 'sage' | 'gold' | 'rose' }[] = [
  { level: 'easy', title: 'Easy', subtitle: 'Favorite stories everyone knows', tone: 'sage' },
  { level: 'medium', title: 'Medium', subtitle: 'For regular Bible readers', tone: 'gold' },
  { level: 'hard', title: 'Hard', subtitle: 'Deep cuts and lesser-known heroes', tone: 'rose' },
];

/** "Trivia" section of the Grow tab. */
export function TriviaHome() {
  const { colors, shadow } = useTheme();
  const stats = useLive(triviaStats, ['trivia_answers']);
  const byLevel = useLive(() => Object.fromEntries(LEVELS.map((l) => [l.level, triviaStatsByLevel(l.level)])), ['trivia_answers']);
  const bookCounts = new Map<number, number>();
  TRIVIA.forEach((q) => bookCounts.set(bookOf(q), (bookCounts.get(bookOf(q)) ?? 0) + 1));
  const books = BOOKS.filter((b) => (bookCounts.get(b.id) ?? 0) >= 3);

  const play = (params: Record<string, string>) => router.push({ pathname: '/trivia-play', params });

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        <PressableScale onPress={() => play({})} accessibilityLabel="Play daily mix">
          <View style={[{ borderRadius: radius.xl, borderCurve: 'continuous' }, shadow.medium]}>
            <LinearGradient
              colors={colors.gradientVerse}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.sm }}>
              <AppText variant="overline" style={{ color: '#E2BE6A' }}>
                Daily mix
              </AppText>
              <AppText variant="title1" style={{ color: colors.textOnDark }}>
                10 questions
              </AppText>
              <AppText variant="subhead" style={{ color: 'rgba(251, 246, 234, 0.75)' }}>
                A little of everything. Earn XP for every right answer.
              </AppText>
              {stats.total > 0 && (
                <AppText variant="footnote" style={{ color: '#E2BE6A', marginTop: space.xs }}>
                  {stats.correct} of {stats.total} answered correctly so far
                </AppText>
              )}
            </LinearGradient>
          </View>
        </PressableScale>
      </Appear>

      <Appear index={1}>
        <MascotSays mood="happy" size={60} text="Every answer comes with the verse, so you learn as you play!" />
      </Appear>

      <SectionHeader title="Levels" />
      {LEVELS.map((l, i) => {
        const s = byLevel[l.level];
        return (
          <Appear key={l.level} index={i + 2}>
            <Card onPress={() => play({ level: l.level })} style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <IconBadge name="lightbulb" tone={l.tone} />
                <View style={{ flex: 1 }}>
                  <AppText variant="headline">{l.title}</AppText>
                  <AppText variant="subhead" color="textSecondary">
                    {l.subtitle}
                  </AppText>
                </View>
              </View>
              <View style={{ gap: 4 }}>
                <ProgressBar progress={s.mastered / s.total} color={colors[l.tone]} />
                <AppText variant="caption" color="textTertiary">
                  {s.mastered} of {s.total} mastered
                </AppText>
              </View>
            </Card>
          </Appear>
        );
      })}

      <SectionHeader title="By topic" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {TRIVIA_TOPICS.map((t) => (
          <Chip key={t} label={`${t} · ${TRIVIA.filter((q) => q.topic === t).length}`} onPress={() => play({ topic: t })} />
        ))}
      </View>

      <SectionHeader title="By book" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {books.map((b) => (
          <Chip key={b.id} label={`${b.name} · ${bookCounts.get(b.id)}`} onPress={() => play({ book: String(b.id) })} />
        ))}
      </View>
    </View>
  );
}
