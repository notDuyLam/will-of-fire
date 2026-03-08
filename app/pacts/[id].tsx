import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { Flame, ChevronLeft, Pencil, Check, Shield } from "lucide-react-native";
import {
  getPactById,
  getLogsForPact,
  getLogForDate,
  logActionAndUpdatePact,
  updatePact,
  createMilestone,
} from "../../src/db/queries";
import type { Pact, PactLog } from "../../src/db/schema";
import { isScheduledOn, getProgressPercentage } from "../../src/utils/calendarRules";
import { PactCalendar } from "../../src/components/PactCalendar";
import { DatePickerField } from "../../src/components/DatePickerField";
import { InProgressGradientBar } from "../../src/components/InProgressGradientBar";
import { useTranslation } from "../../src/i18n/context";
import { getNoGoalPhraseByIndex, NO_GOAL_PHRASE_COUNT } from "../../src/i18n/noGoalPhrases";
import { useTheme } from "../../src/contexts/ThemeContext";

function getToday(): string {
  return new Date().toISOString().split("T")[0]!;
}

function ActionBadge({
  action,
  isDark,
}: {
  action: string;
  isDark: boolean;
}) {
  const style =
    action === "COMPLETE"
      ? "bg-green-500/20 text-green-400"
      : action === "PRESERVE"
        ? "bg-blue-500/20 text-blue-400"
        : "bg-red-500/20 text-red-400";
  const label =
    action === "COMPLETE" ? "Hoàn thành" : action === "PRESERVE" ? "Bảo toàn" : "Bỏ lỡ";
  return (
    <View className={`rounded px-2 py-0.5 ${style}`}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  );
}

