# 🚀 Ticket System - Implementation Plan

> **Mục tiêu**: Triển khai Hệ thống Yêu cầu hỗ trợ liên khoa  
> **Ước tính**: 8-10 ngày (có thể song song)  
> **Cập nhật**: 01/06/2025

---

## 📊 Tổng Quan Phases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION ROADMAP                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Phase 0          Phase 1           Phase 2          Phase 3            │
│  ════════         ════════          ════════         ════════           │
│  Cleanup     →    Models       →    Services    →   Controllers         │
│  (30 phút)        (2 ngày)          (2 ngày)        (1 ngày)            │
│                                                                          │
│         ↓                ↓                ↓               ↓              │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                     Phase 4: Frontend                         │       │
│  │                        (3-4 ngày)                             │       │
│  │   Redux Slice → Components → Pages → Integration              │       │
│  └──────────────────────────────────────────────────────────────┘       │
│                                    ↓                                     │
│                           Phase 5: Testing                               │
│                              (1 ngày)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Cleanup Legacy ⏳

> **Docs**: [04_PHASE0_CLEANUP.md](./04_PHASE0_CLEANUP.md)  
> **Status**: 📝 Chưa thực hiện

### Checklist

- [ ] Xóa 4 model files cũ (Ticket.js, TicketCategory.js, YeuCauHoTro.js, LoaiYeuCauHoTro.js)
- [ ] Cập nhật `models/index.js` - xóa exports
- [ ] Cập nhật `BinhLuan.js` - xóa field `YeuCauHoTroID`
- [ ] Cập nhật `TepTin.js` - xóa field `YeuCauHoTroID`
- [ ] Xóa notification templates cũ (TICKET_CREATED, TICKET_RESOLVED)
- [ ] Xóa docs cũ (TicketSystem.md, 04_Backend_Tickets_System_APIs.md)
- [ ] Test: BE khởi động không lỗi

---

## Phase 1: Backend Models 🗃️

> **Docs**: [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md)  
> **Status**: 📝 Chưa bắt đầu

### 1.1. Models mới cần tạo

```
modules/workmanagement/models/
├── DanhMucYeuCau.js      # Danh mục yêu cầu theo khoa
├── LyDoTuChoi.js         # Lý do từ chối (master data)
├── CauHinhThongBaoKhoa.js # Config điều phối + CC
├── YeuCau.js             # Model chính
├── YeuCauCounter.js      # Auto-generate mã YC{YYYY}{NNNNNN}
└── LichSuYeuCau.js       # Audit trail
```

### 1.2. Models cần cập nhật

```
BinhLuan.js:
  + YeuCauID: ObjectId, ref: "YeuCau"  // Thêm field
  + Validation: phải có CongViecID HOẶC YeuCauID
  + Index: { YeuCauID: 1, createdAt: -1 }

TepTin.js:
  + YeuCauID: ObjectId, ref: "YeuCau"  // Thêm field
  + Validation tương tự BinhLuan
  + Index: { YeuCauID: 1, createdAt: -1 }
```

### 1.3. Lưu ý Implementation

- **YeuCauCounter**: Dùng `findOneAndUpdate` với `upsert: true` để atomic increment
- **YeuCau.TrangThai**: Chỉ 5 giá trị enum, đã bỏ DA_TIEP_NHAN, DA_HUY
- **DanhGia**: Embedded object trong YeuCau, không tách collection

---

## Phase 2: Backend Services 🔧

> **Status**: 📝 Chưa bắt đầu

### 2.1. State Machine Service

