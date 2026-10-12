import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Button, Chip, ChipRow, TextField } from '@/components/ui';
import { DateField } from '@/components/ui/date-field';
import { FAST_LENGTHS, FAST_TYPES, fastTypeInfo, HEALTH_NOTE } from '@/data/fasting';
import { startFast, type FastType } from '@/db/fasting';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** Sheet: start a new fast. */
export default function NewFast() {
  const { colors } = useTheme();
  const [type, setType] = useState<FastType>('food');
  const [hours, setHours] = useState(24);
  const [customName, setCustomName] = useState('');
  const [focus, setFocus] = useState('');
  const [start, setStart] = useState(new Date());
  const info = fastTypeInfo(type);

  const begin = () => {
    startFast({
      type,
      title: type === 'custom' ? customName.trim() || 'Custom Fast' : info.name,
      focus: focus.trim(),
      plannedHours: hours,
      startedAt: start.toISOString(),
    });
    haptics.success();
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <AppText variant="title2">Start a Fast</AppText>

        <View style={{ gap: space.sm }}>
          {FAST_TYPES.map((t) => {
            const on = t.type === type;
            return (
              <Pressable
                key={t.type}
                onPress={() => {
                  haptics.select();
                  setType(t.type);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  padding: space.md,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: on ? colors.sky : 'transparent',
                  backgroundColor: on ? colors.skySoft : colors.surface,
                }}>
                <Icon name={t.icon} size={22} color={on ? colors.sky : colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <AppText variant="headline">{t.name}</AppText>
                  <AppText variant="footnote" color="textSecondary">
                    {t.description}
                  </AppText>
                </View>
                {on && <Icon name="check" size={18} color={colors.sky} strokeWidth={2.6} />}
              </Pressable>
            );
          })}
        </View>

        {type === 'custom' && <TextField value={customName} onChangeText={setCustomName} placeholder="What are you setting aside? (e.g. TV, sugar)" />}

        <View style={{ gap: space.sm }}>
          <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
            Length
          </AppText>
          <ChipRow>
            {FAST_LENGTHS.map((l) => (
              <Chip key={l.hours} label={l.label} selected={hours === l.hours} onPress={() => setHours(l.hours)} />
            ))}
          </ChipRow>
        </View>

        <DateField label="Started" value={start} onChange={setStart} mode="datetime" maximumDate={new Date()} />

        <View style={{ gap: space.sm }}>
          <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
            Spiritual focus
          </AppText>
          <TextField
            multiline
            journal
            value={focus}
            onChangeText={setFocus}
            placeholder="Why are you fasting? What are you seeking God for?"
            style={{ minHeight: 90 }}
          />
        </View>

        {info.food && (
          <View style={{ backgroundColor: colors.roseSoft, borderRadius: radius.md, padding: space.md, flexDirection: 'row', gap: space.sm }}>
            <Icon name="heart" size={18} color={colors.rose} />
            <AppText variant="footnote" style={{ flex: 1, lineHeight: 18 }}>
              {HEALTH_NOTE}
            </AppText>
          </View>
        )}

        <Button title="Begin Fast" icon="droplet" onPress={begin} disabled={type === 'custom' && !customName.trim()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
