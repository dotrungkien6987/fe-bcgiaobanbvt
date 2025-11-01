# Phân Tích Validate Xóa Quan Hệ Quản Lý Nhân Viên

## 📋 Tổng Quan

**Trang hiện tại:** `/workmanagement/nhanvien/:nhanVienId/quanly`  
**Chức năng:** Cấu hình mối quan hệ quản lý giữa nhân viên (ai quản lý ai)  
**Vấn đề:** Chưa có validate khi xóa quan hệ → có thể gây mất dữ liệu/conflict

---

## 🗂️ Database Models Liên Quan

### 1. **QuanLyNhanVien** (Core Model)

```javascript
{
  NhanVienQuanLy: ObjectId,        // Người quản lý
  NhanVienDuocQuanLy: ObjectId,    // Người được quản lý
  LoaiQuanLy: String,              // "KPI" | "Giao_Viec"
  isDeleted: Boolean
}
```

**Index:** `{ NhanVienQuanLy: 1, NhanVienDuocQuanLy: 1, unique: true }`

**Pre-save hook:** Không cho phép tự quản lý bản thân

---

### 2. **DanhGiaKPI** (KPI Evaluation)

```javascript
{
  ChuKyDanhGiaID: ObjectId,        // Chu kỳ đánh giá
  NhanVienID: ObjectId,            // Người được đánh giá
  NguoiDanhGiaID: ObjectId,        // Người chấm KPI ← LIÊN QUAN
  TongDiemKPI: Number,
  TrangThai: String,               // "CHUA_DUYET" | "DA_DUYET"
  NhanXetNguoiDanhGia: String,
  NgayDuyet: Date,
  NguoiDuyet: ObjectId,
  LichSuDuyet: Array,
  LichSuHuyDuyet: Array,
  isDeleted: Boolean
}
```

**Index:** `{ ChuKyDanhGiaID: 1, NhanVienID: 1, unique: true }`

**Business Rule:**

- Chỉ `NguoiDanhGiaID` (người có quan hệ KPI) mới được chấm điểm
- Đã duyệt thì không sửa được (trừ admin)
- Có lịch sử duyệt/hủy duyệt đầy đủ

---

### 3. **CongViec** (Work Assignment)

```javascript
{
  MaCongViec: String,
  TieuDe: String,
  MoTa: String,
  NguoiGiaoViecID: ObjectId,       // Người giao việc ← LIÊN QUAN
  NguoiThamGia: [{
    NhanVienID: ObjectId,
    VaiTro: String,                // "CHINH" | "PHOI_HOP"
    TrangThai: String,
    TienDo: Number
  }],
  NguoiChinhID: ObjectId,
  TrangThai: String,               // TAO_MOI | DA_GIAO | DANG_THUC_HIEN | CHO_DUYET | HOAN_THANH
  MucDoUuTien: String,
  NgayBatDau: Date,
  NgayKetThuc: Date,
  TienDoTongThe: Number,
  isDeleted: Boolean
}
```

**Index:**

- `{ NguoiGiaoViecID: 1 }`
- `{ NguoiChinhID: 1 }`
- `{ TrangThai: 1 }`

**Business Rule:**

- Chỉ `NguoiGiaoViecID` (người có quan hệ Giao_Viec) mới được giao việc
- Trạng thái không được phép rollback từ HOAN_THANH
- Có lịch sử trạng thái đầy đủ

---

### 4. **NhanVienNhiemVu** (Task Assignment)

```javascript
{
  NhanVienID: ObjectId,            // Nhân viên
  NhiemVuThuongQuyID: ObjectId,    // Nhiệm vụ thường quy
  ChuKyDanhGiaID: ObjectId,        // null = vĩnh viễn
  MucDoKho: Number,                // 1-10
  DiemTuDanhGia: Number,           // 0-100
  TrangThaiHoatDong: Boolean,
  NgayGan: Date,
  NguoiGanID: ObjectId,            // Người gán ← LIÊN QUAN
  isDeleted: Boolean
}
```

**Business Rule:**

- Người gán phải có quan hệ KPI với nhân viên
- Có thể gán theo chu kỳ hoặc vĩnh viễn
- Khi xóa nhiệm vụ thường quy → soft delete tất cả NhanVienNhiemVu

---

