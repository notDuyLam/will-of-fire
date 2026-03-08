import {
  getDay,
  parseISO,
  differenceInDays,
  addDays,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";
import type { Pact } from "../db/schema";

const WEEKDAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

function getStartDate(pact: Pick<Pact, "scheduleStartDate" | "createdAt">): string {
  const start = pact.scheduleStartDate ?? pact.createdAt;
  if (!start) return format(new Date(), "yyyy-MM-dd");
  return start.includes("T") ? start.split("T")[0]! : start;
}

/**
 * Kiểm tra ngày đã cho có phải ngày đến hạn theo frequency và schedule_start_date.
 * - DAILY: mọi ngày từ start.
 * - EVERY_2_DAYS / EVERY_3_DAYS: start, start+2, start+3, ...
 * - EVERY_X_DAYS: dùng pact.intervalDays.
 * - WEEKLY: cùng ngày trong tuần với start (mỗi 7 ngày).
 * - MONTHLY: cùng ngày trong tháng với start.
 */
export function isScheduledOn(
  frequency: string,
  date: string,
  opts: {
    scheduleStartDate?: string | null;
    createdAt?: string | null;
    intervalDays?: number | null;
    /** Nếu có, ngày sau goalDeadline không còn được coi là scheduled */
    goalDeadline?: string | null;
  } = {}
): boolean {
  const dateParsed = parseISO(date);
  if (opts.goalDeadline) {
    const deadline = parseISO(opts.goalDeadline.includes("T") ? opts.goalDeadline.split("T")[0]! : opts.goalDeadline);
    if (isAfter(dateParsed, deadline)) return false;
  }

  const startStr = opts.scheduleStartDate ?? opts.createdAt;
  const start = startStr ? (startStr.includes("T") ? startStr.split("T")[0]! : startStr) : null;
  const intervalDays = opts.intervalDays ?? 0;

  if (frequency === "DAILY") {
    if (!start) return true;
    const d = parseISO(date);
    const s = parseISO(start);
    return !isBefore(d, s);
  }

  if (frequency === "EVERY_2_DAYS") {
    if (!start) return false;
    const d = parseISO(date);
    const s = parseISO(start);
    const diff = differenceInDays(d, s);
    return diff >= 0 && diff % 2 === 0;
  }

  if (frequency === "EVERY_3_DAYS") {
    if (!start) return false;
    const d = parseISO(date);
    const s = parseISO(start);
    const diff = differenceInDays(d, s);
    return diff >= 0 && diff % 3 === 0;
  }

  if (frequency === "EVERY_X_DAYS") {
    const n = intervalDays ?? 0;
    if (!start || n < 1) return false;
    const d = parseISO(date);
    const s = parseISO(start);
    const diff = differenceInDays(d, s);
    return diff >= 0 && diff % n === 0;
  }

  if (frequency === "WEEKLY") {
    if (!start) return false;
    const d = parseISO(date);
    const s = parseISO(start);
    const diff = differenceInDays(d, s);
    return diff >= 0 && diff % 7 === 0;
  }

  if (frequency === "MONTHLY") {
    if (!start) return false;
    const d = parseISO(date);
    const s = parseISO(start);
    if (isBefore(d, s)) return false;
    return d.getDate() === s.getDate();
  }

  // Legacy
  if (frequency.startsWith("WEEKLY:")) {
    const dayStr = frequency.slice(7).trim();
    const days = dayStr.split(",").map((d) => d.trim().toUpperCase());
    if (days.length === 0) return false;
    const d = parseISO(date);
    const dayOfWeek = getDay(d);
    return days.some((name) => WEEKDAY_MAP[name] !== undefined && WEEKDAY_MAP[name] === dayOfWeek);
  }
  if (frequency.startsWith("INTERVAL:")) {
    const numStr = frequency.slice(9).trim();
    const n = parseInt(numStr, 10);
    if (!start || isNaN(n) || n < 1) return false;
    const s = parseISO(start);
    const current = parseISO(date);
    const diff = differenceInDays(current, s);
    return diff >= 0 && diff % n === 0;
  }

  return false;
}

/**
 * Liệt kê tất cả ngày đến hạn từ start đến end (inclusive) theo frequency.
 */
export function getScheduledDatesInRange(
  frequency: string,
  startDate: string,
  endDate: string,
  intervalDays?: number | null
): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (isAfter(start, end)) return [];

  const out: string[] = [];
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  if (frequency === "DAILY") {
    let d = start;
    while (!isAfter(d, end)) {
      out.push(fmt(d));
      d = addDays(d, 1);
    }
    return out;
  }

  if (frequency === "EVERY_2_DAYS") {
    let d = start;
    while (!isAfter(d, end)) {
      out.push(fmt(d));
      d = addDays(d, 2);
    }
    return out;
  }

  if (frequency === "EVERY_3_DAYS") {
    let d = start;
    while (!isAfter(d, end)) {
      out.push(fmt(d));
      d = addDays(d, 3);
    }
    return out;
  }

  if (frequency === "EVERY_X_DAYS") {
    const n = intervalDays ?? 1;
    if (n < 1) return [];
    let d = start;
    while (!isAfter(d, end)) {
      out.push(fmt(d));
      d = addDays(d, n);
    }
    return out;
  }

  if (frequency === "WEEKLY") {
    let d = start;
    while (!isAfter(d, end)) {
      out.push(fmt(d));
      d = addDays(d, 7);
    }
    return out;
  }

  if (frequency === "MONTHLY") {
    let d = start;
    const dayOfMonth = d.getDate();
    while (!isAfter(d, end)) {
      out.push(fmt(d));
      d = new Date(d.getFullYear(), d.getMonth() + 1, Math.min(dayOfMonth, 28));
    }
    return out;
  }

  return out;
}

/**
 * Số ngày đến hạn từ start đến end (có thể dùng today hoặc goal_deadline).
 */
export function countScheduledInRange(
  frequency: string,
  startDate: string,
  endDate: string,
  intervalDays?: number | null
): number {
  return getScheduledDatesInRange(frequency, startDate, endDate, intervalDays).length;
}

/**
 * Progress %: từ start đến deadline (hoặc today nếu trước deadline), có bao nhiêu ngày đến hạn;
 * đã COMPLETE bao nhiêu (từ logs hoặc currentProgress). Trả về 0–100.
 */
export function getProgressPercentage(
  pact: Pact,
  completedCount: number,
  asOfDate?: string
): number {
  const deadline = pact.goalDeadline;
  const start = getStartDate(pact);
  const end = asOfDate ?? format(new Date(), "yyyy-MM-dd");
  if (!deadline) {
    const total = pact.targetCount ?? 0;
    if (total <= 0) return 0;
    return Math.min(100, Math.round((completedCount / total) * 100));
  }
  const endUse = isAfter(parseISO(end), parseISO(deadline)) ? deadline : end;
  const total = countScheduledInRange(
    pact.frequency,
    start,
    endUse,
    pact.frequency === "EVERY_X_DAYS" ? pact.intervalDays : undefined
  );
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completedCount / total) * 100));
}

export { getStartDate };
