# Role-Based Views - Hệ Thống Yêu Cầu

**Ngày tạo**: 08/12/2025  
**Trạng thái**: 🚧 Đang implement

---

## Tổng Quan

Refactor hệ thống YeuCau từ **single-page view** sang **role-based views** để cải thiện UX. Mỗi vai trò có route riêng với tabs và filters phù hợp.

---

## Architecture

### 1. Routes & Pages

| Route                   | Page Component         | Vai trò         | Quyền truy cập                                    |
| ----------------------- | ---------------------- | --------------- | ------------------------------------------------- |
| `/yeu-cau/toi-gui`      | `YeuCauToiGuiPage`     | Người gửi       | Tất cả nhân viên                                  |
| `/yeu-cau/xu-ly`        | `YeuCauXuLyPage`       | Người xử lý     | Có `NguoiDuocDieuPhoiID` hoặc `NguoiXuLyID`       |
| `/yeu-cau/dieu-phoi`    | `YeuCauDieuPhoiPage`   | Người điều phối | Trong `CauHinhThongBaoKhoa.DanhSachNguoiDieuPhoi` |
| `/yeu-cau/quan-ly-khoa` | `YeuCauQuanLyKhoaPage` | Quản lý khoa    | Trong `CauHinhThongBaoKhoa.DanhSachQuanLyKhoa`    |

**Legacy route** `/yeu-cau` (YeuCauPage) giữ lại cho backward compatibility, redirect đến route phù hợp nhất.

---

### 2. Tab Structure

#### YeuCauToiGuiPage (Người Gửi)

```javascript
const TABS = [
  { value: "cho-phan-hoi", TrangThai: ["MOI"] },
  { value: "dang-xu-ly", TrangThai: ["DANG_XU_LY"] },
  { value: "cho-danh-gia", TrangThai: ["DA_HOAN_THANH"] },
  { value: "da-dong", TrangThai: ["DA_DONG"] },
  { value: "tu-choi", TrangThai: ["TU_CHOI"] },
];
// Base filter: NhanVienTaoID = currentUser.NhanVienID
```

#### YeuCauXuLyPage (Người Xử Lý)

```javascript
const TABS = [
  {
    value: "cho-tiep-nhan",
    filters: { TrangThai: ["MOI"], NguoiDuocDieuPhoiID: me },
  },
  {
    value: "dang-xu-ly",
    filters: { TrangThai: ["DANG_XU_LY"], NhanVienXuLyID: me },
  },
  {
    value: "cho-xac-nhan",
    filters: { TrangThai: ["DA_HOAN_THANH"], NhanVienXuLyID: me },
  },
  {
    value: "da-hoan-thanh",
    filters: { TrangThai: ["DA_DONG"], NhanVienXuLyID: me },
  },
];
```

**KPI Metrics Cards**:

- Tổng đã xử lý
- Trung bình sao (đánh giá)
- Tỷ lệ đúng hạn

#### YeuCauDieuPhoiPage (Người Điều Phối)

```javascript
const TABS = [
  {
    value: "moi-den",
    filters: {
      KhoaDichID: myKhoa,
      TrangThai: ["MOI"],
      LoaiNguoiNhan: "KHOA",
      ChuaDieuPhoi: true, // NguoiDuocDieuPhoiID = null
    },
  },
  {
    value: "cho-tiep-nhan",
    filters: {
      KhoaDichID: myKhoa,
      TrangThai: ["MOI"],
      DaDieuPhoi: true, // NguoiDuocDieuPhoiID != null
    },
  },
  {
    value: "dang-xu-ly",
    filters: { KhoaDichID: myKhoa, TrangThai: ["DANG_XU_LY"] },
  },
  {
    value: "hoan-thanh",
    filters: { KhoaDichID: myKhoa, TrangThai: ["DA_HOAN_THANH", "DA_DONG"] },
  },
  {
    value: "tu-choi",
    filters: { KhoaDichID: myKhoa, TrangThai: ["TU_CHOI"] },
  },
];
```

**Dashboard Metrics**:

- YC mới hôm nay
- Đang chờ xử lý
- Quá hạn

#### YeuCauQuanLyKhoaPage (Quản Lý Khoa)

```javascript
const TABS = [
  {
    value: "gui-den-khoa",
    filters: { KhoaDichID: myKhoa }, // Tất cả trạng thái
  },
  {
    value: "khoa-gui-di",
    filters: { KhoaNguonID: myKhoa }, // Tất cả trạng thái
  },
  {
    value: "qua-han",
    filters: { KhoaDichID: myKhoa, QuaHan: true },
  },
  {
    value: "bao-cao", // Special tab - show dashboard only
  },
];
```

**Features**:

- Export Excel report
- Charts & analytics
- Filter theo nhân viên
- Thống kê theo loại yêu cầu

---

### 3. Permission Check Hook

```javascript
// useYeuCauRoles.js
export function useYeuCauRoles() {
  const { user } = useAuth();
  const myPermissions = useSelector(selectMyPermissions);

  return {
    isNguoiDieuPhoi: myPermissions?.isDieuPhoi || false,
    isQuanLyKhoa: myPermissions?.isQuanLyKhoa || false,
    khoaDieuPhoiIds: myPermissions?.khoaDieuPhoiIds || [],
    khoaQuanLyIds: myPermissions?.khoaQuanLyIds || [],
    isAdmin: ["admin", "superadmin"].includes(user?.PhanQuyen),
    loading: false,
  };
}
```

**Redux Action**: `getMyPermissions()` - gọi API để lấy permissions từ `CauHinhThongBaoKhoa`

