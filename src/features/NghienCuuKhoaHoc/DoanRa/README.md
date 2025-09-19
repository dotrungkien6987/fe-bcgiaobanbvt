# Đoàn Ra — Tài liệu kỹ thuật

Tài liệu này mô tả kiến trúc, API map FE/BE, data model, các luồng chính (CRUD + đính kèm), và các lưu ý triển khai theo chuẩn của dự án.

## 1. Kiến trúc tổng quan

- React 18 + Redux Toolkit + MUI v5
- Thư mục: `NghienCuuKhoaHoc/DoanRa`
  - DoanRaTable: danh sách
  - DoanRaForm: form tạo/cập nhật + upload tệp
  - DoanRaView: chi tiết (expand row)
  - SelectNhanVienTable: chọn thành viên
  - doanraSlice: Redux state & thunks

## 2. Data model (FE)

- NgayKyVanBan (date)
- SoVanBanChoPhep (string)
- MucDichXuatCanh (string)
- ThoiGianXuatCanh (date)
- QuocGiaDen (string)
- NguonKinhPhi (string)
- BaoCao (string)
- GhiChu (string)
- ThanhVien (string[]) — danh sách ObjectId nhân viên
- Attachments (array of { url?, fileName?, mimeType?, size?, publicId? })
  - Legacy fallback: TaiLieuKemTheo (string[])

## 3. Thunks chính

- getDoanRas, getDoanRaById
- createDoanRa, updateDoanRa, deleteDoanRa
- fetchDoanRaAttachmentsCount(ids)
- refreshDoanRaAttachmentCountOne(id)

Chuẩn hóa ngày sang `NgayKyVanBanFormatted`, `ThoiGianXuatCanhFormatted` để hiển thị.

## 4. Attachments — Flow & Endpoints

- Bảng hiển thị cột `# Tệp` — click mở popover và lazy-load danh sách file theo bản ghi.
- Tải trước số lượng tệp bằng batch-count khi bảng thay đổi.
- Sau upload/xóa trong form, refresh đếm cho 1 id và xóa cache popover.
- DoanRaView: nếu không có embed Attachments, lazy-fetch:
  - GET `/api/attachments/DoanRa/:id/file/files?size=50`

Các endpoint liên quan (BE):

- POST `/api/attachments/:ownerType/:ownerId/:field?/files` — upload (multipart: files[])
- GET `/api/attachments/:ownerType/:ownerId/:field?/files` — list files
- POST `/api/attachments/batch-count` — batch đếm
- GET `/api/attachments/files/:id/inline` — xem trước
- GET `/api/attachments/files/:id/download` — tải xuống

## 5. DoanRaView — Thành viên & chi tiết

- Hiển thị đầy đủ các trường: Số VB, Ngày ký, Thời gian xuất cảnh, Quốc gia đến, Nguồn kinh phí, Báo cáo, Mục đích, Ghi chú.
- Thành viên: nếu BE chưa populate đủ, FE làm giàu từ Redux `nhanvien` (gọi `getAllNhanVien` nếu cần) để hiển thị: Khoa, Chức danh, Chức vụ, Trình độ, Dân tộc, Giới tính, Ngày sinh.

## 6. BE mapping — Đoàn Ra

- GET `/api/doanra` — lấy danh sách (populate cơ bản: HoTen, MaNV, KhoaID, ChucDanh/ChucVu)
- GET `/api/doanra/:id` — chi tiết
- POST `/api/doanra` — tạo mới (validate NgayKyVanBan, QuocGiaDen; ThanhVien optional array)
- PUT `/api/doanra/:id` — cập nhật (validate cơ bản)
- DELETE `/api/doanra/:id` — soft delete

## 7. UX lưu ý

- Form chặn auto close bởi backdrop/ESC; sau khi tạo giữ form mở để upload tệp.
- Popover danh sách file có nút làm mới, đồng bộ lại đếm.

## 8. Edge cases

- Chỉ có ID thành viên: hiển thị chip ID kèm cảnh báo populate nếu không làm giàu được từ store.
- Dữ liệu ngày không hợp lệ: không render FieldItem.

## 9. Chạy thử nhanh

1. Mở trang Đoàn Ra, kiểm tra cột `# Tệp` và mở popover.
2. Thêm mới 1 Đoàn Ra, lưu, sau đó upload tệp trong form.
3. Đóng form, đếm tệp cập nhật.
4. Mở chi tiết hàng, kiểm tra bảng thành viên đủ cột.

## 10. Đề xuất cải tiến

- Filter "Chỉ hiện có tệp" trong bảng dựa trên attachmentsCount > 0.
- BE phân trang/tìm kiếm cho `/api/doanra` (page, limit, search, from/to, quocGia).
- Mở rộng populate ThanhVien để trả thêm NgaySinh, GioiTinh, DanToc, TrinhDo.
- Thao tác rename/xóa file ngay trong popover (đã có endpoint DELETE/PATCH).
