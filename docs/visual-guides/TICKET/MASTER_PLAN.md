# 📋 MASTER PLAN - Ticket (Yêu Cầu) Module Documentation

> **Module**: QuanLyCongViec/Ticket (Support Request/Ticket System)  
> **Ngày bắt đầu**: 6/1/2026  
> **Status**: Planning Phase

---

## 🎯 MỤC TIÊU

Tạo documentation đầy đủ và trực quan cho module **Ticket/Yêu Cầu** - hệ thống quản lý yêu cầu hỗ trợ giữa các khoa với:

- ✅ **Department-to-Department Requests** - Yêu cầu liên khoa
- ✅ **Person-to-Person Direct Assignment** - Giao việc trực tiếp
- ✅ **5-State Workflow** - MOI → DANG_XU_LY → DA_HOAN_THANH → DA_DONG / TU_CHOI
- ✅ **Dispatch System** - Điều phối viên phân công công việc
- ✅ **Category Management** - Danh mục yêu cầu theo khoa
- ✅ **Auto Deadline Calculation** - Tự động tính thời gian hẹn
- ✅ **History & Audit Trail** - LichSuYeuCau đầy đủ
- ✅ **Comments & Attachments** - BinhLuan, TepTin
- ✅ **Rating & Feedback** - Đánh giá sau khi hoàn thành
- ✅ **Dashboard & Metrics** - Badge counts, KPI metrics

---

## 📚 CẤU TRÚC DOCUMENTATION (9 Files)

### **Priority: HIGH** 🔥 (4 files)

| File                      | Topics                                                     | Pages | Time      | Status  |
| ------------------------- | ---------------------------------------------------------- | ----- | --------- | ------- |
| **00_OVERVIEW.md**        | System architecture, Data models (7), Core concepts        | 12-14 | 25-30 min | 📝 TODO |
| **01_WORKFLOW_STATES.md** | 5-state machine, Transitions, Action permissions           | 12-14 | 25-30 min | 📝 TODO |
| **02_DISPATCH_SYSTEM.md** | Điều phối viên role, Assignment logic, Department config   | 14-16 | 30-35 min | 📝 TODO |
| **03_CATEGORY_SYSTEM.md** | DanhMucYeuCau, Auto-deadline, Request types per department | 12-14 | 25-30 min | 📝 TODO |

### **Priority: MEDIUM** 📊 (4 files)

| File                        | Topics                                                          | Pages | Time      | Status  |
| --------------------------- | --------------------------------------------------------------- | ----- | --------- | ------- |
| **04_ASSIGNMENT_FLOW.md**   | Create → Dispatch → Accept → Process → Complete → Close         | 14-16 | 30-35 min | 📝 TODO |
| **05_COMMENTS_FILES.md**    | BinhLuan threading, File attachments, Real-time updates         | 12-14 | 25-30 min | 📝 TODO |
| **06_RATING_FEEDBACK.md**   | Rating system (1-5 stars), Feedback after completion            | 10-12 | 20-25 min | 📝 TODO |
| **07_DASHBOARD_METRICS.md** | Badge counts, Tab configs, KPI integration, Performance metrics | 16-18 | 35-40 min | 📝 TODO |

### **Priority: LOW** 📖 (1 file)

| File                    | Topics                                         | Pages | Time      | Status  |
| ----------------------- | ---------------------------------------------- | ----- | --------- | ------- |
| **08_API_REFERENCE.md** | Complete API catalog, Request/Response schemas | 18-20 | Reference | 📝 TODO |

**Total**: ~120-140 pages, ~4 giờ đọc

**Tiến độ**: 0/9 files (0%) - Project starting

---

## 🗂️ KEY FILES MAPPING (Code References)

