# 📝 TEST CASES - DANG_XU_LY Status (6 TC)

## Overview

Khi YeuCau ở trạng thái **DANG_XU_LY**:

- **NguoiXuLy** (người đang xử lý) có actions: CAP_NHAT_TIEN_DO, HOAN_THANH, TU_CHOI, CHUYEN_TIEP
- **NguoiGui** có action: BAO_CAO_SU_CO (escalate)
- **Admin** có tất cả actions của NguoiXuLy

---

## TC-XL-01: NguoiXuLy CAP_NHAT_TIEN_DO (Progress Update)

### 📝 Mô Tả

Người xử lý cập nhật tiến độ hoàn thành từ 0-100%

### 🎭 Actors

- **Người thực hiện**: User C (test_duocdieuphoi) - NguoiXuLy
- **Người gửi**: User A (test_nguoigui)

### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "673abc444...",
    "TieuDe": "TC-XL-01: Đang sửa chữa máy điện tim",
    "TrangThai": "DANG_XU_LY",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "NguoiGuiID": "user_a_id",
    "KhoaNhanID": "khoa_noi_id",
    "NguoiXuLyID": "user_c_id",
    "ThoiGianHen": "2025-12-10T15:00:00Z",
    "ThoiGianBatDau": "2025-12-08T10:00:00Z",
    "TienDoHoanThanh": 0
  }
}
```

### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_duocdieuphoi`
2. **Navigate**: Vào "Yêu cầu đang xử lý"
3. **View Detail**: Click vào "TC-XL-01: Đang sửa chữa máy điện tim"
4. **Verify UI**:
   - Badge "DANG_XU_LY" màu warning (vàng/cam)
   - Hiển thị: "Tiến độ: 0%"
   - Progress bar ở 0%
   - Có 4 buttons: **Cập Nhật Tiến Độ**, **Hoàn Thành**, **Từ Chối**, **Chuyển Tiếp**
5. **Action**: Click nút "Cập Nhật Tiến Độ"
6. **Fill Form** (CapNhatTienDoDialog):
   - **TienDoHoanThanh**: Slider hoặc TextField → Set 35%
   - **GhiChuTienDo**: "Đã kiểm tra và đặt hàng linh kiện mới"
7. **Submit**: Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TienDoHoanThanh: 0,
  LichSuCapNhatTienDo: []
}

// After
{
  TienDoHoanThanh: 35,
  LichSuCapNhatTienDo: [
    {
      TienDo: 35,
      GhiChu: "Đã kiểm tra và đặt hàng linh kiện mới",
      NguoiCapNhatID: "user_c_id",
      ThoiGian: ISODate("2025-12-08T...")
    }
  ],
  updatedAt: ISODate("2025-12-08T...")
}
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã cập nhật tiến độ thành công"
- ✅ Progress bar update: 0% → 35%
- ✅ Hiển thị: "Tiến độ: 35%"
- ✅ Timeline có event: "Đã cập nhật tiến độ lên 35% vào [timestamp]"
  - Với ghi chú: "Đã kiểm tra và đặt hàng linh kiện mới"

#### 🔔 Notifications

- ✅ User A (NguoiGui) nhận notification:
  - "Yêu cầu #TC-XL-01 đã cập nhật tiến độ: 35%"
  - "Ghi chú: Đã kiểm tra và đặt hàng..."
- ✅ Socket event: `yeuCauUpdated` broadcast

### 🚫 Negative Scenarios

- ❌ Nếu TienDo < 0 hoặc > 100 → Validation error
- ❌ Nếu TienDo = 100 → Validation error: "Vui lòng dùng nút Hoàn Thành"
- ❌ Nếu User khác (không phải NguoiXuLy) cố cập nhật → 403 Forbidden

### 🐛 Edge Cases

- ⚠️ Cập nhật nhiều lần: 0% → 35% → 50% → 80% (track history)
- ⚠️ Cập nhật lùi tiến độ: 50% → 30% (cho phép, ghi lại lý do trong GhiChu)

### 📸 UI Screenshots to Verify

- [ ] Progress bar với màu gradient (0-100%)
- [ ] Timeline hiển thị lịch sử cập nhật tiến độ
- [ ] Notification real-time cho NguoiGui

---

## TC-XL-02: NguoiXuLy HOAN_THANH yêu cầu → DA_HOAN_THANH

