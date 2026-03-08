import { View, Text, Pressable, Platform } from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

function parseTime(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(isNaN(h) ? 7 : h, isNaN(m) ? 30 : m, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface TimePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isDark?: boolean;
}

/** value/onChange: "HH:mm" */
export function TimePickerField({
  value,
  onChange,
  placeholder = "07:30",
  className = "",
  isDark = true,
}: TimePickerFieldProps) {
  const [show, setShow] = useState(false);
  const timeDate = value ? parseTime(value) : parseTime("07:30");
  const display = value || placeholder;
  const card = isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";

  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selectedDate) {
      onChange(formatTime(selectedDate));
    }
  };

  return (
    <View className={className}>
      <Pressable
        onPress={() => setShow(true)}
        className={`rounded-xl border ${card} px-4 py-3 ${!value ? muted : text}`}
      >
        <Text className={!value ? muted : text}>{display}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={timeDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          is24Hour
          onTouchCancel={Platform.OS === "ios" ? () => setShow(false) : undefined}
        />
      )}
      {show && Platform.OS === "ios" && (
        <Pressable
          onPress={() => setShow(false)}
          className="mt-2 rounded-lg bg-slate-600 py-2"
        >
          <Text className="text-center text-white">Xong</Text>
        </Pressable>
      )}
    </View>
  );
}
