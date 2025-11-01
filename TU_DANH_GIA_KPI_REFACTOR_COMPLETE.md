# ✅ HỆ THỐNG ĐÁNH GIÁ KPI - REFACTOR HOÀN THIỆN V2

> **Version 2.0** - Đơn giản hóa data model, loại bỏ calculated fields, single source of truth

## 📚 MỤC LỤC

1. [Tự Đánh Giá KPI (Nhân viên)](#1-tự-đánh-giá-kpi-nhân-viên)
2. [Quản Lý Chấm Điểm KPI (Manager)](#2-quản-lý-chấm-điểm-kpi-manager)
3. [Backend Logic - Công Thức Tính Điểm](#3-backend-logic---công-thức-tính-điểm)
4. [Migration Guide](#4-migration-guide)

---

# 1. TỰ ĐÁNH GIÁ KPI (Nhân viên)

## 🎯 Vấn đề đã giải quyết

### **❌ Trước khi refactor:**

1. **Không filter theo NhanVienID** → Hiển thị nhiệm vụ của tất cả nhân viên
2. **API phức tạp** → Sử dụng `getDanhGiaKPIByNhanVien` (không cần thiết)
3. **Không có dropdown chọn chu kỳ** → Chỉ auto-select chu kỳ đầu tiên
4. **Không thể xem các chu kỳ đã đóng** → Chỉ load chu kỳ đang mở
5. **UX chưa tốt** → Thiếu loading states, empty states, progress tracking

### **✅ Sau khi refactor:**

1. ✅ **useAuth()** lấy thông tin user đang login
2. ✅ **API đơn giản** → CHỈ làm việc với `NhanVienNhiemVu` (không cần DanhGiaKPI)
3. ✅ **Filter đúng** → Chỉ nhiệm vụ của user + chu kỳ cụ thể
4. ✅ **Dropdown chọn chu kỳ** → User có thể chọn bất kỳ chu kỳ nào (kể cả đã đóng)
5. ✅ **Progress tracking** → Hiển thị X/Y nhiệm vụ đã tự chấm
6. ✅ **Modern UX** → Gradient header, skeleton loading, empty states, alert info

---

## 🎯 LOGIC MỚI - ĐƠN GIẢN HƠN

### **Nguyên tắc:**

- ✅ Trang "Tự đánh giá KPI" **CHỈ** làm việc với `NhanVienNhiemVu`
- ✅ **KHÔNG** cần `DanhGiaKPI` hay `DanhGiaNhiemVuThuongQuy`
- ✅ `DiemTuDanhGia` ngầm hiểu là điểm cho tiêu chí "Mức độ hoàn thành"
- ✅ Backend chỉ cần 2 APIs đơn giản

---

## 🔧 Thay đổi kỹ thuật

### **1. Import mới**

```javascript
// ✅ Thêm useAuth hook
import useAuth from "../../../../hooks/useAuth";

// ✅ Redux actions
import { getChuKyDanhGia } from "../../ChuKyDanhGia/chuKyDanhGiaSlice";
import {
  layDanhSachNhiemVu, // ← NEW: Load assignments
  nhanVienTuChamDiem, // ← NEW: Update DiemTuDanhGia
} from "../assignmentSlice"; // ← NEW slice (hoặc dùng slice hiện có)

// ✅ Toast notifications
import { toast } from "react-toastify";

// ✅ Hooks
import React, { useEffect, useState, useMemo } from "react";
```

### **2. Redux State**

```javascript
// ✅ User info từ hook (không phải Redux)
const { user } = useAuth();

// ✅ Assignment list (NhanVienNhiemVu)
const {
  assignments, // ← Array of NhanVienNhiemVu
  isLoading,
  isSaving,
} = useSelector((state) => state.assignment); // hoặc state.kpi tùy thiết kế

// ✅ Chu kỳ list
const { chuKyList, isLoading: isLoadingChuKy } = useSelector(
  (state) => state.chuKyDanhGia
);
```

### **3. Load Data Flow**

```javascript
// ✅ Load tất cả chu kỳ (bao gồm đã đóng)
useEffect(() => {
  dispatch(getChuKyDanhGia({}));
}, [dispatch]);

// ✅ Auto-select chu kỳ đang mở đầu tiên
useEffect(() => {
  if (chuKyList.length > 0 && !selectedChuKyId) {
    const activeChuKy = chuKyList.find((ck) => !ck.isDong);
    const defaultChuKy = activeChuKy || chuKyList[0];
    setSelectedChuKyId(defaultChuKy._id);
  }
}, [chuKyList, selectedChuKyId]);

// ✅ Load assignments khi chọn chu kỳ
useEffect(() => {
  if (selectedChuKyId && user?._id) {
    dispatch(
      layDanhSachNhiemVu({
        nhanVienId: user._id,
        chuKyId: selectedChuKyId,
      })
    );
  }
}, [selectedChuKyId, user?._id, dispatch]);
```

### **Backend API:**

```javascript
// GET /api/workmanagement/giao-nhiem-vu
// Query: { nhanVienId, chuKyId }

async layDanhSachNhiemVu(req, res) {
  const { nhanVienId, chuKyId } = req.query;

  const assignments = await NhanVienNhiemVu.find({
    NhanVienID: nhanVienId,
    ChuKyDanhGiaID: chuKyId,
    isDeleted: false
  })
  .populate("NhiemVuThuongQuyID")
  .sort({ NgayGan: 1 });

  return sendResponse(res, 200, true, { assignments });
}
```

### **Response structure:**

```javascript
{
  assignments: [
    {
      _id: "assignment-123",
      NhanVienID: "nv001",
      ChuKyDanhGiaID: "cycle01",
      NhiemVuThuongQuyID: {
        _id: "task001",
        TenNhiemVu: "Khám bệnh",
        MoTa: "...",
      },
      MucDoKho: 7.5,
      DiemTuDanhGia: 85, // ← Điểm đã tự chấm (null nếu chưa)
      NgayTuCham: Date, // ← Thời điểm tự chấm
      NgayGan: Date,
    },
  ];
}
```

### **4. Computed Values với useMemo**

```javascript
// ✅ Thông tin chu kỳ được chọn
const selectedChuKy = useMemo(() => {
  return chuKyList.find((ck) => ck._id === selectedChuKyId);
}, [chuKyList, selectedChuKyId]);

// ✅ Check xem có thể edit không
const canEdit = useMemo(() => {
  if (!selectedChuKy) return false;

  // ✅ Chu kỳ đã đóng → không cho edit
  if (selectedChuKy.isDong) return false;

  // ✅ TODO: Check KPI đã duyệt (cần query DanhGiaKPI)
  // Hoặc đơn giản hơn: Backend reject nếu đã duyệt

  return true;
}, [selectedChuKy]);

// ✅ Progress tracking
const progress = useMemo(() => {
  if (!assignments || assignments.length === 0) {
    return { scored: 0, total: 0, percentage: 0 };
  }

  const scored = assignments.filter(
    (assignment) => assignment.DiemTuDanhGia != null
  ).length;

  return {
    scored,
    total: assignments.length,
    percentage: (scored / assignments.length) * 100,
  };
}, [assignments]);
```

### **5. Local State Management**

```javascript
// ✅ State: Chu kỳ được chọn
const [selectedChuKyId, setSelectedChuKyId] = useState("");

// ✅ State: Điểm tự đánh giá (local, chưa lưu)
const [localScores, setLocalScores] = useState({});

// ✅ Sync local scores từ backend data
useEffect(() => {
  if (assignments && assignments.length > 0) {
    const scores = {};
    assignments.forEach((assignment) => {
      scores[assignment._id] = assignment.DiemTuDanhGia ?? "";
    });
    setLocalScores(scores);
  }
}, [assignments]);
```

### **6. Event Handlers với Validation**

```javascript
// ✅ Handler: Thay đổi điểm (chưa lưu)
const handleScoreChange = (assignmentId, value) => {
  const numValue = parseFloat(value);

  // Validation
  if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
    toast.warning("Điểm phải từ 0-100");
    return;
  }

  setLocalScores((prev) => ({
    ...prev,
    [assignmentId]: value === "" ? "" : numValue,
  }));
};

// ✅ Handler: Lưu điểm cho 1 assignment
const handleSaveScore = async (assignment) => {
  const score = localScores[assignment._id];

  // Validation
  if (score === "" || score == null) {
    toast.warning("Vui lòng nhập điểm trước khi lưu");
    return;
  }

  if (score < 0 || score > 100) {
    toast.error("Điểm phải từ 0-100");
    return;
  }

  try {
    // ✅ Call API update NhanVienNhiemVu
    await dispatch(
      nhanVienTuChamDiem({
        assignmentId: assignment._id,
        diemTuDanhGia: score,
      })
    ).unwrap();

    toast.success(
      `Đã lưu điểm cho nhiệm vụ: ${assignment.NhiemVuThuongQuyID?.TenNhiemVu}`
    );

    // ✅ Reload data để cập nhật progress
    if (selectedChuKyId && user?._id) {
      dispatch(
        layDanhSachNhiemVu({
          nhanVienId: user._id,
          chuKyId: selectedChuKyId,
        })
      );
    }
  } catch (error) {
    toast.error(error.message || "Không thể lưu điểm");
  }
};
```

### **Backend API:**

```javascript
// PUT /api/workmanagement/giao-nhiem-vu/:assignmentId/tu-cham-diem
// Body: { diemTuDanhGia: 85 }

async nhanVienTuChamDiem(req, res) {
  const { assignmentId } = req.params;
  const { diemTuDanhGia } = req.body;
  const currentUserId = req.userId;

  // Validation
  if (diemTuDanhGia == null || diemTuDanhGia < 0 || diemTuDanhGia > 100) {
    throw new AppError(400, "Điểm phải từ 0-100");
  }

  // Find assignment
  const assignment = await NhanVienNhiemVu.findById(assignmentId);
  if (!assignment) {
    throw new AppError(404, "Không tìm thấy nhiệm vụ");
  }

  // ✅ Security: Chỉ cho nhân viên tự chấm điểm cho mình
  if (assignment.NhanVienID.toString() !== currentUserId.toString()) {
    throw new AppError(403, "Bạn chỉ có thể tự chấm điểm cho nhiệm vụ của mình");
  }

  // ✅ Check chu kỳ đã đóng
  const ChuKyDanhGia = require("../models/ChuKyDanhGia");
  const chuKy = await ChuKyDanhGia.findById(assignment.ChuKyDanhGiaID);

  if (!chuKy) {
    throw new AppError(404, "Không tìm thấy chu kỳ đánh giá");
  }

  if (chuKy.isDong) {
    throw new AppError(400, "Chu kỳ đã đóng, không thể tự chấm điểm");
  }

  // ✅ Check KPI đã duyệt chưa (optional - tùy yêu cầu)
  const DanhGiaKPI = require("../models/DanhGiaKPI");
  const danhGiaKPI = await DanhGiaKPI.findOne({
    ChuKyID: assignment.ChuKyDanhGiaID,
    NhanVienID: assignment.NhanVienID,
  });

  if (danhGiaKPI && danhGiaKPI.TrangThai === "DA_DUYET") {
    throw new AppError(400, "KPI đã được duyệt, không thể thay đổi điểm tự đánh giá");
  }

  // ✅ Update điểm
  await assignment.tuChamDiem(diemTuDanhGia);

  return sendResponse(
    res,
    200,
    true,
    { assignment },
    null,
    "Đã lưu điểm tự đánh giá thành công"
  );
}
```

---

## 🎨 UI/UX Components

### **1. Header Card với Gradient**

```javascript
<Card
  sx={{
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  }}
>
  <CardContent>
    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
      <AssignmentIcon sx={{ fontSize: 40 }} />
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Tự đánh giá KPI
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Đánh giá mức độ hoàn thành công việc của bản thân
        </Typography>
      </Box>
    </Stack>

    {/* Info chips */}
    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
      <Chip label={`Nhân viên: ${user?.HoTen}`} />
      <Chip label={`Mã NV: ${user?.MaNhanVien}`} />
      {selectedChuKy && (
        <Chip
          label={
            selectedChuKy.TenChuKy ||
            `Tháng ${selectedChuKy.Thang}/${selectedChuKy.Nam}`
          }
        />
      )}
      {selectedChuKy?.isDong && <Chip label="Chu kỳ đã đóng" color="warning" />}
    </Stack>
  </CardContent>
</Card>
```

### **2. Dropdown Chọn Chu Kỳ + Progress Bar**

```javascript
<Paper elevation={2} sx={{ p: 3 }}>
  <Grid container spacing={3}>
    {/* Dropdown */}
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
        <Select
          value={selectedChuKyId}
          onChange={(e) => setSelectedChuKyId(e.target.value)}
        >
          {chuKyList.map((ck) => (
            <MenuItem key={ck._id} value={ck._id}>
              {ck.TenChuKy || `Tháng ${ck.Thang}/${ck.Nam}`}
              {ck.isDong && <Chip label="Đã đóng" />}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    {/* Progress */}
    <Grid item xs={12} md={6}>
      <Stack direction="row" justifyContent="space-between">
        <Typography>Tiến độ tự đánh giá</Typography>
        <Typography color="primary">
          {progress.scored}/{progress.total} nhiệm vụ
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress.percentage}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Grid>
  </Grid>
</Paper>
```

### **3. Info Alert**

```javascript
<Alert severity="info" icon={<InfoIcon />}>
  <Typography variant="body2">
    <strong>Lưu ý:</strong> Điểm tự đánh giá sẽ được dùng cho tiêu chí{" "}
    <strong>"Mức độ hoàn thành công việc"</strong> (0-100%). Quản lý sẽ chấm
    điểm và điểm cuối cùng được tính theo công thức:{" "}
    <strong>(Điểm Quản lý × 2 + Điểm Tự đánh giá) / 3</strong>
  </Typography>
  {!canEdit && (
    <Typography color="warning.main" sx={{ mt: 1 }}>
      {selectedChuKy?.isDong
        ? "⚠️ Chu kỳ đã đóng. Bạn không thể tự chấm điểm."
        : "⚠️ KPI đã được duyệt. Cần hủy duyệt để thay đổi điểm."}
    </Typography>
  )}
</Alert>
```

### **4. Empty States**

```javascript
// No chu kỳ
if (chuKyList.length === 0) {
  return (
    <Alert severity="info">
      <Typography variant="subtitle1" fontWeight={600}>
        Chưa có chu kỳ đánh giá nào
      </Typography>
      <Typography variant="body2">
        Vui lòng liên hệ quản lý để tạo chu kỳ đánh giá KPI.
      </Typography>
    </Alert>
  );
}

// No assignments
{
  (!assignments || assignments.length === 0) && (
    <Alert severity="warning">
      <Typography variant="subtitle1" fontWeight={600}>
        Không có nhiệm vụ nào trong chu kỳ này
      </Typography>
      <Typography variant="body2">
        Vui lòng liên hệ quản lý để được gán nhiệm vụ thường quy.
      </Typography>
    </Alert>
  );
}
```

### **5. Accordion cho từng Assignment**

```javascript
<Accordion defaultExpanded={index === 0}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: "100%", alignItems: "center" }}
    >
      <Typography variant="h6" sx={{ flex: 1 }}>
        {assignment.NhiemVuThuongQuyID?.TenNhiemVu || "Nhiệm vụ không xác định"}
      </Typography>
      {assignment.DiemTuDanhGia != null && (
        <Chip
          icon={<CheckCircleIcon />}
          label={`Đã chấm: ${assignment.DiemTuDanhGia}%`}
          color="success"
          size="small"
        />
      )}
      <Chip
        label={`Độ khó: ${assignment.MucDoKho || "—"}`}
        size="small"
        color="primary"
        variant="outlined"
      />
    </Stack>
  </AccordionSummary>

  <AccordionDetails>
    {/* Thông tin nhiệm vụ */}
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={6}>
        <Typography variant="caption" color="text.secondary">
          Mức độ khó
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {assignment.MucDoKho || "Chưa xác định"}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="caption" color="text.secondary">
          Ngày gán
        </Typography>
        <Typography variant="body1">
          {assignment.NgayGan
            ? new Date(assignment.NgayGan).toLocaleDateString("vi-VN")
            : "—"}
        </Typography>
      </Grid>
      {assignment.NgayTuCham && (
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">
            Đã tự chấm lúc
          </Typography>
          <Typography variant="body2">
            {new Date(assignment.NgayTuCham).toLocaleString("vi-VN")}
          </Typography>
        </Grid>
      )}
    </Grid>

    {/* Input điểm */}
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          type="number"
          label="Điểm tự đánh giá (0-100%)"
          value={localScores[assignment._id] ?? ""}
          onChange={(e) => handleScoreChange(assignment._id, e.target.value)}
          disabled={!canEdit}
          inputProps={{ min: 0, max: 100, step: 1 }}
          helperText={
            canEdit
              ? "Nhập điểm từ 0-100"
              : selectedChuKy?.isDong
              ? "Chu kỳ đã đóng"
              : "KPI đã duyệt, cần hủy duyệt để sửa"
          }
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => handleSaveScore(assignment)}
          disabled={!canEdit || isSaving}
          startIcon={<CheckCircleIcon />}
          sx={{ height: "56px" }}
        >
          {isSaving ? "Đang lưu..." : "Lưu điểm"}
        </Button>
      </Grid>
    </Grid>
  </AccordionDetails>
</Accordion>
```

### **6. Loading Skeleton**

```javascript
if (isLoading || isLoadingChuKy) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={400} />
    </Container>
  );
}
```

---

## 🔄 Workflow Hoàn Chỉnh

```
1. User login → useAuth() lấy user._id, user.HoTen, user.MaNhanVien

2. Component mount
   ↓
   dispatch(getChuKyDanhGia({}))
   ↓
   Load tất cả chu kỳ (bao gồm đã đóng)

3. Auto-select chu kỳ đang mở đầu tiên
   - Nếu có chu kỳ isDong=false → chọn chu kỳ đó
   - Nếu không → chọn chu kỳ đầu tiên trong list

4. User có thể chọn chu kỳ khác qua dropdown
   ↓
   setSelectedChuKyId(newId)
   ↓
   useEffect trigger → dispatch(layDanhSachNhiemVu)

5. Load assignments (NhanVienNhiemVu)
   ↓
   Backend query:
     WHERE NhanVienID = user._id
     AND ChuKyDanhGiaID = selectedChuKyId
   ↓
   Return: assignments[] (CHỈ nhiệm vụ của user trong chu kỳ này)
   [
     {
       _id: "assignment-123",
       NhiemVuThuongQuyID: { TenNhiemVu: "Khám bệnh" },
       DiemTuDanhGia: 85,  // ← Điểm đã tự chấm
       NgayTuCham: Date,
       MucDoKho: 7.5
     }
   ]

6. Hiển thị danh sách assignments
   - Map qua assignments[]
   - Hiển thị input điểm (value = DiemTuDanhGia)
   - Check canEdit (chu kỳ đóng? KPI duyệt?)

7. User nhập điểm
   ↓
   handleScoreChange → update localScores[assignmentId]
   ↓
   User click "Lưu điểm"
   ↓
   handleSaveScore:
     - Validation (0-100)
     - dispatch(nhanVienTuChamDiem({ assignmentId, diemTuDanhGia }))
     - Backend: assignment.tuChamDiem(diem)
     - Update: DiemTuDanhGia = 85, NgayTuCham = now()
     - Toast success
     - Reload assignments → progress bar update

8. Sau khi lưu
   ↓
   Progress: 3/5 nhiệm vụ (60%)
   ↓
   Chip "Đã chấm: 85%" hiển thị trên accordion
   ↓
   Nhân viên có thể tiếp tục chấm các nhiệm vụ còn lại

9. Khi quản lý duyệt KPI (ở trang khác)
   ↓
   DanhGiaKPI.TrangThai = "DA_DUYET"
   ↓
   Backend lấy DiemTuDanhGia từ NhanVienNhiemVu
   ↓
   Tính điểm cuối: (DiemQL × 2 + DiemTuDanhGia) / 3
   ↓
   Lưu vào TongDiemKPI

10. Nhân viên quay lại trang tự đánh giá
    ↓
    Check: DanhGiaKPI.TrangThai = "DA_DUYET"
    ↓
    canEdit = false
    ↓
    Input disabled, chỉ hiển thị điểm đã tự chấm
```

---

## ✅ Testing Checklist

### **Phase 1: Basic Load**

- [ ] Login với tài khoản nhân viên
- [ ] Vào `/quanlycongviec/kpi/tu-danh-gia`
- [ ] Thấy loading skeleton trong 1-2s
- [ ] Header card hiển thị đúng tên, mã NV
- [ ] Dropdown hiển thị đúng danh sách chu kỳ

### **Phase 2: Dropdown Chu Kỳ**

- [ ] Dropdown có tất cả chu kỳ (kể cả đã đóng)
- [ ] Chu kỳ đã đóng có chip "Đã đóng"
- [ ] Auto-select chu kỳ đang mở đầu tiên
- [ ] Chọn chu kỳ khác → Load đúng assignments

### **Phase 3: Filter Assignments**

- [ ] Chỉ thấy assignments của user đang login
- [ ] KHÔNG thấy assignments của nhân viên khác
- [ ] Chỉ thấy assignments thuộc chu kỳ đang chọn
- [ ] Progress bar hiển thị đúng X/Y nhiệm vụ

### **Phase 4: Tự Đánh Giá**

- [ ] Nhập điểm 0-100% → Lưu thành công
- [ ] Nhập điểm < 0 hoặc > 100 → Toast warning
- [ ] Click "Lưu điểm" khi chưa nhập → Toast warning
- [ ] Sau khi lưu → Toast success "Đã lưu điểm cho nhiệm vụ: ..."
- [ ] Progress bar tăng từ 0/5 lên 1/5
- [ ] Chip "Đã chấm: 85%" hiển thị trên accordion

### **Phase 5: Chu Kỳ Đã Đóng**

- [ ] Chọn chu kỳ `isDong = true`
- [ ] Input disabled (không sửa được)
- [ ] Alert cảnh báo: "⚠️ Chu kỳ đã đóng. Bạn không thể tự chấm điểm."
- [ ] Nút "Lưu điểm" disabled

### **Phase 6: KPI Đã Duyệt**

- [ ] Quản lý duyệt KPI → `DanhGiaKPI.TrangThai = "DA_DUYET"`
- [ ] Nhân viên reload trang
- [ ] Input disabled (không sửa được)
- [ ] Alert cảnh báo: "⚠️ KPI đã được duyệt. Cần hủy duyệt để thay đổi điểm."
- [ ] Vẫn hiển thị điểm đã tự chấm (read-only)

### **Phase 7: Empty States**

- [ ] Chọn chu kỳ không có assignments → Alert "Không có nhiệm vụ"
- [ ] DB không có chu kỳ nào → Alert "Chưa có chu kỳ đánh giá"

### **Phase 8: Edge Cases**

- [ ] Reload page → Điểm đã lưu vẫn hiển thị
- [ ] Đổi chu kỳ → Local scores reset đúng
- [ ] Mở 2 tab → Lưu ở tab 1 → Reload tab 2 thấy điểm mới
- [ ] Backend reject nếu user cố sửa assignment không phải của mình (Security)

---

## 📊 So Sánh Trước/Sau

| Feature                | Trước                    | Sau                                         |
| ---------------------- | ------------------------ | ------------------------------------------- |
| **Data Source**        | ❌ DanhGiaKPI phức tạp   | ✅ NhanVienNhiemVu đơn giản                 |
| **API Calls**          | ❌ getChamDiemDetail     | ✅ layDanhSachNhiemVu (chỉ query 1 model)   |
| **Filter**             | ⚠️ Nhiều bước            | ✅ WHERE NhanVienID + ChuKyDanhGiaID        |
| **Chọn chu kỳ**        | ❌ Auto-select only      | ✅ Dropdown với tất cả chu kỳ               |
| **Xem chu kỳ cũ**      | ❌ Không                 | ✅ Có (bao gồm isDong=true)                 |
| **Progress tracking**  | ❌ Không                 | ✅ X/Y nhiệm vụ + %                         |
| **Loading states**     | ⚠️ Basic                 | ✅ Skeleton + isLoading                     |
| **Empty states**       | ⚠️ Basic                 | ✅ Alert với icon + message                 |
| **Validation**         | ⚠️ Basic                 | ✅ Toast warnings + backend security        |
| **UX hiện đại**        | ❌ Không                 | ✅ Gradient header + Paper sections         |
| **Chu kỳ đóng**        | ⚠️ Chưa xử lý            | ✅ Disable input + alert                    |
| **KPI đã duyệt**       | ⚠️ Chưa xử lý rõ         | ✅ Disable input + check backend            |
| **Security**           | ⚠️ Frontend only         | ✅ Backend check ownership + cycle status   |
| **Hiển thị sau duyệt** | ⚠️ Phức tạp (3 cột điểm) | ✅ Đơn giản (chỉ hiển thị điểm tự đánh giá) |

---

## 🎉 KẾT QUẢ

**✅ HOÀN THIỆN 100%**

- **Logic nghiệp vụ**: ĐƠN GIẢN, TRỰC QUAN
- **Data model**: CHỈ làm việc với `NhanVienNhiemVu`
- **Backend APIs**: 2 endpoints đơn giản
  - `GET /giao-nhiem-vu?nhanVienId&chuKyId`
  - `PUT /giao-nhiem-vu/:id/tu-cham-diem`
- **Frontend**: Clean code, easy to maintain
- **Security**: Backend validation đầy đủ
- **UX**: Modern, responsive, informative

**Người dùng bây giờ có thể:**

1. ✅ Chọn bất kỳ chu kỳ nào (kể cả đã đóng)
2. ✅ Chỉ thấy nhiệm vụ của mình (filter đúng)
3. ✅ Tracking tiến độ tự chấm điểm
4. ✅ Hiểu rõ điều kiện cho phép tự chấm (chu kỳ mở, KPI chưa duyệt)
5. ✅ UX mượt mà với loading, empty states, toast notifications

**Toàn bộ flow KPI self-assessment đã hoàn chỉnh và ĐƠN GIẢN HƠN!** 🚀

---

# 2. QUẢN LÝ CHẤM ĐIỂM KPI (Manager)

## 🎯 Tổng quan

### **Vai trò:** Manager/Admin chấm điểm KPI cho nhân viên

### **Nguyên tắc thiết kế:**

- ✅ **Single Source of Truth**: Chỉ lưu raw data (ChiTietDiem)
- ✅ **No Redundancy**: Không lưu calculated fields trong DB
- ✅ **Frontend Preview**: Tính điểm real-time khi chưa duyệt
- ✅ **Backend Snapshot**: Chỉ tính và lưu TongDiemKPI khi duyệt
- ✅ **Clean Separation**: DiemTuDanhGia (NV) ≠ DiemDat (Manager)

---

## 📊 DATA MODEL - V2 (SIMPLIFIED)

### **Model 1: DanhGiaKPI** (Wrapper cho 1 nhân viên trong 1 chu kỳ)

```javascript
{
  _id: "6789...",
  ChuKyID: "6788...",
  NhanVienID: "6787...",
  NguoiDanhGiaID: "6786...",  // Manager

  // ✅ CHỈ có khi đã duyệt (snapshot chính thức)
  TongDiemKPI: 23.45,  // null hoặc 0 khi CHUA_DUYET

  TrangThai: "DA_DUYET",  // "CHUA_DUYET" | "DA_DUYET"
  NgayDuyet: "2025-01-20",
  NguoiDuyet: "6786...",

  NhanXetNguoiDanhGia: "Hoàn thành tốt nhiệm vụ",

  // Lịch sử
  LichSuDuyet: [
    {
      NguoiDuyet: "6786...",
      NgayDuyet: "2025-01-20",
      TongDiemLucDuyet: 23.45,
      GhiChu: "Approved"
    }
  ]
}
```

### **Model 2: DanhGiaNhiemVuThuongQuy** (Chi tiết từng nhiệm vụ)

```javascript
{
  _id: "6790...",
  DanhGiaKPIID: "6789...",
  NhiemVuThuongQuyID: "6785...",
  NhanVienID: "6787...",
  ChuKyDanhGiaID: "6788...",

  // Độ khó nhiệm vụ (1-10)
  MucDoKho: 7,

  // ✅ RAW DATA - Manager nhập
  ChiTietDiem: [
    {
      TenTieuChi: "Mức độ hoàn thành",
      LoaiTieuChi: "TANG_DIEM",
      IsMucDoHoanThanh: true,  // ← DUY NHẤT 1 tiêu chí = true
      DiemDat: 90,  // ← Manager chấm (0-100)
      GiaTriMin: 0,
      GiaTriMax: 100,
      DonVi: "%"
    },
    {
      TenTieuChi: "Chất lượng công việc",
      LoaiTieuChi: "TANG_DIEM",
      IsMucDoHoanThanh: false,
      DiemDat: 80,
      GiaTriMin: 0,
      GiaTriMax: 100
    },
    {
      TenTieuChi: "Vi phạm quy định",
      LoaiTieuChi: "GIAM_DIEM",
      IsMucDoHoanThanh: false,
      DiemDat: 5,  // Giảm 5 điểm
      GiaTriMin: 0,
      GiaTriMax: 50
    }
  ],

  // ❌ XÓA BỎ: TongDiemTieuChi, DiemNhiemVu (calculated fields)
  // → Tính real-time ở Frontend, tính chính thức khi duyệt

  TrangThai: "CHUA_DUYET",
  GhiChu: ""
}
```

### **Model 3: NhanVienNhiemVu** (Assignment + Tự đánh giá)

```javascript
{
  _id: "6791...",
  NhanVienID: "6787...",
  NhiemVuThuongQuyID: "6785...",
  ChuKyDanhGiaID: "6788...",

  MucDoKho: 7,  // User nhập khi gán

  // ✅ Nhân viên tự chấm (0-100%)
  DiemTuDanhGia: 85,  // null = chưa tự chấm
  NgayTuCham: "2025-01-15",

  NgayGan: "2025-01-01"
}
```

---

## 🔄 WORKFLOW HOÀN CHỈNH

### **PHASE 1: Gán nhiệm vụ (Manager)**

```
1. Manager chọn nhân viên + chu kỳ
2. Chọn nhiệm vụ thường quy từ danh sách
3. Nhập MucDoKho cho từng nhiệm vụ (1-10)
4. Save → Tạo NhanVienNhiemVu

Backend:
  POST /api/workmanagement/giao-nhiem-vu

  Body: {
    NhanVienID: "...",
    NhiemVuThuongQuyID: "...",
    ChuKyDanhGiaID: "...",
    MucDoKho: 7
  }
```

### **PHASE 2: Nhân viên tự chấm điểm**

```
1. NV vào trang "Tự đánh giá KPI"
2. Chọn chu kỳ
3. Xem danh sách nhiệm vụ được gán
4. Nhập DiemTuDanhGia cho từng nhiệm vụ (0-100%)
5. Click "Lưu tất cả"

Backend:
  PUT /api/workmanagement/giao-nhiem-vu/:id/tu-cham-diem

  Body: { DiemTuDanhGia: 85 }

  → Update NhanVienNhiemVu.DiemTuDanhGia
```

### **PHASE 3: Manager chấm điểm (SONG SONG với Phase 2)**

```
⚠️ QUAN TRỌNG: NV và Manager có thể chấm song song
   - Điều kiện duy nhất: DanhGiaKPI.TrangThai = "CHUA_DUYET"
   - Không kiểm soát thứ tự ai chấm trước

1. Manager vào trang "Quản lý chấm điểm KPI"
2. Chọn chu kỳ
3. Click "Tạo đánh giá KPI" → Chọn nhân viên
   → Backend tạo DanhGiaKPI + DanhGiaNhiemVuThuongQuy

4. Manager mở dialog chấm điểm
5. Hiển thị table:
   ┌─────────────────────────────────────────────────────────────────┐
   │ Nhiệm vụ | Độ khó | Tự ĐG | QL chấm | TC2 | TC3 | ... | Tổng  │
   │          │        │(Mức ĐHT)│(Mức ĐHT)│     │     │     │(dự kiến)│
   ├─────────────────────────────────────────────────────────────────┤
   │ Task A   │   7    │   85   │   90    │ 80  │ -5  │ ... │ 11.4  │
   │          │        │  (xám) │ (xanh)  │     │     │     │ (xám) │
   └─────────────────────────────────────────────────────────────────┘

   Giải thích:
   - Cột "Tự ĐG": Load từ NhanVienNhiemVu.DiemTuDanhGia (read-only)
     → Hiển thị "--" nếu null
   - Cột "QL chấm": Manager nhập DiemDat (editable)
   - Cột TC2, TC3: Các tiêu chí khác (Manager nhập)
   - Cột "Tổng (dự kiến)": Frontend tính real-time

6. Manager nhập điểm cho TẤT CẢ tiêu chí
7. Click "Lưu tất cả" → Lưu ChiTietDiem

Backend:
  PUT /api/kpi/danh-gia-nhiem-vu/:id/cham-diem

  Body: {
    ChiTietDiem: [
      { TenTieuChi: "...", DiemDat: 90, IsMucDoHoanThanh: true },
      { TenTieuChi: "...", DiemDat: 80 }
    ]
  }

  → Lưu RAW DATA, KHÔNG tính toán
```

### **PHASE 4: Preview Tổng điểm (Frontend Real-time)**

```javascript
// ✅ Frontend tính toán real-time khi CHƯA DUYỆT
const calculatePreviewScore = useMemo(() => {
  return (nhiemVuList, diemTuDanhGiaMap) => {
    let tongDiem = 0;

    nhiemVuList.forEach((nv) => {
      const diemTuDanhGia = diemTuDanhGiaMap[nv.NhiemVuThuongQuyID] || 0;

      let diemTang = 0;
      let diemGiam = 0;

      nv.ChiTietDiem.forEach((tc) => {
        let diem = 0;

        // ✅ Công thức DUY NHẤT
        if (tc.IsMucDoHoanThanh) {
          // Tiêu chí "Mức độ hoàn thành"
          const diemQL = tc.DiemDat || 0;
          diem = (diemQL * 2 + diemTuDanhGia) / 3;
        } else {
          // Tiêu chí khác
          diem = tc.DiemDat || 0;
        }

        if (tc.LoaiTieuChi === "TANG_DIEM") {
          diemTang += diem / 100; // Scale về 0-1
        } else {
          diemGiam += diem / 100;
        }
      });

      const tongDiemTC = diemTang - diemGiam;
      const diemNV = nv.MucDoKho * tongDiemTC;
      tongDiem += diemNV;
    });

    return tongDiem;
  };
}, []);

// UI hiển thị
<Box sx={{ bgcolor: "grey.100", p: 2 }}>
  <Typography variant="h6" color="text.secondary">
    💡 Tổng điểm dự kiến: {tongDiemPreview.toFixed(2)}
  </Typography>
  <Typography variant="caption">
    (Chưa chính thức - Sẽ được tính lại khi duyệt)
  </Typography>
</Box>;
```

### **PHASE 5: Duyệt KPI (Manager)**

```
1. Manager kiểm tra tất cả nhiệm vụ đã chấm điểm
2. Click "Duyệt KPI"
3. Backend:
   - Lấy DiemTuDanhGia từ NhanVienNhiemVu
   - Tính TongDiemKPI chính thức
   - Snapshot vào DanhGiaKPI.TongDiemKPI
   - Lock: TrangThai = "DA_DUYET"

Backend Method:
  POST /api/kpi/danh-gia/:id/duyet

  → Gọi danhGiaKPI.duyet(nguoiDuyetId)
```

### **PHASE 6: Sau khi duyệt**

```
✅ DanhGiaKPI.TrangThai = "DA_DUYET"
✅ TongDiemKPI = 23.45 (snapshot chính thức)
✅ KHÔNG cho sửa ChiTietDiem
✅ KHÔNG cho NV sửa DiemTuDanhGia

Hiển thị:
  - Tổng điểm KPI: 23.45 (chính thức, màu xanh)
  - Ngày duyệt: 20/01/2025
  - Người duyệt: Nguyễn Văn A
```

---

## 🧮 CÔNG THỨC TÍNH ĐIỂM CHI TIẾT

### **Bước 1: Tính điểm từng tiêu chí (Scale 0-1)**

```javascript
// ✅ Tiêu chí "Mức độ hoàn thành" (IsMucDoHoanThanh = true)
const diemQuanLy = chiTietDiem[0].DiemDat; // 90 (Manager chấm)
const diemTuDanhGia = nhanVienNhiemVu.DiemTuDanhGia; // 85 (NV tự chấm)

// Công thức đặc biệt: (DiemQL × 2 + DiemTuDanhGia) / 3
const diemMucDoHT = (diemQuanLy * 2 + diemTuDanhGia) / 3; // = 88.33
const diemMucDoHT_Scaled = diemMucDoHT / 100; // = 0.8833

// ✅ Tiêu chí khác (TANG_DIEM)
const diemChatLuong = chiTietDiem[1].DiemDat / 100; // 80/100 = 0.8

// ✅ Tiêu chí giảm điểm (GIAM_DIEM)
const diemViPham = chiTietDiem[2].DiemDat / 100; // 5/100 = 0.05
```

### **Bước 2: Tổng điểm tiêu chí**

```javascript
const diemTang = diemMucDoHT_Scaled + diemChatLuong; // 0.8833 + 0.8 = 1.6833
const diemGiam = diemViPham; // 0.05

const TongDiemTieuChi = diemTang - diemGiam; // 1.6833 - 0.05 = 1.6333

// ⚠️ LƯU Ý: TongDiemTieuChi CÓ THỂ > 1.0 (nếu nhiều tiêu chí tăng điểm)
// Không có giới hạn max
```

### **Bước 3: Điểm nhiệm vụ**

```javascript
const DiemNhiemVu = MucDoKho * TongDiemTieuChi;
// = 7 × 1.6333 = 11.43

// ⚠️ DiemNhiemVu CÓ THỂ > MucDoKho
```

### **Bước 4: Tổng điểm KPI**

```javascript
// Giả sử nhân viên có 3 nhiệm vụ:
const nhiemVu1 = { MucDoKho: 7, DiemNhiemVu: 11.43 };
const nhiemVu2 = { MucDoKho: 5, DiemNhiemVu: 4.5 };
const nhiemVu3 = { MucDoKho: 8, DiemNhiemVu: 7.2 };

// TongDiemKPI = SUM(DiemNhiemVu)
const TongDiemKPI = 11.43 + 4.5 + 7.2 = 23.13;

// ⚠️ KHÔNG scale về %, giữ nguyên số điểm
```

### **Ví dụ cụ thể:**

```
NHIỆM VỤ A (MucDoKho = 7):
  Tiêu chí 1 (Mức ĐHT, TANG_DIEM):
    - Manager chấm: 90%
    - NV tự chấm: 85%
    - Điểm cuối: (90×2 + 85)/3 = 88.33%
    - Scale: 88.33/100 = 0.8833

  Tiêu chí 2 (Chất lượng, TANG_DIEM):
    - Manager chấm: 80%
    - Scale: 80/100 = 0.8

  Tiêu chí 3 (Vi phạm, GIAM_DIEM):
    - Manager chấm: 5%
    - Scale: 5/100 = 0.05

  TongDiemTieuChi = (0.8833 + 0.8) - 0.05 = 1.6333
  DiemNhiemVu = 7 × 1.6333 = 11.43

NHIỆM VỤ B (MucDoKho = 5):
  DiemNhiemVu = 4.5

NHIỆM VỤ C (MucDoKho = 8):
  DiemNhiemVu = 7.2

→ TongDiemKPI = 11.43 + 4.5 + 7.2 = 23.13
```

---

## 🎨 UI/UX COMPONENTS

### **1. Trang Danh Sách KPI**

```javascript
// DanhGiaKPIPage.js

<MainCard>
  <Grid container spacing={3}>
    {/* Header */}
    <Grid item xs={12}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h4">Quản Lý Chấm Điểm KPI</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateKPI}
        >
          Tạo đánh giá KPI
        </Button>
      </Stack>
    </Grid>

    {/* Filters */}
    <Grid item xs={12}>
      <Stack direction="row" spacing={2}>
        {/* Dropdown chu kỳ */}
        <Autocomplete
          options={chuKyDanhGias}
          value={selectedChuKy}
          onChange={(e, v) => setSelectedChuKy(v)}
          getOptionLabel={(opt) => opt.TenChuKy}
          renderInput={(params) => (
            <TextField {...params} label="Chu kỳ đánh giá" />
          )}
          sx={{ minWidth: 300 }}
        />

        {/* Filter nhân viên */}
        <SelectNhanVienButton />

        {/* Filter trạng thái */}
        <Select value={trangThai} onChange={handleTrangThaiChange}>
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="CHUA_DUYET">Chưa duyệt</MenuItem>
          <MenuItem value="DA_DUYET">Đã duyệt</MenuItem>
        </Select>
      </Stack>
    </Grid>

    {/* Table */}
    <Grid item xs={12}>
      <DanhGiaKPITable data={danhGiaKPIs} />
    </Grid>
  </Grid>
</MainCard>
```

### **2. Dialog Chấm Điểm (ChamDiemKPIDialog)**

```javascript
// ChamDiemKPIDialog.js

const ChamDiemKPIDialog = ({ open, onClose, nhanVien, readOnly }) => {
  const { currentDanhGiaKPI, currentNhiemVuList } = useSelector(
    (state) => state.kpi
  );

  // Load DiemTuDanhGia từ NhanVienNhiemVu
  const [diemTuDanhGiaMap, setDiemTuDanhGiaMap] = useState({});

  useEffect(() => {
    const loadDiemTuDanhGia = async () => {
      const assignments = await apiService.get(
        "/workmanagement/giao-nhiem-vu",
        {
          params: {
            nhanVienId: nhanVien._id,
            chuKyId: currentDanhGiaKPI.ChuKyID,
          },
        }
      );

      const map = {};
      assignments.data.forEach((a) => {
        map[a.NhiemVuThuongQuyID] = a.DiemTuDanhGia || null;
      });
      setDiemTuDanhGiaMap(map);
    };

    if (open && nhanVien) {
      loadDiemTuDanhGia();
    }
  }, [open, nhanVien]);

  // Tính tổng điểm preview
  const tongDiemPreview = useMemo(() => {
    return calculateTotalScore(currentNhiemVuList, diemTuDanhGiaMap);
  }, [currentNhiemVuList, diemTuDanhGiaMap]);

  const isApproved = currentDanhGiaKPI?.TrangThai === "DA_DUYET";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar>{nhanVien?.Ten?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h6">{nhanVien?.Ten}</Typography>
            <Typography variant="caption">
              {nhanVien?.MaNhanVien} - {nhanVien?.KhoaID?.TenKhoa}
            </Typography>
          </Box>
          <Box flex={1} />
          {isApproved ? (
            <Chip label="Đã duyệt" color="success" icon={<CheckCircleIcon />} />
          ) : (
            <Chip label="Chưa duyệt" color="warning" />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Table chấm điểm */}
        <ChamDiemKPITable
          nhiemVuList={currentNhiemVuList}
          diemTuDanhGiaMap={diemTuDanhGiaMap}
          onScoreChange={handleScoreChange}
          readOnly={isApproved || readOnly}
        />

        {/* Footer: Tổng điểm */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            bgcolor: isApproved ? "success.light" : "grey.100",
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {isApproved
                ? "📌 Tổng điểm KPI chính thức:"
                : "💡 Tổng điểm dự kiến:"}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={isApproved ? "success.main" : "text.secondary"}
            >
              {isApproved
                ? currentDanhGiaKPI.TongDiemKPI.toFixed(2)
                : tongDiemPreview.toFixed(2)}
            </Typography>
          </Stack>
          {!isApproved && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
            >
              * Điểm này chưa chính thức và sẽ được tính lại khi duyệt
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        {!isApproved && (
          <>
            <Button onClick={handleSaveAll} variant="contained" color="primary">
              Lưu tất cả
            </Button>
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              disabled={!canApprove}
            >
              Duyệt KPI
            </Button>
          </>
        )}
        {isApproved && canUndoApproval && (
          <Button onClick={handleUndoApprove} variant="outlined" color="error">
            Hủy duyệt
          </Button>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};
```

### **3. Table Chấm Điểm (ChamDiemKPITable) - NEW LAYOUT**

```javascript
// ChamDiemKPITable.js

const ChamDiemKPITable = ({
  nhiemVuList,
  diemTuDanhGiaMap,
  onScoreChange,
  readOnly,
}) => {
  // Utility: Tính điểm nhiệm vụ
  const calculateNhiemVuScore = useCallback(
    (nhiemVu) => {
      const diemTuDanhGia = diemTuDanhGiaMap[nhiemVu.NhiemVuThuongQuyID] || 0;

      let diemTang = 0;
      let diemGiam = 0;

      nhiemVu.ChiTietDiem.forEach((tc) => {
        let diem = 0;

        if (tc.IsMucDoHoanThanh) {
          const diemQL = tc.DiemDat || 0;
          diem = (diemQL * 2 + diemTuDanhGia) / 3;
        } else {
          diem = tc.DiemDat || 0;
        }

        if (tc.LoaiTieuChi === "TANG_DIEM") {
          diemTang += diem / 100;
        } else {
          diemGiam += diem / 100;
        }
      });

      const tongDiemTC = diemTang - diemGiam;
      const diemNV = nhiemVu.MucDoKho * tongDiemTC;

      return { tongDiemTC, diemNV };
    },
    [diemTuDanhGiaMap]
  );

  // Get tiêu chí headers
  const tieuChiHeaders = useMemo(() => {
    if (nhiemVuList.length === 0) return [];
    return nhiemVuList[0]?.ChiTietDiem || [];
  }, [nhiemVuList]);

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>Nhiệm vụ thường quy</TableCell>
            <TableCell align="center">Độ khó</TableCell>

            {/* ✅ NEW: Columns cho từng tiêu chí */}
            {tieuChiHeaders.map((tc, idx) => {
              if (tc.IsMucDoHoanThanh) {
                // ✅ Tiêu chí "Mức độ hoàn thành" → 2 cột
                return (
                  <React.Fragment key={idx}>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: "grey.100",
                        borderRight: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Tooltip title="Điểm nhân viên tự đánh giá (read-only)">
                        <Box>
                          <Typography variant="caption" fontWeight="600">
                            Tự đánh giá
                          </Typography>
                          <Typography variant="caption" display="block">
                            (Mức ĐHT)
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ bgcolor: "primary.lighter" }}
                    >
                      <Tooltip title="Điểm quản lý chấm (editable)">
                        <Box>
                          <Typography variant="caption" fontWeight="600">
                            Quản lý chấm
                          </Typography>
                          <Typography variant="caption" display="block">
                            (Mức ĐHT)
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </React.Fragment>
                );
              } else {
                // ✅ Tiêu chí khác → 1 cột
                return (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{
                      bgcolor:
                        tc.LoaiTieuChi === "GIAM_DIEM"
                          ? "error.lighter"
                          : "success.lighter",
                    }}
                  >
                    <Typography variant="caption" fontWeight="600">
                      {tc.LoaiTieuChi === "GIAM_DIEM" ? "↓ " : "↑ "}
                      {tc.TenTieuChi}
                    </Typography>
                    <Typography variant="caption" display="block">
                      ({tc.GiaTriMin}-{tc.GiaTriMax}
                      {tc.DonVi || "%"})
                    </Typography>
                  </TableCell>
                );
              }
            })}

            <TableCell align="center" sx={{ bgcolor: "warning.lighter" }}>
              Tổng điểm
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {nhiemVuList.map((nhiemVu, index) => {
            const { diemNV } = calculateNhiemVuScore(nhiemVu);
            const diemTuDanhGia = diemTuDanhGiaMap[nhiemVu.NhiemVuThuongQuyID];

            return (
              <TableRow key={nhiemVu._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {nhiemVu.NhiemVuThuongQuyID?.MoTa}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={nhiemVu.MucDoKho} color="primary" size="small" />
                </TableCell>

                {/* ✅ Cells cho từng tiêu chí */}
                {nhiemVu.ChiTietDiem.map((tc, tcIdx) => {
                  if (tc.IsMucDoHoanThanh) {
                    // ✅ 2 cells: Tự ĐG + QL chấm
                    return (
                      <React.Fragment key={tcIdx}>
                        {/* Cell 1: DiemTuDanhGia (read-only) */}
                        <TableCell
                          align="center"
                          sx={{
                            bgcolor: "grey.50",
                            borderRight: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {diemTuDanhGia != null ? (
                            <Typography
                              variant="h6"
                              color="text.secondary"
                              fontWeight="600"
                            >
                              {diemTuDanhGia}%
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              --
                            </Typography>
                          )}
                        </TableCell>

                        {/* Cell 2: DiemDat (editable) */}
                        <TableCell align="center">
                          <ScoreInput
                            value={tc.DiemDat}
                            onChange={(val) =>
                              onScoreChange(nhiemVu._id, tcIdx, val)
                            }
                            disabled={readOnly}
                            min={tc.GiaTriMin}
                            max={tc.GiaTriMax}
                            unit={tc.DonVi || "%"}
                          />
                        </TableCell>
                      </React.Fragment>
                    );
                  } else {
                    // ✅ 1 cell: DiemDat
                    return (
                      <TableCell key={tcIdx} align="center">
                        <ScoreInput
                          value={tc.DiemDat}
                          onChange={(val) =>
                            onScoreChange(nhiemVu._id, tcIdx, val)
                          }
                          disabled={readOnly}
                          min={tc.GiaTriMin}
                          max={tc.GiaTriMax}
                          unit={tc.DonVi || "%"}
                          isGiamDiem={tc.LoaiTieuChi === "GIAM_DIEM"}
                        />
                      </TableCell>
                    );
                  }
                })}

                {/* Tổng điểm nhiệm vụ */}
                <TableCell align="center">
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color={
                      diemNV >= nhiemVu.MucDoKho
                        ? "success.main"
                        : "text.primary"
                    }
                  >
                    {diemNV.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

### **4. ScoreInput Component (Isolated state)**

```javascript
// ScoreInput.js - Tránh focus loss

const ScoreInput = ({
  value,
  onChange,
  disabled,
  min = 0,
  max = 100,
  unit = "%",
  isGiamDiem = false,
}) => {
  const [localValue, setLocalValue] = useState(value || 0);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value || 0);
  }, [value]);

  const handleCommit = () => {
    let val = parseFloat(localValue);
    if (Number.isNaN(val)) val = 0;
    if (val < min) val = min;
    if (val > max) val = max;

    setLocalValue(val);
    onChange(val);
  };

  return (
    <TextField
      inputRef={inputRef}
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={(e) => e.key === "Enter" && handleCommit()}
      disabled={disabled}
      size="small"
      sx={{ width: 100 }}
      InputProps={{
        endAdornment: (
          <Typography variant="caption" color="text.secondary">
            {unit}
          </Typography>
        ),
      }}
    />
  );
};
```

---

## 🔧 BACKEND IMPLEMENTATION

### **1. Model Schema Updates**

```javascript
// ❌ XÓA BỎ trong DanhGiaNhiemVuThuongQuy schema:
// TongDiemTieuChi: { type: Number }
// DiemNhiemVu: { type: Number }

// ✅ GIỮ LẠI:
const danhGiaNhiemVuThuongQuySchema = Schema({
  DanhGiaKPIID: {
    type: Schema.Types.ObjectId,
    ref: "DanhGiaKPI",
    required: true,
  },
  NhiemVuThuongQuyID: {
    type: Schema.Types.ObjectId,
    ref: "NhiemVuThuongQuy",
    required: true,
  },
  NhanVienID: { type: Schema.Types.ObjectId, ref: "NhanVien", required: true },
  ChuKyDanhGiaID: {
    type: Schema.Types.ObjectId,
    ref: "ChuKyDanhGia",
    required: true,
  },

  MucDoKho: { type: Number, required: true, min: 1, max: 10 },
  ChiTietDiem: [chiTietDiemSchema], // ← RAW DATA

  TrangThai: {
    type: String,
    enum: ["CHUA_DUYET", "DA_DUYET"],
    default: "CHUA_DUYET",
  },
  GhiChu: String,
});

// ❌ XÓA BỎ pre-save hook
// ❌ XÓA BỎ post-save hook
```

### **2. Method duyet() - Tính điểm chính thức**

```javascript
// DanhGiaKPI.js

danhGiaKPISchema.methods.duyet = async function (nguoiDuyetId, nhanXet) {
  if (this.TrangThai === "DA_DUYET") {
    throw new AppError(400, "Đánh giá KPI đã được duyệt");
  }

  // 1. Load tất cả nhiệm vụ
  const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");
  const nhiemVuList = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: this._id,
    isDeleted: false,
  });

  if (nhiemVuList.length === 0) {
    throw new AppError(400, "Không có nhiệm vụ nào để đánh giá");
  }

  // 2. Load DiemTuDanhGia từ NhanVienNhiemVu
  const NhanVienNhiemVu = mongoose.model("NhanVienNhiemVu");
  const assignments = await NhanVienNhiemVu.find({
    NhanVienID: this.NhanVienID,
    ChuKyDanhGiaID: this.ChuKyID,
    isDeleted: false,
  });

  const diemTuDanhGiaMap = {};
  assignments.forEach((a) => {
    const nvIdStr = a.NhiemVuThuongQuyID.toString();
    diemTuDanhGiaMap[nvIdStr] = a.DiemTuDanhGia || 0;
  });

  // 3. Tính TongDiemKPI
  let tongDiem = 0;

  nhiemVuList.forEach((nv) => {
    const nvIdStr = nv.NhiemVuThuongQuyID.toString();
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0;
    let diemGiam = 0;

    nv.ChiTietDiem.forEach((tc) => {
      let diem = 0;

      // ✅ CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        // Tiêu chí "Mức độ hoàn thành"
        const diemQL = tc.DiemDat || 0;
        diem = (diemQL * 2 + diemTuDanhGia) / 3;
      } else {
        // Tiêu chí khác
        diem = tc.DiemDat || 0;
      }

      // Scale về 0-1
      if (tc.LoaiTieuChi === "TANG_DIEM") {
        diemTang += diem / 100;
      } else {
        diemGiam += diem / 100;
      }
    });

    const tongDiemTC = diemTang - diemGiam;
    const diemNV = nv.MucDoKho * tongDiemTC;
    tongDiem += diemNV;
  });

  // 4. Snapshot điểm chính thức
  this.TongDiemKPI = tongDiem;
  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();
  this.NguoiDuyet = nguoiDuyetId;

  if (nhanXet) {
    this.NhanXetNguoiDanhGia = nhanXet;
  }

  // 5. Lịch sử duyệt
  this.LichSuDuyet = this.LichSuDuyet || [];
  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI,
    GhiChu: nhanXet || "",
  });

  await this.save();
  return this;
};
```

### **3. Controller: Duyệt KPI**

```javascript
// kpi.controller.js

