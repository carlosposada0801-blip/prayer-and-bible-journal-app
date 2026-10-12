import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, EmptyState } from '@/components/ui';
import { checkAchievements } from '@/db/achievements';
import { useLive } from '@/db/live';
import { listPeople, markPrayedFor, personOfTheDay, prayedToday, type Person } from '@/db/people';
import { relativeDay } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export function PeopleSection() {
  const people = useLive(listPeople, ['people']);
  const today = useLive(personOfTheDay, ['people']);
  const { colors } = useTheme();

  if (people.length === 0) {
    return (
      <EmptyState
        icon="people"
        tone="sky"
        title="Who are you praying for?"
        message="Add family, friends and anyone on your heart. Each day we'll gently suggest one person to pray for."
        action={{ title: 'Add a Person', onPress: () => router.push('/person-editor') }}
      />
    );
  }

  return (
    <View style={{ gap: space.lg }}>
      {today && (
        <Appear index={0}>
          <Card elevated="medium" style={{ gap: space.md, backgroundColor: colors.skySoft }}>
            <AppText variant="overline" color="sky">
              Pray for today
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <Avatar name={today.name} size={56} />
              <View style={{ flex: 1 }}>
                <AppText variant="title2">{today.name}</AppText>
                {today.relationship ? (
                  <AppText variant="subhead" color="textSecondary">
                    {today.relationship}
                  </AppText>
                ) : null}
              </View>
            </View>
            {today.notes ? <AppText variant="callout">{today.notes}</AppText> : null}
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={prayedToday(today) ? 'Prayed today' : 'I prayed'}
                  icon="check"
                  variant={prayedToday(today) ? 'secondary' : 'primary'}
                  onPress={() => {
                    markPrayedFor(today.id);
                    haptics.success();
                    checkAchievements();
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Write"
                  icon="pen"
                  variant="secondary"
                  onPress={() => router.push({ pathname: '/prayer-editor', params: { personId: today.id, title: `For ${today.name}` } })}
                />
              </View>
            </View>
          </Card>
        </Appear>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="title3">My Prayer List</AppText>
        <Pressable onPress={() => router.push('/person-editor')} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="plus" size={18} color={colors.gold} strokeWidth={2.2} />
          <AppText variant="subhead" color="gold" weight="600">
            Add
          </AppText>
        </Pressable>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
        {people.map((p, i) => (
          <PersonRow key={p.id} person={p} first={i === 0} />
        ))}
      </View>
    </View>
  );
}

function PersonRow({ person, first }: { person: Person; first: boolean }) {
  const { colors } = useTheme();
  const done = prayedToday(person);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/person-editor', params: { id: person.id } })}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        padding: space.md,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.separator,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}>
      <Avatar name={person.name} size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="body">{person.name}</AppText>
        <AppText variant="footnote" color="textSecondary">
          {person.last_prayed_at ? `Prayed ${relativeDay(person.last_prayed_at).toLowerCase()}` : person.relationship || 'Not yet prayed for'}
        </AppText>
      </View>
      <Pressable
        onPress={() => {
          markPrayedFor(person.id);
          haptics.success();
          checkAchievements();
        }}
        hitSlop={8}
        accessibilityLabel={`Mark prayed for ${person.name}`}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: done ? colors.sage : colors.surfaceMuted,
        }}>
        <Icon name="check" size={18} color={done ? '#FFFFFF' : colors.textTertiary} strokeWidth={2.4} />
      </Pressable>
    </Pressable>
  );
}

export function Avatar({ name, size }: { name: string; size: number }) {
  const { colors } = useTheme();
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const tones = [colors.goldSoft, colors.sageSoft, colors.skySoft, colors.roseSoft];
  const fg = [colors.gold, colors.sage, colors.sky, colors.rose];
  const i = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tones[i], alignItems: 'center', justifyContent: 'center' }}>
      <AppText style={{ fontSize: size * 0.38, fontWeight: '700', color: fg[i] }}>{initials}</AppText>
    </View>
  );
}
