import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Card, Chip, ChipRow, EmptyState, IconBadge, TextField } from '@/components/ui';
import { useLive } from '@/db/live';
import { listPrayers, listTags, prayerCounts, type PrayerFilter } from '@/db/prayers';
import { addDays } from '@/lib/dates';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

import { PrayerCard } from './prayer-card';

type Range = 'any' | 'week' | 'month' | 'year';

export function JournalSection() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PrayerFilter['status']>('all');
  const [tagId, setTagId] = useState<number | undefined>();
  const [range, setRange] = useState<Range>('any');
  const tags = useLive(listTags, ['tags']);
  const counts = useLive(prayerCounts, ['prayers']);

  const from =
    range === 'any' ? undefined : addDays(new Date(), range === 'week' ? -7 : range === 'month' ? -30 : -365).toISOString();
  const prayers = useLive(() => listPrayers({ search, status, tagId, from }), ['prayers', 'prayer_tags', 'tags'], [
    search,
    status,
    tagId,
    from?.slice(0, 10),
  ]);

  const filtered = Boolean(search || status !== 'all' || tagId || range !== 'any');

  return (
    <View style={{ gap: space.lg }}>
      {counts.answered > 0 && (
        <Appear index={0}>
          <Card onPress={() => router.push('/prayer/answered')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <IconBadge name="sparkle" tone="sage" />
              <View style={{ flex: 1 }}>
                <AppText variant="headline">Answered Prayers</AppText>
                <AppText variant="subhead" color="textSecondary">
                  {counts.answered} {counts.answered === 1 ? 'time' : 'times'} God has answered
                </AppText>
              </View>
              <Icon name="chevronRight" size={18} color={colors.textTertiary} />
            </View>
          </Card>
        </Appear>
      )}

      {counts.total > 0 && (
        <View style={{ gap: space.md }}>
          <TextField icon="search" value={search} onChangeText={setSearch} placeholder="Search prayers" returnKeyType="search" />
          <ChipRow>
            <Chip label="All" selected={status === 'all'} onPress={() => setStatus('all')} />
            <Chip label="Praying" selected={status === 'open'} onPress={() => setStatus('open')} />
            <Chip label="Answered" icon="check" selected={status === 'answered'} onPress={() => setStatus('answered')} />
            <View style={{ width: 1, backgroundColor: colors.separator, marginHorizontal: 4 }} />
            {(['week', 'month', 'year'] as Range[]).map((r) => (
              <Chip
                key={r}
                label={r === 'week' ? 'This week' : r === 'month' ? 'This month' : 'This year'}
                icon="calendar"
                selected={range === r}
                onPress={() => setRange(range === r ? 'any' : r)}
              />
            ))}
          </ChipRow>
          <ChipRow>
            {tags.map((t) => (
              <Chip key={t.id} label={t.name} selected={tagId === t.id} onPress={() => setTagId(tagId === t.id ? undefined : t.id)} />
            ))}
          </ChipRow>
        </View>
      )}

      {prayers.length === 0 ? (
        filtered ? (
          <EmptyState icon="search" title="No prayers match" message="Try clearing a filter or searching for a different word." />
        ) : (
          <EmptyState
            icon="dove"
            tone="sage"
            title="Begin your prayer journal"
            message="Write to God freely. Your prayers stay private on this iPhone."
            action={{ title: 'Write a Prayer', onPress: () => router.push('/prayer-editor') }}
          />
        )
      ) : (
        prayers.map((p, i) => (
          <Appear key={p.id} index={Math.min(i, 6) + 1}>
            <PrayerCard prayer={p} />
          </Appear>
        ))
      )}
    </View>
  );
}
