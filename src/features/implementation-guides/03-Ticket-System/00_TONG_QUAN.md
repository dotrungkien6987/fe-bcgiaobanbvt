# 📋 Hệ Thống Yêu Cầu - Tổng Quan

> **Trạng thái**: ✅ Nghiệp vụ hoàn thành - Sẵn sàng implement  
> **Cập nhật**: 28/11/2025

---

## 🎯 Mục Đích

Hệ thống **Yêu Cầu** (Internal Service Desk) cho phép:

- Nhân viên gửi yêu cầu hỗ trợ đến **khoa khác** hoặc **nội bộ khoa**
- Điều phối và theo dõi xử lý yêu cầu
- Đánh giá chất lượng dịch vụ
- Liên kết với **Nhiệm vụ thường quy** để đánh giá KPI

---

## 🔄 So Sánh Với CongViec (Công Việc)

| Khía cạnh      | CongViec                                 | YeuCau                              |
| -------------- | ---------------------------------------- | ----------------------------------- |
| **Quan hệ**    | Quản lý → Nhân viên (cấp trên giao việc) | Khoa ↔ Khoa (peer-to-peer, phục vụ) |
| **Nguồn gốc**  | Người quản lý tạo                        | Bất kỳ nhân viên nào                |
| **Người nhận** | Chỉ định cụ thể                          | Đến Khoa (chung) hoặc Cá nhân       |
| **Điều phối**  | Không có                                 | Có (người điều phối khoa)           |
| **Đánh giá**   | KPI theo chu kỳ                          | Đánh giá hài lòng từng yêu cầu      |

---

## 📊 Tổng Quan Nghiệp Vụ

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLOW TỔNG QUAN HỆ THỐNG                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   👤 NGƯỜI GỬI              🏥 KHOA NHẬN                        │
│   (Khoa A)                  (Khoa B - VD: CNTT)                 │
│                                                                  │
│   ┌─────────┐               ┌─────────────────────────┐         │
│   │ Tạo yêu │──────────────►│ Inbox Khoa             │         │
│   │ cầu     │               │ (Danh sách yêu cầu mới)│         │
│   └─────────┘               └───────────┬─────────────┘         │
│                                         │                        │
│                             ┌───────────┼───────────┐           │
│                             ▼           ▼           ▼           │
│                        [Tiếp nhận] [Từ chối] [Điều phối]       │
│                             │                       │           │
│                             │                       ▼           │
│                             │              NV được điều phối    │
│                             │              nhận thông báo       │
│                             ▼                       │           │
│                        ┌─────────┐                  │           │
│                        │ Xử lý   │◄─────────────────┘           │
│                        │ yêu cầu │                              │
│                        └────┬────┘                              │
│                             │                                    │
│                             ▼                                    │
│   ┌─────────┐          ┌─────────┐                              │
│   │ Đánh giá│◄─────────│Hoàn thành│                              │
│   │ ⭐⭐⭐⭐⭐│          └─────────┘                              │
│   └─────────┘                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Tài Liệu

| File                                                     | Mô tả                        | Trạng thái |
| -------------------------------------------------------- | ---------------------------- | :--------: |
| [00_TONG_QUAN.md](./00_TONG_QUAN.md)                     | Tổng quan hệ thống           |     ✅     |
| [01_NGHIEP_VU_CHI_TIET.md](./01_NGHIEP_VU_CHI_TIET.md)   | Chi tiết nghiệp vụ từng phần |     ✅     |
| [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md)         | Thiết kế database            |     ✅     |
| [03_STATE_MACHINE.md](./03_STATE_MACHINE.md)             | Quản lý trạng thái           |     ✅     |
| [04_BACKEND_API.md](./04_BACKEND_API.md)                 | API endpoints                |     📝     |
| [05_FRONTEND_COMPONENTS.md](./05_FRONTEND_COMPONENTS.md) | React components             |     📝     |

**Chú thích**: ✅ Hoàn thành | 🚧 Đang làm | 📝 Chưa bắt đầu

---

## ✅ Các Phần Đã Thống Nhất

### Phần 1: Danh Mục & Cấu Hình

- ✅ DanhMucYeuCau: Mỗi khoa tự quản lý loại yêu cầu
- ✅ LyDoTuChoi: Danh mục chung toàn hệ thống
- ✅ CauHinhThongBaoKhoa: Cấu hình người điều phối

### Phần 2: Tạo Yêu Cầu

