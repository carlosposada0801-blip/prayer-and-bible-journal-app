import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const COLORS = ['#E2BE6A', '#C49A3C', '#9DBAA1', '#E89186', '#8FB0DB', '#F5EAD0', '#B4A6E0'];

type Piece = { x: number; drift: number; delay: number; size: number; color: string; spin: number; round: boolean };

/**
 * A short, joyful confetti burst. Render it with a changing `burstKey`
 * (e.g. a counter) to fire again.
 */
export function Confetti({ burstKey, count = 36 }: { burstKey: number; count?: number }) {
  const { width } = Dimensions.get('window');
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 160,
        delay: Math.random() * 180,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        spin: (Math.random() - 0.5) * 900,
        round: Math.random() > 0.6,
      })),
    // New random pieces for each burst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey, count, width],
  );
  const progress = useSharedValue(0);

  useEffect(() => {
    if (burstKey === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1700, easing: Easing.out(Easing.quad) });
  }, [burstKey, progress]);

  if (burstKey === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={`${burstKey}-${i}`} piece={p} progress={progress} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece, progress }: { piece: Piece; progress: SharedValue<number> }) {
  const { height } = Dimensions.get('window');
  const local = useSharedValue(0);
  useEffect(() => {
    local.value = withDelay(piece.delay, withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }));
  }, [local, piece.delay]);

  const style = useAnimatedStyle(() => {
    const t = local.value;
    // Burst upward, then fall with gravity.
    const y = height * 0.55 - Math.sin(t * Math.PI * 0.9) * height * 0.45 + t * t * height * 0.35;
    return {
      opacity: progress.value < 0.85 ? 1 : (1 - progress.value) / 0.15,
      transform: [
        { translateX: piece.x + piece.drift * t },
        { translateY: y },
        { rotate: `${piece.spin * t}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 0.45,
          borderRadius: piece.round ? piece.size / 2 : 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}
