# ⚡ QUICK AUDIT CHECKLIST - Notification Template

> **Mục đích**: Audit nhanh 1 template trong 5-10 phút (thay vì 1 giờ)  
> **Áp dụng**: Khi cần verify hoặc fix nhanh, không cần báo cáo chi tiết

---

## 🎯 INPUT

**Template Type**: `_______________` (VD: `TASK_ASSIGNED`)

**Mô tả vấn đề (nếu có)**: ****************\_****************

---

## ✅ CHECKLIST AUDIT NHANH (10 bước)

### ☑️ Bước 1: Verify Template tồn tại trong seed

```bash
# Tìm trong file
grep -n "type: \"TEMPLATE_TYPE\"" giaobanbv-be/seeds/notificationTemplates.js
```

- [ ] Tìm thấy template
- [ ] `isActive: true`
- [ ] Có `requiredVariables` array

---

### ☑️ Bước 2: Verify Trigger Config tồn tại & enabled

```bash
# Tìm trong file
grep -n "templateCode: \"TEMPLATE_TYPE\"" giaobanbv-be/config/notificationTriggers.js
```

- [ ] Tìm thấy trigger config
- [ ] `enabled: true`
- [ ] `templateCode` khớp với `template.type`
- [ ] Ghi chú trigger key: `_____________________`

---

### ☑️ Bước 3: Schema Field Validation (QUAN TRỌNG - fix lỗi như YEUCAU_DISPATCHED)

Xác định entity chính (YeuCau/CongViec/DanhGiaKPI):

**Entity**: `_______________`

**Kiểm tra schema fields được populate**:

```bash
# VD: Tìm schema YeuCau
grep -A 5 "new Schema" giaobanbv-be/modules/workmanagement/models/YeuCau.js | head -50
```

✅ **Checklist Schema Fields** (dựa trên entity):

#### Nếu entity = **YeuCau**:

- [ ] `NguoiYeuCauID` (ref: NhanVien) ✓ có
- [ ] `NguoiDuocDieuPhoiID` (ref: NhanVien) ✓ có
- [ ] `NguoiXuLyID` (ref: NhanVien) ✓ có
- [ ] `NguoiDieuPhoiID` (ref: NhanVien) ✓ có
- [ ] `KhoaNguonID` (ref: Khoa) ✓ có
- [ ] `KhoaDichID` (ref: Khoa) ✓ có
- [ ] **`DanhMucYeuCauID`** (ref: DanhMucYeuCau) ✓ có — KHÔNG PHẢI `LoaiYeuCauID` ❌
  - Field name trong DanhMucYeuCau: **`TenLoaiYeuCau`** — KHÔNG PHẢI `TenLoai` ❌

#### Nếu entity = **CongViec**:

- [ ] `NguoiGiaoViecID` (ref: NhanVien) ✓ có
- [ ] `NguoiChinhID` (ref: NhanVien) ✓ có
- [ ] `NguoiThamGia` (array of NhanVien) ✓ có
- [ ] `ChuKyDanhGiaID` (ref: ChuKyDanhGia) ✓ có

#### Nếu entity = **DanhGiaKPI**:

- [ ] `NhanVienID` (ref: NhanVien) ✓ có
- [ ] `ChuKyDanhGiaID` (ref: ChuKyDanhGia) ✓ có
- [ ] `NguoiDanhGiaID` (ref: NhanVien) ✓ có

---

### ☑️ Bước 4: Tìm nơi fire trigger trong service/controller

```bash
# Tìm triggerService.fire với trigger key
grep -rn "triggerService.fire.*TRIGGER_KEY" giaobanbv-be/modules/workmanagement/
```

- [ ] Tìm thấy ít nhất 1 nơi gọi
- [ ] Ghi chú file: `_____________________`
- [ ] Ghi chú dòng: `_____`

---

### ☑️ Bước 5: Verify Populate Statement đúng Schema

**Đọc populate statement** ở file vừa tìm được:

```javascript
const populated = await Entity.findById(id)
  .populate("Field1", "...")
  .populate("Field2", "...")
  .lean();
```

**Checklist**:

- [ ] Tất cả field được populate **TỒN TẠI** trong schema (check Bước 3)
- [ ] Không có typo (VD: `LoaiYeuCauID` → sai, phải là `DanhMucYeuCauID`)
- [ ] Field names trong ref model đúng (VD: `TenLoai` → sai, phải là `TenLoaiYeuCau`)

**❌ PITFALL #1**: Populate field không tồn tại → crash ngay khi fire trigger
**✅ FIX**: So sánh với schema thực tế, đổi tên field cho đúng

---

### ☑️ Bước 6: Verify Context Variables khớp với requiredVariables

**Required variables** từ template (Bước 1): `[________________]`

**Context variables** được build trong service:

```javascript
const context = {
  entity: populated,
  performerId: ...,
  var1: ...,
  var2: ...,
  // ...
};
```

**Checklist**:

- [ ] Mọi required variable đều có trong context
- [ ] Không có variable dạng raw ObjectId (phải extract `.Ten`, `.TenKhoa`, etc.)
- [ ] Có fallback cho null (VD: `|| "Người dùng"`)
- [ ] Date được format với dayjs (VD: `.format("DD/MM/YYYY HH:mm")`)

**❌ PITFALL #2**: Context thiếu variable → template render lỗi hoặc blank
**✅ FIX**: Thêm variable vào context với fallback

---

### ☑️ Bước 7: Verify Recipients Logic

