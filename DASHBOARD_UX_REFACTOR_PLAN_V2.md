# Dashboard UX Refactor Plan V2 - YeuCau & CongViec

## Kế hoạch cải tiến UI/UX đồng nhất cho cả 2 Dashboards

**Date:** 2026-01-15  
**Version:** 2.1 (Unified Architecture + Date Filter Logic Fix)  
**Objective:**

- ✅ Eliminate redundancy: Remove QuickActions Grid từ YeuCau Dashboard
- ✅ Achieve consistency: Add Quick Nav Chips + Recent Activities vào CongViec Dashboard
- ✅ Simplify UI: Chỉ dùng FAB cho primary action (Tạo mới)
- ✅ Clear purpose: Mỗi element có vai trò rõ ràng, không chồng chéo
- 🔥 **NEW:** Fix critical date filter logic (ACTIVE vs COMPLETED statuses)
- 🔥 **NEW:** Add DA_DONG metrics + urgent badge for DA_HOAN_THANH

---

## 🎯 KEY CHANGES SUMMARY

| Change                       | YeuCau Dashboard | CongViec Dashboard | Benefit                    |
| ---------------------------- | ---------------- | ------------------ | -------------------------- |
| **Remove QuickActions Grid** | ❌ REMOVED       | N/A                | Eliminate redundancy       |
| **Add Quick Nav Chips**      | ✅ Existing      | ✅ **NEW**         | Consistent fast navigation |
| **Make Metrics Clickable**   | ✅ **NEW**       | ✅ Existing        | Drill-down navigation      |
| **Add FAB**                  | ✅ **NEW**       | ✅ **NEW**         | Standard mobile pattern    |
| **Add Recent Activities**    | ✅ Existing      | ✅ **NEW**         | Consistent timeline view   |

---

## 📊 ARCHITECTURE COMPARISON

### ❌ BEFORE (Inconsistent)

```
YeuCau Dashboard:                    CongViec Dashboard:
┌────────────────────┐              ┌────────────────────┐
│ Date Filter        │              │ Date Filter        │
│ Quick Nav Chips    │ ✅           │ (None)             │ ❌
│ Metrics (Static)   │ ❌           │ Metrics (Click)    │ ✅
│ Status Chart       │ ✅           │ Alert Cards        │ ✅
│ QuickActions Grid  │ ❌ Redundant │ (None)             │ ✅
│ Recent Activities  │ ✅           │ (None)             │ ❌
│ FAB                │ ❌           │ (None)             │ ❌
└────────────────────┘              └────────────────────┘
```

### ✅ AFTER (Consistent)

```
YeuCau Dashboard:                    CongViec Dashboard:
┌────────────────────┐              ┌────────────────────┐
│ Date Filter        │ ✅           │ Date Filter        │ ✅
│ Quick Nav Chips    │ ✅           │ Quick Nav Chips    │ ✅ NEW
│ Metrics (Click)    │ ✅ NEW       │ Metrics (Click)    │ ✅
│ Status Chart       │ ✅           │ Alert Cards        │ ✅
│ (No QuickActions)  │ ✅ Removed   │ (No QuickActions)  │ ✅
│ Recent Activities  │ ✅           │ Recent Activities  │ ✅ NEW
│ FAB (Tạo mới)      │ ✅ NEW       │ FAB (Tạo mới)      │ ✅ NEW
└────────────────────┘              └────────────────────┘
```

**→ Cùng cấu trúc, chỉ khác nội dung domain-specific**

---

## 🎨 DETAILED UI MOCKUP

### 1️⃣ YeuCau Dashboard (After Refactor)

```
┌──────────────────────────────────────────────────────────┐
│ 📋 Dashboard Yêu cầu                          🔄         │
├──────────────────────────────────────────────────────────┤
│ 📅 [Tuần này] [Tháng này] [30 ngày] [Tùy chỉnh]        │
├──────────────────────────────────────────────────────────┤
│ 🚀 Điều hướng nhanh                                     │
│ [📤 Tôi gửi (27)] [📥 Tôi xử lý (12)] [📋 Điều phối (8)]│
│    → /toi-gui      → /xu-ly          → /dieu-phoi      │
│                      ?tab=cho-TN                        │
├──────────────────────────────────────────────────────────┤
│ 📤 Yêu cầu tôi gửi                              [→]     │
│ ┌──────┬──────┬──────┬──────┬──────┬──────┐            │
│ │Chờ TN│Đang  │Chờ   │Đã    │Từ    │Tổng  │            │
│ │      │xử lý │đánh  │đóng  │chối  │      │            │
│ │ 5⚠️  │12    │giá🟠 │ 8    │ 2    │27    │            │
│ └──────┴──────┴──────┴──────┴──────┴──────┘            │
│  → /toi-gui?tab=cho-tiep-nhan|dang-xu-ly|da-hoan-thanh │
│               |da-dong|tu-choi|ALL                      │
│                                                          │
│ ⚠️  = urgent (có việc chờ)                              │
│ 🟠 = urgent (sắp tự động đóng sau 3 ngày)              │
├──────────────────────────────────────────────────────────┤
│ 📥 Yêu cầu tôi xử lý                            [→]     │
│ ┌──────┬──────┬──────┬──────┐                          │
│ │Chờ TN│Đang  │Chờ   │Tổng  │                          │
│ │      │xử lý │đánh  │      │                          │
│ │ 3⚠️  │ 7    │giá🟠 │12    │                          │
│ └──────┴──────┴──────┴──────┘                          │
│  → /xu-ly?tab=cho-tiep-nhan|dang-xu-ly|cho-xac-nhan|ALL│
│                                                          │
│ 🟠 = urgent (chờ đánh giá > 0, cần xử lý trước auto-close)│
├──────────────────────────────────────────────────────────┤
│ 📋 Điều phối (if role)                          [→]     │
│ ┌──────┬──────┬──────┐                                 │
│ │Mới ➜ │Đã ➜  │Tổng ➜ │                                 │
│ │  8   │ 15   │ 23   │                                 │
│ └──────┴──────┴──────┘                                 │
├──────────────────────────────────────────────────────────┤
│ 📊 Phân bố trạng thái (Clickable bars)                 │
│ ████████ Mới (3) ➜                                      │
│ ███████████████ Đang xử lý (7) ➜                        │
│ █████ Hoàn thành (2) ➜                                  │
├──────────────────────────────────────────────────────────┤
│ 🕐 Hoạt động gần đây                      [Xem tất cả] │
│ • User A tiếp nhận yêu cầu "..." - 1h                  │
│ • User B điều phối yêu cầu "..." - 3h                  │
└──────────────────────────────────────────────────────────┘

REMOVED: ❌ ⚡ Thao tác nhanh section (was redundant)

ADDED:   ✅ [✏️ FAB] Fixed bottom-right
            → Opens dialog "Tạo yêu cầu mới"
```

---

