import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

/**
 * Home Screen + Lock Screen widget: your gentle daily rhythm (streak).
 * Same rules as the verse widget: self-contained, data comes from props.
 */
export type StreakWidgetProps = { streak: number; doneToday: boolean; week: boolean[] };

const StreakWidget = (props: StreakWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const gold = '#E2BE6A';
  const family = environment.widgetFamily;
  const label = props.streak === 1 ? 'day' : 'days';

  if (family === 'accessoryInline') {
    return (
      <Text modifiers={[widgetURL('abide://')]}>
        {props.streak > 0 ? `${props.streak}-day rhythm` : 'Begin today'}
      </Text>
    );
  }

  if (family === 'accessoryCircular') {
    return (
      <VStack spacing={0} modifiers={[widgetURL('abide://'), containerBackground('clear', 'widget')]}>
        <Image systemName={props.doneToday ? 'flame.fill' : 'flame'} modifiers={[font({ size: 16 })]} />
        <Text modifiers={[font({ size: 18, weight: 'bold', design: 'rounded' })]}>{props.streak}</Text>
      </VStack>
    );
  }

  const background = environment.colorScheme === 'dark' ? '#171E2B' : '#FFFFFF';
  const text = environment.colorScheme === 'dark' ? '#F3EEE3' : '#1C2333';
  const muted = environment.colorScheme === 'dark' ? '#2A3344' : '#F3EEE3';
  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' }), containerBackground(background, 'widget'), widgetURL('abide://')]}>
      <Image systemName={props.doneToday ? 'flame.fill' : 'flame'} color={gold} modifiers={[font({ size: 22 })]} />
      <Spacer />
      <Text modifiers={[font({ size: 34, weight: 'bold', design: 'rounded' }), foregroundStyle(text)]}>{props.streak}</Text>
      <Text modifiers={[font({ size: 12, weight: 'medium' }), foregroundStyle(gold)]}>
        {props.streak > 0 ? `${label} with God` : 'Your rhythm starts today'}
      </Text>
      <HStack spacing={4}>
        {props.week.map((active, i) => (
          <Image key={i} systemName="circle.fill" color={active ? gold : muted} modifiers={[font({ size: 9 })]} />
        ))}
      </HStack>
    </VStack>
  );
};

export default createWidget<StreakWidgetProps>('Streak', StreakWidget);
