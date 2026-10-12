import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View, type ScrollView as RNScrollView } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AudioBar } from '@/components/bible/audio-bar';
import { ChapterView } from '@/components/bible/chapter-view';
import { VerseActions } from '@/components/bible/verse-actions';
import { Icon } from '@/components/icons/icon';
import { AppText, Button } from '@/components/ui';
import { chapterCount, formatReference, getBook, nextChapter, previousChapter } from '@/data/bible/references';
import { translationInfo } from '@/data/bible/translations';
import {
  chapterBookmarks,
  chapterHighlights,
  chapterNotes,
  isChapterRead,
  markChapterRead,
  type HighlightColor,
} from '@/db/bible-notes';
import { useLive } from '@/db/live';
import { audio, useAudio } from '@/lib/bible/audio';
import { getChapter, getChapterTitle } from '@/lib/bible/engine';
import { useAsync, useChapter } from '@/lib/bible/hooks';
import { takePendingVerse } from '@/lib/bible/navigation';
import { useFocusSession } from '@/lib/focus';
import { haptics } from '@/lib/haptics';
import { setPreference, usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space, springs } from '@/theme/tokens';

export default function ReaderScreen() {
  const params = useLocalSearchParams<{ book?: string; chapter?: string; verse?: string }>();
  const prefs = usePreferences();
  const { colors } = useTheme();
  const { book, chapter } = prefs.lastRead;
  const audioState = useAudio();
  useFocusSession();

  // Deep links like /bible/read?book=43&chapter=3 set the position once.
  useEffect(() => {
    if (params.book && params.chapter) {
      setPreference('lastRead', { book: Number(params.book), chapter: Number(params.chapter) });
    }
  }, [params.book, params.chapter]);

  const { data: verses, loading, error } = useChapter(prefs.translation, book, chapter);
  const { data: psalmTitle } = useAsync(() => getChapterTitle(prefs.translation, book, chapter), `${prefs.translation}.${book}.${chapter}`);
  const highlights = useLive(
    () => new Map(chapterHighlights(book, chapter).map((h) => [h.verse, h.color as HighlightColor])),
    ['highlights'],
    [book, chapter],
  );
  const notes = useLive(() => new Set(chapterNotes(book, chapter).map((n) => n.verse)), ['notes'], [book, chapter]);
  const bookmarks = useLive(() => new Set(chapterBookmarks(book, chapter).map((b) => b.verse)), ['bookmarks'], [book, chapter]);
  const read = useLive(() => isChapterRead(book, chapter), ['chapters_read'], [book, chapter]);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const scrollRef = useRef<RNScrollView>(null);
  const verseY = useRef(new Map<number, number>());
  const contentTop = useRef(0);

  useEffect(() => {
    setSelected(new Set());
    verseY.current.clear();
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    // Fetch the next chapter in the background so turning the page is instant.
    const next = nextChapter(book, chapter);
    if (next) getChapter(prefs.translation, next.book, next.chapter).catch(() => {});
  }, [book, chapter, prefs.translation]);

  // Scroll to a verse requested by search, a plan, or a cross-reference.
  const pendingVerse = useRef<number | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      const v = takePendingVerse() ?? (params.verse ? Number(params.verse) : undefined);
      if (v) pendingVerse.current = v;
    }, [params.verse]),
  );

  const scrollToVerse = useCallback((verse: number, animated = true) => {
    const y = verseY.current.get(verse);
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, contentTop.current + y - 140), animated });
  }, []);

  const onLayoutVerse = useCallback(
    (verse: number, y: number) => {
      verseY.current.set(verse, y);
      if (pendingVerse.current === verse) {
        pendingVerse.current = undefined;
        setTimeout(() => {
          scrollToVerse(verse);
          setSelected(new Set([verse]));
        }, 250);
      }
    },
    [scrollToVerse],
  );

  // Keep the verse being read aloud in view.
  const speakingVerse =
    audioState.status !== 'idle' && audioState.book === book && audioState.chapter === chapter ? audioState.verse : undefined;
  useEffect(() => {
    if (speakingVerse) scrollToVerse(speakingVerse);
  }, [speakingVerse, scrollToVerse]);

  const onPressVerse = useCallback((verse: number) => {
    haptics.select();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(verse)) next.delete(verse);
      else next.add(verse);
      return next;
    });
  }, []);

  const go = useCallback((target: { book: number; chapter: number } | undefined) => {
    if (!target) return;
    haptics.tap();
    setPreference('lastRead', target);
  }, []);

  // Swipe left/right to change chapters.
  const offset = useSharedValue(0);
  const pan = Gesture.Pan()
    .activeOffsetX([-25, 25])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      offset.value = e.translationX * 0.35;
    })
    .onEnd((e) => {
      if (e.translationX < -90) scheduleOnRN(go, nextChapter(book, chapter));
      else if (e.translationX > 90) scheduleOnRN(go, previousChapter(book, chapter));
      offset.value = withSpring(0, springs.gentle);
    });
  const swipeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  const fade = useSharedValue(1);
  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: 260 });
  }, [book, chapter, fade]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const bookInfo = getBook(book);
  const title = formatReference({ book, chapter });
  const selectedList = useMemo(() => [...selected], [selected]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable
              onPress={() => router.push({ pathname: '/chapter-picker', params: { book } })}
              accessibilityRole="button"
              accessibilityLabel={`${title}. Choose a chapter`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
              <AppText variant="headline">{title}</AppText>
              <Icon name="chevronDown" size={14} color={colors.textSecondary} strokeWidth={2.4} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Pressable
                onPress={() => router.push('/translation-picker')}
                accessibilityLabel={`Translation ${prefs.translation}. Change`}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
                <AppText variant="footnote" weight="700">
                  {prefs.translation}
                </AppText>
              </Pressable>
              <Pressable onPress={() => router.push('/reader-settings')} accessibilityLabel="Text settings" hitSlop={8}>
                <Icon name="textSize" size={22} color={colors.gold} />
              </Pressable>
              <Pressable
                onPress={() => (audioState.status === 'idle' ? audio.play(book, chapter) : audio.toggle())}
                accessibilityLabel="Listen to this chapter"
                hitSlop={8}>
                <Icon name="headphones" size={22} color={colors.gold} />
              </Pressable>
            </View>
          ),
        }}
      />

      <GestureDetector gesture={pan}>
        <ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: space.lg + 4, paddingTop: space.lg, paddingBottom: 220 }}>
          <Animated.View style={[swipeStyle, fadeStyle]} onLayout={(e) => (contentTop.current = e.nativeEvent.layout.y)}>
            <View style={{ alignItems: 'center', marginBottom: space.xl, gap: space.xs }}>
              <AppText variant="overline" color="gold">
                {bookInfo.name}
              </AppText>
              <AppText style={{ fontSize: 56, lineHeight: 64, fontWeight: '200', color: colors.text }}>{chapter}</AppText>
              <AppText variant="caption" color="textTertiary">
                {translationInfo(prefs.translation).name}
              </AppText>
              {psalmTitle && (
                <AppText
                  variant="subhead"
                  color="textSecondary"
                  align="center"
                  style={{ fontStyle: 'italic', marginTop: space.md, paddingHorizontal: space.lg }}>
                  {psalmTitle}
                </AppText>
              )}
            </View>

            {loading && !verses ? (
              <ActivityIndicator color={colors.gold} style={{ marginTop: space.xxl }} />
            ) : error ? (
              <View style={{ alignItems: 'center', gap: space.md, marginTop: space.xl }}>
                <AppText variant="callout" color="textSecondary" align="center">
                  {error.message}
                </AppText>
                <Button title="Use BSB instead" variant="secondary" onPress={() => setPreference('translation', 'BSB')} />
              </View>
            ) : (
              verses && (
                <ChapterView
                  verses={verses}
                  highlights={highlights}
                  notes={notes}
                  bookmarks={bookmarks}
                  selected={selected}
                  speakingVerse={speakingVerse}
                  onPressVerse={onPressVerse}
                  onLayoutVerse={onLayoutVerse}
                />
              )
            )}

            {verses && (
              <View style={{ marginTop: space.xxl, gap: space.lg, alignItems: 'center' }}>
                <Button
                  title={read ? 'Chapter read' : 'Mark as read'}
                  icon="check"
                  variant={read ? 'secondary' : 'primary'}
                  onPress={() => {
                    if (!read) {
                      markChapterRead(book, chapter);
                      haptics.success();
                    }
                  }}
                />
                <View style={{ flexDirection: 'row', gap: space.md }}>
                  <ChapterNavButton
                    label="Previous"
                    icon="chevronLeft"
                    disabled={!previousChapter(book, chapter)}
                    onPress={() => go(previousChapter(book, chapter))}
                  />
                  <ChapterNavButton
                    label="Next"
                    icon="chevronRight"
                    trailing
                    disabled={!nextChapter(book, chapter)}
                    onPress={() => go(nextChapter(book, chapter))}
                  />
                </View>
                <AppText variant="caption" color="textTertiary">
                  Chapter {chapter} of {chapterCount(book)} · Swipe to turn the page
                </AppText>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </GestureDetector>

      {selected.size > 0 ? (
        <VerseActions book={book} chapter={chapter} selected={selectedList} onDone={() => setSelected(new Set())} />
      ) : (
        <AudioBar />
      )}
    </View>
  );
}

function ChapterNavButton({
  label,
  icon,
  onPress,
  disabled,
  trailing,
}: {
  label: string;
  icon: 'chevronLeft' | 'chevronRight';
  onPress: () => void;
  disabled?: boolean;
  trailing?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${label} chapter`}
      style={({ pressed }) => ({
        flexDirection: trailing ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: space.lg,
        paddingVertical: 12,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        opacity: disabled ? 0.35 : pressed ? 0.6 : 1,
      })}>
      <Icon name={icon} size={16} color={colors.text} strokeWidth={2.2} />
      <AppText variant="subhead" weight="600">
        {label}
      </AppText>
    </Pressable>
  );
}
