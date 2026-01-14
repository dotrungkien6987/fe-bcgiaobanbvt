# Phase 2 UI/UX - Yêu Cầu & KPI Dashboards

**Part 4 of 5**  
**Screens:** YeuCauDashboardPage + KPIDashboardPage  
**Type:** New Pages  
**Effort:** 6h (3h + 3h)  
**Status:** ❌ Need to Create

---

## 📱 Screen 1: YeuCauDashboardPage

### Layout (Mobile)

```
┌────────────────────────────────────────────────┐
│ ← Yêu Cầu                      [+ Tạo] [⋮]     │
├────────────────────────────────────────────────┤
│                                                │
│  📤 YÊU CẦU TÔI GỬI (6)           [Xem tất cả →]│
│  ┌──────────────────────────────────────────┐ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │   Mới    │ │Đang xử lý│ │Hoàn thành│ │ │
│  │  │    2     │ │    3     │ │    1     │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ⚠️ CẦN XỬ LÝ (4)                             │
│  ┌──────────────────────────────────────────┐ │
│  │ 🔴 YC-001: Yêu cầu báo cáo   [Quá hạn]   │ │
│  │ 🟠 YC-015: Xin tài liệu      [1 ngày]    │ │
│  │ 🟡 YC-023: Hỗ trợ kỹ thuật   [2 ngày]    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  👥 ĐIỀU PHỐI (2) [Manager only]              │
│  ┌──────────────────────────────────────────┐ │
│  │  ┌──────────┐ ┌──────────┐              │ │
│  │  │ Chờ phân │ │Đang xử lý│              │ │
│  │  │    1     │ │    1     │              │ │
│  │  └──────────┘ └──────────┘              │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📋 QUẢN LÝ KHOA (8) [Admin only]             │
│  ┌──────────────────────────────────────────┐ │
│  │  Tổng yêu cầu: 8                         │ │
│  │  Chờ phê duyệt: 3                        │ │
│  │  [Xem chi tiết →]                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 🗂️ Files: YeuCauDashboardPage

### Frontend Files

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/
├─ Dashboard/
│  ├─ YeuCauDashboardPage.js              [CREATE] ❌
│  └─ components/
│     ├─ YeuCauSentSection.js             [CREATE] ❌
│     ├─ YeuCauNeedActionSection.js       [CREATE] ❌
│     ├─ YeuCauManagerSection.js          [CREATE] ❌
│     └─ YeuCauAdminSection.js            [CREATE] ❌
│
└─ Ticket/
   └─ yeuCauSlice.js                      [REUSE] ✅
      └─ getBadgeCounts()                 [EXISTING]
```

### Backend Files

```
giaobanbv-be/modules/workmanagement/
└─ routes/
   └─ yeucau.api.js                       [VERIFY] ⚠️
      └─ GET /yeucau/badge-counts-page    [VERIFY NAME]
```

---

## 🎨 YeuCauDashboardPage Component

**File:** `Dashboard/YeuCauDashboardPage.js` [CREATE]

```javascript
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Stack, Typography, Button, Box } from "@mui/material";
import { Add } from "iconsax-react";
import useAuth from "hooks/useAuth";
import {
  getBadgeCounts,
  selectBadgeCounts,
  selectYeuCauLoading,
} from "../Ticket/yeuCauSlice";
import YeuCauSentSection from "./components/YeuCauSentSection";
import YeuCauNeedActionSection from "./components/YeuCauNeedActionSection";
import YeuCauManagerSection from "./components/YeuCauManagerSection";
import YeuCauAdminSection from "./components/YeuCauAdminSection";

const YeuCauDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const badgeCounts = useSelector(selectBadgeCounts);
  const isLoading = useSelector(selectYeuCauLoading);

  const isManager = ["manager", "admin"].includes(user?.PhanQuyen);
  const isAdmin = user?.PhanQuyen === "admin";

  // Fetch badge counts for all pages
  useEffect(() => {
    const pageKeys = [
      "YEU_CAU_TOI_GUI",
      "YEU_CAU_TOI_XU_LY",
      ...(isManager ? ["YEU_CAU_DIEU_PHOI"] : []),
      ...(isAdmin ? ["YEU_CAU_QUAN_LY_KHOA"] : []),
    ];

    pageKeys.forEach((key) => {
      dispatch(getBadgeCounts(key));
    });
  }, [dispatch, isManager, isAdmin]);

  const handleCreate = () => {
    navigate("/quanlycongviec/yeucau/tao-moi");
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            📝 Yêu Cầu
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Tạo mới
          </Button>
        </Box>

        {/* Sent Section (All users) */}
        <YeuCauSentSection
          data={badgeCounts["YEU_CAU_TOI_GUI"]}
          onNavigate={() => navigate("/quanlycongviec/yeucau-toi-gui")}
        />

        {/* Need Action Section (All users) */}
        <YeuCauNeedActionSection
          data={badgeCounts["YEU_CAU_TOI_XU_LY"]}
          onNavigate={() => navigate("/quanlycongviec/yeucau-xu-ly")}
        />

        {/* Manager Section (Conditional) */}
        {isManager && (
          <YeuCauManagerSection
            data={badgeCounts["YEU_CAU_DIEU_PHOI"]}
            onNavigate={() => navigate("/quanlycongviec/yeucau-dieu-phoi")}
          />
        )}

        {/* Admin Section (Conditional) */}
        {isAdmin && (
          <YeuCauAdminSection
            data={badgeCounts["YEU_CAU_QUAN_LY_KHOA"]}
            onNavigate={() => navigate("/quanlycongviec/yeucau-quan-ly-khoa")}
          />
        )}
      </Stack>
    </Container>
  );
};

export default YeuCauDashboardPage;
```

