# 📋 Hướng Dẫn Test Thông Báo Real-Time

> **Dành cho:** Người dùng muốn test chức năng thông báo  
> **Yêu cầu:** 2 máy tính/thiết bị cùng mạng LAN, 2 tài khoản khác nhau

---

## 🎯 Mục Tiêu Test

Kiểm tra xem khi **Người A** thực hiện hành động → **Người B** có nhận được thông báo ngay lập tức không (không cần F5).

---

## 📱 Chuẩn Bị

### Bước 1: Chuẩn bị 2 thiết bị

| Thiết bị  | Vai trò              | Tài khoản                    |
| --------- | -------------------- | ---------------------------- |
| **Máy 1** | Người gửi (Người A)  | Tài khoản có quyền giao việc |
| **Máy 2** | Người nhận (Người B) | Tài khoản nhân viên          |

### Bước 2: Đăng nhập cả 2 máy

1. **Máy 1:** Mở trình duyệt → Vào `http://192.168.5.200:3000` → Đăng nhập tài khoản A
2. **Máy 2:** Mở trình duyệt → Vào `http://192.168.5.200:3000` → Đăng nhập tài khoản B

### Bước 3: Kiểm tra kết nối Socket (Quan trọng!)

Trên **CẢ 2 MÁY**, mở Console (nhấn F12 → chọn tab Console):

✅ **Đúng:** Thấy dòng `[Socket] ✅ Connected: xxxxx`

❌ **Sai:** Không thấy hoặc thấy `[Socket] Connection error`

> **Nếu không thấy Connected:** Thử logout rồi login lại, hoặc F5 trang

---

## 🧪 Kịch Bản Test

### Test 1: Thông Báo Bình Luận

**Mục tiêu:** Khi A bình luận vào công việc của B → B nhận thông báo ngay

#### Trên Máy 1 (Người A):

1. Vào menu **Quản lý công việc**
2. Mở một công việc mà **Người B là người được giao**
3. Cuộn xuống phần **Bình luận**
4. Gõ nội dung bình luận, ví dụ: `"Test thông báo lúc 10:30"`
5. Nhấn nút **Gửi**

#### Trên Máy 2 (Người B) - KHÔNG F5:

**Quan sát ngay:**

