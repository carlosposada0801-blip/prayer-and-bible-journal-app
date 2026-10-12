import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/icon';
import { ScriptureQuote } from '@/components/scripture-quote';
import { AppText, Button, Confetti } from '@/components/ui';
import { checkAchievements } from '@/db/achievements';
import { saveGuidedSession } from '@/db/gratitude';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { textStyle } from '@/theme/typography';

type Step = {
  key: 'adoration' | 'confession' | 'thanksgiving' | 'supplication';
  letter: string;
  title: string;
  icon: IconName;
  intro: string;
  prompts: string[];
  verse: string;
};

const STEPS: Step[] = [
  {
    key: 'adoration',
    letter: 'A',
    title: 'Adoration',
    icon: 'sun',
    intro: 'Begin by praising God for who He is: not for what He gives, but for His character.',
    prompts: ['God, You are holy, faithful and good…', 'Which of His names or qualities stands out to you today?'],
    verse: 'Psalm 95:6',
  },
  {
    key: 'confession',
    letter: 'C',
    title: 'Confession',
    icon: 'droplet',
    intro: 'Honestly bring anything that stands between you and God. He is quick to forgive.',
    prompts: ['Search me, God, and know my heart…', 'Is there a thought, word or action to bring to Him?'],
    verse: '1 John 1:9',
  },
  {
    key: 'thanksgiving',
    letter: 'T',
    title: 'Thanksgiving',
    icon: 'gift',
    intro: 'Thank Him for what He has done: big things, small things, and answered prayers.',
    prompts: ['Thank You, Lord, for…', 'Where have you seen His kindness this week?'],
    verse: 'Psalm 100:4',
  },
  {
    key: 'supplication',
    letter: 'S',
    title: 'Supplication',
    icon: 'hands',
    intro: 'Bring your requests to God: for yourself, for others, and for the world.',
    prompts: ['Lord, I ask You for…', 'Who needs your prayers today?'],
    verse: 'Philippians 4:6',
  },
];

const TIMER_OPTIONS = [0, 1, 2, 3, 5];

