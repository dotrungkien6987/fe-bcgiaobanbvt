# 🏠 Trang Chủ - Kế Hoạch Triển Khai Chi Tiết

**Date**: January 30, 2026  
**Version**: 2.0 (Simplified - No KPI)

---

## 📋 Tổng Quan

### Mục Tiêu

Xây dựng lại trang chủ với nguyên tắc:

- **At-a-glance**: 5 giây biết tình hình
- **Personal perspective**: Mọi số liệu theo CÁ NHÂN, không phải Khoa
- **Navigation hub**: Quick access to common actions
- **No KPI**: Loại bỏ hoàn toàn phần KPI (đã có trang riêng)

### Phạm Vi Công Việc

1. ✅ Tạo API mới cho Trang chủ (không sửa API hiện có)
2. ✅ Xây dựng lại UI components
3. ✅ Loại bỏ components không cần thiết
4. ✅ Bổ sung hoạt động YeuCau vào Timeline

---

## 📐 UI Layout Final

```
┌─────────────────────────────────────────────────────────┐
│ 👤 GREETING SECTION                                     │
│ Avatar + "Chào buổi sáng, Đỗ Trung Kiên"               │
│ Thứ Năm, 30 tháng 1, 2026              🔄 Refresh      │
└─────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────┐
│ ⚠️ ALERT BANNER (Conditional)                          │
│ "Bạn có 3 công việc quá hạn cần xử lý"    [Xem ngay]  │
└─────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────┐
│ QUICK ACTIONS (Grid 3x2)                                │
│ ┌─────────┬─────────┬─────────┐                        │
│ │📋 Việc  │✅ Việc  │📤 YC    │                        │
│ │Tôi nhận │Tôi giao │Tôi gửi  │                        │
│ ├─────────┼─────────┼─────────┤                        │
│ │📥 YC    │➕ Tạo   │📨 Gửi   │                        │
│ │Cần XL   │Công việc│Yêu cầu  │                        │
│ └─────────┴─────────┴─────────┘                        │
└─────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────┐
│ STATUS OVERVIEW (2 cards)                               │
│ ┌───────────────────────┬───────────────────────┐      │
│ │ 📋 CÔNG VIỆC          │ 📤 YÊU CẦU            │      │
│ │ ───────────────────── │ ───────────────────── │      │
│ │ Đang làm: 8           │ Tôi gửi: 12           │      │
│ │ Tôi giao: 5           │ Cần xử lý: 5          │      │
│ │ Gấp: 3 🔴            │ Quá hạn: 2 🔴         │      │
│ └───────────────────────┴───────────────────────┘      │
└─────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────┐
│ 🔴 CẦN XỬ LÝ GẤP (Max 5 items)                         │
│ ─────────────────────────────────────────────────────  │
│ [!] Hoàn thiện báo cáo            ⏰ Quá hạn 1 ngày   │
│ [!] Duyệt yêu cầu vật tư          ⏰ Còn 2 giờ        │
│ [!] Kiểm tra thiết bị             ⏰ Hết hạn hôm nay  │
│                                         [Xem tất cả →] │
└─────────────────────────────────────────────────────────┘
│
┌─────────────────────────────────────────────────────────┐
│ 🕐 HOẠT ĐỘNG GẦN ĐÂY (Max 5 items)                     │
│ ─────────────────────────────────────────────────────  │
│ ● 10:30 Kiên hoàn thành "Báo cáo tháng 1" (Công việc) │
│ ● 09:15 An bình luận trong "YC sửa máy X" (Yêu cầu)   │
│ ● 08:45 Bạn giao việc cho Trần Mai (Công việc)        │
│ ● Hôm qua Bạn tiếp nhận YC từ Khoa A (Yêu cầu)        │
│                                    [Lịch sử đầy đủ →]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schema Relationships

### User ↔ NhanVien

```
User {
  _id: ObjectId,
  NhanVienID: ObjectId → ref NhanVien,  // ⚠️ CRITICAL: Dùng field này cho mọi API
  KhoaID: ObjectId → ref Khoa,
  PhanQuyen: "admin" | "manager" | "nomal" | ...
}

