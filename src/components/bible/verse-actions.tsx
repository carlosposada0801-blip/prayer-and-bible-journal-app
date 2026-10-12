import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Pressable, ScrollView, Share, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons/icon';
import { AppText } from '@/components/ui';
import { formatReference, type Reference } from '@/data/bible/references';
import { HIGHLIGHT_COLORS, setHighlight, toggleBookmark, type HighlightColor } from '@/db/bible-notes';
import { addMemoryVerse } from '@/db/memorize';
import { audio } from '@/lib/bible/audio';
import { getPassageText } from '@/lib/bible/engine';
import { haptics } from '@/lib/haptics';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

type VerseActionsProps = {
  book: number;
  chapter: number;
  selected: number[];
  onDone: () => void;
};

/** Floating toolbar shown when one or more verses are selected. */
export function VerseActions({ book, chapter, selected, onDone }: VerseActionsProps) {
  const { colors, shadow, isDark } = useTheme();
  const prefs = usePreferences();
  const sorted = [...selected].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const contiguous = last - first + 1 === sorted.length;
  const reference: Reference = { book, chapter, verseStart: first, verseEnd: contiguous ? last : first };
  const label = contiguous
    ? formatReference(reference)
    : `${formatReference({ book, chapter })}:${sorted.join(', ')}`;

  async function selectionText() {
    const parts = await Promise.all(
      sorted.map((v) => getPassageText(prefs.translation, { book, chapter, verseStart: v, verseEnd: v })),
    );
    return `“${parts.join(' ')}”\n— ${label} (${prefs.translation})`;
  }

  const highlight = (color: HighlightColor | null) => {
    haptics.select();
    setHighlight(book, chapter, sorted, color);
    onDone();
  };

  const actions: { icon: IconName; label: string; onPress: () => void | Promise<void> }[] = [
    {
      icon: 'pen',
      label: 'Note',
      onPress: () => router.push({ pathname: '/verse-note', params: { book, chapter, verse: first } }),
    },
    {
      icon: 'bookmark',
      label: 'Bookmark',
      onPress: () => {
        toggleBookmark(book, chapter, first);
        haptics.success();
        onDone();
      },
    },
    {
      icon: 'copy',
      label: 'Copy',
      onPress: async () => {
        await Clipboard.setStringAsync(await selectionText());
        haptics.success();
        onDone();
      },
    },
    {
      icon: 'share',
      label: 'Share',
      onPress: async () => {
        await Share.share({ message: await selectionText() });
        onDone();
      },
    },
    {
      icon: 'link',
      label: 'Related',
      onPress: () => router.push({ pathname: '/cross-references', params: { book, chapter, verse: first } }),
    },
    {
      icon: 'columns',
      label: 'Compare',
      onPress: () => router.push({ pathname: '/bible/compare', params: { verse: first } }),
    },
    {
      icon: 'heart',
      label: 'Memorize',
      onPress: () => {
        addMemoryVerse(formatReference(reference));
        haptics.success();
        onDone();
      },
    },
    {
      icon: 'headphones',
      label: 'Listen',
      onPress: () => {
        audio.play(book, chapter, first);
        onDone();
      },
    },
  ];

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(180)}
      style={[
        {
          position: 'absolute',
          left: space.md,
          right: space.md,
          bottom: 96,
          backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
          borderRadius: radius.xl,
          borderCurve: 'continuous',
          paddingVertical: space.md,
          gap: space.md,
        },
        shadow.medium,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, gap: space.md }}>
        <AppText variant="headline" style={{ flex: 1 }} numberOfLines={1}>
          {label}
        </AppText>
        {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((c) => (
          <Pressable
            key={c}
            onPress={() => highlight(c)}
            accessibilityLabel={`Highlight ${HIGHLIGHT_COLORS[c].name}`}
            hitSlop={4}
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: HIGHLIGHT_COLORS[c].swatch }}
          />
        ))}
        <Pressable
          onPress={() => highlight(null)}
          accessibilityLabel="Remove highlight"
          hitSlop={4}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: 1.5,
            borderColor: colors.textTertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="close" size={14} color={colors.textTertiary} strokeWidth={2} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.md, gap: space.xs }}>
        {actions.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => {
              haptics.tap();
              a.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={({ pressed }) => ({ alignItems: 'center', gap: 4, width: 66, opacity: pressed ? 0.5 : 1 })}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surfaceMuted,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name={a.icon} size={20} color={colors.text} />
            </View>
            <AppText variant="caption" color="textSecondary">
              {a.label}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