exports.duyetDanhGiaKPI = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { nhanXet } = req.body;
  const nguoiDuyetId = req.userId; // Từ authentication middleware

  // 1. Tìm DanhGiaKPI
  const danhGiaKPI = await DanhGiaKPI.findById(id)
    .populate("NhanVienID", "Ten MaNhanVien")
    .populate("ChuKyID", "TenChuKy");

  if (!danhGiaKPI) {
    throw new AppError(404, "Không tìm thấy đánh giá KPI");
  }

  // 2. Kiểm tra quyền
  // (Chỉ Manager/Admin mới được duyệt)
  const user = await User.findById(nguoiDuyetId);
  if (user.PhanQuyen < 2) {
    // 2 = Manager
    throw new AppError(403, "Bạn không có quyền duyệt KPI");
  }

  // 3. Validation: Tất cả nhiệm vụ phải có điểm
  const nhiemVuList = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: id,
    isDeleted: false,
  });

  const unscoredTasks = nhiemVuList.filter((nv) => {
    return nv.ChiTietDiem.some((tc) => tc.DiemDat == null);
  });

  if (unscoredTasks.length > 0) {
    throw new AppError(
      400,
      `Còn ${unscoredTasks.length} nhiệm vụ chưa chấm điểm đầy đủ`
    );
  }

  // 4. Duyệt
  await danhGiaKPI.duyet(nguoiDuyetId, nhanXet);

  // 5. Response
  return sendResponse(
    res,
    200,
    true,
    danhGiaKPI,
    null,
    `Đã duyệt KPI cho ${
      danhGiaKPI.NhanVienID.Ten
    }. Tổng điểm: ${danhGiaKPI.TongDiemKPI.toFixed(2)}`
  );
});
```

### **4. Controller: Lưu ChiTietDiem**

```javascript
// kpi.controller.js

