# Đặc tả nghiệp vụ: Quản lý Bài đăng trong Tập san

Phiên bản: 1.0 (2025-09-12)
Phạm vi: Frontend `fe-bcgiaobanbvt` + Backend `giaobanbv-be`
Ngữ cảnh liên quan: `features/NghienCuuKhoaHoc/TapSan` (FE), `models/controllers/routes` TapSan + Attachments (BE)

1. Mục tiêu

- Mỗi Tập san quản lý danh sách Bài đăng (~20 bài/số).
- Theo dõi thông tin: Tên bài báo, Tác giả chính + Đồng tác giả (NhanVienID), Loại hình bài báo (enum), Khối chuyên môn (enum), Mã bài báo (tự sinh), File đính kèm, Người thẩm định (NhanVienID), số thứ tự bài báo trong tập san.
- Không quản lý trạng thái quy trình trong giai đoạn này.
- UI/UX hiện đại, sang trọng với Material Design 3, cards, animations, drag-drop, responsive.

2. Ràng buộc và quyết định đã chốt

- Loại Tập san: `YHTH` (Y học thực hành), `TTT` (Thông tin thuốc). Mỗi loại mỗi năm có 2 số, mỗi số ~20 bài.
- Không bắt buộc phải có file đính kèm.
- Không quản lý trạng thái bài đăng ở phase này (loại bỏ toàn bộ trạng thái).
- Tác giả: hỗ trợ 2 nguồn: `Nội viện` (dùng `TacGiaChinhID` ref NhanVien và `DongTacGiaIDs[]` ref NhanVien, cấm trùng với `TacGiaChinhID`) hoặc `Ngoại viện` (dùng chuỗi tự do `TacGiaNgoaiVien`).
- `SoThuTu` do người dùng quyết định; đảm bảo duy nhất trong 1 Tập san (xét `isDeleted=false`).
- `MaBaiBao` hiển thị được sinh từ `TapSan` + `SoThuTu`: `{Loai}-{Nam}-{So}-{SoThuTuPad2}`. Thay đổi khi `SoThuTu` đổi.
- Page riêng cho CRUD bài đăng (không dùng Drawer).
- Có Export danh sách theo bộ lọc (CSV/Excel; tối thiểu CSV).

3. Design System đã cập nhật (Modern UI/UX)

- **Theme**: Material-UI với primary/secondary colors, proper spacing (8px grid)
- **Cards**: Elevation 0-2, border radius 8-16px, proper shadows on hover
- **Typography**: Consistent font weights (400, 500, 600, 700), proper hierarchy
- **DataGrid**: Professional với filters, search, pagination, empty states, loading skeletons
- **Forms**: Sections với icons, validation states, preview, progress indicators

4. Schema Bài báo (BE)

- Bắt buộc chung: `TapSanId`, `TieuDe`, `KhoiChuyenMon` (enum: `noi`, `ngoai`, `dieu-duong`, `phong-ban`, `can-lam-sang`), `SoThuTu` (>=1).
- YHTH: bắt buộc `LoaiHinh` (enum: `ky-thuat-moi`, `nghien-cuu-khoa-hoc`, `ca-lam-sang`).
- TTT: thay `LoaiHinh` bằng `NoiDungChuyenDe` (enum) và `NguonTaiLieuThamKhao` (URL hợp lệ).
- Tác giả: `TacGiaLoai` = `noi-vien` → bắt buộc `TacGiaChinhID` và cho phép `DongTacGiaIDs[]` (không trùng với `TacGiaChinhID`); `TacGiaLoai` = `ngoai-vien` → bắt buộc `TacGiaNgoaiVien` và bỏ qua `TacGiaChinhID`, `DongTacGiaIDs`.
- Tuỳ chọn: `DongTacGiaIDs[]`, `TomTat`, `GhiChu`, `NguoiThamDinhID`.
- Tự sinh: `MaBaiBao` = `{LoaiTapSan}-{Nam}-{So}-{SoThuTuPad2}`.
- Index: unique partial `{TapSanId, SoThuTu}` với `isDeleted=false`; chỉ mục lọc theo `KhoiChuyenMon`, `LoaiHinh` hoặc `NoiDungChuyenDe` theo loại; tìm kiếm theo `TieuDe`, `MaBaiBao`.

5. API Bài báo (BE)

- GET `/:tapSanId/baibao`: filter `search`, `khoiChuyenMon`, `loaiHinh` (áp dụng cho YHTH); hỗ trợ hiển thị `NoiDungChuyenDe` cho TTT; sort mặc định `SoThuTu asc`.
- POST `/:tapSanId/baibao`: validate theo loại TapSan (YHTH vs TTT) + kiểm tra trùng `SoThuTu` trong tập san.
- PUT `/baibao/:id`: cho phép đổi `SoThuTu` (revalidate) và cập nhật thông tin; áp dụng quy tắc `TacGiaLoai` và loại TapSan.
- DELETE `/baibao/:id`: soft delete.
- PATCH `/:tapSanId/baibao/reorder`: nhận mảng `{id, SoThuTu}` và cập nhật hàng loạt.
- ĐÃ XÓA: endpoint thống kê theo trạng thái.