| Thời điểm    | Kỳ vọng                           | Vị trí quan sát                                                  |
| ------------ | --------------------------------- | ---------------------------------------------------------------- |
| Ngay lập tức | 🔔 Popup toast xuất hiện góc phải | ![Toast](https://via.placeholder.com/200x50?text=Toast+goc+phai) |
| Ngay lập tức | 🔢 Số trên chuông tăng lên        | Icon chuông trên header                                          |
| Click chuông | 📋 Thấy thông báo mới nhất        | Dropdown danh sách                                               |

**Kết quả:**

- ✅ **PASS:** Thấy toast + số chuông tăng mà KHÔNG cần F5
- ❌ **FAIL:** Phải F5 mới thấy thông báo

---

### Test 2: Thông Báo Giao Việc Mới

**Mục tiêu:** Khi A giao việc cho B → B nhận thông báo ngay

#### Trên Máy 1 (Người A):

1. Vào menu **Quản lý công việc** → **Danh sách công việc**
2. Nhấn nút **+ Tạo công việc mới**
3. Điền thông tin:
   - Tiêu đề: `"Công việc test thông báo"`
   - **Người thực hiện:** Chọn Người B
   - Deadline: Chọn ngày
4. Nhấn **Lưu** / **Giao việc**

#### Trên Máy 2 (Người B) - KHÔNG F5:

| Kỳ vọng                   | Kiểm tra          |
| ------------------------- | ----------------- |
| 🔔 Toast: "Công việc mới" | Góc phải màn hình |
| 🔢 Số chuông +1           | Header            |
| 📋 Chi tiết thông báo     | Click vào chuông  |

---

### Test 3: Thông Báo Duyệt Hoàn Thành Công Việc

**Mục tiêu:** Khi trưởng khoa duyệt hoàn thành → Nhân viên nhận thông báo

#### Trên Máy 1 (Trưởng khoa):

1. Vào công việc của nhân viên đang ở trạng thái **Chờ duyệt** (Hoàn thành tạm)
2. Nhấn **Duyệt hoàn thành**

#### Trên Máy 2 (Nhân viên):

| Kỳ vọng                        | Kiểm tra          |
| ------------------------------ | ----------------- |
| Toast: "Đã duyệt hoàn thành ✓" | Góc phải màn hình |
| Màu xanh                       | Icon check        |
| Số chuông +1                   | Header            |

> **Lưu ý:** Hiện tại workflow chưa có chức năng "Từ chối". Nếu cần yêu cầu làm lại, trưởng khoa sử dụng **Hủy hoàn thành tạm** để đưa công việc về trạng thái đang thực hiện.

---

## 🔍 Kiểm Tra Chi Tiết Thông Báo

### Mở danh sách thông báo:

1. **Click vào icon chuông** 🔔 trên header
2. Dropdown hiện ra với danh sách thông báo

### Thông tin cần có trong mỗi thông báo:

```
┌─────────────────────────────────────────┐
│ 💬 Bình luận mới - CV-001              │  ← Tiêu đề + Mã công việc
│ Nguyễn Văn A đã bình luận trong công   │  ← Tên người + Hành động
│ việc "Báo cáo tháng 11": "Test thông   │  ← Tên công việc + Preview
│ báo lúc 10:30"                         │
│                                 2 phút  │  ← Thời gian
└─────────────────────────────────────────┘
```

### Click vào thông báo:

- ✅ **Kỳ vọng:** Chuyển đến trang chi tiết công việc `/congviec/{id}`
- ❌ **Lỗi:** Không chuyển trang hoặc chuyển sai trang

---

## 📊 Tổng Hợp Các Loại Thông Báo (13 Templates, 15 Triggers)

### Công việc (12 triggers, 10 đang hoạt động)

| #   | Trigger                | Template                | Khi nào gửi                  | Gửi cho                |
| --- | ---------------------- | ----------------------- | ---------------------------- | ---------------------- |
| 1   | Giao việc (legacy)     | TASK_ASSIGNED           | A giao việc cho B            | Người được giao        |
| 2   | Giao việc (transition) | TASK_ASSIGNED           | A giao việc cho B            | Người được giao        |
| 3   | Hủy giao               | TASK_CANCELLED          | A hủy giao việc              | Người được giao        |
| 4   | Hủy hoàn thành tạm     | TASK_REVISION_REQUESTED | A yêu cầu làm lại            | Người được giao        |
| 5   | Tiếp nhận              | TASK_ACCEPTED           | B tiếp nhận việc             | Người giao             |
| 6   | Hoàn thành             | TASK_COMPLETED          | B báo hoàn thành             | Người giao             |
| 7   | Hoàn thành tạm         | TASK_PENDING_APPROVAL   | B báo hoàn thành (chờ duyệt) | Người giao             |
| 8   | Duyệt hoàn thành       | TASK_APPROVED           | A duyệt hoàn thành           | Người được giao        |
| 9   | ~~Từ chối~~            | ~~TASK_REJECTED~~       | ~~(Chưa implement)~~         | -                      |
| 10  | Mở lại                 | TASK_REOPENED           | A mở lại việc đã hoàn thành  | Người được giao        |
| 11  | Bình luận              | COMMENT_ADDED           | Ai đó comment                | Tất cả người liên quan |
| 12  | Deadline sắp đến       | DEADLINE_APPROACHING    | Tự động (Agenda.js)          | Tất cả người liên quan |
| 13  | Quá hạn                | DEADLINE_OVERDUE        | Tự động (Agenda.js)          | Tất cả người liên quan |

### KPI (4 triggers đang hoạt động)

| #   | Trigger        | Template             | Khi nào gửi                 | Gửi cho   |
| --- | -------------- | -------------------- | --------------------------- | --------- |
| 1   | Tạo đánh giá   | KPI_CYCLE_STARTED    | Quản lý tạo KPI mới         | Nhân viên |
| 2   | Duyệt KPI      | KPI_EVALUATED        | Quản lý duyệt KPI           | Nhân viên |
| 3   | Duyệt tiêu chí | KPI_EVALUATED        | Quản lý duyệt theo tiêu chí | Nhân viên |
| 4   | Hủy duyệt      | KPI_APPROVAL_REVOKED | Quản lý hủy duyệt KPI       | Nhân viên |

### Templates/Triggers chưa hoạt động

| #   | Template/Trigger    | Mô tả                | Trạng thái                       |
| --- | ------------------- | -------------------- | -------------------------------- |
| 1   | TASK_REJECTED       | Công việc bị từ chối | ⚠️ Action TU_CHOI chưa implement |
| 2   | TICKET_CREATED      | Yêu cầu hỗ trợ mới   | Module Ticket chưa có            |
| 3   | TICKET_RESOLVED     | Yêu cầu đã xử lý     | Module Ticket chưa có            |
| 4   | SYSTEM_ANNOUNCEMENT | Thông báo hệ thống   | Admin gửi manual                 |

> **✅ Đã implement:** DEADLINE_APPROACHING và DEADLINE_OVERDUE được xử lý tự động bởi Agenda.js

---

## ❌ Troubleshooting - Xử Lý Sự Cố

### Vấn đề 1: Không thấy `[Socket] ✅ Connected` trong Console

**Nguyên nhân có thể:**

- Chưa đăng nhập
- Token hết hạn

**Cách xử lý:**

1. Logout
2. Login lại
3. Kiểm tra Console

---

### Vấn đề 2: Thấy Connected nhưng không nhận thông báo

**Kiểm tra:**

1. Người gửi có đúng quyền không?
2. Người nhận có liên quan đến công việc không?
3. Kiểm tra Console Backend có log `[TriggerService]` không?

---

### Vấn đề 3: Nhận thông báo nhưng click không chuyển trang

**Nguyên nhân:** URL trong thông báo sai

**Báo lại:** Gửi nội dung thông báo cho dev

---

## ✅ Checklist Test Hoàn Chỉnh

```
□ Máy 1 đã login và thấy [Socket] ✅ Connected
□ Máy 2 đã login và thấy [Socket] ✅ Connected
□ Test bình luận: B nhận thông báo ngay (không F5)
□ Test giao việc: B nhận thông báo ngay (không F5)
□ Click thông báo chuyển đến đúng công việc
□ Số trên chuông cập nhật đúng
□ Người bình luận KHÔNG nhận thông báo của chính mình
```

---

## 📞 Liên Hệ Hỗ Trợ

Nếu test không thành công, vui lòng cung cấp:

1. **Screenshot Console** của cả 2 máy (F12 → Console)
2. **Thời điểm test** (giờ:phút)
3. **Hành động cụ thể** đã thực hiện
4. **Kết quả nhận được** vs **Kết quả mong đợi**

---

_Cập nhật: 28/11/2025_
