# 📑 YÊU CẦU TAB CONFIGURATION SYSTEM

> **Single Source of Truth** cho toàn bộ tab management trong hệ thống Yêu Cầu  
> **Version**: 2.0  
> **Date**: December 2025

---

## 📚 MỤC LỤC

1. [Tổng quan](#-tổng-quan)
2. [Kiến trúc 3 tầng](#-kiến-trúc-3-tầng)
3. [Config Layer - SSOT](#-layer-1-config-single-source-of-truth)
4. [Hook Layer - Logic](#%EF%B8%8F-layer-2-hook-logic-layer)
5. [Page Layer - UI + Data](#%EF%B8%8F-layer-3-page-ui--data-layer)
6. [Flow chi tiết](#-flow-hoạt-động-chi-tiết)
7. [Ví dụ thực tế](#-ví-dụ-thực-tế)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 TỔNG QUAN

### Vấn đề ban đầu

Trước đây, mỗi page có **hardcoded TABS array** riêng:

```javascript
// ❌ Vấn đề cũ: Hardcoded ở mỗi page
const TABS = [
  { value: "cho-phan-hoi", label: "Chờ phản hồi", ... },
  { value: "dang-xu-ly", label: "Đang xử lý", ... },
  // ...
];
```

**Hậu quả**:

- 🔴 Khó maintain khi cần thêm/sửa/xóa tab
- 🔴 Logic filter phân tán ở nhiều nơi
- 🔴 Dễ inconsistent giữa các pages
- 🔴 Timing issue khi chuyển route

### Giải pháp mới

✅ **Single Source of Truth** (config file)  
✅ **Centralized logic** (hook)  
✅ **Two-phase loading** (redirect → load data)

---

## 🏗️ KIẾN TRÚC 3 TẦNG

```
┌─────────────────────────────────────────────────────────────────┐
│                    YEU CẦU TAB SYSTEM                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   CONFIG     │───▶│    HOOK      │───▶│    PAGES     │    │
│  │   (SSOT)     │    │   (Logic)    │    │  (UI + Data) │    │
│  │              │    │              │    │              │    │
│  │ • Tab định  │    │ • Validate   │    │ • Redirect   │    │
│  │   nghĩa      │    │ • Build      │    │ • Load data  │    │
│  │ • Params     │    │   params     │    │ • Render UI  │    │
│  │ • Actions    │    │ • Check      │    │              │    │
│  │              │    │   redirect   │    │              │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phân tách trách nhiệm

| Layer      | File                 | Trách nhiệm                                | Output                       |
| ---------- | -------------------- | ------------------------------------------ | ---------------------------- |
| **Config** | `yeuCauTabConfig.js` | Định nghĩa tabs, params, actions           | Page configs                 |
| **Hook**   | `useYeuCauTabs.js`   | Validate tab, build params, check redirect | `needsRedirect`, `apiParams` |
| **Page**   | `YeuCauXxxPage.js`   | Redirect URL, load data, render UI         | User interface               |

---

## 📦 LAYER 1: CONFIG (Single Source of Truth)

### File: `config/yeuCauTabConfig.js`

Đây là **nơi duy nhất** định nghĩa tất cả tabs cho 4 pages.

### Cấu trúc Page Config

```javascript
export const YEU_CAU_TOI_GUI_CONFIG = {
  // ============ META INFO ============
  pageKey: "YEU_CAU_TOI_GUI", // Unique key
  title: "Yêu cầu tôi gửi đi", // Page title
  icon: "📤", // Page icon
  route: "/yeu-cau-toi-gui", // Route path
  description: "Các yêu cầu do tôi tạo",

  // ============ BACKEND PARAMS ============
  // Base params áp dụng cho TẤT CẢ tabs trong page này
  baseParams: {
    tab: "toi-gui", // Backend filter: NguoiYeuCauID = myNhanVienId
  },

  // ============ PAGINATION ============
  pagination: {
    limit: 20, // Default items per page
  },

  // ============ TABS DEFINITION ============
  tabs: [
    {
      key: "cho-phan-hoi", // ← Tab key (dùng trong URL)
      label: "Chờ tiếp nhận", // ← Label hiển thị
      icon: "HourglassEmpty", // ← Icon name (map với React component)
      color: "info", // ← MUI color
      params: {
        // ← Params RIÊNG của tab này
        trangThai: "MOI",
      },
      description: "Yêu cầu đã gửi, chưa ai tiếp nhận",
      emptyMessage: "Không có yêu cầu nào đang chờ phản hồi",
    },
    {
      key: "dang-xu-ly",
      label: "Đang xử lý",
      icon: "Build",
      color: "warning",
      params: { trangThai: "DANG_XU_LY" },
      description: "Có người đang xử lý yêu cầu của bạn",
    },
    // ... các tabs khác
  ],

  // ============ ACTIONS (Optional) ============
  actions: {
    canCreate: true,
    canEdit: (yeuCau) => yeuCau.TrangThai === "MOI",
    canDelete: (yeuCau) => yeuCau.TrangThai === "MOI",
    canRate: (yeuCau) => yeuCau.TrangThai === "DA_HOAN_THANH",
  },
};
```

### Các Page Config hiện có

| Page Key               | Title                | Backend Tab Filter | Số tabs |
| ---------------------- | -------------------- | ------------------ | ------- |
| `YEU_CAU_TOI_GUI`      | Yêu cầu tôi gửi đi   | `tab=toi-gui`      | 5 tabs  |
| `YEU_CAU_TOI_XU_LY`    | Yêu cầu tôi xử lý    | `tab=toi-xu-ly`    | 4 tabs  |
| `YEU_CAU_DIEU_PHOI`    | Điều phối yêu cầu    | `khoaDichId`       | 5 tabs  |
| `YEU_CAU_QUAN_LY_KHOA` | Quản lý yêu cầu khoa | `khoaDichId`       | 4 tabs  |

### Helper Functions

```javascript
// 1. Build API params từ page + tab
buildTabParams(pageKey, tabKey, user);
// Returns: { page: 1, limit: 20, tab: "...", trangThai: "..." }

// 2. Lấy default tab (tab đầu tiên)
getDefaultTab(pageKey);
// Returns: "cho-phan-hoi"

// 3. Validate tab key
isValidTab(pageKey, tabKey);
// Returns: true/false

// 4. Lấy config của 1 tab cụ thể
getTabConfig(pageKey, tabKey);
// Returns: { key: "...", label: "...", ... }
```

### Ví dụ params được build

```javascript
// Input:
const params = buildTabParams("YEU_CAU_TOI_GUI", "cho-phan-hoi", user);

// Output:
{
  page: 1,
  limit: 20,
  tab: "toi-gui",        // từ baseParams
  trangThai: "MOI"       // từ tab.params
}
```

---

## ⚙️ LAYER 2: HOOK (Logic Layer)

### File: `hooks/useYeuCauTabs.js`

Hook này **KHÔNG** gọi `setSearchParams()` nữa, chỉ tính toán logic.

### Function Signature

```javascript
export function useYeuCauTabs(
  pageKey: string,   // "YEU_CAU_TOI_GUI", "YEU_CAU_TOI_XU_LY", ...
  urlTab: string     // Tab từ URL (có thể null)
)
```

### Return Values

```javascript
{
  // ======= PAGE INFO =======
  pageConfig: Object,           // Config object của page
  pageTitle: string,            // "Yêu cầu tôi gửi đi"
  pageIcon: string,             // "📤"
  pageDescription: string,      // Description text

  // ======= TABS INFO =======
  tabs: Array,                  // Danh sách tabs [{ key, label, icon, ... }]
  activeTab: string,            // Tab đang active
  activeTabInfo: Object,        // Config của active tab
  defaultTab: string,           // Tab default (tab đầu tiên)

  // ======= KEY FLAG =======
  needsRedirect: boolean,       // ← Quan trọng! Page check để biết cần redirect

  // ======= API PARAMS =======
  apiParams: Object,            // { page, limit, tab, trangThai, ... }
  getParamsForTab: Function,    // Helper để get params của tab khác

  // ======= ACTIONS =======
  canPerformAction: Function,   // Check xem có thể thực hiện action không

  // ======= HELPERS =======
  isLoaded: boolean             // Config + user đã sẵn sàng
}
```

### Logic Flow trong Hook

```javascript
export function useYeuCauTabs(pageKey, urlTab) {
  const { user } = useAuth();

  // STEP 1: Lấy page config
  const pageConfig = ALL_YEU_CAU_CONFIGS[pageKey];

  // STEP 2: Lấy default tab
  const defaultTab = getDefaultTab(pageKey);

  // STEP 3: Xác định active tab
  const activeTab = useMemo(() => {
    // Nếu urlTab valid → dùng urlTab
    if (urlTab && isValidTab(pageKey, urlTab)) {
      return urlTab;
    }
    // Không valid → dùng default
    return defaultTab;
  }, [pageKey, urlTab, defaultTab]);

  // STEP 4: Check cần redirect không
  const needsRedirect = useMemo(() => {
    // Cần redirect nếu:
    // - Chưa có tab trong URL (!urlTab)
    // - Hoặc tab không khớp với activeTab
    return !urlTab || urlTab !== activeTab;
  }, [urlTab, activeTab]);

  // STEP 5: Build API params
  const apiParams = useMemo(() => {
    if (!activeTab || !user?.NhanVienID) return null;
    return buildTabParams(pageKey, activeTab, user);
  }, [pageKey, activeTab, user]);

  return {
    tabs: pageConfig.tabs,
    activeTab,
    needsRedirect, // ← KEY: Page dùng để biết có cần redirect
    apiParams,
    isLoaded: !!pageConfig && !!user?.NhanVienID,
    // ... other values
  };
}
```

### Bảng Truth Table cho `needsRedirect`

| Scenario     | urlTab           | activeTab        | needsRedirect | Giải thích                           |
| ------------ | ---------------- | ---------------- | ------------- | ------------------------------------ |
| Vào page mới | `null`           | `"cho-phan-hoi"` | `true`        | Chưa có tab trong URL                |
| Sau redirect | `"cho-phan-hoi"` | `"cho-phan-hoi"` | `false`       | Tab đã đúng                          |
| Click tab    | `"dang-xu-ly"`   | `"dang-xu-ly"`   | `false`       | Tab đã được set                      |
| Tab invalid  | `"xxx"`          | `"cho-phan-hoi"` | `true`        | Tab không tồn tại → fallback default |

---

## 🖥️ LAYER 3: PAGE (UI + Data Layer)

### Pattern chuẩn cho tất cả pages

```javascript
function YeuCauXxxPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  // ==========================================
  // SECTION 1: HOOK DATA
  // ==========================================
  const {
    tabs,
    activeTab,
    activeTabInfo,
    apiParams,
    pageTitle,
    pageIcon,
    isLoaded,
    needsRedirect, // ← KEY FLAG
  } = useYeuCauTabs("PAGE_KEY", urlTab);

  const { yeuCauList, isLoading } = useSelector((state) => state.yeuCau);

  // ==========================================
  // SECTION 2: EFFECT 1 - REDIRECT
  // ==========================================
  // Chạy TRƯỚC, chỉ set URL
  useEffect(() => {
    if (needsRedirect && activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [needsRedirect, activeTab, setSearchParams]);

  // ==========================================
  // SECTION 3: EFFECT 2 - LOAD DATA
  // ==========================================
  // Chạy SAU, chỉ khi needsRedirect = false
  useEffect(() => {
    // Guard clauses
    if (!isLoaded) return; // Chưa có config/user
    if (!apiParams) return; // Chưa build được params
    if (needsRedirect) return; // ← KEY: Chưa redirect xong

    // Load data
    dispatch(getYeuCauList(apiParams));
  }, [dispatch, isLoaded, apiParams, needsRedirect]);

  // ==========================================
  // SECTION 4: HANDLERS
  // ==========================================
  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue });
  };

  const handleViewDetail = (yeuCau) => {
    navigate(`/yeu-cau/${yeuCau._id}`);
  };

  // ==========================================
  // SECTION 5: RENDER
  // ==========================================
  return (
    <Box>
      <Typography variant="h4">
        {pageIcon} {pageTitle}
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange}>
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            label={tab.label}
            icon={ICON_MAP[tab.icon]}
          />
        ))}
      </Tabs>

      <YeuCauList
        yeuCauList={yeuCauList}
        loading={isLoading}
        emptyMessage={activeTabInfo?.emptyMessage}
      />
    </Box>
  );
}
```

### Icon Mapping Pattern

Mỗi page cần define ICON_MAP để map string name sang React component:

```javascript
import {
  HourglassEmpty,
  Build,
  RateReview,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

const ICON_MAP = {
  HourglassEmpty: <HourglassEmpty />,
  Build: <Build />,
  RateReview: <RateReview />,
  CheckCircle: <CheckCircle />,
  Cancel: <Cancel />,
};
```

### Dependencies của 2 Effects

```javascript
// Effect 1: Redirect
useEffect(() => {
  // ...
}, [needsRedirect, activeTab, setSearchParams]);
//  ↑            ↑             ↑
//  Flag check   Tab to set    Setter function

// Effect 2: Load Data
useEffect(() => {
  // ...
}, [dispatch, isLoaded, apiParams, needsRedirect]);
//  ↑         ↑         ↑          ↑
//  Action    Ready     Params     Gate keeper
```

---

## 🔄 FLOW HOẠT ĐỘNG CHI TIẾT

### Scenario 1: Vào page mới từ menu (không có `?tab`)

```
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: Component Mount                                     │
├─────────────────────────────────────────────────────────────┤
│ URL: /yeu-cau-toi-gui                                       │
│ urlTab = null                                               │
│                                                             │
│ User → Click menu "Yêu cầu tôi gửi"                         │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: Hook Calculation                                    │
├─────────────────────────────────────────────────────────────┤
│ Input:                                                      │
│   pageKey = "YEU_CAU_TOI_GUI"                              │
│   urlTab = null                                             │
│                                                             │
│ Hook tính toán:                                             │
│   activeTab = "cho-phan-hoi" (default tab)                 │
│   needsRedirect = true (vì urlTab != activeTab)            │
│   apiParams = {                                             │
│     page: 1,                                                │
│     limit: 20,                                              │
│     tab: "toi-gui",                                         │
│     trangThai: "MOI"                                        │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: Effect 1 Chạy (Redirect)                            │
├─────────────────────────────────────────────────────────────┤
│ Check điều kiện:                                            │
│   needsRedirect = true ✅                                   │
│   activeTab = "cho-phan-hoi" ✅                             │
│                                                             │
│ Action:                                                     │
│   setSearchParams({ tab: "cho-phan-hoi" }, { replace })    │
│                                                             │
│ URL thay đổi:                                               │
│   /yeu-cau-toi-gui → /yeu-cau-toi-gui?tab=cho-phan-hoi     │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 4: Effect 2 SKIP (Load Data)                           │
├─────────────────────────────────────────────────────────────┤
│ Check điều kiện:                                            │
│   isLoaded = true ✅                                        │
│   apiParams = {...} ✅                                      │
│   needsRedirect = true ❌ → return sớm                      │
│                                                             │
│ Kết quả: KHÔNG gọi API                                     │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 5: Re-render (do URL thay đổi)                         │
├─────────────────────────────────────────────────────────────┤
│ URL mới: /yeu-cau-toi-gui?tab=cho-phan-hoi                 │
│ urlTab = "cho-phan-hoi"                                    │
│                                                             │
│ Hook tính lại:                                              │
│   activeTab = "cho-phan-hoi"                               │
│   needsRedirect = false (vì urlTab == activeTab)           │
│   apiParams = {...} (giống cũ)                              │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 6: Effect 1 SKIP                                       │
├─────────────────────────────────────────────────────────────┤
│ Check điều kiện:                                            │
│   needsRedirect = false ❌                                  │
│                                                             │
│ Kết quả: Không chạy                                        │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 7: Effect 2 CHẠY (Load Data) ✅                        │
├─────────────────────────────────────────────────────────────┤
│ Check điều kiện:                                            │
│   isLoaded = true ✅                                        │
│   apiParams = {...} ✅                                      │
│   needsRedirect = false ✅                                  │
│                                                             │
│ Action:                                                     │
│   dispatch(getYeuCauList(apiParams))                        │
│                                                             │
│ Backend API call:                                           │
│   GET /workmanagement/yeucau?page=1&limit=20&              │
│       tab=toi-gui&trangThai=MOI                             │
│                                                             │
│ Redux update: yeuCauList = [...]                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 8: UI Render với Data                                  │
├─────────────────────────────────────────────────────────────┤
│ <Tabs value="cho-phan-hoi">                                 │
│   - Chờ tiếp nhận (active)                                 │
│   - Đang xử lý                                              │
│   - Chờ đánh giá                                            │
│ </Tabs>                                                     │
│                                                             │
│ <YeuCauList yeuCauList={[...]} />                           │
└─────────────────────────────────────────────────────────────┘
```

### Scenario 2: Click chuyển tab (trong cùng page)

```
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: User Click Tab                                      │
├─────────────────────────────────────────────────────────────┤
│ Current: ?tab=cho-phan-hoi                                  │
│ User click: "Đang xử lý" tab                                │
│                                                             │
│ handleTabChange():                                          │
│   setSearchParams({ tab: "dang-xu-ly" })                   │
│                                                             │
│ URL: /yeu-cau-toi-gui?tab=dang-xu-ly                        │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: Re-render                                           │
├─────────────────────────────────────────────────────────────┤
│ urlTab = "dang-xu-ly"                                       │
│                                                             │
│ Hook tính lại:                                              │
│   activeTab = "dang-xu-ly"                                 │
│   needsRedirect = false (urlTab == activeTab)              │
│   apiParams = {                                             │
│     page: 1,                                                │
│     limit: 20,                                              │
│     tab: "toi-gui",                                         │
│     trangThai: "DANG_XU_LY"  ← CHANGED                      │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: Effect 1 SKIP                                       │
├─────────────────────────────────────────────────────────────┤
│ needsRedirect = false ❌                                    │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 4: Effect 2 CHẠY                                       │
├─────────────────────────────────────────────────────────────┤
│ needsRedirect = false ✅                                    │
│ apiParams thay đổi (trangThai: DANG_XU_LY) ✅               │
│                                                             │
│ dispatch(getYeuCauList(apiParams))                          │
│ → Load data tab mới                                        │
└─────────────────────────────────────────────────────────────┘
```

### Scenario 3: Chuyển sang page khác

```
┌─────────────────────────────────────────────────────────────┐
│ User click menu: "Yêu cầu tôi xử lý"                        │
├─────────────────────────────────────────────────────────────┤
│ Route: /yeu-cau-toi-gui → /yeu-cau-xu-ly                    │
│                                                             │
│ Page cũ: Unmount                                           │
│ Page mới: Mount                                             │
│                                                             │
│ → Quay lại Scenario 1 (vào page mới)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 VÍ DỤ THỰC TẾ

### Ví dụ 1: Thêm tab mới

**Yêu cầu**: Thêm tab "Bị hủy" vào page "Yêu cầu tôi gửi"

**Bước 1**: Chỉ cần sửa config file

```javascript
// File: config/yeuCauTabConfig.js

export const YEU_CAU_TOI_GUI_CONFIG = {
  // ... giữ nguyên
  tabs: [
    // ... các tabs cũ
    {
      key: "bi-huy", // ← NEW TAB
      label: "Bị hủy",
      icon: "RemoveCircle",
      color: "default",
      params: { trangThai: "BI_HUY" },
      description: "Yêu cầu đã bị hủy",
    },
  ],
};
```

**Bước 2**: Thêm icon vào ICON_MAP (trong page)

```javascript
import { RemoveCircle } from "@mui/icons-material";

const ICON_MAP = {
  // ... icons cũ
  RemoveCircle: <RemoveCircle />, // ← NEW
};
```

**Xong!** Không cần sửa gì thêm.

### Ví dụ 2: Debug khi tab không load

**Triệu chứng**: Vào page, tab hiển thị nhưng không có data

**Cách debug**:

```javascript
// Thêm console.log trong page
useEffect(() => {
  console.log("🔍 Debug Info:", {
    isLoaded,
    apiParams,
    needsRedirect,
    activeTab,
    urlTab,
  });

  if (!isLoaded || !apiParams || needsRedirect) return;
  dispatch(getYeuCauList(apiParams));
}, [dispatch, isLoaded, apiParams, needsRedirect]);
```

**Check các case**:

| Case            | isLoaded | apiParams | needsRedirect | Kết quả              |
| --------------- | -------- | --------- | ------------- | -------------------- |
| User chưa login | `false`  | `null`    | `true`        | ❌ Không load (đúng) |
| Đang redirect   | `true`   | `{...}`   | `true`        | ❌ Không load (đúng) |
| Sẵn sàng        | `true`   | `{...}`   | `false`       | ✅ Load (đúng)       |

### Ví dụ 3: Custom params cho một page

**Yêu cầu**: Page "Điều phối" cần thêm params `khoaId`

```javascript
// File: config/yeuCauTabConfig.js

export const YEU_CAU_DIEU_PHOI_CONFIG = {
  // ... other configs

  // Dùng function thay vì object để access user
  getBaseParams: (user) => ({
    khoaDichId: user?.KhoaID?._id || user?.KhoaID,
  }),

  tabs: [
    {
      key: "moi-den",
      label: "Mới đến",
      params: {
        trangThai: "MOI",
        chuaDieuPhoi: true, // Custom param
      },
    },
  ],
};
```

Hook sẽ tự động gọi function này khi build params.

---

## 🐛 TROUBLESHOOTING

### Vấn đề 1: Data không load khi chuyển route

**Triệu chứng**: Click menu chuyển page, tab hiển thị nhưng list rỗng

**Nguyên nhân**: Effect 2 bị skip do `needsRedirect = true`

**Kiểm tra**:

```javascript
console.log("needsRedirect:", needsRedirect);
// Nếu luôn = true → Hook logic có vấn đề
```

**Fix**: Đảm bảo Effect 1 đã chạy xong và set URL

### Vấn đề 2: Infinite redirect loop

**Triệu chứng**: Page liên tục redirect, không dừng

**Nguyên nhân**: `activeTab` và `urlTab` không bao giờ khớp

**Kiểm tra**:

```javascript
console.log({
  urlTab: searchParams.get("tab"),
  activeTab,
  needsRedirect,
});
```

**Fix**: Check `isValidTab()` logic trong config

### Vấn đề 3: Tab không switch

**Triệu chứng**: Click tab khác nhưng UI không đổi

**Nguyên nhân**: `handleTabChange` không set `searchParams` đúng

**Kiểm tra**:

```javascript
const handleTabChange = (event, newValue) => {
  console.log("Switching to:", newValue);
  setSearchParams({ tab: newValue });
};
```

**Fix**: Đảm bảo `newValue` match với `tab.key` trong config

### Vấn đề 4: Effect chạy nhiều lần

**Triệu chứng**: API được gọi liên tục

**Nguyên nhân**: Dependencies không ổn định

**Fix**: Dùng `useMemo` cho các object/array trong hook

```javascript
// ❌ Wrong: Object được tạo mới mỗi render
const apiParams = {
  page: 1,
  tab: activeTab,
};

// ✅ Correct: useMemo stable reference
const apiParams = useMemo(
  () => ({
    page: 1,
    tab: activeTab,
  }),
  [activeTab]
);
```

---

## 📋 CHECKLIST KHI THÊM PAGE MỚI

- [ ] **Config**: Thêm page config vào `yeuCauTabConfig.js`
- [ ] **Hook**: Gọi `useYeuCauTabs(pageKey, urlTab)` với đúng pageKey
- [ ] **Icon Map**: Define `ICON_MAP` với tất cả icons từ config
- [ ] **Effect 1**: Implement redirect effect với dependencies `[needsRedirect, activeTab, setSearchParams]`
- [ ] **Effect 2**: Implement load data effect với dependencies `[dispatch, isLoaded, apiParams, needsRedirect]`
- [ ] **Guard clause**: Check `needsRedirect` trong Effect 2
- [ ] **Render**: Dùng `tabs.map(tab => ...)` với `tab.key`
- [ ] **Testing**: Test 3 scenarios (vào page mới, switch tab, chuyển page)

---

## 🎓 KEY TAKEAWAYS

### ✅ DO (Nên làm)

- ✅ Luôn check `needsRedirect` trước khi load data
- ✅ Dùng `useMemo` cho tất cả computed values trong hook
- ✅ Tách Effect 1 (redirect) và Effect 2 (load data)
- ✅ Dùng `tab.key` (không phải `tab.value`)
- ✅ Thêm tab mới vào config file, không hardcode

### ❌ DON'T (Không nên)

- ❌ Không gọi `setSearchParams` trong hook
- ❌ Không dùng `JSON.stringify` để compare params
- ❌ Không merge redirect và load data vào 1 effect
- ❌ Không hardcode TABS array trong page
- ❌ Không bỏ qua `needsRedirect` flag

---

## 🔗 LIÊN KẾT LIÊN QUAN

- [Backend API Extensions](./BACKEND_API_EXTENSIONS.md)
- [Role-Based Views](./ROLE_BASED_VIEWS.md)
- [Implementation Complete](./IMPLEMENTATION_COMPLETE.md)

---

**Tác giả**: Development Team  
**Ngày cập nhật**: December 2025  
**Version**: 2.0
