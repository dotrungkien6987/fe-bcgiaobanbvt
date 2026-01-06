# 📊 SQL QUERY TEMPLATE - DỊCH VỤ TRÙNG LẶP

## 📋 Database Context

**Database:** PostgreSQL HIS (192.168.5.5:5432/HIS_bvt)  
**Main Table:** `serviceprice`  
**Filter Services:** bhyt_groupcode (CDHA='04CDHA', XN='03XN', TDCN='05TDCN') - **Truyền từ FE**

---

## 🔍 Business Logic

### Điều kiện "Trùng lặp"

Một dịch vụ được coi là **TRÙNG LẶP** khi:

1. ✅ Cùng `vienphiid` (cùng đợt điều trị)
2. ✅ Cùng `servicepricecode` (cùng loại dịch vụ)
3. ✅ **KHÁC** `departmentgroupid` (khác khoa chỉ định)
4. ✅ Trong khoảng thời gian query

**VÍ DỤ:**

```
Bệnh nhân A (vienphiid = 123456) có:
- XQ Phổi được chỉ định ở Khoa Nội (departmentgroupid = 10)
- XQ Phổi được chỉ định ở Khoa Ngoại (departmentgroupid = 20)
→ ĐÂY LÀ TRÙNG LẶP
```

---

## 📝 QUERY 1: Tìm Bản Ghi Trùng Lặp

### Query Structure

```sql
-- File: giaobanbv-be/querySQL/qDichVuTrung.js
-- Export: qDichVuTrung.findDuplicates

WITH duplicate_candidates AS (
    -- BƯỚC 1: Tìm các (vienphiid, servicepricecode) có > 1 departmentgroupid
    SELECT
        vienphiid,
        servicepricecode,
        COUNT(DISTINCT departmentgroupid) AS dept_count,
        COUNT(*) AS total_count
    FROM serviceprice
    WHERE
        servicepricedate BETWEEN $1 AND $2
        AND bhyt_groupcode = ANY($3::text[])  -- ✅ FE truyền array: ['04CDHA', '03XN', '05TDCN']
        -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
    GROUP BY vienphiid, servicepricecode
    HAVING COUNT(DISTINCT departmentgroupid) > 1
),
duplicate_records AS (
    -- BƯỚC 2: Lấy chi tiết các bản ghi trùng
    SELECT
        sp.servicepriceid,              -- ✅ FIXED: Primary key
        sp.vienphiid,
        sp.servicepricecode,
        sp.servicepricename,
        sp.servicepricedate,            -- ✅ FIXED: Timestamp field
        sp.servicepricemoney,           -- ✅ FIXED: price → servicepricemoney
        sp.soluong,                     -- ✅ FIXED: quantity → soluong
        sp.departmentid,
        sp.departmentgroupid,
        sp.bhyt_groupcode,

        -- ✅ FIXED: Thông tin bệnh nhân từ hosobenhan (không cần JOIN patient)
        hsba.hosobenhancode,
        hsba.patientid,
        hsba.patientcode,               -- ✅ Trực tiếp từ hosobenhan
        hsba.patientname,               -- ✅ Trực tiếp từ hosobenhan
        hsba.birthday,                  -- ✅ FIXED: patientbirthdate → birthday
        hsba.gioitinhcode,              -- ✅ FIXED: patientgender → gioitinhcode

        -- Join thông tin khoa
        dg.departmentgroupname,
        d.departmentname

    FROM serviceprice sp
    INNER JOIN duplicate_candidates dc
        ON sp.vienphiid = dc.vienphiid
        AND sp.servicepricecode = dc.servicepricecode
    LEFT JOIN hosobenhan hsba ON sp.hosobenhanid = hsba.hosobenhanid
    -- ✅ REMOVED: Patient table JOIN (không cần thiết)
    LEFT JOIN departmentgroup dg ON sp.departmentgroupid = dg.departmentgroupid
    LEFT JOIN department d ON sp.departmentid = d.departmentid
    WHERE
        sp.servicepricedate BETWEEN $1 AND $2
        AND sp.bhyt_groupcode = ANY($3::text[])
        -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
)
SELECT * FROM duplicate_records
ORDER BY vienphiid, servicepricecode, servicepricedate
LIMIT $4 OFFSET $5;
```

