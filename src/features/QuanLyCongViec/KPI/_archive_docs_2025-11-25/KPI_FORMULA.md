# KPI Scoring Formula# Công thức Tính Điểm KPI

**Version:** 3.0 (Simplified - No TrongSo) **Phiên bản:** 2.0

**Last Updated:** October 14, 2025**Ngày cập nhật:** October 6, 2025

---

## Core Formula## 📐 Tổng quan

### Step 1: Calculate Individual Criterion ScoreHệ thống tính điểm KPI dựa trên công thức 3 bước:

`javascript`

DiemTieuChi = (GiaTriThucTe / 100) × (LoaiTieuChi === "GIAM_DIEM" ? -1 : 1)Bước 1: Tính điểm tiêu chí cho từng NVTQ

````Bước 2: Tính điểm nhiệm vụ

Bước 3: Tổng hợp KPI

**Where:**```

- `GiaTriThucTe`: Score input by manager (0 to GiaTriMax)

- Divide by 100: Convert to decimal (80% → 0.8)---

- `LoaiTieuChi`:

  - `TANG_DIEM`: Positive (+) - Add to total## 1. Công thức chi tiết

  - `GIAM_DIEM`: Negative (−) - Subtract from total

### Bước 1: Tính Tổng Điểm Tiêu Chí

---

```javascript

### Step 2: Sum All Criteria ScoresTongDiemTieuChi (%) =

  Σ(DiemDat × TrongSo) [TANG_DIEM]

```javascript  - Σ(DiemDat × TrongSo) [GIAM_DIEM]

TongDiemTieuChi = Σ(DiemTieuChi)  // With +/- signs```

````

**Trong đó:**

**Example:**

```javascript- `DiemDat`: Điểm người quản lý chấm (0-100 hoặc theo GiaTriMax)

Tiêu chí 1 (TANG_DIEM): DiemDat = 80 → +0.80- `TrongSo`: Trọng số của tiêu chí (mặc định từ `TieuChiDanhGia.TrongSoMacDinh`)

Tiêu chí 2 (TANG_DIEM): DiemDat = 90 → +0.90- `TANG_DIEM`: Tiêu chí cộng điểm

Tiêu chí 3 (GIAM_DIEM): DiemDat = 5 → -0.05- `GIAM_DIEM`: Tiêu chí trừ điểm

────────────────────────────────────────────

TongDiemTieuChi = 0.80 + 0.90 - 0.05 = 1.65---

````

### Bước 2: Tính Điểm Nhiệm Vụ

---

```javascript

### Step 3: Multiply by Task DifficultyDiemNhiemVu = MucDoKho × (TongDiemTieuChi / 100)

````

```javascript

DiemNhiemVu = MucDoKho × TongDiemTieuChi**Trong đó:**

```

- `MucDoKho`: Độ khó của nhiệm vụ (1-10)

**Where:**- `TongDiemTieuChi`: Tổng điểm % từ Bước 1

- `MucDoKho`: Task difficulty (1.0 - 10.0, decimals allowed)

- Higher MucDoKho = higher impact on KPI**Lý do chia 100:**

**Example:**- Chuyển % về dạng thập phân (86% = 0.86)

````javascript- Điểm nhiệm vụ cùng đơn vị với mức độ khó

MucDoKho = 7.5

TongDiemTieuChi = 1.65---

DiemNhiemVu = 7.5 × 1.65 = 12.375 điểm

```### Bước 3: Tổng Điểm KPI



---```javascript

TongDiemKPI (%) = Σ DiemNhiemVu[i]  (với i = 1..n)

### Step 4: Total KPI Score```



```javascript**Trong đó:**

TongDiemKPI = Σ(DiemNhiemVu)  // Sum all tasks

```- `n`: Số nhiệm vụ thường quy của nhân viên

- `DiemNhiemVu[i]`: Điểm của nhiệm vụ thứ i

---

---

## Complete Example

## 2. Ví dụ thực tế

### Scenario: Nhân viên có 2 nhiệm vụ

### Ví dụ 1: Nhân viên IT - 3 nhiệm vụ

**Nhiệm vụ 1:** "Khám bệnh" (MucDoKho = 7.5)

#### Setup:

| Tiêu chí | Loại | DiemDat | Calculation |

|----------|------|---------|-------------|```javascript

| Tốc độ | TANG_DIEM | 80 | +0.80 |Tiêu chí đánh giá:

| Chất lượng | TANG_DIEM | 90 | +0.90 |1. Mức độ hoàn thành (TANG_DIEM, 0-100, trọng số 1.0)

| Vi phạm | GIAM_DIEM | 5 | -0.05 |2. Điểm tích cực (TANG_DIEM, 0-10, trọng số 1.0)

| **Tổng** | | | **1.65** |3. Điểm sáng tạo (TANG_DIEM, 0-10, trọng số 0.5)

4. Điểm trừ quá hạn (GIAM_DIEM, 0-10, trọng số 1.0)

```javascript

DiemNhiemVu1 = 7.5 × 1.65 = 12.375 điểmNhiệm vụ của nhân viên:

```- NVTQ 1: Quản lý hạ tầng mạng (MucDoKho = 5)

- NVTQ 2: Bảo mật hệ thống (MucDoKho = 3)

**Nhiệm vụ 2:** "Hội chẩn" (MucDoKho = 8.0)- NVTQ 3: Hỗ trợ phần mềm HIS (MucDoKho = 2)

````

| Tiêu chí | Loại | DiemDat | Calculation |

|----------|------|---------|-------------|#### Tính toán:

| Mức độ tham gia | TANG_DIEM | 95 | +0.95 |

| Đóng góp ý kiến | TANG_DIEM | 85 | +0.85 |**NVTQ 1: Quản lý hạ tầng mạng**

| **Tổng** | | | **1.80** |

````javascript

```javascriptChấm điểm:

DiemNhiemVu2 = 8.0 × 1.80 = 14.400 điểm- Mức độ hoàn thành: 85 (trọng số 1.0)

```- Điểm tích cực: 3 (trọng số 1.0)

- Điểm sáng tạo: 0 (trọng số 0.5)

**Total KPI:**- Điểm trừ quá hạn: 2 (trọng số 1.0)

```javascript

TongDiemKPI = 12.375 + 14.400 = 26.775 điểm// Bước 1: Tổng điểm tiêu chí

```tongTang = (85 × 1.0) + (3 × 1.0) + (0 × 0.5) = 88

tongGiam = (2 × 1.0) = 2

---TongDiemTieuChi = 88 - 2 = 86%



## Edge Cases// Bước 2: Điểm nhiệm vụ

DiemNhiemVu = 5 × (86 / 100) = 5 × 0.86 = 4.3

### 1. Different GiaTriMax (Not 100)```



```javascript**NVTQ 2: Bảo mật hệ thống**

// Tiêu chí: "Điểm sáng tạo" (GiaTriMin = 0, GiaTriMax = 5, DonVi = "điểm")

// User inputs: 4 điểm```javascript

Chấm điểm:

DiemTieuChi = 4 / 100 = 0.04- Mức độ hoàn thành: 90

```- Điểm tích cực: 5

- Điểm sáng tạo: 3

**Note:** Still divide by 100 (not by GiaTriMax). The formula is consistent.- Điểm trừ quá hạn: 0



---TongDiemTieuChi = (90×1 + 5×1 + 3×0.5) - (0×1) = 96.5%

DiemNhiemVu = 3 × 0.965 = 2.895

### 2. All GIAM_DIEM```



```javascript**NVTQ 3: Hỗ trợ phần mềm HIS**

// All criteria are GIAM_DIEM

Tiêu chí 1 (GIAM_DIEM): DiemDat = 10  → -0.10```javascript

Tiêu chí 2 (GIAM_DIEM): DiemDat = 5   → -0.05Chấm điểm:

────────────────────────────────────────────- Mức độ hoàn thành: 95

TongDiemTieuChi = -0.15- Điểm tích cực: 2

- Điểm sáng tạo: 1

DiemNhiemVu = 7.5 × (-0.15) = -1.125 điểm- Điểm trừ quá hạn: 5

````

TongDiemTieuChi = (95×1 + 2×1 + 1×0.5) - (5×1) = 92.5%

**Result:** Negative task score is possible!DiemNhiemVu = 2 × 0.925 = 1.85

````

---

