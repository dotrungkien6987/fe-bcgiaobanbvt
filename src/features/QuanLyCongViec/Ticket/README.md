# 📋 Ticket (Yêu Cầu Hỗ Trợ) Module

**Version:** 1.0.0  
**Last Updated:** December 11, 2025  
**Status:** ✅ Production Ready

---

## 📖 Tổng quan

Module **Yêu cầu hỗ trợ** cho phép các khoa trong bệnh viện gửi và xử lý các yêu cầu hỗ trợ liên khoa. Hệ thống hỗ trợ **4 vai trò chính** với giao diện và quyền hạn riêng biệt.

### Đặc điểm chính

- ✅ **4 giao diện role-based**: Người gửi, Người xử lý, Điều phối viên, Quản lý khoa
- ✅ **17 tabs tổng cộng** với filter logic riêng biệt cho từng tab
- ✅ **State machine 5 trạng thái**: MOI → DANG_XU_LY → DA_HOAN_THANH → DA_DONG (+ TU_CHOI)
- ✅ **Real-time badge counts**: Cập nhật mỗi 30s
- ✅ **Dashboard & KPI metrics**: Đánh giá sao, tỷ lệ đúng hạn, quá hạn
- ✅ **2 loại gửi**: Gửi đến KHOA (qua điều phối) hoặc gửi trực tiếp CÁ NHÂN
- ✅ **Timeline & Comments**: Theo dõi lịch sử, thảo luận
- ✅ **Optimized queries**: 11 MongoDB indexes cho hiệu suất cao

---

## 🗂️ Cấu trúc thư mục

```
Ticket/
├── 📄 README.md                           ← Bạn đang ở đây
│
├── 📘 DOCUMENTATION/
│   ├── QUICK_START.md                     ← Hướng dẫn setup nhanh 5 phút
│   ├── FILTER_LOGIC_DOCUMENTATION.md      ← ⭐ Chi tiết logic filter & MongoDB queries
│   ├── AVAILABLE_ACTIONS_GUIDE.md         ← ⭐ Chi tiết hệ thống Available Actions & Permissions
│   ├── IMPLEMENTATION_COMPLETE.md         ← Changelog & implementation summary
│   ├── ROLE_BASED_VIEWS.md                ← Architecture & design decisions
│   ├── BACKEND_API_EXTENSIONS.md          ← API specs & examples
│   ├── TAB_CONFIG_SYSTEM.md               ← Tab config Single Source of Truth
│   └── IMPLEMENTATION_SUMMARY.md          ← Implementation roadmap
│
├── 🎨 PAGES/ (4 role-based views)
│   ├── YeuCauToiGuiPage.js                ← Người gửi (5 tabs)
│   ├── YeuCauXuLyPage.js                  ← Người xử lý (4 tabs + KPI)
│   ├── YeuCauDieuPhoiPage.js              ← Điều phối (5 tabs + Dashboard)
│   ├── YeuCauQuanLyKhoaPage.js            ← Quản lý khoa (4 tabs + Summary)
│   ├── YeuCauDetailPage.js                ← Chi tiết YC với actions
│   ├── YeuCauPage.js                      ← Legacy view (2 tabs)
│   ├── CauHinhKhoaAdminPage.js            ← Admin: Cấu hình khoa
│   └── DanhMucYeuCauAdminPage.js          ← Admin: Danh mục YC
│
├── 🧩 COMPONENTS/
│   ├── YeuCauList.js                      ← Table/Card list (responsive)
│   ├── YeuCauCard.js                      ← Mobile card view
│   ├── YeuCauFilterPanel.js               ← Filter controls
│   ├── YeuCauFormDialog.js                ← Create/Edit form
│   ├── YeuCauStatusChip.js                ← Status badge
│   ├── YeuCauPriorityChip.js              ← Priority badge
│   ├── YeuCauActionButtons.js             ← Action buttons
│   ├── YeuCauTimeline.js                  ← History timeline
│   ├── TiepNhanDialog.js                  ← Accept dialog
│   ├── TuChoiDialog.js                    ← Reject dialog
│   ├── DieuPhoiDialog.js                  ← Dispatch dialog
│   ├── StarRatingDialog.js                ← Rating dialog
│   ├── MoLaiDialog.js                     ← Reopen dialog
│   ├── AppealDialog.js                    ← Appeal dialog
│   └── index.js                           ← Component exports
│
├── 🪝 HOOKS/
│   ├── useYeuCauRoles.js                  ← Permission check hook
│   └── useYeuCauTabs.js                   ← Tab management hook
│
├── ⚙️ CONFIG/
│   └── yeuCauTabConfig.js                 ← ⭐ Single Source of Truth for tabs
│
├── 🛠️ UTILS/
│   ├── yeuCau.constants.js                ← Constants (statuses, priorities)
│   └── yeuCau.utils.js                    ← Utility functions
│
├── 🔄 REDUX/
│   ├── yeuCauSlice.js                     ← Main slice (CRUD & actions)
│   ├── cauHinhKhoaSlice.js                ← Department config slice
│   └── danhMucYeuCauSlice.js              ← Category slice
│
└── 📋 index.js                             ← Module exports
```

