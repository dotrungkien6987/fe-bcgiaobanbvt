# Công thức Tính Điểm KPI

**Phiên bản:** 2.0  
**Ngày cập nhật:** October 6, 2025

---

## 📐 Tổng quan

Hệ thống tính điểm KPI dựa trên công thức 3 bước:

```
Bước 1: Tính điểm tiêu chí cho từng NVTQ
Bước 2: Tính điểm nhiệm vụ
Bước 3: Tổng hợp KPI
```

---

## 1. Công thức chi tiết

### Bước 1: Tính Tổng Điểm Tiêu Chí

```javascript
TongDiemTieuChi (%) =
  Σ(DiemDat × TrongSo) [TANG_DIEM]
  - Σ(DiemDat × TrongSo) [GIAM_DIEM]
```

**Trong đó:**

- `DiemDat`: Điểm người quản lý chấm (0-100 hoặc theo GiaTriMax)
- `TrongSo`: Trọng số của tiêu chí (mặc định từ `TieuChiDanhGia.TrongSoMacDinh`)
- `TANG_DIEM`: Tiêu chí cộng điểm
- `GIAM_DIEM`: Tiêu chí trừ điểm

---

### Bước 2: Tính Điểm Nhiệm Vụ

```javascript
DiemNhiemVu = MucDoKho × (TongDiemTieuChi / 100)
```

**Trong đó:**

- `MucDoKho`: Độ khó của nhiệm vụ (1-10)
- `TongDiemTieuChi`: Tổng điểm % từ Bước 1

**Lý do chia 100:**

- Chuyển % về dạng thập phân (86% = 0.86)
- Điểm nhiệm vụ cùng đơn vị với mức độ khó

---

### Bước 3: Tổng Điểm KPI

```javascript
TongDiemKPI (%) = Σ DiemNhiemVu[i]  (với i = 1..n)
```

**Trong đó:**

- `n`: Số nhiệm vụ thường quy của nhân viên
- `DiemNhiemVu[i]`: Điểm của nhiệm vụ thứ i

---

## 2. Ví dụ thực tế

### Ví dụ 1: Nhân viên IT - 3 nhiệm vụ

#### Setup:

```javascript
Tiêu chí đánh giá:
1. Mức độ hoàn thành (TANG_DIEM, 0-100, trọng số 1.0)
2. Điểm tích cực (TANG_DIEM, 0-10, trọng số 1.0)
3. Điểm sáng tạo (TANG_DIEM, 0-10, trọng số 0.5)
4. Điểm trừ quá hạn (GIAM_DIEM, 0-10, trọng số 1.0)

Nhiệm vụ của nhân viên:
- NVTQ 1: Quản lý hạ tầng mạng (MucDoKho = 5)
- NVTQ 2: Bảo mật hệ thống (MucDoKho = 3)
- NVTQ 3: Hỗ trợ phần mềm HIS (MucDoKho = 2)
```

#### Tính toán:

**NVTQ 1: Quản lý hạ tầng mạng**

```javascript
Chấm điểm:
- Mức độ hoàn thành: 85 (trọng số 1.0)
- Điểm tích cực: 3 (trọng số 1.0)
- Điểm sáng tạo: 0 (trọng số 0.5)
- Điểm trừ quá hạn: 2 (trọng số 1.0)

// Bước 1: Tổng điểm tiêu chí
tongTang = (85 × 1.0) + (3 × 1.0) + (0 × 0.5) = 88
tongGiam = (2 × 1.0) = 2
TongDiemTieuChi = 88 - 2 = 86%

// Bước 2: Điểm nhiệm vụ
DiemNhiemVu = 5 × (86 / 100) = 5 × 0.86 = 4.3
```

**NVTQ 2: Bảo mật hệ thống**

```javascript
Chấm điểm:
- Mức độ hoàn thành: 90
- Điểm tích cực: 5
- Điểm sáng tạo: 3
- Điểm trừ quá hạn: 0

TongDiemTieuChi = (90×1 + 5×1 + 3×0.5) - (0×1) = 96.5%
DiemNhiemVu = 3 × 0.965 = 2.895
```

**NVTQ 3: Hỗ trợ phần mềm HIS**

```javascript
Chấm điểm:
- Mức độ hoàn thành: 95
- Điểm tích cực: 2
- Điểm sáng tạo: 1
- Điểm trừ quá hạn: 5

TongDiemTieuChi = (95×1 + 2×1 + 1×0.5) - (5×1) = 92.5%
DiemNhiemVu = 2 × 0.925 = 1.85
```

**Tổng KPI:**

```javascript
TongDiemKPI = 4.3 + 2.895 + 1.85 = 9.045

// Hiển thị: "9.045 / 10 (90.45%)"
// Hoặc: "90.45%"
```

