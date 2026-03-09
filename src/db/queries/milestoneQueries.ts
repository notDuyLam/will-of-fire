import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { milestones, type NewMilestone, type Milestone } from "../schema";

/**
 * Tạo một Milestone mới khi người dùng chọn "Tiến hóa" (Evolve) Pact.
 * Ghi lại Goal vừa hoàn thành (goalName + goalDeadline) trước khi đặt mục tiêu mới.
 *
 * @param data - pactId, goalName, goalDeadline (optional)
 * @returns Milestone vừa tạo
 */
export function createMilestone(data: NewMilestone): Milestone {
    const result = db
        .insert(milestones)
        .values({ ...data, targetCount: 0 })
        .returning()
        .get();

    return result;
}

/**
 * Lấy toàn bộ Milestones của một Pact, sắp xếp theo thời gian đạt được.
 * Dùng cho Pact Detail screen: hiển thị danh sách các cột mốc đã phá đảo.
 *
 * @param pactId - UUID của Pact
 * @returns Mảng Milestone sắp xếp desc theo achievedAt
 */
export function getMilestonesForPact(pactId: string): Milestone[] {
    return db
        .select()
        .from(milestones)
        .where(eq(milestones.pactId, pactId))
        .orderBy(desc(milestones.achievedAt))
        .all();
}

/**
 * Đếm tổng số Milestones trong toàn app.
 * Dùng cho Global Report: "Tổng Cột mốc đã phá đảo".
 *
 * @returns Tổng số milestones
 */
export function getTotalMilestoneCount(): number {
    const result = db.select().from(milestones).all();
    return result.length;
}

/**
 * Lấy toàn bộ Milestones toàn app (không giới hạn).
 * Dùng cho backup/export dữ liệu.
 */
export function getAllMilestonesForExport(): Milestone[] {
  return db
    .select()
    .from(milestones)
    .orderBy(desc(milestones.achievedAt))
    .all();
}

/**
 * Lấy toàn bộ Milestones toàn app, sắp xếp theo achievedAt mới nhất.
 * Dùng cho Reports: danh sách goal đã đạt.
 *
 * @param limit - Số lượng tối đa (mặc định 20)
 */
export function getAllMilestones(limit: number = 20): Milestone[] {
    return db
        .select()
        .from(milestones)
        .orderBy(desc(milestones.achievedAt))
        .limit(limit)
        .all();
}
