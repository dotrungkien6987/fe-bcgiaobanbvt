# 📡 API CONTRACT - DỊCH VỤ TRÙNG LẶP

## 🌐 Base URL

**Development:** `http://localhost:8020/api`  
**Production:** `https://your-domain.com/api`

**Base Path:** `/his/dichvutrung`

**Authentication:** Bearer Token (JWT) required for all endpoints

---

## 🔐 Authentication

All endpoints require authentication header:

```http
Authorization: Bearer <JWT_TOKEN>
```

**Get Token:**

```javascript
// From Redux state
const token = localStorage.getItem("accessToken");

// Or from auth context
const { user } = useAuth();
```

---

## 📊 ENDPOINT 1: Get Duplicate Services

### Request

```http
POST /api/his/dichvutrung/duplicates
Content-Type: application/json
Authorization: Bearer <token>

{
  "fromDate": "2026-01-01",
  "toDate": "2026-01-06",
  "serviceTypes": ["04CDHA", "03XN", "05TDCN"],
  "page": 1,
  "limit": 50
}
```

### Request Body Schema

```typescript
{
  fromDate: string;          // Required. Format: YYYY-MM-DD
  toDate: string;            // Required. Format: YYYY-MM-DD
  serviceTypes?: string[];   // Optional. Default: ['04CDHA', '03XN', '05TDCN']
                             // Allowed values: '04CDHA', '03XN', '05TDCN'
  page?: number;             // Optional. Default: 1
  limit?: number;            // Optional. Default: 50, Max: 100
}
```

### Validation Rules

| Field        | Rule                 | Error Message                                               |
| ------------ | -------------------- | ----------------------------------------------------------- |
| fromDate     | Required, Valid date | "fromDate là bắt buộc và phải là ngày hợp lệ"               |
| toDate       | Required, Valid date | "toDate là bắt buộc và phải là ngày hợp lệ"                 |
| Date Range   | ≤ 60 days            | "Khoảng thời gian không được vượt quá 60 ngày"              |
| toDate       | ≥ fromDate           | "toDate phải lớn hơn hoặc bằng fromDate"                    |
| serviceTypes | Array, Valid codes   | "serviceTypes phải là mảng chứa ['04CDHA','03XN','05TDCN']" |

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "servicepriceid": 123456,
        "vienphiid": 789012,
        "servicepricecode": "09406",
        "servicepricename": "Chụp X-quang phổi thẳng",
        "servicepricedate": "2026-01-05T14:30:00.000Z",
        "servicepricemoney": 85000,
        "soluong": 1,
        "departmentid": 15,
        "departmentgroupid": 10,
        "bhyt_groupcode": "04CDHA",
        "hosobenhancode": "0001234567",
        "patientid": 98765,
        "patientcode": "BN0123456",
        "patientname": "Nguyễn Văn A",
        "birthday": "1980-05-15T00:00:00.000Z",
        "gioitinhcode": "M",
        "departmentgroupname": "KHOA NỘI TỔNG HỢP",
        "departmentname": "Phòng khám Nội"
      }
      // ... more items (up to limit)
    ],
    "total": 1523,
    "page": 1,
    "limit": 50,
    "totalPages": 31
  },
  "message": "Lấy danh sách dịch vụ trùng thành công"
}
```

### Error Responses

#### 400 Bad Request - Invalid Date Range

```json
{
  "success": false,
  "message": "Khoảng thời gian không được vượt quá 60 ngày",
  "errors": {
    "type": "INVALID_DATE_RANGE",
    "details": {
      "fromDate": "2025-01-01",
      "toDate": "2026-01-06",
      "diffDays": 370
    }
  }
}
```

#### 400 Bad Request - Missing Required Fields

```json
{
  "success": false,
  "message": "Thiếu thông tin: fromDate, toDate",
  "errors": {
    "type": "VALIDATION_ERROR"
  }
}
```

#### 401 Unauthorized

```json
{
  "success": false,
  "message": "Bạn cần đăng nhập để truy cập",
  "errors": {
    "type": "AUTHENTICATION_ERROR"
  }
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Lỗi truy vấn dữ liệu: connection timeout",
  "errors": {
    "type": "DATABASE_ERROR"
  }
}
```

---

## 📊 ENDPOINT 2: Get Statistics

### Request

```http
POST /api/his/dichvutrung/statistics
Content-Type: application/json
Authorization: Bearer <token>

