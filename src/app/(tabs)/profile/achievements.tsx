import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Appear, AppText, IconBadge, Screen } from '@/components/ui';
import { ACHIEVEMENTS, type Achievement } from '@/data/achievements';
import { unlockedAchievements } from '@/db/achievements';
import { useLive } from '@/db/live';
import { formatDate } from '@/lib/dates';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** All badges, grouped by category; locked ones are softly greyed. */
export default function AchievementsScreen() {
  const unlocked = useLive(() => new Map(unlockedAchievements().map((a) => [a.id, a.unlocked_at])), ['achievements']);
  const categories = [...new Set(ACHIEVEMENTS.map((a) => a.category))];

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Badges' }} />
      <AppText variant="callout" color="textSecondary">
        {unlocked.size} of {ACHIEVEMENTS.length} unlocked. Some badges also unlock new app themes.
      </AppText>
      {categories.map((category, ci) => (
        <Appear key={category} index={ci}>
          <View style={{ gap: space.md }}>
            <AppText variant="title3">{category}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {ACHIEVEMENTS.filter((a) => a.category === category).map((a) => (
                <Badge key={a.id} achievement={a} unlockedAt={unlocked.get(a.id)} />
              ))}
            </View>
          </View>
        </Appear>
      ))}
    </Screen>
  );
}

function Badge({ achievement, unlockedAt }: { achievement: Achievement; unlockedAt?: string }) {
  const { colors } = useTheme();
  const on = Boolean(unlockedAt);
  return (
    <View
      style={{
        width: '48.5%',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        padding: space.md,
        gap: space.sm,
        opacity: on ? 1 : 0.55,
      }}>
      <View style={{ opacity: on ? 1 : 0.6 }}>
        <IconBadge name={on ? achievement.icon : 'lock'} tone={on ? achievement.tone : 'navy'} size={44} />
      </View>
      <AppText variant="headline">{achievement.title}</AppText>
      <AppText variant="footnote" color="textSecondary">
        {achievement.description}
      </AppText>
      {unlockedAt && (
        <AppText variant="caption" color="gold" weight="600">
          {formatDate(unlockedAt, 'short')}
        </AppText>
      )}
    </View>
  );
}