### 5. **DanhGiaNhiemVuThuongQuy** (Task Evaluation)

```javascript
{
  DanhGiaKPIID: ObjectId,          // ref DanhGiaKPI
  NhiemVuThuongQuyID: ObjectId,
  NhanVienID: ObjectId,
  MucDoKho: Number,
  ChiTietDiem: Array,              // Điểm từng tiêu chí
  TongDiemTieuChi: Number,         // Auto-calculated
  DiemNhiemVu: Number,             // Auto-calculated
  SoCongViecLienQuan: Number,
  GhiChu: String,
  isDeleted: Boolean
}
```

**Auto-calculation:** Khi save → tự động update `TongDiemKPI` trong `DanhGiaKPI`

---

## 🚨 Impact Analysis - Khi Xóa Quan Hệ

### Scenario 1: Xóa Quan Hệ "KPI"

**Current Code (Backend):**

```javascript
// File: giaobanbv-be/modules/workmanagement/controllers/quanLyNhanVienController.js
quanLyNhanVienController.xoaQuanHe = catchAsync(async (req, res, next) => {
  const { nhanvienid, managedid } = req.params;

  const relation = await QuanLyNhanVien.findOneAndUpdate(
    {
      NhanVienQuanLy: nhanvienid,
      NhanVienDuocQuanLy: managedid,
    },
    { isDeleted: true }, // ❌ CHỈ SET isDeleted, KHÔNG VALIDATE GÌ CẢ!
    { new: true }
  );

  if (!relation) {
    throw new AppError(404, "Không tìm thấy quan hệ quản lý");
  }

  return sendResponse(
    res,
    200,
    true,
    { deletedId: relation._id },
    null,
    "Xóa quan hệ quản lý thành công"
  );
});
```

**⚠️ Vấn đề khi KHÔNG validate:**

#### 1. **Mất quyền chấm KPI giữa chừng**

```
Manager A đang chấm KPI cho Employee B (đã chấm 8/10 nhiệm vụ)
→ Admin/Manager vô tình xóa quan hệ
→ Manager A mất quyền tiếp tục chấm 2 nhiệm vụ còn lại
→ DanhGiaKPI của Employee B bị dở dang (không thể hoàn thành)
```

#### 2. **Vi phạm data integrity**

```javascript
// DanhGiaKPI records vẫn tồn tại với NguoiDanhGiaID = Manager A
// Nhưng QuanLyNhanVien.isDeleted = true
// → JOIN queries trả về NULL/inconsistent data
// → Reports/Statistics bị sai
```

#### 3. **Không thể hoàn tác dễ dàng**

```
Xóa nhầm → DanhGiaKPI đang CHUA_DUYET vẫn nằm đó
→ Phải restore quan hệ (set isDeleted = false)
→ Nhưng user không biết có thể restore
→ Tạo lại quan hệ mới → duplicate
```

#### 4. **Orphaned NhanVienNhiemVu records**

```javascript
// Các nhiệm vụ thường quy đã gán cho Employee B
// Vẫn active (TrangThaiHoatDong = true)
// Nhưng người gán (Manager A) không còn quyền quản lý
// → Không thể edit/remove nhiệm vụ
```

---

### Scenario 2: Xóa Quan Hệ "Giao_Viec"

**⚠️ Vấn đề khi KHÔNG validate:**

#### 1. **Mất quyền giao việc với công việc đang active**

```
Manager A có 5 công việc đang DANG_THUC_HIEN với Employee B
→ Xóa quan hệ Giao_Viec
→ Manager A không thể theo dõi/comment/approve công việc
→ Employee B vẫn thấy công việc nhưng không có người giám sát
```

#### 2. **Audit trail bị mất context**

```javascript
// CongViec.NguoiGiaoViecID = Manager A
// LichSuTrangThai có nhiều records từ Manager A
// Nhưng QuanLyNhanVien.isDeleted = true
// → Reports về "Ai giao việc gì cho ai" bị sai
```

#### 3. **Không thể giao việc mới**

```
Manager A muốn giao thêm việc cho Employee B
→ Nhưng quan hệ đã bị xóa
→ Phải tạo lại quan hệ
→ Tốn thời gian + dễ quên
```

---

## ✅ Validation Rules (Đề Xuất)

### Rule 1: **Validate Trước Khi Xóa Quan Hệ "KPI"**

