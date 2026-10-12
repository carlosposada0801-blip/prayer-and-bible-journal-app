import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, SegmentedControl } from '@/components/ui';
import { formatReference } from '@/data/bible/references';
import { useChapter } from '@/lib/bible/hooks';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

/** Two translations of the current chapter, verse by verse. */
export default function CompareScreen() {
  const { verse } = useLocalSearchParams<{ verse?: string }>();
  const prefs = usePreferences();
  const { colors, textScale } = useTheme();
  const { book, chapter } = prefs.lastRead;
  const [layout, setLayout] = useState<'side' | 'stacked'>('side');
  const left = useChapter(prefs.translation, book, chapter);
  const right = useChapter(prefs.compareTranslation, book, chapter);
  const scrollRef = useRef<ScrollView>(null);
  const rowY = useRef(new Map<number, number>());

  const rightByVerse = new Map(right.data?.map((v) => [v.verse, v.text]));
  const fontSize = Math.round((layout === 'side' ? 15 : 17) * textScale);
  const textStyle = { fontFamily: fonts.serif, fontSize, lineHeight: Math.round(fontSize * 1.55), color: colors.text };

  useEffect(() => {
    if (!verse || !left.data || !right.data) return;
    const t = setTimeout(() => {
      const y = rowY.current.get(Number(verse));
      if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
    }, 300);
    return () => clearTimeout(t);
  }, [verse, left.data, right.data]);

  const pill = (id: string, target?: 'compare') => (
    <Pressable
      onPress={() => router.push({ pathname: '/translation-picker', params: target ? { target } : {} })}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 10,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
      }}>
      <AppText variant="headline" color="gold">
        {id}
      </AppText>
      <Icon name="chevronDown" size={14} color={colors.textTertiary} strokeWidth={2.2} />
    </Pressable>
  );

  return (
    <ScrollView
      ref={scrollRef}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 120 }}>
      <Stack.Screen options={{ title: `Compare · ${formatReference({ book, chapter })}` }} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {pill(prefs.translation)}
        {pill(prefs.compareTranslation, 'compare')}
      </View>
      <SegmentedControl
        options={[
          { value: 'side', label: 'Side by Side' },
          { value: 'stacked', label: 'Stacked' },
        ]}
        value={layout}
        onChange={setLayout}
      />

      {(left.loading || right.loading) && <ActivityIndicator color={colors.gold} />}
      {left.error || right.error ? (
        <AppText color="textSecondary">{(left.error ?? right.error)?.message}</AppText>
      ) : null}

      {left.data?.map((v) => (
        <View
          key={v.verse}
          onLayout={(e) => rowY.current.set(v.verse, e.nativeEvent.layout.y)}
          style={{
            backgroundColor: String(v.verse) === verse ? colors.goldSoft : colors.surface,
            borderRadius: radius.md,
            borderCurve: 'continuous',
            padding: space.md,
            gap: space.sm,
          }}>
          <AppText variant="caption" color="gold" weight="700">
            Verse {v.verse}
          </AppText>
          {layout === 'side' ? (
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <AppText style={[textStyle, { flex: 1 }]}>{v.text}</AppText>
              <View style={{ width: 1, backgroundColor: colors.separator }} />
              <AppText style={[textStyle, { flex: 1 }]}>{rightByVerse.get(v.verse) ?? '—'}</AppText>
            </View>
          ) : (
            <View style={{ gap: space.sm }}>
              <AppText style={textStyle}>
                <AppText variant="caption" color="textTertiary" weight="700">
                  {prefs.translation}{'  '}
                </AppText>
                {v.text}
              </AppText>
              <AppText style={textStyle}>
                <AppText variant="caption" color="textTertiary" weight="700">
                  {prefs.compareTranslation}{'  '}
                </AppText>
                {rightByVerse.get(v.verse) ?? '—'}
              </AppText>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
