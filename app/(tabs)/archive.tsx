import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Archive Screen (Placeholder)
 * Sẽ hiển thị Completed & Failed Pacts.
 */
export default function ArchiveScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-white">🗄️ Archive</Text>
        <Text className="mt-2 text-slate-400">Coming in Phase 3</Text>
      </View>
    </SafeAreaView>
  );
}