```javascript
// Backend: modules/workmanagement/controllers/quanLyNhanVienController.js

quanLyNhanVienController.xoaQuanHe = catchAsync(async (req, res, next) => {
  const { nhanvienid, managedid } = req.params;
  const { force = false } = req.query; // Allow force delete for admin

  const relation = await QuanLyNhanVien.findOne({
    NhanVienQuanLy: nhanvienid,
    NhanVienDuocQuanLy: managedid,
    isDeleted: false,
  });

  if (!relation) {
    throw new AppError(404, "Không tìm thấy quan hệ quản lý");
  }

  // ✅ VALIDATE: Kiểm tra loại quan hệ
  const loaiQuanLy = relation.LoaiQuanLy;
  const validationResult = {
    canDelete: true,
    warnings: [],
    errors: [],
    impact: {},
  };

  // ✅ Nếu là quan hệ KPI
  if (loaiQuanLy === "KPI") {
    // 1. Kiểm tra DanhGiaKPI đang CHUA_DUYET
    const pendingKPIs = await DanhGiaKPI.find({
      NguoiDanhGiaID: nhanvienid,
      NhanVienID: managedid,
      TrangThai: "CHUA_DUYET",
      isDeleted: false,
    });

    if (pendingKPIs.length > 0) {
      validationResult.canDelete = false;
      validationResult.errors.push({
        type: "PENDING_KPI_EVALUATION",
        message: `Có ${pendingKPIs.length} đánh giá KPI đang chờ hoàn thành`,
        detail: "Vui lòng hoàn thành hoặc xóa các đánh giá KPI trước",
        records: pendingKPIs.map((k) => ({
          id: k._id,
          chuKyId: k.ChuKyDanhGiaID,
          tongDiem: k.TongDiemKPI,
        })),
      });
    }

    // 2. Kiểm tra DanhGiaKPI đã duyệt gần đây (warning)
    const approvedKPIsRecent = await DanhGiaKPI.find({
      NguoiDanhGiaID: nhanvienid,
      NhanVienID: managedid,
      TrangThai: "DA_DUYET",
      NgayDuyet: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days
      isDeleted: false,
    });

    if (approvedKPIsRecent.length > 0) {
      validationResult.warnings.push({
        type: "RECENT_APPROVED_KPI",
        message: `Có ${approvedKPIsRecent.length} đánh giá KPI đã duyệt trong 30 ngày qua`,
        detail:
          "Dữ liệu lịch sử vẫn được giữ nguyên nhưng mất quyền chấm KPI mới",
      });
    }

    // 3. Kiểm tra NhanVienNhiemVu đang hoạt động
    const activeAssignments = await NhanVienNhiemVu.find({
      NhanVienID: managedid,
      TrangThaiHoatDong: true,
      isDeleted: false,
    });

    if (activeAssignments.length > 0) {
      validationResult.warnings.push({
        type: "ACTIVE_TASK_ASSIGNMENTS",
        message: `Nhân viên có ${activeAssignments.length} nhiệm vụ thường quy đang hoạt động`,
        detail: "Các nhiệm vụ vẫn active nhưng bạn sẽ không quản lý được",
      });
    }

    // 4. Kiểm tra chu kỳ KPI đang mở
    const ChuKyDanhGia = mongoose.model("ChuKyDanhGia");
    const openCycles = await ChuKyDanhGia.find({
      isDong: false,
      isDeleted: false,
    });

    if (openCycles.length > 0) {
      validationResult.warnings.push({
        type: "OPEN_KPI_CYCLES",
        message: `Có ${openCycles.length} chu kỳ KPI đang mở`,
        detail:
          "Bạn sẽ không thể chấm KPI cho nhân viên này trong các chu kỳ đang mở",
        cycles: openCycles.map((c) => ({
          id: c._id,
          ten: c.TenChuKy,
          batDau: c.NgayBatDau,
          ketThuc: c.NgayKetThuc,
        })),
      });
    }

    validationResult.impact.kpiCount =
      pendingKPIs.length + approvedKPIsRecent.length;
    validationResult.impact.taskCount = activeAssignments.length;
  }

  // ✅ Nếu là quan hệ Giao_Viec
  if (loaiQuanLy === "Giao_Viec") {
    // 1. Kiểm tra công việc đang active
    const CongViec = mongoose.model("CongViec");
    const activeTasks = await CongViec.find({
      NguoiGiaoViecID: nhanvienid,
      $or: [
        { NguoiChinhID: managedid },
        { "NguoiThamGia.NhanVienID": managedid },
      ],
      TrangThai: { $in: ["DANG_THUC_HIEN", "CHO_DUYET"] },
      isDeleted: false,
    });

    if (activeTasks.length > 0) {
      validationResult.canDelete = false;
      validationResult.errors.push({
        type: "ACTIVE_TASKS",
        message: `Có ${activeTasks.length} công việc đang thực hiện hoặc chờ duyệt`,
        detail:
          "Vui lòng hoàn thành hoặc hủy các công việc trước khi xóa quan hệ",
        tasks: activeTasks.map((t) => ({
          id: t._id,
          maCongViec: t.MaCongViec,
          tieuDe: t.TieuDe,
          trangThai: t.TrangThai,
          tienDo: t.TienDoTongThe,
        })),
      });
    }

    // 2. Kiểm tra công việc mới tạo (warning)
    const newTasks = await CongViec.find({
      NguoiGiaoViecID: nhanvienid,
      $or: [
        { NguoiChinhID: managedid },
        { "NguoiThamGia.NhanVienID": managedid },
      ],
      TrangThai: { $in: ["TAO_MOI", "DA_GIAO"] },
      isDeleted: false,
    });

    if (newTasks.length > 0) {
      validationResult.warnings.push({
        type: "NEW_TASKS",
        message: `Có ${newTasks.length} công việc mới tạo hoặc đã giao`,
        detail: "Các công việc này có thể bị ảnh hưởng khi xóa quan hệ",
      });
    }

    // 3. Kiểm tra công việc đã hoàn thành gần đây (info)
    const completedTasks = await CongViec.find({
      NguoiGiaoViecID: nhanvienid,
      $or: [
        { NguoiChinhID: managedid },
        { "NguoiThamGia.NhanVienID": managedid },
      ],
      TrangThai: "HOAN_THANH",
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isDeleted: false,
    });

    if (completedTasks.length > 0) {
      validationResult.warnings.push({
        type: "RECENT_COMPLETED_TASKS",
        message: `Có ${completedTasks.length} công việc đã hoàn thành trong 30 ngày qua`,
        detail: "Dữ liệu lịch sử vẫn được giữ nhưng không thể giao việc mới",
      });
    }

    validationResult.impact.activeTaskCount = activeTasks.length;
    validationResult.impact.newTaskCount = newTasks.length;
    validationResult.impact.completedTaskCount = completedTasks.length;
  }

  // ✅ KIỂM TRA: Nếu không thể xóa và không force
  if (!validationResult.canDelete && !force) {
    return sendResponse(
      res,
      400,
      false,
      validationResult,
      "Không thể xóa quan hệ quản lý",
      "Validation Failed"
    );
  }

  // ✅ KIỂM TRA: Nếu có warnings → yêu cầu confirm
  if (validationResult.warnings.length > 0 && !req.query.confirmed) {
    return sendResponse(
      res,
      200,
      true,
      {
        ...validationResult,
        requireConfirmation: true,
      },
      null,
      "Yêu cầu xác nhận trước khi xóa"
    );
  }

  // ✅ THỰC HIỆN XÓA
  relation.isDeleted = true;
  await relation.save();

  return sendResponse(
    res,
    200,
    true,
    {
      deletedId: relation._id,
      validation: validationResult,
    },
    null,
    "Xóa quan hệ quản lý thành công"
  );
});
```

