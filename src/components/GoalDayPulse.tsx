import { useEffect, type ReactNode } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  pulse: boolean;
  children: ReactNode;
};

/**
 * Bọc nội dung ô ngày; khi pulse=true chạy animation opacity lặp để nổi bật ngày goal.
 */
export function GoalDayPulse({ pulse, children }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
  }, [pulse, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }), []);

  if (!pulse) return <>{children}</>;
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
