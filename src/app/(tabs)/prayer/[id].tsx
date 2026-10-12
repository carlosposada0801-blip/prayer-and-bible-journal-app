import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Button, Card, Chip, EmptyState, Screen } from '@/components/ui';
import { useLive } from '@/db/live';
import { getPerson } from '@/db/people';
import { deletePrayer, getPrayer, unmarkAnswered } from '@/db/prayers';
import { formatDate } from '@/lib/dates';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export default function PrayerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayerId = Number(id);
  const prayer = useLive(() => getPrayer(prayerId), ['prayers', 'prayer_tags', 'tags'], [prayerId]);
  const { colors } = useTheme();

  if (!prayer) {
    return (
      <Screen>
        <EmptyState icon="dove" title="Prayer not found" message="It may have been deleted." />
      </Screen>
    );
  }

  const person = prayer.person_id ? getPerson(prayer.person_id) : null;

  const confirmDelete = () =>
    Alert.alert('Delete this prayer?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePrayer(prayerId);
          haptics.warning();
          router.back();
        },
      },
    ]);

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Pressable onPress={() => router.push({ pathname: '/prayer-editor', params: { id: prayerId } })} hitSlop={8} accessibilityLabel="Edit prayer">
                <AppText variant="body" color="gold" weight="600">
                  Edit
                </AppText>
              </Pressable>
              <Pressable onPress={confirmDelete} hitSlop={8} accessibilityLabel="Delete prayer">
                <Icon name="trash" size={21} color={colors.rose} />
              </Pressable>
            </View>
          ),
        }}
      />

      <Appear index={0}>
        <View style={{ gap: space.sm }}>
          <AppText variant="overline" color="gold">
            {formatDate(prayer.created_at, 'long')}
          </AppText>
          <AppText variant="title1">{prayer.title}</AppText>
          {(prayer.tags.length > 0 || person) && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.xs }}>
              {person && <Chip label={person.name} icon="person" small />}
              {prayer.tags.map((t) => (
                <Chip key={t.id} label={t.name} small />
              ))}
            </View>
          )}
        </View>
      </Appear>

      {prayer.body ? (
        <Appear index={1}>
          <AppText variant="scripture" style={{ fontSize: 19, lineHeight: 31 }}>
            {prayer.body}
          </AppText>
        </Appear>
      ) : null}

      <Appear index={2}>
        {prayer.answered_at ? (
          <Card style={{ backgroundColor: colors.sageSoft, gap: space.md }} elevated="low">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.sage,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="check" size={18} color="#FFFFFF" strokeWidth={2.6} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="headline">God answered</AppText>
                <AppText variant="footnote" color="textSecondary">
                  {formatDate(prayer.answered_at, 'long')}
                </AppText>
              </View>
            </View>
            {prayer.answer_note ? (
              <AppText variant="scripture" style={{ fontSize: 17, lineHeight: 27 }}>
                {prayer.answer_note}
              </AppText>
            ) : null}
            <View style={{ flexDirection: 'row', gap: space.md }}>
              <Pressable onPress={() => router.push({ pathname: '/prayer-answer', params: { id: prayerId } })}>
                <AppText variant="subhead" color="sage" weight="600">
                  Edit note
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => {
                  unmarkAnswered(prayerId);
                  haptics.tap();
                }}>
                <AppText variant="subhead" color="textTertiary">
                  Mark as still praying
                </AppText>
              </Pressable>
            </View>
          </Card>
        ) : (
          <View
            style={{
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.separator,
              padding: space.lg,
              gap: space.md,
              alignItems: 'center',
            }}>
            <AppText variant="callout" color="textSecondary" align="center">
              Has God answered this prayer? Record how, so you can remember His faithfulness.
            </AppText>
            <Button
              title="Mark as Answered"
              icon="sparkle"
              onPress={() => router.push({ pathname: '/prayer-answer', params: { id: prayerId } })}
            />
          </View>
        )}
      </Appear>
    </Screen>
  );
}
