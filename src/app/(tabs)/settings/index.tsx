import Constants from 'expo-constants';
import { Switch, View } from 'react-native';

import { Appear, AppText, Card, ListGroup, ListRow, Screen, SegmentedControl } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import {
  setPreference,
  usePreferences,
  type AppearanceMode,
  type TextSize,
  type TranslationId,
} from '@/store/preferences';
import { useTheme } from '@/theme/use-theme';
import { space } from '@/theme/tokens';

const appearanceOptions: { value: AppearanceMode; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const textSizeOptions: { value: TextSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'X-Large' },
];

const translationOptions: { value: TranslationId; label: string }[] = [
  { value: 'BSB', label: 'BSB' },
  { value: 'WEB', label: 'WEB' },
  { value: 'KJV', label: 'KJV' },
];

const translationNames: Record<TranslationId, string> = {
  BSB: 'Berean Standard Bible',
  WEB: 'World English Bible',
  KJV: 'King James Version',
};

export default function SettingsScreen() {
  const prefs = usePreferences();
  const { colors } = useTheme();

  return (
    <Screen contentContainerStyle={{ gap: space.xl }}>
      <Appear index={0}>
        <View style={{ gap: space.sm }}>
          <SectionTitle>Appearance</SectionTitle>
          <SegmentedControl
            options={appearanceOptions}
            value={prefs.appearance}
            onChange={(v) => setPreference('appearance', v)}
          />
        </View>
      </Appear>

      <Appear index={1}>
        <View style={{ gap: space.sm }}>
          <SectionTitle>Text Size</SectionTitle>
          <SegmentedControl options={textSizeOptions} value={prefs.textSize} onChange={(v) => setPreference('textSize', v)} />
          <Card style={{ marginTop: space.xs }}>
            <AppText variant="scripture">The LORD is my shepherd; I shall not want.</AppText>
            <AppText variant="footnote" color="gold" weight="600" style={{ marginTop: space.sm }}>
              Psalm 23:1 · KJV
            </AppText>
          </Card>
        </View>
      </Appear>

      <Appear index={2}>
        <View style={{ gap: space.sm }}>
          <SectionTitle>Bible Translation</SectionTitle>
          <SegmentedControl
            options={translationOptions}
            value={prefs.translation}
            onChange={(v) => setPreference('translation', v)}
          />
          <AppText variant="footnote" color="textTertiary" style={{ paddingHorizontal: space.lg }}>
            {translationNames[prefs.translation]} · public domain
          </AppText>
        </View>
      </Appear>

      <Appear index={3}>
        <ListGroup title="Feel">
          <ListRow
            icon="wave"
            tone="sky"
            title="Haptics"
            subtitle="Gentle taps on buttons and quiz answers"
            trailing={
              <Switch
                value={prefs.haptics}
                trackColor={{ true: colors.gold }}
                onValueChange={(on) => {
                  setPreference('haptics', on);
                  if (on) haptics.success();
                }}
              />
            }
          />
        </ListGroup>
      </Appear>

      <Appear index={4}>
        <ListGroup title="About" footer="Made with love to help you grow closer to God every day.">
          <ListRow icon="cross" tone="gold" title="Abide" trailing={`v${Constants.expoConfig?.version ?? '1.0.0'}`} />
        </ListGroup>
      </Appear>
    </Screen>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <AppText variant="footnote" color="textSecondary" style={{ paddingHorizontal: space.lg, textTransform: 'uppercase' }}>
      {children}
    </AppText>
  );
}
