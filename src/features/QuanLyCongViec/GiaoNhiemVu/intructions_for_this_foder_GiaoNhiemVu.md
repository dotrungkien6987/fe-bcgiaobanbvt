# 📌 Hướng dẫn triển khai chức năng Giao Nhiệm Vụ (theo NhanVienID – người quản lý)

Mục tiêu: Xây dựng trang và API cho phép người quản lý (NhanVienID trên route) gán các Nhiệm vụ Thường quy cho nhân viên thuộc quyền quản lý (dựa theo `QuanLyNhanVien`). Mỗi nhân viên sẽ lấy danh sách nhiệm vụ theo `KhoaID` của nhân viên đó. Trang FE có route chứa param `:NhanVienID` (ID của người quản lý).

Áp dụng cho workspace hiện tại: BE nằm trong `giaobanbv-be`, FE nằm trong `fe-bcgiaobanbvt/src`.

---

## 1) Ngữ cảnh dữ liệu & ràng buộc

Các schema liên quan (đã tồn tại):

- `models/NhanVien.js`
  - Trường chính: `_id`, `KhoaID` (ref Khoa), `MaNhanVien`, `Ten`, `GioiTinh`, `isDeleted`, ...
- `modules/workmanagement/models/QuanLyNhanVien.js`
  - `NhanVienQuanLy` (ref NhanVien) – người quản lý
  - `NhanVienDuocQuanLy` (ref NhanVien)
  - `LoaiQuanLy`: "KPI" | "Giao_Viec"
  - `isDeleted`
  - Index duy nhất theo cặp `(NhanVienQuanLy, NhanVienDuocQuanLy)`
- `modules/workmanagement/models/NhiemVuThuongQuy.js`
  - `KhoaID` (ref Khoa) – required
  - `TrangThaiHoatDong` – default true
  - Có thể dùng static `layTheoKhoa(khoaId)` để lấy danh sách active chưa xoá
- `modules/workmanagement/models/NhanVienNhiemVu.js`
  - (Tham chiếu) Khuyến nghị tối thiểu: `NhanVienID` (ref NhanVien), `NhiemVuThuongQuyID` (ref NhiemVuThuongQuy), `TrangThaiHoatDong` (bool, default true), `isDeleted` (bool, default false), `NgayGan` (Date, default now), `NguoiGanID` (ref NhanVien)
  - Unique index: `(NhanVienID, NhiemVuThuongQuyID)`

Ràng buộc nghiệp vụ bắt buộc:

- Nhiệm vụ chỉ được gán nếu `KhoaID` của nhiệm vụ TRÙNG với `KhoaID` của nhân viên.
- Chỉ người quản lý có quan hệ trong `QuanLyNhanVien` mới được thao tác với nhân viên được quản lý.
- `ROLE_ADMIN` có thể thao tác với mọi nhân viên (bỏ qua kiểm tra quan hệ quản lý).
- Gỡ gán là xoá mềm: set `isDeleted=true`, `TrangThaiHoatDong=false`. Không yêu cầu lưu lịch sử thay đổi.

Lưu ý kỹ thuật:

- Nếu trong `NhanVienNhiemVu.js` có middleware dùng sai tên model (ví dụ gọi `mongoose.model("NhanVienQuanLy")`), cần sửa khớp tên model thực tế (`QuanLyNhanVien` hoặc `NhanVien`) theo ý đồ kiểm tra.

---

## 2) Thiết kế API Backend (module workmanagement/GiaoNhiemVu)

Base URL đề xuất: `/api/giao-nhiem-vu`

Thư mục & file cần có trong BE (`giaobanbv-be`):

- `modules/workmanagement/controllers/giaoNhiemVu.controller.js`
- `modules/workmanagement/services/giaoNhiemVu.service.js`
- `routes/giaoNhiemVu.js`
- Đăng ký router ở `routes/index.js`: `router.use('/api/giao-nhiem-vu', giaoNhiemVuApi);`

