import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Card, IconBadge, ProgressBar } from '@/components/ui';
import { formatReference } from '@/data/bible/references';
import type { Plan } from '@/data/plans';
import type { PlanState } from '@/db/plans';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** A row in the plan library. */
export function PlanRow({ plan }: { plan: Plan }) {
  const { colors } = useTheme();
  const days = plan.days();
  return (
    <Card onPress={() => router.push({ pathname: '/bible/plan/[id]', params: { id: plan.id } })} padded={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md }}>
        <IconBadge name={plan.icon} tone={plan.tone} size={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="headline" numberOfLines={1}>
            {plan.title}
          </AppText>
          <AppText variant="footnote" color="textSecondary" numberOfLines={2}>
            {plan.description}
          </AppText>
        </View>
        <View style={{ alignItems: 'center', minWidth: 44 }}>
          <AppText variant="headline" color="gold">
            {days}
          </AppText>
          <AppText variant="caption" color="textTertiary">
            {days === 1 ? 'day' : 'days'}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

/** An in-progress plan with today's reading. */
export function ActivePlanCard({ state }: { state: PlanState }) {
  const { colors } = useTheme();
  const day = state.nextDay;
  const today = state.plan.schedule(state.options.pace)[day - 1] ?? [];
  return (
    <Card
      onPress={() => router.push({ pathname: '/bible/plan/[id]', params: { id: state.plan.id } })}
      elevated="medium"
      style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconBadge name={state.plan.icon} tone={state.plan.tone} />
        <View style={{ flex: 1 }}>
          <AppText variant="headline" numberOfLines={1}>
            {state.plan.title}
          </AppText>
          <AppText variant="subhead" color="textSecondary">
            Day {Math.min(day, state.totalDays)} of {state.totalDays}
          </AppText>
        </View>
        {state.behind > 0 && (
          <View style={{ backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
            <AppText variant="caption" color="gold" weight="700">
              {state.behind} to catch up
            </AppText>
          </View>
        )}
      </View>
      <ProgressBar progress={state.completed.size / state.totalDays} />
      {!state.done && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.md,
            padding: space.md,
          }}>
          <Icon name="openBook" size={18} color={colors.gold} />
          <AppText variant="callout" weight="600" style={{ flex: 1 }} numberOfLines={2}>
            {today.map((r) => formatReference(r)).join(' · ')}
          </AppText>
          <Icon name="chevronRight" size={16} color={colors.textTertiary} />
        </View>
      )}
    </Card>
  );
}
