# BÁO CÁO HOÀN THÀNH: Module Báo Cáo & Thống Kê KPI

## 📊 Tổng Quan

Module **Báo cáo & Thống kê KPI** đã được xây dựng hoàn chỉnh từ Backend đến Frontend với đầy đủ tính năng:

- ✅ **Backend API**: 3 endpoints với MongoDB aggregation pipelines
- ✅ **Frontend Redux**: State management với 4 async actions
- ✅ **UI Components**: 10+ components với Material-UI và Recharts
- ✅ **Filters**: Permission-based filtering (Manager vs Admin)
- ✅ **Charts**: 4 biểu đồ trực quan (Bar, Pie, Distribution, Trend Line)
- ✅ **Export**: Excel export với dynamic data
- ✅ **Responsive**: Mobile-first design

**Route**: `/quanlycongviec/kpi/bao-cao` (Admin only)

---

## 🏗️ Kiến Trúc

### Backend Structure

```
giaobanbv-be/modules/workmanagement/
├── controllers/kpi.controller.js
│   ├── getBaoCaoThongKe()         # 7 aggregation pipelines
│   ├── getBaoCaoChiTiet()         # Paginated detailed list
│   └── exportBaoCaoExcel()        # Excel generation
└── routes/kpi.api.js
    ├── GET /bao-cao/thong-ke
    ├── GET /bao-cao/chi-tiet
    └── GET /bao-cao/export-excel
```

### Frontend Structure

```
src/features/QuanLyCongViec/BaoCaoThongKeKPI/
├── BaoCaoKPIPage.js              # Main container
├── baoCaoKPISlice.js             # Redux state management
└── components/
    ├── FilterPanel.js            # Filters (chu kỳ, khoa, dates)
    ├── SummaryCards.js           # 4 overview stat cards
    ├── ChartsSection.js          # Charts container
    ├── BarChartByDepartment.js   # Điểm TB theo khoa
    ├── PieChartStatus.js         # Approval status
    ├── DistributionChart.js      # Score distribution
    ├── TrendLineChart.js         # Monthly trend
    ├── TopPerformersTable.js     # Top 10 + Bottom 10
    ├── DetailedDataTable.js      # Full data with pagination
    └── ExportButtons.js          # Excel/PDF export
```

---

## 📡 Backend API Details

### 1. GET `/workmanagement/kpi/bao-cao/thong-ke`

**Query Parameters**:

- `chuKyId` (optional): Filter by evaluation cycle
- `khoaId` (optional): Filter by department (Admin only)
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response Structure**:

```json
{
  "success": true,
  "data": {
    "tongQuan": {
      "tongSoNhanVien": 150,
      "tongSoDanhGia": 150,
      "daDuyet": 120,
      "tyLeHoanThanh": 80,
      "diemTrungBinh": 7.8,
      "diemCaoNhat": 9.5,
      "diemThapNhat": 4.2,
      "soKhoaThamGia": 12
    },
    "phanBoMucDiem": [
      { "_id": 9, "soLuong": 45, "tyLe": 30 },
      { "_id": 7, "soLuong": 50, "tyLe": 33.33 }
    ],
    "theoKhoa": [
      { "_id": "...", "tenKhoa": "Khoa Nội", "soLuong": 25, "diemTrungBinh": 8.2 }
    ],
    "xuHuongTheoThang": [
      { "thang": 11, "nam": 2024, "soLuong": 50, "diemTrungBinh": 7.9 }
    ],
    "topNhanVienXuatSac": [...],
    "nhanVienCanCaiThien": [...],
    "phanBoTrangThai": [
      { "trangThai": "approved", "soLuong": 120, "tyLe": 80 }
    ]
  }
}
```

**Permission Logic**:

- **Manager (PhanQuyen < 3)**: Only sees their department's data
- **Admin (PhanQuyen >= 3)**: Sees all departments

**MongoDB Aggregations**:

1. **tongQuan**: `$group` with `$sum`, `$avg`, `$max`, `$min`
2. **phanBoMucDiem**: `$bucket` with boundaries `[0, 3, 5, 7, 9, 10]`
3. **theoKhoa**: `$group` by `KhoaID` with `$lookup` to khoas
4. **xuHuongTheoThang**: `$group` by month/year (if date range provided)
5. **topNhanVienXuatSac**: `$sort` by `TongDiem` descending, `$limit` 10
6. **nhanVienCanCaiThien**: `$sort` by `TongDiem` ascending, `$limit` 10
7. **phanBoTrangThai**: `$group` by `TrangThai`

---

### 2. GET `/workmanagement/kpi/bao-cao/chi-tiet`