```
services/yeuCauStateMachine.js

┌─────────────────────────────────────────────────────────────────┐
│                    STATE MACHINE SERVICE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRANSITIONS = {                                                 │
│    MOI: {                                                        │
│      TIEP_NHAN    → DANG_XU_LY  (set NguoiXuLyID, ThoiGianHen)  │
│      TU_CHOI      → TU_CHOI     (set LyDoTuChoiID)              │
│      DIEU_PHOI    → MOI         (set NguoiDuocDieuPhoiID)       │
│      GUI_VE_KHOA  → MOI         (clear NguoiNhanID)             │
│      XOA          → [deleted]   (hard delete, ghi log trước)    │
│    },                                                            │
│    DANG_XU_LY: {                                                 │
│      HOAN_THANH   → DA_HOAN_THANH  (set NgayHoanThanh)          │
│      HUY_TIEP_NHAN → MOI           (clear NguoiXuLyID, etc)     │
│      DOI_THOI_GIAN → DANG_XU_LY    (update ThoiGianHen)         │
│    },                                                            │
│    DA_HOAN_THANH: {                                              │
│      DANH_GIA     → DA_DONG     (set DanhGia, NgayDong)         │
│      DONG         → DA_DONG     (set NgayDong)                  │
│      YEU_CAU_TIEP → DANG_XU_LY  (clear NgayHoanThanh)           │
│    },                                                            │
│    DA_DONG: {                                                    │
│      MO_LAI       → DA_HOAN_THANH  (within 7 days, clear NgayDong)│
│    },                                                            │
│    TU_CHOI: {                                                    │
│      APPEAL       → MOI         (require LyDoAppeal)            │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  Methods:                                                        │
│  ─────────                                                       │
│  executeTransition(yeuCau, action, data, nguoiThucHien)         │
│    → validate permission                                         │
│    → validate required fields                                    │
│    → apply side effects                                          │
│    → save                                                        │
│    → log to LichSuYeuCau                                        │
│    → trigger notifications                                       │
│                                                                  │
│  getAvailableActions(yeuCau, currentUser)                       │
│    → return list of valid actions based on state + role         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. Auto-Close Scheduler (Agenda Job)

```
jobs/yeuCauAutoClose.js

Chạy: Mỗi ngày 00:00 (hoặc mỗi giờ)

Logic:
  1. Tìm YeuCau có:
     - TrangThai = "DA_HOAN_THANH"
     - NgayHoanThanh < now() - 3 days

  2. Với mỗi yêu cầu:
     - Set TrangThai = "DA_DONG"
     - Set DanhGia.SoSao = 5 (mặc định)
     - Set NgayDong = now()
     - Ghi LichSu: HanhDong = "TU_DONG_DONG"
     - Gửi notification cho NguoiGui
```

### 2.3. Rate Limit Service

```
services/rateLimitService.js

checkRateLimit(yeuCauId, nguoiThucHienId, action):

  Limits:
    NHAC_LAI: 3/ngày
    BAO_QUAN_LY: 1/ngày

  Implementation:
    Count LichSuYeuCau today where:
      - YeuCauID = yeuCauId
      - NguoiThucHienID = nguoiThucHienId
      - HanhDong = action
      - ThoiGian >= startOfToday

    If count >= limit → throw AppError
```

---

## Phase 3: Backend Controllers & Routes 🛣️

> **Status**: 📝 Chưa bắt đầu

### 3.1. API Endpoints Overview

```
/api/workmanagement/yeucau/

