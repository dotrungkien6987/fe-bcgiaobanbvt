# Quy Trình Nghiệp Vụ - GiaoNhiemVu V3.0

**Phiên bản:** 3.0  
**Cập nhật:** 26/11/2025

---

## 📋 Mục Lục

- [Tổng Quan Quy Trình](#tổng-quan-quy-trình)
- [Quy Trình 1: Quản Lý Gán Nhiệm Vụ](#quy-trình-1-quản-lý-gán-nhiệm-vụ)
- [Quy Trình 2: Nhân Viên Tự Đánh Giá](#quy-trình-2-nhân-viên-tự-đánh-giá)
- [Quy Trình 3: Quản Lý Chấm Điểm KPI](#quy-trình-3-quản-lý-chấm-điểm-kpi)
- [Quy Trình 4: Sao Chép Chu Kỳ](#quy-trình-4-sao-chép-chu-kỳ)
- [Các Tình Huống Đặc Biệt](#các-tình-huống-đặc-biệt)

---

## 🎯 Tổng Quan Quy Trình

### Vòng Đời Phân Công Nhiệm Vụ

```
┌─────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 1: CHUẨN BỊ CHU KỲ                              │
│  - Admin tạo chu kỳ đánh giá (ChuKyDanhGia)                │
│  - Mở chu kỳ (isDong = false)                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 2: PHÂN CÔNG NHIỆM VỤ                           │
│  - Quản lý gán nhiệm vụ cho nhân viên                      │
│  - Chỉnh độ khó (0-2)                                      │
│  - Có thể sao chép từ chu kỳ trước                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 3: TỰ ĐÁNH GIÁ                                  │
│  - Nhân viên tự chấm điểm (0-100%)                         │
│  - Có thể chỉnh sửa nhiều lần trong chu kỳ                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 4: QUẢN LÝ CHẤM ĐIỂM                            │
│  - Quản lý chấm điểm chi tiết cho từng nhiệm vụ            │
│  - Tính toán KPI tự động                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 5: DUYỆT KPI                                    │
│  - Quản lý/Admin duyệt KPI                                 │
│  - Khóa chỉnh sửa (TrangThai = "DA_DUYET")                 │
│  - Lưu snapshot điểm vào TongDiemKPI                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  GIAI ĐOẠN 6: ĐÓNG CHU KỲ                                  │
│  - Admin đóng chu kỳ (isDong = true)                       │
│  - Không thể thay đổi phân công                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Quy Trình 1: Quản Lý Gán Nhiệm Vụ

### Bước 1: Truy Cập Trang Phân Công

**Người dùng:** Quản lý (Manager)  
**Menu:** `Quản lý công việc > 📅 Phân công theo chu kỳ`

1. Click menu "📅 Phân công theo chu kỳ"
2. Hệ thống điều hướng đến `/quanlycongviec/giao-nhiem-vu-chu-ky`
3. Trang hiển thị dropdown chọn chu kỳ

---

### Bước 2: Chọn Chu Kỳ

**UI:** Dropdown autocomplete

1. Click dropdown "Chọn chu kỳ"
2. Danh sách hiển thị:
   - Quý 1/2025 (01/01/2025 - 31/03/2025) 🟢 Đang mở
   - Quý 4/2024 (01/10/2024 - 31/12/2024) 🔒 Đã đóng
   - Quý 3/2024 (01/07/2024 - 30/09/2024) 🔒 Đã đóng
3. Chọn chu kỳ "Quý 1/2025"
4. Hệ thống gọi API:
   ```
   GET /workmanagement/giao-nhiem-vu/employees-with-cycle-stats?chuKyId=xxx
   ```
5. Bảng danh sách nhân viên hiển thị với thống kê

---

### Bước 3: Xem Danh Sách Nhân Viên

**UI:** Bảng với 5 cột

| Tên nhân viên | Mã NV | Đã gán | Tổng MĐK | Thao tác |
| ------------- | ----- | ------ | -------- | -------- |
| Nguyễn Văn A  | NV001 | 5/12   | 8.5      | [Gán]    |
| Trần Thị B    | NV002 | 3/12   | 5.0      | [Gán]    |
| Lê Văn C      | NV003 | 0/12   | 0.0      | [Gán]    |

**Ý nghĩa các cột:**

- **Đã gán:** Số nhiệm vụ đã gán / Tổng số nhiệm vụ khả dụng
- **Tổng MĐK:** Tổng mức độ khó (sum của tất cả nhiệm vụ đã gán)

---

### Bước 4: Gán Nhiệm Vụ Chi Tiết

**UI:** Giao diện hai cột

1. Click nút [Gán] trên dòng "Nguyễn Văn A"
2. Hệ thống điều hướng:
   ```
   /quanlycongviec/giao-nhiem-vu-chu-ky/66b1dba74f79822a4752d90a?chuKyId=xxx
   ```
3. Trang chi tiết hiển thị:
   - **Cột trái:** Nhiệm vụ khả dụng (checkbox + slider)
   - **Cột phải:** Nhiệm vụ đã gán (card + nút xóa)

---

### Bước 5: Thêm Nhiệm Vụ Mới

**Luồng:**

```
1. Tick checkbox "Kiểm tra hồ sơ bệnh án"
   → Slider độ khó hiển thị bên dưới (mặc định = 1.0)

2. Kéo slider đến mức độ khó mong muốn (VD: 1.5)
   → Nhiệm vụ tự động thêm vào cột phải

3. Xác nhận thông tin:
   - Tên: Kiểm tra hồ sơ bệnh án
   - Độ khó: 1.5
   - Điểm tự đánh giá: 0%
```

**Lưu ý:**

- ✅ Có thể tick nhiều checkbox cùng lúc
- ✅ Slider có thể điều chỉnh sau khi tick
- ✅ Nhiệm vụ chưa được lưu database (chỉ update UI)

---

### Bước 6: Chỉnh Sửa Độ Khó

**UI:** Slider trên card nhiệm vụ (cột phải)

1. Tìm nhiệm vụ "Chăm sóc bệnh nhân" trong cột phải
2. Kéo slider từ 1.5 → 2.0
3. Hệ thống cập nhật state local ngay lập tức

---

### Bước 7: Xóa Nhiệm Vụ

**UI:** Nút [×] trên card nhiệm vụ

**Luồng:**

```
1. Click nút [×] bên cạnh "Lập kế hoạch điều trị"

2. Hệ thống kiểm tra trước (canDeleteDuty):
   - Có điểm tự đánh giá? → Hiển thị cảnh báo
   - Có điểm quản lý? → Hiển thị cảnh báo (TODO: cần gọi API)

3. Nếu PASS kiểm tra:
   → Xóa khỏi cột phải
   → Bỏ tick checkbox cột trái (nếu có)
```

**Thông báo lỗi:**

```javascript
// Có điểm tự đánh giá
toast.error(
  'Không thể xóa nhiệm vụ "Lập kế hoạch điều trị". ' +
    "Nhiệm vụ đã có điểm tự đánh giá (75 điểm)."
);

// Giải pháp: Nhân viên phải đưa điểm về 0 trên trang "Tự đánh giá KPI"
```

---

### Bước 8: Lưu Tất Cả Thay Đổi

**UI:** Nút [Lưu tất cả]

**Luồng:**

```
1. Click nút [Lưu tất cả]

2. Hệ thống phân loại thay đổi:
   - assignmentsToAdd: Nhiệm vụ mới thêm (có _tempId)
   - assignmentsToUpdate: Nhiệm vụ thay đổi độ khó
   - assignmentsToDelete: Nhiệm vụ bị xóa

3. Gọi API:
   PUT /nhan-vien/:id/cycle-assignments
   Body: { chuKyId, assignmentsToAdd, assignmentsToUpdate, assignmentsToDelete }

4. Backend kiểm tra 4-layer validation:
   ✅ Chu kỳ chưa đóng
   ✅ KPI chưa duyệt
   ✅ Không có điểm tự đánh giá (khi xóa)
   ✅ Không có điểm quản lý (khi xóa)

5. Nếu PASS:
   → Transaction MongoDB (add + update + delete)
   → Trả về danh sách cập nhật
   → Redux state update
   → Toast thông báo "Cập nhật nhiệm vụ thành công!"

6. Nếu FAIL:
   → Hiển thị thông báo lỗi cụ thể
   → Giữ nguyên state local
```

---

## 👤 Quy Trình 2: Nhân Viên Tự Đánh Giá

### Bước 1: Truy Cập Trang Tự Đánh Giá

**Người dùng:** Nhân viên (Employee)  
**Menu:** `Quản lý công việc > Tự đánh giá KPI` 🆕

1. Click menu "Tự đánh giá KPI"
2. Hệ thống điều hướng đến `/quanlycongviec/kpi/tu-danh-gia`
3. Dropdown tự động chọn chu kỳ đang mở

---

### Bước 2: Chọn Chu Kỳ (Nếu cần)

**UI:** Dropdown autocomplete

1. Dropdown hiển thị danh sách chu kỳ
2. Mặc định chọn chu kỳ đang mở (isDong = false)
3. Có thể chọn chu kỳ khác để xem lịch sử

---

### Bước 3: Xem Danh Sách Nhiệm Vụ

**UI:** Danh sách card (Paper)

```
┌────────────────────────────────────────────────────────┐
│  Chăm sóc bệnh nhân (Độ khó: 1.5)                     │
│  Mô tả: Chăm sóc toàn diện bệnh nhân...                │
│  Điểm tự đánh giá: ●────────○ (85%)                  │
│  [0%]───────[50%]───────[100%]                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Lập kế hoạch điều trị (Độ khó: 2.0)                 │
│  Mô tả: Lập kế hoạch điều trị cho bệnh nhân mới...    │
│  Điểm tự đánh giá: ────────○ (0%)                    │
│  [0%]───────[50%]───────[100%]                        │
└────────────────────────────────────────────────────────┘
```

**Thông tin hiển thị:**

- Tên nhiệm vụ + Độ khó (Chip)
- Mô tả nhiệm vụ
- Slider điểm tự đánh giá (0-100%)
- Thanh progress tổng thể

---

### Bước 4: Tự Chấm Điểm

**UI:** Slider (0-100%)

**Hướng dẫn chấm điểm:**

| Điểm        | Ý nghĩa               | Ví dụ                                  |
| ----------- | --------------------- | -------------------------------------- |
| **0-20%**   | Không hoàn thành      | Chưa bắt đầu hoặc chỉ làm được rất ít  |
| **21-40%**  | Hoàn thành kém        | Làm được một phần nhỏ, nhiều thiếu sót |
| **41-60%**  | Hoàn thành trung bình | Làm được khoảng một nửa                |
| **61-80%**  | Hoàn thành tốt        | Làm được phần lớn, ít thiếu sót        |
| **81-100%** | Hoàn thành xuất sắc   | Làm hoàn chỉnh, vượt mong đợi          |

**Luồng chấm điểm:**

```
1. Kéo slider "Chăm sóc bệnh nhân" → 85%
   → State local cập nhật ngay

2. Kéo slider "Lập kế hoạch điều trị" → 75%
   → State local cập nhật ngay

3. Thanh progress cập nhật: 2/2 nhiệm vụ (100%)
```

---

### Bước 5: Lưu Điểm

**UI:** Nút [Lưu tất cả]

**Luồng:**

```
1. Click nút [Lưu tất cả]

2. Hệ thống lọc điểm thay đổi:
   - So sánh localState vs originalState
   - Chỉ gửi những điểm thay đổi

3. Gọi API:
   POST /tu-cham-diem-batch
   Body: {
     updates: [
       { NhanVienNhiemVuID: "...", DiemTuDanhGia: 85 },
       { NhanVienNhiemVuID: "...", DiemTuDanhGia: 75 }
     ]
   }

4. Backend kiểm tra:
   ✅ Chu kỳ chưa đóng
   ✅ KPI chưa duyệt

5. Nếu PASS:
   → Batch update NhanVienNhiemVu
   → Trả về danh sách cập nhật
   → Toast "Cập nhật điểm thành công!"

6. Nếu FAIL:
   → Hiển thị lỗi cụ thể (CYCLE_CLOSED / KPI_APPROVED)
```

---

## 📝 Quy Trình 3: Quản Lý Chấm Điểm KPI

### Bước 1: Truy Cập Trang KPI

**Người dùng:** Quản lý (Manager)  
**Menu:** `Quản lý công việc > KPI`

1. Click menu "KPI"
2. Chọn nhân viên cần chấm điểm
3. Hệ thống hiển thị danh sách nhiệm vụ của nhân viên

---

### Bước 2: Chấm Điểm Chi Tiết

**UI:** Form nhập điểm cho từng tiêu chí

**Công thức tính:**

```javascript
// Với nhiệm vụ có "mức độ hoàn thành"
DiemNhiemVu = (DiemQL × 2 + DiemTuDanhGia) / 3

// Ví dụ:
// DiemQL = 90, DiemTuDanhGia = 85
// → DiemNhiemVu = (90 × 2 + 85) / 3 = 88.33
```

---

### Bước 3: Duyệt KPI

**UI:** Nút [Duyệt KPI]

**Luồng:**

```
1. Click nút [Duyệt KPI]

2. Backend tính toán:
   - Lấy tất cả nhiệm vụ của nhân viên
   - Tính DiemNhiemVu cho từng nhiệm vụ
   - Tổng hợp TongDiemKPI
   - Lưu snapshot vào DanhGiaKPI.TongDiemKPI

3. Cập nhật:
   - DanhGiaKPI.TrangThai = "DA_DUYET"
   - DanhGiaKPI.NguoiDuyetID = user._id
   - DanhGiaKPI.NgayDuyet = Date.now()

4. Kết quả:
   → Khóa chỉnh sửa phán công
   → Khóa tự đánh giá
   → Lưu lịch sử duyệt
```

---

## 🔄 Quy Trình 4: Sao Chép Chu Kỳ

### Bước 1: Truy Cập Trang Chi Tiết

**Người dùng:** Quản lý  
**Route:** `/giao-nhiem-vu-chu-ky/:employeeId?chuKyId=xxx`

---

### Bước 2: Click Nút Sao Chép

**UI:** Nút [Sao chép từ Q4/2024]

**Luồng:**

```
1. Click nút [Sao chép từ Q4/2024]

2. Hệ thống hiển thị confirm dialog:
   "Bạn có chắc muốn sao chép 5 nhiệm vụ từ chu kỳ Q4/2024?"

3. Click [Đồng ý]

4. Gọi API:
   POST /nhan-vien/:id/copy-from-previous
   Body: { currentCycleId: "..." }

5. Backend xử lý:
   - Tìm chu kỳ trước (TuNgay < current.TuNgay)
   - Lấy tất cả NhanVienNhiemVu của chu kỳ trước
   - Copy sang chu kỳ mới:
     + Giữ nguyên NhiemVuID, MucDoKho
     + Reset DiemTuDanhGia = 0
     + Set ChuKyDanhGiaID = currentCycleId

6. Kết quả:
   → Hiển thị toast "Đã sao chép 5 nhiệm vụ!"
   → Redux state cập nhật
   → Cột phải hiển thị các nhiệm vụ đã copy
```

---

## ⚠️ Các Tình Huống Đặc Biệt

### Tình Huống 1: Chu Kỳ Đã Đóng

**Triệu chứng:**

- Nút [Lưu tất cả] bị disable
- Slider bị khóa (disabled)
- Thông báo: "Chu kỳ đã đóng. Vui lòng liên hệ Admin để mở lại."

**Giải pháp:**

1. Admin truy cập trang **ChuKyDanhGia**
2. Tìm chu kỳ cần mở
3. Click [Mở lại]
4. `ChuKyDanhGia.isDong = false`

---

### Tình Huống 2: KPI Đã Duyệt

**Triệu chứng:**

- Không thể thay đổi phân công
- Không thể tự đánh giá
- Thông báo: "KPI đã được duyệt. Vui lòng hủy duyệt trước."

**Giải pháp:**

1. Quản lý truy cập trang **KPI**
2. Tìm đánh giá KPI của nhân viên
3. Click [Hủy duyệt]
4. Nhập lý do hủy duyệt
5. `DanhGiaKPI.TrangThai = "CHUA_DUYET"`
6. Lưu lịch sử hủy duyệt vào `LichSuHuyDuyet`

---

### Tình Huống 3: Không Thể Xóa Nhiệm Vụ

**Triệu chứng:**

- Nút [×] không hoạt động
- Thông báo: "Không thể xóa. Nhân viên đã tự chấm điểm."

**Giải pháp:**

1. Nhân viên truy cập trang **Tự đánh giá KPI**
2. Tìm nhiệm vụ cần xóa
3. Kéo slider điểm về 0%
4. Click [Lưu tất cả]
5. Quản lý quay lại trang phân công
6. Có thể xóa nhiệm vụ

---

## 🎉 Kết Luận

Tài liệu này mô tả **4 quy trình chính** của module GiaoNhiemVu:

✅ **Quy trình 1:** Quản lý gán nhiệm vụ (8 bước)  
✅ **Quy trình 2:** Nhân viên tự đánh giá (5 bước)  
✅ **Quy trình 3:** Quản lý chấm điểm KPI (3 bước)  
✅ **Quy trình 4:** Sao chép chu kỳ (2 bước)  
✅ **Các tình huống đặc biệt:** 3 tình huống với giải pháp

---

**Cập nhật cuối:** 26/11/2025  
**Tác giả:** GitHub Copilot (Claude Sonnet 4.5)  
**Phiên bản tài liệu:** 1.0.0
