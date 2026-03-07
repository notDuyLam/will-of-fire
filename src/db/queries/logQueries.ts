import { eq, and, desc } from "drizzle-orm";
import { db } from "../client";
import { pactLogs, type NewPactLog, type PactLog } from "../schema";

/**
 * Ghi log hành động cho một Pact vào ngày cụ thể.
 * Hành động: 'COMPLETE' | 'PRESERVE' | 'MISS'
 *
 * @param data - pactId, date (YYYY-MM-DD), action, fireEarned
 * @returns PactLog vừa tạo
 */
export function logAction(data: NewPactLog): PactLog {
    const result = db
        .insert(pactLogs)
        .values(data)
        .returning()
        .get();

    return result;
}

/**
 * Lấy toàn bộ log của một Pact, sắp xếp theo ngày mới nhất.
 * Dùng để hiển thị Calendar view trong Pact Detail.
 *
 * @param pactId - UUID của Pact
 * @returns Mảng PactLog sắp xếp desc theo date
 */
export function getLogsForPact(pactId: string): PactLog[] {
    return db
        .select()
        .from(pactLogs)
        .where(eq(pactLogs.pactId, pactId))
        .orderBy(desc(pactLogs.date))
        .all();
}

/**
 * Lấy log của một Pact cho một ngày cụ thể.
 * Dùng để kiểm tra xem ngày đó đã có action chưa.
 *
 * @param pactId - UUID của Pact
 * @param date - Ngày cần kiểm tra (YYYY-MM-DD)
 * @returns PactLog hoặc undefined nếu chưa có log
 */
export function getLogForDate(
    pactId: string,
    date: string
): PactLog | undefined {
    return db
        .select()
        .from(pactLogs)
        .where(and(eq(pactLogs.pactId, pactId), eq(pactLogs.date, date)))
        .get();
}

/**
 * Lấy N log gần nhất của một Pact.
 * Dùng để check Failed Rule: nếu 2 log cuối cùng đều là MISS -> FAILED.
 *
 * @param pactId - UUID của Pact
 * @param limit - Số log cần lấy (mặc định: 2 cho Failed Rule check)
 * @returns Mảng PactLog gần nhất
 */
export function getRecentLogs(pactId: string, limit: number = 2): PactLog[] {
    return db
        .select()
        .from(pactLogs)
        .where(eq(pactLogs.pactId, pactId))
        .orderBy(desc(pactLogs.date))
        .limit(limit)
        .all();
}
