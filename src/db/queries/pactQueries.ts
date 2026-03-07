import { eq } from "drizzle-orm";
import { db } from "../client";
import { pacts, type NewPact, type Pact } from "../schema";

/**
 * Tạo một Pact mới và lưu vào database.
 *
 * @param data - Dữ liệu Pact mới (name, frequency, goalName, targetCount, etc.)
 * @returns Pact vừa tạo (với id đã được generate)
 */
export function createPact(data: NewPact): Pact {
    const now = new Date().toISOString();

    const result = db
        .insert(pacts)
        .values({
            ...data,
            createdAt: now,
            updatedAt: now,
        })
        .returning()
        .get();

    return result;
}

/**
 * Lấy toàn bộ Pact đang Active.
 * Dùng cho Dashboard: chỉ hiện các Pact đang chạy.
 *
 * @returns Mảng các Active Pact, sắp xếp theo ngày tạo mới nhất
 */
export function getAllActivePacts(): Pact[] {
    return db
        .select()
        .from(pacts)
        .where(eq(pacts.status, "ACTIVE"))
        .all();
}

/**
 * Lấy toàn bộ Pact (bao gồm mọi trạng thái).
 * Dùng cho Archive screen.
 *
 * @returns Mảng tất cả Pact
 */
export function getAllPacts(): Pact[] {
    return db.select().from(pacts).all();
}

/**
 * Lấy một Pact cụ thể theo ID.
 *
 * @param id - UUID của Pact
 * @returns Pact hoặc undefined nếu không tìm thấy
 */
export function getPactById(id: string): Pact | undefined {
    return db
        .select()
        .from(pacts)
        .where(eq(pacts.id, id))
        .get();
}

/**
 * Cập nhật một Pact.
 * Tự động set updatedAt = now.
 *
 * @param id - UUID của Pact cần update
 * @param data - Partial data cần cập nhật
 * @returns Pact đã cập nhật
 */
export function updatePact(
    id: string,
    data: Partial<Omit<NewPact, "id">>
): Pact {
    const result = db
        .update(pacts)
        .set({
            ...data,
            updatedAt: new Date().toISOString(),
        })
        .where(eq(pacts.id, id))
        .returning()
        .get();

    return result;
}

/**
 * Lấy các Pact đã completed (cho Archive > Chiến tích).
 */
export function getCompletedPacts(): Pact[] {
    return db
        .select()
        .from(pacts)
        .where(eq(pacts.status, "COMPLETED"))
        .all();
}

/**
 * Lấy các Pact đã failed (cho Archive > Bài học).
 */
export function getFailedPacts(): Pact[] {
    return db
        .select()
        .from(pacts)
        .where(eq(pacts.status, "FAILED"))
        .all();
}
