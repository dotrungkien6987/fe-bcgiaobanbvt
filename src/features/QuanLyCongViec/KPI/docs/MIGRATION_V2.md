# Migration Guide: V1 → V2

**Date:** 25/11/2025  
**Affected Modules:** KPI, DanhGiaKPI, DanhGiaNhiemVuThuongQuy

---

## 🎯 Tổng quan Migration

### V1 Architecture (Legacy - Deprecated)

**Problems:**

- ❌ Lưu calculated fields trong DB (TongDiemTieuChi, DiemNhiemVu) → Data inconsistency
- ❌ Không có audit trail → Không biết lịch sử duyệt/hủy duyệt
- ❌ Không có IsMucDoHoanThanh → Không phân biệt tiêu chí nào cho phép tự đánh giá
- ❌ Có TrongSo (weight) nhưng không dùng → Confusing
- ❌ Không có validation chặt chẽ

**V1 Data Model:**

```javascript
// DanhGiaNhiemVuThuongQuy (V1)
{
  DanhGiaKPIID: ObjectId,
  NhiemVuThuongQuyID: ObjectId,
  TongSo: 10,
  DatYeuCau: 8,
  TrongSo: 0.5,              // ❌ Deprecated
  TongDiemTieuChi: 7.5,      // ❌ Calculated - should not store
  DiemNhiemVu: 3.75,         // ❌ Calculated - should not store
  ChiTietDiem: [
    {
      TenTieuChi: "Hoàn thành",
      DiemDat: 90,
      GiaTriMax: 100
      // ❌ Missing: IsMucDoHoanThanh, LoaiTieuChi
    }
  ]
}
```

---

### V2 Architecture (Current)

**Solutions:**

- ✅ Không lưu calculated fields → Real-time calculation
- ✅ Có LichSuDuyet, LichSuHuyDuyet → Audit trail đầy đủ
- ✅ Có IsMucDoHoanThanh → Phân biệt tiêu chí tự đánh giá
- ✅ Có LoaiTieuChi (TANG_DIEM | GIAM_DIEM) → Logic rõ ràng
- ✅ Remove TrongSo → Simplify
- ✅ Validation chặt chẽ (GiaTriMin, GiaTriMax)

**V2 Data Model:**

```javascript
// DanhGiaNhiemVuThuongQuy (V2)
{
  DanhGiaKPIID: ObjectId,
  NhiemVuThuongQuyID: ObjectId,
  NhanVienID: ObjectId,      // ✅ NEW: Explicit reference
  ChuKyDanhGiaID: ObjectId,  // ✅ NEW: Cycle reference
  MucDoKho: 7.5,             // ✅ NEW: Difficulty factor (1-10)
  // ❌ REMOVED: TongSo, DatYeuCau, TrongSo, TongDiemTieuChi, DiemNhiemVu
  ChiTietDiem: [
    {
      TenTieuChi: "Mức độ hoàn thành",
      LoaiTieuChi: "TANG_DIEM",        // ✅ NEW
      IsMucDoHoanThanh: true,          // ✅ NEW
      DiemDat: 90,
      GiaTriMin: 0,                    // ✅ NEW
      GiaTriMax: 100,
      DonVi: "%",                      // ✅ NEW
      GhiChu: ""                       // ✅ NEW
    }
  ],
  SoCongViecLienQuan: 0,     // ✅ NEW: For future reference
  TrangThai: "CHUA_DUYET"    // ✅ NEW: Status tracking
}

// DanhGiaKPI (V2)
{
  ChuKyDanhGiaID: ObjectId,
  NhanVienID: ObjectId,
  TongDiemKPI: 8.75,         // ✅ Calculated ONLY on approval
  TrangThai: "DA_DUYET",     // ✅ NEW
  NgayDuyet: ISODate,        // ✅ NEW
  NguoiDuyet: ObjectId,      // ✅ NEW
  LichSuDuyet: [             // ✅ NEW: Audit trail
    {
      NguoiDuyet: ObjectId,
      NgayDuyet: ISODate,
      TongDiemLucDuyet: 8.75,
      GhiChu: "Hoàn thành tốt"
    }
  ],
  LichSuHuyDuyet: [          // ✅ NEW: Undo audit trail
    {
      NguoiHuyDuyet: ObjectId,
      NgayHuyDuyet: ISODate,
      LyDoHuyDuyet: "...",
      DiemTruocKhiHuy: 8.75,
      NgayDuyetTruocDo: ISODate
    }
  ]
}
```

