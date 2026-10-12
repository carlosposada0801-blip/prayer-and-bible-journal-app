import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, IconBadge, ProgressRing } from '@/components/ui';
import { CHEERS, MEMORY_UNITS, pick } from '@/data/memorize';
import { currentStreak } from '@/db/activity';
import { useLive } from '@/db/live';
import { allMemoryVerses, dueVerses, getHearts, levelFor, MEMORIZED_STAGE, myVerses, totalXp, xpToday, type MemoryVerse } from '@/db/memorize';
import { haptics } from '@/lib/haptics';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

import { MascotSays } from './mascot';

const NODE = 76;

/** The Duolingo-style path of verse levels, with stats and review. */
export function MemorizeHome() {
  const { colors } = useTheme();
  const prefs = usePreferences();
  const verses = useLive(() => new Map(allMemoryVerses().map((v) => [v.reference, v])), ['memory_verses']);
  const due = useLive(() => dueVerses(20), ['memory_verses']);
  const custom = useLive(myVerses, ['memory_verses']);
  const today = useLive(xpToday, ['xp_log']);
  const xp = useLive(totalXp, ['xp_log']);
  const streak = useLive(() => currentStreak(), ['activity']);
  const hearts = useLive(() => getHearts().hearts, ['memory_verses', 'xp_log']);
  const level = levelFor(xp);
  const greeting = useMemo(() => pick(CHEERS.start), []);

  // A verse unlocks once the one before it has at least one finished lesson.
  const ordered = MEMORY_UNITS.flatMap((u) => u.verses);
  const unlocked = (ref: string) => {
    const i = ordered.indexOf(ref);
    return i <= 0 || (verses.get(ordered[i - 1])?.stage ?? 0) >= 1;
  };
  const next = ordered.find((r) => unlocked(r) && (verses.get(r)?.stage ?? 0) < MEMORIZED_STAGE);

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <StatPill icon="flame" color={colors.gold} value={String(streak)} label="day streak" />
          <StatPill icon="star" color={colors.sky} value={`Lv ${level.level}`} label={`${xp} XP`} />
          <StatPill icon="heart" color={colors.rose} value={String(hearts)} label="hearts" />
        </View>
      </Appear>

      <Appear index={1}>
        <Card elevated="medium" style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <ProgressRing progress={today / prefs.dailyXpGoal} size={64} stroke={7}>
              <Icon name="target" size={24} color={colors.gold} />
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <AppText variant="headline">{today >= prefs.dailyXpGoal ? 'Daily goal reached!' : 'Daily goal'}</AppText>
              <AppText variant="subhead" color="textSecondary">
                {Math.min(today, prefs.dailyXpGoal)} of {prefs.dailyXpGoal} XP today
              </AppText>
            </View>
          </View>
          <MascotSays mood={today >= prefs.dailyXpGoal ? 'cheer' : 'idle'} size={64} text={due.length ? `${due.length} verse${due.length === 1 ? ' is' : 's are'} ready for review. Let’s keep them fresh!` : greeting} />
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {next && (
              <View style={{ flex: 1 }}>
                <Button title="Practice" icon="play" onPress={() => router.push({ pathname: '/practice', params: { mode: 'lesson', ref: next } })} />
              </View>
            )}
            {due.length > 0 && (
              <View style={{ flex: 1 }}>
                <Button title={`Review ${due.length}`} icon="refresh" variant="secondary" onPress={() => router.push({ pathname: '/practice', params: { mode: 'review' } })} />
              </View>
            )}
          </View>
        </Card>
      </Appear>

      {MEMORY_UNITS.map((unit, u) => {
        const done = unit.verses.filter((r) => (verses.get(r)?.stage ?? 0) >= MEMORIZED_STAGE).length;
        return (
          <View key={unit.id} style={{ gap: space.lg }}>
            <LinearGradient
              colors={colors.gradientVerse}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radius.lg, borderCurve: 'continuous', padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <AppText variant="overline" style={{ color: '#E2BE6A' }}>
                  Unit {u + 1}
                </AppText>
                <AppText variant="title3" style={{ color: colors.textOnDark }}>
                  {unit.title}
                </AppText>
                <AppText variant="footnote" style={{ color: 'rgba(251, 246, 234, 0.7)' }}>
                  {unit.subtitle} · {done}/{unit.verses.length} memorized
                </AppText>
              </View>
              <Icon name={unit.icon} size={34} color="#E2BE6A" strokeWidth={1.5} />
            </LinearGradient>
            <View style={{ alignItems: 'center', gap: space.md }}>
              {unit.verses.map((ref, i) => (
                <PathNode
                  key={ref}
                  reference={ref}
                  verse={verses.get(ref)}
                  locked={!unlocked(ref)}
                  current={ref === next}
                  offset={Math.sin((i + u * 2) * 1.1) * 70}
                  tone={unit.tone}
                />
              ))}
            </View>
          </View>
        );
      })}

      <Card onPress={() => router.push('/grow/my-verses')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconBadge name="bookmark" tone="rose" />
        <View style={{ flex: 1 }}>
          <AppText variant="headline">My Verses</AppText>
          <AppText variant="subhead" color="textSecondary">
            {custom.length ? `${custom.length} verse${custom.length === 1 ? '' : 's'} you chose` : 'Add any verse you want to memorize'}
          </AppText>
        </View>
        <Icon name="chevronRight" size={18} color={colors.textTertiary} />
      </Card>
    </View>
  );
}