**Query Parameters**:

- All from `/thong-ke` endpoint
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional): Search by employee name

**Response**:

```json
{
  "success": true,
  "data": {
    "danhSach": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "total": 150,
      "limit": 10
    }
  }
}
```

---

### 3. GET `/workmanagement/kpi/bao-cao/export-excel`

**Query Parameters**: Same as `/thong-ke`

**Response**: Binary Excel file with:

- **Tổng quan sheet**: Summary statistics
- **Chi tiết sheet**: Full employee data with columns:
  - STT, Nhân viên, Khoa/Phòng, Chu kỳ, Điểm, Xếp loại, Trạng thái, Ngày đánh giá

**Libraries**: `exceljs` for generation

---

## 🎨 Frontend Components

### FilterPanel Component

**File**: `components/FilterPanel.js`

**Features**:

- **Chu kỳ đánh giá**: Dropdown (all cycles)
- **Khoa/Phòng**: Dropdown (disabled for Manager role)
- **Từ ngày / Đến ngày**: DatePicker with dayjs
- **Clear filters**: Reset all filters button

**Permission Logic**:

```javascript
if (user.PhanQuyen < 3) {
  // Manager: filter khoas by user's department
  filteredKhoas = khoas.filter((k) => k._id === user.KhoaID._id);
}
```

---

### SummaryCards Component

**File**: `components/SummaryCards.js`

**4 Cards**:

1. **Tổng số nhân viên** (Purple gradient)

   - Icon: PeopleIcon
   - Value: `tongQuan.tongSoNhanVien`
   - Subtitle: `${tongSoDanhGia} đánh giá`

2. **Tỷ lệ hoàn thành** (Green gradient)

   - Icon: CheckIcon
   - Value: `${tyLeHoanThanh}%`
   - Subtitle: `${daDuyet}/${tongSoDanhGia} đã duyệt`

3. **Điểm trung bình** (Pink gradient)

   - Icon: TrendIcon
   - Value: `diemTrungBinh.toFixed(2)`
   - Subtitle: `Cao nhất: ${diemCaoNhat}`

4. **Số khoa tham gia** (Blue gradient)
   - Icon: PieIcon
   - Value: `soKhoaThamGia`
   - Subtitle: `Thấp nhất: ${diemThapNhat}`

**Styling**: Gradient backgrounds, hover effects, decorative circles

---

### ChartsSection Component

**File**: `components/ChartsSection.js`

**Layout** (Grid):

```
┌─────────────────────┬──────────┐
│  BarChart (8 cols)  │ Pie (4)  │
├──────────────┬──────┴──────────┤
│ Distribution │ Trend Line      │
│   (6 cols)   │   (6 cols)      │
└──────────────┴─────────────────┘
```

#### 1. BarChartByDepartment

- **Data**: `theoKhoa` (điểm TB theo khoa)
- **Chart Type**: Recharts BarChart
- **X-Axis**: Tên khoa (rotated -45°)
- **Y-Axis**: Điểm trung bình (0-10)
- **Custom Tooltip**: Shows name, điểm TB, số lượng

#### 2. PieChartStatus

- **Data**: `phanBoTrangThai`
- **Colors**:
  - Đã duyệt: #4caf50 (green)
  - Chưa duyệt: #ff9800 (orange)
- **Custom Label**: Percentage inside pie
- **Legend**: Bottom

#### 3. DistributionChart

- **Data**: `phanBoMucDiem`
- **Chart Type**: BarChart with colored bars
- **Colors**:
  - Xuất sắc (9-10): Green
  - Tốt (7-9): Blue
  - Khá (5-7): Orange
  - Trung bình (3-5): Red-orange
  - Yếu (0-3): Red

#### 4. TrendLineChart

- **Data**: `xuHuongTheoThang`
- **Chart Type**: LineChart
- **Condition**: Only shows if `startDate` and `endDate` filters are set
- **X-Axis**: `Tháng ${thang}/${nam}`
- **Y-Axis**: Điểm TB (0-10)
- **Line**: Smooth monotone curve

---

### TopPerformersTable Component

**File**: `components/TopPerformersTable.js`

**2 Tables Side-by-Side**:

1. **Top 10 Xuất sắc** (Green theme)

   - Gold/Silver/Bronze badges for top 3
   - Success background for top 3 rows
   - Data: `topNhanVienXuatSac`

2. **Top 10 Cần cải thiện** (Warning theme)
   - Warning color theme
   - Data: `nhanVienCanCaiThien`

**Columns**: #, Nhân viên (tên + email), Khoa/Phòng, Điểm TB (chip)

---

### DetailedDataTable Component