6. UI/UX (FE)

- Danh sách: cột `MaBaiBao`, `SoThuTu`, `TieuDe`, `Phân loại` (YHTH: `LoaiHinh`; TTT: `NoiDungChuyenDe`), `KhoiChuyenMon`, `Tác giả` (Ngoại viện hiển thị `TacGiaNgoaiVien`; Nội viện hiển thị `TacGiaChinh`), `Đồng tác giả (số lượng)` (0 nếu Ngoại viện), `Tệp`, `Thao tác`.
- Sắp xếp mặc định theo `SoThuTu` tăng dần; hỗ trợ tìm kiếm theo tiêu đề/mã bài báo; filter theo `KhoiChuyenMon`, `LoaiHinh` (YHTH).
- Form: RHF+Yup điều kiện theo `TapSan.Loai`: YHTH hiển thị `LoaiHinh`; TTT hiển thị `NoiDungChuyenDe` + `NguonTaiLieuThamKhao`. Tác giả có radio `Nội viện`/`Ngoại viện`: Nội viện dùng selector nhân viên cho `TacGiaChinhID` + `DongTacGiaIDs (multi)`; Ngoại viện hiển thị `TacGiaNgoaiVien` (text). Không cho phép trùng tác giả chính trong danh sách đồng tác giả.
- Reorder: dialog/bulk edit hoặc kéo thả; gọi PATCH reorder; sau khi lưu refetch danh sách.
- **File Upload**: Drag-drop zones, modern upload cards, file type icons, progress bars
- **Animations**: Fade, Zoom, smooth transitions, hover effects
- **Responsive**: Grid system, proper breakpoints, mobile-friendly
- **Icons**: Material Icons với consistent sizing, colors
- **Empty States**: Beautiful placeholders với actions
- **Loading States**: Skeletons, progress indicators, disabled states

4. Thực thể và quan hệ

- TapSan: đã tồn tại (Model `giaobanbv-be/models/TapSan.js`), trường: `Loai`, `NamXuatBan`, `SoXuatBan`, `isDeleted`.
- TapSanBaiBao (mới): nhiều-nhiều với `NhanVien` (tác giả); nhiều-1 với `TapSan`.
  - Trường chính:
    - `TapSanID`: ObjectId (ref TapSan), required, index
    - `TenBaiBao`: string, required, text index
    - `LoaiHinh`: enum: `ky-thuat-moi` | `nghien-cuu-khoa-hoc` | `ca-lam-sang` (required, index)
    - `KhoiChuyenMon`: enum: `noi` | `ngoai` | `dieu-duong` | `phong-ban` (required, index)
    - `TacGiaChinhID`: ObjectId (ref NhanVien), required, index
    - `DongTacGiaIDs`: ObjectId[] (ref NhanVien), default []
    - `NguoiThamDinhID`: ObjectId (ref NhanVien), nullable, index
    - `MaBaiBao`: string, required, unique theo TapSan (partial unique với `isDeleted=false`)
    - `isDeleted`: boolean, default false
    - timestamps
  - Mã bài báo auto-gen theo format: `{LoaiTapSan}-{Nam}-{So}-{seq2d}` ví dụ `YHTH-2025-01-03`.
  - Counter seq theo từng `TapSanID` (atomic, không reset khi xóa mềm).
- File đính kèm bài báo: dùng hạ tầng Attachments generic sẵn có
  - `OwnerType="TapSanBaiBao"`, `OwnerID=<BaiBaoID>`, `OwnerField="file"`
  - Endpoint BE đã có dạng generics: `/api/attachments/...` (cần xác nhận whitelist OwnerType).

5. Hành vi nghiệp vụ

- Tạo bài đăng: nhập thông tin bắt buộc; server sinh `MaBaiBao`; không đổi được `TapSanID` và `MaBaiBao` sau khi tạo.
- Sửa bài đăng: cho phép đổi các trường thông tin (trừ `TapSanID`, `MaBaiBao`).
- Xóa bài đăng: soft delete (`isDeleted=true`), không ảnh hưởng counter và không recycle `MaBaiBao`.
- Danh sách và lọc: theo `LoaiHinh`, `KhoiChuyenMon`, `TacGiaChinhID`, `NguoiThamDinhID`, `search` theo `TenBaiBao`.
- Export: trả file CSV/Excel theo bộ lọc hiện hành.
- Tệp đính kèm: upload nhiều tệp với drag-drop, list/count, inline/download, delete (soft theo cơ chế Attachments).

6. API hợp đồng (BE)

- CRUD nested dưới `TapSan`:
  - POST `/api/tapsan/:tapSanId/baibao`
    - body: `{ TenBaiBao, LoaiHinh, KhoiChuyenMon, TacGiaChinhID, DongTacGiaIDs?, NguoiThamDinhID? }`
    - response: document bài đăng (có `MaBaiBao`)
  - GET `/api/tapsan/:tapSanId/baibao?page=&size=&search=&LoaiHinh=&KhoiChuyenMon=&TacGiaChinhID=&NguoiThamDinhID=`
    - response: `{ items, total, page, size }`
  - GET `/api/tapsan/:tapSanId/baibao/:id`
  - PATCH `/api/tapsan/:tapSanId/baibao/:id`
  - DELETE `/api/tapsan/:tapSanId/baibao/:id`