---

## 🚀 Quick Start

### 1. Khởi động hệ thống

```powershell
# Backend
cd d:\project\webBV\giaobanbv-be
npm start

# Frontend
cd d:\project\webBV\fe-bcgiaobanbvt
npm start
```

### 2. Tạo indexes (lần đầu tiên)

```powershell
cd d:\project\webBV\giaobanbv-be
node scripts\addYeuCauIndexes.js
```

### 3. Truy cập hệ thống

- Frontend: `http://localhost:3000`
- Menu: **Quản lý yêu cầu** → Chọn view phù hợp với vai trò

---

## 📚 Documentation Guide

### Cho người mới bắt đầu

1. **[QUICK_START.md](./QUICK_START.md)** - Bắt đầu trong 5 phút
2. **[TAB_CONFIG_SYSTEM.md](./TAB_CONFIG_SYSTEM.md)** - Hiểu hệ thống tab

### Cho developers

1. **[FILTER_LOGIC_DOCUMENTATION.md](./FILTER_LOGIC_DOCUMENTATION.md)** - ⭐ ĐỌC ĐẦU TIÊN

   - Chi tiết logic filter cho 17 tabs
   - MongoDB queries cụ thể
   - Edge cases & test cases
   - Validation matrix

2. **[BACKEND_API_EXTENSIONS.md](./BACKEND_API_EXTENSIONS.md)** - API specifications

   - Endpoints & parameters
   - Request/response examples
   - Error handling

3. **[ROLE_BASED_VIEWS.md](./ROLE_BASED_VIEWS.md)** - Architecture
   - Design decisions
   - Component hierarchy
   - Data flow

### Cho project managers

1. **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Changelog
   - What's implemented
   - Testing checklist
   - Troubleshooting

---

## 🎯 Vai trò & Giao diện

### 1️⃣ Người gửi (All Employees)

**Route**: `/yeu-cau/toi-gui`  
**Permission**: Mọi nhân viên

**Tabs**:

- **Chờ phản hồi**: YC đã gửi, chưa ai tiếp nhận
- **Đang xử lý**: Có người đang xử lý
- **Chờ đánh giá**: Đã hoàn thành, chờ tôi đánh giá
- **Đã đóng**: Lịch sử
- **Bị từ chối**: YC bị từ chối

**Actions**: Tạo, Sửa, Xóa (khi MOI), Đánh giá, Đóng, Mở lại

---

### 2️⃣ Người xử lý (Handlers)

**Route**: `/yeu-cau/xu-ly`  
**Permission**: NV được giao việc

**Tabs**:

- **Cần xử lý**: YC được giao, chờ tiếp nhận
- **Đang xử lý**: Tôi đang xử lý
- **Chờ xác nhận**: Tôi đã hoàn thành, chờ người gửi đóng
- **Đã hoàn thành**: Lịch sử

**KPI Metrics**:

- Tổng đã xử lý
- Trung bình sao
- Tỷ lệ đúng hạn

**Actions**: Tiếp nhận, Từ chối, Hoàn thành

---

### 3️⃣ Điều phối viên (Dispatchers)

**Route**: `/yeu-cau/dieu-phoi`  
**Permission**: `CauHinhThongBaoKhoa.DanhSachNguoiDieuPhoi`

**Tabs**:

- **Mới đến**: YC mới, chưa điều phối (chỉ YC gửi KHOA)
- **Đã điều phối**: Đã giao, chờ tiếp nhận
- **Đang xử lý**: Có người đang xử lý
- **Hoàn thành**: Đã đóng
- **Từ chối**: Bị từ chối

**Dashboard**:

- YC mới hôm nay
- Đang chờ xử lý
- Quá hạn

**Actions**: Điều phối (giao việc), Điều phối lại, Từ chối

---

### 4️⃣ Quản lý khoa (Department Managers)

**Route**: `/yeu-cau/quan-ly-khoa`  
**Permission**: `CauHinhThongBaoKhoa.DanhSachQuanLyKhoa`

**Tabs**:

- **Gửi đến khoa**: Tất cả YC gửi đến
- **Khoa gửi đi**: Tất cả YC từ khoa gửi đi
- **Quá hạn**: YC chưa hoàn thành và quá deadline
- **Báo cáo**: Charts & statistics

**Summary Metrics**:

- Tổng gửi đến
- Tổng gửi đi
- Quá hạn
- Tỷ lệ hoàn thành

**Actions**: Export báo cáo, Xem chi tiết

---

## 🔄 Workflow & State Machine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LIFECYCLE OF A REQUEST                          │
└─────────────────────────────────────────────────────────────────────────┘

[NGƯỜI GỬI]         [ĐIỀU PHỐI]         [NGƯỜI XỬ LÝ]       [NGƯỜI GỬI]
     │                    │                    │                   │
     ├─1. Tạo YC─────────►│                    │                   │
     │   (MOI)            │                    │                   │
     │                    │                    │                   │
     │                    ├─2a. Điều phối─────►│                   │
     │                    │   (nếu KHOA)       │                   │
     │                    │                    │                   │
     │   (hoặc gửi trực tiếp CA_NHAN)         │                   │
     │                    │                    │                   │
     │                    │                    ├─3. Tiếp nhận──────┤
     │                    │                    │   (DANG_XU_LY)    │
     │                    │                    │                   │
     │                    │                    ├─4. Hoàn thành─────┤
     │                    │                    │   (DA_HOAN_THANH) │
     │                    │                    │                   │
     │◄───────────────────┴────────────────────┴─5. Đánh giá/Đóng │
     │                                            (DA_DONG)         │

Alternative flow:
     │                    │                    │
     │                    │                    ├─❌ Từ chối
     │                    │                    │   (TU_CHOI)
     │◄───────────────────┴────────────────────┘
