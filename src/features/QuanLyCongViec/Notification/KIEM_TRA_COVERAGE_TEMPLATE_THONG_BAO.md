# 📊 Kiểm Tra Coverage Template Thông Báo

**Ngày kiểm tra:** 21/12/2025  
**Tổng số templates:** 53  
**Tổng số notification types:** 43

---

## 📝 Tổng Quan

### Thống Kê Coverage

| Chỉ số                        | Số lượng | Phần trăm          |
| ----------------------------- | -------- | ------------------ |
| **Tổng Templates**            | 53       | 100%               |
| **Types đã implement**        | 13       | 30.2%              |
| **Types chưa implement**      | 30       | 69.8%              |
| **Dynamic qua State Machine** | ~10-15   | ~23-35% (ước tính) |

### Trạng Thái Implementation Theo Domain

| Domain            | Tổng Types | Đã Implement | Chưa Implement | Dynamic                |
| ----------------- | ---------- | ------------ | -------------- | ---------------------- |
| **Công việc**     | 20         | 6            | 9              | 5 (qua state machine)  |
| **Yêu cầu**       | 17         | 3            | 4              | 10 (qua state machine) |
| **KPI**           | 7          | 0            | 7              | 0                      |
| **Deadline Jobs** | 2          | 2            | 0              | 0                      |

---

## 🔍 Ma Trận Coverage Chi Tiết

### 1️⃣ CÔNG VIỆC (20 types, 20 templates)