### Frontend (React + Redux)

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/
├── yeuCauSlice.js                      (~1,200 lines - Redux logic)
├── pages/
│   ├── YeuCauToiGuiPage.js            (Yêu cầu tôi gửi - sent by me)
│   ├── YeuCauXuLyPage.js              (Yêu cầu tôi xử lý - assigned to me)
│   ├── YeuCauDieuPhoiPage.js          (Điều phối - dispatch manager)
│   ├── YeuCauQuanLyKhoaPage.js        (Quản lý khoa - department overview)
│   ├── YeuCauDetailPage.js            (~500 lines - Detail view with actions)
│   └── YeuCauPage.js                  (Main overview page)
├── components/
│   ├── YeuCauFormDialog.js            (Create/Edit form)
│   ├── YeuCauCard.js                  (Card display)
│   ├── YeuCauList.js                  (Table/List view)
│   ├── YeuCauActionButtons.js         (~400 lines - Action buttons)
│   ├── YeuCauStatusChip.js            (Status badge)
│   ├── YeuCauPriorityChip.js          (Priority indicator)
│   ├── YeuCauTimeline.js              (History timeline)
│   ├── YeuCauFilterPanel.js           (Filter UI)
│   └── dialogs/
│       ├── DieuPhoiDialog.js          (Dispatch assignment)
│       ├── TiepNhanDialog.js          (Accept request)
│       ├── TuChoiDialog.js            (Reject with reason)
│       ├── HoanThanhDialog.js         (Mark complete)
│       └── DanhGiaDialog.js           (Rating/Feedback)
├── config/
│   └── yeuCauTabConfig.js             (~400 lines - Tab configurations)
├── README.md                           (Comprehensive module docs - 500+ lines)
├── FILTER_LOGIC_DOCUMENTATION.md      (Filter logic details)
└── docs/                               (Implementation guides)
```

### Backend (Express + MongoDB)

```
giaobanbv-be/modules/workmanagement/
├── models/
│   ├── YeuCau.js                      (550 lines - Main request model)
│   ├── YeuCauCounter.js               (Auto-generate MaYeuCau)
│   ├── DanhMucYeuCau.js               (Request categories)
│   ├── LichSuYeuCau.js                (History/Audit trail)
│   ├── BinhLuan.js                    (Comments)
│   ├── TepTin.js                      (File attachments)
│   └── CauHinhThongBaoKhoa.js         (Department notification config)
├── controllers/
│   ├── yeuCau.controller.js           (~800 lines - CRUD + actions)
│   ├── danhMucYeuCau.controller.js    (Category management)
│   └── binhLuan.controller.js         (Comment handling)
├── services/
│   ├── yeuCau.service.js              (1,001 lines - Business logic)
│   ├── yeuCauStateMachine.js          (702 lines - State transitions)
│   ├── yeuCauTransition.service.js    (Transition handlers)
│   ├── notificationService.js         (Notification triggers)
│   └── file.service.js                (File upload/download)
├── routes/
│   ├── yeuCau.api.js                  (YeuCau endpoints)
│   ├── danhMucYeuCau.api.js           (Category endpoints)
│   └── binhLuan.api.js                (Comment endpoints)
└── validators/
    └── yeuCau.validator.js            (Request validation)
