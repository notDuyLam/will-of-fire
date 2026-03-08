import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, View, Appearance } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemFromHook = useColorScheme();
  // Khởi tạo system từ Appearance.getColorScheme() (đồng bộ) để render đầu đã đúng theme.
  // useColorScheme() cập nhật sau nên có thể null/trễ ở frame đầu.
  const [system, setSystem] = useState<"light" | "dark" | null>(() => {
    const v = Appearance.getColorScheme();
    return v === "dark" || v === "light" ? v : null;
  });
  useEffect(() => {
    const v = systemFromHook;
    if (v === "dark" || v === "light") setSystem(v);
  }, [systemFromHook]);

  const [override, setOverride] = useState<Theme | null>(null);
  const theme: Theme =
    override ?? (system === "light" ? "light" : "dark");
  const isDark = theme === "dark";

  useEffect(() => {
    // Có thể đọc từ MMKV ở đây khi tích hợp
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: setOverride,
        isDark,
      }}
    >
      <View className={isDark ? "dark" : ""} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    return {
      theme: "dark" as Theme,
      setTheme: () => {},
      isDark: true,
    };
  return ctx;
}