**Recipients strategy** từ trigger config (Bước 2):

```javascript
recipients: {
  roles: [...],           // Hoặc
  custom: (context) => {  // Hoặc cả hai
    // return array of NhanVienIDs
  }
}
```

**Checklist**:

- [ ] Recipients function/config trả về **NhanVienID** (không phải UserID)
- [ ] Có null-safe (`?.`)
- [ ] Loại bỏ duplicate (nếu cần)
- [ ] **KHÔNG** loại trừ performer trong function (để triggerService làm)

**❌ PITFALL #3**: Recipients trả về populated object thay vì ObjectId
**✅ FIX**: Normalize bằng `item?._id || item` (đã fix trong notificationHelper)

---

### ☑️ Bước 8: Verify User Mapping (NhanVien → User)

**Quan trọng nhất**: Recipients phải map được sang User để gửi notification.

**Query test** (thay NhanVienID thực tế):

```javascript
db.users.find(
  {
    NhanVienID: ObjectId("6xxx..."),
    isDeleted: { $ne: true },
  },
  { _id: 1, UserName: 1, NhanVienID: 1 }
);
```

**Checklist**:

- [ ] Mọi NhanVien recipient đều có User tương ứng
- [ ] `User.NhanVienID` đúng kiểu ObjectId (không phải string)
- [ ] `User.isDeleted !== true`

**❌ PITFALL #4**: Không map được NhanVien → User → recipients rỗng → KHÔNG TẠO NOTIFICATION
**✅ FIX**: Tạo User cho NhanVien thiếu, hoặc đổi recipients sang những người có User

---

### ☑️ Bước 9: Check excludePerformer

**excludePerformer** từ trigger config (Bước 2): `true` / `false`

Nếu `true`:

- [ ] Performer có khả năng là 1 trong recipients không?
- [ ] Sau khi loại performer, còn ít nhất 1 recipient không?

**❌ PITFALL #5**: excludePerformer loại hết → recipients rỗng → KHÔNG TẠO NOTIFICATION
**✅ FIX**: Nếu đúng nghiệp vụ thì OK; nếu không thì đổi `excludePerformer: false` hoặc thêm recipients khác

---

### ☑️ Bước 10: Quick Runtime Test (Console Logs)

Nếu đã có console.log chi tiết (từ DEBUG_YEUCAU_DISPATCHED.md):

1. Restart backend
2. Thực hiện action trigger notification qua UI
3. Check logs có xuất hiện:
   - [ ] `[TriggerService] 📥 fire() called: ...`
   - [ ] `[TriggerService] 👥 Converted to userIds: [...]` (không rỗng)
   - [ ] `[NotificationService] ✅ Successfully inserted notification to DB`

Nếu dừng ở bước nào → quay lại Bước tương ứng để fix.

---

## 📊 KẾT QUẢ AUDIT

### ✅ PASS - Template hoạt động tốt

- Tất cả 10 bước pass
- Có thể tạo notification thành công
- **Action**: Không cần fix gì

---

### ⚠️ WARNING - Cần sửa nhỏ

**Vấn đề tìm thấy**:

- [ ] Template thiếu/thừa requiredVariables
- [ ] Context thiếu fallback
- [ ] Recipients có thể rỗng trong edge case

**Action**: Sửa nhỏ theo gợi ý ở checklist

---

### ❌ FAIL - Cần fix ngay

**Vấn đề nghiêm trọng**:

- [ ] Populate field không tồn tại → crash
- [ ] Recipients không map được NhanVien → User → không tạo notification
- [ ] Trigger disabled hoặc không được gọi

**Action**: Fix theo PITFALL tương ứng, sau đó test lại

---

## 🔄 AUDIT BATCH (Nhiều Templates)

Nếu cần audit nhiều templates cùng lúc:

### 1. List tất cả templates cần audit:

```bash
cd giaobanbv-be
grep "type:" seeds/notificationTemplates.js | grep -v "//" | awk '{print $2}' | tr -d ',"'
```

### 2. Với mỗi template, chạy checklist này (5-10 phút/template)

### 3. Tổng hợp kết quả:

| Template Type     | Status     | Issues Found           | Fix Required |
| ----------------- | ---------- | ---------------------- | ------------ |
| YEUCAU_DISPATCHED | ✅ PASS    | Đã fix schema field    | Done         |
| TASK_ASSIGNED     | ⚠️ WARNING | Context thiếu deadline | Minor        |
| KPI_APPROVED      | ❌ FAIL    | Trigger disabled       | Critical     |
| ...               | ...        | ...                    | ...          |

---

## 💡 TIPS

1. **Ưu tiên audit templates được dùng nhiều nhất** (YeuCau/CongViec/KPI core actions)
2. **Batch audit theo module**: Audit hết YeuCau trước, rồi mới CongViec, rồi KPI
3. **Dùng schema files làm cheat sheet**: In ra danh sách fields để đối chiếu nhanh
4. **Test runtime trước khi fix code**: Có thể vấn đề không phải ở template mà ở data/settings

---

## 🚀 NEXT STEPS

Sau khi audit xong 1 template:

- ✅ PASS → Mark done, move to next template
- ⚠️ WARNING → Create quick fix, test, mark done
- ❌ FAIL → Follow PITFALL fix, test thoroughly, mark done

**Goal**: Audit hết 40+ templates trong 1-2 ngày (thay vì 1-2 tuần)

---

**Version**: 1.0 (Based on YEUCAU_DISPATCHED lessons learned)  
**Last Updated**: 18/12/2025
