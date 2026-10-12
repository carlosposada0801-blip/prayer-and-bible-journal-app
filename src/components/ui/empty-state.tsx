import { View } from 'react-native';

import type { IconName } from '@/components/icons/icon';
import { space } from '@/theme/tokens';

import { AppText } from './app-text';
import { Button } from './button';
import { IconBadge } from './icon-badge';

type EmptyStateProps = {
  icon: IconName;
  tone?: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  title: string;
  message: string;
  action?: { title: string; onPress: () => void };
};

/** Friendly placeholder for lists that have nothing in them yet. */
export function EmptyState({ icon, tone = 'gold', title, message, action }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xxl, paddingHorizontal: space.lg }}>
      <IconBadge name={icon} tone={tone} size={64} />
      <AppText variant="title3" align="center">
        {title}
      </AppText>
      <AppText variant="callout" color="textSecondary" align="center" style={{ maxWidth: 300 }}>
        {message}
      </AppText>
      {action && (
        <View style={{ marginTop: space.sm }}>
          <Button title={action.title} onPress={action.onPress} />
        </View>
      )}
    </View>
  );
}
