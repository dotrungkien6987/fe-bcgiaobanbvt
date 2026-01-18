# 📋 KẾ HOẠCH: YeuCau Dashboard Native Mobile

**Ngày tạo:** 14/01/2026  
**Ước tính:** 6-7 giờ  
**Ưu tiên:** Mobile-first, Native UX

---

## 🎯 Mục tiêu

Rebuild YeuCauDashboardPage với:

1. ✅ Native mobile-first design
2. ✅ Reuse badge counts APIs (đồng bộ số liệu)
3. ✅ Date range filter (Preset only, Global scope)
4. ✅ Phân bố trạng thái theo góc nhìn khoa (Gửi đến / Gửi đi)
5. ✅ Recent activities timeline
6. ❌ Bỏ KPI metrics (rating, tỷ lệ đúng hạn)

---

## 📱 UI DESIGN - Mobile Native

### Layout Tổng quan

```
┌─────────────────────────────────────────────────────┐
│  📋 Dashboard Yêu cầu                     🔄        │
│  ─────────────────────────────────────────────────  │
│  [7 ngày] [30 ngày] [Tháng này] [Quý này]          │  ← Chip buttons
├─────────────────────────────────────────────────────┤
│                                                     │
│  📤 YÊU CẦU TÔI GỬI                          [→]   │  ← Click vào page
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Chờ     │ │ Đang    │ │ Chờ     │ │ Đã      │  │
│  │ phản hồi│ │ xử lý   │ │ đánh giá│ │ đóng    │  │
│  │    5    │ │    3    │ │    2    │ │    8    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                     │
│  📥 YÊU CẦU TÔI XỬ LÝ                        [→]   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Chờ     │ │ Đang    │ │ Chờ     │ │ Hoàn    │  │
│  │ tiếp nh │ │ xử lý   │ │ xác nhận│ │ thành   │  │
│  │    3    │ │    2    │ │    1    │ │   15    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                     │
│  📋 ĐIỀU PHỐI (if role)                      [→]   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Mới đến │ │ Đã điều │ │ Đang    │ │ Quá hạn │  │
│  │         │ │ phối    │ │ xử lý   │ │   ⚠️    │  │
│  │    8    │ │    5    │ │   12    │ │    2    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  📊 TỔNG QUAN KHOA                                  │
│  ─────────────────────────────────────────────────  │
│  [📥 Gửi đến khoa] [📤 Khoa gửi đi]    ← SegmentedControl
│                                                     │
│  Mới        ████████████░░░░░░░  35%  (18)         │  ← Horizontal bars
│  Đang xử lý ██████████████████░  52%  (27)         │
│  Hoàn thành ████░░░░░░░░░░░░░░░   8%  (4)          │
│  Đã đóng    ██░░░░░░░░░░░░░░░░░   5%  (3)          │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ⚡ THAO TÁC NHANH                                  │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  ➕ Tạo      │  │  📤 Tôi gửi  │                │  ← 2x2 grid
│  │  yêu cầu     │  │              │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  📥 Tôi      │  │  📋 Điều    │                │
│  │  xử lý       │  │  phối        │                │
│  └──────────────┘  └──────────────┘                │
│                                                     │
├─────────────────────────────────────────────────────┤
│  🕐 HOẠT ĐỘNG GẦN ĐÂY                              │
│  ─────────────────────────────────────────────────  │
│  │                                                  │
│  ├─ ✅ Nguyễn Văn A hoàn thành               2h   │
│  │     "Sửa máy in phòng 301"                      │
│  │                                                  │
│  ├─ 📥 Bạn được giao yêu cầu                 5h   │
│  │     "Kiểm tra hệ thống điện"                    │
│  │                                                  │
│  ├─ 📤 Bạn tạo yêu cầu mới                   1d   │
│  │     "Bổ sung vật tư y tế"                       │
│  │                                                  │
│  └─ ⭐ Đánh giá 5 sao                        2d   │
│        "Sửa máy lạnh phòng khám"                   │
│                                                     │
│  [Xem tất cả →]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Mobile Native Features

| Feature             | Implementation                                      |
| ------------------- | --------------------------------------------------- |
| **Date Filter**     | Horizontal scrollable Chips (MUI ToggleButtonGroup) |
| **Metric Cards**    | 2x2 grid trên mobile, 4 columns trên desktop        |
| **Phân bố TT**      | SegmentedControl + Horizontal progress bars         |
| **Quick Actions**   | 2x2 grid với icons lớn                              |
| **Timeline**        | Compact list với relative time                      |
| **Navigation**      | Click section header → navigate to full page        |
| **Pull to Refresh** | Wrap toàn dashboard                                 |

---

## 🔧 BACKEND TASKS

### Task B1: API Recent Activities (1.5h)

**Endpoint:** `GET /workmanagement/yeucau/recent-activities`

**Query params:**

```
?limit=10           // Số lượng activities
&khoaId=xxx         // Optional: filter theo khoa
```

**Response:**

```javascript
{
  success: true,
  data: [
    {
      _id: "activity_id",
      loaiHoatDong: "HOAN_THANH" | "TIEP_NHAN" | "TAO_MOI" | "DANH_GIA" | "TU_CHOI" | "DIEU_PHOI",
      nguoiThucHien: {
        _id: "nhanvien_id",
        HoTen: "Nguyễn Văn A"
      },
      yeuCau: {
        _id: "yeucau_id",
        TieuDe: "Yêu cầu sửa chữa...",
        MaYeuCau: "YC-2026-001"
      },
      chiTiet: "5 sao" | "Giao cho Nguyễn Văn A" | null,
      thoiGian: "2026-01-14T10:30:00Z",
      lienQuanDenToi: true  // Activity có liên quan đến user hiện tại
    }
  ]
}
```

**Implementation:**

- Aggregate từ YeuCau collection
- Sort by updatedAt DESC
- Filter: Liên quan đến user (NguoiYeuCauID, NguoiXuLyID, etc.) OR thuộc khoa user
- Limit 10

**File:** `giaobanbv-be/modules/workmanagement/controllers/yeuCauController.js`

---

### Task B2: API Status Distribution (1h)

**Endpoint:** `GET /workmanagement/yeucau/status-distribution`

**Query params:**

```
?khoaId=xxx         // Required: Khoa ID
&direction=in|out   // "in" = gửi đến khoa, "out" = khoa gửi đi
&tuNgay=2026-01-01  // Optional: filter ngày (cho closed states)
&denNgay=2026-01-14
```

**Response:**

```javascript
{
  success: true,
  data: {
    direction: "in",
    khoaTen: "Khoa CNTT",
    distribution: [
      { trangThai: "MOI", label: "Mới", count: 18, percent: 35, color: "info" },
      { trangThai: "DANG_XU_LY", label: "Đang xử lý", count: 27, percent: 52, color: "warning" },
      { trangThai: "DA_HOAN_THANH", label: "Hoàn thành", count: 4, percent: 8, color: "success" },
      { trangThai: "DA_DONG", label: "Đã đóng", count: 3, percent: 5, color: "default" },
    ],
    total: 52
  }
}
```

**Implementation:**

- Aggregation pipeline với $group by TrangThai
- Filter logic:
  - Active statuses (MOI, DANG_XU_LY): Không giới hạn ngày
  - Closed statuses (DA_HOAN_THANH, DA_DONG, TU_CHOI): Áp dụng tuNgay/denNgay

**File:** `giaobanbv-be/modules/workmanagement/controllers/yeuCauController.js`

---

### Task B3: Update Badge Counts để hỗ trợ Date Range (30min)

**Endpoint hiện tại:** `GET /workmanagement/yeucau/badge-counts/:pageKey`

**Thêm query params:**

```
?tuNgay=2026-01-01
&denNgay=2026-01-14
```

**Logic:**

- Active tabs (cho-phan-hoi, dang-xu-ly, etc.): KHÔNG áp dụng date filter
- Historical tabs (da-dong): Áp dụng date filter

---

## 🎨 FRONTEND TASKS

### Task F1: Component DateRangePresets (45min)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/components/DateRangePresets.js`

