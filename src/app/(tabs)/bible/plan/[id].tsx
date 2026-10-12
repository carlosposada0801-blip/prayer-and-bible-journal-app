import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Button, Card, EmptyState, IconBadge, ProgressRing, SegmentedControl } from '@/components/ui';
import { DateField } from '@/components/ui/date-field';
import { formatReference } from '@/data/bible/references';
import { getPlan, type Pace } from '@/data/plans';
import { checkAchievements } from '@/db/achievements';
import { useLive } from '@/db/live';
import { deletePlan, getPlanState, markMissedAsRead, setDayComplete, shiftSchedule, startPlan, stopPlan } from '@/db/plans';
import { addDays, formatDate, fromDateKey, toDateKey } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useLive(() => getPlanState(id), ['plans', 'plan_days'], [id]);
  const libraryPlan = getPlan(id);
  const started = state && state.row.active === 1;

  if (!state && !libraryPlan) {
    return <EmptyState icon="calendar" title="Plan not found" message="It may have been removed." />;
  }
  return started ? <PlanProgress id={id} /> : <PlanIntro id={id} />;
}

/** Before starting: what the plan is, pace and start date. */
function PlanIntro({ id }: { id: string }) {
  const plan = getPlan(id)!;
  const { colors } = useTheme();
  const [pace, setPace] = useState<Pace>('normal');
  const [start, setStart] = useState(new Date());
  const schedule = plan.schedule(pace);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 140 }}
      data={schedule.slice(0, 7)}
      keyExtractor={(_, i) => String(i)}
      ListHeaderComponent={
        <View style={{ gap: space.lg }}>
          <Stack.Screen options={{ title: '' }} />
          <View style={{ alignItems: 'center', gap: space.sm }}>
            <IconBadge name={plan.icon} tone={plan.tone} size={76} />
            <AppText variant="overline" color="gold">
              {plan.category}
            </AppText>
            <AppText variant="title1" align="center">
              {plan.title}
            </AppText>
            <AppText variant="callout" color="textSecondary" align="center">
              {plan.description}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Stat label="Days" value={String(plan.days(pace))} />
            <Stat label="Per day" value={perDay(schedule)} />
          </View>
          {plan.paceable && (
            <SegmentedControl
              options={[
                { value: 'slow', label: 'Slower' },
                { value: 'normal', label: '1 chapter/day' },
                { value: 'fast', label: 'Faster' },
              ]}
              value={pace}
              onChange={setPace}
            />
          )}
          <DateField label="Start on" value={start} onChange={setStart} />
          <Button
            title="Start Plan"
            icon="calendar"
            onPress={() => {
              startPlan(id, { pace }, toDateKey(start));
              haptics.success();
            }}
          />
          <AppText variant="title3" style={{ marginTop: space.sm }}>
            First week
          </AppText>
        </View>
      }
      renderItem={({ item, index }) => (
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <AppText variant="subhead" color="textTertiary" style={{ width: 52 }}>
            Day {index + 1}
          </AppText>
          <AppText variant="callout" style={{ flex: 1 }}>
            {item.map((r) => formatReference(r)).join(' · ')}
          </AppText>
        </View>
      )}
    />
  );
}

function perDay(schedule: ReturnType<NonNullable<ReturnType<typeof getPlan>>['schedule']>) {
  const refs = schedule.reduce((n, d) => n + d.length, 0) / Math.max(1, schedule.length);
  return refs <= 1.2 ? '1 reading' : `${Math.round(refs)} readings`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: space.md }}>
      <AppText variant="title2" color="gold">
        {value}
      </AppText>
      <AppText variant="caption" color="textTertiary">
        {label}
      </AppText>
    </Card>
  );
}

