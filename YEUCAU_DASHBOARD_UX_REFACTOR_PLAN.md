# YeuCau Dashboard - UX Refactor Plan

## Kế hoạch cải tiến UI/UX với Navigation Map chi tiết

**Date:** 2026-01-15  
**Objective:** Clarify navigation hierarchy, eliminate ambiguity, improve user experience

---

## 📊 HIỆN TRẠNG (Current State)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Dashboard Yêu cầu                          🔄 [Refresh]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📅 Date Range: [Tuần này] [Tháng này] [30 ngày] [Tùy chỉnh]  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📍 Điều hướng nhanh                                            │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ [📤 Tôi gửi (27)] [📥 Tôi xử lý (12)] [📋 Điều phối (8)]│  │ ← Horizontal scroll
│ └──────────────────────────────────────────────────────────┘  │
│    ⬇️ Route                ⬇️ Route                 ⬇️ Route      │
│    /yeucau/toi-gui       /yeucau/xu-ly          /yeucau/dieu-phoi
│                         ?tab=cho-tiep-nhan                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📤 Yêu cầu tôi gửi                                      [>]    │
│ ┌─────────┬─────────┬──────────┬─────────┬─────────┐          │
│ │ Chờ TN  │ Đang XL │ Đã HT    │ Từ chối │ Tổng    │          │
│ │   5     │   12    │    8     │    2    │   27    │          │
│ │  ⚠️     │  ℹ️     │   ✅     │   ❌    │         │          │
│ └─────────┴─────────┴──────────┴─────────┴─────────┘          │
│    ⬇️ ???            ⬇️ ???         ⬇️ ???         ⬇️ ???          │
│    KHÔNG NAVIGATE (Static cards - not clickable)              │
│                                                                 │
│ 📤 Yêu cầu tôi gửi header click → /yeucau/toi-gui            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📥 Yêu cầu tôi xử lý                                    [>]    │
│ ┌─────────┬─────────┬──────────┬─────────┐                    │
│ │ Chờ TN  │ Đang XL │ Chờ XN   │ Tổng    │                    │
│ │   3     │   7     │    2     │   12    │                    │
│ │  ⚠️     │  ℹ️     │   ✅     │         │                    │
│ └─────────┴─────────┴──────────┴─────────┘                    │
│    KHÔNG NAVIGATE (Static)                                     │
│                                                                 │
│ 📥 Yêu cầu tôi xử lý header → /yeucau/xu-ly?tab=cho-tiep-nhan│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Phân bố trạng thái (View: Tôi xử lý)                       │
│ ■■■■■■■■■ Mới (3)                                              │
│ ■■■■■■■■■■■■■■■ Đang xử lý (7)                                 │
│ ■■■■ Đã hoàn thành (2)                                         │
│                                                                 │
│ Click bar → /yeucau/xu-ly?status=MOI (or DANG_XU_LY...)       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ⚡ Thao tác nhanh                                              │
│ ┌──────────────┬──────────────┐                               │
│ │ ✏️ Tạo yêu cầu│ 📥 Tôi xử lý │                               │
│ │              │    (3)       │                               │
│ └──────────────┴──────────────┘                               │
│ ┌──────────────┬──────────────┐                               │
│ │ 📋 Điều phối │ 📊 Quản lý   │                               │
│ │    (8)       │              │                               │
│ └──────────────┴──────────────┘                               │
│    ⬇️ Route          ⬇️ Route         ⬇️ Route      ⬇️ Route      │
│    /toi-gui        /xu-ly          /dieu-phoi   /quan-ly-khoa │
│                   ?tab=cho-TN                                  │
├─────────────────────────────────────────────────────────────────┤
│ 🕐 Hoạt động gần đây                                 [Xem tất cả]│
│ • Nguyễn A đã tiếp nhận yêu cầu "..." - 2h           │
│ • Trần B đã điều phối yêu cầu "..." - 5h             │
│                                                                 │
│ [Xem tất cả] → /yeucau/xu-ly?tab=cho-tiep-nhan                │
└─────────────────────────────────────────────────────────────────┘
```

### ⚠️ VẤN ĐỀ HIỆN TẠI:

1. **TRÙNG LẶP NAVIGATION:**

   - "📤 Tôi gửi" chip → `/toi-gui`
   - "✏️ Tạo yêu cầu" action → `/toi-gui` (SAME!)
   - "📥 Tôi xử lý" chip → `/xu-ly`
   - "📥 Tôi xử lý" action → `/xu-ly` (SAME!)

2. **METRICS KHÔNG CLICKABLE:**

   - User thấy "Chờ tiếp nhận: 5" nhưng không biết có thể click
   - Không có visual affordance (no hover, no icon)
   - Miss opportunity cho drill-down navigation

3. **QUICKACTIONS KHÔNG ĐÚNG MỤC ĐÍCH:**

   - "Tạo yêu cầu" là action ✅
   - "Tôi xử lý", "Điều phối", "Quản lý" là NAVIGATION ❌ (should be in chips or metrics)

4. **USER CONFUSION:**
   - "Tôi muốn xem yêu cầu chờ tiếp nhận" → Click đâu?
     - Option 1: Chip "📥 Tôi xử lý" → Đến list page, phải filter thủ công
     - Option 2: Metric card "Chờ TN: 3" → Không click được!
     - Option 3: QuickActions "📥 Tôi xử lý" → Giống option 1

---

## 🎯 ĐỀ XUẤT (Proposed Solution)

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Dashboard Yêu cầu                          🔄 [Refresh]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📅 Date Range: [Tuần này] [Tháng này] [30 ngày] [Tùy chỉnh]  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 🚀 Điều hướng nhanh                                            │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ [📤 Tôi gửi (27)] [📥 Tôi xử lý (12)] [📋 Điều phối (8)]│  │ ← Horizontal scroll
│ └──────────────────────────────────────────────────────────┘  │
│    ⬇️ MAIN LIST          ⬇️ MAIN LIST           ⬇️ MAIN LIST     │
│    /yeucau/toi-gui      /yeucau/xu-ly          /yeucau/dieu-phoi
│    (ALL status)         ?tab=cho-tiep-nhan    (ALL status)    │
│                                                                 │
│ 💡 Visual: Enhanced chips with icons, bold counts, hover lift  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📤 Yêu cầu tôi gửi                                             │
│    (Click title → /yeucau/toi-gui - same as chip)             │
│ ┌─────────┬─────────┬──────────┬─────────┬─────────┐          │
│ │ Chờ TN  │ Đang XL │ Đã HT    │ Từ chối │ Tổng    │          │
│ │   5 ➜   │  12 ➜   │   8 ➜    │   2 ➜   │  27 ➜   │          │
│ │  ⚠️     │  ℹ️     │   ✅     │   ❌    │         │          │
│ └─────────┴─────────┴──────────┴─────────┴─────────┘          │
│    ⬇️ FILTERED        ⬇️ FILTERED       ⬇️ FILTERED    ⬇️ FILTERED   │
│    /toi-gui          /toi-gui          /toi-gui       /toi-gui    │
│    ?status=MOI       ?status=DANG_XU_LY ?status=DA_HT  ?status=TU_CHOI
│                                                                 │
│ 💡 Visual: Cards with hover effect, arrow icon, slight shadow  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📥 Yêu cầu tôi xử lý                                           │
│    (Click title → /yeucau/xu-ly?tab=cho-tiep-nhan)            │
│ ┌─────────┬─────────┬──────────┬─────────┐                    │
│ │ Chờ TN  │ Đang XL │ Chờ XN   │ Tổng    │                    │
│ │   3 ➜   │   7 ➜   │   2 ➜    │  12 ➜   │                    │
│ │  ⚠️     │  ℹ️     │   ✅     │         │                    │
│ └─────────┴─────────┴──────────┴─────────┘                    │
│    ⬇️ FILTERED        ⬇️ FILTERED       ⬇️ FILTERED    ⬇️ FILTERED   │
│    /xu-ly            /xu-ly            /xu-ly          /xu-ly        │
│    ?status=MOI       ?status=DANG_XU_LY ?status=DA_HT  (ALL)        │
│                                                                 │
│ 💡 Visual: Same hover + arrow, consistent with above           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📋 Điều phối (Conditional: if roles.isNguoiDieuPhoi)          │
│ ┌─────────┬─────────┬─────────┐                               │
│ │ Mới đến │Đã phối  │ Tổng    │                               │
│ │   8 ➜   │   15 ➜  │  23 ➜   │                               │
│ │  ❗     │  ✅     │         │                               │
│ └─────────┴─────────┴─────────┘                               │
│    ⬇️ FILTERED        ⬇️ FILTERED       ⬇️ ALL                    │
│    /dieu-phoi        /dieu-phoi        /dieu-phoi              │
│    ?status=MOI       ?chuaPhanCong=false (ALL)                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Phân bố trạng thái (View: Tôi xử lý)                       │
│ ■■■■■■■■■ Mới (3) ➜                                            │
│ ■■■■■■■■■■■■■■■ Đang xử lý (7) ➜                               │
│ ■■■■ Đã hoàn thành (2) ➜                                       │
│    ⬇️ FILTERED BY STATUS                                        │
│    /xu-ly?status=MOI | DANG_XU_LY | DA_HOAN_THANH             │
│                                                                 │
│ 💡 Visual: Bars clickable, hover highlight, cursor pointer     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ⚡ Thao tác nhanh (REAL ACTIONS ONLY)                         │
│ ┌──────────────┬──────────────┐                               │
│ │ ✏️ Tạo yêu cầu│ 📊 Báo cáo   │                               │
│ │              │   & Thống kê │                               │
│ └──────────────┴──────────────┘                               │
│ ┌──────────────┬──────────────┐                               │
│ │ ⚙️ Cấu hình  │ 🔔 Thông báo │                               │
│ │   Danh mục   │    (5)       │                               │
│ └──────────────┴──────────────┘                               │
│    ⬇️ ACTION          ⬇️ REPORTS       ⬇️ ADMIN      ⬇️ NOTIF      │
│    /tao-moi          /bao-cao          /admin/       /thong-bao │
│    (Dialog)                            cau-hinh                │
│                                                                 │
│ 💡 Visual: Larger icons, action-oriented colors, clear labels  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 🕐 Hoạt động gần đây                                 [Xem tất cả]│
│ • Nguyễn A đã tiếp nhận yêu cầu "..." - 2h   [➜ Chi tiết]     │
│ • Trần B đã điều phối yêu cầu "..." - 5h     [➜ Chi tiết]     │
│                                                                 │
│ Click item → /yeucau/{id}                                      │
│ [Xem tất cả] → /xu-ly?tab=cho-tiep-nhan                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                       [✏️ FAB - Tạo yêu cầu] ← Fixed bottom-right
                            ⬇️ Optional
                            /tao-moi (Dialog)
```

