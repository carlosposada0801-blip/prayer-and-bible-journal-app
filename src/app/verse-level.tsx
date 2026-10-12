import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Button } from '@/components/ui';
import { parseReference } from '@/data/bible/references';
import { unitFor } from '@/data/memorize';
import { useLive } from '@/db/live';
import { getMemoryVerse, MEMORIZED_STAGE, removeMemoryVerse } from '@/db/memorize';
import { relativeDay } from '@/lib/dates';
import { usePassageText } from '@/lib/bible/hooks';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

const LEVEL_NAMES = ['Fill in the blank', 'Word order', 'Which reference?', 'First letters', 'Full recall'];

/** Sheet: a verse's level, preview and Start button. */
export default function VerseLevelSheet() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const { colors } = useTheme();
  const verse = useLive(() => getMemoryVerse(ref), ['memory_verses'], [ref]);
  const { data: text } = usePassageText(parseReference(ref));
  const stage = verse?.stage ?? 0;
  const memorized = stage >= MEMORIZED_STAGE;
  const unit = unitFor(ref);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
      <View style={{ gap: 4 }}>
        <AppText variant="overline" color="gold">
          {unit ? unit.title : 'My Verses'}
        </AppText>
        <AppText variant="title1">{ref}</AppText>
      </View>
      <AppText variant="scripture" style={{ fontSize: 19, lineHeight: 30 }}>
        {text ?? ' '}
      </AppText>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {LEVEL_NAMES.map((name, i) => (
          <View key={name} style={{ flex: 1, gap: 4 }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: i < stage ? colors.gold : colors.surfaceMuted }} />
            <AppText variant="caption" color={i === stage ? 'gold' : 'textTertiary'} numberOfLines={2} style={{ fontSize: 10, lineHeight: 12 }}>
              {name}
            </AppText>
          </View>
        ))}
      </View>

      {memorized ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.goldSoft, padding: space.md, borderRadius: radius.md }}>
          <Icon name="crown" size={22} color={colors.gold} />
          <AppText variant="callout" style={{ flex: 1 }}>
            Memorized! {verse?.due_at ? `Next review ${relativeDay(verse.due_at).toLowerCase()}.` : ''}
          </AppText>
        </View>
      ) : null}

      <Button
        title={memorized ? 'Practice Again' : stage === 0 ? 'Start' : `Start Level ${stage + 1}`}
        icon="play"
        onPress={() => {
          router.back();
          setTimeout(() => router.push({ pathname: '/practice', params: { mode: 'lesson', ref } }), 80);
        }}
      />
      {verse?.custom === 1 && (
        <Pressable
          onPress={() =>
            Alert.alert('Remove this verse?', 'Your progress on it will be lost.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => (removeMemoryVerse(ref), router.back()) },
            ])
          }
          style={{ alignItems: 'center', padding: space.sm }}>
          <AppText variant="body" color="rose">
            Remove from My Verses
          </AppText>
        </Pressable>
      )}
    </ScrollView>
  );
}
