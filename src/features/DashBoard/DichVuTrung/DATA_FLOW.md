# 🔄 DATA FLOW - DỊCH VỤ TRÙNG LẶP (PSEUDO CODE)

## 📊 Overview

Tài liệu này mô tả luồng dữ liệu từ user interaction đến hiển thị UI, sử dụng **PSEUDO CODE** để dễ đọc và hiểu logic.

---

## 🎯 FLOW 1: User Chọn Date Range và Fetch Data

### Step-by-Step với Pseudo Code

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Click "Xem Dữ Liệu" button                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
╔═════════════════════════════════════════════════════════════╗
║ COMPONENT: DichVuTrungDashboard                             ║
╚═════════════════════════════════════════════════════════════╝

PSEUDO CODE:
------------
function handleFetchData() {
  // 1. Get date values
  fromDateString = fromDate.format('YYYY-MM-DD')  // "2026-01-01"
  toDateString = toDate.format('YYYY-MM-DD')      // "2026-01-31"

  // 2. Validate date range
  diffDays = calculateDaysBetween(fromDate, toDate)

  IF diffDays > 60 THEN
    showErrorToast("Khoảng thời gian không được vượt quá 60 ngày")
    RETURN  // Stop execution
  END IF

  // 3. Dispatch Redux action
  dispatchToRedux(getDuplicateServices(fromDateString, toDateString))
}

                     │
                     ▼
╔═════════════════════════════════════════════════════════════╗
║ REDUX THUNK: getDuplicateServices()                         ║
╚═════════════════════════════════════════════════════════════╝

PSEUDO CODE:
------------
async function getDuplicateServices(fromDate, toDate) {
  // 1. Set loading state
  dispatch(startLoading())

  TRY {
    // 2. Call API
    response = await POST("/api/his/dichvutrung/duplicates", {
      fromDate: fromDate,
      toDate: toDate,
      page: 1,
      limit: 50
    })

    // 3. Extract data
    items = response.data.data.items          // Array of records
    total = response.data.data.total          // Total count
    page = response.data.data.page            // Current page
    totalPages = response.data.data.totalPages // Total pages

    // 4. Update Redux state
    dispatch(getDuplicatesSuccess({
      items: items,
      total: total,
      page: page,
      totalPages: totalPages
    }))

    // 5. Show success notification
    showSuccessToast(`Tìm thấy ${total} bản ghi trùng lặp`)

  } CATCH error {
    // 6. Handle error
    dispatch(hasError(error.message))
    showErrorToast(error.message)
  }
}

                     │
                     ▼
╔═════════════════════════════════════════════════════════════╗
║ BACKEND: Controller → Model → PostgreSQL                    ║
╚═════════════════════════════════════════════════════════════╝

PSEUDO CODE - Controller:
-------------------------
function getDuplicates(request, response) {
  // 1. Extract params
  fromDate = request.body.fromDate  // "2026-01-01"
  toDate = request.body.toDate      // "2026-01-31"
  page = request.body.page || 1
  limit = request.body.limit || 50

  // 2. Validate
  IF fromDate is EMPTY or toDate is EMPTY THEN
    throwError(400, "Thiếu thông tin: fromDate, toDate")
  END IF

  diffDays = calculateDaysBetween(fromDate, toDate)
  IF diffDays > 60 THEN
    throwError(400, "Khoảng thời gian không được vượt quá 60 ngày")
  END IF

  // 3. Call model
  result = await Model.findDuplicateServices(fromDate, toDate, page, limit)

  // 4. Return response
  sendSuccessResponse(response, result, "Lấy danh sách thành công")
}

PSEUDO CODE - Model:
--------------------
async function findDuplicateServices(fromDate, toDate, page, limit) {
  // 1. Calculate offset
  offset = (page - 1) * limit

  // 2. Execute main query (see SQL_QUERY_TEMPLATE.md)
  results = await executeSQL(
    query: qDichVuTrung.findDuplicates,
    params: [fromDate, toDate, limit, offset]
  )

  // 3. Execute count query
  countResult = await executeSQL(
    query: qDichVuTrung.countDuplicates,
    params: [fromDate, toDate]
  )

  totalCount = countResult[0].total_count

  // 4. Format response
  RETURN {
    items: results,
    total: totalCount,
    page: page,
    limit: limit,
    totalPages: ceiling(totalCount / limit)
  }
}

                     │
                     ▼
