# 📝 TEST CASES - DA_HOAN_THANH + DA_DONG + TU_CHOI (11 TC)

## A. DA_HOAN_THANH Status (6 Test Cases)

### Overview

Khi YeuCau ở trạng thái **DA_HOAN_THANH**:

- **NguoiGui** có actions: DANH_GIA (rating), DONG_YEU_CAU
- **Admin** có thể DONG_YEU_CAU thay cho NguoiGui

---

## TC-HT-01: NguoiGui DANH_GIA với 5 sao (không cần NhanXet)

### 📝 Mô Tả

Người gửi đánh giá yêu cầu đã hoàn thành với 5 sao (không bắt buộc nhận xét)

### 🎭 Actors

- **Người thực hiện**: User A (test_nguoigui)
- **Người xử lý**: User C (test_duocdieuphoi)

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc999...",
    "TieuDe": "TC-HT-01: Đã sửa xong máy X-quang",
    "TrangThai": "DA_HOAN_THANH",
    "NguoiGuiID": "user_a_id",
    "NguoiXuLyID": "user_c_id",
    "ThoiGianHoanThanh": "2025-12-08T10:00:00Z",
    "DanhGia": null,
    "NhanXet": null
  }
}
```

### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_nguoigui`
2. **Navigate**: Vào "Yêu cầu của tôi" → Tab "Đã hoàn thành"
3. **View Detail**: Click vào "TC-HT-01: Đã sửa xong..."
4. **Verify UI**:
   - Badge "DA_HOAN_THANH" màu success (xanh lá)
   - Hiển thị: "Thời gian hoàn thành: 08/12/2025 10:00"
   - Có 2 buttons: **Đánh Giá**, **Đóng Yêu Cầu**
   - Chưa có rating stars (vì chưa đánh giá)
5. **Action**: Click nút "Đánh Giá"
6. **Fill Form** (StarRatingDialog):
   - **DanhGia**: Click vào 5 stars ⭐⭐⭐⭐⭐
   - **NhanXet**: (Optional, có thể bỏ trống)
   - Alert warning **KHÔNG** hiển thị (vì >= 3 stars)
7. **Submit**: Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "DA_HOAN_THANH",
  DanhGia: null,
  NhanXet: null
}

// After
{
  TrangThai: "DA_HOAN_THANH", // Không đổi
  DanhGia: 5,
  NhanXet: "", // Hoặc null
  updatedAt: ISODate("2025-12-08T...")
}
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Cảm ơn bạn đã đánh giá!"
- ✅ Hiển thị rating: 5 stars vàng ⭐⭐⭐⭐⭐
- ✅ Button "Đánh Giá" biến mất (đã đánh giá rồi)
- ✅ Chỉ còn button "Đóng Yêu Cầu"
- ✅ Timeline: "Đã đánh giá 5 sao vào [timestamp]"

#### 🔔 Notifications

- ✅ User C (NguoiXuLy) nhận notification:
  - "Yêu cầu #TC-HT-01 đã được đánh giá 5 sao"
- ✅ Socket event: `yeuCauRated`

### 🚫 Negative Scenarios

- ❌ Đánh giá 2 lần → Button "Đánh Giá" không hiển thị sau lần 1

### 📸 UI Screenshots to Verify

- [ ] StarRatingDialog với 5 stars clickable
- [ ] Alert warning KHÔNG hiển thị
- [ ] NhanXet TextField không required (no red asterisk)
- [ ] Submit button enabled ngay khi click stars

---

## TC-HT-02: NguoiGui DANH_GIA với 2 sao (BẮT BUỘC NhanXet)

### 📝 Mô Tả

Người gửi đánh giá với < 3 sao → BẮT BUỘC phải nhập nhận xét

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc1010...",
    "TieuDe": "TC-HT-02: Xử lý không hài lòng",
    "TrangThai": "DA_HOAN_THANH",
    "NguoiGuiID": "user_a_id",
    "DanhGia": null
  }
}
```

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail "TC-HT-02"
3. Click "Đánh Giá"
4. **Fill Form** (StarRatingDialog):
   - **DanhGia**: Click 2 stars ⭐⭐
   - **Alert warning** xuất hiện:
     - "⚠️ Vui lòng cho biết lý do đánh giá dưới 3 sao"
   - **NhanXet**: TextField chuyển thành **required** (màu đỏ)
   - Label: "Nhận xét (Bắt buộc)"
5. **Try Submit** (không điền NhanXet):
   - Click "Xác Nhận" → **Button disabled** (canSubmit = false)
6. **Fill NhanXet**:
   - "Xử lý quá chậm, quá hạn 2 ngày"
7. **Submit**: Click "Xác Nhận" (now enabled)

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// After
{
  DanhGia: 2,
  NhanXet: "Xử lý quá chậm, quá hạn 2 ngày"
}
```