| #   | Mã Type Code                    | Templates | Trạng Thái            | Vị Trí Implementation                                                                                               | Độ Ưu Tiên  | Ghi Chú                               |
| --- | ------------------------------- | --------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------- |
| 1   | `congviec-giao-viec`            | 2         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:1736](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L1736) | CAO         | Gọi trực tiếp khi tạo task            |
| 2   | `congviec-huy-giao`             | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | BÌNH THƯỜNG | Tự sinh: `congviec-${actionTypeCode}` |
| 3   | `congviec-huy-hoan-thanh-tam`   | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | CAO         | Action revert trạng thái              |
| 4   | `congviec-tiep-nhan`            | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | THẤP        | Sinh từ action TIEP_NHAN              |
| 5   | `congviec-hoan-thanh`           | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | BÌNH THƯỜNG | Sinh từ action HOAN_THANH             |
| 6   | `congviec-hoan-thanh-tam`       | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | BÌNH THƯỜNG | Sinh từ action HOAN_THANH_TAM         |
| 7   | `congviec-duyet-hoan-thanh`     | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | BÌNH THƯỜNG | Sinh từ action DUYET_HOAN_THANH       |
| 8   | `congviec-tu-choi`              | 1         | ❌ **CHƯA IMPLEMENT** | -                                                                                                                   | BÌNH THƯỜNG | Template disabled (isEnabled: false)  |
| 9   | `congviec-mo-lai`               | 1         | ⚠️ **DYNAMIC**        | Qua state machine                                                                                                   | CAO         | Sinh từ action MO_LAI                 |
| 10  | `congviec-comment`              | 2         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:3319](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L3319) | THẤP        | Dùng `congviec-binh-luan`             |
| 11  | `congviec-cap-nhat-deadline`    | 1         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:3070](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L3070) | CAO         | Gọi trực tiếp khi đổi deadline        |
| 12  | `congviec-them-nguoi-tham-gia`  | 1         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:3152](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L3152) | BÌNH THƯỜNG | Dùng `congviec-gan-nguoi-tham-gia`    |
| 13  | `congviec-xoa-nguoi-tham-gia`   | 1         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:3175](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L3175) | BÌNH THƯỜNG | Gọi trực tiếp khi xóa người tham gia  |
| 14  | `congviec-thay-doi-nguoi-chinh` | 2         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:3130](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L3130) | CAO         | Gọi trực tiếp khi đổi người chính     |
| 15  | `congviec-thay-doi-uu-tien`     | 1         | ❌ **CHƯA IMPLEMENT** | -                                                                                                                   | BÌNH THƯỜNG | Thiếu call trực tiếp                  |
| 16  | `congviec-cap-nhat-tien-do`     | 1         | ✅ **ĐÃ IMPLEMENT**   | [congViec.service.js:451](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L451)   | THẤP        | Gọi trực tiếp khi cập nhật %          |
| 17  | `congviec-upload-file`          | 2         | ❌ **CHƯA IMPLEMENT** | file.service.js                                                                                                     | THẤP        | Cần tích hợp file service             |
| 18  | `congviec-xoa-file`             | 1         | ❌ **CHƯA IMPLEMENT** | file.service.js                                                                                                     | THẤP        | Cần tích hợp file service             |
| 19  | `congviec-deadline-sap-den`     | 1         | ✅ **ĐÃ IMPLEMENT**   | [deadlineJobs.js:110](d:\project\webBV\giaobanbv-be\jobs\deadlineJobs.js#L110)                                      | CAO         | Dùng `congviec-deadline-approaching`  |
| 20  | `congviec-deadline-qua-han`     | 2         | ✅ **ĐÃ IMPLEMENT**   | [deadlineJobs.js:165](d:\project\webBV\giaobanbv-be\jobs\deadlineJobs.js#L165)                                      | KHẨN CẤP    | Dùng `congviec-deadline-overdue`      |

**⚠️ Lưu Ý về Dynamic Generation:**  
[congViec.service.js:2151](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L2151) tự động sinh notification types:

```javascript
const actionTypeCode = action.toLowerCase().replace(/_/g, "-");
await notificationService.send({
  type: `congviec-${actionTypeCode}`, // VD: congviec-tiep-nhan, congviec-hoan-thanh
  // ...
});
```

### 2️⃣ YÊU CẦU (17 types, 19 templates)

| #   | Mã Type Code               | Templates | Trạng Thái          | Vị Trí Implementation                                                                                                 | Độ Ưu Tiên  | Ghi Chú                       |
| --- | -------------------------- | --------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------- |
| 20  | `yeucau-tao-moi`           | 1         | ✅ **ĐÃ IMPLEMENT** | [yeuCau.service.js:176](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCau.service.js#L176)         | BÌNH THƯỜNG | Gọi trực tiếp khi tạo yêu cầu |
| 21  | `yeucau-tiep-nhan`         | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:35](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L35)   | BÌNH THƯỜNG | Transition TIEP_NHAN          |
| 22  | `yeucau-tu-choi`           | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:41](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L41)   | CAO         | Transition TU_CHOI            |
| 23  | `yeucau-dieu-phoi`         | 2         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:52](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L52)   | BÌNH THƯỜNG | Transition DIEU_PHOI          |
| 24  | `yeucau-gui-ve-khoa`       | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:57](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L57)   | BÌNH THƯỜNG | Transition GUI_VE_KHOA        |
| 25  | `yeucau-hoan-thanh`        | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:78](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L78)   | BÌNH THƯỜNG | Transition HOAN_THANH         |
| 26  | `yeucau-huy-tiep-nhan`     | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:83](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L83)   | CAO         | Transition HUY_TIEP_NHAN      |
| 27  | `yeucau-doi-thoi-gian-hen` | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:89](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L89)   | BÌNH THƯỜNG | Transition DOI_THOI_GIAN_HEN  |
| 28  | `yeucau-danh-gia`          | 2         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:98](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L98)   | THẤP        | Transition DANH_GIA           |
| 29  | `yeucau-dong`              | 1         | ⚠️ **DYNAMIC**      | yeuCauStateMachine.js:103                                                                                             | THẤP        | Transition DONG               |
| 30  | `yeucau-mo-lai`            | 2         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:122](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L122) | BÌNH THƯỜNG | Transition MO_LAI             |
| 31  | `yeucau-xu-ly-tiep`        | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:112](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L112) | CAO         | Transition YEU_CAU_XU_LY_TIEP |
| 32  | `yeucau-nhac-lai`          | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:64](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L64)   | CAO         | Transition NHAC_LAI           |
| 33  | `yeucau-bao-quan-ly`       | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:70](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L70)   | KHẨN CẤP    | Transition BAO_QUAN_LY        |
| 34  | `yeucau-xoa`               | 1         | ⚠️ **DYNAMIC**      | [yeuCauStateMachine.js:46](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L46)   | THẤP        | Transition XOA                |
| 35  | `yeucau-sua`               | 1         | ✅ **ĐÃ IMPLEMENT** | [yeuCau.service.js:315](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCau.service.js#L315)         | THẤP        | Gọi trực tiếp khi update      |
| 36  | `yeucau-comment`           | 2         | ✅ **ĐÃ IMPLEMENT** | [yeuCau.service.js:835](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCau.service.js#L835)         | THẤP        | Dùng `yeucau-binh-luan`       |

**⚠️ Lưu Ý về Dynamic Generation:**  
[yeuCauStateMachine.js:564](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L564) tự động sinh notification types từ state transitions:

```javascript
const actionTypeCode = action.toLowerCase().replace(/_/g, "-");
await notificationService.send({
  type: `yeucau-${actionTypeCode}`, // VD: yeucau-tiep-nhan, yeucau-dieu-phoi
  // ...
});
```

### 3️⃣ KPI (7 types, 7 templates)

| #   | Mã Type Code           | Templates | Trạng Thái            | Vị Trí Implementation | Độ Ưu Tiên  | Ghi Chú                         |
| --- | ---------------------- | --------- | --------------------- | --------------------- | ----------- | ------------------------------- |
| 37  | `kpi-tao-danh-gia`     | 1         | ❌ **CHƯA IMPLEMENT** | -                     | BÌNH THƯỜNG | Cần tích hợp vào KPI controller |
| 38  | `kpi-duyet-danh-gia`   | 1         | ❌ **CHƯA IMPLEMENT** | -                     | BÌNH THƯỜNG | Thiếu flow duyệt đánh giá       |
| 39  | `kpi-duyet-tieu-chi`   | 1         | ❌ **CHƯA IMPLEMENT** | -                     | THẤP        | Thiếu duyệt tiêu chí            |
| 40  | `kpi-huy-duyet`        | 1         | ❌ **CHƯA IMPLEMENT** | -                     | CAO         | Thiếu flow hủy duyệt            |
| 41  | `kpi-cap-nhat-diem-ql` | 1         | ❌ **CHƯA IMPLEMENT** | -                     | BÌNH THƯỜNG | Thiếu cập nhật điểm quản lý     |
| 42  | `kpi-tu-danh-gia`      | 1         | ❌ **CHƯA IMPLEMENT** | -                     | BÌNH THƯỜNG | Thiếu submit tự đánh giá        |
| 43  | `kpi-phan-hoi`         | 1         | ❌ **CHƯA IMPLEMENT** | -                     | BÌNH THƯỜNG | Thiếu feedback/comment          |

**⚠️ Trạng Thái Module KPI:**  
[kpi.controller.js](d:\project\webBV\giaobanbv-be\modules\workmanagement\controllers\kpi.controller.js) CHƯA import hoặc dùng `notificationService`. Tất cả KPI notification templates đã được định nghĩa nhưng CHƯA tích hợp vào business logic.

### 4️⃣ DEADLINE JOBS (2 types, 2 templates)

| #   | Mã Type Code                | Templates | Trạng Thái          | Vị Trí Implementation                                                          | Độ Ưu Tiên | Ghi Chú                              |
| --- | --------------------------- | --------- | ------------------- | ------------------------------------------------------------------------------ | ---------- | ------------------------------------ |
| 19  | `congviec-deadline-sap-den` | 1         | ✅ **ĐÃ IMPLEMENT** | [deadlineJobs.js:110](d:\project\webBV\giaobanbv-be\jobs\deadlineJobs.js#L110) | CAO        | Dùng `congviec-deadline-approaching` |
| 20  | `congviec-deadline-qua-han` | 2         | ✅ **ĐÃ IMPLEMENT** | [deadlineJobs.js:165](d:\project\webBV\giaobanbv-be\jobs\deadlineJobs.js#L165) | KHẨN CẤP   | Dùng `congviec-deadline-overdue`     |

---

## ⚠️ Vấn Đề Type Code Không Khớp

### Templates vs Implementation Naming

| Template Type Code             | Implementation Type Code        | Trạng Thái    | Tác Động                           |
| ------------------------------ | ------------------------------- | ------------- | ---------------------------------- |
| `congviec-comment`             | `congviec-binh-luan`            | ⚠️ KHÔNG KHỚP | Trung bình - Templates không match |
| `yeucau-comment`               | `yeucau-binh-luan`              | ⚠️ KHÔNG KHỚP | Trung bình - Templates không match |
| `congviec-deadline-sap-den`    | `congviec-deadline-approaching` | ⚠️ KHÔNG KHỚP | Trung bình - Templates không match |
| `congviec-deadline-qua-han`    | `congviec-deadline-overdue`     | ⚠️ KHÔNG KHỚP | Trung bình - Templates không match |
| `congviec-them-nguoi-tham-gia` | `congviec-gan-nguoi-tham-gia`   | ⚠️ KHÔNG KHỚP | Trung bình - Templates không match |

**⚠️ QUAN TRỌNG:**  
Những mismatch này sẽ khiến hệ thống thông báo fail ngầm - code implementation gửi notifications với typeCode không tồn tại trong templates. Phải sửa templates hoặc code để khớp nhau.

---

## 🎯 Phân Tích Gaps Theo Độ Ưu Tiên

### 🔴 Độ Ưu Tiên Cao - Chưa Implement (5 types)

1. **`congviec-huy-hoan-thanh-tam`** - Revert hoàn thành tạm (độ ưu tiên CAO)

   - **Tác động:** User không được thông báo khi công việc hoàn thành bị từ chối
   - **Khuyến nghị:** Verify state machine sinh đúng không

2. **`congviec-mo-lai`** - Mở lại công việc (độ ưu tiên CAO)

   - **Tác động:** Thiếu thông báo khi tasks được mở lại
   - **Khuyến nghị:** Verify state machine transition mapping

3. **`yeucau-huy-tiep-nhan`** - Hủy tiếp nhận (độ ưu tiên CAO)

   - **Tác động:** Không có thông báo khi hủy tiếp nhận yêu cầu
   - **Trạng thái:** Nên được state machine tự sinh

4. **`yeucau-xu-ly-tiep`** - Yêu cầu xử lý tiếp (độ ưu tiên CAO)

   - **Tác động:** Thiếu thông báo escalation
   - **Trạng thái:** Nên được state machine tự sinh

5. **`kpi-huy-duyet`** - Hủy duyệt KPI (độ ưu tiên CAO)
   - **Tác động:** Không có thông báo khi đánh giá KPI bị revert
   - **Khuyến nghị:** Ưu tiên 1 - Implement trong KPI controller

### 🟠 Độ Ưu Tiên Trung Bình - Chưa Implement (3 types)

1. **`congviec-upload-file`** - Thông báo upload file (template THẤP nhưng giá trị business CAO)

   - **Khuyến nghị:** Thêm vào file.service.js khi xử lý task attachments

2. **`congviec-xoa-file`** - Thông báo xóa file

   - **Khuyến nghị:** Thêm vào file.service.js

3. **Tất cả KPI types** (trừ `kpi-huy-duyet` đã liệt kê ở trên)
   - **Khuyến nghị:** Phase 2 implementation - tích hợp theo batch với KPI module

---

## 🔧 Các Khuyến Nghị

### 1. Sửa Type Code Mismatches (QUAN TRỌNG - Tuần 1)

**File:** [notificationTemplates.seed.js](d:\project\webBV\giaobanbv-be\seeds\notificationTemplates.seed.js)

Cập nhật các templates này để khớp với implementation:

```javascript
// CŨ (line ~170)
{
  name: "Thông báo cho người chính",
  typeCode: "congviec-comment",  // ❌ Sai
  ...
}

// MỚI
{
  name: "Thông báo cho người chính",
  typeCode: "congviec-binh-luan",  // ✅ Đúng
  ...
}
```

**Các thay đổi cần thiết:**

- `congviec-comment` → `congviec-binh-luan` (2 templates)
- `yeucau-comment` → `yeucau-binh-luan` (2 templates)
- `congviec-deadline-sap-den` → `congviec-deadline-approaching` (1 template)
- `congviec-deadline-qua-han` → `congviec-deadline-overdue` (2 templates)
- `congviec-them-nguoi-tham-gia` → `congviec-gan-nguoi-tham-gia` (1 template)

### 2. Verify State Machine Coverage (Tuần 1-2)

**Files cần check:**

- [congViec.service.js:2140-2180](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L2140-L2180) - CongViec state transitions
- [yeuCauStateMachine.js:28-132](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\yeuCauStateMachine.js#L28-L132) - YeuCau state transitions

**Validation cần làm:**

- Đảm bảo tất cả actions trong TRANSITIONS config sinh đúng notification types
- Test từng state transition end-to-end để verify notifications được gửi
- Check rằng dynamic `action.toLowerCase().replace(/_/g, "-")` khớp với template typeCodes

### 3. Implement File Service Notifications (Tuần 2)

**File:** `giaobanbv-be/modules/workmanagement/services/file.service.js`

Thêm notifications khi upload/xóa files:

```javascript
// Sau khi upload file thành công
await notificationService.send({
  type: "congviec-upload-file",
  data: {
    _id: congviecId,
    arrNguoiLienQuanID: [...],
    TenFile: file.originalname,
    TenNguoiUpload: uploaderName,
    // ...
  },
});

// Sau khi xóa file
await notificationService.send({
  type: "congviec-xoa-file",
  data: {
    _id: congviecId,
    arrNguoiLienQuanID: [...],
    TenFile: file.ten,
    TenNguoiXoa: deleterName,
    // ...
  },
});
```

### 4. Tích Hợp KPI Module (Phase 2 - Tuần 3-4)

**File:** [kpi.controller.js](d:\project\webBV\giaobanbv-be\modules\workmanagement\controllers\kpi.controller.js)

**Thứ tự ưu tiên:**

1. `kpi-huy-duyet` - Hủy duyệt (tác động business quan trọng nhất)
2. `kpi-duyet-danh-gia` - Duyệt đánh giá (hoàn thành approval workflow)
3. `kpi-tu-danh-gia` - Submit tự đánh giá (trigger manager review)
4. `kpi-tao-danh-gia` - Tạo đánh giá (bắt đầu cycle)
5. `kpi-cap-nhat-diem-ql` - Cập nhật điểm QL (cung cấp feedback)
6. `kpi-duyet-tieu-chi` - Duyệt tiêu chí (granular approval)
7. `kpi-phan-hoi` - Feedback/comment (low priority async communication)

**Pattern implementation:**

```javascript
const notificationService = require("../services/notificationService");

// Trong hàm approval
await notificationService.send({
  type: "kpi-duyet-danh-gia",
  data: {
    _id: danhGiaId,
    NhanVienID: evaluation.NhanVienID,
    TenChuKy: evaluation.ChuKyDanhGiaID.TenChuKy,
    TenNguoiDanhGia: approverName,
    TongDiemKPI: evaluation.TongDiemKPI,
    // ...
  },
});
```

### 5. Xóa Template Disabled (Tùy chọn)

**File:** [notificationTemplates.seed.js:151](d:\project\webBV\giaobanbv-be\seeds\notificationTemplates.seed.js#L151)

Template `congviec-tu-choi` (Từ chối task) có `isEnabled: false`. Cân nhắc:

- **Option A:** Xóa khỏi seeds nếu thực sự obsolete
- **Option B:** Re-enable nếu business logic cần dùng
- **Option C:** Giữ disabled cho future use

---

## 📈 Lộ Trình Triển Khai

### Phase 1: Sửa Lỗi Quan Trọng (Tuần 1)

- ✅ Sửa 8 type code mismatches trong template seeds
- ✅ Chạy lại seed script để cập nhật DB
- ✅ Test các notifications hiện tại hoạt động đúng
- ✅ Verify state machine sinh tất cả types như mong đợi

### Phase 2: Tích Hợp File Service (Tuần 2)

- ✅ Thêm notification upload file
- ✅ Thêm notification xóa file
- ✅ Test với file operations thực tế

### Phase 3: Tích Hợp KPI Module (Tuần 3-4)

- ✅ Implement `kpi-huy-duyet` (Ưu tiên 1)
- ✅ Implement `kpi-duyet-danh-gia` (Ưu tiên 2)
- ✅ Implement 5 KPI types còn lại
- ✅ End-to-end testing của KPI workflow

### Phase 4: Validation & Documentation (Tuần 5)

- ✅ Manual testing tất cả 43 notification types
- ✅ Cập nhật tài liệu audit này với kết quả
- ✅ Tạo UI preference thông báo cho user
- ✅ Performance testing (bulk notifications)

---

## 📊 Checklist Testing

### Automated Tests Cần Thiết

```bash
# Test tất cả notification types tồn tại trong DB
node seeds/test-notification-flow.js

# Test notification service có thể resolve tất cả types
# TODO: Tạo comprehensive-notification-test.js
```

### Ma Trận Testing Thủ Công

| Type                            | Test Case                 | Kết Quả Mong Đợi                      | Trạng Thái  |
| ------------------------------- | ------------------------- | ------------------------------------- | ----------- |
| `congviec-giao-viec`            | Tạo task mới với assignee | 2 notifications gửi đi                | ⏳ Đang chờ |
| `congviec-binh-luan`            | Thêm comment vào task     | Tất cả related users được thông báo   | ⏳ Đang chờ |
| `yeucau-tao-moi`                | Tạo yêu cầu mới           | Coordinators được thông báo           | ⏳ Đang chờ |
| `congviec-deadline-approaching` | Đợi đến warning time      | Main person + assigner được thông báo | ⏳ Đang chờ |
| ...                             | ...                       | ...                                   | ...         |

---

## 🔗 Tài Liệu Liên Quan

- [NOTIFICATION_SYSTEM_VERIFICATION.md](d:\project\webBV\giaobanbv-be\NOTIFICATION_SYSTEM_VERIFICATION.md) - Checklist thiết lập hệ thống
- [NOTIFICATION_REFACTOR_IMPLEMENTATION_PLAN.md](d:\project\webBV\fe-bcgiaobanbvt\src\features\QuanLyCongViec\Notification\NOTIFICATION_REFACTOR_IMPLEMENTATION_PLAN.md) - Kế hoạch refactor gốc
- [notificationTemplates.seed.js](d:\project\webBV\giaobanbv-be\seeds\notificationTemplates.seed.js) - Tất cả 53 templates
- [notificationTypes.seed.js](d:\project\webBV\giaobanbv-be\seeds\notificationTypes.seed.js) - Tất cả 44 types

---

## 📝 Ghi Chú

1. **Dynamic vs Static Implementation:**

   - Static = Gọi trực tiếp `notificationService.send()` với typeCode hardcoded
   - Dynamic = Sinh qua state machine với pattern `${action}`
   - Cả hai cách đều hợp lệ; dynamic scale tốt hơn cho các flows nhất quán dựa trên state

2. **Số Template vs Số Type:**

   - 53 templates cover 43 types vì một số types có nhiều recipient groups
   - Ví dụ: `congviec-giao-viec` có 2 templates (một cho người chính, một cho người tham gia)

3. **Các Mức Độ Ưu Tiên:**

   - **KHẨN CẤP** (1): Tác động business ngay lập tức (VD: deadlines quá hạn)
   - **CAO** (5): Workflow user quan trọng (VD: từ chối task, mở lại)
   - **BÌNH THƯỜNG** (12): Hoạt động chuẩn (VD: tạo task, tiếp nhận)
   - **THẤP** (25): Nice-to-have, async communication (VD: comments, cập nhật tiến độ)

4. **Ưu Điểm của State Machine Pattern:**

   - Tập trung logic notification
   - Cấu trúc data nhất quán cho các events tương tự
   - Tự động coverage cho tất cả state transitions
   - Dễ maintain hơn (1 chỗ để update notification logic)

5. **Ngày Audit Tiếp Theo:**
   - Khuyến nghị chạy lại audit này sau khi hoàn thành Phase 3
   - Tần suất: Hàng tháng trong giai đoạn phát triển, hàng quý khi maintenance

---

**Phiên Bản Tài Liệu:** 1.0  
**Cập Nhật Lần Cuối:** 2025-12-21  
**Tác Giả:** AI Assistant  
**Người Review:** [Đang chờ]
