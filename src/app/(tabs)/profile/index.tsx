import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, TextInput, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { authenticate } from '@/components/prayer/lock-gate';
import { Appear, AppText, Card, IconBadge, ListGroup, ListRow, ProgressBar, Screen, SegmentedControl } from '@/components/ui';
import { ACHIEVEMENTS } from '@/data/achievements';
import { translationInfo } from '@/data/bible/translations';
import { unlockedIds } from '@/db/achievements';
import { useAnyChange } from '@/db/live';
import { getStats } from '@/db/stats';
import { haptics } from '@/lib/haptics';
import { exportPrayerJournalPdf } from '@/lib/pdf';
import { setPreference, usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { THEMES } from '@/theme/themes';
import { radius, space } from '@/theme/tokens';
import { textStyle } from '@/theme/typography';

/** Profile: stats, badges, themes, reminders and settings. */
export default function ProfileScreen() {
  const prefs = usePreferences();
  const { colors, shadow, textScale } = useTheme();
  // Re-read stats whenever anything in the database changes.
  useAnyChange();
  const stats = getStats();
  const unlocked = unlockedIds();
  const recent = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).slice(-4);
  const [name, setName] = useState(prefs.name);

  return (
    <Screen contentContainerStyle={{ gap: space.xl }}>
      <Appear index={0}>
        <View style={[{ borderRadius: radius.xl, borderCurve: 'continuous' }, shadow.medium]}>
          <LinearGradient
            colors={colors.gradientVerse}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(226, 190, 106, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                {prefs.name ? (
                  <AppText variant="title2" style={{ color: '#E2BE6A' }}>
                    {prefs.name.trim()[0]?.toUpperCase()}
                  </AppText>
                ) : (
                  <Icon name="person" size={26} color="#E2BE6A" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onBlur={() => setPreference('name', name.trim())}
                  placeholder="Your name"
                  placeholderTextColor="rgba(251, 246, 234, 0.5)"
                  returnKeyType="done"
                  style={[textStyle('title2', textScale), { color: colors.textOnDark, padding: 0 }]}
                />
                <AppText variant="subhead" style={{ color: 'rgba(251, 246, 234, 0.7)' }}>
                  Level {stats.level.level} · {stats.xp} XP
                </AppText>
              </View>
            </View>
            <ProgressBar progress={stats.level.into / stats.level.needed} color="#E2BE6A" />
            <AppText variant="caption" style={{ color: 'rgba(251, 246, 234, 0.6)' }}>
              {stats.level.needed - stats.level.into} XP to level {stats.level.level + 1}
            </AppText>
          </LinearGradient>
        </View>
      </Appear>

      <Appear index={1}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Stat icon="flame" tone="gold" value={stats.currentStreak} label="Current streak" />
          <Stat icon="crown" tone="gold" value={stats.longestStreak} label="Longest streak" />
          <Stat icon="heart" tone="rose" value={stats.versesMemorized} label="Verses memorized" />
          <Stat icon="lightbulb" tone="sky" value={stats.lessonsCompleted} label="Lessons completed" />
          <Stat icon="sparkle" tone="sage" value={stats.prayersAnswered} label="Prayers answered" />
          <Stat icon="openBook" tone="navy" value={stats.chaptersRead} label="Chapters read" />
        </View>
      </Appear>

      <Appear index={2}>
        <Card onPress={() => router.push('/profile/achievements')} style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText variant="headline" style={{ flex: 1 }}>
              Badges
            </AppText>
            <AppText variant="subhead" color="textSecondary">
              {unlocked.size} of {ACHIEVEMENTS.length}
            </AppText>
            <Icon name="chevronRight" size={18} color={colors.textTertiary} />
          </View>
          {recent.length ? (
            <View style={{ flexDirection: 'row', gap: space.md }}>
              {recent.map((a) => (
                <View key={a.id} style={{ alignItems: 'center', gap: 4, width: 70 }}>
                  <IconBadge name={a.icon} tone={a.tone} size={48} />
                  <AppText variant="caption" color="textSecondary" align="center" numberOfLines={2}>
                    {a.title}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <AppText variant="subhead" color="textSecondary">
              Earn badges as you read, pray, study and memorize.
            </AppText>
          )}
        </Card>
      </Appear>

      <Appear index={3}>
        <ListGroup title="Make it yours">
          <ListRow
            icon="palette"
            tone="gold"
            title="Themes"
            trailing={THEMES.find((t) => t.id === prefs.themeId)?.name}
            onPress={() => router.push('/profile/themes')}
          />
          <ListRow
            icon="bell"
            tone="sky"
            title="Reminders"
            trailing={`${Object.values(prefs.reminders).filter((r) => r.enabled).length} on`}
            onPress={() => router.push('/profile/reminders')}
          />
          <ListRow icon="openBook" tone="navy" title="Bible Translation" trailing={prefs.translation} onPress={() => router.push('/translation-picker')} />
        </ListGroup>
      </Appear>

      <View style={{ gap: space.sm }}>
        <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: space.lg, textTransform: 'uppercase' }}>
          Appearance
        </AppText>
        <SegmentedControl
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={prefs.appearance}
          onChange={(v) => setPreference('appearance', v)}
        />
      </View>

      <View style={{ gap: space.sm }}>
        <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: space.lg, textTransform: 'uppercase' }}>
          Text Size
        </AppText>
        <SegmentedControl
          options={[
            { value: 'small', label: 'Small' },
            { value: 'default', label: 'Default' },
            { value: 'large', label: 'Large' },
            { value: 'xlarge', label: 'X-Large' },
          ]}
          value={prefs.textSize}
          onChange={(v) => setPreference('textSize', v)}
        />
      </View>

      <View style={{ gap: space.sm }}>
        <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: space.lg, textTransform: 'uppercase' }}>
          Daily XP Goal
        </AppText>
        <SegmentedControl
          options={[
            { value: '10', label: 'Casual' },
            { value: '20', label: 'Regular' },
            { value: '30', label: 'Serious' },
            { value: '50', label: 'Intense' },
          ]}
          value={String(prefs.dailyXpGoal)}
          onChange={(v) => setPreference('dailyXpGoal', Number(v))}
        />
      </View>

      <ListGroup
        title="Privacy & focus"
        footer="Quiet Mode holds reminder banners and badge celebrations while you’re praying, studying or reading.">
        <ListRow
          icon="lock"
          tone="navy"
          title="Lock Prayer Journal"
          subtitle="Require Face ID to open Prayer"
          trailing={
            <Switch
              value={prefs.appLock}
              trackColor={{ true: colors.gold }}
              onValueChange={async (on) => {
                if (!on && !(await authenticate('Turn off the prayer lock'))) return;
                setPreference('appLock', on);
              }}
            />
          }
        />
        <ListRow
          icon="moon"
          tone="sky"
          title="Quiet Mode"
          subtitle="Fewer interruptions during prayer & study"
          trailing={<Switch value={prefs.quietMode} trackColor={{ true: colors.gold }} onValueChange={(on) => setPreference('quietMode', on)} />}
        />
        <ListRow
          icon="wave"
          tone="sage"
          title="Haptics"
          trailing={
            <Switch
              value={prefs.haptics}
              trackColor={{ true: colors.gold }}
              onValueChange={(on) => {
                setPreference('haptics', on);
                if (on) haptics.success();
              }}
            />
          }
        />
      </ListGroup>

      <ListGroup title="Your data" footer="Everything is stored privately on this iPhone.">
        <ListRow
          icon="share"
          tone="gold"
          title="Export Prayer Journal (PDF)"
          onPress={() => exportPrayerJournalPdf().catch(() => Alert.alert('Export failed', 'Please try again.'))}
        />
      </ListGroup>

      <ListGroup title="About" footer={`Bible text: ${translationInfo('BSB').name}, World English Bible, King James Version, American Standard Version, Young’s Literal Translation and Darby (public domain). Cross-references: OpenBible.info (CC BY).`}>
        <ListRow icon="cross" tone="gold" title="Abide" trailing={`v${Constants.expoConfig?.version ?? '1.0.0'}`} />
      </ListGroup>
      <View style={{ alignItems: 'center', paddingBottom: space.lg }}>
        <AppText variant="footnote" color="textTertiary" align="center">
          Made with love to help you grow closer to God every day.
        </AppText>
      </View>
    </Screen>
  );
}

function Stat({ icon, tone, value, label }: { icon: IconName; tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy'; value: number; label: string }) {
  return (
    <View style={{ width: '31.8%' }}>
      <Card style={{ padding: space.md, gap: space.xs, alignItems: 'flex-start' }}>
        <IconBadge name={icon} tone={tone} size={32} />
        <AppText variant="title2">{value}</AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={2}>
          {label}
        </AppText>
      </Card>
    </View>
  );
}

