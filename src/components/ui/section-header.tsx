import { Pressable, View } from 'react-native';

import { space } from '@/theme/tokens';

import { AppText } from './app-text';

/** A section title with an optional "See All"-style action on the right. */
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: -space.xs }}>
      <AppText variant="title3">{title}</AppText>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <AppText variant="subhead" color="gold" weight="600">
            {action}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