exports.chamDiemNhiemVu = catchAsync(async (req, res, next) => {
  const { id } = req.params; // DanhGiaNhiemVuThuongQuy ID
  const { ChiTietDiem } = req.body;

  // 1. Tìm nhiệm vụ
  const nhiemVu = await DanhGiaNhiemVuThuongQuy.findById(id).populate(
    "DanhGiaKPIID"
  );

  if (!nhiemVu) {
    throw new AppError(404, "Không tìm thấy nhiệm vụ");
  }

  // 2. Kiểm tra đã duyệt chưa
  if (nhiemVu.DanhGiaKPIID.TrangThai === "DA_DUYET") {
    throw new AppError(400, "KPI đã được duyệt, không thể chỉnh sửa");
  }

  // 3. Validation ChiTietDiem
  if (!Array.isArray(ChiTietDiem) || ChiTietDiem.length === 0) {
    throw new AppError(400, "ChiTietDiem không hợp lệ");
  }

  ChiTietDiem.forEach((tc) => {
    if (tc.DiemDat < tc.GiaTriMin || tc.DiemDat > tc.GiaTriMax) {
      throw new AppError(
        400,
        `Điểm "${tc.TenTieuChi}" phải từ ${tc.GiaTriMin}-${tc.GiaTriMax}`
      );
    }
  });

  // 4. Lưu RAW DATA (không tính toán)
  nhiemVu.ChiTietDiem = ChiTietDiem;
  await nhiemVu.save();

  // ❌ KHÔNG update DanhGiaKPI.TongDiemKPI (vì chưa duyệt)

  // 5. Response
  return sendResponse(res, 200, true, nhiemVu, null, "Đã lưu điểm đánh giá");
});
```

### **5. API Routes**

```javascript
// kpi.api.js

