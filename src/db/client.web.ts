/**
 * Web stub: SQLite không chạy trên web (expo-sqlite cần WASM).
 * Export db giả để app không crash; dữ liệu trên web sẽ rỗng.
 */
const emptyChain = {
    where: () => emptyChain,
    orderBy: () => emptyChain,
    all: () => [],
    get: () => undefined,
};

const stubDb = {
    run: (_sql: unknown) => {},
    select: () => ({
        from: () => emptyChain,
    }),
    insert: (_table: unknown) => ({
        values: (data: Record<string, unknown>) => ({
            returning: () => ({
                get: () => ({ ...data, id: (data as { id?: string }).id ?? crypto.randomUUID() }),
            }),
        }),
    }),
    update: (_table: unknown) => ({
        set: (data: Record<string, unknown>) => ({
            where: () => ({
                returning: () => ({
                    get: () => ({ ...data }),
                }),
            }),
        }),
    }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = stubDb as any;
