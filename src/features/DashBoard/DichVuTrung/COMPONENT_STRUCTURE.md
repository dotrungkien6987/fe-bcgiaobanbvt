# 🎨 COMPONENT STRUCTURE - DỊCH VỤ TRÙNG LẶP

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DichVuTrungDashboard                         │
│                   (Main Container Component)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              DichVuTrungFilters                          │  │
│  │  [DatePicker] [DatePicker] [☑ CĐHA XN TDCN] [Fetch]    │  │
│  │  [Preset Buttons: Hôm nay | 7 ngày | 30 ngày]           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           DichVuTrungStatistics (4 Cards)                │  │
│  │  [Total] [Patients] [Top Services] [Top Departments]    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              DichVuTrungTable                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Tabs: [Tất Cả] [Theo Dịch Vụ] [Theo Khoa]         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │            Data Table with Sorting             │  │  │
│  │  │            and Export CSV Button                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  [Pagination Controls]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
DichVuTrung/
├── DichVuTrungDashboard.js          # Main container (200 lines)
├── DichVuTrungFilters.js            # Date filters + presets (150 lines)
├── DichVuTrungStatistics.js         # 4 statistics cards (180 lines)
├── DichVuTrungTable.js              # 3-tab table (300 lines)
├── utils/
│   └── calculations.js               # Helper functions (100 lines)
├── IMPLEMENTATION_GUIDE.md
├── SQL_QUERY_TEMPLATE.md
├── API_CONTRACT.md
├── COMPONENT_STRUCTURE.md           # This file
└── DATA_FLOW.md
```

---

## 🧩 COMPONENT 1: DichVuTrungDashboard

### Purpose

Main container that orchestrates all child components and manages global state.

### Props

None (top-level component)

### State Management

```javascript
// Local state
const [fromDate, setFromDate] = useState(dayjs().subtract(30, "day"));
const [toDate, setToDate] = useState(dayjs());