┌────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DANH MỤC                                                               │
│  ────────                                                               │
│  GET    /danhmuc?khoaId=xxx           # Lấy danh mục theo khoa         │
│  POST   /danhmuc                      # Tạo danh mục (Admin khoa)      │
│  PUT    /danhmuc/:id                  # Cập nhật                       │
│  DELETE /danhmuc/:id                  # Xóa (soft)                     │
│                                                                         │
│  LÝ DO TỪ CHỐI                                                          │
│  ─────────────                                                          │
│  GET    /lydotuchoi                   # Lấy tất cả                     │
│  POST   /lydotuchoi                   # Tạo (SuperAdmin)               │
│                                                                         │
│  CẤU HÌNH THÔNG BÁO                                                     │
│  ──────────────────                                                     │
│  GET    /cauhinhthongbao/:khoaId      # Lấy config khoa                │
│  PUT    /cauhinhthongbao/:khoaId      # Cập nhật (Admin khoa)          │
│                                                                         │
│  YÊU CẦU - CRUD                                                         │
│  ─────────────                                                          │
│  GET    /                             # List (có filter, pagination)   │
│  GET    /:id                          # Chi tiết                       │
│  POST   /                             # Tạo mới                        │
│  PUT    /:id                          # Sửa (chỉ khi MOI, NguoiGui)    │
│  DELETE /:id                          # Xóa (chỉ khi MOI)              │
│                                                                         │
│  YÊU CẦU - ACTIONS                                                      │
│  ────────────────                                                       │
│  POST   /:id/tiepnhan                 # Tiếp nhận                      │
│  POST   /:id/tuchoi                   # Từ chối                        │
│  POST   /:id/dieuphoi                 # Điều phối                      │
│  POST   /:id/guivekhoa                # Gửi về khoa                    │
│  POST   /:id/hoanthanh                # Báo hoàn thành                 │
│  POST   /:id/huytiepnhan              # Hủy tiếp nhận                  │
│  POST   /:id/doithoigianhen           # Đổi thời gian hẹn             │
│  POST   /:id/danhgia                  # Đánh giá (kèm đóng)            │
│  POST   /:id/dong                     # Đóng thủ công                  │
│  POST   /:id/molai                    # Mở lại                         │
│  POST   /:id/appeal                   # Khiếu nại                      │
│  POST   /:id/nhaclai                  # Nhắc lại (rate limit)          │
│  POST   /:id/baoquanly                # Báo quản lý (rate limit)       │
│                                                                         │
│  COMMENT & FILES (tái sử dụng)                                          │
│  ─────────────────────────────                                          │
│  GET    /:id/binhluan                 # Lấy comments                   │
│  POST   /:id/binhluan                 # Thêm comment                   │
│  GET    /:id/teptin                   # Lấy files                      │
│  POST   /:id/teptin                   # Upload file                    │
│                                                                         │
│  LỊCH SỬ                                                                │
│  ───────                                                                │
│  GET    /:id/lichsu                   # Timeline của yêu cầu           │
│                                                                         │
│  DASHBOARD                                                              │
│  ─────────                                                              │
│  GET    /dashboard/metrics            # 10 metrics tổng hợp            │
│  GET    /dashboard/chart              # Data cho charts                │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Controller Pattern

```
Mỗi action controller:

  1. Validate input (Joi/Yup)
  2. Load yeuCau with necessary populates
  3. Check permission (isNguoiGui? isDieuPhoi? isNguoiXuLy?)
  4. Call stateMachine.executeTransition()
  5. Return updated yeuCau

Error handling:
  - 400: Validation error
  - 403: Permission denied
  - 404: YeuCau not found
  - 409: Invalid state transition
  - 429: Rate limit exceeded
```

---

## Phase 4: Frontend 🖥️

> **Status**: 📝 Chưa bắt đầu

### 4.1. Redux Slice Structure

```
features/YeuCau/
├── yeuCauSlice.js        # Main slice
├── yeuCauSelectors.js    # Memoized selectors
└── yeuCauThunks.js       # Async actions (if separate)

State shape:
{
  isLoading: false,
  error: null,

  // Lists
  danhSachYeuCau: [],           // Paginated list
  pagination: { page, limit, total },
  filters: { trangThai, khoaId, tuNgay, denNgay, loaiYeuCau },

  // Detail
  currentYeuCau: null,
  lichSu: [],
  binhLuan: [],
  tepTin: [],

  // Master data (cached)
  danhMucByKhoa: {},            // { khoaId: [danhmuc...] }
  lyDoTuChoi: [],
  cauHinhThongBao: null,

  // Dashboard
  dashboardMetrics: null,

  // UI State
  availableActions: [],         // Actions user can perform
}
```

### 4.2. Component Hierarchy

