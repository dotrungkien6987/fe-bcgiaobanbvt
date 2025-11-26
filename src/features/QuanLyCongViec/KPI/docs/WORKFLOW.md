# Luồng Nghiệp vụ KPI - Chi tiết

**Version:** 2.1  
**Last Updated:** 26/11/2025

---

## 📋 Tổng quan Workflow

Hệ thống KPI có 6 giai đoạn chính:

```
1. CHUẨN BỊ CHU KỲ → 2. GÁN NHIỆM VỤ → 3. TỰ ĐÁNH GIÁ → 4. CHẤM ĐIỂM → 5. DUYỆT → 6. BÁO CÁO
```

---

## 🔄 Giai đoạn 1: Chuẩn bị Chu kỳ

**Actor:** Admin / Đào tạo

### Bước 1.1: Tạo Chu kỳ đánh giá

**UI:** `ChuKyDanhGia` module → Tạo mới

**Input:**

```javascript
{
  TenChuKy: "Quý 4/2025",
  LoaiChuKy: "QUY",
  NgayBatDau: "2025-10-01",
  NgayKetThuc: "2025-12-31",
  TrangThai: "CHO_BAT_DAU"
}
```

**API:** `POST /api/workmanagement/chu-ky-danh-gia`

**Database:**

```javascript
ChuKyDanhGia.create({
  TenChuKy: "Quý 4/2025",
  LoaiChuKy: "QUY",
  NgayBatDau: ISODate("2025-10-01"),
  NgayKetThuc: ISODate("2025-12-31"),
  TrangThai: "CHO_BAT_DAU",
  TieuChiCauHinh: [], // Chưa có tiêu chí
});
```

---

### Bước 1.2: Cấu hình Tiêu chí đánh giá

**UI:** Chỉnh sửa Chu kỳ → Tab "Tiêu chí"

**Actions:**

- Thêm tiêu chí mới
- Đánh dấu tiêu chí "Mức độ hoàn thành" (cho phép tự đánh giá)
- Sắp xếp thứ tự
- Lưu cấu hình

**Example Input:**

```javascript
TieuChiCauHinh: [
  {
    TenTieuChi: "Mức độ hoàn thành công việc",
    LoaiTieuChi: "TANG_DIEM",
    IsMucDoHoanThanh: true, // ← Cho phép tự đánh giá
    GiaTriMin: 0,
    GiaTriMax: 100,
    DonVi: "%",
    ThuTu: 0,
  },
  {
    TenTieuChi: "Điểm tích cực (sáng kiến, hỗ trợ đồng nghiệp)",
    LoaiTieuChi: "TANG_DIEM",
    IsMucDoHoanThanh: false,
    GiaTriMin: 0,
    GiaTriMax: 10,
    DonVi: "điểm",
    ThuTu: 1,
  },
  {
    TenTieuChi: "Điểm trừ (vi phạm, chậm deadline)",
    LoaiTieuChi: "GIAM_DIEM",
    IsMucDoHoanThanh: false,
    GiaTriMin: 0,
    GiaTriMax: 10,
    DonVi: "điểm",
    ThuTu: 2,
  },
];
```

**API:** `PUT /api/workmanagement/chu-ky-danh-gia/:id`

---

### Bước 1.3: Mở Chu kỳ

**UI:** Button "Mở chu kỳ"

**Action:**

- Kiểm tra: Đã cấu hình tiêu chí chưa
- Kiểm tra: Ngày bắt đầu <= today <= ngày kết thúc
- Update: `TrangThai = "DANG_DIEN_RA"`

**API:** `PUT /api/workmanagement/chu-ky-danh-gia/:id/mo`

**Notification:**

- Gửi email/thông báo cho Manager: "Chu kỳ Q4/2025 đã mở, vui lòng gán nhiệm vụ"
- Gửi nhân viên: "Chu kỳ đánh giá mới đã bắt đầu"

---

## 🎯 Giai đoạn 2: Gán Nhiệm vụ

**Actor:** Manager

### Bước 2.1: Chọn Nhân viên & Chu kỳ

**UI:** `GiaoNhiemVu` module → Tab "Gán theo chu kỳ"

**Flow:**

1. Chọn chu kỳ (dropdown) → Load danh sách nhân viên được quản lý
2. Chọn nhân viên → Load danh sách nhiệm vụ thường quy

---

### Bước 2.2: Gán Nhiệm vụ với Độ khó thực tế

**UI:** Dialog gán nhiệm vụ

**Input:**

```javascript
{
  NhanVienID: "66b1dba74f79822a4752d90d",
  NhiemVuThuongQuyID: "66b0ea404f79822a4752d8f9",
  ChuKyDanhGiaID: "67895b9a6f7b8c2d4e3f1a0b",
  MucDoKho: 7.5,  // User nhập (1.0 - 10.0)
  NguoiGanID: "currentManagerId"
}
```