// Redux selectors
const { duplicateServices, isLoading, error, total } = useSelector(
  (state) => state.dichvutrung
);
const dispatch = useDispatch();
```

### Key Functions

```javascript
const handleFetchData = () => {
  // Validate date range
  const diffDays = toDate.diff(fromDate, "day");
  if (diffDays > 60) {
    toast.error("Khoảng thời gian không được vượt quá 60 ngày");
    return;
  }

  // Dispatch Redux action
  dispatch(
    getDuplicateServices(
      fromDate.format("YYYY-MM-DD"),
      toDate.format("YYYY-MM-DD")
    )
  );
};
```

### Component Structure

```jsx
function DichVuTrungDashboard() {
  // State & hooks
  const [serviceTypes, setServiceTypes] = useState([
    "04CDHA",
    "03XN",
    "05TDCN",
  ]); // ✅ NEW

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DichVuTrungFilters
          fromDate={fromDate}
          toDate={toDate}
          serviceTypes={serviceTypes}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onServiceTypesChange={setServiceTypes}
          onFetch={handleFetchData}
          isLoading={isLoading}
        />
      </Grid>

      <Grid item xs={12}>
        <DichVuTrungStatistics
          data={duplicateServices}
          total={total}
          isLoading={isLoading}
        />
      </Grid>

      <Grid item xs={12}>
        <DichVuTrungTable data={duplicateServices} isLoading={isLoading} />
      </Grid>
    </Grid>
  );
}
```

### Dependencies

- Material-UI: Grid
- dayjs: Date handling
- react-redux: useDispatch, useSelector
- react-toastify: toast

---

## 🧩 COMPONENT 2: DichVuTrungFilters

### Purpose

Date range picker with validation and preset buttons.

### Props

```typescript
interface DichVuTrungFiltersProps {
  fromDate: Dayjs;
  toDate: Dayjs;
  serviceTypes: string[]; // ✅ NEW: ['04CDHA', '03XN', '05TDCN']
  onFromDateChange: (date: Dayjs) => void;
  onToDateChange: (date: Dayjs) => void;
  onServiceTypesChange: (types: string[]) => void; // ✅ NEW
  onFetch: () => void;
  isLoading: boolean;
}
```

### UI Elements

1. **From Date Picker** (Từ ngày)
2. **To Date Picker** (Đến ngày)
3. **Service Type Checkboxes:** ☑ CĐHA, ☑ XN, ☑ TDCN (✅ NEW)
4. **Preset Buttons**: "Hôm nay", "7 ngày qua", "30 ngày qua"
5. **Fetch Button**: "Xem Dữ Liệu" with loading state
6. **Warning Alert**: Shows if date range > 60 days

### Component Structure

```jsx
function DichVuTrungFilters({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onFetch,
  isLoading,
}) {
  const diffDays = toDate.diff(fromDate, "day");
  const [activePreset, setActivePreset] = useState("30days");

  const handlePresetToday = () => {
    const today = dayjs();
    onFromDateChange(today.startOf("day"));
    onToDateChange(today.endOf("day"));
    setActivePreset("today");
  };

  const handlePreset7Days = () => {
    const today = dayjs();
    onFromDateChange(today.subtract(6, "day").startOf("day"));
    onToDateChange(today.endOf("day"));
    setActivePreset("7days");
  };

  const handlePreset30Days = () => {
    const today = dayjs();
    onFromDateChange(today.subtract(29, "day").startOf("day"));
    onToDateChange(today.endOf("day"));
    setActivePreset("30days");
  };

  return (
    <MainCard title="Bộ Lọc">
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={(newValue) => {
                onFromDateChange(newValue);
                setActivePreset("custom");
              }}
              format="DD-MM-YYYY"
              maxDate={dayjs()}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={(newValue) => {
                onToDateChange(newValue);
                setActivePreset("custom");
              }}
              format="DD-MM-YYYY"
              maxDate={dayjs()}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant={activePreset === "today" ? "contained" : "outlined"}
              onClick={handlePresetToday}
              size="small"
            >
              Hôm nay
            </Button>
            <Button
              variant={activePreset === "7days" ? "contained" : "outlined"}
              onClick={handlePreset7Days}
              size="small"
            >
              7 ngày qua
            </Button>
            <Button
              variant={activePreset === "30days" ? "contained" : "outlined"}
              onClick={handlePreset30Days}
              size="small"
            >
              30 ngày qua
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onFetch}
              disabled={isLoading || diffDays > 60}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <SearchIcon />
              }
            >
              Xem Dữ Liệu
            </Button>
          </Stack>
        </Grid>

        {diffDays > 60 && (
          <Grid item xs={12}>
            <Alert severity="error">
              Khoảng thời gian không được vượt quá 60 ngày (hiện tại: {diffDays}{" "}
              ngày)
            </Alert>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
}
```

### Dependencies

- Material-UI: Grid, Stack, Button, Alert, CircularProgress
- MUI DatePicker: DatePicker, LocalizationProvider, AdapterDayjs
- dayjs

---

## 🧩 COMPONENT 3: DichVuTrungStatistics

### Purpose

Display 4 statistics cards with useMemo calculations from data.

### Props

```typescript
interface DichVuTrungStatisticsProps {
  data: Array<DuplicateServiceRecord>;
  total: number;
  isLoading: boolean;
}
```

### Calculations (useMemo)

```javascript
const statistics = useMemo(() => {
  if (!data || data.length === 0) {
    return {
      totalDuplicates: 0,
      uniquePatients: 0,
      topServices: [],
      topDepartments: [],
    };
  }

  // 1. Total duplicates (already from backend)
  const totalDuplicates = total;

  // 2. Unique patients
  const uniquePatients = new Set(data.map((d) => d.patientid)).size;

  // 3. Top 5 services
  const serviceMap = {};
  data.forEach((d) => {
    const key = `${d.servicepricecode}|${d.servicepricename}`;
    if (!serviceMap[key]) {
      serviceMap[key] = {
        code: d.servicepricecode,
        name: d.servicepricename,
        count: 0,
      };
    }
    serviceMap[key].count++;
  });

  const topServices = Object.values(serviceMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Top 5 departments (similar logic)
  const deptMap = {};
  data.forEach((d) => {
    const key = `${d.departmentgroupid}|${d.departmentgroupname}`;
    if (!deptMap[key]) {
      deptMap[key] = {
        id: d.departmentgroupid,
        name: d.departmentgroupname,
        count: 0,
      };
    }
    deptMap[key].count++;
  });

  const topDepartments = Object.values(deptMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalDuplicates, uniquePatients, topServices, topDepartments };
}, [data, total]);
```

### Component Structure

```jsx
function DichVuTrungStatistics({ data, total, isLoading }) {
  const statistics = useMemo(() => {
    /* calculations */
  }, [data, total]);

  return (
    <Grid container spacing={2}>
      {/* Card 1: Total Duplicates */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tổng dịch vụ trùng"
          value={statistics.totalDuplicates}
          color="error"
          icon={<WarningIcon />}
          isLoading={isLoading}
        />
      </Grid>

      {/* Card 2: Unique Patients */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Bệnh nhân bị ảnh hưởng"
          value={statistics.uniquePatients}
          color="warning"
          icon={<PeopleIcon />}
          isLoading={isLoading}
        />
      </Grid>

      {/* Card 3: Top Services */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCardList
          title="Top 5 Dịch vụ trùng nhiều"
          items={statistics.topServices}
          renderItem={(item) => `${item.name} (${item.count})`}
          isLoading={isLoading}
        />
      </Grid>

      {/* Card 4: Top Departments */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCardList
          title="Top 5 Khoa chỉ định trùng"
          items={statistics.topDepartments}
          renderItem={(item) => `${item.name} (${item.count})`}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  );
}
```

### Sub-components

```jsx
// Simple card for single value
function StatCard({ title, value, color, icon, isLoading }) {
  return (
    <Card sx={{ bgcolor: `${color}.lighter` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: `${color}.main` }}>{icon}</Avatar>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4">
              {isLoading ? <Skeleton width={60} /> : value.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Card with list (for Top 5)
function StatCardList({ title, items, renderItem, isLoading }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <List dense>
          {isLoading
            ? Array(5)
                .fill(0)
                .map((_, i) => (
                  <ListItem key={i}>
                    <Skeleton width="100%" />
                  </ListItem>
                ))
            : items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${index + 1}. ${renderItem(item)}`} />
                </ListItem>
              ))}
        </List>
      </CardContent>
    </Card>
  );
}
```

---

## 🧩 COMPONENT 4: DichVuTrungTable

### Purpose

Display data in 3 different views with tab switching, sorting, and pagination.

### Props

```typescript
interface DichVuTrungTableProps {
  data: Array<DuplicateServiceRecord>;
  isLoading: boolean;
}
```

### State

```javascript
const [activeTab, setActiveTab] = useState(0); // 0=Tất cả, 1=Theo dịch vụ, 2=Theo khoa
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(50);
const [orderBy, setOrderBy] = useState("servicepricedate");
const [order, setOrder] = useState("desc");
```

### Tab 1: Tất Cả (Flat Table)

**Columns:**

- STT
- Mã BN
- Tên BN
- Dịch vụ
- Loại (CĐHA/XN/TDCN)
- Khoa chỉ định
- Ngày chỉ định
- Giá (VND)

**Sort:** All columns sortable

---

### Tab 2: Theo Dịch Vụ (Grouped)

**Transform data:**

```javascript
const groupedByService = useMemo(() => {
  if (activeTab !== 1) return [];

  const grouped = {};
  data.forEach((record) => {
    const key = record.servicepricecode;
    if (!grouped[key]) {
      grouped[key] = {
        servicepricecode: record.servicepricecode,
        servicepricename: record.servicepricename,
        service_type: record.bhyt_groupcode,
        count: 0,
        uniquePatients: new Set(),
        totalCost: 0,
        records: [],
      };
    }
    grouped[key].count++;
    grouped[key].uniquePatients.add(record.patientid);
    grouped[key].totalCost += record.price * record.quantity;
    grouped[key].records.push(record);
  });

  return Object.values(grouped)
    .map((g) => ({
      ...g,
      uniquePatients: g.uniquePatients.size,
    }))
    .sort((a, b) => b.count - a.count);
}, [data, activeTab]);
```

**Columns:**

- STT
- Mã dịch vụ
- Tên dịch vụ
- Loại
- Số lần trùng
- Số BN
- Tổng tiền

**Expandable:** Click row to show patient list

---

### Tab 3: Theo Khoa (Grouped)

**Transform data:** (Similar to Tab 2, group by departmentgroupid)

**Columns:**

- STT
- Khoa
- Số lần chỉ định trùng
- Số BN bị ảnh hưởng
- Tổng tiền

**Expandable:** Click row to show service breakdown

---

### Component Structure

```jsx
function DichVuTrungTable({ data, isLoading }) {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Transform data based on active tab
  const displayData = useMemo(() => {
    if (activeTab === 0) return data; // Flat
    if (activeTab === 1) return groupByService(data);
    if (activeTab === 2) return groupByDepartment(data);
    return [];
  }, [data, activeTab]);

  // Paginate
  const paginatedData = displayData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleExportCSV = () => {
    exportToCSV(displayData, `DichVuTrung_${dayjs().format("YYYYMMDD")}`);
    toast.success("Xuất CSV thành công");
  };

  return (
    <MainCard>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => {
            setActiveTab(v);
            setPage(0);
          }}
        >
          <Tab label="Tất Cả" />
          <Tab label="Theo Dịch Vụ" />
          <Tab label="Theo Khoa" />
        </Tabs>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={isLoading || displayData.length === 0}
        >
          Xuất CSV
        </Button>
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* Render columns based on activeTab */}
              {activeTab === 0 && <FlatTableHeaders />}
              {activeTab === 1 && <ServiceGroupHeaders />}
              {activeTab === 2 && <DepartmentGroupHeaders />}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Không có dữ liệu
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => ({
                /* Render row based on activeTab */
              }))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={displayData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </MainCard>
  );
}
```

---

## 🧩 UTILITY: calculations.js

### Helper Functions

```javascript
// utils/calculations.js

/**
 * Group data by service
 */
export const groupByService = (data) => {
  const grouped = {};

  data.forEach((record) => {
    const key = record.servicepricecode;
    if (!grouped[key]) {
      grouped[key] = {
        servicepricecode: record.servicepricecode,
        servicepricename: record.servicepricename,
        service_type: record.bhyt_groupcode,
        count: 0,
        uniquePatients: new Set(),
        totalCost: 0,
        records: [],
      };
    }

    grouped[key].count++;
    grouped[key].uniquePatients.add(record.patientid);
    grouped[key].totalCost += record.price * record.quantity;
    grouped[key].records.push(record);
  });

  return Object.values(grouped)
    .map((g) => ({
      ...g,
      uniquePatients: g.uniquePatients.size,
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Group data by department
 */
export const groupByDepartment = (data) => {
  // Similar to groupByService
};

/**
 * Export data to CSV with UTF-8 BOM
 */
export const exportToCSV = (data, filename) => {
  const headers = [
    "STT",
    "Mã BN",
    "Tên BN",
    "Dịch vụ",
    "Loại",
    "Khoa",
    "Ngày",
    "Giá",
  ];

  const rows = data.map((row, index) => [
    index + 1,
    row.patientcode || "",
    row.patientname || "",
    row.servicepricename || "",
    row.bhyt_groupcode || "",
    row.departmentgroupname || "",
    dayjs(row.servicepricedate).format("DD-MM-YYYY"),
    row.price || 0,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

---

## 📦 Dependencies Summary

### Required Packages (should already exist)

- Material-UI (@mui/material)
- MUI X Date Pickers (@mui/x-date-pickers)
- dayjs
- react-redux
- react-toastify
- redux-toolkit

### Import Example for Each Component

```javascript
// DichVuTrungDashboard.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { getDuplicateServices } from "../../Slice/dichvutrungSlice";
import DichVuTrungFilters from "./DichVuTrungFilters";
import DichVuTrungStatistics from "./DichVuTrungStatistics";
import DichVuTrungTable from "./DichVuTrungTable";
```

---

## ✅ Testing Checklist

- [ ] All components render without errors
- [ ] Date pickers work correctly
- [ ] Preset buttons update dates
- [ ] Validation warning shows when > 60 days
- [ ] Fetch button disabled when invalid
- [ ] Statistics calculate correctly
- [ ] All 3 tabs switch properly
- [ ] Table sorting works
- [ ] Pagination works
- [ ] Export CSV creates valid file
- [ ] Loading states display correctly
- [ ] Empty state shows when no data

---

_See DATA_FLOW.md for pseudo code data flow diagram_
