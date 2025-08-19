# Tổng kết thiết kế chức năng Giao Việc (Công việc)

Cập nhật: 2025-08-12
Phạm vi: Chuẩn hóa mô hình dữ liệu và luồng nghiệp vụ cho giao việc cụ thể (không phải nhiệm vụ thường quy), có phân cấp cha–con, bình luận và tệp đính kèm. Tạm thời bỏ qua phần thông báo realtime.

## Quyết định nghiệp vụ đã chốt

- Giao cho cá nhân hoặc nhóm.
  - Trong nhóm bắt buộc có 1 người xử lý chính (NguoiChinhID), còn lại là phối hợp.
  - Người xử lý chính chịu trách nhiệm cập nhật, báo cáo và nộp hoàn thành.
- Cho phép cập nhật tiến độ.
  - Mặc dù mang tính chủ quan, nhưng hữu ích cho theo dõi; có thể cập nhật khi: đạt mốc quan trọng, có thay đổi lớn, theo định kỳ, khi được yêu cầu, hoặc lúc nộp hoàn thành.
  - Tiến độ tổng của công việc mặc định lấy theo tiến độ của người xử lý chính.
- Lưu lịch sử thay đổi (trạng thái/tiến độ) để audit và báo cáo.
- Mô hình cây cho công việc: có thể tạo công việc con từ công việc cha.
- Bình luận trong phạm vi công việc; cho phép reply (thread).
  - Tất cả người liên quan trong công việc đều xem được bình luận.
  - Tác giả bình luận mới được sửa/xóa.
- Tệp đính kèm ở 3 cấp độ: công việc, người tham gia, bình luận.
  - Tất cả người tham gia công việc đều xem được các tệp ở cả 3 phạm vi.
  - Lưu trữ tệp trên ổ đĩa máy chủ (local). Không theo dõi người xem.
  - Có giới hạn loại tệp (MIME) và kích thước (mặc định 25MB/tệp – có thể cấu hình).
  - Khi xóa công việc: không xóa vật lý tệp; vẫn giữ để phục vụ khôi phục. Dùng isDeleted khi cần ẩn.
  - Khi xóa bình luận: set isDeleted cho các tệp gắn vào bình luận đó.
- Quyền xóa tệp: người giao việc (NguoiGiaoViecID) được xóa; có NguoiTaiLenID (nguoiTaoId) trong TepTin để mở rộng chính sách sau.
- Thông báo khi có bình luận/tệp mới: sẽ tích hợp sau (ngoài phạm vi hiện tại).

## Mô hình dữ liệu (tên tiếng Việt)

### 1) Công việc (CongViec)

- Trường chính (bám theo model hiện tại):
  - TieuDe, MoTa
  - NguoiGiaoViecID
  - NguoiThamGia: [ { NhanVienID, VaiTro: 'CHINH'|'PHOI_HOP', TrangThai, TienDo, GhiChu } ]
  - NguoiChinhID (truy vấn nhanh người xử lý chính – phải khớp phần tử có VaiTro='CHINH')
  - MucDoUuTien: 'THAP'|'BINH_THUONG'|'CAO'|'KHAN_CAP'
  - NgayBatDau, NgayHetHan (deadline)
  - TrangThai: 'TAO_MOI'|'DA_GIAO'|'CHAP_NHAN'|'TU_CHOI'|'DANG_THUC_HIEN'|'CHO_DUYET'|'HOAN_THANH'|'QUA_HAN'|'HUY'
  - PhanTramTienDoTong (mặc định = tiến độ của người 'CHINH')
  - CongViecChaID (nullable)
  - LichSuTrangThai: [ { HanhDong, NguoiThucHienID, TuTrangThai, DenTrangThai, ThoiGian, GhiChu } ]
  - isDeleted (soft delete)
