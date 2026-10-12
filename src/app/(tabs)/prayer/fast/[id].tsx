import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Card, EmptyState, IconBadge, Screen } from '@/components/ui';
import { fastTypeInfo, formatDuration } from '@/data/fasting';
import { deleteFast, getFast, reflectionsFor } from '@/db/fasting';
import { useLive } from '@/db/live';
import { formatDate, relativeDay } from '@/lib/dates';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

/** A past fast and its reflections. */
export default function FastDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fast = useLive(() => getFast(Number(id)), ['fasts'], [id]);
  const reflections = useLive(() => reflectionsFor(Number(id)), ['fast_reflections'], [id]);
  const { colors } = useTheme();
  if (!fast) return <EmptyState icon="droplet" title="Fast not found" message="It may have been deleted." />;
  const info = fastTypeInfo(fast.type);
  const hours = fast.ended_at ? (new Date(fast.ended_at).getTime() - new Date(fast.started_at).getTime()) / 3_600_000 : 0;

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Pressable
              hitSlop={8}
              onPress={() =>
                Alert.alert('Delete this fast?', 'Its reflections will be deleted too.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => (deleteFast(fast.id), router.back()) },
                ])
              }>
              <Icon name="trash" size={21} color={colors.rose} />
            </Pressable>
          ),
        }}
      />
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <IconBadge name={info.icon} tone="sky" size={68} />
        <AppText variant="title1" align="center">
          {fast.title}
        </AppText>
        <AppText variant="subhead" color="textSecondary">
          {formatDate(fast.started_at)} · {formatDuration(hours)} of {formatDuration(fast.planned_hours)} {fast.completed ? '· completed ✓' : ''}
        </AppText>
        {fast.focus ? (
          <AppText variant="scripture" align="center" style={{ fontSize: 18, lineHeight: 28, marginTop: space.sm }}>
            “{fast.focus}”
          </AppText>
        ) : null}
      </View>
      <AppText variant="title3">Reflections</AppText>
      {reflections.length === 0 ? (
        <AppText variant="callout" color="textSecondary">
          No reflections were written during this fast.
        </AppText>
      ) : (
        reflections.map((r) => (
          <Card key={r.id} style={{ gap: 4 }}>
            <AppText variant="caption" color="textTertiary">
              {relativeDay(r.created_at)}
            </AppText>
            <AppText variant="callout">{r.body}</AppText>
          </Card>
        ))
      )}
    </Screen>
  );
}