```
pages/
└── YeuCauPage.js                 # Main page with tabs

features/YeuCau/
├── components/
│   │
│   │  ═══════════════════════════════════════════════════════
│   │                    LIST VIEW
│   │  ═══════════════════════════════════════════════════════
│   │
│   ├── YeuCauList/
│   │   ├── YeuCauTable.js        # React Table với columns
│   │   ├── YeuCauFilters.js      # Filter bar (status, khoa, date)
│   │   ├── YeuCauStatusChip.js   # Chip màu theo trạng thái
│   │   └── YeuCauQuickActions.js # Quick actions trong row
│   │
│   │  ═══════════════════════════════════════════════════════
│   │                    DETAIL VIEW
│   │  ═══════════════════════════════════════════════════════
│   │
│   ├── YeuCauDetail/
│   │   ├── YeuCauDetailPage.js   # Full page detail
│   │   ├── YeuCauHeader.js       # Mã, tiêu đề, trạng thái, actions
│   │   ├── YeuCauInfo.js         # Thông tin chi tiết
│   │   ├── YeuCauTimeline.js     # Lịch sử thay đổi
│   │   ├── YeuCauComments.js     # Bình luận (reuse từ CongViec)
│   │   └── YeuCauFiles.js        # File đính kèm (reuse)
│   │
│   │  ═══════════════════════════════════════════════════════
│   │                    FORMS
│   │  ═══════════════════════════════════════════════════════
│   │
│   ├── Forms/
│   │   ├── TaoYeuCauForm.js      # Form tạo mới (Dialog)
│   │   ├── TiepNhanForm.js       # Dialog tiếp nhận (+ thời gian hẹn)
│   │   ├── TuChoiForm.js         # Dialog từ chối (+ lý do)
│   │   ├── DieuPhoiForm.js       # Dialog điều phối (+ chọn người)
│   │   ├── DanhGiaForm.js        # Dialog đánh giá (1-5 sao)
│   │   ├── MoLaiForm.js          # Dialog mở lại (+ lý do)
│   │   └── AppealForm.js         # Dialog khiếu nại (+ lý do)
│   │
│   │  ═══════════════════════════════════════════════════════
│   │                    DASHBOARD
│   │  ═══════════════════════════════════════════════════════
│   │
│   └── Dashboard/
│       ├── YeuCauDashboard.js    # Main dashboard page
│       ├── MetricCards.js        # 10 metric cards
│       └── YeuCauCharts.js       # Charts (bar, pie, line)
│
└── config/
    ├── yeuCauColumns.js          # Table column definitions
    ├── yeuCauStatusConfig.js     # Status colors, labels
    └── yeuCauValidation.js       # Yup schemas
```

### 4.3. UI/UX Key Points

#### 4.3.1. List View UX

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏠 Quản lý Yêu cầu                                      [+ Tạo mới]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─── TABS ────────────────────────────────────────────────────────┐   │
│  │ [Tất cả] [Tôi gửi] [Cần xử lý] [Đã xử lý] [Dashboard]           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─── FILTERS ─────────────────────────────────────────────────────┐   │
│  │ Trạng thái: [All ▼]  Khoa: [All ▼]  Từ: [__/__]  Đến: [__/__]  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─── TABLE ───────────────────────────────────────────────────────┐   │
│  │ Mã      │ Tiêu đề      │ Khoa đích │ Trạng thái │ Hẹn    │ ⚡   │   │
│  ├─────────┼──────────────┼───────────┼────────────┼────────┼──────┤   │
│  │YC202401 │ Sửa máy X... │ IT        │ 🔵 Mới     │ 3 ngày │ •••  │   │
│  │YC202402 │ Yêu cầu...   │ Dược      │ 🟠 Đang XL │ 1 ngày │ •••  │   │
│  │YC202403 │ Hỗ trợ...    │ CĐHA      │ 🟢 Hoàn th │ -      │ •••  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Hiển thị 1-10 của 45                      [<] [1] [2] [3] [4] [5] [>] │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Quick Actions (⚡ menu):
  - MOI: [Tiếp nhận] [Từ chối] [Điều phối]
  - DANG_XU_LY: [Hoàn thành] [Hủy tiếp nhận]
  - DA_HOAN_THANH: [Đánh giá] [Đóng]
