# 📁 Notification System Documentation

**Last Updated:** December 25, 2025  
**Architecture:** Centralized Builders + Admin-Configurable Templates

Thư mục này chứa tài liệu tham khảo cho hệ thống notification với **Centralized Builders Architecture**.

---

## 🏗️ KIẾN TRÚC HIỆN TẠI

### Centralized Builders Pattern

```
Service Logic
    ↓
buildXxxNotificationData(entity, context)  ← Single Source of Truth
    ↓ Returns complete data (29/16 fields)
notificationService.send({ type, data })
    ↓
DB lookup (Types + Templates)
    ↓
Render & Send to recipients
```

**3 Builder Functions:**

- `buildYeuCauNotificationData()` - 29 fields
- `buildCongViecNotificationData()` - 29 fields
- `buildKPINotificationData()` - 16 fields

**Location:** `giaobanbv-be/modules/workmanagement/helpers/notificationDataBuilders.js`

---

## 📋 TÀI LIỆU CHÍNH

### 1. ⭐ [CENTRALIZED_BUILDERS_GUIDE.md](CENTRALIZED_BUILDERS_GUIDE.md)

**Mục đích:** Implementation guide cho Centralized Builders pattern  
**Cập nhật:** Dec 25, 2025

**Nội dung:**

- Architecture overview (3 builder functions)
- Usage patterns (4 common patterns)
- Context parameters reference
- Builder features (auto-populate, null safety, formatting)
- Migration status (19/19 locations)
- Best practices & debugging

**Khi nào dùng:**

- Implement notification cho feature mới
- Understand builder architecture
- Debug notification data issues
- Migrate old manual code to builders

---

### 2. [AUDIT_PROMPT.md](AUDIT_PROMPT.md)

**Mục đích:** Audit prompt cho AI để kiểm tra notification types  
**Phiên bản:** 3.0 (Centralized Builders)  
**Cập nhật:** Dec 25, 2025

**Nội dung:**

- Hướng dẫn audit notification types với centralized builders
- Validate builder integration
- Check context parameters
- Verify recipients logic và action URLs
- Test plan và report template

**Khi nào dùng:**

- Audit lại một notification type cụ thể
- Verify sau khi thêm type/template mới
- Debug notification không hoạt động

**Cách dùng:**

```
1. Mở AUDIT_PROMPT.md
2. Copy prompt từ section "---BẮT ĐẦU PROMPT---"
3. Thay [TYPE_CODE] bằng type cần audit (VD: "yeucau-tao-moi")
4. Paste vào AI chat
5. AI sẽ tự động audit và trả về report
```

---

### 3. [SCHEMA_QUICK_REFERENCE.md](SCHEMA_QUICK_REFERENCE.md)

**Mục đích:** Schema field catalog cho WorkManagement entities  
**Cập nhật:** Dec 18, 2025

**Nội dung:**

- YeuCau schema (fields, refs, populate patterns)
- CongViec schema
- DanhGiaKPI schema
- Common pitfalls (LoaiYeuCauID vs DanhMucYeuCauID)
- User vs NhanVien distinction

**Khi nào dùng:**

- Verify schema field names khi build notification data
- Check populate patterns
- Understand entity relationships

---

## 🔑 KEY FILES TRONG CODEBASE

### Backend

| File                                  | Purpose                                   |
| ------------------------------------- | ----------------------------------------- |
| `helpers/notificationDataBuilders.js` | 🆕 **Centralized builders** (3 functions) |
| `services/notificationService.js`     | Core notification engine                  |
| `services/yeuCau.service.js`          | YeuCau triggers (4 calls)                 |
| `services/yeuCauStateMachine.js`      | State machine (15 transitions)            |
| `services/congViec.service.js`        | CongViec triggers (9 calls)               |
| `controllers/kpi.controller.js`       | KPI triggers (6 calls)                    |
| `seeds/notificationTypes.seed.js`     | Type definitions (44 types)               |
| `seeds/notificationTemplates.seed.js` | Template definitions (54 templates)       |

### Frontend

