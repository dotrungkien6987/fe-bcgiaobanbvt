# Task 2.7: Completed Tasks Archive Page - Trang Lịch Sử Công Việc Hoàn Thành

**Created:** 2026-01-11  
**Priority:** P1 (High)  
**Estimated Time:** 8-14 hours (MVP: 8h, Full: 14h)  
**Status:** 🔴 Not Started

---

## 📋 Overview

Tạo trang archive riêng để xem lịch sử công việc đã hoàn thành với 2 perspectives:

- **Tab 1:** Việc tôi làm xong (Employee view)
- **Tab 2:** Việc nhóm tôi giao hoàn thành (Manager view)

**Problem:** Hiện tại RecentCompletedPreview chỉ hiển thị 10-30 tasks mới nhất, không có cách xem toàn bộ lịch sử và phân tích.

**Solution:** Tạo full-featured archive page với filters, stats, pagination, và export capabilities.

---

## 🎯 Goals & Success Criteria

### Goals

1. ✅ Xem được toàn bộ lịch sử công việc hoàn thành (không giới hạn 30 items)
2. ✅ Phân tích hiệu suất qua stats cards và metrics
3. ✅ Filter nâng cao (date range, assignee, priority, ...)
4. ✅ Export dữ liệu ra Excel để báo cáo
5. ✅ Responsive trên mọi thiết bị

### Success Criteria

- [ ] Page load dưới 2s với 100+ completed tasks
- [ ] Pagination hoạt động mượt mà
- [ ] Date range filter chính xác
- [ ] Export Excel bao gồm đầy đủ thông tin
- [ ] Mobile UX tương đương desktop
- [ ] Stats cards update real-time khi filter

---

## 🏗️ Architecture Design

### Routes

```javascript
/quanlycongviec/lich-su-hoan-thanh              // Default: tab=my-completed
/quanlycongviec/lich-su-hoan-thanh?tab=my-completed
/quanlycongviec/lich-su-hoan-thanh?tab=team-completed
```

### Redux State Structure

```javascript
completedArchive: {
  activeTab: "my-completed" | "team-completed",
  myCompleted: {
    tasks: [],
    total: 0,
    isLoading: false,
    error: null,
    currentPage: 1,
    rowsPerPage: 25,
    filters: {
      search: "",
      NguoiChinhID: "",
      MucDoUuTien: "",
      fromDate: null,
      toDate: null,
      NhiemVuThuongQuyID: "",
      completionStatus: "", // "ON_TIME" | "LATE" | "EARLY"
    }
  },
  teamCompleted: { /* same structure */ },
  stats: {
    my: { total, thisWeek, thisMonth, onTimeRate },
    team: { total, thisWeek, thisMonth, onTimeRate, topPerformer }
  }
}
```

### Backend API Requirements

```
✅ Already exists:
GET /workmanagement/congviec/:nhanvienid/received?TrangThai=HOAN_THANH&page=1&limit=25
GET /workmanagement/congviec/:nhanvienid/assigned?TrangThai=HOAN_THANH&page=1&limit=25

🆕 Need to add:
GET /workmanagement/congviec/stats/completed/:nhanvienid?tab=my&dateRange=...
```

---

## 🎨 UI/UX Design - Visual Mockup