```javascript
/**
 * DateRangePresets - Horizontal scrollable date presets
 *
 * Props:
 * - value: "7d" | "30d" | "month" | "quarter"
 * - onChange: (preset, { tuNgay, denNgay }) => void
 *
 * Mobile: Horizontal scroll
 * Desktop: Inline chips
 */
const PRESETS = [
  { key: "7d", label: "7 ngày", getDates: () => {...} },
  { key: "30d", label: "30 ngày", getDates: () => {...} },
  { key: "month", label: "Tháng này", getDates: () => {...} },
  { key: "quarter", label: "Quý này", getDates: () => {...} },
];
```

---

### Task F2: Component DashboardMetricSection (1h)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/components/DashboardMetricSection.js`

```javascript
/**
 * DashboardMetricSection - Section hiển thị metrics từ badge counts
 *
 * Props:
 * - title: "📤 Yêu cầu tôi gửi"
 * - icon: <SendIcon />
 * - metrics: [{ key, label, value, color?, urgent? }]
 * - onNavigate: () => void  // Click header to navigate
 * - loading: boolean
 *
 * Layout:
 * - Mobile: 2x2 grid cards
 * - Desktop: 4 inline cards
 */
```

---

### Task F3: Component StatusDistributionCard (1h)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/components/StatusDistributionCard.js`

