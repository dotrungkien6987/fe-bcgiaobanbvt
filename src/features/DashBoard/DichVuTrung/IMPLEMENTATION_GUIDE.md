# 🚀 HƯỚNG DẪN TRIỂN KHAI - BÁO CÁO DỊCH VỤ TRÙNG LẶP

## 📋 Tổng Quan

Triển khai tính năng báo cáo phát hiện dịch vụ CĐHA/XN/TDCN trùng lặp giữa các khoa trong cùng đợt điều trị (vienphiid).

**Timeline ước tính:** 4-6 giờ  
**Độ phức tạp:** Trung bình (có pattern reference từ SoThuTuDashboard)

---

## 🏗️ CẤU TRÚC THỨ MỤC

```
📁 Backend: giaobanbv-be/
│
├── 📁 querySQL/
│   └── qDichVuTrung.js                    ⬅️ STEP 1: SQL queries
│
├── 📁 models/his/
│   └── dichvutrung.js                     ⬅️ STEP 2: Database model
│
├── 📁 controllers/his/
│   └── dichvutrung.controller.js          ⬅️ STEP 3: Business logic
│
├── 📁 routes/his/
│   └── dichvutrung.api.js                 ⬅️ STEP 4: API routes
│
└── 📁 routes/
    └── index.js                            ⬅️ STEP 5: Register routes

📁 Frontend: fe-bcgiaobanbvt/src/
│
├── 📁 features/Slice/
│   └── dichvutrungSlice.js                ⬅️ STEP 6: Redux state
│
├── 📁 features/DashBoard/DichVuTrung/
│   ├── DichVuTrungDashboard.js            ⬅️ STEP 7: Main container
│   ├── DichVuTrungFilters.js              ⬅️ STEP 8: Filter controls
│   ├── DichVuTrungStatistics.js           ⬅️ STEP 9: Stats cards
│   ├── DichVuTrungTable.js                ⬅️ STEP 10: Data table
│   └── utils/
│       └── calculations.js                 ⬅️ STEP 11: Helper functions
│
├── 📁 app/
│   └── store.js                            ⬅️ STEP 12: Register reducer
│
└── 📁 pages/
    └── DashBoardPage.js                    ⬅️ STEP 13: Add tab
```

---

## 📝 TRIỂN KHAI TỪNG BƯỚC

### ✅ PHASE 1: BACKEND (Steps 1-5)

#### **STEP 1: Tạo SQL Queries**

📄 File: `giaobanbv-be/querySQL/qDichVuTrung.js`

**Pattern Reference:** `giaobanbv-be/querySQL/qSoThuTu.js`

**Action Items:**

- [ ] Tạo file mới với 4 queries
- [ ] Query 1: findDuplicates - Tìm bản ghi trùng (WITH + JOIN pattern)
- [ ] Query 2: countDuplicates - Đếm tổng số (COUNT)
- [ ] Query 3: getTopServices - Top 5 dịch vụ trùng nhiều nhất
- [ ] Query 4: getTopDepartments - Top 5 khoa chỉ định nhiều nhất
- [ ] **Parameters:** $1=fromDate, $2=toDate, $3=serviceTypes[], $4=limit, $5=offset

**Validation:**

```bash
node -c giaobanbv-be/querySQL/qDichVuTrung.js
```

---

#### **STEP 2: Tạo Database Model**

📄 File: `giaobanbv-be/models/his/dichvutrung.js`

**Pattern Reference:** `giaobanbv-be/models/his/soThuTu.js`

**Action Items:**

- [ ] Import pool từ `config/dbConfig.js`
- [ ] Import queries từ Step 1
- [ ] 3 methods: findDuplicateServices, getStatistics, getTopServices
- [ ] Error handling với try-catch

**Code Pattern:**

```javascript
const pool = require('../../config/dbConfig');
const qDichVuTrung = require('../../querySQL/qDichVuTrung');

const findDuplicateServices = async (fromDate, toDate, page, limit) => {
  // Calculate offset
  // Execute query with parameters
  // Handle errors
  // Return formatted result
};

module.exports = { findDuplicateServices, ... };
```

---

#### **STEP 3: Tạo Controller**

📄 File: `giaobanbv-be/controllers/his/dichvutrung.controller.js`

