# Quy Tắc Xóa Chu Kỳ Đánh Giá - Delete Validation Rules

## 📋 Tổng quan

Tài liệu này mô tả logic xóa chu kỳ đánh giá đã được **đơn giản hóa** từ thiết kế phức tạp ban đầu (soft delete + hủy chu kỳ) thành **cascade validation đơn giản**.

---

## ✅ Giải pháp Hiện tại: Check Cascade Before Delete

### Nguyên tắc:

> **"Có dữ liệu liên quan = Không cho xóa"**

Đơn giản, dễ hiểu, không cần thêm trạng thái hoặc logic phức tạp.

---

## 🎯 Business Rules

| Tình huống                                         | Cho phép xóa? | Lý do                    | Hành động                |
| -------------------------------------------------- | ------------- | ------------------------ | ------------------------ |
| Chu kỳ **đã hoàn thành** (`isDong = true`)         | ❌ NO         | Giữ audit trail          | Disable button + tooltip |
| Chu kỳ **có DanhGiaKPI** (bất kể trạng thái)       | ❌ NO         | Có dữ liệu liên quan     | Show error chi tiết      |
| Chu kỳ **đang mở** NHƯNG **không có DanhGiaKPI**   | ✅ YES        | An toàn, không ảnh hưởng | Auto đóng → Xóa          |
| Chu kỳ **chưa bắt đầu** và **không có DanhGiaKPI** | ✅ YES        | An toàn, không ảnh hưởng | Xóa trực tiếp            |

---

## 🔧 Backend Implementation

### File: `chuKyDanhGia.controller.js`

```javascript
/**
 * @route DELETE /api/workmanagement/chu-ky-danh-gia/:id
 * @desc Xóa chu kỳ đánh giá (soft delete với validation cascade)
 */
chuKyDanhGiaController.xoa = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { DanhGiaKPI } = require("../models");

  const chuKy = await ChuKyDanhGia.findOne({ _id: id, isDeleted: false });

  if (!chuKy) {
    throw new AppError(404, "Không tìm thấy chu kỳ đánh giá");
  }

  // ✅ Quy tắc 1: Không cho xóa chu kỳ đã hoàn thành (giữ audit trail)
  if (chuKy.isDong === true) {
    throw new AppError(
      400,
      "Không thể xóa chu kỳ đã hoàn thành. Chu kỳ này cần được lưu giữ để báo cáo và kiểm toán"
    );
  }

  // ✅ Quy tắc 2: Kiểm tra có bản đánh giá KPI nào không
  const soDanhGia = await DanhGiaKPI.countDocuments({
    ChuKyID: id,
    isDeleted: { $ne: true },
  });

  if (soDanhGia > 0) {
    throw new AppError(
      400,
      `Không thể xóa chu kỳ đánh giá vì đã có ${soDanhGia} bản đánh giá liên quan. Vui lòng xóa các đánh giá trước hoặc liên hệ quản trị viên`
    );
  }

  // ✅ Quy tắc 3: Nếu đang mở nhưng không có đánh giá → tự động đóng
  if (chuKy.isDong === false) {
    chuKy.isDong = true;
    await chuKy.save();
  }

  // ✅ Soft delete
  chuKy.isDeleted = true;
  await chuKy.save();

  return sendResponse(
    res,
    200,
    true,
    { chuKy },
    null,
    "Xóa chu kỳ đánh giá thành công"
  );
});
```

### Ưu điểm:

- ✅ Logic tập trung ở 1 chỗ (backend controller)
- ✅ Frontend chỉ cần gọi API và hiển thị error
- ✅ Error message rõ ràng, có số lượng cụ thể
- ✅ Không cần thay đổi schema hoặc thêm trạng thái

---

## 🎨 Frontend Implementation

### File: `DeleteChuKyDanhGiaButton.js`