```

#### 4.3.2. Detail View UX

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Quay lại                                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─── HEADER ──────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  YC2024000123                              🟠 ĐANG XỬ LÝ        │   │
│  │  ══════════════════════════════════════════════════════════════ │   │
│  │  Yêu cầu sửa máy siêu âm phòng 201                              │   │
│  │                                                                  │   │
│  │  👤 Nguyễn Văn A (Khoa Nội)  →  🏥 Khoa IT                      │   │
│  │  📅 Tạo: 01/06/2025 09:30    ⏰ Hẹn: 03/06/2025                 │   │
│  │                                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │  [Hoàn thành]  [Đổi thời gian]  [Hủy tiếp nhận]        │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─── TABS ────────────────────────────────────────────────────────┐   │
│  │ [Thông tin] [Lịch sử (5)] [Bình luận (3)] [Tệp đính kèm (2)]   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─── CONTENT (Lịch sử) ───────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │  ⬤ 01/06 14:30 - Trần B tiếp nhận                               │   │
│  │  │  "Sẽ xử lý trong ngày"                                       │   │
│  │  │  Thời gian hẹn: 03/06/2025                                   │   │
│  │  │                                                               │   │
│  │  ⬤ 01/06 09:30 - Nguyễn A tạo yêu cầu                           │   │
│  │     Loại: Sửa chữa thiết bị                                     │   │
│  │     Mức độ: Bình thường                                         │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 4.3.3. Form UX Principles

```
TẠO YÊU CẦU FORM:
━━━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│  Tạo yêu cầu mới                      [X]  │
├────────────────────────────────────────────┤
│                                            │
│  Gửi đến: ○ Khoa  ○ Cá nhân               │
│                                            │
│  [Select Khoa đích        ▼]               │
│                                            │
│  [Select Loại yêu cầu     ▼]  ← Lọc theo khoa
│                                            │
│  Tiêu đề *                                 │
│  ┌────────────────────────────────────┐    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Nội dung *                                │
│  ┌────────────────────────────────────┐    │
│  │                                    │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  📎 Đính kèm file (tùy chọn)              │
│  ┌────────────────────────────────────┐    │
│  │  + Kéo thả hoặc click để chọn     │    │
│  └────────────────────────────────────┘    │
│                                            │
│              [Hủy]  [Gửi yêu cầu]         │
│                                            │
└────────────────────────────────────────────┘

Key UX:
  ✓ Khoa đích thay đổi → reset Loại yêu cầu
  ✓ Loại yêu cầu hiển thị ThoiGianDuKien để user biết
  ✓ Auto-save draft (localStorage)
  ✓ Validation realtime
```

#### 4.3.4. Đánh giá Form UX

```
ĐÁNH GIÁ FORM:
━━━━━━━━━━━━━━
┌────────────────────────────────────────────┐
│  Đánh giá yêu cầu                     [X]  │
├────────────────────────────────────────────┤
│                                            │
│  YC2024000123 - Sửa máy siêu âm           │
│  Người xử lý: Trần Văn B (Khoa IT)        │
│                                            │
│  ────────────────────────────────────────  │
│                                            │
│  Mức độ hài lòng:                          │
│                                            │
│      ☆   ☆   ☆   ☆   ☆                    │
│     Rất  Không Bình  Hài  Rất              │
│     tệ   hài   thường lòng hài             │
│          lòng              lòng            │
│                                            │
│  Nhận xét:  (bắt buộc nếu < 3 sao)        │
│  ┌────────────────────────────────────┐    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ⚠️ Sau khi đánh giá, yêu cầu sẽ được     │
│     tự động đóng.                          │
│                                            │
│              [Hủy]  [Gửi đánh giá]        │
│                                            │
└────────────────────────────────────────────┘

Key UX:
  ✓ Star rating interactive (hover effect)
  ✓ < 3 sao → hiện warning + bắt buộc nhận xét
  ✓ Confirm message trước khi submit
  ✓ Notification gửi cho NguoiXuLy kèm số sao
```

#### 4.3.5. Dashboard UX

```
DASHBOARD:
━━━━━━━━━━
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard Yêu cầu                                                       │
│                                                                         │
│  Filter: [Khoa: All ▼] [Từ: 01/06] [Đến: 30/06] [Loại: All ▼] [Apply]  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │   45    │ │   12    │ │   8     │ │   20    │ │   5     │           │
│  │ Tổng YC │ │  Mới    │ │ Đang XL │ │ Hoàn th │ │Từ chối  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  2.5d   │ │  85%    │ │  4.2⭐   │ │   3     │ │   2     │           │
│  │ TB XL   │ │Đúng hạn │ │ TB Đánh │ │ Trễ hạn │ │ Escalate│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐      │
│  │    YÊU CẦU THEO THỜI GIAN   │  │    PHÂN BỐ THEO TRẠNG THÁI  │      │
│  │    (Line Chart)             │  │    (Pie Chart)              │      │
│  │                             │  │                             │      │
│  │     📈                      │  │         🥧                  │      │
│  │                             │  │                             │      │
│  └─────────────────────────────┘  └─────────────────────────────┘      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    YÊU CẦU THEO KHOA (Bar Chart)                │   │
│  │    📊                                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.4. Routing

