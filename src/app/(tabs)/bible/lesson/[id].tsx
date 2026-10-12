import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, Confetti, EmptyState, Screen } from '@/components/ui';
import { formatReference, ref } from '@/data/bible/references';
import { findLesson } from '@/data/studies';
import { checkAchievements } from '@/db/achievements';
import { useLive } from '@/db/live';
import { completeLesson, lessonProgress, saveAnswer } from '@/db/study';
import { usePassage } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { haptics } from '@/lib/haptics';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { textStyle } from '@/theme/typography';

/** One daily study: passage, explanation, reflection, application and prayer. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = findLesson(id);
  const prefs = usePreferences();
  const { colors } = useTheme();
  const progress = useLive(() => lessonProgress(id), ['study_progress'], [id]);
  const passageRef = found ? ref(found.lesson.passage) : undefined;
  const { data: verses, loading } = usePassage(passageRef);
  const [burst, setBurst] = useState(0);

  if (!found || !found.lesson.explanation) {
    return (
      <Screen>
        <EmptyState icon="bookClosed" title="Lesson coming soon" message="This lesson hasn't been written yet." />
      </Screen>
    );
  }

  const { series, lesson, index } = found;
  const next = series.lessons[index + 1];
  const completed = Boolean(progress.completedAt);

  const complete = () => {
    completeLesson(lesson.id);
    haptics.success();
    setBurst((b) => b + 1);
    checkAchievements();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={60}>
      <Screen keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: space.xl }}>
        <Stack.Screen options={{ title: '' }} />

        <Appear index={0}>
          <View style={{ gap: space.xs }}>
            <AppText variant="overline" color="gold">
              {series.title} · Day {index + 1}
            </AppText>
            <AppText variant="largeTitle">{lesson.title}</AppText>
          </View>
        </Appear>

        {/* 1. Scripture */}
        <Appear index={1}>
          <Section number={1} title="Read" />
          <Card style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="headline" color="gold" style={{ flex: 1 }}>
                {passageRef ? formatReference(passageRef) : lesson.passage}
              </AppText>
              <AppText variant="caption" color="textTertiary">
                {prefs.translation}
              </AppText>
            </View>
            {loading ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <AppText variant="scripture" style={{ fontSize: 18, lineHeight: 30 }}>
                {verses?.map((v, i) => {
                  const showChapter = i === 0 || v.chapter !== verses[i - 1].chapter;
                  return (
                    <Text key={`${v.chapter}.${v.verse}`}>
                      <AppText variant="caption" color="gold" weight="700">
                        {showChapter && passageRef?.chapterEnd ? `${v.chapter}:` : ''}
                        {v.verse}{' '}
                      </AppText>
                      {v.text}{' '}
                    </Text>
                  );
                })}
              </AppText>
            )}
            {passageRef && (
              <Pressable
                onPress={() => openReader(passageRef.book, passageRef.chapter, passageRef.verseStart)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
                <Icon name="openBook" size={16} color={colors.gold} />
                <AppText variant="subhead" color="gold" weight="600">
                  Read in context
                </AppText>
              </Pressable>
            )}
          </Card>
        </Appear>

        {/* 2. Explanation */}
        <Appear index={2}>
          <Section number={2} title="Understand" />
          <View style={{ gap: space.md }}>
            {(lesson.explanation ?? []).map((p, i) => (
              <AppText key={i} variant="body" style={{ lineHeight: 27 }}>
                {p}
              </AppText>
            ))}
          </View>
        </Appear>

        {/* 3. Reflection */}
        <Appear index={3}>
          <Section number={3} title="Reflect" />
          <View style={{ gap: space.lg }}>
            {lesson.questions?.map((q, i) => (
              <ReflectionQuestion key={i} lessonId={lesson.id} index={i} question={q} initial={progress.answers[i] ?? ''} />
            ))}
          </View>
        </Appear>

        {/* 4. Application */}
        <Appear index={4}>
          <Section number={4} title="Live it out today" />
          <Card style={{ backgroundColor: colors.sageSoft, flexDirection: 'row', gap: space.md }} elevated="low">
            <Icon name="leaf" size={24} color={colors.sage} />
            <AppText variant="callout" style={{ flex: 1, lineHeight: 23 }}>
              {lesson.application}
            </AppText>
          </Card>
        </Appear>

        {/* 5. Prayer */}
        <Appear index={5}>
          <Section number={5} title="Pray" />
          <LinearGradient
            colors={colors.gradientVerse}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.md }}>
            <Icon name="hands" size={26} color="#E2BE6A" />
            <AppText variant="scripture" style={{ color: colors.textOnDark, fontSize: 18, lineHeight: 30 }}>
              {lesson.prayer}
            </AppText>
          </LinearGradient>
        </Appear>

        <View style={{ gap: space.md, marginTop: space.sm }}>
          {completed ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
                <Icon name="check" size={20} color={colors.sage} strokeWidth={2.6} />
                <AppText variant="headline" color="sage">
                  Lesson complete
                </AppText>
              </View>
              {next && (
                <Button
                  title={`Next: ${next.title}`}
                  variant="secondary"
                  onPress={() => router.replace({ pathname: '/bible/lesson/[id]', params: { id: next.id } })}
                />
              )}
            </>
          ) : (
            <Button title="Complete Lesson" icon="check" onPress={complete} />
          )}
        </View>
      </Screen>
      <Confetti burstKey={burst} />
    </KeyboardAvoidingView>
  );
}

function Section({ number, title }: { number: number; title: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.goldSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText variant="caption" color="gold" weight="700">
          {number}
        </AppText>
      </View>
      <AppText variant="title3">{title}</AppText>
    </View>
  );
}

function ReflectionQuestion({ lessonId, index, question, initial }: { lessonId: string; index: number; question: string; initial: string }) {
  const { colors, textScale } = useTheme();
  const [value, setValue] = useState(initial);
  const saved = useRef(initial);
  useEffect(() => {
    setValue(initial);
    saved.current = initial;
  }, [initial]);

  // Save shortly after typing stops.
  useEffect(() => {
    if (value === saved.current) return;
    const t = setTimeout(() => {
      saveAnswer(lessonId, index, value);
      saved.current = value;
    }, 600);
    return () => clearTimeout(t);
  }, [value, lessonId, index]);

  return (
    <View style={{ gap: space.sm }}>
      <AppText variant="headline">{question}</AppText>
      <TextInput
        multiline
        value={value}
        onChangeText={setValue}
        placeholder="Write your thoughts…"
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.gold}
        style={[
          textStyle('scripture', textScale * 0.82),
          {
            color: colors.text,
            minHeight: 96,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderCurve: 'continuous',
            padding: space.md,
            textAlignVertical: 'top',
          },
        ]}
      />
    </View>
  );
}