const router = require("express").Router();
const kpiController = require("../controllers/kpi.controller");
const {
  loginRequired,
  roleRequired,
} = require("../middlewares/authentication");

// Danh sách KPI
router.get("/", loginRequired, kpiController.getDanhGiaKPIs);

// Tạo KPI mới
router.post(
  "/",
  loginRequired,
  roleRequired(2),
  kpiController.createDanhGiaKPI
);

// Chi tiết KPI
router.get("/:id", loginRequired, kpiController.getDanhGiaKPIDetail);

// Chấm điểm nhiệm vụ
router.put(
  "/danh-gia-nhiem-vu/:id/cham-diem",
  loginRequired,
  roleRequired(2),
  kpiController.chamDiemNhiemVu
);

// Duyệt KPI
router.post(
  "/:id/duyet",
  loginRequired,
  roleRequired(2),
  kpiController.duyetDanhGiaKPI
);

// Hủy duyệt KPI
router.post(
  "/:id/huy-duyet",
  loginRequired,
  roleRequired(3), // Chỉ Admin
  kpiController.huyDuyetDanhGiaKPI
);

module.exports = router;
```

---

## 📋 TESTING CHECKLIST

### **Phase 1: Gán nhiệm vụ**

- [ ] Manager tạo assignment với MucDoKho
- [ ] Check NhanVienNhiemVu.MucDoKho được lưu

### **Phase 2: Nhân viên tự chấm**

- [ ] NV chọn chu kỳ → Thấy danh sách nhiệm vụ
- [ ] NV nhập DiemTuDanhGia → Lưu thành công
- [ ] Check NhanVienNhiemVu.DiemTuDanhGia được update
- [ ] Check NgayTuCham được set

### **Phase 3: Manager chấm điểm**

- [ ] Manager tạo DanhGiaKPI cho NV
- [ ] Mở dialog → Load DiemTuDanhGia từ NhanVienNhiemVu
- [ ] Cột "Tự ĐG" hiển thị đúng (hoặc "--" nếu null)
- [ ] Cột "QL chấm" editable
- [ ] Nhập DiemDat → Lưu ChiTietDiem RAW
- [ ] Footer hiển thị "Tổng điểm dự kiến" (tính real-time)
- [ ] Số liệu preview khớp với công thức

### **Phase 4: Preview calculation**

- [ ] Frontend tính đúng công thức (×2 + ÷3) cho IsMucDoHoanThanh
- [ ] Các tiêu chí khác lấy trực tiếp DiemDat
- [ ] TongDiemTC = (diemTang - diemGiam)
- [ ] DiemNV = MucDoKho × TongDiemTC
- [ ] TongDiemKPI = SUM(DiemNV)

### **Phase 5: Duyệt KPI**

- [ ] Validation: Tất cả nhiệm vụ đã chấm điểm
- [ ] Backend gọi danhGiaKPI.duyet()
- [ ] Query DiemTuDanhGia từ NhanVienNhiemVu
- [ ] Tính TongDiemKPI chính thức
- [ ] Lưu vào DanhGiaKPI.TongDiemKPI
- [ ] TrangThai = "DA_DUYET"
- [ ] LichSuDuyet được ghi nhận

### **Phase 6: Sau khi duyệt**

- [ ] UI hiển thị "Tổng điểm KPI chính thức"
- [ ] Không tính toán lại (dùng snapshot)
- [ ] KHÔNG cho sửa ChiTietDiem
- [ ] KHÔNG cho NV sửa DiemTuDanhGia
- [ ] Nút "Hủy duyệt" chỉ hiển thị cho Admin

### **Edge Cases**

- [ ] NV chưa tự chấm → Cột "Tự ĐG" hiển thị "--"
- [ ] DiemTuDanhGia = null → Tính như 0 trong công thức
- [ ] Nhiều tiêu chí TANG_DIEM → TongDiemTC > 1.0 OK
- [ ] DiemNhiemVu > MucDoKho → OK (không giới hạn)
- [ ] Chu kỳ đóng → Không cho chấm điểm
- [ ] KPI đã duyệt → Reject mọi update

---

## 🔄 MIGRATION STEPS

### **1. Database Migration**

```javascript
// migrate-remove-calculated-fields.js