---

## 🔄 Breaking Changes

### 1. Schema Changes

**DanhGiaNhiemVuThuongQuy:**
| Field | V1 | V2 | Action |
|-------|----|----|--------|
| TrongSo | ✓ | ✗ | **REMOVED** |
| TongSo | ✓ | ✗ | **REMOVED** |
| DatYeuCau | ✓ | ✗ | **REMOVED** |
| TongDiemTieuChi | ✓ | ✗ | **REMOVED** (calculated) |
| DiemNhiemVu | ✓ | ✗ | **REMOVED** (calculated) |
| NhanVienID | ✗ | ✓ | **ADDED** |
| ChuKyDanhGiaID | ✗ | ✓ | **ADDED** |
| MucDoKho | ✗ | ✓ | **ADDED** (from NhanVienNhiemVu) |
| ChiTietDiem[].LoaiTieuChi | ✗ | ✓ | **ADDED** |
| ChiTietDiem[].IsMucDoHoanThanh | ✗ | ✓ | **ADDED** |
| ChiTietDiem[].GiaTriMin | ✗ | ✓ | **ADDED** |
| ChiTietDiem[].DonVi | ✗ | ✓ | **ADDED** |
| ChiTietDiem[].GhiChu | ✗ | ✓ | **ADDED** |

**DanhGiaKPI:**
| Field | V1 | V2 | Action |
|-------|----|----|--------|
| TongDiemKPI | ✓ (always) | ✓ (on approve) | **CHANGED** (calculated timing) |
| TrangThai | ✗ | ✓ | **ADDED** |
| NgayDuyet | ✗ | ✓ | **ADDED** |
| NguoiDuyet | ✗ | ✓ | **ADDED** |
| LichSuDuyet | ✗ | ✓ | **ADDED** |
| LichSuHuyDuyet | ✗ | ✓ | **ADDED** |

---

### 2. API Changes

**Deprecated APIs:**

```javascript
// ❌ V1: Update với calculated fields
PUT /api/workmanagement/kpi/danh-gia-nhiem-vu/:id
Body: {
  TongDiemTieuChi: 7.5,   // ❌ Frontend tự tính (error-prone)
  DiemNhiemVu: 3.75       // ❌ Frontend tự tính
}

// ✅ V2: Chỉ gửi raw data
PUT /api/workmanagement/kpi/danh-gia-nhiem-vu/:id
Body: {
  ChiTietDiem: [
    { TenTieuChi: "...", DiemDat: 90, ... }
  ]
  // Backend tự tính TongDiemKPI khi duyệt
}
```

**New APIs:**

```javascript
// ✅ V2: Duyệt KPI với audit trail
POST /api/workmanagement/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId
Body: {
  nhiemVuList: [ ... ],
  nhanXet: "Hoàn thành tốt"
}

// ✅ V2: Hủy duyệt với lý do
POST /api/workmanagement/kpi/huy-duyet-kpi/:danhGiaKPIId
Body: {
  lyDo: "Cần điều chỉnh tiêu chí"
}

// ✅ V2: Preview điểm trước khi duyệt
POST /api/workmanagement/kpi/preview-score
Body: {
  nhiemVuList: [ ... ]
}
```

---

### 3. Formula Changes

**V1 Formula (Simple):**