- Index gợi ý: (TrangThai, NgayHetHan), NguoiGiaoViecID, NguoiChinhID, NguoiThamGia.NhanVienID, CongViecChaID, isDeleted.
- Validate/logic:

  - NgayHetHan > NgayBatDau.
  - NguoiThamGia có ít nhất 1 phần tử, và đúng 1 người VaiTro='CHINH'.
  - NguoiChinhID phải trùng NhanVienID của phần tử VaiTro='CHINH'.
  - Không trùng NhanVienID trong NguoiThamGia.
  - Không tự tham chiếu làm cha của chính mình.
  - Phương thức tiện ích: capNhatTienDoTongTheoNguoiChinh().

  Bổ sung đề xuất (nếu cần dùng sau): Danh sách Nhãn/Tag, Điểm ưu tiên số (PriorityScore), Điểm rủi ro.

### 2) Bình luận (BinhLuan)

- Trường chính:
  - CongViecID, NguoiBinhLuanID (tác giả), NoiDung
  - BinhLuanChaID (reply/thread)
  - TepTinIds: [TepTinID] (tùy chọn để truy vấn nhanh; nguồn sự thật là TepTin.BinhLuanID)
  - LoaiBinhLuan: 'COMMENT'|'FEEDBACK'|'QUESTION'|'SOLUTION'
  - TrangThai: 'ACTIVE'|'DELETED'|'HIDDEN'
  - NgayBinhLuan, NgayCapNhat
- Hành vi:
  - static softDeleteWithFiles(binhLuanId): set TrangThai='DELETED' cho bình luận và các TepTin có BinhLuanID=...
- Index gợi ý: (CongViecID, BinhLuanChaID, createdAt), NguoiBinhLuanID, TrangThai.

### 3) Tệp tin (TepTin)

- Trường chính:
  - CongViecID
  - BinhLuanID (khi đính kèm vào bình luận)
  - NguoiTaiLenID (nguoiTaoId)
  - TenFile (tên lưu), TenGoc, LoaiFile (MIME), KichThuoc (<=25MB mặc định), DuongDan (local path hoặc URL), MoTa (tùy chọn)
  - TrangThai: 'ACTIVE'|'DELETED', NgayTaiLen
  - (Khuyến nghị) PhamVi: 'CONG_VIEC' | 'NGUOI_THAM_GIA' | 'BINH_LUAN'
  - (Khuyến nghị) NhanVienID (bắt buộc khi PhamVi='NGUOI_THAM_GIA')
- Ràng buộc:
  - pre-validate: nếu PhamVi='BINH_LUAN' thì bắt buộc có BinhLuanID; nếu PhamVi='NGUOI_THAM_GIA' thì bắt buộc có NhanVienID; kiểm tra LoaiFile theo whitelist; giới hạn KichThuoc theo env (mặc định 25MB).
- Index gợi ý: (CongViecID, PhamVi), BinhLuanID, NhanVienID, NguoiTaiLenID, TrangThai, NgayTaiLen.
- Lưu trữ:
  - Local folder đề xuất: `uploads/workmanagement/` (lưu đường dẫn tương đối vào DuongDan để dễ di chuyển môi trường).

## Quan hệ dữ liệu (không hình vẽ)

- CongViec 1—N BinhLuan (BinhLuan.CongViecID)
- CongViec 1—N TepTin (TepTin.CongViecID)
- BinhLuan 1—N TepTin (TepTin.BinhLuanID; khi đính kèm bình luận)
- CongViec — NhanVien: qua mảng CongViec.NguoiThamGia (nhúng – không tạo collection trung gian)
- Phân cấp CongViec: self-reference qua CongViecChaID

## Quyền và hiển thị

- Bình luận
  - Xem: tất cả người tham gia công việc (bao gồm người giao việc).
  - Tạo: người tham gia công việc.
  - Sửa/Xóa: chỉ tác giả bình luận (kiểm tra ở service/controller).
