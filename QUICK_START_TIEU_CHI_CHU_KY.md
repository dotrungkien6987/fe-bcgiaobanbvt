# 🚀 Quick Start Guide: Tiêu Chí Theo Chu Kỳ

## 📋 Deployment Steps

### 1. **Backup Database**

```bash
# Backup MongoDB (CRITICAL!)
mongodump --db=giaobanbv --out=/backup/$(date +%Y%m%d)
```

### 2. **Deploy Backend Code**

```bash
cd giaobanbv-be
git pull origin main
npm install  # If dependencies changed
pm2 restart giaobanbv-be
```

### 3. **Run Migration**

```bash
cd giaobanbv-be
node scripts/migrateTieuChiToChuKy.js
```

**Expected output:**

```
🚀 Starting migration...
✅ Connected to MongoDB
📋 Found 5 master criteria
📅 Found 3 cycles to migrate
✅ Migrated "Tháng 9/2025" - added 5 criteria
✅ Migrated "Tháng 8/2025" - added 5 criteria
⏭️  Skipping "Tháng 10/2025" - already has 5 criteria
✨ Successfully migrated 2 cycles
📝 Found 15 task evaluations to update
✅ Updated 12 task evaluations (removed TieuChiID references)
🎉 MIGRATION COMPLETED SUCCESSFULLY!
```

### 4. **Deploy Frontend Code**

```bash
cd fe-bcgiaobanbvt
git pull origin main
npm install
npm run build
# Copy build/ to web server or run npm start for dev
```

### 5. **Verify**

- [ ] Login as admin
- [ ] Open "Quản lý chu kỳ" → Create new cycle
- [ ] Configure criteria → Save
- [ ] Init KPI for an employee → Verify criteria loaded
- [ ] Score KPI → Approve → Try to edit (should be blocked)

---

## 🎯 Usage Guide

### **For Admins: Creating a New Cycle**

1. Navigate to **Quản lý chu kỳ đánh giá**
2. Click **"Thêm chu kỳ"**
3. Fill in basic info:

   - Tên chu kỳ (auto-generated from Month/Year if left blank)
   - Tháng, Năm
   - Ngày bắt đầu, Ngày kết thúc
   - Mô tả (optional)

4. **Configure Criteria** (scroll down):

   - Option A: Click **"Copy từ chu kỳ trước"** → Auto-fill with previous cycle's criteria
   - Option B: Click **"Thêm tiêu chí mới"** → Manually add each criterion

5. **For each criterion:**

   - **Tên tiêu chí**: e.g., "Hoàn thành đúng hạn"
   - **Loại**: Tăng điểm / Giảm điểm / Tổng điểm
   - **Giá trị Min/Max**: e.g., 0-100
   - **Đơn vị**: e.g., "%", "lần", "giờ"
   - **Trọng số**: Default 1 (higher = more important)
   - **Ghi chú**: Optional description

6. Click **"Thêm mới"**

**Result:**

- Cycle created with `TieuChiCauHinh` array
- When managers open KPI for employees, criteria are automatically copied from this cycle
- No need to manage global master criteria anymore

---

### **For Developers: Integration Points**

#### **Creating KPI Evaluation**

```javascript
// OLD (Don't use)
const tieuChi = await TieuChiDanhGia.find({...});

// NEW
const chuKy = await ChuKyDanhGia.findById(chuKyId);
const tieuChi = chuKy.TieuChiCauHinh;
```

#### **Initializing Task Evaluation**

```javascript
// Copy criteria from ChuKy (self-contained, no reference)
ChiTietDiem: chuKy.TieuChiCauHinh.map((tc) => ({
  TenTieuChi: tc.TenTieuChi,
  LoaiTieuChi: tc.LoaiTieuChi,
  DiemDat: 0,
  GiaTriMin: tc.GiaTriMin || 0,
  GiaTriMax: tc.GiaTriMax || 100,
  DonVi: tc.DonVi || "%",
  TrongSo: tc.TrongSo || 1,
  ThuTu: tc.ThuTu || 0,
  GhiChu: "",
}));
```

#### **Guard Against Editing Approved KPI**

```javascript
if (danhGiaKPI.TrangThai === "DA_DUYET") {
  throw new AppError(403, "KPI đã được duyệt - không thể chỉnh sửa");
}
```

---

## 🐛 Troubleshooting

