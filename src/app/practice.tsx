import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/icon';
import { Mascot, MascotSays } from '@/components/memorize/mascot';
import {
  BlankQuestion,
  IntroQuestion,
  LettersQuestion,
  OrderQuestion,
  RecallDiff,
  RecallQuestion,
  ReferenceQuestion,
  type QuestionResult,
} from '@/components/memorize/questions';
import { AppText, Button, Confetti, ProgressBar, ProgressRing } from '@/components/ui';
import { parseReference } from '@/data/bible/references';
import { CHEERS, COURSE_VERSES, pick } from '@/data/memorize';
import { checkAchievements } from '@/db/achievements';
import {
  addXp,
  allMemoryVerses,
  dueVerses,
  gainHeart,
  getHearts,
  getMemoryVerse,
  levelFor,
  loseHeart,
  MEMORIZED_STAGE,
  recordPractice,
  totalXp,
  xpToday,
} from '@/db/memorize';
import { getPassageText } from '@/lib/bible/engine';
import { useAsync } from '@/lib/bible/hooks';
import { haptics } from '@/lib/haptics';
import { lessonQuestions, reviewQuestions, type Question } from '@/lib/memorize/quiz';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

type Plan = { questions: Question[]; references: string[]; stages: Record<string, number> };

/** Full-screen practice: a lesson for one verse, or a review of due verses. */
export default function Practice() {
  const params = useLocalSearchParams<{ mode?: 'lesson' | 'review'; ref?: string }>();
  const mode = params.mode ?? 'lesson';
  const prefs = usePreferences();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { data: plan, error } = useAsync<Plan>(async () => {
    const pool = [...new Set([...COURSE_VERSES, ...allMemoryVerses().map((v) => v.reference)])];
    if (mode === 'lesson' && params.ref) {
      const stage = getMemoryVerse(params.ref)?.stage ?? 0;
      const text = await getPassageText(prefs.translation, parseReference(params.ref)!);
      return { questions: lessonQuestions(params.ref, text, stage, pool), references: [params.ref], stages: { [params.ref]: stage } };
    }
    let due = dueVerses(5);
    if (due.length === 0) due = allMemoryVerses().filter((v) => v.stage > 0).sort((a, b) => (a.last_reviewed_at ?? '').localeCompare(b.last_reviewed_at ?? '')).slice(0, 3);
    const questions: Question[] = [];
    for (const v of due) {
      const text = await getPassageText(prefs.translation, parseReference(v.reference)!);
      questions.push(...reviewQuestions(v.reference, text, v.stage, pool));
    }
    return { questions, references: due.map((v) => v.reference), stages: Object.fromEntries(due.map((v) => [v.reference, v.stage])) };
  }, `${mode}:${params.ref}:${prefs.translation}`);

  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<(QuestionResult & { message: string }) | null>(null);
  const [hearts, setHearts] = useState(getHearts().hearts);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [finished, setFinished] = useState<null | { xp: number; accuracy: number; memorized: string[]; levelUp: number | null; newStage: number }>(null);
  const [burst, setBurst] = useState(0);
  const [cheerKey, setCheerKey] = useState(0);
  const mistakesByRef = useRef<Record<string, number>>({});
  const retried = useRef(new Set<number>());
  const answered = useRef({ total: 0, correct: 0 });

  useEffect(() => {
    if (plan) setQueue(plan.questions);
  }, [plan]);

  const question = queue[index];
  const progress = queue.length ? index / queue.length : 0;

  const onResult = (r: QuestionResult) => {
    if (question.kind === 'intro') return next();
    answered.current.total++;
    if (r.correct) answered.current.correct++;
    mistakesByRef.current[question.reference] = (mistakesByRef.current[question.reference] ?? 0) + r.mistakes;

    if (r.correct) {
      haptics.success();
      setCheerKey((k) => k + 1);
      if (r.mistakes === 0) setBurst((b) => b + 1);
    } else {
      haptics.error();
      // Ask missed questions again at the end (once).
      if (!retried.current.has(index)) {
        retried.current.add(index);
        setQueue((q) => [...q, question]);
      }
      if (mode === 'lesson') {
        const left = loseHeart();
        setHearts(left);
        if (left <= 0) {
          setFeedback({ ...r, message: pick(CHEERS.wrong) });
          setTimeout(() => setOutOfHearts(true), 900);
          return;
        }
      }
    }
    setFeedback({ ...r, message: r.correct ? (r.mistakes ? 'Good! Almost perfect.' : pick(CHEERS.correct)) : pick(CHEERS.wrong) });
  };

  const next = () => {
    setFeedback(null);
    if (index + 1 >= queue.length) finish();
    else setIndex((i) => i + 1);
  };

  const finish = () => {
    if (!plan) return;
    const levelBefore = levelFor(totalXp()).level;
    let xp = 0;
    const memorized: string[] = [];
    let newStage = 0;
    for (const reference of plan.references) {
      const mistakes = mistakesByRef.current[reference] ?? 0;
      if (mode === 'lesson') {
        const quality = mistakes === 0 ? 5 : 3;
        newStage = recordPractice(reference, quality, true);
        xp += 10 + (mistakes === 0 ? 5 : 0);
        if (newStage >= MEMORIZED_STAGE && plan.stages[reference] < MEMORIZED_STAGE) memorized.push(reference);
      } else {
        recordPractice(reference, mistakes === 0 ? 5 : mistakes <= 1 ? 3 : 1, false);
        xp += 5;
      }
    }
    if (mode === 'review') gainHeart();
    addXp(xp, mode);
    const levelAfter = levelFor(totalXp()).level;
    checkAchievements();
    haptics.success();
    setBurst((b) => b + 1);
    const { total, correct } = answered.current;
    setFinished({ xp, accuracy: total ? correct / total : 1, memorized, levelUp: levelAfter > levelBefore ? levelAfter : null, newStage });
  };

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.background }}>
        <AppText color="textSecondary" align="center">
          {error.message}
        </AppText>
        <Button title="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  if (finished) return <Results {...finished} mode={mode} burst={burst} />;

  if (outOfHearts) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl, backgroundColor: colors.background }}>
        <Mascot mood="sad" size={150} />
        <AppText variant="title1" align="center">
          Out of hearts
        </AppText>
        <AppText variant="callout" color="textSecondary" align="center">
          That’s okay! Hearts refill over time, or you can earn one back by reviewing verses you already know.
        </AppText>
        <View style={{ alignSelf: 'stretch', gap: space.sm }}>
          <Button title="Review to earn a heart" icon="refresh" onPress={() => router.replace({ pathname: '/practice', params: { mode: 'review' } })} />
          <Button title="Come back later" variant="ghost" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Quit practice">
          <Icon name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar progress={progress} height={12} color={colors.sage} />
        </View>
        {mode === 'lesson' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="heart" size={22} color={colors.rose} strokeWidth={2.2} />
            <AppText variant="headline" color="rose">
              {hearts}
            </AppText>
          </View>
        ) : (
          <AppText variant="subhead" color="sage" weight="700">
            Review
          </AppText>
        )}
      </View>

      {!question ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {plan && plan.questions.length === 0 ? (
            <View style={{ alignItems: 'center', gap: space.md, padding: space.xl }}>
              <Mascot mood="happy" />
              <AppText variant="title3" align="center">
                Nothing to review right now!
              </AppText>
              <Button title="Back" variant="secondary" onPress={() => router.back()} />
            </View>
          ) : (
            <ActivityIndicator color={colors.gold} />
          )}
        </View>
      ) : (
        <ScrollView
          key={index}
          contentContainerStyle={{ flexGrow: 1, padding: space.lg, paddingBottom: insets.bottom + 120 }}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeIn.duration(250)} style={{ flex: 1 }}>
            <QuestionView question={question} onResult={onResult} locked={Boolean(feedback)} />
          </Animated.View>
        </ScrollView>
      )}

      {feedback && (
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.duration(180)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: space.lg,
            paddingTop: space.lg,
            paddingBottom: insets.bottom + space.lg,
            gap: space.md,
            backgroundColor: feedback.correct ? colors.sageSoft : colors.roseSoft,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Mascot mood={feedback.correct ? 'cheer' : 'sad'} size={64} bounceKey={cheerKey} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="title3" style={{ color: feedback.correct ? colors.sage : colors.rose }}>
                {feedback.message}
              </AppText>
              {!feedback.correct && feedback.answer && !feedback.recall && (
                <AppText variant="callout">
                  <AppText variant="callout" weight="700">
                    Answer:{' '}
                  </AppText>
                  {feedback.answer}
                </AppText>
              )}
            </View>
          </View>
          {feedback.recall && feedback.mistakes > 0 && (
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, gap: 4 }}>
              <AppText variant="caption" color="textTertiary">
                Words in red were missed
              </AppText>
              <RecallDiff tokens={feedback.recall.tokens} matched={feedback.recall.matched} />
            </View>
          )}
          <Button title="Continue" onPress={next} />
        </Animated.View>
      )}
      <Confetti burstKey={burst} count={22} />
    </KeyboardAvoidingView>
  );
}

