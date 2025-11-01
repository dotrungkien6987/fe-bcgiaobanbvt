# 🧪 TESTING CHECKLIST - KPI V2 REFACTOR

> **Date:** 27/10/2025  
> **Tester:** ********\_********  
> **Version:** V2.0 (Simplified Architecture)

---

## 📋 PRE-TEST SETUP

### **Test Data Requirements:**

- [ ] Chu kỳ đánh giá đang active
- [ ] Ít nhất 2 nhân viên được gán nhiệm vụ
- [ ] Mỗi nhân viên có ít nhất 3 nhiệm vụ
- [ ] Tiêu chí cấu hình có:
  - 1 tiêu chí "Mức độ hoàn thành" (TANG_DIEM, IsMucDoHoanThanh = true)
  - 1 tiêu chí TANG_DIEM khác
  - 1 tiêu chí GIAM_DIEM

### **Test User Accounts:**

- [ ] **NV1:** Nhân viên thường (tự chấm điểm)
- [ ] **MGR1:** Quản lý KPI (chấm điểm cho NV1)
- [ ] **ADMIN:** Admin (full quyền)

---

## ✅ SCENARIO 1: DUYỆT KPI LẦN ĐẦU

### **Objective:** Verify tính điểm V2 formula chính xác

#### **Steps:**

**1.1. Nhân viên tự chấm điểm** (Login as NV1)

- [ ] Navigate: Menu → KPI → Tự đánh giá KPI
- [ ] Chọn chu kỳ đang active
- [ ] Nhập điểm tự đánh giá cho nhiệm vụ NV1.1:
  - DiemTuDanhGia = **80** (0-100)
- [ ] Click "Lưu nháp"
- [ ] Verify: Toast "Đã lưu điểm tự đánh giá thành công"

**1.2. Manager chấm điểm** (Login as MGR1)

- [ ] Navigate: Menu → KPI → Đánh giá KPI nhân viên
- [ ] Chọn chu kỳ đang active
- [ ] Click "Chấm điểm" cho NV1
- [ ] Dialog mở ra → Expand nhiệm vụ NV1.1
- [ ] Nhập điểm cho các tiêu chí:
  - **Mức độ hoàn thành:** DiemQuanLy = **90** (TANG_DIEM, IsMucDoHoanThanh)
  - **Chất lượng:** DiemQuanLy = **85** (TANG_DIEM)
  - **Vi phạm:** DiemQuanLy = **10** (GIAM_DIEM)
- [ ] MucDoKho = **7**

**1.3. Verify Preview Calculation**

- [ ] Check cột "Tổng điểm" của nhiệm vụ NV1.1
- [ ] Expected (manual calculation):
  ```
  Mức độ hoàn thành: (90×2 + 80)/3 = 86.67 → 0.8667
  Chất lượng: 85 → 0.85
  Vi phạm: -10 → -0.10
  TongDiemTieuChi = 0.8667 + 0.85 - 0.10 = 1.6167
  DiemNhiemVu = 7 × 1.6167 = 11.32
  ```
- [ ] Actual in UI: **11.32** ✅

**1.4. Verify Total Preview**

- [ ] Check header "Tổng điểm KPI dự kiến"
- [ ] Color: Xám (chưa duyệt)
- [ ] Caption: "Tổng điểm dự kiến"

**1.5. Click "Duyệt KPI"**

- [ ] Confirm dialog
- [ ] Verify: Toast "Đã duyệt KPI thành công"
- [ ] Dialog auto-close sau 1.5s

**1.6. Backend Verification** (Optional - Dev only)

```bash
# MongoDB query
db.danhgiakpis.findOne({ NhanVienID: NV1_ID, ChuKyID: CHUKY_ID })
```

- [ ] TrangThai = **"DA_DUYET"**
- [ ] TongDiemKPI = **11.32** (hoặc tổng của tất cả nhiệm vụ)
- [ ] LichSuDuyet có 1 entry với:
  - TongDiemLucDuyet = 11.32
  - NguoiDuyet = MGR1_ID
  - NgayDuyet = today

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** **********************\_\_\_**********************

---

## 🔄 SCENARIO 2: HỦY DUYỆT KPI

### **Objective:** Verify hủy duyệt lưu đầy đủ audit trail

#### **Steps:**

