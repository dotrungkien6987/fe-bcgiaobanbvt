# Phase 0: Backend Cleanup - Ticket System Legacy

> **Mục tiêu:** Dọn dẹp toàn bộ code Ticket cũ trước khi triển khai Ticket System mới
> **Thời gian ước tính:** 30 phút
> **Độ phức tạp:** Thấp

---

## 📋 Tổng Quan

Hệ thống hiện tại có 2 bộ models Ticket song song (English naming + Vietnamese naming) cần xóa hoàn toàn để triển khai thiết kế mới.

### Files cần XÓA

| File                                               | Mô tả                   | Collection          |
| -------------------------------------------------- | ----------------------- | ------------------- |
| `modules/workmanagement/models/Ticket.js`          | Model English naming    | `tickets`           |
| `modules/workmanagement/models/TicketCategory.js`  | Category English naming | `ticket_categories` |
| `modules/workmanagement/models/YeuCauHoTro.js`     | Model Vietnamese cũ     | `yeucauhotro`       |
| `modules/workmanagement/models/LoaiYeuCauHoTro.js` | Category Vietnamese cũ  | `loaiyeucauhotro`   |

### Files cần CẬP NHẬT

| File                                        | Thay đổi                                      |
| ------------------------------------------- | --------------------------------------------- |
| `modules/workmanagement/models/index.js`    | Xóa require/export Ticket, TicketCategory     |
| `modules/workmanagement/models/BinhLuan.js` | Xóa field `YeuCauHoTroID` + index             |
| `modules/workmanagement/models/TepTin.js`   | Xóa field `YeuCauHoTroID` + index             |
| `seeds/notificationTemplates.js`            | Xóa TICKET_CREATED, TICKET_RESOLVED templates |

### Tài liệu cần XÓA

| File                                             | Mô tả                        |
| ------------------------------------------------ | ---------------------------- |
| `docs/TicketSystem.md`                           | Tài liệu thiết kế cũ         |
| `Instructions/04_Backend_Tickets_System_APIs.md` | Hướng dẫn API cũ (1686 dòng) |

---

## ✅ Checklist Thực Hiện

### Bước 1: Xóa 4 Model Files

```bash
# Xóa models cũ
rm modules/workmanagement/models/Ticket.js
rm modules/workmanagement/models/TicketCategory.js
rm modules/workmanagement/models/YeuCauHoTro.js
rm modules/workmanagement/models/LoaiYeuCauHoTro.js
```

### Bước 2: Cập nhật models/index.js

**Xóa dòng require:**

```javascript
// TRƯỚC - Xóa các dòng này:
const TicketCategory = require("./TicketCategory");
const Ticket = require("./Ticket");
```

**Xóa phần exports:**

```javascript
// TRƯỚC - Xóa các dòng này trong module.exports:
// Tickets
TicketCategory,
Ticket,
```

### Bước 3: Cập nhật BinhLuan.js

**Xóa field YeuCauHoTroID khỏi schema:**

```javascript
// TRƯỚC - Xóa block này:
YeuCauHoTroID: {
  type: Schema.ObjectId,
  ref: "YeuCauHoTro",
},
```

**Xóa index YeuCauHoTroID:**

```javascript
// TRƯỚC - Xóa dòng này:
binhLuanSchema.index({ YeuCauHoTroID: 1, NgayBinhLuan: -1 });
```

### Bước 4: Cập nhật TepTin.js

**Xóa field YeuCauHoTroID khỏi schema:**

```javascript
// TRƯỚC - Xóa block này:
YeuCauHoTroID: {
  type: Schema.ObjectId,
  ref: "YeuCauHoTro",
},
```

**Xóa index YeuCauHoTroID:**

```javascript
// TRƯỚC - Xóa dòng này:
tepTinSchema.index({ YeuCauHoTroID: 1 });
```

### Bước 5: Cập nhật seeds/notificationTemplates.js

**Xóa 2 templates TICKET:**

```javascript
// TRƯỚC - Xóa toàn bộ block này:
// ===== TICKET NOTIFICATIONS =====
{
  type: "TICKET_CREATED",
  ...
},
{
  type: "TICKET_RESOLVED",
  ...
},
```

### Bước 6: Xóa tài liệu cũ

```bash
rm docs/TicketSystem.md
rm Instructions/04_Backend_Tickets_System_APIs.md
```

---

## ⚠️ Lưu Ý

1. **Không cần backup data**: Các collections `tickets`, `ticket_categories`, `yeucauhotro`, `loaiyeucauhotro` chỉ chứa test data

2. **BinhLuan/TepTin sẽ có field mới**: Phase 1 sẽ thêm `YeuCauID` (thay vì `YeuCauHoTroID`) để reference model `YeuCau` mới

3. **Notification templates sẽ tạo lại**: Phase 6 sẽ tạo templates mới phù hợp với workflow mới

---

## 🔄 Trạng Thái

- [ ] Bước 1: Xóa 4 model files
- [ ] Bước 2: Cập nhật models/index.js
- [ ] Bước 3: Cập nhật BinhLuan.js
- [ ] Bước 4: Cập nhật TepTin.js
- [ ] Bước 5: Cập nhật notificationTemplates.js
- [ ] Bước 6: Xóa tài liệu cũ
- [ ] Test: Khởi động lại BE, kiểm tra không có lỗi

---

_Cập nhật: 29/11/2025_
