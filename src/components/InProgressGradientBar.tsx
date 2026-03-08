import { LinearGradient } from "expo-linear-gradient";

/** Các cặp màu gradient đặc sắc cho thanh "Đang thực hiện" (pact không có goal) */
const GRADIENTS: [string, string][] = [
  ["#a855f7", "#ec4899"], // violet -> pink
  ["#06b6d4", "#8b5cf6"], // cyan -> violet
  ["#f59e0b", "#ef4444"], // amber -> red
  ["#10b981", "#3b82f6"], // emerald -> blue
  ["#ec4899", "#f97316"], // pink -> orange
  ["#6366f1", "#14b8a6"], // indigo -> teal
  ["#f43f5e", "#eab308"], // rose -> yellow
  ["#8b5cf6", "#06b6d4"], // violet -> cyan
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return Math.abs(h);
}

type Props = {
  /** Seed để chọn gradient cố định (vd: pactId) — mỗi pact một màu ổn định */
  seed?: string;
  /** Chiều cao thanh (default 6 cho dashboard, 8 cho detail) */
  height?: number;
  /** Độ rộng tương đối 0-1 (default 0.5) */
  widthFraction?: number;
};

export function InProgressGradientBar({
  seed = "default",
  height = 6,
  widthFraction = 0.5,
}: Props) {
  const index = hashString(seed) % GRADIENTS.length;
  const [start, end] = GRADIENTS[index]!;
  const widthPercent = Math.min(100, Math.max(20, widthFraction * 100));

  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        height,
        width: `${widthPercent}%`,
        borderRadius: height / 2,
      }}
    />
  );
}