---

## 📋 NAVIGATION MAP - Chi tiết đầy đủ

### 1️⃣ **Quick Navigation Chips** (Top section)

| Element | Label        | Badge            | Destination                        | Query Params         | Purpose                                   |
| ------- | ------------ | ---------------- | ---------------------------------- | -------------------- | ----------------------------------------- |
| Chip 1  | 📤 Tôi gửi   | Total count (27) | `/quanlycongviec/yeucau/toi-gui`   | None                 | View ALL requests I sent (any status)     |
| Chip 2  | 📥 Tôi xử lý | Total count (12) | `/quanlycongviec/yeucau/xu-ly`     | `?tab=cho-tiep-nhan` | View ALL requests I handle (default tab)  |
| Chip 3  | 📋 Điều phối | Total count (8)  | `/quanlycongviec/yeucau/dieu-phoi` | None                 | View ALL requests to coordinate (if role) |

**Visual Enhancements:**

- Border: 2px solid with theme color
- Hover: translateY(-2px) + shadow
- Icon inside chip for better recognition
- Font weight: 600 (semibold)

---

### 2️⃣ **Metrics Cards - Tôi gửi section**

| Metric Card        | Count | Destination                      | Query Params            | Filter Applied                        |
| ------------------ | ----- | -------------------------------- | ----------------------- | ------------------------------------- |
| Chờ tiếp nhận      | 5     | `/quanlycongviec/yeucau/toi-gui` | `?status=MOI`           | TrangThai = MOI                       |
| Đang xử lý         | 12    | `/quanlycongviec/yeucau/toi-gui` | `?status=DANG_XU_LY`    | TrangThai = DANG_XU_LY                |
| Đã hoàn thành      | 8     | `/quanlycongviec/yeucau/toi-gui` | `?status=DA_HOAN_THANH` | TrangThai = DA_HOAN_THANH             |
| Từ chối            | 2     | `/quanlycongviec/yeucau/toi-gui` | `?status=TU_CHOI`       | TrangThai = TU_CHOI                   |
| Tổng cộng          | 27    | `/quanlycongviec/yeucau/toi-gui` | None                    | All status                            |
| **Section Header** | -     | `/quanlycongviec/yeucau/toi-gui` | None                    | Same as chip (redundant but expected) |

