import { logAction, getLogForDate, getRecentLogs } from "./queries/logQueries";
import { getPactById, updatePact } from "./queries/pactQueries";
import type { Pact } from "./schema";

export type LogActionType = "COMPLETE" | "PRESERVE" | "MISS";

export interface LogActionResult {
  success: boolean;
  message?: string;
  pact?: Pact;
}

/**
 * Ghi log hành động và cập nhật pact (streak, progress, totalFire, status).
 * - Kiểm tra trùng log cho (pactId, date); nếu đã có thì không ghi.
 * - COMPLETE: +1 progress, +1 totalFire, +1 currentStreak, cập nhật highestStreak.
 * - PRESERVE: giữ nguyên progress/fire/streak.
 * - MISS: currentStreak = 0; nếu 2 log gần nhất đều MISS thì status = FAILED.
 */
export function logActionAndUpdatePact(
  pactId: string,
  date: string,
  action: LogActionType
): LogActionResult {
  const existing = getLogForDate(pactId, date);
  if (existing) {
    return { success: false, message: "Đã ghi nhận cho ngày này.", pact: getPactById(pactId) };
  }

  logAction({
    pactId,
    date,
    action,
    fireEarned: action === "COMPLETE" ? 1 : 0,
  });

  const pact = getPactById(pactId);
  if (!pact || pact.status !== "ACTIVE") {
    return { success: true, pact: getPactById(pactId) };
  }

  if (action === "COMPLETE") {
    const newProgress = pact.currentProgress + 1;
    const newTotalFire = pact.totalFire + 1;
    const newStreak = pact.currentStreak + 1;
    const newHighest = Math.max(pact.highestStreak, newStreak);
    updatePact(pactId, {
      currentProgress: newProgress,
      totalFire: newTotalFire,
      currentStreak: newStreak,
      highestStreak: newHighest,
    });
  } else if (action === "PRESERVE") {
    // No change to progress, totalFire, streak
  } else if (action === "MISS") {
    const recent = getRecentLogs(pactId, 2);
    const twoMiss =
      recent.length >= 2 &&
      recent[0]!.action === "MISS" &&
      recent[1]!.action === "MISS";
    updatePact(pactId, {
      currentStreak: 0,
      ...(twoMiss ? { status: "FAILED" as const } : {}),
    });
  }

  return { success: true, pact: getPactById(pactId) };
}
