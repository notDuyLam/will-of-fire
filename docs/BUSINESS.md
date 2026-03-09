# WILL OF FIRE - BUSINESS SPECIFICATION

---

## 🇬🇧 ENGLISH VERSION

### 1. CORE CONCEPTS
* **Pact:** A habit, task, or long-term commitment the user wants to track.
* **Fire:** The scoring unit. Earning Fire signifies maintaining discipline. 
* **Streak:** The number of consecutive times a Pact has been successfully completed without a "Miss".
* **Goal & Target:** The specific objective of a Pact (e.g., "Save $1000") and the metric to measure it (e.g., "100 times of saving").
* **Milestone:** A previously completed Goal within an ongoing Pact that has been evolved/extended.

### 2. THE PACT LIFECYCLE

#### 2.1. Initialization (Creating a Pact)
When creating a Pact, the user must define:
* **Name & Description:** Identity of the Pact.
* **Frequency:** How often it occurs (e.g., Daily, every 3 days, specific days of the week like Mon/Wed/Fri).
* **Goal:** The ultimate objective.
* **Target/Estimate:** The number of successful executions required to hit 100% on the Progress Bar.
* **Reminder Time:** Specific time to trigger local push notifications (Default: 07:30 AM).

#### 2.2. Daily Execution (Action Days)
On a day when the Pact is scheduled to occur, the system activates the "Pending" state. Before 23:59 of that day, the user has two choices:
* **Action A: Complete**
  * **Condition:** User finishes the task and taps "Complete".
  * **Result:** +1 Fire, Streak increases by 1, Progress Bar increments based on the Target. The day is marked as "Completed" on the calendar.
* **Action B: Preserve**
  * **Condition:** Unexpected events prevent execution. User proactively taps "Preserve" before the day ends.
  * **Result:** 0 Fire earned, Progress Bar does not increase. **However, the Streak is maintained (not broken)**. The day is marked as "Preserved" on the calendar.

#### 2.3. The "Miss" and "Fail" Rule
If the user does neither "Complete" nor "Preserve" by 23:59 of the scheduled day:
* **1st Miss:** The day is marked as "Miss". The current **Streak is broken (reset to 0)**. The Pact remains active. Retroactive completion (completing for yesterday) is strictly forbidden.
* **2nd Consecutive Miss (Fail Rule):** If the user misses the next scheduled execution as well (2 consecutive Misses), the Pact immediately changes its status to **Failed**.
  * **Result:** The Pact is locked, removed from the active Dashboard, and moved to the "Failed" section of the Archive. The accumulated Fire is kept as a historical record.

#### 2.4. The "Evolution" Rule (Happy Ending)
When the Progress Bar reaches 100% (Target met), a completion event is triggered. The user is presented with two options:
* **Option 1: Archive**
  * The Pact is marked as **Completed**, locked, and moved to the "Completed" section of the Archive.
* **Option 2: Evolve (Set New Goal)**
  * The user inputs a new Goal and Target (e.g., changing from "Save $1000" to "Save $2000").
  * The just-completed Goal is recorded as a **Milestone** and stamped on the calendar at the date of completion.
  * **Result:** The Progress Bar resets to 0% for the new target. The accumulated Fire and current Streak continue to grow without interruption.

### 3. NOTIFICATION SYSTEM
* Uses offline Local Push Notifications.
* Only triggers on the scheduled days of a Pact.
* Default time: 07:30 AM (customizable per Pact).

### 4. REPORTING & UI BUSINESS LOGIC
* **Dashboard:** Displays only "Active" Pacts with Quick Action buttons (Complete/Preserve) that are only enabled on scheduled days.
* **Pact Detail & Report:** Visualizes the Progress Bar, lists past Milestones, and displays a Calendar view color-coded by daily status (Complete, Preserve, Miss, Milestone achieved).
* **Global Report (Reports screen):** Aggregates data across all Pacts: **Will Index** (0–100 score from pacts created, completion rate, active pacts, discipline average, recent Fire, fail/miss penalty); Total Fire (all-time and last 7/30 days); Goals achieved (milestones + completed pacts) and upcoming goals; most productive pacts, need attention (many misses), most delayed (many preserves); **Fire per week** chart; **Action breakdown** (Complete/Preserve/Miss) pie chart; encouraging quotes based on Will Index. Purpose: summarize the user's journey and provide positive psychological impact (motivation, reflection on achievements).
* **Archive:** Segregates "Completed" Pacts (successes) and "Failed" Pacts (lessons learned).

---

## 🇻🇳 PHIÊN BẢN TIẾNG VIỆT

### 1. THUẬT NGỮ CỐT LÕI
* **Pact (Khế Ước):** Một thói quen, công việc hoặc mục tiêu dài hạn mà người dùng muốn theo dõi.
* **Fire (Lửa):** Đơn vị điểm số. Nhận được Lửa tượng trưng cho việc duy trì kỷ luật.
* **Streak (Chuỗi):** Số lần liên tiếp hoàn thành Khế Ước mà không bị gián đoạn (Miss).
* **Goal & Target (Mục tiêu & Định mức):** Đích đến cụ thể của Khế Ước (VD: "Tiết kiệm 20 triệu") và con số đo lường (VD: "100 lần gửi tiền").
* **Milestone (Cột mốc):** Một Goal đã hoàn thành trong quá khứ của một Khế Ước đang tiếp tục tiến hóa.

### 2. VÒNG ĐỜI CỦA KHẾ ƯỚC

