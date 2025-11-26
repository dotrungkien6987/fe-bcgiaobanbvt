# Hệ thống Đánh giá KPI - Tài liệu Tổng quan

**Version:** 2.1  
**Last Updated:** 26/11/2025  
**Status:** ✅ Production Ready

---

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Tính năng chính](#tính-năng-chính)
3. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
4. [Luồng nghiệp vụ](#luồng-nghiệp-vụ)
5. [Công thức tính điểm](#công-thức-tính-điểm)
6. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
7. [Tài liệu chi tiết](#tài-liệu-chi-tiết)

---

## 🎯 Giới thiệu

### Mục đích

Hệ thống Đánh giá KPI (Key Performance Indicators) là module quản lý hiệu suất làm việc của nhân viên dựa trên **Nhiệm vụ Thường quy** được gán trong từng **Chu kỳ Đánh giá**.

### Phạm vi

- **Frontend:** React 18 + Redux Toolkit + Material-UI v5
- **Backend:** Express.js + MongoDB + Mongoose
- **Người dùng:**
  - **Nhân viên:** Tự đánh giá mức độ hoàn thành công việc
  - **Quản lý (Manager):** Chấm điểm chi tiết, duyệt KPI
  - **Admin/Đào tạo:** Xem báo cáo, xuất Excel

### Đặc điểm nổi bật

✅ **Đánh giá theo chu kỳ:** Quý, tháng, năm - linh hoạt cấu hình  
✅ **Tiêu chí động:** Mỗi chu kỳ có thể thay đổi tiêu chí đánh giá  
✅ **Tự đánh giá + Quản lý chấm:** Kết hợp 2 nguồn điểm với công thức `(DiemQL × 2 + DiemTuDanhGia) / 3`  
✅ **Real-time preview:** Hiển thị điểm tạm trước khi duyệt  
✅ **Audit trail:** Lưu đầy đủ lịch sử duyệt/hủy duyệt  
✅ **Dashboard trực quan:** Biểu đồ, thống kê, top performers  
✅ **Xuất báo cáo Excel:** Báo cáo chi tiết theo chu kỳ/phòng ban

---

## 🚀 Tính năng chính

### 1. Quản lý Chu kỳ Đánh giá

```
Chu kỳ KPI → Cấu hình tiêu chí đánh giá → Gán nhiệm vụ cho nhân viên
```

**Tính năng:**

- Tạo chu kỳ mới (tháng/quý/năm)
- Cấu hình tiêu chí đánh giá (TANG_DIEM/GIAM_DIEM)
- Đánh dấu tiêu chí "Mức độ hoàn thành" cho phép tự đánh giá
- Mở/đóng chu kỳ
- Sao chép cấu hình từ chu kỳ cũ

**File liên quan:**

- Frontend: `ChuKyDanhGia/` module
- Backend: `/api/workmanagement/chu-ky-danh-gia`

---

### 2. Gán Nhiệm vụ Thường quy

```
Nhân viên → Nhiệm vụ thường quy → Chu kỳ → Độ khó (MucDoKho)
```

**Tính năng:**

- Gán nhiệm vụ cho nhân viên theo chu kỳ
- Điều chỉnh **Độ khó thực tế** (MucDoKho: 1-10) cho từng người
- Hỗ trợ gán hàng loạt
- Sao chép assignment từ chu kỳ trước

**Model:** `NhanVienNhiemVu`

**File liên quan:**

- Frontend: `GiaoNhiemVu/` module
- Backend: `/api/workmanagement/giao-nhiem-vu`

---

### 3. Tự Đánh giá KPI (Nhân viên)

```
Nhân viên login → Chọn chu kỳ → Xem nhiệm vụ được gán → Tự chấm % hoàn thành
```

**Tính năng:**

- Xem danh sách nhiệm vụ được gán trong chu kỳ
- Tự chấm điểm **Mức độ hoàn thành** (0-100%)
- Lưu lại lịch sử tự chấm (`DiemTuDanhGia`, `NgayTuCham`)
- Chỉnh sửa điểm trước khi quản lý duyệt

**Page:** `TuDanhGiaKPIPage.js`

**API:**

- `GET /api/workmanagement/kpi/nhan-vien/:NhanVienID/nhiem-vu?chuKyId=xxx`
- `POST /api/workmanagement/kpi/nhan-vien/:NhanVienID/danh-gia`

---

### 4. Chấm điểm KPI (Quản lý)

```
Manager → Dashboard nhân viên → Chọn nhân viên → Chấm điểm chi tiết → Duyệt
```

**Workflow:**

1. **Tạo đánh giá KPI:**

   - Chọn nhân viên + chu kỳ
   - Hệ thống tự động tạo `DanhGiaKPI` và `DanhGiaNhiemVuThuongQuy`

2. **Chấm điểm từng tiêu chí:**

   - Hiển thị danh sách nhiệm vụ với các tiêu chí
   - Manager nhập điểm cho từng tiêu chí (DiemDat)
   - Hệ thống hiển thị preview tổng điểm real-time

3. **Duyệt KPI:**
   - Kiểm tra tất cả nhiệm vụ đã chấm điểm
   - Nhấn "Duyệt" → Snapshot `TongDiemKPI` vào DB
   - Trạng thái: `CHUA_DUYET` → `DA_DUYET`

**Page:** `DanhGiaKPIPage.js`, `v2/pages/DanhGiaKPIDashboard.js`

**API:**

- `POST /api/workmanagement/kpi` - Tạo đánh giá KPI
- `PUT /api/workmanagement/kpi/nhiem-vu/:nhiemVuId` - Chấm điểm nhiệm vụ
- `POST /api/workmanagement/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId` - Duyệt KPI
- `POST /api/workmanagement/kpi/huy-duyet-kpi/:danhGiaKPIId` - Hủy duyệt

---

### 5. Dashboard & Báo cáo

**Dashboard KPI (Quản lý):**

- Danh sách nhân viên được quản lý
- Tiến độ chấm điểm (đã chấm/tổng nhiệm vụ)
- Điểm KPI hiện tại
- Biểu đồ phân bố điểm
- Top performers

**Page:** `v2/pages/DanhGiaKPIDashboard.js`

**API:** `GET /api/workmanagement/kpi/dashboard/:chuKyId`

---

**Báo cáo KPI (Admin/Đào tạo):**

- Thống kê tổng hợp theo chu kỳ/phòng ban
- Biểu đồ xu hướng điểm KPI
- Danh sách chi tiết tất cả nhân viên
- Xuất Excel với đầy đủ thông tin

**Page:** `BaoCaoKPIPage.js` (re-export từ module `BaoCaoThongKeKPI`)

**API:**

- `GET /api/workmanagement/kpi/bao-cao/thong-ke`
- `GET /api/workmanagement/kpi/bao-cao/chi-tiet`
- `GET /api/workmanagement/kpi/bao-cao/export-excel`

---

## 🏗️ Kiến trúc hệ thống

### Tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                     │
│  - TuDanhGiaKPIPage      (Nhân viên tự chấm)              │
│  - DanhGiaKPIPage        (Manager chấm điểm - Legacy)      │
│  - DanhGiaKPIDashboard   (Manager dashboard - V2)          │
│  - BaoCaoKPIPage         (Báo cáo - Admin)                │
│  - XemKPIPage            (Xem chi tiết KPI)                │
├─────────────────────────────────────────────────────────────┤
│  Redux Slices:                                              │
│  - kpiSlice.js           (1704 dòng - Legacy + V2 hybrid)  │
│  - kpiEvaluationSlice.js (283 dòng - Workflow V2)          │
├─────────────────────────────────────────────────────────────┤
│  Utils:                                                     │
│  - kpiCalculation.js     (Real-time preview công thức)     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                               │
│  - kpi.controller.js     (3040 dòng, 29 endpoints)         │
├─────────────────────────────────────────────────────────────┤
│  Models (Mongoose):                                         │
│  - DanhGiaKPI            (Wrapper 1 nhân viên/1 chu kỳ)    │
│  - DanhGiaNhiemVuThuongQuy (Chi tiết từng nhiệm vụ)        │
│  - NhanVienNhiemVu       (Assignment + DiemTuDanhGia)      │
│  - ChuKyDanhGia          (Chu kỳ + TieuChiCauHinh)         │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      MongoDB Database
```

### Data Flow chính

```
1. TẠO CHU KỲ
   ChuKyDanhGia.TieuChiCauHinh[] ← Manager cấu hình tiêu chí

2. GÁN NHIỆM VỤ
   NhanVienNhiemVu (NhanVienID, NhiemVuThuongQuyID, ChuKyDanhGiaID, MucDoKho)

3. TỰ ĐÁNH GIÁ
   NhanVienNhiemVu.DiemTuDanhGia ← Nhân viên tự chấm

4. TẠO ĐÁNH GIÁ KPI
   DanhGiaKPI (wrapper) + DanhGiaNhiemVuThuongQuy[] (chi tiết)
   → Copy TieuChiCauHinh từ ChuKy vào ChiTietDiem[]

5. CHẤM ĐIỂM
   Manager nhập DiemDat vào ChiTietDiem[]
   → Frontend preview real-time (kpiCalculation.js)

6. DUYỆT KPI
   → Backend method duyet() tính TongDiemKPI chính thức
   → Snapshot vào DanhGiaKPI.TongDiemKPI
   → Lưu LichSuDuyet[]
```

**Chi tiết:** Xem [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📊 Công thức tính điểm

### Công thức V2 (Hiện tại)

```javascript
// BƯỚC 1: Tính điểm từng tiêu chí
for (tieuChi in ChiTietDiem) {
  if (tieuChi.IsMucDoHoanThanh) {
    // Tiêu chí "Mức độ hoàn thành" - Kết hợp 2 điểm
    diemCuoiCung = (DiemQuanLy × 2 + DiemTuDanhGia) / 3;
  } else {
    // Tiêu chí khác - Lấy trực tiếp điểm Manager
    diemCuoiCung = DiemQuanLy;
  }

  // Scale về 0-1
  diemScaled = diemCuoiCung / 100;

  // Phân loại tăng/giảm
  if (tieuChi.LoaiTieuChi === "TANG_DIEM") {
    diemTang += diemScaled;
  } else {
    diemGiam += diemScaled;
  }
}

// BƯỚC 2: Tính tổng điểm tiêu chí
TongDiemTieuChi = diemTang - diemGiam; // Có thể > 1.0

// BƯỚC 3: Tính điểm nhiệm vụ
DiemNhiemVu = MucDoKho × TongDiemTieuChi;

// BƯỚC 4: Tổng điểm KPI
TongDiemKPI = Σ DiemNhiemVu[i]; // Sum all tasks
```

### Ví dụ thực tế

**Nhân viên IT - 2 nhiệm vụ:**

**NVTQ 1: Quản lý hạ tầng mạng (MucDoKho = 5)**

- Mức độ hoàn thành: Manager chấm 90, Nhân viên tự chấm 85
  - → `(90×2 + 85)/3 = 88.33`
- Điểm tích cực: Manager chấm 3
  - → `3`
- Điểm trừ quá hạn: Manager chấm 2
  - → `-2`

TongDiemTieuChi = (88.33 + 3 - 2) / 100 = 0.8933  
DiemNhiemVu = 5 × 0.8933 = **4.47**

**NVTQ 2: Bảo mật hệ thống (MucDoKho = 3)**

- Mức độ hoàn thành: Manager 95, Nhân viên 90
  - → `(95×2 + 90)/3 = 93.33`
- Điểm tích cực: 5
  - → `5`

TongDiemTieuChi = (93.33 + 5) / 100 = 0.9833  
DiemNhiemVu = 3 × 0.9833 = **2.95**

**Tổng KPI:** 4.47 + 2.95 = **7.42 điểm**

**Chi tiết:** Xem [FORMULA_CALCULATION.md](./FORMULA_CALCULATION.md)

---

## 🔄 Luồng nghiệp vụ

### Luồng đầy đủ (End-to-end)

```
[GIAI ĐOẠN 1: CHUẨN BỊ CHU KỲ]
1. Admin tạo Chu kỳ đánh giá (Quý 4/2025)
2. Admin cấu hình Tiêu chí đánh giá
   → Thêm tiêu chí "Mức độ hoàn thành" (IsMucDoHoanThanh = true)
   → Thêm tiêu chí khác (Tích cực, Trừ điểm, v.v.)
3. Admin mở chu kỳ (TrangThai: CHO_BAT_DAU → DANG_DIEN_RA)

[GIAI ĐOẠN 2: GÁN NHIỆM VỤ]
4. Manager gán nhiệm vụ thường quy cho nhân viên theo chu kỳ
   → Điều chỉnh MucDoKho thực tế cho từng người

[GIAI ĐOẠN 3: TỰ ĐÁNH GIÁ]
5. Nhân viên login → Vào trang "Tự đánh giá KPI"
6. Nhân viên xem danh sách nhiệm vụ được gán
7. Nhân viên tự chấm % hoàn thành (DiemTuDanhGia)
8. Hệ thống lưu vào NhanVienNhiemVu.DiemTuDanhGia

[GIAI ĐOẠN 4: CHẤM ĐIỂM]
9. Manager vào Dashboard KPI → Chọn nhân viên
10. Hệ thống tạo DanhGiaKPI (nếu chưa có)
11. Manager chấm điểm từng tiêu chí của từng nhiệm vụ
    → Nhập DiemDat vào ChiTietDiem[]
    → Preview real-time (công thức frontend)
12. Manager nhấn "Lưu tất cả"

[GIAI ĐOẠN 5: DUYỆT]
13. Manager kiểm tra lại toàn bộ
14. Manager nhấn "Duyệt KPI"
    → Backend gọi method duyet()
    → Tính TongDiemKPI theo công thức chính thức
    → Snapshot vào DB
    → Lưu LichSuDuyet[]
    → TrangThai: CHUA_DUYET → DA_DUYET

[GIAI ĐOẠN 6: HOÀN TẤT]
15. Nhân viên xem kết quả KPI của mình
16. Admin xuất báo cáo Excel
```

**Chi tiết:** Xem [WORKFLOW.md](./WORKFLOW.md)

---

## 🛠️ Hướng dẫn sử dụng

### Dành cho Developer

#### Setup môi trường

```bash
# Frontend
cd fe-bcgiaobanbvt
npm install
npm start  # http://localhost:3000

# Backend
cd giaobanbv-be
npm install
npm start  # http://localhost:8020
```

#### Chạy migration (nếu cần)

```javascript
// Thêm IsMucDoHoanThanh vào ChiTietDiem cũ
db.danhgianhiemvuthuongquy.updateMany(
  {},
  {
    $set: {
      "ChiTietDiem.$[].IsMucDoHoanThanh": false,
    },
  }
);
```

#### Test API

```bash
# Lấy danh sách KPI
curl http://localhost:8020/api/workmanagement/kpi?ChuKyDanhGiaID=xxx

# Tạo đánh giá KPI
curl -X POST http://localhost:8020/api/workmanagement/kpi \
  -H "Content-Type: application/json" \
  -d '{"ChuKyDanhGiaID":"xxx","NhanVienID":"yyy"}'
```

---

### Dành cho Quản lý (Manager)

#### Cách chấm điểm KPI

1. Vào **"Đánh giá KPI"** → Chọn chu kỳ
2. Dashboard hiển thị danh sách nhân viên
3. Click vào nhân viên → Dialog chấm điểm mở ra
4. Nhập điểm cho từng tiêu chí của từng nhiệm vụ
5. Kiểm tra tổng điểm preview (hiển thị real-time)
6. Nhấn **"Lưu tất cả"** → Lưu nháp
7. Nhấn **"Duyệt KPI"** → Hoàn tất chính thức

**Lưu ý:**

- Sau khi duyệt, không thể chỉnh sửa (trừ khi Admin hủy duyệt)
- Nên kiểm tra kỹ trước khi duyệt
- Có thể thêm nhận xét khi duyệt

---

### Dành cho Nhân viên

#### Cách tự đánh giá KPI

1. Vào **"Tự đánh giá KPI"**
2. Chọn chu kỳ đánh giá
3. Xem danh sách nhiệm vụ được gán
4. Kéo slider hoặc nhập số để tự chấm % hoàn thành
5. Nhấn **"Lưu"** cho từng nhiệm vụ
6. Hoặc **"Lưu tất cả"** để lưu hàng loạt

**Lưu ý:**

- Chỉ tự chấm "Mức độ hoàn thành", các tiêu chí khác do Manager chấm
- Có thể chỉnh sửa điểm trước khi Manager duyệt
- Sau khi Manager duyệt, không thể thay đổi

---

## 📚 Tài liệu chi tiết

### Tài liệu kỹ thuật

| Tài liệu                                           | Nội dung                                        | Độ dài   |
| -------------------------------------------------- | ----------------------------------------------- | -------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)               | Kiến trúc frontend + backend, data flow, models | 600 dòng |
| [FORMULA_CALCULATION.md](./FORMULA_CALCULATION.md) | Công thức tính điểm chi tiết với code thực tế   | 400 dòng |
| [WORKFLOW.md](./WORKFLOW.md)                       | Luồng nghiệp vụ từ tạo → chấm → duyệt           | 450 dòng |
| [API_REFERENCE.md](./API_REFERENCE.md)             | 29 API endpoints đầy đủ với params, response    | 800 dòng |
| [UI_COMPONENTS.md](./UI_COMPONENTS.md)             | Pages, components, Redux slices                 | 500 dòng |
| [MIGRATION_V2.md](./MIGRATION_V2.md)               | Lịch sử thay đổi V1 → V2                        | 300 dòng |

### Tài liệu lưu trữ (Archive)

- `_archive_docs_2025-11-25/KPI_GUIDE.md` - Tài liệu cũ V1
- `_archive_docs_2025-11-25/KPI_FORMULA.md` - Công thức cũ V1

---

## 🔧 Troubleshooting

### Lỗi thường gặp

**1. Không tính được DiemTuDanhGia khi duyệt**

```
Nguyên nhân: NhanVienNhiemVu không có record hoặc DiemTuDanhGia = null
Giải pháp: Kiểm tra assignments, đảm bảo nhân viên đã tự chấm
```

**2. TongDiemKPI = 0 sau khi duyệt**

```
Nguyên nhân: Tất cả nhiệm vụ chưa chấm điểm hoặc công thức sai
Giải pháp:
- Kiểm tra DanhGiaNhiemVuThuongQuy.ChiTietDiem có DiemDat chưa
- Xem log backend method duyet()
```

**3. Preview điểm khác với điểm sau duyệt**

```
Nguyên nhân: Frontend và backend dùng công thức khác nhau (bug)
Giải pháp: So sánh code utils/kpiCalculation.js vs models/DanhGiaKPI.js
→ Đảm bảo 2 nơi GIỐNG HỆT NHAU
```

**4. File kpiCoreSlice.js rỗng**

```
Trạng thái: DEPRECATED - File này đã không dùng
Giải pháp: Có thể xóa file này (hiện tại để tránh break imports cũ)
```

---

## 📞 Liên hệ & Hỗ trợ

- **Developer:** Đỗ Trung Kiên (dotrungkien6987@gmail.com)
- **Repository:** fe-bcgiaobanbvt / giaobanbv-be
- **Tài liệu gốc:** `src/features/QuanLyCongViec/KPI/docs/`

---

## 📝 Changelog

### V2.0 (25/11/2025) - ✅ Current

- ✅ Viết lại toàn bộ tài liệu dựa trên code thực tế
- ✅ Ghi nhận đầy đủ 29 API endpoints
- ✅ Document V2 architecture (kpiEvaluationSlice)
- ✅ Làm rõ công thức V2 với IsMucDoHoanThanh
- ✅ Thêm audit trail (LichSuDuyet, LichSuHuyDuyet)
- ✅ Tách biệt docs ra thư mục riêng
- ✅ Archive tài liệu cũ

### V1.x (Legacy)

- Tài liệu cũ lưu tại `_archive_docs_2025-11-25/`
- Một số phần có thể không còn chính xác với code hiện tại

---

**🎉 Chúc bạn sử dụng hệ thống KPI hiệu quả!**
