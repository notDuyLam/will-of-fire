import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Plus, ListChecks, Trash2 } from "lucide-react-native";
import { useState, useCallback } from "react";
import { createPact, getAllActivePacts, logAction } from "../../src/db/queries";
import type { Pact } from "../../src/db/schema";

/**
 * Dashboard Screen — Phase 2: DB Test Mode
 * Cho phép user test insert/read Pact vào SQLite database.
 * Sẽ được thay thế bằng UI chuẩn trong Phase 3.
 */
export default function DashboardScreen() {
  const [pactList, setPactList] = useState<Pact[]>([]);
  const [lastAction, setLastAction] = useState<string>("");

  /**
   * Test: Tạo một Pact mới với data mẫu
   */
  const handleCreateTestPact = useCallback(() => {
    try {
      const sampleNames = [
        "Đọc sách 30 phút",
        "Tập thể dục",
        "Thiền 10 phút",
        "Học tiếng Anh",
        "Tiết kiệm 50K",
      ];
      const randomName =
        sampleNames[Math.floor(Math.random() * sampleNames.length)];

      const newPact = createPact({
        name: randomName!,
        description: `Test pact: ${randomName}`,
        frequency: "DAILY",
        goalName: `Hoàn thành ${randomName} 30 ngày liên tiếp`,
        targetCount: 30,
        reminderTime: "07:30",
      });

      setLastAction(`✅ Created: "${newPact.name}" (ID: ${newPact.id.slice(0, 8)}...)`);
      // Refresh danh sách
      handleRefreshList();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setLastAction(`❌ Error: ${msg}`);
    }
  }, []);

  /**
   * Test: Đọc toàn bộ Active Pacts
   */
  const handleRefreshList = useCallback(() => {
    try {
      const activePacts = getAllActivePacts();
      setPactList(activePacts);
      setLastAction(`📋 Loaded ${activePacts.length} active pact(s)`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setLastAction(`❌ Error: ${msg}`);
    }
  }, []);

  /**
   * Test: Log COMPLETE action cho một Pact
   */
  const handleTestLog = useCallback((pact: Pact) => {
    try {
      const today = new Date().toISOString().split("T")[0]!;
      const log = logAction({
        pactId: pact.id,
        date: today,
        action: "COMPLETE",
        fireEarned: 1,
      });
      setLastAction(`🔥 Logged COMPLETE for "${pact.name}" on ${log.date}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setLastAction(`❌ Error: ${msg}`);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6 flex-row items-center">
          <Flame color="#F97316" size={28} />
          <Text className="ml-2 text-2xl font-bold text-white">
            Will of Fire
          </Text>
          <View className="ml-auto rounded-full bg-amber-500/20 px-3 py-1">
            <Text className="text-xs font-semibold text-amber-400">
              Phase 2 — DB Test
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mb-4 flex-row gap-3">
          <Pressable
            onPress={handleCreateTestPact}
            className="flex-1 flex-row items-center justify-center rounded-xl bg-orange-500 py-3 active:opacity-80"
          >
            <Plus color="white" size={18} />
            <Text className="ml-2 font-bold text-white">Create Pact</Text>
          </Pressable>

          <Pressable
            onPress={handleRefreshList}
            className="flex-1 flex-row items-center justify-center rounded-xl bg-slate-700 py-3 active:opacity-80"
          >
            <ListChecks color="white" size={18} />
            <Text className="ml-2 font-bold text-white">Refresh</Text>
          </Pressable>
        </View>

        {/* Last Action Log */}
        {lastAction ? (
          <View className="mb-4 rounded-lg bg-slate-800 px-4 py-3">
            <Text className="text-sm text-slate-300">{lastAction}</Text>
          </View>
        ) : null}

        {/* Pact List */}
        <Text className="mb-3 text-lg font-semibold text-slate-400">
          Active Pacts ({pactList.length})
        </Text>

        {pactList.length === 0 ? (
          <View className="items-center rounded-xl bg-slate-800/50 py-12">
            <Text className="text-5xl">📭</Text>
            <Text className="mt-3 text-slate-500">
              No pacts yet. Tap "Create Pact" to test.
            </Text>
          </View>
        ) : (
          pactList.map((pact) => (
            <Pressable
              key={pact.id}
              onPress={() => handleTestLog(pact)}
              className="mb-3 rounded-xl bg-slate-800 p-4 active:bg-slate-700"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-bold text-white">
                    {pact.name}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-400">
                    {pact.goalName}
                  </Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center">
                    <Flame color="#F97316" size={14} />
                    <Text className="ml-1 text-sm font-bold text-orange-400">
                      {pact.totalFire}
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-slate-500">
                    {pact.currentProgress}/{pact.targetCount}
                  </Text>
                </View>
              </View>
              <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <View
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${Math.min(
                      (pact.currentProgress / pact.targetCount) * 100,
                      100
                    )}%`,
                  }}
                />
              </View>
              <Text className="mt-2 text-xs text-slate-600">
                Tap to log COMPLETE • ID: {pact.id.slice(0, 8)}... •{" "}
                {pact.frequency} • Streak: {pact.currentStreak}
              </Text>
            </Pressable>
          ))
        )}

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
