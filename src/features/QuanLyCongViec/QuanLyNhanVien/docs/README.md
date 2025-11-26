# 📋 Module Quản Lý Nhân Viên (QuanLyNhanVien)

**Version:** 1.1  
**Last Updated:** 26/11/2025  
**Status:** ✅ Production Ready

## 🎯 Tổng Quan

Module **Quản Lý Nhân Viên** là hệ thống quản lý quan hệ giữa người quản lý và nhân viên được quản lý, xác định **ai có quyền giao việc** và **ai có quyền chấm điểm KPI** cho những nhân viên nào trong hệ thống.

### Vai trò trong hệ thống

QuanLyNhanVien là một **module nền tảng** (foundational module) kết nối giữa quản lý nhân sự và các module nghiệp vụ:

```
┌─────────────────┐
│  NhanVien       │  ← Dữ liệu nhân viên
│  (Master Data)  │
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│  QuanLyNhanVien     │  ← Quan hệ quản lý (Cấu hình)
│  (Relationships)    │
└────────┬────────────┘
         │
         ↓
┌────────────────────────────────┐
│  GiaoNhiemVu  │      KPI       │  ← Nghiệp vụ chính
│  (Task Assign) │  (Evaluation) │
└────────────────────────────────┘
```

### Ngữ cảnh nghiệp vụ

**Vấn đề giải quyết:**

- Trong bệnh viện, một trưởng khoa có thể quản lý nhiều nhân viên
- Quyền giao việc và quyền chấm KPI có thể khác nhau cho từng nhân viên
- Cần hệ thống linh hoạt để cấu hình quan hệ quản lý độc lập

**Giải pháp:**

- Hai loại quan hệ độc lập: **Giao_Viec** và **KPI**
- Một quản lý có thể có 2 danh sách riêng biệt
- Hỗ trợ chuyển đổi giữa 2 loại quan hệ
- Giao diện trực quan với tab riêng cho mỗi loại

---

## 🚀 Tính Năng Chính

### 1. Hai Loại Quan Hệ Quản Lý

#### 🔵 Giao_Viec (Giao Việc)

**Mục đích:** Xác định nhân viên nào quản lý có quyền giao nhiệm vụ thường quy

**Ứng dụng:**

- Module **GiaoNhiemVu** sử dụng để lọc danh sách nhân viên
- Chỉ hiển thị nhân viên trong danh sách Giao_Viec khi giao nhiệm vụ
- Ngăn chặn giao việc cho nhân viên không thuộc quyền quản lý

**Ví dụ:**

```
Trưởng khoa Ngoại (Nguyễn Văn A) có thể giao việc cho:
├─ Bác sĩ Trần Thị B
├─ Điều dưỡng Lê Văn C
└─ Kỹ thuật viên Phạm Thị D
```

#### 🟢 KPI (Chấm Điểm KPI)

**Mục đích:** Xác định nhân viên nào quản lý có quyền đánh giá KPI

**Ứng dụng:**

- Module **KPI** sử dụng để lọc danh sách nhân viên
- Chỉ cho phép chấm điểm KPI cho nhân viên trong danh sách này
- Hỗ trợ quy trình đánh giá hiệu suất công việc

**Ví dụ:**

```
Trưởng khoa Ngoại (Nguyễn Văn A) có thể chấm KPI cho:
├─ Bác sĩ Trần Thị B
├─ Bác sĩ Hoàng Văn E
└─ Điều dưỡng Vũ Thị F
```

### 2. Quản Lý Danh Sách Linh Hoạt

#### ✅ Thêm nhân viên

- Mở dialog chọn nhiều nhân viên cùng lúc (multi-select)
- Tự động lọc bỏ chính mình và nhân viên đã có trong danh sách
- Cập nhật tạm thời (temporary state) trước khi lưu
- Hiển thị số lượng nhân viên đã chọn

#### ❌ Xóa nhân viên

- Xóa từng nhân viên khỏi danh sách
- Confirm dialog để xác nhận trước khi xóa
- Cập nhật tạm thời, chưa lưu vào database ngay

#### 🔄 Sync (Đồng bộ hóa)

- **Tính năng quan trọng nhất**: Gửi một lần tất cả thay đổi
- Backend so sánh danh sách hiện tại vs danh sách mới
- Tự động xác định nhân viên cần thêm và cần xóa
- Thực hiện batch operation để tối ưu hiệu suất
- Trả về summary: `{ added: 3, deleted: 2, total: 8 }`

#### 🔀 Chuyển đổi loại quan hệ

- Chuyển nhân viên từ Giao_Viec sang KPI (hoặc ngược lại)
- Cập nhật trường `LoaiQuanLy` trong database
- Di chuyển nhân viên giữa 2 tab trong UI

