## Will of Fire

Ứng dụng mobile **offline-first** giúp bạn duy trì kỷ luật thông qua các **Pact (Khế Ước)**, tích lũy **Fire (Lửa)** và theo dõi **Streak (Chuỗi)** theo thời gian.

### Tính năng chính

- **Pact cá nhân**: Tạo Khế Ước với tên, mô tả, tần suất, mục tiêu và hạn chót.
- **Quy tắc Complete / Preserve / Miss / Fail**: Bám sát đặc tả trong `docs/BUSINESS.md`.
- **Evolution & Milestones**: Khi đạt 100% mục tiêu có thể Archive hoặc Tiến hóa sang mục tiêu mới, ghi lại cột mốc.
- **Dashboard & Detail**: Danh sách Pact đang chạy, màn hình chi tiết với Progress Bar, Calendar, Milestones và nhật ký gần đây.
- **Reports (Phase sau)**: Đã có thiết kế business/technical trong `docs/`, phần UI sẽ được phát triển ở các phase tiếp theo.
- **Local notifications**: Nhắc nhở vào giờ đã đặt, hoạt động offline.
- **Backup / Restore**: Xuất JSON, CSV tóm tắt và import lại dữ liệu từ Settings.

### Công nghệ

- **React Native + Expo (SDK 55)**, **TypeScript**.
- **Expo Router** cho routing theo file.
- **SQLite + Drizzle ORM** cho database local.
- **Zustand** cho global state.
- **NativeWind** (Tailwind) cho styling, **Reanimated** cho animation.

Chi tiết thêm xem tại:

- `docs/BUSINESS.md` – đặc tả nghiệp vụ song ngữ.
- `docs/TECHNICAL-DESIGN.md` – kiến trúc và schema database.

### Cài đặt & chạy dev

```bash
npm install
npm run start        # hoặc: npm run android / ios / web
```

- Với thiết bị thật: cài app **Expo Go**, scan QR từ terminal Dev Tools.

### Build bản release (EAS)

Yêu cầu: đã cấu hình `eas.json` / account Expo.

```bash
# Android .apk dùng để tự cài / test
eas build -p android --profile preview

# Android .aab để đưa lên Google Play
eas build -p android --profile production
```

Quyền, icon thông báo và cấu hình plugin được khai báo trong `app.json` theo mô tả ở `docs/TECHNICAL-DESIGN.md`.