**Tổng KPI:**

### 3. Zero Scores

```javascript

```javascriptTongDiemKPI = 4.3 + 2.895 + 1.85 = 9.045

// All DiemDat = 0

TongDiemTieuChi = 0// Hiển thị: "9.045 / 10 (90.45%)"

DiemNhiemVu = 7.5 × 0 = 0 điểm// Hoặc: "90.45%"

````

**Validation:** Cannot approve KPI if any task has zero score.---

---### Ví dụ 2: Nhân viên Senior - 2 nhiệm vụ khó

### 4. Perfect Score#### Setup:

`javascript`javascript

// All criteria at max (100)Nhiệm vụ:

Tiêu chí 1 (TANG_DIEM): DiemDat = 100 → +1.00- NVTQ 1: Thiết kế hệ thống mới (MucDoKho = 8)

Tiêu chí 2 (TANG_DIEM): DiemDat = 100 → +1.00- NVTQ 2: Quản lý dự án IT (MucDoKho = 6)

Tiêu chí 3 (TANG_DIEM): DiemDat = 100 → +1.00```

────────────────────────────────────────────

TongDiemTieuChi = 3.00#### Tính toán:

DiemNhiemVu = 7.5 × 3.00 = 22.5 điểm**NVTQ 1: Thiết kế hệ thống mới**

`````

```javascript

**Max possible score per task:** `MucDoKho × (số tiêu chí TANG_DIEM)`Chấm điểm:

- Mức độ hoàn thành: 95

---- Điểm tích cực: 5

- Điểm sáng tạo: 8

## Key Points- Điểm trừ quá hạn: 0



✅ **Always divide by 100** (not by GiaTriMax)  TongDiemTieuChi = (95×1 + 5×1 + 8×0.5) - (0×1) = 104%

✅ **GIAM_DIEM uses negative sign** (not separate subtraction)  DiemNhiemVu = 8 × 1.04 = 8.32

✅ **MucDoKho multiplies the sum** (impact factor)  ```

✅ **No weight field** (removed TrongSo in v3.0)

✅ **Decimals are normal** (use `.toFixed(2)` for display)**NVTQ 2: Quản lý dự án IT**



---```javascript

Chấm điểm:

## Backend Implementation- Mức độ hoàn thành: 88

- Điểm tích cực: 3

**Location:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`- Điểm sáng tạo: 0

- Điểm trừ quá hạn: 3

```javascript

// Recalculate scores after saveTongDiemTieuChi = (88×1 + 3×1 + 0×0.5) - (3×1) = 88%

function recalculateScores(nhiemVu) {DiemNhiemVu = 6 × 0.88 = 5.28

  // Step 1-2: Sum criteria```

  nhiemVu.TongDiemTieuChi = nhiemVu.ChiTietDiem.reduce((sum, tc) => {

    const score = (tc.DiemDat || 0) / 100;**Tổng KPI:**

    return sum + (tc.LoaiTieuChi === "GIAM_DIEM" ? -score : score);

  }, 0);```javascript

  TongDiemKPI = 8.32 + 5.28 = 13.6

  // Step 3: Multiply by difficulty

  nhiemVu.DiemNhiemVu = nhiemVu.TongDiemTieuChi * (nhiemVu.MucDoKho || 5);// Hiển thị: "13.6 / 14 (97.14%)"

  // Hoặc: "136%" (nếu không chuẩn hóa)

  return nhiemVu;```

}

```---



---## 3. Cases đặc biệt



## Frontend Implementation### Case 1: Không có tiêu chí GIAM_DIEM



**Location:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/kpiSlice.js````javascript

ChiTietDiem = [

```javascript  { TieuChiID: "...", DiemDat: 90, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },

// Reducer: updateTieuChiScore (real-time calculation)  { TieuChiID: "...", DiemDat: 5, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" }