{
  "fromDate": "2026-01-01",
  "toDate": "2026-01-06",
  "serviceTypes": ["04CDHA", "03XN", "05TDCN"]
}
```

### Request Body Schema

```typescript
{
  fromDate: string;          // Required. Format: YYYY-MM-DD
  toDate: string;            // Required. Format: YYYY-MM-DD
  serviceTypes?: string[];   // Optional. Default: ['04CDHA', '03XN', '05TDCN']
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "totalDuplicates": 1523,
    "uniquePatients": 842,
    "totalCost": 156780000,
    "byServiceType": {
      "04CDHA": 645,
      "03XN": 523,
      "05TDCN": 355
    },
    "avgDuplicatesPerPatient": 1.81
  },
  "message": "Lấy thống kê thành công"
}
```

### Response Fields

| Field                   | Type   | Description                          |
| ----------------------- | ------ | ------------------------------------ |
| totalDuplicates         | number | Tổng số dịch vụ trùng lặp            |
| uniquePatients          | number | Số bệnh nhân bị ảnh hưởng (distinct) |
| totalCost               | number | Tổng chi phí dịch vụ trùng (VND)     |
| byServiceType           | object | Phân loại theo loại dịch vụ          |
| avgDuplicatesPerPatient | number | TB dịch vụ trùng / bệnh nhân         |

---

## 📊 ENDPOINT 3: Get Top Services

### Request

```http
POST /api/his/dichvutrung/top-services
Content-Type: application/json
Authorization: Bearer <token>

{
  "fromDate": "2026-01-01",
  "toDate": "2026-01-06",
  "serviceTypes": ["04CDHA", "03XN", "05TDCN"],
  "limit": 5
}
```

### Request Body Schema

```typescript
{
  fromDate: string;          // Required. Format: YYYY-MM-DD
  toDate: string;            // Required. Format: YYYY-MM-DD
  serviceTypes?: string[];   // Optional. Default: ['04CDHA', '03XN', '05TDCN']
  limit?: number;            // Optional. Default: 5, Max: 20
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "topServices": [
      {
        "servicepricecode": "09406",
        "servicepricename": "Chụp X-quang phổi thẳng",
        "service_type": "04CDHA",
        "duplicate_count": 145,
        "affected_patients": 73,
        "total_cost": 12325000
      },
      {
        "servicepricecode": "03502",
        "servicepricename": "Xét nghiệm công thức máu",
        "service_type": "03XN",
        "duplicate_count": 132,
        "affected_patients": 68,
        "total_cost": 7920000
      }
      // ... 3 more
    ],
    "topDepartments": [
      {
        "departmentgroupid": 10,
        "departmentgroupname": "KHOA NỘI TỔNG HỢP",
        "duplicate_count": 234,
        "affected_patients": 156,
        "total_cost": 45600000
      },
      {
        "departmentgroupid": 20,
        "departmentgroupname": "KHOA NGOẠI TỔNG HỢP",
        "duplicate_count": 198,
        "affected_patients": 142,
        "total_cost": 38900000
      }
      // ... 3 more
    ]
  },
  "message": "Lấy danh sách Top 5 thành công"
}
```

---

## 🔄 Frontend Integration

### Redux Thunk Example

```javascript
// File: dichvutrungSlice.js

export const getDuplicateServices =
  (fromDate, toDate, page = 1) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());

    try {
      const response = await apiService.post("/his/dichvutrung/duplicates", {
        fromDate,
        toDate,
        page,
        limit: 50,
      });

      dispatch(
        slice.actions.getDuplicatesSuccess({
          items: response.data.data.items,
          total: response.data.data.total,
          page: response.data.data.page,
          totalPages: response.data.data.totalPages,
        })
      );

      toast.success(`Tìm thấy ${response.data.data.total} bản ghi trùng lặp`);
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Không thể lấy dữ liệu");
    }
  };

export const getStatistics = (fromDate, toDate) => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  try {
    const response = await apiService.post("/his/dichvutrung/statistics", {
      fromDate,
      toDate,
    });

    dispatch(slice.actions.getStatisticsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error("Không thể lấy thống kê");
  }
};
```

### Component Usage Example

```javascript
// File: DichVuTrungDashboard.js

import { getDuplicateServices } from "../../Slice/dichvutrungSlice";