NhanVien {
  _id: ObjectId,
  Ten: String,
  KhoaID: ObjectId → ref Khoa,
  Avatar: String,
  Images: [String],
  ...
}
```

**Quy tắc**:

- Frontend có `user` từ useAuth()
- `user.NhanVienID` là ID nhân viên, dùng cho tất cả API workmanagement
- `user._id` là ID user (authentication), KHÔNG dùng cho workmanagement

### QuanLyNhanVien (Để xác định Manager)

```
QuanLyNhanVien {
  NhanVienQuanLy: ObjectId → ref NhanVien,     // Người quản lý
  NhanVienDuocQuanLy: ObjectId → ref NhanVien, // Người được quản lý
  LoaiQuanLy: "KPI" | "Giao_Viec",
  isDeleted: Boolean
}
```

**Logic Manager**:

```javascript
// Kiểm tra user có phải Manager không
const isManager = await QuanLyNhanVien.exists({
  NhanVienQuanLy: nhanVienId,
  isDeleted: false,
});
```

### CongViec Schema (Relevant fields)

```
CongViec {
  _id: ObjectId,
  TieuDe: String,
  NguoiGiaoViecID: ObjectId → ref NhanVien,    // Người GIAO việc
  NguoiChinhID: ObjectId → ref NhanVien,       // Người NHẬN (thực hiện chính)
  NguoiThamGia: [{
    NhanVienID: ObjectId → ref NhanVien,
    VaiTro: "CHINH" | "PHOI_HOP"
  }],
  TrangThai: "TAO_MOI" | "DA_GIAO" | "DANG_THUC_HIEN" | "CHO_DUYET" | "HOAN_THANH",
  MucDoUuTien: "THAP" | "BINH_THUONG" | "CAO" | "KHAN_CAP",
  NgayHetHan: Date,
  isDeleted: Boolean
}
```

### YeuCau Schema (Relevant fields)

```
YeuCau {
  _id: ObjectId,
  MaYeuCau: String,
  TieuDe: String,
  NguoiYeuCauID: ObjectId → ref NhanVien,      // Người TẠO yêu cầu (gửi)
  KhoaNguonID: ObjectId → ref Khoa,
  KhoaDichID: ObjectId → ref Khoa,             // Khoa nhận
  NguoiNhanID: ObjectId → ref NhanVien,        // Người nhận trực tiếp (nếu CA_NHAN)
  NguoiDuocDieuPhoiID: ObjectId → ref NhanVien,// Người được điều phối
  NguoiXuLyID: ObjectId → ref NhanVien,        // Người thực sự xử lý
  LoaiNguoiNhan: "KHOA" | "CA_NHAN",
  TrangThai: "MOI" | "DANG_XU_LY" | "DA_HOAN_THANH" | "DA_DONG" | "TU_CHOI",
  ThoiGianHen: Date,                            // Deadline
  isDeleted: Boolean
}
```

---

## 📡 API Design

### Nguyên Tắc

1. ✅ Tạo API MỚI riêng cho Trang chủ
2. ❌ KHÔNG sửa API hiện có (đang dùng cho các trang khác)
3. ✅ Có thể tận dụng service functions nếu cần

---

### API 1: Home Summary (MỚI)

**Route**: `GET /api/workmanagement/home/summary/:nhanVienId`

**Purpose**: Lấy tất cả số liệu cho 2 cards (Công việc + Yêu cầu) trong 1 request

**Response**:

```json
{
  "success": true,
  "data": {
    "congViec": {
      "dangLam": 8, // Tôi là NguoiChinhID, TrangThai active
      "toiGiao": 5, // Tôi là NguoiGiaoViecID, TrangThai active
      "gap": 3, // Deadline ≤ 24h
      "quaHan": 2 // Deadline < now
    },
    "yeuCau": {
      "toiGui": 12, // NguoiYeuCauID = me
      "canXuLy": 5, // NguoiDuocDieuPhoiID = me OR NguoiNhanID = me, status MOI/DANG_XU_LY
      "quaHan": 2 // ThoiGianHen < now, chưa hoàn thành
    },
    "alert": {
      "hasUrgent": true,
      "message": "Bạn có 2 công việc quá hạn và 3 công việc hết hạn hôm nay",
      "type": "warning" // "warning" | "error"
    }
  }
}
```

**Backend Logic**:

```javascript
// congViec.dangLam: Công việc TÔI đang thực hiện (tôi là người chính)
const dangLam = await CongViec.countDocuments({
  NguoiChinhID: nhanVienId,
  TrangThai: { $in: ["DA_GIAO", "DANG_THUC_HIEN", "CHO_DUYET"] },
  isDeleted: false,
});

