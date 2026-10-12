import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Button, Card, Chip, ChipRow, Screen, SegmentedControl, TextField } from '@/components/ui';
import { BOOKS } from '@/data/bible/books';
import { formatReference } from '@/data/bible/references';
import { customPlan } from '@/data/plans';
import { bookRange } from '@/data/plans/generate';
import { createCustomPlan } from '@/db/plans';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

const QUICK: { label: string; books: number[] }[] = [
  { label: 'Gospels', books: bookRange(40, 43) },
  { label: 'New Testament', books: bookRange(40, 66) },
  { label: 'Old Testament', books: bookRange(1, 39) },
  { label: 'Whole Bible', books: bookRange(1, 66) },
  { label: 'Psalms & Proverbs', books: [19, 20] },
  { label: 'Paul’s Letters', books: bookRange(45, 57) },
];

const DAY_PRESETS = [7, 14, 21, 30, 40, 60, 90, 180, 365];

/** Choose any books and a number of days; readings are split evenly. */
export default function PlanBuilder() {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set([43]));
  const [days, setDays] = useState(30);
  const [testament, setTestament] = useState<'OT' | 'NT'>('NT');

  const books = useMemo(() => [...selected].sort((a, b) => a - b), [selected]);
  const chapters = books.reduce((n, b) => n + BOOKS[b - 1].verses.length, 0);
  const preview = useMemo(() => customPlan('custom-preview', { books, days }).schedule().slice(0, 3), [books, days]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Build a Plan' }} />
      <TextField value={title} onChangeText={setTitle} placeholder="Plan name (optional)" />

      <View style={{ gap: space.sm }}>
        <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
          Quick picks
        </AppText>
        <ChipRow>
          {QUICK.map((q) => (
            <Chip key={q.label} label={q.label} onPress={() => setSelected(new Set(q.books))} />
          ))}
        </ChipRow>
      </View>

      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase', flex: 1 }}>
            Books · {books.length} selected
          </AppText>
          <Pressable onPress={() => setSelected(new Set())} hitSlop={8}>
            <AppText variant="footnote" color="gold" weight="600">
              Clear
            </AppText>
          </Pressable>
        </View>
        <SegmentedControl
          options={[
            { value: 'OT', label: 'Old Testament' },
            { value: 'NT', label: 'New Testament' },
          ]}
          value={testament}
          onChange={setTestament}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {BOOKS.filter((b) => b.testament === testament).map((b) => {
            const on = selected.has(b.id);
            return (
              <Pressable
                key={b.id}
                onPress={() => {
                  haptics.select();
                  toggle(b.id);
                }}
                accessibilityState={{ selected: on }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: radius.pill,
                  backgroundColor: on ? colors.primary : colors.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                {on && <Icon name="check" size={12} color={colors.onPrimary} strokeWidth={2.6} />}
                <AppText variant="subhead" weight="600" style={{ color: on ? colors.onPrimary : colors.text }}>
                  {b.abbr}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: space.sm }}>
        <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase' }}>
          Length
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Stepper icon="minus" onPress={() => setDays((d) => Math.max(1, d - (d > 30 ? 10 : 1)))} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="largeTitle" color="gold">
              {days}
            </AppText>
            <AppText variant="caption" color="textTertiary">
              days
            </AppText>
          </View>
          <Stepper icon="plus" onPress={() => setDays((d) => Math.min(730, d + (d >= 30 ? 10 : 1)))} />
        </View>
        <ChipRow>
          {DAY_PRESETS.map((d) => (
            <Chip key={d} label={`${d}`} selected={days === d} onPress={() => setDays(d)} />
          ))}
        </ChipRow>
      </View>

      {books.length > 0 && (
        <Card style={{ gap: space.sm }}>
          <AppText variant="headline">
            {chapters} chapters · about {chapters / days >= 1 ? `${(chapters / days).toFixed(1)} chapters` : 'part of a chapter'} a day
          </AppText>
          {preview.map((d, i) => (
            <AppText key={i} variant="callout" color="textSecondary">
              Day {i + 1}: {d.map((r) => formatReference(r)).join(' · ')}
            </AppText>
          ))}
        </Card>
      )}

      <Button
        title="Create Plan"
        icon="calendar"
        disabled={books.length === 0}
        onPress={() => {
          const id = createCustomPlan({ books, days, title: title.trim() || undefined });
          haptics.success();
          router.replace({ pathname: '/bible/plan/[id]', params: { id } });
        }}
      />
    </Screen>
  );
}

function Stepper({ icon, onPress }: { icon: 'plus' | 'minus'; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} color={colors.text} strokeWidth={2.2} />
    </Pressable>
  );
}