- Tệp tin
  - Xem: tất cả người tham gia công việc ở mọi phạm vi ('CONG_VIEC' | 'NGUOI_THAM_GIA' | 'BINH_LUAN' nếu dùng PhamVi).
  - Tạo (upload): người tham gia công việc.
  - Xóa: người giao việc (NguoiGiaoViecID). Có NguoiTaiLenID để dễ mở rộng chính sách sau.
- Công việc con
  - Quyền tạo công việc con: người xử lý chính của công việc cha (chi tiết có thể mở rộng thêm vai trò quản lý).

## API tối thiểu (định hướng)

- Công việc
  - POST /api/workmanagement/congviec
  - GET /api/workmanagement/congviec (filter/sort/paginate)
  - GET /api/workmanagement/congviec/:id
  - PATCH /api/workmanagement/congviec/:id (cập nhật thông tin/chuyển trạng thái)
  - PATCH /api/workmanagement/congviec/:id/progress (cập nhật tiến độ – người chính)
  - POST /api/workmanagement/congviec/:id/children (tạo công việc con)
  - DELETE /api/workmanagement/congviec/:id (soft delete)
- Bình luận
  - POST /api/workmanagement/congviec/:id/binhluan
  - GET /api/workmanagement/congviec/:id/binhluan
  - PATCH /api/workmanagement/binhluan/:binhLuanId
  - DELETE /api/workmanagement/binhluan/:binhLuanId (softDeleteWithFiles)
- Tệp tin
  - POST /api/workmanagement/congviec/:id/teptin (PhamVi='CONG_VIEC' | 'NGUOI_THAM_GIA' | 'BINH_LUAN')
  - GET /api/workmanagement/congviec/:id/teptin
  - DELETE /api/workmanagement/teptin/:fileId (kiểm tra quyền người giao việc)

## Frontend – màn hình/UX

- Danh sách công việc (List/Kanban/Calendar) + bộ lọc (trạng thái, người chính, deadline, ưu tiên).
- Chi tiết công việc (modal/page) với các tab: Thông tin | Người tham gia | Bình luận | Tệp đính kèm | Lịch sử.
- Form tạo/sửa công việc: chọn người tham gia, đánh dấu người chính, thời gian, ưu tiên; tùy chọn gán công việc cha.
- Modal cập nhật tiến độ (người chính), reply thread trong bình luận, upload tệp ở 3 phạm vi.

## Kế hoạch chi tiết UI/UX Components

### 1. DASHBOARD & TỔNG QUAN

#### 1.1 Dashboard Tổng quan (DashboardOverview)

**Mục đích**: Màn hình chính hiển thị thống kê và trạng thái công việc
**Nhiệm vụ**:

- Hiển thị metrics tổng quan (số công việc theo trạng thái, quá hạn, hoàn thành)
- Biểu đồ tiến độ công việc theo thời gian
- Công việc ưu tiên cao/khẩn cấp
- Công việc sắp hết hạn (trong 3-7 ngày)
- Quick actions: Tạo công việc mới, báo cáo

#### 1.2 Notification Center (NotificationCenter)

**Mục đích**: Hiển thị thông báo (dự trù cho tương lai)
**Nhiệm vụ**:

- Danh sách thông báo chưa đọc
- Phân loại: bình luận mới, cập nhật tiến độ, deadline sắp tới
- Đánh dấu đã đọc/chưa đọc
- Link trực tiếp đến công việc liên quan

### 2. QUẢN LÝ CÔNG VIỆC - DANH SÁCH

#### 2.1 WorkList Container (WorkListContainer)

**Mục đích**: Container chính cho trang danh sách công việc
**Nhiệm vụ**:

- Layout responsive cho desktop/tablet/mobile
- Quản lý state danh sách công việc
- Coordination giữa các component con

#### 2.2 Filter & Search Panel (WorkFilterPanel)

**Mục đích**: Bộ lọc và tìm kiếm công việc
**Nhiệm vụ**:

