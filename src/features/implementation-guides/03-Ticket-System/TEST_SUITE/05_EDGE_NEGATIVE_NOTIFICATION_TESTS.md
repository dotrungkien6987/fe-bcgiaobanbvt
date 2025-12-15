# 📝 TEST CASES - Edge Cases, Negative Tests, Notifications (13 TC)

## A. Edge Cases (7 Test Cases)

### Overview

Test các tình huống biên giới, race conditions, concurrency, và business logic đặc biệt

---

## TC-EDGE-01: Race Condition - 2 người TIEP_NHAN cùng lúc

### 📝 Mô Tả

2 người (DieuPhoi + NguoiDuocDieuPhoi) cùng click TIEP_NHAN 1 yêu cầu MOI đồng thời

### 🎭 Actors

- **User B** (test_dieuphoi) - DieuPhoi
- **User C** (test_duocdieuphoi) - NguoiDuocDieuPhoi
- Cùng khoa

### 📊 Preconditions

```json
{
  "YeuCau": {
    "_id": "673abc_edge01",
    "TrangThai": "MOI",
    "LoaiNguoiNhan": "GUI_DEN_KHOA",
    "KhoaNhanID": "khoa_noi_id",
    "updatedAt": "2025-12-08T10:00:00Z"
  }
}
```

### 🎬 Test Steps

1. **Setup**: 2 browsers (hoặc 2 devices)
   - Browser 1: Login `test_dieuphoi`
   - Browser 2: Login `test_duocdieuphoi`