Các endpoint:

1. Lấy danh sách nhân viên thuộc quyền quản lý của một người quản lý

- GET `/api/giao-nhiem-vu/:NhanVienID/nhan-vien`
- Query tuỳ chọn: `loaiQuanLy=KPI|Giao_Viec|all` (mặc định: all)
- Kiểm tra quyền: `currentUser` phải là `ROLE_ADMIN` hoặc `currentUser.NhanVienID === :NhanVienID`
- Truy vấn: từ `QuanLyNhanVien` với `{ NhanVienQuanLy: :NhanVienID, isDeleted: false, LoaiQuanLy ∈ ... }`
- Populate trường gọn nhẹ cho `ThongTinNhanVienDuocQuanLy`: `_id, Ten, MaNhanVien, KhoaID{_id, TenKhoa}`

2. Lấy danh sách Nhiệm vụ Thường quy theo khoa của một nhân viên

- GET `/api/giao-nhiem-vu/nhan-vien/:employeeId/nhiem-vu`
- Tìm `NhanVien` theo `employeeId` → lấy `KhoaID`
- Gọi `NhiemVuThuongQuy.layTheoKhoa(KhoaID)` (chỉ active, chưa xoá)

3. Lấy danh sách assignment của một nhân viên

- GET `/api/giao-nhiem-vu/assignments?NhanVienID=:employeeId`
- Trả về danh sách từ `NhanVienNhiemVu` với `{ NhanVienID, isDeleted:false, TrangThaiHoatDong:true }`
- Populate `NhiemVuThuongQuyID(TenNhiemVu, KhoaID{_id, TenKhoa}, MucDoKho)` và `NguoiGanID(_id, Ten, MaNhanVien)`

4. Gán 1 nhiệm vụ cho 1 nhân viên

- POST `/api/giao-nhiem-vu/assignments`
- Body: `{ NhanVienID: string, NhiemVuThuongQuyID: string }`
- Quyền: `ROLE_ADMIN` hoặc `currentUser` quản lý `NhanVienID` trong `QuanLyNhanVien`
- Ràng buộc: `KhoaID` nhiệm vụ == `KhoaID` nhân viên
- Lỗi trùng: trả 409 nếu đã tồn tại cặp

5. Gán hàng loạt

- POST `/api/giao-nhiem-vu/assignments/bulk`
- Body: `{ NhanVienIDs: string[] | undefined, NhiemVuThuongQuyIDs: string[], NhanVienID?: string }`
- Tạo theo Cartesian set; bỏ qua cặp trùng, trả về `{ created:[], skipped:[], count:{ created, skipped } }`

6. Gỡ gán theo `assignmentId`

- DELETE `/api/giao-nhiem-vu/assignments/:assignmentId`
- Quyền như trên; thao tác xoá mềm

7. Gỡ gán theo cặp (NhanVienID + NhiemVuThuongQuyID)

- DELETE `/api/giao-nhiem-vu/assignments?NhanVienID=...&NhiemVuThuongQuyID=...`

Mã lỗi & thông điệp (tiếng Việt):

- 400: Thiếu tham số hoặc dữ liệu không hợp lệ
- 401: Chưa đăng nhập
- 403: Bạn không có quyền thao tác với nhân viên này
- 404: Không tìm thấy nhân viên/nhiệm vụ/assignment
- 409: Nhiệm vụ đã được gán cho nhân viên này
- 500: Lỗi hệ thống

Gợi ý service (pseudo):

```js
// giaoNhiemVu.service.js (ý tưởng)
async function getManagedEmployees(managerId, loaiQuanLy, currentUser) {}
async function getDutiesByEmployee(employeeId) {}
async function getAssignmentsByEmployee(employeeId) {}
async function assignOne({ employeeId, dutyId, actorNhanVienId, isAdmin }) {}
async function bulkAssign({ employeeIds, dutyIds, actorNhanVienId, isAdmin }) {}
async function unassignById({ assignmentId, actorNhanVienId, isAdmin }) {}
async function unassignByPair({
  employeeId,
  dutyId,
  actorNhanVienId,
  isAdmin,
}) {}
module.exports = {
  /* ... */
};
```