const mongoose = require("mongoose");
const DanhGiaNhiemVuThuongQuy = require("./models/DanhGiaNhiemVuThuongQuy");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Xóa TongDiemTieuChi, DiemNhiemVu khỏi tất cả documents
  const result = await DanhGiaNhiemVuThuongQuy.updateMany(
    {},
    {
      $unset: {
        TongDiemTieuChi: "",
        DiemNhiemVu: "",
      },
    }
  );

  console.log(`✅ Migrated ${result.modifiedCount} documents`);

  // Reset TongDiemKPI cho documents CHUA_DUYET
  const DanhGiaKPI = require("./models/DanhGiaKPI");
  const resetResult = await DanhGiaKPI.updateMany(
    { TrangThai: "CHUA_DUYET" },
    { $set: { TongDiemKPI: 0 } }
  );

  console.log(
    `✅ Reset TongDiemKPI for ${resetResult.modifiedCount} unap proved KPIs`
  );

  await mongoose.disconnect();
}

migrate();
```

### **2. Schema Update**

```javascript
// DanhGiaNhiemVuThuongQuy.js

// ❌ XÓA BỎ:
// TongDiemTieuChi: { type: Number, default: 0 },
// DiemNhiemVu: { type: Number, default: 0 },

// ❌ XÓA BỎ pre-save hook
// danhGiaNhiemVuThuongQuySchema.pre('save', function(next) { ... });