#### 🖥️ UI Changes

- ✅ Toast success: "Cảm ơn bạn đã đánh giá!"
- ✅ Hiển thị: 2 stars ⭐⭐ + Nhận xét rõ ràng
- ✅ Timeline: "Đã đánh giá 2 sao vào [timestamp]"

#### 🔔 Notifications

- ✅ User C (NguoiXuLy): "Yêu cầu #TC-HT-02 đã được đánh giá 2 sao"
- ✅ DieuPhoi/Manager nhận notification (nếu rating < 3)

### 🚫 Negative Scenarios

- ❌ Rating < 3 + NhanXet rỗng → Submit button **disabled**
- ❌ Validation error: "Vui lòng nhập nhận xét khi đánh giá dưới 3 sao"

### 📸 UI Screenshots to Verify

- [ ] Alert warning màu cam/vàng khi rating < 3
- [ ] TextField NhanXet chuyển thành required (label có dấu \*)
- [ ] TextField border màu đỏ (error state)
- [ ] Submit button disabled khi chưa điền NhanXet

---

## TC-HT-03: NguoiGui DANH_GIA với 1 sao + NhanXet chi tiết

### 📝 Mô Tả

Đánh giá 1 sao với nhận xét rất chi tiết

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail YeuCau DA_HOAN_THANH
3. Click "Đánh Giá"
4. Fill: 1 star ⭐ + NhanXet dài (>100 ký tự)
5. Submit

### ✅ Expected Results

- ✅ DanhGia = 1
- ✅ NhanXet saved
- ✅ Notification đến Manager với priority cao

---

## TC-HT-04: NguoiGui DONG_YEU_CAU sau khi đánh giá → DA_DONG

### 📝 Mô Tả

Người gửi đóng yêu cầu sau khi đã đánh giá

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc1111...",
    "TieuDe": "TC-HT-04: Đã đánh giá, sẵn sàng đóng",
    "TrangThai": "DA_HOAN_THANH",
    "NguoiGuiID": "user_a_id",
    "DanhGia": 5,
    "NhanXet": "Rất hài lòng"
  }
}
```

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail "TC-HT-04"
3. Verify UI:
   - Hiển thị rating: 5 stars
   - Button "Đánh Giá" KHÔNG hiển thị (đã đánh giá)
   - Button "Đóng Yêu Cầu" hiển thị
4. Click "Đóng Yêu Cầu"
5. Confirm dialog: "Sau khi đóng, bạn chỉ có thể mở lại trong vòng 7 ngày"
6. Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "DA_HOAN_THANH",
  NgayDong: null
}

// After
{
  TrangThai: "DA_DONG",
  NgayDong: ISODate("2025-12-08T..."), // now
  updatedAt: ISODate("2025-12-08T...")
}
```

#### 🖥️ UI Changes

- ✅ Toast success: "Đã đóng yêu cầu"
- ✅ Badge: DA_HOAN_THANH → DA_DONG (màu xám/default)
- ✅ Hiển thị: "Ngày đóng: 08/12/2025 14:30"
- ✅ Hiển thị: "Có thể mở lại trước: 15/12/2025 14:30" (7 ngày)
- ✅ Button "Mở Lại" xuất hiện (nếu < 7 ngày)
- ✅ Timeline: "Đã đóng yêu cầu vào [timestamp]"

#### 🔔 Notifications

- ✅ User C (NguoiXuLy): "Yêu cầu #TC-HT-04 đã được đóng"

### 📸 UI Screenshots to Verify

- [ ] Badge DA_DONG màu xám
- [ ] Countdown "Còn X ngày để mở lại"
- [ ] Button "Mở Lại" với Chip hiển thị số ngày còn lại

---

## TC-HT-05: NguoiGui XEM lại yêu cầu (chưa đánh giá)

### 📝 Mô Tả

Người gửi xem lại yêu cầu DA_HOAN_THANH nhưng chưa đánh giá

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail YeuCau DA_HOAN_THANH (DanhGia = null)
3. Verify UI:
   - Badge DA_HOAN_THANH
   - 2 buttons: "Đánh Giá", "Đóng Yêu Cầu"
   - Hiển thị message: "Vui lòng đánh giá để giúp chúng tôi cải thiện chất lượng dịch vụ"

