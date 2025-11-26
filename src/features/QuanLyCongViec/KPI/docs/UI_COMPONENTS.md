# UI Components - KPI Module

**Frontend Path:** `src/features/QuanLyCongViec/KPI/`  
**Version:** 2.1  
**UI Framework:** Material-UI v5 + React 18

---

## 📋 Tổng quan

Module KPI có **44 files** frontend:

- **Pages (7):** Entry points cho routes
- **Components (20+):** UI building blocks
- **Redux (2 slices):** State management
- **Utils (5):** Business logic helpers
- **v2/ folder:** New architecture components

### Active Routes (routes/index.js)

| Route                                    | Page                   | Permission     |
| ---------------------------------------- | ---------------------- | -------------- |
| `/quanlycongviec/kpi/danh-gia-nhan-vien` | KPIEvaluationPage ✅   | Manager, Admin |
| `/quanlycongviec/kpi/tu-danh-gia`        | TuDanhGiaKPIPage       | All            |
| `/quanlycongviec/kpi/xem`                | XemKPIPage             | All            |
| `/quanlycongviec/kpi/bao-cao`            | BaoCaoKPIPage          | Admin          |
| `/quanlycongviec/kpi/chu-ky`             | ChuKyDanhGiaPage       | Admin          |
| `/quanlycongviec/kpi/chu-ky/:id`         | ChuKyDanhGiaDetailPage | Admin          |
| `/quanlycongviec/giao-nhiem-vu-chu-ky`   | GiaoNhiemVuPage        | Manager        |

---

## 📄 Pages

### 1. DanhGiaKPIDashboard.js (V2 - Recommended)

**Path:** `src/features/QuanLyCongViec/KPI/v2/DanhGiaKPIDashboard.js`  
**Route:** ⚠️ Chưa được route trực tiếp (sử dụng như component trong KPIEvaluationPage)  
**Permission:** Manager, Admin

**Purpose:** Dashboard tổng quan cho Manager xem tiến độ chấm điểm nhân viên

**Props:** None (lấy data từ Redux)

**Features:**

- Chọn chu kỳ (dropdown) → Auto-load dashboard
- Hiển thị table: Nhân viên | Phòng ban | Tiến độ | Điểm KPI | Actions
- Button "Chấm điểm" → Mở `ChamDiemKPIDialog`
- Button "Xem chi tiết" → Xem KPI đã duyệt
- Filter: Phòng ban, trạng thái (chưa duyệt/đã duyệt)
- Summary cards: Tổng NV / Đã hoàn thành / Đang chấm / Chưa bắt đầu

**Example Usage:**

```jsx
import DanhGiaKPIDashboard from "./v2/DanhGiaKPIDashboard";

<Route
  path="/quan-ly-cong-viec/kpi/dashboard"
  element={<DanhGiaKPIDashboard />}
/>;
```

**State Used:**

```javascript
const {
  dashboardData, // { nhanVienList, summary }
  chuKyList, // Danh sách chu kỳ
  selectedChuKyId, // Chu kỳ đang chọn
  isLoading,
  error,
} = useSelector((state) => state.kpiEvaluation);
```

**Key Actions:**

- `dispatch(loadChuKyList())`
- `dispatch(loadDashboard(chuKyId))`
- `dispatch(openChamDiemDialog(nhanVienId, chuKyId))`

---

### 1b. KPIEvaluationPage.js (✅ ACTIVE - Main Page)

**Path:** `src/features/QuanLyCongViec/KPI/pages/KPIEvaluationPage.js`  
**Route:** `/quanlycongviec/kpi/danh-gia-nhan-vien`  
**Permission:** Manager, Admin

**Purpose:** Page chính cho Manager đánh giá KPI nhân viên (Active trong routes/index.js)

**Features:**

- Dashboard tổng quan theo chu kỳ
- Chọn chu kỳ (dropdown) → Auto-load danh sách nhân viên
- Table: Nhân viên | Tiến độ | Điểm KPI | Actions
- Button "Chấm điểm" → Mở ChamDiemKPIDialog
- Button "Xem chi tiết" → Xem KPI đã duyệt

**Key Import:**

```javascript
import KPIEvaluationPage from "features/QuanLyCongViec/KPI/pages/KPIEvaluationPage";

// Route config
<Route
  path="/quanlycongviec/kpi/danh-gia-nhan-vien"
  element={<KPIEvaluationPage />}
/>;
```

---

