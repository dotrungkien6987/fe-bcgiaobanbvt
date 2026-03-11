# HƯỚNG DẪN SỬ DỤNG — QUẢN LÝ QUY TRÌNH ISO

**Phiên bản:** 1.0 | **Cập nhật:** 10/03/2026

---

## PHÂN QUYỀN

| Quyền                | Vai trò                                              |
| -------------------- | ---------------------------------------------------- |
| `qlcl`, `admin`      | Quản lý toàn bộ: tạo, sửa, xóa, phát hành, phân phối |
| Tất cả quyền còn lại | Xem danh sách quy trình được phân phối cho khoa mình |

---

## USER STORIES

---

### 👤 US-01 — Xem tổng quan Dashboard _(Tất cả quyền)_

**Người dùng muốn:** Nắm nhanh tình hình quy trình ISO hiện tại.

**Thực hiện:**

1. Vào menu **Quy trình ISO - Quản lý → Tài liệu ISO → 📊 Tổng quan**

**Kết quả hiển thị:**

- Tổng số tài liệu, số quy trình riêng biệt, tổng file PDF, tổng biểu mẫu Word
- Biểu đồ phân bố theo khoa xây dựng
- 10 tài liệu cập nhật gần nhất (sắp xếp theo thời gian chỉnh sửa)

> **Lưu ý:** Người dùng không thuộc phòng QLCL chỉ thấy số liệu của quy trình đã được phân phối cho khoa mình.

---

### 👤 US-02 — Tạo quy trình ISO mới _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Đăng ký một quy trình ISO mới vào hệ thống.

**Thực hiện:**

1. Vào menu **📄 Danh sách quy trình** → bấm **+ Thêm quy trình mới**  
   _(hoặc vào trực tiếp menu **➕ Thêm quy trình mới**)_
2. Điền đầy đủ thông tin bắt buộc:
   - **Mã quy trình** _(VD: QT-001 — chỉ chữ, số, dấu gạch ngang)_
   - **Tên quy trình**
   - **Phiên bản** _(mặc định: 1.0)_
   - **Khoa xây dựng** _(chọn từ danh sách)_
   - **Ngày hiệu lực**
   - **Ghi chú** _(tùy chọn)_
3. Bấm **💾 Lưu & Tiếp tục** → hệ thống chuyển sang trang chỉnh sửa để upload file.

> **Lưu ý:** Mã quy trình + Phiên bản phải là duy nhất trong hệ thống.

---

### 👤 US-03 — Upload file PDF và biểu mẫu Word _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Đính kèm tài liệu PDF chính thức và các biểu mẫu Word.

**Thực hiện:** _(trên trang **Chỉnh sửa** sau khi tạo mới)_

1. **📄 File PDF quy trình** (tối đa 1 file):
   - Bấm **Chọn file PDF** hoặc kéo thả file `.pdf` vào vùng upload
   - Muốn thay thế: xóa file cũ → upload file mới
2. **📑 Biểu mẫu Word** (không giới hạn số lượng):
   - Kéo thả 1 hoặc nhiều file `.doc`/`.docx` vào vùng upload
3. Bấm **💾 Lưu** để hoàn tất.

---

### 👤 US-04 — Phát hành quy trình _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Công bố quy trình để các khoa được phân phối có thể xem.

**Thực hiện:**

1. Vào **Chi tiết** quy trình (trạng thái _Nháp_ hoặc _Đã thu hồi_)
2. Bấm **Phát hành**
3. Xác nhận trong hộp thoại

**Kết quả:** Trạng thái chuyển thành **Hiệu lực**. Các phiên bản cũ hơn cùng mã quy trình tự động chuyển sang **Đã thu hồi**. Nếu phiên bản mới chưa có danh sách phân phối, hệ thống **tự động sao chép danh sách phân phối** từ phiên bản cũ để các khoa không bị mất quyền truy cập.

---

### 👤 US-05 — Thu hồi quy trình _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Tạm ngừng hiệu lực của một quy trình.

**Thực hiện:**

1. Vào **Chi tiết** quy trình (trạng thái _Hiệu lực_)
2. Bấm **Thu hồi**
3. Xác nhận trong hộp thoại

**Kết quả:** Trạng thái chuyển thành **Đã thu hồi**. Các khoa được phân phối sẽ không còn thấy quy trình này.

---

### 👤 US-06 — Tạo phiên bản mới _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Cập nhật quy trình với phiên bản mới thay vì sửa trực tiếp.

**Thực hiện:**

1. Vào **Chi tiết** quy trình cần nâng phiên bản
2. Bấm **➕ Tạo phiên bản mới**
3. Nhập số phiên bản mới _(VD: 2.0)_
4. Tích chọn **Copy biểu mẫu từ phiên bản cũ** nếu muốn giữ lại các file Word
5. Bấm **Tạo**

**Kết quả:** Hệ thống tạo bản ghi mới (cùng mã, phiên bản mới), **tự động sao chép danh sách phân phối** từ phiên bản hiện tại, và chuyển sang trang chỉnh sửa. Phiên bản cũ vẫn giữ nguyên trạng thái.

---

### 👤 US-07 — Quản lý phân phối quy trình _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Chỉ định các khoa nào được nhận và xem quy trình này.

**Thực hiện:**