```

---

## 📅 TIMELINE & MILESTONES

### **Week 1: HIGH Priority Files** (4 files)

**Ngày 1-2** (6-7/1/2026):

- 📝 **00_OVERVIEW.md** - TODO

  - System architecture (7 models)
  - Request flow diagram
  - Role-based access (requester, dispatcher, handler)
  - Key concepts: LoaiNguoiNhan (KHOA/CA_NHAN)

- 📝 **01_WORKFLOW_STATES.md** - TODO
  - 5 states: MOI → DANG_XU_LY → DA_HOAN_THANH → DA_DONG / TU_CHOI
  - State machine transitions with validation
  - Available actions per state
  - Permission matrix

**Ngày 3-4** (8-9/1/2026):

- 📝 **02_DISPATCH_SYSTEM.md** - TODO

  - Điều phối viên role (CauHinhThongBaoKhoa)
  - Assignment logic (KHOA → Dispatcher → Handler)
  - Department configuration
  - Notification rules

- 📝 **03_CATEGORY_SYSTEM.md** - TODO
  - DanhMucYeuCau structure
  - Auto-deadline calculation (ThoiGianDuKien + DonViThoiGian)
  - Category CRUD per department
  - SnapshotDanhMuc pattern

**Milestone 1**: ✅ Core system understanding (40% complete)

---

### **Week 2: MEDIUM Priority Files** (4 files)

**Ngày 5-6** (10-11/1/2026):

- 📝 **04_ASSIGNMENT_FLOW.md** - TODO

  - Create request (LoaiNguoiNhan: KHOA/CA_NHAN)
  - Dispatcher assignment flow
  - Accept/Reject actions
  - Complete → Rate → Close flow

- 📝 **05_COMMENTS_FILES.md** - TODO
  - BinhLuan model structure
  - Comment threading (no nested, flat with ParentID)
  - File attachment (TepTin model)
  - Real-time updates pattern

**Ngày 7** (12/1/2026):

- 📝 **06_RATING_FEEDBACK.md** - TODO

  - Rating system (1-5 stars)
  - Feedback fields (DanhGia, NhanXet)
  - Rating permissions
  - Statistics integration

- 📝 **07_DASHBOARD_METRICS.md** - TODO
  - Badge count logic (toi-gui, toi-xu-ly, can-xu-ly, da-xu-ly)
  - Tab configurations (yeuCauTabConfig.js)
  - KPI metrics (tyLeDungHan, trungBinhSao, tongXuLy)
  - Dashboard aggregation queries

**Milestone 2**: ✅ Feature completeness (85% complete)

---

### **Week 3: API Reference** (1 file)

**Ngày 8** (13/1/2026):

- 📝 **08_API_REFERENCE.md** - TODO
  - Complete API catalog (~40 endpoints)
  - Schema definitions (7 models)
  - Request/Response examples
  - Error codes reference

**Milestone 3**: ✅ Complete documentation suite (100% complete)

---

## 🎯 THỨ TỰ ĐỌC CHO CÁC ĐỐI TƯỢNG

### 👶 **Người Mới (Beginner)**

Mục tiêu: Hiểu cơ bản về hệ thống Ticket

1. **00_OVERVIEW.md** - Tổng quan hệ thống
2. **01_WORKFLOW_STATES.md** - Workflow 5 trạng thái
3. **04_ASSIGNMENT_FLOW.md** - Quy trình xử lý yêu cầu
4. **08_API_REFERENCE.md** - Tra cứu khi cần

**Thời gian**: ~1.5 giờ

---

### 👨‍💻 **Developer (Intermediate)**

Mục tiêu: Có thể maintain và fix bugs

1. **00_OVERVIEW.md**
2. **01_WORKFLOW_STATES.md** ⚠️ Critical
3. **02_DISPATCH_SYSTEM.md** - Điều phối logic
4. **03_CATEGORY_SYSTEM.md** - Danh mục & deadline
5. **04_ASSIGNMENT_FLOW.md**
6. **05_COMMENTS_FILES.md**
7. **07_DASHBOARD_METRICS.md** - Dashboard logic
8. **08_API_REFERENCE.md**

**Thời gian**: ~3 giờ

---

### 🏗️ **Architect/Lead Developer**

Mục tiêu: Hiểu toàn bộ hệ thống, có thể refactor

- Đọc tất cả 8 files theo thứ tự **00 → 08**
- Focus đặc biệt vào:
  - State machine & transition validation
  - Dispatch assignment logic
  - Notification trigger points
  - Dashboard aggregation performance
  - File handling & storage

**Thời gian**: ~4 giờ

---

## 🔍 KEY TECHNICAL CONCEPTS

### 1. **LoaiNguoiNhan Pattern**

```javascript
// KHOA: Gửi đến khoa → Điều phối viên assign
{
  LoaiNguoiNhan: "KHOA",
  KhoaDichID: ObjectId,
  NguoiNhanID: null
}

// CA_NHAN: Gửi trực tiếp đến cá nhân
{
  LoaiNguoiNhan: "CA_NHAN",
  KhoaDichID: ObjectId,
  NguoiNhanID: ObjectId // Target person
}
```

### 2. **State Machine (5 States)**

```
MOI → [Accept] → DANG_XU_LY → [Complete] → DA_HOAN_THANH → [Rate/Close] → DA_DONG
  ↓
[Reject] → TU_CHOI
```

### 3. **Auto-Deadline Calculation**

```javascript
// From DanhMucYeuCau
ThoiGianDuKien: 2;
DonViThoiGian: "GIO"; // PHUT, GIO, NGAY

// Result: ThoiGianHen = NgayTiepNhan + 2 hours
```

### 4. **Badge Count Logic**

```javascript
// toi-gui: Yêu cầu tôi gửi
{ NguoiYeuCauID: myId }

