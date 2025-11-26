# QuanLyCongViec - Architecture Overview

**Version:** 1.0  
**Last Updated:** 25/11/2025  
**Status:** Living Document 📝

---

## 🎯 Purpose

Tài liệu này định nghĩa **kiến trúc tổng quan** của module Quản Lý Công Việc, bao gồm:

- Mối quan hệ giữa các sub-modules
- Data flow & dependencies
- **Output Events** (quan trọng cho Notification module)
- Integration points

---

## 📦 Module Structure

```
QuanLyCongViec/
├── CongViec/              # Task Management (Core)
├── KPI/                   # Performance Evaluation
├── GiaoNhiemVu/          # Task Assignment
├── ChuKyDanhGia/         # Evaluation Cycles
├── NhiemVuThuongQuy/     # Routine Duties (Master Data)
├── TieuChiDanhGia/       # Evaluation Criteria (Master Data)
├── QuanLyNhanVien/       # Employee Management
├── BaoCaoThongKeKPI/     # KPI Reports & Analytics
├── NhomViecUser/         # Work Groups
└── TreeView/             # Task Hierarchy
```

---

## 🔗 Module Dependencies

### Dependency Graph

```
                    ┌─────────────────────┐
                    │ NhiemVuThuongQuy    │
                    │ (Master Data)       │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌─────────────┐  ┌──────────┐  ┌────────────┐
        │ GiaoNhiemVu │  │ CongViec │  │    KPI     │
        └──────┬──────┘  └────┬─────┘  └─────┬──────┘
               │              │               │
               └──────────────┼───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ ChuKyDanhGia    │
                    │ (Time Periods)  │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ BaoCaoThongKeKPI    │
                    │ (Reports)           │
                    └─────────────────────┘
```

### Detailed Dependencies

#### **1. NhiemVuThuongQuy (Routine Duties)**

- **Role:** Master data cho toàn bộ hệ thống
- **Used by:**
  - GiaoNhiemVu: Gán nhiệm vụ cho nhân viên
  - KPI: Đánh giá theo nhiệm vụ
  - CongViec: Link công việc với nhiệm vụ thường quy
- **Key Fields:**
  - `TenNhiemVu`, `MoTa`
  - `MucDoKhoDefault` (1-10)
  - `KhoaID` (Department filter)

#### **2. ChuKyDanhGia (Evaluation Cycles)**

- **Role:** Định nghĩa thời gian đánh giá
- **Used by:**
  - GiaoNhiemVu: Gán nhiệm vụ theo chu kỳ
  - KPI: Đánh giá trong chu kỳ cụ thể
- **Key Fields:**
  - `TenChuKy`, `NgayBatDau`, `NgayKetThuc`
  - `isDong` (open/closed flag)
  - `TieuChiCauHinh[]` (tiêu chí cho chu kỳ)

#### **3. GiaoNhiemVu (Task Assignment)**

- **Role:** Gán nhiệm vụ thường quy cho nhân viên
- **Dependencies:**
  - Reads: NhiemVuThuongQuy, ChuKyDanhGia
  - Writes: NhanVienNhiemVu collection
- **Key Data:**
  - `NhanVienID` + `NhiemVuThuongQuyID` + `ChuKyDanhGiaID`
  - `MucDoKho` (override from template)
  - `DiemTuDanhGia` (employee self-assessment)

#### **4. CongViec (Task Management)**

- **Role:** Quản lý công việc thực tế (operational tasks)
- **Dependencies:**
  - Optional link: `NhiemVuThuongQuyID`
  - Uses: QuanLyNhanVien (participants)
- **Key Features:**
  - State machine với 9+ trạng thái
  - Optimistic concurrency (version control)
  - Comment threading với replies cache
  - File attachments (separate from comments)
  - Deadline warning system

#### **5. KPI (Performance Evaluation)**

- **Role:** Đánh giá hiệu suất nhân viên
- **Dependencies:**
  - Reads: GiaoNhiemVu (assigned tasks)
  - Reads: ChuKyDanhGia (evaluation period)
  - Reads: TieuChiDanhGia (criteria config)
  - Optional: CongViec (task completion data)