function DichVuTrungDashboard() {
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState(dayjs().subtract(30, "day"));
  const [toDate, setToDate] = useState(dayjs());

  const handleFetch = () => {
    // Validate
    const diffDays = toDate.diff(fromDate, "day");
    if (diffDays > 60) {
      toast.error("Khoảng thời gian không được vượt quá 60 ngày");
      return;
    }

    // Dispatch
    dispatch(
      getDuplicateServices(
        fromDate.format("YYYY-MM-DD"),
        toDate.format("YYYY-MM-DD")
      )
    );
  };

  // ... rest of component
}
```

---

## 🧪 Testing with cURL

### Test Duplicates Endpoint

```bash
# Get token first (from login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test valid request
curl -X POST http://localhost:8020/api/his/dichvutrung/duplicates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromDate": "2026-01-01",
    "toDate": "2026-01-06",
    "page": 1,
    "limit": 10
  }' | jq

# Test > 60 days (should fail)
curl -X POST http://localhost:8020/api/his/dichvutrung/duplicates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromDate": "2025-01-01",
    "toDate": "2026-01-06"
  }' | jq

# Test missing auth (should fail 401)
curl -X POST http://localhost:8020/api/his/dichvutrung/duplicates \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2026-01-01",
    "toDate": "2026-01-06"
  }' | jq
```

### Test Statistics Endpoint

```bash
curl -X POST http://localhost:8020/api/his/dichvutrung/statistics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromDate": "2026-01-01",
    "toDate": "2026-01-06"
  }' | jq
```

---

## 📋 Backend Implementation Checklist

### Controller (dichvutrung.controller.js)

```javascript
const { sendResponse, catchAsync, AppError } = require("../../helpers/utils");
const dichVuTrungService = require("../../models/his/dichvutrung");

const dichVuTrungController = {};

dichVuTrungController.getDuplicates = catchAsync(async (req, res, next) => {
  const { fromDate, toDate, page = 1, limit = 50 } = req.body;

  // Validation
  if (!fromDate || !toDate) {
    throw new AppError(
      400,
      "Thiếu thông tin: fromDate, toDate",
      "VALIDATION_ERROR"
    );
  }

  // Date validation
  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (isNaN(from) || isNaN(to)) {
    throw new AppError(
      400,
      "Định dạng ngày không hợp lệ",
      "INVALID_DATE_FORMAT"
    );
  }

  // Range validation (max 60 days)
  const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  if (diffDays > 60) {
    throw new AppError(
      400,
      "Khoảng thời gian không được vượt quá 60 ngày",
      "INVALID_DATE_RANGE"
    );
  }

  // Limit validation
  const validLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const validPage = Math.max(parseInt(page, 10) || 1, 1);

  // Call service
  const result = await dichVuTrungService.findDuplicateServices(
    fromDate,
    toDate,
    validPage,
    validLimit
  );

  return sendResponse(
    res,
    200,
    true,
    result,
    null,
    "Lấy danh sách dịch vụ trùng thành công"
  );
});

// Similar for getStatistics and getTopServices...

module.exports = dichVuTrungController;
```

### Routes (dichvutrung.api.js)

```javascript
const express = require("express");
const router = express.Router();
const dichVuTrungController = require("../../controllers/his/dichvutrung.controller");
const authentication = require("../../middlewares/authentication");

router.post(
  "/duplicates",
  authentication.loginRequired,
  dichVuTrungController.getDuplicates
);
router.post(
  "/statistics",
  authentication.loginRequired,
  dichVuTrungController.getStatistics
);
router.post(
  "/top-services",
  authentication.loginRequired,
  dichVuTrungController.getTopServices
);

module.exports = router;
```

---

## ⚠️ Error Handling Best Practices

### Backend

1. Always use `catchAsync` wrapper
2. Throw `AppError` for controlled errors
3. Let middleware handle unexpected errors
4. Log errors with context

### Frontend

1. Show user-friendly toast messages
2. Set loading state properly
3. Clear error state on retry
4. Handle network errors gracefully

---

## 📊 Rate Limiting (Future Enhancement)

**Consider adding rate limiting:**

- Max 100 requests/minute per user
- Use Redis for distributed rate limiting
- Return 429 Too Many Requests when exceeded

```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');

const dichVuTrungLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau"
});

router.post("/duplicates", dichVuTrungLimiter, authentication.loginRequired, ...);
```

---

_See SQL_QUERY_TEMPLATE.md for database query details_  
_See COMPONENT_STRUCTURE.md for frontend implementation_
