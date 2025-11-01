# 🚀 KẾ HOẠCH TRIỂN KHAI KPI V2 - SIMPLIFIED ARCHITECTURE

> **Mục tiêu:** Xóa bỏ calculated fields (TongDiemTieuChi, DiemNhiemVu), implement single source of truth

**Ngày bắt đầu:** 27/10/2025  
**Trạng thái:** ⏳ ĐANG CHỜ CHỌN OPTION

---

## ⚙️ CHỌN IMPLEMENTATION OPTION

### **❓ QUYẾT ĐỊNH QUAN TRỌNG: Method duyet() tính điểm ở đâu?**

#### **OPTION A: Tính ở Controller**

```javascript
// Controller: kpi.controller.js
const tongDiemKPI = calculateFromChiTietDiem(); // ← Tính ở đây
danhGiaKPI.TongDiemKPI = tongDiemKPI;
await danhGiaKPI.duyet(nhanXet, nguoiDuyetId); // ← Chỉ snapshot
```

**Ưu điểm:**

- ✅ Migration đơn giản (ít thay đổi)
- ✅ Nhanh hơn (ít refactor)

**Nhược điểm:**

- ❌ Logic rò rỉ ra controller
- ❌ Khó test
- ❌ Không reusable

---

#### **OPTION B: Tính ở Method** ⭐ RECOMMENDED

```javascript
// Controller: kpi.controller.js
await danhGiaKPI.duyet(nhanXet, nguoiDuyetId); // ← Method tự tính

// Model: DanhGiaKPI.js
danhGiaKPISchema.methods.duyet = async function(...) {
  const tongDiemKPI = this.calculateTongDiem(); // ← Tính ở đây
  this.TongDiemKPI = tongDiemKPI;
  // ... snapshot ...
};
```

**Ưu điểm:**

- ✅ Encapsulation tốt (logic trong model)
- ✅ Dễ test (unit test method)
- ✅ Reusable (bất kỳ đâu gọi duyet())
- ✅ Single source of truth

**Nhược điểm:**

- ⚠️ Thay đổi nhiều hơn

---

### **🎯 CHỌN OPTION:** ✅ **OPTION B** - Tính ở Method

- [ ] Option A
- [x] **Option B (Recommended)** ← SELECTED

---

## 📋 TASK BREAKDOWN

### **PHASE 1: Backend Model Updates** 🔴 CRITICAL

#### **Task 1.1: Update DanhGiaNhiemVuThuongQuy.js**

- [ ] Xóa field `TongDiemTieuChi` khỏi schema
- [ ] Xóa field `DiemNhiemVu` khỏi schema
- [ ] Xóa pre-save hook (tính TongDiemTieuChi, DiemNhiemVu)
- [ ] Xóa post-save hook (update parent TongDiemKPI)
- [ ] Test: Schema vẫn hoạt động bình thường

**File:** `giaobanbv-be/modules/workmanagement/models/DanhGiaNhiemVuThuongQuy.js`  
**Estimated:** 15 phút  
**Risk:** 🟢 LOW (chỉ xóa code)

---

#### **Task 1.2: Update DanhGiaKPI.js - Method huyDuyet()**

- [ ] Thêm parameter `lyDo` (required)
- [ ] Validate TrangThai === "DA_DUYET"
- [ ] Validate lyDo không rỗng
- [ ] Lưu LichSuHuyDuyet với đầy đủ:
  - NguoiHuyDuyet
  - NgayHuyDuyet
  - LyDoHuyDuyet
  - DiemTruocKhiHuy (snapshot)
  - NgayDuyetTruocDo (snapshot)
- [ ] Reset TongDiemKPI = 0
- [ ] Reset TrangThai = "CHUA_DUYET"
- [ ] Test: Hủy duyệt + verify lịch sử

**File:** `giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`  
**Estimated:** 20 phút  
**Risk:** 🟡 MEDIUM

---

#### **Task 1.3: Xóa Method tinhTongDiemKPI()**

