import { View, Text, Pressable, Platform } from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parseISO } from "date-fns";

interface DatePickerFieldProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
  labelClassName?: string;
  isDark?: boolean;
}

/** value/onChange: YYYY-MM-DD */
export function DatePickerField({
  value,
  onChange,
  placeholder = "Chọn ngày",
  minimumDate,
  maximumDate,
  className = "",
  labelClassName = "",
  isDark = true,
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const date = value ? parseISO(value) : new Date();
  const display =
    value ? format(parseISO(value), "dd/MM/yyyy") : placeholder;
  const card = isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";

  const handleChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selectedDate) {
      onChange(format(selectedDate, "yyyy-MM-dd"));
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
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
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
