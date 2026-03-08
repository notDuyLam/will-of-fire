import type { Locale } from "./translations";

/** Câu vẩn vơ vui tươi cho pact không có goal */
const PHRASES: Record<Locale, string[]> = {
  vi: [
    "Đi xem mình đi được đến đâu?",
    "Vô tận và xa hơn nữa!!",
    "Cứ đi, trời không phụ lòng.",
    "Mỗi ngày một chút, không cần đích.",
    "Hành trình là phần thưởng.",
    "Chỉ cần không dừng lại.",
    "Đi đâu cũng được, miễn là đi.",
    "Không đích thì không sợ trễ.",
    "Gieo thói quen, gặt tương lai.",
    "Một bước nhỏ mỗi ngày.",
    "Cảm giác tiến bộ mỗi ngày.",
    "Không cần mục tiêu, chỉ cần đều.",
    "Bình yên mà kiên trì.",
    "Đi xa từng bước một.",
    "Vui là được!",
  ],
  en: [
    "How far can I go?",
    "To infinity and beyond!!",
    "Just keep going.",
    "The journey is the reward.",
    "One step at a time, no finish line.",
    "All I need is not to stop.",
    "Anywhere is fine, as long as I move.",
    "No deadline, no pressure.",
    "Small steps, big life.",
    "Progress over perfection.",
    "Just show up.",
    "No goal? No problem.",
    "Steady and happy.",
    "Going the distance, one day at a time.",
    "Enjoy the ride!",
  ],
};

export const NO_GOAL_PHRASE_COUNT = PHRASES.vi.length;

export function getNoGoalPhraseByIndex(locale: Locale, index: number): string {
  const list = PHRASES[locale];
  const i = ((index % list.length) + list.length) % list.length;
  return list[i]!;
}

/** Random quote mỗi lần gọi — dùng khi muốn quote đổi mỗi lần vào màn (dashboard/detail). */
export function getRandomNoGoalPhrase(locale: Locale): string {
  const list = PHRASES[locale];
  const index = Math.floor(Math.random() * list.length);
  return list[index]!;
}