- **Key Collections:**
  - `DanhGiaKPI` (parent evaluation)
  - `DanhGiaNhiemVuThuongQuy` (task-level scores)
  - `NhanVienNhiemVu` (source of DiemTuDanhGia)

---

## 🔄 Data Flow Patterns

### Pattern 1: KPI Evaluation Flow (Complete)

```
1. Admin creates ChuKyDanhGia
   → Sets evaluation period & criteria

2. Manager assigns tasks (GiaoNhiemVu)
   → NhanVienNhiemVu records created
   → Links: NhanVienID + NhiemVuThuongQuyID + ChuKyDanhGiaID

3. Employee self-assessment
   → Updates NhanVienNhiemVu.DiemTuDanhGia (0-100)
   → Sets NgayTuCham

4. Manager evaluation (KPI module)
   → GET /kpi/nhan-vien/:id/nhiem-vu?chuKyId=xxx
   → Scores each criteria (ChiTietDiem array)
   → Saves to DanhGiaNhiemVuThuongQuy

5. Manager approval
   → POST /kpi/duyet-kpi-tieu-chi/:id
   → Backend calls danhGiaKPI.duyet()
   → Calculates TongDiemKPI (using DiemTuDanhGia from NhanVienNhiemVu)
   → Status: CHUA_DUYET → DA_DUYET (locked)
   → ⚡ EVENT: KPI_APPROVED

6. Undo approval (if needed)
   → POST /kpi/:id/huy-duyet
   → Saves LichSuHuyDuyet snapshot
   → Status: DA_DUYET → CHUA_DUYET
   → ⚡ EVENT: KPI_APPROVAL_REVERTED
```

### Pattern 2: CongViec Status Flow (Simplified)

```
1. Create task
   → Status: TAO_MOI
   → Assigns participants (NguoiChinhID, NguoiThamGia)
   → Sets NgayHetHan, cảnh báo config
   → ⚡ EVENT: TASK_CREATED

2. Assign task (GIAO_VIEC)
   → Status: TAO_MOI → DA_GIAO
   → Sets NgayGiaoViec, NgayCanhBao (if config)
   → ⚡ EVENT: TASK_ASSIGNED

3. Accept task (TIEP_NHAN)
   → Status: DA_GIAO → DANG_THUC_HIEN
   → Sets NgayTiepNhanThucTe
   → ⚡ EVENT: TASK_ACCEPTED

4. Complete task
   IF CoDuyetHoanThanh = false:
     → HOAN_THANH action
     → Status: DANG_THUC_HIEN → HOAN_THANH
     → ⚡ EVENT: TASK_COMPLETED

   IF CoDuyetHoanThanh = true:
     → HOAN_THANH_TAM action
     → Status: DANG_THUC_HIEN → CHO_DUYET
     → ⚡ EVENT: TASK_PENDING_APPROVAL

     Then assigner:
     → DUYET_HOAN_THANH action
     → Status: CHO_DUYET → HOAN_THANH
     → ⚡ EVENT: TASK_APPROVED

5. On deadline breach
   → Calculated field: HoanThanhTreHan, SoGioTre
   → ⚡ EVENT: TASK_OVERDUE

6. Comments & Collaboration
   → New comment
   → ⚡ EVENT: TASK_COMMENT_ADDED

   → New reply
   → ⚡ EVENT: TASK_REPLY_ADDED

7. File upload
   → ⚡ EVENT: TASK_FILE_UPLOADED
```

### Pattern 3: Assignment Validation Chain

```
GiaoNhiemVu Update Request
  ↓
1. Check ChuKyDanhGia.isDong
   IF true → Error: "Chu kỳ đã đóng"

2. Check DanhGiaKPI.TrangThai
   IF "DA_DUYET" → Error: "KPI đã được duyệt. Hủy duyệt trước khi sửa."

3. Check for manager scores
   → hasManagerScore(nhanVienId, nhiemVuId, chuKyId)
   IF true → Error: "Không thể xóa nhiệm vụ đã chấm điểm"

4. Proceed with update
```