### ✅ Expected Results

- ✅ NguoiGui thấy reminder đánh giá
- ✅ Có thể đóng mà không cần đánh giá (optional)

---

## TC-HT-06: Admin DONG_YEU_CAU thay cho NguoiGui

### 📝 Mô Tả

Admin có thể đóng yêu cầu DA_HOAN_THANH thay cho NguoiGui

### 🎭 Actors

- **Người thực hiện**: User Admin (test_admin)

### 📊 Preconditions

- YeuCau DA_HOAN_THANH (NguoiGui chưa đóng)

### 🎬 Test Steps

1. Login `test_admin`
2. View detail YeuCau DA_HOAN_THANH
3. Verify UI: Button "Đóng Yêu Cầu" hiển thị
4. Click "Đóng Yêu Cầu"
5. Confirm

### ✅ Expected Results

- ✅ TrangThai → DA_DONG
- ✅ Notification đến NguoiGui: "Yêu cầu của bạn đã được đóng bởi Admin"

---

## B. DA_DONG Status (3 Test Cases)

---

## TC-DONG-01: NguoiGui MO_LAI trong vòng 7 ngày (còn 5 ngày)

### 📝 Mô Tả

Người gửi mở lại yêu cầu đã đóng trong vòng 7 ngày

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc1212...",
    "TieuDe": "TC-DONG-01: Cần mở lại",
    "TrangThai": "DA_DONG",
    "NguoiGuiID": "user_a_id",
    "NgayDong": "2025-12-03T10:00:00Z", // ← 5 ngày trước
    "DanhGia": 5
  }
}
```

### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_nguoigui`
2. **Navigate**: Vào "Yêu cầu của tôi" → Tab "Đã đóng"
3. **View Detail**: Click vào "TC-DONG-01: Cần mở lại"
4. **Verify UI**:
   - Badge "DA_DONG" màu xám
   - Hiển thị: "Ngày đóng: 03/12/2025 10:00"
   - Hiển thị Chip: "Còn 2 ngày để mở lại" (màu xanh/success)
   - Button "Mở Lại" **enabled**
5. **Action**: Click "Mở Lại"
6. **Fill Form** (MoLaiDialog):
   - **LyDoMoLai**: TextField (required, min 10 chars)
   - Ví dụ: "Vấn đề vẫn chưa được giải quyết hoàn toàn, cần xử lý thêm"
   - Hiển thị: "Còn 2 ngày để mở lại" với Chip màu xanh
7. **Submit**: Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "DA_DONG",
  NgayDong: ISODate("2025-12-03T10:00:00Z")
}

// After
{
  TrangThai: "DA_HOAN_THANH", // ← Back to DA_HOAN_THANH
  NgayDong: null, // ← Reset
  LyDoMoLai: "Vấn đề vẫn chưa được...",
  ThoiGianMoLai: ISODate("2025-12-08T..."),
  // LichSuMoLai array:
  LichSuMoLai: [
    {
      LyDo: "Vấn đề vẫn chưa được...",
      ThoiGian: ISODate("2025-12-08T..."),
      NguoiMoLaiID: "user_a_id"
    }
  ]
}
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã mở lại yêu cầu"
- ✅ Badge: DA_DONG → DA_HOAN_THANH
- ✅ Timeline: "Đã mở lại yêu cầu vào [timestamp]. Lý do: Vấn đề vẫn chưa..."
- ✅ Button "Mở Lại" biến mất
- ✅ Button "Đóng Yêu Cầu" xuất hiện lại

#### 🔔 Notifications

- ✅ User C (NguoiXuLy): "Yêu cầu #TC-DONG-01 đã được mở lại bởi người gửi"
- ✅ DieuPhoi: "Yêu cầu #TC-DONG-01 đã được mở lại"

### 🚫 Negative Scenarios

- ❌ Nếu LyDoMoLai < 10 ký tự → Validation error
- ❌ Nếu LyDoMoLai rỗng → Validation error: "Vui lòng nhập lý do mở lại"

### 📸 UI Screenshots to Verify

- [ ] Chip "Còn X ngày" màu xanh (>2 ngày), màu vàng (≤2 ngày)
- [ ] MoLaiDialog với TextField required
- [ ] Timeline hiển thị lịch sử mở lại

---

## TC-DONG-02: NguoiGui MO_LAI vào ngày cuối (còn 0 ngày)

### 📝 Mô Tả

Người gửi mở lại yêu cầu vào ngày cuối cùng (đúng 7 ngày)

### 📊 Preconditions