### 📝 Mô Tả

Người xử lý hoàn thành yêu cầu, chuyển sang DA_HOAN_THANH

### 🎭 Actors

- **Người thực hiện**: User C (test_duocdieuphoi)
- **Người gửi**: User A (test_nguoigui)

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc555...",
    "TieuDe": "TC-XL-02: Sửa chữa máy X-quang",
    "TrangThai": "DANG_XU_LY",
    "NguoiXuLyID": "user_c_id",
    "TienDoHoanThanh": 80
  }
}
```

### 🎬 Test Steps

1. Login `test_duocdieuphoi`
2. View detail "TC-XL-02"
3. Verify UI: Button "Hoàn Thành" hiển thị
4. Click "Hoàn Thành"
5. Confirm dialog: "Bạn có chắc đã hoàn thành yêu cầu này?"
6. Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "DANG_XU_LY",
  TienDoHoanThanh: 80,
  ThoiGianHoanThanh: null
}

// After
{
  TrangThai: "DA_HOAN_THANH",
  TienDoHoanThanh: 100, // Auto set to 100
  ThoiGianHoanThanh: ISODate("2025-12-08T..."), // now
  updatedAt: ISODate("2025-12-08T...")
}
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã hoàn thành yêu cầu"
- ✅ Badge status: DANG_XU_LY (warning) → DA_HOAN_THANH (success/xanh lá)
- ✅ Tiến độ: 80% → 100%
- ✅ Hiển thị: "Thời gian hoàn thành: 08/12/2025 14:30"
- ✅ Actions buttons update:
  - NguoiXuLy: Không còn actions
  - NguoiGui: DANH_GIA, DONG_YEU_CAU buttons xuất hiện
- ✅ Timeline: "Đã hoàn thành yêu cầu vào [timestamp]"

#### 🔔 Notifications

- ✅ User A (NguoiGui) nhận notification:
  - "Yêu cầu #TC-XL-02 đã được hoàn thành"
  - "Vui lòng đánh giá chất lượng xử lý"
- ✅ Socket event: `yeuCauCompleted`

### 🐛 Edge Cases

- ⚠️ HOAN_THANH với tiến độ < 100% → Tự động set 100%
- ⚠️ HOAN_THANH trước ThoiGianHen → Tính thời gian hoàn thành sớm

### 📸 UI Screenshots to Verify

- [ ] Badge DA_HOAN_THANH màu xanh lá (success)
- [ ] Button "Đánh Giá" xuất hiện cho NguoiGui
- [ ] Timeline hiển thị thời gian hoàn thành

---

## TC-XL-03: NguoiXuLy TU_CHOI yêu cầu → TU_CHOI (trong khi xử lý)

### 📝 Mô Tả

Người xử lý từ chối yêu cầu trong quá trình xử lý (phát hiện không thể giải quyết)

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc666...",
    "TieuDe": "TC-XL-03: Yêu cầu không thể thực hiện",
    "TrangThai": "DANG_XU_LY",
    "NguoiXuLyID": "user_c_id",
    "TienDoHoanThanh": 20
  }
}
```

### 🎬 Test Steps

1. Login `test_duocdieuphoi`
2. View detail "TC-XL-03"
3. Click "Từ Chối"
4. Fill TuChoiDialog:
   - LyDoTuChoiID: "Lý do khác"
   - GhiChu: **BẮT BUỘC**: "Phát hiện thiết bị cần thay thế hoàn toàn, không thể sửa chữa"
5. Submit

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "DANG_XU_LY",
  TienDoHoanThanh: 20,
  LyDoTuChoiID: null
}

// After
{
  TrangThai: "TU_CHOI",
  TienDoHoanThanh: 20, // Giữ nguyên
  LyDoTuChoiID: "lydo_khac_id",
  SnapshotLyDoTuChoi: {...},
  GhiChuTuChoi: "Phát hiện thiết bị cần thay thế...",
  ThoiGianTuChoi: ISODate("2025-12-08T...")
}
```

#### 🖥️ UI Changes

- ✅ Badge: DANG_XU_LY → TU_CHOI (error/đỏ)
- ✅ Hiển thị lý do từ chối rõ ràng
- ✅ NguoiGui có button "Appeal"

#### 🔔 Notifications

- ✅ User A: "Yêu cầu đã bị từ chối. Lý do: ..."

---

## TC-XL-04: NguoiXuLy CHUYEN_TIEP sang người khác

### 📝 Mô Tả

Người xử lý chuyển tiếp yêu cầu sang người khác xử lý tiếp

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc777...",
    "TrangThai": "DANG_XU_LY",
    "NguoiXuLyID": "user_c_id",
    "TienDoHoanThanh": 40
  }
}
```