╔═════════════════════════════════════════════════════════════╗
║ POSTGRESQL: Execute CTE Query                               ║
╚═════════════════════════════════════════════════════════════╝

PSEUDO SQL:
-----------
WITH duplicate_candidates AS (
  -- Find (vienphiid, servicepricecode) with >1 departmentgroupid
  SELECT vienphiid, servicepricecode
  FROM serviceprice
  WHERE date BETWEEN '2026-01-01' AND '2026-01-31'
    AND bhyt_groupcode IN ('04CDHA', '03XN', '05TDCN')
  GROUP BY vienphiid, servicepricecode
  HAVING COUNT(DISTINCT departmentgroupid) > 1
)
SELECT sp.*, patient.*, department.*
FROM serviceprice sp
JOIN duplicate_candidates dc ON sp.vienphiid = dc.vienphiid
JOIN patient, department, ...
ORDER BY vienphiid, servicepricecode
LIMIT 50 OFFSET 0

↓ Returns: Array of 50 records

                     │
                     ▼
╔═════════════════════════════════════════════════════════════╗
║ REDUX STATE UPDATE                                          ║
╚═════════════════════════════════════════════════════════════╝

PSEUDO CODE:
------------
state = {
  isLoading: false,                    // ← Set to false
  error: null,
  duplicateServices: [                 // ← Updated with new data
    { servicepricedetailid: 123, ... },
    { servicepricedetailid: 456, ... },
    // ... 50 items
  ],
  total: 1523,                         // ← Total count
  page: 1,
  totalPages: 31
}

                     │
                     ▼
╔═════════════════════════════════════════════════════════════╗
║ REACT COMPONENTS RE-RENDER                                  ║
╚═════════════════════════════════════════════════════════════╝

Component Tree Update:
----------------------
DichVuTrungDashboard (receives state from Redux)
  ├── DichVuTrungFilters (isLoading = false)
  ├── DichVuTrungStatistics (data = 50 records, total = 1523)
  └── DichVuTrungTable (data = 50 records)
```

---

## 🎯 FLOW 2: Calculate Statistics Cards

### Pseudo Code for useMemo in Statistics Component

```
╔═════════════════════════════════════════════════════════════╗
║ COMPONENT: DichVuTrungStatistics                            ║
╚═════════════════════════════════════════════════════════════╝

INPUT:
------
data = [
  { patientid: 101, servicepricecode: "09406", departmentgroupid: 10, ... },
  { patientid: 101, servicepricecode: "09406", departmentgroupid: 20, ... },
  { patientid: 102, servicepricecode: "03502", departmentgroupid: 10, ... },
  // ... 47 more records
]
total = 1523

