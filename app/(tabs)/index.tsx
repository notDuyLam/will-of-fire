import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame } from "lucide-react-native";

/**
 * Dashboard Screen (Hello World)
 * Màn hình chính hiển thị danh sách Active Pacts.
 * Phase 1: Hiển thị Hello World với NativeWind styling.
 */
export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo / Icon */}
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-orange-500/20">
          <Flame color="#F97316" size={48} />
        </View>

        {/* Title */}
        <Text className="mb-2 text-4xl font-bold text-white">
          🔥 Will of Fire
        </Text>

        {/* Subtitle */}
        <Text className="mb-8 text-center text-lg text-slate-400">
          Forge your discipline.{"\n"}One pact at a time.
        </Text>

        {/* Status Badge */}
        <View className="rounded-full bg-emerald-500/20 px-4 py-2">
          <Text className="text-sm font-semibold text-emerald-400">
            ✅ NativeWind Active
          </Text>
        </View>

        {/* Version Info */}
        <Text className="mt-12 text-xs text-slate-600">
          Phase 1 — Setup & Config Complete
        </Text>
      </View>
    </SafeAreaView>
  );
}