---

## ⚡ Output Events (For Notification Module)

### Priority 1: Implemented Events (Backend có model ThongBao/Notification)

| Event Type            | Trigger                                    | Recipients                        | Data Payload                                    |
| --------------------- | ------------------------------------------ | --------------------------------- | ----------------------------------------------- |
| **TASK_ASSIGNED**     | POST /congviec/:id/giao-viec               | `NguoiChinhID`, `NguoiThamGia[]`  | `{ congViecId, tieuDe, nguoiGiao, ngayHetHan }` |
| **TASK_UPDATED**      | PATCH /congviec/:id                        | `NguoiChinhID`, `NguoiThamGia[]`  | `{ congViecId, fieldsChanged[] }`               |
| **TASK_COMPLETED**    | POST /congviec/:id/transition (HOAN_THANH) | `NguoiGiaoViecID`                 | `{ congViecId, nguoiHoanThanh, soGioTre }`      |
| **TASK_OVERDUE**      | Cron job kiểm tra deadline                 | `NguoiChinhID`, `NguoiGiaoViecID` | `{ congViecId, soGioQuaHan }`                   |
| **TASK_COMMENT**      | POST /congviec/:id/comment                 | Participants (trừ người comment)  | `{ congViecId, nguoiBinhLuan, noiDung }`        |
| **KPI_EVALUATION**    | POST /kpi/duyet-kpi-tieu-chi/:id           | `NhanVienID` (được đánh giá)      | `{ danhGiaKPIId, tongDiem, chuKy }`             |
| **KPI_APPROVED**      | POST /kpi/duyet-kpi-tieu-chi/:id           | `NhanVienID`                      | `{ danhGiaKPIId, tongDiemKPI, nguoiDuyet }`     |
| **DEADLINE_REMINDER** | Cron job (NgayCanhBao)                     | `NguoiChinhID`                    | `{ congViecId, soNgayConLai }`                  |

### Priority 2: Candidate Events (Chưa implement backend)

| Event Type                | Trigger Suggestion           | Recipients                 | Notes                                       |
| ------------------------- | ---------------------------- | -------------------------- | ------------------------------------------- |
| **ASSIGNMENT_CHANGED**    | GiaoNhiemVu batch update     | `NhanVienID`               | "Nhiệm vụ của bạn đã thay đổi cho chu kỳ X" |
| **CYCLE_OPENED**          | ChuKyDanhGia.isDong = false  | All managers               | "Chu kỳ X đã mở - có thể gán nhiệm vụ"      |
| **CYCLE_CLOSING_SOON**    | Cron job (5 days before end) | Managers with pending KPIs | "Chu kỳ sắp đóng - vui lòng duyệt KPI"      |
| **KPI_APPROVAL_REVERTED** | POST /kpi/:id/huy-duyet      | `NhanVienID`               | "Đánh giá KPI đã bị hủy duyệt"              |
| **TASK_REJECTED**         | Transition TU_CHOI           | `NguoiChinhID`             | "Công việc bị từ chối: {lyDo}"              |

---

## 🔌 Integration Points

### For Notification Module

**Backend Event Emission Strategy:**

```javascript
// Recommended pattern: Event emitter in services

// Example: congViec.service.js
const EventEmitter = require('events');
const workEventEmitter = new EventEmitter();

service.giaoViec = async (id, req) => {
  // ... business logic ...
  const congviec = await CongViec.findByIdAndUpdate(...);

  // ✅ Emit event for notification module
  workEventEmitter.emit('TASK_ASSIGNED', {
    congViecId: congviec._id,
    tieuDe: congviec.TieuDe,
    nguoiGiao: req.user._id,
    nguoiNhan: [congviec.NguoiChinhID, ...congviec.NguoiThamGia],
    ngayHetHan: congviec.NgayHetHan,
    metadata: {
      mucDoUuTien: congviec.MucDoUuTien,
      coDuyetHoanThanh: congviec.CoDuyetHoanThanh
    }
  });

  return congviec;
};

// Export emitter for notification listener
module.exports = { service, workEventEmitter };
```