```javascript
function DeleteChuKyDanhGiaButton({ chuKy, itemId }) {
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if cycle is completed
  const chuKyData = chuKy || { _id: itemId };
  const isHoanThanh = chuKyData.isDong === true;

  const getTooltipTitle = () => {
    if (isHoanThanh) {
      return "Không thể xóa chu kỳ đã hoàn thành (cần giữ lịch sử kiểm toán)";
    }
    return "Xóa chu kỳ đánh giá";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteChuKyDanhGia(id)).unwrap();
      toast.success("Xóa chu kỳ đánh giá thành công");
      // ... navigate logic
    } catch (error) {
      // ✅ Error message từ backend rất chi tiết
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Không thể xóa chu kỳ đánh giá";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Tooltip title={getTooltipTitle()}>
        <span>
          <IconButton
            onClick={handleOpen}
            disabled={isHoanThanh || isDeleting}
            color="error"
          >
            <Trash size={18} />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Xác nhận xóa chu kỳ đánh giá</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa chu kỳ đánh giá này không?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Lưu ý:</strong> Nếu chu kỳ đã có bản đánh giá KPI, bạn cần
            xóa các đánh giá đó trước hoặc liên hệ quản trị viên.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting}>
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
```

### Key Points:

- ✅ Disable button nếu `isDong = true`
- ✅ Tooltip động giải thích lý do
- ✅ Alert warning trong dialog
- ✅ Loading state khi đang xóa
- ✅ Error handling chi tiết

---

## 🔄 Workflow Thực tế

### Scenario 1: Xóa chu kỳ mới tạo (chưa có đánh giá)

```
1. Admin tạo chu kỳ "Tháng 12/2024"
2. Chưa có manager nào tạo đánh giá KPI
3. Admin click "Xóa"
   ↓
4. Backend check:
   - isDong = false (đang mở)
   - soDanhGia = 0 ✅
   ↓
5. Backend auto đóng: isDong = true
6. Soft delete: isDeleted = true
7. Frontend: Toast success ✅
```

### Scenario 2: Xóa chu kỳ có đánh giá

```
1. Chu kỳ "Tháng 11/2024" có 5 bản đánh giá KPI
2. Admin click "Xóa"
   ↓
3. Backend check:
   - soDanhGia = 5 ❌
   ↓
4. Backend reject: "Không thể xóa chu kỳ đánh giá vì đã có 5 bản đánh giá liên quan..."
5. Frontend: Toast error với message chi tiết ❌
6. Dialog vẫn mở để user đọc hướng dẫn
```

### Scenario 3: Xóa chu kỳ đã hoàn thành

```
1. Chu kỳ "Tháng 10/2024" đã hoàn thành (isDong = true)
2. Nút "Xóa" bị disabled
3. Tooltip: "Không thể xóa chu kỳ đã hoàn thành (cần giữ lịch sử kiểm toán)"
4. User không thể click ❌
```

---

## 📊 So sánh với Design Cũ

| Tiêu chí            | Design Cũ (Phức tạp)                               | ✅ Design Mới (Đơn giản)    |
| ------------------- | -------------------------------------------------- | --------------------------- |
| **Số trạng thái**   | 5 (CHUA_BAT_DAU, DANG_MO, HOAN_THANH, DA_XOA, HUY) | 2 (isDong: true/false)      |
| **Components mới**  | CancelChuKyButton, HuyChuKyForm                    | Không cần                   |
| **Backend logic**   | 3 controllers (xóa, soft delete, hủy)              | 1 controller với validation |
| **Database fields** | Thêm NgayXoa, NguoiXoa, LyDoHuy, NgayHuy           | Không thay đổi schema       |
| **Validation**      | Phức tạp, nhiều edge cases                         | Đơn giản: Check cascade     |
| **Error messages**  | Generic                                            | Chi tiết với số lượng       |
| **User experience** | Phức tạp, nhiều actions                            | Đơn giản, message rõ ràng   |
| **Maintainability** | Cao (nhiều logic rẽ nhánh)                         | Thấp (1 rule đơn giản)      |

---

## 🚨 Vấn đề Nghiệp vụ Khi Xóa Chu Kỳ Đang Hoạt Động

### Nếu KHÔNG validate (giả định xóa được):

#### 1. **Mất Dữ Liệu Đang Hoạt Động**