### 3. Giao Diện Trực Quan

#### 📊 Trang chủ (QuanLyNhanVienPage)

- **Header gradient** với thông tin nhân viên đang quản lý
- **Avatar với initials** (vd: NVA cho Nguyễn Văn A)
- **Stats badges**: Hiển thị số lượng quan hệ cho từng loại
  - 🔵 Badge màu xanh: Số nhân viên Giao_Viec
  - 🟢 Badge màu xanh lá: Số nhân viên KPI
- **Breadcrumbs navigation** để quay lại danh sách nhân viên
- **Loading skeleton** khi đang tải dữ liệu

#### 📋 Hai Tab độc lập

- **Tab 1: Danh sách Chấm KPI** (DanhSachChamKPI)
- **Tab 2: Danh sách Giao Việc** (DanhSachGiaoViec)
- Badge hiển thị số lượng trên mỗi tab
- State riêng biệt, không ảnh hưởng lẫn nhau

#### 🔍 Bảng dữ liệu nâng cao

- **Tìm kiếm real-time**: Lọc theo tên, mã nhân viên
- **Sắp xếp**: Click header để sort (ascending/descending)
- **Phân trang**: 10/25/50 dòng mỗi trang
- **Avatar hiển thị**: Ảnh đại diện hoặc initials
- **Định dạng ngày**: dd/MM/yyyy
- **Action buttons**: Xóa (với confirm), Chuyển đổi loại

#### 💬 Dialog chọn nhân viên

- **Fullscreen dialog** (90vh max height)
- **Multi-select table** với checkbox
- **Lọc thông minh**: Loại bỏ chính mình và nhân viên đã có
- **Header hiển thị**: "Đã chọn: X nhân viên"
- **11 cột thông tin**: Mã NV, Tên, Ngày sinh, Khoa, Chức danh, v.v.

### 4. Tối Ưu Trải Nghiệm Người Dùng

#### ⚡ Optimistic Updates

- **Cập nhật UI ngay lập tức** khi thêm/xóa nhân viên
- Temporary IDs: `temp_${Date.now()}_${id}`
- Không cần đợi API response để thấy thay đổi
- Rollback tự động nếu API call thất bại

#### 🎨 Material-UI v5

- **Gradient backgrounds**: Modern design với alpha colors
- **Loading skeletons**: Smooth loading experience
- **Badge components**: Hiển thị counts
- **Confirm dialogs**: Material-UI Dialog với custom messages
- **Toast notifications**: Success/error feedback

#### 💾 Unsaved Changes Tracking

- `hasUnsavedChanges` flag trong Redux state
- **"Cập nhật" button** chỉ xuất hiện khi có thay đổi chưa lưu
- Confirm dialog hiển thị summary trước khi lưu
- Ngăn chặn mất dữ liệu khi chuyển trang

---

## 📖 Hướng Dẫn Nhanh

### Dành cho Quản Lý (Trưởng Khoa / Người có quyền)

#### Bước 1: Truy cập trang quản lý nhân viên

```
Danh sách Nhân Viên → Click nút [Quản lý] bên cạnh tên nhân viên
```

Route: `/workmanagement/nhanvien/:nhanVienId/quanly`

#### Bước 2: Thêm nhân viên vào danh sách Chấm KPI

1. **Chọn tab "Danh sách Chấm KPI"** (tab đầu tiên)
2. Click nút **"Chọn nhân viên"** (màu xanh primary)
3. Dialog mở ra với danh sách tất cả nhân viên
4. **Tích checkbox** bên cạnh nhân viên muốn thêm (có thể chọn nhiều)
5. Click nút **"Chọn"** ở cuối dialog
6. Nhân viên xuất hiện trong danh sách (màu nền khác để phân biệt tạm thời)
7. Click nút **"Cập nhật"** (màu xanh lá, xuất hiện sau khi có thay đổi)
8. Confirm dialog hiển thị: _"Xác nhận cập nhật danh sách chấm KPI? Thêm X nhân viên."_
9. Click **"Xác nhận"**
10. Toast hiển thị: _"Thêm X nhân viên, Tổng cộng: Y quan hệ"_

#### Bước 3: Thêm nhân viên vào danh sách Giao Việc

Tương tự Bước 2, nhưng chọn tab **"Danh sách Giao Việc"**

#### Bước 4: Xóa nhân viên khỏi danh sách

1. Trong bảng danh sách, click nút **[×]** (Delete icon) bên cạnh nhân viên
2. Confirm dialog hiển thị: _"Xác nhận xóa [Tên NV] khỏi danh sách?"_
3. Click **"Xác nhận"**
4. Nhân viên chuyển sang trạng thái tạm thời (đánh dấu xóa)
5. Click nút **"Cập nhật"** để lưu thay đổi
6. Confirm dialog: _"Xác nhận cập nhật? Xóa X quan hệ."_
7. Click **"Xác nhận"**
8. Toast hiển thị: _"Xóa X quan hệ, Tổng cộng: Y quan hệ"_

