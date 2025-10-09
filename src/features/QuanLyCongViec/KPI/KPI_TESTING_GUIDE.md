# 🧪 HƯỚNG DẪN TEST HỆ THỐNG KPI - CHI TIẾT

**Ngày tạo:** 06/10/2025  
**Phiên bản:** 1.0  
**Tác giả:** AI Assistant + Developer Team

---

## 📋 MỤC LỤC

1. [Chuẩn bị trước khi test](#1-chuẩn-bị-trước-khi-test)
2. [Test Flow: Admin Setup](#2-test-flow-admin-setup)
3. [Test Flow: Manager Workflow](#3-test-flow-manager-workflow)
4. [Test Flow: Employee View](#4-test-flow-employee-view)
5. [Test Flow: Analytics & Reports](#5-test-flow-analytics--reports)
6. [Test Cases Chi Tiết](#6-test-cases-chi-tiết)
7. [Checklist Kiểm Tra](#7-checklist-kiểm-tra)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. CHUẨN BỊ TRƯỚC KHI TEST

### 1.1. Start Backend Server

**Terminal 1:**

```powershell
cd d:\project\webBV\giaobanbv-be
npm start
```

**Kiểm tra:**

- ✅ Server chạy trên port 5001
- ✅ MongoDB connected thành công
- ✅ Console không có error

**Expected Output:**

```
Server running on port 5001
MongoDB Connected Successfully
```

---

### 1.2. Start Frontend Development Server

**Terminal 2:**

```powershell
cd d:\project\webBV\fe-bcgiaobanbvt
npm start
```

**Kiểm tra:**

- ✅ Webpack compiled successfully
- ✅ Browser tự động mở http://localhost:3000
- ✅ Console không có error

**Expected Output:**

```
webpack compiled successfully
```

---

### 1.3. Login với các Role khác nhau

Cần test với **3 loại tài khoản:**

| Role                  | Username          | Chức năng được phép                       |
| --------------------- | ----------------- | ----------------------------------------- |
| **Admin** (Role 3+)   | admin@test.com    | Toàn quyền: Tạo tiêu chí, chu kỳ, báo cáo |
| **Manager** (Role 2)  | manager@test.com  | Chấm điểm KPI, duyệt KPI                  |
| **Employee** (Role 1) | employee@test.com | Chỉ xem KPI của mình                      |

---

### 1.4. Mở Chrome DevTools

**Các tab cần mở:**

1. **Console:** Theo dõi errors/warnings
2. **Network:** Kiểm tra API requests/responses
3. **Redux DevTools:** Xem state changes

**Shortcut:** `F12` hoặc `Ctrl+Shift+I`

---

## 2. TEST FLOW: ADMIN SETUP

### 📍 Mục tiêu:

Tạo đủ dữ liệu master (Tiêu chí + Chu kỳ) để hệ thống hoạt động

---

### 2.1. Tạo Tiêu Chí Đánh Giá

**Bước 1:** Truy cập menu

- Sidebar → **"Quản lý công việc và KPI"** → **"Đánh giá KPI"** → **"Quản lý tiêu chí"**
- Hoặc truy cập trực tiếp: http://localhost:3000/quanlycongviec/kpi/tieu-chi

**Bước 2:** Kiểm tra giao diện

- ✅ Hiển thị 2 tabs: **"Tăng điểm"** và **"Giảm điểm"**
- ✅ Table rỗng (nếu chưa có data)
- ✅ Button **"Thêm tiêu chí"** ở góc trên bên phải

**Bước 3:** Tạo tiêu chí TĂNG ĐIỂM
Click **"Thêm tiêu chí"** → Nhập:

| Field         | Value                                        | Validation                   |
| ------------- | -------------------------------------------- | ---------------------------- |
| Tên tiêu chí  | Hoàn thành đúng hạn                          | Required                     |
| Mô tả         | Hoàn thành nhiệm vụ đúng hoặc trước deadline | Optional                     |
| Loại tiêu chí | **TANG_DIEM**                                | Auto-selected (tab hiện tại) |
| Điểm tối đa   | 20                                           | 0-100                        |
| Trọng số      | 0.3                                          | 0-1.0, step 0.01             |

Click **"Lưu"**

**Expected Result:**

- ✅ Toast success: "Tạo tiêu chí đánh giá thành công"
- ✅ Table refresh, hiển thị tiêu chí mới
- ✅ Icon ↗️ (TrendingUp) màu xanh
- ✅ Dialog tự động đóng

**Tạo thêm 2 tiêu chí TĂNG ĐIỂM nữa:**

```
Tiêu chí 2:
- Tên: Chất lượng công việc tốt
- DiemToiDa: 20
- TrongSo: 0.3

Tiêu chí 3:
- Tên: Sáng tạo, cải tiến
- DiemToiDa: 10
- TrongSo: 0.2
```

---

**Bước 4:** Chuyển sang tab **"Giảm điểm"**
Tạo 2 tiêu chí GIẢM ĐIỂM:

```
Tiêu chí 1:
- Tên: Trễ deadline
- DiemToiDa: 15
- TrongSo: 0.5

Tiêu chí 2:
- Tên: Sai sót, lỗi kỹ thuật
- DiemToiDa: 10
- TrongSo: 0.3
```

**Expected Result:**

- ✅ Icon ↘️ (TrendingDown) màu đỏ
- ✅ Tổng cộng có **5 tiêu chí** (3 tăng + 2 giảm)

---

### 2.2. Tạo Chu Kỳ Đánh Giá

**Bước 1:** Truy cập menu

- Sidebar → **"Đánh giá KPI"** → **"Quản lý chu kỳ"**
- URL: http://localhost:3000/quanlycongviec/kpi/chu-ky

**Bước 2:** Kiểm tra giao diện

- ✅ Alert "Chu kỳ hiện tại": Không có (nếu chưa tạo)
- ✅ 4 Statistics Cards: Tổng số chu kỳ, Đang diễn ra, Đã kết thúc, Chờ bắt đầu
- ✅ Table rỗng (nếu chưa có data)

**Bước 3:** Tạo chu kỳ mới
Click **"Thêm chu kỳ"** → Nhập:

| Field         | Value                          | Validation            |
| ------------- | ------------------------------ | --------------------- |
| Tên chu kỳ    | KPI Tháng 10/2025              | Required              |
| Ngày bắt đầu  | 01/10/2025                     | Required              |
| Ngày kết thúc | 31/10/2025                     | Must be >= NgayBatDau |
| Mô tả         | Đánh giá KPI tháng 10 năm 2025 | Optional              |

Click **"Lưu"**

**Expected Result:**

- ✅ Toast success: "Tạo chu kỳ đánh giá thành công"
- ✅ Table hiển thị chu kỳ mới
- ✅ Trạng thái: **"Chờ bắt đầu"** (chip màu xám)
- ✅ Thời gian: "01/10/2025 - 31/10/2025 (31 ngày)"
- ✅ Buttons: **"Bắt đầu"** (enabled), **"Sửa"**, **"Xóa"** (enabled)

---

**Bước 4:** Bắt đầu chu kỳ
Click button **"Bắt đầu"** trên row vừa tạo

**Expected Result:**

- ✅ Toast success: "Bắt đầu chu kỳ đánh giá thành công"
- ✅ Trạng thái chuyển → **"Đang diễn ra"** (chip màu xanh)
- ✅ Alert "Chu kỳ hiện tại" hiển thị: "KPI Tháng 10/2025"
- ✅ Buttons: **"Kết thúc"** (enabled), **"Sửa"**, **"Xóa"** (disabled)
- ✅ Card "Đang diễn ra" tăng lên 1

**⚠️ Lưu ý:** Chỉ có thể có **1 chu kỳ "Đang diễn ra"** tại một thời điểm!

---

### 2.3. Kiểm tra Redux State (Chrome DevTools)

**Redux DevTools → State → kpi:**

```json
{
  "tieuChiDanhGias": [
    {
      "_id": "...",
      "TenTieuChi": "Hoàn thành đúng hạn",
      "LoaiTieuChi": "TANG_DIEM",
      "DiemToiDa": 20,
      "TrongSo": 0.3
    }
    // ... 4 tiêu chí khác
  ],
  "chuKyDanhGias": [
    {
      "_id": "...",
      "TenChuKy": "KPI Tháng 10/2025",
      "TrangThai": "DANG_DIEN_RA",
      "NgayBatDau": "2025-10-01T00:00:00.000Z",
      "NgayKetThuc": "2025-10-31T23:59:59.999Z"
    }
  ],
  "isLoading": false,
  "error": null
}
```

**✅ Test Case Passed nếu:**

- Có đủ 5 tiêu chí (3 TANG_DIEM + 2 GIAM_DIEM)
- Có 1 chu kỳ với TrangThai = "DANG_DIEN_RA"
- Không có error

---

## 3. TEST FLOW: MANAGER WORKFLOW

### 📍 Mục tiêu:

Manager tạo đánh giá KPI, chấm điểm từng nhiệm vụ, duyệt KPI

**Login:** Dùng tài khoản **Manager (Role 2)**

---

### 3.1. Tạo Đánh Giá KPI cho Nhân Viên

**Bước 1:** Truy cập trang chấm KPI

- Sidebar → **"Đánh giá KPI"** → **"Chấm điểm KPI"**
- URL: http://localhost:3000/quanlycongviec/kpi/danh-gia

**Bước 2:** Kiểm tra giao diện

- ✅ Filter: Chu kỳ, Trạng thái
- ✅ Alert warning nếu không có chu kỳ "Đang diễn ra"
- ✅ Button **"Tạo đánh giá KPI"** (chỉ hiển thị nếu có chu kỳ active)

**Bước 3:** Tạo đánh giá mới
Click **"Tạo đánh giá KPI"** → Dialog 3 bước:

**Step 1: Chọn chu kỳ**

- ✅ Autocomplete hiển thị chu kỳ "Đang diễn ra"
- ✅ Select: "KPI Tháng 10/2025"
- Click **"Tiếp theo"**

**Step 2: Chọn nhân viên**

- ✅ Autocomplete hiển thị danh sách nhân viên
- ✅ Search by Họ tên hoặc Email
- ✅ Select: Nhân viên "Nguyễn Văn A" (ví dụ)
- Click **"Tiếp theo"**

**Step 3: Xác nhận**

- ✅ Hiển thị summary:
  - Chu kỳ: KPI Tháng 10/2025
  - Nhân viên: Nguyễn Văn A
  - Thời gian: 01/10/2025 - 31/10/2025
- Click **"Xác nhận"**

**Expected Result:**

- ✅ Toast success: "Tạo đánh giá KPI thành công"
- ✅ Dialog đóng
- ✅ Table refresh, hiển thị đánh giá mới
- ✅ Row data:
  - Nhân viên: Nguyễn Văn A (avatar + tên)
  - Chu kỳ: KPI Tháng 10/2025
  - Điểm KPI: **0% (0/10)** - LinearProgress màu đỏ
  - Trạng thái: **"Chưa duyệt"** (chip màu vàng)
  - Ngày duyệt: Trống
  - Ghi chú: Trống
  - Thao tác: Icon mắt (View), Edit, Delete

**Backend Auto-Create:**

- ✅ Tạo DanhGiaKPI document
- ✅ Auto-tạo DanhGiaNhiemVu cho tất cả NhiemVuThuongQuy của nhân viên
- ✅ TongDiemKPI ban đầu = 0 (chưa chấm điểm)

---

### 3.2. Chấm Điểm Chi Tiết Từng Nhiệm Vụ

**Bước 1:** Mở dialog chi tiết

- Click icon **mắt (View)** trên row vừa tạo

**Bước 2:** Kiểm tra layout dialog

**Header:**

- ✅ Title: "Chi tiết đánh giá KPI - [Tên nhân viên]"
- ✅ Close button (X)

**Section 1: Overview Card (Grid 2 columns)**

- ✅ Nhân viên: Nguyễn Văn A (avatar + email)
- ✅ Chu kỳ: KPI Tháng 10/2025
- ✅ Thời gian: 01/10/2025 - 31/10/2025
- ✅ Trạng thái: Chưa duyệt (chip vàng)
- ✅ Ngày duyệt: Chưa duyệt
- ✅ Người duyệt: Chưa có
- ✅ Ghi chú: (Empty hoặc text)

**Section 2: Total KPI Score Card**

- ✅ Title: "Tổng điểm KPI"
- ✅ Typography variant h2: **0/10 điểm (0%)**
- ✅ LinearProgress: Màu đỏ (error) - value 0%
- ✅ Helper text: "Hiệu suất: Yếu" (chip đỏ)

**Section 3: Accordions - Danh sách nhiệm vụ**

- ✅ Mỗi NhiemVuThuongQuy = 1 Accordion
- ✅ Accordion header:
  - Icon: 📋 (TaskSquare)
  - Tên nhiệm vụ: "Báo cáo tuần" (ví dụ)
  - Badge: Điểm nhiệm vụ "0/10 điểm"
- ✅ Expand accordion → hiển thị:
  - Mô tả nhiệm vụ
  - Divider
  - **2 tables:** Tiêu chí tăng điểm + Tiêu chí giảm điểm

---

**Bước 3:** Chấm điểm tiêu chí TĂNG ĐIỂM

**Table 1: Tiêu chí tăng điểm (màu xanh)**

Columns:

- Icon: ↗️ (TrendingUp)
- Tiêu chí
- Điểm tối đa
- Trọng số
- Điểm đạt được (TextField editable)

**Chấm điểm:**

| Tiêu chí            | Điểm tối đa | Trọng số | **Điểm nhập** |
| ------------------- | ----------- | -------- | ------------- |
| Hoàn thành đúng hạn | 20          | 0.3      | **18**        |
| Chất lượng tốt      | 20          | 0.3      | **17**        |
| Sáng tạo            | 10          | 0.2      | **8**         |

**Cách chấm:**

1. Click vào TextField "Điểm đạt được"
2. Nhập số (0-20 cho tiêu chí 1)
3. Blur (click ra ngoài) hoặc Enter
4. Backend auto-calculate:
   - TongDiemTieuChi = (18/20)*0.3 + (17/20)*0.3 + (8/10)\*0.2 = **0.445**
   - DiemNhiemVu += TongDiemTieuChi

---

**Bước 4:** Chấm điểm tiêu chí GIẢM ĐIỂM

**Table 2: Tiêu chí giảm điểm (màu đỏ)**

| Tiêu chí     | Điểm tối đa | Trọng số | **Điểm nhập**         |
| ------------ | ----------- | -------- | --------------------- |
| Trễ deadline | 15          | 0.5      | **0** (không trễ)     |
| Sai sót      | 10          | 0.3      | **2** (có 1 chút lỗi) |

**Backend auto-calculate:**

- TongDiemTieuChi (giảm) = (0/15)*0.5 + (2/10)*0.3 = **0.06**
- DiemNhiemVu = TongDiemTăng - TongDiemGiảm = 0.445 - 0.06 = **0.385**
- (Giả sử nhiệm vụ này có TrongSoNhiemVu = 0.4)
- DiemNhiemVu final = 0.385 _ 10 _ 0.4 = **1.54 điểm**

---

**Bước 5:** Kiểm tra tự động tính điểm

**Expected Real-time Update:**

1. **Badge Accordion:**

   - Trước: "0/10 điểm"
   - Sau: "**1.54/10 điểm**"

2. **Total KPI Score Card:**

   - Giả sử có 3 nhiệm vụ, tổng TongDiemKPI = **6.5/10 (65%)**
   - LinearProgress: Màu **warning (vàng)** (50-69%)
   - Helper text: "Hiệu suất: **Khá**" (chip vàng)

3. **Redux State Update:**
   - Chrome DevTools → Redux → Actions → chamDiemNhiemVu
   - Payload: { nhiemVuUpdated, danhGiaKPIUpdated }
   - State: danhGiaKPICurrent.TongDiemKPI = 6.5

**⚠️ Critical Check:**

- ✅ Mỗi lần blur input → API call `/cham-diem/:nhiemVuId`
- ✅ Network tab: Status 200 OK
- ✅ Response: { nhiemVu: {...}, danhGiaKPI: {...} }
- ✅ Console: Không có error

---

**Bước 6:** Chấm điểm tất cả nhiệm vụ còn lại

- Repeat bước 3-5 cho tất cả Accordions
- Target: TongDiemKPI >= 7.0/10 (70%) để đạt hiệu suất "Tốt"

**Scenario tốt nhất:**

- Tổng điểm KPI: **8.5/10 (85%)**
- LinearProgress: Màu **primary (xanh dương)**
- Hiệu suất: **Tốt**

---

### 3.3. Duyệt Đánh Giá KPI

**Bước 1:** Sau khi chấm điểm xong

- ✅ Total KPI Score: 8.5/10 (85%)
- ✅ Trạng thái: Chưa duyệt (chip vàng)

**Bước 2:** Click button **"Duyệt"** (màu xanh success)

- ✅ Position: Footer của dialog, bên phải
- ✅ Icon: CheckCircle

**Confirmation Dialog:**

- ✅ Title: "Xác nhận duyệt đánh giá KPI?"
- ✅ Content: "Bạn có chắc chắn muốn duyệt đánh giá KPI này? Sau khi duyệt không thể chỉnh sửa."
- ✅ Buttons: Hủy (outlined), Duyệt (contained success)

Click **"Duyệt"**

**Expected Result:**

1. **API Call:**

   - Method: PUT
   - URL: `/api/kpi/danh-gia-kpi/:id/duyet`
   - Response: { danhGiaKPI: {...} }

2. **Backend Update:**

   - TrangThai: CHUA_DUYET → **DA_DUYET**
   - NgayDuyet: **new Date()**
   - NguoiDuyet: auth.user.\_id

3. **UI Update:**

   - Toast success: "Duyệt đánh giá KPI thành công"
   - Overview Card:
     - Trạng thái: **"Đã duyệt"** (chip xanh success)
     - Ngày duyệt: **06/10/2025**
     - Người duyệt: **Nguyễn Quản Lý** (manager name)
   - Buttons:
     - "Duyệt": **Hidden**
     - "Hủy duyệt": **Visible** (màu đỏ error)
   - All input fields: **Disabled** (readonly)

4. **Table Update:**
   - Row status chip: Đã duyệt (xanh)
   - Edit button: **Disabled**
   - Delete button: **Disabled**

---

### 3.4. Test Edge Cases

**Case 1: Duyệt KPI chưa chấm điểm**

- TongDiemKPI = 0/10 (0%)
- Click "Duyệt" → Vẫn cho phép
- ✅ System không block (có thể duyệt KPI điểm 0)

**Case 2: Hủy duyệt KPI**

- KPI đã duyệt
- Click **"Hủy duyệt"** (button đỏ)
- Confirmation dialog: "Bạn có chắc muốn hủy duyệt?"
- Click "Hủy duyệt"
- Expected:
  - TrangThai: DA_DUYET → CHUA_DUYET
  - NgayDuyet: null
  - NguoiDuyet: null
  - Inputs: Enable lại (có thể sửa điểm)

**Case 3: Xóa KPI chưa duyệt**

- Click Delete button (icon trash)
- Confirmation: "Bạn có chắc muốn xóa đánh giá KPI này?"
- Click "Xóa"
- Expected:
  - API DELETE `/api/kpi/danh-gia-kpi/:id`
  - Row biến mất khỏi table
  - Toast success: "Xóa đánh giá KPI thành công"

**Case 4: Không thể xóa KPI đã duyệt**

- KPI có TrangThai = DA_DUYET
- Delete button: **Disabled** (IconButton disabled)
- Tooltip: "Không thể xóa đánh giá đã duyệt"

---

## 4. TEST FLOW: EMPLOYEE VIEW

### 📍 Mục tiêu:

Nhân viên xem KPI của mình, không thể chỉnh sửa

**Login:** Dùng tài khoản **Employee (Role 1)**

---

### 4.1. Xem KPI của tôi

**Bước 1:** Truy cập

- Sidebar → **"Đánh giá KPI"** → **"KPI của tôi"**
- URL: http://localhost:3000/quanlycongviec/kpi/xem

**Bước 2:** Kiểm tra giao diện

**Section 1: Statistics Cards (Grid 4 columns)**

| Card              | Icon       | Color   | Expected Value |
| ----------------- | ---------- | ------- | -------------- |
| Tổng số KPI       | TaskSquare | primary | 5 (ví dụ)      |
| Điểm trung bình   | TrendingUp | success | 8.2/10         |
| Đánh giá xuất sắc | MedalStar  | warning | 2              |
| Đánh giá yếu      | Warning2   | error   | 0              |

**Section 2: Latest KPI Card**

- ✅ Title: "KPI gần nhất"
- ✅ Chu kỳ: KPI Tháng 10/2025
- ✅ Điểm: 8.5/10 (85%)
- ✅ LinearProgress: Màu primary (xanh dương)
- ✅ Trạng thái: Đã duyệt (chip xanh)
- ✅ Ngày duyệt: 06/10/2025
- ✅ Button: "Xem chi tiết" (variant outlined)

**Section 3: History Table**

- ✅ Title: "Lịch sử đánh giá KPI"
- ✅ Columns:
  - Chu kỳ
  - Thời gian (date range)
  - Điểm KPI (progress bar)
  - Trạng thái
  - Ngày duyệt
  - Thao tác (icon View only, no Edit/Delete)
- ✅ Default sort: NgayDuyet descending
- ✅ Search: By chu kỳ name

---

### 4.2. Xem Chi Tiết KPI (Read-only)

**Bước 1:** Click "Xem chi tiết" hoặc icon View trong table

**Expected Dialog:**

**Header:**

- ✅ Title: "Chi tiết đánh giá KPI - [Tên nhân viên]"

**Content:**

- ✅ Giống Manager view NHƯNG:
  - ❌ Không có button "Duyệt" / "Hủy duyệt"
  - ❌ All input fields **disabled** (readonly)
  - ❌ Không thể chỉnh sửa điểm

**Permission Check:**

```javascript
// Code trong DanhGiaKPIDetailDialog.js
const canApprove = auth.user?.Role >= 2; // Manager hoặc Admin
// Nếu Role = 1 (Employee): canApprove = false
```

**Expected:**

- ✅ Nhân viên chỉ được **XEM**, không được **SỬA**
- ✅ Accordions vẫn expand/collapse bình thường
- ✅ Hiển thị đầy đủ chi tiết điểm từng tiêu chí

---

### 4.3. Test Permission Guards

**Attempt 1: Truy cập trang admin**

- URL: http://localhost:3000/quanlycongviec/kpi/bao-cao
- Expected: **403 Forbidden** hoặc redirect về NotFoundPage
- ✅ AdminRequire component chặn access

**Attempt 2: Truy cập trang quản lý tiêu chí**

- URL: http://localhost:3000/quanlycongviec/kpi/tieu-chi
- Expected: **403 Forbidden**

**Attempt 3: Xem menu sidebar**

- Expected: Chỉ thấy 2 menu items:
  - ✅ "KPI của tôi"
  - ✅ "Chấm điểm KPI"
- ❌ Không thấy: "Báo cáo & Thống kê", "Quản lý tiêu chí", "Quản lý chu kỳ"
- (Vì có roles: ['admin'] trong menu config)

---

## 5. TEST FLOW: ANALYTICS & REPORTS

### 📍 Mục tiêu:

Admin xem báo cáo tổng hợp, thống kê, xếp hạng

**Login:** Dùng tài khoản **Admin (Role 3+)**

---

### 5.1. Xem Báo Cáo Tổng Hợp

**Bước 1:** Truy cập

- Sidebar → **"Đánh giá KPI"** → **"Báo cáo & Thống kê"**
- URL: http://localhost:3000/quanlycongviec/kpi/bao-cao

**Bước 2:** Kiểm tra Statistics Cards (Grid 3 + 3 columns)

**Row 1:**
| Card | Icon | Color | API Field |
|------|------|-------|-----------|
| Tổng nhân viên | People | primary | tongNhanVien |
| Điểm TB | TrendingUp | success | diemTrungBinh |
| Xuất sắc (≥9) | MedalStar | warning | soLuongXuatSac |

**Row 2:**
| Card | Icon | Color | API Field |
|------|------|-------|-----------|
| Tốt (7-9) | Award | primary | soLuongTot |
| Khá (5-7) | ChartSquare | info | soLuongKha |
| Yếu (<5) | Danger | error | soLuongYeu |

**Expected API:**

- GET `/api/kpi/thong-ke/tong-hop`
- Response:

```json
{
  "tongNhanVien": 25,
  "diemTrungBinh": 7.8,
  "soLuongXuatSac": 5,
  "soLuongTot": 12,
  "soLuongKha": 6,
  "soLuongYeu": 2,
  "danhSachKPI": [...]
}
```

---

### 5.2. Kiểm Tra Charts

**Chart 1: KPIChartByNhanVien (BarChart)**

**Expected:**

- ✅ Library: Recharts
- ✅ Type: BarChart vertical
- ✅ X-axis: Tên nhân viên (rotate -45deg)
- ✅ Y-axis: Điểm KPI (0-10)
- ✅ Bar color: Dynamic by score
  - ≥9: success (xanh)
  - 7-9: primary (xanh dương)
  - 5-7: warning (vàng)
  - <5: error (đỏ)
- ✅ Tooltip: Custom
  - Nhân viên: [Tên]
  - Chu kỳ: [Tên chu kỳ]
  - Điểm KPI: X.X/10
  - Hiệu suất: [Xuất sắc/Tốt/Khá/Yếu]
- ✅ ResponsiveContainer: Height 400px

**Hover Test:**

- Hover bar → Tooltip hiển thị đầy đủ thông tin
- Tooltip auto-position (không bị che)

---

**Chart 2: KPIDistributionChart (PieChart)**

**Expected:**

- ✅ Type: PieChart
- ✅ 4 categories:
  - Xuất sắc (≥9): success color
  - Tốt (7-9): primary color
  - Khá (5-7): warning color
  - Yếu (<5): error color
- ✅ Labels: % trên từng slice
- ✅ Custom Legend:
  - Xuất sắc: 5 (20%)
  - Tốt: 12 (48%)
  - Khá: 6 (24%)
  - Yếu: 2 (8%)
- ✅ Auto-filter: Nếu category = 0 → không hiển thị slice

**Interaction Test:**

- Hover slice → Highlight
- Click legend → Toggle slice visibility

---

### 5.3. Kiểm Tra Bảng Xếp Hạng

**Table: ThongKeKPITable**

**Expected Features:**

- ✅ Auto-sort: TongDiemKPI descending (cao nhất lên đầu)
- ✅ Ranking icons:
  - Top 1: 🥇 (gold medal)
  - Top 2: 🥈 (silver medal)
  - Top 3: 🥉 (bronze medal)
  - Rank 4+: #4, #5, ...
- ✅ Columns:
  - Hạng (icon + number)
  - Nhân viên (avatar + tên + email)
  - Chu kỳ
  - Điểm KPI (progress bar)
  - Hiệu suất (chip color-coded)
  - Ngày duyệt
  - Thao tác (View only)

**Expected Data:**
| Hạng | Nhân viên | Điểm KPI | Hiệu suất |
|------|-----------|----------|-----------|
| 🥇 | Nguyễn Văn A | 9.5/10 (95%) | Xuất sắc (gold) |
| 🥈 | Trần Thị B | 9.2/10 (92%) | Xuất sắc (gold) |
| 🥉 | Lê Văn C | 8.8/10 (88%) | Tốt (primary) |
| #4 | Phạm Thị D | 8.5/10 (85%) | Tốt (primary) |
| ... | ... | ... | ... |

**Performance Chip Colors:**

- Xuất sắc (≥9): warning (vàng gold)
- Tốt (7-9): primary (xanh dương)
- Khá (5-7): info (xanh nhạt)
- Yếu (<5): error (đỏ)

---

### 5.4. Test Export Tính Năng (TODO - Phase 3)

**Button: "Xuất báo cáo"**

- ✅ Icon: Download
- ✅ Color: success
- ✅ Position: Top right

**Click Export:**

- Expected: Download file **KPI_Report_YYYY-MM-DD.xlsx**
- Format: Excel with 3 sheets:
  1. Tổng quan (stats)
  2. Xếp hạng (ranking table)
  3. Chi tiết từng nhân viên

**⚠️ Hiện tại:** Button có nhưng chưa implement logic → TODO Phase 3

---

## 6. TEST CASES CHI TIẾT

### 6.1. Form Validation Tests

#### Test Case 1: Tạo Tiêu Chí - Required Fields

**Input:**

- Tên tiêu chí: (empty)
- Điểm tối đa: (empty)
- Trọng số: (empty)

**Click "Lưu"**

**Expected:**

- ❌ Form không submit
- ✅ Error messages hiển thị dưới mỗi field:
  - "Tên tiêu chí là bắt buộc"
  - "Điểm tối đa là bắt buộc"
  - "Trọng số là bắt buộc"
- ✅ Fields highlight màu đỏ (error state)

---

#### Test Case 2: Tạo Tiêu Chí - Range Validation

**Input:**

- Điểm tối đa: **150** (> 100)
- Trọng số: **1.5** (> 1.0)

**Expected:**

- ❌ Submit fail
- ✅ Error: "Điểm tối đa phải từ 0 đến 100"
- ✅ Error: "Trọng số phải từ 0 đến 1.0"

---

#### Test Case 3: Tạo Chu Kỳ - Date Range Validation

**Input:**

- Ngày bắt đầu: 31/10/2025
- Ngày kết thúc: 01/10/2025 (trước NgayBatDau)

**Expected:**

- ❌ Submit fail
- ✅ Error: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu"

---

### 6.2. API Error Handling Tests

#### Test Case 4: Network Error

**Simulate:** Tắt backend server

**Action:** Click "Lưu" trong form

**Expected:**

- ✅ Loading spinner hiển thị
- ✅ Toast error: "Network Error" hoặc error message từ API
- ✅ Form không đóng
- ✅ Redux state: error = "Network Error"

---

#### Test Case 5: Duplicate Entry

**Scenario:** Tạo tiêu chí trùng tên

**Expected:**

- ✅ API response: 400 Bad Request
- ✅ Toast error: "Tiêu chí đã tồn tại"
- ✅ Form vẫn mở để user sửa

---

### 6.3. Permission & Security Tests

#### Test Case 6: Direct URL Access (No Auth)

**Action:** Logout → Truy cập http://localhost:3000/quanlycongviec/kpi/xem

**Expected:**

- ✅ Redirect về /login
- ✅ AuthRequire component block

---

#### Test Case 7: Role-based Access Control

**Login:** Employee (Role 1)  
**Action:** Truy cập http://localhost:3000/quanlycongviec/kpi/bao-cao

**Expected:**

- ✅ AdminRequire component block
- ✅ Redirect về NotFoundPage hoặc 403

---

### 6.4. Edge Cases

#### Test Case 8: Chấm điểm vượt quá DiemToiDa

**Scenario:** Tiêu chí có DiemToiDa = 20  
**Input:** Nhập điểm = **25**

**Expected:**

- ✅ TextField validation: max = 20
- ✅ Error message: "Điểm không được vượt quá 20"
- ✅ Hoặc auto-clamp về 20 (nếu có logic)

---

#### Test Case 9: Kết thúc chu kỳ đang có KPI chưa duyệt

**Scenario:**

- Chu kỳ: "KPI Tháng 10/2025" - Đang diễn ra
- Có 5 KPI, 2 đã duyệt, 3 chưa duyệt

**Action:** Click "Kết thúc" chu kỳ

**Expected:**

- ✅ Confirmation dialog: "Còn 3 đánh giá KPI chưa duyệt. Bạn có chắc muốn kết thúc chu kỳ?"
- ✅ Click "Kết thúc" → TrangThai = DA_KET_THUC
- ✅ Các KPI chưa duyệt: Vẫn còn TrangThai = CHUA_DUYET (không auto-duyệt)

---

#### Test Case 10: Xóa tiêu chí đang được sử dụng

**Scenario:**

- Tiêu chí: "Hoàn thành đúng hạn"
- Đã được sử dụng trong 10 DanhGiaKPI

**Action:** Click Delete tiêu chí

**Expected:**

- ✅ Backend kiểm tra: Có ChiTietDiem references?
- ✅ API response: 400 Bad Request
- ✅ Toast error: "Không thể xóa tiêu chí đang được sử dụng"
- ✅ Hoặc: Dialog xác nhận "Xóa tiêu chí sẽ xóa tất cả điểm liên quan. Bạn có chắc?"

---

## 7. CHECKLIST KIỂM TRA

### 7.1. Redux State Integrity

- [ ] `kpi.isLoading` = false khi không có API call
- [ ] `kpi.error` = null khi thành công
- [ ] `kpi.danhGiaKPIs` array cập nhật real-time
- [ ] `kpi.danhGiaKPICurrent` sync với dialog hiện tại
- [ ] `kpi.filterChuKyID` thay đổi khi select filter
- [ ] Redux DevTools: Actions log đầy đủ

---

### 7.2. UI/UX Quality

- [ ] Loading spinners hiển thị trong lúc fetch
- [ ] Buttons disabled khi isLoading = true
- [ ] Toast notifications xuất hiện đúng timing
- [ ] Dialogs đóng sau khi submit thành công
- [ ] Tables auto-refresh sau CRUD operations
- [ ] Search/Filter hoạt động real-time
- [ ] Responsive: Mobile/Tablet layout đúng
- [ ] No layout shift (CLS) khi load data

---

### 7.3. API Integration

- [ ] All 24 endpoints hoạt động
- [ ] Network tab: Correct HTTP methods (GET/POST/PUT/DELETE)
- [ ] Request headers: Authorization Bearer token
- [ ] Response format: { success, data, message }
- [ ] Error responses: { success: false, message }
- [ ] Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 404, 500

---

### 7.4. Data Consistency

- [ ] Backend auto-calculation chính xác (TongDiemTieuChi, DiemNhiemVu, TongDiemKPI)
- [ ] Hooks trigger đúng lúc (pre-save, post-update)
- [ ] MongoDB documents sync với frontend state
- [ ] Cascading updates: ChiTietDiem → NhiemVu → DanhGiaKPI
- [ ] No orphan data (xóa DanhGiaKPI → xóa DanhGiaNhiemVu)

---

### 7.5. Performance

- [ ] Initial page load < 2s
- [ ] API calls < 500ms (local backend)
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] Charts render smoothly (Recharts optimization)
- [ ] Large tables (100+ rows) with pagination
- [ ] useMemo/useCallback đúng chỗ

---

## 8. TROUBLESHOOTING

### Issue 1: "401 Unauthorized" khi gọi API

**Nguyên nhân:**

- Token JWT hết hạn
- Chưa login
- Token không được gửi trong headers

**Debug:**

1. Chrome DevTools → Application → Local Storage → Check `accessToken`
2. Network tab → Request Headers → Kiểm tra `Authorization: Bearer [token]`
3. Decode JWT tại https://jwt.io → Check `exp` timestamp

**Fix:**

- Logout → Login lại
- Hoặc implement refresh token logic

---

### Issue 2: Charts không hiển thị (Recharts)

**Nguyên nhân:**

- API trả về empty array
- Data format không đúng
- ResponsiveContainer height = 0

**Debug:**

1. Console log `thongKeData` trong component
2. Kiểm tra `thongKeData.danhSachKPI.length > 0`
3. Inspect element → Check container height

**Fix:**

- Tạo đủ test data (ít nhất 3-5 KPI)
- Set fixed height cho ResponsiveContainer
- Check data mapping logic

---

### Issue 3: Auto-calculation không chạy

**Nguyên nhân:**

- Backend hooks không trigger
- Middleware bị skip
- Validation error

**Debug:**

1. Backend console: Xem logs trong `pre('save')` hook
2. Check MongoDB logs: `db.danhgiakhis.find()`
3. API response: Verify `TongDiemKPI` field

**Fix:**

- Re-create DanhGiaKPI để trigger hooks
- Restart backend server
- Check model schema: Ensure hooks registered

---

### Issue 4: Dialog không đóng sau submit

**Nguyên nhân:**

- `closeFormDialog()` không được dispatch
- `isOpenFormDialog` state không update
- API error ngăn flow

**Debug:**

1. Redux DevTools → Actions → Tìm `closeFormDialog`
2. Console: Check có error trong catch block không
3. State: `kpi.isOpenFormDialog` vẫn = true

**Fix:**

- Thêm `dispatch(closeFormDialog())` trong `then()` block
- Đảm bảo không có error throw
- Check `slice.actions.setIsOpenFormDialog(false)`

---

### Issue 5: Permission guards không hoạt động

**Nguyên nhân:**

- `auth.user.Role` undefined
- AdminRequire component logic sai
- Menu roles config sai

**Debug:**

1. Redux state: `auth.user.Role` value?
2. Component: Log `auth.user` trong AdminRequire
3. Menu: Check `item.roles` array

**Fix:**

- Đảm bảo user data load đầy đủ sau login
- AdminRequire: `if (auth.user?.Role < 3) redirect()`
- Menu filtering: Filter items by user role

---

### Issue 6: Table không refresh sau CRUD

**Nguyên nhân:**

- Redux action không dispatch
- State không update
- Component không re-render

**Debug:**

1. Redux DevTools → State diff
2. React DevTools → Component props
3. Console: Log `useSelector` result

**Fix:**

- Dispatch `getDanhGiaKPIs()` sau create/update/delete
- Hoặc update state locally: `state.danhGiaKPIs.unshift(newItem)`
- Check `useEffect` dependencies

---

## 📊 SUMMARY METRICS

### Expected Test Results:

| Category          | Total Tests | Pass   | Fail  | Skip  |
| ----------------- | ----------- | ------ | ----- | ----- |
| Form Validation   | 3           | 3      | 0     | 0     |
| API Integration   | 24          | 24     | 0     | 0     |
| Permission Guards | 2           | 2      | 0     | 0     |
| Edge Cases        | 3           | 3      | 0     | 0     |
| UI/UX             | 10          | 10     | 0     | 0     |
| **TOTAL**         | **42**      | **42** | **0** | **0** |

---

## 🎯 TEST COMPLETION CRITERIA

**✅ System Ready for Production khi:**

1. **Functional:**

   - [ ] All 24 API endpoints hoạt động
   - [ ] CRUD operations thành công (Create, Read, Update, Delete)
   - [ ] Auto-calculation chính xác 100%
   - [ ] Workflow hoàn chỉnh: Setup → Chấm KPI → Duyệt → Báo cáo

2. **Security:**

   - [ ] Authentication required cho tất cả routes
   - [ ] Role-based access control hoạt động
   - [ ] Admin routes chặn Employee access
   - [ ] JWT token validation

3. **UX:**

   - [ ] No critical bugs (blocking workflow)
   - [ ] Loading states hiển thị đúng
   - [ ] Error handling graceful (user-friendly messages)
   - [ ] Responsive trên mobile/tablet

4. **Performance:**

   - [ ] Page load < 3s
   - [ ] API response < 1s
   - [ ] No memory leaks
   - [ ] Charts render smooth

5. **Data:**
   - [ ] No data loss sau refresh
   - [ ] Redux state persistent (nếu có)
   - [ ] MongoDB data consistent
   - [ ] Backup strategy (nếu production)

---

## 📝 FINAL NOTES

**Recommended Test Order:**

1. Admin setup (tiêu chí + chu kỳ) - 15 min
2. Manager workflow (chấm KPI) - 30 min
3. Employee view (read-only) - 10 min
4. Analytics & reports - 15 min
5. Edge cases & error handling - 20 min

**Total Testing Time:** ~90 minutes (1.5 hours)

**Best Practices:**

- ✅ Test từng feature một, không skip bước
- ✅ Dùng Chrome DevTools để debug
- ✅ Take screenshots nếu có bug
- ✅ Document issues trong Google Sheets hoặc Notion
- ✅ Retest sau fix bugs

**Next Steps sau Testing:**

1. Fix tất cả bugs tìm thấy
2. Code review (nếu có team)
3. Performance optimization (nếu cần)
4. Deploy lên staging/production
5. User acceptance testing (UAT)

---

**Good luck with testing! 🚀**