export default function PactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale = "vi" } = useTranslation();
  const { isDark } = useTheme();
  const [pact, setPact] = useState<Pact | null>(null);
  const [logs, setLogs] = useState<PactLog[]>([]);
  const [evolutionModal, setEvolutionModal] = useState(false);
  const [evolveGoalName, setEvolveGoalName] = useState("");
  const [evolveDeadline, setEvolveDeadline] = useState<string | null>(null);
  const [noGoalQuoteIndex, setNoGoalQuoteIndex] = useState(0);

  const today = getToday();
  const hasLogToday = pact ? !!getLogForDate(pact.id, today) : false;
  const isScheduledToday = pact
    ? isScheduledOn(pact.frequency, today, {
        scheduleStartDate: pact.scheduleStartDate,
        createdAt: pact.createdAt,
        intervalDays: pact.intervalDays,
        goalDeadline: pact.goalDeadline,
      })
    : false;
  const canAct = pact?.status === "ACTIVE" && !hasLogToday && isScheduledToday;

  const progressPct = pact
    ? getProgressPercentage(pact, pact.currentProgress, today)
    : 0;
  const reachedTarget =
    pact?.status === "ACTIVE" &&
    !!pact?.goalDeadline &&
    progressPct >= 100 &&
    hasLogToday;

  const load = useCallback(() => {
    if (!id) return;
    const p = getPactById(id);
    setPact(p ?? null);
    if (p) setLogs(getLogsForPact(p.id));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (pact && !pact.goalName && !pact.goalDeadline) {
      setNoGoalQuoteIndex(Math.floor(Math.random() * NO_GOAL_PHRASE_COUNT));
    }
  }, [pact?.id]);

  useEffect(() => {
    if (reachedTarget) setEvolutionModal(true);
  }, [reachedTarget]);

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark ? "bg-slate-800" : "bg-white border border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const btnSecondary = isDark ? "bg-slate-700" : "bg-slate-200";

  if (!id) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${bg}`}>
        <Text className={muted}>Thiếu ID</Text>
        <Pressable onPress={() => router.back()} className={`mt-4 rounded-lg ${btnSecondary} px-4 py-2`}>
          <Text className={text}>{t("common.back")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!pact) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${bg}`}>
        <Text className={muted}>Không tìm thấy Khế Ước</Text>
        <Pressable onPress={() => router.back()} className={`mt-4 rounded-lg ${btnSecondary} px-4 py-2`}>
          <Text className={text}>{t("common.back")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleComplete = () => {
    const result = logActionAndUpdatePact(pact.id, today, "COMPLETE");
    if (!result.success) {
      Alert.alert("Thông báo", result.message ?? "Không thể ghi nhận.");
      return;
    }
    load();
  };

  const handlePreserve = () => {
    const result = logActionAndUpdatePact(pact.id, today, "PRESERVE");
    if (!result.success) {
      Alert.alert("Thông báo", result.message ?? "Không thể ghi nhận.");
      return;
    }
    load();
  };

  const handleMarkMiss = () => {
    Alert.alert(
      "Đánh dấu Bỏ lỡ",
      "Chắc chắn đánh dấu ngày hôm nay là Bỏ lỡ? Chuỗi sẽ bị gãy; 2 lần Miss liên tiếp sẽ khiến Khế Ước Thất bại.",
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: () => {
            logActionAndUpdatePact(pact.id, today, "MISS");
            load();
          },
        },
      ]
    );
  };

  const handleArchive = () => {
    updatePact(pact.id, { status: "COMPLETED" });
    setEvolutionModal(false);
    router.back();
  };

  const handleEvolve = () => {
    if (!evolveGoalName.trim() || !evolveDeadline) {
      Alert.alert(t("common.error"), "Nhập đầy đủ Mục tiêu và chọn Hạn chót.");
      return;
    }
    createMilestone({
      pactId: pact.id,
      goalName: (pact.goalName || pact.name).trim(),
      goalDeadline: pact.goalDeadline ?? undefined,
    });
    updatePact(pact.id, {
      goalName: evolveGoalName.trim(),
      goalDeadline: evolveDeadline,
      currentProgress: 0,
    });
    setEvolutionModal(false);
    setEvolveGoalName("");
    setEvolveDeadline(null);
    load();
  };

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["bottom"]}>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-4 flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3 p-1" hitSlop={8}>
            <ChevronLeft color={isDark ? "#F8FAFC" : "#0f172a"} size={24} />
          </Pressable>
          <Text className={`flex-1 text-lg font-bold ${text}`} numberOfLines={1}>
            {pact.name}
          </Text>
          <Pressable
            onPress={() => router.push({ pathname: "/pacts/edit", params: { id: pact.id } })}
            className={`rounded-lg ${btnSecondary} p-2`}
          >
            <Pencil color={isDark ? "#F8FAFC" : "#0f172a"} size={18} />
          </Pressable>
        </View>

        {pact.description ? (
          <Text className={`mb-3 text-sm ${muted}`}>{pact.description}</Text>
        ) : null}

        <View className={`mb-4 rounded-xl ${card} p-4`}>
          {pact.goalName || pact.goalDeadline ? (
            <>
              <Text className={`text-sm ${muted}`}>{t("detail.goal")}</Text>
              <Text className={`mt-1 font-semibold ${text}`}>
                {pact.goalName || "—"}
              </Text>
              {pact.goalDeadline ? (
                <Text className={`mt-1 text-sm ${muted}`}>
                  {t("detail.deadline")}: {pact.goalDeadline}
                </Text>
              ) : null}
            </>
          ) : (
            <Text className={`text-sm ${muted}`}>{getNoGoalPhraseByIndex(locale, noGoalQuoteIndex)}</Text>
          )}
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Flame color="#F97316" size={18} />
              <Text className="ml-1 font-bold text-orange-400">{pact.totalFire}</Text>
            </View>
            <Text className={muted}>
              Streak: {pact.currentStreak} · Cao nhất: {pact.highestStreak}
            </Text>
          </View>
          {(pact.goalDeadline || (pact.targetCount != null && pact.targetCount > 0)) ? (
            <>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
                <View
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${Math.min(progressPct, 100)}%` }}
                />
              </View>
              <Text className={`mt-1 text-xs ${muted}`}>{progressPct}% hoàn thành</Text>
            </>
          ) : (
            <>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
                <InProgressGradientBar seed={pact.id} height={8} widthFraction={0.6} />
              </View>
              <Text className={`mt-1 text-xs ${muted}`}>{t("detail.inProgress")}</Text>
            </>
          )}
        </View>

        <PactCalendar pact={pact} logs={logs} months={2} isDark={isDark} />

        {pact.status === "ACTIVE" && (
          <View className="mb-4 flex-row gap-3">
            <Pressable
              onPress={handleComplete}
              disabled={!canAct}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                canAct ? "bg-green-600" : btnSecondary
              }`}
            >
              <Check color="white" size={18} />
              <Text className="ml-2 font-bold text-white">{t("detail.complete")}</Text>
            </Pressable>
            <Pressable
              onPress={handlePreserve}
              disabled={!canAct}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                canAct ? "bg-blue-600" : btnSecondary
              }`}
            >
              <Shield color="white" size={18} />
              <Text className="ml-2 font-bold text-white">{t("detail.preserve")}</Text>
            </Pressable>
          </View>
        )}

        {pact.status === "ACTIVE" && isScheduledToday && !hasLogToday && (
          <Pressable
            onPress={handleMarkMiss}
            className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 py-2"
          >
            <Text className="text-center text-sm font-medium text-red-400">
              {t("detail.markMiss")}
            </Text>
          </Pressable>
        )}

        <Text className={`mb-2 font-medium ${muted}`}>{t("detail.recentLog")}</Text>
        {logs.length === 0 ? (
          <Text className={`rounded-xl ${card} py-6 text-center ${muted}`}>
            {t("detail.noLog")}
          </Text>
        ) : (
          logs.slice(0, 14).map((log) => (
            <View
              key={log.id}
              className={`mb-2 flex-row items-center justify-between rounded-lg ${card} px-3 py-2`}
            >
              <Text className={muted}>{log.date}</Text>
              <ActionBadge action={log.action} isDark={isDark} />
            </View>
          ))
        )}

        <View className="h-8" />
      </ScrollView>

      <Modal
        visible={evolutionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEvolutionModal(false)}
      >
        <Pressable
          className="flex-1 justify-center bg-black/60 p-4"
          onPress={() => setEvolutionModal(false)}
        >
          <Pressable
            className="rounded-2xl bg-slate-800 p-5"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-2 text-lg font-bold text-white">Đạt 100%!</Text>
            <Text className="mb-4 text-slate-400">
              Bạn muốn lưu trữ hay đặt mục tiêu mới (Tiến hóa)?
            </Text>
            <Pressable
              onPress={handleArchive}
              className="mb-3 rounded-xl bg-green-600 py-3"
            >
              <Text className="text-center font-bold text-white">{t("detail.archive")}</Text>
            </Pressable>
            <View className="mb-3 rounded-xl border border-slate-600 bg-slate-700/50 p-3">
              <Text className="mb-2 text-sm font-medium text-slate-300">{t("detail.evolveNewGoal")}</Text>
              <TextInput
                value={evolveGoalName}
                onChangeText={setEvolveGoalName}
                placeholder="VD: Thi có bằng AWS"
                placeholderTextColor="#64748B"
                className="mb-2 rounded-lg bg-slate-800 px-3 py-2 text-white"
              />
              <Text className="mb-1 text-xs text-slate-400">Hạn chót</Text>
              <DatePickerField
                value={evolveDeadline}
                onChange={setEvolveDeadline}
                placeholder="Chọn ngày"
                className="mb-0"
                isDark={true}
              />
            </View>
            <Pressable onPress={handleEvolve} className="mb-2 rounded-xl bg-orange-500 py-3">
              <Text className="text-center font-bold text-white">{t("detail.evolve")}</Text>
            </Pressable>
            <Pressable
              onPress={() => setEvolutionModal(false)}
              className="rounded-xl bg-slate-600 py-2"
            >
              <Text className="text-center text-slate-300">{t("common.cancel")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