### Desktop Layout (>960px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏠 Quản lý công việc > Lịch sử hoàn thành                          👤 Admin│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📊 LỊCH SỬ CÔNG VIỆC HOÀN THÀNH                                            │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ┌─────────────────────┬─────────────────────┐                             │
│  │  Việc tôi làm xong  │ Việc nhóm tôi giao │  ← TABS                      │
│  └─────────────────────┴─────────────────────┘                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │   📈 Tổng    │ │  📅 Tuần     │ │  📅 Tháng    │ │  ✅ Đúng hạn │      │
│  │              │ │              │ │              │ │              │      │
│  │     245      │ │      12      │ │      48      │ │    87.3%     │      │
│  │   tasks      │ │   tasks      │ │   tasks      │ │              │      │
│  │              │ │              │ │              │ │              │      │
│  │  📊 +15%     │ │  📈 +3 tasks │ │  📉 -5 tasks │ │  🟢 Tốt      │      │
│  │  so tháng    │ │              │ │              │ │              │      │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  🔍 BỘ LỌC                                                [Mở rộng ▼]      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  [🔍 Tìm tiêu đề...]  [Người làm ▼]  [Ưu tiên ▼]  [NVTQ ▼]          │ │
│  │                                                                        │ │
│  │  Quick Filters:                                                       │ │
│  │  [Hôm nay] [Tuần này] [Tháng này] [Quý này] [Năm nay]               │ │
│  │                                                                        │ │
│  │  📅 Từ ngày: [01/01/2026 📆]    Đến ngày: [11/01/2026 📆]           │ │
│  │                                                                        │ │
│  │  Tình trạng: [⚪ Tất cả] [🟢 Đúng hạn] [⚠️ Trễ hạn] [🚀 Sớm hạn]    │ │
│  │                                                                        │ │
│  │                    [🔍 Tìm kiếm]  [↺ Xóa bộ lọc]                     │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  VIEW: [📋 Bảng]  [ ] Timeline  [ ] Biểu đồ     [📥 Export ▼] [🔄 Refresh]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📋 DANH SÁCH CÔNG VIỆC HOÀN THÀNH (245 kết quả)                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │Mã CV │Tiêu đề              │Người làm  │Ngày HT  │Giờ trễ│Ưu tiên │⚙│  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │CV001 │Báo cáo tháng 1      │Nguyễn A   │05/01/26 │-2h ✅ │🔴 Cao  │👁│  │
│  │      │                     │🧑 Avatar   │3 ngày   │       │        │  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │CV002 │Fix bug đăng nhập    │Trần B     │04/01/26 │+3h ⚠️ │🟡 Cao  │👁│  │
│  │      │                     │🧑 Avatar   │4 ngày   │       │        │  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │CV003 │Deploy staging       │Lê C       │03/01/26 │0h ✅  │🟢 BT   │👁│  │
│  │      │                     │🧑 Avatar   │5 ngày   │       │        │  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │CV004 │Code review PR #123  │Mai D      │02/01/26 │-5h 🚀 │🟢 BT   │👁│  │
│  │      │                     │🧑 Avatar   │6 ngày   │       │        │  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │CV005 │Meeting notes        │Hùng E     │01/01/26 │0h ✅  │🔵 Thấp │👁│  │
│  │      │                     │🧑 Avatar   │7 ngày   │       │        │  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Hiển thị 1-25 của 245 kết quả                                        │ │
│  │  [◀] [1] [2] [3] ... [10] [▶]              [25 mục/trang ▼]          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768-960px)

```
┌───────────────────────────────────────────────────┐
│ 🏠 > Lịch sử hoàn thành              [☰] 👤    │
├───────────────────────────────────────────────────┤
│ 📊 LỊCH SỬ CÔNG VIỆC HOÀN THÀNH                  │
│ ═════════════════════════════════════════════════ │
│                                                   │
│ [Việc tôi làm] [Việc team]                       │
│                                                   │
│ ┌──────────────┐ ┌──────────────┐               │
│ │   📈 Tổng    │ │  📅 Tuần     │               │
│ │     245      │ │      12      │               │
│ └──────────────┘ └──────────────┘               │
│ ┌──────────────┐ ┌──────────────┐               │
│ │  📅 Tháng    │ │  ✅ Đúng hạn │               │
│ │      48      │ │    87.3%     │               │
│ └──────────────┘ └──────────────┘               │
│                                                   │
│ [🔍 Bộ lọc] [📥 Export]                          │
│                                                   │
│ ┌───────────────────────────────────────────────┐ │
│ │CV001 │Báo cáo tháng 1    │05/01 │-2h✅│👁   │ │
│ │CV002 │Fix bug login      │04/01 │+3h⚠️│👁   │ │
│ │CV003 │Deploy staging     │03/01 │0h✅ │👁   │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ [◀ 1 2 3 ... 10 ▶]                               │
└───────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────────────────────────┐
│ [☰] Lịch sử hoàn thành    [🔍][👤]│
├─────────────────────────────────────┤
│ [Việc tôi làm] [Việc team]         │
├─────────────────────────────────────┤
│ 📊 Tổng: 245  |  📅 Tuần: 12       │
│ ✅ Đúng hạn: 87.3% 🟢              │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 05/01/26 - CV001             │ │
│ │ ─────────────────────────────── │ │
│ │ Báo cáo tháng 1                 │ │
│ │                                 │ │
│ │ 🧑 Nguyễn A                     │ │
│ │ 🔴 Ưu tiên: Cao                 │ │
│ │ ✅ Hoàn thành sớm -2h           │ │
│ │                                 │ │
│ │ [👁️ Xem]                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 04/01/26 - CV002             │ │
│ │ ─────────────────────────────── │ │
│ │ Fix bug đăng nhập               │ │
│ │                                 │ │
│ │ 🧑 Trần B                       │ │
│ │ 🟡 Ưu tiên: Cao                 │ │
│ │ ⚠️ Hoàn thành trễ +3h           │ │
│ │                                 │ │
│ │ [👁️ Xem]                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Tải thêm...]                │
│                                     │
│                                     │
│ [🔍]  ← Floating Action Button     │
└─────────────────────────────────────┘
     ↑
  Filter Drawer (Bottom sheet)
```

### Export Menu Dropdown

```
┌──────────────────────────────┐
│ 📥 Export                   │
├──────────────────────────────┤
│ 📊 Export Excel (.xlsx)     │
│ 📄 Export PDF (Soon)        │
│ 🖨️ In ấn (Soon)             │
├──────────────────────────────┤
│ ⚙️ Tùy chọn xuất:           │
│   ☑️ Bao gồm stats          │
│   ☑️ Bao gồm filters        │
│   ☐ Chỉ trang hiện tại      │
│                              │
│ [Xuất file]  [Hủy]          │
└──────────────────────────────┘
```