### 🎬 Test Steps

1. Login `test_duocdieuphoi`
2. View detail YeuCau DANG_XU_LY
3. Click "Chuyển Tiếp"
4. Fill ChuyenTiepDialog:
   - LoaiNguoiNhan: "Gửi đến Cá Nhân"
   - NguoiNhanID: User E (test_xulykhac)
   - GhiChu: "Cần chuyên gia về điện tử xử lý tiếp"
5. Submit

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "DANG_XU_LY",
  LoaiNguoiNhan: "GUI_DEN_KHOA",
  KhoaNhanID: "khoa_noi_id",
  NguoiNhanID: null,
  NguoiXuLyID: "user_c_id"
}

// After
{
  TrangThai: "MOI", // ← Back to MOI!
  LoaiNguoiNhan: "GUI_DEN_CA_NHAN",
  KhoaNhanID: null,
  NguoiNhanID: "user_e_id", // ← New recipient
  NguoiXuLyID: null, // ← Reset
  ThoiGianHen: null, // ← Reset
  ThoiGianBatDau: null, // ← Reset (hoặc giữ history)
  TienDoHoanThanh: 40, // Giữ tiến độ hiện tại (hoặc reset về 0)
  LichSuChuyenTiep: [...]
}
```

#### 🖥️ UI Changes

- ✅ Badge: DANG_XU_LY → MOI
- ✅ User E nhận yêu cầu mới
- ✅ Timeline: "Đã chuyển tiếp từ User C sang User E"

#### 🔔 Notifications

- ✅ User E: "Bạn nhận được yêu cầu từ User C (tiến độ hiện tại: 40%)"
- ✅ User A: "Yêu cầu đã được chuyển tiếp sang User E"

### 🐛 Edge Cases

- ⚠️ Business Logic Question: CHUYEN_TIEP có reset về MOI hay giữ DANG_XU_LY?
  - **Option 1**: Reset về MOI (người mới phải TIEP_NHAN lại)
  - **Option 2**: Giữ DANG_XU_LY (người mới tiếp tục xử lý)
  - → Cần clarify với team!

---

## TC-XL-05: NguoiGui BAO_CAO_SU_CO (Escalate)

### 📝 Mô Tả

Người gửi báo cáo sự cố khi yêu cầu đang xử lý quá chậm hoặc không hài lòng

### 🎭 Actors

- **Người thực hiện**: User A (test_nguoigui) - NguoiGui
- **Người xử lý**: User C (test_duocdieuphoi)
- **Quality Manager**: Sẽ nhận báo cáo sự cố

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc888...",
    "TieuDe": "TC-XL-05: Yêu cầu xử lý quá chậm",
    "TrangThai": "DANG_XU_LY",
    "NguoiGuiID": "user_a_id",
    "NguoiXuLyID": "user_c_id",
    "ThoiGianHen": "2025-12-07T10:00:00Z", // ← ĐÃ QUÁ HẠN!
    "TienDoHoanThanh": 10
  }
}
```

### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_nguoigui`
2. **Navigate**: Vào "Yêu cầu của tôi"
3. **View Detail**: Click vào "TC-XL-05: Yêu cầu xử lý quá chậm"
4. **Verify UI**:
   - Badge "DANG_XU_LY" với warning icon (quá hạn)
   - Hiển thị: "Quá hạn: 1 ngày"
   - Button "Báo Cáo Sự Cố" (màu đỏ)
5. **Action**: Click "Báo Cáo Sự Cố"
6. **Fill Form** (BaoCaoSuCoDialog):
   - **NoiDungSuCo**: "Yêu cầu đã quá hạn 1 ngày nhưng tiến độ mới 10%, không có phản hồi từ người xử lý"
   - **MucDoNghiemTrong**: "Cao" (dropdown)
7. **Submit**: Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// YeuCau collection
{
  ...existing fields,
  BaoCaoSuCoID: "suco_123_id" // ← Reference to new BaoCaoSuCo
}