#### Bước 5: Chuyển đổi loại quan hệ (Giao_Viec ↔ KPI)

**Tính năng nâng cao** - Chuyển nhân viên từ tab này sang tab khác:

1. Click icon **[↔]** (Transfer icon) bên cạnh nhân viên
2. Confirm dialog: _"Chuyển [Tên NV] sang [Loại mới]?"_
3. Click **"Xác nhận"**
4. Nhân viên biến mất khỏi tab hiện tại và xuất hiện ở tab kia
5. Toast: _"Chuyển đổi loại quản lý thành công"_

#### Bước 6: Thêm và Xóa cùng lúc (Sync)

**Workflow hiệu quả nhất:**

1. Click **"Chọn nhân viên"**
2. Trong dialog:
   - **Bỏ tích** các nhân viên không muốn giữ (nếu đã có sẵn)
   - **Tích thêm** các nhân viên mới muốn thêm
3. Click **"Chọn"**
4. UI cập nhật: Hiển thị cả thêm và xóa tạm thời
5. Click **"Cập nhật"**
6. Confirm dialog: _"Xác nhận cập nhật? Thêm X, Xóa Y nhân viên."_
7. Click **"Xác nhận"**
8. Backend thực hiện cả 2 operations trong 1 transaction
9. Toast: _"Thêm X nhân viên, Xóa Y quan hệ, Tổng cộng: Z quan hệ"_

### Dành cho Developer

#### Setup & Installation

```bash
# Frontend dependencies (đã có sẵn)
# Redux Toolkit, Material-UI v5, React Hook Form, Yup

# No additional installation needed
```

#### File Structure

```
QuanLyNhanVien/
├── docs/
│   └── README.md                            # ← File hiện tại (tài liệu chính)
├── components/
│   ├── DanhSachChamKPI.js                 # ✅ Active - Tab chấm KPI (574 lines)
│   ├── DanhSachGiaoViec.js                # ✅ Active - Tab giao việc (566 lines)
│   ├── SelectNhanVienQuanLyDialog.js      # ✅ Active - Dialog multi-select (138 lines)
│   ├── SelectNhanVienQuanLyTable.js       # ✅ Active - Table selection (165 lines)
│   ├── KPITableEnhanced.js                # ⚠️ Chưa tích hợp - Enhanced KPI table
│   ├── NhiemVuTableEnhanced.js            # ⚠️ Chưa tích hợp - Enhanced task table
│   └── QuanHeQuanLyTableEnhanced.js       # ⚠️ Chưa tích hợp - Enhanced relation table
├── quanLyNhanVienSlice.js                 # ✅ Redux slice (392 lines)
├── QuanLyNhanVienPage.js                  # ✅ Main container (476 lines)
├── QuanLyNhanVienButton.js                # ✅ Navigation button (23 lines)
└── intructions_for_this_foder_QuanLyNhanVien.md  # 📚 Legacy (planning doc)
```

> **Note:** Các file `*Enhanced.js` trong `components/` là phiên bản nâng cao đã được phát triển nhưng chưa tích hợp vào luồng chính. Có thể sử dụng trong tương lai hoặc archive.

#### Quick Start - Frontend Integration

**1. Import Redux actions:**

```javascript
import {
  getGiaoViecByNhanVien,
  getChamKPIByNhanVien,
  syncQuanLyNhanVienList,
  addNhanVienToList,
  removeNhanVienFromList,
} from "./quanLyNhanVienSlice";
```

**2. Dispatch trong component:**

```javascript
// Load data
useEffect(() => {
  dispatch(getGiaoViecByNhanVien(nhanVienId));
  dispatch(getChamKPIByNhanVien(nhanVienId));
}, [nhanVienId]);

// Add temporary
const handleAddNhanVien = (nhanVienIds) => {
  dispatch(
    addNhanVienToList({
      loaiQuanLy: "KPI",
      nhanVienIds,
    })
  );
};

// Remove temporary
const handleRemoveNhanVien = (nhanVienId) => {
  dispatch(
    removeNhanVienFromList({
      loaiQuanLy: "KPI",
      nhanVienId,
    })
  );
};

// Sync to database
const handleSync = () => {
  dispatch(
    syncQuanLyNhanVienList({
      nhanVienQuanLyId: nhanVienId,
      loaiQuanLy: "KPI",
      selectedNhanVienIds: chamKPIs.map((cv) => cv.NhanVienDuocQuanLy._id),
    })
  );
};
```

