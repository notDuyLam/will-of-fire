import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Reports Screen (Placeholder)
 * Sẽ hiển thị Global Report tổng hợp data toàn app.
 */
export default function ReportsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-white">📊 Reports</Text>
        <Text className="mt-2 text-slate-400">Coming in Phase 3</Text>
      </View>
    </SafeAreaView>
  );
}
