import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { ScriptureQuote } from '@/components/scripture-quote';
import { Appear, AppText, Card } from '@/components/ui';
import { checkAchievements } from '@/db/achievements';
import { gratitudeFor, gratitudeHistory, setGratitude } from '@/db/gratitude';
import { useLive } from '@/db/live';
import { formatDate, toDateKey } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { textStyle } from '@/theme/typography';

const PROMPTS = ['A blessing from today…', 'Someone I’m thankful for…', 'Something about God I’m grateful for…'];

export function GratitudeSection() {
  const today = toDateKey();
  const saved = useLive(() => gratitudeFor(today), ['gratitude'], [today]);
  const history = useLive(() => gratitudeHistory(), ['gratitude']);
  const filled = saved.filter(Boolean).length;
  const { colors } = useTheme();

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        <Card elevated="medium" style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <AppText variant="overline" color="rose">
                Today
              </AppText>
              <AppText variant="title3">Three things I’m thankful for</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < filled ? colors.rose : colors.surfaceMuted }} />
              ))}
            </View>
          </View>
          {[0, 1, 2].map((i) => (
            <GratitudeInput key={`${today}-${i}`} date={today} position={i} initial={saved[i]} placeholder={PROMPTS[i]} />
          ))}
        </Card>
      </Appear>

      <ScriptureQuote reference="1 Thessalonians 5:18" size="small" />

      {history.length > 0 && (
        <View style={{ gap: space.md }}>
          <AppText variant="title3">Looking back</AppText>
          {history.map((day, i) => (
            <Appear key={day.date} index={Math.min(i + 1, 6)}>
              <Card style={{ gap: space.sm }}>
                <AppText variant="caption" color="textTertiary">
                  {formatDate(day.date, 'long')}
                </AppText>
                {day.items.map((item, j) => (
                  <View key={j} style={{ flexDirection: 'row', gap: space.sm }}>
                    <AppText variant="callout" color="rose">
                      ♥
                    </AppText>
                    <AppText variant="callout" style={{ flex: 1 }}>
                      {item}
                    </AppText>
                  </View>
                ))}
              </Card>
            </Appear>
          ))}
        </View>
      )}
    </View>
  );
}

function GratitudeInput({ date, position, initial, placeholder }: { date: string; position: number; initial: string; placeholder: string }) {
  const { colors, textScale } = useTheme();
  const [value, setValue] = useState(initial);
  const savedValue = useRef(initial);
  useEffect(() => {
    setValue(initial);
    savedValue.current = initial;
  }, [initial]);

  const commit = () => {
    if (value.trim() === savedValue.current) return;
    const wasEmpty = !savedValue.current;
    setGratitude(date, position, value);
    savedValue.current = value.trim();
    if (wasEmpty && value.trim()) haptics.success();
    checkAchievements();
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, paddingHorizontal: space.md }}>
      <AppText variant="headline" color="rose">
        {position + 1}
      </AppText>
      <TextInput
        value={value}
        onChangeText={setValue}
        onBlur={commit}
        onSubmitEditing={commit}
        returnKeyType="done"
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.gold}
        style={[textStyle('body', textScale), { flex: 1, color: colors.text, paddingVertical: 13 }]}
      />
    </View>
  );
}