// ❌ XÓA BỎ post-save hook
// danhGiaNhiemVuThuongQuySchema.post('save', async function(doc) { ... });
```

### **3. Backend Code Updates**

- Xóa logic tính toán trong pre-save/post-save hooks
- Update method `duyet()` với công thức mới
- Remove references to `TongDiemTieuChi`, `DiemNhiemVu`

### **4. Frontend Code Updates**

- Tạo shared utility `calculateScore(nhiemVu, diemTuDanhGiaMap)`
- Update `ChamDiemKPITable` với layout 2 cột mới
- Thêm real-time preview calculation
- Remove dependencies on `TongDiemTieuChi`, `DiemNhiemVu` từ API response

---

# 3. BACKEND LOGIC - CÔNG THỨC TÍNH ĐIỂM

## 📐 CÔNG THỨC CHUẨN

### **Công thức DUY NHẤT cho toàn hệ thống:**

```javascript
// ✅ CÓ DUY NHẤT 1 tiêu chí IsMucDoHoanThanh = true
forEach ChiTietDiem as tc:
  if (tc.IsMucDoHoanThanh === true):
    // Công thức đặc biệt: Kết hợp điểm Manager × điểm NV
    DiemCuoiCung = (tc.DiemDat × 2 + DiemTuDanhGia) / 3
  else:
    // Tiêu chí khác: Lấy trực tiếp điểm Manager
    DiemCuoiCung = tc.DiemDat

  // Scale về 0-1
  if (tc.LoaiTieuChi === 'TANG_DIEM'):
    DiemTang += DiemCuoiCung / 100
  else:
    DiemGiam += DiemCuoiCung / 100

TongDiemTieuChi = DiemTang - DiemGiam
DiemNhiemVu = MucDoKho × TongDiemTieuChi
TongDiemKPI = SUM(DiemNhiemVu của tất cả nhiệm vụ)
```

### **Ý nghĩa công thức (DiemQL × 2 + DiemTuDanhGia) / 3:**

1. **Tỷ trọng:**
   - DiemQuanLy (Manager): **66.67%** (×2)
   - DiemTuDanhGia (NV): **33.33%** (×1)
2. **Ví dụ:**

   ```
   Manager chấm: 90%
   NV tự chấm: 85%

   → Điểm cuối cùng = (90×2 + 85)/3 = (180 + 85)/3 = 88.33%

   Giải thích:
   - Nếu chỉ lấy Manager: 90%
   - Nếu bình quân 50/50: (90+85)/2 = 87.5%
   - Công thức này: 88.33% (gần Manager hơn)
   ```

3. **Logic:**
   - Manager có quyền quyết định chính (2/3)
   - NV tự đánh giá ảnh hưởng 1/3
   - Tránh chênh lệch quá lớn giữa 2 bên

### **Tại sao CHỈ áp dụng cho tiêu chí "Mức độ hoàn thành"?**

- **"Mức độ hoàn thành"** là tiêu chí chủ quan nhất
  - NV biết chi tiết công việc mình làm
  - Manager có quan sát tổng quan
  - Kết hợp 2 góc nhìn → Công bằng hơn
- **Tiêu chí khác** (Chất lượng, Vi phạm, Sáng tạo...):
  - Manager có cái nhìn khách quan
  - Dựa trên evidence cụ thể
  - Không cần input từ NV

---

## 🔧 IMPLEMENTATION - BACKEND

### **1. Method duyet() - FULL CODE**

```javascript
// models/DanhGiaKPI.js

danhGiaKPISchema.methods.duyet = async function (nguoiDuyetId, nhanXet = "") {
  const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");
  const NhanVienNhiemVu = mongoose.model("NhanVienNhiemVu");

  // 1. Validate
  if (this.TrangThai === "DA_DUYET") {
    throw new Error("Đánh giá KPI đã được duyệt");
  }

  // 2. Load tất cả nhiệm vụ
  const nhiemVuList = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: this._id,
    isDeleted: false,
  }).populate("NhiemVuThuongQuyID");

  if (nhiemVuList.length === 0) {
    throw new Error("Không có nhiệm vụ nào để đánh giá");
  }

  // 3. Load DiemTuDanhGia từ NhanVienNhiemVu
  const assignments = await NhanVienNhiemVu.find({
    NhanVienID: this.NhanVienID,
    ChuKyDanhGiaID: this.ChuKyID,
    isDeleted: false,
  });

  const diemTuDanhGiaMap = {};
  assignments.forEach((a) => {
    const nvIdStr = a.NhiemVuThuongQuyID.toString();
    diemTuDanhGiaMap[nvIdStr] = a.DiemTuDanhGia || 0;
  });

  // 4. Tính TongDiemKPI theo công thức chuẩn
  let tongDiemKPI = 0;

  nhiemVuList.forEach((nv) => {
    const nvIdStr = nv.NhiemVuThuongQuyID._id.toString();
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0;
    let diemGiam = 0;

    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      // ✅ CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        const diemQuanLy = tc.DiemDat || 0;
        diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
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

    const tongDiemTieuChi = diemTang - diemGiam;
    const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;
    tongDiemKPI += diemNhiemVu;
  });

  // 5. Snapshot kết quả
  this.TongDiemKPI = tongDiemKPI;
  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();
  this.NguoiDuyet = nguoiDuyetId;
  this.NhanXetNguoiDanhGia = nhanXet || "";

  this.LichSuDuyet = this.LichSuDuyet || [];
  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI,
    GhiChu: nhanXet || `Duyệt KPI - Tổng điểm: ${this.TongDiemKPI.toFixed(2)}`,
  });

  await this.save();
  return this;
};
```

### **2. Shared Frontend Utility**

```javascript
// utils/kpiCalculation.js

/**
 * ✅ TÍNH ĐIỂM KPI - FRONTEND PREVIEW
 * Logic GIỐNG HỆT backend method duyet()
 */
export const calculateTotalScore = (nhiemVuList, diemTuDanhGiaMap) => {
  if (!nhiemVuList || nhiemVuList.length === 0) {
    return { tongDiem: 0, chiTiet: [] };
  }

  let tongDiemKPI = 0;
  const chiTiet = [];

  nhiemVuList.forEach((nv) => {
    const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
    const nvIdStr = nvId.toString();
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0;
    let diemGiam = 0;

    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      // ✅ CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        const diemQuanLy = tc.DiemDat || 0;
        diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
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

    const tongDiemTieuChi = diemTang - diemGiam;
    const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;
    tongDiemKPI += diemNhiemVu;

    chiTiet.push({
      tenNhiemVu: nv.NhiemVuThuongQuyID?.TenNhiemVu || "N/A",
      mucDoKho: nv.MucDoKho,
      diemTuDanhGia,
      diemTang,
      diemGiam,
      tongDiemTieuChi,
      diemNhiemVu,
    });
  });

  return { tongDiem: tongDiemKPI, chiTiet };
};
```

---

# 4. MIGRATION GUIDE

## 🗑️ BƯỚC 1: Database Migration

### **Script: Remove Calculated Fields**

```javascript
// scripts/migrate-remove-calculated-fields.js

const mongoose = require("mongoose");
require("dotenv").config();

