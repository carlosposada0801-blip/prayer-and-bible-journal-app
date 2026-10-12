import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { Appear, AppText, Card, IconBadge, Screen } from '@/components/ui';
import { VerseCard } from '@/components/verse-card';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Placeholder until the Bible engine arrives (Step 2 picks a verse each day
// in your chosen translation).
const sampleVerse = {
  text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
  reference: 'Lamentations 3:22–23',
  translation: 'KJV',
};

type QuickLink = {
  title: string;
  subtitle: string;
  icon: IconName;
  tone: 'gold' | 'sage' | 'sky';
  href: '/study' | '/memorize' | '/prayer';
};

const quickLinks: QuickLink[] = [
  { title: "Today's Study", subtitle: '5-minute lesson', icon: 'openBook', tone: 'sky', href: '/study' },
  { title: 'Practice Verses', subtitle: 'Keep your streak glowing', icon: 'flame', tone: 'gold', href: '/memorize' },
  { title: 'Write a Prayer', subtitle: 'Talk with God', icon: 'pen', tone: 'sage', href: '/prayer' },
];

export default function TodayScreen() {
  const { colors } = useTheme();
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Screen>
      <Appear index={0}>
        <View style={{ gap: space.xxs }}>
          <AppText variant="overline" color="gold">
            {dateLabel}
          </AppText>
          <AppText variant="title2">{greeting(now)}</AppText>
        </View>
      </Appear>

      <Appear index={1}>
        <VerseCard {...sampleVerse} />
      </Appear>

      <View style={{ gap: space.md }}>
        {quickLinks.map((link, i) => (
          <Appear key={link.title} index={i + 2}>
            <Card onPress={() => router.navigate(link.href)} accessibilityLabel={link.title}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <IconBadge name={link.icon} tone={link.tone} />
                <View style={{ flex: 1 }}>
                  <AppText variant="headline">{link.title}</AppText>
                  <AppText variant="subhead" color="textSecondary">
                    {link.subtitle}
                  </AppText>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textTertiary} />
              </View>
            </Card>
          </Appear>
        ))}
      </View>

      <Appear index={5}>
        <StreakCard days={0} />
      </Appear>
    </Screen>
  );
}

/** A gentle streak: celebrates showing up, never scolds for missing a day. */
function StreakCard({ days }: { days: number }) {
  const { colors } = useTheme();
  const week = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <Card style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconBadge name="flame" tone="gold" />
        <View style={{ flex: 1 }}>
          <AppText variant="headline">{days > 0 ? `${days}-day rhythm` : 'Your rhythm starts today'}</AppText>
          <AppText variant="subhead" color="textSecondary">
            Every day you show up is a gift. Grace covers the rest.
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {week.map((d, i) => {
          const isToday = i === today;
          return (
            <View key={i} style={{ alignItems: 'center', gap: space.xs }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? colors.goldSoft : colors.surfaceMuted,
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: colors.gold,
                }}>
                {isToday && <Icon name="flame" size={16} color={colors.gold} />}
              </View>
              <AppText variant="caption" color={isToday ? 'gold' : 'textTertiary'}>
                {d}
              </AppText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