**3. Selectors cho filtered data:**

```javascript
const chamKPIs = useSelector((state) => state.quanLyNhanVien.chamKPIs);
const giaoViecs = useSelector((state) => state.quanLyNhanVien.giaoViecs);
const hasUnsavedChanges = useSelector(
  (state) => state.quanLyNhanVien.hasUnsavedChanges
);
```

#### Quick Start - Backend Integration

**1. Import model và service:**

```javascript
const QuanLyNhanVien = require("../models/QuanLyNhanVien");
const quanLyNhanVienService = require("../services/quanLyNhanVien.service");
```

**2. Query quan hệ quản lý:**

```javascript
// Lấy nhân viên được quản lý theo loại
const managedEmployees = await quanLyNhanVienService.getNhanVienDuocQuanLy(
  managerId,
  { loaiQuanLy: "KPI" }
);

// Lấy cả 2 loại
const allManaged = await quanLyNhanVienService.getNhanVienDuocQuanLy(
  managerId,
  { loaiQuanLy: ["KPI", "Giao_Viec"] }
);
```

**3. Tạo quan hệ mới:**

```javascript
// Single create
await quanLyNhanVienService.themQuanHe(managerId, employeeId, "KPI");

// Batch create
const relations = await QuanLyNhanVien.insertMany(
  employeeIds.map((empId) => ({
    NhanVienQuanLy: managerId,
    NhanVienDuocQuanLy: empId,
    LoaiQuanLy: "KPI",
  }))
);
```

**4. Xóa quan hệ:**

```javascript
// Soft delete single
await quanLyNhanVienService.xoaQuanHe(managerId, employeeId);

// Hard delete (used in sync)
await QuanLyNhanVien.deleteMany({
  _id: { $in: idsToDelete },
});
```

---

## 🔄 Quy Trình Hoạt Động

### Luồng Cơ Bản (Basic Flow)

```
┌─────────────┐
│   Quản Lý   │ Click nút "Quản lý" trên NhanVienList
└──────┬──────┘
       │
       ↓
┌────────────────────────┐
│ QuanLyNhanVienPage     │ Load employee info + 2 lists
│                        │
│ ┌─────────────────┐    │
│ │ Header + Stats  │    │ Avatar, name, badges
│ └─────────────────┘    │
│                        │
│ ┌─────────────────┐    │
│ │ Tab: Chấm KPI   │◄───┼── Default tab
│ │ (DanhSachChamKPI)│   │
│ └─────────────────┘    │
│                        │
│ ┌─────────────────┐    │
│ │ Tab: Giao Việc  │    │
│ │ (DanhSachGiaoViec)│  │
│ └─────────────────┘    │
└────────┬───────────────┘
         │
         ↓
┌──────────────────────┐
│  Action Buttons      │
├──────────────────────┤
│ [Chọn nhân viên]     │ → Opens SelectDialog
│ [Cập nhật]          │ → Syncs to database
│ [×] Delete          │ → Per-row action
│ [↔] Transfer        │ → Change LoaiQuanLy
└──────────────────────┘
```

### Luồng Sync Chi Tiết (Sync Flow)

```
Frontend                    Backend                    Database
────────                    ───────                    ────────

1. User clicks "Cập nhật"
   │
   ├─→ Dispatch syncQuanLyNhanVienList
   │   {
   │     nhanVienQuanLyId,
   │     loaiQuanLy: "KPI",
   │     selectedNhanVienIds: [1,2,3,4,5]
   │   }
   │
   ↓                          │
2. Redux: startLoading()      │
                              ↓
                         POST /api/workmanagement/
                              quan-ly-nhan-vien/sync
                              │
                              ↓
                         3. Controller: syncQuanLyNhanVienList
                              │
                              ├─→ Query current relations
                              │   WHERE NhanVienQuanLy = X
                              │   AND LoaiQuanLy = "KPI"
                              │                      │
                              │                      ↓
                              │                 [1,2,6,7] ← Current IDs
                              │
                              ├─→ Compare with selected
                              │   Selected: [1,2,3,4,5]
                              │   Current:  [1,2,6,7]
                              │
                              ├─→ Calculate difference
                              │   toAdd:    [3,4,5]  ← New
                              │   toDelete: [6,7]    ← Removed
                              │
                              ├─→ deleteMany({ _id: { $in: [6,7] } })
                              │                      │
                              │                      ↓
                              │                  Hard delete 2 relations
                              │
                              ├─→ insertMany([
                              │     { NhanVienQuanLy: X, NhanVienDuocQuanLy: 3, LoaiQuanLy: "KPI" },
                              │     { NhanVienQuanLy: X, NhanVienDuocQuanLy: 4, LoaiQuanLy: "KPI" },
                              │     { NhanVienQuanLy: X, NhanVienDuocQuanLy: 5, LoaiQuanLy: "KPI" }
                              │   ])               │
                              │                      ↓
                              │                  Insert 3 new relations
                              │
                              ├─→ Query final state
                              │   .populate('NhanVienDuocQuanLy')
                              │                      │
                              │                      ↓
                              │                  [1,2,3,4,5] ← Final
                              ↓
                         Return response:
                         {
                           success: true,
                           data: {
                             relations: [...],
                             summary: {
                               added: 3,
                               deleted: 2,
                               total: 5
                             }
                           }
                         }
   ↓                          │
4. Redux: setChamKPIsSuccess  │
   Update state.chamKPIs      │
   hasUnsavedChanges = false  │
   │
   ↓
5. Toast notification:
   "Thêm 3 nhân viên, Xóa 2 quan hệ, Tổng cộng: 5 quan hệ"
```

