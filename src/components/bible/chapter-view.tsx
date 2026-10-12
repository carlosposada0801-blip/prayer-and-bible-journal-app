import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText } from '@/components/ui';
import { HIGHLIGHT_COLORS, type HighlightColor } from '@/db/bible-notes';
import type { Verse } from '@/lib/bible/types';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { fonts, textStyle } from '@/theme/typography';

type ChapterViewProps = {
  verses: Verse[];
  highlights: Map<number, HighlightColor>;
  notes: Set<number>;
  bookmarks: Set<number>;
  selected: Set<number>;
  speakingVerse?: number;
  onPressVerse: (verse: number) => void;
  onLayoutVerse: (verse: number, y: number) => void;
};

const spacingFor = { compact: 1.45, normal: 1.62, relaxed: 1.85 };

/**
 * The chapter text, laid out verse by verse so each verse can be tapped,
 * highlighted with a soft rounded tint, and scrolled to.
 */
export function ChapterView(props: ChapterViewProps) {
  return (
    <View style={{ gap: 2 }}>
      {props.verses.map((v) => (
        <VerseRow
          key={v.verse}
          verse={v}
          highlight={props.highlights.get(v.verse)}
          hasNote={props.notes.has(v.verse)}
          bookmarked={props.bookmarks.has(v.verse)}
          selected={props.selected.has(v.verse)}
          speaking={props.speakingVerse === v.verse}
          onPress={props.onPressVerse}
          onLayout={props.onLayoutVerse}
        />
      ))}
    </View>
  );
}

type VerseRowProps = {
  verse: Verse;
  highlight?: HighlightColor;
  hasNote: boolean;
  bookmarked: boolean;
  selected: boolean;
  speaking: boolean;
  onPress: (verse: number) => void;
  onLayout: (verse: number, y: number) => void;
};

const VerseRow = memo(function VerseRow({ verse, highlight, hasNote, bookmarked, selected, speaking, onPress, onLayout }: VerseRowProps) {
  const { colors, scheme, textScale } = useTheme();
  const prefs = usePreferences();
  const base = textStyle('scripture', textScale * 0.92);
  const fontSize = base.fontSize ?? 19;
  const lineHeight = Math.round(fontSize * spacingFor[prefs.readerSpacing]);
  const background = highlight
    ? HIGHLIGHT_COLORS[highlight][scheme]
    : speaking
      ? colors.goldSoft
      : 'transparent';

  return (
    <Pressable
      onPress={() => onPress(verse.verse)}
      onLayout={(e) => onLayout(verse.verse, e.nativeEvent.layout.y)}
      accessibilityRole="button"
      accessibilityLabel={`Verse ${verse.verse}. ${verse.text}`}
      accessibilityHint="Tap to select this verse"
      style={{
        backgroundColor: background,
        borderRadius: radius.sm,
        borderCurve: 'continuous',
        paddingHorizontal: space.sm,
        paddingVertical: 3,
        marginHorizontal: -space.sm,
      }}>
      <AppText
        style={{
          fontFamily: prefs.readerFont === 'serif' ? fonts.serif : fonts.sans,
          fontSize,
          lineHeight,
          color: colors.text,
          textDecorationLine: selected ? 'underline' : 'none',
          textDecorationStyle: 'dotted',
          textDecorationColor: colors.gold,
        }}>
        {prefs.showVerseNumbers && (
          <AppText
            style={{
              fontFamily: fonts.sans,
              fontSize: Math.round(fontSize * 0.6),
              lineHeight,
              fontWeight: '700',
              color: colors.gold,
            }}>
            {verse.verse}
            {'  '}
          </AppText>
        )}
        {verse.text}
      </AppText>
      {(hasNote || bookmarked) && (
        <View style={{ flexDirection: 'row', gap: space.xs, position: 'absolute', right: -14, top: 6 }}>
          {bookmarked && <Icon name="bookmark" size={12} color={colors.gold} strokeWidth={2.2} />}
          {hasNote && <Icon name="pen" size={12} color={colors.sage} strokeWidth={2.2} />}
        </View>
      )}
    </Pressable>
  );
});
