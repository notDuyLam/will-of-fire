import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "../../src/i18n/context";
import { useTheme } from "../../src/contexts/ThemeContext";
import { Settings as SettingsIcon } from "lucide-react-native";

/**
 * Màn hình Cài đặt: đổi theme (sáng/tối), đổi ngôn ngữ.
 */
export default function SettingsScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const btnPrimary = "bg-orange-500";
  const btnSecondary = isDark ? "bg-slate-700" : "bg-slate-200";

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6 flex-row items-center">
          <SettingsIcon color={isDark ? "#F8FAFC" : "#0f172a"} size={28} />
          <Text className={`ml-2 text-2xl font-bold ${text}`}>
            {t("settings.title")}
          </Text>
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.theme")}
        </Text>
        <View className={`mb-6 flex-row gap-3 rounded-xl border p-3 ${card}`}>
          <Pressable
            onPress={() => setTheme("light")}
            className={`flex-1 rounded-lg py-3 ${theme === "light" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                theme === "light" ? "text-white" : muted
              }`}
            >
              {t("settings.themeLight")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTheme("dark")}
            className={`flex-1 rounded-lg py-3 ${theme === "dark" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                theme === "dark" ? "text-white" : muted
              }`}
            >
              {t("settings.themeDark")}
            </Text>
          </Pressable>
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.language")}
        </Text>
        <View className={`mb-6 flex-row gap-3 rounded-xl border p-3 ${card}`}>
          <Pressable
            onPress={() => setLocale("vi")}
            className={`flex-1 rounded-lg py-3 ${locale === "vi" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                locale === "vi" ? "text-white" : muted
              }`}
            >
              {t("settings.languageVi")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale("en")}
            className={`flex-1 rounded-lg py-3 ${locale === "en" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                locale === "en" ? "text-white" : muted
              }`}
            >
              {t("settings.languageEn")}
            </Text>
          </Pressable>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