### Luồng Temporary State (Optimistic UI)

```
User Action          Redux State                    UI Display
───────────          ───────────                    ──────────

1. Click "Chọn nhân viên"
   │
   ↓
   openSelectDialog()  ───→  isOpenSelectDialog = true  ───→  Dialog opens
   │
   ↓
2. Select 3 employees in dialog
   IDs: [emp3, emp4, emp5]
   │
   ↓
   Click "Chọn"
   │
   ↓
   addNhanVienToList   ───→  chamKPIs: [                ───→  Table shows 3 new rows
   ({                           ...existing,                  with lighter background
     loaiQuanLy: "KPI",           { _id: "temp_123_emp3", ... },
     nhanVienIds: [3,4,5]          { _id: "temp_124_emp4", ... },
   })                              { _id: "temp_125_emp5", ... }
                                  ]
                                  hasUnsavedChanges = true
                                                          ───→  "Cập nhật" button appears
   │                                                            (green color)
   ↓
3. Click [×] to remove emp2
   │
   ↓
   removeNhanVienFromList ───→  chamKPIs: [             ───→  Row emp2 still shows
   ({                             ...existing,                 but with strikethrough
     loaiQuanLy: "KPI",            { _id: "emp2", isMarkedForDeletion: true },
     nhanVienId: "emp2"             ...
   })                             ]
                                  hasUnsavedChanges = true
                                                          ───→  "Cập nhật" button enabled
   │
   ↓
4. Click "Cập nhật"
   │
   ↓
   Confirm dialog shows:
   "Xác nhận cập nhật danh sách chấm KPI?
    Thêm 3 nhân viên: [emp3, emp4, emp5]
    Xóa 1 quan hệ: [emp2]"
   │
   ↓
5. User confirms ───→  syncQuanLyNhanVienList ───→  API call...
   │                      │
   ↓                      ↓
   On success:         chamKPIs = response.data  ───→  Replace temporary IDs
                       hasUnsavedChanges = false       with real IDs from DB
                                                  ───→  Remove strikethrough
                                                  ───→  Normal background color
                                                  ───→  Hide "Cập nhật" button
```

---

## 🏆 Điểm Mạnh

### 1. Kiến trúc rõ ràng, dễ mở rộng

✅ **Separation of Concerns:**

- Redux slice riêng biệt (state management)
- Service layer cho business logic
- Component tái sử dụng (DanhSachChamKPI ≈ DanhSachGiaoViec)

✅ **Single Responsibility:**

- Mỗi component có 1 nhiệm vụ rõ ràng
- Dialog chỉ lo selection, Page lo layout, Table lo display

✅ **Easy to extend:**

- Thêm loại quan hệ mới? Chỉ cần update enum
- Thêm field validation? Chỉ cần update schema
- Thêm action button? Chỉ cần update component

### 2. Trải nghiệm người dùng xuất sắc

✅ **Optimistic UI:**

- Không cần đợi API → Phản hồi ngay lập tức
- Loading skeleton cho initial load
- Toast notifications cho feedback

✅ **Smart Filtering:**

- Tự động loại bỏ chính mình (không thể tự quản lý)
- Tự động loại bỏ nhân viên đã có trong danh sách
- Chỉ hiển thị những người có thể chọn

✅ **Confirmation Dialogs:**

- Ngăn chặn thao tác nhầm
- Hiển thị summary rõ ràng trước khi lưu
- Material-UI standard dialogs

### 3. Hiệu suất cao

✅ **Batch Operations:**

- Sync endpoint: 1 API call cho add + delete
- Không gọi API từng nhân viên một
- Sử dụng `insertMany` và `deleteMany`

✅ **Database Indexes:**