**Pattern Reference:** `giaobanbv-be/controllers/his/sothutu.controller.js`

**Action Items:**

- [ ] Import utils: `sendResponse`, `catchAsync`, `AppError`
- [ ] Import model từ Step 2
- [ ] **Validate serviceTypes array** (allowed: '04CDHA', '03XN', '05TDCN')
- [ ] Validate date range ≤ 60 days
- [ ] Call model methods với serviceTypes parameter
- [ ] Return standardized response

**Critical Validation:**

```javascript
// Service types validation
const allowedTypes = ["04CDHA", "03XN", "05TDCN"];
const serviceTypes = req.body.serviceTypes?.length
  ? req.body.serviceTypes
  : allowedTypes;

const invalidTypes = serviceTypes.filter((t) => !allowedTypes.includes(t));
if (invalidTypes.length > 0) {
  throw new AppError(
    400,
    `Invalid service types: ${invalidTypes.join(", ")}`,
    "VALIDATION_ERROR"
  );
}

// Date range validation
const diffDays = Math.ceil(
  (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)
);
if (diffDays > 60) {
  throw new AppError(
    400,
    "Khoảng thời gian không được vượt quá 60 ngày",
    "INVALID_RANGE"
  );
}
```

---

#### **STEP 4: Tạo Routes**

📄 File: `giaobanbv-be/routes/his/dichvutrung.api.js`

**Pattern Reference:** `giaobanbv-be/routes/his/sothutu.api.js`

**Action Items:**

- [ ] Setup Express router
- [ ] Import controller và authentication
- [ ] Define 3 POST routes với auth middleware

**Routes:**

- POST `/duplicates` - Main data
- POST `/statistics` - Dashboard metrics
- POST `/top-services` - Top 5 lists

---

#### **STEP 5: Đăng ký Routes**

📄 File: `giaobanbv-be/routes/index.js`

**Action Items:**

- [ ] Import route file từ Step 4
- [ ] Add `router.use("/his/dichvutrung", dichVuTrungApi);`

**Test Backend:**

```bash
# Restart server
cd giaobanbv-be && npm start

# Test with curl
curl -X POST http://localhost:8020/api/his/dichvutrung/duplicates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fromDate":"2026-01-01","toDate":"2026-01-06"}'
```

---

### ✅ PHASE 2: FRONTEND - REDUX (Step 6)

#### **STEP 6: Tạo Redux Slice**

📄 File: `fe-bcgiaobanbvt/src/features/Slice/dichvutrungSlice.js`

**Pattern Reference:** `fe-bcgiaobanbvt/src/features/Slice/soThuTuSlice.js`

**State Structure:**

```javascript
const initialState = {
  isLoading: false,
  error: null,
  duplicateServices: [], // Main data array
  total: 0, // Total count
  page: 1, // Current page
  totalPages: 0, // Total pages
  filters: {
    fromDate: null,
    toDate: null,
    serviceTypes: ["04CDHA", "03XN", "05TDCN"], // ✅ NEW: User-selectable
  },
};
```

**Key Actions:**

- `startLoading()` - Set loading true
- `hasError(error)` - Set error message
- `getDuplicatesSuccess(data)` - Update state with data
- `updateFilters(filters)` - Update filter state including serviceTypes

**Thunks:**

- `getDuplicateServices(fromDate, toDate, serviceTypes, page)` - Fetch main data
- `getStatistics(fromDate, toDate, serviceTypes)` - Fetch dashboard stats
- Toast notifications on success/error

---

### ✅ PHASE 3: FRONTEND - COMPONENTS (Steps 7-11)

#### **STEP 7: Main Dashboard**

📄 File: `DichVuTrungDashboard.js`

**Pattern Reference:** `SoThuTuPhongKham/SoThuTuDashboard.js`

**Component Structure:**

```
DichVuTrungDashboard
├── DichVuTrungFilters (date pickers, fetch button)
├── DichVuTrungStatistics (4 cards)
└── DichVuTrungTable (3 tabs with data)
```

**Key State:**

- fromDate, toDate (dayjs objects)
- Redux selectors for data
- handleFetchData() function

---

#### **STEP 8: Filters Component**

📄 File: `DichVuTrungFilters.js`

**Features:**