**File**: `components/DetailedDataTable.js`

**Features**:

- **Search**: TextField with enter-to-search
- **Refresh**: IconButton to reload data
- **Pagination**: Material-UI TablePagination (5/10/25/50 rows)
- **Columns**:
  - STT (auto-calculated from page)
  - Nhân viên (name + email)
  - Khoa/Phòng
  - Chu kỳ
  - Điểm (bold primary color)
  - Xếp loại (colored chip)
  - Trạng thái (icon + chip)
  - Ngày đánh giá

**Score Classification**:

```javascript
≥9: "Xuất sắc" (success)
≥7: "Tốt" (info)
≥5: "Khá" (warning)
<5: "Yếu" (error)
```

---

### ExportButtons Component

**File**: `components/ExportButtons.js`

**2 Buttons**:

1. **Xuất Excel** (Green button)

   - Calls `exportExcelKPI(filters)`
   - Downloads blob file
   - Success toast on complete

2. **Xuất PDF** (Red button)
   - Currently shows "Đang được phát triển" toast
   - TODO: Implement PDF export

---

## 🔄 Redux State Management

**File**: `baoCaoKPISlice.js`

### State Structure

```javascript
{
  // Data
  tongQuan: { ... },
  phanBoMucDiem: [ ... ],
  theoKhoa: [ ... ],
  xuHuongTheoThang: [ ... ],
  topNhanVienXuatSac: [ ... ],
  nhanVienCanCaiThien: [ ... ],
  phanBoTrangThai: [ ... ],
  danhSachChiTiet: [ ... ],

  // Filters
  filters: {
    chuKyId: "",
    khoaId: "",
    startDate: null,
    endDate: null,
    groupBy: "khoa"
  },

  // UI
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
    limit: 10
  }
}
```

### Actions

#### 1. `getThongKeKPI(filters)`

- **Endpoint**: GET `/bao-cao/thong-ke`
- **Success**: Updates all 7 thống kê arrays
- **Toast**: "Tải dữ liệu thống kê thành công!"

#### 2. `getChiTietKPI(filters, page, limit, search)`

- **Endpoint**: GET `/bao-cao/chi-tiet`
- **Params**: `?page=${page}&limit=${limit}&search=${search}&...filters`
- **Success**: Updates `danhSachChiTiet` and `pagination`

#### 3. `exportExcelKPI(filters)`

- **Endpoint**: GET `/bao-cao/export-excel`
- **Response Type**: `blob`
- **Download**: Creates `<a>` element with download link
- **Filename**: `BaoCaoKPI_${Date.now()}.xlsx`
- **Toast**: "Xuất Excel thành công!"

#### 4. `exportPDFKPI(filters)`

- **Status**: Not implemented yet
- **TODO**: Add PDF generation logic

### Reducers

- `setFilters(state, action)`: Updates filters object
- `resetFilters(state)`: Resets to initial values
- `startLoading(state)`: Sets isLoading = true
- `hasError(state, action)`: Sets error message
- Success reducers for each action

---

## 📄 BaoCaoKPIPage Container

**File**: `BaoCaoKPIPage.js`

### Layout Structure

```javascript
<Container maxWidth="xl">
  {/* 1. Header with Icon & Title */}
  <Paper> ... </Paper>

  {/* 2. Filters Panel */}
  <Paper>
    <FilterPanel />
  </Paper>

  {/* 3. Summary Cards */}
  <SummaryCards />

  <Divider />

  {/* 4. Charts Section */}
  <ChartsSection />

  <Divider />

  {/* 5. Top Performers */}
  <TopPerformersTable />

  <Divider />

  {/* 6. Detailed Table + Export */}
  <Stack direction="row" justifyContent="space-between">
    <Typography>Chi tiết đánh giá</Typography>
    <ExportButtons />
  </Stack>
  <DetailedDataTable />
</Container>
```

### Data Loading

```javascript
useEffect(() => {
  dispatch(getThongKeKPI(filters));
}, [dispatch, filters]);
```

**Auto-reload**: Whenever filters change, statistics are reloaded

---

## 🔐 Permission System

### Role-Based Access

**Manager (PhanQuyen < 3)**:

- Can only see their own department's data
- Khoa filter is **disabled** and pre-selected
- Backend applies: `baseFilter.khoaFilter = userKhoaId`

**Admin (PhanQuyen >= 3)**:

- Can see all departments
- Khoa filter is **enabled**
- Can select "Tất cả khoa" or specific department

### Backend Filter Logic

