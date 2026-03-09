import "../global.css";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeDatabase } from "../src/db/migrate";
import { usePactStore } from "../src/store/usePactStore";
import { getAllPacts } from "../src/db/queries";
import { runSeed } from "../src/db/seed";
import { verifyInstallation } from "nativewind";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import { I18nProvider } from "../src/i18n/context";
import { ThemeAwareBars } from "../src/components/ThemeAwareBars";

/**
 * Root Layout: Thiết lập Providers và navigation container chính.
 * Khởi tạo Database khi app start, hiển thị loading screen trong lúc chờ.
 */
export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debug NativeWind — kiểm tra installation
    verifyInstallation();

    /**
     * Khởi tạo SQLite database và tạo các bảng cần thiết.
     * Chạy 1 lần duy nhất khi app mount.
     */
    const setup = async () => {
      try {
        await initializeDatabase();
        if (__DEV__ && getAllPacts().length === 0) {
          runSeed();
        }
        usePactStore.getState().fetchActivePacts();
        setDbReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("DB init error:", err);
      }
    };

    setup();
  }, []);

  if (!dbReady) {
    return (
      <View className="flex-1 items-center justify-center bg-screen dark:bg-screen-dark">
        {error ? (
          <>
            <Text className="mb-2 text-lg font-bold text-red-400">
              ❌ Database Error
            </Text>
            <Text className="px-8 text-center text-sm text-muted dark:text-muted-dark">
              {error}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-4 text-muted dark:text-muted-dark">
              Initializing database...
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemeAwareBars />
        <I18nProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "transparent" },
              animation: "slide_from_right",
            }}
          />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