- 2 DatePickers (từ ngày, đến ngày)
- **Checkbox/MultiSelect cho loại dịch vụ:** CĐHA, XN, TDCN (✅ NEW)
- 3 Preset buttons: "Hôm nay", "7 ngày", "30 ngày"
- Validation warning if > 60 days
- "Xem Dữ Liệu" button

**Props:**

- fromDate, toDate, onFromDateChange, onToDateChange
- **serviceTypes, onServiceTypesChange** (✅ NEW)
- onFetch, isLoading

**Example:**

```javascript
<FormControlLabel
  control={
    <Checkbox
      checked={serviceTypes.includes("04CDHA")}
      onChange={(e) => handleServiceTypeChange("04CDHA", e.target.checked)}
    />
  }
  label="CĐHA"
/>
```

---

#### **STEP 9: Statistics Cards**

📄 File: `DichVuTrungStatistics.js`

**4 Cards với useMemo:**

1. Tổng dịch vụ trùng (data.length)
2. Bệnh nhân bị ảnh hưởng (unique patientid)
3. Top 5 dịch vụ (group by service, sort by count)
4. Top 5 khoa (group by department, sort by count)

**Pattern Reference:** `DashBoard/CardThongTinBenhNhan.js`

---

#### **STEP 10: Data Table**

📄 File: `DichVuTrungTable.js`

**3 Tabs:**

- Tab 1: Tất Cả (flat table, all columns)
- Tab 2: Theo Dịch Vụ (grouped by service)
- Tab 3: Theo Khoa (grouped by department)

**Features:**

- MUI Table + TablePagination
- Export CSV button
- Sort functionality
- 50 rows per page default

---

#### **STEP 11: Helper Functions**

📄 File: `utils/calculations.js`

**Functions:**

- `groupByService(data)` - Transform for Tab 2
- `groupByDepartment(data)` - Transform for Tab 3
- `exportToCSV(data, filename)` - CSV export with UTF-8 BOM

---

### ✅ PHASE 4: INTEGRATION (Steps 12-13)

#### **STEP 12: Register Reducer**

📄 File: `fe-bcgiaobanbvt/src/app/store.js`

```javascript
import dichvutrungReducer from "../features/Slice/dichvutrungSlice";

const rootReducer = combineReducers({
  // ... existing
  dichvutrung: dichvutrungReducer,
});
```

---

#### **STEP 13: Add Dashboard Tab**

📄 File: `fe-bcgiaobanbvt/src/pages/DashBoardPage.js`

**Changes:**

1. Import component
2. Add permission: `DICHVUTRUNG: "DỊCH VỤ TRÙNG"`
3. Add to allTabs array

---

## 🧪 TESTING CHECKLIST

### Backend

- [ ] SQL queries return data
- [ ] API endpoints respond 200 OK
- [ ] Date validation works (reject > 60 days)
- [ ] Pagination works correctly
- [ ] Error handling returns proper messages

### Frontend

- [ ] Dashboard loads without errors
- [ ] Date pickers work
- [ ] Validation warning shows
- [ ] Fetch button triggers API
- [ ] Statistics cards calculate correctly
- [ ] All 3 tabs render
- [ ] Pagination works
- [ ] Export CSV works

---

## 🐛 COMMON ISSUES

**Issue:** "Cannot read property 'map' of undefined"  
**Fix:** Add null check: `const displayData = data || [];`

**Issue:** Date validation not working  
**Fix:** Use dayjs.diff() method, not subtraction

**Issue:** PostgreSQL connection error  
**Fix:** Check .env DB credentials

**Issue:** CORS error  
**Fix:** Check backend CORS config in app.js

---

## ✅ COMPLETION CRITERIA

Feature is COMPLETE when:

1. ✅ All 13 steps implemented
2. ✅ Backend returns data
3. ✅ Frontend displays without errors
4. ✅ All tabs work
5. ✅ Statistics accurate
6. ✅ Pagination works
7. ✅ Export CSV works
8. ✅ Validation prevents > 60 days

**See other documentation files for detailed specs:**

- `SQL_QUERY_TEMPLATE.md` - SQL query details
- `API_CONTRACT.md` - API specifications
- `COMPONENT_STRUCTURE.md` - UI architecture
- `DATA_FLOW.md` - Data flow with pseudo code

---

_Last Updated: January 6, 2026_
