import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';

import { AppText, Button, TextField } from '@/components/ui';
import { formatReference } from '@/data/bible/references';
import { saveNote, verseNote } from '@/db/bible-notes';
import { usePassageText } from '@/lib/bible/hooks';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** Sheet: write or edit a note on a verse. */
export default function VerseNoteSheet() {
  const params = useLocalSearchParams<{ book: string; chapter: string; verse: string }>();
  const book = Number(params.book);
  const chapter = Number(params.chapter);
  const verse = Number(params.verse);
  const { colors } = useTheme();
  const reference = { book, chapter, verseStart: verse, verseEnd: verse };
  const { data: text } = usePassageText(reference);
  const [body, setBody] = useState(() => verseNote(book, chapter, verse)?.body ?? '');

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <AppText variant="title2">Note</AppText>
        <View style={{ borderLeftWidth: 3, borderLeftColor: colors.gold, paddingLeft: space.md, gap: space.xs }}>
          <AppText variant="scripture" color="textSecondary" style={{ fontSize: 17, lineHeight: 26 }}>
            {text}
          </AppText>
          <AppText variant="footnote" color="gold" weight="600">
            {formatReference(reference)}
          </AppText>
        </View>
        <TextField
          multiline
          journal
          autoFocus
          value={body}
          onChangeText={setBody}
          placeholder="What is God showing you here?"
        />
        <Button
          title="Save Note"
          onPress={() => {
            saveNote(book, chapter, verse, body);
            haptics.success();
            router.back();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