**API:** `POST /api/workmanagement/giao-nhiem-vu`

**Database:**

```javascript
NhanVienNhiemVu.create({
  NhanVienID: ObjectId("..."),
  NhiemVuThuongQuyID: ObjectId("..."),
  ChuKyDanhGiaID: ObjectId("..."),
  MucDoKho: 7.5,
  DiemTuDanhGia: null, // Chưa tự chấm
  NgayTuCham: null,
  NgayGan: new Date(),
});
```

---

### Bước 2.3: Gán hàng loạt (Batch)

**UI:** Button "Gán hàng loạt"

**Flow:**

1. Chọn nhiều nhân viên
2. Chọn nhiều nhiệm vụ
3. Nhập độ khó mặc định (có thể điều chỉnh sau)
4. Xác nhận → Gọi API batch

**API:** `POST /api/workmanagement/giao-nhiem-vu/batch`

**Body:**

```javascript
{
  ChuKyDanhGiaID: "...",
  assignments: [
    { NhanVienID: "...", NhiemVuThuongQuyID: "...", MucDoKho: 5 },
    { NhanVienID: "...", NhiemVuThuongQuyID: "...", MucDoKho: 6 },
    // ...
  ]
}
```

---

### Bước 2.4: Sao chép từ chu kỳ trước (Optional)

**UI:** Button "Sao chép từ chu kỳ trước"

**Flow:**

1. Chọn chu kỳ nguồn (Quý 3/2025)
2. Chọn chu kỳ đích (Quý 4/2025)
3. Chọn nhân viên cần sao chép
4. Xác nhận → Sao chép assignments (giữ nguyên MucDoKho)

**API:** `POST /api/workmanagement/giao-nhiem-vu/copy`

---

## 👤 Giai đoạn 3: Tự Đánh giá

**Actor:** Nhân viên

### Bước 3.1: Vào trang Tự đánh giá

**URL:** `/quan-ly-cong-viec/kpi/tu-danh-gia`

**Page:** `TuDanhGiaKPIPage.js`

**Auto-load:**

1. Load danh sách chu kỳ: `GET /api/workmanagement/chu-ky-danh-gia`
2. Auto-select chu kỳ đang mở (TrangThai = "DANG_DIEN_RA")
3. Load nhiệm vụ được gán: `GET /api/workmanagement/kpi/nhan-vien/:nhanVienId/nhiem-vu?chuKyId=xxx`

---

### Bước 3.2: Xem danh sách nhiệm vụ

**UI:** Table/Card hiển thị:

```
┌──────────────────────────────────────────────────────────────┐
│ Nhiệm vụ: Quản lý hạ tầng mạng                              │
│ Độ khó: 7.5                                                  │
│ Mô tả: Đảm bảo hệ thống mạng hoạt động ổn định 24/7        │
│                                                              │
│ Tự đánh giá mức độ hoàn thành:                             │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 85%                          │
│                                                              │
│ [Lưu]                                                        │
└──────────────────────────────────────────────────────────────┘
```

---

### Bước 3.3: Tự chấm điểm

**Action:**

- Kéo slider hoặc nhập số (0-100%)
- onChange → Update local state: `setScores({ assignmentId: 85 })`

**UI State:**

```javascript
const [scores, setScores] = useState({
  assignmentId1: 85,
  assignmentId2: 90,
  assignmentId3: 75,
});
```

---

### Bước 3.4: Lưu điểm

**Option 1: Lưu từng nhiệm vụ**

Button "Lưu" → `dispatch(nhanVienTuChamDiem(assignmentId, DiemTuDanhGia))`

**API:** `PUT /api/workmanagement/kpi/danh-gia-nhiem-vu/:assignmentId/nhan-vien-cham-diem`

**Body:** `{ diemTuDanhGia: 85 }`

---

**Option 2: Lưu tất cả (Batch)**

Button "Lưu tất cả" → `dispatch(nhanVienTuChamDiemBatch(nhanVienId, chuKyId, scores))`

**API:** `POST /api/workmanagement/kpi/nhan-vien/:nhanVienId/danh-gia`

**Body:**

```javascript
{
  chuKyId: "...",
  evaluations: [
    { assignmentId: "...", DiemTuDanhGia: 85 },
    { assignmentId: "...", DiemTuDanhGia: 90 },
    { assignmentId: "...", DiemTuDanhGia: 75 }
  ]
}
```

**Backend Logic:**

```javascript
kpiController.saveEvaluation = catchAsync(async (req, res, next) => {
  const { evaluations } = req.body;

  for (const ev of evaluations) {
    await NhanVienNhiemVu.findByIdAndUpdate(ev.assignmentId, {
      DiemTuDanhGia: ev.DiemTuDanhGia,
      NgayTuCham: new Date(),
    });
  }

  return sendResponse(res, 200, true, null, null, "Lưu thành công");
});
```