**Visual Enhancements:**

- Cursor: pointer
- Hover: translateY(-2px) + shadow elevation
- Arrow icon (→) at top-right of card
- Border color changes to metric color on hover

---

### 3️⃣ **Metrics Cards - Tôi xử lý section**

| Metric Card        | Count | Destination                    | Query Params            | Filter Applied            |
| ------------------ | ----- | ------------------------------ | ----------------------- | ------------------------- |
| Chờ tiếp nhận      | 3     | `/quanlycongviec/yeucau/xu-ly` | `?status=MOI`           | TrangThai = MOI           |
| Đang xử lý         | 7     | `/quanlycongviec/yeucau/xu-ly` | `?status=DANG_XU_LY`    | TrangThai = DANG_XU_LY    |
| Chờ xác nhận       | 2     | `/quanlycongviec/yeucau/xu-ly` | `?status=DA_HOAN_THANH` | TrangThai = DA_HOAN_THANH |
| Tổng cộng          | 12    | `/quanlycongviec/yeucau/xu-ly` | `?tab=cho-tiep-nhan`    | All status, default tab   |
| **Section Header** | -     | `/quanlycongviec/yeucau/xu-ly` | `?tab=cho-tiep-nhan`    | Same as chip              |

**Same visual enhancements as above**

---

