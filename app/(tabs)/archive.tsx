import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Archive as ArchiveIcon, Trophy, AlertCircle, Flame } from "lucide-react-native";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useTranslation } from "../../src/i18n/context";
import { getCompletedPacts, getFailedPacts } from "../../src/db/queries";
import { AnimatedPressable } from "../../src/components/AnimatedPressable";
import type { Pact } from "../../src/db/schema";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ArchiveScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [completed, setCompleted] = useState<Pact[]>([]);
  const [failed, setFailed] = useState<Pact[]>([]);

  useFocusEffect(
    useCallback(() => {
      setCompleted(getCompletedPacts());
      setFailed(getFailedPacts());
    }, []),
  );

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark ? "bg-slate-800" : "bg-white border border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6 flex-row items-center">
          <ArchiveIcon color={isDark ? "#F8FAFC" : "#0f172a"} size={28} />
          <Text className={`ml-2 text-2xl font-bold ${text}`}>
            {t("archive.title")}
          </Text>
        </View>

        {/* Chiến tích (Completed) */}
        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("archive.completed")}
        </Text>
        {completed.length === 0 ? (
          <View
            className={`mb-6 min-h-[120px] items-center justify-center rounded-2xl ${card} p-6`}
          >
            <Trophy color={isDark ? "#64748B" : "#94a3b8"} size={40} />
            <Text className={`mt-3 text-center text-sm ${muted}`}>
              {t("archive.emptyCompleted")}
            </Text>
          </View>
        ) : (
          <View className="mb-6 gap-3">
            {completed.map((pact) => (
              <AnimatedPressable
                key={pact.id}
                onPress={() => router.push(`/pacts/${pact.id}`)}
                className={`rounded-xl ${card} p-4`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${text}`} numberOfLines={1}>
                      {pact.name}
                    </Text>
                    <Text className={`mt-0.5 text-xs ${muted}`} numberOfLines={1}>
                      {pact.goalName || "—"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Flame color="#F97316" size={14} />
                      <Text className="ml-1 text-sm font-bold text-orange-400">
                        {pact.totalFire}
                      </Text>
                    </View>
                    <Text className={`mt-0.5 text-xs ${muted}`}>
                      {formatDate(pact.updatedAt)}
                    </Text>
                  </View>
                </View>
                <Text className={`mt-2 text-xs ${muted}`}>
                  {t("archive.tapToDetail")}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        )}

        {/* Bài học (Failed) */}
        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("archive.failed")}
        </Text>
        {failed.length === 0 ? (
          <View
            className={`mb-8 min-h-[120px] items-center justify-center rounded-2xl ${card} p-6`}
          >
            <AlertCircle color={isDark ? "#64748B" : "#94a3b8"} size={40} />
            <Text className={`mt-3 text-center text-sm ${muted}`}>
              {t("archive.emptyFailed")}
            </Text>
          </View>
        ) : (
          <View className="mb-8 gap-3">
            {failed.map((pact) => (
              <AnimatedPressable
                key={pact.id}
                onPress={() => router.push(`/pacts/${pact.id}`)}
                className={`rounded-xl ${card} p-4 border-l-4 border-red-500/50`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${text}`} numberOfLines={1}>
                      {pact.name}
                    </Text>
                    <Text className={`mt-0.5 text-xs ${muted}`} numberOfLines={1}>
                      {pact.goalName || "—"}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Flame color="#F97316" size={14} />
                      <Text className="ml-1 text-sm font-bold text-orange-400">
                        {pact.totalFire}
                      </Text>
                    </View>
                    <Text className={`mt-0.5 text-xs ${muted}`}>
                      {formatDate(pact.updatedAt)}
                    </Text>
                  </View>
                </View>
                <Text className={`mt-2 text-xs ${muted}`}>
                  {t("archive.tapToDetail")}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
