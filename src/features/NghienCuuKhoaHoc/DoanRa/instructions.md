## Hướng dẫn module Đoàn Ra (cập nhật)

Tài liệu này mô tả trạng thái hiện tại của module Đoàn Ra, kiến trúc FE/BE, luồng dữ liệu, và các lưu ý triển khai theo chuẩn của dự án.

## 1) Tổng quan & Kiến trúc

- Frontend: React 18 + Redux Toolkit + MUI v5 theo pattern slice/thunk chuẩn của dự án.
- Các thành phần chính:
  - `DoanRaTable`: danh sách với hành động, cột meta tệp (# Tệp) và hàng chi tiết mở rộng.
  - `DoanRaForm`: popup form Thêm/Sửa, hỗ trợ upload tệp sau khi có \_id.
  - `DoanRaView`: phần chi tiết (expand row) hiển thị đầy đủ trường và danh sách thành viên, tệp đính kèm.
  - `SelectNhanVienTable`: chọn nhiều nhân viên làm thành viên đoàn.
  - `doanraSlice`: Redux state, thunks CRUD, meta số lượng tệp (batch count) và refresh một id.

## 2) Trường dữ liệu chính (FE)

- Ngày ký văn bản (NgayKyVanBan)
- Số văn bản cho phép (SoVanBanChoPhep)
- Mục đích xuất cảnh (MucDichXuatCanh)
- Thời gian xuất cảnh (ThoiGianXuatCanh)
- Quốc gia đến (QuocGiaDen)
- Nguồn kinh phí (NguonKinhPhi)
- Báo cáo (BaoCao)
- Ghi chú (GhiChu)
- Thành viên (ThanhVien) — mảng ObjectId (FE gửi mảng ID)
- Đính kèm (Attachments) — mảng object chuẩn hóa. Hỗ trợ fallback legacy `TaiLieuKemTheo` (string[]) để đọc.

## 3) Luồng CRUD (Redux Slice)

- getDoanRas: lấy danh sách (không phân trang ở hiện tại BE), normalize ngày => `NgayKyVanBanFormatted`, `ThoiGianXuatCanhFormatted`.
- getDoanRaById: lấy chi tiết, normal hóa tương tự.
- createDoanRa: tạo mới. Sau khi tạo thành công, set `currentDoanRa` để form có \_id và có thể upload tệp ngay.
- updateDoanRa: cập nhật hiện hành và đồng bộ vào `doanRas`.
- deleteDoanRa: soft delete (BE thực hiện). Xóa khỏi danh sách FE.

Lưu ý: Khi gửi lên, FE luôn dùng `Attachments` (object array). Nếu phát hiện dữ liệu form có `TaiLieuKemTheo` (legacy), slice sẽ chuyển sang `Attachments` trước khi gửi và loại bỏ field legacy khỏi payload.

## 4) Quản lý tệp đính kèm (Attachments)

- UX: hiển thị cột `# Tệp` trong bảng; click vào chip mở Popover lazy-load danh sách file theo bản ghi; hỗ trợ xem trước/tải xuống.
- Đếm tệp (batch): khi bảng load, FE gọi batch count cho danh sách id (ownerType="DoanRa", field="file"). Map kết quả về `attachmentsCount[id]`.
- Refresh một id: sau upload/xóa trong form hoặc bấm làm mới ở popover, FE gọi refresh cho 1 id và xóa cache popover.
- DoanRaView: ưu tiên hiển thị `Attachments` embed; nếu không có thì lazy-fetch qua API `/attachments/DoanRa/:id/file/files` (size ~50) và render danh sách.

Endpoints BE liên quan (đã có sẵn):

- POST `/api/attachments/:ownerType/:ownerId/:field?/files` — upload
- GET `/api/attachments/:ownerType/:ownerId/:field?/files` — list
- GET `/api/attachments/:ownerType/:ownerId/:field?/files/count` — count (không dùng trực tiếp, FE ưu tiên batch)
- POST `/api/attachments/batch-count` — batch count
- GET `/api/attachments/files/:id/inline` — stream xem trước
- GET `/api/attachments/files/:id/download` — tải xuống
- DELETE `/api/attachments/files/:id` — xóa tệp

## 5) Thành viên (ThanhVien) và làm giàu dữ liệu

- BE populate hiện tại cho `ThanhVien`: `HoTen Ten MaNhanVien MaNV username KhoaID TenKhoa ChucDanh ChucDanhID ChucVu ChucVuID`.
- Một số cột UI cần thêm (Ngày sinh, Giới tính, Dân tộc, Trình độ). Do đó `DoanRaView` sẽ làm giàu từ Redux `nhanvien` khi cần:
  - Nếu `ThanhVien` chỉ là ID hoặc thiếu field, FE tra cứu `nhanviens` theo `_id/MaNV/username` để lấp đủ: `NgaySinh`, `GioiTinh`, `DanToc`, `TrinhDo`...
  - FE sẽ gọi `getAllNhanVien()` nếu store chưa có dữ liệu, sau đó render đủ các cột.

## 6) Mapping API BE (DoanRa)

- `GET /api/doanra` — lấy danh sách (đang không phân trang) và đã populate một số trường thành viên.
- `GET /api/doanra/:id` — chi tiết.
- `POST /api/doanra` — tạo mới (yêu cầu `NgayKyVanBan`, `QuocGiaDen`; `ThanhVien` mảng ObjectId nếu gửi).
- `PUT /api/doanra/:id` — cập nhật (validate cơ bản các trường ngày và `ThanhVien`).
- `DELETE /api/doanra/:id` — soft delete.

## 7) Lưu ý triển khai

- Date: sử dụng dayjs, FE chuẩn hóa và hiển thị `DD/MM/YYYY`.
- Không chỉnh sửa `CommonTable` theo yêu cầu — các fix nằm ở cấp feature.
- Form Đoàn Ra bật cơ chế chặn đóng dialog do click backdrop/ESC để tránh auto-close khi click từ hàng table.
- Khi tạo mới xong, form vẫn mở để người dùng upload tệp ngay.

## 8) Edge cases & xử lý

- `ThanhVien` chỉ chứa ID: View sẽ hiển thị chip ID và cảnh báo populate nếu không thể làm giàu từ store.
- Không embed `Attachments`: View tự fetch từ API và hiển thị loading/empty state rõ ràng.
- Dữ liệu ngày null/không hợp lệ: ẩn FieldItem tương ứng.

## 9) Kiểm thử nhanh

- Tạo một Đoàn Ra mới, sau đó upload tệp → chip `# Tệp` cập nhật ngay sau khi đóng form hoặc khi nhận sự kiện `attachmentsChanged`.
- Mở chi tiết hàng: thấy đầy đủ trường (Số VB, Quốc gia, Nguồn kinh phí, Báo cáo, Mục đích, Ghi chú...) và bảng Thành viên đủ cột.

## 10) Việc cần làm thêm (đề xuất cải tiến)

- Thêm filter “Chỉ hiển thị có tệp” trên bảng (dựa vào `attachmentsCount` > 0).
- BE: mở rộng populate `ThanhVien` để trả thêm `NgaySinh`, `GioiTinh`, `DanTocID`/`DanToc`, `TrinhDo...` giúp FE không phải làm giàu.
- BE: bổ sung phân trang/tìm kiếm cho `GET /api/doanra` (page, limit, search, fromDate, toDate, quocGia).
- FE: thêm nút xóa/đổi tên tệp ngay trong popover; confirm trước khi xóa.
- Cải thiện A11y: tooltip title đầy đủ, focus ring cho chip và hành động bàn phím.