// toi-xu-ly: Được giao cho tôi
{ NguoiXuLyID: myId, TrangThai: "DANG_XU_LY" }

// can-xu-ly: Khoa tôi có thể tiếp nhận
{ KhoaDichID: myKhoaId, TrangThai: "MOI" }

// da-xu-ly: Tôi đã hoàn thành
{ NguoiXuLyID: myId, TrangThai: { $in: ["DA_HOAN_THANH", "DA_DONG"] } }
```

### 5. **Snapshot Pattern**

```javascript
// Lưu cấu hình danh mục tại thời điểm tạo
SnapshotDanhMuc: {
  TenLoaiYeuCau: "Yêu cầu sửa máy móc",
  ThoiGianDuKien: 2,
  DonViThoiGian: "GIO"
}
// → Đảm bảo không bị ảnh hưởng khi danh mục thay đổi
```

---

## 📊 DATA MODELS OVERVIEW

### Core Models (7)

1. **YeuCau** (550 lines)

   - Main request document
   - 5 states, multiple user references
   - Auto-calculated fields (QuaHan, SoNgayConLai)

2. **YeuCauCounter**

   - Auto-generate MaYeuCau (YC2025000001)

3. **DanhMucYeuCau**

   - Request categories per department
   - ThoiGianDuKien, DonViThoiGian

4. **LichSuYeuCau**

   - Audit trail (30+ actions)
   - HanhDong, TuGiaTri, DenGiaTri

5. **BinhLuan**

   - Flat comment structure
   - ParentID for threading

6. **TepTin**

   - File attachments
   - Cloudinary integration

7. **CauHinhThongBaoKhoa**
   - Department config
   - Dispatcher list, notification rules

---

## 🚀 GETTING STARTED

### Prerequisites

- Đã đọc KPI documentation (optional but recommended)
- Hiểu Redux Toolkit patterns
- Hiểu MongoDB/Mongoose
- Familiar với state machine concepts

### Quick Start Guide

1. **Read 00_OVERVIEW.md** - Hiểu big picture
2. **Read 01_WORKFLOW_STATES.md** - Hiểu workflow
3. **Explore yeuCauSlice.js** - Redux implementation
4. **Check yeuCau.service.js** - Business logic
5. **Review YeuCau.js model** - Data structure

---

## 📝 DOCUMENTATION CONVENTIONS

### Code Examples

- ✅ Real code from codebase (not pseudocode)
- ✅ Complete request/response examples
- ✅ Error handling patterns
- ✅ Edge case scenarios

### Diagrams

- 📊 Mermaid diagrams for workflows
- 🎨 State machine visualizations
- 🔄 Sequence diagrams for complex flows

### Vietnamese Terminology

- **Yêu Cầu**: Request/Ticket
- **Điều Phối**: Dispatch/Assignment
- **Tiếp Nhận**: Accept
- **Từ Chối**: Reject
- **Hoàn Thành**: Complete
- **Đánh Giá**: Rating/Evaluation
- **Đóng**: Close

---

## 🎯 SUCCESS CRITERIA

Documentation is considered complete when:

- ✅ All 8 files created with comprehensive content
- ✅ Every state transition documented with examples
- ✅ All API endpoints cataloged
- ✅ Dashboard logic fully explained
- ✅ Cross-references between files consistent
- ✅ Code examples match actual implementation
- ✅ Beginner/Developer/Architect learning paths clear

---

## 📌 RELATED MODULES

### Integration Points

- **KPI Module**: YeuCau metrics in KPI dashboard
- **CongViec Module**: Task assignment correlation
- **Notification Module**: Real-time updates
- **File Module**: Attachment handling

---

## 📚 REFERENCE DOCUMENTS

Existing documentation to reference:

- `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/README.md`
- `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/FILTER_LOGIC_DOCUMENTATION.md`
- `fe-bcgiaobanbvt/src/features/implementation-guides/03-Ticket-System/`
- `giaobanbv-be/modules/workmanagement/docs/SCHEMA_DOCUMENTATION.md`

---

**Project Start Date**: 2026-01-06  
**Expected Completion**: 2026-01-13 (1 week)  
**Status**: 📝 Planning Phase → Ready to Begin

---

**LET'S BUILD COMPREHENSIVE TICKET DOCUMENTATION! 🚀**