- Filter theo trạng thái (TAO_MOI, DA_GIAO, DANG_THUC_HIEN, etc.)
- Filter theo mức độ ưu tiên (THAP, BINH_THUONG, CAO, KHAN_CAP)
- Filter theo người giao việc/người xử lý chính
- Filter theo khoảng thời gian (deadline, ngày tạo)
- Tìm kiếm text trong tiêu đề/mô tả
- Save/load filter presets

#### 2.3 Work List View (WorkListView)

**Mục đích**: Hiển thị danh sách công việc dạng bảng
**Nhiệm vụ**:

- Table responsive với các cột: Tiêu đề, Trạng thái, Ưu tiên, Người xử lý, Deadline, Tiến độ
- Sorting theo các cột
- Pagination
- Multi-select cho bulk actions
- Row actions: Xem chi tiết, Sửa, Xóa
- Hiển thị icon/badge cho công việc có con

#### 2.4 Work Card Component (WorkCard)

**Mục đích**: Component hiển thị thông tin công việc trong list
**Nhiệm vụ**:

- Compact layout hiển thị thông tin chính
- Color coding theo trạng thái/ưu tiên
- Progress bar cho tiến độ
- Avatar người xử lý chính
- Badge cho số bình luận/file đính kèm
- Quick actions menu

#### 2.5 Bulk Actions Toolbar (BulkActionsToolbar)

**Mục đích**: Thao tác hàng loạt khi select nhiều công việc
**Nhiệm vụ**:

- Cập nhật trạng thái hàng loạt
- Gán người xử lý hàng loạt
- Xuất danh sách ra Excel/PDF
- Xóa hàng loạt

### 3. TẠO/SỬA CÔNG VIỆC

#### 3.1 Work Form Modal/Page (WorkFormModal)

**Mục đích**: Form tạo mới/chỉnh sửa công việc
**Nhiệm vụ**:

- Form validation real-time
- Autocomplete cho người tham gia
- Chọn người xử lý chính (bắt buộc)
- Date picker cho ngày bắt đầu/deadline
- Rich text editor cho mô tả
- Chọn công việc cha (nếu là công việc con)
- Preview trước khi submit

#### 3.2 Participant Selector (ParticipantSelector)

**Mục đích**: Component chọn người tham gia công việc
**Nhiệm vụ**:

- Search/autocomplete nhân viên
- Phân biệt vai trò CHINH/PHOI_HOP
- Validation: phải có ít nhất 1 người CHINH
- Drag & drop để sắp xếp thứ tự
- Hiển thị thông tin nhân viên (avatar, chức vụ)

#### 3.3 Parent Work Selector (ParentWorkSelector)

**Mục đích**: Chọn công việc cha khi tạo công việc con
**Nhiệm vụ**:

- Tree view hiển thị cấu trúc công việc
- Search công việc cha
- Validation: không tự reference
- Hiển thị path đầy đủ của công việc cha

### 4. CHI TIẾT CÔNG VIỆC

#### 4.1 Work Detail Container (WorkDetailContainer)

**Mục đích**: Container chính cho trang chi tiết công việc
**Nhiệm vụ**:

- Layout responsive với sidebar/main content
- Quản lý state chi tiết công việc
- Real-time updates (chuẩn bị cho sau)

#### 4.2 Work Detail Header (WorkDetailHeader)

**Mục đích**: Header hiển thị thông tin chính của công việc
**Nhiệm vụ**:

- Tiêu đề, trạng thái, mức độ ưu tiên
- Breadcrumb (nếu có công việc cha)
- Action buttons: Sửa, Xóa, Tạo công việc con
- Status transition buttons theo workflow

#### 4.3 Work Detail Tabs (WorkDetailTabs)

**Mục đích**: Tab navigation cho các phần khác nhau
**Nhiệm vụ**:

- Tab: Thông tin | Người tham gia | Bình luận | Tệp đính kèm | Lịch sử
- Badge hiển thị số lượng (bình luận, file)
- Responsive: collapse thành dropdown trên mobile

