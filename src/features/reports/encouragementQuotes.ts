export type Locale = "vi" | "en";

export interface EncouragementItem {
  minScore: number;
  maxScore: number;
  message: string;
  author?: string;
}

const QUOTES_VI: EncouragementItem[] = [
  { minScore: 80, maxScore: 100, message: "Bạn đang giữ lửa rất tốt! Hành trình của bạn thật đáng nể." },
  { minScore: 80, maxScore: 100, message: "Ý chí mạnh mẽ — bạn đang chứng minh điều đó mỗi ngày." },
  { minScore: 80, maxScore: 100, message: "Thành công là tổng của những nỗ lực nhỏ lặp đi lặp lại mỗi ngày.", author: "Robert Collier" },
  { minScore: 50, maxScore: 79, message: "Tiếp tục, bạn đang đi đúng hướng. Chỉ cần kiên trì." },
  { minScore: 50, maxScore: 79, message: "Mỗi bước nhỏ đều đưa bạn đến gần mục tiêu hơn." },
  { minScore: 50, maxScore: 79, message: "Sự kiên nhẫn và nỗ lực bền bỉ luôn được đền đáp.", author: "Og Mandino" },
  { minScore: 20, maxScore: 49, message: "Mỗi ngày một chút, lửa sẽ lại bùng lên. Đừng bỏ cuộc." },
  { minScore: 20, maxScore: 49, message: "Khởi đầu lại không bao giờ là muộn. Bạn vẫn đang trên đường." },
  { minScore: 20, maxScore: 49, message: "Thất bại chỉ là cơ hội để bắt đầu lại một cách thông minh hơn.", author: "Henry Ford" },
  { minScore: 0, maxScore: 19, message: "Khởi đầu nhỏ cũng là khởi đầu. Hãy thắp lên ngọn lửa đầu tiên." },
  { minScore: 0, maxScore: 19, message: "Hành trình vạn dặm bắt đầu từ một bước chân.", author: "Lão Tử" },
  { minScore: 0, maxScore: 19, message: "Bạn mạnh hơn bạn nghĩ. Hãy tạo Khế Ước đầu tiên." },
];

const QUOTES_EN: EncouragementItem[] = [
  { minScore: 80, maxScore: 100, message: "You're keeping the fire burning strong. Your journey is impressive." },
  { minScore: 80, maxScore: 100, message: "Strong will — you're proving it every single day." },
  { minScore: 80, maxScore: 100, message: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { minScore: 50, maxScore: 79, message: "Keep going, you're on the right track. Just stay consistent." },
  { minScore: 50, maxScore: 79, message: "Every small step brings you closer to your goal." },
  { minScore: 50, maxScore: 79, message: "Patience and persistent effort are always rewarded.", author: "Og Mandino" },
  { minScore: 20, maxScore: 49, message: "A little each day, and the fire will rise again. Don't give up." },
  { minScore: 20, maxScore: 49, message: "It's never too late to start again. You're still on the path." },
  { minScore: 20, maxScore: 49, message: "Failure is simply the opportunity to begin again, more intelligently.", author: "Henry Ford" },
  { minScore: 0, maxScore: 19, message: "A small start is still a start. Light the first flame." },
  { minScore: 0, maxScore: 19, message: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { minScore: 0, maxScore: 19, message: "You are stronger than you think. Create your first Pact." },
];

const BY_LOCALE: Record<Locale, EncouragementItem[]> = {
  vi: QUOTES_VI,
  en: QUOTES_EN,
};

/**
 * Chọn một câu động viên theo Chỉ số Ý chí và locale.
 * Trả về item đầu tiên thỏa minScore <= score <= maxScore.
 */
export function getEncouragementForScore(score: number, locale: Locale): EncouragementItem {
  const list = BY_LOCALE[locale];
  const found = list.find((q) => score >= q.minScore && score <= q.maxScore);
  return found ?? list[list.length - 1]!;
}
