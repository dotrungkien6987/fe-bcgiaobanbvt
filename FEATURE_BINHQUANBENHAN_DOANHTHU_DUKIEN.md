# ✅ Feature: Toggle Doanh Thu Dự Kiến cho Bình Quân Bệnh Án

## 📋 Tổng Quan

Thêm khả năng chuyển đổi giữa **Doanh thu duyệt kế toán** và **Doanh thu dự kiến** trong trang xem Bình quân bệnh án.

---

## 🎯 Yêu Cầu

### Backend (Đã có sẵn)

Backend đã cung cấp 2 JSON mới trong `ChiSoDashBoard`:

```javascript
{
  Code: "json_binhquan_benhan_dukien",
  Value: "[{...}]"  // Cấu trúc giống json_binhquan_benhan_theokhoa
}
{
  Code: "json_thongke_vienphi_dukien",
  Value: "{...}"   // Cấu trúc giống json_thongke_vienphi_duyetketoan
}
```

### Frontend Requirements

- ✅ Thêm state quản lý 4 fields mới trong Redux
- ✅ Parse dữ liệu từ 2 JSON mới
- ✅ Thêm ToggleButtonGroup với 2 options
- ✅ Conditional data source dựa vào toggle state
- ✅ UI/UX giữ nguyên 100%

---

## 🔧 Implementation Details

### 1. Redux Slice Updates (`dashboardSlice.js`)

#### **Added State Fields:**

```javascript
// initialState
BinhQuanBenhAn_DuKien: [],
BinhQuanBenhAn_DuKien_NgayChenhLech: [],
ThongKe_VienPhi_DuKien: {},
ThongKe_VienPhi_DuKien_NgayChenhLech: {},
```

#### **Parse trong `getDataNewestByNgaySuccess`:**

```javascript
state.BinhQuanBenhAn_DuKien = state.chisosObj.json_binhquan_benhan_dukien
  ? JSON.parse(state.chisosObj.json_binhquan_benhan_dukien)
  : [] || [];

state.ThongKe_VienPhi_DuKien = state.chisosObj.json_thongke_vienphi_dukien
  ? JSON.parse(state.chisosObj.json_thongke_vienphi_dukien)
  : {};
```

#### **Parse trong `getDataNewestByNgayChenhLechSuccess`:**

```javascript
state.BinhQuanBenhAn_DuKien_NgayChenhLech = state.chisosObj_NgayChenhLech
  .json_binhquan_benhan_dukien
  ? JSON.parse(state.chisosObj_NgayChenhLech.json_binhquan_benhan_dukien)
  : [] || [];

state.ThongKe_VienPhi_DuKien_NgayChenhLech = state.chisosObj_NgayChenhLech
  .json_thongke_vienphi_dukien
  ? JSON.parse(state.chisosObj_NgayChenhLech.json_thongke_vienphi_dukien)
  : {};
```

---

### 2. UI Component Updates (`BinhQuanBenhAn.js`)

#### **Added Toggle State:**

```javascript
const [loaiDoanhThu, setLoaiDoanhThu] = useState("duyetketoan");
```

#### **Get New Redux Data:**

```javascript
const {
  BinhQuanBenhAn: rowsFromStore,
  BinhQuanBenhAn_NgayChenhLech: rowsChenhLech,
  ThongKe_VienPhi_DuyetKeToan,
  ThongKe_VienPhi_DuyetKeToan_NgayChenhLech,
  BinhQuanBenhAn_DuKien: rowsFromStore_DuKien,
  BinhQuanBenhAn_DuKien_NgayChenhLech: rowsChenhLech_DuKien,
  ThongKe_VienPhi_DuKien,
  ThongKe_VienPhi_DuKien_NgayChenhLech,
  // ...
} = useSelector((state) => state.dashboard) || {};
```

#### **Conditional Data Source:**