// congViec.toiGiao: Công việc TÔI giao cho người khác
const toiGiao = await CongViec.countDocuments({
  NguoiGiaoViecID: nhanVienId,
  NguoiChinhID: { $ne: nhanVienId }, // Không phải tự giao cho mình
  TrangThai: { $in: ["DA_GIAO", "DANG_THUC_HIEN", "CHO_DUYET"] },
  isDeleted: false,
});

// congViec.gap: Deadline trong 24h
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const gap = await CongViec.countDocuments({
  $or: [{ NguoiChinhID: nhanVienId }, { NguoiGiaoViecID: nhanVienId }],
  TrangThai: { $nin: ["HOAN_THANH"] },
  NgayHetHan: { $exists: true, $lte: tomorrow, $gt: now },
  isDeleted: false,
});

// congViec.quaHan: Đã quá deadline
const quaHan = await CongViec.countDocuments({
  $or: [{ NguoiChinhID: nhanVienId }, { NguoiGiaoViecID: nhanVienId }],
  TrangThai: { $nin: ["HOAN_THANH"] },
  NgayHetHan: { $exists: true, $lt: now },
  isDeleted: false,
});

// yeuCau.toiGui: Yêu cầu TÔI gửi
const toiGui = await YeuCau.countDocuments({
  NguoiYeuCauID: nhanVienId,
  isDeleted: false,
});

// yeuCau.canXuLy: Yêu cầu CẦN TÔI xử lý (perspective CÁ NHÂN)
const canXuLy = await YeuCau.countDocuments({
  $or: [
    { NguoiDuocDieuPhoiID: nhanVienId }, // Được điều phối cho tôi
    { NguoiNhanID: nhanVienId }, // Gửi trực tiếp cho tôi
    { NguoiXuLyID: nhanVienId }, // Tôi đang xử lý
  ],
  TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
  isDeleted: false,
});

// yeuCau.quaHan: Yêu cầu quá hạn mà tôi liên quan
const ycQuaHan = await YeuCau.countDocuments({
  $or: [
    { NguoiDuocDieuPhoiID: nhanVienId },
    { NguoiNhanID: nhanVienId },
    { NguoiXuLyID: nhanVienId },
  ],
  TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
  ThoiGianHen: { $exists: true, $lt: now },
  isDeleted: false,
});
```

---

### API 2: Urgent Items (MỚI hoặc SỬA API riêng cho home)

**Route**: `GET /api/workmanagement/home/urgent/:nhanVienId?limit=5`

**Purpose**: Lấy top N items CẦN XỬ LÝ GẤP (cả CongViec và YeuCau)

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "CONG_VIEC",
        "id": "...",
        "tieuDe": "Hoàn thiện báo cáo",
        "deadline": "2026-01-30T10:00:00Z",
        "status": "DANG_THUC_HIEN",
        "priority": "CAO",
        "isOverdue": true,
        "timeRemaining": "-1 ngày", // hoặc "Còn 2 giờ"
        "nguoiLienQuan": {
          "ten": "Nguyễn Văn A",
          "vaiTro": "Người giao"
        }
      },
      {
        "type": "YEU_CAU",
        "id": "...",
        "maYeuCau": "YC2026001",
        "tieuDe": "Yêu cầu sửa máy X",
        "deadline": "2026-01-30T14:00:00Z",
        "status": "MOI",
        "isOverdue": false,
        "timeRemaining": "Còn 4 giờ",
        "nguoiLienQuan": {
          "ten": "Trần Thị B",
          "vaiTro": "Người gửi"
        }
      }
    ],
    "total": 8
  }
}
```

**Backend Logic**:

