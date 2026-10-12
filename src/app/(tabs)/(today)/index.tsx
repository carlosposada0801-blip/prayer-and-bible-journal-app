import { router } from 'expo-router';
import { Pressable, Share, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { Appear, AppText, Card, IconBadge, Screen } from '@/components/ui';
import { VerseCard } from '@/components/verse-card';
import { formatReference } from '@/data/bible/references';
import { verseOfTheDay } from '@/data/verses-of-the-day';
import { currentStreak, didToday, lastSevenDays } from '@/db/activity';
import { useAnyChange } from '@/db/live';
import { addMemoryVerse, dueVerses, getMemoryVerse } from '@/db/memorize';
import { personOfTheDay, prayedToday } from '@/db/people';
import { activePlans } from '@/db/plans';
import { completedToday, todaysLesson } from '@/db/study';
import { usePassageText } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { haptics } from '@/lib/haptics';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Today: verse of the day, today's rhythm, and a gentle streak. */
export default function TodayScreen() {
  const prefs = usePreferences();
  const { colors } = useTheme();
  useAnyChange();
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const votd = verseOfTheDay(now);
  const reference = formatReference(votd);
  const { data: verseText } = usePassageText(votd);

  const lesson = todaysLesson();
  const lessonDone = Boolean(completedToday());
  const plan = activePlans()[0];
  const due = dueVerses(20).length;
  const person = personOfTheDay();
  const prayed = didToday('prayer');
  const memorized = Boolean(getMemoryVerse(reference));

  type Item = { key: string; title: string; subtitle: string; icon: IconName; tone: 'gold' | 'sage' | 'sky' | 'rose' | 'navy'; done: boolean; onPress: () => void };
  const items: Item[] = [];
  if (plan) {
    const readings = plan.plan.schedule(plan.options.pace)[plan.nextDay - 1] ?? [];
    items.push({
      key: 'plan',
      title: plan.done ? 'Plan complete!' : readings.map((r) => formatReference(r)).join(' · '),
      subtitle: `${plan.plan.title} · Day ${Math.min(plan.nextDay, plan.totalDays)}`,
      icon: 'calendar',
      tone: 'gold',
      done: plan.completed.has(plan.scheduledDay),
      onPress: () => router.push({ pathname: '/bible/plan-day', params: { plan: plan.plan.id, day: plan.nextDay } }),
    });
  }
  items.push(
    lesson
      ? {
          key: 'study',
          title: lessonDone ? 'Today’s study complete' : lesson.lesson.title,
          subtitle: lessonDone ? 'Well done. See you tomorrow!' : `Today’s Study · ${lesson.series.title}`,
          icon: 'lightbulb',
          tone: 'sky',
          done: lessonDone,
          onPress: () => router.push({ pathname: '/bible/lesson/[id]', params: { id: lesson.lesson.id } }),
        }
      : { key: 'study', title: 'Today’s Study', subtitle: 'All caught up!', icon: 'lightbulb', tone: 'sky', done: true, onPress: () => router.navigate('/bible?section=studies') },
    {
      key: 'practice',
      title: 'Practice Verses',
      subtitle: due ? `${due} verse${due === 1 ? '' : 's'} ready for review` : 'Keep your streak glowing',
      icon: 'flame',
      tone: 'rose',
      done: didToday('practice'),
      onPress: () => (due ? router.push({ pathname: '/practice', params: { mode: 'review' } }) : router.navigate('/grow')),
    },
    person
      ? {
          key: 'pray',
          title: `Pray for ${person.name}`,
          subtitle: prayedToday(person) ? 'You prayed for them today' : person.notes || 'Today’s person from your prayer list',
          icon: 'hands',
          tone: 'sage',
          done: prayedToday(person),
          onPress: () => router.navigate('/prayer?section=people'),
        }
      : {
          key: 'pray',
          title: 'Write a Prayer',
          subtitle: prayed ? 'You spent time in prayer today' : 'Talk with God',
          icon: 'pen',
          tone: 'sage',
          done: prayed,
          onPress: () => router.push('/prayer-editor'),
        },
  );

  return (
    <Screen>
      <Appear index={0}>
        <View style={{ gap: space.xxs }}>
          <AppText variant="overline" color="gold">
            {dateLabel}
          </AppText>
          <AppText variant="title2">
            {greeting(now)}
            {prefs.name ? `, ${prefs.name.split(' ')[0]}` : ''}
          </AppText>
        </View>
      </Appear>

      <Appear index={1}>
        <Pressable onPress={() => openReader(votd.book, votd.chapter, votd.verseStart)} accessibilityHint="Opens this verse in the Bible">
          <VerseCard text={verseText ?? ' '} reference={reference} translation={prefs.translation} />
        </Pressable>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.lg, marginTop: space.sm, paddingHorizontal: space.sm }}>
          <ActionLink
            icon={memorized ? 'check' : 'heart'}
            label={memorized ? 'In My Verses' : 'Memorize'}
            onPress={() => {
              if (!memorized) {
                addMemoryVerse(reference);
                haptics.success();
              }
            }}
          />
          <ActionLink icon="share" label="Share" onPress={() => Share.share({ message: `“${verseText}”\n— ${reference} (${prefs.translation})` })} />
        </View>
      </Appear>

      <View style={{ gap: space.md }}>
        <AppText variant="title3">Today</AppText>
        {items.map((item, i) => (
          <Appear key={item.key} index={i + 2}>
            <Card onPress={item.onPress} accessibilityLabel={item.title}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <IconBadge name={item.icon} tone={item.tone} />
                <View style={{ flex: 1 }}>
                  <AppText variant="headline" numberOfLines={2}>
                    {item.title}
                  </AppText>
                  <AppText variant="subhead" color="textSecondary" numberOfLines={2}>
                    {item.subtitle}
                  </AppText>
                </View>
                {item.done ? (
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={16} color="#FFFFFF" strokeWidth={2.8} />
                  </View>
                ) : (
                  <Icon name="chevronRight" size={18} color={colors.textTertiary} />
                )}
              </View>
            </Card>
          </Appear>
        ))}
      </View>

      <Appear index={items.length + 2}>
        <StreakCard />
      </Appear>
    </Screen>
  );
}

