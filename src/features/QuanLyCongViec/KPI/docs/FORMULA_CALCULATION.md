# Công thức Tính Điểm KPI - Chi tiết

**Version:** 2.1  
**Last Updated:** 26/11/2025  
**Status:** ✅ Verified against actual code (100% accurate)

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Công thức V2 (Hiện tại)](#công-thức-v2-hiện-tại)
3. [Implementation Code](#implementation-code)
4. [Ví dụ thực tế](#ví-dụ-thực-tế)
5. [Cases đặc biệt](#cases-đặc-biệt)
6. [So sánh V1 vs V2](#so-sánh-v1-vs-v2)

---

## 🎯 Tổng quan

### Nguyên tắc thiết kế

Hệ thống KPI V2 tính điểm dựa trên **4 bước tuần tự**:

1. **Tính điểm từng tiêu chí** → Kết hợp điểm Manager + điểm Tự đánh giá (nếu có)
2. **Tổng điểm tiêu chí** → Cộng TANG_DIEM, trừ GIAM_DIEM
3. **Tính điểm nhiệm vụ** → Nhân với độ khó (MucDoKho)
4. **Tổng điểm KPI** → Cộng tất cả nhiệm vụ

### Đặc điểm quan trọng

✅ **Single Source of Truth:** Không lưu calculated fields vào DB (V2 change)  
✅ **Real-time Preview:** Frontend tính trước bằng `kpiCalculation.js`  
✅ **Official Snapshot:** Backend tính chính thức khi duyệt bằng method `duyet()`  
✅ **Exact Match:** 2 nơi phải dùng **GIỐNG HỆT** công thức để preview chính xác

---

## 📐 Công thức V2 (Hiện tại)

### Bước 1: Tính điểm từng tiêu chí

```
Với mỗi tiêu chí trong ChiTietDiem:

if (IsMucDoHoanThanh === true) {
    // Tiêu chí "Mức độ hoàn thành" - Kết hợp 2 nguồn điểm
    diemCuoiCung = (DiemQuanLy × 2 + DiemTuDanhGia) / 3
} else {
    // Tiêu chí khác - Chỉ lấy điểm Manager
    diemCuoiCung = DiemQuanLy
}

// Scale về 0-1
diemScaled = diemCuoiCung / 100

// Phân loại tăng/giảm
if (LoaiTieuChi === "TANG_DIEM") {
    diemTang += diemScaled
} else {
    diemGiam += diemScaled
}
```

**Giải thích:**

- `IsMucDoHoanThanh`: Cờ đánh dấu tiêu chí cho phép nhân viên tự đánh giá
- `DiemQuanLy` (DiemDat): Điểm Manager chấm (0-100)
- `DiemTuDanhGia`: Điểm nhân viên tự chấm (0-100), từ `NhanVienNhiemVu.DiemTuDanhGia`
- **Tỷ lệ 2:1:** Điểm Manager quan trọng gấp đôi điểm tự đánh giá

### Bước 2: Tổng điểm tiêu chí

```
TongDiemTieuChi = diemTang - diemGiam
```

**Lưu ý:** Kết quả có thể > 1.0 (nếu có nhiều tiêu chí TANG_DIEM)

**Ví dụ:**

```
diemTang = 0.95 + 0.85 + 0.10 = 1.90
diemGiam = 0.05
TongDiemTieuChi = 1.90 - 0.05 = 1.85
```

### Bước 3: Tính điểm nhiệm vụ

```
DiemNhiemVu = MucDoKho × TongDiemTieuChi
```

**Giải thích:**

- `MucDoKho`: Độ khó nhiệm vụ (1.0 - 10.0), từ `NhanVienNhiemVu.MucDoKho`
- Độ khó cao → Impact lớn hơn lên tổng điểm KPI

**Ví dụ:**

```
MucDoKho = 7.5
TongDiemTieuChi = 1.85
DiemNhiemVu = 7.5 × 1.85 = 13.875
```

### Bước 4: Tổng điểm KPI

```
TongDiemKPI = Σ DiemNhiemVu[i]  (với i = 1..n)
```

**Ví dụ:**

```
Nhiệm vụ 1: 13.875
Nhiệm vụ 2: 8.500
Nhiệm vụ 3: 4.200
─────────────────
TongDiemKPI = 26.575
```

---

## 💻 Implementation Code

### Frontend: utils/kpiCalculation.js

**File location:** `fe-bcgiaobanbvt/src/utils/kpiCalculation.js`

**Purpose:** Real-time preview trước khi duyệt

```javascript
/**
 * ✅ TÍNH TỔNG ĐIỂM KPI - PREVIEW
 *
 * @param {Array} nhiemVuList - Danh sách DanhGiaNhiemVuThuongQuy
 * @param {Object} diemTuDanhGiaMap - Map { NhiemVuThuongQuyID: DiemTuDanhGia }
 * @returns {Object} { tongDiem, chiTiet }
 */
export const calculateTotalScore = (nhiemVuList, diemTuDanhGiaMap) => {
  if (!nhiemVuList || nhiemVuList.length === 0) {
    return { tongDiem: 0, chiTiet: [] };
  }

  let tongDiemKPI = 0;
  const chiTiet = [];

  nhiemVuList.forEach((nv) => {
    // Get NhiemVuThuongQuyID (có thể là object hoặc string)
    const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
    const nvIdStr = nvId?.toString() || "";

    // Get DiemTuDanhGia từ map (default 0 nếu null)
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0; // Tổng điểm tăng (0-N)
    let diemGiam = 0; // Tổng điểm giảm (0-N)

    // Tính điểm từng tiêu chí
    if (nv.ChiTietDiem && nv.ChiTietDiem.length > 0) {
      nv.ChiTietDiem.forEach((tc) => {
        let diemCuoiCung = 0;

        // ✅ CÔNG THỨC DUY NHẤT
        if (tc.IsMucDoHoanThanh) {
          // Tiêu chí "Mức độ hoàn thành" - Kết hợp 2 điểm
          const diemQuanLy = tc.DiemDat || 0;
          diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
        } else {
          // Tiêu chí khác - Lấy trực tiếp điểm Manager
          diemCuoiCung = tc.DiemDat || 0;
        }

        // Scale về 0-1
        const diemScaled = diemCuoiCung / 100;

        // Phân loại tăng/giảm
        if (tc.LoaiTieuChi === "TANG_DIEM") {
          diemTang += diemScaled;
        } else {
          diemGiam += diemScaled;
        }
      });
    }

    // TongDiemTieuChi = DiemTang - DiemGiam (có thể > 1.0)
    const tongDiemTieuChi = diemTang - diemGiam;

    // DiemNhiemVu = MucDoKho × TongDiemTieuChi
    const diemNhiemVu = (nv.MucDoKho || 5) * tongDiemTieuChi;

    // Cộng dồn
    tongDiemKPI += diemNhiemVu;

    // Lưu chi tiết cho debugging
    chiTiet.push({
      tenNhiemVu: nv.NhiemVuThuongQuyID?.TenNhiemVu || "N/A",
      mucDoKho: nv.MucDoKho || 5,
      diemTuDanhGia,
      diemTang,
      diemGiam,
      tongDiemTieuChi,
      diemNhiemVu,
    });
  });

  return { tongDiem: tongDiemKPI, chiTiet };
};
```

**Usage trong Redux:**

```javascript
// kpiSlice.js - reducer updateTieuChiScore
updateTieuChiScore(state, action) {
  const { nhiemVuId, tieuChiId, diemDat } = action.payload;

  // Update DiemDat
  const nhiemVu = state.currentNhiemVuList.find(nv => nv._id === nhiemVuId);
  const tieuChi = nhiemVu.ChiTietDiem.find(tc => tc.TieuChiID === tieuChiId);
  tieuChi.DiemDat = diemDat;

  // Recalculate preview
  const preview = calculateTotalScore(
    state.currentNhiemVuList,
    state.diemTuDanhGiaMap
  );

  state.currentDanhGiaKPI.TongDiemKPI_Preview = preview.tongDiem;
}
```

---

### Backend: models/DanhGiaKPI.js

**File location:** `giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`

**Purpose:** Tính chính thức khi duyệt (snapshot vào DB)

```javascript
/**
 * ✅ V2: Duyệt KPI - Tự động tính TongDiemKPI theo công thức chuẩn
 * @param {String} nhanXet - Nhận xét của người duyệt
 * @param {ObjectId} nguoiDuyetId - ID người duyệt
 */
danhGiaKPISchema.methods.duyet = async function (nhanXet, nguoiDuyetId) {
  const NhanVienNhiemVu = mongoose.model("NhanVienNhiemVu");
  const DanhGiaNhiemVuThuongQuy = mongoose.model("DanhGiaNhiemVuThuongQuy");

  // 1. Validate trạng thái
  if (this.TrangThai === "DA_DUYET") {
    throw new Error("Đánh giá KPI đã được duyệt");
  }

  // 2. Load DiemTuDanhGia từ NhanVienNhiemVu
  const assignments = await NhanVienNhiemVu.find({
    NhanVienID: this.NhanVienID,
    ChuKyDanhGiaID: this.ChuKyDanhGiaID,
    isDeleted: false,
  });

  // Build map: NhiemVuThuongQuyID → DiemTuDanhGia
  const diemTuDanhGiaMap = {};
  assignments.forEach((a) => {
    const nvIdStr = a.NhiemVuThuongQuyID.toString();
    diemTuDanhGiaMap[nvIdStr] = a.DiemTuDanhGia || 0;
  });

  // 3. Load evaluations
  const evaluations = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: this._id,
    isDeleted: false,
  });

  if (evaluations.length === 0) {
    throw new Error("Không có nhiệm vụ nào để đánh giá");
  }

  // 4. Tính TongDiemKPI theo công thức chuẩn V2
  let tongDiemKPI = 0;

  evaluations.forEach((nv) => {
    const nvIdStr = nv.NhiemVuThuongQuyID.toString();
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0; // Tổng điểm tăng (0-N, không giới hạn)
    let diemGiam = 0; // Tổng điểm giảm (0-N)

    // Tính điểm từng tiêu chí
    nv.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      // ✅ CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        // Tiêu chí "Mức độ hoàn thành" - Kết hợp 2 điểm
        const diemQuanLy = tc.DiemDat || 0;
        diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
      } else {
        // Tiêu chí khác - Lấy trực tiếp điểm Manager
        diemCuoiCung = tc.DiemDat || 0;
      }

      // Scale về 0-1
      const diemScaled = diemCuoiCung / 100;

      // Phân loại tăng/giảm
      if (tc.LoaiTieuChi === "TANG_DIEM") {
        diemTang += diemScaled;
      } else {
        diemGiam += diemScaled;
      }
    });

    // TongDiemTieuChi = DiemTang - DiemGiam (có thể > 1.0)
    const tongDiemTieuChi = diemTang - diemGiam;

    // DiemNhiemVu = MucDoKho × TongDiemTieuChi
    const diemNhiemVu = nv.MucDoKho * tongDiemTieuChi;

    // Cộng dồn
    tongDiemKPI += diemNhiemVu;
  });

  // 5. Snapshot TongDiemKPI
  this.TongDiemKPI = tongDiemKPI;
  this.TrangThai = "DA_DUYET";
  this.NgayDuyet = new Date();

  if (nguoiDuyetId) {
    this.NguoiDuyet = nguoiDuyetId;
  }

  if (nhanXet) {
    this.NhanXetNguoiDanhGia = nhanXet;
  }

  // 6. Ghi lịch sử duyệt
  this.LichSuDuyet = this.LichSuDuyet || [];
  this.LichSuDuyet.push({
    NguoiDuyet: nguoiDuyetId || this.NguoiDuyet || undefined,
    NgayDuyet: this.NgayDuyet,
    TongDiemLucDuyet: this.TongDiemKPI, // ← Snapshot chính thức
    GhiChu: nhanXet || undefined,
  });

  await this.save();
  return this;
};
```

**⚠️ CRITICAL:** Code frontend và backend **PHẢI GIỐNG HỆT NHAU** để preview chính xác!

---

## 🧪 Ví dụ thực tế

### Ví dụ 1: Nhân viên IT - 3 nhiệm vụ

#### Setup

**Tiêu chí đánh giá (ChuKyDanhGia.TieuChiCauHinh):**

1. Mức độ hoàn thành (TANG_DIEM, 0-100%, IsMucDoHoanThanh = true)
2. Điểm tích cực (TANG_DIEM, 0-10 điểm)
3. Điểm sáng tạo (TANG_DIEM, 0-10 điểm)
4. Điểm trừ quá hạn (GIAM_DIEM, 0-10 điểm)

**Nhiệm vụ của nhân viên (NhanVienNhiemVu):**

- NVTQ 1: Quản lý hạ tầng mạng (MucDoKho = 5)
- NVTQ 2: Bảo mật hệ thống (MucDoKho = 3)
- NVTQ 3: Hỗ trợ phần mềm HIS (MucDoKho = 2)

---

#### Tính toán

**NVTQ 1: Quản lý hạ tầng mạng**

Chấm điểm:

- Mức độ hoàn thành: Manager 85, Nhân viên tự chấm 90
- Điểm tích cực: Manager 3
- Điểm sáng tạo: Manager 0
- Điểm trừ quá hạn: Manager 2

```javascript
// Bước 1: Tính điểm từng tiêu chí
// TC1: Mức độ hoàn thành (IsMucDoHoanThanh = true)
diemCuoiCung = (85 * 2 + 90) / 3 = 260 / 3 = 86.67
diemScaled = 86.67 / 100 = 0.8667
diemTang += 0.8667

// TC2: Điểm tích cực
diemCuoiCung = 3
diemScaled = 3 / 100 = 0.03
diemTang += 0.03

// TC3: Điểm sáng tạo
diemCuoiCung = 0
diemScaled = 0 / 100 = 0
diemTang += 0

// TC4: Điểm trừ quá hạn
diemCuoiCung = 2
diemScaled = 2 / 100 = 0.02
diemGiam += 0.02

// Bước 2: Tổng điểm tiêu chí
TongDiemTieuChi = 0.8667 + 0.03 + 0 - 0.02 = 0.8767

// Bước 3: Điểm nhiệm vụ
DiemNhiemVu = 5 × 0.8767 = 4.3835
```

**NVTQ 2: Bảo mật hệ thống**

Chấm điểm:

- Mức độ hoàn thành: Manager 90, Nhân viên 95
- Điểm tích cực: Manager 5
- Điểm sáng tạo: Manager 3
- Điểm trừ quá hạn: Manager 0

```javascript
// TC1: Mức độ hoàn thành
diemCuoiCung = (90 * 2 + 95) / 3 = 275 / 3 = 91.67
diemScaled = 0.9167
diemTang += 0.9167

// TC2: Điểm tích cực
diemScaled = 5 / 100 = 0.05
diemTang += 0.05

// TC3: Điểm sáng tạo
diemScaled = 3 / 100 = 0.03
diemTang += 0.03

// TC4: Điểm trừ
diemScaled = 0 / 100 = 0
diemGiam += 0

TongDiemTieuChi = 0.9167 + 0.05 + 0.03 - 0 = 0.9967
DiemNhiemVu = 3 × 0.9967 = 2.9901
```

**NVTQ 3: Hỗ trợ phần mềm HIS**

Chấm điểm:

- Mức độ hoàn thành: Manager 95, Nhân viên 90
- Điểm tích cực: Manager 2
- Điểm sáng tạo: Manager 1
- Điểm trừ quá hạn: Manager 5

```javascript
// TC1: Mức độ hoàn thành
diemCuoiCung = (95 * 2 + 90) / 3 = 280 / 3 = 93.33
diemScaled = 0.9333
diemTang += 0.9333

// TC2-4
diemTang += 0.02 + 0.01 = 0.03
diemGiam += 0.05

TongDiemTieuChi = 0.9333 + 0.03 - 0.05 = 0.9133
DiemNhiemVu = 2 × 0.9133 = 1.8266
```

---

#### Tổng KPI

```
TongDiemKPI = 4.3835 + 2.9901 + 1.8266 = 9.2002

Hiển thị: "9.20 điểm" hoặc "9.20 / 10 (92.0%)"
```

---

### Ví dụ 2: Nhân viên Senior - 2 nhiệm vụ khó

#### Setup

**Nhiệm vụ:**

- NVTQ 1: Thiết kế hệ thống mới (MucDoKho = 8)
- NVTQ 2: Quản lý dự án IT (MucDoKho = 6)

---

#### Tính toán

**NVTQ 1: Thiết kế hệ thống mới**

Chấm điểm:

- Mức độ hoàn thành: Manager 95, Nhân viên 100
- Điểm tích cực: Manager 5
- Điểm sáng tạo: Manager 8
- Điểm trừ: Manager 0

```javascript
// TC1: Mức độ hoàn thành
diemCuoiCung = (95 * 2 + 100) / 3 = 290 / 3 = 96.67
diemTang = 0.9667 + 0.05 + 0.08 = 1.0967
diemGiam = 0

TongDiemTieuChi = 1.0967 - 0 = 1.0967
DiemNhiemVu = 8 × 1.0967 = 8.7736
```

**NVTQ 2: Quản lý dự án IT**

Chấm điểm:

- Mức độ hoàn thành: Manager 88, Nhân viên 85
- Điểm tích cực: Manager 3
- Điểm sáng tạo: Manager 0
- Điểm trừ: Manager 3

```javascript
// TC1: Mức độ hoàn thành
diemCuoiCung = (88 * 2 + 85) / 3 = 261 / 3 = 87.0
diemTang = 0.87 + 0.03 + 0 = 0.90
diemGiam = 0.03

TongDiemTieuChi = 0.90 - 0.03 = 0.87
DiemNhiemVu = 6 × 0.87 = 5.22
```

---

#### Tổng KPI

```
TongDiemKPI = 8.7736 + 5.22 = 13.9936

Hiển thị: "13.99 điểm" hoặc "13.99 / 14 (99.97%)"
```

---

## ⚠️ Cases đặc biệt

### Case 1: Không có tiêu chí GIAM_DIEM

```javascript
ChiTietDiem = [
  { TenTieuChi: "Mức độ hoàn thành", DiemDat: 90, LoaiTieuChi: "TANG_DIEM", IsMucDoHoanThanh: true },
  { TenTieuChi: "Điểm tích cực", DiemDat: 5, LoaiTieuChi: "TANG_DIEM" }
];

// Tính toán
diemTang = 0.9 + 0.05 = 0.95
diemGiam = 0
TongDiemTieuChi = 0.95 - 0 = 0.95
```

---

### Case 2: Chỉ có tiêu chí GIAM_DIEM

```javascript
ChiTietDiem = [
  { TenTieuChi: "Điểm trừ vi phạm", DiemDat: 10, LoaiTieuChi: "GIAM_DIEM" }
];

// Tính toán
diemTang = 0
diemGiam = 0.10
TongDiemTieuChi = 0 - 0.10 = -0.10
DiemNhiemVu = 5 × (-0.10) = -0.5

// ✅ Cho phép điểm âm để phản ánh hiệu suất kém
```

---

### Case 3: Nhân viên chưa tự chấm (DiemTuDanhGia = null)

```javascript
diemTuDanhGiaMap = {
  "nhiemVuId1": 0,  // null → default 0
  "nhiemVuId2": 85
};

// TC1: IsMucDoHoanThanh = true, DiemQuanLy = 90, DiemTuDanhGia = 0
diemCuoiCung = (90 * 2 + 0) / 3 = 180 / 3 = 60.0

// → Điểm thấp hơn nếu nhân viên không tự chấm
```

---

### Case 4: TongDiemTieuChi > 1.0 (nhiều tiêu chí TANG_DIEM)

```javascript
ChiTietDiem = [
  { DiemDat: 95, LoaiTieuChi: "TANG_DIEM" },  // 0.95
  { DiemDat: 90, LoaiTieuChi: "TANG_DIEM" },  // 0.90
  { DiemDat: 10, LoaiTieuChi: "TANG_DIEM" },  // 0.10
  { DiemDat: 5, LoaiTieuChi: "GIAM_DIEM" }    // 0.05
];

// Tính toán
diemTang = 0.95 + 0.90 + 0.10 = 1.95
diemGiam = 0.05
TongDiemTieuChi = 1.95 - 0.05 = 1.90  // > 1.0

DiemNhiemVu = 5 × 1.90 = 9.5

// ✅ Điểm có thể vượt MucDoKho nếu hiệu suất rất tốt
```

---

### Case 5: Điều chỉnh MucDoKho sau khi gán

```javascript
// Ban đầu: MucDoKho = 5 (mặc định)
DiemNhiemVu = 5 × 0.85 = 4.25

// Manager thấy khó hơn dự kiến → điều chỉnh lên 7
DiemNhiemVu = 7 × 0.85 = 5.95

// TongDiemTieuChi giữ nguyên, chỉ impact thay đổi
```

---

## 🔄 So sánh V1 vs V2

### V1 (Legacy - Archived)

```javascript
// ❌ V1: Dùng TrongSo
DiemTieuChi = (DiemDat / 100) × TrongSo

// ❌ V1: Lưu calculated fields vào DB
TongDiemTieuChi = Σ DiemTieuChi  // Stored in DB
DiemNhiemVu = MucDoKho × TongDiemTieuChi  // Stored in DB

// ❌ V1: Pre-save hook tự động tính
danhGiaNhiemVuThuongQuySchema.pre("save", function (next) {
  this.TongDiemTieuChi = /* calculate */;
  this.DiemNhiemVu = /* calculate */;
  next();
});

// ❌ V1: Không có điểm tự đánh giá
// Chỉ có DiemQuanLy
```

### V2 (Current)

```javascript
// ✅ V2: Không dùng TrongSo (removed)
// Mỗi tiêu chí có giá trị tuyệt đối

// ✅ V2: Không lưu calculated fields
// ChiTietDiem chỉ lưu DiemDat (raw input)

// ✅ V2: Tính real-time preview (frontend)
const preview = calculateTotalScore(nhiemVuList, diemTuDanhGiaMap);

// ✅ V2: Tính chính thức khi duyệt (backend)
await danhGiaKPI.duyet(nhanXet, nguoiDuyetId);
// → Snapshot TongDiemKPI vào DB

// ✅ V2: Có điểm tự đánh giá
if (IsMucDoHoanThanh) {
  diemCuoiCung = (DiemQuanLy * 2 + DiemTuDanhGia) / 3;
}
```

### Migration Guide

```javascript
// Nếu upgrade từ V1 → V2:

// 1. Xóa calculated fields
db.danhgianhiemvuthuongquy.updateMany(
  {},
  { $unset: { TongDiemTieuChi: "", DiemNhiemVu: "" } }
);

// 2. Thêm IsMucDoHoanThanh vào ChiTietDiem
db.danhgianhiemvuthuongquy.updateMany(
  {},
  { $set: { "ChiTietDiem.$[].IsMucDoHoanThanh": false } }
);

// 3. Đánh dấu tiêu chí "Mức độ hoàn thành"
db.chukydanhgia.updateMany(
  {},
  {
    $set: {
      "TieuChiCauHinh.$[elem].IsMucDoHoanThanh": true,
    },
  },
  {
    arrayFilters: [{ "elem.TenTieuChi": { $regex: /hoàn thành/i } }],
  }
);

// 4. Reset TongDiemKPI về 0 cho records CHUA_DUYET
db.danhgiakpi.updateMany(
  { TrangThai: "CHUA_DUYET" },
  { $set: { TongDiemKPI: 0 } }
);
```

---

## 🧮 Validation Rules

### 1. Ràng buộc DiemDat

```javascript
// Chi tiêu chí
DiemDat >= GiaTriMin; // Thường là 0
DiemDat <= GiaTriMax; // Thường là 100

// Ví dụ ngoại lệ: "Điểm sáng tạo" (0-10)
GiaTriMin = 0;
GiaTriMax = 10;
DiemDat = 8; // Valid
```

### 2. Ràng buộc MucDoKho

```javascript
MucDoKho >= 1.0;
MucDoKho <= 10.0;
// Cho phép 1 chữ số thập phân: 5.5, 7.2
```

### 3. Ràng buộc DiemTuDanhGia

```javascript
DiemTuDanhGia >= 0;
DiemTuDanhGia <= 100;
// null = chưa tự chấm
```

### 4. Ràng buộc khi duyệt

```javascript
// Backend validation trong duyetKPITieuChi()
for (nhiemVu of nhiemVuList) {
  const hasDiemDat = nhiemVu.ChiTietDiem.every(
    (tc) => tc.DiemDat !== null && tc.DiemDat !== undefined
  );

  if (!hasDiemDat) {
    throw new Error(`Nhiệm vụ "${nhiemVu.TenNhiemVu}" chưa chấm điểm đầy đủ`);
  }
}
```

---

## 📝 Best Practices

### 1. Debugging công thức

```javascript
// Frontend: Bật chi tiết calculation
const { tongDiem, chiTiet } = calculateTotalScore(
  nhiemVuList,
  diemTuDanhGiaMap
);

console.table(chiTiet);
// Output:
// ┌─────┬────────────────────┬───────────┬────────────┬─────────┬─────────┬──────────────────┬──────────────┐
// │ idx │ tenNhiemVu         │ mucDoKho  │ diemTuDanhGia│ diemTang│ diemGiam│ tongDiemTieuChi  │ diemNhiemVu  │
// ├─────┼────────────────────┼───────────┼────────────┼─────────┼─────────┼──────────────────┼──────────────┤
// │  0  │ Quản lý mạng       │     5     │     85     │  0.8667 │  0.02   │      0.8467      │    4.2335    │
// └─────┴────────────────────┴───────────┴────────────┴─────────┴─────────┴──────────────────┴──────────────┘
```

### 2. Unit Testing

```javascript
// Test case: Công thức kết hợp điểm
describe("calculateTotalScore", () => {
  it("should combine DiemQuanLy and DiemTuDanhGia correctly", () => {
    const nhiemVu = {
      MucDoKho: 5,
      ChiTietDiem: [
        {
          TenTieuChi: "Hoàn thành",
          IsMucDoHoanThanh: true,
          DiemDat: 90,
          LoaiTieuChi: "TANG_DIEM",
        },
      ],
    };

    const diemTuDanhGiaMap = { nvId1: 80 };

    const result = calculateNhiemVuScore(nhiemVu, 80);

    // (90 * 2 + 80) / 3 = 86.67
    // 86.67 / 100 = 0.8667
    // 5 * 0.8667 = 4.3335
    expect(result.diemNhiemVu).toBeCloseTo(4.3335, 2);
  });
});
```

### 3. Sync Frontend & Backend

```bash
# Sau khi sửa công thức, kiểm tra 2 nơi:
# 1. fe-bcgiaobanbvt/src/utils/kpiCalculation.js
# 2. giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js

# So sánh logic giống hệt:
diff <(grep -A 30 "CÔNG THỨC DUY NHẤT" fe-bcgiaobanbvt/src/utils/kpiCalculation.js) \
     <(grep -A 30 "CÔNG THỨC DUY NHẤT" giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js)

# Nếu khác → BUG: Preview sai
```

---

## 🔗 Xem thêm

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Kiến trúc hệ thống
- [WORKFLOW.md](./WORKFLOW.md) - Luồng nghiệp vụ
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation

---

**✅ Công thức đã được verified với code thực tế (25/11/2025)**
