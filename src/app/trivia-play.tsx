import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/icon';
import { Mascot } from '@/components/memorize/mascot';
import { AppText, Button, Confetti, EmptyState, ProgressBar } from '@/components/ui';
import { parseReference } from '@/data/bible/references';
import { CHEERS, pick } from '@/data/memorize';
import type { TriviaLevel } from '@/data/trivia';
import { checkAchievements, unlock } from '@/db/achievements';
import { addXp } from '@/db/memorize';
import { buildRound, recordTriviaAnswer } from '@/db/trivia';
import { openReader } from '@/lib/bible/navigation';
import { haptics } from '@/lib/haptics';
import { shuffle } from '@/lib/random';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** A round of Bible trivia with instant feedback and explanations. */
export default function TriviaPlay() {
  const params = useLocalSearchParams<{ level?: TriviaLevel; topic?: string; book?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const round = useMemo(
    () => buildRound({ level: params.level, topic: params.topic, book: params.book ? Number(params.book) : undefined }),
    [params.level, params.topic, params.book],
  );
  const shuffled = useMemo(() => round.map((q) => shuffle(q.options)), [round]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const xp = useRef(0);

  if (round.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + space.xl, padding: space.lg }}>
        <EmptyState icon="lightbulb" title="No questions here yet" message="Try another level or topic." action={{ title: 'Back', onPress: () => router.back() }} />
      </View>
    );
  }

  const q = round[index];
  const answer = q.options[0];
  const answered = choice !== null;
  const correct = choice === answer;

  const select = (option: string) => {
    if (answered) return;
    setChoice(option);
    const ok = option === answer;
    recordTriviaAnswer(q.id, ok);
    if (ok) {
      haptics.success();
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      xp.current += q.level === 'hard' ? 4 : q.level === 'medium' ? 3 : 2;
      setBurst((b) => b + 1);
    } else {
      haptics.error();
      setStreak(0);
    }
  };

  const next = () => {
    if (index + 1 >= round.length) {
      const perfect = score === round.length;
      if (perfect) xp.current += 5;
      addXp(xp.current, 'trivia');
      if (perfect && round.length >= 5) unlock('trivia-perfect');
      checkAchievements();
      setDone(true);
      setBurst((b) => b + 1);
      return;
    }
    setChoice(null);
    setIndex((i) => i + 1);
  };

  if (done) {
    const perfect = score === round.length;
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.lg, paddingHorizontal: space.lg, alignItems: 'center', gap: space.lg }}>
        <Mascot mood="cheer" size={150} bounceKey={burst} />
        <AppText variant="largeTitle">{perfect ? 'Perfect round!' : pick(CHEERS.done)}</AppText>
        <AppText variant="title2" color="gold">
          {score} / {round.length} correct
        </AppText>
        <AppText variant="callout" color="textSecondary">
          +{xp.current} XP
        </AppText>
        <View style={{ flex: 1 }} />
        <View style={{ alignSelf: 'stretch', gap: space.sm }}>
          <Button title="Play Again" icon="refresh" onPress={() => router.replace({ pathname: '/trivia-play', params })} />
          <Button title="Done" variant="ghost" onPress={() => router.back()} />
        </View>
        <Confetti burstKey={burst} count={40} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Quit trivia">
          <Icon name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={(index + (answered ? 1 : 0)) / round.length} height={12} color={colors.gold} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="flame" size={20} color={streak > 1 ? colors.gold : colors.textTertiary} strokeWidth={2.2} />
          <AppText variant="headline" color={streak > 1 ? 'gold' : 'textTertiary'}>
            {streak}
          </AppText>
        </View>
      </View>

      <ScrollView key={index} contentContainerStyle={{ padding: space.lg, paddingBottom: insets.bottom + 140, gap: space.lg }}>
        <Animated.View entering={FadeIn.duration(250)} style={{ gap: space.sm }}>
          <AppText variant="overline" color="gold">
            {q.level} · {q.topic}
          </AppText>
          <AppText variant="title2">{q.question}</AppText>
        </Animated.View>
        <View style={{ gap: space.sm }}>
          {shuffled[index].map((o) => {
            const state = answered ? (o === answer ? 'correct' : o === choice ? 'wrong' : 'idle') : 'idle';
            const border = state === 'correct' ? colors.sage : state === 'wrong' ? colors.rose : colors.separator;
            const bg = state === 'correct' ? colors.sageSoft : state === 'wrong' ? colors.roseSoft : colors.surface;
            return (
              <Pressable
                key={o}
                disabled={answered}
                onPress={() => select(o)}
                style={({ pressed }) => ({
                  minHeight: 58,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderBottomWidth: 4,
                  borderColor: border,
                  backgroundColor: bg,
                  justifyContent: 'center',
                  opacity: answered && state === 'idle' ? 0.55 : 1,
                  transform: [{ translateY: pressed ? 2 : 0 }],
                })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <AppText variant="headline" style={{ flex: 1 }}>
                    {o}
                  </AppText>
                  {state === 'correct' && <Icon name="check" size={20} color={colors.sage} strokeWidth={2.6} />}
                  {state === 'wrong' && <Icon name="close" size={20} color={colors.rose} strokeWidth={2.6} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {answered && (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={{ backgroundColor: correct ? colors.sageSoft : colors.roseSoft, borderRadius: radius.lg, padding: space.lg, gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Mascot mood={correct ? 'cheer' : 'sad'} size={56} bounceKey={burst} />
              <AppText variant="title3" style={{ color: correct ? colors.sage : colors.rose, flex: 1 }}>
                {correct ? pick(CHEERS.correct) : 'Not quite. Now you know!'}
              </AppText>
            </View>
            <AppText variant="callout">{q.explanation}</AppText>
            <Pressable
              onPress={() => {
                const r = parseReference(q.reference);
                if (!r) return;
                router.back();
                setTimeout(() => openReader(r.book, r.chapter, r.verseStart), 60);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
              <Icon name="openBook" size={16} color={colors.gold} />
              <AppText variant="subhead" color="gold" weight="700">
                {q.reference}
              </AppText>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {answered && (
        <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: insets.bottom + space.lg }}>
          <Button title={index + 1 >= round.length ? 'See Results' : 'Next'} onPress={next} />
        </View>
      )}
      <Confetti burstKey={burst} count={18} />
    </View>
  );
}
