import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Flame, Plus, ListChecks } from "lucide-react-native";
import { useState, useCallback, useEffect } from "react";
import { usePactStore } from "../../src/store/usePactStore";
import { getProgressPercentage } from "../../src/utils/calendarRules";
import { InProgressGradientBar } from "../../src/components/InProgressGradientBar";
import { AnimatedProgressBar } from "../../src/components/AnimatedProgressBar";
import { AnimatedPressable } from "../../src/components/AnimatedPressable";
import {
  getNoGoalPhraseByIndex,
  NO_GOAL_PHRASE_COUNT,
} from "../../src/i18n/noGoalPhrases";
import { useTranslation } from "../../src/i18n/context";
import { useTheme } from "../../src/contexts/ThemeContext";

/**
 * Dashboard — Danh sách Active Pacts từ Zustand store; điều hướng tới Tạo mới / Chi tiết.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { isDark } = useTheme();
  const activePacts = usePactStore((s) => s.activePacts);
  const fetchActivePacts = usePactStore((s) => s.fetchActivePacts);
  const [quoteIndices, setQuoteIndices] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      fetchActivePacts();
    }, [fetchActivePacts]),
  );

  useEffect(() => {
    const noGoal = activePacts.filter((p) => !p.goalName && !p.goalDeadline);
    setQuoteIndices(
      noGoal.reduce<Record<string, number>>(
        (acc, p) => ({
          ...acc,
          [p.id]: Math.floor(Math.random() * NO_GOAL_PHRASE_COUNT),
        }),
        {},
      ),
    );
  }, [activePacts]);

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark ? "bg-slate-800" : "bg-white border border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const btnSecondary = isDark ? "bg-slate-700" : "bg-slate-200";

  return (
    <SafeAreaView className={`flex-1 ${bg}`}>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6 flex-row items-center">
          <Flame color="#F97316" size={28} />
          <Text className={`ml-2 text-2xl font-bold ${text}`}>
            {t("dashboard.title")}
          </Text>
        </View>

        <View className="mb-4 flex-row gap-3">
          <AnimatedPressable
            onPress={() => router.push("/pacts/create")}
            className="flex-1 flex-row items-center justify-center rounded-xl bg-orange-500 py-3"
          >
            <View className="shrink-0 flex-row items-center">
              <Plus color="white" size={18} />
              <Text className="ml-2 shrink-0 font-bold text-white" numberOfLines={1}>
                {t("dashboard.createPact")}
              </Text>
            </View>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={fetchActivePacts}
            className={`flex-1 flex-row items-center justify-center rounded-xl ${btnSecondary} py-3`}
          >
            <View className="shrink-0 flex-row items-center">
              <ListChecks color={isDark ? "white" : "#0f172a"} size={18} />
              <Text className={`ml-2 shrink-0 font-bold ${text}`} numberOfLines={1}>
                {t("dashboard.refresh")}
              </Text>
            </View>
          </AnimatedPressable>
        </View>

        <Text className={`mb-3 text-lg font-semibold ${muted}`}>
          {t("dashboard.activePacts")} ({activePacts.length})
        </Text>

        {activePacts.length === 0 ? (
          <View className={`items-center rounded-xl ${card} py-12`}>
            <Text className="text-5xl">📭</Text>
            <Text className={`mt-3 ${muted}`}>{t("dashboard.empty")}</Text>
          </View>
        ) : (
          activePacts.map((pact) => {
            const hasGoal =
              !!pact.goalDeadline ||
              (pact.targetCount != null && pact.targetCount > 0);
            const pct = hasGoal
              ? getProgressPercentage(pact, pact.currentProgress)
              : 0;
            return (
              <AnimatedPressable
                key={pact.id}
                onPress={() => router.push(`/pacts/${pact.id}`)}
                className={`mb-3 rounded-xl ${card} p-4`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${text}`}>
                      {pact.name}
                    </Text>
                    <Text className={`mt-1 text-xs ${muted}`}>
                      {pact.goalName
                        ? pact.goalName
                        : getNoGoalPhraseByIndex(
                            locale,
                            quoteIndices[pact.id] ?? 0,
                          )}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Flame color="#F97316" size={14} />
                      <Text className="ml-1 text-sm font-bold text-orange-400">
                        {pact.totalFire}
                      </Text>
                    </View>
                    {hasGoal ? (
                      <Text className={`mt-1 text-xs ${muted}`}>{pct}%</Text>
                    ) : (
                      <Text className={`mt-1 text-xs ${muted}`}>
                        {t("detail.inProgress")}
                      </Text>
                    )}
                  </View>
                </View>
                {hasGoal ? (
                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <AnimatedProgressBar progress={pct} height={6} />
                  </View>
                ) : (
                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <InProgressGradientBar
                      seed={pact.id}
                      height={6}
                      widthFraction={0.5}
                    />
                  </View>
                )}
                <Text className={`mt-2 text-xs ${muted}`}>
                  {t("dashboard.tapToDetail")} • {pact.frequency} • Streak:{" "}
                  {pact.currentStreak}
                </Text>
              </AnimatedPressable>
            );
          })
        )}

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