### Date Range Picker Component

```
┌────────────────────────────────────────┐
│ 📅 Chọn khoảng thời gian             │
├────────────────────────────────────────┤
│ Quick Presets:                        │
│ [Hôm nay][Tuần][Tháng][Quý][Năm]     │
├────────────────────────────────────────┤
│ Từ ngày:  [📆 01/01/2026]            │
│ Đến ngày: [📆 11/01/2026]            │
├────────────────────────────────────────┤
│          [Áp dụng]  [Hủy]             │
└────────────────────────────────────────┘
```

### Stats Card Detail

```
┌──────────────────────────────┐
│   📈 TỔNG HOÀN THÀNH         │
│                              │
│        245                   │
│      tasks                   │
│                              │
│   📊 +15% so tháng trước     │
│   📈 Xu hướng tăng           │
│                              │
│   [Chi tiết ›]               │
└──────────────────────────────┘
```

### Color Coding

```
Priority Colors:
🔴 Cao (KHAN_CAC) - Red (#f44336)
🟡 Cao (CAO) - Orange (#ff9800)
🟢 Bình thường - Blue (#2196f3)
🔵 Thấp - Grey (#9e9e9e)

Completion Status:
✅ Đúng hạn (0h) - Green
🚀 Sớm hạn (<0h) - Cyan
⚠️ Trễ hạn (>0h) - Red

Stats Indicators:
🟢 Tốt (>80%)
🟡 Trung bình (60-80%)
🔴 Cần cải thiện (<60%)
```

---

## 📁 File Structure & Changes

### Frontend Files

```
fe-bcgiaobanbvt/
│
├── src/
│   ├── features/
│   │   └── QuanLyCongViec/
│   │       └── CongViec/
│   │           │
│   │           ├── 🆕 CompletedTasksArchivePage.js         (~400 lines)
│   │           │   └── Main archive page component
│   │           │
│   │           ├── components/
│   │           │   ├── 🆕 CompletedStatsCards.js           (~150 lines)
│   │           │   │   └── 4 stats cards with trends
│   │           │   │
│   │           │   ├── 🆕 ExportMenu.js                    (~80 lines)
│   │           │   │   └── Export dropdown menu
│   │           │   │
│   │           │   ├── 🔄 CongViecFilterPanel.js          (modify +50 lines)
│   │           │   │   └── Add date range picker
│   │           │   │   └── Add completion status filter
│   │           │   │
│   │           │   ├── ✅ CongViecTable.js                 (reuse)
│   │           │   ├── ✅ CongViecDetailDialog.js          (reuse)
│   │           │   ├── ✅ EmployeeAvatar.js                (reuse)
│   │           │   └── ✅ EmployeeAutocomplete.js          (reuse)
│   │           │
│   │           ├── hooks/
│   │           │   └── 🆕 useCompletedArchiveUrlParams.js  (~80 lines)
│   │           │       └── URL sync for filters & pagination
│   │           │
│   │           ├── utils/
│   │           │   └── 🆕 exportCompletedTasks.js          (~100 lines)
│   │           │       └── Excel export logic (xlsx)
│   │           │
│   │           └── 🔄 congViecSlice.js                    (modify +150 lines)
│   │               └── Add completedArchive state
│   │               └── Add reducers (6 new)
│   │               └── Add thunks (2 new)
│   │
│   ├── routes/
│   │   └── 🔄 index.js                                    (modify +3 lines)
│   │       └── Add /lich-su-hoan-thanh route
│   │
│   ├── menu-items/
│   │   └── 🔄 quanlycongviec.js                           (modify +7 lines)
│   │       └── Add menu item with HistoryIcon
│   │
│   └── app/
│       └── ✅ apiService.js                                (already fixed)
│
├── docs/
│   └── UNIFIED_PLAN_2026/
│       └── 🔄 TASK_2.7_COMPLETED_TASKS_ARCHIVE.md         (this file)
│
└── package.json
    └── 🔄 (add xlsx if not exists)                        (modify +1 line)
```

### Backend Files (Optional)

```
giaobanbv-be/
│
└── modules/
    └── workmanagement/
        ├── controllers/
        │   └── 🆕 congViec.controller.js                  (add +30 lines)
        │       └── exports.getCompletedStats() method
        │           (Optional - can use frontend calculation)
        │
        ├── services/
        │   └── 🔄 congViec.service.js                     (verify existing)
        │       └── Verify date filter support in getReceived/getAssigned
        │
        └── routes/
            └── 🔄 congViec.route.js                       (add +1 line)
                └── GET /stats/completed/:nhanvienid
                    (Optional route)
```

### File Change Summary

