import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons/icon';
import { AppText, SegmentedControl } from '@/components/ui';
import { BOOKS } from '@/data/bible/books';
import { chaptersReadInBook } from '@/db/bible-notes';
import { useLive } from '@/db/live';
import { all } from '@/db/database';
import { haptics } from '@/lib/haptics';
import { setPreference, usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** Sheet: pick a book, then a chapter. */
export default function ChapterPicker() {
  const params = useLocalSearchParams<{ book?: string; mode?: string }>();
  const prefs = usePreferences();
  const { colors } = useTheme();
  const [book, setBook] = useState<number | undefined>(params.book ? Number(params.book) : undefined);
  const [testament, setTestament] = useState<'OT' | 'NT'>(
    (params.book ? Number(params.book) : prefs.lastRead.book) >= 40 ? 'NT' : 'OT',
  );
  const readChapters = useLive(
    () => new Set(all<{ c: number }>('SELECT chapter AS c FROM chapters_read WHERE book = ?', book ?? 0).map((r) => r.c)),
    ['chapters_read'],
    [book],
  );

  const choose = (chapter: number) => {
    haptics.select();
    setPreference('lastRead', { book: book!, chapter });
    if (params.mode === 'open') {
      router.back();
      setTimeout(() => router.navigate('/bible/read'), 50);
    } else {
      router.back();
    }
  };

  if (book) {
    const info = BOOKS[book - 1];
    return (
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} style={{ backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Pressable onPress={() => setBook(undefined)} hitSlop={10} accessibilityLabel="All books">
            <Icon name="chevronLeft" size={22} color={colors.gold} strokeWidth={2.2} />
          </Pressable>
          <AppText variant="title2" style={{ flex: 1 }}>
            {info.name}
          </AppText>
          <AppText variant="footnote" color="textTertiary">
            {chaptersReadInBook(book)} of {info.verses.length} read
          </AppText>
        </View>
        <Animated.View entering={FadeIn.duration(200)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {info.verses.map((_, i) => {
            const chapter = i + 1;
            const current = prefs.lastRead.book === book && prefs.lastRead.chapter === chapter;
            const done = readChapters.has(chapter);
            return (
              <Pressable
                key={chapter}
                onPress={() => choose(chapter)}
                accessibilityLabel={`Chapter ${chapter}${done ? ', read' : ''}`}
                style={({ pressed }) => ({
                  width: 56,
                  height: 56,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: current ? colors.primary : done ? colors.goldSoft : colors.surface,
                  opacity: pressed ? 0.6 : 1,
                })}>
                <AppText variant="headline" style={{ color: current ? colors.onPrimary : done ? colors.gold : colors.text }}>
                  {chapter}
                </AppText>
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>
    );
  }

  const books = BOOKS.filter((b) => b.testament === testament);
  const genres = [...new Set(books.map((b) => b.genre))];

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} style={{ backgroundColor: colors.background }}>
      <AppText variant="title2">Books</AppText>
      <SegmentedControl
        options={[
          { value: 'OT', label: 'Old Testament' },
          { value: 'NT', label: 'New Testament' },
        ]}
        value={testament}
        onChange={setTestament}
      />
      {genres.map((genre) => (
        <View key={genre} style={{ gap: space.sm }}>
          <AppText variant="overline" color="textTertiary">
            {genre}
          </AppText>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
            {books
              .filter((b) => b.genre === genre)
              .map((b, i) => (
                <Pressable
                  key={b.id}
                  onPress={() => {
                    haptics.select();
                    setBook(b.id);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: space.lg,
                    paddingVertical: 14,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.separator,
                    backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
                  })}>
                  <AppText variant="body" style={{ flex: 1 }}>
                    {b.name}
                  </AppText>
                  <AppText variant="footnote" color="textTertiary" style={{ marginRight: space.sm }}>
                    {b.verses.length}
                  </AppText>
                  <Icon name="chevronRight" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