#### 2.1. Khởi tạo
Khi tạo mới một Khế Ước, người dùng phải xác định:
* **Tên & Mô tả:** Nhận diện Khế Ước.
* **Tần suất:** Chu kỳ lặp lại (VD: Hàng ngày, 3 ngày/lần, hoặc các thứ cụ thể trong tuần).
* **Mục tiêu (Goal):** Đích đến cuối cùng.
* **Định mức (Target):** Số lần thực hiện thành công cần thiết để thanh Tiến trình (Progress Bar) đạt 100%.
* **Giờ nhắc nhở:** Thời gian đổ chuông thông báo offline (Mặc định: 07:30 sáng).

#### 2.2. Vận hành hàng ngày (Vào ngày đến hạn)
Vào đúng ngày Khế Ước có lịch thực hiện, hệ thống sẽ mở trạng thái "Chờ". Trước 23:59 của ngày hôm đó, người dùng có 2 lựa chọn:
* **Hành động 1: Hoàn thành (Complete)**
  * **Điều kiện:** Hoàn thành việc cần làm và bấm "Complete".
  * **Kết quả:** +1 Fire, Streak +1, thanh Tiến trình nhích lên dựa trên Định mức. Lịch ghi nhận ngày này là "Hoàn thành".
* **Hành động 2: Bảo toàn (Preserve)**
  * **Điều kiện:** Có việc đột xuất không thể thực hiện. Chủ động bấm "Preserve" trước khi hết ngày.
  * **Kết quả:** Không nhận được Fire, thanh Tiến trình đứng im. **Tuy nhiên, Streak (Chuỗi) được giữ nguyên không bị gãy**. Lịch ghi nhận ngày này là "Bảo toàn".

#### 2.3. Quy tắc Bỏ lỡ (Miss) và Thất bại (Fail)
Nếu người dùng không bấm Complete cũng không bấm Preserve trước 23:59 của ngày đến hạn:
* **Miss lần 1:** Ngày đó bị tính là "Miss". **Chuỗi Streak hiện tại bị gãy (reset về 0)**. Khế Ước vẫn hoạt động. Tuyệt đối không cho phép bấm hoàn thành bù cho ngày hôm qua.
* **Miss 2 lần liên tiếp (Fail Rule):** Nếu ở kỳ đến hạn tiếp theo người dùng tiếp tục Miss (2 lần Miss liên tiếp), Khế Ước lập tức chuyển sang trạng thái **Thất bại (Failed)**.
  * **Kết quả:** Khế Ước bị khóa, xóa khỏi màn hình chính, đưa vào mục "Failed" trong Kho lưu trữ (Archive). Tổng số Fire đã cày được giữ nguyên làm lịch sử.

#### 2.4. Quy tắc Tiến hóa (Thành công trọn vẹn)
Khi thanh Tiến trình đạt 100% (Hoàn thành Định mức), hệ thống kích hoạt sự kiện thành công. Người dùng có 2 lựa chọn:
* **Lựa chọn 1: Lưu trữ (Archive)**
  * Khế Ước được đánh dấu là **Completed (Đã hoàn thành)**, bị khóa và đưa vào mục thành công trong Kho lưu trữ.
* **Lựa chọn 2: Tiến hóa (Đặt Mục tiêu mới)**
  * Người dùng nhập Goal và Target mới (VD: Nâng từ "Tiết kiệm 20 triệu" lên "Tiết kiệm 50 triệu").
  * Mục tiêu vừa hoàn thành sẽ được biến thành một **Cột mốc (Milestone)** và gắn huy hiệu lên Lịch ngay tại ngày hoàn thành.
  * **Kết quả:** Thanh Tiến trình reset về 0% cho chặng đường mới. Tổng Fire và Streak hiện tại vẫn tiếp tục được cộng dồn không bị ngắt quãng.

### 3. HỆ THỐNG THÔNG BÁO
* Sử dụng Local Push Notification (chạy offline không cần mạng).
* Chỉ thông báo vào những ngày Khế Ước đến hạn thực hiện.
* Giờ mặc định: 07:30 sáng (có thể chỉnh sửa riêng cho từng Khế Ước).

### 4. LOGIC HIỂN THỊ & BÁO CÁO
* **Màn hình chính (Dashboard):** Chỉ hiện các Khế Ước "Đang chạy" (Active). Nút thao tác (Complete/Preserve) chỉ sáng lên vào đúng ngày đến hạn.
* **Chi tiết & Báo cáo cá nhân:** Hiển thị thanh Tiến trình, danh sách các Cột mốc (Milestones) đã đạt, và Lịch trực quan được chấm màu theo trạng thái ngày (Hoàn thành, Bảo toàn, Bỏ lỡ, Đạt Cột mốc).
* **Báo cáo tổng (Reports):** Gom data toàn app: **Chỉ số Ý chí** (điểm 0–100 từ số pact, tỷ lệ hoàn thành goal, pact đang chạy, độ kỷ luật TB, Lửa 30 ngày, trừ điểm fail/miss); Tổng Lửa (toàn thời gian và 7/30 ngày qua); Goal đã đạt và Goal sắp tới; Pact năng suất nhất, cần cải thiện (nhiều miss), trì hoãn nhiều (nhiều preserve); biểu đồ Lửa theo tuần và phân bố Complete/Preserve/Miss; lời động viên/quote theo điểm. Mục đích: tóm tắt hành trình và tạo hiệu ứng tâm lý tích cực (động lực, nhìn lại thành tựu).
* **Kho lưu trữ (Archive):** Phân chia rõ ràng 2 khu vực: Chiến tích (Completed) và Bài học (Failed).