```javascript
const currentRowsFromStore =
  loaiDoanhThu === "duyetketoan" ? rowsFromStore : rowsFromStore_DuKien;

const currentRowsChenhLech =
  loaiDoanhThu === "duyetketoan" ? rowsChenhLech : rowsChenhLech_DuKien;

const currentThongKeVienPhi =
  loaiDoanhThu === "duyetketoan"
    ? ThongKe_VienPhi_DuyetKeToan
    : ThongKe_VienPhi_DuKien;

const currentThongKeVienPhi_NgayChenhLech =
  loaiDoanhThu === "duyetketoan"
    ? ThongKe_VienPhi_DuyetKeToan_NgayChenhLech
    : ThongKe_VienPhi_DuKien_NgayChenhLech;
```

#### **Updated baseRows useMemo:**

```javascript
const baseRows = useMemo(() => {
  const rows = Array.isArray(currentRowsFromStore) ? currentRowsFromStore : [];
  const prevRows = Array.isArray(currentRowsChenhLech)
    ? currentRowsChenhLech
    : [];
  // ... same logic
}, [currentRowsFromStore, currentRowsChenhLech, ngay, khuyenCaoList, nam]);
```

#### **Added ToggleButtonGroup UI:**

```jsx
<LocalizationProvider dateAdapter={AdapterDayjs}>
  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
    <DatePicker label="Ngày xem" ... />
    <DatePicker label="Ngày so sánh" ... />

    {/* Toggle giữa Duyệt kế toán và Doanh thu dự kiến */}
    <ToggleButtonGroup
      value={loaiDoanhThu}
      exclusive
      onChange={(e, val) => val && setLoaiDoanhThu(val)}
      size="small"
      sx={{
        minWidth: { xs: "100%", sm: "auto" },
        '& .MuiToggleButton-root': {
          fontSize: { xs: "0.7rem", sm: "0.8rem" },
          px: { xs: 1, sm: 1.5 },
          py: 0.5,
        }
      }}
    >
      <ToggleButton value="duyetketoan">
        📊 Duyệt KT
      </ToggleButton>
      <ToggleButton value="dukien">
        📈 Dự kiến
      </ToggleButton>
    </ToggleButtonGroup>
  </Stack>
</LocalizationProvider>
```

#### **Updated All ThongKe_VienPhi References:**

```javascript
// Trước:
ThongKe_VienPhi_DuyetKeToan?.total_all;

// Sau:
currentThongKeVienPhi?.total_all;

// Áp dụng cho tất cả:
// - OverallSummaryCards props
// - SummaryCards props (Nội trú)
// - SummaryCards props (Ngoại trú)
```

---

## 🎨 UI/UX Features

### Toggle Button Styling

- **Size**: Small (compact)
- **Icons**:
  - 📊 Duyệt KT (Duyệt kế toán)
  - 📈 Dự kiến (Doanh thu dự kiến)
- **Responsive**:
  - Mobile: Full width, stacked vertical
  - Desktop: Inline với DatePickers
- **Behavior**: Exclusive selection (chỉ 1 option active)

### Data Switching

- **Instant**: Không cần reload, chỉ re-render với data mới
- **Seamless**: Giữ nguyên filters, sorting, tab selection
- **Consistent**: Tất cả components (cards, tables, summaries) đồng bộ

---

## 📊 Data Flow với Toggle

```
User clicks "Dự kiến" button
  ↓
setLoaiDoanhThu("dukien")
  ↓
currentRowsFromStore = BinhQuanBenhAn_DuKien
currentRowsChenhLech = BinhQuanBenhAn_DuKien_NgayChenhLech
currentThongKeVienPhi = ThongKe_VienPhi_DuKien
currentThongKeVienPhi_NgayChenhLech = ThongKe_VienPhi_DuKien_NgayChenhLech
  ↓
baseRows useMemo re-runs với dữ liệu dự kiến
  ↓
All derived data (rowsNoiTru, rowsNgoaiTru, totals, etc.) re-calculate
  ↓
Components re-render với dữ liệu dự kiến
  ↓
UI hiển thị số liệu dự kiến (giữ nguyên layout/style)
```

---

## ✅ Testing Checklist

### Functional Tests

