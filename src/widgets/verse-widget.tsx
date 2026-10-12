import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

/**
 * Home Screen + Lock Screen widget: Verse of the Day.
 *
 * Runs in the widget's own isolated runtime: no hooks, no imports from app
 * code, and every constant must live INSIDE the function (see expo-widgets
 * docs). Data arrives through props set by src/lib/widgets.ts.
 */
export type VerseWidgetProps = { text: string; reference: string; translation: string };

const VerseWidget = (props: VerseWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const gold = '#E2BE6A';
  const cream = '#FBF6EA';
  const background = {
    type: 'linearGradient' as const,
    colors: ['#2B3B5E', '#1C2742'],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 },
  };
  const text = props.text || 'Open Abide to load today’s verse.';
  const family = environment.widgetFamily;

  if (family === 'accessoryInline') {
    return <Text modifiers={[widgetURL('abide://votd')]}>{props.reference}</Text>;
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[widgetURL('abide://votd'), containerBackground('clear', 'widget')]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' })]}>{props.reference}</Text>
        <Text modifiers={[font({ size: 12, design: 'serif' }), lineLimit(3), minimumScaleFactor(0.8)]}>{text}</Text>
      </VStack>
    );
  }

  const small = family === 'systemSmall';
  const large = family === 'systemLarge';
  return (
    <VStack
      alignment="leading"
      spacing={small ? 6 : 10}
      modifiers={[
        frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' }),
        containerBackground(background, 'widget'),
        widgetURL('abide://votd'),
      ]}>
      <HStack spacing={4}>
        <Image systemName="sparkles" color={gold} modifiers={[font({ size: 11 })]} />
        <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(gold)]}>{small ? 'TODAY' : 'VERSE OF THE DAY'}</Text>
      </HStack>
      <Text
        modifiers={[
          font({ size: small ? 14 : large ? 22 : 16, design: 'serif' }),
          foregroundStyle(cream),
          lineLimit(small ? 5 : large ? 12 : 4),
          minimumScaleFactor(0.75),
        ]}>
        {text}
      </Text>
      <Spacer />
      <HStack spacing={6}>
        <Text modifiers={[font({ size: small ? 12 : 13, weight: 'semibold' }), foregroundStyle(gold)]}>{props.reference}</Text>
        {!small && <Text modifiers={[font({ size: 11 }), foregroundStyle('#FBF6EA99')]}>{props.translation}</Text>}
      </HStack>
    </VStack>
  );
};

export default createWidget<VerseWidgetProps>('VerseOfTheDay', VerseWidget);