2. **Navigate**: Cả 2 vào detail page của YeuCau MOI
3. **Simultaneous Action**:
   - Browser 1: Click "Tiếp Nhận" → Fill ThoiGianHen = 10/12/2025 10:00
   - Browser 2: Click "Tiếp Nhận" → Fill ThoiGianHen = 11/12/2025 14:00
   - **QUAN TRỌNG**: Click "Xác Nhận" cùng lúc (trong vòng 1 giây)

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Chỉ 1 người thành công (ví dụ User B nhanh hơn)
{
  TrangThai: "DANG_XU_LY",
  NguoiXuLyID: "user_b_id", // ← User B
  ThoiGianHen: ISODate("2025-12-10T10:00:00Z"),
  updatedAt: ISODate("2025-12-08T10:00:05Z") // ← New timestamp
}
```

#### 🖥️ UI Changes

**Browser 1 (User B - Success)**:

- ✅ Dialog đóng
- ✅ Toast success: "Đã tiếp nhận yêu cầu"
- ✅ Badge → DANG_XU_LY
- ✅ NguoiXuLy: User B

**Browser 2 (User C - Conflict)**:

- ❌ Toast error: "Yêu cầu đã được người khác tiếp nhận. Vui lòng tải lại trang"
- ❌ Dialog vẫn mở (hoặc đóng với error)
- ✅ Socket update: Badge tự động update → DANG_XU_LY
- ✅ availableActions update → User C không còn TIEP_NHAN

#### 🔔 Notifications

- ✅ NguoiGui: "Yêu cầu đã được tiếp nhận bởi User B"
- ✅ Socket broadcast → Browser 2 nhận update real-time

### 🐛 Implementation Check

- ⚠️ **Optimistic Locking**: Backend phải check `updatedAt` hoặc `__v` (version)
- ⚠️ Frontend send `If-Unmodified-Since` header
- ⚠️ Backend return `409 Conflict` hoặc `VERSION_CONFLICT` error

### 📸 UI Screenshots to Verify

- [ ] Browser 2 hiển thị error message rõ ràng
- [ ] Socket update real-time trong Browser 2
- [ ] No data corruption in DB

---

## TC-EDGE-02: Optimistic Locking - Edit Conflict

### 📝 Mô Tả

User A đang xem YeuCau, User B cập nhật tiến độ, User A cố cập nhật tiếp

### 🎬 Test Steps

1. **Browser 1**: User A view YeuCau DANG_XU_LY (updatedAt = T1)
2. **Browser 2**: User B CAP_NHAT_TIEN_DO → 50% (updatedAt = T2)
3. **Browser 1**: User A click "Cập Nhật Tiến Độ" → 60% → Submit

### ✅ Expected Results

- ❌ Browser 1: Error "Dữ liệu đã bị thay đổi. Vui lòng tải lại"
- ✅ Auto-refresh data in Browser 1
- ✅ User A thấy tiến độ 50% (của User B)

---

## TC-EDGE-03: Rate Limiting - TIEP_NHAN quá 3 lần/giờ

### 📝 Mô Tả

User tiếp nhận quá nhiều yêu cầu trong 1 giờ → rate limit

### 📊 Preconditions

- User C đã TIEP_NHAN 3 yêu cầu trong 1 giờ qua
- Thời gian:
  - 10:05 → YeuCau #1
  - 10:20 → YeuCau #2
  - 10:45 → YeuCau #3
- Hiện tại: 10:50

### 🎬 Test Steps

1. Login `test_duocdieuphoi`
2. View YeuCau MOI thứ 4
3. Click "Tiếp Nhận"
4. Fill form → Submit

### ✅ Expected Results

- ❌ Toast error: "Bạn đã tiếp nhận quá nhiều yêu cầu trong 1 giờ qua. Vui lòng thử lại sau 15 phút"
- ❌ Backend: 429 Too Many Requests
- ✅ Hiển thị thời gian có thể tiếp nhận lại: "11:05"

### 🐛 Edge Case

- ⚠️ Nếu backend không implement rate limit → Test này sẽ fail
- ⚠️ Admin có bị rate limit không? (có thể exempt)

---

## TC-EDGE-04: MO_LAI đúng lúc 00:00:00 ngày thứ 7

### 📝 Mô Tả

Mở lại yêu cầu đúng vào giây cuối cùng của ngày thứ 7

### 📊 Preconditions

```json
{
  "YeuCau": {
    "TrangThai": "DA_DONG",
    "NgayDong": "2025-12-01T00:00:00Z"
  }
}
```

- Ngày test: **2025-12-08T00:00:00Z** (đúng 7 ngày)

### 🎬 Test Steps

1. Login `test_nguoigui` vào lúc 2025-12-07T23:59:50Z
2. View detail YeuCau DA_DONG
3. Verify: "Còn 0 ngày" (còn 10 giây)
4. Click "Mở Lại" lúc 23:59:55Z
5. Fill form nhanh → Submit lúc 23:59:58Z

### ✅ Expected Results

- ✅ Cho phép mở lại (vì < 7 ngày)
- ✅ TrangThai → DA_HOAN_THANH

### 🐛 Boundary Test

- ⚠️ Submit lúc 00:00:01Z (ngày thứ 8) → Fail: "Đã quá thời hạn"
- ⚠️ Backend check: `(now - NgayDong) <= 7 * 24 * 60 * 60 * 1000` ms

---

## TC-EDGE-05: CHUYEN_TIEP vòng lặp A → B → A

### 📝 Mô Tả

Chuyển tiếp vòng lặp: User A → User B → User A

### 🎬 Test Steps

1. YeuCau MOI: NguoiNhanID = User A
2. User A CHUYEN_TIEP → User B
3. User B CHUYEN_TIEP → User A (lại)

### ✅ Expected Results

**Option 1** (Allow loop):

- ✅ Cho phép, track history trong LichSuChuyenTiep
- ✅ User A thấy yêu cầu quay lại

**Option 2** (Prevent loop):

- ❌ Backend check: "Không thể chuyển tiếp về người đã xử lý trước đó"
- ❌ Validation error

### 🐛 Business Logic Question

- ⚠️ Cần clarify với team: Có cho phép loop không?

---

## TC-EDGE-06: DANH_GIA nhiều lần (chỉ lần đầu)

### 📝 Mô Tả

User cố đánh giá 2 lần (test idempotency)

### 🎬 Test Steps

1. User A DANH_GIA: 5 sao
2. Refresh page
3. **Hack**: Dùng API directly call `DANH_GIA` lần 2: 1 sao

### ✅ Expected Results

- ❌ Backend: 400 Bad Request: "Yêu cầu đã được đánh giá"
- ✅ DB: DanhGia vẫn = 5 (không đổi)
- ✅ Frontend: Button "Đánh Giá" không hiển thị

---

## TC-EDGE-07: HUY ngay sau khi gửi trong < 1 phút

### 📝 Mô Tả

Người gửi hủy yêu cầu ngay sau khi gửi (< 30 giây)

### 🎬 Test Steps

1. User A tạo YeuCau mới → Gửi đến Khoa Nội
2. Ngay lập tức (< 10 giây): Click "Hủy Yêu Cầu"
3. Confirm

### ✅ Expected Results

- ✅ Cho phép hủy
- ✅ Notification đến DieuPhoi: "Yêu cầu đã bị hủy"

### 🐛 Edge Case

- ⚠️ Nếu DieuPhoi đã click TIEP_NHAN trong cùng thời điểm → Race condition (xem TC-EDGE-01)

---

## B. Negative Tests (4 Test Cases)

### Overview

Test validation errors, permission denied, invalid data

---

## TC-NEG-01: Submit form thiếu required field

### 📝 Mô Tả

Submit TiepNhanDialog không điền ThoiGianHen

### 🎬 Test Steps

1. Login `test_dieuphoi`
2. View YeuCau MOI
3. Click "Tiếp Nhận"
4. **KHÔNG** điền ThoiGianHen
5. Click "Xác Nhận"

### ✅ Expected Results

- ❌ Form validation error
- ❌ TextField ThoiGianHen border màu đỏ
- ❌ Error message: "Vui lòng chọn thời gian hẹn"
- ❌ Submit button disabled hoặc không submit

### 📸 UI Screenshots to Verify

- [ ] Validation error hiển thị rõ ràng
- [ ] TextField có error state

---

## TC-NEG-02: Action không thuộc availableActions (403)

### 📝 Mô Tả

User C (không có quyền) cố gọi API TIEP_NHAN yêu cầu không phải của mình

### 🎬 Test Steps

1. Login `test_xulykhac` (User E - không liên quan)
2. View YeuCau MOI của User A gửi đến Khoa Nội
3. Verify: KHÔNG có button "Tiếp Nhận"
4. **Hack**: Dùng Postman gọi API:
   ```
   POST /api/yeucau/673abc123.../TIEP_NHAN
   Headers: Authorization: Bearer <User E token>
   Body: { ThoiGianHen: "2025-12-10T10:00:00Z" }
   ```

### ✅ Expected Results

- ❌ HTTP 403 Forbidden
- ❌ Response:
  ```json
  {
    "success": false,
    "message": "Bạn không có quyền thực hiện hành động này"
  }
  ```
- ✅ DB không thay đổi

---

## TC-NEG-03: TuChoiDialog với "Lý do khác" không điền GhiChu

### 📝 Mô Tả

Chọn "Lý do khác" nhưng không điền GhiChu → validation error

### 🎬 Test Steps

1. Login `test_dieuphoi`
2. View YeuCau MOI
3. Click "Từ Chối"
4. Fill TuChoiDialog:
   - LyDoTuChoiID: "Lý do khác" (MaLyDo = "LY_DO_KHAC")
   - GhiChu: **Để trống**
5. Click "Xác Nhận"

### ✅ Expected Results

- ❌ Yup validation error
- ❌ GhiChu TextField border màu đỏ
- ❌ Error message: "Vui lòng nhập ghi chú khi chọn lý do khác"
- ❌ Dialog không đóng

### 📸 UI Screenshots to Verify

- [ ] Conditional validation works
- [ ] Error message rõ ràng

---

## TC-NEG-04: TiepNhanDialog với ThoiGianHen trong quá khứ

### 📝 Mô Tả

Set ThoiGianHen là thời điểm trong quá khứ

### 🎬 Test Steps

1. Login `test_dieuphoi`
2. View YeuCau MOI
3. Click "Tiếp Nhận"
4. Fill: ThoiGianHen = "01/12/2025 10:00" (7 ngày trước)
5. Submit

### ✅ Expected Results

- ❌ Yup validation error: "Thời gian hẹn phải là tương lai"
- ❌ DateTimePicker border màu đỏ

---

## C. Socket Notifications (2 Test Cases)

---

## TC-SOCKET-01: Real-time notification khi status thay đổi

### 📝 Mô Tả

User A xem YeuCau, User B thay đổi status → User A nhận notification real-time

### 🎭 Actors

- **Browser 1**: User A (test_nguoigui) - đang xem YeuCau detail page
- **Browser 2**: User B (test_dieuphoi) - thực hiện action

### 📊 Preconditions

- YeuCau MOI

### 🎬 Test Steps

1. **Browser 1**: Login `test_nguoigui`, mở detail page YeuCau MOI
2. **Browser 2**: Login `test_dieuphoi`, mở cùng YeuCau MOI
3. **Browser 2**: Click "Tiếp Nhận" → Submit
4. **Observe Browser 1**: Không refresh page

### ✅ Expected Results

**Browser 1 (Real-time updates)**:

- ✅ Notification bar xuất hiện góc phải:
  - Icon: ✅
  - Title: "Cập nhật yêu cầu"
  - Message: "Yêu cầu #TC-XXX đã được tiếp nhận bởi Trần Thị B"
  - Action: "Xem chi tiết" (refresh page)
- ✅ Badge status tự động update: MOI → DANG_XU_LY (không cần F5)
- ✅ Thông tin NguoiXuLy hiển thị
- ✅ Actions buttons update theo availableActions mới

**Socket Events**:

- ✅ Event type: `yeuCauUpdated`
- ✅ Payload:
  ```javascript
  {
    yeuCauId: "673abc123...",
    TrangThai: "DANG_XU_LY",
    NguoiXuLyID: "user_b_id",
    updatedBy: "user_b_id"
  }
  ```

### 📸 UI Screenshots to Verify

- [ ] Notification bar animation (slide in from right)
- [ ] Badge color change animation
- [ ] Timeline update real-time

---

## TC-SOCKET-02: Multi-device sync (same user, 2 browsers)

### 📝 Mô Tả

Cùng 1 user, 2 thiết bị/browsers → sync data

### 🎬 Test Steps

1. **Browser 1** (Desktop): Login `test_nguoigui`, view "Yêu cầu của tôi"
2. **Browser 2** (Mobile/Incognito): Login `test_nguoigui`, view cùng YeuCau detail
3. **Browser 1**: Đánh giá 5 sao → Submit
4. **Observe Browser 2**: Không refresh

### ✅ Expected Results

**Browser 2**:

- ✅ Rating stars tự động update → 5 sao
- ✅ Button "Đánh Giá" biến mất
- ✅ Toast notification: "Yêu cầu đã được đánh giá"

### 🐛 Edge Case

- ⚠️ Socket connection per session hoặc per user?
- ⚠️ Nếu logout Browser 1 → Browser 2 vẫn connected

---

## 📊 Summary Edge Cases + Negative Tests

**Tổng cộng: 13 Test Cases**

### Edge Cases (7 TC):

- ✅ Race condition - 2 người TIEP_NHAN
- ✅ Optimistic locking - edit conflict
- ✅ Rate limiting - 3 lần/giờ
- ✅ MO_LAI boundary - ngày thứ 7
- ✅ CHUYEN_TIEP loop detection
- ✅ DANH_GIA idempotency
- ✅ HUY ngay sau khi gửi

### Negative Tests (4 TC):

- ✅ Submit form thiếu required field
- ✅ Action không có quyền (403)
- ✅ TuChoiDialog conditional validation
- ✅ ThoiGianHen trong quá khứ

### Socket Notifications (2 TC):

- ✅ Real-time status update
- ✅ Multi-device sync

**Critical Implementations**:

- ⚠️ Optimistic locking với `updatedAt` hoặc `__v`
- ⚠️ Rate limiting (Redis hoặc in-memory)
- ⚠️ Socket.IO broadcast to rooms
- ⚠️ Permission check trước mọi action

**Business Logic Questions** (cần clarify):

1. Rate limit: 3 lần/giờ có đúng không?
2. CHUYEN_TIEP loop: Cho phép hay prevent?
3. Admin có exempt khỏi rate limit không?

---

## 🎯 Next Steps

1. ✅ **Test Execution**: Chạy tất cả 48 TC theo thứ tự
2. ✅ **Document Results**: Ghi vào `10_TEST_RESULTS.md`
3. ⚠️ **Clarify Business Logic**: Các questions ở trên
4. 🐛 **Bug Fixing**: Fix các lỗi phát hiện
5. 🔄 **Regression**: Chạy lại toàn bộ

**Total Coverage**: 48 Test Cases

- MOI: 18 TC
- DANG_XU_LY: 6 TC
- DA_HOAN_THANH: 6 TC
- DA_DONG: 3 TC
- TU_CHOI: 2 TC
- Edge Cases: 7 TC
- Negative Tests: 4 TC
- Notifications: 2 TC

✅ **Không bỏ sót trường hợp nào!**
