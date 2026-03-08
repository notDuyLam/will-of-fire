import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Flame, Plus, ListChecks } from "lucide-react-native";
import { useState, useCallback } from "react";
import { getAllActivePacts } from "../../src/db/queries";
import type { Pact } from "../../src/db/schema";
import { getProgressPercentage } from "../../src/utils/calendarRules";
import { InProgressGradientBar } from "../../src/components/InProgressGradientBar";
import { getNoGoalPhraseByIndex, NO_GOAL_PHRASE_COUNT } from "../../src/i18n/noGoalPhrases";
import { useTranslation } from "../../src/i18n/context";
import { useTheme } from "../../src/contexts/ThemeContext";

/**
 * Dashboard — Danh sách Active Pacts; điều hướng tới Tạo mới / Chi tiết.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { isDark } = useTheme();
  const [pactList, setPactList] = useState<Pact[]>([]);
  const [quoteIndices, setQuoteIndices] = useState<Record<string, number>>({});

  const refreshList = useCallback(() => {
    try {
      const list = getAllActivePacts();
      setPactList(list);
      const noGoal = list.filter((p) => !p.goalName && !p.goalDeadline);
      setQuoteIndices(
        noGoal.reduce(
          (acc, p) => ({
            ...acc,
            [p.id]: Math.floor(Math.random() * NO_GOAL_PHRASE_COUNT),
          }),
          {}
        )
      );
    } catch {
      setPactList([]);
      setQuoteIndices({});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshList();
    }, [refreshList])
  );

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
          <View className="ml-auto rounded-full bg-amber-500/20 px-3 py-1">
            <Text className="text-xs font-semibold text-amber-400">
              Phase 3
            </Text>
          </View>
        </View>

        <View className="mb-4 flex-row gap-3">
          <Pressable
            onPress={() => router.push("/pacts/create")}
            className="flex-1 flex-row items-center justify-center rounded-xl bg-orange-500 py-3 active:opacity-80"
          >
            <Plus color="white" size={18} />
            <Text className="ml-2 font-bold text-white">{t("dashboard.createPact")}</Text>
          </Pressable>
          <Pressable
            onPress={refreshList}
            className={`flex-1 flex-row items-center justify-center rounded-xl ${btnSecondary} py-3 active:opacity-80`}
          >
            <ListChecks color={isDark ? "white" : "#0f172a"} size={18} />
            <Text className={`ml-2 font-bold ${text}`}>{t("dashboard.refresh")}</Text>
          </Pressable>
        </View>

        <Text className={`mb-3 text-lg font-semibold ${muted}`}>
          {t("dashboard.activePacts")} ({pactList.length})
        </Text>

        {pactList.length === 0 ? (
          <View className={`items-center rounded-xl ${card} py-12`}>
            <Text className="text-5xl">📭</Text>
            <Text className={`mt-3 ${muted}`}>{t("dashboard.empty")}</Text>
          </View>
        ) : (
          pactList.map((pact) => {
            const hasGoal =
              !!pact.goalDeadline ||
              (pact.targetCount != null && pact.targetCount > 0);
            const pct = hasGoal
              ? getProgressPercentage(pact, pact.currentProgress)
              : 0;
            return (
              <Pressable
                key={pact.id}
                onPress={() => router.push(`/pacts/${pact.id}`)}
                className={`mb-3 rounded-xl ${card} p-4 active:opacity-90`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`text-base font-bold ${text}`}>{pact.name}</Text>
                    <Text className={`mt-1 text-xs ${muted}`}>
                      {pact.goalName ? pact.goalName : getNoGoalPhraseByIndex(locale, quoteIndices[pact.id] ?? 0)}
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
                      <Text className={`mt-1 text-xs ${muted}`}>{t("detail.inProgress")}</Text>
                    )}
                  </View>
                </View>
                {hasGoal ? (
                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <View
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </View>
                ) : (
                  <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <InProgressGradientBar seed={pact.id} height={6} widthFraction={0.5} />
                  </View>
                )}
                <Text className={`mt-2 text-xs ${muted}`}>
                  {t("dashboard.tapToDetail")} • {pact.frequency} • Streak: {pact.currentStreak}
                </Text>
              </Pressable>
            );
          })
        )}

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