### 2. DanhGiaKPIPage.js (V1 - Legacy)

**Path:** `src/features/QuanLyCongViec/KPI/DanhGiaKPIPage.js`  
**Route:** ⚠️ Legacy - Không được route (Thay thế bởi KPIEvaluationPage)  
**Permission:** Manager, Admin

**Status:** Legacy, không còn được sử dụng trong routes/index.js

**Differences vs V2:**

- UI cũ hơn (không có summary cards)
- Không có filter phòng ban
- Table đơn giản hơn

---

### 3. TuDanhGiaKPIPage.js

**Path:** `src/features/QuanLyCongViec/KPI/TuDanhGiaKPIPage.js`  
**Route:** `/quanlycongviec/kpi/tu-danh-gia`  
**Permission:** All (Nhân viên tự chấm)

**Purpose:** Trang nhân viên tự đánh giá mức độ hoàn thành công việc

**Features:**

- Auto-load chu kỳ đang mở
- Hiển thị danh sách nhiệm vụ được gán
- Slider (0-100%) cho từng nhiệm vụ
- Button "Lưu" từng nhiệm vụ hoặc "Lưu tất cả"
- Hiển thị trạng thái: Đã lưu (checkmark) / Chưa lưu (pending)

**UI Structure:**

```jsx
<Container>
  <Typography variant="h4">Tự đánh giá KPI</Typography>

  {/* Chọn chu kỳ */}
  <Autocomplete
    options={chuKyList}
    value={selectedChuKy}
    onChange={handleChangeChuKy}
  />

  {/* Danh sách nhiệm vụ */}
  <Grid container spacing={2}>
    {assignments.map((assignment) => (
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">
              {assignment.NhiemVuThuongQuyID.TenNhiemVu}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Độ khó: {assignment.MucDoKho}
            </Typography>

            {/* Slider tự chấm */}
            <Slider
              value={scores[assignment._id] || 0}
              onChange={(e, val) => handleScoreChange(assignment._id, val)}
              min={0}
              max={100}
              marks={[
                { value: 0, label: "0%" },
                { value: 50, label: "50%" },
                { value: 100, label: "100%" },
              ]}
              valueLabelDisplay="on"
            />

            <Button onClick={() => handleSave(assignment._id)}>Lưu</Button>

            {assignment.NgayTuCham && (
              <Chip label="Đã lưu" color="success" size="small" />
            )}
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>

  {/* Lưu tất cả */}
  <Button variant="contained" onClick={handleSaveAll}>
    Lưu tất cả
  </Button>
</Container>
```

**State:**

```javascript
const {
  assignments, // NhanVienNhiemVu[] với DiemTuDanhGia
  chuKyList,
  selectedChuKyId,
  isSaving,
} = useSelector((state) => state.kpi);

const [scores, setScores] = useState({}); // Local state: { assignmentId: 85 }
```

**Actions:**

- `dispatch(loadNhanVienNhiemVu(nhanVienId, chuKyId))`
- `dispatch(nhanVienTuChamDiem(assignmentId, diemTuDanhGia))`
- `dispatch(nhanVienTuChamDiemBatch(nhanVienId, chuKyId, evaluations))`

---

### 4. BaoCaoKPIPage.js (Re-export)

**Path:** `src/features/QuanLyCongViec/KPI/BaoCaoKPIPage.js`  
**Route:** `/quanlycongviec/kpi/bao-cao`  
**Permission:** Admin, Đào tạo

**Content:**

```javascript
// Re-export from BaoCaoThongKeKPI module
export { default } from "../BaoCaoThongKeKPI/BaoCaoKPIPage";
```

**Note:** Actual implementation trong `src/features/QuanLyCongViec/BaoCaoThongKeKPI/`

---

### 5. ChuKyDanhGiaPage.js

**Path:** `src/features/QuanLyCongViec/ChuKyDanhGia/ChuKyDanhGiaPage.js`  
**Route:** `/quanlycongviec/kpi/chu-ky`  
**Permission:** Admin, Đào tạo

**Purpose:** Quản lý chu kỳ đánh giá + cấu hình tiêu chí

**Features:**

- CRUD chu kỳ (Tạo/Sửa/Xóa/Mở/Đóng)
- Tab "Tiêu chí": Cấu hình TieuChiCauHinh
- Drag-drop sắp xếp thứ tự tiêu chí
- Đánh dấu "Mức độ hoàn thành" (IsMucDoHoanThanh)

---