- Manager đang chấm KPI cho 20 nhân viên (đã chấm 15)
- Admin vô tình xóa chu kỳ
- **Kết quả:** 15 bản đánh giá BỊ MẤT TOÀN BỘ

#### 2. **Vi Phạm Data Integrity**

```javascript
// Quan hệ cascade trong database:
ChuKyDanhGia (1) ──→ (N) DanhGiaKPI
                         ├─→ (N) DanhGiaNhiemVuThuongQuy
                         └─→ (N) DiemTieuChi

// ❌ Nếu xóa ChuKyDanhGia:
// - DanhGiaKPI.ChuKyID trỏ đến record không tồn tại
// - Queries JOIN trả về NULL
// - Reports/Statistics bị sai
```

#### 3. **Conflict với Auto-Calculation Hooks**

```javascript
// Backend có hooks tự động tính điểm
DanhGiaNhiemVuThuongQuy.post("save"); // Cập nhật TongDiemKPI

// ❌ Nếu chu kỳ bị xóa giữa chừng:
// - Hooks throw error (ChuKyID not found)
// - Transaction rollback
```

#### 4. **Vi Phạm Audit Trail**

- Theo quy định: Phải lưu lại toàn bộ lịch sử đánh giá
- Không được xóa dữ liệu đã duyệt
- **Cần giữ để kiểm toán và giải trình**

### ✅ Giải pháp hiện tại đã cover:

- Validate cascade trước khi xóa
- Giữ chu kỳ đã hoàn thành (audit trail)
- Error message chi tiết khi có dữ liệu liên quan
- Soft delete thay vì hard delete

---

## 🎯 Testing Checklist

### Test Cases:

- [ ] **TC1:** Xóa chu kỳ mới tạo, chưa có đánh giá
  - Expected: ✅ Xóa thành công
- [ ] **TC2:** Xóa chu kỳ đang mở, có 1 đánh giá
  - Expected: ❌ Error "Không thể xóa... đã có 1 bản đánh giá liên quan"
- [ ] **TC3:** Xóa chu kỳ đã hoàn thành
  - Expected: ❌ Button disabled + tooltip
- [ ] **TC4:** Xóa chu kỳ có 10 đánh giá
  - Expected: ❌ Error "Không thể xóa... đã có 10 bản đánh giá liên quan"
- [ ] **TC5:** UI không hiển thị chu kỳ đã xóa (isDeleted = true)

  - Expected: ✅ Table auto filter

- [ ] **TC6:** Error message hiển thị đúng trong toast
  - Expected: ✅ Không còn hiển thị `[object Object]`

---

## 📝 Hướng dẫn cho User

### Khi nào có thể xóa chu kỳ?

✅ Chu kỳ mới tạo, chưa có bản đánh giá KPI nào
✅ Chu kỳ đã đóng, chưa có bản đánh giá KPI nào

### Khi nào KHÔNG thể xóa?

❌ Chu kỳ đã có bản đánh giá KPI (dù chỉ 1 bản)
❌ Chu kỳ đã hoàn thành (cần giữ lịch sử)

### Muốn xóa chu kỳ có đánh giá?

1. Xóa tất cả bản đánh giá KPI trong chu kỳ đó trước
2. Sau đó mới xóa chu kỳ
3. Hoặc liên hệ quản trị viên nếu cần hỗ trợ

### Lỗi `[object Object]` đã được fix

- Trước: Toast hiển thị `[object Object]`
- Sau: Toast hiển thị message chi tiết từ backend
- VD: "Không thể xóa chu kỳ đánh giá vì đã có 5 bản đánh giá liên quan..."

---

## 🎉 Kết Luận

**Giải pháp đã triển khai:**

- ✅ Đơn giản, dễ hiểu, dễ maintain
- ✅ An toàn, không mất dữ liệu
- ✅ User-friendly với error messages chi tiết
- ✅ Không cần thay đổi schema hoặc thêm trạng thái
- ✅ Phù hợp với pattern hiện tại của hệ thống

**Next Steps:**

- Test đầy đủ các scenarios
- Update user documentation
- Training cho admin về quy tắc xóa