---

### Bước 3.5: Chỉnh sửa điểm (trước khi Manager duyệt)

**Permission:** Nhân viên có thể sửa `DiemTuDanhGia` cho đến khi Manager duyệt KPI

**Check:**

```javascript
const danhGiaKPI = await DanhGiaKPI.findOne({
  NhanVienID,
  ChuKyDanhGiaID,
  isDeleted: false,
});

if (danhGiaKPI && danhGiaKPI.TrangThai === "DA_DUYET") {
  throw new AppError(
    400,
    "KPI đã được duyệt, không thể chỉnh sửa",
    "Bad Request"
  );
}

// OK: Allow update
```

---

## 🎯 Giai đoạn 4: Chấm điểm (Manager)

**Actor:** Manager

### Bước 4.1: Vào Dashboard KPI

**URL:** `/quan-ly-cong-viec/kpi/danh-gia` (Legacy) hoặc `/quan-ly-cong-viec/kpi/dashboard` (V2)

**Page:** `DanhGiaKPIDashboard.js` (V2 recommended)

**Auto-load:**

1. Load chu kỳ: `GET /api/workmanagement/chu-ky-danh-gia`
2. Auto-select chu kỳ ưu tiên cao nhất (3-tier: open > latest > first)
3. Load dashboard: `GET /api/workmanagement/kpi/dashboard/:chuKyId`

---

### Bước 4.2: Xem danh sách nhân viên

**Dashboard Table:**

```
┌────────────┬───────────────┬──────────────┬───────────┬─────────┐
│ Nhân viên  │ Phòng ban     │ Tiến độ      │ Điểm KPI  │ Action  │
├────────────┼───────────────┼──────────────┼───────────┼─────────┤
│ Nguyễn VĂn │ IT            │ 3/5 (60%)    │ 7.5       │ [Chấm]  │
│ Trần Thị B │ IT            │ 5/5 (100%)   │ 8.2       │ [Xem]   │
│ Lê Văn C   │ Kế toán       │ 0/3 (0%)     │ --        │ [Chấm]  │
└────────────┴───────────────┴──────────────┴───────────┴─────────┘
```

**Backend API:** `kpiController.getDashboard`

```javascript
getDashboard = catchAsync(async (req, res, next) => {
  const { chuKyId } = req.params;
  const currentManagerId = req.currentNhanVienID;

  // 1. Find managed employees
  const quanLyRecords = await QuanLyNhanVien.find({
    NhanVienQuanLy: currentManagerId,
    LoaiQuanLy: "KPI",
    isDeleted: false,
  }).populate("NhanVienDuocQuanLy");

  const employeeIds = quanLyRecords.map((q) => q.NhanVienDuocQuanLy._id);

  // 2. For each employee
  const nhanVienList = await Promise.all(
    employeeIds.map(async (empId) => {
      // Find assignments
      const assignments = await NhanVienNhiemVu.find({
        NhanVienID: empId,
        ChuKyDanhGiaID: chuKyId,
        isDeleted: false,
      });

      // Find existing KPI evaluation
      const danhGiaKPI = await DanhGiaKPI.findOne({
        NhanVienID: empId,
        ChuKyDanhGiaID: chuKyId,
        isDeleted: false,
      });

      // Calculate progress
      const total = assignments.length;
      let scored = 0;

      if (danhGiaKPI) {
        const evaluations = await DanhGiaNhiemVuThuongQuy.find({
          DanhGiaKPIID: danhGiaKPI._id,
          isDeleted: false,
        });

        scored = evaluations.filter((ev) =>
          ev.ChiTietDiem.every((tc) => tc.DiemDat !== null)
        ).length;
      }

      return {
        nhanVien: quanLyRecords.find((q) =>
          q.NhanVienDuocQuanLy._id.equals(empId)
        ).NhanVienDuocQuanLy,
        assignedCount: total,
        danhGiaKPI: danhGiaKPI || null,
        progress: {
          scored,
          total,
          percentage: total > 0 ? Math.round((scored / total) * 100) : 0,
        },
      };
    })
  );

  // 3. Summary
  const summary = {
    totalNhanVien: nhanVienList.length,
    completed: nhanVienList.filter((n) => n.progress.percentage === 100).length,
    inProgress: nhanVienList.filter(
      (n) => n.progress.percentage > 0 && n.progress.percentage < 100
    ).length,
    notStarted: nhanVienList.filter((n) => n.progress.percentage === 0).length,
  };

  return sendResponse(
    res,
    200,
    true,
    { nhanVienList, summary },
    null,
    "Success"
  );
});
```

---

### Bước 4.3: Click "Chấm điểm" → Mở Dialog

**UI:** `ChamDiemKPIDialog.js` (V2)

**Flow:**

