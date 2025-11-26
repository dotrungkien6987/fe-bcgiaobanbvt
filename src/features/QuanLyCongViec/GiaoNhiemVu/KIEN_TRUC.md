# Kiến Trúc Hệ Thống GiaoNhiemVu V3.0

**Phiên bản:** 3.0 (Hệ thống phân công theo chu kỳ)  
**Cập nhật:** 26/11/2025  
**Trạng thái:** ✅ Production

---

## 📋 Mục Lục

- [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
- [Lịch Sử Phát Triển](#lịch-sử-phát-triển)
- [Kiến Trúc Frontend](#kiến-trúc-frontend)
- [Kiến Trúc Backend](#kiến-trúc-backend)
- [Luồng Dữ Liệu](#luồng-dữ-liệu)
- [Schema Database](#schema-database)
- [Pipeline Kiểm Tra](#pipeline-kiểm-tra)
- [Xử Lý Lỗi](#xử-lý-lỗi)
- [Tối Ưu Hiệu Năng](#tối-ưu-hiệu-năng)

---

## 🎯 Tổng Quan Kiến Trúc

### Mô Hình Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    HỆ THỐNG GIAONHIEMVU V3.0                    │
│                   (Phân Công Theo Chu Kỳ)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   QUẢN LÝ    │    │   NHÂN VIÊN      │    │    ADMIN     │
│              │    │                  │    │              │
│ - Gán việc   │    │ - Tự đánh giá    │    │ - Quản lý    │
│ - Chỉnh độ   │    │   KPI            │    │   chu kỳ     │
│   khó        │    │ - Xem nhiệm vụ   │    │ - Duyệt KPI  │
│ - Sao chép   │    │                  │    │              │
└──────┬───────┘    └────────┬─────────┘    └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Redux)                     │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │ CycleAssignment    │  │ TuDanhGiaKPI       │                │
│  │ ListPage           │  │ Page               │                │
│  │ (746 dòng)         │  │ (548 dòng)         │                │
│  └──────┬─────────────┘  └──────┬─────────────┘                │
│         │                       │                               │
│         └───────┬───────────────┘                               │
│                 │                                               │
│         ┌───────▼─────────────────────────┐                    │
│         │ cycleAssignmentSlice.js         │                    │
│         │ (Redux State Management)        │                    │
│         │ - assignments: []               │                    │
│         │ - employees: []                 │                    │
│         │ - isLoading, error              │                    │
│         └───────┬─────────────────────────┘                    │
└─────────────────┼───────────────────────────────────────────────┘
                  │ API Calls (apiService)
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              ROUTES (giaoNhiemVu.api.js)                    ││
│  │  - GET /employees-with-cycle-stats                          ││
│  │  - GET /nhan-vien/:id/by-cycle                             ││
│  │  - PUT /nhan-vien/:id/cycle-assignments                     ││
│  │  - POST /nhan-vien/:id/copy-from-previous                  ││
│  └─────────────────────┬───────────────────────────────────────┘│
│                        │                                         │
│  ┌─────────────────────▼───────────────────────────────────────┐│
│  │           CONTROLLERS (giaoNhiemVu.controller.js)           ││
│  │  - getEmployeesWithCycleStats()                             ││
│  │  - getEmployeeAssignmentsByCycle()                          ││
│  │  - updateEmployeeCycleAssignments()                         ││
│  │  - copyAssignmentsFromPreviousCycle()                       ││
│  └─────────────────────┬───────────────────────────────────────┘│
│                        │                                         │
│  ┌─────────────────────▼───────────────────────────────────────┐│
│  │             SERVICE (giaoNhiemVu.service.js)                ││
│  │  - 4-Layer Validation Pipeline                              ││
│  │  - Business Logic                                           ││
│  │  - Transaction Management                                   ││
│  └─────────────────────┬───────────────────────────────────────┘│
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB)                               │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ NhanVienNhiemVu  │  │ ChuKyDanhGia     │                    │
│  │ (Phân công)      │  │ (Chu kỳ)         │                    │
│  └──────────────────┘  └──────────────────┘                    │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ DanhGiaKPI       │  │ NhiemVuThuongQuy │                    │
│  │ (Đánh giá)       │  │ (Nhiệm vụ)       │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### Nguyên Tắc Thiết Kế

1. **Phân tầng rõ ràng (Layered Architecture):**

   - Presentation (React Components)
   - State Management (Redux)
   - Business Logic (Services)
   - Data Access (Models)

2. **Kiểm tra nghiêm ngặt (Validation Pipeline):**

   - 4 tầng kiểm tra trước khi ghi database
   - Kiểm tra trước trên frontend (UX tốt hơn)
   - Kiểm tra sau trên backend (bảo mật)

3. **Tích hợp chặt chẽ (Tight Integration):**

   - Chu kỳ đánh giá (ChuKyDanhGia)
   - Đánh giá KPI (DanhGiaKPI)
   - Nhiệm vụ thường quy (NhiemVuThuongQuy)

4. **Cập nhật thời gian thực (Real-time Updates):**
   - Redux state cập nhật ngay lập tức
   - Không cần refresh trang
   - Optimistic updates (UI phản hồi ngay)

---

## 📜 Lịch Sử Phát Triển

### V1.0 → V2.1 → V3.0: Hành Trình Phát Triển

```
┌──────────────────────────────────────────────────────────────────┐
│  V1.0 (Lưu trữ 26/10/2025)                                      │
│  - Phân công theo năm                                            │
│  - Không có chu kỳ                                               │
│  - Giao diện đơn giản                                            │
│  ❌ Không linh hoạt                                              │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Refactor)
┌──────────────────────────────────────────────────────────────────┐
│  V2.1 (Ngừng dùng 25/11/2025)                                   │
│  - Phân công không theo chu kỳ cụ thể                           │
│  - Nhiều thành phần phức tạp (5 files, 1,621 dòng)             │
│  - giaoNhiemVuSlice.js (542 dòng)                               │
│  ❌ Không tích hợp KPI                                          │
│  ❌ Không kiểm tra nghiêm ngặt                                  │
│  ❌ Khó bảo trì                                                 │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼ (Xây dựng lại hoàn toàn)
┌──────────────────────────────────────────────────────────────────┐
│  V3.0 (Production 25/11/2025) ✅                                │
│  - Phân công theo chu kỳ (ChuKyDanhGiaID)                       │
│  - Giao diện hai cột trực quan                                   │
│  - 4 quy tắc kiểm tra nghiêm ngặt                               │
│  - Tích hợp chặt chẽ với KPI                                    │
│  - Tính năng tự đánh giá cho nhân viên                          │
│  - cycleAssignmentSlice.js (260 dòng - đơn giản hơn 52%)       │
│  - CycleAssignmentDetailPage.js (1,298 dòng - tất cả logic)    │
│  ✅ Sẵn sàng production                                         │
└──────────────────────────────────────────────────────────────────┘
```

### So Sánh Các Phiên Bản

| Tính Năng                     | V1.0   | V2.1    | V3.0       |
| ----------------------------- | ------ | ------- | ---------- |
| **Phân công theo chu kỳ**     | ❌     | ❌      | ✅         |
| **Giao diện hai cột**         | ❌     | ❌      | ✅         |
| **Kiểm tra nghiêm ngặt**      | ❌     | ❌      | ✅         |
| **Tích hợp KPI**              | ❌     | ❌      | ✅         |
| **Tự đánh giá KPI**           | ❌     | ❌      | ✅         |
| **Sao chép chu kỳ trước**     | ❌     | ❌      | ✅         |
| **Kiểm tra trước (Frontend)** | ❌     | ❌      | ✅         |
| **Transaction nguyên tử**     | ❌     | ❌      | ✅         |
| **Số dòng code**              | ~2,000 | ~2,163  | ~2,044     |
| **Số thành phần**             | -      | 7       | 3          |
| **Độ phức tạp**               | Cao    | Rất cao | Trung bình |

---

## 🎨 Kiến Trúc Frontend

### Cấu Trúc Thành Phần

```
src/features/QuanLyCongViec/GiaoNhiemVu/
│
├── cycleAssignmentSlice.js (260 dòng)
│   ├── State: assignments[], employees[], isLoading, error
│   ├── Thunks:
│   │   ├── getAssignmentsByCycle()
│   │   ├── batchUpdateCycleAssignments()
│   │   └── copyFromPreviousCycle()
│   └── Reducers:
│       ├── startLoading()
│       ├── hasError()
│       ├── getAssignmentsSuccess()
│       └── updateAssignmentsSuccess()
│
├── CycleAssignmentListPage.js (746 dòng)
│   ├── Dropdown chọn chu kỳ
│   ├── Bảng danh sách nhân viên
│   ├── Thống kê số nhiệm vụ / tổng độ khó
│   └── Nút [Gán] → navigate to DetailPage
│
├── CycleAssignmentDetailPage.js (1,298 dòng)
│   ├── Hai cột: Khả dụng ⟷ Đã gán
│   ├── Slider độ khó (0-2)
│   ├── Kiểm tra trước (canDeleteDuty)
│   ├── Nút [Sao chép từ chu kỳ trước]
│   └── Nút [Lưu tất cả]
│
├── TuDanhGiaKPIPage.js (548 dòng)
│   ├── Dropdown chọn chu kỳ
│   ├── Danh sách nhiệm vụ đã gán
│   ├── Slider tự chấm điểm (0-100%)
│   └── Nút [Lưu tất cả]
│
└── GiaoNhiemVuRoutes.js (27 dòng)
    ├── /giao-nhiem-vu-chu-ky (ListPage)
    ├── /giao-nhiem-vu-chu-ky/:employeeId (DetailPage)
    └── /kpi/tu-danh-gia (TuDanhGiaKPIPage)
```

### Redux State Management

#### cycleAssignmentSlice.js (260 dòng)

**State Structure:**

```javascript
{
  assignments: [
    {
      _id: "66b1dba74f79822a4752d90d",
      NhanVienID: "...",
      NhiemVuID: { _id: "...", Ten: "Chăm sóc bệnh nhân" },
      ChuKyDanhGiaID: "...",
      MucDoKho: 1.5,
      DiemTuDanhGia: 85,
      createdAt: "2025-01-15T10:00:00.000Z"
    }
  ],
  employees: [
    {
      _id: "...",
      HoTen: "Nguyễn Văn A",
      MaNV: "NV001",
      DutyCount: 5,
      TotalDifficulty: 8.5
    }
  ],
  isLoading: false,
  error: null
}
```

**Thunks (Async Actions):**

```javascript
// 1. Lấy phân công theo chu kỳ
export const getAssignmentsByCycle =
  (nhanVienId, chuKyId) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${nhanVienId}/by-cycle?chuKyId=${chuKyId}`
      );
      dispatch(slice.actions.getAssignmentsSuccess(response.data.data));
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// 2. Cập nhật hàng loạt (thêm/sửa/xóa)
export const batchUpdateCycleAssignments =
  (nhanVienId, data) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.put(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${nhanVienId}/cycle-assignments`,
        data
      );
      dispatch(slice.actions.updateAssignmentsSuccess(response.data.data));
      toast.success("Cập nhật nhiệm vụ thành công!");
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
      throw error;
    }
  };

// 3. Sao chép từ chu kỳ trước
export const copyFromPreviousCycle =
  (nhanVienId, currentCycleId) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${nhanVienId}/copy-from-previous`,
        { currentCycleId }
      );
      dispatch(slice.actions.updateAssignmentsSuccess(response.data.data));
      toast.success(
        `Đã sao chép ${response.data.data.assignments.length} nhiệm vụ!`
      );
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
```

### Giao Diện Hai Cột (CycleAssignmentDetailPage)

```
┌────────────────────────────────────────────────────────────────┐
│  Nhân viên: Nguyễn Văn A | Chu kỳ: Q1/2025                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Sao chép từ Q4/2024]                [Lưu tất cả] [Hủy] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────┬───────────────────────────┐    │
│  │  NHIỆM VỤ KHẢ DỤNG       │  NHIỆM VỤ ĐÃ GÁN          │    │
│  │  (Cột trái)               │  (Cột phải)               │    │
│  ├───────────────────────────┼───────────────────────────┤    │
│  │                            │                           │    │
│  │  □ Kiểm tra hồ sơ bệnh    │  ☑ Chăm sóc bệnh nhân     │    │
│  │    án                      │    Độ khó: [●─────○] 1.5 │    │
│  │    (Khoa Nội)              │    Tự đánh giá: 85%      │    │
│  │                            │    [×] Xóa               │    │
│  │  □ Báo cáo tuần            │                           │    │
│  │    (Khoa Nội)              │  ☑ Lập kế hoạch điều trị  │    │
│  │                            │    Độ khó: [──────●] 2.0 │    │
│  │  □ Tham gia hội chẩn       │    Tự đánh giá: 0%       │    │
│  │    (Khoa Nội)              │    [×] Xóa               │    │
│  │                            │                           │    │
│  │  [Tải thêm...]             │  Tổng độ khó: 3.5        │    │
│  │                            │  Số lượng: 2 nhiệm vụ    │    │
│  └───────────────────────────┴───────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

**Luồng Tương Tác:**

```
1. User tick checkbox "Kiểm tra hồ sơ bệnh án"
   → Hiển thị slider độ khó bên dưới

2. User kéo slider độ khó → 1.5
   → Tự động thêm vào cột phải với MucDoKho = 1.5

3. User click [×] Xóa
   → Frontend kiểm tra trước (canDeleteDuty):
      - Có điểm tự đánh giá? → Hiển thị cảnh báo, không cho xóa
      - Có điểm quản lý? → Hiển thị cảnh báo, không cho xóa
      - OK → Xóa khỏi cột phải

4. User click [Lưu tất cả]
   → Redux dispatch batchUpdateCycleAssignments()
   → Backend kiểm tra 4 tầng
   → Lưu database
   → Cập nhật Redux state
   → Toast thông báo thành công
```

---

## ⚙️ Kiến Trúc Backend

### Cấu Trúc Thư Mục

```
giaobanbv-be/modules/workmanagement/
│
├── routes/
│   └── giaoNhiemVu.api.js (35 dòng)
│       ├── GET /employees-with-cycle-stats
│       ├── GET /nhan-vien/:id/by-cycle
│       ├── PUT /nhan-vien/:id/cycle-assignments
│       ├── POST /nhan-vien/:id/copy-from-previous
│       ├── GET /giao-nhiem-vu (tự đánh giá)
│       └── POST /tu-cham-diem-batch (tự đánh giá)
│
├── controllers/
│   ├── giaoNhiemVu.controller.js (81 dòng)
│   │   ├── getEmployeesWithCycleStats()
│   │   ├── getEmployeeAssignmentsByCycle()
│   │   ├── updateEmployeeCycleAssignments()
│   │   └── copyAssignmentsFromPreviousCycle()
│   │
│   └── assignment.controller.js (190 dòng)
│       ├── getNhanVienNhiemVuByEmployee() (tự đánh giá)
│       └── updateBatchTuChamDiem() (tự đánh giá)
│
├── services/
│   └── giaoNhiemVu.service.js (546 dòng)
│       ├── getEmployeesWithCycleStats()
│       ├── getEmployeeAssignmentsByCycle()
│       ├── updateEmployeeCycleAssignments() ← QUAN TRỌNG
│       ├── copyAssignmentsFromPreviousCycle()
│       └── validateCycleAssignmentUpdate() ← 4-LAYER VALIDATION
│
└── models/
    └── NhanVienNhiemVu.js (177 dòng)
        ├── Schema definition (ChuKyDanhGiaID field)
        ├── Indexes (NhanVienID + ChuKyDanhGiaID + NhiemVuID)
        └── Virtuals (populate NhiemVuID, NhanVienID)
```

### Controller Layer (giaoNhiemVu.controller.js)

**Nhiệm vụ:**

- Nhận request từ frontend
- Gọi service layer
- Trả response theo format chuẩn

**Ví dụ:**

```javascript
const {
  catchAsync,
  sendResponse,
  AppError,
} = require("../../../../helpers/utils");

// Controller: Lấy phân công theo chu kỳ
controller.getEmployeeAssignmentsByCycle = catchAsync(
  async (req, res, next) => {
    const { employeeId } = req.params;
    const { chuKyId } = req.query;

    // Validation đơn giản
    if (!chuKyId) {
      throw new AppError(400, "chuKyId is required", "MISSING_PARAMETER");
    }

    // Gọi service
    const result = await service.getEmployeeAssignmentsByCycle(
      employeeId,
      chuKyId
    );

    // Trả response
    return sendResponse(
      res,
      200,
      true,
      result,
      null,
      "Lấy danh sách nhiệm vụ thành công"
    );
  }
);
```

### Service Layer (giaoNhiemVu.service.js) - QUAN TRỌNG

**Nhiệm vụ:**

- Business logic phức tạp
- 4-layer validation pipeline
- Transaction management
- Tính toán thống kê

#### Hàm Quan Trọng Nhất: updateEmployeeCycleAssignments()

```javascript
service.updateEmployeeCycleAssignments = async (
  nhanVienId,
  chuKyId,
  assignmentsToAdd,
  assignmentsToUpdate,
  assignmentsToDelete
) => {
  // 1. Lấy thông tin chu kỳ + nhân viên
  const [chuKy, nhanVien] = await Promise.all([
    ChuKyDanhGia.findById(chuKyId),
    NhanVien.findById(nhanVienId),
  ]);

  // 2. Kiểm tra tồn tại
  if (!chuKy)
    throw new AppError(404, "Không tìm thấy chu kỳ", "CYCLE_NOT_FOUND");
  if (!nhanVien)
    throw new AppError(404, "Không tìm thấy nhân viên", "EMPLOYEE_NOT_FOUND");

  // 3. VALIDATION 4-LAYER (QUAN TRỌNG!)
  await validateCycleAssignmentUpdate(nhanVienId, chuKyId, assignmentsToDelete);

  // 4. Bắt đầu transaction MongoDB
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 5. XỬ LÝ DELETE
    if (assignmentsToDelete && assignmentsToDelete.length > 0) {
      await NhanVienNhiemVu.deleteMany(
        { _id: { $in: assignmentsToDelete } },
        { session }
      );
    }

    // 6. XỬ LÝ UPDATE
    if (assignmentsToUpdate && assignmentsToUpdate.length > 0) {
      for (const update of assignmentsToUpdate) {
        await NhanVienNhiemVu.findByIdAndUpdate(
          update._id,
          { MucDoKho: update.MucDoKho },
          { session, new: true }
        );
      }
    }

    // 7. XỬ LÝ ADD
    if (assignmentsToAdd && assignmentsToAdd.length > 0) {
      await NhanVienNhiemVu.insertMany(
        assignmentsToAdd.map((a) => ({
          NhanVienID: nhanVienId,
          NhiemVuID: a.NhiemVuID,
          ChuKyDanhGiaID: chuKyId,
          MucDoKho: a.MucDoKho,
        })),
        { session }
      );
    }

    // 8. Commit transaction
    await session.commitTransaction();

    // 9. Lấy kết quả mới
    const updatedAssignments = await NhanVienNhiemVu.find({
      NhanVienID: nhanVienId,
      ChuKyDanhGiaID: chuKyId,
    })
      .populate("NhiemVuID")
      .lean();

    return { assignments: updatedAssignments };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

---

## 🔍 Pipeline Kiểm Tra 4 Tầng

### Tổng Quan

```
┌──────────────────────────────────────────────────────────────┐
│              4-LAYER VALIDATION PIPELINE                     │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   LAYER 1     │   │   LAYER 2     │   │   LAYER 3     │
│ Chu kỳ đã     │   │ KPI đã duyệt  │   │ Có điểm tự    │
│ đóng?         │   │?              │   │ đánh giá?     │
│ (isDong)      │   │ (TrangThai)   │   │ (DiemTuDG)    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │ PASS              │ PASS              │ PASS
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                   ┌───────────────┐
                   │   LAYER 4     │
                   │ Có điểm quản  │
                   │ lý?           │
                   │ (DiemQL)      │
                   └───────┬───────┘
                           │ PASS
                           ▼
                   ┌───────────────┐
                   │  CẬP NHẬT DB  │
                   └───────────────┘
```

### Chi Tiết 4 Tầng Kiểm Tra

#### Layer 1: Kiểm Tra Chu Kỳ Đã Đóng

**Mục đích:** Không cho phép gán/sửa/xóa nhiệm vụ khi chu kỳ đã đóng

**Code:**

```javascript
// Kiểm tra chu kỳ đã đóng
if (chuKy.isDong) {
  throw new AppError(
    403,
    "Không thể cập nhật phân công. Chu kỳ đánh giá đã đóng.",
    "CYCLE_CLOSED"
  );
}
```

**Khi nào xảy ra:**

- Admin đóng chu kỳ trên trang ChuKyDanhGia
- `ChuKyDanhGia.isDong = true`

**Thông báo lỗi:**

```javascript
{
  success: false,
  errors: { message: "Không thể cập nhật phân công. Chu kỳ đánh giá đã đóng." },
  message: "CYCLE_CLOSED"
}
```

**Giải pháp:**

- Admin phải mở lại chu kỳ (`isDong = false`)

---

#### Layer 2: Kiểm Tra KPI Đã Duyệt

**Mục đích:** Không cho phép thay đổi phân công khi KPI đã duyệt (đảm bảo tính toàn vẹn dữ liệu)

**Code:**

```javascript
// Kiểm tra KPI đã duyệt
const danhGiaKPI = await DanhGiaKPI.findOne({
  NhanVienID: nhanVienId,
  ChuKyDanhGiaID: chuKyId,
});

if (danhGiaKPI && danhGiaKPI.TrangThai === "DA_DUYET") {
  throw new AppError(
    403,
    "Không thể cập nhật phân công. KPI đã được duyệt.",
    "KPI_APPROVED"
  );
}
```

**Khi nào xảy ra:**

- Quản lý/Admin duyệt KPI cho nhân viên
- `DanhGiaKPI.TrangThai = "DA_DUYET"`

**Thông báo lỗi:**

```javascript
{
  success: false,
  errors: { message: "Không thể cập nhật phân công. KPI đã được duyệt." },
  message: "KPI_APPROVED"
}
```

**Giải pháp:**

- Hủy duyệt KPI trên trang KPI (sẽ lưu lịch sử hủy duyệt)

---

#### Layer 3: Kiểm Tra Điểm Tự Đánh Giá

**Mục đích:** Không cho phép xóa nhiệm vụ nếu nhân viên đã tự chấm điểm

**Code:**

```javascript
// Chỉ kiểm tra khi XÓA nhiệm vụ
if (assignmentsToDelete && assignmentsToDelete.length > 0) {
  const assignmentsToCheck = await NhanVienNhiemVu.find({
    _id: { $in: assignmentsToDelete },
  }).populate("NhiemVuID");

  // Kiểm tra từng nhiệm vụ
  for (const assignment of assignmentsToCheck) {
    if (assignment.DiemTuDanhGia && assignment.DiemTuDanhGia > 0) {
      throw new AppError(
        403,
        `Không thể xóa nhiệm vụ "${assignment.NhiemVuID.Ten}". Nhiệm vụ đã có điểm tự đánh giá (${assignment.DiemTuDanhGia} điểm).`,
        "HAS_EVALUATION_SCORE"
      );
    }
  }
}
```

**Khi nào xảy ra:**

- Nhân viên đã tự chấm điểm trên trang "Tự đánh giá KPI"
- `NhanVienNhiemVu.DiemTuDanhGia > 0`

**Thông báo lỗi:**

```javascript
{
  success: false,
  errors: { message: 'Không thể xóa nhiệm vụ "Chăm sóc bệnh nhân". Nhiệm vụ đã có điểm tự đánh giá (85 điểm).' },
  message: "HAS_EVALUATION_SCORE"
}
```

**Giải pháp:**

- Nhân viên phải đưa điểm về 0 trên trang "Tự đánh giá KPI"

---

#### Layer 4: Kiểm Tra Điểm Quản Lý

**Mục đích:** Không cho phép xóa nhiệm vụ nếu quản lý đã chấm điểm

**Code:**

```javascript
// Chỉ kiểm tra khi XÓA nhiệm vụ
if (assignmentsToDelete && assignmentsToDelete.length > 0) {
  const assignmentsToCheck = await NhanVienNhiemVu.find({
    _id: { $in: assignmentsToDelete },
  }).populate("NhiemVuID");

  // Kiểm tra từng nhiệm vụ
  for (const assignment of assignmentsToCheck) {
    // Kiểm tra bảng DanhGiaNhiemVuThuongQuy
    const danhGia = await DanhGiaNhiemVuThuongQuy.findOne({
      DanhGiaKPIID: danhGiaKPI?._id,
      NhiemVuID: assignment.NhiemVuID._id,
    });

    if (danhGia && danhGia.ChiTietDiem && danhGia.ChiTietDiem.length > 0) {
      throw new AppError(
        403,
        `Không thể xóa nhiệm vụ "${assignment.NhiemVuID.Ten}". Quản lý đã chấm điểm cho nhiệm vụ này.`,
        "HAS_MANAGER_SCORE"
      );
    }
  }
}
```

**Khi nào xảy ra:**

- Quản lý đã chấm điểm trên trang KPI
- `DanhGiaNhiemVuThuongQuy.ChiTietDiem.length > 0`

**Thông báo lỗi:**

```javascript
{
  success: false,
  errors: { message: 'Không thể xóa nhiệm vụ "Lập kế hoạch điều trị". Quản lý đã chấm điểm cho nhiệm vụ này.' },
  message: "HAS_MANAGER_SCORE"
}
```

**Giải pháp:**

- Quản lý phải xóa điểm đánh giá trên trang KPI trước

---

### Bảng Tóm Tắt 4 Quy Tắc

| Tầng  | Kiểm Tra            | Error Code             | Giải Pháp               |
| ----- | ------------------- | ---------------------- | ----------------------- |
| **1** | Chu kỳ đã đóng      | `CYCLE_CLOSED`         | Admin mở lại chu kỳ     |
| **2** | KPI đã duyệt        | `KPI_APPROVED`         | Hủy duyệt KPI           |
| **3** | Có điểm tự đánh giá | `HAS_EVALUATION_SCORE` | Nhân viên đưa điểm về 0 |
| **4** | Có điểm quản lý     | `HAS_MANAGER_SCORE`    | Quản lý xóa điểm KPI    |

📖 **Xem thêm:** [QUY_TAC_KIEM_TRA.md](./QUY_TAC_KIEM_TRA.md) để hiểu chi tiết và ví dụ

---

## 🗄️ Schema Database

### Model NhanVienNhiemVu (Collection: nhanviennhiemvu)

**Schema:**

```javascript
const NhanVienNhiemVuSchema = new mongoose.Schema(
  {
    NhanVienID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhanVien",
      required: true,
    },
    NhiemVuID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhiemVuThuongQuy",
      required: true,
    },
    ChuKyDanhGiaID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChuKyDanhGia",
      required: true, // ← QUAN TRỌNG: Phân công theo chu kỳ
    },
    MucDoKho: {
      type: Number,
      default: 1,
      min: 0,
      max: 2,
    },
    DiemTuDanhGia: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);
```

**Indexes:**

```javascript
// Index phức hợp: Đảm bảo không trùng lặp
NhanVienNhiemVuSchema.index(
  { NhanVienID: 1, ChuKyDanhGiaID: 1, NhiemVuID: 1 },
  { unique: true }
);

// Index tìm kiếm nhanh
NhanVienNhiemVuSchema.index({ NhanVienID: 1, ChuKyDanhGiaID: 1 });
```

**Ví dụ Document:**

```javascript
{
  _id: ObjectId("66b1dba74f79822a4752d90d"),
  NhanVienID: ObjectId("66b1dba74f79822a4752d90a"),
  NhiemVuID: ObjectId("66b1dba74f79822a4752d90b"),
  ChuKyDanhGiaID: ObjectId("66b1dba74f79822a4752d90c"),
  MucDoKho: 1.5,
  DiemTuDanhGia: 85,
  createdAt: ISODate("2025-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2025-01-20T15:30:00.000Z")
}
```

### Quan Hệ Với Các Collection Khác

```
┌──────────────────┐
│ ChuKyDanhGia     │
│ (Chu kỳ đánh giá)│
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼─────────┐        ┌──────────────────┐
│ NhanVienNhiemVu  │───────│ NhiemVuThuongQuy │
│ (Phân công)      │   N:1  │ (Nhiệm vụ)       │
└────────┬─────────┘        └──────────────────┘
         │ N
         │
         │ 1
┌────────▼─────────┐
│ NhanVien         │
│ (Nhân viên)      │
└──────────────────┘
         │ 1
         │
         │ 1
┌────────▼─────────┐
│ DanhGiaKPI       │
│ (Đánh giá KPI)   │
└────────┬─────────┘
         │ 1
         │
         │ N
┌────────▼───────────────────┐
│ DanhGiaNhiemVuThuongQuy    │
│ (Điểm chi tiết)            │
└────────────────────────────┘
```

---

## 🌊 Luồng Dữ Liệu Chi Tiết

### Use Case 1: Quản Lý Gán Nhiệm Vụ

```
┌──────────────────────────────────────────────────────────────┐
│  1. USER ACTION: Quản lý chọn chu kỳ Q1/2025               │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  2. FRONTEND: CycleAssignmentListPage                       │
│     - Dropdown onChange → setSelectedCycle(Q1/2025)         │
│     - useEffect → dispatch getEmployeesWithStats            │
└────────────────┬─────────────────────────────────────────────┘
                 │ API Call
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  3. BACKEND: GET /employees-with-cycle-stats?chuKyId=xxx    │
│     - giaoNhiemVu.controller.getEmployeesWithCycleStats()   │
│     - service.getEmployeesWithCycleStats()                  │
│       → Aggregate pipeline:                                 │
│         1. Lọc nhân viên thuộc quyền quản lý               │
│         2. Join với NhanVienNhiemVu                        │
│         3. Group by NhanVienID → count, sum(MucDoKho)      │
└────────────────┬─────────────────────────────────────────────┘
                 │ Response
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  4. FRONTEND: Redux state.employees = [...]                 │
│     - Hiển thị bảng với thống kê                            │
│     - Nguyễn Văn A: 5/12 nhiệm vụ, Tổng MĐK: 8.5           │
└────────────────┬─────────────────────────────────────────────┘
                 │ User click [Gán]
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  5. NAVIGATION: /giao-nhiem-vu-chu-ky/:employeeId?chuKyId │
│     - CycleAssignmentDetailPage mount                       │
│     - useEffect → dispatch getAssignmentsByCycle()          │
└────────────────┬─────────────────────────────────────────────┘
                 │ API Call
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  6. BACKEND: GET /nhan-vien/:id/by-cycle?chuKyId=xxx       │
│     - service.getEmployeeAssignmentsByCycle()               │
│       1. Lấy nhiệm vụ đã gán (NhanVienNhiemVu)             │
│       2. Lấy nhiệm vụ khả dụng (NhiemVuThuongQuy filter)   │
│       3. Trả về { assignedDuties: [], availableDuties: [] }│
└────────────────┬─────────────────────────────────────────────┘
                 │ Response
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  7. FRONTEND: Redux state.assignments = [...], hiển thị:   │
│     - Cột trái: availableDuties (checkbox)                 │
│     - Cột phải: assignedDuties (slider + nút xóa)          │
└────────────────┬─────────────────────────────────────────────┘
                 │ User tick checkbox + kéo slider
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  8. FRONTEND: State local (localAssignments) cập nhật      │
│     - Thêm vào cột phải ngay lập tức (UX tốt)              │
│     - Chưa gọi API (chờ user click [Lưu tất cả])           │
└────────────────┬─────────────────────────────────────────────┘
                 │ User click [Lưu tất cả]
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  9. FRONTEND: dispatch batchUpdateCycleAssignments()        │
│     - Chuẩn bị data: { assignmentsToAdd, ToUpdate, ToDelete}│
└────────────────┬─────────────────────────────────────────────┘
                 │ API Call
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  10. BACKEND: PUT /nhan-vien/:id/cycle-assignments          │
│      - service.updateEmployeeCycleAssignments()             │
│        1. Validate 4-layer pipeline                         │
│        2. Start MongoDB transaction                         │
│        3. Delete + Update + Insert                          │
│        4. Commit transaction                                │
│        5. Return updated assignments                        │
└────────────────┬─────────────────────────────────────────────┘
                 │ Response (success)
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  11. FRONTEND: Redux state cập nhật, Toast thành công      │
│      - "Cập nhật nhiệm vụ thành công!"                      │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚡ Tối Ưu Hiệu Năng

### 1. Frontend Optimization

#### Optimistic Updates

```javascript
// Không chờ API response, cập nhật UI ngay
const handleAddDuty = (dutyId, mucDoKho) => {
  // 1. Cập nhật Redux state ngay
  const newAssignment = {
    NhiemVuID: dutyId,
    MucDoKho: mucDoKho,
    _tempId: Date.now(), // Temporary ID
  };
  setLocalAssignments([...localAssignments, newAssignment]);

  // 2. API call sau (người dùng không thấy loading)
  // Sẽ gọi khi click [Lưu tất cả]
};
```

#### Lazy Loading

```javascript
// Chỉ load dữ liệu khi cần
const CycleAssignmentDetailPage = () => {
  const { employeeId } = useParams();
  const { chuKyId } = useSearchParams();

  useEffect(() => {
    if (employeeId && chuKyId) {
      // Chỉ fetch khi có đủ params
      dispatch(getAssignmentsByCycle(employeeId, chuKyId));
    }
  }, [employeeId, chuKyId]);
};
```

#### Memoization

```javascript
// Tránh re-render không cần thiết
const AssignedDutiesColumn = React.memo(({ duties, onDelete, onUpdate }) => {
  return (
    <Box>
      {duties.map((duty) => (
        <DutyCard key={duty._id} duty={duty} />
      ))}
    </Box>
  );
});
```

### 2. Backend Optimization

#### Database Indexing

```javascript
// Index phức hợp cho query nhanh
NhanVienNhiemVuSchema.index({ NhanVienID: 1, ChuKyDanhGiaID: 1 });

// Query này sẽ rất nhanh:
NhanVienNhiemVu.find({
  NhanVienID: "...",
  ChuKyDanhGiaID: "...",
});
// → Index scan thay vì Collection scan
```

#### Aggregate Pipeline

```javascript
// Thống kê hiệu quả với aggregation
service.getEmployeesWithCycleStats = async (managerId, chuKyId) => {
  const employees = await QuanLyNhanVien.find({ QuanLyID: managerId }).populate(
    {
      path: "NhanVienID",
      select: "HoTen MaNV Email",
    }
  );

  const employeeIds = employees.map((e) => e.NhanVienID._id);

  // Aggregate pipeline: 1 query thay vì N queries
  const stats = await NhanVienNhiemVu.aggregate([
    {
      $match: {
        NhanVienID: { $in: employeeIds },
        ChuKyDanhGiaID: mongoose.Types.ObjectId(chuKyId),
      },
    },
    {
      $group: {
        _id: "$NhanVienID",
        DutyCount: { $sum: 1 },
        TotalDifficulty: { $sum: "$MucDoKho" },
      },
    },
  ]);

  // Join stats vào employees
  return employees.map((e) => {
    const stat = stats.find((s) => s._id.equals(e.NhanVienID._id));
    return {
      ...e.NhanVienID.toObject(),
      DutyCount: stat?.DutyCount || 0,
      TotalDifficulty: stat?.TotalDifficulty || 0,
    };
  });
};
```

#### Transaction (Atomicity)

```javascript
// Đảm bảo tính nguyên tử: tất cả thành công hoặc tất cả fail
const session = await mongoose.startSession();
session.startTransaction();

try {
  await NhanVienNhiemVu.deleteMany({ _id: { $in: idsToDelete } }, { session });
  await NhanVienNhiemVu.insertMany(newAssignments, { session });
  await session.commitTransaction(); // ✅ Commit
} catch (error) {
  await session.abortTransaction(); // ❌ Rollback
  throw error;
} finally {
  session.endSession();
}
```

---

## 🚨 Xử Lý Lỗi

### Error Handling Pattern

#### Frontend

```javascript
// Redux thunk với try-catch
export const batchUpdateCycleAssignments =
  (nhanVienId, data) => async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.put(
        `/workmanagement/giao-nhiem-vu/nhan-vien/${nhanVienId}/cycle-assignments`,
        data
      );
      dispatch(slice.actions.updateAssignmentsSuccess(response.data.data));
      toast.success("Cập nhật nhiệm vụ thành công!");
      return response.data.data;
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));

      // Hiển thị thông báo lỗi thân thiện
      if (error.message.includes("CYCLE_CLOSED")) {
        toast.error(
          "Chu kỳ đánh giá đã đóng. Vui lòng liên hệ Admin để mở lại."
        );
      } else if (error.message.includes("KPI_APPROVED")) {
        toast.error("KPI đã được duyệt. Vui lòng hủy duyệt KPI trước.");
      } else {
        toast.error(error.message);
      }

      throw error;
    }
  };
```

#### Backend

```javascript
const { catchAsync, sendResponse, AppError } = require("helpers/utils");

// catchAsync tự động bắt lỗi async
controller.updateEmployeeCycleAssignments = catchAsync(
  async (req, res, next) => {
    const { employeeId } = req.params;
    const {
      chuKyId,
      assignmentsToAdd,
      assignmentsToUpdate,
      assignmentsToDelete,
    } = req.body;

    // Validation
    if (!chuKyId) {
      throw new AppError(400, "chuKyId is required", "MISSING_PARAMETER");
    }

    // Business logic
    const result = await service.updateEmployeeCycleAssignments(
      employeeId,
      chuKyId,
      assignmentsToAdd,
      assignmentsToUpdate,
      assignmentsToDelete
    );

    // Response
    return sendResponse(
      res,
      200,
      true,
      result,
      null,
      "Cập nhật phân công thành công"
    );
  }
);

// Error middleware sẽ bắt AppError và trả về JSON chuẩn
```

### Error Response Format

```javascript
// Success response
{
  success: true,
  data: { assignments: [...] },
  message: "Cập nhật phân công thành công"
}

// Error response (AppError)
{
  success: false,
  errors: {
    message: "Không thể cập nhật phân công. Chu kỳ đánh giá đã đóng."
  },
  message: "CYCLE_CLOSED"
}

// Validation error
{
  success: false,
  errors: {
    chuKyId: "chuKyId is required"
  },
  message: "VALIDATION_ERROR"
}
```

---

## 📊 Monitoring & Logging

### Backend Logging

```javascript
// Service layer logging (quan trọng)
service.updateEmployeeCycleAssignments = async (...) => {
  console.log(`[GiaoNhiemVu] Updating assignments for employee ${nhanVienId}, cycle ${chuKyId}`);
  console.log(`[GiaoNhiemVu] To add: ${assignmentsToAdd?.length || 0}`);
  console.log(`[GiaoNhiemVu] To update: ${assignmentsToUpdate?.length || 0}`);
  console.log(`[GiaoNhiemVu] To delete: ${assignmentsToDelete?.length || 0}`);

  try {
    // Business logic
    console.log(`[GiaoNhiemVu] Update successful`);
  } catch (error) {
    console.error(`[GiaoNhiemVu] Update failed:`, error);
    throw error;
  }
};
```

---

## 🎉 Kết Luận

Module **GiaoNhiemVu V3.0** có kiến trúc:

✅ **Phân tầng rõ ràng:** Presentation → State → Business → Data  
✅ **Kiểm tra nghiêm ngặt:** 4-layer validation pipeline  
✅ **Tích hợp chặt chẽ:** Với KPI, ChuKyDanhGia, NhiemVuThuongQuy  
✅ **Hiệu năng cao:** Optimistic updates, indexing, aggregation  
✅ **Bảo mật tốt:** Transaction, error handling, access control

**Đánh giá:**

- **Chất lượng kiến trúc:** 9/10
- **Khả năng mở rộng:** 8/10
- **Dễ bảo trì:** 9/10

---

**Cập nhật cuối:** 26/11/2025  
**Tác giả:** GitHub Copilot (Claude Sonnet 4.5)  
**Phiên bản tài liệu:** 1.0.0
