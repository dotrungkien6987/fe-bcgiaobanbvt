# Quản Lý Công Việc - Hệ thống Tổng hợp

**Version:** 1.0  
**Last Updated:** 25/11/2025  
**Status:** Production Ready (CongViec, KPI) + Planning (Notification, Ticket)

---

## 📋 Tổng quan

Module **Quản Lý Công Việc** là hệ thống tổng hợp quản lý:

- ✅ **Công việc thực tế** (operational tasks) với workflow và collaboration
- ✅ **Đánh giá hiệu suất KPI** theo chu kỳ và tiêu chí động
- ✅ **Gán nhiệm vụ thường quy** cho nhân viên theo chu kỳ
- 🚧 **Thông báo thời gian thực** (đang phát triển)
- 🚧 **Quản lý ticket/sự cố** (đang phát triển)

---

## 🗂️ Cấu trúc Module

```
QuanLyCongViec/
├── 📄 WORKMANAGEMENT_GUIDE.md      # File này - tổng quan
├── 📄 MODULE_ARCHITECTURE.md       # Kiến trúc & data flow chi tiết
│
├── 📁 CongViec/                    # ✅ Task Management (Hoàn thành)
│   ├── TASK_GUIDE.md
│   └── docs/                       # 15 files tài liệu chi tiết
│       ├── DOCS_INDEX.md           # Index
│       ├── architecture-overview.md
│       ├── api-spec.md
│       └── ...
│
├── 📁 KPI/                         # ✅ Performance Evaluation (Hoàn thành)
│   ├── KPI_GUIDE.md                # Hướng dẫn đầy đủ
│   └── KPI_FORMULA.md              # Công thức tính điểm
│
├── 📁 GiaoNhiemVu/                 # ✅ Task Assignment (Hoàn thành)
│   └── ASSIGNMENT_GUIDE.md
│
├── 📁 ChuKyDanhGia/                # ✅ Evaluation Cycles (Hoàn thành)
│   └── CYCLE_GUIDE.md
│
├── 📁 NhiemVuThuongQuy/            # Master Data - Routine Duties
├── 📁 TieuChiDanhGia/              # Master Data - Evaluation Criteria
├── 📁 QuanLyNhanVien/              # Employee Management
├── 📁 BaoCaoThongKeKPI/            # KPI Reports & Analytics
│
├── 📁 Notification/                # 🚧 Đang phát triển
│   └── NOTIFICATION_SPEC.md        # Thiết kế & roadmap
│
└── 📁 Ticket/                      # 🚧 Đang phát triển
    └── TICKET_SPEC.md              # Thiết kế & roadmap
```

---

## 🚀 Quick Start

### Điều hướng nhanh

| Module                | URL                                 | Mô tả                             | Status |
| --------------------- | ----------------------------------- | --------------------------------- | ------ |
| **Công việc của tôi** | `/quanlycongviec/congviec/received` | Danh sách công việc được giao     | ✅     |
| **Công việc đã giao** | `/quanlycongviec/congviec/assigned` | Công việc tôi giao cho người khác | ✅     |
| **Đánh giá KPI**      | `/quanlycongviec/kpi/danh-gia`      | Manager chấm điểm KPI nhân viên   | ✅     |
| **Tự đánh giá KPI**   | `/quanlycongviec/kpi/tu-danh-gia`   | Nhân viên tự chấm điểm            | ✅     |
| **Gán nhiệm vụ**      | `/quanlycongviec/giao-nhiem-vu`     | Quản lý gán nhiệm vụ theo chu kỳ  | ✅     |
| **Thông báo**         | `/notifications`                    | Theo dõi sự kiện hệ thống         | 🚧     |
| **Ticket**            | `/tickets`                          | Quản lý ticket/sự cố              | 🚧     |

### User Roles

| Role         | Quyền hạn                                                                         |
| ------------ | --------------------------------------------------------------------------------- |
| **Admin**    | Toàn quyền - Quản lý master data (NhiemVuThuongQuy, TieuChiDanhGia, ChuKyDanhGia) |
| **Manager**  | Giao việc, chấm KPI nhân viên được quản lý, xem báo cáo                           |
| **Employee** | Xem công việc của mình, tự đánh giá KPI, comment/collaborate                      |

---

## 📚 Tài liệu chi tiết

### Kiến trúc & Data Flow

**📖 Đọc trước:** [MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)

Tài liệu này chứa:

- Dependency graph giữa các modules
- Data flow patterns (KPI evaluation, task workflow)
- **Output Events** cho Notification module
- Integration points & business rules

### Module-specific Documentation

#### 1. CongViec (Task Management)

**📖 Chi tiết:** [CongViec/docs/DOCS_INDEX.md](./CongViec/docs/DOCS_INDEX.md)

**Key Features:**

- ✅ State machine với 9+ trạng thái (TAO_MOI → DA_GIAO → DANG_THUC_HIEN → HOAN_THANH)
- ✅ Optimistic concurrency (version control)
- ✅ Comment threading với replies cache
- ✅ File attachments (separate from comments)
- ✅ Deadline warning system (NgayCanhBao)
- ✅ Approval workflow (CoDuyetHoanThanh)