1. Click button "Chấm điểm" → `dispatch(getChamDiemTieuChi(danhGiaKPIId, nhanVienId, chuKyId))`
2. Backend kiểm tra: DanhGiaKPI đã tồn tại chưa?
3. **Nếu chưa tồn tại:** Auto-create

---

### Bước 4.4: Auto-create DanhGiaKPI (Lần đầu)

**Backend:** `kpiController.getChamDiemTieuChi`

```javascript
getChamDiemTieuChi = catchAsync(async (req, res, next) => {
  const { danhGiaKPIId, nhanVienId, chuKyId } = req.query;
  let danhGiaKPI;

  // 1. Check existing
  if (danhGiaKPIId) {
    danhGiaKPI = await DanhGiaKPI.findById(danhGiaKPIId);
  } else {
    // 2. Create new if not exist
    danhGiaKPI = await DanhGiaKPI.findOne({
      NhanVienID: nhanVienId,
      ChuKyDanhGiaID: chuKyId,
      isDeleted: false,
    });

    if (!danhGiaKPI) {
      // ✅ AUTO-CREATE
      danhGiaKPI = await DanhGiaKPI.create({
        ChuKyDanhGiaID: chuKyId,
        NhanVienID: nhanVienId,
        NguoiDanhGiaID: req.currentNhanVienID,
        TongDiemKPI: 0,
        TrangThai: "CHUA_DUYET",
      });

      // 3. Load assignments
      const assignments = await NhanVienNhiemVu.find({
        NhanVienID: nhanVienId,
        ChuKyDanhGiaID: chuKyId,
        isDeleted: false,
      }).populate("NhiemVuThuongQuyID");

      // 4. Load ChuKy to get TieuChiCauHinh
      const chuKy = await ChuKyDanhGia.findById(chuKyId);

      // 5. Create DanhGiaNhiemVuThuongQuy for each assignment
      await Promise.all(
        assignments.map(async (assignment) => {
          // Copy TieuChiCauHinh → ChiTietDiem
          const chiTietDiem = chuKy.TieuChiCauHinh.map((tc) => ({
            TenTieuChi: tc.TenTieuChi,
            LoaiTieuChi: tc.LoaiTieuChi,
            IsMucDoHoanThanh: tc.IsMucDoHoanThanh,
            GiaTriMin: tc.GiaTriMin,
            GiaTriMax: tc.GiaTriMax,
            DonVi: tc.DonVi,
            MoTa: tc.MoTa,
            ThuTu: tc.ThuTu,
            DiemDat: null, // ← Chưa chấm
            GhiChu: "",
          }));

          return DanhGiaNhiemVuThuongQuy.create({
            DanhGiaKPIID: danhGiaKPI._id,
            NhiemVuThuongQuyID: assignment.NhiemVuThuongQuyID._id,
            NhanVienID: nhanVienId,
            ChuKyDanhGiaID: chuKyId,
            MucDoKho: assignment.MucDoKho || 5,
            ChiTietDiem: chiTietDiem,
            SoCongViecLienQuan: 0, // TODO: Calculate
            TrangThai: "CHUA_DUYET",
          });
        })
      );
    }
  }

  // 6. Load full data
  const nhiemVuList = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: danhGiaKPI._id,
    isDeleted: false,
  }).populate("NhiemVuThuongQuyID");

  return sendResponse(
    res,
    200,
    true,
    { danhGiaKPI, nhiemVuList },
    null,
    "Success"
  );
});
```

---

### Bước 4.5: Chấm điểm từng tiêu chí

**UI:** Dialog hiển thị table:

```
┌──────────────────────────────────────────────────────────────────────┐
│ Nhiệm vụ: Quản lý hạ tầng mạng (Độ khó: 7.5)                        │
│                                                                       │
│ ┌────────────────────────────┬──────────┬──────────────────────┐    │
│ │ Tiêu chí                   │ Tự đánh  │ Manager chấm         │    │
│ ├────────────────────────────┼──────────┼──────────────────────┤    │
│ │ Mức độ hoàn thành         │ 85%      │ [90%____] (0-100)   │    │
│ │ Điểm tích cực             │ --       │ [3______] (0-10)    │    │
│ │ Điểm trừ quá hạn          │ --       │ [2______] (0-10)    │    │
│ └────────────────────────────┴──────────┴──────────────────────┘    │
│                                                                       │
│ Điểm nhiệm vụ preview: 6.75                                         │
└──────────────────────────────────────────────────────────────────────┘
```

**onChange handler:**

```javascript
const handleScoreChange = (nhiemVuId, tieuChiId, diemDat) => {
  // Update Redux state
  dispatch(updateTieuChiScore(nhiemVuId, tieuChiId, diemDat));

  // Auto-calculate preview
  const preview = calculateTotalScore(
    state.currentNhiemVuList,
    state.diemTuDanhGiaMap
  );

  // Update UI (real-time)
  setTongDiemPreview(preview.tongDiem);
};
```

