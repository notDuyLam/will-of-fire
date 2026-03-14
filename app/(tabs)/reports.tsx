import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { runSeed } from "../../src/db/seed";
import { usePactStore } from "../../src/store/usePactStore";
import {
  Flame,
  Trophy,
  Target,
  TrendingUp,
  AlertCircle,
  Clock,
  BarChart3,
} from "lucide-react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { subDays, format } from "date-fns";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useTranslation } from "../../src/i18n/context";
import { getReportsData } from "../../src/features/reports/reportsData";
import { computeWillIndex } from "../../src/features/reports/willIndex";
import { getEncouragementForScore } from "../../src/features/reports/encouragementQuotes";
import type { Pact } from "../../src/db/schema";
import type {
  ReportsData as ReportsDataT,
  PactLogStats,
} from "../../src/features/reports/reportsData";
import {
  ConfirmModal,
  type ConfirmModalButton,
} from "../../src/components/ConfirmModal";

function getPactName(pacts: Pact[], pactId: string): string {
  return pacts.find((p) => p.id === pactId)?.name ?? pactId.slice(0, 8);
}

function formatAchievedAt(achievedAt: string): string {
  const d = new Date(achievedAt);
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReportsScreen() {
  const { isDark } = useTheme();
  const { t, locale } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [data, setData] = useState<ReportsDataT | null>(null);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [fireRange, setFireRange] = useState<"7d" | "30d">("7d");
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: ConfirmModalButton[];
  }>({ visible: false, title: "", message: "", buttons: [] });
  const chartWidth = Math.max(280, screenWidth - 72);

  useFocusEffect(
    useCallback(() => {
      try {
        setData(getReportsData());
      } catch {
        setData(null);
      }
    }, []),
  );

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark ? "bg-slate-800" : "bg-white border border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const achievement = isDark
    ? "bg-emerald-600/15 border border-emerald-400/40"
    : "bg-emerald-50 border border-emerald-300";
  const accent = "text-orange-400";
  const yAxisColor = isDark ? "#FFFFFF" : "#000000";
  const xAxisColor = isDark ? "#FFFFFF" : "#000000";
  if (!data) {
    return (
      <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className={`text-center ${muted}`}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasAnyPacts = data.allPacts.length > 0;
  if (!hasAnyPacts) {
    return (
      <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
        <ScrollView className="flex-1 px-4 pt-4">
          <View className="mb-6 flex-row items-center">
            <BarChart3 color="#F97316" size={28} />
            <Text className={`ml-2 text-2xl font-bold ${text}`}>
              {t("reports.title")}
            </Text>
          </View>
          <View
            className={`rounded-2xl ${card} p-6 items-center justify-center min-h-[200px]`}
          >
            <Flame color="#F97316" size={48} />
            <Text className={`mt-4 text-center ${muted}`}>
              {t("reports.empty")}
            </Text>
            <Pressable
              onPress={() => {
                try {
                  const r = runSeed();
                  usePactStore.getState().fetchActivePacts();
                  setData(getReportsData());
                  setConfirmModal({
                    visible: true,
                    title: "Seed xong",
                    message: `Đã thêm: ${r.pactsCreated} pact, ${r.logsCreated} log, ${r.milestonesCreated} milestone. Chỉ có hiệu lực trên Android/iOS (web không lưu DB).`,
                    buttons: [{ text: t("common.ok") }],
                  });
                } catch (e) {
                  setConfirmModal({
                    visible: true,
                    title: "Lỗi",
                    message: e instanceof Error ? e.message : "Seed thất bại",
                    buttons: [{ text: t("common.ok") }],
                  });
                }
              }}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2"
            >
              <Text className="font-semibold text-white">Seed data (test)</Text>
            </Pressable>
          </View>
        </ScrollView>
        <ConfirmModal
          visible={confirmModal.visible}
          title={confirmModal.title}
          message={confirmModal.message}
          buttons={confirmModal.buttons}
          onRequestClose={() =>
            setConfirmModal((m) => ({ ...m, visible: false }))
          }
          isDark={isDark}
        />
      </SafeAreaView>
    );
  }

  const indexResult = computeWillIndex(data);
  const score = indexResult.score;
  const encouragement = getEncouragementForScore(score, locale as "vi" | "en");

  const goalsAchievedCount =
    data.recentMilestones.length + data.completedPacts.length;
  const totalActions =
    data.actionCounts.complete +
    data.actionCounts.preserve +
    data.actionCounts.miss;

  const mostProductive: PactLogStats[] = [...data.pactLogStats]
    .filter((s) => s.total > 0)
    .sort((a, b) => b.complete - a.complete)
    .slice(0, 5);
  const needAttention: PactLogStats[] = [...data.pactLogStats]
    .filter((s) => s.miss > 0)
    .sort((a, b) => b.miss - a.miss)
    .slice(0, 5);
  const mostDelayed: PactLogStats[] = [...data.pactLogStats]
    .filter((s) => s.preserve > 0)
    .sort((a, b) => b.preserve - a.preserve)
    .slice(0, 5);

  const buildFireSeries = (days: number) => {
    const today = new Date();
    const labels: { date: string; fire: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const ds = format(d, "yyyy-MM-dd");
      labels.push({ date: ds, fire: 0 });
    }
    data.allLogs.forEach((log) => {
      if (!log.fireEarned) return;
      const idx = labels.findIndex((l) => l.date === log.date);
      if (idx >= 0) {
        labels[idx]!.fire += log.fireEarned ?? 0;
      }
    });
    return labels.map((l, index) => {
      const baseLabel = format(new Date(l.date), "d/M");
      const showLabel = days === 30 ? index % 3 === 0 : true;
      return {
        value: l.fire,
        label: showLabel ? baseLabel : "",
        labelTextStyle: {
          // color: isDark ? "#CBD5F5" : "#64748B",
          color: isDark ? "#FFFFFF" : "#000000",

          fontSize: days === 30 ? 8 : 10,
        },
        frontColor: ["#F97316", "#fb923c", "#facc15", "#22c55e", "#3b82f6"][
          index % 5
        ],
      };
    });
  };

  const fireSeries = buildFireSeries(fireRange === "7d" ? 7 : 30);
  const maxFire = Math.max(1, ...fireSeries.map((d) => d.value));

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center">
          <BarChart3 color="#F97316" size={28} />
          <Text className={`ml-2 text-2xl font-bold ${text}`}>
            {t("reports.title")}
          </Text>
        </View>

        {/* Hero: Chỉ số Ý chí + Quote */}
        <View className={`mb-4 rounded-2xl ${card} p-5`}>
          <View className="flex-row items-center justify-between">
            <Text className={`text-sm font-medium ${muted}`}>
              {t("reports.willIndex")}
            </Text>
            <Pressable onPress={() => setShowIndexModal(true)} hitSlop={8}>
              <Text className={`text-xs font-semibold ${accent}`}>
                Xem cách tính
              </Text>
            </Pressable>
          </View>
          <Text className={`mt-1 text-4xl font-bold ${accent}`}>{score}</Text>
          <View className="mt-3 rounded-xl bg-slate-700/30 p-3">
            <Text className={`text-sm ${text}`}>{encouragement.message}</Text>
            {encouragement.author ? (
              <Text className={`mt-1 text-xs ${muted}`}>
                — {encouragement.author}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Tổng Lửa */}
        <View className={`mb-4 rounded-2xl ${card} p-5`}>
          <View className="flex-row items-center">
            <Flame color="#F97316" size={24} />
            <Text className={`ml-2 text-lg font-bold ${text}`}>
              {t("reports.totalFire")}
            </Text>
          </View>
          <Text className={`mt-2 text-3xl font-bold ${accent}`}>
            {data.totalFire}
          </Text>
          <View className="mt-3 flex-row gap-3">
            <View
              className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <Text className={`text-xs ${muted}`}>
                {t("reports.fireThisWeek")}
              </Text>
              <Text className={`text-base font-semibold ${text}`}>
                {data.fireLast7Days}
              </Text>
            </View>
            <View
              className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <Text className={`text-xs ${muted}`}>
                {t("reports.fireThisMonth")}
              </Text>
              <Text className={`text-base font-semibold ${text}`}>
                {data.fireLast30Days}
              </Text>
            </View>
          </View>
        </View>

        {/* Thành tựu Goal (nổi bật) */}
        <View className={`mb-4 rounded-2xl ${achievement} p-5 shadow-sm`}>
          <View className="flex-row items-center">
            <Trophy color={isDark ? "#4ADE80" : "#16A34A"} size={28} />
            <Text className={`ml-2 text-xl font-bold ${text}`}>
              {t("reports.goalsAchieved")}
            </Text>
          </View>
          <Text
            className={`mt-3 text-4xl font-bold ${isDark ? "text-emerald-300" : "text-emerald-600"}`}
          >
            {goalsAchievedCount}
          </Text>
          {data.recentMilestones.length > 0 ||
          data.completedPacts.length > 0 ? (
            <View className="mt-4 gap-3">
              {data.recentMilestones.slice(0, 3).map((m) => (
                <View
                  key={m.id}
                  className={`rounded-xl p-3 ${
                    isDark
                      ? "bg-emerald-500/15 border border-emerald-400/30"
                      : "bg-emerald-100 border border-emerald-300"
                  }`}
                >
                  <Text className={`font-semibold ${text}`} numberOfLines={1}>
                    {m.goalName}
                  </Text>
                  <Text className={`mt-0.5 text-xs ${muted}`}>
                    {formatAchievedAt(m.achievedAt)}
                  </Text>
                </View>
              ))}
              {data.completedPacts.slice(0, 2).map((p) => (
                <View
                  key={p.id}
                  className={`rounded-xl p-3 ${
                    isDark
                      ? "bg-emerald-500/15 border border-emerald-400/30"
                      : "bg-emerald-100 border border-emerald-300"
                  }`}
                >
                  <Text className={`font-semibold ${text}`} numberOfLines={1}>
                    {p.goalName || p.name}
                  </Text>
                  <Text className={`mt-0.5 text-xs ${muted}`}>Completed</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className={`mt-2 text-sm ${muted}`}>
              {t("reports.noGoalsYet")}
            </Text>
          )}
        </View>

        {/* Goal sắp tới */}
        <View className={`mb-4 rounded-2xl ${card} p-5`}>
          <View className="flex-row items-center">
            <Target color="#F97316" size={20} />
            <Text className={`ml-2 font-bold ${text}`}>
              {t("reports.upcomingGoals")}
            </Text>
          </View>
          {data.upcomingGoals.length > 0 ? (
            <View className="mt-2 gap-2">
              {data.upcomingGoals.map((p) => (
                <View
                  key={p.id}
                  className={`flex-row justify-between rounded-lg p-2 ${
                    isDark ? "bg-slate-700/30" : "bg-slate-100"
                  }`}
                >
                  <Text className={`flex-1 ${text}`} numberOfLines={1}>
                    {p.goalName || p.name}
                  </Text>
                  <Text className={`text-sm ${muted}`}>
                    {p.goalDeadline ?? ""}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className={`mt-2 text-sm ${muted}`}>
              {t("reports.noUpcoming")}
            </Text>
          )}
        </View>

        {/* Pact năng suất nhất */}
        {mostProductive.length > 0 && (
          <View className={`mb-4 rounded-2xl ${card} p-5`}>
            <View className="flex-row items-center">
              <TrendingUp color="#22C55E" size={20} />
              <Text className={`ml-2 font-bold ${text}`}>
                {t("reports.mostProductive")}
              </Text>
            </View>
            <View className="mt-2 gap-2">
              {mostProductive.map((s) => (
                <View
                  key={s.pactId}
                  className={`flex-row justify-between rounded-lg px-3 py-2 ${
                    isDark ? "bg-slate-700/20" : "bg-slate-100"
                  }`}
                >
                  <Text className={`flex-1 ${text}`} numberOfLines={1}>
                    {getPactName(data.allPacts, s.pactId)}
                  </Text>
                  <Text className={`text-sm font-semibold text-green-500`}>
                    {s.complete} ✓
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cần cải thiện (miss nhiều) */}
        {needAttention.length > 0 && (
          <View className={`mb-4 rounded-2xl ${card} p-5`}>
            <View className="flex-row items-center">
              <AlertCircle color="#EF4444" size={20} />
              <Text className={`ml-2 font-bold ${text}`}>
                {t("reports.needAttention")}
              </Text>
            </View>
            <View className="mt-2 gap-2">
              {needAttention.map((s) => (
                <View
                  key={s.pactId}
                  className={`flex-row justify-between rounded-lg px-3 py-2 ${
                    isDark ? "bg-slate-700/20" : "bg-slate-100"
                  }`}
                >
                  <Text className={`flex-1 ${text}`} numberOfLines={1}>
                    {getPactName(data.allPacts, s.pactId)}
                  </Text>
                  <Text className="text-sm font-semibold text-red-400">
                    {s.miss} miss
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Trì hoãn nhiều nhất */}
        {mostDelayed.length > 0 && (
          <View className={`mb-4 rounded-2xl ${card} p-5`}>
            <View className="flex-row items-center">
              <Clock color="#F59E0B" size={20} />
              <Text className={`ml-2 font-bold ${text}`}>
                {t("reports.mostDelayed")}
              </Text>
            </View>
            <View className="mt-2 gap-2">
              {mostDelayed.map((s) => (
                <View
                  key={s.pactId}
                  className={`flex-row justify-between rounded-lg px-3 py-2 ${
                    isDark ? "bg-slate-700/20" : "bg-slate-100"
                  }`}
                >
                  <Text className={`flex-1 ${text}`} numberOfLines={1}>
                    {getPactName(data.allPacts, s.pactId)}
                  </Text>
                  <Text className={`text-sm font-semibold text-blue-400`}>
                    {s.preserve} preserve
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Biểu đồ Lửa theo thời gian */}
        <View className={`mb-4 rounded-2xl ${card} p-5`}>
          <View className="flex-row items-center justify-between">
            <Text className={`font-bold ${text}`}>
              {t("reports.chartFirePerWeek")}
            </Text>
            <View
              className={`flex-row rounded-full p-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
            >
              <Pressable
                onPress={() => setFireRange("7d")}
                className={`px-3 py-1 rounded-full ${
                  fireRange === "7d"
                    ? isDark
                      ? "bg-slate-700"
                      : "bg-white"
                    : ""
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    fireRange === "7d" ? text : muted
                  }`}
                >
                  7 ngày
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFireRange("30d")}
                className={`px-3 py-1 rounded-full ${
                  fireRange === "30d"
                    ? isDark
                      ? "bg-slate-700"
                      : "bg-white"
                    : ""
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    fireRange === "30d" ? text : muted
                  }`}
                >
                  30 ngày
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="mt-3 overflow-hidden h-auto">
            <BarChart
              data={fireSeries}
              barWidth={22}
              spacing={10}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              noOfSections={4}
              maxValue={maxFire > 0 ? Math.ceil(maxFire * 1.2) : 10}
              width={chartWidth}
              height={160}
              barBorderRadius={4}
              yAxisColor={yAxisColor}
              yAxisTextStyle={{ color: yAxisColor, fontSize: 10 }}
              xAxisColor={xAxisColor}
            />
          </View>
        </View>

        {/* Phân bố hành động */}
        <View className={`mb-4 rounded-2xl ${card} p-5`}>
          <Text className={`font-bold ${text}`}>
            {t("reports.actionBreakdown")}
          </Text>
          {totalActions > 0 ? (
            <View className="mt-3 items-center">
              <PieChart
                data={[
                  {
                    value: data.actionCounts.complete,
                    color: "#22C55E",
                    text: String(data.actionCounts.complete),
                  },
                  {
                    value: data.actionCounts.preserve,
                    color: "#3B82F6",
                    text: String(data.actionCounts.preserve),
                  },
                  {
                    value: data.actionCounts.miss,
                    color: "#EF4444",
                    text: String(data.actionCounts.miss),
                  },
                ].filter((d) => d.value > 0)}
                donut
                radius={80}
                innerRadius={46}
                centerLabelComponent={() => (
                  <View
                    className={`items-center justify-center rounded-full px-3 py-2 ${
                      isDark ? "bg-slate-900" : "bg-slate-100"
                    }`}
                  >
                    <Text className={`text-base font-bold ${text}`}>
                      {totalActions}
                    </Text>
                  </View>
                )}
                showText
                textColor={isDark ? "#F8FAFC" : "#0f172a"}
                textSize={11}
              />
              <View className="mt-2 flex-row gap-4">
                <View className="flex-row items-center">
                  <View className="h-3 w-3 rounded-full bg-green-500" />
                  <Text className={`ml-1 text-sm ${muted}`}>
                    {t("reports.complete")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="h-3 w-3 rounded-full bg-blue-500" />
                  <Text className={`ml-1 text-sm ${muted}`}>
                    {t("reports.preserve")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="h-3 w-3 rounded-full bg-red-500" />
                  <Text className={`ml-1 text-sm ${muted}`}>
                    {t("reports.miss")}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="mt-3 flex-row gap-4">
              <View className="flex-1 items-center rounded-xl bg-green-500/20 py-3">
                <Text className="text-2xl font-bold text-green-400">0</Text>
                <Text className={`text-xs ${muted}`}>
                  {t("reports.complete")}
                </Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-blue-500/20 py-3">
                <Text className="text-2xl font-bold text-blue-400">0</Text>
                <Text className={`text-xs ${muted}`}>
                  {t("reports.preserve")}
                </Text>
              </View>
              <View className="flex-1 items-center rounded-xl bg-red-500/20 py-3">
                <Text className="text-2xl font-bold text-red-400">0</Text>
                <Text className={`text-xs ${muted}`}>{t("reports.miss")}</Text>
              </View>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => {
            try {
              const r = runSeed();
              usePactStore.getState().fetchActivePacts();
              setData(getReportsData());
              setConfirmModal({
                visible: true,
                title: "Seed xong",
                message: `Đã thêm: ${r.pactsCreated} pact, ${r.logsCreated} log, ${r.milestonesCreated} milestone.`,
                buttons: [{ text: t("common.ok") }],
              });
            } catch (e) {
              setConfirmModal({
                visible: true,
                title: "Lỗi",
                message: e instanceof Error ? e.message : "Seed thất bại",
                buttons: [{ text: t("common.ok") }],
              });
            }
          }}
          className={`mb-4 rounded-xl border border-dashed border-orange-500/50 py-3 ${card}`}
        >
          <Text className={`text-center text-sm font-medium ${muted}`}>
            + Seed thêm data (test)
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>

      <Modal
        visible={showIndexModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIndexModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 px-4 justify-center"
          onPress={() => setShowIndexModal(false)}
        >
          <Pressable
            className={`max-h-[70%] rounded-2xl p-4 ${isDark ? "bg-slate-900" : "bg-white"}`}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className={`mb-2 text-base font-bold ${text}`}>
              Cách tính Chỉ số Ý chí
            </Text>
            <ScrollView className="mb-3">
              <Text className={`mb-1 text-sm ${muted}`}>
                Tổng điểm hiện tại:{" "}
                <Text className={`font-semibold ${text}`}>{score}</Text>/100
              </Text>
              <Text className={`mt-2 text-xs ${muted}`}>
                • Số Khế Ước đã tạo: {data.allPacts.length}
              </Text>
              <Text className={`text-xs ${muted}`}>
                → Đóng góp:{" "}
                <Text className="font-semibold text-emerald-400">
                  {(indexResult.components?.pactCount ?? 0).toFixed(1)} điểm
                </Text>
              </Text>

              <Text className={`mt-2 text-xs ${muted}`}>
                • Tỉ lệ Khế Ước hoàn thành goal:{" "}
                {(() => {
                  const completed = data.completedPacts.length;
                  const failed = data.failedPacts.length;
                  const activeCount = data.activePacts.length;
                  const base = completed + failed + activeCount;
                  const rate = base > 0 ? (completed / base) * 100 : 0;
                  return `${completed}/${base} \u2248 ${rate.toFixed(1)}%`;
                })()}
              </Text>
              <Text className={`text-xs ${muted}`}>
                → Đóng góp:{" "}
                <Text className="font-semibold text-emerald-400">
                  {(indexResult.components?.completionRate ?? 0).toFixed(1)}{" "}
                  điểm
                </Text>
              </Text>

              <Text className={`mt-2 text-xs ${muted}`}>
                • Khế Ước đang chạy: {data.activePacts.length}
              </Text>
              <Text className={`text-xs ${muted}`}>
                → Đóng góp:{" "}
                <Text className="font-semibold text-emerald-400">
                  {(indexResult.components?.activeCount ?? 0).toFixed(1)} điểm
                </Text>
              </Text>

              <Text className={`mt-2 text-xs ${muted}`}>
                • Độ kỷ luật trung bình (tỉ lệ COMPLETE trong từng pact):{" "}
                {(() => {
                  let sum = 0;
                  let count = 0;
                  data.pactLogStats.forEach((s) => {
                    if (s.total > 0) {
                      sum += s.complete / s.total;
                      count += 1;
                    }
                  });
                  const pct = count > 0 ? (sum / count) * 100 : 0;
                  return `${pct.toFixed(1)}%`;
                })()}
              </Text>
              <Text className={`text-xs ${muted}`}>
                → Đóng góp:{" "}
                <Text className="font-semibold text-emerald-400">
                  {(indexResult.components?.disciplineAvg ?? 0).toFixed(1)} điểm
                </Text>
              </Text>

              <Text className={`mt-2 text-xs ${muted}`}>
                • Lửa 30 ngày gần nhất: {data.fireLast30Days}
              </Text>
              <Text className={`text-xs ${muted}`}>
                → Đóng góp:{" "}
                <Text className="font-semibold text-emerald-400">
                  {(indexResult.components?.recentFireScore ?? 0).toFixed(1)}{" "}
                  điểm
                </Text>
              </Text>

              <Text className={`mt-2 text-xs ${muted}`}>
                • Miss & Failed: {data.actionCounts.miss} Miss,{" "}
                {data.failedPacts.length} Failed
              </Text>
              <Text className={`text-xs ${muted}`}>
                → Điểm trừ:{" "}
                <Text className="font-semibold text-red-400">
                  {(indexResult.components?.penalty ?? 0).toFixed(1)} điểm
                </Text>
              </Text>
            </ScrollView>

            <Pressable
              onPress={() => setShowIndexModal(false)}
              className={`mt-1 rounded-xl px-3 py-2 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
            >
              <Text className={`text-center text-sm font-medium ${text}`}>
                {t("common.back")}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        buttons={confirmModal.buttons}
        onRequestClose={() =>
          setConfirmModal((m) => ({ ...m, visible: false }))
        }
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
