import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { formatDate } from '@/lib/dates';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

import { AppText } from './app-text';

type DateFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  maximumDate?: Date;
};

/** A labeled row with Apple's compact date/time picker. */
export function DateField({ label, value, onChange, mode = 'date', maximumDate }: DateFieldProps) {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        paddingLeft: space.md,
        paddingRight: space.sm,
        minHeight: 50,
      }}>
      <AppText variant="body">{label}</AppText>
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display="compact"
          maximumDate={maximumDate}
          accentColor={colors.gold}
          themeVariant={isDark ? 'dark' : 'light'}
          onChange={(_, d) => d && onChange(d)}
        />
      ) : (
        <>
          <Pressable onPress={() => setOpen(true)} style={{ padding: space.sm }}>
            <AppText variant="body" color="gold" weight="600">
              {mode === 'date' ? formatDate(value) : value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </AppText>
          </Pressable>
          {open && (
            <DateTimePicker
              value={value}
              mode={mode}
              maximumDate={maximumDate}
              onChange={(_, d) => {
                setOpen(false);
                if (d) onChange(d);
              }}
            />
          )}
        </>
      )}
    </View>
  );
}
