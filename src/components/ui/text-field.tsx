import { forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/icons/icon';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';
import { textStyle } from '@/theme/typography';

type TextFieldProps = TextInputProps & {
  icon?: IconName;
  /** Serif "journal" style for prayers and reflections. */
  journal?: boolean;
};

/** Soft, rounded text input. Use `multiline` for journal entries. */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { icon, journal, multiline, style, ...rest },
  ref,
) {
  const { colors, textScale } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: space.sm,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        paddingHorizontal: space.md,
        paddingVertical: multiline ? space.md : 0,
      }}>
      {icon && <Icon name={icon} size={18} color={colors.textTertiary} />}
      <TextInput
        ref={ref}
        multiline={multiline}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.gold}
        style={[
          textStyle(journal ? 'scripture' : 'body', journal ? textScale * 0.86 : textScale),
          {
            flex: 1,
            color: colors.text,
            minHeight: multiline ? 120 : 46,
            paddingVertical: multiline ? 0 : 12,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
});
