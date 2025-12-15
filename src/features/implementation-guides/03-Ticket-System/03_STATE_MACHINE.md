# 🔄 State Machine - Hệ Thống Yêu Cầu

> **Trạng thái**: ✅ Đã thiết kế  
> **Cập nhật**: 01/06/2025  
> **Synced**: Journey #1-#6

---

## Mục Lục

1. [Sơ Đồ State Machine](#sơ-đồ-state-machine)
2. [Các Trạng Thái](#các-trạng-thái)
3. [Các Transitions](#các-transitions)
4. [Actions Theo Vai Trò](#actions-theo-vai-trò)
5. [Validation Rules](#validation-rules)

---

## Sơ Đồ State Machine

> **5 States**: MOI, DANG_XU_LY, DA_HOAN_THANH, DA_DONG, TU_CHOI

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MACHINE - YÊU CẦU (5 States)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ┌─────────┐                             │
│           Tạo mới ───► │   MOI   │ ◄───────────────────┐       │
│                         └────┬────┘                     │       │
│                              │                          │       │
│         ┌────────────────────┼────────────────┐         │       │
│         │                    │                │         │       │
│         ▼                    ▼                ▼         │       │
│    [Tiếp nhận]          [Từ chối]          [XÓA]       │       │
│         │                    │             (hard)       │       │
│         ▼                    ▼                          │       │
│  ┌─────────────┐      ┌──────────┐                      │       │
│  │ DANG_XU_LY  │      │ TU_CHOI  │──[Appeal]───────────┘       │
│  └──────┬──────┘      └──────────┘  (bắt buộc lý do)           │
│         │     ▲                                                  │
│  ┌──────┴─────┴───┐                                             │
│  ▼                ▼                                              │
│ [Hoàn      [Hủy tiếp                                            │
│  thành]     nhận]─────────────────────────────────────► MOI    │
│  │                                                               │
│  ▼                                                               │
│ ┌─────────────┐                                                 │
│ │DA_HOAN_THANH│ ◄──────────────────────────────────┐            │
│ └──────┬──────┘                                    │            │
│        │      ▲                                    │            │
│        │      │ [YEU_CAU_XU_LY_TIEP]               │            │
│        │      │ (NguoiXuLy, ko lý do)              │            │
│        │      │                                    │            │
│ ┌──────┼──────┴───┬────────────┐                   │            │
│ ▼      ▼          ▼            ▼                   │            │
│[Đánh [Đóng]   [3 ngày]    ──► DANG_XU_LY          │            │
│ giá]   │     (auto,5⭐)                            │            │
│  │     │                                           │            │
│  └─────┴───────────┐                               │            │
│                    ▼                               │            │
│                ┌─────────┐                         │            │
│                │ DA_DONG │──[Mở lại trong 7 ngày]──┘            │
│                └─────────┘  (bắt buộc lý do)                    │
│                             (→ DA_HOAN_THANH, cho đánh giá lại) │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Các Trạng Thái

| Trạng thái      | Mô tả                                         | Màu UI    |
| --------------- | --------------------------------------------- | --------- |
| `MOI`           | Yêu cầu vừa được tạo, chờ tiếp nhận           | 🔵 Blue   |
| `DANG_XU_LY`    | Đã tiếp nhận và đang xử lý                    | 🟠 Orange |
| `DA_HOAN_THANH` | Người xử lý báo hoàn thành, chờ đánh giá/đóng | 🟢 Green  |
| `DA_DONG`       | Đã đóng (flow kết thúc)                       | ⚫ Gray   |
| `TU_CHOI`       | Bị từ chối                                    | 🔴 Red    |

---

## Các Transitions

### Transition Map

```javascript
const TRANSITIONS = {
  MOI: {
    TIEP_NHAN: {
      nextState: "DANG_XU_LY", // Gộp tiếp nhận = bắt đầu xử lý
      allowedRoles: ["DIEU_PHOI", "NGUOI_NHAN", "NGUOI_DUOC_DIEU_PHOI"],
      requiredFields: ["ThoiGianHen"],
      action: "Tiếp nhận yêu cầu",
    },
    TU_CHOI: {
      nextState: "TU_CHOI",
      allowedRoles: ["DIEU_PHOI", "NGUOI_NHAN", "NGUOI_DUOC_DIEU_PHOI"],
      requiredFields: ["LyDoTuChoiID"],
      optionalFields: ["GhiChuTuChoi"], // Bắt buộc nếu LyDoKhac
      action: "Từ chối yêu cầu",
    },
    XOA: {
      nextState: null, // Hard delete
      allowedRoles: ["NGUOI_GUI", "ADMIN"],
      action: "Xóa yêu cầu",
    },
    DIEU_PHOI: {
      nextState: "MOI",
      allowedRoles: ["DIEU_PHOI"],
      requiredFields: ["NguoiDuocDieuPhoiID"],
      action: "Điều phối cho người khác",
      notifications: ["NGUOI_DUOC_DIEU_PHOI", "NGUOI_GUI"],
    },
    GUI_VE_KHOA: {
      nextState: "MOI",
      allowedRoles: ["NGUOI_NHAN", "NGUOI_DUOC_DIEU_PHOI"],
      action: "Gửi về khoa",
      notifications: ["DIEU_PHOI_ALL"],
    },
    NHAC_LAI: {
      nextState: "MOI",
      allowedRoles: ["NGUOI_GUI"],
      rateLimit: { max: 3, per: "day" },
      action: "Nhắc lại",
      notifications: ["DIEU_PHOI_ALL"],
    },
    BAO_QUAN_LY: {
      nextState: "MOI",
      allowedRoles: ["NGUOI_GUI"],
      rateLimit: { max: 1, per: "day" },
      action: "Báo quản lý",
      notifications: ["QUAN_LY_KHOA"],
    },
  },

  DANG_XU_LY: {
    HOAN_THANH: {
      nextState: "DA_HOAN_THANH",
      allowedRoles: ["NGUOI_XU_LY"],
      action: "Báo hoàn thành",
      notifications: ["NGUOI_GUI"],
    },
    HUY_TIEP_NHAN: {
      nextState: "MOI",
      allowedRoles: ["NGUOI_XU_LY"],
      action: "Hủy tiếp nhận",
      sideEffects: [
        "NguoiXuLyID = null",
        "NgayTiepNhan = null",
        "ThoiGianHen = null",
      ],
      notifications: ["NGUOI_GUI", "DIEU_PHOI_ALL"],
    },
    DOI_THOI_GIAN_HEN: {
      nextState: "DANG_XU_LY",
      allowedRoles: ["NGUOI_XU_LY"],
      requiredFields: ["ThoiGianHen"],
      action: "Đổi thời gian hẹn",
    },
  },

  DA_HOAN_THANH: {
    DANH_GIA: {
      nextState: "DA_DONG",
      allowedRoles: ["NGUOI_GUI"],
      requiredFields: ["DanhGia.SoSao"],
      conditionalRequiredFields: {
        // Bắt buộc NhanXet khi SoSao < 3 (1-2⭐)
        "DanhGia.NhanXet": { when: "DanhGia.SoSao < 3" },
      },
      action: "Đánh giá & tự động đóng",
      sideEffects: ["NgayDong = now()"],
      notifications: ["NGUOI_XU_LY"], // TB kèm số sao
    },
    DONG: {
      nextState: "DA_DONG",
      allowedRoles: ["NGUOI_GUI", "NGUOI_XU_LY", "ADMIN", "SYSTEM"],
      action: "Đóng thủ công",
      sideEffects: ["NgayDong = now()"],
    },
    TU_DONG_DONG: {
      nextState: "DA_DONG",
      allowedRoles: ["SYSTEM"],
      action: "Hệ thống tự đóng sau 3 ngày",
      sideEffects: ["DanhGia.SoSao = 5", "NgayDong = now()"],
    },
    YEU_CAU_XU_LY_TIEP: {
      nextState: "DANG_XU_LY",
      allowedRoles: ["NGUOI_XU_LY"],
      action: "Yêu cầu xử lý tiếp",
      sideEffects: ["NgayHoanThanh = null"],
      notifications: ["NGUOI_GUI"],
    },
  },

  DA_DONG: {
    MO_LAI: {
      nextState: "DA_HOAN_THANH",
      allowedRoles: ["NGUOI_GUI", "NGUOI_XU_LY"],
      requiredFields: ["LyDoMoLai"],
      timeLimit: { days: 7, from: "NgayDong" },
      action: "Mở lại",
      sideEffects: ["NgayDong = null", "Giữ DanhGia cũ"],
      notifications: ["DOI_PHUONG"], // Ai mở thì TB người còn lại
    },
  },

  TU_CHOI: {
    APPEAL: {
      nextState: "MOI",
      allowedRoles: ["NGUOI_GUI"],
      requiredFields: ["LyDoAppeal"],
      action: "Khiếu nại",
      notifications: ["DIEU_PHOI_ALL"],
    },
  },
};
```

### Chi Tiết Các Transitions

#### 1. MOI → DA_TIEP_NHAN (Tiếp nhận)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSITION: TIẾP NHẬN                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Điều kiện:                                                     │
│   ├── TrangThai hiện tại = "MOI"                                │
│   └── Người thực hiện phải là:                                  │
│       ├── Người điều phối (nếu yêu cầu gửi đến KHOA)           │
│       ├── Người nhận (nếu yêu cầu gửi đến CÁ NHÂN)             │
│       └── Người được điều phối                                  │
│                                                                  │
│   Thay đổi:                                                      │
│   ├── TrangThai = "DA_TIEP_NHAN"                                │
│   ├── NguoiXuLyID = ID người tiếp nhận                         │
│   ├── NgayTiepNhan = now()                                      │
│   └── ThoiGianHen = now() + ThoiGianDuKien (có thể chỉnh)      │
│                                                                  │
│   Lịch sử:                                                       │
│   └── Ghi: TIEP_NHAN, NguoiThucHien, ThoiGianHen               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 2. MOI → TU_CHOI (Từ chối)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSITION: TỪ CHỐI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Điều kiện:                                                     │
│   ├── TrangThai hiện tại = "MOI"                                │
│   └── Phải chọn LyDoTuChoiID                                    │
│                                                                  │
│   Thay đổi:                                                      │
│   ├── TrangThai = "TU_CHOI"                                     │
│   ├── LyDoTuChoiID = ID lý do                                   │
│   └── GhiChuTuChoi = ghi chú (tùy chọn)                        │
│                                                                  │
│   Thông báo:                                                     │
│   └── Gửi đến người yêu cầu (NguoiYeuCauID)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3. MOI → MOI (Điều phối)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSITION: ĐIỀU PHỐI                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Điều kiện:                                                     │
│   ├── TrangThai hiện tại = "MOI"                                │
│   ├── Chỉ người điều phối mới có quyền                         │
│   └── Phải chọn NguoiDuocDieuPhoiID                            │
│                                                                  │
│   Thay đổi:                                                      │
│   ├── TrangThai = "MOI" (giữ nguyên)                            │
│   ├── NguoiDuocDieuPhoiID = ID người được điều phối            │
│   └── NgayDieuPhoi = now()                                      │
│                                                                  │
│   Thông báo:                                                     │
│   └── Gửi đến người được điều phối                              │
│                                                                  │
│   Lưu ý:                                                         │
│   └── Người được điều phối có 3 action:                         │
│       Tiếp nhận / Từ chối thẳng / Gửi về khoa                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. MOI → MOI (Gửi về khoa)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSITION: GỬI VỀ KHOA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Điều kiện:                                                     │
│   ├── TrangThai hiện tại = "MOI"                                │
│   └── Người thực hiện là:                                       │
│       ├── Người nhận (gửi cá nhân)                              │
│       └── Người được điều phối                                  │
│                                                                  │
│   Thay đổi:                                                      │
│   ├── TrangThai = "MOI" (giữ nguyên)                            │
│   ├── LoaiNguoiNhan = "KHOA"                                    │
│   ├── NguoiNhanID = null                                        │
│   └── NguoiDuocDieuPhoiID = null                               │
│                                                                  │
│   Thông báo:                                                     │
│   └── Gửi đến người điều phối (CauHinhThongBaoKhoa)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5. DA_TIEP_NHAN → DANG_XU_LY (Bắt đầu xử lý)

```
┌─────────────────────────────────────────────────────────────────┐
│                 TRANSITION: BẮT ĐẦU XỬ LÝ                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Điều kiện:                                                     │
│   ├── TrangThai hiện tại = "DA_TIEP_NHAN"                       │
│   └── Người thực hiện = NguoiXuLyID                             │
│                                                                  │
│   Thay đổi:                                                      │
│   └── TrangThai = "DANG_XU_LY"                                  │
│                                                                  │
│   Lưu ý:                                                         │
│   └── Có thể gộp với TIEP_NHAN nếu muốn đơn giản hóa          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 6. DANG_XU_LY → DA_HOAN_THANH (Hoàn thành)

```
┌─────────────────────────────────────────────────────────────────┐
│                  TRANSITION: HOÀN THÀNH                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Điều kiện:                                                     │
│   ├── TrangThai hiện tại = "DANG_XU_LY"                         │
│   └── Người thực hiện = NguoiXuLyID                             │
│                                                                  │
│   Thay đổi:                                                      │
│   ├── TrangThai = "DA_HOAN_THANH"                               │
│   └── NgayHoanThanh = now()                                     │
│                                                                  │
│   Thông báo:                                                     │
│   └── Gửi đến người yêu cầu để đánh giá                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Actions Theo Vai Trò

### Bảng Tổng Hợp (5 States)

| Vai trò                  | MOI                             | DANG_XU_LY          | DA_HOAN_THANH       | DA_DONG               | TU_CHOI |
| ------------------------ | ------------------------------- | ------------------- | ------------------- | --------------------- | ------- |
| **Người gửi**            | Sửa, Xóa, Nhắc lại, Báo QL      | Nhắc lại, Báo QL    | Đánh giá, Đóng      | Mở lại (trong 7 ngày) | Appeal  |
| **Người điều phối**      | Tiếp nhận, Từ chối, Điều phối   | -                   | -                   | -                     | -       |
| **Người nhận (cá nhân)** | Tiếp nhận, Từ chối, Gửi về khoa | -                   | -                   | -                     | -       |
| **Người được điều phối** | Tiếp nhận, Từ chối, Gửi về khoa | -                   | -                   | -                     | -       |
| **Người xử lý**          | -                               | Hủy TN, Đổi hẹn, HT | YC xử lý tiếp, Đóng | Mở lại (trong 7 ngày) | -       |
| **Admin**                | Xóa                             | -                   | Đóng                | -                     | -       |
| **System**               | -                               | -                   | Tự động đóng (3d)   | -                     | -       |

### Chú thích:

- **Nhắc lại**: Tối đa 3 lần/ngày
- **Báo QL**: Tối đa 1 lần/ngày
- **Mở lại**: Trong vòng 7 ngày từ NgayDong, bắt buộc lý do
- **Appeal**: Từ TU_CHOI → MOI, bắt buộc lý do

### Helper Function

```javascript
/**
 * Lấy danh sách actions khả dụng cho user hiện tại
 * @param {Object} yeuCau - Yêu cầu hiện tại
 * @param {String} currentUserId - ID người dùng (NhanVienID)
 * @param {Boolean} isDieuPhoi - Có phải người điều phối không
 * @returns {Array} Danh sách actions
 */
function getAvailableActions(yeuCau, currentUserId, isDieuPhoi) {
  const actions = [];
  const {
    TrangThai,
    NguoiYeuCauID,
    NguoiNhanID,
    NguoiXuLyID,
    NguoiDuocDieuPhoiID,
    LoaiNguoiNhan,
    NgayDong,
  } = yeuCau;

  const isNguoiGui = NguoiYeuCauID.toString() === currentUserId;
  const isNguoiNhan = NguoiNhanID?.toString() === currentUserId;
  const isNguoiXuLy = NguoiXuLyID?.toString() === currentUserId;
  const isNguoiDuocDieuPhoi = NguoiDuocDieuPhoiID?.toString() === currentUserId;

  // Helper check 7 ngày
  const isWithin7Days =
    NgayDong && new Date() - new Date(NgayDong) < 7 * 24 * 60 * 60 * 1000;

  switch (TrangThai) {
    case "MOI":
      // Người gửi có thể sửa, xóa, nhắc lại, báo QL
      if (isNguoiGui) {
        actions.push("SUA_YEU_CAU", "XOA", "NHAC_LAI", "BAO_QUAN_LY");
      }

      // Người điều phối (yêu cầu gửi đến KHOA)
      if (isDieuPhoi && LoaiNguoiNhan === "KHOA") {
        actions.push("TIEP_NHAN", "TU_CHOI", "DIEU_PHOI");
      }

      // Người nhận (yêu cầu gửi đến CÁ NHÂN)
      if (isNguoiNhan && LoaiNguoiNhan === "CA_NHAN") {
        actions.push("TIEP_NHAN", "TU_CHOI", "GUI_VE_KHOA");
      }

      // Người được điều phối
      if (isNguoiDuocDieuPhoi) {
        actions.push("TIEP_NHAN", "TU_CHOI", "GUI_VE_KHOA");
      }
      break;

    case "DANG_XU_LY":
      // Người gửi có thể nhắc lại, báo QL
      if (isNguoiGui) {
        actions.push("NHAC_LAI", "BAO_QUAN_LY");
      }
      // Người xử lý
      if (isNguoiXuLy) {
        actions.push("HUY_TIEP_NHAN", "DOI_THOI_GIAN_HEN", "HOAN_THANH");
      }
      break;

    case "DA_HOAN_THANH":
      // Người gửi đánh giá (tự động đóng) hoặc đóng thủ công
      if (isNguoiGui) {
        actions.push("DANH_GIA", "DONG");
      }
      // Người xử lý có thể yêu cầu xử lý tiếp hoặc đóng
      if (isNguoiXuLy) {
        actions.push("YEU_CAU_XU_LY_TIEP", "DONG");
      }
      break;

    case "DA_DONG":
      // Mở lại trong 7 ngày
      if (isWithin7Days && (isNguoiGui || isNguoiXuLy)) {
        actions.push("MO_LAI");
      }
      break;

    case "TU_CHOI":
      // Người gửi có thể appeal
      if (isNguoiGui) {
        actions.push("APPEAL");
      }
      break;
  }

  return actions;
}
```

---

## Validation Rules

### 1. Tiếp Nhận

```javascript
const validateTiepNhan = (yeuCau, nguoiThucHien, data) => {
  const errors = [];

  // Check trạng thái
  if (yeuCau.TrangThai !== "MOI") {
    errors.push("Yêu cầu không ở trạng thái MỚI");
  }

  // Check quyền
  const hasPermission = checkTiepNhanPermission(yeuCau, nguoiThucHien);
  if (!hasPermission) {
    errors.push("Bạn không có quyền tiếp nhận yêu cầu này");
  }

  // Check thời gian hẹn
  if (!data.ThoiGianHen) {
    errors.push("Vui lòng nhập thời gian hẹn hoàn thành");
  }
  if (new Date(data.ThoiGianHen) <= new Date()) {
    errors.push("Thời gian hẹn phải lớn hơn thời điểm hiện tại");
  }

  return errors;
};
```

### 2. Từ Chối

```javascript
const validateTuChoi = (yeuCau, nguoiThucHien, data) => {
  const errors = [];

  if (yeuCau.TrangThai !== "MOI") {
    errors.push("Yêu cầu không ở trạng thái MỚI");
  }

  if (!data.LyDoTuChoiID) {
    errors.push("Vui lòng chọn lý do từ chối");
  }

  return errors;
};
```

### 3. Đánh giá

```javascript
const validateDanhGia = (yeuCau, nguoiThucHien, data) => {
  const errors = [];

  if (yeuCau.TrangThai !== "DA_HOAN_THANH") {
    errors.push("Yêu cầu không ở trạng thái ĐÃ HOÀN THÀNH");
  }

  if (yeuCau.NguoiYeuCauID.toString() !== nguoiThucHien._id.toString()) {
    errors.push("Chỉ người gửi yêu cầu mới có thể đánh giá");
  }

  if (!data.SoSao || data.SoSao < 1 || data.SoSao > 5) {
    errors.push("Vui lòng chọn số sao (1-5)");
  }

  // Bắt buộc nhận xét khi đánh giá < 3 sao
  if (data.SoSao < 3 && !data.NhanXet?.trim()) {
    errors.push("Vui lòng nhập nhận xét khi đánh giá dưới 3 sao");
  }

  return errors;
};
```

### 4. Mở lại

```javascript
const validateMoLai = (yeuCau, nguoiThucHien, data) => {
  const errors = [];

  if (yeuCau.TrangThai !== "DA_DONG") {
    errors.push("Yêu cầu không ở trạng thái ĐÃ ĐÓNG");
  }

  // Check người thực hiện
  const isNguoiGui =
    yeuCau.NguoiYeuCauID.toString() === nguoiThucHien._id.toString();
  const isNguoiXuLy =
    yeuCau.NguoiXuLyID?.toString() === nguoiThucHien._id.toString();
  if (!isNguoiGui && !isNguoiXuLy) {
    errors.push("Chỉ người gửi hoặc người xử lý mới có thể mở lại yêu cầu");
  }

  // Check 7 ngày
  if (yeuCau.NgayDong) {
    const daysSinceDong =
      (new Date() - new Date(yeuCau.NgayDong)) / (1000 * 60 * 60 * 24);
    if (daysSinceDong > 7) {
      errors.push(
        "Chỉ có thể mở lại yêu cầu trong vòng 7 ngày kể từ ngày đóng"
      );
    }
  }

  // Bắt buộc lý do
  if (!data.LyDoMoLai?.trim()) {
    errors.push("Vui lòng nhập lý do mở lại yêu cầu");
  }

  return errors;
};
```

### 5. Điều Phối

```javascript
const validateDieuPhoi = (yeuCau, nguoiThucHien, data, isDieuPhoi) => {
  const errors = [];

  if (yeuCau.TrangThai !== "MOI") {
    errors.push("Yêu cầu không ở trạng thái MỚI");
  }

  if (!isDieuPhoi) {
    errors.push("Bạn không phải người điều phối");
  }

  if (!data.NguoiDuocDieuPhoiID) {
    errors.push("Vui lòng chọn người nhận điều phối");
  }

  // Không cho điều phối cho chính mình
  if (data.NguoiDuocDieuPhoiID === nguoiThucHien._id) {
    errors.push("Không thể điều phối cho chính mình");
  }

  return errors;
};
```

### 6. Appeal (Khiếu nại)

```javascript
const validateAppeal = (yeuCau, nguoiThucHien, data) => {
  const errors = [];

  if (yeuCau.TrangThai !== "TU_CHOI") {
    errors.push("Chỉ có thể khiếu nại yêu cầu đã bị từ chối");
  }

  if (yeuCau.NguoiYeuCauID.toString() !== nguoiThucHien._id.toString()) {
    errors.push("Chỉ người gửi yêu cầu mới có thể khiếu nại");
  }

  if (!data.LyDoAppeal?.trim()) {
    errors.push("Vui lòng nhập lý do khiếu nại");
  }

  return errors;
};
```

### 7. Rate Limit (Nhắc lại / Báo quản lý)

```javascript
const validateRateLimit = async (yeuCauId, nguoiThucHienId, action) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await LichSuYeuCau.countDocuments({
    YeuCauID: yeuCauId,
    NguoiThucHienID: nguoiThucHienId,
    HanhDong: action,
    ThoiGian: { $gte: today },
  });

  const limits = {
    NHAC_LAI: 3, // Tối đa 3 lần/ngày
    BAO_QUAN_LY: 1, // Tối đa 1 lần/ngày
  };

  if (count >= limits[action]) {
    return `Bạn đã đạt giới hạn ${limits[action]} lần/${
      action === "NHAC_LAI" ? "nhắc lại" : "báo quản lý"
    } trong ngày`;
  }

  return null;
};
```

---

## Tài Liệu Liên Quan

- [01_NGHIEP_VU_CHI_TIET.md](./01_NGHIEP_VU_CHI_TIET.md) - Logic nghiệp vụ chi tiết
- [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md) - Database schema
