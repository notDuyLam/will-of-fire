/**
 * Theme colors cho Will of Fire app
 * Sử dụng dark theme làm mặc định
 */
export const COLORS = {
    // Primary fire palette
    fire: {
        50: "#FFF7ED",
        100: "#FFEDD5",
        200: "#FED7AA",
        300: "#FDBA74",
        400: "#FB923C",
        500: "#F97316",
        600: "#EA580C",
        700: "#C2410C",
        800: "#9A3412",
        900: "#7C2D12",
    },

    // Dark theme backgrounds
    background: {
        primary: "#0F172A",
        secondary: "#1E293B",
        tertiary: "#334155",
    },

    // Text colors
    text: {
        primary: "#F8FAFC",
        secondary: "#94A3B8",
        muted: "#64748B",
    },

    // Status colors
    status: {
        complete: "#22C55E",
        preserve: "#3B82F6",
        miss: "#EF4444",
        milestone: "#A855F7",
        active: "#F97316",
        failed: "#DC2626",
    },
} as const;

/**
 * Default config values
 */
export const DEFAULTS = {
    REMINDER_TIME: "07:30",
    FREQUENCY: "DAILY",
} as const;

/**
 * Pact Status enum values
 */
export const PACT_STATUS = {
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
} as const;

/**
 * Log Action enum values
 */
export const LOG_ACTION = {
    COMPLETE: "COMPLETE",
    PRESERVE: "PRESERVE",
    MISS: "MISS",
} as const;