**API Docs:** [CongViec/docs/api-spec.md](./CongViec/docs/api-spec.md)

#### 2. KPI (Performance Evaluation)

**📖 Chi tiết:** [KPI/KPI_GUIDE.md](./KPI/KPI_GUIDE.md)

**Key Features:**

- ✅ Tự đánh giá + Đánh giá quản lý
- ✅ Tiêu chí động (TANG_DIEM/GIAM_DIEM)
- ✅ Công thức đặc biệt cho "Mức độ hoàn thành": `(DiemQL × 2 + DiemTuDanhGia) / 3`
- ✅ Real-time calculation preview
- ✅ Approval với snapshot TongDiemKPI
- ✅ Undo approval với lịch sử

**Formula Docs:** [KPI/KPI_FORMULA.md](./KPI/KPI_FORMULA.md)

#### 3. GiaoNhiemVu (Task Assignment)

**📖 Chi tiết:** [GiaoNhiemVu/ASSIGNMENT_GUIDE.md](./GiaoNhiemVu/ASSIGNMENT_GUIDE.md)

**Key Features:**

- ✅ Gán nhiệm vụ theo chu kỳ (cycle-based)
- ✅ Permanent assignments (ChuKyDanhGiaID = null)
- ✅ Copy từ chu kỳ trước
- ✅ Batch update với validation
- ✅ Protection: Không xóa nếu đã chấm điểm

#### 4. ChuKyDanhGia (Evaluation Cycles)

**📖 Chi tiết:** [ChuKyDanhGia/CYCLE_GUIDE.md](./ChuKyDanhGia/CYCLE_GUIDE.md)

**Key Features:**

- ✅ Open/Close cycles (isDong flag)
- ✅ Tiêu chí cấu hình cho từng chu kỳ
- ✅ Delete validation (chặn nếu có KPI/Assignment)
- ✅ Duplicate prevention

#### 5. Notification (In Development)

**📖 Thiết kế:** [Notification/NOTIFICATION_SPEC.md](./Notification/NOTIFICATION_SPEC.md)

**Planned Features:**

- 🚧 Real-time notifications via WebSocket
- 🚧 Unread badge counter
- 🚧 Event listeners for all modules
- 🚧 Deep links to related entities