**Estimated Lines:** ~150 lines

---

### YeuCauNeedActionSection (Priority List)

**File:** `Dashboard/components/YeuCauNeedActionSection.js` [CREATE]

```javascript
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const YeuCauNeedActionSection = ({ data, onNavigate }) => {
  const navigate = useNavigate();

  // Assume data includes priority items (can fetch separately if needed)
  const priorityItems = data?.priorityItems || [];

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            ⚠️ CẦN XỬ LÝ ({data?.total || 0})
          </Typography>
          <Button size="small" onClick={onNavigate}>
            Xem tất cả →
          </Button>
        </Box>

        <Stack spacing={1.5}>
          {priorityItems.slice(0, 3).map((item) => (
            <Box
              key={item._id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "warning.lighter",
                cursor: "pointer",
                "&:hover": { bgcolor: "warning.light" },
              }}
              onClick={() => navigate(`/yeucau/detail/${item._id}`)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" fontWeight={600} flex={1}>
                  {item.TieuDe}
                </Typography>
                <Chip
                  label={item.deadlineText || "Cần xử lý"}
                  size="small"
                  color="warning"
                />
              </Stack>
            </Box>
          ))}

          {priorityItems.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center">
              Không có yêu cầu cần xử lý
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default YeuCauNeedActionSection;
```

---

## 📱 Screen 2: KPIDashboardPage

### Layout (Mobile - Employee View)

```
┌────────────────────────────────────────────────┐
│ ← Đánh Giá KPI           [Lịch sử ▼] [⋮]      │
├────────────────────────────────────────────────┤
│                                                │
│  🎯 CHU KỲ HIỆN TẠI                [Đổi chu kỳ]│
│  ┌──────────────────────────────────────────┐ │
│  │  📅 Tháng 01/2026                        │ │
│  │  Từ 01/01 → 31/01                        │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📊 TIẾN ĐỘ CỦA TÔI                           │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │     Điểm hiện tại: 85/100               │ │
│  │     ━━━━━━━━━━━━━░░░░ 85%              │ │
│  │                                          │ │
│  │  ✅ Đã duyệt: 8/12 nhiệm vụ             │ │
│  │  ⏳ Chờ đánh giá: 3 nhiệm vụ            │ │
│  │  📝 Chưa đánh giá: 1 nhiệm vụ           │ │
│  │                                          │ │
│  │  [📝 Tự đánh giá ngay →]                │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  📋 NHIỆM VỤ THƯỜNG QUY (12)                  │
│  ┌──────────────────────────────────────────┐ │
│  │ ✅ NVTQ-01: Báo cáo tuần       [85 điểm] │ │
│  │ ✅ NVTQ-05: Kiểm tra hồ sơ     [90 điểm] │ │
│  │ ⏳ NVTQ-08: Họp định kỳ        [Chờ ĐG] │ │
│  │ 📝 NVTQ-12: Đào tạo            [Chưa ĐG]│ │
│  │              ... (xem tất cả)            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Layout (Manager View - Additional Section)

```
│  👥 NHÓM TÔI QUẢN LÝ (5 người)    [Xem chi tiết →]│
│  ┌──────────────────────────────────────────┐ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │Hoàn thành│ │Đang đánh│ │  Chưa    │ │ │
│  │  │    2     │ │   giá   │ │bắt đầu   │ │ │
│  │  │          │ │    2    │ │    1     │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ │ │
│  └──────────────────────────────────────────┘ │
```

---

## 🗂️ Files: KPIDashboardPage

### Frontend Files

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/
├─ Dashboard/
│  ├─ KPIDashboardPage.js                 [CREATE] ❌
│  └─ components/
│     ├─ CycleSelector.js                 [CREATE] ❌
│     ├─ PersonalKPIProgress.js           [CREATE] ❌
│     ├─ NhiemVuList.js                   [CREATE] ❌
│     └─ TeamKPISection.js                [CREATE] ❌ (manager)
│
└─ KPI/
   └─ kpiSlice.js                         [REUSE] ✅
      ├─ getDanhGiaKPIs()                 [EXISTING]
      └─ getNhanVienCoTheGiaoViec()       [EXISTING]
```

