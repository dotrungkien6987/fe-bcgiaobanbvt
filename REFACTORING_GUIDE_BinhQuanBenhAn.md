# Refactoring BinhQuanBenhAn Component

## Tổng quan

File `BinhQuanBenhAn.js` đã được refactor từ 1146 dòng thành kiến trúc modular với các component riêng biệt, giảm xuống còn khoảng 390 dòng trong file chính.

## Cấu trúc mới

```
src/features/DashBoard/BinhQuanBenhAn/
├── index.js                         # Barrel exports
├── constants.js                     # VND/PCT formatters, colors, enums
├── helpers.js                       # Sort & CSV export functions
└── components/
    ├── PercentageBar.jsx           # Progress bar với phần trăm
    ├── TableToolbar.jsx            # Search/Reset/Export toolbar
    ├── SummaryCards.jsx            # 4 metric cards
    ├── TabPanel.jsx                # Tab content wrapper
    └── DataTable.jsx               # Bảng dữ liệu với sticky columns
```

## File chính (BinhQuanBenhAn.js)

**Trước refactoring:** 1146 dòng

- Chứa tất cả: helpers, components, business logic
- Khó đọc, khó bảo trì, khó test

**Sau refactoring:** ~390 dòng

- Chỉ chứa business logic và state management
- Import components từ thư mục modular
- Dễ đọc, dễ bảo trì, dễ test

### Imports chính

```javascript
import {
  TableToolbar,
  SummaryCards,
  TabPanel,
  DataTable,
  getComparator,
  stableSort,
  exportToCSV,
} from "./BinhQuanBenhAn";
```

### State Management

- **Date states:** `date`, `dateChenhLech`, `isToday`, `thang`, `nam`, `ngay`
- **Tab state:** `currentTab` (0=Nội trú, 1=Ngoại trú)
- **Filter/Sort states:**
  - Nội trú: `searchNoiTru`, `orderNoiTru`, `orderByNoiTru`
  - Ngoại trú: `searchNgoaiTru`, `orderNgoaiTru`, `orderByNgoaiTru`

### Data Flow

1. **Redux Store** → `rowsFromStore`
2. **Filter** → `baseRows` (remove invalid records)
3. **Split** → `rowsNoiTru` / `rowsNgoaiTru` (by LoaiKhoa)
4. **Search** → `filteredNoiTru` / `filteredNgoaiTru`
5. **Sort** → `sortedNoiTru` / `sortedNgoaiTru`
6. **Totals** → `totalsNoiTru` / `totalsNgoaiTru`

## Components chi tiết

### 1. constants.js (27 lines)

**Purpose:** Centralized formatters and constants

```javascript
export const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const PCT = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
});

export const COLORS = {
  thuoc: "#00C49F",
  vattu: "#FFBB28",
};

export const LOAI_KHOA = {
  NOITRU: "noitru",
  NGOAITRU: "ngoaitru",
};
```

### 2. helpers.js (69 lines)

**Purpose:** Utility functions for sorting and CSV export

**Key Functions:**

- `descendingComparator(a, b, orderBy)` - Compare values for sorting
- `getComparator(order, orderBy)` - Returns comparator function
- `stableSort(array, comparator)` - Stable sort implementation
- `exportToCSV(rows, loaiKhoa)` - Export filtered data to CSV

### 3. PercentageBar.jsx (32 lines)

**Purpose:** Reusable progress bar with percentage display

**Props:**

- `value` (number): 0-1 decimal representing percentage
- `color` (string): Hex color code for progress bar

**Features:**

- Responsive sizing (6px/8px height)
- Dark mode support
- Percentage text display

### 4. TableToolbar.jsx (62 lines)

**Purpose:** Search/filter toolbar with export button

**Props:**

- `search` (string): Current search text
- `setSearch` (function): Update search text
- `onReset` (function): Reset filters
- `onExport` (function): Export CSV
- `loaiKhoa` (string): "noitru" | "ngoaitru"

**Features:**

- Search input with icon
- Reset button with tooltip
- Export CSV button with dynamic label

### 5. SummaryCards.jsx (136 lines)

**Purpose:** Display 4 metric summary cards

**Props:**

- `totals` (object): `{ totalCases, totalMoney, totalThuoc, totalVattu, avgPerCase }`
- `filteredLength` (number): Number of departments shown

**Cards:**