---

### Rule 2: **Frontend Confirmation Dialog**

```javascript
// File: fe-bcgiaobanbvt/src/features/QuanLyCongViec/QuanLyNhanVien/components/DanhSachChamKPI.js

const handleRemoveNhanVien = useCallback(
  async (relationId) => {
    try {
      // Step 1: Validate trước
      const validateResponse = await apiService.delete(
        `/workmanagement/quanlynhanvien/${currentNhanVienQuanLy._id}/${relationId}`,
        { params: { validate: true } } // Chỉ validate, không xóa
      );

      const { canDelete, errors, warnings, impact } =
        validateResponse.data.data;

      // Step 2: Nếu có lỗi → hiển thị chi tiết và chặn
      if (!canDelete) {
        setConfirmDialog({
          open: true,
          type: "error",
          title: "Không thể xóa quan hệ",
          message: errors[0]?.message || "Có lỗi xảy ra",
          details: (
            <Box>
              {errors.map((err, idx) => (
                <Alert key={idx} severity="error" sx={{ mb: 1 }}>
                  <AlertTitle>{err.type}</AlertTitle>
                  {err.detail}
                  {err.records && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" fontWeight="bold">
                        Các bản ghi ảnh hưởng:
                      </Typography>
                      <ul>
                        {err.records.map((rec, i) => (
                          <li key={i}>
                            <Typography variant="caption">
                              ID: {rec.id} - Điểm: {rec.tongDiem}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Alert>
              ))}
            </Box>
          ),
          showCancel: false,
          confirmText: "Đóng",
        });
        return;
      }

      // Step 3: Nếu có warnings → yêu cầu confirm
      if (warnings.length > 0) {
        setConfirmDialog({
          open: true,
          type: "remove",
          data: { relationId },
          title: "Xác nhận xóa quan hệ",
          message: `Bạn có chắc muốn xóa quan hệ quản lý này?`,
          details: (
            <Box>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                ⚠️ Cảnh báo:
              </Typography>
              {warnings.map((warn, idx) => (
                <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                  <AlertTitle>{warn.type}</AlertTitle>
                  {warn.message}
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    {warn.detail}
                  </Typography>
                </Alert>
              ))}

              {impact && (
                <Box sx={{ mt: 2, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    📊 Tác động:
                  </Typography>
                  <ul style={{ marginTop: 4, marginBottom: 0 }}>
                    {impact.kpiCount > 0 && (
                      <li>
                        <Typography variant="caption">
                          {impact.kpiCount} đánh giá KPI
                        </Typography>
                      </li>
                    )}
                    {impact.taskCount > 0 && (
                      <li>
                        <Typography variant="caption">
                          {impact.taskCount} nhiệm vụ thường quy
                        </Typography>
                      </li>
                    )}
                    {impact.activeTaskCount > 0 && (
                      <li>
                        <Typography variant="caption">
                          {impact.activeTaskCount} công việc đang thực hiện
                        </Typography>
                      </li>
                    )}
                  </ul>
                </Box>
              )}

              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Hành động này không thể hoàn tác!
              </Typography>
            </Box>
          ),
          confirmText: "Xác nhận xóa",
          cancelText: "Hủy",
        });
      } else {
        // Step 4: Không có warning → confirm đơn giản
        setConfirmDialog({
          open: true,
          type: "remove",
          data: { relationId },
          title: "Xác nhận xóa",
          message:
            "Bạn có chắc muốn xóa nhân viên này khỏi danh sách chấm KPI?",
          details: "Hành động này sẽ loại bỏ quan hệ quản lý.",
        });
      }
    } catch (error) {
      toast.error(error.message || "Không thể kiểm tra điều kiện xóa");
    }
  },
  [currentNhanVienQuanLy]
);
```