- [ ] Toggle chuyển đổi giữa 2 modes
- [ ] Data hiển thị đúng cho từng mode
- [ ] Filters/sorting hoạt động với cả 2 modes
- [ ] Export CSV phản ánh đúng mode đang chọn
- [ ] Chuyển ngày không reset toggle state
- [ ] Tabs (Nội trú/Ngoại trú) hoạt động với cả 2 modes

### UI/UX Tests

- [ ] Toggle button hiển thị đúng trên mobile
- [ ] Toggle button hiển thị đúng trên desktop
- [ ] Icons và labels rõ ràng
- [ ] Active state hiển thị đúng
- [ ] Không có UI jump khi switch modes

### Data Integrity Tests

- [ ] Số liệu Duyệt KT khớp với backend
- [ ] Số liệu Dự kiến khớp với backend
- [ ] Chênh lệch tính đúng cho cả 2 modes
- [ ] Tổng hợp (totals) đúng cho cả 2 modes
- [ ] Khuyến cáo vẫn merge đúng

### Edge Cases

- [ ] Khi backend không có dữ liệu dự kiến (fallback gracefully)
- [ ] Khi chỉ có 1 trong 2 loại dữ liệu
- [ ] Ngày 1 của tháng (special logic vẫn hoạt động)
- [ ] Auto-refresh không reset toggle

---

## 🔮 Future Enhancements (Optional)

### Persistence

```javascript
// Lưu lựa chọn vào localStorage
useEffect(() => {
  localStorage.setItem("binhquanbenhan_loaidoanhthu", loaiDoanhThu);
}, [loaiDoanhThu]);

// Load từ localStorage khi mount
useEffect(() => {
  const saved = localStorage.getItem("binhquanbenhan_loaidoanhthu");
  if (saved) setLoaiDoanhThu(saved);
}, []);
```

### Export Filename

```javascript
const handleExportNoiTru = () => {
  const suffix = loaiDoanhThu === "duyetketoan" ? "duyetkt" : "dukien";
  exportToCSV(sortedNoiTru, `noitru_${suffix}`);
};
```

### Visual Indicator

```jsx
<Typography variant="caption" color="textSecondary">
  Đang xem: {loaiDoanhThu === "duyetketoan" ? "Duyệt kế toán" : "Dự kiến"}
</Typography>
```

---

## 📝 Code Quality

### ✅ Follows Project Conventions

- Redux slice pattern (startLoading/hasError/success)
- useMemo for computed data
- Conditional rendering with ternary operators
- MUI components styling pattern
- Vietnamese labels/text

### ✅ No Breaking Changes

- Existing "Duyệt kế toán" behavior unchanged
- All props/components remain compatible
- No API changes required

### ✅ Performance

- Minimal re-renders (only when toggle changes)
- useMemo prevents unnecessary calculations
- No additional API calls

---

## 🚀 Deployment Notes

### Prerequisites

- Backend must provide `json_binhquan_benhan_dukien` and `json_thongke_vienphi_dukien`
- Data structure must match existing format

### Files Changed

1. `src/features/DashBoard/dashboardSlice.js` - Redux state management
2. `src/features/DashBoard/BinhQuanBenhAn.js` - UI component

### No Changes Required

- Components in `BinhQuanBenhAn/components/` (chỉ nhận props)
- Backend API endpoints
- Other dashboard features
- CRUD khuyến cáo

---

## 📸 Screenshots (Suggested)

### Desktop View

```
[DatePicker Ngày xem] [DatePicker Ngày so sánh] [📊 Duyệt KT | 📈 Dự kiến]
```

### Mobile View

```
[DatePicker Ngày xem     ]
[DatePicker Ngày so sánh ]
[📊 Duyệt KT | 📈 Dự kiến]
```

---

## ✅ Implementation Complete!

**Status**: ✅ Code complete, ready for testing

**Next Steps**:

1. Start frontend dev server: `npm start`
2. Test toggle functionality
3. Verify data displays correctly for both modes
4. Check responsive behavior on mobile
5. Test edge cases

**Contact**: Nếu cần điều chỉnh UI/UX hoặc logic, báo cho developer!
