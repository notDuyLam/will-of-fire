import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

const SPRING_CONFIG = { damping: 16, stiffness: 120 };

type Props = {
  /** Progress 0–100 */
  progress: number;
  height?: number;
  barColor?: string;
  backgroundColor?: string;
};

/**
 * Progress bar với animation Reanimated (withSpring).
 * Dùng cho Dashboard và Pact Detail khi có goal/target.
 */
export function AnimatedProgressBar({
  progress,
  height = 8,
  barColor = "#F97316",
  backgroundColor = "#334155",
}: Props) {
  const progressValue = useSharedValue(0);
  const layoutWidth = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withSpring(Math.min(100, Math.max(0, progress)), SPRING_CONFIG);
  }, [progress, progressValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const w = (layoutWidth.value * progressValue.value) / 100;
    return {
      width: w,
    };
  }, []);

  return (
    <View
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        overflow: "hidden",
        backgroundColor,
      }}
      onLayout={(e) => {
        layoutWidth.value = e.nativeEvent.layout.width;
      }}
    >
      <Animated.View
        style={[
          {
            height,
            borderRadius: height / 2,
            backgroundColor: barColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