---

### Bước 4.6: Lưu nháp (Optional)

Button "Lưu tất cả" → `dispatch(luuTatCaNhiemVu(danhGiaKPIId, nhiemVuList))`

**API:** `POST /api/workmanagement/kpi/luu-tat-ca/:danhGiaKPIId`

**Body:**

```javascript
{
  nhiemVuList: [
    {
      _id: "nhiemVuId1",
      ChiTietDiem: [
        { TenTieuChi: "Hoàn thành", DiemDat: 90, ... },
        { TenTieuChi: "Tích cực", DiemDat: 3, ... }
      ]
    },
    // ...
  ]
}
```

**Backend:** Batch upsert

```javascript
luuTatCaNhiemVu = catchAsync(async (req, res, next) => {
  const { danhGiaKPIId } = req.params;
  const { nhiemVuList } = req.body;

  const bulkOps = nhiemVuList.map((nv) => ({
    updateOne: {
      filter: { _id: nv._id },
      update: { $set: { ChiTietDiem: nv.ChiTietDiem } },
    },
  }));

  await DanhGiaNhiemVuThuongQuy.bulkWrite(bulkOps);

  return sendResponse(res, 200, true, null, null, "Lưu thành công");
});
```

---

## ✅ Giai đoạn 5: Duyệt KPI

**Actor:** Manager

### Bước 5.1: Kiểm tra trước khi duyệt

**Validation UI:**

- Tất cả nhiệm vụ đã chấm điểm đầy đủ (không có DiemDat = null)
- Preview TongDiemKPI hợp lý (> 0)
- Có thể thêm nhận xét

---

### Bước 5.2: Nhấn "Duyệt KPI"

Button "Duyệt KPI" → Confirmation dialog

**Confirmation:**

```
┌─────────────────────────────────────────────────┐
│ Xác nhận duyệt KPI                             │
│                                                 │
│ Nhân viên: Nguyễn Văn A                        │
│ Chu kỳ: Quý 4/2025                            │
│ Tổng điểm KPI: 8.75                           │
│                                                 │
│ Nhận xét (tùy chọn):                           │
│ [_____________________________________________] │
│                                                 │
│ ⚠️ Sau khi duyệt, không thể chỉnh sửa điểm!   │
│                                                 │
│ [Hủy]                    [Xác nhận duyệt]     │
└─────────────────────────────────────────────────┘
```

---

### Bước 5.3: Gọi API Duyệt

**Redux:** `dispatch(duyetKPITieuChi(danhGiaKPIId, nhiemVuList, nhanXet))`

**API:** `POST /api/workmanagement/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId`

**Body:**

```javascript
{
  nhiemVuList: [...],  // Full data with ChiTietDiem
  nhanXet: "Hoàn thành tốt công việc trong quý 4"
}
```

---

### Bước 5.4: Backend xử lý (Transaction)

**Controller:** `kpiController.duyetKPITieuChi`

```javascript
duyetKPITieuChi = catchAsync(async (req, res, next) => {
  const { danhGiaKPIId } = req.params;
  const { nhiemVuList, nhanXet } = req.body;
  const nguoiDuyetId = req.currentNhanVienID;

  // 1. Validate permission
  const danhGiaKPI = await DanhGiaKPI.findById(danhGiaKPIId);
  if (!danhGiaKPI) {
    throw new AppError(404, "Không tìm thấy đánh giá KPI", "Not Found");
  }

  if (danhGiaKPI.TrangThai === "DA_DUYET") {
    throw new AppError(400, "KPI đã được duyệt", "Bad Request");
  }

  // 2. Batch upsert DanhGiaNhiemVuThuongQuy
  for (const nv of nhiemVuList) {
    await DanhGiaNhiemVuThuongQuy.findByIdAndUpdate(
      nv._id,
      { ChiTietDiem: nv.ChiTietDiem },
      { new: true }
    );
  }

  // 3. Call method duyet() - Tính TongDiemKPI chính thức
  await danhGiaKPI.duyet(nhanXet, nguoiDuyetId);

  // 4. Reload & populate
  await danhGiaKPI.populate([
    { path: "NhanVienID", select: "HoTen MaNhanVien" },
    { path: "NguoiDanhGiaID", select: "HoTen" },
    { path: "ChuKyDanhGiaID", select: "TenChuKy" },
  ]);

  const nhiemVuListUpdated = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: danhGiaKPIId,
    isDeleted: false,
  }).populate("NhiemVuThuongQuyID");

  // 5. Send notification
  // TODO: Email/Thông báo cho nhân viên

  return sendResponse(
    res,
    200,
    true,
    { danhGiaKPI, nhiemVuList: nhiemVuListUpdated },
    null,
    "Duyệt KPI thành công"
  );
});
```

---