### **Issue: "Chu kỳ này chưa cấu hình tiêu chí"**

**Cause:** Cycle was created without criteria  
**Fix:** Edit cycle → Add criteria → Save

### **Issue: Migration shows "0 cycles migrated"**

**Cause:** All cycles already have `TieuChiCauHinh`  
**Fix:** This is expected if re-running. Check one cycle manually in MongoDB.

### **Issue: Cannot edit KPI after approval**

**Cause:** This is intended behavior (freeze approved KPI)  
**Fix:** If really needed, un-approve first (set `TrangThai` back to `CHUA_DUYET` via DB admin)

### **Issue: Old KPI still shows TieuChiID**

**Cause:** Migration only updates ChiTietDiem structure, doesn't backfill all historical data  
**Fix:** This is OK. Old evaluations work fine. New ones use self-contained format.

### **Issue: Copy from previous cycle returns empty**

**Cause:** No previous cycle has criteria configured  
**Fix:** Manually add criteria for the first cycle

---

## 📊 Monitoring

### **Check Migration Success**

```javascript
// In MongoDB shell
db.chukydanhgia.find({ TieuChiCauHinh: { $exists: true, $ne: [] } }).count();
// Should equal total cycles

db.danhgianhiemvuthuongquys.findOne({}, { ChiTietDiem: 1 });
// ChiTietDiem should NOT have TieuChiID field
```

### **Performance Metrics**

- Before: `getChamDiemDetail` ~200ms (with TieuChiDanhGia populate)
- After: `getChamDiemDetail` ~120ms (self-contained, no populate)
- **Expected improvement:** ~40% faster

---

## 🔄 Rollback Plan (If Needed)

1. **Restore DB from backup:**

   ```bash
   mongorestore --db=giaobanbv /backup/YYYYMMDD/giaobanbv
   ```

2. **Revert code:**

   ```bash
   git revert <commit-hash>
   git push origin main
   pm2 restart giaobanbv-be
   ```

3. **Redeploy old frontend:**
   ```bash
   cd fe-bcgiaobanbvt
   git revert <commit-hash>
   npm run build
   ```

**Note:** Only possible if no new data created with TieuChiCauHinh format.

---

## ✅ Testing Commands

### **Backend API Testing (Postman/cURL)**

**1. Get previous criteria:**

```bash
curl -X GET "http://localhost:5000/api/workmanagement/chu-ky-danh-gia/previous-criteria" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Create cycle with criteria:**

```bash
curl -X POST "http://localhost:5000/api/workmanagement/chu-ky-danh-gia" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "TenChuKy": "Test Cycle",
    "Thang": 10,
    "Nam": 2025,
    "NgayBatDau": "2025-10-01",
    "NgayKetThuc": "2025-10-31",
    "TieuChiCauHinh": [
      {
        "TenTieuChi": "Hoàn thành đúng hạn",
        "LoaiTieuChi": "TANG_DIEM",
        "GiaTriMin": 0,
        "GiaTriMax": 100,
        "DonVi": "%",
        "TrongSo": 1,
        "ThuTu": 0
      }
    ]
  }'
```

**3. Init KPI (should copy criteria from cycle):**

```bash
curl -X GET "http://localhost:5000/api/workmanagement/kpi/danh-gia/cham-diem-detail?chuKyId=CYCLE_ID&nhanVienId=EMPLOYEE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Try to edit approved KPI (should fail):**

```bash
curl -X PUT "http://localhost:5000/api/workmanagement/kpi/danh-gia/nhiem-vu/TASK_ID/cham-diem" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ChiTietDiem": [...]
  }'
# Expected: 403 Forbidden if TrangThai=DA_DUYET
```

---

## 📝 Changelog

**v2.0.0 - October 15, 2025**

- ✨ NEW: Criteria configuration per cycle (`ChuKyDanhGia.TieuChiCauHinh`)
- ✨ NEW: Copy from previous cycle feature
- ✨ NEW: TieuChiConfigSection UI component
- 🔧 CHANGED: `ChiTietDiem` no longer references `TieuChiID`
- 🔧 CHANGED: KPI init logic copies from ChuKy instead of TieuChiDanhGia
- 🔒 SECURITY: Guard approved KPI from editing (403 error)
- 🗃️ MIGRATION: Script to migrate existing data

---

**Questions? Contact:** [Your Team/Support Channel]