---

### Ví dụ 2: Nhân viên Senior - 2 nhiệm vụ khó

#### Setup:

```javascript
Nhiệm vụ:
- NVTQ 1: Thiết kế hệ thống mới (MucDoKho = 8)
- NVTQ 2: Quản lý dự án IT (MucDoKho = 6)
```

#### Tính toán:

**NVTQ 1: Thiết kế hệ thống mới**

```javascript
Chấm điểm:
- Mức độ hoàn thành: 95
- Điểm tích cực: 5
- Điểm sáng tạo: 8
- Điểm trừ quá hạn: 0

TongDiemTieuChi = (95×1 + 5×1 + 8×0.5) - (0×1) = 104%
DiemNhiemVu = 8 × 1.04 = 8.32
```

**NVTQ 2: Quản lý dự án IT**

```javascript
Chấm điểm:
- Mức độ hoàn thành: 88
- Điểm tích cực: 3
- Điểm sáng tạo: 0
- Điểm trừ quá hạn: 3

TongDiemTieuChi = (88×1 + 3×1 + 0×0.5) - (3×1) = 88%
DiemNhiemVu = 6 × 0.88 = 5.28
```

**Tổng KPI:**

```javascript
TongDiemKPI = 8.32 + 5.28 = 13.6

// Hiển thị: "13.6 / 14 (97.14%)"
// Hoặc: "136%" (nếu không chuẩn hóa)
```

---

## 3. Cases đặc biệt

### Case 1: Không có tiêu chí GIAM_DIEM

```javascript
ChiTietDiem = [
  { TieuChiID: "...", DiemDat: 90, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
  { TieuChiID: "...", DiemDat: 5, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" }
];

tongTang = 90×1 + 5×1 = 95
tongGiam = 0
TongDiemTieuChi = 95 - 0 = 95%
```

---

### Case 2: Chỉ có tiêu chí GIAM_DIEM

```javascript
ChiTietDiem = [
  { TieuChiID: "...", DiemDat: 10, TrongSo: 1.0, LoaiTieuChi: "GIAM_DIEM" }
];

tongTang = 0
tongGiam = 10×1 = 10
TongDiemTieuChi = 0 - 10 = -10%

DiemNhiemVu = 5 × (-10/100) = -0.5
```

**→ Cho phép điểm âm để phản ánh hiệu suất kém.**

---

### Case 3: Trọng số khác nhau

```javascript
ChiTietDiem = [
  { TieuChiID: "...", DiemDat: 80, TrongSo: 2.0, LoaiTieuChi: "TANG_DIEM" },  // Quan trọng gấp đôi
  { TieuChiID: "...", DiemDat: 90, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
  { TieuChiID: "...", DiemDat: 5, TrongSo: 0.5, LoaiTieuChi: "GIAM_DIEM" }   // Ít quan trọng
];

tongTang = 80×2.0 + 90×1.0 = 160 + 90 = 250
tongGiam = 5×0.5 = 2.5
TongDiemTieuChi = 250 - 2.5 = 247.5%

// Nếu MucDoKho = 3:
DiemNhiemVu = 3 × 2.475 = 7.425
```

---

### Case 4: Điều chỉnh Mức độ khó

```javascript
// Nhiệm vụ gốc: MucDoKho = 5
// Người quản lý thấy thực tế khó hơn → điều chỉnh lên 7

TongDiemTieuChi = 85%  (giữ nguyên)
DiemNhiemVu = 7 × 0.85 = 5.95  (thay vì 5 × 0.85 = 4.25)
```

---

## 4. Validation Rules

### 4.1 Ràng buộc DiemDat

```javascript
// Mỗi tiêu chí có GiaTriMin và GiaTriMax
TieuChiDanhGia {
  TenTieuChi: "Mức độ hoàn thành",
  GiaTriMin: 0,
  GiaTriMax: 100
}

// Validation:
if (DiemDat < GiaTriMin || DiemDat > GiaTriMax) {
  throw new Error(`Điểm phải từ ${GiaTriMin} đến ${GiaTriMax}`);
}
```

### 4.2 Ràng buộc MucDoKho

```javascript
if (MucDoKho < 1 || MucDoKho > 10) {
  throw new Error("Mức độ khó phải từ 1-10");
}
```

### 4.3 Ràng buộc TrongSo

```javascript
// Không bắt buộc tổng trọng số = 100%
// Nhưng khuyến nghị >= 0

if (TrongSo < 0) {
  throw new Error("Trọng số phải >= 0");
}
```

---

## 5. Hiển thị KPI

### 5.1 Dạng điểm thô

```javascript
TongDiemKPI = 9.045;

// Hiển thị:
("Tổng KPI: 9.045 điểm");
```

