import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons/icon';
import { AppText, Button } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { bare, compareRecall, firstLetter, type Question, type Token } from '@/lib/memorize/quiz';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

import { MascotSays } from './mascot';

export type QuestionResult = { correct: boolean; mistakes: number; answer?: string; recall?: { tokens: Token[]; matched: Set<number> } };

type Props<K extends Question['kind']> = {
  question: Extract<Question, { kind: K }>;
  onResult: (r: QuestionResult) => void;
  locked: boolean;
};

const scripture = { fontFamily: fonts.serif, fontSize: 21, lineHeight: 34 };

/** A big, friendly answer button. */
function Option({ label, selected, onPress, disabled, state }: { label: string; selected?: boolean; onPress: () => void; disabled?: boolean; state?: 'correct' | 'wrong' }) {
  const { colors } = useTheme();
  const border = state === 'correct' ? colors.sage : state === 'wrong' ? colors.rose : selected ? colors.gold : colors.separator;
  const bg = state === 'correct' ? colors.sageSoft : state === 'wrong' ? colors.roseSoft : selected ? colors.goldSoft : colors.surface;
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: 56,
        paddingHorizontal: space.md,
        paddingVertical: space.md,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: border,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY: pressed ? 2 : 0 }],
      })}>
      <AppText variant="headline" align="center">
        {label}
      </AppText>
    </Pressable>
  );
}

function Prompt({ children }: { children: string }) {
  return (
    <AppText variant="title2" style={{ marginBottom: space.lg }}>
      {children}
    </AppText>
  );
}

// Intro ------------------------------------------------------------------------------

export function IntroQuestion({ question, onResult }: Props<'intro'>) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, gap: space.lg }}>
      <MascotSays mood="happy" text="Here’s your new verse! Read it out loud a few times." />
      <Animated.View entering={FadeInDown.delay(150).duration(450)} style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.xl, gap: space.md }}>
        <AppText variant="overline" color="gold">
          {question.reference}
        </AppText>
        <AppText style={[scripture, { color: colors.text }]}>{question.text}</AppText>
        <Pressable
          onPress={() => Speech.speak(`${question.text} ${question.reference}`, { language: 'en-US', rate: 0.95 })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
          <Icon name="headphones" size={18} color={colors.gold} />
          <AppText variant="subhead" color="gold" weight="600">
            Listen
          </AppText>
        </Pressable>
      </Animated.View>
      <View style={{ flex: 1 }} />
      <Button title="I’ve read it" onPress={() => onResult({ correct: true, mistakes: 0 })} />
    </View>
  );
}

// Fill in the blank -----------------------------------------------------------------

