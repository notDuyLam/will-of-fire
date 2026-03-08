/**
 * UUID v4 generator — hoạt động trên mọi nền (web, Android, iOS).
 * Trên web/Node có sẵn crypto.randomUUID(); React Native không có → dùng fallback.
 */
export function randomUUID(): string {
  const c = typeof globalThis !== "undefined" && globalThis.crypto;
  if (typeof c?.randomUUID === "function") {
    return c.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