### Parameters

- `$1`: fromDate (YYYY-MM-DD)
- `$2`: toDate (YYYY-MM-DD)
- `$3`: serviceTypes (text[]) - VD: ['04CDHA', '03XN', '05TDCN'] hoặc ['04CDHA']
- `$4`: limit (default 50)
- `$5`: offset (calculated from page)

**Note:** FE có thể chọn 1, 2 hoặc cả 3 loại dịch vụ qua checkbox/multi-select

### Expected Output Format

```json
[
  {
    "servicepriceid": 123456, // ✅ FIXED: Primary key
    "vienphiid": 789012, // ⚠️ Integer, not string
    "servicepricecode": "09406",
    "servicepricename": "Chụp X-quang phổi thẳng",
    "servicepricedate": "2026-01-05T14:30:00.000Z",
    "servicepricemoney": 85000, // ✅ FIXED: price → servicepricemoney
    "soluong": 1, // ✅ FIXED: quantity → soluong
    "departmentid": 15,
    "departmentgroupid": 10,
    "bhyt_groupcode": "04CDHA",
    "hosobenhancode": "0001234567",
    "patientid": 98765,
    "patientcode": "BN0123456", // ✅ Từ hosobenhan
    "patientname": "Nguyễn Văn A", // ✅ Từ hosobenhan
    "birthday": "1980-05-15T00:00:00.000Z", // ✅ FIXED field name
    "gioitinhcode": "M", // ✅ FIXED: Code field
    "departmentgroupname": "KHOA NỘI TỔNG HỢP",
    "departmentname": "Phòng khám Nội"
  }
  // ... more records
]
```

---

## 📝 QUERY 2: Đếm Tổng Số Bản Ghi

### Query Structure

```sql
-- Export: qDichVuTrung.countDuplicates

WITH duplicate_candidates AS (
    SELECT
        vienphiid,
        servicepricecode,
        COUNT(DISTINCT departmentgroupid) AS dept_count
    FROM serviceprice= ANY($3::text[])
        -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
    GROUP BY vienphiid, servicepricecode
    HAVING COUNT(DISTINCT departmentgroupid) > 1
)
SELECT COUNT(*) AS total_count
FROM serviceprice sp
INNER JOIN duplicate_candidates dc
    ON sp.vienphiid = dc.vienphiid
    AND sp.servicepricecode = dc.servicepricecode
WHERE
    sp.servicepricedate BETWEEN $1 AND $2
    AND sp.bhyt_groupcode = ANY($3::text[]
WHERE
    sp.servicepricedate BETWEEN $1 AND $2
    AND sp.bhyt_groupcode IN ('04CDHA', '03XN', '05TDCN');
    -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
```

### Expected Output

```json
[{ "total_count": "1523" }]
```

---

## 📝 QUERY 3: Top Services/Departments

### Top 5 Services by Duplicate Count

```sql
-- Export: qDichVuTrung.getTopServices

WITH duplicate_candidates AS (
    SELECT
        vienphiid,
        servicepricecode,
        COUNT(DISTINCT departmentgroupid) AS dept_count
    FROM serviceprice= ANY($3::text[])
        -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
    GROUP BY vienphiid, servicepricecode
    HAVING COUNT(DISTINCT departmentgroupid) > 1
)
SELECT
    sp.servicepricecode,
    sp.servicepricename,
    sp.bhyt_groupcode AS service_type,
    COUNT(*) AS duplicate_count,
    COUNT(DISTINCT sp.vienphiid) AS affected_patients,
    SUM(sp.servicepricemoney * sp.soluong) AS total_cost  -- ✅ FIXED: price*quantity → servicepricemoney*soluong
FROM serviceprice sp
INNER JOIN duplicate_candidates dc
    ON sp.vienphiid = dc.vienphiid
    AND sp.servicepricecode = dc.servicepricecode
WHERE
    sp.servicepricedate BETWEEN $1 AND $2
    AND sp.bhyt_groupcode = ANY($3::text[])
GROUP BY sp.servicepricecode, sp.servicepricename, sp.bhyt_groupcode
ORDER BY duplicate_count DESC
LIMIT $4️ NOTE: Không có trường isdeleted trong serviceprice
GROUP BY sp.servicepricecode, sp.servicepricename, sp.bhyt_groupcode
ORDER BY duplicate_count DESC
LIMIT $3;
```