export function BlankQuestion({ question, onResult, locked }: Props<'blank'>) {
  const { colors } = useTheme();
  const [choice, setChoice] = useState<string | null>(null);
  const answer = bare(question.tokens[question.blank].display);
  const trailing = question.tokens[question.blank].display.slice(question.tokens[question.blank].display.indexOf(answer) + answer.length);

  return (
    <View style={{ flex: 1 }}>
      <Prompt>Fill in the missing word</Prompt>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg }}>
        <AppText style={[scripture, { color: colors.text }]}>
          {question.tokens.map((t, i) =>
            i === question.blank ? (
              <AppText key={i} style={[scripture, { color: choice ? colors.gold : colors.textTertiary, fontWeight: '700' }]}>
                {choice ? `${choice}${trailing}` : '______'}{' '}
              </AppText>
            ) : (
              `${t.display} `
            ),
          )}
        </AppText>
        <AppText variant="footnote" color="textTertiary" style={{ marginTop: space.sm }}>
          {question.reference}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg }}>
        {question.options.map((o) => (
          <View key={o} style={{ width: '48.5%' }}>
            <Option
              label={o}
              selected={choice === o}
              disabled={locked}
              state={locked ? (o === answer ? 'correct' : choice === o ? 'wrong' : undefined) : undefined}
              onPress={() => setChoice(o)}
            />
          </View>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {!locked && (
        <Button title="Check" disabled={!choice} onPress={() => onResult({ correct: choice === answer, mistakes: choice === answer ? 0 : 1, answer })} />
      )}
    </View>
  );
}

// Word order --------------------------------------------------------------------------

export function OrderQuestion({ question, onResult, locked }: Props<'order'>) {
  const { colors } = useTheme();
  const [placed, setPlaced] = useState<number[]>([]);
  const answer = question.tokens.slice(question.start, question.end);
  const before = question.tokens.slice(0, question.start).map((t) => t.display).join(' ');
  const after = question.tokens.slice(question.end).map((t) => t.display).join(' ');

  const check = () => {
    const correct = placed.every((p, i) => question.pieces[p].norm === answer[i].norm);
    onResult({ correct, mistakes: correct ? 0 : 1, answer: answer.map((t) => t.display).join(' ') });
  };

  return (
    <View style={{ flex: 1 }}>
      <Prompt>Tap the words in order</Prompt>
      {before ? (
        <AppText style={[scripture, { color: colors.textTertiary, fontSize: 18, lineHeight: 28 }]} numberOfLines={3}>
          …{before.split(' ').slice(-8).join(' ')}
        </AppText>
      ) : null}
      <View
        style={{
          minHeight: 120,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: 8,
          paddingVertical: space.md,
          borderBottomWidth: 2,
          borderTopWidth: 2,
          borderColor: colors.separator,
          marginVertical: space.sm,
        }}>
        {placed.map((p) => (
          <Animated.View key={p} entering={ZoomIn.duration(160)}>
            <Pressable
              disabled={locked}
              onPress={() => {
                haptics.select();
                setPlaced((list) => list.filter((x) => x !== p));
              }}
              style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 2, borderBottomWidth: 3, borderColor: colors.separator }}>
              <AppText variant="headline">{question.pieces[p].display}</AppText>
            </Pressable>
          </Animated.View>
        ))}
      </View>
      {after ? (
        <AppText style={[scripture, { color: colors.textTertiary, fontSize: 18, lineHeight: 28 }]} numberOfLines={2}>
          {after.split(' ').slice(0, 8).join(' ')}…
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: space.lg, justifyContent: 'center' }}>
        {question.pieces.map((piece, i) => {
          const used = placed.includes(i);
          return (
            <Pressable
              key={i}
              disabled={used || locked}
              onPress={() => {
                haptics.select();
                setPlaced((list) => [...list, i]);
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: radius.sm,
                backgroundColor: used ? colors.surfaceMuted : colors.surface,
                borderWidth: 2,
                borderBottomWidth: used ? 2 : 3,
                borderColor: colors.separator,
              }}>
              <AppText variant="headline" style={{ opacity: used ? 0 : 1 }}>
                {piece.display}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      {!locked && <Button title="Check" disabled={placed.length !== question.pieces.length} onPress={check} />}
    </View>
  );
}

// Which reference? ------------------------------------------------------------------

export function ReferenceQuestion({ question, onResult, locked }: Props<'reference'>) {
  const { colors } = useTheme();
  const [choice, setChoice] = useState<string | null>(null);
  return (
    <View style={{ flex: 1 }}>
      <Prompt>Which verse is this?</Prompt>
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg }}>
        <AppText style={[scripture, { color: colors.text, fontSize: 19, lineHeight: 30 }]}>{question.text}</AppText>
      </View>
      <View style={{ gap: space.sm, marginTop: space.lg }}>
        {question.options.map((o) => (
          <Option
            key={o}
            label={o}
            selected={choice === o}
            disabled={locked}
            state={locked ? (o === question.reference ? 'correct' : choice === o ? 'wrong' : undefined) : undefined}
            onPress={() => setChoice(o)}
          />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      {!locked && (
        <Button
          title="Check"
          disabled={!choice}
          onPress={() => onResult({ correct: choice === question.reference, mistakes: choice === question.reference ? 0 : 1, answer: question.reference })}
        />
      )}
    </View>
  );
}

// First letters ------------------------------------------------------------------------

export function LettersQuestion({ question, onResult, locked }: Props<'letters'>) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const total = question.tokens.length;
  const done = revealed >= total;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done && !locked) {
      const allowed = Math.max(2, Math.round(total / 10));
      onResult({ correct: mistakes <= allowed, mistakes: mistakes === 0 ? 0 : mistakes <= allowed ? 1 : 2, answer: question.tokens.map((t) => t.display).join(' ') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const type = (text: string) => {
    const ch = text.slice(-1).toLowerCase();
    if (!ch || done || locked) return;
    if (ch === firstLetter(question.tokens[revealed])) {
      setRevealed((r) => r + 1);
    } else {
      haptics.error();
      setMistakes((m) => m + 1);
      shake.value = withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(0, { duration: 50 }));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Prompt>Type the first letter of each word</Prompt>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, shakeStyle]}>
          {question.tokens.map((t, i) =>
            i < revealed ? (
              <Animated.View key={i} entering={FadeIn.duration(150)}>
                <AppText style={[scripture, { color: colors.text, fontSize: 19, lineHeight: 30 }]}>{t.display}</AppText>
              </Animated.View>
            ) : (
              <View
                key={i}
                style={{
                  width: Math.max(18, t.display.length * 8),
                  height: 6,
                  borderRadius: 3,
                  marginTop: 18,
                  backgroundColor: i === revealed ? colors.gold : colors.surfaceMuted,
                }}
              />
            ),
          )}
        </Animated.View>
      </Pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.md }}>
        <AppText variant="footnote" color="textTertiary">
          {revealed} / {total} words
        </AppText>
        <AppText variant="footnote" color={mistakes ? 'rose' : 'textTertiary'}>
          {mistakes} {mistakes === 1 ? 'slip' : 'slips'}
        </AppText>
      </View>
      <TextInput
        ref={inputRef}
        value=""
        onChangeText={type}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="ascii-capable"
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
      <View style={{ flex: 1 }} />
      {!done && !locked && (
        <Pressable
          onPress={() => onResult({ correct: false, mistakes: 3, answer: question.tokens.map((t) => t.display).join(' ') })}
          style={{ alignItems: 'center', padding: space.md }}>
          <AppText variant="subhead" color="textTertiary">
            I’m stuck. Show me
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

// Full recall -------------------------------------------------------------------------

export function RecallQuestion({ question, onResult, locked }: Props<'recall'>) {
  const { colors, textScale } = useTheme();
  const [text, setText] = useState('');
  const check = () => {
    const { score, matched } = compareRecall(question.tokens, text);
    onResult({
      correct: score >= 0.8,
      mistakes: score >= 0.95 ? 0 : score >= 0.8 ? 1 : 3,
      answer: question.tokens.map((t) => t.display).join(' '),
      recall: { tokens: question.tokens, matched },
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <Prompt>{`Type ${question.reference} from memory`}</Prompt>
      <TextInput
        multiline
        autoFocus
        editable={!locked}
        value={text}
        onChangeText={setText}
        placeholder="Start typing the verse…"
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.gold}
        autoCorrect={false}
        style={{
          fontFamily: fonts.serif,
          fontSize: 19 * textScale,
          lineHeight: 30 * textScale,
          color: colors.text,
          minHeight: 180,
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: space.lg,
          textAlignVertical: 'top',
        }}
      />
      <AppText variant="footnote" color="textTertiary" style={{ marginTop: space.sm }}>
        Punctuation and capital letters don’t matter.
      </AppText>
      <View style={{ flex: 1 }} />
      {!locked && <Button title="Check" disabled={text.trim().split(/\s+/).length < 3} onPress={check} />}
    </View>
  );
}

/** Shows which words were missed in a recall attempt. */
export function RecallDiff({ tokens, matched }: { tokens: Token[]; matched: Set<number> }) {
  const { colors } = useTheme();
  return (
    <AppText style={{ fontFamily: fonts.serif, fontSize: 16, lineHeight: 24, color: colors.text }}>
      {tokens.map((t, i) => (
        <AppText
          key={i}
          style={{ fontFamily: fonts.serif, fontSize: 16, lineHeight: 24, color: matched.has(i) ? colors.text : colors.rose, fontWeight: matched.has(i) ? '400' : '700' }}>
          {t.display}{' '}
        </AppText>
      ))}
    </AppText>
  );
}