```javascript
/**
 * StatusDistributionCard - Phân bố trạng thái theo khoa
 *
 * Props:
 * - khoaId: string
 * - tuNgay, denNgay: Date
 *
 * Features:
 * - SegmentedControl: [Gửi đến khoa] [Khoa gửi đi]
 * - Horizontal progress bars với labels
 * - Loading skeleton
 * - Click bar to filter
 */
```

---

### Task F4: Component RecentActivitiesCard (1h)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/components/RecentActivitiesCard.js`

```javascript
/**
 * RecentActivitiesCard - Timeline hoạt động gần đây
 *
 * Props:
 * - limit: number (default 5 on mobile, 10 on desktop)
 * - onActivityClick: (activity) => void
 * - onViewAll: () => void
 *
 * Features:
 * - Compact timeline with icons
 * - Relative time (dayjs.fromNow())
 * - Click to navigate to detail
 * - "Xem tất cả" link
 */
```

---

### Task F5: Component QuickActionsGrid (30min)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/components/QuickActionsGrid.js`

**Đã có file này, cần update:**

- Đổi từ Iconsax → MUI icons
- Responsive 2x2 grid mobile
- Add badge counts

---

### Task F6: Main Page - YeuCauDashboardPage (1.5h)

**File:** `fe-bcgiaobanbvt/src/pages/YeuCauDashboardPage.js`

**Structure:**

```javascript
export default function YeuCauDashboardPage() {
  // State
  const [datePreset, setDatePreset] = useState("30d");
  const [dateRange, setDateRange] = useState({ tuNgay, denNgay });

  // Redux selectors
  const badgeToiGui = useSelector(selectBadgeCounts("YEU_CAU_TOI_GUI"));
  const badgeToiXuLy = useSelector(selectBadgeCounts("YEU_CAU_TOI_XU_LY"));
  const badgeDieuPhoi = useSelector(selectBadgeCounts("YEU_CAU_DIEU_PHOI"));

  // Roles
  const { isNguoiDieuPhoi, isQuanLyKhoa, khoaID } = useYeuCauRoles();

  // Load data
  useEffect(() => {
    dispatch(getBadgeCounts("YEU_CAU_TOI_GUI", dateRange));
    dispatch(getBadgeCounts("YEU_CAU_TOI_XU_LY", dateRange));
    if (isNguoiDieuPhoi) {
      dispatch(getBadgeCounts("YEU_CAU_DIEU_PHOI", dateRange));
    }
  }, [dateRange]);

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <Box sx={{ py: 2, px: { xs: 1, sm: 2, md: 3 }, pb: 10 }}>
        {/* Header + Date Filter */}
        <DashboardHeader />
        <DateRangePresets value={datePreset} onChange={...} />

        {/* Metric Sections */}
        <DashboardMetricSection title="📤 Yêu cầu tôi gửi" ... />
        <DashboardMetricSection title="📥 Yêu cầu tôi xử lý" ... />
        {isNguoiDieuPhoi && <DashboardMetricSection title="📋 Điều phối" ... />}

        {/* Status Distribution */}
        <StatusDistributionCard khoaId={khoaID} {...dateRange} />

        {/* Quick Actions */}
        <QuickActionsGrid roles={{ isNguoiDieuPhoi, isQuanLyKhoa }} />

        {/* Recent Activities */}
        <RecentActivitiesCard limit={5} />
      </Box>
    </PullToRefreshWrapper>
  );
}
```