```javascript
const baseFilter = {};

if (PhanQuyen < 3) {
  // Manager: Force khoa filter
  baseFilter.khoaFilter = { $eq: new mongoose.Types.ObjectId(userKhoaId) };
} else if (khoaId) {
  // Admin with khoa selected
  baseFilter.khoaFilter = { $eq: new mongoose.Types.ObjectId(khoaId) };
}

// Apply to aggregation pipeline
{
  $match: {
    KhoaID: baseFilter.khoaFilter;
  }
}
```

---

## 📦 Dependencies

### Backend

```json
{
  "exceljs": "^4.x" // Excel generation
}
```

**Install**:

```bash
cd giaobanbv-be
npm install exceljs
```

### Frontend

```json
{
  "recharts": "^2.x", // Charts library
  "@mui/x-date-pickers": "^6.x", // Date pickers
  "dayjs": "^1.x" // Date manipulation
}
```

**Install**:

```bash
cd fe-bcgiaobanbvt
npm install recharts @mui/x-date-pickers dayjs
```

---

## 🎯 Testing Checklist

### Backend Testing

- [ ] Test `/bao-cao/thong-ke` without filters
- [ ] Test with `chuKyId` filter
- [ ] Test with `khoaId` filter (Admin)
- [ ] Test with date range (startDate + endDate)
- [ ] Verify Manager can only see their department
- [ ] Verify Admin sees all departments
- [ ] Test `/bao-cao/chi-tiet` pagination (page 1, 2, 3...)
- [ ] Test search functionality
- [ ] Test `/bao-cao/export-excel` download
- [ ] Verify Excel file structure (2 sheets)

### Frontend Testing

- [ ] Load page as Manager → Khoa filter disabled
- [ ] Load page as Admin → Khoa filter enabled
- [ ] Change filters → Data reloads automatically
- [ ] Select date range → Trend chart appears
- [ ] Clear filters → All data shown
- [ ] Summary cards show correct numbers
- [ ] All 4 charts render correctly
- [ ] Top performers tables show data
- [ ] Detailed table pagination works
- [ ] Search in detailed table works
- [ ] Click "Xuất Excel" → File downloads
- [ ] Responsive on mobile (charts stack vertically)

### Permission Testing

- [ ] Login as Manager → See only department data
- [ ] Login as Admin → See all departments
- [ ] Manager cannot change Khoa filter
- [ ] Admin can select different departments

---

## 🚀 Next Steps

### Immediate Actions

1. **Install Dependencies**:

   ```bash
   # Backend
   cd giaobanbv-be
   npm install exceljs

   # Frontend
   cd fe-bcgiaobanbvt
   npm install recharts @mui/x-date-pickers dayjs
   ```

2. **Test with Real Data**:

   - Create test KPI evaluations in database
   - Verify aggregations return correct results
   - Test permissions with different users

3. **Performance Optimization** (if needed):
   - Add indexes on MongoDB: `KhoaID`, `ChuKyID`, `TrangThai`, `NgayTao`
   - Implement data caching for frequently accessed statistics

### Future Enhancements

- [ ] PDF export implementation
- [ ] Email report scheduling
- [ ] Compare multiple cycles side-by-side
- [ ] Export chart images
- [ ] Print-friendly view
- [ ] Advanced filters (by employee, by score range)
- [ ] Data visualization: Radar chart for criteria breakdown

---

## 📚 Key Files Reference

### Backend

- `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js` (lines 2300-2900)
- `giaobanbv-be/modules/workmanagement/routes/kpi.api.js` (line 317+)

### Frontend

- `src/features/QuanLyCongViec/BaoCaoThongKeKPI/BaoCaoKPIPage.js`
- `src/features/QuanLyCongViec/BaoCaoThongKeKPI/baoCaoKPISlice.js`
- `src/features/QuanLyCongViec/BaoCaoThongKeKPI/components/` (10 components)
- `src/app/store.js` (added baoCaoKPI reducer)
- `src/routes/index.js` (route already exists, now re-exports new page)

---

## 🎉 Summary

**Module hoàn chỉnh với**:

- ✅ 3 Backend endpoints
- ✅ 7 MongoDB aggregation pipelines
- ✅ 1 Redux slice (200+ lines)
- ✅ 10 React components (1500+ lines)
- ✅ Permission-based filtering
- ✅ 4 interactive charts
- ✅ Excel export functionality
- ✅ Responsive design
- ✅ Vietnamese localization

**Thời gian phát triển**: ~2 hours (full-stack implementation)

**Status**: ✅ **READY FOR TESTING** (pending npm install)

---

**Tác giả**: AI Agent  
**Ngày hoàn thành**: 2024  
**Module**: Quản Lý Công Việc → KPI → Báo cáo & Thống kê