| File                                | Status    | Lines Changed            | Priority | Complexity |
| ----------------------------------- | --------- | ------------------------ | -------- | ---------- |
| **CompletedTasksArchivePage.js**    | 🆕 Create | +400                     | P0       | Medium     |
| **CompletedStatsCards.js**          | 🆕 Create | +150                     | P0       | Low        |
| **ExportMenu.js**                   | 🆕 Create | +80                      | P0       | Low        |
| **useCompletedArchiveUrlParams.js** | 🆕 Create | +80                      | P0       | Low        |
| **exportCompletedTasks.js**         | 🆕 Create | +100                     | P0       | Medium     |
| **congViecSlice.js**                | 🔄 Modify | +150                     | P0       | Medium     |
| **CongViecFilterPanel.js**          | 🔄 Modify | +50                      | P0       | Low        |
| **routes/index.js**                 | 🔄 Modify | +3                       | P0       | Low        |
| **menu-items/quanlycongviec.js**    | 🔄 Modify | +7                       | P0       | Low        |
| **package.json**                    | 🔄 Modify | +1                       | P0       | Low        |
| **congViec.controller.js** (BE)     | 🆕 Create | +30                      | P1       | Low        |
| **congViec.route.js** (BE)          | 🔄 Modify | +1                       | P1       | Low        |
| **Total (Frontend)**                |           | **~1021 lines**          |          |            |
| **Total (Backend)**                 |           | **~31 lines** (optional) |          |            |

### Dependencies Check

**Already installed:**

```json
{
  "@mui/material": "^5.x",
  "@mui/x-date-pickers": "^6.x",
  "react": "^18.x",
  "react-redux": "^8.x",
  "react-router-dom": "^6.x",
  "dayjs": "^1.x",
  "react-toastify": "^9.x"
}
```

**Need to install (if missing):**

```json
{
  "xlsx": "^0.18.5" // For Excel export
}
```

**Check command:**

```bash
npm list xlsx
# If not found: npm install xlsx
```

---

## 📊 Token Budget Analysis

### Current Session Token Usage

**Token consumption breakdown:**

```
┌─────────────────────────────────────────────────┐
│  CURRENT SESSION STATISTICS                     │
├─────────────────────────────────────────────────┤
│  Initial Budget:        1,000,000 tokens        │
│  Used so far:             ~80,800 tokens        │
│  Remaining:               919,200 tokens        │
│  Usage Rate:                   8.08%            │
├─────────────────────────────────────────────────┤
│  STATUS: ✅ EXCELLENT (>90% remaining)          │
└─────────────────────────────────────────────────┘
```

### Estimated Token Cost for Task 2.7

**Phase-by-phase estimate:**

| Phase            | Activity                         | Est. Tokens  | Cumulative  |
| ---------------- | -------------------------------- | ------------ | ----------- |
| **Planning**     | Read existing files              | 5,000        | 85,800      |
|                  | Create this plan                 | 8,000        | 93,800      |
|                  | Review & adjust                  | 2,000        | 95,800      |
| **Phase 1**      | Create CompletedTasksArchivePage | 15,000       | 110,800     |
|                  | Modify congViecSlice             | 8,000        | 118,800     |
|                  | Update routes & menu             | 3,000        | 121,800     |
| **Phase 2**      | Create CompletedStatsCards       | 7,000        | 128,800     |
|                  | Stats calculation logic          | 3,000        | 131,800     |
| **Phase 3**      | Extend CongViecFilterPanel       | 6,000        | 137,800     |
|                  | Date range picker integration    | 4,000        | 141,800     |
| **Phase 4**      | Create ExportMenu                | 4,000        | 145,800     |
|                  | Excel export utility             | 7,000        | 152,800     |
|                  | Test export functionality        | 3,000        | 155,800     |
| **Phase 5**      | Mobile responsive updates        | 8,000        | 163,800     |
|                  | Test mobile layout               | 2,000        | 165,800     |
| **Phase 6**      | URL sync hook                    | 5,000        | 170,800     |
|                  | Error handling & edge cases      | 4,000        | 174,800     |
|                  | Testing & fixes                  | 5,000        | 179,800     |
| **Verification** | Code review                      | 3,000        | 182,800     |
|                  | Bug fixes                        | 5,000        | 187,800     |
|                  | Documentation                    | 2,000        | 189,800     |
| **TOTAL**        | **Full implementation**          | **~110,000** | **189,800** |

### Token Budget Projection

```
┌──────────────────────────────────────────────────────────┐
│  BUDGET FORECAST FOR TASK 2.7                            │
├──────────────────────────────────────────────────────────┤
│  Starting balance:           919,200 tokens              │
│  Task 2.7 estimate:         -110,000 tokens              │
│  ───────────────────────────────────────────────────     │
│  Remaining after task:       809,200 tokens (80.9%)      │
│                                                           │
│  Buffer for debugging:       -50,000 tokens              │
│  Final safe balance:         759,200 tokens (75.9%)      │
├──────────────────────────────────────────────────────────┤
│  VERDICT: ✅ SAFE TO PROCEED                             │
│  Sufficient budget for:                                  │
│  - Full MVP implementation                               │
│  - Debugging & iterations (2-3 cycles)                   │
│  - Additional features (P1)                              │
│  - Task 2.8 (Testing & Polish)                           │
└──────────────────────────────────────────────────────────┘
```