```

### 5 Trạng thái

1. **MOI**: Vừa tạo, chờ tiếp nhận hoặc điều phối
2. **DANG_XU_LY**: Đã tiếp nhận và đang xử lý
3. **DA_HOAN_THANH**: Đã hoàn thành, chờ đánh giá/đóng
4. **DA_DONG**: Đã đóng (hoàn tất)
5. **TU_CHOI**: Bị từ chối

---

## 🔑 Key Concepts

### Hai loại gửi yêu cầu

#### 1. Gửi đến KHOA (LoaiNguoiNhan = "KHOA")

- YC gửi chung đến khoa
- **Cần điều phối viên giao việc** (set `NguoiDuocDieuPhoiID`)
- Hiển thị trong tab "Mới đến" của điều phối viên
- Tất cả NV khoa thấy YC (nhưng chưa thể xử lý)

#### 2. Gửi trực tiếp CÁ NHÂN (LoaiNguoiNhan = "CA_NHAN")

- YC gửi trực tiếp cho 1 người (set `NguoiNhanID`)
- **KHÔNG cần điều phối**
- KHÔNG hiển thị trong tab "Mới đến" của điều phối
- Người nhận thấy YC ở tab "Cần xử lý" ngay lập tức

### Sự khác biệt: NguoiDuocDieuPhoiID vs NguoiXuLyID

- **NguoiDuocDieuPhoiID**: Người được GIAO việc (chưa chắc tiếp nhận)
- **NguoiXuLyID**: Người THỰC TẾ xử lý (sau khi tiếp nhận)

**Edge case**: A được giao việc, A chuyển cho B, B tiếp nhận

- `NguoiDuocDieuPhoiID = A` (không đổi)
- `NguoiXuLyID = B` (sau khi B tiếp nhận)

---

## 📊 Backend Architecture

### Models (7 models)

- **YeuCau**: Main request document
- **YeuCauCounter**: Auto-generate request codes
- **DanhMucYeuCau**: Request categories
- **CauHinhThongBaoKhoa**: Department config (dispatchers, managers)
- **LichSuYeuCau**: History log
- **BinhLuan**: Comments
- **TepTin**: File attachments

### Services

- **yeuCau.service.js** (1001 lines)

  - CRUD operations
  - `layDanhSach()` with 10+ filter params
  - Dashboard metrics aggregation
  - Badge count calculations

- **yeuCauTransition.service.js** (702 lines)
  - State machine logic
  - Transition validation
  - Permission checks
  - Side effects (update dates, send notifications)

### Controllers

- **yeucau.controller.js** (398 lines)
  - 16+ endpoints
  - CRUD + 12 action endpoints
  - Dashboard & role-based queries

### Routes

- **yeucau.api.js**
  - RESTful routes
  - Action routes (`POST /:id/tiep-nhan`, etc.)
  - Dashboard routes

---

## 🎨 Frontend Architecture

### Redux Structure

```javascript
// State shape
{
  yeuCau: {
    isLoading: false,
    yeuCauList: [],           // Current page data
    yeuCauDetail: null,       // Selected YC
    availableActions: [],     // Actions for current YC

    // Dashboard
    dashboardMetrics: null,

    // Comments, files, history
    binhLuanList: [],
    tepTinList: [],
    lichSuList: [],

    // Filters
    filters: { ... },
    activeTab: "sent",

    // Pagination
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
  }
}
```

### Tab Config System (Single Source of Truth)

File: `config/yeuCauTabConfig.js` (610 lines)

**Defines**:

- 4 page configs × 17 tabs
- Base params per page
- Tab-specific params
- Icons, labels, colors
- Available actions per tab

**Usage**:

```javascript
const { tabs, apiParams, activeTab } = useYeuCauTabs("YEU_CAU_TOI_GUI", urlTab);
dispatch(getYeuCauList(apiParams));
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Người gửi

- [ ] Tạo YC mới (gửi KHOA và CA_NHAN)
- [ ] Sửa YC khi MOI
- [ ] Xóa YC khi MOI
- [ ] Đánh giá YC khi DA_HOAN_THANH
- [ ] Đóng YC
- [ ] Mở lại YC (trong 7 ngày)

#### Người xử lý

- [ ] Tiếp nhận YC (từ điều phối + gửi trực tiếp)
- [ ] Từ chối YC
- [ ] Hoàn thành YC
- [ ] Xem KPI metrics

#### Điều phối viên

- [ ] Xem tab "Mới đến" (chỉ YC gửi KHOA)
- [ ] Điều phối YC (giao cho NV)
- [ ] Xem tab "Đã điều phối"
- [ ] Điều phối lại
- [ ] Dashboard stats hiển thị đúng

#### Quản lý khoa

- [ ] Xem "Gửi đến khoa"
- [ ] Xem "Khoa gửi đi"
- [ ] Xem "Quá hạn"
- [ ] Summary metrics hiển thị đúng

### API Testing

See [BACKEND_API_EXTENSIONS.md](./BACKEND_API_EXTENSIONS.md) for Postman/Thunder Client examples.

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Dashboard stats chưa tự động load** (hardcoded 0)

   - Frontend có dashboard cards nhưng chưa gọi API
   - Backend APIs đã có sẵn

2. **Badge counts chưa hiển thị trên tabs**

   - Chỉ có trên menu
   - TODO: Thêm badge số trên tab headers

3. **Export báo cáo chưa implement**

   - Tab "Báo cáo" chưa có charts
   - Nút "Xuất báo cáo" chưa hoạt động

4. **File upload trong form tạo YC**
   - Model TepTin có sẵn
   - Form chưa có UI upload

### Edge Cases được xử lý

✅ YC gửi CA_NHAN không hiện tab "Mới đến" (có check `LoaiNguoiNhan = "KHOA"`)  
✅ YC quá hạn exclude DA_DONG và TU_CHOI  
✅ Search kết hợp đúng với tab filters (using `$and`)  
✅ Người được điều phối ≠ Người xử lý (khác NhanVienID)