```javascript
// V1: Không có self-assessment
DiemNhiemVu = TrongSo × (TongDiemTieuChi / GiaTriMax)
TongDiemKPI = Σ DiemNhiemVu
```

**V2 Formula (Advanced):**

```javascript
// V2: Có self-assessment + difficulty factor
if (IsMucDoHoanThanh) {
  diemCuoiCung = (DiemQL × 2 + DiemTuDanhGia) / 3
} else {
  diemCuoiCung = DiemQL
}

diemScaled = diemCuoiCung / 100
diemTang = Σ (diemScaled where LoaiTieuChi = "TANG_DIEM")
diemGiam = Σ (diemScaled where LoaiTieuChi = "GIAM_DIEM")
tongDiemTieuChi = diemTang - diemGiam
DiemNhiemVu = MucDoKho × tongDiemTieuChi
TongDiemKPI = Σ DiemNhiemVu
```

---

## 🛠️ Migration Steps

### Step 1: Backup Database

```bash
# MongoDB backup
mongodump --db giaoban_bvt --out ./backup_v1_$(date +%Y%m%d)

# Or mongodump specific collections
mongodump --db giaoban_bvt --collection danhgiakpi --out ./backup_kpi
mongodump --db giaoban_bvt --collection danhgianhiemvuthuongquy --out ./backup_nhiemvu
```

---

### Step 2: Add New Fields to Existing Records

**Script:** `scripts/migrate_v1_to_v2.js`

```javascript
// giaobanbv-be/scripts/migrate_v1_to_v2.js
const mongoose = require("mongoose");
const DanhGiaKPI = require("../modules/workmanagement/models/DanhGiaKPI");
const DanhGiaNhiemVuThuongQuy = require("../modules/workmanagement/models/DanhGiaNhiemVuThuongQuy");
const NhanVienNhiemVu = require("../modules/workmanagement/models/NhanVienNhiemVu");
const ChuKyDanhGia = require("../modules/workmanagement/models/ChuKyDanhGia");

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("🔄 Starting migration V1 → V2...");

  // 1. Migrate DanhGiaKPI
  console.log("📊 Migrating DanhGiaKPI...");
  const danhGiaKPIs = await DanhGiaKPI.find({ TrangThai: { $exists: false } });

  for (const kpi of danhGiaKPIs) {
    // Add new fields
    kpi.TrangThai = kpi.TongDiemKPI > 0 ? "DA_DUYET" : "CHUA_DUYET";
    kpi.LichSuDuyet = kpi.LichSuDuyet || [];
    kpi.LichSuHuyDuyet = kpi.LichSuHuyDuyet || [];

    // If already has score, assume it was approved
    if (kpi.TongDiemKPI > 0 && kpi.LichSuDuyet.length === 0) {
      kpi.LichSuDuyet.push({
        NguoiDuyet: kpi.NguoiDanhGiaID,
        NgayDuyet: kpi.updatedAt,
        TongDiemLucDuyet: kpi.TongDiemKPI,
        GhiChu: "Migration từ V1",
      });
      kpi.NgayDuyet = kpi.updatedAt;
      kpi.NguoiDuyet = kpi.NguoiDanhGiaID;
    }

    await kpi.save();
  }
  console.log(`✅ Migrated ${danhGiaKPIs.length} DanhGiaKPI records`);

  // 2. Migrate DanhGiaNhiemVuThuongQuy
  console.log("📋 Migrating DanhGiaNhiemVuThuongQuy...");
  const evaluations = await DanhGiaNhiemVuThuongQuy.find({
    MucDoKho: { $exists: false },
  }).populate("DanhGiaKPIID");

  for (const ev of evaluations) {
    // Remove calculated fields
    ev.TongDiemTieuChi = undefined;
    ev.DiemNhiemVu = undefined;
    ev.TrongSo = undefined;
    ev.TongSo = undefined;
    ev.DatYeuCau = undefined;

    // Add new fields
    if (ev.DanhGiaKPIID) {
      ev.NhanVienID = ev.DanhGiaKPIID.NhanVienID;
      ev.ChuKyDanhGiaID = ev.DanhGiaKPIID.ChuKyDanhGiaID;
    }

    // Get MucDoKho from NhanVienNhiemVu
    const assignment = await NhanVienNhiemVu.findOne({
      NhanVienID: ev.NhanVienID,
      NhiemVuThuongQuyID: ev.NhiemVuThuongQuyID,
      ChuKyDanhGiaID: ev.ChuKyDanhGiaID,
    });

    ev.MucDoKho = assignment?.MucDoKho || 5; // Default: 5
    ev.TrangThai = ev.DanhGiaKPIID?.TrangThai || "CHUA_DUYET";

    // Add fields to ChiTietDiem
    const chuKy = await ChuKyDanhGia.findById(ev.ChuKyDanhGiaID);
    if (chuKy && chuKy.TieuChiCauHinh) {
      ev.ChiTietDiem = ev.ChiTietDiem.map((tc, idx) => {
        const config = chuKy.TieuChiCauHinh.find(
          (c) => c.TenTieuChi === tc.TenTieuChi
        );
        return {
          ...tc,
          LoaiTieuChi: config?.LoaiTieuChi || "TANG_DIEM",
          IsMucDoHoanThanh: config?.IsMucDoHoanThanh || false,
          GiaTriMin: config?.GiaTriMin || 0,
          GiaTriMax: config?.GiaTriMax || tc.GiaTriMax || 100,
          DonVi: config?.DonVi || "%",
          GhiChu: tc.GhiChu || "",
        };
      });
    }

    await ev.save();
  }
  console.log(
    `✅ Migrated ${evaluations.length} DanhGiaNhiemVuThuongQuy records`
  );

  console.log("🎉 Migration completed!");
  mongoose.disconnect();
}

migrate().catch(console.error);
```