updateTieuChiScore(state, action) {];

  const { nhiemVuId, tieuChiId, diemDat } = action.payload;

  tongTang = 90×1 + 5×1 = 95

  // Find and update criteriontongGiam = 0

  const nhiemVu = state.currentNhiemVuList.find(nv => nv._id === nhiemVuId);TongDiemTieuChi = 95 - 0 = 95%

  const tieuChi = nhiemVu.ChiTietDiem.find(tc => tc.TieuChiID === tieuChiId);```

  tieuChi.DiemDat = diemDat;

  ---

  // Recalculate task score

  nhiemVu.TongDiemTieuChi = nhiemVu.ChiTietDiem.reduce((sum, tc) => {### Case 2: Chỉ có tiêu chí GIAM_DIEM

    const score = (tc.DiemDat || 0) / 100;

    return sum + (tc.LoaiTieuChi === "GIAM_DIEM" ? -score : score);```javascript

  }, 0);ChiTietDiem = [

    { TieuChiID: "...", DiemDat: 10, TrongSo: 1.0, LoaiTieuChi: "GIAM_DIEM" }

  nhiemVu.DiemNhiemVu = nhiemVu.TongDiemTieuChi * (nhiemVu.MucDoKho || 5);];



  // Recalculate total KPItongTang = 0

  state.currentDanhGiaKPI.TongDiemKPI = state.currentNhiemVuList.reduce(tongGiam = 10×1 = 10

    (sum, nv) => sum + (nv.DiemNhiemVu || 0), 0TongDiemTieuChi = 0 - 10 = -10%

  );

}DiemNhiemVu = 5 × (-10/100) = -0.5

`````

---**→ Cho phép điểm âm để phản ánh hiệu suất kém.**

## UI Display---

**Component:** `ChamDiemKPITable.js`### Case 3: Trọng số khác nhau

`javascript`javascript

// Max possible score per taskChiTietDiem = [

const maxPossibleScore = nhiemVu.ChiTietDiem.reduce((sum, tc) => { { TieuChiID: "...", DiemDat: 80, TrongSo: 2.0, LoaiTieuChi: "TANG_DIEM" }, // Quan trọng gấp đôi

if (tc.LoaiTieuChi === "TANG_DIEM") { { TieuChiID: "...", DiemDat: 90, TrongSo: 1.0, LoaiTieuChi: "TANG_DIEM" },

    return sum + (tc.GiaTriMax || 100) / 100;  { TieuChiID: "...", DiemDat: 5, TrongSo: 0.5, LoaiTieuChi: "GIAM_DIEM" }   // Ít quan trọng

}];

return sum;

}, 0) \* nhiemVu.MucDoKho;tongTang = 80×2.0 + 90×1.0 = 160 + 90 = 250

tongGiam = 5×0.5 = 2.5

// Display with 2 decimalsTongDiemTieuChi = 250 - 2.5 = 247.5%

<Typography variant="h6">

{nhiemVu.DiemNhiemVu.toFixed(2)} / {maxPossibleScore.toFixed(2)} điểm// Nếu MucDoKho = 3:

</Typography>DiemNhiemVu = 3 × 2.475 = 7.425

````



------



## Change History### Case 4: Điều chỉnh Mức độ khó



### v3.0 (October 14, 2025)```javascript

- ❌ **REMOVED:** TrongSo (weight) field completely// Nhiệm vụ gốc: MucDoKho = 5

- ✅ **SIMPLIFIED:** All scores divide by 100 (no multiplication)// Người quản lý thấy thực tế khó hơn → điều chỉnh lên 7

- ✅ **UNIFIED:** Backend + Frontend use same formula

TongDiemTieuChi = 85%  (giữ nguyên)

### v2.1.1 (October 13, 2025)DiemNhiemVu = 7 × 0.85 = 5.95  (thay vì 5 × 0.85 = 4.25)

- ✅ Fixed: Incorrect formula (was using dropdown 0-10)```

- ✅ Correct: Use GiaTriMin/GiaTriMax from DB

- ✅ Added: Real-time calculation in Redux---



### v2.0 (Earlier)## 4. Validation Rules

- Initial formula with TrongSo field

### 4.1 Ràng buộc DiemDat

---

```javascript

**Related Docs:**// Mỗi tiêu chí có GiaTriMin và GiaTriMax

- [README](./README.md) - Complete system guideTieuChiDanhGia {

- [WORKFLOW](./WORKFLOW.md) - User workflow  TenTieuChi: "Mức độ hoàn thành",

  GiaTriMin: 0,

---  GiaTriMax: 100

}

**Formula Status:** ✅ Production Ready

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
````
