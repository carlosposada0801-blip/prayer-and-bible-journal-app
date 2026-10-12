import { View } from 'react-native';

import type { IconName } from '@/components/icons/icon';
import { Icon } from '@/components/icons/icon';
import { Appear, AppText, Card, IconBadge, Screen } from '@/components/ui';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

type ComingSoonProps = {
  icon: IconName;
  tone: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  headline: string;
  description: string;
  features: string[];
  verse: { text: string; reference: string };
};

/** Temporary page for tabs we haven't built yet. */
export function ComingSoon({ icon, tone, headline, description, features, verse }: ComingSoonProps) {
  const { colors } = useTheme();
  return (
    <Screen>
      <Appear index={0}>
        <Card elevated="medium" style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxl }}>
          <IconBadge name={icon} tone={tone} size={72} />
          <AppText variant="title2" align="center">
            {headline}
          </AppText>
          <AppText variant="callout" color="textSecondary" align="center" style={{ maxWidth: 300 }}>
            {description}
          </AppText>
        </Card>
      </Appear>

      <Appear index={1}>
        <Card style={{ gap: space.md }}>
          <AppText variant="overline" color="textTertiary">
            Coming next
          </AppText>
          {features.map((feature) => (
            <View key={feature} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <View style={{ paddingTop: 2 }}>
                <Icon name="check" size={18} color={colors.sage} strokeWidth={2.2} />
              </View>
              <AppText variant="callout" style={{ flex: 1 }}>
                {feature}
              </AppText>
            </View>
          ))}
        </Card>
      </Appear>

      <Appear index={2}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.sm }}>
          <AppText variant="scripture" color="textSecondary" align="center">
            {verse.text}
          </AppText>
          <AppText variant="footnote" color="gold" align="center" weight="600">
            {verse.reference}
          </AppText>
        </View>
      </Appear>
    </Screen>
  );
}
