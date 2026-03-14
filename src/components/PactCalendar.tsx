import { View, Text } from "react-native";
import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  subMonths,
} from "date-fns";
import type { PactLog } from "../db/schema";
import { isScheduledOn, getStartDate } from "../utils/calendarRules";
import type { Pact } from "../db/schema";
import { useTranslation } from "../i18n/context";
import { GoalDayPulse } from "./GoalDayPulse";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

interface PactCalendarProps {
  pact: Pact;
  logs: PactLog[];
  /** Số tháng hiển thị (1 = chỉ tháng hiện tại) */
  months?: number;
  /** Light/dark */
  isDark?: boolean;
}

export function PactCalendar({ pact, logs, months = 2, isDark = true }: PactCalendarProps) {
  const { t } = useTranslation();
  const logByDate = useMemo(() => {
    const m: Record<string, "COMPLETE" | "PRESERVE" | "MISS"> = {};
    logs.forEach((l) => {
      m[l.date] = l.action as "COMPLETE" | "PRESERVE" | "MISS";
    });
    return m;
  }, [logs]);

  const start = getStartDate(pact);
  const goalDeadlineStr = pact.goalDeadline
    ? (pact.goalDeadline.includes("T") ? pact.goalDeadline.split("T")[0]! : pact.goalDeadline)
    : null;
  const opts = {
    scheduleStartDate: pact.scheduleStartDate,
    createdAt: pact.createdAt,
    intervalDays: pact.intervalDays,
    goalDeadline: goalDeadlineStr,
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const monthStarts = useMemo(() => {
    const arr: Date[] = [];
    const now = new Date();
    for (let i = 0; i < months; i++) {
      arr.push(subMonths(now, months - 1 - i));
    }
    return arr;
  }, [months]);

  const cellBg = (dateStr: string, action: string | undefined) => {
    if (action === "COMPLETE") return "bg-green-500";
    if (action === "PRESERVE") return "bg-blue-500";
    if (action === "MISS") return "bg-red-500";
    if (isScheduledOn(pact.frequency, dateStr, opts)) return isDark ? "bg-slate-700" : "bg-slate-200";
    return "bg-transparent";
  };

  const isGoalDay = (dateStr: string) => goalDeadlineStr !== null && dateStr === goalDeadlineStr;

  return (
    <View className="mb-4">
      <Text className={`mb-2 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {t("calendar.title")}
      </Text>
      {monthStarts.map((monthStart) => {
        const startDate = startOfMonth(monthStart);
        const endDate = endOfMonth(monthStart);
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const firstDow = getDay(startDate);
        const padding = Array(firstDow).fill(null);

        return (
          <View key={monthStart.toISOString()} className="mb-3">
            <Text className={`mb-1 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {format(monthStart, "MM/yyyy")}
            </Text>
            <View className="flex-row flex-wrap">
              {WEEKDAYS.map((w) => (
                <View
                  key={w}
                  className="w-[14.28%] items-center pb-1"
                  style={{ minWidth: "14.28%" }}
                >
                  <Text className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {w}
                  </Text>
                </View>
              ))}
              {padding.map((_, i) => (
                <View key={`pad-${i}`} className="w-[14.28%] aspect-square p-0.5" />
              ))}
              {days.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const action = logByDate[dateStr];
                const isToday = dateStr === today;
                return (
                  <View
                    key={dateStr}
                    className="w-[14.28%] aspect-square p-0.5"
                    style={{ minWidth: "14.28%" }}
                  >
                    <GoalDayPulse pulse={isGoalDay(dateStr) && !action}>
                      <View
                        className={`h-full w-full items-center justify-center rounded ${cellBg(
                          dateStr,
                          action
                        )} ${isToday ? "ring-1 ring-orange-400" : ""} ${
                          isGoalDay(dateStr) ? "ring-2 ring-amber-400" : ""
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-medium ${
                            action ? "text-white" : isDark ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {format(d, "d")}
                        </Text>
                      </View>
                    </GoalDayPulse>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
      <View className="mt-2 flex-row flex-wrap gap-3">
        <View className="flex-row items-center">
          <View className="h-3 w-3 rounded bg-green-500" />
          <Text className={`ml-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t("calendar.complete")}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="h-3 w-3 rounded bg-blue-500" />
          <Text className={`ml-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t("calendar.preserve")}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="h-3 w-3 rounded bg-red-500" />
          <Text className={`ml-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {t("calendar.miss")}
          </Text>
        </View>
        {goalDeadlineStr ? (
          <View className="flex-row items-center">
            <View className="h-3 w-3 rounded border-2 border-amber-400 bg-transparent" />
            <Text className={`ml-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t("calendar.goal")}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