PSEUDO CODE:
------------
statistics = useMemo(() => {
  // 1. Total duplicates (from backend)
  totalDuplicates = total  // 1523

  // 2. Calculate unique patients
  patientSet = new Set()
  FOR EACH record IN data DO
    patientSet.add(record.patientid)
  END FOR
  uniquePatients = patientSet.size  // e.g., 842

  // 3. Calculate Top 5 Services
  serviceMap = {}

  FOR EACH record IN data DO
    serviceKey = record.servicepricecode + "|" + record.servicepricename

    IF serviceMap[serviceKey] does NOT exist THEN
      serviceMap[serviceKey] = {
        code: record.servicepricecode,
        name: record.servicepricename,
        count: 0
      }
    END IF

    serviceMap[serviceKey].count = serviceMap[serviceKey].count + 1
  END FOR

  // Convert to array and sort
  serviceArray = convertToArray(serviceMap)
  sortByCountDescending(serviceArray)
  topServices = getFirst5Items(serviceArray)

  // Example result:
  topServices = [
    { code: "09406", name: "Chụp X-quang phổi thẳng", count: 15 },
    { code: "03502", name: "Xét nghiệm công thức máu", count: 12 },
    { code: "09510", name: "Chụp CT Scanner sọ não", count: 10 },
    { code: "05201", name: "Siêu âm bụng tổng quát", count: 8 },
    { code: "03604", name: "Xét nghiệm sinh hóa máu", count: 6 }
  ]

  // 4. Calculate Top 5 Departments (similar logic)
  departmentMap = {}

  FOR EACH record IN data DO
    deptKey = record.departmentgroupid + "|" + record.departmentgroupname

    IF departmentMap[deptKey] does NOT exist THEN
      departmentMap[deptKey] = {
        id: record.departmentgroupid,
        name: record.departmentgroupname,
        count: 0
      }
    END IF

    departmentMap[deptKey].count = departmentMap[deptKey].count + 1
  END FOR

  deptArray = convertToArray(departmentMap)
  sortByCountDescending(deptArray)
  topDepartments = getFirst5Items(deptArray)

  RETURN {
    totalDuplicates: totalDuplicates,
    uniquePatients: uniquePatients,
    topServices: topServices,
    topDepartments: topDepartments
  }

}, [data, total])  // Re-calculate when data or total changes

OUTPUT (statistics object):
---------------------------
{
  totalDuplicates: 1523,
  uniquePatients: 842,
  topServices: [Array of 5 items],
  topDepartments: [Array of 5 items]
}

UI RENDERING:
-------------
Card 1: "Tổng dịch vụ trùng" → Display: 1,523
Card 2: "Bệnh nhân bị ảnh hưởng" → Display: 842
Card 3: "Top 5 Dịch vụ" → Display list with names and counts
Card 4: "Top 5 Khoa" → Display list with names and counts
```

---

## 🎯 FLOW 3: Tab Switching in Table

### Pseudo Code for Data Transformation

```
╔═════════════════════════════════════════════════════════════╗
║ COMPONENT: DichVuTrungTable                                 ║
╚═════════════════════════════════════════════════════════════╝

STATE:
------
activeTab = 0  // 0 = Tất cả, 1 = Theo dịch vụ, 2 = Theo khoa
data = [50 flat records from Redux]

USER ACTION: Click "Theo Dịch Vụ" tab
--------------------------------------
activeTab changes from 0 → 1

PSEUDO CODE for useMemo:
-------------------------
displayData = useMemo(() => {

  // TAB 0: Tất Cả (return flat data as-is)
  IF activeTab == 0 THEN
    RETURN data  // No transformation
  END IF

  // TAB 1: Theo Dịch Vụ (group by service)
  IF activeTab == 1 THEN
    grouped = {}

    FOR EACH record IN data DO
      serviceKey = record.servicepricecode

      IF grouped[serviceKey] does NOT exist THEN
        grouped[serviceKey] = {
          servicepricecode: record.servicepricecode,
          servicepricename: record.servicepricename,
          service_type: record.bhyt_groupcode,
          count: 0,
          patientSet: new Set(),
          totalCost: 0,
          records: []  // Array to store original records
        }
      END IF

      // Accumulate data
      grouped[serviceKey].count += 1
      grouped[serviceKey].patientSet.add(record.patientid)
      grouped[serviceKey].totalCost += (record.price * record.quantity)
      grouped[serviceKey].records.push(record)
    END FOR

    // Convert to array
    groupedArray = []
    FOR EACH key IN grouped DO
      item = grouped[key]
      groupedArray.push({
        servicepricecode: item.servicepricecode,
        servicepricename: item.servicepricename,
        service_type: item.service_type,
        count: item.count,
        uniquePatients: item.patientSet.size,
        totalCost: item.totalCost,
        records: item.records
      })
    END FOR

    // Sort by count descending
    sortByCountDescending(groupedArray)

    RETURN groupedArray
  END IF

  // TAB 2: Theo Khoa (similar logic, group by departmentgroupid)
  IF activeTab == 2 THEN
    // Similar grouping logic as Tab 1
    RETURN groupedByDepartment
  END IF

}, [data, activeTab])

