export const COLORS = {
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  dark: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  accent: {
    gold: "#f59e0b",
    goldLight: "#fbbf24",
    goldDark: "#d97706",
  },
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  white: "#ffffff",
  black: "#000000",
};

export const TIER_COLORS: Record<string, string> = {
  free: COLORS.dark[500],
  basic: COLORS.primary[500],
  premium: COLORS.accent.gold,
};