#### 4.4 Work Info Tab (WorkInfoTab)

**Mục đích**: Hiển thị thông tin chi tiết công việc
**Nhiệm vụ**:

- Mô tả (rich text display)
- Thời gian (ngày tạo, bắt đầu, deadline)
- Progress tracking với timeline
- Công việc con (nếu có) dạng tree view

#### 4.5 Participants Tab (ParticipantsTab)

**Mục đích**: Hiển thị và quản lý người tham gia
**Nhiệm vụ**:

- Danh sách người tham gia với vai trò
- Tiến độ cá nhân của từng người
- Ghi chú của từng người
- Action: Thêm/xóa người tham gia (nếu có quyền)

#### 4.6 Progress Update Modal (ProgressUpdateModal)

**Mục đích**: Modal cập nhật tiến độ (chỉ người xử lý chính)
**Nhiệm vụ**:

- Slider/input cho phần trăm tiến độ
- Text area cho ghi chú tiến độ
- Validation: 0-100%
- Lưu lịch sử cập nhật

### 5. BÌNH LUẬN SYSTEM

#### 5.1 Comments Tab (CommentsTab)

**Mục đích**: Container cho hệ thống bình luận
**Nhiệm vụ**:

- Hiển thị thread bình luận
- Form tạo bình luận mới
- Real-time updates placeholder

#### 5.2 Comment Thread (CommentThread)

**Mục đích**: Hiển thị chuỗi bình luận với reply
**Nhiệm vụ**:

- Tree structure cho reply
- Lazy loading bình luận cũ
- Collapse/expand thread
- Sort: mới nhất/cũ nhất

#### 5.3 Comment Item (CommentItem)

**Mục đích**: Component hiển thị 1 bình luận
**Nhiệm vụ**:

- Avatar, tên, thời gian
- Nội dung bình luận (support markdown/rich text)
- Actions: Reply, Edit, Delete (nếu có quyền)
- File attachments display
- Comment type badge (COMMENT, FEEDBACK, QUESTION, SOLUTION)

#### 5.4 Comment Form (CommentForm)

**Mục đích**: Form tạo/sửa bình luận
**Nhiệm vụ**:

- Rich text editor
- File upload component
- Comment type selector
- Draft auto-save
- Mention users (@username)

### 6. FILE MANAGEMENT

#### 6.1 Files Tab (FilesTab)

**Mục đích**: Quản lý tệp đính kèm theo 3 phạm vi
**Nhiệm vụ**:

- Tab con: Công việc | Người tham gia | Bình luận
- Upload area với drag & drop
- File list với preview
- Search/filter files

#### 6.2 File Upload Component (FileUploadComponent)

**Mục đích**: Component upload file với validation
**Nhiệm vụ**:

- Drag & drop area
- File type validation (MIME whitelist)
- Size validation (25MB default)
- Progress indicator
- Preview uploaded files
- Batch upload support

#### 6.3 File List (FileList)

**Mục đích**: Hiển thị danh sách file theo phạm vi
**Nhiệm vụ**:

- Grid/list view toggle
- File icons theo loại
- File info: tên, kích thước, người upload, ngày
- Actions: Download, Delete (nếu có quyền), Preview
- Search trong file name

#### 6.4 File Preview Modal (FilePreviewModal)

**Mục đích**: Preview file không cần download
**Nhiệm vụ**:

- Image viewer với zoom
- PDF viewer embedded
- Text file display
- Video/audio player
- Download button

### 7. LỊCH SỬ & AUDIT

#### 7.1 History Tab (HistoryTab)

**Mục đích**: Hiển thị lịch sử thay đổi công việc
**Nhiệm vụ**:

- Timeline view các thay đổi
- Filter theo loại thay đổi
- Export history log
- Search trong history

#### 7.2 Activity Timeline (ActivityTimeline)

**Mục đích**: Component timeline hiển thị activities
**Nhiệm vụ**:

- Chronological order
- Activity icons theo loại
- User avatar và timestamp
- Expandable details
- Pagination cho history dài

### 8. RESPONSIVE & MOBILE

#### 8.1 Mobile Navigation (MobileNavigation)

**Mục đích**: Navigation cho mobile/tablet
**Nhiệm vụ**:

- Bottom tab navigation
- Hamburger menu cho secondary actions
- Optimized touch targets

#### 8.2 Mobile Work Card (MobileWorkCard)

**Mục đích**: Optimized work card cho mobile
**Nhiệm vụ**:

- Swipe actions (complete, delete)
- Compact info display
- Touch-friendly buttons

### 9. SHARED COMPONENTS

#### 9.1 Status Badge (StatusBadge)

**Mục đích**: Hiển thị trạng thái với color coding
**Nhiệm vụ**:

- Color scheme theo trạng thái
- Icon + text
- Animated transitions

#### 9.2 Priority Indicator (PriorityIndicator)

**Mục đích**: Hiển thị mức độ ưu tiên
**Nhiệm vụ**:

- Color/icon coding
- Tooltip với mô tả
- Consistent sizing

#### 9.3 Progress Bar (ProgressBar)

**Mục đích**: Hiển thị tiến độ công việc
**Nhiệm vụ**:

- Animated progress
- Color theo milestone
- Tooltip với phần trăm

#### 9.4 User Avatar (UserAvatar)

**Mục đích**: Hiển thị avatar người dùng
**Nhiệm vụ**:

- Fallback với initials
- Online status indicator
- Tooltip với thông tin user
- Size variants

#### 9.5 Date Picker (DatePicker)

**Mục đích**: Component chọn ngày tháng
**Nhiệm vụ**:

- Vietnamese localization
- Business days highlighting
- Holiday marking
- Quick presets (Today, Tomorrow, Next week)

### 10. UTILITY COMPONENTS

#### 10.1 Loading States (LoadingStates)

**Mục đích**: Skeleton loading cho các màn hình
**Nhiệm vụ**:

- Card skeleton cho work list
- Detail page skeleton
- Comment skeleton
- Consistent loading experience

#### 10.2 Empty States (EmptyStates)

**Mục đích**: Hiển thị khi không có dữ liệu
**Nhiệm vụ**:

- Illustration + text
- Call-to-action buttons
- Context-specific messaging

#### 10.3 Error Boundaries (ErrorBoundaries)

**Mục đích**: Handle lỗi UI gracefully
**Nhiệm vụ**:

- Fallback UI khi component crash
- Error reporting
- Retry mechanisms

### 11. THỨ TỰ TRIỂN KHAI ĐỀ XUẤT

#### Phase 1: Core Infrastructure

1. Dashboard & Navigation
2. Work List với Filter
3. Work Detail cơ bản
4. Work Form (tạo/sửa)

#### Phase 2: Advanced Features

5. Comment System
6. File Management
7. Progress Tracking
8. History & Audit

#### Phase 3: Enhancement

9. Mobile Optimization
10. Advanced Filtering
11. Bulk Operations
12. Notification Center (chuẩn bị)

**Lưu ý**: Mỗi component sẽ được implement với Material-UI components, responsive design, và tuân thủ design system nhất quán cho friendly/modern experience phù hợp với React + MUI stack.

### Đồng bộ với backend hiện có

- Backend đã mount module tại: `/api/workmanagement`.
- Các endpoint hiện đã sẵn sàng: `GET /nhanvien/:nhanvienid`, `GET /congviec/:nhanvienid/received`, `GET /congviec/:nhanvienid/assigned`, `GET /congviec/detail/:id`, `POST /congviec`, `PUT /congviec/:id`, `DELETE /congviec/:id`, `POST /congviec/:id/comment`, `GET /nhom-viec-user/my-groups`, `GET /quanlynhanvien/:nhanvienid/info`, `GET /quanlynhanvien/:nhanvienid/managed`.
- Khi gửi filter từ FE, sử dụng đúng key viết hoa: `TrangThai`, `MucDoUuTien`, `NgayBatDau`, `NgayHetHan`.