### Bước 5.5: Method duyet() - Core Logic

**Model:** `DanhGiaKPI.js`

```javascript
danhGiaKPISchema.methods.duyet = async function (nhanXet, nguoiDuyetId) {
  // [Code đã có ở FORMULA_CALCULATION.md]
  // 1. Load DiemTuDanhGia từ NhanVienNhiemVu
  // 2. Load evaluations
  // 3. Tính TongDiemKPI theo công thức V2
  // 4. Snapshot vào DB
  // 5. Ghi lịch sử

  // Kết quả:
  this.TongDiemKPI = tongDiemKPI; // ← Official score
  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();
  this.NguoiDuyet = nguoiDuyetId;

  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI,
    GhiChu: nhanXet,
  });

  await this.save();
  return this;
};
```

---

### Bước 5.6: Frontend nhận kết quả

**Redux reducer:** `duyetKPITieuChiSuccess`

```javascript
duyetKPITieuChiSuccess(state, action) {
  const { danhGiaKPI } = action.payload;

  // Update current
  state.currentDanhGiaKPI = danhGiaKPI;

  // Update in dashboard list
  const index = state.dashboardData.nhanVienList.findIndex(
    n => n.danhGiaKPI?._id === danhGiaKPI._id
  );

  if (index !== -1) {
    state.dashboardData.nhanVienList[index].danhGiaKPI = danhGiaKPI;
  }

  state.isSaving = false;
  state.isOpenFormDialog = false;  // Close dialog
}
```

**Toast:** `toast.success("Duyệt KPI thành công!")`

**Redirect:** Quay lại dashboard → Hiển thị badge "Đã duyệt"

---

## 🔄 Giai đoạn 6: Hủy duyệt (Admin)

**Actor:** Admin only

### Bước 6.1: Nhấn "Hủy duyệt"

**Confirmation:**

```
┌─────────────────────────────────────────────────┐
│ ⚠️ Hủy duyệt KPI                               │
│                                                 │
│ Nhân viên: Nguyễn Văn A                        │
│ Điểm KPI hiện tại: 8.75                        │
│ Ngày duyệt: 15/12/2025                         │
│                                                 │
│ Lý do hủy (bắt buộc):                          │
│ [_____________________________________________] │
│                                                 │
│ ⚠️ Điểm KPI sẽ reset về 0, nhưng giữ lịch sử! │
│                                                 │
│ [Hủy]                    [Xác nhận hủy duyệt] │
└─────────────────────────────────────────────────┘
```

---

### Bước 6.2: Gọi API Hủy duyệt

**Redux:** `dispatch(huyDuyetKPI(danhGiaKPIId, lyDo))`

**API:** `POST /api/workmanagement/kpi/huy-duyet-kpi/:danhGiaKPIId`

**Body:** `{ lyDo: "Cần điều chỉnh tiêu chí đánh giá" }`

---

### Bước 6.3: Backend xử lý

**Controller:** `kpiController.huyDuyetKPI`

```javascript
huyDuyetKPI = catchAsync(async (req, res, next) => {
  const { danhGiaKPIId } = req.params;
  const { lyDo } = req.body;
  const nguoiHuyId = req.currentNhanVienID;

  // 1. Permission check (Admin only)
  if (req.user.PhanQuyen !== "admin") {
    throw new AppError(403, "Chỉ Admin mới được hủy duyệt KPI", "Forbidden");
  }

  // 2. Find KPI
  const danhGiaKPI = await DanhGiaKPI.findById(danhGiaKPIId);
  if (!danhGiaKPI) {
    throw new AppError(404, "Không tìm thấy đánh giá KPI", "Not Found");
  }

  // 3. Call method huyDuyet()
  await danhGiaKPI.huyDuyet(nguoiHuyId, lyDo);

  // 4. Reload
  await danhGiaKPI.populate([
    { path: "NhanVienID", select: "HoTen" },
    { path: "LichSuHuyDuyet.NguoiHuyDuyet", select: "HoTen" },
  ]);

  return sendResponse(res, 200, true, { danhGiaKPI }, null, "Đã hủy duyệt KPI");
});
```

---

### Bước 6.4: Method huyDuyet()

**Model:** `DanhGiaKPI.js`

```javascript
danhGiaKPISchema.methods.huyDuyet = async function (nguoiHuyId, lyDo) {
  // Validate
  if (this.TrangThai !== "DA_DUYET") {
    throw new Error("KPI chưa được duyệt, không thể hủy duyệt");
  }

  if (!lyDo || lyDo.trim().length === 0) {
    throw new Error("Vui lòng nhập lý do hủy duyệt");
  }

  // Snapshot trước khi hủy
  this.LichSuHuyDuyet = this.LichSuHuyDuyet || [];
  this.LichSuHuyDuyet.push({
    NguoiHuyDuyet: nguoiHuyId,
    NgayHuyDuyet: new Date(),
    LyDoHuyDuyet: lyDo.trim(),
    DiemTruocKhiHuy: this.TongDiemKPI,
    NgayDuyetTruocDo: this.NgayDuyet,
  });

  // Reset về CHUA_DUYET
  this.TrangThai = "CHUA_DUYET";
  this.TongDiemKPI = 0;
  this.NgayDuyet = null;
  this.NguoiDuyet = null;

  await this.save();
  return this;
};
```