EXAMPLE OUTPUT for Tab 1:
--------------------------
displayData = [
  {
    servicepricecode: "09406",
    servicepricename: "Chụp X-quang phổi thẳng",
    service_type: "04CDHA",
    count: 15,              // ← Số lần xuất hiện trong 50 records
    uniquePatients: 12,     // ← Số bệnh nhân unique
    totalCost: 1275000,     // ← Tổng tiền
    records: [Array of 15 records]  // ← Chi tiết
  },
  {
    servicepricecode: "03502",
    servicepricename: "Xét nghiệm công thức máu",
    service_type: "03XN",
    count: 12,
    uniquePatients: 10,
    totalCost: 720000,
    records: [Array of 12 records]
  },
  // ... more grouped items
]

TABLE RENDERING:
----------------
FOR EACH item IN displayData DO
  renderRow({
    STT: index + 1,
    Mã dịch vụ: item.servicepricecode,
    Tên dịch vụ: item.servicepricename,
    Loại: item.service_type,
    Số lần trùng: item.count,
    Số BN: item.uniquePatients,
    Tổng tiền: formatMoney(item.totalCost)
  })
END FOR
```

---

## 🎯 FLOW 4: Pagination

### Pseudo Code for Page Change

```
╔═════════════════════════════════════════════════════════════╗
║ COMPONENT: DichVuTrungTable - Pagination                    ║
╚═════════════════════════════════════════════════════════════╝

STATE:
------
displayData = [Array of all items for current tab]  // e.g., 50 items
page = 0           // Current page (0-indexed)
rowsPerPage = 50   // Items per page

USER ACTION: Click "Next Page" button
--------------------------------------
page changes from 0 → 1

PSEUDO CODE for slicing data:
------------------------------
paginatedData = useMemo(() => {
  startIndex = page * rowsPerPage      // 1 * 50 = 50
  endIndex = startIndex + rowsPerPage  // 50 + 50 = 100

  RETURN displayData.slice(startIndex, endIndex)

}, [displayData, page, rowsPerPage])

IF displayData has only 50 items THEN
  paginatedData = []  // Empty, no more data
END IF

BACKEND FETCH (Future Enhancement):
------------------------------------
// Currently: All data in frontend, slice client-side
// Future: Fetch per page from backend

IF page changes AND isClientSidePagination == false THEN
  dispatch(getDuplicateServices(fromDate, toDate, page + 1))
  // This will fetch next 50 items from backend
END IF

PAGINATION INFO:
----------------
totalItems = displayData.length  // e.g., 50
totalPages = ceiling(totalItems / rowsPerPage)  // ceiling(50 / 50) = 1

currentPage = page + 1  // Convert 0-indexed to 1-indexed for display
displayInfo = `${startIndex + 1}-${endIndex} / ${totalItems}`
// Shows: "1-50 / 50"

IF user clicks page 2 THEN
  displayInfo = "51-100 / 150"  (if there were 150 items)
END IF
```

---

## 🎯 FLOW 5: Export CSV

### Pseudo Code for CSV Generation

```
╔═════════════════════════════════════════════════════════════╗
║ USER ACTION: Click "Xuất CSV" button                        ║
╚═════════════════════════════════════════════════════════════╝