Kiểm tra quyền (gợi ý):

```js
const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");
if (!isAdmin && currentUser.NhanVienID !== managerId) throwForbidden();
// Khi gán/gỡ: nếu !isAdmin → kiểm tra tồn tại QuanLyNhanVien phù hợp
```

Tối ưu & index:

- Đảm bảo index cho `NhanVienNhiemVu`: unique(NhanVienID, NhiemVuThuongQuyID), cùng các index theo `NhanVienID`, `isDeleted`, `TrangThaiHoatDong`.
- Hạn chế populate nặng; chỉ lấy trường cần cho UI.

---

## 3) Frontend – Route, State, Trang, Component

Route FE:

- URL: `/quanlycongviec/giao-nhiem-vu/:NhanVienID`
- Mục đích: Người quản lý (ID trên route) xem danh sách nhân viên mình quản lý, chọn 1 nhân viên → gán/gỡ Nhiệm vụ Thường quy theo `KhoaID` của nhân viên đó.

Thư mục FE cần có:

- `src/features/QuanLyCongViec/GiaoNhiemVu/giaoNhiemVuSlice.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuPage.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuRoutes.js` (đăng ký route)
- `src/features/QuanLyCongViec/GiaoNhiemVu/components/EmployeeList.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/components/DutyPicker.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/components/AssignmentTable.js`

### 3.1 Slice Redux (KHÔNG dùng createAsyncThunk)

Theo mẫu `nhanvienSlice.js`: dùng `createSlice` + các hàm export dạng `() => async (dispatch) => { ... }` để gọi `apiService`, `toast`, và dispatch actions tương ứng.

State đề xuất:

```ts
interface EmployeeLite { _id: string; Ten: string; MaNhanVien: string; KhoaID?: { _id: string; TenKhoa: string } }
interface DutyLite { _id: string; TenNhiemVu: string; KhoaID: { _id: string; TenKhoa: string }; MucDoKho: number; TrangThaiHoatDong: boolean }
interface Assignment { _id: string; NhanVienID: string; NhiemVuThuongQuyID: DutyLite; NguoiGanID?: { _id: string; Ten: string; MaNhanVien: string }; NgayGan: string }

{
  isLoading: false,
  error: null,
  managerId: null,

  employees: [] as EmployeeLite[],
  employeesLoading: false,
  selectedEmployeeId: null as string | null,

  duties: [] as DutyLite[],
  dutiesLoading: false,
  dutyFilter: { search: '', mucDoKho: [1, 10] as [number, number] },

  assignments: [] as Assignment[],
  assignmentsLoading: false,

  creating: false,
  deleting: false
}
```

Reducers cơ bản:

- `startLoading`, `hasError`
- `setManagerId(managerId)`
- `setSelectedEmployee(employeeId)`
- `getManagedEmployeesSuccess(list)`
- `getDutiesByEmployeeSuccess(list)`
- `getAssignmentsByEmployeeSuccess(list)`
- `assignDutySuccess(assignment)` (cập nhật `assignments`)
- `bulkAssignSuccess({ created, skipped })` (refresh sau khi báo thành công)
- `unassignSuccess(assignmentId | { employeeId, dutyId })`

Action creators (theo mẫu nhanvienSlice):