function QuestionView({ question, onResult, locked }: { question: Question; onResult: (r: QuestionResult) => void; locked: boolean }) {
  switch (question.kind) {
    case 'intro':
      return <IntroQuestion question={question} onResult={onResult} locked={locked} />;
    case 'blank':
      return <BlankQuestion question={question} onResult={onResult} locked={locked} />;
    case 'order':
      return <OrderQuestion question={question} onResult={onResult} locked={locked} />;
    case 'reference':
      return <ReferenceQuestion question={question} onResult={onResult} locked={locked} />;
    case 'letters':
      return <LettersQuestion question={question} onResult={onResult} locked={locked} />;
    case 'recall':
      return <RecallQuestion question={question} onResult={onResult} locked={locked} />;
  }
}

function Results({
  xp,
  accuracy,
  memorized,
  levelUp,
  newStage,
  mode,
  burst,
}: {
  xp: number;
  accuracy: number;
  memorized: string[];
  levelUp: number | null;
  newStage: number;
  mode: string;
  burst: number;
}) {
  const { colors } = useTheme();
  const prefs = usePreferences();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => xpToday(), []);
  const message = useMemo(() => pick(CHEERS.done), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg, paddingHorizontal: space.lg }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', gap: space.lg }}>
        <Mascot mood="cheer" size={150} bounceKey={burst} />
        <AppText variant="largeTitle" align="center">
          {levelUp ? `Level ${levelUp}!` : memorized.length ? 'Memorized!' : message}
        </AppText>
        {levelUp && (
          <AppText variant="callout" color="textSecondary" align="center">
            You leveled up. Your faithfulness is growing!
          </AppText>
        )}
        {memorized.map((r) => (
          <View key={r} style={{ backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Icon name="star" size={18} color={colors.gold} strokeWidth={2.2} />
            <AppText variant="headline" color="gold">
              {r} is hidden in your heart
            </AppText>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' }}>
          <ResultTile label="XP earned" value={`+${xp}`} color={colors.gold} />
          <ResultTile label="Accuracy" value={`${Math.round(accuracy * 100)}%`} color={colors.sage} />
          {mode === 'lesson' && <ResultTile label="Level" value={`${Math.min(newStage, MEMORIZED_STAGE)}/5`} color={colors.sky} />}
        </View>
        <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.md }}>
          <ProgressRing progress={today / prefs.dailyXpGoal} size={110} stroke={10} color={colors.gold}>
            <AppText variant="headline">
              {Math.min(today, prefs.dailyXpGoal)}/{prefs.dailyXpGoal}
            </AppText>
          </ProgressRing>
          <AppText variant="subhead" color="textSecondary">
            {today >= prefs.dailyXpGoal ? 'Daily goal complete!' : 'Daily goal'}
          </AppText>
        </View>
        {mode === 'review' && (
          <MascotSays mood="happy" size={56} text="Reviewing keeps verses fresh. You also earned back a heart!" />
        )}
      </ScrollView>
      <Button title="Continue" onPress={() => router.back()} />
      <Confetti burstKey={burst} count={40} />
    </View>
  );
}

function ResultTile({ label, value, color }: { label: string; value: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: space.md, borderRadius: radius.md, borderWidth: 2, borderColor: color, backgroundColor: colors.surface }}>
      <AppText variant="title2" style={{ color }}>
        {value}
      </AppText>
      <AppText variant="caption" color="textTertiary">
        {label}
      </AppText>
    </View>
  );
}