INPUT:
------
displayData = [Current tab's data, all items not just page]
filename = "DichVuTrung_20260106"

PSEUDO CODE:
------------
function exportToCSV(data, filename) {
  // 1. Define headers
  headers = [
    "STT",
    "Mã BN",
    "Tên BN",
    "Dịch vụ",
    "Loại",
    "Khoa",
    "Ngày",
    "Giá (VND)"
  ]

  // 2. Transform data to CSV rows
  rows = []

  FOR index = 0 TO data.length - 1 DO
    record = data[index]

    row = [
      index + 1,                                    // STT
      record.patientcode || "",                     // Mã BN
      record.patientname || "",                     // Tên BN
      record.servicepricename || "",                // Dịch vụ
      record.bhyt_groupcode || "",                  // Loại
      record.departmentgroupname || "",             // Khoa
      formatDate(record.servicepricedate),          // Ngày
      record.price || 0                             // Giá
    ]

    // Quote each cell to handle commas in data
    rowString = row.map(cell => `"${cell}"`).join(",")
    rows.push(rowString)
  END FOR

  // 3. Combine headers and rows
  csvContent = headers.join(",") + "\n" + rows.join("\n")

  // Example CSV content:
  // STT,Mã BN,Tên BN,Dịch vụ,Loại,Khoa,Ngày,Giá (VND)
  // "1","BN0123456","Nguyễn Văn A","Chụp X-quang phổi thẳng","04CDHA","KHOA NỘI","05-01-2026","85000"
  // "2","BN0123457","Trần Thị B","Xét nghiệm máu","03XN","KHOA NGOẠI","05-01-2026","60000"
  // ...

  // 4. Add UTF-8 BOM for Vietnamese characters
  csvWithBOM = "\ufeff" + csvContent

  // 5. Create blob
  blob = createBlob(csvWithBOM, type: "text/csv;charset=utf-8;")

  // 6. Create download link
  url = createObjectURL(blob)
  link = createAnchorElement()
  link.href = url
  link.download = filename + ".csv"

  // 7. Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 8. Cleanup
  revokeObjectURL(url)

  // 9. Show success message
  showSuccessToast("Xuất CSV thành công")
}

FILE CREATED:
-------------
DichVuTrung_20260106.csv
Size: ~50KB (for 50 records)
Encoding: UTF-8 with BOM
Opens correctly in: Excel, Google Sheets, LibreOffice Calc
```

---

## 🎯 FLOW 6: Error Handling

### Pseudo Code for Error Scenarios

```
╔═════════════════════════════════════════════════════════════╗
║ ERROR SCENARIO 1: Date Range > 60 days                     ║
╚═════════════════════════════════════════════════════════════╝

USER INPUT:
-----------
fromDate = "2025-01-01"
toDate = "2026-01-06"

VALIDATION (Frontend):
----------------------
diffDays = calculateDaysBetween(fromDate, toDate)  // 370 days

IF diffDays > 60 THEN
  showErrorToast("Khoảng thời gian không được vượt quá 60 ngày")
  disableFetchButton()
  showWarningAlert("hiện tại: 370 ngày")
  RETURN  // Don't send API request
END IF

IF user somehow bypasses frontend validation:
----------------------------------------------
BACKEND VALIDATION (Controller):
---------------------------------
diffDays = calculateDaysBetween(fromDate, toDate)

IF diffDays > 60 THEN
  throwError(
    statusCode: 400,
    message: "Khoảng thời gian không được vượt quá 60 ngày",
    errorType: "INVALID_DATE_RANGE"
  )
END IF

RESPONSE:
---------
{
  success: false,
  message: "Khoảng thời gian không được vượt quá 60 ngày",
  errors: {
    type: "INVALID_DATE_RANGE",
    details: { fromDate: "2025-01-01", toDate: "2026-01-06", diffDays: 370 }
  }
}

FRONTEND HANDLING:
------------------
CATCH error in Redux thunk:
  dispatch(hasError(error.message))
  showErrorToast(error.message)
  // State remains in error state, loading = false

╔═════════════════════════════════════════════════════════════╗
║ ERROR SCENARIO 2: Network/Database Error                   ║
╚═════════════════════════════════════════════════════════════╝

BACKEND:
--------
TRY {
  result = await executeSQL(query, params)
} CATCH databaseError {
  logError(databaseError)

  throwError(
    statusCode: 500,
    message: "Lỗi truy vấn dữ liệu: " + databaseError.message,
    errorType: "DATABASE_ERROR"
  )
}

FRONTEND:
---------
CATCH error in Redux thunk:
  IF error.statusCode == 500 THEN
    showErrorToast("Lỗi hệ thống, vui lòng thử lại sau")
  ELSE IF error.statusCode == 401 THEN
    showErrorToast("Phiên đăng nhập hết hạn")
    redirectToLogin()
  ELSE
    showErrorToast(error.message)
  END IF

  dispatch(hasError(error.message))

╔═════════════════════════════════════════════════════════════╗
║ ERROR SCENARIO 3: No Data Found                            ║
╚═════════════════════════════════════════════════════════════╝

BACKEND:
--------
result = await executeSQL(query, params)

IF result.items.length == 0 THEN
  // Not an error, just empty result
  RETURN {
    items: [],
    total: 0,
    page: 1,
    totalPages: 0
  }
END IF

FRONTEND:
---------
IF data.length == 0 THEN
  // Statistics cards show 0
  // Table shows "Không có dữ liệu" message
  // No error toast
END IF

DISPLAY:
--------
Table Body:
  <TableRow>
    <TableCell colSpan={8} align="center">
      <Typography variant="body2" color="textSecondary">
        Không có dịch vụ trùng lặp trong khoảng thời gian này
      </Typography>
    </TableCell>
  </TableRow>
```

---

## 📊 State Timeline Diagram

```
INITIAL STATE:
==============
{
  isLoading: false,
  error: null,
  duplicateServices: [],
  total: 0,
  page: 1,
  totalPages: 0
}

↓ User clicks "Xem Dữ Liệu"

LOADING STATE:
==============
{
  isLoading: true,          ← Changed
  error: null,
  duplicateServices: [],    ← Old data (optional: can show cached)
  total: 0,
  page: 1,
  totalPages: 0
}

↓ API returns successfully

SUCCESS STATE:
==============
{
  isLoading: false,         ← Changed back
  error: null,
  duplicateServices: [      ← Updated
    { servicepricedetailid: 123, ... },
    { servicepricedetailid: 456, ... },
    // ... 50 items
  ],
  total: 1523,              ← Updated
  page: 1,
  totalPages: 31            ← Updated
}

↓ If API fails

ERROR STATE:
============
{
  isLoading: false,         ← Changed back
  error: "Lỗi truy vấn dữ liệu: timeout",  ← Error message
  duplicateServices: [],    ← Cleared (or keep old data?)
  total: 0,
  page: 1,
  totalPages: 0
}

↓ User retries (clicks "Xem Dữ Liệu" again)

LOADING STATE (again):
======================
{
  isLoading: true,
  error: null,              ← Cleared
  duplicateServices: [],
  total: 0,
  page: 1,
  totalPages: 0
}
```

---

## 🔄 Component Lifecycle

```
MOUNT PHASE:
============
1. DichVuTrungDashboard mounts
2. Child components mount:
   - DichVuTrungFilters
   - DichVuTrungStatistics
   - DichVuTrungTable
3. Initial state from Redux: empty arrays
4. UI shows empty state / placeholder

USER INTERACTION:
=================
1. User selects dates
2. User clicks "Xem Dữ Liệu"
3. Validation runs (frontend)
4. If valid → dispatch action
5. Loading state → show spinners
6. API call → Backend processing
7. Response → Update Redux state
8. Components re-render with new data

RE-RENDER TRIGGERS:
===================
- Redux state changes → All connected components re-render
- Local state changes (page, activeTab) → Only that component re-renders
- useMemo dependencies change → Recalculate and re-render

UNMOUNT PHASE:
==============
1. User navigates away
2. Components unmount
3. Redux state persists (until page refresh or logout)
```

---

## ✅ Summary

Tài liệu này cung cấp **pseudo code** chi tiết cho:

- ✅ User interaction flow
- ✅ Redux thunk logic
- ✅ Backend validation & processing
- ✅ Data transformation (grouping, pagination)
- ✅ Error handling scenarios
- ✅ State management timeline

**AI Implementation Agent** có thể dùng pseudo code này để:

1. Hiểu logic nghiệp vụ nhanh chóng
2. Chuyển đổi sang code thực (JavaScript/TypeScript)
3. Debug khi có vấn đề
4. Tối ưu hóa performance

---

_See other documentation files for complete implementation details_