- `fetchManagedEmployees(managerId, loaiQuanLy)` → GET `/api/giao-nhiem-vu/:managerId/nhan-vien`
- `fetchDutiesByEmployee(employeeId)` → GET `/api/giao-nhiem-vu/nhan-vien/:employeeId/nhiem-vu`
- `fetchAssignmentsByEmployee(employeeId)` → GET `/api/giao-nhiem-vu/assignments?NhanVienID=...`
- `assignDuty({ employeeId, dutyId })` → POST `/api/giao-nhiem-vu/assignments`
- `bulkAssign({ employeeIds, dutyIds })` → POST `/api/giao-nhiem-vu/assignments/bulk`
- `unassignById(assignmentId)` → DELETE `/api/giao-nhiem-vu/assignments/:assignmentId`
- `unassignByPair({ employeeId, dutyId })` → DELETE `/api/giao-nhiem-vu/assignments?NhanVienID=...&NhiemVuThuongQuyID=...`

Thông báo UI: dùng `toast.success`/`toast.error` nhất quán.

Đăng ký store:

```js
// src/app/store.js
import giaoNhiemVuReducer from "features/QuanLyCongViec/GiaoNhiemVu/giaoNhiemVuSlice";
export const rootReducer = {
  /* ...other reducers... */ giaoNhiemVu: giaoNhiemVuReducer,
};
```

### 3.2 Trang & Components

- `GiaoNhiemVuPage`

  - Đọc `:NhanVienID` từ route → `dispatch(fetchManagedEmployees(paramId))`
  - Auto-chọn nhân viên đầu tiên nếu chưa có `selectedEmployeeId`
  - Khi chọn nhân viên mới → `dispatch(fetchDutiesByEmployee(empId))` + `dispatch(fetchAssignmentsByEmployee(empId))`

- `EmployeeList`

  - Hiển thị danh sách nhân viên được quản lý: `Ten`, `MaNhanVien`, `KhoaID.TenKhoa`
  - Ô tìm kiếm theo tên/mã; callback `onSelect(employeeId)`

- `DutyPicker`

  - Danh sách NV thường quy theo khoa (của nhân viên đang chọn)
  - Tìm kiếm theo tên, lọc theo `MucDoKho`
  - Multi-select + nút "Gán" → `assignDuty` hoặc `bulkAssign`

- `AssignmentTable`

  - Hiển thị nhiệm vụ đã gán (tên nhiệm vụ, khoa, mức độ khó, người gán, ngày gán)
  - Nút "Gỡ" từng dòng hoặc multi-select gỡ

- UX
  - Loading riêng cho employees/duties/assignments
  - Toast cho mọi thao tác
  - Giữ nguyên nhân viên đang chọn khi refresh assignments

---

## 4) Hợp đồng dữ liệu (DTO) – FE ⇆ BE