function StatPill({ icon, color, value, label }: { icon: 'flame' | 'star' | 'heart'; color: string; value: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.md, padding: space.sm, paddingHorizontal: space.md }}>
      <Icon name={icon} size={22} color={color} strokeWidth={2.2} />
      <View>
        <AppText variant="headline" style={{ color }}>
          {value}
        </AppText>
        <AppText variant="caption" color="textTertiary" numberOfLines={1}>
          {label}
        </AppText>
      </View>
    </View>
  );
}

function PathNode({
  reference,
  verse,
  locked,
  current,
  offset,
  tone,
}: {
  reference: string;
  verse?: MemoryVerse;
  locked: boolean;
  current: boolean;
  offset: number;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
}) {
  const { colors } = useTheme();
  const stage = verse?.stage ?? 0;
  const memorized = stage >= MEMORIZED_STAGE;
  const toneColor = tone === 'navy' ? colors.primary : colors[tone];
  const fill = locked ? colors.surfaceMuted : memorized ? colors.gold : toneColor;
  const size = NODE + 14;
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={{ transform: [{ translateX: offset }], alignItems: 'center', gap: 6 }}>
      {current && (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 2 }}>
          <AppText variant="caption" weight="700" color="gold">
            {stage === 0 ? 'START' : `LEVEL ${stage + 1}`}
          </AppText>
        </View>
      )}
      <Pressable
        disabled={locked}
        onPress={() => {
          haptics.tap();
          router.push({ pathname: '/verse-level', params: { ref: reference } });
        }}
        accessibilityLabel={`${reference}${locked ? ', locked' : memorized ? ', memorized' : `, level ${stage} of 5`}`}
        style={({ pressed }) => ({ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.94 : 1 }] })}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceMuted} strokeWidth={6} fill="none" />
          {!locked && stage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={memorized ? colors.gold : toneColor}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - stage / MEMORIZED_STAGE)}
            />
          )}
        </Svg>
        <View
          style={{
            width: NODE - 8,
            height: NODE - 8,
            borderRadius: NODE,
            backgroundColor: fill,
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomWidth: locked ? 0 : 5,
            borderBottomColor: 'rgba(0,0,0,0.15)',
          }}>
          <Icon name={locked ? 'lock' : memorized ? 'crown' : stage > 0 ? 'star' : 'play'} size={26} color={locked ? colors.textTertiary : '#FFFFFF'} strokeWidth={2.2} />
        </View>
      </Pressable>
      <AppText variant="caption" color={locked ? 'textTertiary' : 'textSecondary'} weight="600">
        {reference}
      </AppText>
    </View>
  );
}