---

## 📊 Giai đoạn 7: Báo cáo & Xuất Excel

**Actor:** Admin / Đào tạo

### Bước 7.1: Vào trang Báo cáo

**URL:** `/quan-ly-cong-viec/bao-cao-kpi`

**Page:** `BaoCaoKPIPage.js` (re-export từ module `BaoCaoThongKeKPI`)

---

### Bước 7.2: Lọc & Tìm kiếm

**Filters:**

- Chu kỳ đánh giá
- Phòng ban
- Trạng thái (CHUA_DUYET / DA_DUYET)
- Khoảng điểm KPI (từ-đến)

**API:** `GET /api/workmanagement/kpi/bao-cao/chi-tiet?chuKyId=xxx&phongBan=xxx&trangThai=DA_DUYET&diemMin=7&diemMax=10`

---

### Bước 7.3: Xem biểu đồ

**Charts:**

- Biểu đồ cột: Phân bố điểm KPI (0-5, 5-7, 7-8, 8-10)
- Biểu đồ tròn: Tỷ lệ trạng thái (Đã duyệt / Chưa duyệt)
- Line chart: Xu hướng điểm KPI theo tháng/quý

**API:** `GET /api/workmanagement/kpi/bao-cao/thong-ke?chuKyId=xxx`

---

### Bước 7.4: Xuất Excel

Button "Xuất Excel" → `window.location.href = apiUrl + "/export-excel?..."`

**API:** `GET /api/workmanagement/kpi/bao-cao/export-excel?chuKyId=xxx&phongBan=xxx`

**Backend:**

```javascript
exportBaoCaoExcel = catchAsync(async (req, res, next) => {
  const { chuKyId, phongBan } = req.query;

  // 1. Query data
  const query = { ChuKyDanhGiaID: chuKyId, isDeleted: false };
  if (phongBan) {
    query["NhanVienID.PhongBanID"] = phongBan;
  }

  const danhGiaKPIs = await DanhGiaKPI.find(query)
    .populate("NhanVienID", "HoTen MaNhanVien Email PhongBanID")
    .populate("ChuKyDanhGiaID", "TenChuKy NgayBatDau NgayKetThuc")
    .populate("NguoiDanhGiaID", "HoTen");

  // 2. Generate Excel (use ExcelJS or similar)
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Báo cáo KPI");

  // Headers
  worksheet.columns = [
    { header: "Mã NV", key: "maNV", width: 15 },
    { header: "Họ tên", key: "hoTen", width: 25 },
    { header: "Phòng ban", key: "phongBan", width: 20 },
    { header: "Điểm KPI", key: "diemKPI", width: 12 },
    { header: "Xếp loại", key: "xepLoai", width: 15 },
    { header: "Trạng thái", key: "trangThai", width: 15 },
    { header: "Ngày duyệt", key: "ngayDuyet", width: 15 },
  ];

  // Data
  danhGiaKPIs.forEach((kpi) => {
    worksheet.addRow({
      maNV: kpi.NhanVienID.MaNhanVien,
      hoTen: kpi.NhanVienID.HoTen,
      phongBan: kpi.NhanVienID.PhongBanID?.TenPhongBan || "",
      diemKPI: kpi.TongDiemKPI.toFixed(2),
      xepLoai: getXepLoai(kpi.TongDiemKPI),
      trangThai: kpi.TrangThai === "DA_DUYET" ? "Đã duyệt" : "Chưa duyệt",
      ngayDuyet: kpi.NgayDuyet ? dayjs(kpi.NgayDuyet).format("DD/MM/YYYY") : "",
    });
  });

  // 3. Send file
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="BaoCaoKPI_${chuKyId}_${Date.now()}.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});
```

---

## 🔔 Notifications & Emails

### Email Templates

**1. Chu kỳ mới mở (gửi Manager):**

```
Subject: [KPI] Chu kỳ đánh giá Quý 4/2025 đã mở

Kính gửi Quản lý,

Chu kỳ đánh giá KPI "Quý 4/2025" đã được mở.
Vui lòng gán nhiệm vụ cho nhân viên trước ngày 05/10/2025.

Link: http://localhost:3000/quan-ly-cong-viec/giao-nhiem-vu

Trân trọng,
Hệ thống KPI
```

**2. Nhắc nhở tự đánh giá (gửi Nhân viên):**