### Token Saving Strategies

**If budget becomes tight:**

1. **MVP-first approach** (Save ~30k tokens)
   - Skip Phase 5 (Mobile) initially
   - Skip backend stats API (use frontend calc)
   - Defer export PDF/print features
2. **Reuse existing components** (Save ~20k tokens)

   - Use CongViecTable as-is (no custom archive table)
   - Use existing filter panel with minimal changes
   - Copy logic from MyTasksPage/AssignedTasksPage

3. **Batch operations** (Save ~15k tokens)

   - Use multi_replace_string_in_file for related changes
   - Group similar file creations together
   - Minimize back-and-forth file reads

4. **Defer testing** (Save ~10k tokens)
   - Manual testing instead of automated
   - User acceptance testing phase
   - Document issues for later fix

**Total savings available:** ~75k tokens  
**Minimum implementation:** ~35k tokens (core only)

### Risk Assessment

| Risk                | Probability  | Impact | Mitigation                           |
| ------------------- | ------------ | ------ | ------------------------------------ |
| Token overflow      | Low (5%)     | High   | Use MVP approach, defer P1 features  |
| Implementation bugs | Medium (30%) | Medium | Reserve 50k tokens for debugging     |
| Scope creep         | Medium (40%) | Low    | Strict adherence to MVP deliverables |
| API issues          | Low (10%)    | Medium | Use frontend calculation fallback    |

**Overall Risk:** 🟢 LOW - Task is well within budget limits

---

## 📦 Implementation Plan

### **Phase 1: Core Structure (2.5h)**

#### 1.1. Create Page Component (~1h)

**File:** `src/features/QuanLyCongViec/CongViec/CompletedTasksArchivePage.js`

```javascript
// MVP Structure:
- Container with breadcrumb
- Tab navigation (2 tabs)
- Stats cards section (4 cards)
- Filter panel (expandable)
- Table display
- Pagination controls
- Loading/Error states
```

**Components:**

- CompletedTasksArchivePage (main container, ~400 lines)
- Use existing CongViecTable with mode="archive" prop
- Use existing CongViecFilterPanel with date range extension

#### 1.2. Redux Slice Extension (~1h)

**File:** `src/features/QuanLyCongViec/CongViec/congViecSlice.js`

**Add to state:**

```javascript
// Line ~100 (after recentCompletedAssigned)
completedArchive: {
  activeTab: "my-completed",
  myCompleted: { tasks: [], total: 0, isLoading: false, error: null, currentPage: 1, rowsPerPage: 25, filters: {...} },
  teamCompleted: { tasks: [], total: 0, isLoading: false, error: null, currentPage: 1, rowsPerPage: 25, filters: {...} },
  stats: { my: null, team: null }
},
```

**Add reducers:**

- `setArchiveTab(state, action)` - Switch between my/team
- `setArchiveFilters(state, action)` - Update filters
- `setArchivePage(state, action)` - Pagination
- `getCompletedArchiveSuccess(state, action)` - Load tasks
- `getCompletedStatsSuccess(state, action)` - Load stats

**Add thunks:**

- `getCompletedArchive({ nhanVienId, tab, page, limit, filters })` - Fetch paginated data
- `getCompletedStats({ nhanVienId, tab, dateRange })` - Fetch stats (can reuse existing API or add new)

#### 1.3. Routing & Menu (~30m)

**File:** `src/routes/index.js`

```javascript
<Route path="lich-su-hoan-thanh" element={<CompletedTasksArchivePage />} />
```

**File:** `src/menu-items/quanlycongviec.js`

```javascript
{
  id: "lichsuhoanthanh",
  title: "Lịch sử hoàn thành",
  type: "item",
  url: "/quanlycongviec/lich-su-hoan-thanh",
  icon: HistoryIcon,
}
```

---

### **Phase 2: Stats Cards Component (1.5h)**

#### 2.1. Create CompletedStatsCards Component (~1h)

**File:** `src/features/QuanLyCongViec/CongViec/components/CompletedStatsCards.js`

**Features:**

- 4 cards layout (responsive: 4 cols desktop, 2 cols tablet, 1 col mobile)
- Cards:
  1. Tổng hoàn thành (total completed)
  2. Tuần này (this week)
  3. Tháng này (this month)
  4. Tỷ lệ đúng hạn (on-time rate %)
- Comparison indicators (↑ +15% so với tháng trước)
- Color coding (green: good, red: bad)
- Loading skeleton

**Props:**

```javascript
{
  stats: { total, thisWeek, thisMonth, onTimeRate, comparison },
  loading: boolean,
  error: string
}
```