- Export:
  - GET `/api/tapsan/:tapSanId/baibao/export?format=csv|xlsx&...`
- Attachments (generic):
  - POST `/api/attachments/TapSanBaiBao/:baiBaoId/file/files`
  - GET `/api/attachments/TapSanBaiBao/:baiBaoId/file/files`
  - GET `/api/attachments/TapSanBaiBao/:baiBaoId/file/files/count`
  - DELETE `/api/attachments/files/:fileId`
  - Xem/Tải: `/api/attachments/files/:fileId/inline|download`

7. UI/UX hiện đại (FE)

- Điều hướng (đã có TapSan routes): bổ sung 4 routes trang bài đăng:
  - `/tapsan/:id/baibao` (Danh sách với DataGrid modern, filters, search, export)
  - `/tapsan/:id/baibao/new` (Form hiện đại với sections, validation, preview)
  - `/tapsan/:id/baibao/:baiBaoId` (Chi tiết với card layout, tabs, file management)
  - `/tapsan/:id/baibao/:baiBaoId/edit` (Form sửa)
- **Danh sách (DataGrid modern)**:
  - Header với breadcrumbs, title với icon, actions
  - Filters bar: `LoaiHinh` (chips), `KhoiChuyenMon` (select), Autocomplete `TacGiaChinh`, Autocomplete `NguoiThamDinh`, `search` với debounce
  - DataGrid: `Ma` (chip), `Tên` (truncated với tooltip), `Loại hình` (colored chip), `Khối CM` (badge), `Tác giả chính` (avatar + name), `(#) Đồng tác giả` (count badge), `Reviewer` (avatar), `#Files` (file icon + count), `Cập nhật` (relative time), `Hành động` (icon buttons với tooltips)
  - Export CSV/Excel với loading state
  - Empty state đẹp với illustration và call-to-action
  - Loading skeletons cho rows
- **Form tạo/sửa (Sections modern)**:
  - Header với breadcrumbs, icon, description
  - Sections với paper cards, icons cho từng field group
  - Trường: TextField với validation states, error messages, helper text
  - Autocomplete `NhanVien` với async search, avatar, debounce
  - Preview section với live update
  - Actions với loading states, disabled states
- **Chi tiết (Card layout)**:
  - Header với avatar, title, breadcrumbs, quick actions
  - Sidebar với statistics, quick actions
  - Tabs với icons, proper spacing
  - Overview với info cards, proper typography
  - File management với modern AttachmentSection

8. AttachmentSection hiện đại

- **Header**: Avatar icon, title, file count, upload button
- **Drag-drop zone**: Dashed border, hover states, icons, instructions
- **Upload progress**: Card với progress bar, percentage, cancel option
- **File list**: Grid layout, file cards với:
  - File type icons (emoji hoặc material icons)
  - File name (truncated với tooltip)
  - File size chip
  - Upload date
  - Action buttons (preview, download, delete) với tooltips
  - Hover effects, animations
- **Empty state**: Beautiful placeholder với folder icon, instructions, upload button
- **Delete confirmation**: Dialog với warning, file details

9. Chấp nhận (UAT)

- Tạo 20 bài cho 1 TapSan: `MaBaiBao` chạy `...-01` đến `...-20`, không trùng.
- Lọc theo các tiêu chí và tìm kiếm `TenBaiBao` với debounce.
- Export CSV/Excel hoạt động, dữ liệu khớp filter, loading states.
- Upload/xóa file đính kèm với drag-drop; đếm file cập nhật đúng.
- Xóa mềm bài → không hiện ở list; không ảnh hưởng mã các bài khác.
- Responsive trên mobile/tablet/desktop.
- Loading states, error handling, empty states hoạt động tốt.
- Animations smooth, không lag.

10. Tác động hệ thống hiện tại

- TapSan UI/UX đã được thiết kế lại hoàn toàn với modern design system.
- Không thay đổi logic file `kehoach`/`file` của `TapSan`.
- Cần thêm `OwnerType="TapSanBaiBao"` vào whitelist (nếu BE đang kiểm soát) của Attachments.
- Đảm bảo các truy vấn `TapSan` loại bỏ `isDeleted=true`.

11. Rủi ro & lưu ý

- DataGrid từ @mui/x-data-grid cần license cho production (kiểm tra MIT/Pro).
- Performance với 1000+ files trong AttachmentSection (pagination files nếu cần).
- Drag-drop compatibility với mobile browsers.
- File upload progress với large files (chunk upload nếu cần).
- Cần index partial unique đúng điều kiện `isDeleted=false` để tránh trùng mã.
- Đồng bộ enum FE/BE (case/slug) để tránh lỗi validate.
- Sử dụng axios instance sẵn có để tự động gắn Authorization.
- Hiệu năng list: phân trang mặc định size=20; search qua text index `TenBaiBao`.
