import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatReference, ref } from '@/data/bible/references';
import { usePassageText } from '@/lib/bible/hooks';
import { usePreferences } from '@/store/preferences';
import { space } from '@/theme/tokens';

type ScriptureQuoteProps = {
  reference: string;
  align?: 'left' | 'center';
  size?: 'small' | 'medium';
};

/**
 * A short Scripture quote, always loaded from the Bible text in the user's
 * chosen translation (so app copy never misquotes the Bible).
 */
export function ScriptureQuote({ reference, align = 'center', size = 'medium' }: ScriptureQuoteProps) {
  const prefs = usePreferences();
  const r = ref(reference);
  const { data } = usePassageText(r);
  const fontSize = size === 'small' ? 16 : 18;
  return (
    <View style={{ gap: space.xs, alignItems: align === 'center' ? 'center' : 'flex-start', minHeight: 48 }}>
      <AppText variant="scripture" color="textSecondary" align={align} style={{ fontSize, lineHeight: Math.round(fontSize * 1.55) }}>
        {data ? `“${data}”` : ' '}
      </AppText>
      <AppText variant="footnote" color="gold" weight="600">
        {formatReference(r)} · {prefs.translation}
      </AppText>
    </View>
  );
}