#### 2.2. Backend Stats API (~30m)

**Option A: Frontend calculation** (Quick, no backend change)

- Calculate from loaded tasks array
- Less accurate if tasks > limit

**Option B: Backend aggregation** (Accurate, requires backend)
**File:** `giaobanbv-be/modules/workmanagement/controllers/congViec.controller.js`

```javascript
// New endpoint: GET /congviec/stats/completed/:nhanvienid
exports.getCompletedStats = async (req, res, next) => {
  const { nhanvienid } = req.params;
  const { tab, fromDate, toDate } = req.query;

  // Aggregate stats from CongViec collection
  // - Total completed count
  // - This week count
  // - This month count
  // - On-time rate (where HoanThanhTreHan === false)
  // - Top performer (if tab=team)

  return sendResponse(res, 200, true, { stats }, null, "OK");
};
```

**Recommendation:** Start with Option A (frontend calc) for MVP, add Option B later if needed.

---

### **Phase 3: Enhanced Filters (1.5h)**

#### 3.1. Extend CongViecFilterPanel (~1h)

**File:** `src/features/QuanLyCongViec/CongViec/components/CongViecFilterPanel.js`

**Add new filter fields:**

```javascript
// Date Range (mui/x-date-pickers)
<DatePicker label="Từ ngày" value={fromDate} onChange={...} />
<DatePicker label="Đến ngày" value={toDate} onChange={...} />

// Completion Status
<FormControl>
  <InputLabel>Tình trạng hoàn thành</InputLabel>
  <Select value={completionStatus}>
    <MenuItem value="">Tất cả</MenuItem>
    <MenuItem value="EARLY">Hoàn thành sớm</MenuItem>
    <MenuItem value="ON_TIME">Đúng hạn</MenuItem>
    <MenuItem value="LATE">Trễ hạn</MenuItem>
  </Select>
</FormControl>

// Quick date presets
<ButtonGroup>
  <Button onClick={() => setPreset("today")}>Hôm nay</Button>
  <Button onClick={() => setPreset("week")}>Tuần này</Button>
  <Button onClick={() => setPreset("month")}>Tháng này</Button>
  <Button onClick={() => setPreset("quarter")}>Quý này</Button>
</ButtonGroup>
```

**Props enhancement:**

```javascript
{
  ...existingProps,
  enableDateRange: true, // ✅ Enable for archive page
  enableCompletionStatus: true, // ✅ New filter
  dateRangePresets: ["today", "week", "month", "quarter", "year"]
}
```

#### 3.2. Backend Filter Support (~30m)

Backend already supports date filters via existing query params.  
**Need to verify:**

- `fromDate` / `toDate` parsing in `getReceived` / `getAssigned` controllers
- `completionStatus` filter mapping to `HoanThanhTreHan` field

**Add to service if missing:**

```javascript
// congViec.service.js
if (filters.completionStatus === "LATE") {
  query.HoanThanhTreHan = true;
} else if (
  filters.completionStatus === "ON_TIME" ||
  filters.completionStatus === "EARLY"
) {
  query.HoanThanhTreHan = false;
}
```

---

### **Phase 4: Export Excel Feature (2h)**

#### 4.1. Create ExportMenu Component (~30m)

**File:** `src/features/QuanLyCongViec/CongViec/components/ExportMenu.js`

**Features:**

```javascript
<Button
  variant="outlined"
  startIcon={<FileDownloadIcon />}
  onClick={handleMenuOpen}
>
  Export
</Button>

<Menu anchorEl={anchorEl} open={open}>
  <MenuItem onClick={handleExportExcel}>
    <DescriptionIcon /> Export Excel (.xlsx)
  </MenuItem>
  <MenuItem onClick={handleExportPDF} disabled>
    <PictureAsPdfIcon /> Export PDF (Coming soon)
  </MenuItem>
  <MenuItem onClick={handlePrint} disabled>
    <PrintIcon /> In (Coming soon)
  </MenuItem>
</Menu>
```

#### 4.2. Excel Export Logic (~1.5h)

**Library:** `xlsx` (already installed if not: `npm install xlsx`)

**File:** `src/features/QuanLyCongViec/CongViec/utils/exportCompletedTasks.js`

**Function:**