- [ ] Xóa toàn bộ method `tinhTongDiemKPI()`
- [ ] Tìm kiếm nơi nào gọi method này (grep)
- [ ] Xóa hoặc replace các nơi gọi
- [ ] Test: Không có reference nào còn lại

**File:** `giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`  
**Estimated:** 10 phút  
**Risk:** 🟢 LOW

---

#### **Task 1.4: Update Method duyet() - [Tùy theo Option]**

**Nếu OPTION A:**

- [ ] Giữ nguyên method hiện tại (chỉ snapshot)
- [ ] Đảm bảo LichSuDuyet.TongDiemLucDuyet lưu đúng

**Nếu OPTION B:**

- [ ] Import NhanVienNhiemVu, DanhGiaNhiemVuThuongQuy
- [ ] Load DiemTuDanhGia từ NhanVienNhiemVu
- [ ] Tính TongDiemKPI theo công thức chuẩn:
  - Load evaluations
  - Foreach evaluation:
    - Foreach ChiTietDiem:
      - If IsMucDoHoanThanh: `(DiemDat×2 + DiemTuDanhGia)/3`
      - Else: `DiemDat`
      - Scale /100, phân loại TANG/GIAM
    - DiemNhiemVu = MucDoKho × (diemTang - diemGiam)
  - TongDiemKPI = sum(DiemNhiemVu)
- [ ] Snapshot TongDiemKPI
- [ ] Set TrangThai = "DA_DUYET"
- [ ] Ghi LichSuDuyet
- [ ] Test: Tính điểm chính xác

**File:** `giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`  
**Estimated:** 30 phút (Option A) / 60 phút (Option B)  
**Risk:** 🔴 HIGH (logic quan trọng)

---

### **PHASE 2: Backend Controller Updates** 🔴 CRITICAL

#### **Task 2.1: Update kpi.controller.js - duyetKPITieuChi()**

**Nếu OPTION A:**

- [ ] Thay logic tính TongDiemKPI:
  - ❌ Xóa: `sum(ev.DiemNhiemVu)`
  - ✅ Thêm: Load DiemTuDanhGia từ NhanVienNhiemVu
  - ✅ Thêm: Tính theo công thức chuẩn (như Task 1.4 Option B)
- [ ] Set `danhGiaKPI.TongDiemKPI = tongDiemKPI`
- [ ] Gọi `danhGiaKPI.duyet(nhanXet, nguoiDuyetId)`
- [ ] Test: Duyệt KPI + verify TongDiemKPI chính xác

**Nếu OPTION B:**

- [ ] Xóa toàn bộ logic tính TongDiemKPI trong controller
- [ ] Chỉ gọi: `await danhGiaKPI.duyet(nhanXet, nguoiDuyetId)`
- [ ] Test: Duyệt KPI + verify TongDiemKPI chính xác

**File:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`  
**Line:** ~1620-1650  
**Estimated:** 30 phút (Option A) / 15 phút (Option B)  
**Risk:** 🔴 HIGH

---

#### **Task 2.2: Simplify kpi.controller.js - huyDuyetKPI()**

- [ ] Xóa logic manual update (danhGiaKPI.TrangThai = ...)
- [ ] Xóa logic manual LichSuHuyDuyet.push(...)
- [ ] Chỉ gọi: `await danhGiaKPI.huyDuyet(nguoiHuyId, lyDo)`
- [ ] Giữ nguyên permission check (Admin/Manager)
- [ ] Test: Hủy duyệt + verify audit trail

**File:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`  
**Line:** ~1970-2000  
**Estimated:** 15 phút  
**Risk:** 🟡 MEDIUM

---

### **PHASE 3: Frontend Utility** 🟡 MEDIUM

#### **Task 3.1: Tạo utils/kpiCalculation.js**

