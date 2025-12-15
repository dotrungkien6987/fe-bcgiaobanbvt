# 📋 TEST SUITE OVERVIEW - YeuCau System

## Mục Tiêu Testing

**Mục tiêu chính**: Kiểm tra toàn bộ các kịch bản thực tế của hệ thống YeuCau (Support Request/Ticket)

**Phạm vi**:

- ✅ Tất cả trạng thái: MOI, DANG_XU_LY, DA_HOAN_THANH, DA_DONG, TU_CHOI
- ✅ Tất cả vai trò: NguoiGui, DieuPhoi, NguoiDuocDieuPhoi, NguoiNhan, NguoiXuLy, Admin
- ✅ Tất cả actions: 15 actions từ state machine
- ✅ Cả 2 loại gửi: GUI_DEN_KHOA và GUI_DEN_CA_NHAN
- ✅ Edge cases và negative tests
- ✅ Socket notifications

**Không muốn bỏ sót**: Mỗi tổ hợp Status × Role × LoaiNguoiNhan đều được test

---

## 📊 Tổng Quan 48 Test Cases

### 1️⃣ **MOI Status** - 18 Test Cases

#### A. GUI_DEN_KHOA (10 TC)

- TC-MOI-K-01: NguoiGui XEM + HUY yêu cầu của mình
- TC-MOI-K-02: NguoiGui XEM yêu cầu khác (không có actions)
- TC-MOI-K-03: DieuPhoi TIEP_NHAN yêu cầu → chuyển DANG_XU_LY
- TC-MOI-K-04: DieuPhoi TU_CHOI yêu cầu → chuyển TU_CHOI
- TC-MOI-K-05: DieuPhoi CHUYEN_TIEP yêu cầu sang khoa khác
- TC-MOI-K-06: NguoiDuocDieuPhoi TIEP_NHAN (nhận về xử lý)
- TC-MOI-K-07: NguoiDuocDieuPhoi TU_CHOI (từ chối xử lý)
- TC-MOI-K-08: NguoiDuocDieuPhoi CHUYEN_TIEP sang người khác
- TC-MOI-K-09: Admin có tất cả actions (TIEP_NHAN, TU_CHOI, CHUYEN_TIEP, HUY)
- TC-MOI-K-10: User khác không có quyền (no actions)

#### B. GUI_DEN_CA_NHAN (8 TC)

- TC-MOI-CN-01: NguoiGui XEM + HUY yêu cầu của mình
- TC-MOI-CN-02: NguoiNhan TIEP_NHAN yêu cầu → DANG_XU_LY
- TC-MOI-CN-03: NguoiNhan TU_CHOI yêu cầu → TU_CHOI
- TC-MOI-CN-04: NguoiNhan CHUYEN_TIEP sang người khác
- TC-MOI-CN-05: DieuPhoi XEM (monitor only, no actions)
- TC-MOI-CN-06: Admin có actions: TIEP_NHAN, TU_CHOI, CHUYEN_TIEP, HUY
- TC-MOI-CN-07: User khác không có quyền
- TC-MOI-CN-08: NguoiGui HUY sau khi gửi ngay lập tức

### 2️⃣ **DANG_XU_LY Status** - 6 Test Cases

- TC-XL-01: NguoiXuLy CAP_NHAT_TIEN_DO với progress 0-100%
- TC-XL-02: NguoiXuLy HOAN_THANH yêu cầu → DA_HOAN_THANH
- TC-XL-03: NguoiXuLy TU_CHOI yêu cầu → TU_CHOI (với lý do)
- TC-XL-04: NguoiXuLy CHUYEN_TIEP sang người khác
- TC-XL-05: NguoiGui BAO_CAO_SU_CO (escalate to quality management)
- TC-XL-06: Admin có tất cả actions của NguoiXuLy

### 3️⃣ **DA_HOAN_THANH Status** - 6 Test Cases

- TC-HT-01: NguoiGui DANH_GIA với 5 sao (không cần NhanXet)
- TC-HT-02: NguoiGui DANH_GIA với 2 sao (bắt buộc NhanXet)
- TC-HT-03: NguoiGui DANH_GIA với 1 sao + NhanXet chi tiết
- TC-HT-04: NguoiGui DONG_YEU_CAU sau khi đánh giá → DA_DONG
- TC-HT-05: NguoiGui XEM lại yêu cầu (chưa đánh giá)
- TC-HT-06: Admin DONG_YEU_CAU thay cho NguoiGui

### 4️⃣ **DA_DONG Status** - 3 Test Cases

- TC-DONG-01: NguoiGui MO_LAI trong vòng 7 ngày (còn 5 ngày)
- TC-DONG-02: NguoiGui MO_LAI vào ngày cuối (còn 0 ngày)
- TC-DONG-03: NguoiGui không thể MO_LAI sau 7 ngày (button disabled)

### 5️⃣ **TU_CHOI Status** - 2 Test Cases

- TC-TC-01: NguoiGui APPEAL yêu cầu bị từ chối → về MOI
- TC-TC-02: NguoiGui XEM lý do từ chối (không có APPEAL)

### 6️⃣ **Edge Cases** - 7 Test Cases

- TC-EDGE-01: Race condition - 2 người TIEP_NHAN cùng lúc
- TC-EDGE-02: Optimistic locking - edit conflict with version mismatch
- TC-EDGE-03: Rate limiting - TIEP_NHAN quá 3 lần/giờ
- TC-EDGE-04: MO_LAI đúng lúc 00:00:00 ngày thứ 7
- TC-EDGE-05: CHUYEN_TIEP vòng lặp A → B → A
- TC-EDGE-06: DANH_GIA nhiều lần (chỉ lần đầu được ghi nhận)
- TC-EDGE-07: HUY ngay sau khi gửi trong < 1 phút