- Index trên `NhanVienQuanLy` → Query nhanh theo manager
- Index trên `NhanVienDuocQuanLy` → Query nhanh theo employee
- Unique compound index → Ngăn chặn duplicate

✅ **Memoization:**

- React.memo cho table rows
- useMemo cho filtered data
- Không re-render không cần thiết

### 4. An toàn dữ liệu

✅ **Validation nhiều tầng:**

- Frontend: Không cho chọn chính mình
- Redux: Kiểm tra trước khi dispatch
- Backend: Validate trong service layer
- Database: Pre-save middleware, unique index

✅ **Transaction support:**

- Sync operation đảm bảo atomic
- Hoặc cả 2 thành công (add + delete)
- Hoặc cả 2 rollback

✅ **Error handling:**

- Try-catch ở mọi async operations
- Toast notifications cho user
- Console.error cho developer debugging

---

## 📋 Mục Lục Tài Liệu

> **⚠️ Note:** Hiện tại chỉ có file README.md trong thư mục docs/. Các file tài liệu chi tiết khác được tham chiếu bên dưới là kế hoạch mở rộng trong tương lai.

1. **[README.md](./README.md)** (File hiện tại) ✅

   - Tổng quan module
   - Tính năng chính
   - Hướng dẫn nhanh cho Quản lý & Developer
   - Quy trình hoạt động cơ bản

2. **KIEN_TRUC.md** ❌ Chưa tạo

   - Kiến trúc Frontend: Redux state, components
   - Kiến trúc Backend: Model, Controllers, Services, Routes
   - Data flow diagrams
   - Database schema chi tiết

3. **TAI_LIEU_API.md** ❌ Chưa tạo

   - Chi tiết API endpoints
   - Request/Response examples
   - Error codes
   - cURL examples

4. **THANH_PHAN_GIAO_DIEN.md** ❌ Chưa tạo

   - UI components với props, state, examples
   - Material-UI styling patterns
   - Responsive design

5. **QUY_TRINH_NGHIEP_VU.md** ❌ Chưa tạo

   - Quy trình chi tiết với flowcharts
   - Step-by-step instructions
   - Edge cases

---

## 🔗 API Endpoints Reference

**Base URL:** `/api/workmanagement/quan-ly-nhan-vien`

| Method | Endpoint                | Description               | Auth     |
| ------ | ----------------------- | ------------------------- | -------- |
| GET    | `/giaoviec/:nhanVienId` | Lấy danh sách giao việc   | Required |
| GET    | `/chamkpi/:nhanVienId`  | Lấy danh sách chấm KPI    | Required |
| POST   | `/batch`                | Tạo nhiều quan hệ         | Required |
| DELETE | `/batch`                | Xóa nhiều quan hệ         | Required |
| POST   | `/sync`                 | Đồng bộ danh sách quan hệ | Required |
| PUT    | `/:id/loai`             | Chuyển đổi loại quan hệ   | Required |

---

## 🛤️ Routes

| Route                                         | Component          | Description           |
| --------------------------------------------- | ------------------ | --------------------- |
| `/workmanagement/nhanvien/:nhanVienId/quanly` | QuanLyNhanVienPage | Trang quản lý quan hệ |

---

## 🆕 Lịch Sử Phiên Bản

### V1.1.0 - Tháng 11/2025

- Cập nhật tài liệu, ghi chú status các components
- Sửa File Structure chính xác với code thực tế
- Thêm API Reference section

### V1.0.0 (Production) - Tháng 11/2025

**✅ Hoàn thành:**

- Redux state management với 10 async actions
- 7 UI components (4 active, 3 placeholders)
- 9 Backend API endpoints
- Sync endpoint với batch operations
- Temporary state management (Optimistic UI)
- Material-UI v5 design
- Validation 2-layer (frontend + backend)

**🔧 Đang sử dụng:**

- Database: MongoDB với 3 indexes
- Frontend: React 18 + Redux Toolkit
- Backend: Express.js + Mongoose
- UI Library: Material-UI v5

**📊 Thống kê:**

- Total Code: ~2,800 lines
- Frontend: ~2,000 lines
- Backend: ~800 lines
- Components: 7 (4 implemented, 3 empty)
- API Endpoints: 9
- Documentation Files: 8

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

### Q1: Sự khác biệt giữa Giao_Viec và KPI là gì?

**A:** Hai loại quan hệ **hoàn toàn độc lập**:

- **Giao_Viec**: Xác định **quyền giao nhiệm vụ thường quy**

  - Sử dụng trong module **GiaoNhiemVu**
  - Ví dụ: Trưởng khoa giao việc cho bác sĩ, điều dưỡng trong khoa