**Notification Listener Pattern:**

```javascript
// notifications/listeners/workListener.js
const { workEventEmitter } = require("../services/congViec.service");
const NotificationService = require("./notification.service");

workEventEmitter.on("TASK_ASSIGNED", async (data) => {
  const { congViecId, nguoiNhan, tieuDe, nguoiGiao } = data;

  // Create notifications for all recipients
  for (const recipientId of nguoiNhan) {
    await NotificationService.create({
      recipientId,
      senderId: nguoiGiao,
      notificationType: "TASK_ASSIGNED",
      relatedType: "CongViec",
      relatedId: congViecId,
      title: `Công việc mới: ${tieuDe}`,
      message: `Bạn được giao công việc "${tieuDe}"`,
    });
  }
});
```

### For Ticket Module

**Potential Integration:**

```javascript
// Ticket có thể tham chiếu CongViec
TicketSchema = {
  RelatedCongViecID: { type: ObjectId, ref: "CongViec", default: null },
  // ... other fields
};

// Use case: Ticket từ công việc quá hạn
if (congViec.TinhTrangThoiHan === "QUA_HAN") {
  await Ticket.create({
    TieuDe: `Công việc quá hạn: ${congViec.TieuDe}`,
    RelatedCongViecID: congViec._id,
    MucDoUuTien: "CAO",
    // ...
  });
}
```

---

## 🗄️ Key Data Models

### CongViec (Core Task)

```typescript
{
  TieuDe: string,
  MoTa: string,
  TrangThai: "TAO_MOI" | "DA_GIAO" | "DANG_THUC_HIEN" | "CHO_DUYET" | "HOAN_THANH" | ...,
  NguoiGiaoViecID: ObjectId,
  NguoiChinhID: ObjectId,
  NguoiThamGia: [{ NguoiThucHienID, VaiTro: "CHINH" | "PHOI_HOP" }],
  NgayBatDau: Date,
  NgayHetHan: Date,
  NgayGiaoViec: Date,
  NgayCanhBao: Date,  // Calculated from CanhBaoMode
  CoDuyetHoanThanh: boolean,
  SoGioTre: number,
  HoanThanhTreHan: boolean,
  NhiemVuThuongQuyID: ObjectId?,  // Optional link
  LichSuTrangThai: [{ HanhDong, TuTrangThai, DenTrangThai, ThoiGian, Snapshot }],
  updatedAt: Date  // For optimistic concurrency
}
```

### DanhGiaKPI (KPI Evaluation)

```typescript
{
  ChuKyDanhGiaID: ObjectId,
  NhanVienID: ObjectId,
  NguoiDanhGiaID: ObjectId,
  TongDiemKPI: number,  // Calculated & snapshot on approval
  TrangThai: "CHUA_DUYET" | "DA_DUYET",
  NgayDuyet: Date,
  NguoiDuyet: ObjectId,
  LichSuDuyet: [{ /* approval history */ }],
  LichSuHuyDuyet: [{ /* undo approval history */ }]
}
```

### NhanVienNhiemVu (Assignment Record)

```typescript
{
  NhanVienID: ObjectId,
  NhiemVuThuongQuyID: ObjectId,
  ChuKyDanhGiaID: ObjectId | null,  // null = permanent assignment
  MucDoKho: number (1-10),  // Override from template
  DiemTuDanhGia: number (0-100),  // Employee self-assessment
  NgayTuCham: Date,
  TrangThaiHoatDong: boolean
}
```

### DanhGiaNhiemVuThuongQuy (Task Score Detail)

```typescript
{
  DanhGiaKPIID: ObjectId,
  NhiemVuThuongQuyID: ObjectId,
  MucDoKho: number,
  ChiTietDiem: [
    {
      TieuChiID: ObjectId,
      TenTieuChi: string,
      DiemDat: number (0-100),
      LoaiTieuChi: "TANG_DIEM" | "GIAM_DIEM",
      IsMucDoHoanThanh: boolean,  // Special formula flag
      GhiChu: string
    }
  ],
  TrangThai: "CHUA_DUYET" | "DA_DUYET"
}
```

