# 🔥 CRITICAL HOTFIX - Composite Key (09/10/2025)

## 🎯 Issue

**50% dòng tính chênh lệch sai** do cùng KhoaID nhưng khác LoaiKhoa (noitru vs ngoaitru)

## 🔧 Root Cause

```javascript
// ❌ Logic cũ - chỉ dùng KhoaID
previousMap.set(5, data); // Ghi đè khi có 2 dòng cùng KhoaID!

// VD: Khoa ID 5 có cả noitru và ngoaitru
// → Map chỉ lưu dòng cuối (ngoaitru)
// → noitru bị lấy nhầm data của ngoaitru
```

## ✅ Solution

```javascript
// ✅ Logic mới - dùng composite key
const compositeKey = `${KhoaID}_${LoaiKhoa}`;
previousMap.set("5_noitru", data_noitru);
previousMap.set("5_ngoaitru", data_ngoaitru); // Không ghi đè!
```

## 📊 Impact

### Before:

```
Khoa ID 5 - Nội trú:  100 BN  ▲ +70 BN  ❌ SAI (100 - 30 ngoaitru)
Khoa ID 5 - Ngoại trú: 50 BN  ▲ +20 BN  ✅ ĐÚNG (50 - 30 ngoaitru, may mắn)
```

### After:

```
Khoa ID 5 - Nội trú:  100 BN  ▲ +20 BN  ✅ ĐÚNG (100 - 80 noitru)
Khoa ID 5 - Ngoại trú: 50 BN  ▲ +20 BN  ✅ ĐÚNG (50 - 30 ngoaitru)
```

## 📝 Code Change

**File:** `helpers.js`

```diff
- const previousMap = new Map();
- previousData.forEach((item) => {
-   if (item.KhoaID) {
-     previousMap.set(item.KhoaID, item);
-   }
- });

+ const previousMap = new Map();
+ previousData.forEach((item) => {
+   if (item.KhoaID && item.LoaiKhoa) {
+     const compositeKey = `${item.KhoaID}_${item.LoaiKhoa}`;
+     previousMap.set(compositeKey, item);
+   }
+ });

- const previous = previousMap.get(current.KhoaID);
+ const compositeKey = `${current.KhoaID}_${current.LoaiKhoa}`;
+ const previous = previousMap.get(compositeKey);
```

## ✅ Testing

**Refresh browser (Ctrl+F5) và verify:**

- [ ] Cùng KhoaID, khác LoaiKhoa → Diff chính xác
- [ ] Tab Nội trú vs Ngoại trú → Giá trị khác nhau
- [ ] Totals → Tổng đúng

## 🚀 Status

- ✅ **Code:** Fixed
- ✅ **Lint:** No errors
- ✅ **Critical:** Yes - Deploy ASAP!

---

**Deployed:** Ready  
**Testing:** User acceptance required