- [ ] Tạo file mới: `src/utils/kpiCalculation.js`
- [ ] Implement function `calculateTotalScore(nhiemVuList, diemTuDanhGiaMap)`
- [ ] Logic GIỐNG HỆT backend method duyet()
- [ ] Return `{ tongDiem, chiTiet }`
- [ ] Test: So sánh kết quả với backend

**File:** `fe-bcgiaobanbvt/src/utils/kpiCalculation.js`  
**Estimated:** 30 phút  
**Risk:** 🟡 MEDIUM

---

#### **Task 3.2: Implement calculateNhiemVuScore() helper**

- [ ] Function tính điểm từng nhiệm vụ
- [ ] Dùng cho hiển thị cột "Tổng điểm" trong table
- [ ] Export cùng file với calculateTotalScore()
- [ ] Test: Verify công thức

**File:** `fe-bcgiaobanbvt/src/utils/kpiCalculation.js`  
**Estimated:** 15 phút  
**Risk:** 🟢 LOW

---

### **PHASE 4: Frontend Component Updates** 🟡 MEDIUM

#### **Task 4.1: Update ChamDiemKPIDialog.js - Load DiemTuDanhGia** ✅

- [x] Import `calculateTotalScore` từ utils
- [x] useMemo: Build `diemTuDanhGiaMap` từ currentNhiemVuList
- [x] Map structure: `{ [NhiemVuThuongQuyID]: DiemTuDanhGia }`
- [x] Pass map to ChamDiemKPITable component
- [x] Test: Map được load đúng

**File:** `fe-bcgiaobanbvt/src/features/KPI/v2/components/ChamDiemKPIDialog.js`  
**Estimated:** 20 phút  
**Risk:** 🟡 MEDIUM  
**Status:** ✅ COMPLETED

---

#### **Task 4.2: Update ChamDiemKPIDialog.js - Preview Calculation** ✅

- [x] useMemo: `calculateTotalScore(currentNhiemVuList, diemTuDanhGiaMap)`
- [x] Render điều kiện:
  - Nếu `isApproved`: Hiển thị `danhGiaKPI.TongDiemKPI` (snapshot)
  - Nếu chưa duyệt: Hiển thị real-time preview
- [x] Update progress check (không dùng TongDiemTieuChi)
- [x] Update unscored check (dùng ChiTietDiem)
- [x] Test: Preview tính đúng

**File:** `fe-bcgiaobanbvt/src/features/KPI/v2/components/ChamDiemKPIDialog.js`  
**Estimated:** 20 phút  
**Risk:** 🟢 LOW  
**Status:** ✅ COMPLETED

---

#### **Task 4.3: Update ChamDiemKPITable.js - Calculation Logic** ✅

- [x] Import `calculateNhiemVuScore` từ utils
- [x] Accept `diemTuDanhGiaMap` prop
- [x] Update `calculateNhiemVuTotal` to use V2 formula
- [x] Remove old `calculateTieuChiScore` logic
- [x] Update scored check (dùng ChiTietDiem.DiemDat > 0)
- [x] Fix expanded row display
- [x] Test: Điểm hiển thị đúng

**File:** `fe-bcgiaobanbvt/src/features/KPI/v2/components/ChamDiemKPITable.js`  
**Estimated:** 30 phút  
**Risk:** 🟡 MEDIUM  
**Status:** ✅ COMPLETED

---

#### **Task 4.4: Backend - Include DiemTuDanhGia in Response** ✅

- [x] Update `getChamDiemTieuChi` controller
- [x] Add `DiemTuDanhGia` field to danhGiaNhiemVuList
- [x] Add `IsMucDoHoanThanh` flag to ChiTietDiem
- [x] Test: API trả về đầy đủ data