**Run migration:**

```bash
cd giaobanbv-be
node scripts/migrate_v1_to_v2.js
```

---

### Step 3: Update Frontend Code

**Change 1: Remove calculated fields from Redux state**

```javascript
// ❌ V1: kpiSlice.js
updateDanhGiaNhiemVuSuccess(state, action) {
  const updated = action.payload;
  // Lưu TongDiemTieuChi, DiemNhiemVu vào state
  state.currentNhiemVu.TongDiemTieuChi = updated.TongDiemTieuChi;
  state.currentNhiemVu.DiemNhiemVu = updated.DiemNhiemVu;
}

// ✅ V2: kpiEvaluationSlice.js
updateTieuChiScore(state, action) {
  const { nhiemVuId, tieuChiId, diemDat } = action.payload;
  const nhiemVu = state.currentNhiemVuList.find(nv => nv._id === nhiemVuId);
  if (nhiemVu) {
    const tieuChi = nhiemVu.ChiTietDiem.find(tc => tc._id === tieuChiId);
    tieuChi.DiemDat = diemDat;
    // KHÔNG lưu calculated fields!
  }
}
```

**Change 2: Use real-time calculation**

```javascript
// ❌ V1: Lấy TongDiemKPI từ state
const tongDiem = state.currentDanhGiaKPI.TongDiemKPI;

// ✅ V2: Tính real-time
import { calculateTotalScore } from "./utils/kpiCalculation";

const { tongDiem } = calculateTotalScore(
  state.currentNhiemVuList,
  state.diemTuDanhGiaMap
);
```

---

### Step 4: Update API Calls

**Change 1: Duyệt KPI**

```javascript
// ❌ V1: PUT /kpi/:id/duyet
dispatch(duyetKPI(danhGiaKPIId));

// ✅ V2: POST /duyet-kpi-tieu-chi/:id
dispatch(duyetKPITieuChi(danhGiaKPIId, nhiemVuList, nhanXet));
```

