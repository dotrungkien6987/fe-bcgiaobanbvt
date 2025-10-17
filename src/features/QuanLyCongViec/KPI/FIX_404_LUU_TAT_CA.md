# Debug Fix - Lỗi 404 "Lưu tất cả"

## 🐛 Root Cause

**Frontend đang gọi SAI URL:**

```javascript
// ❌ OLD (SAI)
PUT /workmanagement/kpi/nhiem-vu/${nv._id}/cham-diem

// ✅ NEW (ĐÚNG)
PUT /workmanagement/kpi/nhiem-vu/${nv._id}
```

**Backend route:**
```javascript
// kpi.api.js Line 105
router.put("/nhiem-vu/:nhiemVuId", kpiController.chamDiemNhiemVu);
```

---

## ✅ Fix Applied

### **File: kpiSlice.js (Line 1081)**

**Before:**
```javascript
await apiService.put(`/workmanagement/kpi/nhiem-vu/${nv._id}/cham-diem`, {
  ChiTietDiem: nv.ChiTietDiem,
});
```

**After:**
```javascript
await apiService.put(`/workmanagement/kpi/nhiem-vu/${nv._id}`, {
  ChiTietDiem: nv.ChiTietDiem,
  MucDoKho: nv.MucDoKho,
  GhiChu: nv.GhiChu || "",
});
```

**Changes:**
1. ✅ Xóa `/cham-diem` khỏi URL
2. ✅ Thêm `MucDoKho` vào payload (backend yêu cầu)
3. ✅ Thêm `GhiChu` vào payload (optional)

---

## 🧪 Test Steps

### **1. Restart Frontend**
```bash
# Terminal
cd fe-bcgiaobanbvt
npm start
```

### **2. Test Flow**
1. Vào `/quanlycongviec/kpi/danh-gia`
2. Click nhân viên
3. Nhập điểm vào các tiêu chí
4. Click **"Lưu tất cả"**
5. Kiểm tra Network tab:
   - Request URL: `/workmanagement/kpi/nhiem-vu/[ID]` (không có `/cham-diem`)
   - Request Method: `PUT`
   - Request Payload:
     ```json
     {
       "ChiTietDiem": [
         {
           "TieuChiID": "...",
           "DiemDat": 80,
           "GhiChu": ""
         }
       ],
       "MucDoKho": 7.5,
       "GhiChu": ""
     }
     ```

### **3. Expected Response**
```json
{
  "success": true,
  "data": {
    "danhGiaNhiemVu": {
      "_id": "...",
      "TongDiemTieuChi": 1.65,
      "DiemNhiemVu": 12.375
    },
    "tongDiemKPI": 150.5
  },
  "message": "Chấm điểm nhiệm vụ thành công"
}
```

---

## 📊 Data Flow

```
User nhập điểm
  ↓
updateTieuChiScore (Redux) - Update DiemDat locally
  ↓
Click "Lưu tất cả"
  ↓
saveAllNhiemVu action
  ↓
Loop qua scoredTasks
  ↓
PUT /workmanagement/kpi/nhiem-vu/{id}
Body: { ChiTietDiem, MucDoKho, GhiChu }
  ↓
Backend: kpiController.chamDiemNhiemVu
  ↓
Model method: danhGiaNhiemVu.chamDiem(ChiTietDiem, MucDoKho)
  ↓
Validate DiemDat in [GiaTriMin, GiaTriMax]
  ↓
Pre-save hook: Calculate TongDiemTieuChi, DiemNhiemVu
  ↓
Post-save hook: Update DanhGiaKPI.TongDiemKPI
  ↓
Response: { danhGiaNhiemVu, tongDiemKPI }
  ↓
Frontend: Refresh data (getChamDiemDetail)
  ↓
Toast: "Đã lưu X nhiệm vụ thành công"
```

---

## 🎯 Success Criteria

- [x] ✅ Fix URL `/cham-diem` → remove
- [x] ✅ Add `MucDoKho` to payload
- [x] ✅ Add `GhiChu` to payload
- [ ] ⏳ Test API returns 200 (not 404)
- [ ] ⏳ Verify DiemNhiemVu calculated correctly
- [ ] ⏳ Verify TongDiemKPI updated
- [ ] ⏳ Toast message shows success

---

## 📝 Notes

- **DiemDat** vẫn GIỮ LẠI trong ChiTietDiem (user input field)
- **TrongSo** đã XÓA hoàn toàn
- **GiaTriMin/Max/DonVi** đã THÊM vào structure
- Formula v3.0: `DiemNhiemVu = MucDoKho × Σ((DiemDat/100) × sign)`

---

**Status:** ✅ Fixed - Ready for testing
