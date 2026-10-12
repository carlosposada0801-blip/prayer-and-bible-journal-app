import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect } from 'react';
import { Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '@/components/memorize/mascot';
import { Button } from '@/components/ui';
import { VerseCard } from '@/components/verse-card';
import { formatReference } from '@/data/bible/references';
import { verseOfTheDay } from '@/data/verses-of-the-day';
import { usePassageText } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/**
 * Today's verse, on its own. Opened by the widgets (abide://votd) and by the
 * Siri Shortcut (abide://votd?speak=1, which also reads it aloud).
 */
export default function VerseOfTheDayScreen() {
  const { speak } = useLocalSearchParams<{ speak?: string }>();
  const prefs = usePreferences();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const ref = verseOfTheDay();
  const reference = formatReference(ref);
  const { data: text } = usePassageText(ref);

  useEffect(() => {
    if (speak && text) Speech.speak(`${reference}. ${text}`, { language: 'en-US' });
    return () => {
      Speech.stop();
    };
  }, [speak, text, reference]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: space.lg, paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg, gap: space.lg }}>
      <View style={{ alignItems: 'center' }}>
        <Mascot mood="happy" size={96} />
      </View>
      <VerseCard text={text ?? ' '} reference={reference} translation={prefs.translation} />
      <View style={{ flex: 1 }} />
      <Button title="Listen" icon="headphones" variant="secondary" onPress={() => text && Speech.speak(`${reference}. ${text}`, { language: 'en-US' })} />
      <Button title="Share" icon="share" variant="secondary" onPress={() => Share.share({ message: `“${text}”\n— ${reference} (${prefs.translation})` })} />
      <Button
        title="Read the Chapter"
        icon="openBook"
        onPress={() => {
          router.back();
          setTimeout(() => openReader(ref.book, ref.chapter, ref.verseStart), 60);
        }}
      />
    </View>
  );
}