**Change 2: Chấm điểm**

```javascript
// ❌ V1: Frontend tính TongDiemTieuChi
const tongDiem = chiTietDiem.reduce((sum, tc) => sum + tc.DiemDat, 0);
await apiService.put(`/danh-gia-nhiem-vu/${id}`, {
  ChiTietDiem: chiTietDiem,
  TongDiemTieuChi: tongDiem, // ❌ Frontend calculate
});

// ✅ V2: Chỉ gửi raw data
await apiService.put(`/danh-gia-nhiem-vu/${id}`, {
  ChiTietDiem: chiTietDiem,
  // Backend sẽ tính khi duyệt
});
```

---

### Step 5: Verify Data Integrity

**SQL Checks:**

```javascript
// giaobanbv-be/scripts/verify_migration.js
const mongoose = require("mongoose");
const DanhGiaKPI = require("../modules/workmanagement/models/DanhGiaKPI");
const DanhGiaNhiemVuThuongQuy = require("../modules/workmanagement/models/DanhGiaNhiemVuThuongQuy");

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("🔍 Verifying migration...");

  // 1. Check DanhGiaKPI có TrangThai
  const kpisMissingStatus = await DanhGiaKPI.countDocuments({
    TrangThai: { $exists: false },
  });
  console.log(`DanhGiaKPI missing TrangThai: ${kpisMissingStatus}`);

  // 2. Check DanhGiaNhiemVuThuongQuy có MucDoKho
  const nvMissingMucDoKho = await DanhGiaNhiemVuThuongQuy.countDocuments({
    MucDoKho: { $exists: false },
  });
  console.log(`DanhGiaNhiemVuThuongQuy missing MucDoKho: ${nvMissingMucDoKho}`);

  // 3. Check DanhGiaNhiemVuThuongQuy KHÔNG CÒN TrongSo
  const nvHavingTrongSo = await DanhGiaNhiemVuThuongQuy.countDocuments({
    TrongSo: { $exists: true },
  });
  console.log(
    `DanhGiaNhiemVuThuongQuy still have TrongSo (should be 0): ${nvHavingTrongSo}`
  );

  // 4. Recalculate và so sánh TongDiemKPI
  const kpis = await DanhGiaKPI.find({ TrangThai: "DA_DUYET" });
  let mismatchCount = 0;

  for (const kpi of kpis) {
    // Recalculate using V2 formula
    const evaluations = await DanhGiaNhiemVuThuongQuy.find({
      DanhGiaKPIID: kpi._id,
      isDeleted: false,
    });

    // ... (use backend calculation logic)
    const recalculated = await kpi.calculateTongDiemKPI();

    if (Math.abs(recalculated - kpi.TongDiemKPI) > 0.01) {
      console.warn(
        `⚠️ Mismatch: KPI ${kpi._id} - Stored: ${kpi.TongDiemKPI}, Recalculated: ${recalculated}`
      );
      mismatchCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`Total KPIs checked: ${kpis.length}`);
  console.log(
    `Mismatches: ${mismatchCount} (${(
      (mismatchCount / kpis.length) *
      100
    ).toFixed(2)}%)`
  );

  if (mismatchCount === 0) {
    console.log("✅ All data verified successfully!");
  } else {
    console.log("⚠️ Some data mismatches found. Review logs above.");
  }

  mongoose.disconnect();
}

verify().catch(console.error);
```

**Run verification:**

```bash
node scripts/verify_migration.js
```

---

## 🗂️ Data Cleanup (Optional)

### Remove Empty kpiCoreSlice.js

