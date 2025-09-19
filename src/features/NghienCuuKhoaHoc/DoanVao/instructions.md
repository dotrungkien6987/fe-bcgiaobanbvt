# Hướng dẫn triển khai Đoàn Vào

Mục tiêu: Xây dựng module Đoàn Vào theo cùng pattern của Đoàn Ra, khác biệt ở cấu trúc Thành viên (embedded) và trường thời gian.

## 1. Tổ chức file

- DoanVao/
  - DoanVaoTable.js — danh sách + chip `# Tệp` + popover
  - DoanVaoForm.js — form tạo/cập nhật + editor Thành viên + AttachmentSection
  - DoanVaoView.js — chi tiết + bảng Thành viên
  - doanvaoSlice.js — Redux state & thunks
  - api.js — helper gọi BE `/doanvao`
  - README.md — tài liệu kỹ thuật
  - KeHoach_ThucHien_QuanLyDoanVao.md — lộ trình step-by-step

## 2. Redux slice

- State:
  - isLoading, error
  - doanVaos (list), currentDoanVao
  - attachmentsCount: { [id]: number }
- Reducers/Thunks:
  - getDoanVaos, getDoanVaoById
  - createDoanVao, updateDoanVao, deleteDoanVao
  - fetchDoanVaoAttachmentsCount(ids)
  - refreshDoanVaoAttachmentCountOne(id)

Lưu ý: Chuẩn hóa ngày hiển thị `NgayKyVanBanFormatted`, `ThoiGianVaoLamViecFormatted`.

## 3. API helper

- GET `/doanvao`
- GET `/doanvao/:id`
- POST `/doanvao`
- PUT `/doanvao/:id`
- DELETE `/doanvao/:id`

## 4. Table

- Cột: Ngày ký, Số VB, Mục đích, Thời gian vào làm việc, Ghi chú, # Tệp, Actions
- Batch-count attachments khi data thay đổi
- Popover lazy load file (preview/download), nút refresh, giống DoanRaTable
- Expand row render `DoanVaoView`

## 5. Form

- Trường nhập: Ngày ký văn bản, Số văn bản cho phép, Mục đích xuất cảnh, Thời gian vào làm việc, Báo cáo, Ghi chú
- NhanVienID: chọn từ danh sách nhân viên (autocomplete) hoặc mặc định người đăng nhập (nếu phù hợp)
- Editor Thành viên embedded:
  - Bảng nội bộ (MUI) cho phép thêm/xóa dòng, nhập: Tên (bắt buộc), Ngày sinh (bắt buộc), Giới tính (0/1), Chức vụ, Đơn vị công tác, Quốc tịch, Đơn vị giới thiệu
  - Validate bằng Yup schema giống BE validators
- AttachmentSection: upload sau khi có \_id, tương tự DoanRa

## 6. View

- Hiển thị đầy đủ trường + bảng thành viên (đọc từ embedded list)
- Đính kèm: ưu tiên Attachments embed (nếu có), nếu không lazy-fetch `/attachments/DoanVao/:id/file/files`

## 7. UX

- Giữ phong cách và fix như DoanRaForm (guard dialog)
- Toast + loading theo chuẩn dự án

## 8. Kiểm thử nhanh

- Tạo 1 Đoàn Vào, thêm vài thành viên embedded, lưu
- Upload 1-2 tệp, đóng form → kiểm tra chip `# Tệp` cập nhật
- Mở chi tiết hàng → bảng thành viên hiển thị đủ cột

## 9. Cải tiến đề xuất

- Thêm filter “Có tệp” ở bảng
- Tận dụng `/api/doanvao/stats` để làm widget thống kê tháng
- Autocomplete Quốc tịch bằng danh sách chuẩn
