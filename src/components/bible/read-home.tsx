import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { Appear, AppText, Card, IconBadge, PressableScale, ProgressBar, SectionHeader } from '@/components/ui';
import { BOOKS } from '@/data/bible/books';
import { formatReference } from '@/data/bible/references';
import { translationInfo } from '@/data/bible/translations';
import { allBookmarks, allHighlights, allNotes, totalChaptersRead } from '@/db/bible-notes';
import { all } from '@/db/database';
import { useLive } from '@/db/live';
import { usePassageText } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** "Read" section of the Bible tab. */
export function ReadHome() {
  const prefs = usePreferences();
  const { colors, shadow } = useTheme();
  const { book, chapter } = prefs.lastRead;
  const { data: preview } = usePassageText({ book, chapter, verseStart: 1, verseEnd: 2 });
  const counts = useLive(
    () => ({ highlights: allHighlights().length, notes: allNotes().length, bookmarks: allBookmarks().length }),
    ['highlights', 'notes', 'bookmarks'],
  );
  const chaptersRead = useLive(totalChaptersRead, ['chapters_read']);
  const readByBook = useLive(
    () => new Map(all<{ book: number; n: number }>('SELECT book, COUNT(*) AS n FROM chapters_read GROUP BY book').map((r) => [r.book, r.n])),
    ['chapters_read'],
  );

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        <PressableScale onPress={() => openReader(book, chapter)} accessibilityLabel={`Continue reading ${formatReference({ book, chapter })}`}>
          <View style={[{ borderRadius: radius.xl, borderCurve: 'continuous' }, shadow.medium]}>
            <LinearGradient
              colors={colors.gradientVerse}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.md, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', right: -20, top: -10, opacity: 0.08 }}>
                <Icon name="openBook" size={160} color="#F5EAD0" strokeWidth={1} />
              </View>
              <AppText variant="overline" style={{ color: '#E2BE6A' }}>
                Continue reading
              </AppText>
              <AppText variant="title1" style={{ color: colors.textOnDark }}>
                {formatReference({ book, chapter })}
              </AppText>
              <AppText variant="scripture" numberOfLines={2} style={{ color: 'rgba(251, 246, 234, 0.75)', fontSize: 17, lineHeight: 26 }}>
                {preview}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs }}>
                <View style={{ backgroundColor: 'rgba(226, 190, 106, 0.18)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <AppText variant="caption" weight="700" style={{ color: '#E2BE6A' }}>
                    {translationInfo(prefs.translation).name}
                  </AppText>
                </View>
                <View style={{ flex: 1 }} />
                <AppText variant="subhead" weight="600" style={{ color: colors.textOnDark }}>
                  Open
                </AppText>
                <Icon name="chevronRight" size={16} color={colors.textOnDark} />
              </View>
            </LinearGradient>
          </View>
        </PressableScale>
      </Appear>

      <Appear index={1}>
        <Pressable
          onPress={() => router.push('/bible/search')}
          accessibilityRole="search"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.md,
            paddingHorizontal: space.md,
            height: 46,
          }}>
          <Icon name="search" size={18} color={colors.textTertiary} />
          <AppText variant="body" color="textTertiary">
            Search the Bible
          </AppText>
        </Pressable>
      </Appear>

      <Appear index={2}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <MiniTile icon="palette" tone="gold" label="Highlights" count={counts.highlights} tab="highlights" />
          <MiniTile icon="pen" tone="sage" label="Notes" count={counts.notes} tab="notes" />
          <MiniTile icon="bookmark" tone="sky" label="Bookmarks" count={counts.bookmarks} tab="bookmarks" />
        </View>
      </Appear>

      <Appear index={3}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <IconBadge name="map" tone="navy" />
            <View style={{ flex: 1 }}>
              <AppText variant="headline">Your journey through the Bible</AppText>
              <AppText variant="subhead" color="textSecondary">
                {chaptersRead} of 1,189 chapters read
              </AppText>
            </View>
          </View>
          <ProgressBar progress={chaptersRead / 1189} />
        </Card>
      </Appear>

      <Appear index={4}>
        <SectionHeader title="Books" action="Browse" onAction={() => router.push({ pathname: '/chapter-picker', params: { mode: 'open' } })} />
      </Appear>
      {(['OT', 'NT'] as const).map((testament) => (
        <View key={testament} style={{ gap: space.sm }}>
          <AppText variant="overline" color="textTertiary">
            {testament === 'OT' ? 'Old Testament' : 'New Testament'}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {BOOKS.filter((b) => b.testament === testament).map((b) => {
              const read = readByBook.get(b.id) ?? 0;
              const done = read >= b.verses.length;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => router.push({ pathname: '/chapter-picker', params: { book: b.id, mode: 'open' } })}
                  accessibilityLabel={`${b.name}, ${read} of ${b.verses.length} chapters read`}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: radius.pill,
                    backgroundColor: done ? colors.goldSoft : colors.surface,
                    opacity: pressed ? 0.6 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  })}>
                  {done && <Icon name="check" size={12} color={colors.gold} strokeWidth={2.6} />}
                  <AppText variant="subhead" weight="500" style={{ color: done ? colors.gold : colors.text }}>
                    {b.abbr}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function MiniTile({ icon, tone, label, count, tab }: { icon: IconName; tone: 'gold' | 'sage' | 'sky'; label: string; count: number; tab: string }) {
  return (
    <Card onPress={() => router.push({ pathname: '/bible/saved', params: { tab } })} style={{ flex: 1, gap: space.sm, padding: space.md }}>
      <IconBadge name={icon} tone={tone} size={36} />
      <View>
        <AppText variant="title3">{count}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {label}
        </AppText>
      </View>
    </Card>
  );
}