- **KPI**: Xác định **quyền chấm điểm hiệu suất**
  - Sử dụng trong module **KPI Evaluation**
  - Ví dụ: Trưởng khoa chấm KPI cho những nhân viên mình trực tiếp quản lý

Một nhân viên có thể có mặt trong cả 2 danh sách, hoặc chỉ 1, hoặc không có trong danh sách nào.

### Q2: Tại sao cần nút "Cập nhật" riêng? Tại sao không lưu ngay?

**A:** Để tối ưu trải nghiệm người dùng:

1. **Batch operations**: Gộp nhiều thao tác (add + delete) trong 1 API call
2. **Undo-able**: User có thể thay đổi ý định trước khi lưu
3. **Confirmation**: Hiển thị summary rõ ràng trước khi commit
4. **Performance**: Giảm số lượng API calls, tránh race conditions

**Example workflow:**

```
User chọn 5 nhân viên → Thấy nhầm → Bỏ chọn 2 → Thêm 1 người khác
→ Click "Cập nhật" 1 lần duy nhất
→ Backend thực hiện: Add 4, Delete 0
```

Nếu lưu ngay: 5 API calls (add) + 2 API calls (delete) + 1 API call (add) = 8 calls!

### Q3: Temporary IDs (`temp_${Date.now()}_${id}`) hoạt động như thế nào?

**A:** Optimistic UI pattern:

1. **User chọn nhân viên mới** → Không có `_id` từ database
2. **Redux tạo temporary ID** để React có thể render (cần unique key)
3. **Format**: `temp_1732600000000_emp123` (timestamp + employee ID)
4. **UI hiển thị ngay** → User thấy thay đổi không cần đợi
5. **Click "Cập nhật"** → API call tạo quan hệ mới
6. **Backend trả về** quan hệ với real MongoDB `_id`
7. **Redux replace** temporary objects bằng real objects
8. **UI update** → Temporary IDs biến mất, real IDs xuất hiện

### Q4: Tại sao có 2 controller files?

**A:** Evolution của codebase:

- **`quanLyNhanVienController.js`** (140 lines): Legacy/simple version

  - CRUD cơ bản
  - Ít logging
  - Sử dụng trong early development

- **`quanLyNhanVien.controller.js`** (522 lines): **Full version (Recommended)**
  - Advanced sync logic với defensive programming
  - Extensive debug logging
  - Handles multiple field name variations
  - Hard delete trong sync (design decision)

**Recommendation:** Sử dụng file 522 lines cho production. File 140 lines có thể archive hoặc xóa.

### Q5: Có thể tự quản lý chính mình không?

**A:** **KHÔNG**. Bị chặn ở 3 tầng:

1. **Frontend**: `SelectNhanVienQuanLyTable` tự động filter bỏ `currentNhanVienQuanLy`
2. **Backend Service**: Logic kiểm tra trước khi tạo quan hệ
3. **Database Schema**: Pre-save middleware throw error nếu `NhanVienQuanLy === NhanVienDuocQuanLy`

```javascript
// In QuanLyNhanVien model
QuanLyNhanVienSchema.pre("save", function (next) {
  if (this.NhanVienQuanLy.toString() === this.NhanVienDuocQuanLy.toString()) {
    return next(new Error("Không thể tự quản lý chính mình"));
  }
  next();
});
```

### Q6: Nếu xóa 1 nhân viên khỏi danh sách, các công việc/KPI đã giao có bị xóa không?

**A:** **KHÔNG**. Các dữ liệu liên quan vẫn được giữ nguyên:

- **GiaoNhiemVu**: Nhiệm vụ đã giao vẫn tồn tại, không bị ảnh hưởng
- **DanhGiaKPI**: Đánh giá KPI đã làm vẫn trong database
- **QuanLyNhanVien**: Chỉ quan hệ quản lý mới bị xóa

**Lý do:**

- Quan hệ quản lý là **configuration**, không phải **transaction data**
- Xóa quan hệ chỉ ảnh hưởng **quyền giao việc mới** và **quyền chấm KPI mới**
- Dữ liệu lịch sử phải được bảo toàn cho audit trail

### Q7: Làm sao để biết nhân viên nào có thể được chọn trong dialog?

**A:** Smart filtering tự động:

```javascript
// In SelectNhanVienQuanLyTable
const availableNhanViens = allNhanViens.filter((nv) => {
  // Loại bỏ chính mình
  if (nv._id === currentNhanVienQuanLy._id) return false;

  // Loại bỏ nhân viên đã có trong danh sách
  const existingIds = chamKPIs.map((cv) => cv.NhanVienDuocQuanLy._id);
  if (existingIds.includes(nv._id)) return false;

  // Loại bỏ nhân viên đã xóa (soft delete)
  if (nv.isDeleted) return false;

  return true;
});
```