**File:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`  
**Estimated:** 15 phút  
**Risk:** 🟢 LOW  
**Status:** ✅ COMPLETED

---

#### **Task 4.5: REMOVED - ScoreInput Component**

- ❌ Không cần tạo mới - component đã tồn tại và hoạt động tốt

**Status:** ✅ NOT NEEDED

- [ ] Update TableHead:
  - Tiêu chí IsMucDoHoanThanh → 2 cells (Tự ĐG + QL chấm)
  - Tiêu chí khác → 1 cell
- [ ] Update TableBody:
  - Cell 1 (Tự ĐG): Read-only, hiển thị DiemTuDanhGia hoặc "--"
  - Cell 2 (QL chấm): Editable input (DiemDat)
  - Cột "Tổng điểm": Tính real-time bằng calculateNhiemVuScore()
- [ ] Style: Màu nền khác nhau cho 2 cột
- [ ] Test: UI hiển thị đúng

**File:** `fe-bcgiaobanbvt/src/features/KPI/ChamDiemKPITable.js`  
**Estimated:** 45 phút  
**Risk:** 🟡 MEDIUM (UI complex)

---

#### **Task 4.4: Create ScoreInput.js Component**

- [ ] Tạo component isolated state (tránh focus loss)
- [ ] Local state: `const [localValue, setLocalValue] = useState(value)`
- [ ] Commit on blur hoặc Enter
- [ ] Validation: min/max range
- [ ] Props: `value, onChange, min, max, unit, disabled`
- [ ] Test: Nhập điểm không bị mất focus

**File:** `fe-bcgiaobanbvt/src/features/KPI/ScoreInput.js`  
**Estimated:** 20 phút  
**Risk:** 🟢 LOW

---

### **PHASE 5: Testing & Validation** ✅

#### **Task 5.1: Backend Unit Tests** ⏳

- [ ] Test method `duyet()`:
  - Input: DanhGiaKPI + nhiemVu có DiemTuDanhGia
  - Expected: TongDiemKPI tính đúng công thức
  - Expected: LichSuDuyet có TongDiemLucDuyet chính xác
- [ ] Test method `huyDuyet()`:
  - Input: KPI đã duyệt
  - Expected: TrangThai = "CHUA_DUYET"
  - Expected: LichSuHuyDuyet có đầy đủ snapshot
- [ ] Test: Duyệt lại sau khi hủy

**Note:** Backend có thể test manually qua Postman hoặc tạo unit test file  
**Estimated:** 30 phút  
**Risk:** 🟡 MEDIUM  
**Status:** ⏳ PENDING

---

#### **Task 5.2: Integration Tests** ⏳

- [ ] E2E flow: Gán NV → NV tự chấm → Manager chấm → Duyệt
- [ ] Verify: TongDiemKPI backend === preview frontend
- [ ] Edge case: NV chưa tự chấm (DiemTuDanhGia = null)
- [ ] Edge case: Hủy duyệt → Sửa điểm → Duyệt lại
- [ ] Verify: LichSuDuyet có nhiều entries

**Estimated:** 45 phút  
**Risk:** 🔴 HIGH  
**Status:** ⏳ PENDING

---

#### **Task 5.3: Manual Testing Checklist** ✅

- [x] Created comprehensive testing document: `TESTING_CHECKLIST_KPI_V2.md`
- [x] 6 scenarios covering all edge cases:
  - Scenario 1: Duyệt KPI lần đầu (formula validation)
  - Scenario 2: Hủy duyệt KPI (audit trail)
  - Scenario 3: Duyệt lại sau khi hủy
  - Scenario 4: NV chưa tự chấm (DiemTuDanhGia = null)
  - Scenario 5: UI disable khi đã duyệt (read-only)
  - Scenario 6: Formula cross-check (backend vs frontend)
- [x] Step-by-step instructions với expected results
- [x] Bug tracking template
- [x] Sign-off section

**File:** `fe-bcgiaobanbvt/TESTING_CHECKLIST_KPI_V2.md`  
**Estimated:** 30 phút  
**Risk:** � LOW  
**Status:** ✅ COMPLETED

---

## 📊 PROGRESS TRACKING

### **Overall Progress: 13/21 tasks (62%)**

| Phase                        | Tasks | Completed | Progress      |
| ---------------------------- | ----- | --------- | ------------- |
| Phase 1: Backend Models      | 4     | 4         | ✅✅✅✅ 100% |
| Phase 2: Backend Controllers | 2     | 2         | ✅✅ 100%     |
| Phase 3: Frontend Utility    | 2     | 2         | ✅✅ 100%     |
| Phase 4: Frontend Components | 5     | 4         | ✅✅✅✅ 80%  |
| Phase 5: Testing             | 3     | 1         | ✅⬜⬜ 33%    |

---

## ⏱️ TIME ESTIMATION

| Phase     | Min Time      | Max Time      |
| --------- | ------------- | ------------- |
| Phase 1   | 45 min        | 85 min        |
| Phase 2   | 30 min        | 45 min        |
| Phase 3   | 45 min        | 45 min        |
| Phase 4   | 105 min       | 105 min       |
| Phase 5   | 105 min       | 105 min       |
| **TOTAL** | **5.5 hours** | **6.5 hours** |

**Estimated completion:** 1 working day (với testing đầy đủ)

---

## 🚨 RISK MANAGEMENT

### **🔴 HIGH RISK:**

- Task 1.4: Method duyet() (Option B) - Logic phức tạp
- Task 2.1: Controller duyetKPITieuChi() - Critical path
- Task 5.2: Integration tests - E2E flow

**Mitigation:**

- Review code kỹ trước khi commit
- Test từng bước nhỏ
- Backup code trước khi refactor

### **🟡 MEDIUM RISK:**

- Task 1.2: Method huyDuyet() - Audit trail logic
- Task 2.2: Controller huyDuyetKPI()
- Task 4.3: ChamDiemKPITable - Complex UI

**Mitigation:**

- Tham khảo document chi tiết
- Test manual sau mỗi change

### **🟢 LOW RISK:**

- Schema changes (xóa fields)
- Utility functions
- Simple components

---

## 📝 COMMIT STRATEGY

```
1. feat(backend): remove calculated fields from DanhGiaNhiemVuThuongQuy
   - Remove TongDiemTieuChi, DiemNhiemVu
   - Remove pre-save/post-save hooks

