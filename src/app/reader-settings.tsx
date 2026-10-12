import { ScrollView, Switch, View } from 'react-native';

import { AppText, Card, SegmentedControl } from '@/components/ui';
import { setPreference, usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

/** Sheet: reading appearance – text size, font, spacing, theme. */
export default function ReaderSettings() {
  const prefs = usePreferences();
  const { colors } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
      <AppText variant="title2">Reading</AppText>

      <Card>
        <AppText
          style={{
            fontFamily: prefs.readerFont === 'serif' ? fonts.serif : fonts.sans,
            fontSize: 19,
            lineHeight: 30,
            color: colors.text,
          }}>
          <AppText variant="caption" color="gold" weight="700">
            1{'  '}
          </AppText>
          Blessed is the man who walks not in the counsel of the wicked.
        </AppText>
      </Card>

      <Setting label="Text Size">
        <SegmentedControl
          options={[
            { value: 'small', label: 'A' },
            { value: 'default', label: 'A+' },
            { value: 'large', label: 'A++' },
            { value: 'xlarge', label: 'A+++' },
          ]}
          value={prefs.textSize}
          onChange={(v) => setPreference('textSize', v)}
        />
      </Setting>

      <Setting label="Font">
        <SegmentedControl
          options={[
            { value: 'serif', label: 'New York' },
            { value: 'sans', label: 'SF Pro' },
          ]}
          value={prefs.readerFont}
          onChange={(v) => setPreference('readerFont', v)}
        />
      </Setting>

      <Setting label="Line Spacing">
        <SegmentedControl
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'normal', label: 'Normal' },
            { value: 'relaxed', label: 'Relaxed' },
          ]}
          value={prefs.readerSpacing}
          onChange={(v) => setPreference('readerSpacing', v)}
        />
      </Setting>

      <Setting label="Appearance">
        <SegmentedControl
          options={[
            { value: 'system', label: 'Auto' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={prefs.appearance}
          onChange={(v) => setPreference('appearance', v)}
        />
      </Setting>

      <Card style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: space.md }}>
        <AppText variant="body" style={{ flex: 1 }}>
          Verse Numbers
        </AppText>
        <Switch
          value={prefs.showVerseNumbers}
          trackColor={{ true: colors.gold }}
          onValueChange={(v) => setPreference('showVerseNumbers', v)}
        />
      </Card>
    </ScrollView>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <AppText variant="footnote" color="textSecondary" style={{ textTransform: 'uppercase', paddingHorizontal: space.xs }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}
