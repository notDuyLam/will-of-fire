import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Flame, BarChart3, Archive, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useTranslation } from "../../src/i18n/context";

/**
 * Tab Layout: Khai báo Bottom Tab Bar cho 4 màn hình chính.
 * - Dashboard (index): Danh sách Active Pacts
 * - Reports: Báo cáo tổng
 * - Archive: Kho lưu trữ (Completed & Failed)
 * - Settings: Cài đặt (theme, ngôn ngữ)
 * Tab bar dùng safe area bottom để không đè lên thanh điều hướng hệ thống.
 * Key ép re-mount sau khi theme sẵn sàng để tab bar áp đúng màu ngay từ đầu.
 */
export default function TabLayout() {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [tabBarKey, setTabBarKey] = useState(0);

  useEffect(() => {
    // Ép tab bar re-mount một lần sau khi mount để native áp dụng đúng theme
    // (tránh lỗi thanh tab luôn trắng khi mới vào app lần đầu).
    const id = requestAnimationFrame(() => setTabBarKey((k) => k + 1));
    return () => cancelAnimationFrame(id);
  }, []);

  const tabBarStyle = {
    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
    borderTopColor: isDark ? "#1E293B" : "#E2E8F0",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8 + insets.bottom,
    height: 64 + insets.bottom,
  };
  return (
    <Tabs
      key={tabBarKey}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Flame color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: t("archive.title"),
          tabBarIcon: ({ color, size }) => (
            <Archive color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
