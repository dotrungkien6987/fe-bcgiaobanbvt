# 📝 TEST CASES - MOI Status (18 TC)

## A. GUI_DEN_KHOA - Gửi Đến Khoa (10 Test Cases)

---

### TC-MOI-K-01: NguoiGui XEM + HUY yêu cầu của mình

#### 📝 Mô Tả

Người gửi có thể xem chi tiết và hủy yêu cầu MOI mà mình vừa tạo (gửi đến KHOA)

#### 🎭 Actors

- **Người thực hiện**: User A (test_nguoigui) - vai trò NguoiGui
- **Người liên quan**: User B (test_dieuphoi) - vai trò DieuPhoi của khoa nhận

#### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc123...",
    "TieuDe": "TC-MOI-K-01: Máy X-quang hỏng cần sửa chữa gấp",
    "NoiDung": "Máy X-quang tại phòng chụp chiếu đang bị lỗi",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_a_id",
    "KhoaNhanID": "khoa_noi_id",
    "MucDoUuTien": "CAO",
    "NguoiXuLyID": null,
    "ThoiGianHen": null
  }
}
```

#### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_nguoigui` (password: Test@123)
2. **Navigate**:
   - Vào menu "Quản lý yêu cầu"
   - Mở tab "Yêu cầu của tôi" hoặc "Tất cả yêu cầu"
3. **View Detail**: Click vào yêu cầu "TC-MOI-K-01: Máy X-quang..."
4. **Verify UI**:
   - Kiểm tra hiển thị đầy đủ: Tiêu đề, Nội dung, Badge "MOI" (màu info)
   - Kiểm tra có 2 buttons: **Hủy Yêu Cầu** + **Xem Chi Tiết**
5. **Action**: Click nút "Hủy Yêu Cầu"
6. **Confirm**:
   - Dialog confirm xuất hiện: "Bạn có chắc muốn hủy yêu cầu này?"
   - Click "Xác nhận"

#### ✅ Expected Results

##### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "MOI",
  NguoiXuLyID: null,
  ThoiGianHen: null
}

// After - Record bị XÓA hoặc chuyển sang INACTIVE
// (Tùy implementation: soft delete hoặc hard delete)
```

##### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã hủy yêu cầu thành công"
- ✅ Redirect về danh sách yêu cầu
- ✅ Yêu cầu TC-MOI-K-01 không còn trong danh sách (hoặc có label "Đã hủy")

##### 🔔 Notifications

- ✅ User B (DieuPhoi) nhận notification: "Yêu cầu #TC-MOI-K-01 đã bị hủy bởi người gửi"
- ✅ Socket event: `yeuCauUpdated` hoặc `yeuCauDeleted`

#### 🚫 Negative Scenarios

- ❌ Nếu User C (không phải NguoiGui) cố HUY → Button không hiển thị
- ❌ Nếu sau khi click HUY, có người TIEP_NHAN trước → Version conflict error

#### 🐛 Edge Cases

- ⚠️ HUY ngay sau khi tạo (trong < 1 phút) → Vẫn cho phép
- ⚠️ HUY trong lúc DieuPhoi đang xem (2 browsers) → Socket update real-time

#### 📸 UI Screenshots to Verify

- [ ] Badge "MOI" hiển thị màu xanh (info)
- [ ] 2 buttons: "Hủy Yêu Cầu" (màu đỏ) + "Xem Chi Tiết"
- [ ] Dialog confirm với text rõ ràng
- [ ] Toast success xuất hiện góc phải màn hình

---

### TC-MOI-K-02: NguoiGui XEM yêu cầu KHÁC (không có actions)

#### 📝 Mô Tả

Người gửi xem yêu cầu MOI của người khác gửi đến khoa → Chỉ xem, không có actions

#### 🎭 Actors

- **Người thực hiện**: User A (test_nguoigui)
- **Người tạo yêu cầu**: User C (test_xulykhac) - vai trò NguoiGui
- **Khoa nhận**: Khoa Nội (của DieuPhoi B)

#### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc456...",
    "TieuDe": "TC-MOI-K-02: Yêu cầu của người khác",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_c_id",
    "KhoaNhanID": "khoa_noi_id"
  }
}
```

#### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_nguoigui`
2. **Navigate**: Vào "Tất cả yêu cầu" (nếu có quyền xem)
3. **View Detail**: Click vào yêu cầu "TC-MOI-K-02: Yêu cầu của người khác"
4. **Verify UI**: Kiểm tra KHÔNG có buttons actions (chỉ có nút "Đóng")

#### ✅ Expected Results

##### 🖥️ UI Changes

- ✅ Hiển thị đầy đủ thông tin: Tiêu đề, Nội dung, Badge "MOI"
- ✅ **KHÔNG** có nút "Hủy Yêu Cầu"
- ✅ **KHÔNG** có nút "Tiếp Nhận" hoặc "Từ Chối"
- ✅ Chỉ có thông tin view-only
- ✅ `availableActions = []`

##### 🗄️ DB Changes

- ⭕ Không có thay đổi DB

##### 🔔 Notifications

- ⭕ Không có notification

#### 🚫 Negative Scenarios

- ❌ Nếu User A cố gọi API `HUY` với YeuCau này → 403 Forbidden
- ❌ Nếu User A cố gọi API `TIEP_NHAN` → 403 Forbidden

#### 📸 UI Screenshots to Verify

- [ ] Không có action buttons trong action bar
- [ ] Chỉ có button "Đóng" để đóng detail page

---

### TC-MOI-K-03: DieuPhoi TIEP_NHAN yêu cầu → DANG_XU_LY

#### 📝 Mô Tả

Điều phối viên của khoa tiếp nhận yêu cầu MOI, set thời gian hẹn, chuyển sang DANG_XU_LY

#### 🎭 Actors

- **Người thực hiện**: User B (test_dieuphoi) - vai trò DieuPhoi
- **Người gửi**: User A (test_nguoigui)

#### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc123...",
    "TieuDe": "TC-MOI-K-01: Máy X-quang hỏng",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_a_id",
    "KhoaNhanID": "khoa_noi_id",
    "DanhMucYeuCauID": "danhmuc_1_id",
    "SnapshotDanhMuc": {
      "TenDanhMuc": "Sửa chữa thiết bị y tế",
      "ThoiGianDuKien": 2,
      "DonViThoiGian": "NGAY"
    },
    "NguoiXuLyID": null,
    "ThoiGianHen": null
  }
}
```

#### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_dieuphoi`
2. **Navigate**: Vào "Yêu cầu mới" hoặc "Tất cả yêu cầu"
3. **View Detail**: Click vào "TC-MOI-K-01: Máy X-quang..."
4. **Verify UI**:
   - Badge "MOI" màu info
   - Có 3 buttons: **Tiếp Nhận**, **Từ Chối**, **Chuyển Tiếp**
5. **Action**: Click nút "Tiếp Nhận"
6. **Fill Form** (TiepNhanDialog):
   - **ThoiGianHen**: Mặc định là `now + 2 ngày` (từ SnapshotDanhMuc)
   - Có thể sửa lại thời gian hẹn
   - Ví dụ: Set thành `15/12/2025 10:00`
7. **Submit**: Click "Xác Nhận"

#### ✅ Expected Results

##### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "MOI",
  NguoiXuLyID: null,
  ThoiGianHen: null,
  ThoiGianBatDau: null
}