### 6. GiaoNhiemVuPage.js

**Path:** `src/features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuPage.js`  
**Route:** `/quanlycongviec/giao-nhiem-vu-chu-ky`  
**Permission:** Manager

**Purpose:** Gán nhiệm vụ cho nhân viên theo chu kỳ

**Tabs:**

1. **Gán thường quy:** Gán NhiemVuThuongQuy
2. **Gán theo chu kỳ:** Gán với ChuKyDanhGiaID (cho KPI)

---

### 7. XemChiTietKPIPage.js (Optional)

**Path:** `src/features/QuanLyCongViec/KPI/XemChiTietKPIPage.js`  
**Route:** `/quanlycongviec/kpi/xem` (page render thông qua XemKPIPage)  
**Permission:** All (nhân viên xem KPI của mình, Manager xem nhân viên quản lý)

**Purpose:** Xem chi tiết KPI đã duyệt (read-only)

**Features:**

- Hiển thị thông tin tổng quan (điểm, xếp loại, ngày duyệt)
- Table nhiệm vụ với điểm chi tiết
- Lịch sử duyệt/hủy duyệt (nếu có)

---

## 🧩 Components

### 1. ChamDiemKPIDialog.js (V2 - Core Component)

**Path:** `src/features/QuanLyCongViec/KPI/v2/ChamDiemKPIDialog.js`  
**Size:** 1508 dòng (largest component)

**Purpose:** Dialog chấm điểm KPI chi tiết cho Manager

**Props:**

```javascript
ChamDiemKPIDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nhanVienId: PropTypes.string, // Required khi tạo mới
  chuKyId: PropTypes.string, // Required khi tạo mới
  danhGiaKPIId: PropTypes.string, // Optional: nếu đã có DanhGiaKPI
  isReadOnly: PropTypes.bool, // Default: false
};
```

**Features:**

1. **Auto-load data:**

   - Gọi `getChamDiemTieuChi(danhGiaKPIId, nhanVienId, chuKyId)`
   - Backend auto-create DanhGiaKPI + DanhGiaNhiemVuThuongQuy nếu chưa có

2. **Table chấm điểm:**

   - Mỗi row = 1 nhiệm vụ (NhiemVuThuongQuy)
   - Expand row → Hiển thị tiêu chí chi tiết
   - TextField cho mỗi tiêu chí: `<TextField type="number" min={0} max={GiaTriMax} />`

3. **Real-time preview:**

   - onChange → Gọi `calculateTotalScore(nhiemVuList, diemTuDanhGiaMap)`
   - Hiển thị preview TongDiemKPI ở footer

4. **Actions:**

   - Button "Lưu tất cả": Lưu nháp (không duyệt)
   - Button "Duyệt KPI": Confirm dialog → Gọi API duyệt
   - Button "Hủy": Đóng dialog

5. **Optimistic Concurrency:**
   - Lưu `updatedAt` của DanhGiaKPI
   - Gửi `If-Unmodified-Since` header khi update
   - Nếu conflict → Auto-refresh + toast warning

**Example UI:**

