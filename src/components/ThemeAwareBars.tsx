import { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../contexts/ThemeContext";

const COLORS = {
  dark: { statusBar: "#0F172A" },
  light: { statusBar: "#F8FAFC" },
} as const;

/**
 * Cấu hình StatusBar (thanh trên: giờ, pin, wifi) theo theme.
 * - Dark: nền tối, style="light" (chữ/icon sáng).
 * - Light: nền sáng, style="dark" (chữ/icon tối).
 * Trên Android gọi thêm setBackgroundColor để đảm bảo nền đúng khi đổi theme.
 */
export function ThemeAwareBars() {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(colors.statusBar);
    }
  }, [colors.statusBar]);

  return (
    <StatusBar
      style={isDark ? "light" : "dark"}
      backgroundColor={colors.statusBar}
      translucent={false}
    />
  );
}