**2.1. Manager hủy duyệt** (Login as MGR1)

- [ ] Navigate: Menu → KPI → Đánh giá KPI nhân viên
- [ ] Click "Xem" KPI đã duyệt của NV1
- [ ] Click "Hủy duyệt" button
- [ ] Nhập lý do: "Cần điều chỉnh tiêu chí Chất lượng"
- [ ] Click "Xác nhận"
- [ ] Verify: Toast "Đã hủy duyệt KPI thành công"

**2.2. Verify UI State**

- [ ] TongDiemKPI display = **0.00**
- [ ] Color: Xám
- [ ] Caption: "KPI chưa duyệt"
- [ ] ChiTietDiem inputs: ENABLED (có thể sửa)
- [ ] Button "Duyệt KPI": VISIBLE
- [ ] Button "Hủy duyệt": HIDDEN

**2.3. Backend Verification**

```bash
db.danhgiakpis.findOne({ NhanVienID: NV1_ID, ChuKyID: CHUKY_ID })
```

- [ ] TrangThai = **"CHUA_DUYET"**
- [ ] TongDiemKPI = **0**
- [ ] LichSuHuyDuyet có 1 entry:
  - LyDo = "Cần điều chỉnh tiêu chí Chất lượng"
  - NguoiHuy = MGR1_ID
  - TongDiemTruocKhiHuy = 11.32
  - NgayHuy = today

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** **********************\_\_\_**********************

---

## 🔁 SCENARIO 3: DUYỆT LẠI SAU KHI HỦY

### **Objective:** Verify tính lại điểm sau khi sửa

#### **Steps:**

**3.1. Manager sửa điểm**

- [ ] Mở dialog chấm điểm NV1
- [ ] Sửa tiêu chí "Chất lượng": **85** → **95**
- [ ] Verify preview update real-time
- [ ] New preview:
  ```
  Chất lượng: 95 → 0.95
  TongDiemTieuChi = 0.8667 + 0.95 - 0.10 = 1.7167
  DiemNhiemVu = 7 × 1.7167 = 12.02
  ```
- [ ] Actual: **12.02** ✅

**3.2. Click "Duyệt KPI" lần 2**

- [ ] Verify: Toast success
- [ ] Dialog auto-close

**3.3. Backend Verification**

```bash
db.danhgiakpis.findOne({ NhanVienID: NV1_ID, ChuKyID: CHUKY_ID })
```

- [ ] TrangThai = **"DA_DUYET"**
- [ ] TongDiemKPI = **12.02**
- [ ] LichSuDuyet.length = **2**
  - Entry[0]: TongDiemLucDuyet = 11.32 (lần 1)
  - Entry[1]: TongDiemLucDuyet = 12.02 (lần 2)
- [ ] LichSuHuyDuyet.length = **1** (giữ nguyên)

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** **********************\_\_\_**********************

---

## 🚫 SCENARIO 4: NHÂN VIÊN CHƯA TỰ CHẤM

### **Objective:** Verify edge case DiemTuDanhGia = null/0

#### **Steps:**

**4.1. Setup NV2 (chưa tự chấm)**

- [ ] Tạo nhiệm vụ mới cho NV2
- [ ] **KHÔNG** tự chấm điểm (DiemTuDanhGia = null)

**4.2. Manager chấm điểm cho NV2**

- [ ] Mở dialog chấm điểm NV2
- [ ] Nhập điểm cho "Mức độ hoàn thành": **90**
- [ ] Verify calculation:
  ```
  DiemTuDanhGia = 0 (null → default 0)
  DiemCuoiCung = (90×2 + 0)/3 = 60
  ```
- [ ] Actual: **60** ✅

**4.3. UI Display**

- [ ] Không có cột "Điểm tự đánh giá" riêng (OK - không cần hiển thị)
- [ ] Chỉ preview tổng điểm cuối

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** **********************\_\_\_**********************

---

## 🔒 SCENARIO 5: UI DISABLE KHI ĐÃ DUYỆT

### **Objective:** Verify read-only mode

#### **Steps:**

**5.1. Mở KPI đã duyệt**

- [ ] Click "Xem" KPI đã duyệt của NV1
- [ ] Verify: Dialog title có "(Đã duyệt)"

**5.2. Verify Disabled State**