```javascript
// Lấy CongViec gấp (deadline ≤ 24h hoặc quá hạn)
const urgentCongViec = await CongViec.find({
  $or: [{ NguoiChinhID: nhanVienId }, { NguoiGiaoViecID: nhanVienId }],
  TrangThai: { $nin: ["HOAN_THANH"] },
  NgayHetHan: { $exists: true, $lte: tomorrow },
  isDeleted: false,
})
  .sort({ NgayHetHan: 1 })
  .limit(10)
  .populate("NguoiGiaoViecID", "Ten")
  .populate("NguoiChinhID", "Ten")
  .lean();

// Lấy YeuCau gấp
const urgentYeuCau = await YeuCau.find({
  $or: [
    { NguoiDuocDieuPhoiID: nhanVienId },
    { NguoiNhanID: nhanVienId },
    { NguoiXuLyID: nhanVienId },
  ],
  TrangThai: { $in: ["MOI", "DANG_XU_LY"] },
  ThoiGianHen: { $exists: true, $lte: tomorrow },
  isDeleted: false,
})
  .sort({ ThoiGianHen: 1 })
  .limit(10)
  .populate("NguoiYeuCauID", "Ten")
  .lean();

// Merge và sort theo deadline
const allUrgent = [
  ...urgentCongViec.map((cv) => ({
    type: "CONG_VIEC",
    deadline: cv.NgayHetHan,
    ...cv,
  })),
  ...urgentYeuCau.map((yc) => ({
    type: "YEU_CAU",
    deadline: yc.ThoiGianHen,
    ...yc,
  })),
]
  .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  .slice(0, limit);
```

---

### API 3: Recent Activities (SỬA API riêng cho home)

**Route**: `GET /api/workmanagement/home/activities/:nhanVienId?limit=5`

**Purpose**: Lấy hoạt động gần đây từ cả CongViec và YeuCau

**Response**:

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "CONG_VIEC",
        "loaiHoatDong": "TRANG_THAI",
        "moTa": "Đỗ Trung Kiên đã hoàn thành công việc",
        "congViec": {
          "id": "...",
          "tieuDe": "Báo cáo tháng 1"
        },
        "nguoiThucHien": {
          "ten": "Đỗ Trung Kiên",
          "avatar": "..."
        },
        "thoiGian": "2026-01-30T10:30:00Z"
      },
      {
        "type": "YEU_CAU",
        "loaiHoatDong": "TIEP_NHAN",
        "moTa": "Bạn đã tiếp nhận yêu cầu từ Khoa A",
        "yeuCau": {
          "id": "...",
          "maYeuCau": "YC2026001",
          "tieuDe": "Yêu cầu sửa máy"
        },
        "nguoiThucHien": {
          "ten": "Bạn",
          "avatar": "..."
        },
        "thoiGian": "2026-01-29T16:30:00Z"
      }
    ]
  }
}
```

**Backend Logic**:

```javascript
// Hoạt động CongViec (từ LichSuTrangThai, LichSuTienDo)
// ... existing logic from layHoatDongGanDay

// Hoạt động YeuCau (từ LichSuYeuCau collection)
const ycActivities = await LichSuYeuCau.find({
  $or: [
    { NguoiThucHienID: nhanVienId }, // Tôi thực hiện
    { YeuCauID: { $in: myRelatedYeuCauIds } }, // YC liên quan đến tôi
  ],
})
  .sort({ ThoiGian: -1 })
  .limit(10)
  .populate("NguoiThucHienID", "Ten Images")
  .populate({
    path: "YeuCauID",
    select: "TieuDe MaYeuCau",
  })
  .lean();

// Merge và sort
const allActivities = [
  ...cvActivities.map((a) => ({ ...a, type: "CONG_VIEC" })),
  ...ycActivities.map((a) => ({ ...a, type: "YEU_CAU" })),
]
  .sort((a, b) => new Date(b.thoiGian) - new Date(a.thoiGian))
  .slice(0, limit);
