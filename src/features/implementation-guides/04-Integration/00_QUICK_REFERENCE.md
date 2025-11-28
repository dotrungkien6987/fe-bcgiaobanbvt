# 🔔 Notification Trigger Integration - Quick Reference

> **Tổng quan nhanh** cho việc tích hợp hệ thống thông báo vào các module

---

## 📊 Status Overview

| Phase     | Trạng thái | Mô tả                                                |
| --------- | ---------- | ---------------------------------------------------- |
| Phase 0-7 | ✅ Done    | Core Notification System (Models, Service, Frontend) |
| Phase 8   | 🔜 Current | **Trigger Service Integration**                      |
| Phase 9   | 📅 Future  | FCM Push Notifications                               |
| Phase 10  | 📅 Future  | Deadline Scheduler                                   |

---

## 🗂️ Danh sách tài liệu

| File                                 | Nội dung                         |
| ------------------------------------ | -------------------------------- |
| `01_TRIGGER_SERVICE_ARCHITECTURE.md` | Kiến trúc tổng quan, diagrams    |
| `02_IMPLEMENTATION_STEPS.md`         | Checklist và các bước triển khai |
| `03_CODE_SAMPLES.md`                 | Code mẫu copy-paste ready        |
| `04_FCM_PUSH_EXTENSION.md`           | Kế hoạch mở rộng FCM             |

---

## ⚡ Quick Start

### 1. Tạo files mới (Backend)

```
giaobanbv-be/
├── helpers/notificationHelper.js    ← Xem 03_CODE_SAMPLES.md
├── config/notificationTriggers.js   ← Xem 03_CODE_SAMPLES.md
└── services/triggerService.js       ← Xem 03_CODE_SAMPLES.md
```

### 2. Thêm template mới

```javascript
// seeds/notificationTemplates.js - Thêm:
{
  type: "KPI_APPROVAL_REVOKED",
  name: "Hủy duyệt KPI",
  // ... (xem 03_CODE_SAMPLES.md)
}
```

### 3. Tích hợp 1-line calls

```javascript
// Trong business logic, thêm:
const triggerService = require("../../../services/triggerService");

await triggerService.fire("CongViec.giaoViec", {
  congViec: congviec,
  performerId: req.user?.NhanVienID,
});
```

---

## 📋 15 Triggers đã tích hợp

### CongViec (11 triggers, 10 đang hoạt động)

| Trigger                       | Template                | Vị trí       | Trạng thái                   |
| ----------------------------- | ----------------------- | ------------ | ---------------------------- |
| `CongViec.giaoViec`           | TASK_ASSIGNED           | giaoViec()   | ✅ Enabled                   |
| `CongViec.GIAO_VIEC`          | TASK_ASSIGNED           | transition() | ✅ Enabled                   |
| `CongViec.HUY_GIAO`           | TASK_CANCELLED          | transition() | ✅ Enabled                   |
| `CongViec.TIEP_NHAN`          | TASK_ACCEPTED           | transition() | ✅ Enabled                   |
| `CongViec.HOAN_THANH`         | TASK_COMPLETED          | transition() | ✅ Enabled                   |
| `CongViec.HOAN_THANH_TAM`     | TASK_PENDING_APPROVAL   | transition() | ✅ Enabled                   |
| `CongViec.HUY_HOAN_THANH_TAM` | TASK_REVISION_REQUESTED | transition() | ✅ Enabled                   |
| `CongViec.DUYET_HOAN_THANH`   | TASK_APPROVED           | transition() | ✅ Enabled                   |
| `CongViec.TU_CHOI`            | TASK_REJECTED           | transition() | ⚠️ Disabled (chưa implement) |
| `CongViec.MO_LAI_HOAN_THANH`  | TASK_REOPENED           | transition() | ✅ Enabled                   |
| `CongViec.comment`            | COMMENT_ADDED           | addComment() | ✅ Enabled                   |

### Deadline (2 triggers - Tự động bởi Agenda.js)

| Trigger                         | Template             | Vị trí              | Trạng thái |
| ------------------------------- | -------------------- | ------------------- | ---------- |
| `CongViec.DEADLINE_APPROACHING` | DEADLINE_APPROACHING | Agenda.js scheduled | ✅ Enabled |
| `CongViec.DEADLINE_OVERDUE`     | DEADLINE_OVERDUE     | Agenda.js scheduled | ✅ Enabled |

### KPI (4)

| Trigger            | Template             | Vị trí            |
| ------------------ | -------------------- | ----------------- |
| `KPI.taoDanhGia`   | KPI_CYCLE_STARTED    | taoDanhGiaKPI()   |
| `KPI.duyetDanhGia` | KPI_EVALUATED        | duyetDanhGiaKPI() |
| `KPI.duyetTieuChi` | KPI_EVALUATED        | duyetKPITieuChi() |
| `KPI.huyDuyet`     | KPI_APPROVAL_REVOKED | huyDuyetKPI()     |

---

## ⚠️ Lưu ý quan trọng

### NhanVienID vs User.\_id

```
Business Logic       →  NhanVienID (NhanVien._id)
Notification System  →  User._id

✅ TriggerService tự động convert qua notificationHelper
```

### excludePerformer

```
Khi giao việc: Người giao KHÔNG nhận thông báo "Bạn đã được giao việc"
Khi comment: Người comment KHÔNG nhận thông báo "Có comment mới"
```

---

## 🧪 Testing

```bash
# 1. Seed templates
npm run seed:notifications

# 2. Start server
npm run dev

# 3. Check console
# [TriggerService] ✅ Loaded 11 triggers (11 enabled, 0 disabled)

# 4. Test API
curl http://localhost:8020/api/workmanagement/notifications/triggers/summary
```

---

## 🔜 Mở rộng module mới

Thêm triggers cho module khác (VD: BaoCaoSuCo):

```javascript
// 1. config/notificationTriggers.js
"BaoCaoSuCo.taoMoi": {
  enabled: true,
  template: "INCIDENT_CREATED",
  handler: "baoCaoSuCo",  // Cần thêm handler mới
  recipients: "qualityManager",
  excludePerformer: true,
}

// 2. services/triggerService.js
_handleBaoCaoSuCo(context, config) {
  // Logic xử lý recipients và data
}

// 3. seeds/notificationTemplates.js
{
  type: "INCIDENT_CREATED",
  name: "Báo cáo sự cố mới",
  // ...
}

// 4. Business logic
await triggerService.fire("BaoCaoSuCo.taoMoi", { baoCao, performerId });
```