function ActionLink({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} accessibilityRole="button">
      <Icon name={icon} size={16} color={colors.gold} strokeWidth={2} />
      <AppText variant="subhead" color="gold" weight="600">
        {label}
      </AppText>
    </Pressable>
  );
}

/** A gentle streak: celebrates showing up and never scolds for a missed day. */
function StreakCard() {
  const { colors } = useTheme();
  const streak = currentStreak();
  const week = lastSevenDays();
  const doneToday = didToday();
  const message =
    streak === 0
      ? 'Every day you show up is a gift. Grace covers the rest.'
      : doneToday
        ? 'You spent time with God today. Rest in His love.'
        : 'Whenever you’re ready today, God is ready to meet you.';

  return (
    <Card style={{ gap: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconBadge name="flame" tone="gold" />
        <View style={{ flex: 1 }}>
          <AppText variant="headline">{streak > 0 ? `${streak}-day rhythm` : 'Your rhythm starts today'}</AppText>
          <AppText variant="subhead" color="textSecondary">
            {message}
          </AppText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {week.map(({ date, active }, i) => {
          const isToday = i === week.length - 1;
          return (
            <View key={i} style={{ alignItems: 'center', gap: space.xs }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? colors.gold : isToday ? colors.goldSoft : colors.surfaceMuted,
                  borderWidth: isToday && !active ? 1.5 : 0,
                  borderColor: colors.gold,
                }}>
                {active && <Icon name="flame" size={16} color="#FFFFFF" strokeWidth={2} />}
              </View>
              <AppText variant="caption" color={isToday ? 'gold' : 'textTertiary'}>
                {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
              </AppText>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