```jsx
<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
  <DialogTitle>
    Chấm điểm KPI - {nhanVien.HoTen}
    <Chip label={chuKy.TenChuKy} size="small" />
  </DialogTitle>

  <DialogContent>
    {/* Table */}
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nhiệm vụ</TableCell>
            <TableCell>Độ khó</TableCell>
            <TableCell>Tự đánh giá</TableCell>
            <TableCell>Điểm nhiệm vụ</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nhiemVuList.map((nv) => (
            <>
              <TableRow key={nv._id}>
                <TableCell>{nv.NhiemVuThuongQuyID.TenNhiemVu}</TableCell>
                <TableCell>{nv.MucDoKho}</TableCell>
                <TableCell>
                  {diemTuDanhGiaMap[nv.NhanVienNhiemVuID] || "--"}%
                </TableCell>
                <TableCell>{calculateNhiemVuScore(nv)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => toggleExpand(nv._id)}>
                    {expanded[nv._id] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </TableCell>
              </TableRow>

              {/* Expanded row - Tiêu chí chi tiết */}
              <TableRow>
                <TableCell colSpan={5}>
                  <Collapse in={expanded[nv._id]}>
                    <Box p={2}>
                      <Typography variant="subtitle2">
                        Tiêu chí đánh giá:
                      </Typography>
                      {nv.ChiTietDiem.map((tc, idx) => (
                        <Grid container spacing={2} key={idx}>
                          <Grid item xs={4}>
                            <Typography>{tc.TenTieuChi}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <TextField
                              type="number"
                              label="Điểm"
                              value={tc.DiemDat || ""}
                              onChange={(e) =>
                                handleScoreChange(nv._id, idx, e.target.value)
                              }
                              inputProps={{
                                min: tc.GiaTriMin,
                                max: tc.GiaTriMax,
                              }}
                              helperText={`${tc.GiaTriMin}-${tc.GiaTriMax} ${tc.DonVi}`}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              label="Ghi chú"
                              value={tc.GhiChu || ""}
                              onChange={(e) =>
                                handleNoteChange(nv._id, idx, e.target.value)
                              }
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <Chip
                              label={
                                tc.LoaiTieuChi === "TANG_DIEM" ? "Tăng" : "Giảm"
                              }
                              color={
                                tc.LoaiTieuChi === "TANG_DIEM"
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                            />
                          </Grid>
                        </Grid>
                      ))}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Preview */}
    <Box mt={3} p={2} bgcolor="grey.100">
      <Typography variant="h6">
        Tổng điểm KPI (preview): {previewScore.toFixed(2)}
      </Typography>
    </Box>
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>Hủy</Button>
    <Button onClick={handleLuuTatCa}>Lưu tất cả</Button>
    <Button variant="contained" onClick={handleDuyetKPI} disabled={!isValid}>
      Duyệt KPI
    </Button>
  </DialogActions>
</Dialog>
```

**State Management:**

```javascript
const {
  currentDanhGiaKPI,
  currentNhiemVuList,
  diemTuDanhGiaMap,
  isSaving,
  isOpenFormDialog,
} = useSelector((state) => state.kpiEvaluation);

const [expanded, setExpanded] = useState({});
const [previewScore, setPreviewScore] = useState(0);

useEffect(() => {
  if (currentNhiemVuList) {
    const { tongDiem } = calculateTotalScore(
      currentNhiemVuList,
      diemTuDanhGiaMap
    );
    setPreviewScore(tongDiem);
  }
}, [currentNhiemVuList, diemTuDanhGiaMap]);
```

---

### 2. ChamDiemKPITable.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/ChamDiemKPITable.js`

**Purpose:** Table hiển thị trong dashboard (nhân viên + tiến độ)

**Props:**

```javascript
ChamDiemKPITable.propTypes = {
  nhanVienList: PropTypes.array.isRequired,
  onChamDiem: PropTypes.func.isRequired,
  onXemChiTiet: PropTypes.func,
};
```

**Example:**

```jsx
<ChamDiemKPITable
  nhanVienList={dashboardData.nhanVienList}
  onChamDiem={(nhanVienId, chuKyId) => {
    dispatch(openChamDiemDialog(nhanVienId, chuKyId));
  }}
  onXemChiTiet={(danhGiaKPIId) => {
    navigate(`/quan-ly-cong-viec/kpi/xem/${danhGiaKPIId}`);
  }}
/>
```

**Columns:**

- Mã NV
- Họ tên
- Phòng ban
- Tiến độ (Progress bar: scored/total)
- Điểm KPI (hiển thị nếu đã duyệt)
- Trạng thái (Badge: Chưa duyệt/Đã duyệt)
- Actions (Button "Chấm điểm" / "Xem")

---

### 2b. QuickScoreDialog.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/components/QuickScoreDialog.js`

**Purpose:** Dialog chấm điểm nhanh cho một nhiệm vụ cụ thể

**Props:**

```javascript
QuickScoreDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nhiemVu: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};
```

---

### 2c. NhiemVuAccordion.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/components/NhiemVuAccordion.js`

**Purpose:** Accordion hiển thị nhiệm vụ với expand để xem tiêu chí chi tiết

---

### 2d. TieuChiGrid.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/components/TieuChiGrid.js`

**Purpose:** Grid hiển thị các tiêu chí đánh giá với input điểm

---

### 2e. StatCard.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/components/StatCard.js`

**Purpose:** Card thống kê hiển thị trên dashboard (số nhân viên, tiến độ, etc.)

---

### 2f. KPIHistoryDialog.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/components/KPIHistoryDialog.js`

**Purpose:** Dialog hiển thị lịch sử duyệt/hủy duyệt KPI

---

### 2g. CongViecCompactCard.js (V2)

**Path:** `src/features/QuanLyCongViec/KPI/v2/components/CongViecCompactCard.js`