2. feat(backend): enhance DanhGiaKPI methods
   - Update huyDuyet() with audit trail
   - Remove tinhTongDiemKPI() method
   - [Option A/B] Update duyet() method

3. feat(backend): refactor kpi.controller duyetKPITieuChi
   - Implement V2 formula (DiemQL×2 + DiemTuDanhGia)/3
   - Load DiemTuDanhGia from NhanVienNhiemVu

4. feat(frontend): add kpiCalculation utility
   - Implement calculateTotalScore()
   - Implement calculateNhiemVuScore()

5. feat(frontend): update ChamDiemKPIDialog
   - Load DiemTuDanhGia map
   - Real-time preview calculation

6. feat(frontend): redesign ChamDiemKPITable
   - 2-column layout for IsMucDoHoanThanh criterion
   - Add ScoreInput component

7. test: add comprehensive tests for KPI V2
   - Unit tests for duyet() method
   - Integration tests for E2E flow

8. docs: update TU_DANH_GIA_KPI_REFACTOR_COMPLETE.md
   - Mark implementation as complete
```

---

## ✅ DEFINITION OF DONE

- [ ] Tất cả 21 tasks hoàn thành
- [ ] Không có calculated fields trong schema
- [ ] Backend tính điểm theo công thức chuẩn V2
- [ ] Frontend preview khớp với backend snapshot
- [ ] LichSuDuyet và LichSuHuyDuyet đầy đủ audit trail
- [ ] Tất cả tests pass (unit + integration)
- [ ] Manual testing checklist hoàn thành
- [ ] Code review approved
- [ ] Document updated với implementation notes

---

## 🎯 NEXT STEPS

1. **User chọn Option A hoặc Option B**
2. Bắt đầu Phase 1: Backend Model Updates
3. Commit sau mỗi phase
4. Update progress trong file này

**LET'S GO!** 🚀
