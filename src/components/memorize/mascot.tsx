import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { AppText } from '@/components/ui';
import { useTheme } from '@/theme/use-theme';
import { radius, space } from '@/theme/tokens';

export type MascotMood = 'idle' | 'happy' | 'cheer' | 'sad';

const WOOL = '#FFFFFF';
const WOOL_SHADE = '#EFE6D6';
const FACE = '#F6E3CF';
const DARK = '#5A4636';
const BLUSH = '#F4A9A0';
const EAR = '#EFCFB5';

/**
 * Grace, the little lamb who cheers you on. An original illustration
 * drawn with SVG so it stays crisp at any size.
 */
export function Mascot({ mood = 'idle', size = 120, bounceKey = 0 }: { mood?: MascotMood; size?: number; bounceKey?: number }) {
  const bob = useSharedValue(0);
  const jump = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(withTiming(-3, { duration: 1400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })),
      -1,
    );
  }, [bob]);

  useEffect(() => {
    if (mood === 'cheer' || mood === 'happy') {
      jump.value = withSequence(withTiming(-size * 0.14, { duration: 160, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 7, stiffness: 220 }));
    }
  }, [mood, bounceKey, jump, size]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value + jump.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessibilityLabel="Grace the lamb" accessibilityRole="image">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Ellipse cx={60} cy={112} rx={30} ry={4} fill="#000" opacity={0.06} />
        <Rect x={42} y={96} width={9} height={14} rx={4.5} fill={DARK} />
        <Rect x={69} y={96} width={9} height={14} rx={4.5} fill={DARK} />
        {mood === 'cheer' && (
          <G fill={WOOL} stroke={WOOL_SHADE} strokeWidth={2}>
            <Ellipse cx={20} cy={66} rx={8} ry={12} transform="rotate(-40 20 66)" />
            <Ellipse cx={100} cy={66} rx={8} ry={12} transform="rotate(40 100 66)" />
          </G>
        )}
        <G fill={WOOL} stroke={WOOL_SHADE} strokeWidth={2}>
          <Circle cx={38} cy={82} r={14} />
          <Circle cx={82} cy={82} r={14} />
          <Circle cx={60} cy={90} r={16} />
          <Circle cx={46} cy={94} r={11} />
          <Circle cx={74} cy={94} r={11} />
        </G>
        <G fill={WOOL}>
          <Circle cx={38} cy={82} r={12.6} />
          <Circle cx={82} cy={82} r={12.6} />
          <Circle cx={60} cy={90} r={14.6} />
          <Circle cx={46} cy={94} r={9.6} />
          <Circle cx={74} cy={94} r={9.6} />
          <Rect x={38} y={76} width={44} height={24} />
        </G>
        <Ellipse cx={30} cy={60} rx={11} ry={6} fill={EAR} transform="rotate(-25 30 60)" />
        <Ellipse cx={90} cy={60} rx={11} ry={6} fill={EAR} transform="rotate(25 90 60)" />
        <Ellipse cx={60} cy={66} rx={25} ry={22} fill={FACE} />
        <G fill={WOOL} stroke={WOOL_SHADE} strokeWidth={2}>
          <Circle cx={48} cy={44} r={9} />
          <Circle cx={60} cy={40} r={10} />
          <Circle cx={72} cy={44} r={9} />
        </G>
        <G fill={WOOL}>
          <Circle cx={48} cy={44} r={7.6} />
          <Circle cx={60} cy={40} r={8.6} />
          <Circle cx={72} cy={44} r={7.6} />
        </G>

        {mood === 'happy' || mood === 'cheer' ? (
          <G stroke={DARK} strokeWidth={3} fill="none" strokeLinecap="round">
            <Path d="M47 64 q4 -5 8 0" />
            <Path d="M65 64 q4 -5 8 0" />
          </G>
        ) : (
          <G>
            <Circle cx={51} cy={64} r={mood === 'sad' ? 4.2 : 4.6} fill={DARK} />
            <Circle cx={69} cy={64} r={mood === 'sad' ? 4.2 : 4.6} fill={DARK} />
            <Circle cx={52.6} cy={62.4} r={1.6} fill="#FFF" />
            <Circle cx={70.6} cy={62.4} r={1.6} fill="#FFF" />
            {mood === 'sad' && (
              <G stroke={DARK} strokeWidth={2.4} strokeLinecap="round">
                <Path d="M45 57 l8 -2.5" />
                <Path d="M75 57 l-8 -2.5" />
              </G>
            )}
          </G>
        )}

        <Ellipse cx={43} cy={72} rx={4.5} ry={3} fill={BLUSH} opacity={0.7} />
        <Ellipse cx={77} cy={72} rx={4.5} ry={3} fill={BLUSH} opacity={0.7} />
        <Ellipse cx={60} cy={70.5} rx={3} ry={2.2} fill={DARK} />

        {mood === 'sad' ? (
          <Path d="M56 77.5 q4 -3 8 0" stroke={DARK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        ) : mood === 'cheer' ? (
          <G>
            <Path d="M54 74 q6 8 12 0 z" fill={DARK} />
            <Path d="M57 77.5 q3 2.5 6 0" fill="#E98C86" />
          </G>
        ) : (
          <Path d="M55 74 q5 5 10 0" stroke={DARK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        )}
      </Svg>
    </Animated.View>
  );
}

/** Grace with a speech bubble. */
export function MascotSays({ text, mood = 'idle', size = 84 }: { text: string; mood?: MascotMood; size?: number }) {
  const { colors, shadow, isDark } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Mascot mood={mood} size={size} />
      <View
        style={[
          {
            flex: 1,
            backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
            borderRadius: radius.lg,
            borderCurve: 'continuous',
            paddingHorizontal: space.md,
            paddingVertical: space.md,
          },
          shadow.low,
        ]}>
        <View
          style={{
            position: 'absolute',
            left: -6,
            top: '50%',
            marginTop: -6,
            width: 12,
            height: 12,
            backgroundColor: isDark ? colors.surfaceRaised : colors.surface,
            transform: [{ rotate: '45deg' }],
          }}
        />
        <AppText variant="callout" weight="600">
          {text}
        </AppText>
      </View>
    </View>
  );
}