---

### Task F7: Redux Slice Updates (30min)

**File:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/yeuCauSlice.js`

**Thêm:**

```javascript
// State
recentActivities: [],
recentActivitiesLoading: false,
statusDistribution: { in: null, out: null },
statusDistributionLoading: false,

// Thunks
export const fetchRecentActivities = (limit = 10) => async (dispatch) => {...}
export const fetchStatusDistribution = (khoaId, direction, dateRange) => async (dispatch) => {...}

// Selectors
export const selectRecentActivities = (state) => state.yeuCau.recentActivities;
export const selectStatusDistribution = (direction) => (state) =>
  state.yeuCau.statusDistribution[direction];
```

---

## 📋 CHECKLIST THỰC HIỆN

### Phase 1: Backend APIs (3h)

- [ ] B1: API Recent Activities (1.5h)
- [ ] B2: API Status Distribution (1h)
- [ ] B3: Update Badge Counts với date params (30min)

### Phase 2: Frontend Components (3.5h)

- [ ] F1: DateRangePresets component (45min)
- [ ] F2: DashboardMetricSection component (1h)
- [ ] F3: StatusDistributionCard component (1h)
- [ ] F4: RecentActivitiesCard component (1h)

### Phase 3: Integration (1h)

- [ ] F5: Update QuickActionsGrid (30min)
- [ ] F6: Rebuild YeuCauDashboardPage (đã có skeleton)
- [ ] F7: Redux slice updates (30min)

### Phase 4: Testing & Polish (30min)

- [ ] Test mobile responsive
- [ ] Test data sync với các page khác
- [ ] Test loading states
- [ ] Test error handling
- [ ] Remove YeuCauDashboardPageNew.js (cleanup)

---

## 🚀 Thứ tự Thực hiện

```
1. [Backend] B1 + B2 + B3 (APIs)
      ↓
2. [Frontend] F7 (Redux slice)
      ↓
3. [Frontend] F1 (DateRangePresets)
      ↓
4. [Frontend] F2 (DashboardMetricSection)
      ↓
5. [Frontend] F3 + F4 (StatusDistribution + RecentActivities)
      ↓
6. [Frontend] F5 + F6 (QuickActions + Main Page)
      ↓
7. Testing & Polish
```

---

## ⚠️ Lưu ý Quan trọng

### 🔴 CRITICAL: User vs NhanVien (Backend)

**ĐÂY LÀ NGUỒN LỖI #1 - PHẢI NHỚ:**

```javascript
// ❌ SAI - Dùng User._id cho YeuCau queries
const userId = req.userId; // User ID từ JWT
await YeuCau.find({ NguoiXuLyID: userId }); // Trả về 0 kết quả!