// BaoCaoSuCo collection (new record)
{
  _id: "suco_123_id",
  YeuCauID: "673abc888...",
  NguoiBaoCaoID: "user_a_id",
  NoiDung: "Yêu cầu đã quá hạn 1 ngày...",
  MucDoNghiemTrong: "CAO",
  TrangThai: "MOI", // Sự cố mới
  NguoiXuLyID: null,
  createdAt: ISODate("2025-12-08T...")
}
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã báo cáo sự cố. Phòng Quản lý chất lượng sẽ xem xét"
- ✅ Badge YeuCau có icon cảnh báo thêm: "Có sự cố được báo cáo"
- ✅ Timeline: "Đã báo cáo sự cố vào [timestamp]"
- ✅ Link đến BaoCaoSuCo detail page

#### 🔔 Notifications

- ✅ Quality Manager nhận notification:
  - "Yêu cầu #TC-XL-05 có sự cố được báo cáo"
  - "Mức độ: Cao"
  - "Nội dung: Yêu cầu đã quá hạn..."
- ✅ User C (NguoiXuLy) nhận notification:
  - "Yêu cầu #TC-XL-05 đã được báo cáo sự cố"
- ✅ DieuPhoi (nếu có) nhận notification

### 🚫 Negative Scenarios

- ❌ Nếu báo cáo sự cố nhiều lần cho cùng 1 YeuCau → Warning hoặc prevent duplicate

### 🐛 Edge Cases

- ⚠️ Business Logic: BAO_CAO_SU_CO có chuyển YeuCau sang trạng thái khác không?
  - **Option 1**: Giữ nguyên DANG_XU_LY, chỉ tạo BaoCaoSuCo riêng
  - **Option 2**: Chuyển sang trạng thái SU_CO
  - → Cần clarify!
- ⚠️ BAO_CAO_SU_CO khi chưa quá hạn → Vẫn cho phép (lý do khác: chất lượng kém, thái độ, v.v.)

### 📸 UI Screenshots to Verify

- [ ] Button "Báo Cáo Sự Cố" màu đỏ, rõ ràng
- [ ] BaoCaoSuCoDialog với FTextField + Dropdown mức độ
- [ ] Badge warning khi quá hạn
- [ ] Link đến BaoCaoSuCo detail

---

## TC-XL-06: Admin có tất cả actions của NguoiXuLy

### 📝 Mô Tả

Admin có thể thực hiện tất cả actions của NguoiXuLy

### 🎭 Actors

- **Người thực hiện**: User Admin (test_admin)

### 📊 Preconditions

- YeuCau DANG_XU_LY bất kỳ

### 🎬 Test Steps

1. Login `test_admin`
2. View detail YeuCau DANG_XU_LY
3. Verify UI: 4 buttons hiển thị:
   - Cập Nhật Tiến Độ
   - Hoàn Thành
   - Từ Chối
   - Chuyển Tiếp

### ✅ Expected Results

- ✅ availableActions = ["CAP_NHAT_TIEN_DO", "HOAN_THANH", "TU_CHOI", "CHUYEN_TIEP"]
- ✅ Admin có thể thực hiện tất cả actions thành công

### 📸 UI Screenshots to Verify

- [ ] Admin thấy tất cả buttons của NguoiXuLy

---

## 📊 Summary DANG_XU_LY Tests

**Tổng cộng: 6 Test Cases**

- ✅ NguoiXuLy actions: 4 TC (CAP_NHAT_TIEN_DO, HOAN_THANH, TU_CHOI, CHUYEN_TIEP)
- ✅ NguoiGui action: 1 TC (BAO_CAO_SU_CO)
- ✅ Admin: 1 TC (Full access)

**Coverage**:

- ✅ Progress tracking (0-100%)
- ✅ Completion flow → DA_HOAN_THANH
- ✅ Rejection during processing
- ✅ Reassignment
- ✅ Incident reporting (escalation)

**Business Logic Questions** (cần clarify):

1. CHUYEN_TIEP: Reset về MOI hay giữ DANG_XU_LY?
2. BAO_CAO_SU_CO: Có chuyển trạng thái YeuCau không?
3. CHUYEN_TIEP: Có reset TienDoHoanThanh về 0 không?

**Next**: Continue with TC-HT-01 (DA_HOAN_THANH status)