Managed Employee (item từ endpoint #1):

```json
{
  "_id": "<QuanLyNhanVienRecordId>",
  "NhanVienDuocQuanLy": "<employeeId>",
  "ThongTinNhanVienDuocQuanLy": {
    "_id": "<employeeId>",
    "Ten": "Nguyễn Văn A",
    "MaNhanVien": "NV001",
    "KhoaID": { "_id": "...", "TenKhoa": "Khoa Nội" }
  }
}
```

DutyLite:

```json
{
  "_id": "<dutyId>",
  "TenNhiemVu": "Chấm công tháng",
  "KhoaID": { "_id": "...", "TenKhoa": "Khoa Nội" },
  "MucDoKho": 5,
  "TrangThaiHoatDong": true
}
```

Assignment:

```json
{
  "_id": "<assignmentId>",
  "NhanVienID": "<employeeId>",
  "NhiemVuThuongQuyID": {
    /* DutyLite */
  },
  "NguoiGanID": {
    "_id": "<managerEmployeeId>",
    "Ten": "Quản lý",
    "MaNhanVien": "QL001"
  },
  "NgayGan": "2025-08-09T00:00:00.000Z"
}
```

---

## 5) Ràng buộc & kiểm tra quyền

- Chỉ cho phép nếu:
  - `ROLE_ADMIN` → bỏ qua kiểm tra quan hệ quản lý
  - Hoặc `currentUser.NhanVienID === :NhanVienID` (khi lấy danh sách mình quản lý)
  - Khi gán/gỡ: nếu không phải admin, phải tồn tại bản ghi `QuanLyNhanVien` với `{ NhanVienQuanLy: currentUser.NhanVienID, NhanVienDuocQuanLy: <employeeId>, isDeleted:false, LoaiQuanLy ∈ {KPI, Giao_Viec} }`
- Ràng buộc cùng khoa khi gán: `NhanVien.KhoaID === NhiemVuThuongQuy.KhoaID`
- Gỡ gán: xoá mềm (không cần lưu lịch sử)

---

## 6) Kiểm thử (Checklist)

- [ ] Người quản lý A xem danh sách nhân viên mình quản lý
- [ ] Với 1 nhân viên thuộc khoa X, danh sách NV thường quy trả đúng theo khoa X, chỉ hiện active
- [ ] Gán 1 nhiệm vụ thành công → xuất hiện ở danh sách assignment
- [ ] Gán trùng → trả 409 → toast cảnh báo
- [ ] Gỡ gán → assignment biến mất; BE set `isDeleted=true`
- [ ] Không thể thao tác với nhân viên không thuộc quản lý → 403 (trừ admin)
- [ ] Bulk assign: `created` và `skipped` rõ ràng
- [ ] Hiệu năng: số query tối ưu, index phát huy tác dụng
- [ ] Thông điệp lỗi tiếng Việt
- [ ] UI giữ lựa chọn nhân viên hiện tại sau khi refresh assignments

---

## 7) Tích hợp Router & Menu

Đăng ký route:

```tsx
// src/features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuRoutes.tsx
<Route
  path="/quanlycongviec/giao-nhiem-vu/:NhanVienID"
  element={<GiaoNhiemVuPage />}
/>
```

Menu:

```js
{
  id: 'giao-nhiem-vu',
  title: 'Giao nhiệm vụ',
  type: 'item',
  url: '/quanlycongviec/giao-nhiem-vu/<NhanVienID>',
  icon: icons.AssignmentTurnedIn
}
```

---

## 8) Gợi ý UI (cấu hình bảng & form nhẹ)

Bảng Assignment gợi ý cột:

- Tên nhiệm vụ: `NhiemVuThuongQuyID.TenNhiemVu`
- Khoa: `NhiemVuThuongQuyID.KhoaID.TenKhoa`
- Mức độ khó: `NhiemVuThuongQuyID.MucDoKho`
- Người gán: `NguoiGanID.Ten`
- Ngày gán: `NgayGan`
- Thao tác: Gỡ

Duty Picker bộ lọc:

- Tìm theo tên
- Lọc khoảng `MucDoKho` (1–10)

---

## 9) Ghi chú triển khai

- FE: Tên hiển thị nhân viên dùng trường `Ten` (không phải `HoTen`).
- Khi map dữ liệu, giữ nguyên structure populate để tránh sai field path.
- BE: Cân nhắc thêm endpoint lấy chi tiết 1 assignment nếu cần.
- Bulk assign: dùng `bulkWrite` để tối ưu.
- Bảo mật: kiểm tra quyền sớm ở controller; sanitize params.

---

## 10) Sẵn sàng cho AI triển khai

- Tuân thủ ràng buộc: nhiệm vụ phải cùng `KhoaID` với nhân viên khi gán, `ROLE_ADMIN` có toàn quyền, không cần lưu lịch sử.
- Redux slice theo mẫu `nhanvienSlice.js` (không dùng `createAsyncThunk`).
- Thông báo UI bằng `toast` cho tất cả thao tác.
- Tất cả thông điệp lỗi/UX hiển thị tiếng Việt.

> File này là ngữ cảnh chuẩn để AI tạo BE/FE cho chức năng Giao Nhiệm Vụ bám sát kiến trúc hiện có của dự án.