```

---

## 🎨 Frontend Components

### Components Structure

```
src/features/QuanLyCongViec/Dashboard/
├── UnifiedDashboardPage.js      # Main page (REWRITE)
├── components/
│   ├── GreetingSection.js       # KEEP (có sẵn)
│   ├── AlertBanner.js           # NEW
│   ├── QuickActionsGrid.js      # NEW (thay thế buttons rời rạc)
│   ├── StatusOverviewCards.js   # NEW (2 cards: CongViec + YeuCau)
│   ├── UrgentItemsList.js       # NEW (mixed CongViec + YeuCau)
│   ├── RecentActivitiesTimeline.js  # MODIFY (thêm YeuCau)
│   ├── PriorityTasksWidget.js   # DELETE (thay bằng UrgentItemsList)
│   └── TeamOverviewWidget.js    # DELETE (không cần nữa)
```

### Component Specs

#### 1. GreetingSection (KEEP)

- Avatar + Tên + Thời gian + Refresh
- Đã có, chỉ cần giữ nguyên

#### 2. AlertBanner (NEW)

```jsx
function AlertBanner({ alert, onViewClick }) {
  if (!alert?.hasUrgent) return null;

  return (
    <Alert
      severity={alert.type}
      action={<Button onClick={onViewClick}>Xem ngay</Button>}
    >
      {alert.message}
    </Alert>
  );
}
```

#### 3. QuickActionsGrid (NEW)

```jsx
const QUICK_ACTIONS = [
  {
    id: "received",
    label: "Công việc tôi nhận",
    icon: Task,
    route: "/congviec/my-tasks",
    color: "primary",
  },
  {
    id: "assigned",
    label: "Công việc tôi giao",
    icon: TaskSquare,
    route: "/congviec/assigned-tasks",
    color: "secondary",
  },
  {
    id: "yc-sent",
    label: "Yêu cầu tôi gửi",
    icon: Send2,
    route: "/yeucau/toi-gui",
    color: "info",
  },
  {
    id: "yc-process",
    label: "Yêu cầu cần xử lý",
    icon: ReceiveSquare,
    route: "/yeucau/xu-ly",
    color: "warning",
  },
  {
    id: "create-task",
    label: "Tạo công việc",
    icon: AddCircle,
    route: "/congviec/create",
    color: "success",
  },
  {
    id: "create-yc",
    label: "Gửi yêu cầu",
    icon: MessageAdd,
    route: "/yeucau/create",
    color: "success",
  },
];
```

#### 4. StatusOverviewCards (NEW)

2 cards nằm ngang:

- **Card Công việc**: Đang làm, Tôi giao, Gấp, Quá hạn
- **Card Yêu cầu**: Tôi gửi, Cần xử lý, Quá hạn

#### 5. UrgentItemsList (NEW)

- Mixed list CongViec + YeuCau
- Sort by deadline (gấp nhất lên đầu)
- Max 5 items
- Mỗi item: Icon (type), Title, Countdown, Action button

#### 6. RecentActivitiesTimeline (MODIFY)

- Thêm type YeuCau
- Different icon/color cho CongViec vs YeuCau

---

## 🔄 Redux State (Simplified)

```javascript
// workDashboardSlice.js - SIMPLIFIED
const initialState = {
  isLoading: false,
  error: null,

  // Home summary (single API call)
  homeSummary: {
    congViec: { dangLam: 0, toiGiao: 0, gap: 0, quaHan: 0 },
    yeuCau: { toiGui: 0, canXuLy: 0, quaHan: 0 },
    alert: null,
  },

  // Urgent items (mixed CongViec + YeuCau)
  urgentItems: {
    items: [],
    total: 0,
    isLoading: false,
  },

  // Recent activities (mixed)
  recentActivities: {
    items: [],
    isLoading: false,
  },

  lastFetchTime: null,
};
```

---

## 📋 Implementation Steps

### Phase 1: Backend APIs (Day 1)

#### Step 1.1: Create Home Controller

**File**: `giaobanbv-be/modules/workmanagement/controllers/home.controller.js`

```javascript
// NEW FILE
const {
  catchAsync,
  sendResponse,
  AppError,
} = require("../../../helpers/utils");
const CongViec = require("../models/CongViec");
const YeuCau = require("../models/YeuCau");

const controller = {};

/**
 * Get home summary for Trang chủ
 * GET /api/workmanagement/home/summary/:nhanVienId
 */
controller.getHomeSummary = catchAsync(async (req, res, next) => {
  // ... implementation
});

/**
 * Get urgent items (mixed CongViec + YeuCau)
 * GET /api/workmanagement/home/urgent/:nhanVienId
 */
controller.getUrgentItems = catchAsync(async (req, res, next) => {
  // ... implementation
});

/**
 * Get recent activities (mixed CongViec + YeuCau)
 * GET /api/workmanagement/home/activities/:nhanVienId
 */