```json
{
  "YeuCau": {
    "NgayDong": "2025-12-01T10:00:00Z" // ← Đúng 7 ngày trước
  }
}
```

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail YeuCau DA_DONG
3. Verify UI:
   - Chip: "Còn 0 ngày" (màu đỏ/error)
   - Button "Mở Lại" vẫn **enabled** (vì còn trong ngày cuối)
4. Click "Mở Lại"
5. Fill LyDoMoLai
6. Submit

### ✅ Expected Results

- ✅ Vẫn mở lại được (trong vòng 7 ngày)
- ✅ Chip màu đỏ cảnh báo

### 📸 UI Screenshots to Verify

- [ ] Chip màu đỏ: "Còn 0 ngày"
- [ ] Button vẫn enabled

---

## TC-DONG-03: NguoiGui không thể MO_LAI sau 7 ngày

### 📝 Mô Tả

Người gửi không thể mở lại yêu cầu sau 7 ngày

### 📊 Preconditions

```json
{
  "YeuCau": {
    "NgayDong": "2025-11-28T10:00:00Z" // ← 10 ngày trước (>7 ngày)
  }
}
```

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail YeuCau DA_DONG
3. Verify UI:
   - Chip: "Đã quá hạn mở lại" (màu đỏ/error)
   - Button "Mở Lại" **disabled** hoặc không hiển thị
   - Tooltip: "Chỉ có thể mở lại trong vòng 7 ngày kể từ khi đóng"

### ✅ Expected Results

- ✅ Button disabled
- ✅ availableActions không có "MO_LAI"

### 🚫 Negative Scenarios

- ❌ Nếu cố gọi API `MO_LAI` → 400 Bad Request: "Đã quá thời hạn mở lại (7 ngày)"

### 📸 UI Screenshots to Verify

- [ ] Button disabled với tooltip rõ ràng
- [ ] Chip "Đã quá hạn" màu đỏ

---

## C. TU_CHOI Status (2 Test Cases)

---

## TC-TC-01: NguoiGui APPEAL yêu cầu bị từ chối → về MOI

### 📝 Mô Tả

