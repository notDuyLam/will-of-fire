import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * Root Layout: Thiết lập Providers và navigation container chính.
 * Sử dụng Stack navigator là navigation gốc cho toàn app.
 */
export default function RootLayout() {
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