### Backend Files

```
giaobanbv-be/modules/workmanagement/
└─ routes/
   └─ kpi.api.js                          [REUSE] ✅
      ├─ GET /kpi/dashboard/:cycleId      [EXISTING]
      └─ GET /kpi/nhanvien/:nhanVienId    [EXISTING]
```

---

## 🎨 KPIDashboardPage Component

**File:** `Dashboard/KPIDashboardPage.js` [CREATE]

```javascript
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Stack, Typography, Box } from "@mui/material";
import useAuth from "hooks/useAuth";
import {
  getDanhGiaKPIs,
  getNhanVienCoTheGiaoViec,
  selectDanhGiaKPIs,
  selectKPILoading,
} from "../KPI/kpiSlice";
import CycleSelector from "./components/CycleSelector";
import PersonalKPIProgress from "./components/PersonalKPIProgress";
import NhiemVuList from "./components/NhiemVuList";
import TeamKPISection from "./components/TeamKPISection";

const KPIDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  const [selectedCycle, setSelectedCycle] = useState(null);

  const danhGiaKPIs = useSelector(selectDanhGiaKPIs);
  const isLoading = useSelector(selectKPILoading);

  const isManager = ["manager", "admin"].includes(user?.PhanQuyen);

  // Fetch KPI data on mount/cycle change
  useEffect(() => {
    if (nhanVienId && selectedCycle) {
      dispatch(
        getDanhGiaKPIs({
          nhanVienId,
          chuKyId: selectedCycle._id,
        })
      );
    }
  }, [dispatch, nhanVienId, selectedCycle]);

  // Fetch team data for managers
  useEffect(() => {
    if (isManager && selectedCycle) {
      dispatch(getNhanVienCoTheGiaoViec(selectedCycle._id));
    }
  }, [dispatch, isManager, selectedCycle]);

  const handleCycleChange = (cycle) => {
    setSelectedCycle(cycle);
  };

  const handleNavigateToSelfAssess = () => {
    navigate("/quanlycongviec/tu-danh-gia-kpi");
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 10 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            🏆 Đánh Giá KPI
          </Typography>
          <CycleSelector value={selectedCycle} onChange={handleCycleChange} />
        </Box>

        {/* Personal Progress */}
        <PersonalKPIProgress
          data={danhGiaKPIs}
          cycleInfo={selectedCycle}
          onNavigate={handleNavigateToSelfAssess}
          isLoading={isLoading}
        />

        {/* Nhiệm vụ list */}
        <NhiemVuList
          danhGiaKPIs={danhGiaKPIs}
          onNavigate={(id) => navigate(`/quanlycongviec/xem-kpi/${id}`)}
        />

        {/* Team Section (Manager only) */}
        {isManager && (
          <TeamKPISection
            cycleId={selectedCycle?._id}
            onNavigate={() =>
              navigate(
                `/quanlycongviec/danh-gia-kpi?cycleId=${selectedCycle._id}`
              )
            }
          />
        )}
      </Stack>
    </Container>
  );
};

export default KPIDashboardPage;
```

**Estimated Lines:** ~180 lines

---

### PersonalKPIProgress Component

**File:** `Dashboard/components/PersonalKPIProgress.js` [CREATE]

```javascript
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";

const PersonalKPIProgress = ({ data, cycleInfo, onNavigate, isLoading }) => {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={200} />;
  }

  // Calculate stats
  const total = data?.length || 0;
  const approved = data?.filter((d) => d.TrangThai === "DA_DUYET").length || 0;
  const pending = data?.filter((d) => d.TrangThai === "CHUA_DUYET").length || 0;
  const notStarted = total - approved - pending;

  // Calculate average score (only approved)
  const approvedScores = data
    ?.filter((d) => d.TrangThai === "DA_DUYET" && d.TongDiemKPI)
    .map((d) => d.TongDiemKPI);
  const avgScore =
    approvedScores?.length > 0
      ? Math.round(
          approvedScores.reduce((a, b) => a + b, 0) / approvedScores.length
        )
      : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 TIẾN ĐỘ CỦA TÔI
        </Typography>

        {/* Score Display */}
        <Box my={3} textAlign="center">
          <Typography variant="h3" fontWeight={700} color="primary">
            {avgScore}/100
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Điểm trung bình
          </Typography>

          <Box mt={2}>
            <LinearProgress
              variant="determinate"
              value={avgScore}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} justifyContent="space-around">
          <Box textAlign="center">
            <Chip label={`${approved}/${total}`} color="success" />
            <Typography variant="caption" display="block" mt={0.5}>
              Đã duyệt
            </Typography>
          </Box>
          <Box textAlign="center">
            <Chip label={pending} color="warning" />
            <Typography variant="caption" display="block" mt={0.5}>
              Chờ đánh giá
            </Typography>
          </Box>
          <Box textAlign="center">
            <Chip label={notStarted} color="default" />
            <Typography variant="caption" display="block" mt={0.5}>
              Chưa đánh giá
            </Typography>
          </Box>
        </Stack>

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={onNavigate}
        >
          📝 Tự đánh giá ngay
        </Button>
      </CardContent>
    </Card>
  );
};

export default PersonalKPIProgress;
```

