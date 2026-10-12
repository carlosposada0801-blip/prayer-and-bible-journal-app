import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Card, EmptyState, Screen, SegmentedControl } from '@/components/ui';
import { formatReference } from '@/data/bible/references';
import { allBookmarks, allHighlights, allNotes, HIGHLIGHT_COLORS, type HighlightColor } from '@/db/bible-notes';
import { useLive } from '@/db/live';
import { relativeDay } from '@/lib/dates';
import { usePassageText } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

type Tab = 'highlights' | 'notes' | 'bookmarks';

/** Everything you've highlighted, noted and bookmarked. */
export default function SavedScreen() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'highlights');
  const highlights = useLive(allHighlights, ['highlights']);
  const notes = useLive(allNotes, ['notes']);
  const bookmarks = useLive(allBookmarks, ['bookmarks']);

  const items =
    tab === 'highlights' ? highlights : tab === 'notes' ? notes : bookmarks;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'My Bible' }} />
      <SegmentedControl
        options={[
          { value: 'highlights', label: `Highlights` },
          { value: 'notes', label: `Notes` },
          { value: 'bookmarks', label: `Bookmarks` },
        ]}
        value={tab}
        onChange={setTab}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={tab === 'notes' ? 'pen' : tab === 'bookmarks' ? 'bookmark' : 'palette'}
          title={`No ${tab} yet`}
          message="Tap any verse while reading to highlight it, add a note, or bookmark it."
        />
      ) : (
        items.map((item) => (
          <SavedItem
            key={`${tab}-${item.book}.${item.chapter}.${item.verse}-${'id' in item ? item.id : ''}`}
            book={item.book}
            chapter={item.chapter}
            verse={item.verse}
            date={item.created_at}
            color={'color' in item ? (item.color as HighlightColor) : undefined}
            note={'body' in item ? (item.body as string) : undefined}
          />
        ))
      )}
    </Screen>
  );
}

function SavedItem(props: { book: number; chapter: number; verse: number; date: string; color?: HighlightColor; note?: string }) {
  const { colors } = useTheme();
  const reference = { book: props.book, chapter: props.chapter, verseStart: props.verse, verseEnd: props.verse };
  const { data: text } = usePassageText(reference);
  return (
    <Card onPress={() => openReader(props.book, props.chapter, props.verse)} style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {props.color && (
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: HIGHLIGHT_COLORS[props.color].swatch }} />
        )}
        <AppText variant="subhead" color="gold" weight="700" style={{ flex: 1 }}>
          {formatReference(reference)}
        </AppText>
        <AppText variant="caption" color="textTertiary">
          {relativeDay(props.date)}
        </AppText>
      </View>
      <AppText variant="scripture" style={{ fontSize: 17, lineHeight: 26 }} numberOfLines={props.note ? 2 : 5}>
        {text}
      </AppText>
      {props.note && (
        <View style={{ backgroundColor: colors.sageSoft, borderRadius: 12, padding: space.md }}>
          <AppText variant="callout">{props.note}</AppText>
        </View>
      )}
    </Card>
  );
}