**Purpose:** Card hiển thị công việc dạng compact cho dashboard

---

### 3. DanhGiaKPIForm.js (V1 - Legacy)

**Path:** `src/features/QuanLyCongViec/KPI/DanhGiaKPIForm.js`

**Status:** Legacy, thay bằng `ChamDiemKPIDialog`

---

### 4. TieuChiForm.js

**Path:** `src/features/QuanLyCongViec/ChuKyDanhGia/TieuChiForm.js`

**Purpose:** Form thêm/sửa tiêu chí trong ChuKy

**Props:**

```javascript
TieuChiForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tieuChi: PropTypes.object, // Null = create, object = update
  onSubmit: PropTypes.func.isRequired,
};
```

**Fields:**

- TenTieuChi (text, required)
- LoaiTieuChi (select: TANG_DIEM | GIAM_DIEM)
- IsMucDoHoanThanh (checkbox)
- GiaTriMin (number, default: 0)
- GiaTriMax (number, required)
- DonVi (text: %, điểm, lần, etc.)
- MoTa (textarea)

**Validation (Yup):**

```javascript
const schema = Yup.object().shape({
  TenTieuChi: Yup.string().required("Vui lòng nhập tên tiêu chí"),
  LoaiTieuChi: Yup.string().required(),
  GiaTriMax: Yup.number()
    .required("Vui lòng nhập giá trị tối đa")
    .min(Yup.ref("GiaTriMin"), "Giá trị max phải >= min"),
  DonVi: Yup.string().required("Vui lòng nhập đơn vị"),
});
```

---

### 5. DuyetKPIConfirmDialog.js

**Path:** `src/features/QuanLyCongViec/KPI/components/DuyetKPIConfirmDialog.js`

**Purpose:** Confirmation dialog trước khi duyệt KPI

**Props:**

```javascript
DuyetKPIConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  nhanVien: PropTypes.object.isRequired,
  chuKy: PropTypes.object.isRequired,
  tongDiem: PropTypes.number.isRequired,
};
```

**UI:**

```jsx
<Dialog open={open} onClose={onClose}>
  <DialogTitle>Xác nhận duyệt KPI</DialogTitle>
  <DialogContent>
    <Typography>Nhân viên: {nhanVien.HoTen}</Typography>
    <Typography>Chu kỳ: {chuKy.TenChuKy}</Typography>
    <Typography variant="h6" color="primary">
      Tổng điểm KPI: {tongDiem.toFixed(2)}
    </Typography>

    <TextField
      label="Nhận xét (tùy chọn)"
      multiline
      rows={3}
      fullWidth
      value={nhanXet}
      onChange={(e) => setNhanXet(e.target.value)}
      margin="normal"
    />

    <Alert severity="warning">
      ⚠️ Sau khi duyệt, không thể chỉnh sửa điểm!
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Hủy</Button>
    <Button
      variant="contained"
      onClick={() => onConfirm(nhanXet)}
      color="primary"
    >
      Xác nhận duyệt
    </Button>
  </DialogActions>
</Dialog>
```

---

### 6. HuyDuyetKPIDialog.js

**Path:** `src/features/QuanLyCongViec/KPI/components/HuyDuyetKPIDialog.js`

**Purpose:** Dialog hủy duyệt KPI (Admin only)

**Props:**

```javascript
HuyDuyetKPIDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  danhGiaKPI: PropTypes.object.isRequired,
};
```

**Fields:**

- Hiển thị thông tin hiện tại (điểm, ngày duyệt)
- TextField: Lý do hủy (required)
- Warning: Điểm sẽ reset về 0

---

### 7. KPISummaryCards.js

**Path:** `src/features/QuanLyCongViec/KPI/components/KPISummaryCards.js`

**Purpose:** 4 cards hiển thị tổng quan ở dashboard

**Props:**

```javascript
KPISummaryCards.propTypes = {
  summary: PropTypes.shape({
    totalNhanVien: PropTypes.number,
    completed: PropTypes.number,
    inProgress: PropTypes.number,
    notStarted: PropTypes.number,
  }).isRequired,
};
```

**UI:**

```jsx
<Grid container spacing={3}>
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Tổng nhân viên</Typography>
        <Typography variant="h4">{summary.totalNhanVien}</Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} md={3}>
    <Card>
      <CardContent>
        <Typography color="text.secondary">Đã hoàn thành</Typography>
        <Typography variant="h4" color="success.main">
          {summary.completed}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  {/* ... Đang chấm, Chưa bắt đầu */}
</Grid>
```

