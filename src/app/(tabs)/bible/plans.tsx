import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { PlanRow } from '@/components/plans/plan-card';
import { AppText, Chip, ChipRow, EmptyState, TextField } from '@/components/ui';
import { LENGTH_BUCKETS, lengthBucket, PLAN_CATEGORIES, PLANS, type PlanCategory } from '@/data/plans';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** The full plan library: search and filter by category and length. */
export default function PlanLibrary() {
  const params = useLocalSearchParams<{ category?: PlanCategory }>();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlanCategory | undefined>(params.category);
  const [length, setLength] = useState<number | undefined>();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANS.filter((p) => {
      if (category && p.category !== category) return false;
      if (length && lengthBucket(p.days()) !== length) return false;
      if (!q) return true;
      return [p.title, p.description, p.category, ...p.topics].some((s) => s.toLowerCase().includes(q));
    });
  }, [query, category, length]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: category ?? 'Reading Plans' }} />
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        data={results}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ gap: space.md, marginBottom: space.sm }}>
            <TextField icon="search" value={query} onChangeText={setQuery} placeholder="Search: anxiety, John, David, Advent…" />
            <ChipRow>
              <Chip label="All" selected={!category} onPress={() => setCategory(undefined)} />
              {PLAN_CATEGORIES.map((c) => (
                <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(category === c ? undefined : c)} />
              ))}
            </ChipRow>
            <ChipRow>
              <Chip label="Any length" icon="calendar" selected={!length} onPress={() => setLength(undefined)} />
              {LENGTH_BUCKETS.map((b) => (
                <Chip key={b} label={`${b} days`} selected={length === b} onPress={() => setLength(length === b ? undefined : b)} />
              ))}
            </ChipRow>
            <AppText variant="footnote" color="textTertiary">
              {results.length} plan{results.length === 1 ? '' : 's'}
            </AppText>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="search" title="No plans found" message="Try another search or clear a filter." />}
        renderItem={({ item }) => <PlanRow plan={item} />}
      />
    </View>
  );
}