**See:** [MODULE_ARCHITECTURE.md#output-events](./MODULE_ARCHITECTURE.md#-output-events-for-notification-module) for event specifications

#### 6. Ticket (In Development)

**📖 Thiết kế:** [Ticket/TICKET_SPEC.md](./Ticket/TICKET_SPEC.md)

**Planned Features:**

- 🚧 Priority queue management
- 🚧 SLA tracking
- 🚧 Escalation rules
- 🚧 Link to CongViec (quá hạn → ticket)

---

## 🔄 Data Flow Examples

### Example 1: Complete KPI Evaluation Cycle

```
1. Admin tạo ChuKyDanhGia "Q1 2025"
   ├─ Set: NgayBatDau, NgayKetThuc
   └─ Config: TieuChiCauHinh[]

2. Manager gán nhiệm vụ (GiaoNhiemVu)
   ├─ Select: NhanVienID, NhiemVuThuongQuyID[]
   ├─ Set: MucDoKho (1-10)
   └─ Link: ChuKyDanhGiaID

3. Employee tự đánh giá
   ├─ View: Assigned tasks for Q1
   ├─ Input: DiemTuDanhGia (0-100)
   └─ Save: NhanVienNhiemVu.DiemTuDanhGia

4. Manager chấm điểm (KPI module)
   ├─ Load: Tasks for employee + cycle
   ├─ Score: ChiTietDiem[] (per criterion)
   └─ Save: DanhGiaNhiemVuThuongQuy

5. Manager duyệt KPI
   ├─ Validate: All tasks scored
   ├─ Calculate: TongDiemKPI (with DiemTuDanhGia)
   ├─ Snapshot: Save to DanhGiaKPI.TongDiemKPI
   ├─ Lock: TrangThai = "DA_DUYET"
   └─ ⚡ Event: KPI_APPROVED → Notification

6. (Optional) Hủy duyệt
   ├─ POST: /kpi/:id/huy-duyet
   ├─ Save: LichSuHuyDuyet snapshot
   ├─ Unlock: TrangThai = "CHUA_DUYET"
   └─ ⚡ Event: KPI_APPROVAL_REVERTED
```

### Example 2: Task Workflow with Notifications

```
1. Create → Assign
   ├─ POST /congviec
   ├─ POST /congviec/:id/giao-viec
   └─ ⚡ Event: TASK_ASSIGNED → Notification to NguoiChinhID

2. Accept → Work
   ├─ POST /congviec/:id/transition {action: TIEP_NHAN}
   ├─ Status: DA_GIAO → DANG_THUC_HIEN
   └─ ⚡ Event: TASK_ACCEPTED → Notification to NguoiGiaoViecID

3. Complete
   ├─ POST /congviec/:id/transition {action: HOAN_THANH}
   ├─ Status: DANG_THUC_HIEN → HOAN_THANH
   ├─ Calculate: SoGioTre, HoanThanhTreHan
   └─ ⚡ Event: TASK_COMPLETED → Notification to NguoiGiaoViecID

4. Collaboration
   ├─ POST /congviec/:id/comment
   └─ ⚡ Event: TASK_COMMENT_ADDED → Notification to all participants
```

---

## 🔧 Tech Stack

### Frontend

- **Framework:** React 18 + Redux Toolkit
- **UI:** Material-UI v5
- **Forms:** React Hook Form + Yup validation
- **API:** Axios with interceptors
- **Real-time:** (Planned) Socket.io for notifications

### Backend

- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT with refresh tokens
- **File Upload:** Multer + Cloudinary
- **Real-time:** (Planned) Socket.io

### Architecture Patterns

- **Frontend:** Feature-based folder structure, Redux slices per domain
- **Backend:** Module-based (`modules/workmanagement/`), services layer
- **API:** RESTful with standardized response format
- **Concurrency:** Optimistic locking with `If-Unmodified-Since` header

---

## 🧪 Testing Strategy

### Frontend Testing

- **Unit:** Utils (kpiCalculation.js, congViecUtils.js)
- **Integration:** Redux thunks + API mocks
- **E2E:** Cypress (planned)

### Backend Testing

- **Unit:** Business logic in services
- **Integration:** API endpoints + DB operations
- **Load:** Performance testing for aggregation queries

### Test Coverage Goals

- Services: 80%+
- Utils: 90%+
- Critical paths: 100% (KPI calculation, state machine)

---

## 📊 Performance Metrics

### Current Performance

| Metric                     | Value  | Target |
| -------------------------- | ------ | ------ |
| API Response Time (avg)    | <200ms | <300ms |
| Frontend Load Time         | <2s    | <3s    |
| KPI Calculation (frontend) | <50ms  | <100ms |
| Task List Load (100 items) | <500ms | <1s    |

### Optimization Applied

- ✅ Server-side pagination (CongViec)
- ✅ Real-time calculation preview (KPI - no API calls)
- ✅ Comment replies lazy loading
- ✅ Routine tasks cache (5-min TTL)
- ✅ Patch update for transitions (vs. full object)

---

## 🚦 Roadmap

### ✅ Phase 1: Core Features (Completed)

- [x] CongViec workflow & state machine
- [x] KPI evaluation với tự đánh giá
- [x] Assignment theo chu kỳ
- [x] Approval/undo workflows

### 🚧 Phase 2: Real-time & Collaboration (In Progress)

- [ ] Notification system
  - [ ] Backend event emitters
  - [ ] WebSocket infrastructure
  - [ ] Frontend notification center
- [ ] Ticket management
  - [ ] Priority queue
  - [ ] SLA tracking
  - [ ] Integration với CongViec

### 🔮 Phase 3: Advanced Features (Planned)

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered task suggestions
- [ ] Calendar integration
- [ ] Email notifications (backup)

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Notification:** Chỉ có model backend, chưa có UI và WebSocket
2. **Ticket:** Chưa implement
3. **Mobile:** Desktop-only UI (chưa optimize mobile)
4. **Email:** Chưa có email notification backup

### Workarounds

- Notification: User cần refresh page để xem updates
- Mobile: Sử dụng responsive layout, nhưng UX chưa tối ưu

---

## 📞 Support & Contribution

### Getting Help

1. **Documentation:** Đọc README.md của từng module
2. **Architecture:** Xem [ARCHITECTURE.md](./ARCHITECTURE.md) để hiểu data flow
3. **Code:** Check `docs/` subfolder trong mỗi module

### Development Workflow

1. **Branch naming:** `feature/module-name`, `bugfix/issue-description`
2. **Commit messages:** Conventional commits (`feat:`, `fix:`, `docs:`)
3. **Documentation:** Update README khi thay đổi logic nghiệp vụ
4. **Testing:** Write tests cho business logic quan trọng

### Code Review Checklist

- [ ] Code follows existing patterns (Redux slice, service layer)
- [ ] Business logic documented in comments
- [ ] API response format consistent
- [ ] Error handling with user-friendly messages
- [ ] Update README nếu thay đổi API hoặc workflow

---

## 📝 Changelog

### 2025-11-25 - Documentation Refactor

- ✅ Archived 43 legacy docs to `_archive_legacy_docs_2025-11-25/`
- ✅ Created ARCHITECTURE.md with event system
- ✅ Standardized README structure across modules
- ✅ Added skeleton docs for Notification & Ticket

### Previous Updates

- See archived docs in `_archive_legacy_docs_2025-11-25/` for historical changes

---

**Maintained by:** Development Team  
**Last Major Update:** November 2025  
**Next Review:** December 2025 or before Notification module launch