| File                               | Purpose                     |
| ---------------------------------- | --------------------------- |
| `Notification/NotificationList.js` | Bell dropdown UI            |
| `Notification/NotificationItem.js` | Single notification display |
| `Ticket/yeuCauSlice.js`            | YeuCau Redux thunks         |
| `CongViec/congViecSlice.js`        | CongViec Redux thunks       |
| `KPI/*Slice.js`                    | KPI Redux thunks            |

---

## 🎯 COMMON WORKFLOWS

### Add New Notification Type

1. **Add type definition** in `seeds/notificationTypes.seed.js`
2. **Add template(s)** in `seeds/notificationTemplates.seed.js`
3. **Update builder** (if new field needed) in `notificationDataBuilders.js`
4. **Add service call**:
   ```javascript
   const data = await buildYeuCauNotificationData(yeuCau, context);
   await notificationService.send({ type: "new-type", data });
   ```
5. **Run seed**: `node seeds/index.js`
6. **Audit**: Use AUDIT_PROMPT.md
7. **Test**: User flow → Bell notification → Click URL

### Debug Notification Not Sent

1. Check logs: `[NotificationService]` và `[YeuCauStateMachine]`
2. Verify type exists: `db.notificationtypes.findOne({ code: "type-code" })`
3. Check builder call: Search `buildXxxNotificationData` in service
4. Verify recipients: Check `recipientUserIds` array in notification doc
5. Run audit prompt for the type

### Update Existing Template

1. Edit in `seeds/notificationTemplates.seed.js`
2. Run seed: `node seeds/index.js`
3. Test in dev environment
4. No code changes needed (admin-configurable)

---

## 📊 SYSTEM STATISTICS

| Metric                         | Count                              |
| ------------------------------ | ---------------------------------- |
| **Notification Types**         | 44                                 |
| **Templates**                  | 54                                 |
| **Builder Functions**          | 3                                  |
| **Service Integration Points** | 19 (4 YeuCau + 9 CongViec + 6 KPI) |
| **Total Variables**            | ~74 unique                         |
| **Modules**                    | 3 (YeuCau, CongViec, KPI)          |

---

## 🚀 RECENT CHANGES

### December 25, 2025

- ✅ Refactored `yeuCauStateMachine.js` to use centralized builder
- ✅ Removed 240 lines of manual data building code
- ✅ All 19 service locations now use builders
- ✅ Cleaned up documentation (removed audit files)
- ✅ Updated AUDIT_PROMPT to v3.0

### December 24, 2025

- ✅ Completed 100% notification audit (44 types)
- ✅ Fixed 78+ template/service issues
- ✅ Database templates synchronized

### December 19, 2025

- ✅ Created centralized builders (`notificationDataBuilders.js`)
- ✅ Migrated 18 service locations to use builders
- ✅ Updated seed files with 74 variables

---

## 📖 Reading Order (For New Developers)

1. **Architecture**: Read this README first
2. **Builders Guide**: [CENTRALIZED_BUILDERS_GUIDE.md](CENTRALIZED_BUILDERS_GUIDE.md) - **START HERE** for implementation
3. **Schema**: [SCHEMA_QUICK_REFERENCE.md](SCHEMA_QUICK_REFERENCE.md) - Understand entities
4. **Source Code**: Read `notificationDataBuilders.js` - See actual implementation
5. **Audit**: [AUDIT_PROMPT.md](AUDIT_PROMPT.md) - How to verify notifications
6. **Seed Files**: Browse types/templates to see examples

---

## 🔗 External Resources

- MongoDB Docs: Notification, NotificationType, NotificationTemplate models
- Socket.IO: Real-time notification delivery
- React Hook: `useNotifications()` - Frontend notification state

---

_Documentation maintained by the development team. Last audit: December 25, 2025._

## 🎯 Quick Links

**Current Phase:** Day 3 - Backend APIs (as of Dec 23, 2025)  
**Server Status:** ✅ Running (port 8000, Phase 0 fixes applied)  
**Next Steps:** Implement CRUD endpoints for NotificationType/NotificationTemplate