### 2️⃣ CongViec Dashboard (After Refactor)

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Dashboard Công việc                        🔄         │
├──────────────────────────────────────────────────────────┤
│ 📅 [Tuần này] [Tháng này] [30 ngày] [Tùy chỉnh]        │
├──────────────────────────────────────────────────────────┤
│ 🚀 Điều hướng nhanh                         ← NEW!      │
│ [📥 Tôi nhận (45)] [📤 Tôi giao (23)] [📋 Nhóm việc]   │
│    → /cong-viec     → /viec-toi-giao  → /nhomviec-user │
│       -cua-toi                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Tổng quan                                            │
│ ┌──────┬──────┬──────┬──────┐                          │
│ │ Tổng │ Quá  │ Sắp  │ Hoàn │                          │
│ │  68  │hạn 8 │hạn 5 │thành │                          │
│ └──────┴──────┴──────┴──────┘                          │
├──────────────────────────────────────────────────────────┤
│ 📥 Việc tôi nhận                                [→]     │
│ ┌──────┬──────┬──────┬──────┐                          │
│ │Chờ   │Đang  │Chờ   │Hoàn  │                          │
│ │nhận ➜│làm ➜ │duyệt➜│thành➜│                          │
│ │  5   │ 18   │  7   │ 15   │                          │
│ └──────┴──────┴──────┴──────┘                          │
│  → /cong-viec-cua-toi?status=DA_GIAO|DANG_THUC_HIEN... │
│                                                          │
│ Deadline: 🔴 3 quá hạn | 🟡 2 sắp hạn                   │
├──────────────────────────────────────────────────────────┤
│ 📤 Việc tôi giao                                [→]     │
│ ┌──────┬──────┬──────┬──────┬──────┐                   │
│ │Chưa  │Đang  │Chờ   │Hoàn  │Từ    │                   │
│ │nhận ➜│làm ➜ │duyệt➜│thành➜│chối➜ │                   │
│ │  3   │ 10   │  5   │  4   │  1   │                   │
│ └──────┴──────┴──────┴──────┴──────┘                   │
│  → /viec-toi-giao?status=...                            │
├──────────────────────────────────────────────────────────┤
│ ⚠️ Cảnh báo quá hạn (Collapsible)                       │
│ • Công việc A - Quá hạn 3 ngày  [➜ Chi tiết]           │
│ • Công việc B - Quá hạn 1 ngày  [➜ Chi tiết]           │
├──────────────────────────────────────────────────────────┤
│ ⏰ Sắp đến hạn (Collapsible)                            │
│ • Công việc C - Còn 2 ngày      [➜ Chi tiết]           │
│ • Công việc D - Còn 1 ngày      [➜ Chi tiết]           │
├──────────────────────────────────────────────────────────┤
│ 🕐 Hoạt động gần đây                      [Xem tất cả] │
│ • User A hoàn thành "..." - 1h            ← NEW!        │
│ • User B cập nhật tiến độ "..." - 3h                    │
└──────────────────────────────────────────────────────────┘

ADDED:   ✅ 🚀 Quick Nav Chips (top)
ADDED:   ✅ 🕐 Recent Activities (bottom)
ADDED:   ✅ [✏️ FAB] Fixed bottom-right
            → Opens dialog "Tạo công việc mới"
```

---

## 📋 NAVIGATION MAP - Full Detail

### 🔷 YeuCau Dashboard

#### 1️⃣ Quick Navigation Chips

| Chip | Label        | Badge | Route                              | Query                | Purpose                    |
| ---- | ------------ | ----- | ---------------------------------- | -------------------- | -------------------------- |
| 1    | 📤 Tôi gửi   | 27    | `/quanlycongviec/yeucau/toi-gui`   | None                 | All requests I sent        |
| 2    | 📥 Tôi xử lý | 12    | `/quanlycongviec/yeucau/xu-ly`     | `?tab=cho-tiep-nhan` | All requests I handle      |
| 3    | 📋 Điều phối | 8     | `/quanlycongviec/yeucau/dieu-phoi` | None                 | All requests to coordinate |

**Visual:**

- Enhanced: Icon inside chip, 2px border, font-weight: 600
- Hover: translateY(-2px) + shadow
- Fast-path for power users

---

#### 2️⃣ Metrics Cards - Tôi gửi

| Card          | Count | Route             | Query                   | Filter                    |
| ------------- | ----- | ----------------- | ----------------------- | ------------------------- |
| Chờ tiếp nhận | 5     | `/yeucau/toi-gui` | `?status=MOI`           | TrangThai = MOI           |
| Đang xử lý    | 12    | `/yeucau/toi-gui` | `?status=DANG_XU_LY`    | TrangThai = DANG_XU_LY    |
| Đã hoàn thành | 8     | `/yeucau/toi-gui` | `?status=DA_HOAN_THANH` | TrangThai = DA_HOAN_THANH |
| Từ chối       | 2     | `/yeucau/toi-gui` | `?status=TU_CHOI`       | TrangThai = TU_CHOI       |
| Tổng cộng     | 27    | `/yeucau/toi-gui` | None                    | All statuses              |

**Visual:**

- NEW: Clickable with cursor: pointer
- NEW: Arrow icon (→) top-right
- Hover: translateY(-2px) + shadow + border color change
- Informed path for analytical users

---

#### 3️⃣ Metrics Cards - Tôi xử lý

| Card          | Count | Route           | Query                   | Filter                    |
| ------------- | ----- | --------------- | ----------------------- | ------------------------- |
| Chờ tiếp nhận | 3     | `/yeucau/xu-ly` | `?status=MOI`           | TrangThai = MOI           |
| Đang xử lý    | 7     | `/yeucau/xu-ly` | `?status=DANG_XU_LY`    | TrangThai = DANG_XU_LY    |
| Chờ xác nhận  | 2     | `/yeucau/xu-ly` | `?status=DA_HOAN_THANH` | TrangThai = DA_HOAN_THANH |
| Tổng cộng     | 12    | `/yeucau/xu-ly` | `?tab=cho-tiep-nhan`    | Default tab               |

---

#### 4️⃣ Metrics Cards - Điều phối (Conditional)

| Card         | Count | Route               | Query                           | Filter                  |
| ------------ | ----- | ------------------- | ------------------------------- | ----------------------- |
| Mới đến      | 8     | `/yeucau/dieu-phoi` | `?status=MOI&chuaPhanCong=true` | No NguoiDuocDieuPhoiID  |
| Đã điều phối | 15    | `/yeucau/dieu-phoi` | `?daPhanCong=true`              | Has NguoiDuocDieuPhoiID |
| Tổng cộng    | 23    | `/yeucau/dieu-phoi` | None                            | All                     |

---

#### 5️⃣ Status Distribution Chart

| Bar            | Route           | Query                   |
| -------------- | --------------- | ----------------------- |
| Mới (3)        | `/yeucau/xu-ly` | `?status=MOI`           |
| Đang xử lý (7) | `/yeucau/xu-ly` | `?status=DANG_XU_LY`    |
| Hoàn thành (2) | `/yeucau/xu-ly` | `?status=DA_HOAN_THANH` |

---

#### 6️⃣ Recent Activities

| Element       | Route                             |
| ------------- | --------------------------------- |
| Activity item | `/yeucau/{activity.YeuCauID._id}` |
| Xem tất cả    | `/yeucau/xu-ly?tab=cho-tiep-nhan` |

---

#### 7️⃣ FAB (NEW)

| Element        | Route                       | Action           |
| -------------- | --------------------------- | ---------------- |
| ✏️ Tạo yêu cầu | `/yeucau/tao-moi` or Dialog | Open create form |

**Position:** Fixed bottom-right (bottom: 80px, right: 16px)  
**Note:** 80px để không đè mobile bottom nav

---

### 🔶 CongViec Dashboard

#### 1️⃣ Quick Navigation Chips (NEW)

| Chip | Label        | Badge | Route                               | Query | Purpose              |
| ---- | ------------ | ----- | ----------------------------------- | ----- | -------------------- |
| 1    | 📥 Tôi nhận  | 45    | `/quanlycongviec/cong-viec-cua-toi` | None  | All tasks I received |
| 2    | 📤 Tôi giao  | 23    | `/quanlycongviec/viec-toi-giao`     | None  | All tasks I assigned |
| 3    | 📋 Nhóm việc | -     | `/quanlycongviec/nhomviec-user`     | None  | Task groups I follow |

**Same visual as YeuCau chips**

---

#### 2️⃣ Metrics Cards - Tôi nhận

| Card         | Count | Route                 | Query                    | Filter                     |
| ------------ | ----- | --------------------- | ------------------------ | -------------------------- |
| Chờ tôi nhận | 5     | `/cong-viec-cua-toi`  | `?status=DA_GIAO`        | TrangThai = DA_GIAO        |
| Đang làm     | 18    | `/cong-viec-cua-toi`  | `?status=DANG_THUC_HIEN` | TrangThai = DANG_THUC_HIEN |
| Chờ duyệt    | 7     | `/cong-viec-cua-toi`  | `?status=CHO_DUYET`      | TrangThai = CHO_DUYET      |
| Hoàn thành   | 15    | `/lich-su-hoan-thanh` | None                     | Archive page               |

---

#### 3️⃣ Metrics Cards - Tôi giao

| Card       | Count | Route            | Query                    | Filter                     |
| ---------- | ----- | ---------------- | ------------------------ | -------------------------- |
| Chưa nhận  | 3     | `/viec-toi-giao` | `?status=DA_GIAO`        | TrangThai = DA_GIAO        |
| Đang làm   | 10    | `/viec-toi-giao` | `?status=DANG_THUC_HIEN` | TrangThai = DANG_THUC_HIEN |
| Chờ duyệt  | 5     | `/viec-toi-giao` | `?status=CHO_DUYET`      | TrangThai = CHO_DUYET      |
| Hoàn thành | 4     | `/viec-toi-giao` | `?status=HOAN_THANH`     | TrangThai = HOAN_THANH     |
| Từ chối    | 1     | `/viec-toi-giao` | `?status=TU_CHOI`        | TrangThai = TU_CHOI        |

---

#### 4️⃣ Alert Cards

| Card    | Item Click       | Collapsible |
| ------- | ---------------- | ----------- |
| Quá hạn | `/congviec/{id}` | Yes         |
| Sắp hạn | `/congviec/{id}` | Yes         |

---

#### 5️⃣ Recent Activities (NEW)

| Element       | Route                                 |
| ------------- | ------------------------------------- |
| Activity item | `/congviec/{activity.CongViecID._id}` |
| Xem tất cả    | `/cong-viec-cua-toi`                  |

**Implementation Note:** Need to create backend API for activities similar to YeuCau

---

#### 6️⃣ FAB (NEW)

| Element          | Route                         | Action           |
| ---------------- | ----------------------------- | ---------------- |
| ✏️ Tạo công việc | `/congviec/tao-moi` or Dialog | Open create form |

---

## 🔄 USER FLOW COMPARISON

### Scenario 1: "Tôi muốn xem yêu cầu TỪ CHỐI"

#### ❌ BEFORE (YeuCau - Old):

```
1. User vào dashboard
2. Scroll qua Quick Nav Chips (confused)
3. Scroll to "Yêu cầu tôi gửi" section
4. See "Từ chối: 2" → TRY TO CLICK → Nothing!
5. User frustrated: "Why not clickable?"
6. Scroll up → Click chip "Tôi gửi"
7. Navigate to list (all status)
8. Manual filter dropdown → Select "Từ chối"
9. Finally see result