---

### CycleSelector Component

**File:** `Dashboard/components/CycleSelector.js` [CREATE]

```javascript
import React, { useEffect, useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from "@mui/material";
import apiService from "app/apiService";

const CycleSelector = ({ value, onChange }) => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await apiService.get(
          "/workmanagement/chu-ky-danh-gia"
        );
        const cycleList = response.data.data || [];
        setCycles(cycleList);

        // Auto-select current cycle
        const currentCycle = cycleList.find((c) => c.isActive) || cycleList[0];
        if (currentCycle && !value) {
          onChange(currentCycle);
        }
      } catch (error) {
        console.error("Error fetching cycles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Chu kỳ</InputLabel>
      <Select
        value={value?._id || ""}
        onChange={(e) => {
          const selected = cycles.find((c) => c._id === e.target.value);
          onChange(selected);
        }}
        label="Chu kỳ"
        disabled={loading}
      >
        {cycles.map((cycle) => (
          <MenuItem key={cycle._id} value={cycle._id}>
            <Box>
              <Typography variant="body2">{cycle.TenChuKy}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(cycle.NgayBatDau).toLocaleDateString("vi-VN")} →{" "}
                {new Date(cycle.NgayKetThuc).toLocaleDateString("vi-VN")}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CycleSelector;
```

---

## 🔌 API Integration

### YeuCau Dashboard

**Reuses existing:** `getBadgeCounts()` from `yeuCauSlice.js`

**API Call:**

```javascript
// Already implemented
GET / api / workmanagement / yeucau / badge - counts - page;
?pageKey = YEU_CAU_TOI_GUI;
```

**No new backend APIs needed** ✅

---

### KPI Dashboard

**Reuses existing:**

- `getDanhGiaKPIs()` from `kpiSlice.js`
- `getNhanVienCoTheGiaoViec()` for manager view

**API Calls:**

```javascript
// Personal KPI
GET /api/workmanagement/kpi/nhanvien/:nhanVienId?chuKyId=...

// Manager view
GET /api/workmanagement/kpi/dashboard/:cycleId
```

**No new backend APIs needed** ✅

---

## 🎬 User Interactions

### YeuCau: Role-based Sections

```
Employee user loads page
   ↓
Sees 2 sections: "Tôi gửi" + "Cần xử lý"
   ↓
Manager user loads page
   ↓
Sees 3 sections: +  "Điều phối"
   ↓
Admin user loads page
   ↓
Sees 4 sections: + "Quản lý khoa"
```

### KPI: Cycle Change

```
User on KPIDashboardPage
   ↓
Tap cycle selector dropdown
   ↓
Select "Tháng 12/2025"
   ↓
onChange(selectedCycle)
   ↓
Re-fetch KPI data: getDanhGiaKPIs(nhanVienId, newCycleId)
   ↓
Update PersonalKPIProgress + NhiemVuList
```

---

## ✅ Acceptance Criteria

### YeuCauDashboardPage

- [ ] Page loads badge counts for all sections
- [ ] Sent section displays 3 status cards
- [ ] Need action section shows priority list (top 3)
- [ ] Manager section only visible if role = manager/admin
- [ ] Admin section only visible if role = admin
- [ ] Tapping section navigates to correct list page

### KPIDashboardPage

- [ ] Cycle selector loads available cycles
- [ ] Current cycle auto-selected on mount
- [ ] Personal progress card shows: score, approved count, pending count
- [ ] Nhiệm vụ list displays all routine duties with status
- [ ] Manager section only visible if role = manager/admin
- [ ] Changing cycle refreshes all data
- [ ] "Tự đánh giá" button navigates to self-assessment page

---

**Next:** [Part 5 - Components & Navigation →](./UI_UX_05_COMPONENTS_NAV.md)
