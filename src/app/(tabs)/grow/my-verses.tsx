import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Button, Card, EmptyState, Screen, TextField } from '@/components/ui';
import { formatReference, parseReference } from '@/data/bible/references';
import { useLive } from '@/db/live';
import { addMemoryVerse, MEMORIZED_STAGE, myVerses, type MemoryVerse } from '@/db/memorize';
import { usePassageText } from '@/lib/bible/hooks';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** Verses you've chosen to memorize, plus an "add a verse" field. */
export default function MyVersesScreen() {
  const verses = useLive(myVerses, ['memory_verses']);
  const [input, setInput] = useState('');
  const parsed = parseReference(input);
  const { data: preview } = usePassageText(parsed);
  const { colors } = useTheme();

  const add = () => {
    if (!parsed) return;
    addMemoryVerse(formatReference(parsed));
    haptics.success();
    setInput('');
  };

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'My Verses' }} />
      <View style={{ gap: space.sm }}>
        <TextField icon="plus" value={input} onChangeText={setInput} placeholder="Add a verse, e.g. Psalm 46:10" returnKeyType="done" onSubmitEditing={add} autoCorrect={false} />
        {parsed && (
          <Card style={{ gap: space.sm }}>
            <AppText variant="subhead" color="gold" weight="700">
              {formatReference(parsed)}
            </AppText>
            <AppText variant="scripture" style={{ fontSize: 17, lineHeight: 26 }} numberOfLines={6}>
              {preview ?? ' '}
            </AppText>
            <Button title="Add to My Verses" icon="plus" onPress={add} />
          </Card>
        )}
        {input.length > 3 && !parsed && (
          <AppText variant="footnote" color="textTertiary">
            Type a reference like “John 15:5” or “Romans 12:1-2”.
          </AppText>
        )}
      </View>

      {verses.length === 0 ? (
        <EmptyState icon="bookmark" tone="rose" title="No verses yet" message="Add a verse above, or tap “Memorize” on any verse in the Bible reader." />
      ) : (
        verses.map((v) => <VerseRow key={v.id} verse={v} />)
      )}
    </Screen>
  );
}

function VerseRow({ verse }: { verse: MemoryVerse }) {
  const { colors } = useTheme();
  const { data } = usePassageText(parseReference(verse.reference));
  const memorized = verse.stage >= MEMORIZED_STAGE;
  return (
    <Card onPress={() => router.push({ pathname: '/verse-level', params: { ref: verse.reference } })} style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <AppText variant="headline" style={{ flex: 1 }}>
          {verse.reference}
        </AppText>
        {memorized ? (
          <Icon name="crown" size={20} color={colors.gold} />
        ) : (
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {Array.from({ length: MEMORIZED_STAGE }, (_, i) => (
              <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < verse.stage ? colors.gold : colors.surfaceMuted }} />
            ))}
          </View>
        )}
      </View>
      <AppText variant="callout" color="textSecondary" numberOfLines={2}>
        {data ?? ' '}
      </AppText>
      <Pressable onPress={() => router.push({ pathname: '/practice', params: { mode: 'lesson', ref: verse.reference } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name="play" size={14} color={colors.gold} strokeWidth={2.4} />
        <AppText variant="subhead" color="gold" weight="600">
          {memorized ? 'Practice' : verse.stage === 0 ? 'Start' : `Level ${verse.stage + 1}`}
        </AppText>
      </Pressable>
    </Card>
  );
}
