import { Pressable, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReactNode } from "react";

const PRESS_SCALE = 0.97;
const DURATION = 80;

type Props = PressableProps & {
  children: ReactNode;
};

/**
 * Pressable với animation scale khi nhấn (Reanimated).
 */
export function AnimatedPressable({ children, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withTiming(PRESS_SCALE, { duration: DURATION });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: DURATION });
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}
