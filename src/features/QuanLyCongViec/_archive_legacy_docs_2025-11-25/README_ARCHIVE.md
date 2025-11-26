# 📦 Archive: Legacy Documentation (2025-11-25)

## Lý do Archive

Thư mục này chứa **43 files tài liệu cũ** được archive để dọn dẹp workspace và chuẩn bị cho hệ thống tài liệu mới.

**Ngày archive:** 25/11/2025  
**Lý do:** Refactor documentation structure - Quá nhiều file trùng lặp, không có cấu trúc nhất quán

---

## Nội dung Archive

### KPI/ (9 files)

- CLEANUP_SUMMARY.md
- CUSTOMIZATION_GUIDE.md
- DEPLOYMENT_COMPLETE.md
- FRONTEND_CHITIETDIEM_STATUS.md
- IMPLEMENTATION_CHECKLIST.md
- plan_new.md
- REFACTOR_PLAN_KPI_SYSTEM.md
- UI_UPGRADE_SUMMARY.md
- VISUAL_COMPARISON.md
- WORKFLOW.md

**Giữ lại:** README.md, FORMULA.md (chứa business logic quan trọng)

### GiaoNhiemVu/ (16 files)

- CHANGELOG_REMOVE_ALL.md
- CHANGELOG_V2.md
- COPY_FEATURE_CHECKLIST.md
- COPY_FEATURE_DOC.md
- COPY_FEATURE_VISUAL_GUIDE.md
- COPY_IMPLEMENTATION_SUMMARY.md
- IMPLEMENTATION_SUMMARY.md
- intructions_for_this_foder_GiaoNhiemVu.md
- QUICK_REFERENCE.md
- REMOVE_ALL_FEATURE_DOC.md
- SUMMARY.md
- VERIFICATION_CHECKLIST.md
- - các file cũ khác

**Giữ lại:** README.md

### ChuKyDanhGia/ (9 files)

- CHANGELOG_DELETE_VALIDATION.md
- COMPLETION_SUMMARY.md
- DELETE_VALIDATION.md
- DUPLICATE_PREVENTION.md
- FINAL_REPORT.md
- FIX_UNWRAP_ERROR.md
- IMPLEMENTATION_SUMMARY.md
- QUICK_REFERENCE.md
- SUMMARY_REPORT.md

**Giữ lại:** README.md

### CongViec/ (9 files)

- bienban_thongnhat.md
- congviec-step-1.spec.md
- congviec-step-2.spec.md
- flow_congviec.md
- GIAO_VIEC_THIET_KE_TONG_KET.md
- intrucstion_update_CongViecFormDialog.md
- plan_update_flow_new.md
- promt_template_v2.md
- Step-spec.template_v2.md
- STEP2-COMPLETED.md

**Lưu ý:** Thư mục `CongViec/docs/` (15 files) được GIỮ NGUYÊN 100% vì có cấu trúc tốt

---

## Files còn lại sau Archive

```
QuanLyCongViec/
├── CRUD_TEMPLATE.md              ✅ Template generator
├── promt_template_v2.md          ✅ AI prompt template
├── Step-spec.template_v2.md      ✅ Spec template (missing - need to restore)
│
├── KPI/
│   ├── README.md                 ✅ Feature overview
│   └── FORMULA.md                ✅ Business logic
│
├── GiaoNhiemVu/
│   └── README.md                 ✅ Feature overview
│
├── ChuKyDanhGia/
│   └── README.md                 ✅ Feature overview
│
├── CongViec/
│   └── docs/                     ✅ BEST PRACTICE (15 files, fully intact)
│       ├── README.md
│       ├── architecture-overview.md
│       ├── api-spec.md
│       └── ... (12 more comprehensive docs)
│
└── [Other modules...]
```

---

## Cách Truy Cập Tài Liệu Cũ

Nếu cần tham khảo tài liệu cũ:

1. **Tìm kiếm nhanh:**

   ```powershell
   Get-ChildItem -Path "_archive_legacy_docs_2025-11-25" -Recurse -Filter "*.md" | Select-String "keyword"
   ```

2. **Mở file cụ thể:** Dùng VS Code search trong thư mục `_archive_legacy_docs_2025-11-25/`

---

## Chiến Lược Tài Liệu Mới

**Mục tiêu:** Tạo hệ thống tài liệu nhất quán, dễ maintain

**Nguyên tắc:**

1. **Mỗi module 1 README.md** - Overview + quick start
2. **Logic nghiệp vụ** → `BUSINESS_LOGIC_REFERENCE.md` (tập trung)
3. **Quyết định kiến trúc** → `ARCHITECTURE_DECISIONS.md` (decision log)
4. **API docs** → Tách riêng file `API.md`
5. **Không tạo file SUMMARY/FINAL_REPORT** - Merge vào README

**Tham chiếu:** Xem `CongViec/docs/` là mẫu tốt nhất

---

## Lưu ý Quan Trọng

⚠️ **Không xóa thư mục này!** Có thể cần tham chiếu:

- Business logic cũ chưa được document lại
- Lịch sử thay đổi (CHANGELOGs)
- Bug fixes và lessons learned

✅ **Có thể xóa sau 6 tháng** nếu đã hoàn thiện tài liệu mới và verified không còn cần

---

**Người thực hiện:** GitHub Copilot + User  
**Review:** Pending user confirmation