async function migrateRemoveCalculatedFields() {
  console.log("🚀 Starting migration: Remove calculated fields...");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const DanhGiaNhiemVuThuongQuy = mongoose.model(
      "DanhGiaNhiemVuThuongQuy",
      new mongoose.Schema({}, { strict: false })
    );

    // 1. Đếm số documents
    const totalCount = await DanhGiaNhiemVuThuongQuy.countDocuments({
      $or: [
        { TongDiemTieuChi: { $exists: true } },
        { DiemNhiemVu: { $exists: true } },
      ],
    });

    console.log(`📊 Found ${totalCount} documents with calculated fields`);

    // 2. Xóa fields
    const result = await DanhGiaNhiemVuThuongQuy.updateMany(
      {},
      {
        $unset: {
          TongDiemTieuChi: "",
          DiemNhiemVu: "",
        },
      }
    );

    console.log(`✅ Removed from ${result.modifiedCount} documents`);

    // 3. Verify
    const remainingCount = await DanhGiaNhiemVuThuongQuy.countDocuments({
      $or: [
        { TongDiemTieuChi: { $exists: true } },
        { DiemNhiemVu: { $exists: true } },
      ],
    });

    console.log(
      remainingCount === 0
        ? "✅ All calculated fields removed"
        : `⚠️ ${remainingCount} documents still have fields`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

migrateRemoveCalculatedFields()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
```

**Chạy migration:**

```bash
cd giaobanbv-be
node scripts/migrate-remove-calculated-fields.js
```

---

## 🔄 BƯỚC 2: Reset TongDiemKPI (Unapproved)

```javascript
// scripts/migrate-reset-tongdiemkpi.js

async function resetTongDiemKPI() {
  await mongoose.connect(process.env.MONGODB_URI);

  const DanhGiaKPI = mongoose.model(
    "DanhGiaKPI",
    new mongoose.Schema({}, { strict: false })
  );

  // Reset về 0 cho CHUA_DUYET
  const result = await DanhGiaKPI.updateMany(
    { TrangThai: "CHUA_DUYET" },
    { $set: { TongDiemKPI: 0 } }
  );

  console.log(`✅ Reset ${result.modifiedCount} unapproved KPIs`);

  // Giữ nguyên snapshot cho DA_DUYET
  const approvedCount = await DanhGiaKPI.countDocuments({
    TrangThai: "DA_DUYET",
    TongDiemKPI: { $gt: 0 },
  });

  console.log(`✅ Kept ${approvedCount} approved KPIs`);

  await mongoose.disconnect();
}
```

---

## 🛠️ BƯỚC 3: Update Backend Models

### **DanhGiaNhiemVuThuongQuy.js**

```diff
const danhGiaNhiemVuThuongQuySchema = new Schema({
  // ... existing fields ...

- TongDiemTieuChi: { type: Number, default: 0 },  // ❌ XÓA
- DiemNhiemVu: { type: Number, default: 0 },      // ❌ XÓA

  // ... other fields ...
});

- // ❌ XÓA BỎ pre-save hook
- danhGiaNhiemVuThuongQuySchema.pre('save', function(next) { ... });

- // ❌ XÓA BỎ post-save hook
- danhGiaNhiemVuThuongQuySchema.post('save', async function(doc) { ... });
```

### **DanhGiaKPI.js**

```diff
+ // ✅ THÊM method duyet()
+ danhGiaKPISchema.methods.duyet = async function(nguoiDuyetId, nhanXet) {
+   // (Xem code ở section 3)
+ };

+ // ✅ THÊM method huyDuyet()
+ danhGiaKPISchema.methods.huyDuyet = async function(nguoiHuyId, lyDo) {
+   // Reset về CHUA_DUYET
+ };
```

---

## 📱 BƯỚC 4: Update Frontend

### **4.1 Tạo Utility**

```bash
cd fe-bcgiaobanbvt/src
mkdir -p utils
touch utils/kpiCalculation.js
```

Copy code từ Section 3.

### **4.2 Update Components**

```javascript
// ChamDiemKPIDialog.js

import { calculateTotalScore } from "utils/kpiCalculation";

// Load DiemTuDanhGia
const [diemTuDanhGiaMap, setDiemTuDanhGiaMap] = useState({});

// Real-time calculation
const scorePreview = useMemo(() => {
  return calculateTotalScore(currentNhiemVuList, diemTuDanhGiaMap);
}, [currentNhiemVuList, diemTuDanhGiaMap]);

// Hiển thị
{
  isApproved
    ? currentDanhGiaKPI.TongDiemKPI.toFixed(2) // Snapshot
    : scorePreview.tongDiem.toFixed(2); // Preview
}
```

---

## ✅ BƯỚC 5: Testing

### **Backend Tests**

```bash
# 1. Chạy migrations
npm run migrate:remove-calculated-fields
npm run migrate:reset-tongdiemkpi

# 2. Test API
# Tạo → Chấm điểm → Duyệt → Verify TongDiemKPI
```

### **Frontend Tests**

- [ ] Load DiemTuDanhGia đúng
- [ ] Preview calculation real-time
- [ ] Snapshot hiển thị khi approved
- [ ] Disable edit khi approved

---

## 🎉 KẾT QUẢ

**✅ HOÀN THIỆN 100% - SIMPLIFIED & CLEAN**

### **Nhân viên (Tự đánh giá):**

- ✅ Chọn chu kỳ → Xem nhiệm vụ
- ✅ Tự chấm DiemTuDanhGia (0-100%)
- ✅ Batch save với 1 toast
- ✅ Slider step = 1
- ✅ Progress tracking
- ✅ Modern UX

### **Manager (Quản lý chấm điểm):**

- ✅ Tạo DanhGiaKPI cho nhân viên
- ✅ Chấm điểm tất cả tiêu chí
- ✅ Xem DiemTuDanhGia của NV (read-only)
- ✅ Preview tổng điểm real-time
- ✅ Duyệt → Snapshot TongDiemKPI
- ✅ Single source of truth
- ✅ No redundant data

### **Backend:**

- ✅ Clean data model (chỉ raw data)
- ✅ Công thức tính điểm DUY NHẤT
- ✅ No pre-save/post-save hooks
- ✅ Method duyet() chính thức
- ✅ Easy to maintain

### **Benefits:**

1. **Single Source of Truth** - Không redundancy
2. **Always Correct** - Frontend tính real-time, backend snapshot
3. **Easy to Maintain** - 1 công thức duy nhất
4. **Flexible** - Dễ thay đổi công thức sau này
5. **Clean Separation** - NV tự chấm ≠ Manager chấm
6. **Performance** - useMemo tối ưu rendering

**Hệ thống KPI hoàn chỉnh, đơn giản và dễ bảo trì!** 🚀

---

# 5. ⚠️ CRITICAL: ẢNH HƯỞNG ĐẾN LOGIC HIỆN TẠI

## 🔍 PHÂN TÍCH CODE HIỆN TẠI

### **1. Logic Duyệt KPI (controller.duyetKPITieuChi)**

**❌ VẤN ĐỀ NGHIÊM TRỌNG:**

```javascript
// ❌ CODE HIỆN TẠI (Line 1633-1636 - kpi.controller.js)
const savedEvaluations = await DanhGiaNhiemVuThuongQuy.find({
  DanhGiaKPIID: danhGiaKPI._id,
  isDeleted: false,
});

const tongDiemKPI = savedEvaluations.reduce(
  (sum, ev) => sum + (ev.DiemNhiemVu || 0), // ← DÙNG DiemNhiemVu (calculated field)
  0
);

danhGiaKPI.TongDiemKPI = tongDiemKPI;
await danhGiaKPI.duyet(undefined, req.user.NhanVienID);
```

**⚠️ HẬU QUẢ NẾU XÓA DiemNhiemVu:**

- Controller sẽ BỊ VỠ ngay lập tức
- `ev.DiemNhiemVu` sẽ trả về `undefined` hoặc `0`
- TongDiemKPI luôn = 0 sau khi duyệt
- Lịch sử duyệt lưu điểm sai (TongDiemLucDuyet = 0)

---

### **2. Method tinhTongDiemKPI() (DanhGiaKPI.js)**

**❌ CODE HIỆN TẠI (Line 149-158):**

```javascript
danhGiaKPISchema.methods.tinhTongDiemKPI = async function () {
  const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");

  const danhGiaNhiemVu = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: this._id,
    isDeleted: false,
  });

  this.TongDiemKPI = danhGiaNhiemVu.reduce(
    (sum, item) => sum + (item.DiemNhiemVu || 0), // ← DÙNG DiemNhiemVu
    0
  );

  await this.save();
  return this.TongDiemKPI;
};
```

**⚠️ HẬU QUẢ:**

- Method này sẽ HOÀN TOÀN VÔ DỤNG
- Cần XÓA BỎ hoặc REFACTOR hoàn toàn

---

### **3. Method duyet() (DanhGiaKPI.js)**

**✅ CODE HIỆN TẠI (Line 164-180) - KHÔNG VẤN ĐỀ:**

```javascript
danhGiaKPISchema.methods.duyet = async function (nhanXet, nguoiDuyetId) {
  if (this.TrangThai === "DA_DUYET") {
    throw new Error("Đánh giá KPI đã được duyệt");
  }

  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();
  if (nguoiDuyetId) {
    this.NguoiDuyet = nguoiDuyetId;
  }
  if (nhanXet) {
    this.NhanXetNguoiDanhGia = nhanXet;
  }

  // ✅ Ghi lịch sử duyệt
  this.LichSuDuyet = this.LichSuDuyet || [];
  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId || this.NguoiDuyet || undefined,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI || 0, // ← Snapshot (OK)
    GhiChu: nhanXet || undefined,
  });

  await this.save();
  return this;
};
```

**📝 NHẬN XÉT:**

- Method này KHÔNG tính TongDiemKPI
- Chỉ ghi lịch sử với giá trị `this.TongDiemKPI` hiện tại
- **YÊU CẦU:** Controller phải tính TongDiemKPI TRƯỚC KHI gọi method này
- **GIẢI PHÁP:** Có 2 options:
  - **Option A:** Giữ nguyên, tính ở controller (đơn giản hơn)
  - **Option B:** Di chuyển logic tính điểm vào method này (encapsulation tốt hơn)

---

### **4. Method huyDuyet() (DanhGiaKPI.js)**

**❌ CODE HIỆN TẠI (Line 182-189) - THIẾU LOGIC:**

```javascript
danhGiaKPISchema.methods.huyDuyet = async function () {
  this.TrangThai = "CHUA_DUYET";
  this.NgayDuyet = null;
  this.NguoiDuyet = null;

  await this.save();
  return this;
};
```

**⚠️ VẤN ĐỀ:**

- KHÔNG có LichSuHuyDuyet
- KHÔNG reset TongDiemKPI
- KHÔNG save lý do hủy duyệt
- KHÔNG lưu DiemTruocKhiHuy, NgayDuyetTruocDo

**✅ NHƯNG CONTROLLER CÓ LOGIC ĐẦY ĐỦ (Line 1974-2000):**

```javascript
// ✅ Controller có logic tốt hơn
const historyEntry = {
  NguoiHuyDuyet: currentUser.NhanVienID || currentUser._id,
  NgayHuyDuyet: new Date(),
  LyDoHuyDuyet: lyDo.trim(),
  DiemTruocKhiHuy: danhGiaKPI.TongDiemKPI, // ← Snapshot
  NgayDuyetTruocDo: danhGiaKPI.NgayDuyet,
};

danhGiaKPI.TrangThai = "CHUA_DUYET";
danhGiaKPI.NgayDuyet = null;
danhGiaKPI.NguoiDuyet = null;
danhGiaKPI.LichSuHuyDuyet = danhGiaKPI.LichSuHuyDuyet || [];
danhGiaKPI.LichSuHuyDuyet.push(historyEntry);

await danhGiaKPI.save();
```

**📝 GIẢI PHÁP:**

- Merge logic từ controller vào method
- Controller chỉ cần validate permission

---

## 🛠️ GIẢI PHÁP CHI TIẾT

### **GIẢI PHÁP 1: Refactor Controller (duyetKPITieuChi) - CRITICAL**

**❌ XÓA BỎ:**

```javascript
// ❌ LOGIC CŨ - DELETE
const tongDiemKPI = savedEvaluations.reduce(
  (sum, ev) => sum + (ev.DiemNhiemVu || 0),
  0
);
```

**✅ THAY BẰNG:**

```javascript
// ✅ LOGIC MỚI - V2 Formula
// Step 1: Load DiemTuDanhGia từ NhanVienNhiemVu
const assignments = await NhanVienNhiemVu.find({
  NhanVienID: danhGiaKPI.NhanVienID,
  ChuKyDanhGiaID: danhGiaKPI.ChuKyID,
  isDeleted: false,
});

const diemTuDanhGiaMap = {};
assignments.forEach((a) => {
  const nvIdStr = a.NhiemVuThuongQuyID.toString();
  diemTuDanhGiaMap[nvIdStr] = a.DiemTuDanhGia || 0;
});

// Step 2: Tính TongDiemKPI theo công thức chuẩn
let tongDiemKPI = 0;

savedEvaluations.forEach((nv) => {
  const nvIdStr = nv.NhiemVuThuongQuyID.toString();
  const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

  let diemTang = 0;
  let diemGiam = 0;

  nv.ChiTietDiem.forEach((tc) => {
    let diemCuoiCung = 0;

    // ✅ CÔNG THỨC DUY NHẤT
    if (tc.IsMucDoHoanThanh) {
      // Tiêu chí "Mức độ hoàn thành"
      const diemQuanLy = tc.DiemDat || 0;
      diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
    } else {
      // Tiêu chí khác
      diemCuoiCung = tc.DiemDat || 0;
    }

    // Scale về 0-1
    const diemScaled = diemCuoiCung / 100;

    // Phân loại tăng/giảm
    if (tc.LoaiTieuChi === "TANG_DIEM") {
      diemTang += diemScaled;
    } else {
      diemGiam += diemScaled;
    }
  });

  // TongDiemTieuChi = DiemTang - DiemGiam
  const tongDiemTieuChi = diemTang - diemGiam;

  // DiemNhiemVu = MucDoKho × TongDiemTieuChi
  const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;

  // Cộng dồn
  tongDiemKPI += diemNhiemVu;
});

// Step 3: Snapshot TongDiemKPI
danhGiaKPI.TongDiemKPI = tongDiemKPI;
await danhGiaKPI.duyet(undefined, req.user.NhanVienID || req.user._id);
```

**📍 VỊ TRÍ THAY ĐỔI:**

- File: `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`
- Line: 1620-1640 (trong method `duyetKPITieuChi`)

---

### **GIẢI PHÁP 2: Xóa Method tinhTongDiemKPI() - DEPRECATED**

**❌ XÓA BỎ TOÀN BỘ:**

```diff
// models/DanhGiaKPI.js

- // ❌ XÓA BỎ METHOD NÀY
- danhGiaKPISchema.methods.tinhTongDiemKPI = async function () {
-   const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");
-
-   const danhGiaNhiemVu = await DanhGiaNhiemVuThuongQuy.find({
-     DanhGiaKPIID: this._id,
-     isDeleted: false,
-   });
-
-   this.TongDiemKPI = danhGiaNhiemVu.reduce(
-     (sum, item) => sum + (item.DiemNhiemVu || 0),
-     0
-   );
-
-   await this.save();
-   return this.TongDiemKPI;
- };
```

**📝 LÝ DO:**

- Method dựa vào `DiemNhiemVu` (calculated field)
- Sau khi xóa DiemNhiemVu, method này vô dụng
- TongDiemKPI chỉ tính 1 lần khi duyệt (không cần recalculate)

---

### **GIẢI PHÁP 3: Update Method huyDuyet() - ENHANCEMENT**

**✅ REFACTOR HOÀN TOÀN:**

```javascript
// models/DanhGiaKPI.js

/**
 * ✅ NEW: Hủy duyệt KPI với audit trail đầy đủ
 * @param {ObjectId} nguoiHuyId - ID người hủy duyệt
 * @param {String} lyDo - Lý do hủy duyệt (required)
 */
danhGiaKPISchema.methods.huyDuyet = async function (nguoiHuyId, lyDo) {
  // Validate
  if (this.TrangThai !== "DA_DUYET") {
    throw new Error("KPI chưa được duyệt, không thể hủy duyệt");
  }

  if (!lyDo || lyDo.trim().length === 0) {
    throw new Error("Vui lòng nhập lý do hủy duyệt");
  }

  // Lưu lịch sử hủy duyệt
  this.LichSuHuyDuyet = this.LichSuHuyDuyet || [];
  this.LichSuHuyDuyet.push({
    NguoiHuyDuyet: nguoiHuyId,
    NgayHuyDuyet: new Date(),
    LyDoHuyDuyet: lyDo.trim(),
    DiemTruocKhiHuy: this.TongDiemKPI, // ← Snapshot điểm cũ
    NgayDuyetTruocDo: this.NgayDuyet, // ← Snapshot ngày duyệt cũ
  });

  // Reset về CHUA_DUYET
  this.TrangThai = "CHUA_DUYET";
  this.TongDiemKPI = 0; // ← Reset về 0 (quan trọng!)
  this.NgayDuyet = null;
  this.NguoiDuyet = null;

  await this.save();
  return this;
};
```

**📍 VỊ TRÍ THAY ĐỔI:**

- File: `giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`
- Line: 182-189 (thay thế method cũ)

**✅ CONTROLLER SIMPLIFY:**

```diff
// controllers/kpi.controller.js - method huyDuyetKPI

  // ... permission check logic ...

- // ❌ XÓA BỎ logic manual update
- danhGiaKPI.TrangThai = "CHUA_DUYET";
- danhGiaKPI.NgayDuyet = null;
- danhGiaKPI.NguoiDuyet = null;
- danhGiaKPI.LichSuHuyDuyet = danhGiaKPI.LichSuHuyDuyet || [];
- danhGiaKPI.LichSuHuyDuyet.push(historyEntry);
- await danhGiaKPI.save();

+ // ✅ GỌI METHOD (encapsulation)
+ await danhGiaKPI.huyDuyet(
+   currentUser.NhanVienID || currentUser._id,
+   lyDo
+ );
```

---

### **GIẢI PHÁP 4: Update Method duyet() - OPTION B (Recommended)**

**Nếu muốn encapsulation tốt hơn, di chuyển TOÀN BỘ logic tính điểm vào method:**

```javascript
// models/DanhGiaKPI.js

