import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Plus } from "lucide-react-native";
import { getPactById, updatePact } from "../../src/db/queries";
import { usePactStore } from "../../src/store/usePactStore";
import { DEFAULTS } from "../../src/constants";
import { useTranslation } from "../../src/i18n/context";
import { useTheme } from "../../src/contexts/ThemeContext";
import { DatePickerField } from "../../src/components/DatePickerField";
import { TimePickerField } from "../../src/components/TimePickerField";
import { PACT_FREQUENCIES, type PactFrequency } from "../../src/db/schema";
import { ConfirmModal } from "../../src/components/ConfirmModal";

const FREQUENCY_OPTIONS: {
  value: PactFrequency;
  labelKey: string;
  needsStart?: boolean;
  needsInterval?: boolean;
}[] = [
  { value: "DAILY", labelKey: "frequency.daily" },
  { value: "EVERY_2_DAYS", labelKey: "frequency.every2", needsStart: true },
  { value: "EVERY_3_DAYS", labelKey: "frequency.every3", needsStart: true },
  {
    value: "EVERY_X_DAYS",
    labelKey: "frequency.everyX",
    needsStart: true,
    needsInterval: true,
  },
  { value: "WEEKLY", labelKey: "frequency.weekly", needsStart: true },
  { value: "MONTHLY", labelKey: "frequency.monthly", needsStart: true },
];

