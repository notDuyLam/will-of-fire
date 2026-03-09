# WILL OF FIRE - TECHNICAL DESIGN DOCUMENT (TDD)

## 1. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)
Dự án áp dụng mô hình **Offline-First App Architecture**. Không có Backend Server truyền thống. Toàn bộ logic nghiệp vụ (Business Logic) và Cơ sở dữ liệu (Database) nằm hoàn toàn trên thiết bị của người dùng.

**Luồng dữ liệu (Data Flow):**
`UI Components` <-> `Zustand Store (State)` <-> `Drizzle ORM (Data Access Layer)` <-> `Expo SQLite (Local DB)`

---

## 2. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

### 2.1. Frontend & Mobile Core
* **Framework:** React Native + Expo (Managed Workflow - SDK 50+).
* **Ngôn ngữ:** TypeScript (Bắt buộc dùng Strict Mode để tránh lỗi runtime).
* **Routing:** Expo Router (File-based routing, chuẩn mực mới của React Native thay thế cho React Navigation thuần).

### 2.2. Giao diện & Trải nghiệm (UI/UX)
* **Styling:** NativeWind v4 (Dùng utility classes của TailwindCSS, tối ưu performance).
* **Animation:** React Native Reanimated v3 (Xử lý animation mượt 60fps trên UI Thread, dùng cho Progress Bar và chuyển cảnh).
* **Icons:** Lucide-React-Native (Bộ icon vector viền mảnh, hiện đại).
* **Components:** Có thể tự build hoặc dùng base của thư viện `react-native-reusables` (tương tự shadcn/ui cho mobile).

### 2.3. Quản lý Dữ liệu & Trạng thái (Data & State)
* **Local Database:** Expo SQLite.
* **ORM:** Drizzle ORM (Type-safe ORM, code query bằng TS siêu sạch, tự động sinh migration).
* **Global State:** Zustand (Nhẹ, không boilerplate).
* **Key-Value Storage:** React Native MMKV (Nhanh gấp 30 lần AsyncStorage, dùng để lưu Settings như Dark mode, ID user local).

### 2.4. Công cụ phụ trợ (Utilities)
* **Date/Time:** `date-fns` (Xử lý chu kỳ ngày tháng chuẩn xác).
* **Background Tasks/Notifications:** `expo-notifications` (Lập lịch gửi Local Push Notification), `expo-task-manager` (Chạy ngầm check trạng thái Miss nếu cần).

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)



Chúng ta sử dụng 3 bảng chính để giải quyết toàn bộ bài toán Tracking, Failed Rule và Evolution Rule.

### Bảng 1: `pacts` (Thông tin Khế Ước)
Lưu trữ định nghĩa và trạng thái hiện tại của Pact.
* `id` (UUID, Primary Key)
* `name` (Text, Not Null): Tên Khế Ước.
* `description` (Text): Mô tả.
* `frequency` (Text, Not Null): Tần suất (VD: "DAILY", "WEEKLY", "INTERVAL_3_DAYS").
* `goal_name` (Text, Not Null): Mục tiêu hiện tại.
* `target_count` (Integer, Not Null): Định mức để đạt 100% Progress.
* `current_progress` (Integer, Default 0): Số lần đã thực hiện cho Goal hiện tại.
* `total_fire` (Integer, Default 0): Tổng Lửa kiếm được từ lúc tạo.
* `current_streak` (Integer, Default 0): Chuỗi liên tục hiện tại.
* `highest_streak` (Integer, Default 0): Kỷ lục chuỗi cao nhất.
* `status` (Text, Default 'ACTIVE'): Trạng thái ('ACTIVE', 'COMPLETED', 'FAILED').
* `reminder_time` (Text): Giờ nhắc nhở (VD: "07:30").
* `created_at` (Timestamp, Not Null)
* `updated_at` (Timestamp, Not Null)

### Bảng 2: `pact_logs` (Nhật ký Giữ Lửa)
Bảng quan trọng nhất để vẽ Calendar và check Failed Rule (Miss 2 lần).
* `id` (UUID, Primary Key)
* `pact_id` (UUID, Foreign Key -> `pacts.id`)
* `date` (Text, Not Null): Ngày thực hiện (Format: YYYY-MM-DD).
* `action` (Text, Not Null): Hành động ('COMPLETE', 'PRESERVE', 'MISS').
* `fire_earned` (Integer, Default 0): Số lửa nhận được trong ngày hôm đó (1 hoặc 0).
* `created_at` (Timestamp, Not Null)
* *(Index trên cột `pact_id` và `date` để query lịch siêu nhanh).*