// ✅ ĐÚNG - Phải lấy NhanVienID từ User
const user = await User.findById(req.userId).lean();
const nhanVienId = user.NhanVienID; // NhanVien reference
await YeuCau.find({ NguoiXuLyID: nhanVienId }); // Đúng!
```

**Tất cả relationships trong YeuCau đều dùng NhanVien.\_id:**

- `NguoiYeuCauID`, `NguoiXuLyID`, `NguoiDuocDieuPhoiID`, `NguoiNhanID` → **NhanVien.\_id**

### Schema Fields Quan Trọng (Backend)

**YeuCau Model:**

- **Status:** `TrangThai` enum (MOI, DANG_XU_LY, DA_HOAN_THANH, DA_DONG, TU_CHOI)
- **User refs:** `NguoiYeuCauID`, `NguoiXuLyID`, `NguoiDuocDieuPhoiID` (→ NhanVien)
- **Department:** `KhoaNguonID`, `KhoaDichID` (→ Khoa)
- **Dates:** `createdAt`, `updatedAt`, `NgayTiepNhan`, `NgayHoanThanh`, `NgayDong`

**LichSuYeuCau Model (Activity Log):**

- `YeuCauID` → YeuCau reference
- `HanhDong` enum (20+ types: TAO_MOI, TIEP_NHAN, DIEU_PHOI, etc.)
- `NguoiThucHienID` → NhanVien
- `ThoiGian` → indexed descending
- **Already has all data needed for Recent Activities API!**

### Date Field Selection Logic (Backend)

**Chọn date field phù hợp với context:**

```javascript
// Yêu cầu "tôi gửi" → dùng createdAt (ngày tạo)
baseFilter.createdAt = { $gte: tuNgay, $lte: denNgay };

// Yêu cầu "tôi xử lý" → dùng NgayTiepNhan (ngày tiếp nhận)
baseFilter.NgayTiepNhan = {
  $gte: tuNgay,
  $lte: denNgay,
  $ne: null, // ← Quan trọng: loại yêu cầu chưa tiếp nhận
};

// Metrics "hoàn thành" → dùng NgayHoanThanh
baseFilter.NgayHoanThanh = { $gte: tuNgay, $lte: denNgay };
```

### Indexes & Performance (Backend)

**✅ Indexes đã có (không cần thêm):**

- `createdAt_-1` (descending)
- `NguoiXuLyID_1_TrangThai_1` (compound)
- `NgayTiepNhan_1_NhiemVuThuongQuyID_1_NguoiXuLyID_1` (compound)
- `TrangThai_1_NgayHoanThanh_1` (compound)
- LichSuYeuCau: `ThoiGian_-1`

**Expected Performance (1000-2000 records):**

- Simple count: ~5-10ms
- Aggregation: ~10-30ms
- Recent activities (limit 20): ~5-15ms
- Parallel counts (8 queries): ~20-40ms

### API Reusability Decisions (Backend)

**1. Recent Activities → Query LichSuYeuCau directly**

- ✅ Model đã có audit trail hoàn chỉnh
- ✅ Index sẵn có: `ThoiGian_-1`
- ✅ Không cần aggregate từ YeuCau

**2. Status Distribution → Reuse KPI dashboard pattern**

- ✅ Copy `$facet` aggregation từ `layDashboardMetrics`
- ✅ Same query complexity: O(n) với indexes

**3. Badge Counts → Extend existing, thêm date params**

- ✅ Parallel `Promise.all` cho 8 count queries
- ✅ Date filter chỉ áp dụng cho closed states

### Mobile Native Priorities

1. **Touch targets:** Min 44x44px cho tất cả interactive elements
2. **Spacing:** Padding 8-16px, gaps 8-12px
3. **Font sizes:** Body 14-16px, headers 18-24px
4. **Scrolling:** Smooth, horizontal scroll cho chips
5. **Loading:** Skeleton placeholders, không blank screens

### Data Sync

1. Badge counts từ dashboard PHẢI khớp với page counts
2. Khi CRUD action → invalidate cả dashboard và page caches
3. Pull-to-refresh → reload all sections

### Performance

1. Parallel API calls cho initial load
2. Debounce date filter changes (300ms)
3. Skeleton loading cho từng section riêng

---

## 📊 Estimated Total: 7-8 hours

| Phase       | Tasks             | Time      |
| ----------- | ----------------- | --------- |
| Backend     | B1 + B2 + B3      | 3h        |
| Components  | F1 + F2 + F3 + F4 | 3.75h     |
| Integration | F5 + F6 + F7      | 1h        |
| Testing     | All               | 0.5h      |
| **Total**   |                   | **8.25h** |

---

**Ready to implement!** 🚀

Bắt đầu từ Backend APIs (B1, B2, B3) → Frontend components → Integration.