- [ ] Tất cả input ChiTietDiem: **DISABLED**
- [ ] Input background: Xám
- [ ] Cursor: not-allowed
- [ ] Button "Lưu nháp": **HIDDEN**
- [ ] Button "Duyệt KPI": **HIDDEN**

**5.3. Verify Snapshot Display**

- [ ] TongDiemKPI hiển thị: **12.02** (snapshot, không phải preview)
- [ ] Color: Xanh (DA_DUYET)
- [ ] Caption: "Tổng điểm KPI"
- [ ] Không thay đổi khi hover/focus input

**5.4. Verify Hủy Duyệt Permission**

- [ ] Login as MGR1 (trong vòng 7 ngày):
  - [ ] Button "Hủy duyệt": **VISIBLE**
- [ ] Login as NV1 (nhân viên):
  - [ ] Button "Hủy duyệt": **HIDDEN**
- [ ] Login as ADMIN:
  - [ ] Button "Hủy duyệt": **VISIBLE** (unlimited time)

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** **********************\_\_\_**********************

---

## 🧮 SCENARIO 6: FORMULA VALIDATION

### **Objective:** Cross-check backend vs frontend calculation

#### **Test Data:**

```javascript
// Nhiệm vụ test:
MucDoKho = 5;
ChiTietDiem = [
  {
    TenTieuChi: "Mức độ hoàn thành",
    IsMucDoHoanThanh: true,
    LoaiTieuChi: "TANG_DIEM",
    DiemDat: 80,
  },
  {
    TenTieuChi: "Chất lượng",
    IsMucDoHoanThanh: false,
    LoaiTieuChi: "TANG_DIEM",
    DiemDat: 90,
  },
  {
    TenTieuChi: "Vi phạm",
    IsMucDoHoanThanh: false,
    LoaiTieuChi: "GIAM_DIEM",
    DiemDat: 15,
  },
];
DiemTuDanhGia = 70;
```

#### **Expected Calculation:**

```
Step 1: Tính từng tiêu chí
  - Mức độ hoàn thành: (80×2 + 70)/3 = 76.67 → 0.7667
  - Chất lượng: 90 → 0.90
  - Vi phạm: -15 → -0.15

Step 2: TongDiemTieuChi
  = 0.7667 + 0.90 - 0.15
  = 1.5167

Step 3: DiemNhiemVu
  = 5 × 1.5167
  = 7.58
```

#### **Test:**

- [ ] Frontend preview: **7.58** ✅
- [ ] Backend snapshot (sau duyệt): **7.58** ✅
- [ ] Match: YES ✅

**Result:** ✅ PASS / ❌ FAIL  
**Notes:** **********************\_\_\_**********************

---

## 📊 SUMMARY

| Scenario                   | Status            | Issues |
| -------------------------- | ----------------- | ------ |
| 1. Duyệt KPI lần đầu       | ⬜ PASS / ⬜ FAIL | \_\_\_ |
| 2. Hủy duyệt KPI           | ⬜ PASS / ⬜ FAIL | \_\_\_ |
| 3. Duyệt lại sau khi hủy   | ⬜ PASS / ⬜ FAIL | \_\_\_ |
| 4. NV chưa tự chấm         | ⬜ PASS / ⬜ FAIL | \_\_\_ |
| 5. UI disable khi đã duyệt | ⬜ PASS / ⬜ FAIL | \_\_\_ |
| 6. Formula validation      | ⬜ PASS / ⬜ FAIL | \_\_\_ |

**Overall Result:** ⬜ ALL PASS / ⬜ NEED FIX

---

## 🐛 BUGS FOUND

| #   | Description | Severity                 | Status           |
| --- | ----------- | ------------------------ | ---------------- |
| 1   |             | ⬜ LOW ⬜ MEDIUM ⬜ HIGH | ⬜ OPEN ⬜ FIXED |
| 2   |             | ⬜ LOW ⬜ MEDIUM ⬜ HIGH | ⬜ OPEN ⬜ FIXED |
| 3   |             | ⬜ LOW ⬜ MEDIUM ⬜ HIGH | ⬜ OPEN ⬜ FIXED |

---

## ✅ SIGN-OFF

- [ ] All scenarios passed
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Ready for production

**Tester Signature:** ********\_********  
**Date:** ********\_********  
**Manager Approval:** ********\_********
