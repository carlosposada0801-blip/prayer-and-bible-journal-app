import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { AppText, Card, EmptyState } from '@/components/ui';
import { formatReference, type Reference } from '@/data/bible/references';
import { getCrossReferences, getPassageTextSafe } from '@/lib/bible/engine';
import { useAsync, usePassageText } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** Sheet: related verses (cross-references) for one verse. */
export default function CrossReferencesSheet() {
  const params = useLocalSearchParams<{ book: string; chapter: string; verse: string }>();
  const book = Number(params.book);
  const chapter = Number(params.chapter);
  const verse = Number(params.verse);
  const prefs = usePreferences();
  const { colors } = useTheme();
  const source = { book, chapter, verseStart: verse, verseEnd: verse };
  const { data: sourceText } = usePassageText(source);

  const { data, loading } = useAsync(async () => {
    const refs = await getCrossReferences(book, chapter, verse);
    return Promise.all(refs.map(async (r) => ({ ref: r, text: await getPassageTextSafe(prefs.translation, r) })));
  }, `${prefs.translation}.${book}.${chapter}.${verse}`);

  const open = (r: Reference) => {
    router.back();
    setTimeout(() => openReader(r.book, r.chapter, r.verseStart), 50);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.lg, gap: space.md }}>
      <AppText variant="title2">Related Verses</AppText>
      <View style={{ borderLeftWidth: 3, borderLeftColor: colors.gold, paddingLeft: space.md, gap: space.xs, marginBottom: space.sm }}>
        <AppText variant="scripture" color="textSecondary" style={{ fontSize: 17, lineHeight: 26 }}>
          {sourceText}
        </AppText>
        <AppText variant="footnote" color="gold" weight="600">
          {formatReference(source)}
        </AppText>
      </View>

      {loading && <ActivityIndicator color={colors.gold} />}
      {data?.length === 0 && (
        <EmptyState icon="link" title="No related verses" message="This verse doesn't have cross-references yet." />
      )}
      {data?.map(({ ref, text }) => (
        <Card key={formatReference(ref)} onPress={() => open(ref)} style={{ gap: space.xs }}>
          <AppText variant="subhead" color="gold" weight="700">
            {formatReference(ref)}
          </AppText>
          <AppText variant="callout" numberOfLines={4}>
            {text}
          </AppText>
        </Card>
      ))}
      <AppText variant="caption" color="textTertiary" align="center" style={{ marginTop: space.md }}>
        Cross-references from OpenBible.info (CC BY)
      </AppText>
    </ScrollView>
  );
}
