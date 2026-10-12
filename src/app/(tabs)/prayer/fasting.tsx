import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { ScriptureQuote } from '@/components/scripture-quote';
import { Appear, AppText, Button, Card, Confetti, IconBadge, ProgressRing, Screen, SectionHeader, TextField } from '@/components/ui';
import { FASTING_VERSES, fastTypeInfo, formatDuration, HEALTH_NOTE } from '@/data/fasting';
import { checkAchievements } from '@/db/achievements';
import { activeFast, addReflection, endFast, pastFasts, reflectionsFor, type Fast } from '@/db/fasting';
import { useLive } from '@/db/live';
import { dayOfYear, formatDate, relativeDay } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

/** Fasting tracker: the current fast (with a live timer) or a gentle start. */
export default function FastingScreen() {
  const fast = useLive(activeFast, ['fasts']);
  const history = useLive(pastFasts, ['fasts']);
  const [burst, setBurst] = useState(0);
  const { colors } = useTheme();
  const verse = FASTING_VERSES[dayOfYear() % FASTING_VERSES.length];

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Stack.Screen options={{ title: 'Fasting' }} />
        {fast ? (
          <ActiveFast fast={fast} onComplete={() => setBurst((b) => b + 1)} />
        ) : (
          <Appear index={0}>
            <Card elevated="medium" style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
              <IconBadge name="droplet" tone="sky" size={68} />
              <AppText variant="title2" align="center">
                Seek God through fasting
              </AppText>
              <AppText variant="callout" color="textSecondary" align="center" style={{ maxWidth: 300 }}>
                Set aside food or something else for a time, and use that space to pray and listen.
              </AppText>
              <Button title="Start a Fast" icon="plus" onPress={() => router.push('/fast-new')} />
            </Card>
          </Appear>
        )}

        <Appear index={1}>
          <Card style={{ gap: space.sm }}>
            <AppText variant="overline" color="gold">
              Scripture on fasting
            </AppText>
            <ScriptureQuote reference={verse} align="left" size="small" />
          </Card>
        </Appear>

        <Appear index={2}>
          <View style={{ flexDirection: 'row', gap: space.md, backgroundColor: 'transparent', paddingHorizontal: space.xs }}>
            <Icon name="heart" size={18} color={colors.rose} />
            <AppText variant="footnote" color="textSecondary" style={{ flex: 1, lineHeight: 18 }}>
              {HEALTH_NOTE}
            </AppText>
          </View>
        </Appear>

        {history.length > 0 && (
          <>
            <SectionHeader title="Past fasts" />
            {history.map((f) => (
              <PastFastRow key={f.id} fast={f} />
            ))}
          </>
        )}
      </Screen>
      <Confetti burstKey={burst} count={40} />
    </View>
  );
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function ActiveFast({ fast, onComplete }: { fast: Fast; onComplete: () => void }) {
  const { colors } = useTheme();
  const now = useNow();
  const reflections = useLive(() => reflectionsFor(fast.id), ['fast_reflections'], [fast.id]);
  const [reflection, setReflection] = useState('');
  const elapsedMs = Math.max(0, now - new Date(fast.started_at).getTime());
  const plannedMs = fast.planned_hours * 3_600_000;
  const progress = elapsedMs / plannedMs;
  const remainingMs = Math.max(0, plannedMs - elapsedMs);
  const info = fastTypeInfo(fast.type);
  const reached = remainingMs === 0;

  const end = () => {
    const finish = () => {
      const completed = endFast(fast.id);
      haptics.success();
      if (completed) {
        onComplete();
        checkAchievements();
        Alert.alert('Well done!', 'You completed your fast. May you sense God’s nearness as you return to your normal rhythm. Break your fast gently.');
      }
    };
    if (reached) finish();
    else
      Alert.alert('End your fast early?', 'That’s okay. God sees your heart. You can always try again.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End fast', style: 'destructive', onPress: finish },
      ]);
  };

  return (
    <View style={{ gap: space.lg }}>
      <Appear index={0}>
        <Card elevated="medium" style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          <AppText variant="overline" color="sky">
            {info.name} · in progress
          </AppText>
          <ProgressRing progress={progress} size={210} stroke={14} color={reached ? colors.sage : colors.sky}>
            <View style={{ alignItems: 'center' }}>
              <AppText style={{ fontSize: 40, lineHeight: 46, fontWeight: '300', color: colors.text, fontVariant: ['tabular-nums'] }}>
                {clock(elapsedMs)}
              </AppText>
              <AppText variant="footnote" color="textSecondary">
                {reached ? 'Goal reached!' : `${clockShort(remainingMs)} to go`}
              </AppText>
            </View>
          </ProgressRing>
          <AppText variant="title3" align="center">
            {fast.title}
          </AppText>
          {fast.focus ? (
            <AppText variant="callout" color="textSecondary" align="center" style={{ fontStyle: 'italic' }}>
              “{fast.focus}”
            </AppText>
          ) : null}
          <AppText variant="caption" color="textTertiary">
            Started {formatDate(fast.started_at, 'medium')} · goal {formatDuration(fast.planned_hours)}
          </AppText>
          <Button title={reached ? 'Complete Fast' : 'End Fast'} icon="check" variant={reached ? 'primary' : 'secondary'} onPress={end} />
        </Card>
      </Appear>

      <Appear index={1}>
        <View style={{ gap: space.sm }}>
          <SectionHeader title="Reflections" />
          <TextField
            multiline
            journal
            value={reflection}
            onChangeText={setReflection}
            placeholder="What is God teaching you today? What are you praying about?"
            style={{ minHeight: 90 }}
          />
          <Button
            title="Save Reflection"
            variant="secondary"
            disabled={!reflection.trim()}
            onPress={() => {
              addReflection(fast.id, reflection);
              setReflection('');
              haptics.success();
            }}
          />
          {reflections.map((r) => (
            <Card key={r.id} style={{ gap: 4 }}>
              <AppText variant="caption" color="textTertiary">
                {relativeDay(r.created_at)} · {new Date(r.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </AppText>
              <AppText variant="callout">{r.body}</AppText>
            </Card>
          ))}
        </View>
      </Appear>
    </View>
  );
}

function PastFastRow({ fast }: { fast: Fast }) {
  const { colors } = useTheme();
  const info = fastTypeInfo(fast.type);
  const hours = (new Date(fast.ended_at!).getTime() - new Date(fast.started_at).getTime()) / 3_600_000;
  return (
    <Card onPress={() => router.push({ pathname: '/prayer/fast/[id]', params: { id: fast.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <IconBadge name={info.icon} tone="sky" size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="headline">{fast.title}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {formatDate(fast.started_at)} · {formatDuration(hours)}
        </AppText>
      </View>
      {fast.completed ? (
        <View style={{ backgroundColor: colors.sageSoft, borderRadius: radius.pill, padding: 6 }}>
          <Icon name="check" size={16} color={colors.sage} strokeWidth={2.6} />
        </View>
      ) : null}
    </Card>
  );
}

function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function clockShort(ms: number) {
  const h = ms / 3_600_000;
  if (h >= 48) return `${Math.ceil(h / 24)} days`;
  if (h >= 1) return `${Math.floor(h)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
  return `${Math.ceil(ms / 60_000)} min`;
}
