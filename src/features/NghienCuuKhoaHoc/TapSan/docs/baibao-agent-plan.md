# Kế hoạch triển khai (Agent Mode): Bài đăng trong Tập san

Phiên bản: 1.0 (2025-09-12)
Tham chiếu: xem `baibao-business-spec.md` cùng thư mục

Mục tiêu: Hoàn thiện BE/FE cho quản lý Bài đăng trong Tập san, không thay đổi code ngoài phạm vi mô tả, tái sử dụng Attachments generic.

A. Backend (giaobanbv-be)

1. Model & Counter

- Tạo file `models/TapSanBaiBao.js` theo đặc tả (fields, enums, indexes).
- Tạo file `models/Counter.js` dùng scope `TapSanBaiBao:<TapSanID>`.
- Kiểm tra `models/TapSan.js` đã tồn tại (không chỉnh sửa trừ khi cần index unique cho TapSan).

2. Controller

- Tạo `controllers/tapsan-baibao.controller.js` với các hàm: `create`, `list`, `getById`, `update`, `remove`, `exportCsv`.
- Hàm `create`: validate input, fetch TapSan, sinh `MaBaiBao` bằng Counter.
- Các hàm khác theo hợp đồng API.

3. Routes

- Thêm `routes/tapsan-baibao.api.js` mount dưới `/api/tapsan/:tapSanId/baibao` (mergeParams=true), dùng `authentication.loginRequired`.
- Mở rộng `routes/index.js`: `router.use('/tapsan/:tapSanId/baibao', require('./tapsan-baibao.api'))`.

4. Attachments

- Đảm bảo routes generic `/api/attachments` đang hoạt động.
- Nếu có whitelist OwnerType, thêm `TapSanBaiBao`.

5. Export (CSV, optional XLSX)

- CSV: stream text/csv theo UTF-8 BOM nếu cần Excel. Tối thiểu cột: `MaBaiBao,TenBaiBao,LoaiHinh,KhoiChuyenMon,TacGiaChinhID,NguoiThamDinhID,UpdatedAt`.
- XLSX (nếu làm): thêm thư viện `exceljs` và route `?format=xlsx`.

6. Kiểm thử nhanh (postman)

- Tạo 1 TapSan mẫu (nếu chưa có) → tạo 20 bài → kiểm tra mã tự sinh tăng dần.
- Lọc theo bộ lọc; export CSV; upload/list/delete file đính kèm (OwnerType=TapSanBaiBao).

B. Frontend (fe-bcgiaobanbvt)

1. Routes

- Mở file `src/routes/index.js`: thêm 4 route mới:
  - `/tapsan/:id/baibao`
  - `/tapsan/:id/baibao/new`
  - `/tapsan/:id/baibao/:baiBaoId`
  - `/tapsan/:id/baibao/:baiBaoId/edit`

2. Services

- Tạo `src/features/NghienCuuKhoaHoc/TapSan/services/baibao.api.js` wrap các endpoint CRUD + export; dùng axios instance dự án.

3. Pages (skeleton trước, UI/UX nâng cao sau)

- Tạo `pages/BaiBaoListPage.jsx`: danh sách + filter stub + export CSV + nút tạo.
- Tạo `pages/BaiBaoFormPage.jsx`: form tạo/sửa (TextField + Select; TODO Autocomplete NhanVien).
- Tạo `pages/BaiBaoDetailPage.jsx`: hiển thị metadata + `AttachmentSection` ownerType="TapSanBaiBao".

4. AttachmentSection reuse

- `components/AttachmentSection.jsx` đã sẵn. Đảm bảo props `ownerType`, `ownerId`, `field` dùng đúng.

5. Autocomplete NhanVien (nâng cao sau)

- Tạo service tìm NhanVien theo keyword nếu chưa có; hoặc tái dùng service hiện có.
- Thay các TextField ID bằng Autocomplete có label + value là ID.

6. UAT kịch bản

- Tạo 20 bài; lọc; export; upload file; delete bài (soft) → không hiện trong list.

C. Các file sẽ tạo/sửa (liệt kê đường dẫn)

- BE
  - `giaobanbv-be/models/TapSanBaiBao.js`
  - `giaobanbv-be/models/Counter.js`
  - `giaobanbv-be/controllers/tapsan-baibao.controller.js`
  - `giaobanbv-be/routes/tapsan-baibao.api.js`
  - `giaobanbv-be/routes/index.js` (chèn 1 dòng use)
  - (nếu cần) `middlewares/attachmentsOwnerWhitelist.js` (thêm `TapSanBaiBao`)
- FE
  - `fe-bcgiaobanbvt/src/features/NghienCuuKhoaHoc/TapSan/services/baibao.api.js`
  - `fe-bcgiaobanbvt/src/features/NghienCuuKhoaHoc/TapSan/pages/BaiBaoListPage.jsx`
  - `fe-bcgiaobanbvt/src/features/NghienCuuKhoaHoc/TapSan/pages/BaiBaoFormPage.jsx`
  - `fe-bcgiaobanbvt/src/features/NghienCuuKhoaHoc/TapSan/pages/BaiBaoDetailPage.jsx`
  - `fe-bcgiaobanbvt/src/routes/index.js` (thêm routes)

D. Trình tự thực thi (đề xuất cho Agent)

1. BE: tạo model + counter + controller + routes; chạy server; test Postman.
2. FE: tạo service + pages + cập nhật router; chạy FE; test end-to-end CRUD.
3. Tích hợp Attachments vào trang chi tiết; test upload/list/delete.
4. Hoàn thiện filter + Autocomplete NhanVien + export Excel (nếu cần).

E. Hướng dẫn chạy nhanh

- Backend (PowerShell):

```
cd g:\bvt-giaobanbv\fe-giaobanbv\giaobanbv-be
npm install
npm run dev
```

- Frontend (PowerShell):

```
cd g:\bvt-giaobanbv\fe-giaobanbv\fe-bcgiaobanbvt
npm install
npm start
```

F. Lưu ý khi commit

- Chia commit nhỏ theo khu vực (BE models, BE routes, FE services, FE pages, FE routes).
- Viết mô tả ngắn gọn, gắn issue/ticket nếu có.

G. Rollback plan

- Nếu lỗi BE: tạm thời tắt mount route `/tapsan/:tapSanId/baibao` để không ảnh hưởng phần khác.
- Nếu lỗi FE: ẩn các route bài báo (comment) và để TapSan hiện tại chạy bình thường.