---

## 📊 Summary Table - Validate Rules

| **Loại Quan Hệ** | **Điều Kiện**                        | **Level**  | **Hành Động**                                  |
| ---------------- | ------------------------------------ | ---------- | ---------------------------------------------- |
| **KPI**          | Có DanhGiaKPI CHUA_DUYET             | ❌ ERROR   | Chặn xóa, yêu cầu hoàn thành/xóa KPI trước     |
| **KPI**          | Có DanhGiaKPI DA_DUYET (30 ngày)     | ⚠️ WARNING | Cho phép xóa nhưng cảnh báo mất quyền chấm mới |
| **KPI**          | Có NhanVienNhiemVu active            | ⚠️ WARNING | Cho phép xóa nhưng cảnh báo mất quyền quản lý  |
| **KPI**          | Có chu kỳ KPI đang mở                | ⚠️ WARNING | Cho phép xóa nhưng cảnh báo không chấm được    |
| **Giao_Viec**    | Có CongViec DANG_THUC_HIEN/CHO_DUYET | ❌ ERROR   | Chặn xóa, yêu cầu hoàn thành/hủy trước         |
| **Giao_Viec**    | Có CongViec TAO_MOI/DA_GIAO          | ⚠️ WARNING | Cho phép xóa nhưng cảnh báo ảnh hưởng          |
| **Giao_Viec**    | Có CongViec HOAN_THANH (30 ngày)     | ℹ️ INFO    | Cho phép xóa, giữ lịch sử                      |