### Top 5 Departments by Duplicate Count

```sql
-- Export: qDichVuTrung.getTopDepartments

WITH duplicate_candidates AS (
    SELECT
        vienphiid,
        servicepricecode,
        COUNT(DISTINCT departmentgroupid) AS dept_count
    FROM serviceprice
    WHERE
        servicepricedate BETWEEN $1 AND $2
        AND bhyt_groupcode = ANY($3::text[])
        -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
    GROUP BY vienphiid, servicepricecode
    HAVING COUNT(DISTINCT departmentgroupid) > 1
)
SELECT
    dg.departmentgroupid,
    dg.departmentgroupname,
    COUNT(*) AS duplicate_count,
    COUNT(DISTINCT sp.vienphiid) AS affected_patients,
    SUM(sp.servicepricemoney * sp.soluong) AS total_cost  -- ✅ FIXED: price*quantity → servicepricemoney*soluong
FROM serviceprice sp
INNER JOIN duplicate_candidates dc
    ON sp.vienphiid = dc.vienphiid
    AND sp.servicepricecode = dc.servicepricecode
LEFT JOIN departmentgroup dg ON sp.departmentgroupid = dg.departmentgroupid
WHERE
    sp.servicepricedate BETWEEN $1 AND $2
    AND sp.bhyt_groupcode = ANY($3::text[])
GROUP BY dg.departmentgroupid, dg.departmentgroupname
ORDER BY duplicate_count DESC
LIMIT $4;
```

### Expected Output

```json
// Top Services
[
  {
    "servicepricecode": "09406",
    "servicepricename": "Chụp X-quang phổi thẳng",
    "service_type": "04CDHA",
    "duplicate_count": 145,
    "affected_patients": 73,
    "total_cost": 12325000
  },
  // ... 4 more
]

// Top Departments
[
  {
    "departmentgroupid": 10,
    "departmentgroupname": "KHOA NỘI TỔNG HỢP",
    "duplicate_count": 234,
    "affected_patients": 156,
    "total_cost": 45600000
  },
  // ... 4 more
]
```

---

## 🔧 Implementation File

### Complete qDichVuTrung.js Template

```javascript
// File: giaobanbv-be/querySQL/qDichVuTrung.js

const qDichVuTrung = {};

/**
 * Tìm các bản ghi dịch vụ trùng lặp
 * Params: $1=fromDate, $2=toDate, $3=limit, $4=offset
 */
qDichVuTrung.findDuplicates = `
WITH duplicate_candidates AS (
    -- Copy query từ QUERY 1 phía trên
)
SELECT * FROM duplicate_records
ORDER BY vienphiid, servicepricecode, servicepricedate
LIMIT $3 OFFSET $4;
`;

/**
 * Đếm tổng số bản ghi trùng
 * Params: $1=fromDate, $2=toDate
 */
qDichVuTrung.countDuplicates = `
WITH duplicate_candidates AS (
    -- Copy query từ QUERY 2 phía trên
)
SELECT COUNT(*) AS total_count
FROM serviceprice sp
-- ... rest of query
`;

/**
 * Top 5 services có nhiều trùng lặp nhất
 * Params: $1=fromDate, $2=toDate, $3=limit (default 5)
 */
qDichVuTrung.getTopServices = `
WITH duplicate_candidates AS (
    -- Copy query từ QUERY 3 phía trên
)
SELECT sp.servicepricecode, ...
-- ... rest of query
`;

/**
 * Top 5 departments chỉ định trùng nhiều nhất
 * Params: $1=fromDate, $2=toDate, $3=limit (default 5)
 */
qDichVuTrung.getTopDepartments = `
WITH duplicate_candidates AS (
    -- Copy query từ QUERY 3 phía trên
}
SELECT dg.departmentgroupid, ...
-- ... rest of query
`;

module.exports = qDichVuTrung;
```

