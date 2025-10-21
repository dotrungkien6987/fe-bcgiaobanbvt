# ⚠️ MIGRATION NOTICE: Chuyển sang Trang Đánh Giá KPI Mới

## 🚨 Thông Báo Quan Trọng

**Endpoint cũ `/api/workmanagement/kpi/cham-diem` đã NGƯNG HOẠT ĐỘNG!**

Nếu bạn thấy lỗi:

```
Error: DanhGiaNhiemVuThuongQuy validation failed: ChuKyDanhGiaID is required
```

→ **Bạn đang sử dụng trang CŨ. Vui lòng chuyển sang trang MỚI!**

---

## ✅ GIẢI PHÁP: Sử Dụng Trang Mới

### Trang Cũ (KHÔNG SỬ DỤNG NỮA):

- ❌ `/quanlycongviec/kpi/danh-gia` (DanhGiaKPIDashboard)
- ❌ `/quanlycongviec/kpi/xem` (XemKPIPage)

### Trang Mới (SỬ DỤNG TỪ NAYĐ):

- ✅ `/quanlycongviec/kpi/danh-gia-nhan-vien` (KPIEvaluationPage)

---

## 🔄 So Sánh Tính Năng

### Trang Cũ (Deprecated):

```
❌ Sử dụng endpoint /cham-diem
❌ Logic phức tạp với DanhGiaKPI + ChiTietDiem
❌ Không tương thích với model mới
❌ Thiếu ChuKyDanhGiaID → Lỗi validation
```

### Trang Mới (Recommended):

```
✅ Sử dụng 3 endpoint mới:
   - GET /kpi/nhan-vien/:id/nhiem-vu
   - POST /kpi/nhan-vien/:id/danh-gia
   - GET /kpi/nhan-vien/:id/diem-kpi
✅ Logic đơn giản hóa
✅ Tương thích với model mới
✅ Có đầy đủ ChuKyDanhGiaID
✅ Tính KPI chính xác theo công thức mới
```

---

## 📋 Hướng Dẫn Sử Dụng Trang Mới

### Bước 1: Truy Cập Trang Mới

Mở URL: `http://localhost:3000/quanlycongviec/kpi/danh-gia-nhan-vien`

### Bước 2: Chọn Chu Kỳ

1. Dropdown "Chu kỳ đánh giá" → Chọn chu kỳ (vd: Q1/2025)
2. Danh sách nhân viên sẽ tự động load

### Bước 3: Đánh Giá KPI

1. Click nút **[Đánh giá]** ở cột "Thao tác"
2. Dialog mở ra hiển thị danh sách nhiệm vụ
3. Nhập điểm (0-10) vào 2 cột:
   - **Điểm tự đánh giá**
   - **Điểm QL đánh giá**
4. Nhập ghi chú (optional)
5. Click **[Lưu đánh giá]**

### Bước 4: Xem Kết Quả

- Điểm KPI tự động hiển thị sau khi lưu
- Click **[Xem KPI]** để xem chi tiết breakdown

---

## 🛠️ Nếu Vẫn Gặp Lỗi

### Lỗi: "Endpoint này đã ngưng hoạt động"

**Nguyên nhân:** Bạn vẫn đang ở trang cũ

**Giải pháp:**

1. Đóng trang hiện tại
2. Mở URL mới: `/quanlycongviec/kpi/danh-gia-nhan-vien`
3. Xóa cache trình duyệt (Ctrl + Shift + Delete)
4. Refresh lại trang (Ctrl + F5)

### Lỗi: "Không có nhân viên nào"

**Nguyên nhân:** Chưa có assignment trong chu kỳ đã chọn

**Giải pháp:**

1. Vào trang **Giao nhiệm vụ theo chu kỳ**
2. Chọn cùng chu kỳ
3. Giao nhiệm vụ cho nhân viên
4. Quay lại trang đánh giá KPI

### Lỗi: "Nhân viên chưa được giao nhiệm vụ nào"

**Nguyên nhân:** Nhân viên này không có assignment trong chu kỳ

**Giải pháp:**

1. Vào trang **Giao nhiệm vụ theo chu kỳ**
2. Giao ít nhất 1 nhiệm vụ cho nhân viên
3. Quay lại đánh giá

---

## 🔧 Cho Developer: Xóa Code Cũ

Nếu muốn **HOÀN TOÀN XÓA** trang cũ (không cần nữa):

### 1. Xóa Routes Cũ

**File:** `fe-bcgiaobanbvt/src/routes/index.js`

```javascript
// ❌ XÓA:
import { DanhGiaKPIDashboard } from "features/QuanLyCongViec/KPI/v2/pages";

// ❌ XÓA:
<Route path="/quanlycongviec/kpi/danh-gia" element={<DanhGiaKPIDashboard />} />;
```

### 2. Xóa Backend Endpoint Cũ

**File:** `giaobanbv-be/modules/workmanagement/routes/kpi.api.js`

```javascript
// ❌ XÓA:
router.get(
  "/cham-diem",
  authentication.loginRequired,
  validateQuanLy("KPI"),
  kpiController.getChamDiemDetail
);
```

**File:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`

```javascript
// ❌ XÓA toàn bộ kpiController.getChamDiemDetail (đã disable rồi)
```

### 3. Xóa Components Cũ (Optional)

Nếu không cần giữ code cũ để tham khảo:

```bash
# Xóa folder v2
rm -rf fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2

# Hoặc giữ lại với suffix .deprecated
mv src/features/QuanLyCongViec/KPI/v2 src/features/QuanLyCongViec/KPI/v2.deprecated
```

---

## 📊 Mapping Chức Năng Cũ → Mới

| Trang Cũ            | Endpoint Cũ    | Trang Mới         | Endpoint Mới                 |
| ------------------- | -------------- | ----------------- | ---------------------------- |
| DanhGiaKPIDashboard | GET /cham-diem | KPIEvaluationPage | GET /nhan-vien/:id/nhiem-vu  |
| -                   | POST /kpi      | -                 | POST /nhan-vien/:id/danh-gia |
| XemKPIPage          | GET /kpi/:id   | -                 | GET /nhan-vien/:id/diem-kpi  |

---

## ✅ Checklist Migration

- [ ] Dừng sử dụng `/quanlycongviec/kpi/danh-gia`
- [ ] Chuyển sang `/quanlycongviec/kpi/danh-gia-nhan-vien`
- [ ] Test flow: Chọn chu kỳ → Đánh giá → Lưu → Xem KPI
- [ ] Xác nhận điểm KPI tính đúng
- [ ] Update bookmarks/shortcuts
- [ ] Thông báo team members về trang mới

---

## 📞 Hỗ Trợ

**Nếu gặp khó khăn:**

1. Đọc file: `TESTING_GUIDE_KPI_EVALUATION.md`
2. Đọc file: `FRONTEND_KPI_IMPLEMENTATION_COMPLETE.md`
3. Check backend logs cho lỗi chi tiết
4. Liên hệ dev team

---

**Cập nhật:** October 18, 2025
**Trạng thái:** Trang mới đã sẵn sàng ✅
**Trang cũ:** Deprecated ⚠️
