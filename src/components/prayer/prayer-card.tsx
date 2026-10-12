import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/icons/icon';
import { AppText, Card, Chip } from '@/components/ui';
import type { Prayer } from '@/db/prayers';
import { formatDate } from '@/lib/dates';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export function PrayerCard({ prayer }: { prayer: Prayer }) {
  const { colors } = useTheme();
  const answered = Boolean(prayer.answered_at);
  return (
    <Card onPress={() => router.push({ pathname: '/prayer/[id]', params: { id: prayer.id } })} style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <AppText variant="caption" color="textTertiary" style={{ flex: 1 }}>
          {formatDate(prayer.created_at)}
        </AppText>
        {answered && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.sageSoft,
              borderRadius: radius.pill,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}>
            <Icon name="check" size={12} color={colors.sage} strokeWidth={2.6} />
            <AppText variant="caption" weight="700" style={{ color: colors.sage }}>
              Answered
            </AppText>
          </View>
        )}
      </View>
      <AppText variant="headline">{prayer.title}</AppText>
      {prayer.body ? (
        <AppText variant="callout" color="textSecondary" numberOfLines={3}>
          {prayer.body}
        </AppText>
      ) : null}
      {prayer.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {prayer.tags.map((t) => (
            <Chip key={t.id} label={t.name} small />
          ))}
        </View>
      )}
    </Card>
  );
}