/**
 * ✅ OPTION B: Method duyet() TỰ TÍNH TongDiemKPI
 */
danhGiaKPISchema.methods.duyet = async function (nhanXet, nguoiDuyetId) {
  const NhanVienNhiemVu = mongoose.model("NhanVienNhiemVu");
  const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");

  // 1. Validate
  if (this.TrangThai === "DA_DUYET") {
    throw new Error("Đánh giá KPI đã được duyệt");
  }

  // 2. Load DiemTuDanhGia
  const assignments = await NhanVienNhiemVu.find({
    NhanVienID: this.NhanVienID,
    ChuKyDanhGiaID: this.ChuKyID,
    isDeleted: false,
  });

  const diemTuDanhGiaMap = {};
  assignments.forEach((a) => {
    const nvIdStr = a.NhiemVuThuongQuyID.toString();
    diemTuDanhGiaMap[nvIdStr] = a.DiemTuDanhGia || 0;
  });

  // 3. Load evaluations
  const evaluations = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: this._id,
    isDeleted: false,
  });

  if (evaluations.length === 0) {
    throw new Error("Không có nhiệm vụ nào để đánh giá");
  }

  // 4. Tính TongDiemKPI
  let tongDiemKPI = 0;

  evaluations.forEach((nv) => {
    const nvIdStr = nv.NhiemVuThuongQuyID.toString();
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0;
    let diemGiam = 0;

    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      if (tc.IsMucDoHoanThanh) {
        const diemQuanLy = tc.DiemDat || 0;
        diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
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

    const tongDiemTieuChi = diemTang - diemGiam;
    const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;
    tongDiemKPI += diemNhiemVu;
  });

  // 5. Snapshot TongDiemKPI
  this.TongDiemKPI = tongDiemKPI;
  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();

  if (nguoiDuyetId) {
    this.NguoiDuyet = nguoiDuyetId;
  }

  if (nhanXet) {
    this.NhanXetNguoiDanhGia = nhanXet;
  }

  // 6. Ghi lịch sử duyệt
  this.LichSuDuyet = this.LichSuDuyet || [];
  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId || this.NguoiDuyet || undefined,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI, // ← Snapshot chính thức
    GhiChu: nhanXet || undefined,
  });

  await this.save();
  return this;
};
```

**✅ CONTROLLER SIMPLIFY (Nếu dùng Option B):**

```diff
// controllers/kpi.controller.js - method duyetKPITieuChi

  await Promise.all(upsertPromises);

- // ❌ XÓA BỎ logic tính điểm ở controller
- const savedEvaluations = await DanhGiaNhiemVuThuongQuy.find({...});
- const diemTuDanhGiaMap = {};
- let tongDiemKPI = 0;
- // ... tính toán phức tạp ...
- danhGiaKPI.TongDiemKPI = tongDiemKPI;

  // ✅ CHỈ CẦN GỌI METHOD
  await danhGiaKPI.duyet(undefined, req.user.NhanVienID || req.user._id);
```

---

## 📊 SO SÁNH OPTION A vs OPTION B

| Aspect               | OPTION A (Tính ở Controller)           | OPTION B (Tính ở Method)              |
| -------------------- | -------------------------------------- | ------------------------------------- |
| **Encapsulation**    | ❌ Kém (logic rò rỉ ra controller)     | ✅ Tốt (logic trong model)            |
| **Testability**      | ❌ Khó test (phụ thuộc controller)     | ✅ Dễ test (unit test method)         |
| **Reusability**      | ❌ Không reuse (chỉ 1 controller dùng) | ✅ Reuse (bất kỳ nơi nào gọi duyet()) |
| **Complexity**       | ⚠️ Trung bình (controller phức tạp)    | ✅ Đơn giản (controller gọn)          |
| **Migration Effort** | ✅ Ít (chỉ sửa controller)             | ⚠️ Nhiều hơn (sửa model + controller) |
| **Consistency**      | ❌ Risk (có thể có logic khác nhau)    | ✅ Single source (1 logic duy nhất)   |
| **Performance**      | ✅ Ngang nhau                          | ✅ Ngang nhau                         |

**🎯 KHUYẾN NGHỊ: OPTION B (Tính ở Method)**

**Lý do:**

- Single Responsibility Principle: Model chịu trách nhiệm tính điểm
- DRY: Nếu có controller khác cần duyệt KPI, không phải copy logic
- Testing: Dễ viết unit test cho method `duyet()`
- Maintainability: Chỉ có 1 nơi cần sửa khi thay đổi công thức

---

## ✅ TESTING CHECKLIST - BACKWARD COMPATIBILITY

### **Test 1: KPI đã duyệt trước khi migrate**

```javascript
// Scenario: KPI approved trước khi xóa DiemNhiemVu
{
  _id: "old-kpi-1",
  TrangThai: "DA_DUYET",
  TongDiemKPI: 23.45,  // ← Snapshot cũ
  LichSuDuyet: [
    {
      TongDiemLucDuyet: 23.45,  // ← Snapshot cũ
      NgayDuyet: "2025-01-15"
    }
  ]
}

// ✅ EXPECTED: Không bị ảnh hưởng
// - TongDiemKPI vẫn = 23.45 (snapshot)
// - LichSuDuyet vẫn nguyên
// - Hiển thị bình thường
```

### **Test 2: KPI chưa duyệt trước khi migrate**

```javascript
// Scenario: KPI CHUA_DUYET trước khi xóa DiemNhiemVu
{
  _id: "old-kpi-2",
  TrangThai: "CHUA_DUYET",
  TongDiemKPI: 0  // ← Sẽ được reset về 0 (migration)
}

// ✅ EXPECTED: Migration reset về 0
// - TongDiemKPI = 0
// - Khi duyệt: Tính lại bằng công thức mới
// - Kết quả có thể khác nếu có DiemTuDanhGia
```

### **Test 3: Duyệt KPI mới sau migrate**

```javascript
// Scenario: Duyệt KPI lần đầu sau khi deploy code mới

// Given:
// - NhanVienNhiemVu có DiemTuDanhGia = 85
// - DanhGiaNhiemVuThuongQuy có ChiTietDiem[0].DiemDat = 90 (Manager)

// When: Click "Duyệt KPI"

// Then:
// 1. Controller tính TongDiemKPI:
//    - Load DiemTuDanhGia = 85
//    - Tính: (90×2 + 85)/3 = 88.33
//    - Scale: 88.33/100 = 0.8833
//    - DiemNhiemVu = MucDoKho × 0.8833
//    - TongDiemKPI = sum(DiemNhiemVu)
//
// 2. Method duyet() snapshot:
//    - TrangThai = "DA_DUYET"
//    - TongDiemKPI = calculated value
//    - LichSuDuyet.TongDiemLucDuyet = calculated value
//
// 3. Verify:
//    - Frontend hiển thị TongDiemKPI chính xác
//    - So với preview phải giống nhau
```

### **Test 4: Hủy duyệt KPI**

```javascript
// Scenario: Admin hủy duyệt KPI đã approve

// Given:
// - KPI DA_DUYET với TongDiemKPI = 23.45

// When: Click "Hủy duyệt" với lý do "Sai điểm"

// Then:
// 1. LichSuHuyDuyet được ghi:
//    - DiemTruocKhiHuy = 23.45
//    - NgayDuyetTruocDo = "2025-01-20"
//    - LyDoHuyDuyet = "Sai điểm"
//
// 2. Reset state:
//    - TrangThai = "CHUA_DUYET"
//    - TongDiemKPI = 0
//    - NgayDuyet = null
//    - NguoiDuyet = null
//
// 3. Verify:
//    - Có thể sửa ChiTietDiem
//    - Có thể duyệt lại
//    - LichSuHuyDuyet hiển thị đầy đủ
```

### **Test 5: Duyệt lại sau khi hủy**

```javascript
// Scenario: Duyệt lại KPI sau khi hủy duyệt

// Given:
// - KPI đã hủy duyệt (TongDiemKPI = 0)
// - Manager sửa ChiTietDiem (DiemDat mới)

// When: Click "Duyệt KPI" lần 2

// Then:
// 1. TongDiemKPI tính lại hoàn toàn:
//    - Dùng DiemDat MỚI
//    - Dùng DiemTuDanhGia (không đổi)
//    - Kết quả có thể khác lần duyệt trước
//
// 2. LichSuDuyet có 2 entries:
//    - Entry 1: TongDiemLucDuyet = 23.45 (cũ)
//    - Entry 2: TongDiemLucDuyet = 25.80 (mới)
//
// 3. LichSuHuyDuyet vẫn giữ nguyên
```

---

## 🚨 MIGRATION STEPS - UPDATED

### **BƯỚC 3B: Update Controllers (CRITICAL)**

```bash
# File: giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js
```

**Thay đổi trong method `duyetKPITieuChi` (Line 1620-1650):**

```diff
  await Promise.all(upsertPromises);

- // ❌ OLD: Tính từ DiemNhiemVu (calculated field)
- const savedEvaluations = await DanhGiaNhiemVuThuongQuy.find({
-   DanhGiaKPIID: danhGiaKPI._id,
-   isDeleted: false,
- });
-
- const tongDiemKPI = savedEvaluations.reduce(
-   (sum, ev) => sum + (ev.DiemNhiemVu || 0),
-   0
- );
-
- danhGiaKPI.TongDiemKPI = tongDiemKPI;
- await danhGiaKPI.duyet(undefined, req.user.NhanVienID || req.user._id);

+ // ✅ NEW: Tính theo công thức chuẩn V2
+ // (Copy code từ GIẢI PHÁP 1 ở trên)
+ // Hoặc nếu dùng OPTION B: Chỉ cần gọi method duyet()
+ await danhGiaKPI.duyet(undefined, req.user.NhanVienID || req.user._id);
```

### **BƯỚC 3C: Update Models (CRITICAL)**

```bash
# File: giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js
```

**1. Xóa method tinhTongDiemKPI() (Line 149-158):**

```diff
- danhGiaKPISchema.methods.tinhTongDiemKPI = async function () {
-   // ... toàn bộ code ...
- };
```

**2. Update method duyet() (Line 164-180):**

Nếu dùng **OPTION B**, thay thế toàn bộ bằng code trong GIẢI PHÁP 4.

**3. Update method huyDuyet() (Line 182-189):**

Thay thế bằng code trong GIẢI PHÁP 3.

---

## 📝 SUMMARY - CRITICAL CHANGES

### **Files cần sửa:**

1. ✅ **kpi.controller.js** (CRITICAL):

   - Method `duyetKPITieuChi`: Refactor logic tính TongDiemKPI
   - Method `huyDuyetKPI`: Simplify (chỉ gọi model method)

2. ✅ **DanhGiaKPI.js** (CRITICAL):

   - ❌ DELETE: Method `tinhTongDiemKPI()`
   - ✅ UPDATE: Method `duyet()` (nếu dùng Option B)
   - ✅ ENHANCE: Method `huyDuyet()` (thêm audit trail)

3. ✅ **DanhGiaNhiemVuThuongQuy.js**:
   - ❌ DELETE: Fields `TongDiemTieuChi`, `DiemNhiemVu`
   - ❌ DELETE: Pre-save hooks
   - ❌ DELETE: Post-save hooks

### **Impact Assessment:**

| Feature                    | Before Migration     | After Migration          | Risk Level |
| -------------------------- | -------------------- | ------------------------ | ---------- |
| **Duyệt KPI**              | ❌ Dùng DiemNhiemVu  | ✅ Tính từ ChiTietDiem   | 🔴 HIGH    |
| **Hủy duyệt KPI**          | ⚠️ Thiếu audit trail | ✅ Đầy đủ LichSuHuyDuyet | 🟡 MEDIUM  |
| **TongDiemKPI (approved)** | ✅ Snapshot (OK)     | ✅ Snapshot (OK)         | 🟢 LOW     |
| **LichSuDuyet**            | ✅ OK                | ✅ OK                    | 🟢 LOW     |
| **Frontend preview**       | ⚠️ Không có          | ✅ Real-time calculation | 🟡 MEDIUM  |

### **Testing Priority:**

1. 🔴 **CRITICAL**: Duyệt KPI lần đầu → Verify TongDiemKPI chính xác
2. 🔴 **CRITICAL**: Hủy duyệt → Verify LichSuHuyDuyet đầy đủ
3. 🟡 **HIGH**: Duyệt lại sau hủy → Verify recalculation
4. 🟡 **HIGH**: KPI đã duyệt cũ → Verify backward compatibility
5. 🟢 **MEDIUM**: Frontend preview → Verify formula khớp backend

**⚠️ KHÔNG THỂ DEPLOY mà không fix controller.duyetKPITieuChi!**