---

### 4. Menu Integration

```javascript
// Layout/Navigation.js
const menuItems = [
  {
    label: "Yêu cầu hỗ trợ",
    icon: <RequestIcon />,
    children: [
      {
        label: "Tôi gửi đi",
        path: "/yeu-cau/toi-gui",
        badge: badgeCounts.toiGui, // Real-time count
      },
      {
        label: "Tôi xử lý",
        path: "/yeu-cau/xu-ly",
        badge: badgeCounts.xuLy,
        show: hasYeuCauCanXuLy(), // Conditional render
      },
      {
        label: "Điều phối",
        path: "/yeu-cau/dieu-phoi",
        badge: badgeCounts.dieuPhoi,
        show: roles.isNguoiDieuPhoi,
        icon: "👑",
      },
      {
        label: "Quản lý khoa",
        path: "/yeu-cau/quan-ly-khoa",
        show: roles.isQuanLyKhoa,
        icon: "👔",
      },
      { divider: true },
      {
        label: "Cấu hình",
        path: "/yeu-cau/admin/cau-hinh-khoa",
        show: roles.isQuanLyKhoa || roles.isAdmin,
      },
    ],
  },
];
```

---

### 5. Backend API Updates

#### New Filter Shortcuts

```javascript
// yeuCau.service.js - layDanhSach()
function applyRoleFilters(filters, nhanVienId, khoaId) {
  // Shortcut: ?role=xu-ly
  if (filters.role === "xu-ly") {
    return {
      $or: [
        { NguoiDuocDieuPhoiID: nhanVienId, TrangThai: "MOI" },
        { NguoiXuLyID: nhanVienId },
      ],
    };
  }

  // Shortcut: ?role=dieu-phoi&tab=moi-den
  if (filters.role === "dieu-phoi") {
    const base = { KhoaDichID: khoaId };
    if (filters.tab === "moi-den") {
      base.TrangThai = "MOI";
      base.LoaiNguoiNhan = "KHOA";
      base.NguoiDuocDieuPhoiID = null; // Chưa điều phối
    }
    return base;
  }

  // ... handle other shortcuts
  return filters;
}
```

#### API Endpoints Mới

```javascript
// GET /api/workmanagement/yeucau/my-permissions
// Response: { isDieuPhoi, isQuanLyKhoa, khoaDieuPhoiIds, khoaQuanLyIds }

// GET /api/workmanagement/yeucau/badge-counts
// Response: { toiGui, xuLy, dieuPhoi }

// GET /api/workmanagement/yeucau/dashboard/xu-ly
// Response: { tongXuLy, trungBinhSao, tyLeDungHan }

// GET /api/workmanagement/yeucau/dashboard/dieu-phoi
// Response: { moiHomNay, dangChoXuLy, quaHan }
```

---

## Implementation Checklist

### Frontend

- [x] Tạo `useYeuCauRoles.js` hook
- [x] Tạo 4 page components với tabs
- [x] Export pages từ `index.js`
- [ ] Fix syntax errors trong các pages
- [ ] Update `routes/index.js` với 4 routes mới
- [ ] Update menu navigation với conditional rendering
- [ ] Implement badge counts (real-time hoặc polling)
- [ ] Tạo dashboard metric components
- [ ] Add filter shortcuts vào Redux slice

### Backend

- [ ] Add `getMyPermissions()` API endpoint
- [ ] Add `getBadgeCounts()` API endpoint
- [ ] Add dashboard metric endpoints
- [ ] Update `layDanhSach()` với filter shortcuts
- [ ] Add indexes cho queries mới (performance)

### Testing

- [ ] Test permission checks cho từng route
- [ ] Test tab filters hoạt động đúng
- [ ] Test badge counts update real-time
- [ ] Test responsive UI trên mobile
- [ ] Test với nhiều vai trò khác nhau (multi-role users)

---

## Migration Plan

### Phase 1: Parallel Deployment (Week 1)

- Deploy 4 routes mới cùng tồn tại với route cũ
- Thêm banner trên `/yeu-cau` cũ: "Thử giao diện mới"
- Gather feedback

### Phase 2: Soft Launch (Week 2)

- Default redirect từ `/yeu-cau` → route phù hợp nhất
- Keep option "Quay lại giao diện cũ"

### Phase 3: Full Migration (Week 3)

- Remove old `/yeu-cau` page
- Update all links trong hệ thống
- Update documentation

---

## Benefits

### Improved UX

- ✅ Context-aware views cho từng vai trò
- ✅ Giảm cognitive load - mỗi page chỉ show data liên quan
- ✅ Quick actions phù hợp với vai trò
- ✅ Real-time badge notifications

### Performance

- ✅ Targeted queries - ít data hơn mỗi lần fetch
- ✅ Cached permissions - không cần check mỗi request
- ✅ Lazy load tabs - chỉ fetch khi cần

### Maintainability

- ✅ Separation of concerns - mỗi page có logic riêng
- ✅ Reusable components (`YeuCauList`, `YeuCauCard`)
- ✅ Centralized permission logic trong hook

---

## Notes

- **Backward Compatibility**: Legacy route `/yeu-cau` vẫn hoạt động, redirect thông minh dựa trên vai trò
- **Mobile Responsive**: Tất cả views đều mobile-first design
- **Real-time Updates**: Có thể dùng WebSocket hoặc polling cho badge counts
- **Multi-role Users**: User có nhiều vai trò sẽ thấy tất cả menu items tương ứng

---

**Maintained by**: Development Team  
**Last Updated**: 08/12/2025