### 5.2 Dạng phần trăm (Recommended)

```javascript
TongDiemKPI = 9.045;

// Hiển thị:
("KPI: 90.45%"); // (9.045 / 10) × 100%
```

### 5.3 Dạng phân số

```javascript
TongDiemKPI = 9.045;
TongMucDoKho = 10; // Tổng độ khó của các nhiệm vụ

// Hiển thị:
("KPI: 9.045 / 10 (90.45%)");
```

### 5.4 Với biểu đồ

```javascript
<LinearProgress
  variant="determinate"
  value={Math.min(100, (TongDiemKPI / 10) * 100)}
  color={
    TongDiemKPI >= 9 ? "success" : TongDiemKPI >= 7 ? "primary" : "warning"
  }
/>
```

---

## 6. Code Implementation

### 6.1 Backend (Pre-save hook)

```javascript
// DanhGiaNhiemVuThuongQuy Model
danhGiaNhiemVuThuongQuySchema.pre("save", function (next) {
  if (this.ChiTietDiem && this.ChiTietDiem.length > 0) {
    let tongTang = 0;
    let tongGiam = 0;

    this.ChiTietDiem.forEach((tc) => {
      const diemCoTrongSo = tc.DiemDat * tc.TrongSo;

      if (tc.LoaiTieuChi === "TANG_DIEM") {
        tongTang += diemCoTrongSo;
      } else if (tc.LoaiTieuChi === "GIAM_DIEM") {
        tongGiam += diemCoTrongSo;
      }
    });

    // Bước 1: Tổng điểm tiêu chí
    this.TongDiemTieuChi = tongTang - tongGiam;

    // Bước 2: Điểm nhiệm vụ
    this.DiemNhiemVu = this.MucDoKho * (this.TongDiemTieuChi / 100);
  }

  next();
});
```

### 6.2 Backend (Tính tổng KPI)

```javascript
// DanhGiaKPI Model
danhGiaKPISchema.methods.tinhTongDiemKPI = async function () {
  const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");

  const danhGiaNhiemVu = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: this._id,
    isDeleted: false,
  });

  // Bước 3: Tổng KPI
  this.TongDiemKPI = danhGiaNhiemVu.reduce(
    (tong, nhiemVu) => tong + (nhiemVu.DiemNhiemVu || 0),
    0
  );

  return this.save();
};
```

### 6.3 Frontend (Custom Hook)

```javascript
// hooks/useKPICalculator.js
import { useMemo } from "react";

export function useKPICalculator(danhGiaNhiemVu) {
  const tinhTongKPI = useMemo(() => {
    return danhGiaNhiemVu.reduce((tong, nv) => {
      return tong + (nv.DiemNhiemVu || 0);
    }, 0);
  }, [danhGiaNhiemVu]);

  const tinhDiemNhiemVu = (chiTietDiem, mucDoKho) => {
    let tongTang = 0;
    let tongGiam = 0;

    chiTietDiem.forEach((tc) => {
      const diemCoTrongSo = tc.DiemDat * tc.TrongSo;

      if (tc.LoaiTieuChi === "TANG_DIEM") {
        tongTang += diemCoTrongSo;
      } else if (tc.LoaiTieuChi === "GIAM_DIEM") {
        tongGiam += diemCoTrongSo;
      }
    });

    const tongDiemTieuChi = tongTang - tongGiam;
    return mucDoKho * (tongDiemTieuChi / 100);
  };

  return {
    tongKPI: tinhTongKPI,
    tinhDiemNhiemVu,
    kpiPercent: (tinhTongKPI / 10) * 100,
  };
}
```

---

## 7. Testing Cases

### Test Case 1: Tính toán cơ bản

```javascript
describe("KPI Calculation", () => {
  it("should calculate TongDiemTieuChi correctly", () => {
    const chiTietDiem = [
      { DiemDat: 85, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
      { DiemDat: 3, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
      { DiemDat: 2, TrongSo: 1.0, LoaiTieuChi: "GIAM_DIEM" },
    ];

    const tongTang = 85 * 1.0 + 3 * 1.0;
    const tongGiam = 2 * 1.0;
    const result = tongTang - tongGiam;

    expect(result).toBe(86);
  });

  it("should calculate DiemNhiemVu correctly", () => {
    const mucDoKho = 5;
    const tongDiemTieuChi = 86;
    const result = mucDoKho * (tongDiemTieuChi / 100);

    expect(result).toBeCloseTo(4.3, 1);
  });

  it("should sum up TongDiemKPI correctly", () => {
    const danhGiaNhiemVu = [
      { DiemNhiemVu: 4.3 },
      { DiemNhiemVu: 2.85 },
      { DiemNhiemVu: 1.76 },
    ];

    const result = danhGiaNhiemVu.reduce((sum, nv) => sum + nv.DiemNhiemVu, 0);

    expect(result).toBeCloseTo(8.91, 2);
  });
});
```