---

### 8. ProgressBar.js

**Path:** `src/features/QuanLyCongViec/KPI/components/ProgressBar.js`

**Purpose:** Progress bar hiển thị tiến độ chấm điểm

**Props:**

```javascript
ProgressBar.propTypes = {
  scored: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  showLabel: PropTypes.bool, // Default: true
};
```

**Example:**

```jsx
<ProgressBar scored={3} total={5} />
// Output: [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░] 60% (3/5)
```

---

### 9. XepLoaiBadge.js

**Path:** `src/features/QuanLyCongViec/KPI/components/XepLoaiBadge.js`

**Purpose:** Badge hiển thị xếp loại dựa trên điểm KPI

**Props:**

```javascript
XepLoaiBadge.propTypes = {
  diemKPI: PropTypes.number.isRequired,
};
```

**Logic:**

```javascript
function getXepLoai(diemKPI) {
  if (diemKPI >= 9) return { label: "Xuất sắc", color: "success" };
  if (diemKPI >= 8) return { label: "Giỏi", color: "info" };
  if (diemKPI >= 7) return { label: "Khá", color: "primary" };
  if (diemKPI >= 5) return { label: "Trung bình", color: "warning" };
  return { label: "Yếu", color: "error" };
}
```

**Example:**

```jsx
<XepLoaiBadge diemKPI={8.75} />
// Output: <Chip label="Giỏi" color="info" size="small" />
```

---

### 10. LichSuDuyetTimeline.js

**Path:** `src/features/QuanLyCongViec/KPI/components/LichSuDuyetTimeline.js`

**Purpose:** Timeline hiển thị lịch sử duyệt/hủy duyệt

**Props:**

```javascript
LichSuDuyetTimeline.propTypes = {
  lichSuDuyet: PropTypes.array,
  lichSuHuyDuyet: PropTypes.array,
};
```

**UI:**

```jsx
<Timeline>
  {lichSuDuyet.map((item) => (
    <TimelineItem key={item._id}>
      <TimelineSeparator>
        <TimelineDot color="success">
          <CheckCircle />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h6">Duyệt KPI</Typography>
        <Typography color="text.secondary">
          {item.NguoiDuyet.HoTen} -{" "}
          {dayjs(item.NgayDuyet).format("DD/MM/YYYY HH:mm")}
        </Typography>
        <Typography>Điểm: {item.TongDiemLucDuyet}</Typography>
        {item.GhiChu && <Typography variant="body2">{item.GhiChu}</Typography>}
      </TimelineContent>
    </TimelineItem>
  ))}

  {lichSuHuyDuyet.map((item) => (
    <TimelineItem key={item._id}>
      <TimelineSeparator>
        <TimelineDot color="error">
          <Cancel />
        </TimelineDot>
      </TimelineSeparator>
      <TimelineContent>
        <Typography variant="h6">Hủy duyệt</Typography>
        <Typography color="text.secondary">
          {item.NguoiHuyDuyet.HoTen} -{" "}
          {dayjs(item.NgayHuyDuyet).format("DD/MM/YYYY HH:mm")}
        </Typography>
        <Typography>Lý do: {item.LyDoHuyDuyet}</Typography>
        <Typography color="text.secondary">
          Điểm trước khi hủy: {item.DiemTruocKhiHuy}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  ))}
</Timeline>
```

---

## 🔄 Redux Slices

### 1. kpiSlice.js (1704 dòng - Legacy + V2 Hybrid)

**Path:** `src/features/QuanLyCongViec/KPI/kpiSlice.js`

**State Shape:**

```javascript
{
  isLoading: false,
  error: null,
  danhGiaKPIs: [],           // Danh sách KPI
  currentDanhGiaKPI: null,   // KPI đang xem/chấm
  chuKyList: [],             // Danh sách chu kỳ
  assignments: [],           // NhanVienNhiemVu (tự đánh giá)
  isSaving: false,
  isOpenForm: false
}
```

**Actions (20+):**

- CRUD: `createKPI`, `updateKPI`, `deleteKPI`, `loadKPIs`, `loadKPIById`
- Tự chấm: `nhanVienTuChamDiem`, `nhanVienTuChamDiemBatch`
- Duyệt: `duyetKPI`, `huyDuyetKPI`
- Utilities: `loadChuKyList`, `loadNhanVienNhiemVu`

**Example Usage:**

