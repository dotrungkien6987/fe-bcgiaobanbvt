# 🎨 Frontend Components - Hệ Thống Yêu Cầu

> **Trạng thái**: 🚧 Đang triển khai  
> **Cập nhật**: 08/12/2025

---

## 📁 Cấu Trúc Folder

```
src/features/QuanLyCongViec/Ticket/
├── components/
│   ├── DieuPhoiDialog.js          ✅ Đã có
│   ├── StarRatingDialog.js        ⚠️ Cần sửa (validate NhanXet < 3⭐)
│   ├── TuChoiDialog.js            ❌ Cần tạo
│   ├── TiepNhanDialog.js          ❌ Cần tạo
│   ├── MoLaiDialog.js             ❌ Cần tạo
│   ├── AppealDialog.js            ❌ Cần tạo
│   ├── YeuCauActionButtons.js     ✅ Đã có
│   ├── YeuCauCard.js              ✅ Đã có
│   ├── YeuCauFilterPanel.js       ✅ Đã có
│   ├── YeuCauFormDialog.js        ✅ Đã có
│   ├── YeuCauList.js              ✅ Đã có
│   ├── YeuCauPriorityChip.js      ✅ Đã có
│   ├── YeuCauStatusChip.js        ✅ Đã có
│   ├── YeuCauTimeline.js          ✅ Đã có
│   └── index.js                   ✅ Đã có
├── yeuCau.constants.js            ✅ Đã có
├── yeuCau.utils.js                ✅ Đã có
├── yeuCauSlice.js                 ✅ Đã có
├── cauHinhKhoaSlice.js            ✅ Đã có
├── YeuCauDetailPage.js            ⚠️ Cần cập nhật
└── YeuCauPage.js                  ✅ Đã có
```

---

## 📋 Ma Trận Actions Theo Vai Trò & Trạng Thái

### Bảng quyền từ Backend (`yeuCauStateMachine.js`)

| Action                 | NguoiGui | NguoiNhan (CA_NHAN) | NguoiDuocDieuPhoi | DieuPhoi (KHOA) | NguoiXuLy | Admin |
| ---------------------- | :------: | :-----------------: | :---------------: | :-------------: | :-------: | :---: |
| **TIEP_NHAN**          |    ❌    |         ✅          |        ✅         |       ✅        |    ❌     |  ❌   |
| **TU_CHOI**            |    ❌    |         ✅          |        ✅         |       ✅        |    ❌     |  ❌   |
| **XOA**                |    ✅    |         ❌          |        ❌         |       ❌        |    ❌     |  ✅   |
| **DIEU_PHOI**          |    ❌    |         ❌          |        ❌         |       ✅        |    ❌     |  ❌   |
| **GUI_VE_KHOA**        |    ❌    |         ✅          |        ✅         |       ❌        |    ❌     |  ❌   |
| **NHAC_LAI**           |    ✅    |         ❌          |        ❌         |       ❌        |    ❌     |  ❌   |
| **BAO_QUAN_LY**        |    ✅    |         ❌          |        ❌         |       ❌        |    ❌     |  ❌   |
| **HOAN_THANH**         |    ❌    |         ❌          |        ❌         |       ❌        |    ✅     |  ❌   |
| **HUY_TIEP_NHAN**      |    ❌    |         ❌          |        ❌         |       ❌        |    ✅     |  ❌   |
| **DOI_THOI_GIAN_HEN**  |    ❌    |         ❌          |        ❌         |       ❌        |    ✅     |  ❌   |
| **DANH_GIA**           |    ✅    |         ❌          |        ❌         |       ❌        |    ❌     |  ❌   |
| **DONG**               |    ✅    |         ❌          |        ❌         |       ❌        |    ✅     |  ✅   |
| **YEU_CAU_XU_LY_TIEP** |    ❌    |         ❌          |        ❌         |       ❌        |    ✅     |  ❌   |
| **MO_LAI**             |    ✅    |         ❌          |        ❌         |       ❌        |    ✅     |  ❌   |
| **APPEAL**             |    ✅    |         ❌          |        ❌         |       ❌        |    ❌     |  ❌   |