1. Vào menu **📄 Danh sách quy trình** — cột **Phân Phối** hiển thị chip số khoa đang được phân phối _(VD: "5 khoa")_
2. Tìm quy trình cần phân phối (tìm kiếm theo tên / mã, lọc theo khoa xây dựng, trạng thái)
3. Bấm trực tiếp vào **chip số khoa** trong cột **Phân Phối** của quy trình
4. Trong hộp thoại:
   - Tìm kiếm tên khoa
   - Tích/bỏ tích các khoa nhận quy trình
   - Bấm _Chọn tất cả_ hoặc _Bỏ chọn tất cả_ nếu cần
5. Bấm **💾 Lưu thay đổi**

> **Lưu ý:** Khoa xây dựng quy trình không xuất hiện trong danh sách phân phối (không tự phân phối cho chính khoa đó). Chức năng phân phối được tích hợp trực tiếp trong trang danh sách quy trình, không cần vào trang riêng.

---

### 👤 US-08 — Quản lý danh sách khoa ISO _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Cấu hình khoa nào được tham gia hệ thống ISO (có thể chọn phân phối).

**Thực hiện:**

1. Vào menu **⚙️ Quản lý khoa ISO**
2. Tích/bỏ tích cột **ISO** để bật/tắt từng khoa
3. Muốn bật/tắt nhiều khoa cùng lúc: chọn checkbox hàng → bấm **Cập nhật hàng loạt**
4. Khi tắt khoa ISO có bản ghi phân phối → hệ thống hỏi xác nhận xóa phân phối liên quan

---

### 👤 US-09 — Xem danh sách quy trình được phân phối _(Người dùng thông thường)_

**Người dùng muốn:** Tìm và đọc quy trình ISO áp dụng cho khoa mình.

**Thực hiện:**

1. Vào menu **📥 QT được phân phối**
2. Tìm kiếm theo tên hoặc mã quy trình
3. Lọc theo khoa xây dựng nếu cần
4. Bấm **Xem** để vào chi tiết

**Lưu ý:** Chỉ hiển thị quy trình trạng thái **Hiệu lực** được phân phối cho khoa của người dùng. Quy trình mới trong 30 ngày có nhãn **Mới**.

---

### 👤 US-10 — Xem chi tiết và đọc PDF quy trình _(Tất cả quyền)_

**Người dùng muốn:** Đọc nội dung quy trình và tải biểu mẫu về dùng.

**Thực hiện từ trang chi tiết:**

- **Xem PDF online:** Bấm **👁️ Xem** bên cạnh file PDF → PDF mở ngay trong trình duyệt
- **Tải file:** Bấm **⬇️ Tải về** bên cạnh file cần tải (PDF hoặc Word)
- **Xem lịch sử phiên bản:** Xem panel bên phải, các phiên bản cũ được liệt kê theo thứ tự

---

### 👤 US-11 — Xem quy trình do khoa mình xây dựng _(Người dùng thông thường)_

**Người dùng muốn:** Theo dõi các quy trình mà khoa mình chịu trách nhiệm soạn thảo.

**Thực hiện:**

1. Vào menu **🏗️ QT khoa xây dựng**
2. Xem danh sách, biết quy trình đã được phân phối cho bao nhiêu khoa khác

---

### 👤 US-12 — Chỉnh sửa thông tin quy trình _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Cập nhật thông tin mô tả của quy trình.

**Thực hiện:**

1. Vào **Chi tiết** quy trình → bấm **✏️ Chỉnh sửa**
2. Sửa các trường cần thiết (tên, mã, phiên bản, khoa, ngày hiệu lực, ghi chú)
3. Có thể upload thêm / xóa file ngay trên trang này
4. Bấm **💾 Lưu**

---

### 👤 US-13 — Xóa quy trình _(Chỉ QLCL / Admin)_

**Người dùng muốn:** Loại khỏi hệ thống một quy trình không còn cần thiết.

**Thực hiện:**

1. Trên **Danh sách quy trình**, bấm nút **⋮** (menu hành động) của quy trình cần xóa
2. Chọn **Xóa**
3. Xác nhận trong hộp thoại cảnh báo

> **Lưu ý:** Xóa mềm — dữ liệu vẫn lưu trong cơ sở dữ liệu nhưng không hiển thị.

---

## TRẠNG THÁI QUY TRÌNH

```
NHÁP (DRAFT)
  │  Phát hành ↓
HIỆU LỰC (ACTIVE)   ←── Tự động thu hồi phiên bản cũ khi phát hành phiên bản mới
  │  Thu hồi ↓
ĐÃ THU HỒI (INACTIVE)
  │  Phát hành lại ↑
HIỆU LỰC (ACTIVE)
```

| Trạng thái | Màu     | QLCL thấy | Người dùng thấy  | Phân phối được |
| ---------- | ------- | --------- | ---------------- | -------------- |
| Nháp       | Xám     | ✅        | ❌               | ❌             |
| Hiệu lực   | Xanh lá | ✅        | ✅ (nếu được PP) | ✅             |
| Đã thu hồi | Cam     | ✅        | ❌               | ❌             |

---

## LƯU Ý QUAN TRỌNG

- **Mã quy trình** phải viết liền, không dấu, chỉ chứa chữ in hoa, số và `-` _(VD: QT-001, ISO-TS-01)_
- **File PDF**: mỗi quy trình chỉ lưu được **1 file PDF** — muốn thay thế phải xóa file cũ trước
- **Biểu mẫu Word**: không giới hạn số lượng
- Chỉ quy trình **Hiệu lực** mới có thể phân phối cho khoa
- Phát hành phiên bản mới → **tự động thu hồi** các phiên bản cũ cùng mã

---

_Mọi thắc mắc liên hệ Phòng CNTT hoặc Phòng Quản lý Chất lượng._
