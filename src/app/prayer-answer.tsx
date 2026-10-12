import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';

import { AppText, Button, Confetti, IconBadge, TextField } from '@/components/ui';
import { DateField } from '@/components/ui/date-field';
import { checkAchievements } from '@/db/achievements';
import { getPrayer, markAnswered } from '@/db/prayers';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** Sheet: record how God answered a prayer. */
export default function PrayerAnswerSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayer = getPrayer(Number(id));
  const { colors } = useTheme();
  const [note, setNote] = useState(prayer?.answer_note ?? '');
  const [date, setDate] = useState(prayer?.answered_at ? new Date(prayer.answered_at) : new Date());
  const [burst, setBurst] = useState(0);

  if (!prayer) return null;

  const save = () => {
    const first = !prayer.answered_at;
    markAnswered(prayer.id, note, date.toISOString());
    haptics.success();
    checkAchievements();
    if (first) {
      setBurst((b) => b + 1);
      setTimeout(() => router.back(), 1400);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: space.sm, paddingTop: space.sm }}>
          <IconBadge name="sparkle" tone="sage" size={60} />
          <AppText variant="title2" align="center">
            God answered!
          </AppText>
          <AppText variant="callout" color="textSecondary" align="center">
            “{prayer.title}”
          </AppText>
        </View>
        <TextField
          multiline
          journal
          autoFocus
          value={note}
          onChangeText={setNote}
          placeholder="How did God answer? What did you learn?"
        />
        <DateField label="Answered on" value={date} onChange={setDate} maximumDate={new Date()} />
        <Button title="Save" onPress={save} />
        <AppText variant="footnote" color="textTertiary" align="center">
          Sometimes the answer is “yes,” sometimes “wait,” sometimes “I have something better.” Every answer is worth remembering.
        </AppText>
      </ScrollView>
      <Confetti burstKey={burst} />
    </KeyboardAvoidingView>
  );
}