/** After starting: progress, today's reading, catch-up and the full schedule. */
function PlanProgress({ id }: { id: string }) {
  const state = useLive(() => getPlanState(id), ['plans', 'plan_days'], [id])!;
  const { colors } = useTheme();
  const schedule = state.plan.schedule(state.options.pace);
  const day = Math.min(state.nextDay, state.totalDays);

  const menu = () =>
    Alert.alert(state.plan.title, undefined, [
      {
        text: 'Restart from Day 1',
        onPress: () => startPlan(id, state.options),
      },
      {
        text: 'Stop this plan',
        style: 'destructive',
        onPress: () => {
          if (id.startsWith('custom-')) deletePlan(id);
          else stopPlan(id);
          router.back();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.lg, gap: space.sm, paddingBottom: 140 }}
      data={schedule}
      keyExtractor={(_, i) => String(i)}
      initialNumToRender={20}
      ListHeaderComponent={
        <View style={{ gap: space.lg, marginBottom: space.md }}>
          <Stack.Screen
            options={{
              title: '',
              headerRight: () => (
                <Pressable onPress={menu} hitSlop={10} accessibilityLabel="Plan options">
                  <Icon name="more" size={24} color={colors.gold} strokeWidth={2.6} />
                </Pressable>
              ),
            }}
          />
          <View style={{ alignItems: 'center', gap: space.sm }}>
            <ProgressRing progress={state.completed.size / state.totalDays} size={128} stroke={10}>
              <AppText variant="title1">{Math.round((state.completed.size / state.totalDays) * 100)}%</AppText>
            </ProgressRing>
            <AppText variant="title2" align="center">
              {state.plan.title}
            </AppText>
            <AppText variant="subhead" color="textSecondary">
              {state.done ? 'Completed! Well done, faithful one.' : `Day ${day} of ${state.totalDays} · started ${formatDate(state.row.start_date)}`}
            </AppText>
          </View>

          {!state.done && (
            <Card elevated="medium" style={{ gap: space.md }}>
              <AppText variant="overline" color="gold">
                {state.nextDay < state.scheduledDay ? `Next up · Day ${day}` : `Today · Day ${day}`}
              </AppText>
              {schedule[day - 1].map((r) => (
                <AppText key={formatReference(r)} variant="title3">
                  {formatReference(r)}
                </AppText>
              ))}
              <Button title="Start Reading" icon="openBook" onPress={() => router.push({ pathname: '/bible/plan-day', params: { plan: id, day } })} />
            </Card>
          )}

          {state.behind > 0 && !state.done && (
            <Card style={{ gap: space.md, backgroundColor: colors.goldSoft }} elevated="low">
              <AppText variant="headline">
                {state.behind} day{state.behind === 1 ? '' : 's'} to catch up, and that’s okay.
              </AppText>
              <AppText variant="callout" color="textSecondary">
                Life happens. God’s mercies are new every morning. Pick up where you left off, or reset your schedule.
              </AppText>
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Shift schedule"
                    variant="primary"
                    onPress={() => {
                      shiftSchedule(id);
                      haptics.success();
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Mark as read"
                    variant="secondary"
                    onPress={() => {
                      markMissedAsRead(id);
                      haptics.tap();
                    }}
                  />
                </View>
              </View>
            </Card>
          )}

          <AppText variant="title3" style={{ marginTop: space.sm }}>
            Schedule
          </AppText>
        </View>
      }
      renderItem={({ item, index }) => {
        const n = index + 1;
        const done = state.completed.has(n);
        const date = addDays(fromDateKey(state.row.start_date), index);
        const isToday = toDateKey(date) === toDateKey();
        return (
          <Pressable
            onPress={() => router.push({ pathname: '/bible/plan-day', params: { plan: id, day: n } })}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              padding: space.md,
              borderRadius: radius.md,
              backgroundColor: isToday ? colors.goldSoft : pressed ? colors.surfaceMuted : colors.surface,
            })}>
            <Pressable
              hitSlop={8}
              accessibilityLabel={done ? `Mark day ${n} unread` : `Mark day ${n} read`}
              onPress={() => {
                haptics.select();
                const after = setDayComplete(id, n, !done);
                if (after?.done) checkAchievements();
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: done ? colors.sage : 'transparent',
                borderWidth: done ? 0 : 1.5,
                borderColor: colors.textTertiary,
              }}>
              {done && <Icon name="check" size={15} color="#FFFFFF" strokeWidth={2.8} />}
            </Pressable>
            <View style={{ flex: 1 }}>
              <AppText variant="callout" weight="600" style={{ textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>
                {item.map((r) => formatReference(r, { abbreviate: item.length > 2 })).join(' · ')}
              </AppText>
              <AppText variant="caption" color="textTertiary">
                Day {n} · {formatDate(date, 'short')}
              </AppText>
            </View>
          </Pressable>
        );
      }}
    />
  );
}