// After
{
  TrangThai: "DANG_XU_LY",
  NguoiXuLyID: "user_b_id", // test_dieuphoi
  ThoiGianHen: ISODate("2025-12-15T10:00:00Z"),
  ThoiGianBatDau: ISODate("2025-12-08T..."), // now
  TienDoHoanThanh: 0
}
```

##### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã tiếp nhận yêu cầu thành công"
- ✅ Badge status đổi: MOI (info) → DANG_XU_LY (warning)
- ✅ Hiển thị thông tin:
  - "Người xử lý": Trần Thị B - Điều Phối
  - "Thời gian hẹn": 15/12/2025 10:00
  - "Tiến độ": 0%
- ✅ Actions buttons update: CAP_NHAT_TIEN_DO, HOAN_THANH, TU_CHOI, CHUYEN_TIEP
- ✅ Timeline có event: "Đã tiếp nhận yêu cầu vào [timestamp]"

##### 🔔 Notifications

- ✅ User A (NguoiGui) nhận notification:
  - "Yêu cầu #TC-MOI-K-01 đã được tiếp nhận bởi Trần Thị B"
  - "Thời gian hẹn hoàn thành: 15/12/2025 10:00"
- ✅ Socket event: `yeuCauUpdated` broadcast đến tất cả clients

#### 🚫 Negative Scenarios

- ❌ Nếu ThoiGianHen là quá khứ → Validation error: "Thời gian hẹn phải là tương lai"
- ❌ Nếu không điền ThoiGianHen → Validation error: "Vui lòng chọn thời gian hẹn"
- ❌ Nếu User C (không phải DieuPhoi) cố TIEP_NHAN → 403 Forbidden

#### 🐛 Edge Cases

- ⚠️ Nếu 2 điều phối viên TIEP_NHAN cùng lúc → Version conflict, 1 người fail
- ⚠️ ThoiGianHen default = now + ThoiGianDuKien (kiểm tra đúng đơn vị: GIO/NGAY/PHUT)

#### 📸 UI Screenshots to Verify

- [ ] TiepNhanDialog hiển thị với DateTimePicker
- [ ] Default ThoiGianHen = now + 2 NGAY (2 ngày sau)
- [ ] Badge đổi màu sau submit: info → warning
- [ ] Timeline có event mới với timestamp chính xác
- [ ] Notification bar hiển thị thông báo

---

### TC-MOI-K-04: DieuPhoi TU_CHOI yêu cầu → TU_CHOI

#### 📝 Mô Tả

Điều phối viên từ chối yêu cầu MOI với lý do từ chối

#### 🎭 Actors

- **Người thực hiện**: User B (test_dieuphoi)
- **Người gửi**: User A (test_nguoigui)

#### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc789...",
    "TieuDe": "TC-MOI-K-04: Yêu cầu không hợp lệ",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_a_id",
    "KhoaNhanID": "khoa_noi_id"
  }
}
```

#### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_dieuphoi`
2. **Navigate**: Vào detail page của "TC-MOI-K-04"
3. **Verify UI**: Có nút "Từ Chối"
4. **Action**: Click nút "Từ Chối"
5. **Fill Form** (TuChoiDialog):
   - **LyDoTuChoiID**: Chọn "Không thuộc phạm vi xử lý"
   - **GhiChu**: (Optional nếu không chọn "Lý do khác")
   - Hoặc:
   - **LyDoTuChoiID**: Chọn "Lý do khác"
   - **GhiChu**: **BẮT BUỘC** nhập, ví dụ: "Yêu cầu này thuộc trách nhiệm của Khoa Hành Chính"
6. **Submit**: Click "Xác Nhận"

#### ✅ Expected Results

##### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "MOI",
  LyDoTuChoiID: null,
  GhiChuTuChoi: null,
  ThoiGianTuChoi: null
}

// After
{
  TrangThai: "TU_CHOI",
  LyDoTuChoiID: "lydo_khac_id",
  SnapshotLyDoTuChoi: {
    MaLyDo: "LY_DO_KHAC",
    TenLyDo: "Lý do khác"
  },
  GhiChuTuChoi: "Yêu cầu này thuộc trách nhiệm của Khoa Hành Chính",
  ThoiGianTuChoi: ISODate("2025-12-08T..."), // now
  NguoiXuLyID: null
}
```

##### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã từ chối yêu cầu"
- ✅ Badge status: MOI → TU_CHOI (màu error/đỏ)
- ✅ Hiển thị thông tin từ chối:
  - "Lý do từ chối": Lý do khác
  - "Ghi chú": Yêu cầu này thuộc...
  - "Thời gian từ chối": 08/12/2025 14:30
- ✅ Actions buttons: Chỉ còn "Appeal" (nếu NguoiGui xem)
- ✅ Timeline có event: "Đã từ chối yêu cầu vào [timestamp]"

##### 🔔 Notifications

- ✅ User A (NguoiGui) nhận notification:
  - "Yêu cầu #TC-MOI-K-04 đã bị từ chối"
  - "Lý do: Lý do khác - Yêu cầu này thuộc..."
  - "Bạn có thể Appeal nếu không đồng ý"

#### 🚫 Negative Scenarios

- ❌ Nếu chọn "Lý do khác" nhưng không điền GhiChu → Validation error
  - "Vui lòng nhập ghi chú khi chọn lý do khác"
- ❌ Nếu không chọn LyDoTuChoiID → Validation error
  - "Vui lòng chọn lý do từ chối"

#### 🐛 Edge Cases

- ⚠️ Conditional validation: GhiChu bắt buộc khi MaLyDo === "LY_DO_KHAC"
- ⚠️ GhiChu optional khi chọn lý do khác

#### 📸 UI Screenshots to Verify

- [ ] TuChoiDialog với FAutocomplete (LyDoTuChoi)
- [ ] FTextField GhiChu xuất hiện/required khi chọn "Lý do khác"
- [ ] Badge TU_CHOI màu đỏ (error)
- [ ] Box hiển thị lý do từ chối rõ ràng
- [ ] Notification có đủ thông tin cho NguoiGui

---

### TC-MOI-K-05: DieuPhoi CHUYEN_TIEP sang khoa khác

#### 📝 Mô Tả

Điều phối viên chuyển tiếp yêu cầu MOI sang khoa khác xử lý

#### 🎭 Actors

- **Người thực hiện**: User B (test_dieuphoi) - DieuPhoi Khoa Nội
- **Người gửi**: User A (test_nguoigui)
- **Khoa mới**: Khoa Hành Chính (có DieuPhoi khác)

#### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc999...",
    "TieuDe": "TC-MOI-K-05: Yêu cầu cung cấp văn phòng phẩm",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_a_id",
    "KhoaNhanID": "khoa_noi_id"
  }
}
```

#### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_dieuphoi`
2. **Navigate**: Vào detail page "TC-MOI-K-05"
3. **Action**: Click nút "Chuyển Tiếp"
4. **Fill Form** (ChuyenTiepDialog):
   - **LoaiNguoiNhan**: Chọn "Gửi đến Khoa"
   - **KhoaNhanID**: Chọn "Khoa Hành Chính"
   - **GhiChuChuyenTiep**: "Yêu cầu này thuộc trách nhiệm của khoa Hành Chính"
5. **Submit**: Click "Xác Nhận"

#### ✅ Expected Results

##### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "MOI",
  LoaiNguoiNhan: "GUI_DEN_KHOA",
  KhoaNhanID: "khoa_noi_id",
  NguoiNhanID: null
}

// After
{
  TrangThai: "MOI", // Vẫn MOI
  LoaiNguoiNhan: "GUI_DEN_KHOA",
  KhoaNhanID: "khoa_hanh_chinh_id", // ← Changed
  NguoiNhanID: null,
  // LichSuChuyenTiep array có thêm entry:
  LichSuChuyenTiep: [
    {
      TuKhoa: "Khoa Nội",
      DenKhoa: "Khoa Hành Chính",
      NguoiChuyenID: "user_b_id",
      GhiChu: "Yêu cầu này thuộc...",
      ThoiGian: ISODate("2025-12-08T...")
    }
  ]
}
```

##### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã chuyển tiếp yêu cầu sang Khoa Hành Chính"
- ✅ Badge status: Vẫn MOI
- ✅ Thông tin khoa nhận update:
  - "Khoa nhận": Khoa Hành Chính (changed)
- ✅ Timeline có event: "Đã chuyển tiếp từ Khoa Nội sang Khoa Hành Chính vào [timestamp]"
- ✅ Actions buttons: User B không còn actions (vì đã chuyển khoa)

##### 🔔 Notifications

- ✅ DieuPhoi của Khoa Hành Chính nhận notification:
  - "Yêu cầu #TC-MOI-K-05 đã được chuyển tiếp từ Khoa Nội"
  - "Ghi chú: Yêu cầu này thuộc..."
- ✅ User A (NguoiGui) nhận notification:
  - "Yêu cầu của bạn đã được chuyển sang Khoa Hành Chính"

#### 🚫 Negative Scenarios

- ❌ Nếu chuyển về chính khoa hiện tại → Validation error (tùy business logic)

#### 🐛 Edge Cases

- ⚠️ Chuyển tiếp vòng lặp: A → B → A (cần track history)

#### 📸 UI Screenshots to Verify

- [ ] ChuyenTiepDialog với FAutocomplete (Khoa)
- [ ] Timeline hiển thị lịch sử chuyển tiếp rõ ràng
- [ ] Notification đến đúng DieuPhoi khoa mới

---

### TC-MOI-K-06: NguoiDuocDieuPhoi TIEP_NHAN (nhận về xử lý)

#### 📝 Mô Tả

Người được điều phối (cùng khoa với DieuPhoi) có thể tiếp nhận yêu cầu MOI về xử lý

#### 🎭 Actors

- **Người thực hiện**: User C (test_duocdieuphoi) - NguoiDuocDieuPhoi
- **Người gửi**: User A (test_nguoigui)
- **Khoa**: Khoa Nội (cùng khoa với User C)

#### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc111...",
    "TieuDe": "TC-MOI-K-06: Sửa chữa máy điện tim",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_a_id",
    "KhoaNhanID": "khoa_noi_id",
    "NguoiXuLyID": null
  },
  "User": {
    "_id": "user_c_id",
    "UserName": "test_duocdieuphoi",
    "HoTen": "Lê Văn C - Được Điều Phối",
    "KhoaID": "khoa_noi_id", // ← Cùng khoa
    "PhanQuyen": "user"
  }
}
```

#### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_duocdieuphoi`
2. **Navigate**: Vào "Yêu cầu mới" (filter theo khoa)
3. **View Detail**: Click vào "TC-MOI-K-06"
4. **Verify UI**:
   - User C thấy 3 buttons: **Tiếp Nhận**, **Từ Chối**, **Chuyển Tiếp**
   - (Vì cùng khoa với khoa nhận)
5. **Action**: Click nút "Tiếp Nhận"
6. **Fill Form** (TiepNhanDialog):
   - ThoiGianHen: Set thành `10/12/2025 15:00`
7. **Submit**: Click "Xác Nhận"

#### ✅ Expected Results

##### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "MOI",
  NguoiXuLyID: null,
  ThoiGianHen: null
}

// After
{
  TrangThai: "DANG_XU_LY",
  NguoiXuLyID: "user_c_id", // ← test_duocdieuphoi
  ThoiGianHen: ISODate("2025-12-10T15:00:00Z"),
  ThoiGianBatDau: ISODate("2025-12-08T...")
}
```

##### 🖥️ UI Changes

- ✅ Badge: MOI → DANG_XU_LY
- ✅ Người xử lý: Lê Văn C - Được Điều Phối
- ✅ Timeline: "Đã tiếp nhận vào [timestamp]"

##### 🔔 Notifications

- ✅ User A (NguoiGui): "Yêu cầu đã được tiếp nhận bởi Lê Văn C"
- ✅ User B (DieuPhoi): "Yêu cầu #TC-MOI-K-06 đã được Lê Văn C tiếp nhận"

#### 📸 UI Screenshots to Verify

- [ ] User C (NguoiDuocDieuPhoi) thấy actions khi LoaiNguoiNhan=GUI_DEN_KHOA

---

### TC-MOI-K-07: NguoiDuocDieuPhoi TU_CHOI (từ chối xử lý)

#### 📝 Mô Tả

Người được điều phối từ chối xử lý yêu cầu MOI

#### 🎭 Actors

- **Người thực hiện**: User C (test_duocdieuphoi)
- **Người gửi**: User A (test_nguoigui)

#### 📊 Preconditions

- YeuCau MOI, GUI_DEN_KHOA, KhoaNhanID = Khoa Nội
- User C cùng khoa Nội

#### 🎬 Test Steps

1. Login `test_duocdieuphoi`
2. View detail YeuCau MOI
3. Click "Từ Chối"
4. Fill TuChoiDialog:
   - LyDoTuChoiID: "Không đủ nhân lực"
   - GhiChu: (Optional)
5. Submit

#### ✅ Expected Results

- ✅ TrangThai → TU_CHOI
- ✅ Notification đến NguoiGui + DieuPhoi

---

### TC-MOI-K-08: NguoiDuocDieuPhoi CHUYEN_TIEP sang người khác

#### 📝 Mô Tả

Người được điều phối chuyển tiếp yêu cầu MOI sang người khác xử lý

#### 🎭 Actors

- **Người thực hiện**: User C (test_duocdieuphoi)
- **Người nhận mới**: User E (test_xulykhac)

#### 📊 Preconditions

- YeuCau MOI, GUI_DEN_KHOA

#### 🎬 Test Steps

1. Login `test_duocdieuphoi`
2. View detail YeuCau MOI
3. Click "Chuyển Tiếp"
4. Fill ChuyenTiepDialog:
   - LoaiNguoiNhan: "Gửi đến Cá Nhân"
   - NguoiNhanID: User E
   - GhiChu: "Anh E có kinh nghiệm hơn"
5. Submit

#### ✅ Expected Results

```javascript
// After
{
  TrangThai: "MOI", // Vẫn MOI
  LoaiNguoiNhan: "GUI_DEN_CA_NHAN", // ← Changed
  KhoaNhanID: null,
  NguoiNhanID: "user_e_id", // ← Changed
  LichSuChuyenTiep: [...]
}
```

- ✅ Notification đến User E: "Bạn nhận được yêu cầu từ User C"

---

### TC-MOI-K-09: Admin có tất cả actions

#### 📝 Mô Tả

Admin có full quyền với YeuCau MOI: TIEP_NHAN, TU_CHOI, CHUYEN_TIEP, HUY

#### 🎭 Actors

- **Người thực hiện**: User Admin (test_admin)

#### 📊 Preconditions

- YeuCau MOI bất kỳ

#### 🎬 Test Steps

1. Login `test_admin`
2. View detail YeuCau MOI
3. Verify UI: 4 buttons hiển thị:
   - Tiếp Nhận
   - Từ Chối
   - Chuyển Tiếp
   - Hủy Yêu Cầu

#### ✅ Expected Results

- ✅ Admin có thể thực hiện tất cả actions
- ✅ availableActions = ["TIEP_NHAN", "TU_CHOI", "CHUYEN_TIEP", "HUY"]

---

### TC-MOI-K-10: User khác không có quyền

#### 📝 Mô Tả

User không liên quan không có actions với YeuCau MOI

#### 🎭 Actors

- **Người thực hiện**: User E (test_xulykhac)
- **YeuCau**: MOI, gửi đến Khoa Nội (User E không thuộc Khoa Nội)

#### 📊 Preconditions

- YeuCau MOI, GUI_DEN_KHOA, KhoaNhanID = Khoa Nội
- User E thuộc Khoa Ngoại (khác khoa)

#### 🎬 Test Steps

1. Login `test_xulykhac`
2. View detail YeuCau (nếu có quyền xem)
3. Verify UI: KHÔNG có action buttons

#### ✅ Expected Results

- ✅ availableActions = []
- ✅ Chỉ xem thông tin, không có actions

---

## B. GUI_DEN_CA_NHAN - Gửi Đến Cá Nhân (8 Test Cases)

---

### TC-MOI-CN-01: NguoiGui XEM + HUY yêu cầu của mình

#### 📝 Mô Tả

Người gửi hủy yêu cầu MOI gửi đến cá nhân

#### 🎭 Actors

- **Người thực hiện**: User A (test_nguoigui)
- **Người nhận**: User D (test_nguoinhan)

#### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc222...",
    "TieuDe": "TC-MOI-CN-01: Hỗ trợ cài đặt phần mềm",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_CA_NHAN",
    "NguoiGuiID": "user_a_id",
    "NguoiNhanID": "user_d_id"
  }
}
```

#### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail "TC-MOI-CN-01"
3. Click "Hủy Yêu Cầu"
4. Confirm

#### ✅ Expected Results

- ✅ YeuCau bị xóa hoặc INACTIVE
- ✅ Notification đến User D: "Yêu cầu đã bị hủy"

---

### TC-MOI-CN-02: NguoiNhan TIEP_NHAN yêu cầu

#### 📝 Mô Tả

Người nhận trực tiếp tiếp nhận yêu cầu gửi đến mình

#### 🎭 Actors

- **Người thực hiện**: User D (test_nguoinhan)
- **Người gửi**: User A (test_nguoigui)

#### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc333...",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_CA_NHAN",
    "NguoiGuiID": "user_a_id",
    "NguoiNhanID": "user_d_id"
  }
}
```

#### 🎬 Test Steps

1. Login `test_nguoinhan`
2. View detail "TC-MOI-CN-02"
3. Verify UI: 3 buttons (TIEP_NHAN, TU_CHOI, CHUYEN_TIEP)
4. Click "Tiếp Nhận"
5. Fill TiepNhanDialog: ThoiGianHen = 09/12/2025 16:00
6. Submit

#### ✅ Expected Results

```javascript
// After
{
  TrangThai: "DANG_XU_LY",
  NguoiXuLyID: "user_d_id", // ← NguoiNhan becomes NguoiXuLy
  ThoiGianHen: ISODate("2025-12-09T16:00:00Z"),
  ThoiGianBatDau: ISODate("2025-12-08T...")
}
```

- ✅ Notification đến User A: "Yêu cầu đã được tiếp nhận"

---

### TC-MOI-CN-03: NguoiNhan TU_CHOI yêu cầu

#### 📝 Mô Tả

Người nhận từ chối yêu cầu gửi đến mình

#### 🎬 Test Steps

1. Login `test_nguoinhan`
2. View detail YeuCau MOI
3. Click "Từ Chối"
4. Fill TuChoiDialog với lý do
5. Submit

#### ✅ Expected Results

- ✅ TrangThai → TU_CHOI
- ✅ Notification đến NguoiGui

---

### TC-MOI-CN-04: NguoiNhan CHUYEN_TIEP sang người khác

#### 📝 Mô Tả

Người nhận chuyển tiếp yêu cầu sang người khác xử lý

#### 🎬 Test Steps

1. Login `test_nguoinhan`
2. View detail YeuCau MOI
3. Click "Chuyển Tiếp"
4. Fill ChuyenTiepDialog:
   - LoaiNguoiNhan: "Gửi đến Cá Nhân"
   - NguoiNhanID: User E
   - GhiChu: "..."
5. Submit

#### ✅ Expected Results

```javascript
// After
{
  TrangThai: "MOI",
  LoaiNguoiNhan: "GUI_DEN_CA_NHAN",
  NguoiNhanID: "user_e_id", // ← Changed
  LichSuChuyenTiep: [...]
}
```

---

### TC-MOI-CN-05: DieuPhoi XEM (monitor only)

#### 📝 Mô Tả

Điều phối viên xem yêu cầu gửi đến cá nhân (chỉ monitor, không có actions)

#### 🎬 Test Steps

1. Login `test_dieuphoi`
2. View detail YeuCau MOI (GUI_DEN_CA_NHAN)
3. Verify UI: KHÔNG có action buttons

#### ✅ Expected Results

- ✅ availableActions = []
- ✅ DieuPhoi chỉ xem, không can thiệp

---

### TC-MOI-CN-06: Admin có full actions

#### 📝 Mô Tả

Admin có TIEP_NHAN, TU_CHOI, CHUYEN_TIEP, HUY với yêu cầu cá nhân

#### ✅ Expected Results

- ✅ Admin có 4 buttons như MOI-K-09

---

### TC-MOI-CN-07: User khác không có quyền

#### 📝 Mô Tả

User không liên quan không có actions

#### ✅ Expected Results

- ✅ availableActions = []

---

### TC-MOI-CN-08: NguoiGui HUY ngay lập tức

#### 📝 Mô Tả

Người gửi hủy yêu cầu ngay sau khi gửi (trong < 1 phút)

#### 🎬 Test Steps

1. User A tạo YeuCau mới gửi đến User D
2. Ngay sau khi tạo (< 30 giây), click "Hủy Yêu Cầu"
3. Confirm

#### ✅ Expected Results

- ✅ Cho phép hủy ngay lập tức
- ✅ User D nhận notification: "Yêu cầu đã bị hủy"

---

## 📊 Summary MOI Status Tests

**Tổng cộng: 18 Test Cases**

- ✅ GUI_DEN_KHOA: 10 TC
- ✅ GUI_DEN_CA_NHAN: 8 TC

**Coverage**:

- ✅ Tất cả vai trò: NguoiGui, DieuPhoi, NguoiDuocDieuPhoi, NguoiNhan, Admin
- ✅ Tất cả actions: TIEP_NHAN, TU_CHOI, CHUYEN_TIEP, HUY
- ✅ Tất cả dialogs: TiepNhanDialog, TuChoiDialog, ChuyenTiepDialog
- ✅ Permission checks: availableActions validation
- ✅ Notifications: Socket real-time updates

**Next**: Continue with TC-XL-01 (DANG_XU_LY status)
