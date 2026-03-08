import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/contexts/ThemeContext";

/**
 * Archive Screen (Placeholder)
 * Sẽ hiển thị Completed & Failed Pacts.
 */
export default function ArchiveScreen() {
  const { isDark } = useTheme();
  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  return (
    <SafeAreaView className={`flex-1 ${bg}`}>
      <View className="flex-1 items-center justify-center">
        <Text className={`text-2xl font-bold ${text}`}>🗄️ Archive</Text>
        <Text className={`mt-2 ${muted}`}>Sắp ra mắt</Text>
      </View>
    </SafeAreaView>
  );
}
