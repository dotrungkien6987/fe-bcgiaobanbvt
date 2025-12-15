# 🎯 Available Actions & Permission System - Visual Guide

**Version:** 1.0.0  
**Last Updated:** December 14, 2025  
**Module:** Ticket (Yêu Cầu Hỗ Trợ)

---

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Sơ Đồ Luồng Xử Lý](#sơ-đồ-luồng-xử-lý)
3. [Yếu Tố Ảnh Hưởng](#yếu-tố-ảnh-hưởng)
4. [Permission Matrix Chi Tiết](#permission-matrix-chi-tiết)
5. [Vai Trò & Xác Định](#vai-trò--xác-định)
6. [Frontend Render Logic](#frontend-render-logic)
7. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)
8. [Code Reference](#code-reference)

---

## 🎯 Tổng Quan Hệ Thống

### Luồng Hiển Thị "Thao Tác Khả Dụng"

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER XEM YÊU CẦU                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  YeuCauDetailPage.js (Frontend)                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  const availableActions = useSelector(                   │   │
│  │    selectAvailableActions                                │   │
│  │  );                                                       │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  yeuCauSlice.js - Redux State                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  initialState: {                                         │   │
│  │    yeuCauDetail: null,                                   │   │
│  │    availableActions: [],  ← Mảng actions từ backend     │   │
│  │  }                                                       │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ Fetch khi load detail
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  GET /api/workmanagement/yeucau/:id (Backend)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  yeuCau.service.js - layChiTiet()                        │   │
│  │  1. Load YeuCau document                                 │   │
│  │  2. Check permission xem                                 │   │
│  │  3. Call yeuCauStateMachine.getAvailableActions()        │   │
│  │  4. Return { yeuCau, availableActions }                  │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  yeuCauStateMachine.js - getAvailableActions()                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FOR EACH action in TRANSITIONS[yeuCau.TrangThai]:      │   │
│  │    1. Skip "TU_DONG_DONG" (system only)                  │   │
│  │    2. Check permission via checkPermission()             │   │
│  │    3. Validate time limit (cho MO_LAI - 7 ngày)         │   │
│  │    4. If passed → add to availableActions[]             │   │
│  │  RETURN availableActions                                 │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  checkPermission() - Permission Matrix                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tính toán roles:                                        │   │
│  │  • isNguoiGui = yeuCau.laNguoiGui(nguoiThucHienId)       │   │
│  │  • isNguoiXuLy = yeuCau.laNguoiXuLy(nguoiThucHienId)     │   │
│  │  • isDieuPhoi = check CauHinhThongBaoKhoa               │   │
│  │  • isNguoiNhan, isNguoiDuocDieuPhoi                     │   │
│  │  • isAdmin = check User.PhanQuyen                        │   │
│  │                                                          │   │
│  │  Permission Map (per action - per role)                  │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  YeuCauActionButtons.js (Frontend Render)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Nhận availableActions[] từ props                      │   │
│  │  • Filter bỏ BINH_LUAN                                   │   │
│  │  • Chia thành Primary/Secondary actions                  │   │
│  │  • Render buttons theo ACTION_CONFIG                     │   │
│  │    - Primary: variant="contained" (nổi bật)             │   │
│  │    - Secondary: trong menu dropdown "More"               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Yếu Tố Ảnh Hưởng Đến Hiển Thị Thao Tác

### 1. **Trạng Thái Yêu Cầu (TrangThai)** 🏷️

Mỗi trạng thái có bộ actions riêng biệt theo state machine:

| Trạng Thái        | Actions Có Thể Có                                                                    | Mô Tả                                    |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| **MOI**           | `TIEP_NHAN`, `TU_CHOI`, `DIEU_PHOI`, `GUI_VE_KHOA`, `NHAC_LAI`, `BAO_QUAN_LY`, `XOA` | Yêu cầu mới chưa được xử lý              |
| **DANG_XU_LY**    | `HOAN_THANH`, `HUY_TIEP_NHAN`, `DOI_THOI_GIAN_HEN`                                   | Đang được xử lý bởi người được giao      |
| **DA_HOAN_THANH** | `DANH_GIA`, `DONG`, `YEU_CAU_XU_LY_TIEP`                                             | Người xử lý đã báo hoàn thành            |
| **DA_DONG**       | `MO_LAI` (trong 7 ngày)                                                              | Đã đóng (do đánh giá hoặc đóng thủ công) |
| **TU_CHOI**       | `APPEAL`                                                                             | Bị từ chối, có thể khiếu nại             |

**State Transitions Diagram:**

```
         ┌─────────┐
    ┌───→│   MOI   │←──────┐
    │    └────┬────┘       │
    │         │            │
    │    TIEP_NHAN     GUI_VE_KHOA
    │         │            │
    │    ┌────▼─────┐      │
    │    │DANG_XU_LY│──────┘
    │    └────┬─────┘
    │         │
    │    HOAN_THANH
    │         │
    │    ┌────▼──────────┐
    │    │DA_HOAN_THANH  │
    │    └────┬──────────┘
    │         │
    │    DANH_GIA / DONG
    │         │
    │    ┌────▼────┐
    └────┤DA_DONG  │
         └─────────┘
              │
           MO_LAI (7 ngày)
              │
         (quay về DA_HOAN_THANH)

    ┌─────────┐
    │TU_CHOI  │──APPEAL──→ MOI
    └─────────┘
```

**Code**: [yeuCauStateMachine.js:26-123](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L26-L123) - `TRANSITIONS`

---

### 2. **Vai Trò Người Dùng (Relationship)** 👥

#### Permission Matrix Chi Tiết:

| Action                 | Người Gửi   | Người Xử Lý | Điều Phối Viên | Người Nhận (CA_NHAN) | Người Được Điều Phối | Admin |
| ---------------------- | ----------- | ----------- | -------------- | -------------------- | -------------------- | ----- |
| **TIEP_NHAN**          | ❌          | ❌          | ✅             | ✅                   | ✅                   | ❌    |
| **TU_CHOI**            | ❌          | ❌          | ✅             | ✅                   | ✅                   | ❌    |
| **XOA**                | ✅          | ❌          | ❌             | ❌                   | ❌                   | ✅    |
| **DIEU_PHOI**          | ❌          | ❌          | ✅             | ❌                   | ❌                   | ❌    |
| **GUI_VE_KHOA**        | ❌          | ❌          | ❌             | ✅                   | ✅                   | ❌    |
| **NHAC_LAI**           | ✅ (3/ngày) | ❌          | ❌             | ❌                   | ❌                   | ❌    |
| **BAO_QUAN_LY**        | ✅ (1/ngày) | ❌          | ❌             | ❌                   | ❌                   | ❌    |
| **HOAN_THANH**         | ❌          | ✅          | ❌             | ❌                   | ❌                   | ❌    |
| **HUY_TIEP_NHAN**      | ❌          | ✅          | ❌             | ❌                   | ❌                   | ❌    |
| **DOI_THOI_GIAN_HEN**  | ❌          | ✅          | ❌             | ❌                   | ❌                   | ❌    |
| **DANH_GIA**           | ✅          | ❌          | ❌             | ❌                   | ❌                   | ❌    |
| **DONG**               | ✅          | ✅          | ❌             | ❌                   | ❌                   | ✅    |
| **YEU_CAU_XU_LY_TIEP** | ❌          | ✅          | ❌             | ❌                   | ❌                   | ❌    |
| **MO_LAI**             | ✅          | ✅          | ❌             | ❌                   | ❌                   | ❌    |
| **APPEAL**             | ✅          | ❌          | ❌             | ❌                   | ❌                   | ❌    |

**Giải thích vai trò:**

- **Người Gửi** (`isNguoiGui`): `yeuCau.NguoiYeuCauID === nguoiThucHienId`
- **Người Xử Lý** (`isNguoiXuLy`): `yeuCau.NguoiXuLyID === nguoiThucHienId`
- **Điều Phối Viên** (`isDieuPhoi`): Có trong `CauHinhThongBaoKhoa.DanhSachNguoiDieuPhoi`
- **Người Nhận** (`isNguoiNhan`): `yeuCau.NguoiNhanID === nguoiThucHienId` (nếu LoaiNguoiNhan = CA_NHAN)
- **Người Được Điều Phối** (`isNguoiDuocDieuPhoi`): `yeuCau.NguoiDuocDieuPhoiID === nguoiThucHienId`
- **Admin**: `User.PhanQuyen` = "admin" hoặc "superadmin"

**Code**: [yeuCauStateMachine.js:162-192](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L162-L192) - `permissionMap`

---

### 3. **Xác Định Vai Trò (Role Calculation)** 🧮

Backend tính toán vai trò người dùng với yêu cầu cụ thể:

```javascript
// File: yeuCauStateMachine.js - checkPermission()

// 1. Vai trò cơ bản (từ YeuCau document)
const isNguoiGui = yeuCau.laNguoiGui(nguoiThucHienId);
// ↑ yeuCau.NguoiYeuCauID?.toString() === nguoiThucHienId.toString()

const isNguoiXuLy = yeuCau.laNguoiXuLy(nguoiThucHienId);
// ↑ yeuCau.NguoiXuLyID?.toString() === nguoiThucHienId.toString()

const isNguoiNhan = yeuCau.laNguoiNhan(nguoiThucHienId);
// ↑ Chỉ khi LoaiNguoiNhan === "CA_NHAN"
//   và yeuCau.NguoiNhanID?.toString() === nguoiThucHienId.toString()

const isNguoiDuocDieuPhoi = yeuCau.laNguoiDuocDieuPhoi(nguoiThucHienId);
// ↑ yeuCau.NguoiDuocDieuPhoiID?.toString() === nguoiThucHienId.toString()

// 2. Vai trò điều phối (từ CauHinhThongBaoKhoa)
let isDieuPhoi = false;
if (yeuCau.LoaiNguoiNhan === "KHOA") {
  const config = await CauHinhThongBaoKhoa.findOne({
    KhoaID: yeuCau.KhoaDichID,
  });
  isDieuPhoi = config?.laNguoiDieuPhoi(nguoiThucHienId) || false;
  // ↑ Check trong config.DanhSachNguoiDieuPhoi array
}

// 3. Vai trò admin (từ User.PhanQuyen)
const isAdmin = ["admin", "superadmin"].includes(
  (userRole || "").toLowerCase()
);
```

**YeuCau Model Methods:**

```javascript
// File: YeuCau.js
yeuCauSchema.methods.laNguoiGui = function (nhanVienId) {
  return this.NguoiYeuCauID?.toString() === nhanVienId.toString();
};

yeuCauSchema.methods.laNguoiXuLy = function (nhanVienId) {
  return this.NguoiXuLyID?.toString() === nhanVienId.toString();
};

yeuCauSchema.methods.laNguoiNhan = function (nhanVienId) {
  if (this.LoaiNguoiNhan !== "CA_NHAN") return false;
  return this.NguoiNhanID?.toString() === nhanVienId.toString();
};

yeuCauSchema.methods.laNguoiDuocDieuPhoi = function (nhanVienId) {
  return this.NguoiDuocDieuPhoiID?.toString() === nhanVienId.toString();
};
```

**Code**: [yeuCauStateMachine.js:136-161](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L136-L161)

---

### 4. **Rate Limit** ⏱️

Một số action có giới hạn số lần thực hiện mỗi ngày:

| Action          | Rate Limit     | Mục Đích                            |
| --------------- | -------------- | ----------------------------------- |
| **NHAC_LAI**    | **3 lần/ngày** | Tránh spam nhắc lại quá nhiều       |
| **BAO_QUAN_LY** | **1 lần/ngày** | Escalate nghiêm túc, không lạm dụng |

**Implementation:**

```javascript
// File: yeuCauStateMachine.js
async function validateRateLimit(
  yeuCauId,
  nguoiThucHienId,
  action,
  transitionConfig
) {
  if (!transitionConfig.rateLimit) return;

  const result = await LichSuYeuCau.kiemTraRateLimit(
    yeuCauId,
    nguoiThucHienId,
    transitionConfig.hanhDong
  );

  if (!result.allowed) {
    throw new AppError(
      429,
      `Bạn đã đạt giới hạn ${result.limit} lần/ngày cho hành động này`,
      "RATE_LIMIT_EXCEEDED"
    );
  }
}
```

**Check Logic:**

```javascript
// File: LichSuYeuCau.js
lichSuYeuCauSchema.statics.demHanhDongTrongNgay = async function (
  yeuCauId,
  nguoiThucHienId,
  hanhDong
) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const count = await this.countDocuments({
    YeuCauID: yeuCauId,
    NguoiThucHienID: nguoiThucHienId,
    HanhDong: hanhDong,
    ThoiGian: { $gte: startOfToday },
  });

  return count;
};
```

---

### 5. **Time Limit** ⏳

Action **MO_LAI** chỉ khả dụng trong **7 ngày** kể từ `NgayDong`:

```javascript
// File: yeuCauStateMachine.js
const TRANSITIONS = {
  [TRANG_THAI.DA_DONG]: {
    MO_LAI: {
      nextState: TRANG_THAI.DA_HOAN_THANH,
      hanhDong: HANH_DONG.MO_LAI,
      requiredFields: ["LyDoMoLai"],
      timeLimit: { days: 7, from: "NgayDong" }, // ← Time constraint
      notificationType: "YEUCAU_MO_LAI",
    },
  },
};

// Validation
function validateTimeLimit(yeuCau, transitionConfig) {
  if (!transitionConfig.timeLimit) return;

  const { days, from } = transitionConfig.timeLimit;
  const fromDate = yeuCau[from];

  if (!fromDate) {
    throw new AppError(400, "Không thể xác định thời gian gốc", "INVALID_DATE");
  }

  const now = new Date();
  const diffDays = (now - fromDate) / (1000 * 60 * 60 * 24);

  if (diffDays > days) {
    throw new AppError(
      400,
      `Đã quá thời hạn ${days} ngày để thực hiện hành động này`,
      "TIME_LIMIT_EXCEEDED"
    );
  }
}
```

**Logic trong getAvailableActions:**

```javascript
if (action === "MO_LAI") {
  try {
    validateTimeLimit(yeuCau, stateTransitions[action]);
    availableActions.push(action);
  } catch {
    // Quá 7 ngày → KHÔNG hiển thị action MO_LAI
  }
}
```

---

## 🎨 Frontend Render Logic

### YeuCauActionButtons Component

**File**: `components/YeuCauActionButtons.js`

#### Phân Loại Actions:

```javascript
// PRIMARY ACTIONS (hiển thị trực tiếp, nổi bật)
const primaryActions = [
  TIEP_NHAN, // variant="contained", color="success"
  TU_CHOI,
  DIEU_PHOI,
  GUI_VE_KHOA,
  HOAN_THANH, // variant="contained", color="success"
  DONG,
  DANH_GIA, // variant="contained", color="warning"
  YEU_CAU_XU_LY_TIEP,
  APPEAL,
];

// SECONDARY ACTIONS (ẩn trong menu "More")
const secondaryActions = [
  SUA,
  XOA,
  HUY_TIEP_NHAN,
  DOI_THOI_GIAN_HEN,
  MO_LAI,
  NHAC_LAI,
  BAO_QUAN_LY,
];
```

#### Action Config:

```javascript
const ACTION_CONFIG = {
  TIEP_NHAN: {
    label: "Tiếp nhận",
    icon: <CheckIcon />,
    color: "success",
    variant: "contained", // ← Nổi bật (màu nền)
    primary: true,
  },
  HOAN_THANH: {
    label: "Hoàn thành",
    icon: <CheckIcon />,
    color: "success",
    variant: "contained",
    primary: true,
  },
  TU_CHOI: {
    label: "Từ chối",
    icon: <CloseIcon />,
    color: "error",
    variant: "outlined", // ← Ít nổi bật (chỉ viền)
  },
  DIEU_PHOI: {
    label: "Phân công",
    icon: <PersonIcon />,
    color: "info",
    variant: "outlined",
  },
  // ... etc
};
```

#### Render Logic:

```javascript
function YeuCauActionButtons({ availableActions, onAction, loading }) {
  // 1. Filter bỏ BINH_LUAN (xử lý riêng)
  const actions = availableActions.filter((a) => a !== HANH_DONG.BINH_LUAN);

  // 2. Chia primary/secondary
  const primaryActions = actions.filter((a) => !SECONDARY_ACTIONS.includes(a));
  const secondaryActions = actions.filter((a) => SECONDARY_ACTIONS.includes(a));

  return (
    <Stack direction="row" spacing={1}>
      {/* Primary actions - hiển thị trực tiếp */}
      {primaryActions.map((action) => {
        const config = ACTION_CONFIG[action];
        return (
          <Button
            key={action}
            variant={config.variant}
            color={config.color}
            startIcon={config.icon}
            onClick={() => onAction(action)}
            disabled={loading}
          >
            {config.label}
          </Button>
        );
      })}

      {/* Secondary actions - trong menu dropdown */}
      {secondaryActions.length > 0 && (
        <>
          <IconButton onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)}>
            {secondaryActions.map((action) => {
              const config = ACTION_CONFIG[action];
              return (
                <MenuItem key={action} onClick={() => onAction(action)}>
                  <ListItemIcon>{config.icon}</ListItemIcon>
                  <ListItemText>{config.label}</ListItemText>
                </MenuItem>
              );
            })}
          </Menu>
        </>
      )}
    </Stack>
  );
}
```

---

## 📋 Ví Dụ Thực Tế

### Scenario 1: Người Gửi xem yêu cầu **MOI** của mình

**Context:**

- **User**: Nguyễn Văn A (Người Gửi)
- **YeuCau.TrangThai**: `MOI`
- **YeuCau.NguoiYeuCauID**: A (ObjectId của Nguyễn Văn A)

**Role Calculation:**

- `isNguoiGui` = ✅ `true`
- `isNguoiXuLy` = ❌ `false`
- `isDieuPhoi` = ❌ `false`
- `isAdmin` = ❌ `false`

**Available Actions:**

- ✅ **NHAC_LAI** (nhắc lại người xử lý - max 3 lần/ngày)
- ✅ **BAO_QUAN_LY** (báo lên quản lý - max 1 lần/ngày)
- ✅ **XOA** (xóa yêu cầu - chỉ khi còn MOI)

**Hiển Thị UI:**

- **Primary actions**: (không có)
- **Secondary actions** (menu "More"):
  - 🗑️ Xóa
  - 🔔 Nhắc lại
  - ⚠️ Báo quản lý

**Screenshot Concept:**

```
┌─────────────────────────────────────┐
│  Yêu cầu #YC001                     │
│  ● Mới      🟡 Khẩn cấp            │
├─────────────────────────────────────┤
│  [Thao tác]                         │
│  ┌──────────────────────────────┐   │
│  │ ⋮ More Actions              ▼│   │
│  └──────────────────────────────┘   │
│    ├─ 🗑️ Xóa                      │
│    ├─ 🔔 Nhắc lại                 │
│    └─ ⚠️ Báo quản lý              │
└─────────────────────────────────────┘
```

---

### Scenario 2: Điều phối viên xem yêu cầu **MOI** đến khoa mình

**Context:**

- **User**: Trần Thị B (Điều phối viên Khoa Nội)
- **YeuCau.TrangThai**: `MOI`
- **YeuCau.KhoaDichID**: Khoa Nội
- **YeuCau.LoaiNguoiNhan**: `KHOA`

**Role Calculation:**

- `isNguoiGui` = ❌ `false`
- `isNguoiXuLy` = ❌ `false`
- `isDieuPhoi` = ✅ `true` (có trong CauHinhThongBaoKhoa của Khoa Nội)
- `isAdmin` = ❌ `false`

**Available Actions:**

- ✅ **TIEP_NHAN** (tiếp nhận và set thời gian hẹn)
- ✅ **TU_CHOI** (từ chối với lý do)
- ✅ **DIEU_PHOI** (phân công cho nhân viên cụ thể trong khoa)

**Hiển Thị UI:**

- **Primary actions**:
  - ✅ **Tiếp nhận** (xanh, contained - nổi bật nhất)
  - ❌ Từ chối (đỏ, outlined)
  - 👤 Phân công (xanh dương, outlined)
- **Secondary actions**: (không có)

**Screenshot Concept:**

```
┌─────────────────────────────────────────────────────┐
│  Yêu cầu #YC002 từ Khoa Ngoại → Khoa Nội           │
│  ● Mới      🟡 Khẩn cấp                            │
├─────────────────────────────────────────────────────┤
│  [Thao tác]                                         │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ ✓ Tiếp nhận │ │ ✕ Từ chối │ │ 👤 Phân công │   │
│  └──────────────┘ └──────────┘ └──────────────┘   │
│   (màu xanh đậm)  (viền đỏ)     (viền xanh)        │
└─────────────────────────────────────────────────────┘
```

---

### Scenario 3: Người xử lý xem yêu cầu **DANG_XU_LY**

**Context:**

- **User**: Lê Văn C (Được phân công xử lý)
- **YeuCau.TrangThai**: `DANG_XU_LY`
- **YeuCau.NguoiXuLyID**: C (ObjectId của Lê Văn C)
- **YeuCau.ThoiGianHen**: 2025-12-20 10:00

**Role Calculation:**

- `isNguoiGui` = ❌ `false`
- `isNguoiXuLy` = ✅ `true`
- `isDieuPhoi` = ❌ `false`
- `isAdmin` = ❌ `false`

**Available Actions:**

- ✅ **HOAN_THANH** (báo hoàn thành)
- ✅ **HUY_TIEP_NHAN** (trả lại khoa, quay về MOI)
- ✅ **DOI_THOI_GIAN_HEN** (gia hạn deadline)

**Hiển Thị UI:**

- **Primary actions**:
  - ✅ **Hoàn thành** (xanh, contained)
- **Secondary actions** (menu "More"):
  - 🔄 Hủy tiếp nhận
  - 📅 Đổi thời gian hẹn

**Screenshot Concept:**

```
┌─────────────────────────────────────────────────────┐
│  Yêu cầu #YC003 - Đang xử lý                       │
│  🔵 Đang xử lý    Hạn: 20/12/2025 10:00           │
├─────────────────────────────────────────────────────┤
│  [Thao tác]                                         │
│  ┌──────────────┐ ┌──────────────────────────┐     │
│  │ ✓ Hoàn thành │ │ ⋮ More Actions          ▼│     │
│  └──────────────┘ └──────────────────────────┘     │
│   (màu xanh đậm)   ├─ 🔄 Hủy tiếp nhận            │
│                     └─ 📅 Đổi thời gian hẹn        │
└─────────────────────────────────────────────────────┘
```

---

### Scenario 4: Người gửi xem yêu cầu **DA_HOAN_THANH**

**Context:**

- **User**: Nguyễn Văn A (Người Gửi)
- **YeuCau.TrangThai**: `DA_HOAN_THANH`
- **YeuCau.NguoiYeuCauID**: A
- **YeuCau.NgayHoanThanh**: 2025-12-13 14:30

**Role Calculation:**

- `isNguoiGui` = ✅ `true`
- `isNguoiXuLy` = ❌ `false`
- `isDieuPhoi` = ❌ `false`
- `isAdmin` = ❌ `false`

**Available Actions:**

- ✅ **DANH_GIA** (đánh giá 1-5 sao + nhận xét)
- ✅ **DONG** (đóng không đánh giá)

**Hiển Thị UI:**

- **Primary actions**:
  - ⭐ **Đánh giá** (vàng, contained - khuyến khích)
  - 🔒 Đóng (xám, outlined - phụ)
- **Secondary actions**: (không có)

**Screenshot Concept:**

```
┌─────────────────────────────────────────────────────┐
│  Yêu cầu #YC004 - Đã hoàn thành                    │
│  ✅ Đã hoàn thành    Hoàn thành: 13/12/2025 14:30 │
├─────────────────────────────────────────────────────┤
│  [Thao tác]                                         │
│  ┌──────────────┐ ┌──────────┐                     │
│  │ ⭐ Đánh giá │ │ 🔒 Đóng │                     │
│  └──────────────┘ └──────────┘                     │
│   (màu vàng đậm)  (viền xám)                        │
│                                                     │
│  💡 Tip: Đánh giá giúp cải thiện chất lượng dịch vụ │
└─────────────────────────────────────────────────────┘
```

---

### Scenario 5: Xem yêu cầu **DA_DONG** (đã đóng 5 ngày)

**Context:**

- **User**: Nguyễn Văn A (Người Gửi)
- **YeuCau.TrangThai**: `DA_DONG`
- **YeuCau.NgayDong**: 2025-12-09 09:00 (5 ngày trước)
- **YeuCau.NguoiYeuCauID**: A

**Role Calculation:**

- `isNguoiGui` = ✅ `true`
- `isNguoiXuLy` = ❌ `false`

**Time Limit Check:**

- Hiện tại: 2025-12-14
- NgayDong: 2025-12-09
- Diff: 5 ngày < 7 ngày
- ✅ **MO_LAI** action khả dụng

**Available Actions:**

- ✅ **MO_LAI** (mở lại với lý do, trong vòng 7 ngày)

**Hiển Thị UI:**

- **Primary actions**: (không có)
- **Secondary actions** (menu "More"):
  - 🔄 Mở lại (còn 2 ngày)

**Screenshot Concept:**

```
┌─────────────────────────────────────────────────────┐
│  Yêu cầu #YC005 - Đã đóng                          │
│  ⚫ Đã đóng    Đóng lúc: 09/12/2025 09:00          │
├─────────────────────────────────────────────────────┤
│  [Thao tác]                                         │
│  ┌──────────────────────────┐                      │
│  │ ⋮ More Actions          ▼│                      │
│  └──────────────────────────┘                      │
│    └─ 🔄 Mở lại (còn 2 ngày)                       │
│                                                     │
│  ⏱️ Lưu ý: Chỉ có thể mở lại trong 7 ngày          │
└─────────────────────────────────────────────────────┘
```

**Sau 7 ngày (2025-12-16+):**

- ❌ **Không có action nào**
- Yêu cầu bị lock vĩnh viễn

```
┌─────────────────────────────────────────────────────┐
│  Yêu cầu #YC005 - Đã đóng                          │
│  ⚫ Đã đóng    Đóng lúc: 09/12/2025 09:00          │
├─────────────────────────────────────────────────────┤
│  [Thao tác]                                         │
│  📋 Không có thao tác nào khả dụng                 │
│  🔒 Đã quá thời hạn mở lại (7 ngày)                │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Code Reference

### Backend Files

| File                                                                                                                 | Lines   | Chức Năng                                         |
| -------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| [yeuCauStateMachine.js](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L26-L123)  | 26-123  | **TRANSITIONS** config - định nghĩa state machine |
| [yeuCauStateMachine.js](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L136-L161) | 136-161 | **checkPermission()** - tính toán roles           |
| [yeuCauStateMachine.js](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L162-L192) | 162-192 | **permissionMap** - permission matrix             |
| [yeuCauStateMachine.js](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js#L687-L720) | 687-720 | **getAvailableActions()** - main function         |
| [yeuCau.service.js](../../../../../giaobanbv-be/modules/workmanagement/services/yeuCau.service.js#L351-L354)         | 351-354 | **layChiTiet()** - gọi getAvailableActions        |
| [LichSuYeuCau.js](../../../../../giaobanbv-be/modules/workmanagement/models/LichSuYeuCau.js)                         | -       | **demHanhDongTrongNgay()** - rate limit check     |

### Frontend Files

| File                                                                    | Lines   | Chức Năng                                   |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------- |
| [yeuCauSlice.js](./yeuCauSlice.js#L753)                                 | 753     | **selectAvailableActions** - Redux selector |
| [yeuCauSlice.js](./yeuCauSlice.js#L430-L450)                            | 430-450 | **getYeuCauDetail** thunk - fetch actions   |
| [YeuCauDetailPage.js](./YeuCauDetailPage.js#L102)                       | 102     | Sử dụng `availableActions` selector         |
| [YeuCauDetailPage.js](./YeuCauDetailPage.js#L689)                       | 689     | Truyền vào `YeuCauActionButtons` component  |
| [YeuCauActionButtons.js](./components/YeuCauActionButtons.js#L37-L130)  | 37-130  | **ACTION_CONFIG** - icon/color mapping      |
| [YeuCauActionButtons.js](./components/YeuCauActionButtons.js#L132-L145) | 132-145 | **SECONDARY_ACTIONS** - phân loại           |
| [YeuCauActionButtons.js](./components/YeuCauActionButtons.js#L150-L250) | 150-250 | Render logic - primary/secondary            |

---

## 🔍 Debug & Troubleshooting

### Kiểm Tra Actions Không Hiển Thị Đúng

#### Step 1: Kiểm tra API response

```javascript
// Browser DevTools → Network tab → GET /yeucau/:id

// Response mong đợi:
{
  "success": true,
  "data": {
    "yeuCau": { ... },
    "availableActions": ["TIEP_NHAN", "TU_CHOI", "DIEU_PHOI"]
  }
}
```

#### Step 2: Kiểm tra Backend logs

```powershell
# Backend terminal
# Search for:
[YeuCauStateMachine] Available actions for user <NhanVienID>: [...]
```

#### Step 3: Kiểm tra role calculation

Thêm log tạm trong `checkPermission()`:

```javascript
console.log("[DEBUG checkPermission]", {
  action,
  nguoiThucHienId: nguoiThucHienId.toString(),
  isNguoiGui,
  isNguoiXuLy,
  isDieuPhoi,
  isNguoiNhan,
  isNguoiDuocDieuPhoi,
  isAdmin,
  result: permissionMap[action],
});
```

#### Step 4: Kiểm tra CauHinhThongBaoKhoa

```javascript
// MongoDB shell
use giaoban_bvt;

db.cauHinhThongBaoKhoa.findOne({
  KhoaID: ObjectId("...") // ID khoa đích
});

// Verify:
// - DanhSachNguoiDieuPhoi có chứa NhanVienID của user không?
// - DanhSachQuanLyKhoa có chứa NhanVienID của user không?
```

---

## 📚 Related Documentation

- **[README.md](./README.md)** - Tổng quan module
- **[FILTER_LOGIC_DOCUMENTATION.md](./FILTER_LOGIC_DOCUMENTATION.md)** - Filter & query logic
- **[ROLE_BASED_VIEWS.md](./ROLE_BASED_VIEWS.md)** - Architecture & 4 role-based pages
- **[BACKEND_API_EXTENSIONS.md](./BACKEND_API_EXTENSIONS.md)** - API specs
- **[TAB_CONFIG_SYSTEM.md](./TAB_CONFIG_SYSTEM.md)** - Tab configuration

---

**Last Updated:** December 14, 2025  
**Maintainer:** Hospital Management System Team  
**Version:** 1.0.0