### Bảng 3: `milestones` (Cột mốc Tiến hóa)
Lưu lại các Goal đã hoàn thành khi người dùng chọn "Tiến hóa" Pact.
* `id` (UUID, Primary Key)
* `pact_id` (UUID, Foreign Key -> `pacts.id`)
* `goal_name` (Text, Not Null): Tên mục tiêu đã đạt.
* `target_count` (Integer, Not Null): Định mức của mục tiêu đó.
* `achieved_at` (Timestamp, Not Null): Thời điểm hoàn thành.

---

## 4. CẤU TRÚC THƯ MỤC (FOLDER STRUCTURE)

Sử dụng cấu trúc phân tách theo Feature (Feature-Sliced Design rút gọn) kết hợp với Expo Router:

```text
will-of-fire/
├── app/                  # UI Screens (Expo Router)
│   ├── (tabs)/           # Màn hình chính có Tab bar
│   │   ├── index.tsx     # Dashboard (Danh sách Active Pacts)
│   │   ├── reports.tsx   # Global Reports (Chỉ số Ý chí, Lửa, Goal đạt/sắp tới, biểu đồ, động viên)
│   │   └── archive.tsx   # Archive (Completed & Failed)
│   ├── pacts/            
│   │   ├── [id].tsx      # Pact Detail
│   │   ├── create.tsx    # Create Pact Form
│   │   └── edit.tsx      # Edit Pact Form
│   └── _layout.tsx       # Root layout, setup Providers
├── src/
│   ├── features/
│   │   └── reports/      # Reports: reportsData, willIndex, encouragementQuotes
│   ├── components/       # Reusable UI (Buttons, Cards, Progress Bars, Icons)
│   ├── db/               # Local Database Layer
│   │   ├── schema.ts     # Drizzle DB Schema definitions
│   │   ├── migrate.ts    # Migration scripts
│   │   └── queries/      # Các hàm thao tác DB (VD: createPact, logAction)
│   ├── store/            # State Management
│   │   └── usePactStore.ts # Zustand store kết nối với DB để UI render
│   ├── hooks/            # Custom Hooks (VD: useCalendarRules, useNotifications)
│   ├── utils/            # Helper functions (date formatting, calculation)
│   └── constants/        # Theme colors, config mặc định
├── assets/               # Fonts, Images, Lottie animations
├── tailwind.config.js    # NativeWind configuration
├── drizzle.config.ts     # Drizzle ORM configuration
├── app.json              # Expo configuration
└── package.json


---

## 5. CHIẾN LƯỢC QUẢN LÝ STATE (STATE MANAGEMENT)

Không gọi DB trực tiếp từ UI Component để tránh block UI Thread. Luồng chuẩn:

1. Lúc app khởi động, **Zustand Store** sẽ gọi `db/queries` để fetch toàn bộ Active Pacts và lưu vào memory.
2. **UI Component** chỉ subscribe vào Zustand Store để render.
3. Khi người dùng bấm "Complete", UI gọi hàm `markComplete(pactId)` trong Store.
4. **Store** thực thi hàm này: Update vào SQLite → Lấy kết quả → Update memory state → UI tự động re-render mượt mà.

---

## 6. TIÊU CHUẨN CODE (CODE CONVENTION & LINTING)

Để dự án chặt chẽ ngay từ đầu, thiết lập các rules sau:

* **ESLint + Prettier:** Setup chuẩn standard, auto-format khi save. Cấm dùng `any` trong TypeScript (`@typescript-eslint/no-explicit-any`).
* **Husky + Lint-staged:** Cài đặt pre-commit hook. Khóa không cho commit nếu code bị lỗi ESLint hoặc TypeScript check fail.
* **Naming Convention:**
  * **Components/Screens:** `PascalCase` (VD: `ProgressBar.tsx`).
  * **Hàm/Biến/Hooks:** `camelCase` (VD: `usePactStore.ts`, `calculateStreak`).
  * **DB Tables/Columns:** `snake_case` (VD: `pact_logs`, `target_count`).

---

## 7. CHIẾN LƯỢC TRIỂN KHAI & BUILD (DEPLOYMENT)

* **Phát triển (Dev):** Dùng ứng dụng Expo Go trên điện thoại thật để scan QR code, hỗ trợ Hot Reloading tức thì.
* **Build Offline (Local/Cloud):** Sử dụng EAS (Expo Application Services).
  * Build ra file `.apk` để tự cài đặt/test: `eas build -p android --profile preview`
  * Build ra file `.aab` để đẩy lên Google Play Store: `eas build -p android --profile production`
* **Thiết lập `app.json`:** Cấu hình rõ ràng các quyền (Permissions) để nhận thông báo offline:

```json
"plugins": [
  [
    "expo-notifications",
    {
      "icon": "./assets/notification-icon.png",
      "color": "#FF5733"
    }
  ]
]
```