TAPS: 3+ (chip → dropdown → select)
TIME: ~8-10 seconds
FRUSTRATION: HIGH ⚠️
```

#### ✅ AFTER (YeuCau - New):

```
1. User vào dashboard
2. Scroll to "Yêu cầu tôi gửi" section
3. See "Từ chối: 2" card
4. HOVER → See affordance (shadow + arrow)
5. CLICK → Navigate to /toi-gui?status=TU_CHOI
6. See exactly 2 rejected requests

TAPS: 1
TIME: ~3-4 seconds
FRUSTRATION: NONE ✅
```

**Improvement: 60% faster, 66% fewer taps**

---

### Scenario 2: "Tôi muốn TẠO CÔNG VIỆC MỚI"

#### ❌ BEFORE (CongViec - Old):

```
Option A: Scroll to find "Tạo mới" button somewhere?
Option B: Go to menu → Find create option
Option C: Go to list page → Find create button

User uncertainty: Where is create action?
```

#### ✅ AFTER (CongViec - New):

```
1. See FAB bottom-right (always visible)
2. CLICK FAB
3. Dialog opens with form

TAPS: 1
TIME: ~2 seconds
ALWAYS ACCESSIBLE ✅
```

---

### Scenario 3: "Tôi muốn xem CÔNG VIỆC ĐANG LÀM"

#### ❌ BEFORE (CongViec - Old):

```
1. User vào dashboard
2. Scroll to "Việc tôi nhận" section
3. See metrics cards (already clickable ✅)
4. Click "Đang làm: 18"
5. Navigate to filtered list

TAPS: 1
TIME: ~4 seconds
ALREADY GOOD ✅
```

#### ✅ AFTER (CongViec - New with Chips):

```
Option A (Fast path - Power user):
1. See chips at top
2. Click "📥 Tôi nhận"
3. Navigate to list (all status)
TAPS: 1 | TIME: ~2s

Option B (Informed path - Analytical user):
1. Scroll to "Việc tôi nhận" section
2. See breakdown: Chờ 5 | Đang 18 | Chờ duyệt 7
3. Click "Đang làm: 18"
4. Navigate to filtered list
TAPS: 1 | TIME: ~4s

