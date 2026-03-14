import { Modal, View, Text, Pressable } from "react-native";

export interface ConfirmModalButton {
  text: string;
  onPress?: () => void;
  style?: "cancel" | "destructive" | "default";
}

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: ConfirmModalButton[];
  onRequestClose: () => void;
  isDark?: boolean;
}

/**
 * Modal xác nhận/ thông báo custom thay cho Alert.alert.
 * Hỗ trợ 1 hoặc 2 nút (vd: OK, hoặc Hủy + Xác nhận).
 */
export function ConfirmModal({
  visible,
  title,
  message,
  buttons,
  onRequestClose,
  isDark = true,
}: ConfirmModalProps) {
  const card = isDark
    ? "bg-slate-800 border-slate-600"
    : "bg-white border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable
        className="flex-1 justify-center bg-black/50 px-6"
        onPress={onRequestClose}
        accessible={false}
      >
        <Pressable
          className={`rounded-2xl border p-5 ${card}`}
          onPress={(e) => e.stopPropagation()}
        >
          <Text className={`mb-2 text-lg font-semibold ${text}`}>{title}</Text>
          <Text className={`mb-5 text-sm ${muted}`}>{message}</Text>
          <View className="flex-row flex-wrap items-center justify-end gap-3">
            {buttons.map((btn, i) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";
              const btnClass = isDestructive
                ? "bg-red-600"
                : isCancel
                  ? isDark
                    ? "bg-slate-700"
                    : "bg-slate-200"
                  : "bg-orange-500";
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    btn.onPress?.();
                    onRequestClose();
                  }}
                  className={`shrink-0 rounded-lg px-4 py-2.5 ${btnClass}`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      isCancel ? muted : "text-white"
                    }`}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