```bash
# Frontend cleanup
cd fe-bcgiaobanbvt

# Check imports
grep -r "kpiCoreSlice" src/

# If no results, safe to delete
rm src/features/QuanLyCongViec/KPI/kpiCoreSlice.js

# Update store.js (if needed)
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Tạo DanhGiaKPI mới (V2) → Kiểm tra fields mới
- [ ] Chấm điểm → Không lưu TongDiemTieuChi, DiemNhiemVu
- [ ] Duyệt KPI → TongDiemKPI được tính đúng công thức V2
- [ ] Hủy duyệt → LichSuHuyDuyet được lưu, TongDiemKPI reset về 0
- [ ] Recalculate → So sánh frontend preview vs backend duyet()

### Frontend Tests

- [ ] Dashboard V2 → Hiển thị đúng tiến độ
- [ ] Dialog chấm điểm → Real-time preview chính xác
- [ ] Tự đánh giá → Lưu DiemTuDanhGia thành công
- [ ] Duyệt KPI → Confirmation dialog + toast success
- [ ] Hủy duyệt (Admin) → Dialog lý do + reset về CHUA_DUYET

### Integration Tests

- [ ] Flow đầy đủ: Tạo chu kỳ → Gán nhiệm vụ → Tự chấm → Manager chấm → Duyệt
- [ ] Preview điểm khớp với điểm sau duyệt (tolerance ≤ 0.01)
- [ ] Hủy duyệt → Chấm lại → Duyệt lại → Điểm mới khác điểm cũ (có trong LichSuHuyDuyet)

---

## 🔄 Rollback Plan

**Nếu migration fail, rollback:**

```bash
# 1. Restore database from backup
mongorestore --db giaoban_bvt ./backup_v1_20251125

# 2. Revert backend code
git checkout <commit_before_migration>

# 3. Revert frontend code
cd fe-bcgiaobanbvt
git checkout <commit_before_migration>

# 4. Restart services
npm start  # Both backend & frontend
```

---

## 📊 Performance Impact

**V1 (với calculated fields):**

- Write: Fast (1 query)
- Read: Fast (data sẵn có)
- Risk: **Data inconsistency cao** (nhiều nơi tính → dễ sai)

**V2 (không lưu calculated fields):**

- Write: Fast (1 query, ít data hơn)
- Read: Medium (cần populate + calculate)
- Risk: **Không có inconsistency** (chỉ 1 nơi tính - method duyet())

**Trade-off:** Hy sinh một chút performance khi read để đổi lấy data integrity cao hơn → **Acceptable** vì:

- KPI không query liên tục (chỉ khi vào dashboard/xem chi tiết)
- Calculation không phức tạp (< 100ms)
- Benefit (data integrity) > Cost (performance)

---

## 📝 Lessons Learned

### 1. Never Store Calculated Fields

**Lý do:**

- Dễ dẫn đến data inconsistency khi logic thay đổi
- Frontend có thể tính sai → lưu sai vào DB
- Khó maintain (phải sync logic ở nhiều nơi)

**Best Practice:**

- Lưu raw data (DiemDat, MucDoKho)
- Calculate real-time cho preview (frontend)
- Calculate + snapshot khi cần (method duyet() - backend)

---

### 2. Audit Trail is Crucial

**V1 problem:** Không biết:

- Ai duyệt KPI?
- Khi nào duyệt?
- Điểm bao nhiêu lúc duyệt?
- Tại sao hủy duyệt?

**V2 solution:** LichSuDuyet + LichSuHuyDuyet → Truy vết đầy đủ

---

### 3. Schema Versioning

**Problem:** V1 và V2 schema khác nhau → Migration phức tạp

**Solution (future):**

- Thêm field `schemaVersion: 1 | 2` vào model
- Backend check version trước khi xử lý
- Dễ dàng support cả 2 version trong transition period

---

## 🔗 Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - V2 architecture details
- [FORMULA_CALCULATION.md](./FORMULA_CALCULATION.md) - V2 formula explanation
- [API_REFERENCE.md](./API_REFERENCE.md) - V2 API changes

---

**✅ Migration guide verified (25/11/2025)**