```
routes/
└── index.js

Thêm routes:
  /yeucau                    → YeuCauPage (list)
  /yeucau/tao-moi           → TaoYeuCauForm (hoặc dialog)
  /yeucau/:id               → YeuCauDetailPage
  /yeucau/dashboard         → YeuCauDashboard

Menu config:
  - Icon: 📋 hoặc "SupportAgent"
  - Label: "Yêu cầu hỗ trợ"
  - Position: Sau "Quản lý công việc"
  - Permission: Tất cả users
```

### 4.5. Notification Integration

```
Khi nhận notification types YEUCAU_*:

  1. Show toast với action button
  2. Click → navigate to /yeucau/:id
  3. Badge count trên menu icon

Notification sound:
  - YEUCAU_MOI: ding (mặc định)
  - YEUCAU_TRE_HAN: alert sound
  - YEUCAU_ESCALATE: urgent sound
```

---

## Phase 5: Testing & Polish 🧪

> **Status**: 📝 Chưa bắt đầu

### 5.1. Backend Tests

```
Scenarios to test:

1. State Machine:
   - Happy paths (all valid transitions)
   - Invalid transitions (should throw)
   - Permission checks

2. Rate Limiting:
   - NHAC_LAI: 4th call in same day → 429
   - BAO_QUAN_LY: 2nd call → 429
   - Reset after midnight

3. Auto-close job:
   - Creates correct history entry
   - Sets DanhGia.SoSao = 5
   - Sends notification

4. 7-day reopen:
   - Within 7 days → OK
   - After 7 days → 400
```

### 5.2. Frontend Tests

```
E2E Scenarios:

1. Tạo yêu cầu mới → Verify in list
2. Tiếp nhận → Check status change
3. Hoàn thành → Đánh giá → Verify đóng
4. Mở lại trong 7 ngày → OK
5. Dashboard filters → Correct data
```

### 5.3. UI Polish Checklist

- [ ] Loading skeletons cho list và detail
- [ ] Empty states với illustration
- [ ] Error boundaries với retry
- [ ] Responsive (mobile-friendly tables)
- [ ] Keyboard navigation
- [ ] Optimistic updates cho quick actions

---

## 📋 Implementation Checklist

### Phase 0: Cleanup

- [ ] Xóa legacy models
- [ ] Cập nhật BinhLuan, TepTin
- [ ] Xóa old notification templates
- [ ] Test BE starts OK

### Phase 1: Models

- [ ] DanhMucYeuCau model
- [ ] LyDoTuChoi model
- [ ] CauHinhThongBaoKhoa model
- [ ] YeuCau model
- [ ] YeuCauCounter model + helper
- [ ] LichSuYeuCau model
- [ ] Update BinhLuan (add YeuCauID)
- [ ] Update TepTin (add YeuCauID)
- [ ] Update models/index.js exports

### Phase 2: Services

- [ ] State Machine service
- [ ] Rate Limit service
- [ ] Auto-close Agenda job
- [ ] Notification service integration

### Phase 3: Controllers & Routes

- [ ] CRUD controllers
- [ ] Action controllers (tiepnhan, tuchoi, etc.)
- [ ] Dashboard controller
- [ ] Routes setup
- [ ] Validators

### Phase 4: Frontend

- [ ] Redux slice
- [ ] YeuCauPage + routing
- [ ] List components (Table, Filters, StatusChip)
- [ ] Detail components (Header, Info, Timeline)
- [ ] Forms (Tạo, Tiếp nhận, Từ chối, Đánh giá, etc.)
- [ ] Dashboard components
- [ ] Notification integration

### Phase 5: Testing

- [ ] Backend unit tests
- [ ] Frontend E2E tests
- [ ] UI polish

---

## 📚 Tài Liệu Tham Khảo

| File                                                   | Mô tả                      |
| ------------------------------------------------------ | -------------------------- |
| [00_TONG_QUAN.md](./00_TONG_QUAN.md)                   | Tổng quan hệ thống         |
| [01_NGHIEP_VU_CHI_TIET.md](./01_NGHIEP_VU_CHI_TIET.md) | Chi tiết nghiệp vụ 6 phần  |
| [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md)       | Database schema            |
| [03_STATE_MACHINE.md](./03_STATE_MACHINE.md)           | State machine & validation |
| [04_PHASE0_CLEANUP.md](./04_PHASE0_CLEANUP.md)         | Cleanup legacy code        |

---

_Cập nhật: 01/06/2025_
