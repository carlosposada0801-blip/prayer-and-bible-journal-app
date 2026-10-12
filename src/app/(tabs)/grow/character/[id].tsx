import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, EmptyState, Screen } from '@/components/ui';
import { formatReference, ref } from '@/data/bible/references';
import { getCharacter } from '@/data/characters';
import { getPlan } from '@/data/plans';
import { useLive } from '@/db/live';
import { isPlanActive } from '@/db/plans';
import { usePassageText } from '@/lib/bible/hooks';
import { openReader } from '@/lib/bible/navigation';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export default function CharacterProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const character = getCharacter(id);
  const { colors } = useTheme();
  const plan = character ? getPlan(character.planId) : undefined;
  const planActive = useLive(() => (character ? isPlanActive(character.planId) : false), ['plans'], [id]);

  if (!character) return <EmptyState icon="person" title="Not found" message="This profile doesn’t exist." />;

  return (
    <Screen contentContainerStyle={{ gap: space.xl }}>
      <Stack.Screen options={{ title: '' }} />
      <Appear index={0}>
        <LinearGradient
          colors={colors.gradientVerse}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius.xl, borderCurve: 'continuous', padding: space.xl, gap: space.sm, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -14, bottom: -14, opacity: 0.12 }}>
            <Icon name={character.icon} size={150} color="#F5EAD0" strokeWidth={1.1} />
          </View>
          <AppText variant="overline" style={{ color: '#E2BE6A' }}>
            {character.era} · {character.books}
          </AppText>
          <AppText variant="largeTitle" style={{ color: colors.textOnDark }}>
            {character.name}
          </AppText>
          <AppText variant="title3" style={{ color: 'rgba(251, 246, 234, 0.8)' }}>
            {character.title}
          </AppText>
        </LinearGradient>
      </Appear>

      <Appear index={1}>
        <View style={{ gap: space.md }}>
          <AppText variant="title3">The story</AppText>
          {character.story.map((p, i) => (
            <AppText key={i} variant="body" style={{ lineHeight: 27 }}>
              {p}
            </AppText>
          ))}
        </View>
      </Appear>

      <Appear index={2}>
        <View style={{ gap: space.md }}>
          <AppText variant="title3">Key verses</AppText>
          {character.keyVerses.map((v) => (
            <KeyVerse key={v} reference={v} />
          ))}
        </View>
      </Appear>

      <Appear index={3}>
        <View style={{ gap: space.md }}>
          <AppText variant="title3">Lessons for us</AppText>
          {character.lessons.map((l, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                <AppText variant="caption" color="gold" weight="700">
                  {i + 1}
                </AppText>
              </View>
              <AppText variant="callout" style={{ flex: 1, lineHeight: 23 }}>
                {l}
              </AppText>
            </View>
          ))}
        </View>
      </Appear>

      {plan && (
        <Appear index={4}>
          <Card style={{ gap: space.md }}>
            <AppText variant="headline">Read {character.name}’s story</AppText>
            <AppText variant="subhead" color="textSecondary">
              A {plan.days()}-day reading plan through the key chapters of their life.
            </AppText>
            <Button
              title={planActive ? 'Continue Plan' : 'View Reading Plan'}
              icon="calendar"
              variant={planActive ? 'primary' : 'secondary'}
              onPress={() => router.push({ pathname: '/bible/plan/[id]', params: { id: plan.id } })}
            />
          </Card>
        </Appear>
      )}
    </Screen>
  );
}

function KeyVerse({ reference }: { reference: string }) {
  const r = ref(reference);
  const prefs = usePreferences();
  const { colors } = useTheme();
  const { data } = usePassageText(r);
  return (
    <Card onPress={() => openReader(r.book, r.chapter, r.verseStart)} style={{ gap: space.sm, borderLeftWidth: 3, borderLeftColor: colors.gold }}>
      <AppText variant="scripture" style={{ fontSize: 17, lineHeight: 27 }}>
        {data ?? ' '}
      </AppText>
      <AppText variant="footnote" color="gold" weight="700">
        {formatReference(r)} · {prefs.translation}
      </AppText>
    </Card>
  );
}