**Kết quả:** Dialog chỉ hiển thị những nhân viên:

- ✅ Không phải chính mình
- ✅ Chưa có trong danh sách hiện tại
- ✅ Chưa bị xóa (active employees)

### Q8: Có thể chuyển 1 nhân viên từ KPI sang Giao_Viec (hoặc ngược lại) không?

**A:** **CÓ**. Sử dụng tính năng "Transfer":

1. Click icon **[↔]** bên cạnh nhân viên
2. Confirm transfer
3. Backend update trường `LoaiQuanLy` của quan hệ đó
4. Frontend di chuyển nhân viên từ tab này sang tab kia

**Hoặc:** Xóa khỏi tab này, thêm vào tab kia (tạo quan hệ mới)

**Lưu ý:** Transfer **giữ nguyên `_id`** của quan hệ, chỉ thay đổi `LoaiQuanLy` field.

### Q9: Backend sử dụng soft delete hay hard delete?

**A:** **Cả hai**, tùy endpoint:

- **Soft Delete** (set `isDeleted: true`):

  - `DELETE /batch` endpoint
  - `xoaQuanHe()` service method
  - Giữ data cho audit trail

- **Hard Delete** (physical delete from DB):
  - **`POST /sync` endpoint** (design decision)
  - Sử dụng `deleteMany()` Mongoose method
  - Removed relations thực sự bị xóa khỏi database

**Lý do sử dụng hard delete trong sync:**

- Sync là replace operation (không phải incremental update)
- Không cần lưu lịch sử trong QuanLyNhanVien (không phải transaction data)
- Giảm database bloat
- Simplify query logic (không cần filter `isDeleted: false`)

### Q10: Module này tích hợp với module nào?

**A:** 3 modules chính:

1. **NhanVien Module** (Source data)

   - Lấy danh sách tất cả nhân viên
   - Population cho thông tin chi tiết

2. **GiaoNhiemVu Module** (Consumer)

   - Query quan hệ `LoaiQuanLy: "Giao_Viec"`
   - Lọc danh sách nhân viên khi giao nhiệm vụ

3. **KPI Module** (Consumer)
   - Query quan hệ `LoaiQuanLy: "KPI"`
   - Lọc danh sách nhân viên khi chấm điểm

**Middleware:**

- `validateQuanLy`: Extract `NhanVienID` từ authenticated user

**Critical Note:** Sử dụng `user.NhanVienID` (NOT `user._id`) - Xem [TICH_HOP_MODULE.md](./TICH_HOP_MODULE.md)

---

## 🚀 Bước Tiếp Theo

### Cho Người Dùng (Quản Lý)

1. **Đọc hướng dẫn nhanh** ở trên
2. **Thử nghiệm** trên môi trường test:
   - Thêm vài nhân viên vào danh sách
   - Xóa và thêm lại
   - Chuyển đổi giữa 2 loại
3. **Liên hệ Admin** nếu cần hỗ trợ
4. **Feedback** về trải nghiệm sử dụng

### Cho Developer

1. **Đọc kiến trúc**: [KIEN_TRUC.md](./KIEN_TRUC.md)
2. **Hiểu API**: [TAI_LIEU_API.md](./TAI_LIEU_API.md)
3. **Xem components**: [THANH_PHAN_GIAO_DIEN.md](./THANH_PHAN_GIAO_DIEN.md)
4. **Học workflow**: [QUY_TRINH_NGHIEP_VU.md](./QUY_TRINH_NGHIEP_VU.md)
5. **Integration**: [TICH_HOP_MODULE.md](./TICH_HOP_MODULE.md)
6. **Testing**: Viết unit tests cho Redux slice và API endpoints

### Cho Maintainer

1. **Review code**: Consolidate 2 controllers
2. **Cleanup**: Remove empty placeholder files
3. **Testing**: Add unit + integration tests
4. **Performance**: Monitor query performance với indexes
5. **Documentation**: Keep docs updated khi có thay đổi
6. **Future features**: Xem [CHANGELOG.md](./CHANGELOG.md) section "Future Enhancements"

---

## 📞 Hỗ Trợ

**Vấn đề kỹ thuật:**

- Tạo issue trên repository
- Tag: `module:quanlynhanvien`

**Câu hỏi nghiệp vụ:**

- Liên hệ Product Owner
- Email: [product@hospital.vn](mailto:product@hospital.vn)

**Bug reports:**

- Mô tả chi tiết: Steps to reproduce, Expected vs Actual
- Attach screenshots nếu có
- Console errors (F12 Developer Tools)

---

**Cập nhật lần cuối:** 26/11/2025  
**Phiên bản:** 1.0.0  
**Tác giả:** Hospital IT Team  
**License:** Internal Use Only