## Kiểm thử gợi ý

- Unit: validate schema (VaiTro 'CHINH' duy nhất, thời gian hợp lệ, ràng buộc TepTin theo PhamVi, softDeleteWithFiles).
- Integration: luồng tạo → giao → cập nhật tiến độ → bình luận + tệp → xóa bình luận (ẩn tệp) → tạo công việc con → duyệt truy vấn tệp/bình luận theo quyền.
- E2E: danh sách/chi tiết/luồng hành động chính trên UI sau khi có FE.

## Chuẩn hóa & dọn trùng lặp (trong codebase hiện tại)

- Giữ model tiếng Việt trong module workmanagement: `CongViec`, `BinhLuan`, `TepTin`.
- Bỏ dùng/xóa các bản trùng: `Comment.js` (nếu có) → dùng `BinhLuan`; `File.js` (nếu có) → dùng `TepTin`.
- Hợp nhất `TaskAssignee`/`NguoiThucHienCongViec` vào mảng nhúng `NguoiThamGia` trong `CongViec`.
- Tạm thời bỏ qua Notification/ThongBao (sẽ tích hợp sau theo quy tắc thông báo).

## Mở rộng/điểm cần chốt thêm (tùy nhu cầu)

- Quy tắc đồng bộ trạng thái cha–con: có tự động cập nhật trạng thái cha theo con hay không; và ngược lại.
- Quy tắc tổng hợp tiến độ khi có nhiều người phối hợp (hiện tại mặc định dùng tiến độ người chính).
- Chính sách phân quyền thêm (ví dụ: quản lý cấp trên có thể xoá tệp/bình luận?).
- Cấu hình danh sách MIME/giới hạn dung lượng qua biến môi trường.
- Thư mục lưu trữ local: thống nhất `uploads/workmanagement/` và chuẩn URL phục vụ tải xuống.

---

Tài liệu này tóm lược các quyết định và thiết kế đã thống nhất để triển khai tính năng giao việc trong module Work Management. Khi cần, có thể mở rộng phần API/Service/Controller cụ thể theo khung ở trên.

## Phụ lục: Cập nhật đã triển khai gần đây

### Quy tắc xóa (đã triển khai)

- Quyền xóa: chỉ Admin/Manager/Chủ sở hữu (NguoiGiaoViecID) được phép.
- Nếu trạng thái HOAN_THANH: chỉ Admin mới được xóa.
- Nếu còn công việc con: chặn xóa, yêu cầu xóa công việc con trước.
- Xóa mềm công việc; cascade-soft-delete bình luận (trả về meta: commentCount, fileCount).
- FE vô hiệu nút Xóa theo quy tắc trên; ConfirmDialog hiển thị cảnh báo và hậu quả.

### Mã công việc (MaCongViec) & Số thứ tự (SoThuTu)

- Định dạng: MaCongViec = "CV" + số thứ tự; padding 5 chữ số đến 99999 (VD: CV00001). Từ 100000 không padding.
- SoThuTu: số nguyên tăng dần, dùng cho sắp xếp/báo cáo.
- Cơ chế sinh mã: sử dụng collection `counters` với document `_id = "congviec"`, tăng `seq` atomically bằng findOneAndUpdate `$inc`.
- Lưu vào CongViec.MaCongViec (unique, sparse) và CongViec.SoThuTu (indexed).
- Hiển thị FE:
  - Bảng danh sách: thêm cột "Mã" ở đầu.
  - Dialog chi tiết: hiển thị Mã ở tiêu đề.
  - Form: ở chế độ tạo mới hiển thị nhắc "Mã sẽ tạo khi lưu"; ở chế độ sửa hiển thị trường đọc-only Mã.
- Thông báo sau tạo: Toast kèm MaCongViec nếu có.
