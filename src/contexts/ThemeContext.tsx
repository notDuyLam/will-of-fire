import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme, View } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<Theme | null>(null);
  const theme: Theme = override ?? (system === "dark" ? "dark" : "light");
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