Người gửi appeal (khiếu nại) yêu cầu bị từ chối

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc1313...",
    "TieuDe": "TC-TC-01: Bị từ chối không đúng",
    "TrangThai": "TU_CHOI",
    "NguoiGuiID": "user_a_id",
    "LyDoTuChoiID": "lydo_khong_thuoc_pham_vi_id",
    "SnapshotLyDoTuChoi": {
      "MaLyDo": "KHONG_THUOC_PHAM_VI",
      "TenLyDo": "Không thuộc phạm vi xử lý"
    },
    "GhiChuTuChoi": "Yêu cầu này thuộc trách nhiệm của Khoa Hành Chính"
  }
}
```

### 🎬 Test Steps

1. **Login**: Đăng nhập với `test_nguoigui`
2. **Navigate**: Vào "Yêu cầu của tôi" → Tab "Bị từ chối"
3. **View Detail**: Click vào "TC-TC-01: Bị từ chối không đúng"
4. **Verify UI**:
   - Badge "TU_CHOI" màu error (đỏ)
   - Hiển thị box lý do từ chối (error box):
     - "Lý do từ chối": Không thuộc phạm vi xử lý
     - "Ghi chú": Yêu cầu này thuộc trách nhiệm của Khoa Hành Chính
     - "Thời gian từ chối": 08/12/2025 10:00
   - Button "Khiếu Nại" (Appeal) hiển thị
5. **Action**: Click "Khiếu Nại"
6. **Fill Form** (AppealDialog):
   - Hiển thị lý do từ chối cũ (read-only box)
   - **LyDoAppeal**: TextField (required, min 10 chars)
   - Ví dụ: "Yêu cầu này chính xác thuộc phạm vi của khoa Nội, vì liên quan đến thiết bị y tế chuyên khoa"
   - Info box: "Sau khi gửi khiếu nại, yêu cầu sẽ được xem xét lại"
7. **Submit**: Click "Xác Nhận"

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{
  TrangThai: "TU_CHOI",
  LyDoAppeal: null,
  ThoiGianAppeal: null
}

// After
{
  TrangThai: "MOI", // ← Back to MOI!
  LyDoAppeal: "Yêu cầu này chính xác thuộc...",
  ThoiGianAppeal: ISODate("2025-12-08T..."),
  // Reset các fields liên quan đến từ chối:
  LyDoTuChoiID: null, // ← Reset (hoặc giữ history)
  GhiChuTuChoi: null,
  ThoiGianTuChoi: null,
  // LichSuAppeal array:
  LichSuAppeal: [
    {
      LyDo: "Yêu cầu này chính xác thuộc...",
      ThoiGian: ISODate("2025-12-08T..."),
      NguoiAppealID: "user_a_id",
      LyDoTuChoiCu: {
        TenLyDo: "Không thuộc phạm vi xử lý",
        GhiChu: "Yêu cầu này thuộc..."
      }
    }
  ]
}
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Toast success: "Đã gửi khiếu nại. Yêu cầu sẽ được xem xét lại"
- ✅ Badge: TU_CHOI (đỏ) → MOI (info/xanh)
- ✅ Box lý do từ chối biến mất
- ✅ Timeline: "Đã gửi khiếu nại vào [timestamp]. Lý do: ..."
- ✅ Button "Khiếu Nại" biến mất
- ✅ NguoiGui có button "Hủy Yêu Cầu" lại

#### 🔔 Notifications

- ✅ DieuPhoi (người đã từ chối) nhận notification:
  - "Yêu cầu #TC-TC-01 đã được khiếu nại bởi người gửi"
  - "Lý do khiếu nại: Yêu cầu này chính xác thuộc..."
  - Link xem chi tiết
- ✅ Admin/Manager nhận notification (nếu có workflow phê duyệt)

### 🚫 Negative Scenarios

- ❌ Nếu LyDoAppeal < 10 ký tự → Validation error
- ❌ Nếu LyDoAppeal rỗng → Validation error: "Vui lòng nhập lý do khiếu nại"

### 🐛 Edge Cases

- ⚠️ Appeal nhiều lần: Sau khi appeal → MOI → bị TU_CHOI lại → Appeal lần 2?
  - Cần limit số lần appeal (ví dụ: tối đa 3 lần)
- ⚠️ Business Logic: APPEAL có reset về MOI hay cần DieuPhoi approve?

### 📸 UI Screenshots to Verify

- [ ] AppealDialog hiển thị lý do từ chối cũ rõ ràng
- [ ] TextField LyDoAppeal required với min 10 chars
- [ ] Timeline hiển thị lịch sử appeal
- [ ] Badge đổi từ đỏ → xanh sau appeal

---

## TC-TC-02: NguoiGui XEM lý do từ chối (không Appeal)

### 📝 Mô Tả

Người gửi xem lý do từ chối nhưng chấp nhận, không appeal

### 📊 Preconditions

- YeuCau TU_CHOI với lý do rõ ràng

### 🎬 Test Steps

1. Login `test_nguoigui`
2. View detail YeuCau TU_CHOI
3. Verify UI:
   - Box lý do từ chối hiển thị đầy đủ
   - Button "Khiếu Nại" hiển thị
4. Không click "Khiếu Nại", chỉ đọc thông tin

### ✅ Expected Results

- ✅ NguoiGui thấy đầy đủ thông tin từ chối
- ✅ Có option để Appeal nếu muốn
- ✅ Nếu không Appeal, YeuCau vẫn ở trạng thái TU_CHOI

### 📸 UI Screenshots to Verify

- [ ] Error box hiển thị lý do từ chối rõ ràng
- [ ] Thời gian từ chối
- [ ] Người từ chối (nếu có)

---

## 📊 Summary

**Tổng cộng: 11 Test Cases**

### DA_HOAN_THANH (6 TC):

- ✅ Rating 5 sao (optional NhanXet)
- ✅ Rating < 3 sao (required NhanXet) - **Critical validation**
- ✅ Rating 1 sao chi tiết
- ✅ Đóng yêu cầu sau rating
- ✅ Xem yêu cầu chưa rating
- ✅ Admin đóng yêu cầu

### DA_DONG (3 TC):

- ✅ Mở lại trong vòng 7 ngày (còn 5 ngày)
- ✅ Mở lại ngày cuối (còn 0 ngày)
- ✅ **KHÔNG** mở lại sau 7 ngày - **Critical boundary**

### TU_CHOI (2 TC):

- ✅ Appeal yêu cầu bị từ chối → MOI
- ✅ Xem lý do từ chối

**Coverage**:

- ✅ StarRatingDialog với conditional validation (<3 stars)
- ✅ MoLaiDialog với time limit (7 ngày) + countdown
- ✅ AppealDialog với lý do từ chối cũ
- ✅ Timeline tracking (rating, đóng, mở lại, appeal)
- ✅ Notifications cho tất cả actions

**Next**: Edge Cases + Negative Tests + Notifications (11 TC)