```javascript
import { useDispatch, useSelector } from "react-redux";
import { nhanVienTuChamDiemBatch } from "./kpiSlice";

const dispatch = useDispatch();
const { assignments, isSaving } = useSelector((state) => state.kpi);

const handleSaveAll = () => {
  const evaluations = Object.entries(scores).map(([id, diem]) => ({
    assignmentId: id,
    DiemTuDanhGia: diem,
  }));

  dispatch(nhanVienTuChamDiemBatch(nhanVienId, chuKyId, evaluations));
};
```

---

### 2. kpiEvaluationSlice.js (283 dòng - V2)

**Path:** `src/features/QuanLyCongViec/KPI/kpiEvaluationSlice.js`

**Purpose:** Cycle-based evaluation workflow (V2)

**State Shape:**

```javascript
{
  isLoading: false,
  error: null,
  dashboardData: {
    nhanVienList: [],
    summary: {
      totalNhanVien: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0
    }
  },
  chuKyList: [],
  selectedChuKyId: null,
  currentDanhGiaKPI: null,
  currentNhiemVuList: [],
  diemTuDanhGiaMap: {},      // { assignmentId: DiemTuDanhGia }
  isSaving: false,
  isOpenFormDialog: false
}
```

**Actions:**

- Dashboard: `loadDashboard(chuKyId)`
- Chấm điểm: `getChamDiemTieuChi(danhGiaKPIId, nhanVienId, chuKyId)`
- Update: `updateTieuChiScore(nhiemVuId, tieuChiId, diemDat)`
- Save: `luuTatCaNhiemVu(danhGiaKPIId, nhiemVuList)`
- Approve: `duyetKPITieuChi(danhGiaKPIId, nhiemVuList, nhanXet)`

**Reducers:**

```javascript
getChamDiemTieuChiSuccess(state, action) {
  const { danhGiaKPI, nhiemVuList } = action.payload;
  state.currentDanhGiaKPI = danhGiaKPI;
  state.currentNhiemVuList = nhiemVuList;

  // Build diemTuDanhGiaMap
  state.diemTuDanhGiaMap = {};
  nhiemVuList.forEach(nv => {
    if (nv.NhanVienNhiemVuID) {
      // Load từ NhanVienNhiemVu (backend populate)
      const assignment = nv.NhanVienNhiemVuID;
      state.diemTuDanhGiaMap[assignment._id] = assignment.DiemTuDanhGia || 0;
    }
  });

  state.isLoading = false;
  state.isOpenFormDialog = true;
}

updateTieuChiScore(state, action) {
  const { nhiemVuId, tieuChiId, diemDat } = action.payload;

  const nhiemVu = state.currentNhiemVuList.find(nv => nv._id === nhiemVuId);
  if (nhiemVu) {
    const tieuChi = nhiemVu.ChiTietDiem.find(tc => tc._id === tieuChiId);
    if (tieuChi) {
      tieuChi.DiemDat = parseFloat(diemDat);
    }
  }
}
```

---

## 🛠️ Utils

### 1. kpiCalculation.js (194 dòng - CRITICAL)

**Path:** `src/features/QuanLyCongViec/KPI/utils/kpiCalculation.js`

**Purpose:** Real-time calculation của TongDiemKPI (PHẢI GIỐNG HỆT backend)

**Main Function:**

```javascript
export const calculateTotalScore = (nhiemVuList, diemTuDanhGiaMap) => {
  let tongDiemKPI = 0;

  nhiemVuList.forEach((nv) => {
    const assignmentId = nv.NhanVienNhiemVuID?._id || nv.NhanVienNhiemVuID;
    const diemTuDanhGia = diemTuDanhGiaMap[assignmentId] || 0;

    let diemTang = 0;
    let diemGiam = 0;

    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      // CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        const diemQuanLy = tc.DiemDat || 0;
        diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
      } else {
        diemCuoiCung = tc.DiemDat || 0;
      }

      const diemScaled = diemCuoiCung / 100;

      if (tc.LoaiTieuChi === "TANG_DIEM") {
        diemTang += diemScaled;
      } else if (tc.LoaiTieuChi === "GIAM_DIEM") {
        diemGiam += diemScaled;
      }
    });

    const tongDiemTieuChi = diemTang - diemGiam;
    const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;
    tongDiemKPI += diemNhiemVu;
  });

  return {
    tongDiem: tongDiemKPI,
    breakdown: nhiemVuList.map((nv) => ({
      nhiemVuId: nv._id,
      diemNhiemVu: calculateNhiemVuScore(nv, diemTuDanhGiaMap),
    })),
  };
};
```