---

## 🔒 Business Rules & Constraints

### Rule 1: Cycle Locking

- **Constraint:** Khi `ChuKyDanhGia.isDong = true`
- **Effect:** Không thể:
  - Tạo/sửa/xóa assignment (GiaoNhiemVu)
  - Tạo KPI mới cho chu kỳ đó
- **Unlock:** Admin set `isDong = false`

### Rule 2: KPI Approval Locking

- **Constraint:** Khi `DanhGiaKPI.TrangThai = "DA_DUYET"`
- **Effect:** Không thể:
  - Sửa ChiTietDiem (manager scores)
  - Sửa DiemTuDanhGia (employee self-assessment)
  - Thêm/xóa nhiệm vụ trong assignment
- **Unlock:** POST `/kpi/:id/huy-duyet` (with reason)

### Rule 3: Assignment Deletion Protection

- **Constraint:** Nếu nhiệm vụ đã được chấm điểm (manager has scored)
- **Effect:** Không thể xóa nhiệm vụ khỏi assignment
- **Check:** `hasManagerScore(nhanVienId, nhiemVuId, chuKyId)`

### Rule 4: CongViec State Machine

- **Constraint:** Chỉ các transitions hợp lệ được phép
- **Validation:** `getAvailableActions(status, role)`
- **Example:** Không thể từ `TAO_MOI` → `HOAN_THANH` (phải qua DA_GIAO, DANG_THUC_HIEN)

### Rule 5: Optimistic Concurrency

- **Constraint:** Mọi update gửi `If-Unmodified-Since` header
- **Effect:** Nếu `updatedAt` thay đổi → `VERSION_CONFLICT` error
- **Frontend:** Auto-refresh và retry

---

## 📊 Performance Considerations

### Caching Strategy

| Data Type       | Cache Location | TTL     | Invalidation          |
| --------------- | -------------- | ------- | --------------------- |
| MyRoutineTasks  | Frontend Redux | 5 min   | Force refresh button  |
| Color Config    | Frontend Redux | Session | Admin update triggers |
| Comment Replies | Frontend Redux | Session | Per-parent lazy load  |
| Cycle List      | Frontend Redux | 1 min   | Auto-refresh on open  |

### Pagination

- **CongViec List:** Server-side pagination (page, limit)
- **Comments:** Infinite scroll (lazy load replies)
- **KPI Dashboard:** Client-side (small employee list per manager)

---

## 🚀 Future Modules

### Notification Module (Priority 1)

- **Dependencies:** All existing modules (listen to events)
- **Key Features:**
  - Real-time via WebSocket (socket.io)
  - Unread badge counter
  - Mark as read/unread
  - Filter by type
  - Deep links to related entities

### Ticket Module (Priority 2)

- **Dependencies:** CongViec (optional link), QuanLyNhanVien
- **Key Features:**
  - Priority queue
  - SLA tracking
  - Escalation rules
  - Link to congviec (quá hạn → ticket)

---

## 📚 Related Documentation

- **CongViec Details:** [CongViec/docs/README.md](./CongViec/docs/README.md)
- **KPI Details:** [KPI/README.md](./KPI/README.md)
- **Formula Reference:** [KPI/FORMULA.md](./KPI/FORMULA.md)
- **Archived Docs:** [\_archive_legacy_docs_2025-11-25/README_ARCHIVE.md](./_archive_legacy_docs_2025-11-25/README_ARCHIVE.md)

---

## 🔄 Changelog

- **2025-11-25:** Initial architecture documentation (v1.0)
  - Extracted from existing codebase
  - Defined event system for Notification module
  - Documented data flow patterns

---

**Maintained by:** Development Team  
**Review Cycle:** Monthly or before major feature additions  
**Next Review:** December 2025
