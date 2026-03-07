import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { initializeDatabase } from "../src/db/migrate";

/**
 * Root Layout: Thiết lập Providers và navigation container chính.
 * Khởi tạo Database khi app start, hiển thị loading screen trong lúc chờ.
 */
export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Khởi tạo SQLite database và tạo các bảng cần thiết.
     * Chạy 1 lần duy nhất khi app mount.
     */
    const setup = async () => {
      try {
        await initializeDatabase();
        setDbReady(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("DB init error:", err);
      }
    };

    setup();
  }, []);

  // Loading screen trong lúc khởi tạo DB
  if (!dbReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        {error ? (
          <>
            <Text className="mb-2 text-lg font-bold text-red-400">
              ❌ Database Error
            </Text>
            <Text className="px-8 text-center text-sm text-slate-400">
              {error}
            </Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-4 text-slate-400">
              Initializing database...
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F172A" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}