1. **Tổng số khoa** (Blue #1939B7)
2. **Tổng ca viện phí** (Green #00C49F)
3. **Tổng doanh thu** (Red #bb1515)
4. **Bình quân/ca** (Yellow #FFBB28)

### 6. TabPanel.jsx (20 lines)

**Purpose:** Wrapper for tab content with conditional rendering

**Props:**

- `children` (ReactNode): Tab content
- `value` (number): Current tab index
- `index` (number): This panel's index

### 7. DataTable.jsx (261 lines)

**Purpose:** Main data table with sticky columns and sorting

**Props:**

- `sorted` (array): Sorted row data
- `totals` (object): Totals for footer row
- `order` (string): "asc" | "desc"
- `orderBy` (string): Column id for sorting
- `onRequestSort` (function): Handle sort request
- `darkMode` (boolean): Dark mode flag

**Features:**

- **Sticky columns:** STT (left: 0), TenKhoa (left: 40/50px)
- **Sortable columns:** vienphi_count, total_money, total_thuoc, total_vattu, avg_money_per_case, ty_le_thuoc, ty_le_vattu
- **Responsive fonts:** xs: 0.7rem, sm: 0.875rem
- **Totals row:** Summary at bottom with all totals
- **Progress bars:** For thuốc/vật tư percentages using PercentageBar component

**Columns:**

1. STT (sticky, center)
2. Tên Khoa (sticky, left)
3. Số ca (sortable, center, blue)
4. Tổng tiền (sortable, right)
5. Thuốc (sortable, right)
6. Vật tư (sortable, right)
7. Bình quân/ca (sortable, right, red)
8. Tỷ lệ thuốc (%) (sortable, center, progress bar)
9. Tỷ lệ vật tư (%) (sortable, center, progress bar)

## index.js (Barrel Exports)

```javascript
// Component exports
export { default as PercentageBar } from "./components/PercentageBar";
export { default as TableToolbar } from "./components/TableToolbar";
export { default as SummaryCards } from "./components/SummaryCards";
export { default as TabPanel } from "./components/TabPanel";
export { default as DataTable } from "./components/DataTable";

// Utility exports
export { VND, PCT, COLORS, LOAI_KHOA } from "./constants";
export {
  descendingComparator,
  getComparator,
  stableSort,
  exportToCSV,
} from "./helpers";
```

## Lợi ích của refactoring

### 1. Maintainability

- **Separation of Concerns:** UI components, business logic, utilities tách biệt
- **Single Responsibility:** Mỗi component có một mục đích rõ ràng
- **Easy to locate:** Biết ngay file nào chứa logic cần sửa

### 2. Reusability

- **PercentageBar:** Có thể dùng ở bất kỳ đâu cần hiển thị phần trăm
- **TableToolbar:** Template cho các bảng khác
- **SummaryCards:** Dễ thêm/bớt card hoặc tùy chỉnh layout

### 3. Testability

- **Unit tests:** Mỗi component có thể test riêng
- **Mock data:** Dễ tạo props giả để test
- **Isolation:** Lỗi trong component không ảnh hưởng component khác

### 4. Performance

- **Memoization:** useMemo works better với smaller components
- **Selective re-renders:** React.memo có thể áp dụng cho từng component
- **Code splitting:** Có thể lazy load components nếu cần

### 5. Developer Experience

- **Easier navigation:** Jump to component definition
- **Better IntelliSense:** Props typing clearer
- **Faster debugging:** Smaller files, less scrolling
- **Team collaboration:** Multiple devs can work on different components

## Duy trì tính năng hiện có

✅ **Sticky columns:** STT và TenKhoa vẫn sticky với z-index layering
✅ **Responsive fonts:** Tất cả font sizes responsive xs/sm breakpoints
✅ **Tab system:** 2 tabs Nội trú/Ngoại trú hoạt động bình thường
✅ **CSV export:** Export riêng cho từng tab
✅ **Sorting:** Tất cả columns sortable vẫn hoạt động
✅ **Search:** Filter theo tên khoa
✅ **Date pickers:** Chọn ngày và ngày tính chênh lệch
✅ **Auto refresh:** 15 phút khi xem hôm nay
✅ **Dark mode:** Support đầy đủ

## Migration Notes

### Backup

File cũ được backup tại: `BinhQuanBenhAn_Backup.js`

### Breaking Changes

Không có breaking changes. API và behavior giữ nguyên 100%.

### Rollback

Nếu cần rollback:

```bash
cd src/features/DashBoard
Copy-Item BinhQuanBenhAn_Backup.js BinhQuanBenhAn.js
```

## Hướng dẫn mở rộng

### Thêm column mới vào bảng

1. Cập nhật `headCells` array trong `DataTable.jsx`
2. Thêm `<TableCell>` tương ứng trong body loop
3. Thêm vào `exportToCSV` function trong `helpers.js` nếu cần

### Thêm metric card mới

1. Mở `SummaryCards.jsx`
2. Thêm `<Card>` component với styling tương tự
3. Update props interface nếu cần data mới

### Thêm filter mới

1. Thêm state trong `BinhQuanBenhAn.js`
2. Update `filteredNoiTru`/`filteredNgoaiTru` useMemo
3. Thêm UI control trong component phù hợp (có thể TableToolbar)

### Tạo variant mới của component

Example: Tạo `TableToolbarCompact.jsx` cho mobile

```javascript
// Import từ index.js để reuse
import { TableToolbar } from "../BinhQuanBenhAn";

// Hoặc tạo mới với props tương tự
function TableToolbarCompact({ search, setSearch, onReset, onExport }) {
  // Custom compact layout
}
```

## Checklist hoàn thành

- ✅ Tạo thư mục `BinhQuanBenhAn/`
- ✅ Tạo `constants.js` với formatters và constants
- ✅ Tạo `helpers.js` với sort và export functions
- ✅ Tạo `components/PercentageBar.jsx`
- ✅ Tạo `components/TableToolbar.jsx`
- ✅ Tạo `components/SummaryCards.jsx`
- ✅ Tạo `components/TabPanel.jsx`
- ✅ Tạo `components/DataTable.jsx`
- ✅ Tạo `index.js` barrel exports
- ✅ Refactor main `BinhQuanBenhAn.js` để sử dụng components
- ✅ Backup file cũ
- ✅ Kiểm tra không có lỗi compile
- ✅ Verify tất cả tính năng giữ nguyên
- ✅ Tạo tài liệu

## Kết luận

Refactoring thành công giảm độ phức tạp của file chính từ 1146 dòng xuống 390 dòng (~66% reduction), đồng thời tạo ra 8 files modular, dễ bảo trì, dễ test, và dễ mở rộng. Tất cả tính năng hiện tại (sticky columns, responsive design, tabs, sorting, CSV export) đều được giữ nguyên 100%.