---

## ⚡ Performance Optimization

### Indexes (Optional - DO NOT CREATE without DBA approval)

```sql
-- These indexes COULD improve performance
-- But DO NOT create in production HIS database

CREATE INDEX idx_serviceprice_date_groupcode
ON serviceprice(servicepricedate, bhyt_groupcode);

CREATE INDEX idx_serviceprice_vienphiid_code
ON serviceprice(vienphiid, servicepricecode);

CREATE INDEX idx_serviceprice_deptgroup
ON serviceprice(departmentgroupid);
```

### Query Optimization Tips

1. **Use LIMIT wisely**: Max 100 records per page
2. **Date range**: Max 60 days enforced at controller
3. **Consider adding**: `LIMIT 5000` in CTE if data is massive
4. **Monitor execution time**: Use `EXPLAIN ANALYZE` in dev

---

## 🧪 Testing Queries

### Test in PostgreSQL Client

```sql
-- Test 1: Check if duplicate candidates exist
SELECT
    vienphiid,
    servicepricecode,
    COUNT(DISTINCT departmentgroupid) AS dept_count,
    COUNT(*) AS record_count
FROM serviceprice
WHERE
    servicepricedate BETWEEN '2026-01-01' AND '2026-01-06'
    AND bhyt_groupcode IN ('04CDHA', '03XN', '05TDCN')
    -- ⚠️ NOTE: Không có trường isdeleted trong serviceprice
GROUP BY vienphiid, servicepricecode
HAVING COUNT(DISTINCT departmentgroupid) > 1
LIMIT 10;

-- Test 2: Verify JOIN results
SELECT
    sp.vienphiid,
    sp.servicepricename,
    hsba.patientname,                  -- ✅ FIXED: Từ hosobenhan, không phải patient table
    dg.departmentgroupname
FROM serviceprice sp
LEFT JOIN hosobenhan hsba ON sp.hosobenhanid = hsba.hosobenhanid
-- ✅ REMOVED: Patient table JOIN (không cần thiết)
LEFT JOIN departmentgroup dg ON sp.departmentgroupid = dg.departmentgroupid
WHERE sp.servicepricedate BETWEEN '2026-01-01' AND '2026-01-06'
AND sp.bhyt_groupcode = '04CDHA'
LIMIT 5;
```

---

## 📋 Field Mapping

### serviceprice table

- `servicepriceid` → **Primary key** ✅ FIXED
- `vienphiid` → Visit ID (đợt điều trị) - **integer**
- `servicepricecode` → Service code (mã dịch vụ)
- `servicepricename` → Service name (tên dịch vụ)
- `servicepricedate` → Service date (ngày dịch vụ) - **timestamp** ✅ FIXED
- `servicepricemoney` → Service price (giá dịch vụ) - **double precision** ✅ FIXED
- `soluong` → Quantity (số lượng) - **double precision** ✅ FIXED
- `bhyt_groupcode` → Service type ('04CDHA', '03XN', '05TDCN')
- `departmentgroupid` → Department group ID (nhóm khoa)
- `departmentid` → Department ID (phòng ban)
- ⚠️ **NO `isdeleted` field** - Không có trường soft delete

### hosobenhan table (Chứa cả thông tin patient)

- `hosobenhanid` → Medical record ID
- `patientid` → Patient ID
- `hosobenhancode` → Medical record code
- `patientcode` → Patient code ✅ **Từ hosobenhan, KHÔNG từ patient table**
- `patientname` → Patient name ✅ **Từ hosobenhan**
- `birthday` → Date of birth ✅ **FIXED: birthday, not patientbirthdate**
- `gioitinhcode` → Gender code ✅ **FIXED: gioitinhcode (code field), not patientgender**

### ⚠️ patient table - KHÔNG SỬ DỤNG

**Lý do:** Tất cả thông tin bệnh nhân đã có sẵn trong bảng `hosobenhan` (denormalized)

### departmentgroup table

- `departmentgroupid` → Department group ID
- `departmentgroupname` → Department group name

---

_See API_CONTRACT.md for how these queries are called from backend_