controller.getRecentActivities = catchAsync(async (req, res, next) => {
  // ... implementation
});

module.exports = controller;
```

#### Step 1.2: Create Home Routes

**File**: `giaobanbv-be/modules/workmanagement/routes/home.api.js`

```javascript
// NEW FILE
const express = require("express");
const router = express.Router();
const authentication = require("../../../middlewares/authentication");
const homeController = require("../controllers/home.controller");

router.use(authentication.loginRequired);

router.get("/summary/:nhanVienId", homeController.getHomeSummary);
router.get("/urgent/:nhanVienId", homeController.getUrgentItems);
router.get("/activities/:nhanVienId", homeController.getRecentActivities);

module.exports = router;
```

#### Step 1.3: Register Routes

**File**: `giaobanbv-be/modules/workmanagement/routes/index.js`

- Add: `router.use("/home", require("./home.api"));`

---

### Phase 2: Frontend Redux (Day 1-2)

#### Step 2.1: Simplify workDashboardSlice

- Remove KPI-related state and thunks
- Add new thunks for 3 new APIs
- Simplify state structure

#### Step 2.2: Update thunks

```javascript
export const fetchHomeSummary = (nhanVienId) => async (dispatch) => {
  // Call GET /home/summary/:nhanVienId
};

export const fetchUrgentItems =
  (nhanVienId, limit = 5) =>
  async (dispatch) => {
    // Call GET /home/urgent/:nhanVienId
  };

export const fetchRecentActivities =
  (nhanVienId, limit = 5) =>
  async (dispatch) => {
    // Call GET /home/activities/:nhanVienId
  };
```

---

### Phase 3: Frontend Components (Day 2-3)

#### Step 3.1: Create New Components

- AlertBanner.js
- QuickActionsGrid.js
- StatusOverviewCards.js
- UrgentItemsList.js

#### Step 3.2: Modify Existing

- RecentActivitiesTimeline.js (add YeuCau support)

#### Step 3.3: Delete Unused

- PriorityTasksWidget.js
- TeamOverviewWidget.js

#### Step 3.4: Rewrite UnifiedDashboardPage

- New layout structure
- Use new components
- Simplified data flow

---

### Phase 4: Testing & Polish (Day 3)

#### Step 4.1: Test với data thực

- Verify counts are correct
- Test với user có/không có data
- Test với Manager vs Employee

#### Step 4.2: Mobile Optimization

- Responsive grid
- Touch-friendly buttons
- Skeleton loading

#### Step 4.3: Error Handling

- Empty states
- Error boundaries
- Loading states

---

## ✅ Checklist

### Backend

- [ ] Create home.controller.js
- [ ] Create home.api.js
- [ ] Register routes in index.js
- [ ] Test API với Postman

### Frontend

- [ ] Simplify workDashboardSlice.js
- [ ] Create AlertBanner.js
- [ ] Create QuickActionsGrid.js
- [ ] Create StatusOverviewCards.js
- [ ] Create UrgentItemsList.js
- [ ] Modify RecentActivitiesTimeline.js
- [ ] Delete PriorityTasksWidget.js
- [ ] Delete TeamOverviewWidget.js
- [ ] Rewrite UnifiedDashboardPage.js
- [ ] Test UI

### Cleanup

- [ ] Remove unused imports
- [ ] Remove KPI-related code from dashboard
- [ ] Update navigation if needed

---

## 📝 Notes

### API Không Sửa (Preserve)

- `GET /congviec/summary/:nhanVienId` - Giữ nguyên cho các trang khác
- `GET /yeucau/summary/:nhanVienId` - Giữ nguyên
- `GET /congviec/urgent/:nhanVienId` - Giữ nguyên
- `GET /congviec/hoat-dong-gan-day` - Giữ nguyên

### API Mới (Trang Chủ Only)

- `GET /home/summary/:nhanVienId` - Combined summary
- `GET /home/urgent/:nhanVienId` - Mixed urgent items
- `GET /home/activities/:nhanVienId` - Mixed activities

### Manager Logic

- Chỉ khác ở Quick Actions (có thể thêm button nếu cần)
- Data vẫn giống Employee (personal perspective)

---

**Ready to implement?** Xác nhận để bắt đầu Phase 1!
