import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Card, Chip, ChipRow, EmptyState, TextField } from '@/components/ui';
import { formatReference, getBook, parseReference } from '@/data/bible/references';
import { searchBible } from '@/lib/bible/engine';
import type { SearchResult } from '@/lib/bible/types';
import { openReader } from '@/lib/bible/navigation';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

type Scope = 'all' | 'OT' | 'NT' | 'book';

/** Search the whole Bible by word, phrase or reference. */
export default function SearchScreen() {
  const prefs = usePreferences();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const currentBook = prefs.lastRead.book;
  const asReference = parseReference(query);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || asReference) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      searchBible(prefs.translation, q, {
        testament: scope === 'OT' || scope === 'NT' ? scope : undefined,
        book: scope === 'book' ? currentBook : undefined,
      })
        .then((r) => {
          setResults(r.results);
          setTotal(r.total);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, scope, prefs.translation, currentBook, asReference]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: 'Search' }} />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        data={results}
        keyExtractor={(r) => `${r.book}.${r.chapter}.${r.verse}`}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ gap: space.md, marginBottom: space.sm }}>
            <TextField
              icon="search"
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder='Try "peace", "shepherd" or John 3:16'
              returnKeyType="search"
              autoCorrect={false}
            />
            <ChipRow>
              <Chip label="Whole Bible" selected={scope === 'all'} onPress={() => setScope('all')} />
              <Chip label="Old Testament" selected={scope === 'OT'} onPress={() => setScope('OT')} />
              <Chip label="New Testament" selected={scope === 'NT'} onPress={() => setScope('NT')} />
              <Chip label={getBook(currentBook).name} selected={scope === 'book'} onPress={() => setScope('book')} />
            </ChipRow>
            {asReference && (
              <Card onPress={() => openReader(asReference.book, asReference.chapter, asReference.verseStart)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <Icon name="openBook" size={22} color={colors.gold} />
                  <AppText variant="headline" style={{ flex: 1 }}>
                    Go to {formatReference(asReference)}
                  </AppText>
                  <Icon name="chevronRight" size={18} color={colors.textTertiary} />
                </View>
              </Card>
            )}
            {loading && <ActivityIndicator color={colors.gold} />}
            {!loading && total > 0 && (
              <AppText variant="footnote" color="textSecondary">
                {total.toLocaleString()} verse{total === 1 ? '' : 's'}
                {total > results.length ? ` · showing first ${results.length}` : ''} · {prefs.translation}
              </AppText>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && query.trim().length >= 3 && !asReference ? (
            <EmptyState icon="search" title="No verses found" message="Try a different word or a shorter phrase." />
          ) : null
        }
        renderItem={({ item }) => (
          <Card onPress={() => openReader(item.book, item.chapter, item.verse)} style={{ gap: space.xs }}>
            <AppText variant="subhead" color="gold" weight="700">
              {formatReference({ book: item.book, chapter: item.chapter, verseStart: item.verse })}
            </AppText>
            <Highlighted text={item.text} term={query.trim()} />
          </Card>
        )}
      />
    </View>
  );
}

function Highlighted({ text, term }: { text: string; term: string }) {
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'));
  return (
    <AppText variant="callout">
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <AppText key={i} variant="callout" color="gold" weight="700">
            {p}
          </AppText>
        ) : (
          p
        ),
      )}
    </AppText>
  );
}
