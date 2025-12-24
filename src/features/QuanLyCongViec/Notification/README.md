# 📁 Notification System Documentation

**Last Updated:** December 23, 2025

Thư mục này chứa tài liệu tham khảo cho hệ thống Notification Refactor (Admin-Configurable System).

---

## 📋 Tài Liệu Chính

### 1. ⭐ [NOTIFICATION_REFACTOR_IMPLEMENTATION_PLAN.md](NOTIFICATION_REFACTOR_IMPLEMENTATION_PLAN.md)

**Mục đích:** Kế hoạch triển khai chi tiết cho notification refactor  
**Nội dung:**

- Kiến trúc hệ thống mới (Admin-Configurable)
- Phase 0 Error Fix Session (✅ Completed Dec 19, 2025)
- Trigger mapping table (43 triggers → NotificationType)
- Variable definitions per type
- Timeline triển khai 5-6 ngày (Day 1-7)
- Migration examples (before/after code)

**Khi nào dùng:** Tài liệu chính cho toàn bộ dự án refactor

---

## 🔍 AI-Powered Audit Toolkit (TichHop/)

**Thư mục [TichHop/](TichHop/)** chứa bộ công cụ để AI audit notifications một cách tự động.

### Cách sử dụng:

```
1. Copy prompt từ 00_AUDIT_PROMPT.md
2. Điền type code (VD: "kpi-duyet-danh-gia")
3. Paste vào AI chat
4. AI tự động audit và trả về report
5. Update status trong 04_TEMPLATE_CHECKLIST.md
```

### Files trong TichHop/:

| File                                                         | Mô tả                                 |
| ------------------------------------------------------------ | ------------------------------------- |
| [00_AUDIT_PROMPT.md](TichHop/00_AUDIT_PROMPT.md)             | ⭐ Prompt chính - copy & paste        |
| [01_MODULE_KPI.md](TichHop/01_MODULE_KPI.md)                 | Context cho 7 KPI notifications       |
| [02_MODULE_CONGVIEC.md](TichHop/02_MODULE_CONGVIEC.md)       | Context cho 19 CongViec notifications |
| [03_MODULE_YEUCAU.md](TichHop/03_MODULE_YEUCAU.md)           | Context cho 17 YeuCau notifications   |
| [04_TEMPLATE_CHECKLIST.md](TichHop/04_TEMPLATE_CHECKLIST.md) | 📊 Master checklist (45 types)        |
| [05_COMMON_PATTERNS.md](TichHop/05_COMMON_PATTERNS.md)       | Code patterns reference               |

---

## 📊 Reference & Status Tracking

### 2. [KIEM_TRA_COVERAGE_TEMPLATE_THONG_BAO.md](KIEM_TRA_COVERAGE_TEMPLATE_THONG_BAO.md)

**Mục đích:** Living status document - template implementation progress  
**Nội dung:**

- Implementation status tables (53 templates across 4 domains)
- Type code mismatch findings (5 issues documented)
- Coverage summary per feature

**Khi nào dùng:** Check implementation status, identify gaps/mismatches

### 3. [SCHEMA_QUICK_REFERENCE.md](SCHEMA_QUICK_REFERENCE.md)

**Mục đích:** Schema field catalog cho WorkManagement entities  
**Nội dung:**

- Exact field names, types, relationships
- Standard populate patterns
- Common pitfalls (LoaiYeuCauID vs DanhMucYeuCauID)
- User vs NhanVien distinction

**Khi nào dùng:** Verify schema field names khi build notification data

---

## 🗑️ Deleted Files (Dec 23, 2025)

**Removed obsolete/duplicate documentation:**

- `NOTIFICATION_SPEC.md` - Planning doc từ Nov 2025 (superseded by implementation plan)
- `NOTIFICATION_SYSTEM_IMPLEMENTATION_PLAN.md` - Old version (Dec 17, 2024 → Dec 19, 2025 main plan)
- `REFACTOR_CONTEXT_SUMMARY.md` - Overlapping content with main plan
- `AI_AUDIT_TEMPLATE_PROMPT.md` - Audit guide cho hệ thống cũ (obsolete sau refactor)
- `QUICK_AUDIT_CHECKLIST.md` - Fast checklist cho hệ thống cũ (obsolete sau refactor)

---

## 📖 Reading Order (For New Team Members)

1. **Start:** [NOTIFICATION_REFACTOR_IMPLEMENTATION_PLAN.md](NOTIFICATION_REFACTOR_IMPLEMENTATION_PLAN.md) - Hiểu big picture
2. **Reference:** [SCHEMA_QUICK_REFERENCE.md](SCHEMA_QUICK_REFERENCE.md) - Verify field names khi code
3. **Track:** [KIEM_TRA_COVERAGE_TEMPLATE_THONG_BAO.md](KIEM_TRA_COVERAGE_TEMPLATE_THONG_BAO.md) - Check implementation status
4. **Audit:** [TichHop/00_AUDIT_PROMPT.md](TichHop/00_AUDIT_PROMPT.md) - Audit từng template

---

## 🎯 Quick Links

**Current Phase:** Day 3 - Backend APIs (as of Dec 23, 2025)  
**Server Status:** ✅ Running (port 8000, Phase 0 fixes applied)  
**Next Steps:** Implement CRUD endpoints for NotificationType/NotificationTemplate