**Helper:**

```javascript
export const calculateNhiemVuScore = (nhiemVu, diemTuDanhGiaMap) => {
  const assignmentId =
    nhiemVu.NhanVienNhiemVuID?._id || nhiemVu.NhanVienNhiemVuID;
  const diemTuDanhGia = diemTuDanhGiaMap[assignmentId] || 0;

  let diemTang = 0,
    diemGiam = 0;

  nhiemVu.ChiTietDiem.forEach((tc) => {
    let diemCuoiCung = 0;
    if (tc.IsMucDoHoanThanh) {
      diemCuoiCung = (tc.DiemDat * 2 + diemTuDanhGia) / 3;
    } else {
      diemCuoiCung = tc.DiemDat || 0;
    }

    const diemScaled = diemCuoiCung / 100;
    if (tc.LoaiTieuChi === "TANG_DIEM") {
      diemTang += diemScaled;
    } else {
      diemGiam += diemScaled;
    }
  });

  return nhiemVu.MucDoKho * (diemTang - diemGiam);
};
```

---

### 2. validation.js

**Path:** `src/features/QuanLyCongViec/KPI/utils/validation.js`

**Purpose:** Validation rules cho KPI

**Functions:**

```javascript
export const validateTieuChiScore = (diemDat, giaTriMin, giaTriMax) => {
  if (diemDat === null || diemDat === undefined) return true; // OK: chưa chấm
  if (diemDat < giaTriMin || diemDat > giaTriMax) {
    return `Điểm phải từ ${giaTriMin} đến ${giaTriMax}`;
  }
  return true;
};

export const validateAllScored = (nhiemVuList) => {
  for (const nv of nhiemVuList) {
    for (const tc of nv.ChiTietDiem) {
      if (tc.DiemDat === null || tc.DiemDat === undefined) {
        return {
          valid: false,
          error: `Nhiệm vụ "${nv.NhiemVuThuongQuyID.TenNhiemVu}" chưa chấm tiêu chí "${tc.TenTieuChi}"`,
        };
      }
    }
  }
  return { valid: true };
};
```

---

### 3. formatters.js

**Path:** `src/features/QuanLyCongViec/KPI/utils/formatters.js`

**Purpose:** Format data cho UI

**Functions:**

```javascript
export const formatDiemKPI = (diem) => {
  if (diem === null || diem === undefined) return "--";
  return diem.toFixed(2);
};

export const formatProgress = (scored, total) => {
  if (total === 0) return "0%";
  const percentage = Math.round((scored / total) * 100);
  return `${scored}/${total} (${percentage}%)`;
};

export const getXepLoai = (diemKPI) => {
  if (diemKPI >= 9) return "Xuất sắc";
  if (diemKPI >= 8) return "Giỏi";
  if (diemKPI >= 7) return "Khá";
  if (diemKPI >= 5) return "Trung bình";
  return "Yếu";
};
```

---

## 📦 Component Dependencies

```
DanhGiaKPIDashboard
├── KPISummaryCards
├── ChamDiemKPITable
│   ├── ProgressBar
│   └── XepLoaiBadge
└── ChamDiemKPIDialog (Core)
    ├── DuyetKPIConfirmDialog
    ├── calculateTotalScore (utils)
    └── validateAllScored (utils)

TuDanhGiaKPIPage
├── Slider (MUI)
├── Card (MUI)
└── nhanVienTuChamDiemBatch (Redux)

XemChiTietKPIPage
├── LichSuDuyetTimeline
├── XepLoaiBadge
└── Table (MUI)
```

---

## 🎨 Styling Conventions

### Theme Colors

```javascript
// Success (Đã duyệt, Xuất sắc)
color = "success"; // Green

// Info (Giỏi)
color = "info"; // Blue

// Primary (Khá)
color = "primary"; // Blue (default)

// Warning (Trung bình, Đang chấm)
color = "warning"; // Orange

// Error (Yếu, Chưa bắt đầu)
color = "error"; // Red
```

### Responsive Breakpoints

```javascript
// Dashboard grid
<Grid container spacing={3}>
  <Grid item xs={12} md={6} lg={4}>  // Mobile: full, Tablet: half, Desktop: 1/3
```

---

**✅ UI Components verified với frontend code (25/11/2025)**