```
Subject: [KPI] Nhắc nhở tự đánh giá Quý 4/2025

Kính gửi [Họ tên],

Bạn có 5 nhiệm vụ chưa tự đánh giá mức độ hoàn thành cho chu kỳ Q4/2025.
Vui lòng hoàn thành trước ngày 25/12/2025.

Link: http://localhost:3000/quan-ly-cong-viec/kpi/tu-danh-gia

Trân trọng,
Hệ thống KPI
```

**3. KPI đã được duyệt (gửi Nhân viên):**

```
Subject: [KPI] Kết quả đánh giá KPI Quý 4/2025

Kính gửi [Họ tên],

Kết quả đánh giá KPI của bạn cho chu kỳ Q4/2025 đã được duyệt:
- Tổng điểm KPI: 8.75
- Xếp loại: Khá
- Nhận xét: Hoàn thành tốt công việc trong quý 4

Chi tiết: http://localhost:3000/quan-ly-cong-viec/kpi/xem/:id

Trân trọng,
[Người đánh giá]
```

---

## 🔍 Troubleshooting Workflow

### Vấn đề 1: Không tạo được DanhGiaKPI

**Triệu chứng:** Button "Chấm điểm" không mở dialog

**Nguyên nhân:**

- Nhân viên chưa được gán nhiệm vụ nào
- Manager không có quyền quản lý nhân viên này (QuanLyNhanVien)

**Giải pháp:**

1. Check QuanLyNhanVien: `db.quanlynhanvien.find({ NhanVienQuanLy: managerId, NhanVienDuocQuanLy: employeeId })`
2. Check NhanVienNhiemVu: `db.nhanviennhiemvu.find({ NhanVienID: employeeId, ChuKyDanhGiaID: chuKyId })`

---

### Vấn đề 2: Preview điểm khác với điểm sau duyệt

**Triệu chứng:** Điểm preview = 8.5, sau duyệt = 7.2

**Nguyên nhân:** Frontend và backend dùng công thức khác nhau

**Giải pháp:**

```bash
# So sánh 2 file
diff <(grep -A 20 "CÔNG THỨC DUY NHẤT" fe-bcgiaobanbvt/src/utils/kpiCalculation.js) \
     <(grep -A 20 "CÔNG THỨC DUY NHẤT" giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js)

# Phải GIỐNG HỆT NHAU!
```

---

### Vấn đề 3: TongDiemKPI = 0 sau duyệt

**Triệu chứng:** Duyệt thành công nhưng TongDiemKPI = 0

**Nguyên nhân:**

- Tất cả ChiTietDiem.DiemDat = 0 hoặc null
- DiemTuDanhGia không load được (map rỗng)

**Debug:**

```javascript
// Backend method duyet() - thêm log
console.log("diemTuDanhGiaMap:", diemTuDanhGiaMap);
console.log(
  "evaluations:",
  evaluations.map((e) => ({
    id: e._id,
    ChiTietDiem: e.ChiTietDiem.map((tc) => tc.DiemDat),
  }))
);

// Kiểm tra assignments
const assignments = await NhanVienNhiemVu.find({
  NhanVienID: this.NhanVienID,
  ChuKyDanhGiaID: this.ChuKyDanhGiaID,
});
console.log("assignments:", assignments.length);
```

---

## 📝 Checklist Workflow

### Trước khi mở chu kỳ

- [ ] Đã tạo chu kỳ mới
- [ ] Đã cấu hình đầy đủ tiêu chí đánh giá
- [ ] Đã đánh dấu tiêu chí "Mức độ hoàn thành" (IsMucDoHoanThanh = true)
- [ ] Đã thông báo cho Manager về thời hạn gán nhiệm vụ

### Gán nhiệm vụ

- [ ] Tất cả nhân viên đã được gán nhiệm vụ
- [ ] MucDoKho đã được điều chỉnh phù hợp với từng người
- [ ] Đã kiểm tra không có assignment trùng lặp

### Tự đánh giá

- [ ] Nhân viên đã tự chấm tất cả nhiệm vụ
- [ ] DiemTuDanhGia nằm trong khoảng 0-100
- [ ] Đã lưu thành công (check NgayTuCham)

### Chấm điểm

- [ ] Tất cả nhiệm vụ đã chấm điểm đầy đủ (không có DiemDat = null)
- [ ] Preview TongDiemKPI hợp lý (> 0)
- [ ] Đã thêm nhận xét (optional)

### Duyệt

- [ ] Đã kiểm tra kỹ toàn bộ điểm
- [ ] Preview khớp với kỳ vọng
- [ ] Đã thông báo cho nhân viên

### Báo cáo

- [ ] Dữ liệu đầy đủ
- [ ] Excel xuất đúng format
- [ ] Dashboard hiển thị chính xác

---

**✅ Workflow đã được verified với code thực tế (25/11/2025)**
