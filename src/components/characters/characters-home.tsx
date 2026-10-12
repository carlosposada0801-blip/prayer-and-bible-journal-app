import { router } from 'expo-router';
import { View } from 'react-native';

import { Appear, AppText, Card, IconBadge } from '@/components/ui';
import { CHARACTERS } from '@/data/characters';
import { space } from '@/theme/tokens';

/** "People" section of the Grow tab: Bible character profiles. */
export function CharactersHome() {
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="callout" color="textSecondary">
        Quick reads on the men and women of the Bible: their stories, key verses, and what God taught through their lives.
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {CHARACTERS.map((c, i) => (
          <View key={c.id} style={{ width: '48.5%' }}>
            <Appear index={Math.min(i, 8)}>
              <Card
                onPress={() => router.push({ pathname: '/grow/character/[id]', params: { id: c.id } })}
                style={{ gap: space.sm, padding: space.md, minHeight: 150 }}>
                <IconBadge name={c.icon} tone={c.tone} size={40} />
                <AppText variant="headline">{c.name}</AppText>
                <AppText variant="footnote" color="textSecondary" numberOfLines={2}>
                  {c.title}
                </AppText>
              </Card>
            </Appear>
          </View>
        ))}
      </View>
    </View>
  );
}
