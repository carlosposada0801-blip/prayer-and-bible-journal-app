import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

import { AppText } from './app-text';
import { IconBadge } from './icon-badge';
import { PressableScale } from './pressable-scale';

/** iOS-style "inset grouped" list section, like the Settings app. */
export function ListGroup({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const { colors, shadow } = useTheme();
  const rows = Children.toArray(children);
  return (
    <View style={{ gap: space.sm }}>
      {title && (
        <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: space.lg, textTransform: 'uppercase' }}>
          {title}
        </AppText>
      )}
      <View
        style={[
          { backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' },
          shadow.low,
        ]}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={{ height: 1, backgroundColor: colors.separator, marginLeft: 64 }} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && (
        <AppText variant="footnote" color="textTertiary" style={{ paddingHorizontal: space.lg }}>
          {footer}
        </AppText>
      )}
    </View>
  );
}

type ListRowProps = {
  icon?: IconName;
  tone?: 'gold' | 'sage' | 'rose' | 'sky' | 'navy';
  title: string;
  subtitle?: string;
  /** Text or element on the right side (a value, a Switch…). */
  trailing?: ReactNode;
  onPress?: () => void;
};

export function ListRow({ icon, tone, title, subtitle, trailing, onPress }: ListRowProps) {
  const { colors } = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, minHeight: 56, paddingVertical: space.sm }}>
      {icon && <IconBadge name={icon} tone={tone} size={36} />}
      <View style={{ flex: 1 }}>
        <AppText variant="body">{title}</AppText>
        {subtitle && (
          <AppText variant="footnote" color="textSecondary">
            {subtitle}
          </AppText>
        )}
      </View>
      {typeof trailing === 'string' ? (
        <AppText variant="body" color="textSecondary">
          {trailing}
        </AppText>
      ) : (
        trailing
      )}
      {onPress && <Icon name="chevronRight" size={18} color={colors.textTertiary} />}
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} scaleTo={0.985} accessibilityLabel={title}>
      {content}
    </PressableScale>
  ) : (
    content
  );
}