```javascript
export function exportCompletedTasksToExcel(tasks, stats, filters) {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Danh sách công việc
  const taskData = tasks.map((task) => ({
    "Mã CV": task.MaCongViec,
    "Tiêu đề": task.TieuDe,
    "Người giao": task.NguoiGiaoProfile?.Ten,
    "Người làm": task.NguoiChinhProfile?.Ten,
    "Ngày bắt đầu": formatDate(task.NgayBatDau),
    "Ngày deadline": formatDate(task.NgayHetHan),
    "Ngày hoàn thành": formatDate(task.NgayHoanThanh),
    "Giờ trễ": task.SoGioTre || 0,
    "Trạng thái trễ": task.HoanThanhTreHan ? "Trễ" : "Đúng hạn",
    "Ưu tiên": task.MucDoUuTien,
    "Nhiệm vụ TQ": task.NhiemVuThuongQuy?.Ten || "",
  }));
  const sheet1 = XLSX.utils.json_to_sheet(taskData);
  XLSX.utils.book_append_sheet(workbook, sheet1, "Danh sách công việc");

  // Sheet 2: Thống kê
  const statsData = [
    ["Chỉ số", "Giá trị"],
    ["Tổng số công việc hoàn thành", stats.total],
    ["Hoàn thành tuần này", stats.thisWeek],
    ["Hoàn thành tháng này", stats.thisMonth],
    ["Tỷ lệ hoàn thành đúng hạn", `${stats.onTimeRate}%`],
  ];
  const sheet2 = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, sheet2, "Thống kê");

  // Export file
  const fileName = `lich-su-hoan-thanh-${formatDate(new Date())}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
```

**Integration:**

```javascript
// In CompletedTasksArchivePage.js
const handleExport = () => {
  exportCompletedTasksToExcel(filteredTasks, stats, filters);
  toast.success("Đã xuất file Excel thành công!");
};
```

---

### **Phase 5: Mobile Responsive (2h)**

#### 5.1. Mobile Layout Adjustments (~1h)

**Breakpoints:**

- Desktop (>960px): Full layout
- Tablet (768-960px): Stats 2 cols, table simplified
- Mobile (<768px): Cards view, stats vertical

**File:** `CompletedTasksArchivePage.js`

```javascript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down("md"));
const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

// Conditional rendering
{
  isMobile ? (
    <CompletedTasksCardView tasks={tasks} />
  ) : (
    <CongViecTable tasks={tasks} mode="archive" />
  );
}
```

#### 5.2. Mobile Filter Drawer (~30m)

**Similar to MyTasksPage/AssignedTasksPage:**

```javascript
<Drawer
  anchor="bottom"
  open={filterDrawerOpen}
  onClose={() => setFilterDrawerOpen(false)}
>
  <CongViecFilterPanel
    filters={filters}
    onFilterChange={handleFilterChange}
    enableDateRange={true}
    enableCompletionStatus={true}
  />
</Drawer>

<Fab
  onClick={() => setFilterDrawerOpen(true)}
  sx={{ position: "fixed", bottom: 16, right: 16 }}
>
  <FilterListIcon />
</Fab>
```

#### 5.3. Mobile Stats Cards (~30m)

**File:** `CompletedStatsCards.js`

```javascript
// Mobile: Vertical stack, 1 column
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={3}>
    <StatCard title="Tổng" value={stats.total} />
  </Grid>
  {/* ... */}
</Grid>
```

---

### **Phase 6: Polish & Testing (2.5h)**

#### 6.1. URL Sync (~30m)

**Sync filters to URL query params:**

```javascript
// useCompletedArchiveUrlParams.js (similar to useTasksUrlParams)
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  setSearchParams({
    tab: activeTab,
    page: currentPage,
    search: filters.search,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    // ... other filters
  });
}, [activeTab, currentPage, filters]);
```

#### 6.2. Error Handling (~30m)

- Empty state when no tasks
- Error boundary for stats loading failure
- Network error retry mechanism
- Date range validation (fromDate < toDate)

#### 6.3. Loading States (~30m)

- Skeleton loaders for stats cards
- Table loading overlay
- Pagination loading indicator
- Filter apply loading button

#### 6.4. Edge Cases (~30m)

- No permission (employee trying to access team tab)
- Date range > 1 year warning
- Export large dataset (>1000 rows) confirmation
- Stale data refresh button

#### 6.5. Testing (~30m)

- [ ] Unit tests for stats calculation
- [ ] Integration test for pagination
- [ ] Manual test: Filter combinations
- [ ] Manual test: Export with different data sizes
- [ ] Manual test: Mobile responsive on real device

---

## 📊 Deliverables

### Frontend Components

1. ✅ CompletedTasksArchivePage.js (~400 lines)
2. ✅ CompletedStatsCards.js (~150 lines)
3. ✅ ExportMenu.js (~80 lines)
4. ✅ DateRangeFilter component extension (~50 lines)
5. ✅ exportCompletedTasks.js utility (~100 lines)
6. ✅ useCompletedArchiveUrlParams.js hook (~80 lines)

### Redux Updates

1. ✅ completedArchive state slice
2. ✅ 6 new reducers
3. ✅ 2 new thunks (getCompletedArchive, getCompletedStats)

### Backend API (Optional)

1. 🔄 GET /congviec/stats/completed/:nhanvienid (if needed)
2. ✅ Verify date filter support in existing APIs

### Routes & Navigation

1. ✅ /quanlycongviec/lich-su-hoan-thanh route
2. ✅ Menu item with HistoryIcon
3. ✅ Breadcrumb integration

### Documentation

1. ✅ Component usage docs
2. ✅ Export function examples
3. ✅ Filter options reference

---

## 🚀 Implementation Sequence

### MVP (Priority 0 - 8 hours)

```
Day 1 (4h):
├─ Phase 1: Core Structure (2.5h)
│  ├─ Page component skeleton
│  ├─ Redux slice extension
│  └─ Routing & menu
└─ Phase 2: Stats Cards (1.5h)
   ├─ CompletedStatsCards component
   └─ Frontend stats calculation

