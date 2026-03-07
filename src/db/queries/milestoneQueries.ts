import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { milestones, type NewMilestone, type Milestone } from "../schema";

/**
 * Tạo một Milestone mới khi người dùng chọn "Tiến hóa" (Evolve) Pact.
 * Ghi lại Goal vừa hoàn thành trước khi reset Progress cho Goal mới.
 *
 * @param data - pactId, goalName, targetCount
 * @returns Milestone vừa tạo
 */
export function createMilestone(data: NewMilestone): Milestone {
    const result = db
        .insert(milestones)
        .values(data)
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