- ✅ Field bắt buộc: Tiêu đề, Mô tả
- ✅ Không cần mức độ ưu tiên
- ✅ Cho phép file đính kèm (tham khảo CongViec)
- ✅ Cho phép yêu cầu nội bộ khoa
- ✅ Gửi đến KHOA hoặc CÁ NHÂN
- ✅ Snapshot danh mục khi tạo

### Phần 3: Tiếp Nhận & Điều Phối

- ✅ Gửi đến KHOA: Người điều phối có 3 action (Tiếp nhận / Từ chối / Điều phối)
- ✅ Gửi đến CÁ NHÂN: Người nhận có 3 action (Tiếp nhận / Từ chối / Gửi về khoa)
- ✅ NV được điều phối: 3 action (Tiếp nhận / Từ chối thẳng / Gửi về khoa) - KHÔNG thể điều phối tiếp
- ✅ Không giới hạn số lần điều phối
- ✅ Thời gian hẹn = Tiếp nhận + Thời gian dự kiến (cho phép chỉnh)
- ✅ Toàn bộ khoa thấy tất cả yêu cầu, chỉ khác luồng thông báo
- ✅ Ghi lại lịch sử (LichSuYeuCau)

---

## 🔑 Các Quyết Định Thiết Kế Quan Trọng

### 1. Snapshot Danh Mục (Không dùng chu kỳ)

- Khi tạo yêu cầu → "chụp ảnh" thông tin danh mục vào yêu cầu
- Danh mục có thể cập nhật tự do mà không ảnh hưởng yêu cầu cũ
- Đơn giản hơn versioning/chu kỳ

### 2. Gửi Đến Khoa hoặc Cá Nhân

- **Đến Khoa**: Thông báo đến người điều phối (theo cấu hình)
- **Đến Cá nhân**: Thông báo trực tiếp người được chỉ định

### 3. Visibility

- Tất cả nhân viên trong khoa đều thấy toàn bộ yêu cầu gửi đến khoa
- Chỉ khác nhau về **luồng thông báo**

### 4. Lý Do Từ Chối

- Danh mục chung toàn hệ thống (không riêng từng khoa)
- Bắt buộc chọn lý do khi từ chối

### Phần 4: Xử Lý & Hoàn Thành ✅

- ✅ Gộp DA_TIEP_NHAN và DANG_XU_LY → Chỉ dùng `DANG_XU_LY`
- ✅ Không cần % tiến độ, cho phép đổi thời gian hẹn + bình luận/file
- ✅ Tự động đóng sau **3 ngày** kể từ hoàn thành
- ✅ Mở lại trong **7 ngày** sau khi đóng (không giới hạn số lần)
- ✅ Mở lại giữ đánh giá cũ, chỉ clear sau khi xử lý lại
- ✅ Hủy giữa chừng → về `MOI` (gỡ người xử lý)
- ✅ **Appeal**: TU_CHOI → MOI (yêu cầu nhập lý do, không giới hạn lần)
- ✅ Xóa yêu cầu: Chỉ khi ở `MOI` (hard delete)
- ✅ Điều phối viên tự tiếp nhận: 1 click

### Phần 5: Đánh Giá & Dashboard KPI ✅

- ✅ Thang đánh giá: 1-5 sao + nhận xét text (tùy chọn)
- ✅ Không bắt buộc đánh giá, mặc định 5⭐
- ✅ Dashboard review ticket tích hợp trong trang chấm KPI
- ✅ Vị trí: Tab "Xử lý yêu cầu" trong expand row (song song tab "Công việc")
- ✅ 5 Metrics: Số nhận, Số hoàn thành, Tỷ lệ đúng hẹn, Điểm TB, TG xử lý TB
- ✅ Filter: Theo chu kỳ KPI, NV là người xử lý (`NguoiXuLyID`)

---

## 📅 Kế Hoạch Triển Khai

| Giai đoạn | Nội dung                    |   Trạng thái    |
| --------- | --------------------------- | :-------------: |
| 1         | Nghiệp vụ chi tiết (5 phần) |       ✅        |
| 2         | Database Schema             |  🚧 Cần review  |
| 3         | State Machine               |  🚧 Cần review  |
| 4         | Backend API                 | 📝 Chưa bắt đầu |
| 5         | Frontend Components         | 📝 Chưa bắt đầu |

---

## 📚 Tài Liệu Liên Quan

- [Notification System](../02-Notification-System/00_QUICK_REFERENCE.md) - Tích hợp thông báo
- [CongViec Documentation](../../../giaobanbv-be/modules/workmanagement/docs/) - Tham khảo pattern
