import { View, Text, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "../../src/i18n/context";
import { useTheme } from "../../src/contexts/ThemeContext";
import { Settings as SettingsIcon } from "lucide-react-native";
import { usePactStore } from "../../src/store/usePactStore";
import {
  saveAndShareJsonBackup,
  saveAndShareCsvSummary,
  pickAndImportBackup,
  resetAppData,
} from "../../src/db/backup";
import {
  ConfirmModal,
  type ConfirmModalButton,
} from "../../src/components/ConfirmModal";

/**
 * Màn hình Cài đặt: đổi theme (sáng/tối), đổi ngôn ngữ.
 */
export default function SettingsScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();
  const { fetchActivePacts } = usePactStore();
  const [isWorking, setIsWorking] = useState(false);
  const [modal, setModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: ConfirmModalButton[];
  }>({ visible: false, title: "", message: "", buttons: [] });

  const closeModal = () => setModal((m) => ({ ...m, visible: false }));

  const bg = isDark ? "bg-slate-900" : "bg-slate-50";
  const card = isDark
    ? "bg-slate-800 border-slate-600"
    : "bg-white border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const btnPrimary = "bg-orange-500";
  const btnSecondary = isDark ? "bg-slate-700" : "bg-slate-200";

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={["top", "bottom"]}>
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6 flex-row items-center">
          <SettingsIcon color={isDark ? "#F8FAFC" : "#0f172a"} size={28} />
          <Text className={`ml-2 text-2xl font-bold ${text}`}>
            {t("settings.title")}
          </Text>
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.theme")}
        </Text>
        <View className={`mb-6 flex-row gap-3 rounded-xl border p-3 ${card}`}>
          <Pressable
            onPress={() => setTheme("light")}
            className={`flex-1 rounded-lg py-3 ${theme === "light" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                theme === "light" ? "text-white" : muted
              }`}
            >
              {t("settings.themeLight")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTheme("dark")}
            className={`flex-1 rounded-lg py-3 ${theme === "dark" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                theme === "dark" ? "text-white" : muted
              }`}
            >
              {t("settings.themeDark")}
            </Text>
          </Pressable>
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.language")}
        </Text>
        <View className={`mb-6 flex-row gap-3 rounded-xl border p-3 ${card}`}>
          <Pressable
            onPress={() => setLocale("vi")}
            className={`flex-1 rounded-lg py-3 ${locale === "vi" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                locale === "vi" ? "text-white" : muted
              }`}
            >
              {t("settings.languageVi")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale("en")}
            className={`flex-1 rounded-lg py-3 ${locale === "en" ? btnPrimary : btnSecondary}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                locale === "en" ? "text-white" : muted
              }`}
            >
              {t("settings.languageEn")}
            </Text>
          </Pressable>
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.exportTitle")}
        </Text>
        <View className={`mb-6 rounded-xl border p-3 ${card}`}>
          <Text className={`mb-3 text-xs ${muted}`}>
            {t("settings.exportDescription")}
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              disabled={isWorking}
              onPress={async () => {
                if (isWorking) return;
                setIsWorking(true);
                try {
                  await saveAndShareJsonBackup(locale);
                } catch {
                  setModal({
                    visible: true,
                    title: t("common.error"),
                    message: t("settings.importError"),
                    buttons: [{ text: t("common.ok") }],
                  });
                } finally {
                  setIsWorking(false);
                }
              }}
              className={`flex-1 rounded-lg py-3 ${
                isWorking ? "bg-slate-400" : btnPrimary
              }`}
            >
              <Text className="text-center text-sm font-semibold text-white">
                {t("settings.exportJsonButton")}
              </Text>
            </Pressable>
            <Pressable
              disabled={isWorking}
              onPress={async () => {
                if (isWorking) return;
                setIsWorking(true);
                try {
                  await saveAndShareCsvSummary();
                } catch {
                  setModal({
                    visible: true,
                    title: t("common.error"),
                    message: t("settings.importError"),
                    buttons: [{ text: t("common.ok") }],
                  });
                } finally {
                  setIsWorking(false);
                }
              }}
              className={`flex-1 rounded-lg py-3 ${
                isWorking ? "bg-slate-400" : btnSecondary
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {t("settings.exportCsvButton")}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.importTitle")}
        </Text>
        <View className={`mb-6 rounded-xl border p-3 ${card}`}>
          <Text className={`mb-3 text-xs ${muted}`}>
            {t("settings.importDescription")}
          </Text>
          <Pressable
            disabled={isWorking}
            onPress={() => {
              if (isWorking) return;
              setModal({
                visible: true,
                title: t("settings.importConfirmTitle"),
                message: t("settings.importConfirmMessage"),
                buttons: [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("common.ok"),
                    style: "destructive",
                    onPress: async () => {
                      setIsWorking(true);
                      try {
                        const result = await pickAndImportBackup();
                        if (result.ok) {
                          fetchActivePacts();
                          setModal({
                            visible: true,
                            title: "",
                            message: t("settings.importSuccess"),
                            buttons: [{ text: t("common.ok") }],
                          });
                        } else if (!result.cancelled) {
                          setModal({
                            visible: true,
                            title: t("common.error"),
                            message: t("settings.importError"),
                            buttons: [{ text: t("common.ok") }],
                          });
                        }
                      } finally {
                        setIsWorking(false);
                      }
                    },
                  },
                ],
              });
            }}
            className={`rounded-lg py-3 ${
              isWorking ? "bg-slate-400" : btnPrimary
            }`}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {t("settings.importButton")}
            </Text>
          </Pressable>
          {isWorking && (
            <Text className={`mt-2 text-center text-xs ${muted}`}>
              {t("common.loading")}
            </Text>
          )}
        </View>

        <Text className={`mb-2 text-sm font-semibold ${muted}`}>
          {t("settings.resetTitle")}
        </Text>
        <View className={`mb-6 rounded-xl border p-3 ${card}`}>
          <Text className={`mb-3 text-xs ${muted}`}>
            {t("settings.resetDescription")}
          </Text>
          <Pressable
            disabled={isWorking}
            onPress={() => {
              if (isWorking) return;
              setModal({
                visible: true,
                title: t("settings.resetConfirmTitle"),
                message: t("settings.resetConfirmMessage"),
                buttons: [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("settings.resetButton"),
                    style: "destructive",
                    onPress: () => {
                      setIsWorking(true);
                      try {
                        resetAppData();
                        fetchActivePacts();
                        setModal({
                          visible: true,
                          title: "",
                          message: t("settings.resetSuccess"),
                          buttons: [{ text: t("common.ok") }],
                        });
                      } finally {
                        setIsWorking(false);
                      }
                    },
                  },
                ],
              });
            }}
            className={`rounded-lg py-3 ${
              isWorking ? "bg-slate-400" : "bg-red-600"
            }`}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {t("settings.resetButton")}
            </Text>
          </Pressable>
        </View>

        <View className="h-8" />
      </ScrollView>

      <ConfirmModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        buttons={modal.buttons}
        onRequestClose={closeModal}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