### Giải thích vai trò

| Vai trò               | Điều kiện                                                   | Mô tả                                       |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| **NguoiGui**          | `NguoiYeuCauID === nhanVienId`                              | Người tạo yêu cầu                           |
| **NguoiNhan**         | `LoaiNguoiNhan === "CA_NHAN" && NguoiNhanID === nhanVienId` | Người được gửi đích danh                    |
| **NguoiDuocDieuPhoi** | `NguoiDuocDieuPhoiID === nhanVienId`                        | NV được người điều phối gán, chưa tiếp nhận |
| **DieuPhoi**          | `LoaiNguoiNhan === "KHOA" && thuộc DanhSachNguoiDieuPhoi`   | Người điều phối của khoa đích               |
| **NguoiXuLy**         | `NguoiXuLyID === nhanVienId`                                | Người đã tiếp nhận và đang xử lý            |
| **Admin**             | `user.PhanQuyen === "admin"`                                | Quản trị viên hệ thống                      |

### Ma trận Action theo Trạng thái

| Trạng thái        | NguoiGui                        | NguoiDuocDieuPhoi               | NguoiNhan                       | DieuPhoi                      | NguoiXuLy                                    | Admin |
| ----------------- | ------------------------------- | ------------------------------- | ------------------------------- | ----------------------------- | -------------------------------------------- | ----- |
| **MOI**           | SUA, XOA, NHAC_LAI, BAO_QUAN_LY | TIEP_NHAN, TU_CHOI, GUI_VE_KHOA | TIEP_NHAN, TU_CHOI, GUI_VE_KHOA | TIEP_NHAN, TU_CHOI, DIEU_PHOI | -                                            | XOA   |
| **DANG_XU_LY**    | NHAC_LAI, BAO_QUAN_LY           | -                               | -                               | -                             | HOAN_THANH, HUY_TIEP_NHAN, DOI_THOI_GIAN_HEN | -     |
| **DA_HOAN_THANH** | DANH_GIA, DONG                  | -                               | -                               | -                             | DONG, YEU_CAU_XU_LY_TIEP                     | DONG  |
| **DA_DONG**       | MO_LAI (7 ngày)                 | -                               | -                               | -                             | MO_LAI (7 ngày)                              | -     |
| **TU_CHOI**       | APPEAL                          | -                               | -                               | -                             | -                                            | -     |

---

## 🔧 Action Dialogs - Chi Tiết Thiết Kế

### 1. TuChoiDialog.js ❌ (Cần tạo)

**Mục đích**: Cho phép từ chối yêu cầu với lý do cụ thể

**Props**:

```javascript
{
  open: boolean,
  onClose: () => void,
  onSubmit: ({ LyDoTuChoiID, GhiChuTuChoi }) => void,
  loading: boolean,
  yeuCau: object // Thông tin yêu cầu đang từ chối
}
```

**Required Fields** (từ `yeuCauStateMachine.js`):

- `LyDoTuChoiID` - **Bắt buộc** - Chọn từ danh mục `LyDoTuChoi`
- `GhiChuTuChoi` - **Bắt buộc nếu** chọn "Lý do khác"

**Nguồn dữ liệu LyDoTuChoi**:

- Lưu trong collection `LyDoTuChoi` (danh mục chung toàn hệ thống)
- Fetch qua API: `GET /api/workmanagement/yeucau/ly-do-tu-choi`
- Lưu vào Redux: `cauHinhKhoaSlice.lyDoTuChoiList`

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────────┐
│ ✗ Từ chối yêu cầu                                        [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ℹ️ Yêu cầu: YC2025000123                                      │
│      Tiêu đề: Cài đặt phần mềm văn phòng                        │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Lý do từ chối *                                    [▼] │   │
│   │ ○ Không thuộc phạm vi xử lý                            │   │
│   │ ○ Thiếu thông tin cần thiết                            │   │
│   │ ○ Yêu cầu trùng lặp                                    │   │
│   │ ○ Lý do khác                                           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Ghi chú (bắt buộc nếu chọn "Lý do khác")               │   │
│   │ _________________________________________________      │   │
│   │ |                                               |      │   │
│   │ |                                               |      │   │
│   │ |_______________________________________________|      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                              [Hủy]  [Xác nhận từ chối]          │
└─────────────────────────────────────────────────────────────────┘
```

**Yup Schema**:

```javascript
const tuChoiSchema = Yup.object().shape({
  LyDoTuChoiID: Yup.object().nullable().required("Vui lòng chọn lý do từ chối"),
  GhiChuTuChoi: Yup.string().when("LyDoTuChoiID", {
    is: (val) => val?.MaLyDo === "LY_DO_KHAC", // hoặc check TenLyDo
    then: (schema) => schema.required("Vui lòng nhập chi tiết lý do"),
    otherwise: (schema) => schema.max(500, "Ghi chú không quá 500 ký tự"),
  }),
});
```

---

### 2. TiepNhanDialog.js ❌ (Cần tạo)

**Mục đích**: Xác nhận tiếp nhận yêu cầu và đặt thời gian hẹn

**Props**:

```javascript
{
  open: boolean,
  onClose: () => void,
  onSubmit: ({ ThoiGianHen }) => void,
  loading: boolean,
  yeuCau: object // Có SnapshotDanhMuc.ThoiGianDuKien để tính default
}
```

**Required Fields**:

- `ThoiGianHen` - **Bắt buộc** - DateTime

**Logic tính default ThoiGianHen**:

```javascript
// Default = now + ThoiGianDuKien (từ danh mục)
const thoiGianDuKien = yeuCau?.SnapshotDanhMuc?.ThoiGianDuKien || 60; // phút
const donVi = yeuCau?.SnapshotDanhMuc?.DonViThoiGian || "PHUT";

const defaultThoiGianHen = dayjs()
  .add(thoiGianDuKien, donVi === "GIO" ? "hour" : "minute")
  .format("YYYY-MM-DDTHH:mm");
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────────┐
│ ✓ Tiếp nhận yêu cầu                                      [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ℹ️ Yêu cầu: YC2025000123                                      │
│      Loại: Sửa lỗi phần mềm                                     │
│      Thời gian dự kiến: 60 phút                                 │
│                                                                  │
│   ⏱️ Thời gian hẹn hoàn thành *                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 📅 08/12/2025  🕐 15:30                            [📅] │   │
│   └─────────────────────────────────────────────────────────┘   │
│   💡 Mặc định: Thời điểm hiện tại + 60 phút                     │
│                                                                  │
│   ⚠️ Sau khi tiếp nhận, bạn sẽ là người xử lý yêu cầu này      │
│                                                                  │
│                              [Hủy]  [Xác nhận tiếp nhận]        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3. MoLaiDialog.js ❌ (Cần tạo)

**Mục đích**: Mở lại yêu cầu đã đóng với lý do

**Props**:

```javascript
{
  open: boolean,
  onClose: () => void,
  onSubmit: ({ LyDoMoLai }) => void,
  loading: boolean,
  yeuCau: object // Cần NgayDong để tính số ngày còn lại
}
```

**Required Fields**:

- `LyDoMoLai` - **Bắt buộc** - Text

**Ràng buộc**:

- Chỉ mở lại trong vòng **7 ngày** kể từ `NgayDong`
- Hiển thị số ngày còn lại

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔄 Mở lại yêu cầu                                        [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ℹ️ Yêu cầu: YC2025000123                                      │
│      Đóng ngày: 05/12/2025                                      │
│      ⏰ Còn 4 ngày để mở lại                                    │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Lý do mở lại *                                         │   │
│   │ _________________________________________________      │   │
│   │ |                                               |      │   │
│   │ | Vấn đề chưa được giải quyết triệt để...      |      │   │
│   │ |_______________________________________________|      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                              [Hủy]  [Xác nhận mở lại]           │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. AppealDialog.js ❌ (Cần tạo)

**Mục đích**: Khiếu nại khi yêu cầu bị từ chối

**Props**:

```javascript
{
  open: boolean,
  onClose: () => void,
  onSubmit: ({ LyDoAppeal }) => void,
  loading: boolean,
  yeuCau: object // Hiển thị lý do từ chối cũ
}
```

**Required Fields**:

- `LyDoAppeal` - **Bắt buộc** - Text

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Khiếu nại từ chối                                     [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ℹ️ Yêu cầu: YC2025000123                                      │
│   ❌ Lý do từ chối: Không thuộc phạm vi xử lý                   │
│      Ghi chú: Yêu cầu này nên gửi cho khoa CNTT                 │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Lý do khiếu nại *                                      │   │
│   │ _________________________________________________      │   │
│   │ |                                               |      │   │
│   │ | Yêu cầu đúng thuộc phạm vi khoa nhận...      |      │   │
│   │ |_______________________________________________|      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   💡 Sau khi khiếu nại, yêu cầu sẽ quay về trạng thái MỚI      │
│                                                                  │
│                              [Hủy]  [Gửi khiếu nại]             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. StarRatingDialog.js ⚠️ (Cần sửa)

**Thay đổi cần thiết**:

- Thêm validation: `NhanXet` **bắt buộc** khi `SoSao < 3`

**Yup Schema mới**:

```javascript
const danhGiaSchema = Yup.object().shape({
  DiemDanhGia: Yup.number()
    .min(1, "Vui lòng chọn số sao")
    .max(5)
    .required("Vui lòng đánh giá"),
  GhiChuDanhGia: Yup.string().when("DiemDanhGia", {
    is: (val) => val && val < 3,
    then: (schema) => schema.required("Vui lòng nhập lý do đánh giá thấp"),
    otherwise: (schema) => schema.max(500, "Ghi chú không quá 500 ký tự"),
  }),
});
```

**UI bổ sung**:

```
Khi rating < 3:
┌─────────────────────────────────────────────────────────────────┐
│   ⚠️ Bạn đánh giá thấp, vui lòng cho biết lý do:               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Nhận xét * (bắt buộc khi đánh giá dưới 3 sao)          │   │
│   │ _________________________________________________      │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 YeuCauDetailPage - Cập nhật UI

### Phát hiện vai trò đầy đủ

```javascript
// Trong YeuCauDetailPage.js - cần thêm các vai trò còn thiếu:

const nhanVienId = user?.NhanVienID;

// Các vai trò cần detect
const isNguoiGui = yeuCau?.NguoiYeuCauID?._id === nhanVienId;
const isNguoiXuLy = yeuCau?.NguoiXuLyID?._id === nhanVienId;
const isNguoiNhan =
  yeuCau?.LoaiNguoiNhan === "CA_NHAN" &&
  yeuCau?.NguoiNhanID?._id === nhanVienId;
const isNguoiDuocDieuPhoi = yeuCau?.NguoiDuocDieuPhoiID?._id === nhanVienId;
// isDieuPhoi - cần fetch từ CauHinhThongBaoKhoa (đã có trong code)
```

### Card Thông tin bổ sung

**Hiển thị NguoiDuocDieuPhoiID** (khi đã điều phối nhưng chưa tiếp nhận):

```
┌─────────────────────────────────────────────────────────────────┐
│ 👤 PHÂN CÔNG XỬ LÝ                                              │
├─────────────────────────────────────────────────────────────────┤
│   Được phân công cho: Nguyễn Văn A                              │
│   Thời gian: 08/12/2025 10:30                                   │
│   Trạng thái: ⏳ Chờ tiếp nhận                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Hiển thị LyDoTuChoi** (khi trạng thái = TU_CHOI):

```
┌─────────────────────────────────────────────────────────────────┐
│ ❌ LÝ DO TỪ CHỐI                                                │
├─────────────────────────────────────────────────────────────────┤
│   Lý do: Không thuộc phạm vi xử lý                              │
│   Ghi chú: Yêu cầu này nên gửi cho khoa CNTT                    │
│   Người từ chối: Trần Văn B                                     │
│   Thời gian: 07/12/2025 14:00                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Section Escalation (cho NguoiGui)

Chỉ hiện khi `isNguoiGui && (TrangThai === MOI || TrangThai === DANG_XU_LY)`:

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 NHẮC NHỞ                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [🔔 Nhắc lại (2/3)]    [⚠️ Báo quản lý (0/1)]                │
│                                                                  │
│   💡 Giới hạn reset lúc 00:00 hàng ngày                         │
└─────────────────────────────────────────────────────────────────┘
```

**Thông tin rate limit** (cần bổ sung vào API response):

- `SoLanNhacLai` (đã dùng hôm nay)
- `SoLanBaoQuanLy` (đã dùng hôm nay)
- Lấy từ `availableActions` response hoặc từ `yeuCau` object

---

## 🔄 Các thay đổi cần thực hiện

### Priority 1: Blocking (Backend validation sẽ fail)

| #   | Task                      | File          | Mô tả                                                  |
| --- | ------------------------- | ------------- | ------------------------------------------------------ |
| 1   | Tạo `TuChoiDialog.js`     | `components/` | Dialog với `LyDoTuChoiID` + conditional `GhiChuTuChoi` |
| 2   | Sửa `StarRatingDialog.js` | `components/` | Validate `NhanXet` required khi < 3⭐                  |
| 3   | Tạo `MoLaiDialog.js`      | `components/` | Dialog với required `LyDoMoLai`                        |
| 4   | Tạo `AppealDialog.js`     | `components/` | Dialog với required `LyDoAppeal`                       |

### Priority 2: Missing features

| #   | Task                              | File                  | Mô tả                             |
| --- | --------------------------------- | --------------------- | --------------------------------- |
| 5   | Tạo `TiepNhanDialog.js`           | `components/`         | Dialog với `ThoiGianHen` picker   |
| 6   | Thêm detect `isNguoiDuocDieuPhoi` | `YeuCauDetailPage.js` | Check `NguoiDuocDieuPhoiID`       |
| 7   | Thêm detect `isNguoiNhan`         | `YeuCauDetailPage.js` | Check `NguoiNhanID` khi `CA_NHAN` |
| 8   | Update `handleAction()`           | `YeuCauDetailPage.js` | Mở dialog mới thay vì confirm     |

### Priority 3: UX improvements

| #   | Task                           | File                  | Mô tả                             |
| --- | ------------------------------ | --------------------- | --------------------------------- |
| 9   | Hiển thị `NguoiDuocDieuPhoiID` | `YeuCauDetailPage.js` | Card info khi đã điều phối        |
| 10  | Hiển thị `LyDoTuChoi`          | `YeuCauDetailPage.js` | Card info khi TU_CHOI             |
| 11  | Section Escalation             | `YeuCauDetailPage.js` | NHAC_LAI + BAO_QUAN_LY với badges |
| 12  | Export dialogs                 | `components/index.js` | Export các dialog mới             |

---

## 📝 Quyết định đã thống nhất

| #   | Câu hỏi                      | Quyết định                                                    |
| --- | ---------------------------- | ------------------------------------------------------------- |
| Q1  | Nguồn dữ liệu LyDoTuChoi     | Collection `LyDoTuChoi` - danh mục chung toàn hệ thống        |
| Q2  | Rate limit info trả về ở đâu | Gộp vào response `getYeuCauDetail` - field `availableActions` |
| Q3  | Tổ chức folder dialogs       | Đặt trong `components/` - cùng với `DieuPhoiDialog.js` đã có  |

---

## 📚 Tham khảo

- [01_NGHIEP_VU_CHI_TIET.md](./01_NGHIEP_VU_CHI_TIET.md) - Flow nghiệp vụ chi tiết
- [03_STATE_MACHINE.md](./03_STATE_MACHINE.md) - State machine và transitions
- Backend: `modules/workmanagement/services/yeuCauStateMachine.js`