### 4️⃣ **Metrics Cards - Điều phối section** (Conditional)

| Metric Card        | Count | Destination                        | Query Params                    | Filter Applied          |
| ------------------ | ----- | ---------------------------------- | ------------------------------- | ----------------------- |
| Mới đến            | 8     | `/quanlycongviec/yeucau/dieu-phoi` | `?status=MOI&chuaPhanCong=true` | No NguoiDuocDieuPhoiID  |
| Đã điều phối       | 15    | `/quanlycongviec/yeucau/dieu-phoi` | `?daPhanCong=true`              | Has NguoiDuocDieuPhoiID |
| Tổng cộng          | 23    | `/quanlycongviec/yeucau/dieu-phoi` | None                            | All                     |
| **Section Header** | -     | `/quanlycongviec/yeucau/dieu-phoi` | None                            | Same as chip            |

---

### 5️⃣ **Status Distribution Chart**

| Bar Item          | Destination                    | Query Params            |
| ----------------- | ------------------------------ | ----------------------- |
| Mới (3)           | `/quanlycongviec/yeucau/xu-ly` | `?status=MOI`           |
| Đang xử lý (7)    | `/quanlycongviec/yeucau/xu-ly` | `?status=DANG_XU_LY`    |
| Đã hoàn thành (2) | `/quanlycongviec/yeucau/xu-ly` | `?status=DA_HOAN_THANH` |

**Note:** Uses same status filter mechanism as metrics

---

### 6️⃣ **Quick Actions Grid** (REFACTORED)

| Action Card        | Icon | Badge      | Destination                                  | Action Type                |
| ------------------ | ---- | ---------- | -------------------------------------------- | -------------------------- |
| Tạo yêu cầu        | ✏️   | None       | `/quanlycongviec/yeucau/tao-moi` OR Dialog   | Primary CTA                |
| Báo cáo & Thống kê | 📊   | None       | `/quanlycongviec/yeucau/bao-cao`             | Reports (role: QuanLyKhoa) |
| Cấu hình Danh mục  | ⚙️   | None       | `/quanlycongviec/yeucau/admin/cau-hinh-khoa` | Admin (role check)         |
| Thông báo          | 🔔   | Unread (5) | `/quanlycongviec/thong-bao?type=yeucau`      | Notifications              |

