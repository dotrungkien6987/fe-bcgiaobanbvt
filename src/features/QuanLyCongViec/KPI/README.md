# Module Đánh Giá KPI

**Phiên bản:** 2.0  
**Ngày tạo:** October 6, 2025  
**Trạng thái:** In Development

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Hướng dẫn phát triển](#hướng-dẫn-phát-triển)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

---

## Tổng quan

Module Đánh giá KPI cho phép người quản lý đánh giá hiệu suất làm việc của nhân viên dựa trên:

- **Nhiệm vụ thường quy** được giao cho nhân viên
- **Tiêu chí đánh giá động** (cấu hình linh hoạt)
- **Chu kỳ đánh giá** (tháng/quý/năm)
- **Công thức tính toán tự động** theo tiêu chí

### Đặc điểm chính

✅ Tiêu chí đánh giá động (TANG_DIEM/GIAM_DIEM)  
✅ Tính toán tự động điểm KPI theo công thức  
✅ Workflow đơn giản (CHUA_DUYET → DA_DUYET)  
✅ Người tạo chính là người duyệt (không qua cấp khác)  
✅ Tham chiếu công việc thực tế để đánh giá  
✅ Responsive UI với Material-UI v5

---

## Cấu trúc thư mục

```
KPI/
├── README.md                           # File này
├── KPI_BUSINESS_LOGIC.md              # Logic nghiệp vụ chi tiết
├── KPI_FORMULA.md                     # Công thức tính điểm
├── KPI_API_SPEC.md                    # Đặc tả API
├── KPI_COMPONENT_GUIDE.md             # Hướng dẫn phát triển component
├── KPI_WORKFLOW.md                    # Quy trình nghiệp vụ
│
├── kpiSlice.js                        # Redux state management
│
├── pages/                             # Các trang chính
│   ├── DanhGiaKPIPage.js             # Trang chấm KPI
│   ├── XemKPIPage.js                 # Trang xem KPI (nhân viên)
│   └── BaoCaoKPIPage.js              # Trang báo cáo tổng hợp
│
├── components/                        # Components con
│   ├── DanhSachNhanVien/             # Chọn nhân viên
│   ├── FormChamDiem/                 # Form chấm điểm NVTQ
│   ├── ChiTietKPI/                   # Hiển thị chi tiết KPI
│   └── ThongKe/                      # Biểu đồ thống kê
│
└── hooks/                            # Custom hooks
    ├── useKPICalculator.js           # Hook tính toán KPI
    └── useKPIPermission.js           # Hook kiểm tra quyền
```

---

## Công nghệ sử dụng

### Frontend Stack

- **React 18** - UI framework
- **Redux Toolkit** - State management
- **Material-UI v5** - Component library
- **React Hook Form** - Form validation
- **Yup** - Schema validation
- **Recharts** - Data visualization
- **dayjs** - Date handling

### Patterns

- **Redux Slice Pattern** - Manual thunks với startLoading/hasError/success
- **Form Provider Pattern** - React Hook Form + Yup
- **Custom Hooks** - Logic tái sử dụng
- **Component Composition** - Tách nhỏ components

---

## Hướng dẫn phát triển

### 1. Cài đặt dependencies

```bash
# Đã có sẵn trong project
npm install @reduxjs/toolkit react-redux
npm install @mui/material @emotion/react @emotion/styled
npm install react-hook-form yup @hookform/resolvers
npm install recharts dayjs
npm install react-toastify
```

### 2. Thêm KPI slice vào store

```javascript
// src/app/store.js
import kpiReducer from "../features/QuanLyCongViec/KPI/kpiSlice";

export const store = configureStore({
  reducer: {
    // ... existing reducers
    kpi: kpiReducer,
  },
});
```

### 3. Thêm routes

```javascript
// src/routes/index.js
import DanhGiaKPIPage from "../features/QuanLyCongViec/KPI/pages/DanhGiaKPIPage";
import XemKPIPage from "../features/QuanLyCongViec/KPI/pages/XemKPIPage";

{
  path: "kpi",
  children: [
    { path: "danh-gia", element: <DanhGiaKPIPage /> },
    { path: "xem", element: <XemKPIPage /> },
    { path: "bao-cao", element: <BaoCaoKPIPage /> },
  ]
}
```

### 4. Development workflow

```bash
# 1. Tạo models backend (đã có)
# 2. Tạo controllers & routes backend (đã có)
# 3. Tạo Redux slice
npm run dev  # Start frontend

# 4. Tạo components theo thứ tự:
# - Tạo form components cơ bản
# - Tạo pages
# - Tích hợp với Redux
# - Testing

# 5. Polish UI/UX
```

---

## Công thức tính KPI

### Công thức cơ bản

```javascript
// Bước 1: Tính điểm tiêu chí
TongDiemTieuChi = Σ(DiemDat × TrongSo) [TANG_DIEM] - Σ(DiemDat × TrongSo) [GIAM_DIEM]

// Bước 2: Tính điểm nhiệm vụ
DiemNhiemVu = MucDoKho × (TongDiemTieuChi / 100)

// Bước 3: Tổng KPI
TongDiemKPI = Σ DiemNhiemVu (của tất cả nhiệm vụ)
```

### Ví dụ

```javascript
// NVTQ: Quản lý hạ tầng mạng (MucDoKho = 5)
Tiêu chí:
- Mức độ hoàn thành: 85 (trọng số 1.0)
- Điểm tích cực: 3 (trọng số 1.0)
- Điểm trừ quá hạn: -2 (trọng số 1.0)

TongDiemTieuChi = (85×1 + 3×1) - (2×1) = 86%
DiemNhiemVu = 5 × (86/100) = 4.3

// Tổng 3 nhiệm vụ: 4.3 + 2.85 + 1.76 = 8.91
// Hiển thị: "8.91 / 10 (89.1%)"
```

Chi tiết: Xem [`KPI_FORMULA.md`](./KPI_FORMULA.md)

---

## Tài liệu tham khảo

| Tài liệu                                             | Nội dung                         |
| ---------------------------------------------------- | -------------------------------- |
| [`KPI_BUSINESS_LOGIC.md`](./KPI_BUSINESS_LOGIC.md)   | Logic nghiệp vụ chi tiết         |
| [`KPI_FORMULA.md`](./KPI_FORMULA.md)                 | Công thức tính điểm              |
| [`KPI_API_SPEC.md`](./KPI_API_SPEC.md)               | API endpoints & request/response |
| [`KPI_WORKFLOW.md`](./KPI_WORKFLOW.md)               | Quy trình nghiệp vụ              |
| [`KPI_COMPONENT_GUIDE.md`](./KPI_COMPONENT_GUIDE.md) | Hướng dẫn tạo components         |

### Backend docs

- `giaobanbv-be/modules/workmanagement/docs/KPI_SYSTEM_DOCUMENTATION.md`
- `giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`
- `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`

---

## Quick Start

### Chấm KPI cho nhân viên

```javascript
import { useDispatch } from "react-redux";
import { taoDanhGiaKPI, chamDiemNhiemVu } from "./kpiSlice";

function ChamKPIExample() {
  const dispatch = useDispatch();

  const handleTaoDanhGia = async () => {
    const result = await dispatch(
      taoDanhGiaKPI({
        ChuKyID: "chu-ky-id",
        NhanVienID: "nhan-vien-id",
      })
    );
    // result.danhGiaKPI, result.danhGiaNhiemVu
  };

  const handleChamDiem = async () => {
    await dispatch(
      chamDiemNhiemVu("danh-gia-nhiem-vu-id", {
        ChiTietDiem: [
          { TieuChiID: "...", DiemDat: 85, TrongSo: 1.0 },
          { TieuChiID: "...", DiemDat: 3, TrongSo: 1.0 },
        ],
        MucDoKho: 5,
      })
    );
  };

  return (
    <>
      <button onClick={handleTaoDanhGia}>Tạo đánh giá</button>
      <button onClick={handleChamDiem}>Chấm điểm</button>
    </>
  );
}
```

---

## Changelog

### Version 2.0 (October 6, 2025)

- ✅ Thiết kế lại công thức tính KPI đơn giản hơn
- ✅ Bỏ TongMucDoKhoLyTuong (không cần chuẩn hóa)
- ✅ Workflow 2 trạng thái: CHUA_DUYET/DA_DUYET
- ✅ Người tạo = người duyệt (không qua cấp khác)
- ✅ Tiêu chí đánh giá động từ database

---

## Liên hệ

**Developer:** AI Agent  
**Last Updated:** October 6, 2025  
**Status:** Ready for Frontend Development