### 7️⃣ **Negative Tests** - 4 Test Cases

- TC-NEG-01: Submit form thiếu required field (validation error)
- TC-NEG-02: Action không thuộc availableActions (403 Forbidden)
- TC-NEG-03: TuChoiDialog với "Lý do khác" nhưng không điền GhiChu
- TC-NEG-04: TiepNhanDialog với ThoiGianHen trong quá khứ

### 8️⃣ **Socket Notifications** - 2 Test Cases

- TC-SOCKET-01: Real-time notification khi status thay đổi
- TC-SOCKET-02: Multi-device sync (same user, 2 browsers)

---

## 🎯 Test Case Format Chuẩn

Mỗi test case sẽ có cấu trúc:

````markdown
## TC-XXX-YY: [Tên Test Case]

### 📝 Mô Tả

[Mô tả ngắn gọn]

### 🎭 Actors

- **Người thực hiện**: [User A - vai trò X]
- **Người liên quan**: [User B - vai trò Y]

### 📊 Preconditions (DB State)

```json
{
  "YeuCau": {
    "_id": "...",
    "TrangThai": "...",
    "LoaiNguoiNhan": "...",
    "NguoiGuiID": "user_a_id",
    ...
  }
}
```
````

### 🎬 Test Steps

1. **Login**: Đăng nhập với User A
2. **Navigate**: Vào trang YeuCau Detail
3. **Action**: Click nút [ACTION_NAME]
4. **Fill Form**: Điền thông tin vào dialog
5. **Submit**: Nhấn nút Xác Nhận

### ✅ Expected Results

#### 🗄️ DB Changes

```javascript
// Before
{ TrangThai: "MOI", ... }
// After
{ TrangThai: "DANG_XU_LY", NguoiXuLyID: "user_a_id", ... }
```

#### 🖥️ UI Changes

- ✅ Dialog đóng lại
- ✅ Badge status đổi màu: MOI (info) → DANG_XU_LY (warning)
- ✅ Actions buttons update theo availableActions mới
- ✅ Timeline có event mới

#### 🔔 Notifications

- ✅ User B nhận notification: "Yêu cầu #123 đã được tiếp nhận"
- ✅ Socket event broadcast đến tất cả clients đang xem YeuCau này

### 🚫 Negative Scenarios

- ❌ Nếu submit form trống → validation error
- ❌ Nếu User C (không có quyền) → 403 Forbidden

### 🐛 Edge Cases

- ⚠️ Nếu 2 người TIEP_NHAN cùng lúc → version conflict

```

---

## 🛠️ Test Environment Setup

### Required Test Users

Cần tạo 6 users với các vai trò khác nhau:

1. **user_nguoigui** - Người gửi yêu cầu (role: user)
2. **user_dieuphoi** - Điều phối viên khoa (role: manager, department: Khoa A)
3. **user_duocdieuphoi** - Người được điều phối (role: user, department: Khoa A)
4. **user_nguoinhan** - Người nhận trực tiếp (role: user)
5. **user_xulykhac** - Người xử lý khác (role: user)
6. **user_admin** - Admin có full quyền (role: admin)

### Test Data Seeds

Cần tạo các YeuCau mẫu cho mỗi test case (xem `01_SETUP_TEST_DATA.md`)

---

## 📈 Test Execution Plan

### Phase 1: Happy Path (30 TC)
- Test tất cả flows thành công theo đúng business logic
- Priority: HIGH
- Timeline: 2-3 giờ

### Phase 2: Edge Cases (7 TC)
- Test race conditions, rate limits, boundary conditions
- Priority: MEDIUM
- Timeline: 1 giờ

### Phase 3: Negative Tests (4 TC)
- Test validation, permission denied, error handling
- Priority: MEDIUM
- Timeline: 30 phút

### Phase 4: Socket & Notifications (2 TC)
- Test real-time updates
- Priority: LOW (already tested in previous sessions)
- Timeline: 30 phút

### Phase 5: Regression (Tất cả 48 TC)
- Chạy lại toàn bộ sau khi fix bugs
- Priority: HIGH before production
- Timeline: 3-4 giờ

---

## 📋 Test Result Tracking

Sử dụng file `10_TEST_RESULTS.md` để tracking:

- ✅ **PASS**: Test thành công, đúng expected results
- ❌ **FAIL**: Test thất bại, có bug cần fix
- ⚠️ **BLOCKED**: Test không thể chạy do dependency
- 🔄 **RETEST**: Cần test lại sau khi fix bug
- ⏭️ **SKIP**: Bỏ qua (lý do ghi chú)

---

## 🚀 Next Steps

1. **Review Overview này**: Xác nhận không bỏ sót trường hợp nào
2. **Setup Test Data**: Chạy scripts trong `01_SETUP_TEST_DATA.md`
3. **Execute Tests**: Theo thứ tự từ TC-MOI-K-01 → TC-SOCKET-02
4. **Document Results**: Ghi kết quả vào `10_TEST_RESULTS.md`
5. **Bug Fixing**: Fix các lỗi phát hiện trong quá trình test
6. **Regression**: Chạy lại tất cả sau khi fix

---

## 📞 Contact & Support

Nếu phát hiện business logic không rõ hoặc cần clarification:
- Review file `04_BACKEND_STATE_MACHINE.md`
- Check `yeuCauStateMachine.js` in backend
- Ask team về expected behavior

**Lưu ý quan trọng**: Trong quá trình test có thể phát hiện ra các business scenarios chưa được documented → ghi lại và cập nhật vào docs!
```