Day 2 (4h):
├─ Phase 3: Enhanced Filters (1.5h)
│  ├─ Date range pickers
│  └─ Completion status filter
├─ Phase 4: Export Excel (2h)
│  ├─ ExportMenu component
│  └─ Excel export logic
└─ Phase 6: Basic Testing (30m)
```

### Full Version (Priority 0+1 - 14 hours)

```
+ Phase 5: Mobile Responsive (2h)
  ├─ Mobile layout adjustments
  ├─ Filter drawer
  └─ Mobile stats cards

+ Phase 6: Full Polish (2h more)
  ├─ Advanced error handling
  ├─ URL sync
  └─ Comprehensive testing

+ Future: Timeline & Chart views (6h)
  ├─ CompletedTimeline component (3h)
  └─ CompletedChartView component (3h)
```

---

## 🎯 Testing Checklist

### Functional Tests

- [ ] Tab switching works correctly
- [ ] Pagination loads correct page
- [ ] Date range filter applies correctly
- [ ] Stats cards show accurate numbers
- [ ] Export Excel generates valid file
- [ ] Empty state displays when no data
- [ ] Error state shows when API fails

### Performance Tests

- [ ] Page loads <2s with 100+ tasks
- [ ] Filter apply response <500ms
- [ ] Export 500 rows <3s
- [ ] Stats calculation <100ms

### UX Tests

- [ ] Mobile: Cards display correctly
- [ ] Mobile: Filter drawer opens smoothly
- [ ] Mobile: Stats cards readable
- [ ] Desktop: Table columns align properly
- [ ] Loading states don't flash (<200ms)

### Integration Tests

- [ ] Navigate from MyTasksPage "Xem tất cả"
- [ ] Navigate from AssignedTasksPage "Xem tất cả"
- [ ] Direct URL access works
- [ ] Browser back button works
- [ ] URL params persist on refresh

---

## 📈 Success Metrics

**KPIs:**

- Page adoption rate: >60% managers access within 1 month
- Export usage: >20% sessions include export
- Filter usage: >80% sessions apply at least 1 filter
- Mobile usage: >30% traffic from mobile devices

**User Feedback:**

- "Dễ tìm lại công việc đã làm" - 4.5/5 rating
- "Xuất báo cáo nhanh chóng" - 4/5 rating
- "Thống kê giúp đánh giá hiệu suất" - 4.5/5 rating

---

## 🔗 Dependencies

**Requires:**

- ✅ Task 2.5 (MyTasksPage) - Component patterns
- ✅ Task 2.6 (AssignedTasksPage) - Manager view patterns
- ✅ CongViecTable component with archive mode
- ✅ CongViecFilterPanel extensible design
- ✅ Backend pagination APIs (already exist)

**Blocks:**

- Task 2.8 (Testing & Polish) - Should include archive page tests
- Task 2.9 (Performance optimization) - Archive page optimization

---

## 💡 Future Enhancements (Post-MVP)

### P1 Features

1. **Timeline View** - Visual timeline of completed tasks
2. **Chart/Analytics View** - Bar/Line/Pie charts for trend analysis
3. **Export PDF** - Professional report generation
4. **Backend Stats API** - More accurate aggregation

### P2 Features

1. **Performance Review Integration** - Rate completed tasks
2. **Completion Certificate** - Auto-generate achievement certificates
3. **Smart Insights** - AI-powered performance suggestions
4. **Recurring Task Analysis** - Pattern detection for routine tasks
5. **Team Comparison** - Compare performance across team members

---

## 🔄 Rollback Plan

If issues arise:

1. Disable route in routes/index.js
2. Hide menu item
3. RecentCompletedPreview continues working as fallback
4. No data loss (read-only page)

---

## 📝 Notes

- **Design consistency:** Follow MyTasksPage/AssignedTasksPage patterns exactly
- **Performance:** Lazy load data on tab switch, not on mount
- **Accessibility:** ARIA labels for all interactive elements
- **i18n ready:** All strings in Vietnamese, structure supports future translation
- **SEO:** Meta tags for page title and description

---

## 👥 Stakeholders

- **Developer:** Implementation & testing
- **Product Owner:** Feature prioritization & acceptance
- **End Users:** Employees (tab 1), Managers (tab 2)
- **QA Team:** Comprehensive testing

---

**Estimated Completion:** 2026-01-13 (2 days for MVP) or 2026-01-15 (4 days for Full)

**Current Status:** 🔴 Ready to start - Awaiting approval