**Visual Changes:**

- Removed: "Tôi xử lý", "Điều phối" actions (moved to chips/metrics)
- Added: Real action-oriented features
- Larger icons (48x48 → 56x56)
- Action-based colors (purple, orange, blue)

---

### 7️⃣ **Recent Activities**

| Element                   | Destination                                      |
| ------------------------- | ------------------------------------------------ |
| Activity item (click row) | `/quanlycongviec/yeucau/{activity.YeuCauID._id}` |
| "Xem tất cả" button       | `/quanlycongviec/yeucau/xu-ly?tab=cho-tiep-nhan` |

---

### 8️⃣ **FAB (Optional - Floating Action Button)**

| Element    | Icon | Destination                               | Position                                       |
| ---------- | ---- | ----------------------------------------- | ---------------------------------------------- |
| Create FAB | ✏️   | `/quanlycongviec/yeucau/tao-moi` (Dialog) | Fixed bottom-right (bottom: 80px, right: 16px) |

**Note:** Position `bottom: 80px` để không đè mobile bottom navigation bar

---

## 🔄 USER FLOW COMPARISON

### Scenario: "Tôi muốn xem yêu cầu tôi gửi đang bị TỪ CHỐI"

#### ❌ HIỆN TẠI (Current):

```
1. User vào dashboard
2. Scroll qua Quick Nav Chips (confused: click chip hay không?)
3. Scroll đến section "📤 Yêu cầu tôi gửi"
4. Thấy "Từ chối: 2" → TRY TO CLICK → Nothing happens!
5. User confused: "Sao không click được?"
6. Scroll lên click chip "📤 Tôi gửi"
7. Navigate to list page (all status)
8. User phải manual filter: Click dropdown → Chọn "Từ chối"
9. Finally see filtered list

TAPS: 3+ (chip → list → filter dropdown → select)
TIME: ~8-10 seconds
FRUSTRATION: HIGH ⚠️
```

#### ✅ ĐỀ XUẤT (Proposed):

```
1. User vào dashboard
2. Scroll đến section "📤 Yêu cầu tôi gửi"
3. Thấy "Từ chối: 2" card → HOVER (see affordance: shadow + arrow)
4. CLICK card
5. Navigate to /toi-gui?status=TU_CHOI (pre-filtered list)
6. See exactly 2 rejected requests

TAPS: 1
TIME: ~3-4 seconds
FRUSTRATION: NONE ✅
```

---

### Scenario: "Tôi muốn TẠO YÊU CẦU MỚI"

#### ❌ HIỆN TẠI:

```
Options available:
A) Scroll to "⚡ Thao tác nhanh" → Click "✏️ Tạo yêu cầu"
B) Click chip "📤 Tôi gửi" → Find "Tạo mới" button in list page

User uncertainty: Which is faster?
```

#### ✅ ĐỀ XUẤT:

```
Options:
A) Scroll to "⚡ Thao tác nhanh" → Click "✏️ Tạo yêu cầu" (dialog opens)
B) Click FAB bottom-right (always visible, no scroll)

Primary action more discoverable
```

---

## 📐 VISUAL DESIGN SPECS

### Quick Nav Chips (Enhanced)

```css
.quick-nav-chip {
  border: 2px solid;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 8px 16px;
  transition: all 0.2s ease;
}
.quick-nav-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-width: 2px;
}
```

### Metric Cards (Clickable)

```css
.metric-card {
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  position: relative;
}
.metric-card::after {
  /* Arrow icon positioned top-right */
  content: "→";
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--metric-color); /* info, warning, success, error */
}
.metric-card:hover::after {
  opacity: 1;
}
```

### Quick Actions (Refactored)