---

## 📈 Performance

### Database Indexes (11 indexes)

```javascript
// Core indexes
{ NguoiYeuCauID: 1, TrangThai: 1 }
{ NguoiXuLyID: 1, TrangThai: 1 }
{ NguoiDuocDieuPhoiID: 1, TrangThai: 1 }
{ KhoaDichID: 1, TrangThai: 1 }
{ KhoaDichID: 1, LoaiNguoiNhan: 1, NguoiDuocDieuPhoiID: 1 }
{ ThoiGianHen: 1, TrangThai: 1 }
// ... và 5 indexes khác
```

**Expected Performance**:

- Query time: < 50ms (with indexes)
- Pagination: < 100ms
- Dashboard aggregation: < 200ms

### Optimization Tips

1. **Pagination**: Mặc định limit=20, tăng nếu cần
2. **Badge counts**: Poll mỗi 30s (có thể tăng lên 60s)
3. **Dashboard**: Cache 5 phút ở backend
4. **Indexes**: Chạy `node scripts/addYeuCauIndexes.js` lần đầu

---

## 🔒 Security & Permissions

### Permission Matrix (Simplified)

| Action     | Người gửi     | Người xử lý    | Điều phối | Quản lý | Admin |
| ---------- | ------------- | -------------- | --------- | ------- | ----- |
| Tạo YC     | ✅            | ✅             | ✅        | ✅      | ✅    |
| Sửa YC     | ✅ (MOI)      | ❌             | ❌        | ❌      | ✅    |
| Xóa YC     | ✅ (MOI)      | ❌             | ❌        | ❌      | ✅    |
| Tiếp nhận  | ❌            | ✅             | ❌        | ❌      | ✅    |
| Từ chối    | ❌            | ✅             | ❌        | ❌      | ✅    |
| Điều phối  | ❌            | ❌             | ✅        | ❌      | ✅    |
| Hoàn thành | ❌            | ✅ (NguoiXuLy) | ❌        | ❌      | ✅    |
| Đánh giá   | ✅ (NguoiGui) | ❌             | ❌        | ❌      | ✅    |
| Đóng       | ✅ (NguoiGui) | ❌             | ❌        | ❌      | ✅    |

### Permission Check

Backend sử dụng `yeuCauStateMachine.getAvailableActions()` để check quyền dynamic.

Frontend sử dụng `useYeuCauRoles()` hook để ẩn/hiện menu items.

**📚 Chi tiết đầy đủ**: Xem [AVAILABLE_ACTIONS_GUIDE.md](./AVAILABLE_ACTIONS_GUIDE.md) để hiểu rõ:

- Sơ đồ luồng xử lý từ frontend → backend → UI render
- Permission matrix chi tiết với 6 vai trò
- Các yếu tố ảnh hưởng: TrangThai, Rate Limit, Time Limit
- 5 scenarios thực tế với screenshots
- Code reference đầy đủ

---

## 🚀 Next Steps (Optional)

### High Priority (Future)

- [ ] Implement dashboard data loading
- [ ] Add badge counts to tab headers
- [ ] Implement export Excel/PDF
- [ ] Add file upload to create form

### Medium Priority

- [ ] WebSocket real-time notifications
- [ ] Advanced filter panel (priority, date range)
- [ ] Charts in "Báo cáo" tab
- [ ] Mobile optimization

### Low Priority

- [ ] Bulk actions (multi-select)
- [ ] Keyboard shortcuts
- [ ] Email notifications
- [ ] SLA tracking & alerts

---

## 📞 Support & Contact

**Files to check for issues**:

- Backend: `modules/workmanagement/services/yeuCau.service.js`
- Frontend: `src/features/QuanLyCongViec/Ticket/`
- Config: `config/yeuCauTabConfig.js`

**Common issues**: See [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) → Troubleshooting section

**Documentation**: See [FILTER_LOGIC_DOCUMENTATION.md](./FILTER_LOGIC_DOCUMENTATION.md) for complete filter logic

---

**Version History**:

- **v1.0.0** (Dec 8, 2025): Initial role-based views
- **v1.0.1** (Dec 11, 2025): Enhanced filter logic + comprehensive docs
