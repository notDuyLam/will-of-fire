/**
 * Local Push Notifications: quyền, lên lịch nhắc theo ngày đến hạn của Pact, và thông báo thử.
 * Chỉ chạy trên native (Android/iOS); trên web no-op.
 * Expo Go (SDK 53+) không hỗ trợ remote push nên không load expo-notifications khi chạy trong Expo Go.
 */
import { Platform } from "react-native";
import { addDays, format } from "date-fns";
import { getStartDate, getScheduledDatesInRange } from "./calendarRules";
import { getAllActivePacts } from "../db/queries/pactQueries";
import type { Pact } from "../db/schema";

const REMINDER_DAYS_AHEAD = 14;
const DEFAULT_HOUR = 7;
const DEFAULT_MINUTE = 30;

export interface ParsedReminderTime {
  hour: number;
  minute: number;
}

/**
 * Parse "HH:mm" (e.g. "07:30") thành { hour, minute }. Mặc định 07:30 nếu lỗi.
 */
export function parseReminderTime(value: string | null | undefined): ParsedReminderTime {
  if (!value || typeof value !== "string") {
    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  }
  const parts = value.trim().split(":");
  const hour = parseInt(parts[0] ?? "7", 10);
  const minute = parseInt(parts[1] ?? "30", 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  }
  return {
    hour: Math.max(0, Math.min(23, hour)),
    minute: Math.max(0, Math.min(59, minute)),
  };
}

function isWeb(): boolean {
  return Platform.OS === "web";
}

/** Lazy-load expo-notifications; trả về null trên web hoặc trong Expo Go (tránh lỗi push token SDK 53+). */
function getNotifications(): typeof import("expo-notifications") | null {
  if (Platform.OS === "web") return null;
  try {
    const Constants = require("expo-constants").default;
    if (Constants.appOwnership === "expo") return null;
    return require("expo-notifications");
  } catch {
    return null;
  }
}

/**
 * Đăng ký handler hiển thị thông báo khi app đang mở. Gọi từ _layout khi khởi động (chỉ native, không Expo Go).
 */
export function setupNotificationHandler(): void {
  const Notifications = getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Yêu cầu quyền thông báo. Trả về true nếu được cấp (hoặc đã cấp trước đó).
 */
export async function requestPermissionsAsync(): Promise<boolean> {
  if (isWeb()) return false;
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/**
 * Lên lịch một thông báo nhắc cho một ngày đến hạn của pact.
 */
async function schedulePactReminderForDate(
  Notifications: NonNullable<ReturnType<typeof getNotifications>>,
  pact: Pact,
  dateStr: string,
  triggerDate: Date
): Promise<void> {
  const now = new Date();
  if (triggerDate.getTime() <= now.getTime()) return;

  const { hour, minute } = parseReminderTime(pact.reminderTime ?? "07:30");
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, hour, minute, 0, 0);
  if (date.getTime() <= now.getTime()) return;

  const identifier = `pact-${pact.id}-${dateStr}`;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "Will of Fire",
      body: pact.name,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

/**
 * Lên lịch tất cả thông báo nhắc cho các Pact đang active (14 ngày tới, hoặc đến goalDeadline).
 */
export async function schedulePactReminders(): Promise<void> {
  if (isWeb()) return;
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const activePacts = getAllActivePacts();
    const today = format(new Date(), "yyyy-MM-dd");
    const todayDate = new Date();
    const endDefault = addDays(todayDate, REMINDER_DAYS_AHEAD);
    const endDefaultStr = format(endDefault, "yyyy-MM-dd");

    for (const pact of activePacts) {
      const startStr = getStartDate(pact);
      let endStr = endDefaultStr;
      if (pact.goalDeadline) {
        const deadline = pact.goalDeadline.includes("T")
          ? pact.goalDeadline.split("T")[0]!
          : pact.goalDeadline;
        if (deadline < endStr) endStr = deadline;
      }

      const dates = getScheduledDatesInRange(
        pact.frequency,
        startStr,
        endStr,
        pact.frequency === "EVERY_X_DAYS" ? pact.intervalDays ?? undefined : undefined
      );

      for (const dateStr of dates) {
        if (dateStr >= today) {
          const [y, m, d] = dateStr.split("-").map(Number);
          const { hour, minute } = parseReminderTime(pact.reminderTime ?? "07:30");
          const triggerDate = new Date(y, (m ?? 1) - 1, d ?? 1, hour, minute, 0, 0);
          await schedulePactReminderForDate(Notifications, pact, dateStr, triggerDate);
        }
      }
    }
  } catch (e) {
    if (__DEV__) {
      console.warn("[notifications] schedulePactReminders error:", e);
    }
  }
}

/**
 * Gửi một thông báo thử sau vài giây (dùng cho nút Test trong Cài đặt).
 * @param locale - "vi" | "en" để hiển thị title/body đúng ngôn ngữ.
 */
export async function scheduleTestNotification(locale: "vi" | "en" = "vi"): Promise<void> {
  if (isWeb()) return;
  const Notifications = getNotifications();
  if (!Notifications) return;
  try {
    const title = locale === "vi" ? "Will of Fire" : "Will of Fire";
    const body =
      locale === "vi" ? "Thông báo thử nghiệm từ Will of Fire." : "Test notification from Will of Fire.";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
  } catch (e) {
    if (__DEV__) {
      console.warn("[notifications] scheduleTestNotification error:", e);
    }
    throw e;
  }
}