export default function EditPactScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<PactFrequency>("DAILY");
  const [intervalDaysStr, setIntervalDaysStr] = useState("");
  const [goalName, setGoalName] = useState("");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [scheduleStart, setScheduleStart] = useState<string | null>(null);
  const [reminderTime, setReminderTime] = useState(DEFAULTS.REMINDER_TIME);
  const [goalSectionExpanded, setGoalSectionExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: {
      text: string;
      onPress?: () => void;
      style?: "cancel" | "destructive" | "default";
    }[];
  }>({ visible: false, title: "", message: "", buttons: [] });

  useEffect(() => {
    if (!id) return;
    const pact = getPactById(id);
    if (pact) {
      setName(pact.name);
      setDescription(pact.description ?? "");
      setFrequency(pact.frequency as PactFrequency);
      setIntervalDaysStr(
        pact.intervalDays != null ? String(pact.intervalDays) : "",
      );
      setGoalName(pact.goalName ?? "");
      setDeadline(pact.goalDeadline ?? null);
      setScheduleStart(pact.scheduleStartDate ?? null);
      setReminderTime(pact.reminderTime ?? DEFAULTS.REMINDER_TIME);
      const hasGoal =
        (pact.goalName ?? "").trim() !== "" || pact.goalDeadline != null;
      setGoalSectionExpanded(hasGoal);
    }
    setLoaded(true);
  }, [id]);

  const intervalDays =
    frequency === "EVERY_X_DAYS" ? parseInt(intervalDaysStr, 10) : null;
  const needsStart =
    FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.needsStart ?? false;
  const needsInterval =
    FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.needsInterval ??
    false;

  const isValid =
    loaded &&
    name.trim().length > 0 &&
    (!needsStart || !!scheduleStart) &&
    (!needsInterval || (intervalDays != null && intervalDays >= 1));

  const handleSubmit = () => {
    if (!id || !isValid || submitting) return;
    setSubmitting(true);
    try {
      updatePact(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        intervalDays: frequency === "EVERY_X_DAYS" ? intervalDays! : undefined,
        scheduleStartDate: scheduleStart ?? undefined,
        goalName: goalName.trim() || undefined,
        goalDeadline: deadline ?? undefined,
        reminderTime: reminderTime || DEFAULTS.REMINDER_TIME,
      });
      usePactStore.getState().fetchActivePacts();
      router.back();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setModal({
        visible: true,
        title: t("common.error"),
        message: msg,
        buttons: [{ text: t("common.ok") }],
      });
    } finally {
      setSubmitting(false);
    }
  };

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark
    ? "bg-slate-800 border-slate-600"
    : "bg-white border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const btnPrimary = "bg-orange-500";
  const btnSecondary = isDark ? "bg-slate-700" : "bg-slate-200";

  if (!id) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${bg}`}>
        <Text className={muted}>{t("common.error")}</Text>
        <Pressable
          onPress={() => router.back()}
          className={`mt-4 rounded-lg ${btnSecondary} px-4 py-2`}
        >
          <Text className={text}>{t("common.back")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loaded && !getPactById(id)) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${bg}`}>
        <Text className={muted}>Không tìm thấy Khế Ước</Text>
        <Pressable
          onPress={() => router.back()}
          className={`mt-4 rounded-lg ${btnSecondary} px-4 py-2`}
        >
          <Text className={text}>{t("common.back")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-4 flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 p-1"
              hitSlop={8}
            >
              <ChevronLeft color={isDark ? "#F8FAFC" : "#0f172a"} size={24} />
            </Pressable>
            <Text className={`text-xl font-bold ${text}`}>
              {t("pact.editTitle")}
            </Text>
          </View>

          <Text className={`mb-1 text-sm font-medium ${muted}`}>
            {t("pact.name")} *
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("pact.namePlaceholder")}
            placeholderTextColor="#64748B"
            className={`mb-4 rounded-xl border ${card} px-4 py-3 ${text}`}
          />

          <Text className={`mb-1 text-sm font-medium ${muted}`}>
            {t("pact.description")}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t("pact.descriptionOptional")}
            placeholderTextColor="#64748B"
            className={`mb-4 rounded-xl border ${card} px-4 py-3 ${text}`}
            multiline
          />

          <Text className={`mb-1 text-sm font-medium ${muted}`}>
            {t("pact.frequency")} *
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setFrequency(opt.value)}
                className={`rounded-lg px-3 py-2 ${frequency === opt.value ? btnPrimary : btnSecondary}`}
              >
                <Text
                  className={`text-sm font-medium ${frequency === opt.value ? "text-white" : muted}`}
                >
                  {t(opt.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>

          {needsInterval && (
            <>
              <Text className={`mb-1 text-sm font-medium ${muted}`}>
                {t("pact.everyXDays")} *
              </Text>
              <TextInput
                value={intervalDaysStr}
                onChangeText={setIntervalDaysStr}
                placeholder={t("pact.intervalPlaceholder")}
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                className={`mb-4 rounded-xl border ${card} px-4 py-3 ${text}`}
              />
            </>
          )}

          {needsStart && (
            <>
              <Text className={`mb-1 text-sm font-medium ${muted}`}>
                {t("pact.scheduleStart")} *
              </Text>
              <DatePickerField
                value={scheduleStart}
                onChange={setScheduleStart}
                placeholder={t("pact.deadlinePlaceholder")}
                className="mb-4"
                isDark={isDark}
              />
            </>
          )}

          <Text className={`mb-1 text-sm font-medium ${muted}`}>
            {t("pact.reminderTime")}
          </Text>
          <TimePickerField
            value={reminderTime}
            onChange={setReminderTime}
            placeholder="07:30"
            className="mb-4"
            isDark={isDark}
          />

          <Text className={`mb-1 text-xs ${muted}`}>
            {t("pact.editGoalHint")}
          </Text>
          {!goalSectionExpanded ? (
            <Pressable
              onPress={() => setGoalSectionExpanded(true)}
              className={`mb-4 flex-row items-center justify-center rounded-xl border border-dashed ${card} py-3`}
            >
              <Plus color={isDark ? "#94a3b8" : "#64748b"} size={18} />
              <Text className={`ml-2 text-sm font-medium ${muted}`}>
                {t("pact.addGoal")}
              </Text>
            </Pressable>
          ) : (
            <>
              <Text className={`mb-1 mt-2 text-sm font-medium ${muted}`}>
                {t("pact.goal")}
              </Text>
              <TextInput
                value={goalName}
                onChangeText={setGoalName}
                placeholder={
                  t("pact.goalPlaceholder") + " " + t("common.optionalSuffix")
                }
                placeholderTextColor="#64748B"
                className={`mb-4 rounded-xl border ${card} px-4 py-3 ${text}`}
              />
              <Text className={`mb-1 text-sm font-medium ${muted}`}>
                {t("pact.deadline")}
              </Text>
              <DatePickerField
                value={deadline}
                onChange={setDeadline}
                placeholder={t("pact.deadlinePlaceholder")}
                className="mb-6"
                isDark={isDark}
              />
            </>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            className={`rounded-xl py-3 ${isValid && !submitting ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center font-bold ${isValid && !submitting ? "text-white" : muted}`}
            >
              {submitting ? t("common.loading") : t("common.save")}
            </Text>
          </Pressable>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={modal.buttons}
        onRequestClose={() => setModal((m) => ({ ...m, visible: false }))}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
