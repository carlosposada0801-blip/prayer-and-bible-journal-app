import { router } from 'expo-router';
import { View } from 'react-native';

import type { IconName } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, IconBadge, SectionHeader } from '@/components/ui';
import { PLAN_CATEGORIES, PLANS, type PlanCategory } from '@/data/plans';
import { useLive } from '@/db/live';
import { activePlans } from '@/db/plans';
import { space } from '@/theme/tokens';

import { ActivePlanCard, PlanRow } from './plan-card';

const CATEGORY_LOOK: Record<PlanCategory, { icon: IconName; tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy' }> = {
  'Whole Bible': { icon: 'openBook', tone: 'gold' },
  Testaments: { icon: 'columns', tone: 'sky' },
  Books: { icon: 'bookClosed', tone: 'navy' },
  Sections: { icon: 'map', tone: 'sky' },
  'Psalms & Proverbs': { icon: 'heart', tone: 'rose' },
  Topical: { icon: 'leaf', tone: 'sage' },
  Seasonal: { icon: 'calendar', tone: 'rose' },
  Characters: { icon: 'people', tone: 'gold' },
  Custom: { icon: 'pen', tone: 'navy' },
};

const FEATURED = ['bible-1y', 'topic-anxiety', 'proverbs-31', 'topic-life-of-jesus'];

/** "Plans" section of the Bible tab. */
export function PlansHome() {
  const active = useLive(activePlans, ['plans', 'plan_days']);

  return (
    <View style={{ gap: space.lg }}>
      {active.length > 0 && (
        <>
          <SectionHeader title="My Plans" />
          {active.map((s, i) => (
            <Appear key={s.plan.id} index={i}>
              <ActivePlanCard state={s} />
            </Appear>
          ))}
        </>
      )}

      <Appear index={active.length}>
        <SectionHeader title="Browse" action="See all" onAction={() => router.push('/bible/plans')} />
      </Appear>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {PLAN_CATEGORIES.map((c, i) => {
          const count = PLANS.filter((p) => p.category === c).length;
          return (
            <View key={c} style={{ width: '48.5%' }}>
              <Appear index={active.length + 1 + i}>
                <Card onPress={() => router.push({ pathname: '/bible/plans', params: { category: c } })} style={{ gap: space.sm, padding: space.md }}>
                  <IconBadge name={CATEGORY_LOOK[c].icon} tone={CATEGORY_LOOK[c].tone} size={36} />
                  <View>
                    <AppText variant="headline">{c}</AppText>
                    <AppText variant="caption" color="textTertiary">
                      {count} plans
                    </AppText>
                  </View>
                </Card>
              </Appear>
            </View>
          );
        })}
      </View>

      <Card onPress={() => router.push('/bible/plan-builder')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconBadge name="pen" tone="navy" />
        <View style={{ flex: 1 }}>
          <AppText variant="headline">Build Your Own</AppText>
          <AppText variant="subhead" color="textSecondary">
            Pick any books and a number of days
          </AppText>
        </View>
      </Card>

      {active.length === 0 && (
        <>
          <SectionHeader title="Popular" />
          {FEATURED.map((id) => {
            const plan = PLANS.find((p) => p.id === id);
            return plan ? <PlanRow key={id} plan={plan} /> : null;
          })}
          <Button title="Browse All Plans" variant="secondary" onPress={() => router.push('/bible/plans')} />
        </>
      )}
    </View>
  );
}

export { CATEGORY_LOOK };