### Test Case 2: Edge cases

```javascript
describe("KPI Edge Cases", () => {
  it("should handle negative TongDiemTieuChi", () => {
    const chiTietDiem = [
      { DiemDat: 50, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
      { DiemDat: 60, TrongSo: 1.0, LoaiTieuChi: "GIAM_DIEM" },
    ];

    const result = 50 - 60;
    expect(result).toBe(-10);

    const diemNhiemVu = 5 * (result / 100);
    expect(diemNhiemVu).toBe(-0.5);
  });

  it("should handle different weights", () => {
    const chiTietDiem = [
      { DiemDat: 80, TrongSo: 2.0, LoaiTieuChi: "TANG_DIEM" },
      { DiemDat: 90, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },
    ];

    const result = 80 * 2.0 + 90 * 1.0;
    expect(result).toBe(250);
  });

  it("should handle zero ChiTietDiem", () => {
    const chiTietDiem = [];

    const tongDiemTieuChi = 0;
    const diemNhiemVu = 5 * (tongDiemTieuChi / 100);

    expect(diemNhiemVu).toBe(0);
  });
});
```

---

## 8. FAQ

### Q1: Tại sao chia 100 trong công thức DiemNhiemVu?

**A:** Để chuyển % về dạng thập phân. Nếu `TongDiemTieuChi = 86%`, ta cần `0.86` để nhân với `MucDoKho`.

```javascript
// Sai:
DiemNhiemVu = 5 × 86 = 430  // Quá lớn!

// Đúng:
DiemNhiemVu = 5 × (86/100) = 5 × 0.86 = 4.3  // Hợp lý
```

---

### Q2: TongDiemKPI có thể > 100% không?

**A:** Có. Nếu nhân viên làm việc xuất sắc, có nhiều điểm cộng (sáng tạo, tích cực), TongDiemKPI có thể > 10 (tương đương > 100%).

```javascript
TongDiemKPI = 13.6
→ Hiển thị: "136%" hoặc "13.6 / 14 (97.14%)" nếu chuẩn hóa theo tổng độ khó
```

---

### Q3: TongDiemKPI có thể âm không?

**A:** Có. Nếu điểm trừ quá nhiều, TongDiemKPI có thể âm để phản ánh hiệu suất kém.

```javascript
TongDiemKPI = -2.5
→ Hiển thị: "-25%" hoặc "0%" (nếu clamp về 0)
```

**Recommended:** Cho phép âm để đánh giá chính xác.

---

### Q4: Trọng số có bắt buộc tổng = 100% không?

**A:** Không. Hệ thống linh hoạt, không bắt buộc tổng trọng số = 100%.

Ví dụ:

```javascript
// Tổng trọng số = 2.5
TieuChi1: TrongSo = 1.0;
TieuChi2: TrongSo = 1.0;
TieuChi3: TrongSo = 0.5;

// Vẫn hợp lệ
```

---

### Q5: Có cần chuẩn hóa KPI về thang 10 không?

**A:** Tùy theo yêu cầu hiển thị:

**Option 1: Không chuẩn hóa (Recommended)**

```javascript
TongDiemKPI = 9.045
→ Hiển thị: "90.45%"
```

**Option 2: Chuẩn hóa theo tổng độ khó**

```javascript
TongDiemKPI = 13.6
TongMucDoKho = 14

DiemChuanHoa = 13.6 / 14 = 0.971
→ Hiển thị: "97.1%"
```

**Theo yêu cầu:** Không cần chuẩn hóa, để điểm thô.

---

## 9. Tóm tắt công thức

| Bước  | Công thức                                        | Output |
| ----- | ------------------------------------------------ | ------ |
| **1** | `TongDiemTieuChi = Σ(TANG) - Σ(GIAM)`            | %      |
| **2** | `DiemNhiemVu = MucDoKho × (TongDiemTieuChi/100)` | Điểm   |
| **3** | `TongDiemKPI = Σ DiemNhiemVu`                    | Điểm/% |

**Display:**

```javascript
"KPI: {TongDiemKPI / 10 × 100}%";
// hoặc
"KPI: {TongDiemKPI} / 10";
```

---

**Tài liệu liên quan:**

- [`KPI_BUSINESS_LOGIC.md`](./KPI_BUSINESS_LOGIC.md) - Business rules
- [`KPI_COMPONENT_GUIDE.md`](./KPI_COMPONENT_GUIDE.md) - Implementation guide

**Last Updated:** October 6, 2025