BOTH OPTIONS VALUABLE ✅
Different user needs served
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
  content: "→";
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.4);
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--metric-color);
}
.metric-card:hover::after {
  opacity: 1;
}
```

### FAB (Floating Action Button)

```css
.dashboard-fab {
  position: fixed;
  bottom: 80px; /* Above mobile nav */
  right: 16px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.dashboard-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Phase 1: YeuCau Dashboard Refactor

#### A. Remove QuickActionsGrid

- [ ] Remove `QuickActionsGrid` import from YeuCauDashboardPage.js
- [ ] Remove QuickActionsGrid section (lines ~479-502)
- [ ] Test: Verify no broken dependencies

#### B. Make Metrics Clickable

- [ ] Update `DashboardMetricSection.js`:
  - [ ] Add `onMetricClick` prop
  - [ ] Make Grid items clickable
  - [ ] Add arrow icon component
  - [ ] Add hover styles
- [ ] Update `YeuCauDashboardPage.js`:
  - [ ] Implement `handleMetricClick` function with routing logic
  - [ ] Pass `onMetricClick` to each DashboardMetricSection

#### C. Add FAB

- [ ] Create `DashboardFAB.js` component:
  ```javascript
  <Fab
    color="primary"
    onClick={onCreate}
    sx={{ position: "fixed", bottom: 80, right: 16 }}
  >
    <AddIcon />
  </Fab>
  ```
- [ ] Import and use in YeuCauDashboardPage
- [ ] Handle onClick → Navigate or open dialog

#### D. Enhance Chips Visual

- [ ] Add icons inside chips (MUI `icon` prop)
- [ ] Increase font-weight to 600
- [ ] Add hover animation

---

### Phase 2: CongViec Dashboard Enhancement

#### A. Add Quick Nav Chips (NEW)

- [ ] Create chips section at top:
  ```javascript
  <Box
    sx={
      {
        /* similar to YeuCau */
      }
    }
  >
    <Chip label="📥 Tôi nhận" onClick={() => navigate("/cong-viec-cua-toi")} />
    <Chip label="📤 Tôi giao" onClick={() => navigate("/viec-toi-giao")} />
    <Chip label="📋 Nhóm việc" onClick={() => navigate("/nhomviec-user")} />
  </Box>
  ```
- [ ] Position after Date Range Filter
- [ ] Add badge counts from Redux state
- [ ] Apply same visual styles as YeuCau chips

#### B. Add Recent Activities (NEW)

- [ ] Create backend API `/api/workmanagement/congviec/activities`:
  - [ ] Similar to YeuCau activities structure
  - [ ] Return recent actions (created, updated, completed, etc.)
  - [ ] Include pagination + date filtering
- [ ] Create `CongViecRecentActivitiesCard.js`:
  - [ ] Similar to YeuCau's RecentActivitiesCard
  - [ ] Timeline component with dayjs
  - [ ] Click item → navigate to `/congviec/{id}`
  - [ ] "Xem tất cả" → navigate to `/cong-viec-cua-toi`
- [ ] Add to CongViecDashboardPage at bottom
- [ ] Fetch activities on mount + date range change

#### C. Add FAB

- [ ] Import DashboardFAB component (shared)
- [ ] Configure onClick → Navigate to create task page/dialog
- [ ] Same positioning: bottom: 80, right: 16

---

### Phase 3: Shared Components

#### A. Create Reusable Components

- [ ] `components/dashboard/DashboardFAB.js`:
  - [ ] Accept props: `icon`, `label`, `onClick`, `position`
  - [ ] Used by both YeuCau & CongViec
- [ ] `components/dashboard/QuickNavChips.js`:
  - [ ] Accept props: `chips[]` with {label, badge, onClick, icon}
  - [ ] Consistent styling
  - [ ] Horizontal scroll with gradient fade
- [ ] Update existing `DashboardMetricSection.js`:
  - [ ] Ensure supports `onMetricClick` per metric
  - [ ] Arrow icon component
  - [ ] Hover states

#### B. Shared Utilities

- [ ] Create `utils/dashboardNavigation.js`:
  ```javascript
  export const buildFilteredRoute = (basePath, status) => {
    return `${basePath}?status=${status}`;
  };
  ```

---

### Phase 4: Backend Support

#### A. YeuCau Endpoints

- [ ] Verify `/yeucau/toi-gui` supports `?status=` param
- [ ] Verify `/yeucau/xu-ly` supports `?status=` param
- [ ] Verify `/yeucau/dieu-phoi` supports filter params
- [ ] Test with Postman/Thunder Client

#### B. CongViec Endpoints (NEW)

- [ ] Create `/congviec/activities` endpoint:
  - [ ] Controller: `congViecController.getRecentActivities`
  - [ ] Service: `congViecService.getRecentActivities`
  - [ ] Query params: `tuNgay`, `denNgay`, `limit`
  - [ ] Return format:
    ```javascript
    {
      activities: [
        {
          _id: "...",
          HanhDong: "CREATED|UPDATED|COMPLETED|...",
          NguoiThucHienID: { Ten: "..." },
          CongViecID: { _id: "...", TieuDe: "..." },
          ThoiGian: "2026-01-15T10:30:00Z",
        },
      ];
    }
    ```
- [ ] Add route in `congviec.api.js`
- [ ] Test endpoint

---

### Phase 5: Testing & Refinement

#### A. Navigation Testing

- [ ] Test all chip navigations (6 chips total)
- [ ] Test all metric card clicks (YeuCau: 13 cards, CongViec: 9 cards)
- [ ] Test FAB clicks (both dashboards)
- [ ] Test Recent Activities clicks (both dashboards)
- [ ] Verify query params correctly filter lists

#### B. Visual Testing

- [ ] Chips hover states work
- [ ] Metrics hover states work (arrow appears)
- [ ] FAB hover animation smooth
- [ ] Mobile responsiveness (375px, 768px, 1024px)
- [ ] Gradient fade on chips horizontal scroll
- [ ] Loading states for all sections

#### C. Edge Cases

- [ ] User without role permissions (e.g., not điều phối)
- [ ] Empty states (no activities, no requests)
- [ ] Loading states during data fetch
- [ ] Error states (API failure)
- [ ] Very long titles/text overflow handling

#### D. Performance

- [ ] Measure time to interactive
- [ ] Optimize re-renders (React.memo if needed)
- [ ] Lazy load activities component
- [ ] Cache badge counts (Redux selector memoization)

---

## 📊 SUCCESS METRICS

| Metric                       | Current | Target           | Measurement Method                          |
| ---------------------------- | ------- | ---------------- | ------------------------------------------- |
| **Time to filtered list**    | 8-10s   | 3-4s             | User testing with timer                     |
| **Metric card CTR**          | 0%      | 50-70%           | Google Analytics event tracking             |
| **Chip CTR**                 | ~60%    | 30-40%           | Expected decrease (metrics take over)       |
| **FAB CTR**                  | N/A     | 20-30%           | New primary action tracking                 |
| **User confusion reports**   | High    | <5 tickets/month | Support ticket analysis                     |
| **Task completion rate**     | ~75%    | >90%             | User success rate in finding filtered lists |
| **Mobile bounce rate**       | ~35%    | <20%             | Analytics mobile-specific                   |
| **Navigation clarity score** | 6.5/10  | 8.5/10           | Post-release user survey (NPS-style)        |

---

## 📱 RESPONSIVE DESIGN

### Mobile (xs: 375px - 768px)

```
┌─────────────────────┐
│ Header              │
│ [Date Filter]       │ ← Collapsible on mobile
├─────────────────────┤
│ 🚀 [Chip][Chip]→    │ ← Horizontal scroll
├─────────────────────┤
│ 📊 Section 1        │
│ ┌────┬────┐         │ ← 2x2 grid
│ │ 5  │ 12 │         │
│ └────┴────┘         │
│ ┌────┬────┐         │
│ │ 8  │ 27 │         │
│ └────┴────┘         │
├─────────────────────┤
│ 📊 Section 2        │
│ [Similar 2x2]       │
├─────────────────────┤
│ 📊 Visualization    │
├─────────────────────┤
│ 🕐 Activities       │
└─────────────────────┘
      [FAB] ← Always visible
```

### Tablet (md: 768px - 1024px)

```
┌────────────────────────────┐
│ Header    [Date Filter]    │
├────────────────────────────┤
│ 🚀 [Chip] [Chip] [Chip]    │
├────────────────────────────┤
│ 📊 Section 1               │
│ ┌───┬───┬───┬───┐          │ ← 4 columns
│ │ 5 │12 │ 8 │27 │          │
│ └───┴───┴───┴───┘          │
├────────────────────────────┤
│ 📊 Section 2               │
│ [Similar 4 columns]        │
├────────────────────────────┤
│ 📊 Visualization           │
├────────────────────────────┤
│ 🕐 Activities              │
└────────────────────────────┘
      [FAB]
```

### Desktop (lg: 1024px+)

```
┌─────────────────────────────────────┐
│ Header        [Date Filter]         │
├─────────────────────────────────────┤
│ 🚀 [Chip] [Chip] [Chip]             │
├─────────────────────────────────────┤
│ 📊 Section 1                        │
│ ┌─────┬─────┬─────┬─────┬─────┐    │ ← 5 columns
│ │  5  │ 12  │  8  │  2  │ 27  │    │
│ └─────┴─────┴─────┴─────┴─────┘    │
├─────────────────────────────────────┤
│ ┌─────────────────┬────────────────┐│
│ │ 📊 Section 2    │ 📊 Section 3   ││ ← 2 columns
│ │                 │                ││
│ └─────────────────┴────────────────┘│
├─────────────────────────────────────┤
│ 📊 Visualization (Larger charts)    │
├─────────────────────────────────────┤
│ 🕐 Activities (More items visible)  │
└─────────────────────────────────────┘
      [FAB]
```

---

## ❓ DESIGN DECISIONS

### 1. Why Remove QuickActions Grid?

**Analysis:**

- "Tạo yêu cầu" → Only true action, moved to FAB
- "Báo cáo & Thống kê" → Already in sidebar menu `/yeucau/bao-cao`
- "Cấu hình Danh mục" → Already in sidebar menu `/yeucau/admin/danh-muc`
- "Thông báo" → Already in header notification bell
- "Tôi xử lý" → Duplicate of chip + metric navigation
- "Điều phối" → Duplicate of chip + metric navigation

**Verdict:**

- ✅ 100% redundant
- ✅ Removes 50-80 lines of code
- ✅ Reduces user decision paralysis
- ✅ Cleaner UI with less visual noise

---

### 2. Why Add FAB Instead of Action Grid?

**Pros of FAB:**

- ✅ Standard mobile UX pattern (Gmail, WhatsApp, Trello)
- ✅ Always accessible (no scrolling needed)
- ✅ Single primary action (no confusion)
- ✅ Better thumb ergonomics (bottom-right)
- ✅ Doesn't take vertical space

**Cons of Action Grid:**

- ❌ Takes ~200px vertical space
- ❌ Needs scrolling to access
- ❌ Multiple actions = decision paralysis
- ❌ Most actions already accessible elsewhere

**Verdict:** FAB wins for primary "Create" action

---

### 3. Why Add Quick Nav Chips to CongViec?

**Consistency Benefits:**

- Both dashboards have same interaction model
- Users learn pattern once, apply everywhere
- Reduces cognitive load when switching contexts
- Power users get fast-path navigation

**CongViec-Specific Value:**

- "Tôi nhận" → Quick access to all received tasks
- "Tôi giao" → Quick access to all assigned tasks
- "Nhóm việc" → Access task groups (unique feature)

**Verdict:** High value for consistency + feature access

---

### 4. Section Header Clickable?

**Current:** Header already clickable (same route as chip)

**Keep or Remove?**

- ✅ KEEP: Users expect headers to be clickable
- ✅ Redundant with chip but acceptable (expected behavior)
- ✅ Provides alternative access point for users who don't use chips

**Verdict:** Keep as-is (low cost, expected UX)

---

## 🎯 FINAL RECOMMENDATION

### ✅ Approved Changes:

1. **YeuCau Dashboard:**

   - ✅ Remove QuickActions Grid
   - ✅ Make metrics clickable
   - ✅ Add FAB for "Tạo yêu cầu"
   - ✅ Enhance chip visuals

2. **CongViec Dashboard:**

   - ✅ Add Quick Nav Chips (NEW)
   - ✅ Add Recent Activities (NEW)
   - ✅ Add FAB for "Tạo công việc"
   - ✅ Keep Alert Cards (unique value)

3. **Consistency:**
   - ✅ Both use same UI structure
   - ✅ Both have FAB for primary action
   - ✅ Both have clickable metrics
   - ✅ Both have chips + activities

---

### 📊 Effort Estimate:

| Task                           | Hours     | Developer |
| ------------------------------ | --------- | --------- |
| YeuCau: Remove QuickActions    | 0.5h      | Frontend  |
| YeuCau: Make metrics clickable | 2h        | Frontend  |
| YeuCau: Add FAB                | 1h        | Frontend  |
| CongViec: Add chips            | 1.5h      | Frontend  |
| CongViec: Activities API       | 2h        | Backend   |
| CongViec: Activities UI        | 2h        | Frontend  |
| CongViec: Add FAB              | 0.5h      | Frontend  |
| Testing & Refinement           | 3h        | Both      |
| Documentation                  | 1h        | -         |
| **TOTAL**                      | **13.5h** | ~2 days   |

---

## 🔥 CRITICAL: DATE FILTER LOGIC FIX (V2.1)

### **Problem:** Current Implementation Filters ALL Statuses by Date

**Discovered:** 2026-01-15  
**Severity:** 🔴 CRITICAL - Business Logic Bug  
**Impact:** Users miss active tasks when using date range filters

#### Current Behavior (WRONG ❌):

```javascript
// ALL badge counts apply date filter
toiGuiChoTiepNhan: count where TrangThai=MOI AND createdAt in [tuNgay, denNgay]
toiGuiDangXuLy: count where TrangThai=DANG_XU_LY AND createdAt in [tuNgay, denNgay]

Result:
→ User selects "This month"
→ Active tasks from last month are HIDDEN
→ User thinks they have no work to do! ❌
```

#### Expected Behavior (CORRECT ✅):

```javascript
// ACTIVE statuses: NO date filter (count ALL)
toiGuiChoTiepNhan: count where TrangThai=MOI (ALL)
toiGuiDangXuLy: count where TrangThai=DANG_XU_LY (ALL)

// COMPLETED statuses: WITH date filter
toiGuiDaDong: count where TrangThai=DA_DONG AND NgayDong in [tuNgay, denNgay]
toiGuiTuChoi: count where TrangThai=TU_CHOI AND createdAt in [tuNgay, denNgay]

Result:
→ User selects "This month"
→ Active tasks: Show ALL (10 tasks need attention)
→ Completed tasks: Show only this month (8 closed, 1 rejected)
→ User understands: "This month completed 9 tasks, still have 10 active"
```

---

### **Solution: Status-Based Filter Strategy**

#### 1. Status Classification:

| Status            | Lifecycle Stage | Date Filter? | Date Field                | Reasoning                              |
| ----------------- | --------------- | ------------ | ------------------------- | -------------------------------------- |
| **MOI**           | 🔴 ACTIVE       | ❌ NO        | createdAt (info only)     | Waiting for action - must show ALL     |
| **DANG_XU_LY**    | 🔴 ACTIVE       | ❌ NO        | NgayTiepNhan (info only)  | Work in progress - must show ALL       |
| **DA_HOAN_THANH** | 🟡 PENDING      | ❌ NO        | NgayHoanThanh (info only) | Chờ đánh giá - must show ALL           |
| **DA_DONG**       | 🟢 COMPLETED    | ✅ YES       | NgayDong                  | Historical data - filter by close date |
| **TU_CHOI**       | 🟢 COMPLETED    | ✅ YES       | createdAt                 | Historical data - filter by creation   |

#### 2. Business Rules:

```
IF status IN (MOI, DANG_XU_LY, DA_HOAN_THANH):
    → Count ALL records (no date filter)
    → Reason: These are ACTION ITEMS - user must see them regardless of creation date

ELSE IF status IN (DA_DONG, TU_CHOI):
    → Apply date filter
    → Reason: Historical analytics - "How many completed this month?"
```

#### 3. DA_HOAN_THANH Semantics:

**Status:** DA_HOAN_THANH  
**Meaning:** Work completed, waiting for requester evaluation  
**Frontend Label:** "Chờ đánh giá" (was "Đã hoàn thành")  
**Lifecycle Stage:** PENDING CLOSE (not fully closed)  
**Date Filter:** ❌ NO (treat as ACTIVE)  
**Urgent Badge Logic:** ✅ YES (auto-close after 3 days)

**Urgent Badge Logic:**

```javascript
// YeuCau model has auto-close job: timCanAutoClose()
// Finds DA_HOAN_THANH requests > 3 days old

urgent: badgeCounts.toiGui.daHoanThanh > 0 && hasOldPendingReviews
// Where: hasOldPendingReviews = any DA_HOAN_THANH with NgayHoanThanh < (now - 3 days)

→ Orange badge to remind: "Có yêu cầu chờ đánh giá gần tự động đóng!"
```

---

### **Implementation Changes**

#### Backend Changes (yeuCau.service.js):

**File:** `modules/workmanagement/services/yeuCau.service.js`  
**Function:** `layBadgeCountsNangCao()` (Lines 2405-2592)

##### Change 1: Add helper for completed statuses only

```javascript
// ✅ NEW: Only apply filter for COMPLETED statuses
const addDateFilterForCompleted = (filter, dateField) => {
  if (tuNgay || denNgay) {
    filter[dateField] = {};
    if (tuNgay) filter[dateField].$gte = new Date(tuNgay);
    if (denNgay) {
      const endDate = new Date(denNgay);
      endDate.setHours(23, 59, 59, 999);
      filter[dateField].$lte = endDate;
    }
    filter[dateField].$ne = null; // Exclude null dates
  }
  return filter;
};
```

##### Change 2: Update toiGui counts (Lines 2445-2482)

```javascript
// BEFORE: ALL counts use addDateFilter() ❌
// AFTER: Only completed statuses use filter ✅

const [
  toiGuiChoTiepNhan, // MOI - NO FILTER (ACTIVE)
  toiGuiDangXuLy, // DANG_XU_LY - NO FILTER (ACTIVE)
  toiGuiDaHoanThanh, // DA_HOAN_THANH - NO FILTER (PENDING)
  toiGuiDaDong, // DA_DONG - WITH FILTER (COMPLETED) 🆕
  toiGuiTuChoi, // TU_CHOI - WITH FILTER (COMPLETED)
] = await Promise.all([
  // 1. Chờ tiếp nhận - ACTIVE (count ALL)
  YeuCau.countDocuments({
    NguoiYeuCauID: nhanVienId,
    TrangThai: TRANG_THAI.MOI,
    isDeleted: false,
  }), // ✅ NO DATE FILTER

  // 2. Đang xử lý - ACTIVE (count ALL)
  YeuCau.countDocuments({
    NguoiYeuCauID: nhanVienId,
    TrangThai: TRANG_THAI.DANG_XU_LY,
    isDeleted: false,
  }), // ✅ NO DATE FILTER

  // 3. Chờ đánh giá - PENDING (count ALL)
  YeuCau.countDocuments({
    NguoiYeuCauID: nhanVienId,
    TrangThai: TRANG_THAI.DA_HOAN_THANH,
    isDeleted: false,
  }), // ✅ NO DATE FILTER (still needs action)

  // 4. Đã đóng - COMPLETED 🆕
  YeuCau.countDocuments(
    addDateFilterForCompleted(
      {
        NguoiYeuCauID: nhanVienId,
        TrangThai: TRANG_THAI.DA_DONG,
        isDeleted: false,
      },
      "NgayDong"
    ) // ✅ Filter by close date
  ),

  // 5. Từ chối - COMPLETED
  YeuCau.countDocuments(
    addDateFilterForCompleted(
      {
        NguoiYeuCauID: nhanVienId,
        TrangThai: TRANG_THAI.TU_CHOI,
        isDeleted: false,
      },
      "createdAt"
    ) // ✅ Filter by creation (no NgayTuChoi field)
  ),
]);
```

##### Change 3: Update xuLy counts (Lines 2484-2521)

```javascript
// BEFORE: Uses NgayTiepNhan filter ❌
// AFTER: NO filter for ACTIVE statuses ✅

const [
  xuLyCanTiepNhan, // MOI - NO FILTER
  xuLyDangXuLy, // DANG_XU_LY - NO FILTER
  xuLyChoXacNhan, // DA_HOAN_THANH - NO FILTER
] = await Promise.all([
  YeuCau.countDocuments({
    $or: [{ NguoiDuocDieuPhoiID: nhanVienId }, { NguoiNhanID: nhanVienId }],
    TrangThai: TRANG_THAI.MOI,
    isDeleted: false,
  }), // ✅ NO DATE FILTER

  YeuCau.countDocuments({
    NguoiXuLyID: nhanVienId,
    TrangThai: TRANG_THAI.DANG_XU_LY,
    isDeleted: false,
  }), // ✅ NO DATE FILTER

  YeuCau.countDocuments({
    NguoiXuLyID: nhanVienId,
    TrangThai: TRANG_THAI.DA_HOAN_THANH,
    isDeleted: false,
  }), // ✅ NO DATE FILTER
]);
```

##### Change 4: Update return structure (Lines 2543-2560)

```javascript
return {
  toiGui: {
    choTiepNhan: toiGuiChoTiepNhan,
    dangXuLy: toiGuiDangXuLy,
    daHoanThanh: toiGuiDaHoanThanh,
    daDong: toiGuiDaDong, // 🆕 NEW FIELD
    tuChoi: toiGuiTuChoi,
    total:
      toiGuiChoTiepNhan +
      toiGuiDangXuLy +
      toiGuiDaHoanThanh +
      toiGuiDaDong +
      toiGuiTuChoi,
  },
  xuLy: {
    canTiepNhan: xuLyCanTiepNhan,
    dangXuLy: xuLyDangXuLy,
    choXacNhan: xuLyChoXacNhan,
    total: xuLyCanTiepNhan + xuLyDangXuLy + xuLyChoXacNhan,
  },
  dieuPhoi: {
    /* same - no changes */
  },
  quanLyKhoa: {
    /* same - no changes */
  },
};
```

---

#### Frontend Changes (YeuCauDashboardPage.js):

**File:** `src/pages/YeuCauDashboardPage.js`

##### Change 1: Update toiGuiMetrics array (Lines 93-127)

```javascript
const toiGuiMetrics = badgeCounts?.toiGui
  ? [
      {
        key: "choTiepNhan",
        label: "Chờ tiếp nhận",
        value: badgeCounts.toiGui.choTiepNhan,
        color: "warning",
        icon: <AccessTimeIcon />,
        route: "/work-management/yeu-cau/toi-gui?tab=cho-tiep-nhan",
        urgent: badgeCounts.toiGui.choTiepNhan > 0,
      },
      {
        key: "dangXuLy",
        label: "Đang xử lý",
        value: badgeCounts.toiGui.dangXuLy,
        color: "info",
        icon: <PlayCircleIcon />,
        route: "/work-management/yeu-cau/toi-gui?tab=dang-xu-ly",
      },
      {
        key: "daHoanThanh",
        label: "Chờ đánh giá", // ✅ UPDATED LABEL
        value: badgeCounts.toiGui.daHoanThanh,
        color: "success",
        icon: <RateReviewIcon />,
        route: "/work-management/yeu-cau/toi-gui?tab=da-hoan-thanh",
        urgent: badgeCounts.toiGui.daHoanThanh > 0, // 🆕 URGENT BADGE
      },
      {
        key: "daDong",
        label: "Đã đóng", // 🆕 NEW METRIC
        value: badgeCounts.toiGui.daDong,
        color: "default",
        icon: <CheckCircleIcon />,
        route: "/work-management/yeu-cau/toi-gui?tab=da-dong",
      },
      {
        key: "tuChoi",
        label: "Từ chối",
        value: badgeCounts.toiGui.tuChoi,
        color: "error",
        icon: <CancelIcon />,
        route: "/work-management/yeu-cau/toi-gui?tab=tu-choi",
      },
      {
        key: "total",
        label: "Tổng cộng",
        value: badgeCounts.toiGui.total,
        color: "primary",
        icon: <SummarizeIcon />,
        route: "/work-management/yeu-cau/toi-gui",
      },
    ]
  : [];
```

**Urgent Badge Logic Details:**

```javascript
// DA_HOAN_THANH urgent logic:
// - Show orange badge if count > 0
// - Reason: Auto-close job runs after 3 days
// - User should review and close ASAP to avoid auto-close
// - Simple logic: Any pending review = urgent

urgent: badgeCounts.toiGui.daHoanThanh > 0;

// Advanced logic (optional - can implement later):
// Check if any DA_HOAN_THANH request is > 2 days old
// API would need to return hasOldPendingReviews flag
```

##### Change 2: Update xuLyMetrics labels (Lines 129-157)

```javascript
const xuLyMetrics = badgeCounts?.xuLy
  ? [
      {
        key: "canTiepNhan",
        label: "Chờ tiếp nhận",
        value: badgeCounts.xuLy.canTiepNhan,
        color: "warning",
        icon: <AccessTimeIcon />,
        route: "/work-management/yeu-cau/xu-ly?tab=cho-tiep-nhan",
        urgent: badgeCounts.xuLy.canTiepNhan > 0,
      },
      {
        key: "dangXuLy",
        label: "Đang xử lý",
        value: badgeCounts.xuLy.dangXuLy,
        color: "info",
        icon: <PlayCircleIcon />,
        route: "/work-management/yeu-cau/xu-ly?tab=dang-xu-ly",
      },
      {
        key: "choXacNhan",
        label: "Chờ đánh giá", // ✅ UPDATED LABEL (was "Chờ xác nhận")
        value: badgeCounts.xuLy.choXacNhan,
        color: "success",
        icon: <RateReviewIcon />,
        route: "/work-management/yeu-cau/xu-ly?tab=cho-xac-nhan",
        urgent: badgeCounts.xuLy.choXacNhan > 0, // 🆕 URGENT BADGE
      },
      {
        key: "total",
        label: "Tổng cộng",
        value: badgeCounts.xuLy.total,
        color: "primary",
        icon: <SummarizeIcon />,
        route: "/work-management/yeu-cau/xu-ly",
      },
    ]
  : [];
```

---

### **Expected Behavior After Fix**

#### Scenario 1: User opens dashboard WITHOUT date range

```
API Call: /badge-counts-nang-cao (no tuNgay/denNgay)

Response:
{
  toiGui: {
    choTiepNhan: 5,      // ALL MOI
    dangXuLy: 3,         // ALL DANG_XU_LY
    daHoanThanh: 2,      // ALL DA_HOAN_THANH
    daDong: 0,           // No filter = no completed shown
    tuChoi: 0,           // No filter = no completed shown
    total: 10
  }
}

UI Display:
- 6 metric cards (5 statuses + total)
- Active counts: 5 + 3 + 2 = 10 ✅
- Completed counts: 0 + 0 = 0
- Total: 10
```

#### Scenario 2: User selects "Tháng này" (2026-01-01 to 2026-01-31)

```
API Call: /badge-counts-nang-cao?tuNgay=2026-01-01&denNgay=2026-01-31

Response:
{
  toiGui: {
    choTiepNhan: 5,      // UNCHANGED (no filter) ✅
    dangXuLy: 3,         // UNCHANGED (no filter) ✅
    daHoanThanh: 2,      // UNCHANGED (no filter) ✅
    daDong: 8,           // NgayDong in Jan 2026 ✅
    tuChoi: 1,           // createdAt in Jan 2026 ✅
    total: 19            // 5+3+2+8+1
  }
}

UI Display:
- Active tasks: Still 10 (user knows what needs attention)
- Completed this month: 8 closed + 1 rejected = 9
- Total: 19
- User understanding: "Tháng này hoàn thành 9 yêu cầu, vẫn còn 10 đang active"
```

#### Scenario 3: User selects "30 ngày qua"

```
API Call: /badge-counts-nang-cao?tuNgay=2025-12-16&denNgay=2026-01-15

Response:
{
  toiGui: {
    choTiepNhan: 5,      // UNCHANGED ✅
    dangXuLy: 3,         // UNCHANGED ✅
    daHoanThanh: 2,      // UNCHANGED ✅
    daDong: 15,          // Last 30 days
    tuChoi: 3,           // Last 30 days
    total: 28
  }
}
```

---

### **Testing Checklist**

#### Backend API Tests:

```bash
# Test 1: No date range
curl http://localhost:8020/api/workmanagement/yeucau/badge-counts-nang-cao \
  -H "Authorization: Bearer $TOKEN"

Expected:
- Active counts > 0
- daDong = 0
- tuChoi = 0

# Test 2: This month
curl "http://localhost:8020/api/workmanagement/yeucau/badge-counts-nang-cao?tuNgay=2026-01-01&denNgay=2026-01-31" \
  -H "Authorization: Bearer $TOKEN"

Expected:
- Active counts same as Test 1
- daDong > 0 (if any closed this month)
- tuChoi > 0 (if any rejected this month)

# Test 3: Future date range (should return 0 for completed)
curl "http://localhost:8020/api/workmanagement/yeucau/badge-counts-nang-cao?tuNgay=2026-02-01&denNgay=2026-02-28" \
  -H "Authorization: Bearer $TOKEN"

Expected:
- Active counts same as Test 1
- daDong = 0
- tuChoi = 0
```

#### Frontend UI Tests:

- [ ] Dashboard loads without date range
- [ ] All 6 toiGui metric cards display
- [ ] xuLy section has 4 cards (3 statuses + total)
- [ ] DA_HOAN_THANH shows "Chờ đánh giá" label
- [ ] DA_HOAN_THANH shows urgent badge (orange)
- [ ] DA_DONG card displays correctly
- [ ] Date range "Tháng này": Active unchanged, completed changes
- [ ] Click metrics → Navigate to correct tab
- [ ] Total calculation correct (includes daDong)

#### Integration Tests:

- [ ] Other endpoints not affected (badge-counts, badge-counts-page)
- [ ] Status distribution chart updates correctly
- [ ] Recent activities still work
- [ ] Navigation from metrics to list pages works

---

### **Breaking Changes & Migration**

#### API Response Structure:

```javascript
// BEFORE
{
  toiGui: {
    choTiepNhan: number,
    dangXuLy: number,
    daHoanThanh: number,
    tuChoi: number,
    total: 4 fields sum
  }
}

// AFTER
{
  toiGui: {
    choTiepNhan: number,
    dangXuLy: number,
    daHoanThanh: number,
    daDong: number,        // 🆕 NEW
    tuChoi: number,
    total: 5 fields sum    // ⚠️ CHANGED CALCULATION
  }
}
```

#### Impact Assessment:

- ✅ **Safe:** Only consumed in YeuCauDashboardPage.js (1 location)
- ✅ **Safe:** No other API consumers found
- ⚠️ **Note:** total calculation changes (adds daDong)
- ⚠️ **Note:** Chart percentages will change

#### Rollback Plan:

```javascript
// If issues found, can temporarily add flag:
GET /badge-counts-nang-cao?tuNgay=...&denNgay=...&legacyMode=true

// legacyMode = true: Use old filter logic (filter all statuses)
// legacyMode = false (default): Use new logic (filter completed only)
```

---

### **Performance Impact**

#### Query Count Changes:

```
BEFORE: 11 parallel queries (all with date filter)
AFTER:  12 parallel queries (8 no filter, 4 with filter)
         +1 query for DA_DONG

Impact:
- +1 query: Minimal (< 10ms)
- No filter = faster (no date index scan)
- Overall: SAME or SLIGHTLY FASTER ✅
```

#### Index Usage:

```javascript
// Queries without date filter use:
{ TrangThai: 1, NguoiYeuCauID: 1 } // Existing index

// Queries with date filter use:
{ TrangThai: 1, NgayDong: 1 }      // Existing index
{ TrangThai: 1, createdAt: 1 }     // Existing index

No new indexes needed ✅
```

---

### 🚀 Implementation Priority: P0 (Critical Fix)

**Severity:** 🔴 CRITICAL  
**Type:** Bug Fix (Business Logic)  
**Effort:** 30 minutes (backend + frontend)  
**Risk:** Low (isolated changes, good test coverage)  
**Deploy:** Can deploy independently of UX refactor

**Implementation Steps:**

1. ✅ Backend: Update `layBadgeCountsNangCao()` (5 edits)
2. ✅ Frontend: Update metrics arrays (2 edits)
3. ✅ Manual testing with Postman
4. ✅ UI testing with browser
5. ✅ Verify no regression

**ETA:** 30 minutes  
**Test Time:** 15 minutes  
**Total:** 45 minutes

---

## 🚀 Implementation Order:

### Sprint 0 (HOTFIX - Before UX Refactor):

**Priority:** 🔥 CRITICAL - Deploy ASAP

1. **Date Filter Logic Fix** (30 min) ⚠️ **MUST DO FIRST**
   - Backend: Update `layBadgeCountsNangCao()`
   - Frontend: Update metrics arrays
   - Add DA_DONG metric
   - Add urgent badges for DA_HOAN_THANH
2. **Testing** (15 min)
   - API tests with/without date range
   - UI tests with date range presets
   - Verify no regression
3. **Deploy** (10 min)
   - Can deploy independently
   - No database migration needed
   - Backwards compatible

**Total Sprint 0:** 55 minutes

---

### Sprint 1 (Week 1): YeuCau UX Refactor

1. YeuCau Dashboard refactor (4h)
   - Remove QuickActions
   - Make metrics clickable
   - Add FAB
2. CongViec Activities API (2h)
3. Test YeuCau changes (1h)

#### Sprint 2 (Week 1-2):

4. CongViec Dashboard enhancement (4h)
   - Add chips
   - Add activities UI
   - Add FAB
5. Integration testing (2h)
6. Documentation (0.5h)

---

## ✅ APPROVAL CHECKLIST

### Sprint 0 (Hotfix - Date Filter Logic):

- [x] Critical bug identified and documented
- [x] Business requirements clarified (ACTIVE vs COMPLETED)
- [x] Solution designed and reviewed
- [x] Backend changes documented (5 edits)
- [x] Frontend changes documented (2 edits)
- [x] Testing strategy defined
- [x] Performance impact assessed (minimal)
- [x] Breaking changes documented
- [x] Rollback plan prepared
- [ ] **READY TO IMPLEMENT** ← Waiting for approval

### Sprint 1-2 (UX Refactor):

- [x] Architecture reviewed and approved
- [ ] Design mockups reviewed by UI/UX team
- [ ] Technical feasibility confirmed
- [ ] Effort estimate agreed upon
- [ ] Priority/timeline set
- [ ] Backend API changes documented
- [ ] Testing strategy defined
- [ ] Success metrics defined
- [ ] Rollback plan prepared

**Next Action:** Implement Sprint 0 (Hotfix) immediately, then proceed with UX refactor

---

## 📝 SUMMARY OF CHANGES (V2.1)

### 🔥 Critical Additions (Sprint 0):

1. **Date Filter Logic Fix** - P0 Critical Bug Fix

   - ACTIVE statuses (MOI, DANG_XU_LY, DA_HOAN_THANH): Count ALL, no date filter
   - COMPLETED statuses (DA_DONG, TU_CHOI): Apply date filter
   - Impact: Users will see ALL pending work, not miss tasks

2. **DA_DONG Metric** - New field

   - Show "Đã đóng" count with NgayDong date filter
   - 6 metrics instead of 5 for toiGui section

3. **Urgent Badges** - UX Enhancement

   - DA_HOAN_THANH: Orange badge (chờ đánh giá, sắp auto-close)
   - Logic: Simple `count > 0` indicates pending reviews

4. **Label Updates** - Clarity
   - "Đã hoàn thành" → "Chờ đánh giá" (more accurate)
   - "Chờ xác nhận" → "Chờ đánh giá" (consistency)

### 📊 UX Refactor (Sprint 1-2):

- Remove QuickActions Grid from YeuCau
- Make all metrics clickable
- Add FAB for both dashboards
- Add Quick Nav Chips to CongViec
- Add Recent Activities to CongViec

**Total Effort:**

- Sprint 0 (Hotfix): 55 minutes ⚡
- Sprint 1-2 (UX): 13.5 hours
- **Grand Total:** ~14 hours

---

**Ready to implement?** ✅ YES

**Next step:** Create detailed component-level tasks in project management tool

---

**Document End** 🎉