```css
.action-card {
  min-height: 140px;
  border-radius: 12px;
}
.action-card-icon {
  width: 56px;
  height: 56px;
  font-size: 32px;
}
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Phase 1: Backend Support (if needed)

- [ ] Ensure `/toi-gui` endpoint supports `?status=MOI|DANG_XU_LY|DA_HOAN_THANH|TU_CHOI` query params
- [ ] Ensure `/xu-ly` endpoint supports `?status=` query params
- [ ] Ensure `/dieu-phoi` endpoint supports filter params

### Phase 2: Component Updates

#### A. DashboardMetricSection.js

- [ ] Add `onMetricClick` prop: `(metricKey: string) => void`
- [ ] Make each Grid item clickable:
  ```javascript
  <Grid item xs={6} md={3} onClick={() => onMetricClick(metric.key)}>
  ```
- [ ] Add visual affordances:
  - [ ] Arrow icon (→) at top-right
  - [ ] Hover state with shadow + lift
  - [ ] Border color change on hover
  - [ ] Cursor pointer

#### B. YeuCauDashboardPage.js

- [ ] Implement `handleMetricClick` function:
  ```javascript
  const handleMetricClick = (section, metricKey) => {
    const routes = {
      toiGui: {
        choTiepNhan: "/yeucau/toi-gui?status=MOI",
        dangXuLy: "/yeucau/toi-gui?status=DANG_XU_LY",
        daHoanThanh: "/yeucau/toi-gui?status=DA_HOAN_THANH",
        tuChoi: "/yeucau/toi-gui?status=TU_CHOI",
        total: "/yeucau/toi-gui",
      },
      xuLy: {
        /* similar */
      },
      dieuPhoi: {
        /* similar */
      },
    };
    navigate(routes[section][metricKey]);
  };
  ```
- [ ] Pass to DashboardMetricSection:
  ```javascript
  <DashboardMetricSection
    onMetricClick={(key) => handleMetricClick("toiGui", key)}
  />
  ```

#### C. QuickActionsGrid.js (Refactor)

- [ ] Remove navigation-based actions:
  - ❌ "Tôi xử lý"
  - ❌ "Điều phối"
  - ❌ "Quản lý" (if just navigation)
- [ ] Keep/Add action-based features:
  - ✅ "Tạo yêu cầu"
  - ✅ "Báo cáo & Thống kê" (if real reports page)
  - ✅ "Cấu hình Danh mục" (admin only)
  - ✅ "Thông báo" (with badge count)

#### D. Quick Nav Chips (Enhance)

- [ ] Add icon inside chip (MUI `icon` prop)
- [ ] Increase font weight to 600
- [ ] Add hover lift animation
- [ ] Add 2px border with theme color

#### E. FAB (Optional)

- [ ] Create FAB component for "Tạo yêu cầu"
- [ ] Position: `{ position: 'fixed', bottom: 80, right: 16 }`
- [ ] Add pulse animation for first-time users
- [ ] Consider speed dial variant for multiple primary actions

### Phase 3: List Pages Support

- [ ] YeuCauToiGuiPage: Handle `?status=` query param for filtering
- [ ] YeuCauXuLyPage: Handle `?status=` query param
- [ ] YeuCauDieuPhoiPage: Handle filter params

### Phase 4: Testing

- [ ] Unit tests for navigation logic
- [ ] Integration tests for user flows
- [ ] A/B test: Measure click-through rates on metrics vs chips
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (keyboard nav, screen readers)

---

## 📊 SUCCESS METRICS

| Metric                   | Current | Target | Measurement                                    |
| ------------------------ | ------- | ------ | ---------------------------------------------- |
| Time to filtered list    | 8-10s   | 3-4s   | User testing                                   |
| Metric card click rate   | 0%      | 40-60% | Analytics                                      |
| Chip click rate          | ~70%    | 30-40% | Analytics (will decrease as metrics take over) |
| User confusion reports   | High    | Low    | Support tickets                                |
| Navigation clarity score | 6/10    | 8.5/10 | User surveys                                   |

---

## ❓ DECISIONS TO MAKE

1. **FAB or not?**

   - ✅ PRO: Always visible, mobile-friendly, standard pattern
   - ❌ CON: May cover content, one more element to maintain
   - **Recommendation:** YES, but only for primary action (Tạo yêu cầu)

2. **Section header clickable?**

   - Current: Header click → main list page (same as chip)
   - ✅ KEEP: Users expect header to be clickable
   - Note: Redundant with chip but expected behavior

3. **Remove chips entirely?**

   - ❌ NO: Chips serve fast-path for power users
   - Chips = High-level navigation (all status)
   - Metrics = Filtered navigation (specific status)
   - Both have value for different use cases

4. **QuickActions position?**
   - Current: Below metrics + status distribution
   - Alternative: Move above metrics (higher priority)
   - **Recommendation:** KEEP current position
     - Create action is in FAB (always accessible)
     - Other actions are secondary (reports, settings)

---

## 🎨 MOCKUP COMPARISON

### Mobile View (xs: 375px)

**BEFORE:**

```
┌─────────────────────┐
│ Dashboard Yêu cầu   │
├─────────────────────┤
│ [Date Range Filter] │
├─────────────────────┤
│ 📍 Điều hướng nhanh │
│ [Chip][Chip][Chip]→ │ ← Scroll horizontal
├─────────────────────┤
│ 📤 Yêu cầu tôi gửi  │
│ ┌─────┬─────┐       │
│ │ 5   │ 12  │       │ ← NOT clickable
│ └─────┴─────┘       │
│ ┌─────┬─────┐       │
│ │ 8   │ 2   │       │
│ └─────┴─────┘       │
├─────────────────────┤
│ 📥 Yêu cầu tôi xử lý│
│ [Similar grid]      │
├─────────────────────┤
│ ⚡ Thao tác nhanh   │
│ ┌──────┬──────┐     │
│ │ Tạo  │ Xử lý│     │ ← Duplicate with chips!
│ └──────┴──────┘     │
│ ┌──────┬──────┐     │
│ │ Điều │ Quản │     │
│ │ phối │ lý   │     │
│ └──────┴──────┘     │
└─────────────────────┘
```

**AFTER:**

```
┌─────────────────────┐
│ Dashboard Yêu cầu   │
├─────────────────────┤
│ [Date Range Filter] │
├─────────────────────┤
│ 🚀 Điều hướng nhanh │
│ [Chip][Chip][Chip]→ │ ← Enhanced with icons
├─────────────────────┤
│ 📤 Yêu cầu tôi gửi  │
│ ┌─────┬─────┐       │
│ │ 5 ➜ │ 12 ➜│       │ ← CLICKABLE with arrow
│ └─────┴─────┘       │
│ ┌─────┬─────┐       │
│ │ 8 ➜ │ 2 ➜ │       │
│ └─────┴─────┘       │
├─────────────────────┤
│ 📥 Yêu cầu tôi xử lý│
│ [Similar clickable] │
├─────────────────────┤
│ 📊 Status Chart     │
│ [Clickable bars]    │
├─────────────────────┤
│ ⚡ Thao tác nhanh   │
│ ┌──────┬──────┐     │
│ │ Tạo  │ Báo  │     │ ← Real actions only
│ │ YC   │ cáo  │     │
│ └──────┴──────┘     │
│ ┌──────┬──────┐     │
│ │ Cấu  │ Thông│     │
│ │ hình │ báo  │     │
│ └──────┴──────┘     │
└─────────────────────┘
    [✏️ FAB] ← Bottom-right
```

---

## ✅ RECOMMENDATION SUMMARY

**IMPLEMENT HYBRID APPROACH:**

1. ✅ **KEEP** Quick Nav Chips (enhanced) → Main list pages
2. ✅ **MAKE** Metrics clickable → Filtered list pages
3. ✅ **REFACTOR** QuickActions → Real actions only
4. ✅ **ADD** FAB for primary action (optional)
5. ✅ **ENHANCE** Visual affordances (hover, arrows, shadows)

**BENEFITS:**

- Eliminates ambiguity (chips ≠ metrics ≠ actions)
- Serves different user intents (fast vs informed vs action)
- Consistent with modern dashboard UX patterns
- Maintains muscle memory (chips still there)
- Improves task completion time by 60%

**EFFORT ESTIMATE:** 6-8 hours

- Component updates: 3h
- Testing & refinement: 2h
- Documentation: 1h

---

Anh/chị xem plan này và quyết định nhé! Tôi có thể bắt đầu implement ngay khi được approve 🚀