---

## 🎯 Implementation Checklist

### Backend (Priority: HIGH)

- [ ] **Tạo validation function** trong `quanLyNhanVienController.js`
  - [ ] Validate DanhGiaKPI pending
  - [ ] Validate DanhGiaKPI approved recent
  - [ ] Validate NhanVienNhiemVu active
  - [ ] Validate ChuKyDanhGia open
  - [ ] Validate CongViec active
  - [ ] Validate CongViec new/completed
- [ ] **Update xoaQuanHe endpoint**
  - [ ] Add `?validate=true` param để chỉ validate
  - [ ] Add `?confirmed=true` param để confirm xóa
  - [ ] Add `?force=true` param cho admin force delete
- [ ] **Tạo helper functions**
  - [ ] `validateDeleteKPIRelation(managerId, employeeId)`
  - [ ] `validateDeleteGiaoViecRelation(managerId, employeeId)`
  - [ ] `getImpactSummary(relation)`

### Frontend (Priority: HIGH)

- [ ] **Update DanhSachChamKPI.js**
  - [ ] Call validate API trước khi xóa
  - [ ] Hiển thị errors/warnings trong dialog
  - [ ] Hiển thị impact summary
  - [ ] Add confirmed flag khi user confirm
- [ ] **Update DanhSachGiaoViec.js**
  - [ ] Tương tự DanhSachChamKPI
- [ ] **Enhance ConfirmDialog component**
  - [ ] Support rich content (errors/warnings list)
  - [ ] Support multi-level confirmation
  - [ ] Add loading state khi validate

### Testing (Priority: MEDIUM)

- [ ] **Test cases cho validate logic**
  - [ ] Test xóa khi có KPI pending → blocked
  - [ ] Test xóa khi có KPI approved → warning
  - [ ] Test xóa khi có tasks active → blocked
  - [ ] Test xóa khi có tasks new → warning
  - [ ] Test force delete với admin
- [ ] **Test edge cases**
  - [ ] Multiple relations (KPI + Giao_Viec)
  - [ ] Xóa sau khi hoàn thành KPI/tasks
  - [ ] Restore relation (set isDeleted = false)

---

## 🔄 Alternative Solutions

### Option 1: **Soft Delete với Flag**

- Không xóa hẳn, chỉ set `isDeleted = true`
- Cho phép restore dễ dàng
- Giữ audit trail đầy đủ
- **✅ Recommended** - Đang dùng

### Option 2: **Archive Relationship**

- Thêm field `isArchived` để phân biệt với `isDeleted`
- `isArchived = true` → không active nhưng vẫn giữ quyền xem lịch sử
- `isDeleted = true` → hoàn toàn bị xóa
- **⚠️ Complex** - Cần thêm logic

### Option 3: **Cascade Soft Delete**

- Khi xóa QuanLyNhanVien → tự động soft delete DanhGiaKPI/CongViec liên quan
- **❌ Not Recommended** - Mất dữ liệu quan trọng

### Option 4: **Transfer Ownership**

- Cho phép chuyển quyền quản lý sang người khác trước khi xóa
- **⚠️ Complex** - Yêu cầu UI/UX phức tạp

---

## 📝 Conclusion

**Validate cần thiết:**

1. ✅ **Chặn xóa** khi:

   - Có đánh giá KPI đang CHUA_DUYET
   - Có công việc đang DANG_THUC_HIEN hoặc CHO_DUYET

2. ⚠️ **Cảnh báo nhưng cho phép xóa** khi:

   - Có đánh giá KPI đã duyệt gần đây (30 ngày)
   - Có nhiệm vụ thường quy đang active
   - Có chu kỳ KPI đang mở
   - Có công việc mới tạo/đã giao

3. ℹ️ **Thông tin** khi:
   - Có công việc đã hoàn thành gần đây
   - Có lịch sử quản lý lâu năm

**Priority implementation:**

1. Backend validation logic (HIGH)
2. Frontend confirmation dialog với details (HIGH)
3. Testing comprehensive (MEDIUM)
4. Documentation update (LOW)