/** Full-screen guided prayer through ACTS with an optional gentle timer. */
export default function GuidedPrayer() {
  const params = useLocalSearchParams<{ minutes?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [minutes, setMinutes] = useState(params.minutes ? Number(params.minutes) : 2);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = intro, 4 = done
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(0);
  const [burst, setBurst] = useState(0);
  const startedAt = useRef(Date.now());

  const step = STEPS[stepIndex];
  const done = stepIndex >= STEPS.length;

  // Per-step countdown with a soft haptic when time is up.
  useEffect(() => {
    if (!step || minutes === 0) return;
    setRemaining(minutes * 60);
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          haptics.success();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stepIndex, minutes, step]);

  const next = () => {
    haptics.tap();
    if (stepIndex === STEPS.length - 1) {
      saveGuidedSession(Math.round((Date.now() - startedAt.current) / 1000), entries);
      checkAchievements();
      setBurst((b) => b + 1);
      haptics.success();
    }
    setStepIndex((i) => i + 1);
  };

  const gradient = isDark ? (['#141B2B', '#0B0F18'] as const) : (['#FFF8EA', '#F3EAD8'] as const);

  return (
    <LinearGradient colors={gradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: insets.top + space.sm,
            paddingHorizontal: space.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
          }}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close">
            <Icon name="close" size={24} color={colors.textSecondary} />
          </Pressable>
          <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
            {STEPS.map((s, i) => (
              <View
                key={s.key}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i < stepIndex || done ? colors.gold : i === stepIndex ? colors.gold + '99' : colors.separator,
                }}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: space.lg, paddingBottom: insets.bottom + space.xl, gap: space.xl }}
          keyboardShouldPersistTaps="handled">
          {stepIndex === -1 && (
            <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1, gap: space.xl, justifyContent: 'center' }}>
              <BreathingCircle letter="✦" />
              <View style={{ gap: space.sm }}>
                <AppText variant="title1" align="center">
                  Guided Prayer
                </AppText>
                <AppText variant="callout" color="textSecondary" align="center">
                  A simple path through prayer: Adoration, Confession, Thanksgiving and Supplication.
                </AppText>
              </View>
              <View style={{ gap: space.sm, alignItems: 'center' }}>
                <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
                  Time for each step
                </AppText>
                <View style={{ flexDirection: 'row', gap: space.sm }}>
                  {TIMER_OPTIONS.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => {
                        haptics.select();
                        setMinutes(m);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: radius.pill,
                        backgroundColor: minutes === m ? colors.primary : colors.surface,
                      }}>
                      <AppText variant="subhead" weight="600" style={{ color: minutes === m ? colors.onPrimary : colors.text }}>
                        {m === 0 ? 'Off' : `${m} min`}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Button title="Begin" onPress={next} />
            </Animated.View>
          )}

          {step && (
            <Animated.View key={step.key} entering={FadeInDown.duration(450)} exiting={FadeOut.duration(150)} style={{ gap: space.lg }}>
              <BreathingCircle letter={step.letter} />
              <View style={{ gap: space.xs, alignItems: 'center' }}>
                <AppText variant="overline" color="gold">
                  Step {stepIndex + 1} of 4
                </AppText>
                <AppText variant="title1">{step.title}</AppText>
                <AppText variant="callout" color="textSecondary" align="center">
                  {step.intro}
                </AppText>
              </View>
              <ScriptureQuote reference={step.verse} size="small" />
              <TextInput
                multiline
                value={entries[step.key] ?? ''}
                onChangeText={(t) => setEntries((e) => ({ ...e, [step.key]: t }))}
                placeholder={step.prompts.join('\n')}
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.gold}
                style={[
                  textStyle('scripture', 0.86),
                  {
                    color: colors.text,
                    minHeight: 140,
                    backgroundColor: colors.surface,
                    borderRadius: radius.lg,
                    padding: space.lg,
                    textAlignVertical: 'top',
                  },
                ]}
              />
              <AppText variant="footnote" color="textTertiary" align="center">
                Writing is optional. You can simply pray in your heart.
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                {minutes > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="timer" size={18} color={remaining === 0 ? colors.sage : colors.textSecondary} />
                    <AppText variant="headline" style={{ color: remaining === 0 ? colors.sage : colors.textSecondary, fontVariant: ['tabular-nums'] }}>
                      {remaining === 0 ? 'Done' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}
                    </AppText>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Button title={stepIndex === STEPS.length - 1 ? 'Amen' : 'Continue'} onPress={next} />
                </View>
              </View>
            </Animated.View>
          )}

          {done && (
            <Animated.View entering={FadeInDown.duration(500)} style={{ flex: 1, justifyContent: 'center', gap: space.xl }}>
              <BreathingCircle letter="♥" />
              <View style={{ gap: space.sm }}>
                <AppText variant="title1" align="center">
                  Amen
                </AppText>
                <AppText variant="callout" color="textSecondary" align="center">
                  Thank you for spending this time with God. He hears you, and He loves you.
                </AppText>
              </View>
              <ScriptureQuote reference="Numbers 6:24-26" size="small" />
              <Button title="Done" onPress={() => router.back()} />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Confetti burstKey={burst} />
    </LinearGradient>
  );
}

/** A slow "breathing" glow to help you settle and focus. */
function BreathingCircle({ letter }: { letter: string }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [scale]);
  const glow = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 0.25 + (scale.value - 1) * 2 }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 132 }}>
      <Animated.View style={[{ position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: colors.gold }, glow]} />
      <View
        style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText style={{ fontSize: 40, lineHeight: 48, fontWeight: '300', color: colors.gold }}>{letter}</AppText>
      </View>
    </View>
  );
}
