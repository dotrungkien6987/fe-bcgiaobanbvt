# FEATURE: Tab Yêu Cầu trong KPI Evaluation

## 🎯 MỤC TIÊU

Thêm tab "Yêu cầu" vào KPI evaluation dialog để manager review các yêu cầu nhân viên đã xử lý (tương tự tab "Công việc" hiện có).

## 📍 VỊ TRÍ HIỂN THỊ

### 1. Tab mới trong expand row

```
NVTQ #1: "Xử lý yêu cầu hành chính" [Expand ▼]
  ├─ Tab 1: ✏️ Chấm điểm
  ├─ Tab 2: 📋 Công việc [18]
  └─ Tab 3: 📨 Yêu cầu [12] ← MỚI
```

### 2. Cột "Yêu cầu" trong table

```
│ # │ Nhiệm vụ │ Độ khó │ Công việc │ Yêu cầu │ Điểm │
├───┼──────────┼────────┼───────────┼─────────┼──────┤
│ 1 │ ...      │  5.0   │    18     │   12    │  85  │
                                       ↑ MỚI
```

### 3. Section "Yêu cầu khác"

```
ChamDiemKPIDialog:
  ├─ Nhiệm vụ thường quy (table)
  ├─ 📦 Công việc khác
  └─ 📨 Yêu cầu khác ← MỚI (không gán NVTQ)
```

## ✅ SCHEMA - ĐÃ ĐỦ

```javascript
// YeuCau model - ĐÃ CÓ field DanhGia
DanhGia: {
  SoSao: Number,      // 1-5 sao
  NhanXet: String,
  NgayDanhGia: Date
}

// Indexes đã có
yeuCauSchema.index({ NguoiXuLyID: 1, TrangThai: 1 });
yeuCauSchema.index({ NhiemVuThuongQuyID: 1, NguoiXuLyID: 1, createdAt: 1 }); // CẦN THÊM

// LichSuYeuCau - Để tính response time (Phase 2)
HanhDong: "TIEP_NHAN"
```

## 📊 DASHBOARD METRICS (8 Cards)

```
Card 1: Tổng số yêu cầu
Card 2: Tỷ lệ hoàn thành (%)
Card 3: Trễ hạn
Card 4: Tỷ lệ trễ (%)
Card 5: Đang xử lý
Card 6: Quá hạn
Card 7: [Reserved - Response time future]
Card 8: Đánh giá TB (⭐ 4.2/5.0)
```

Plus: Pie chart phân bố trạng thái, Task list (max 50 rows)

## 🚀 LOAD STRATEGY: Sequential Lazy Prefetch

```
1. Dialog opens
   ↓
2. [60ms] Load COUNT tất cả NVTQ (1 API)
   → Table column + Badge hiển thị số
   ↓
3. [200ms] Prefetch row #1 dashboard
   ↓
4. Manager expand row N
   → Instant display (nếu prefetched)
   → Background: Prefetch row N+1
```

**Key decisions:**

- ✅ Prefetch ONLY next 1 row (không 2)
- ✅ Simple in-memory cache (NO Redis)
- ✅ 10 min cache TTL
- ✅ Max 2 concurrent requests/client

## 🔧 API ENDPOINTS (3 mới)

### 1. Count API (Lightweight)

```
GET /api/workmanagement/yeucau/counts-by-nhiemvu
Query: {
  nhiemVuThuongQuyIDs: "id1,id2,...",
  nhanVienID: "...",
  chuKyDanhGiaID: "..."
}
Response: { "nvtq1": 12, "nvtq2": 8, ... }
Performance: ~50ms
```

### 2. Dashboard API (với cache)

```
GET /api/workmanagement/yeucau/dashboard-by-nhiemvu
Query: {
  nhiemVuThuongQuyID: "...",
  nhanVienID: "...",
  chuKyDanhGiaID: "..."
}
Response: {
  summary: { total, completed, completionRate, late, lateRate, active, overdue },
  statusDistribution: [{status, count, percentage}],
  priorityDistribution: [{priority, total, completed, late}],
  rating: { avgScore, distribution: [{stars, count}], totalRatings },
  yeuCauList: [...] // Max 50
}
Performance: 200-300ms
Cache: 5-10 min (simple in-memory)
```

### 3. Other YeuCau Summary

```
GET /api/workmanagement/yeucau/other-summary
Query: { nhanVienID, chuKyDanhGiaID }
Response: Same as dashboard API
```

## 💾 SIMPLE CACHE (NO Redis)

```javascript
// services/simpleCache.js
class SimpleCacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 10 * 60 * 1000; // 10 min
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data, customTTL) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (customTTL || this.ttl),
    });
  }

  clear(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = new SimpleCacheService();
```

## 📱 FRONTEND COMPONENTS

### Redux State (yeuCauSlice.js)

```javascript
{
  yeuCauCounts: {
    "chuky123": { "nvtq1": 12, "nvtq2": 8 }
  },
  yeuCauDashboard: {
    "nvtq1_chuky123": { data, isLoading, error, timestamp }
  },
  otherYeuCauSummary: {
    "nhanvien1_chuky123": { data, timestamp }
  },
  activeRequestCount: 0
}
```

### Components Mới

- `YeuCauDashboard.js` - Main dashboard với 8 cards + chart
- `YeuCauCompactCard.js` - For "Yêu cầu khác" section

### Components Sửa

- `ChamDiemKPITable.js` - Add column + Tab 3 + prefetch logic
- `ChamDiemKPIDialog.js` - Add "Yêu cầu khác" section

## 📅 TIMELINE: 7 days

```
Day 1: Backend foundation
  - Simple cache service
  - Count API
  - Indexes

Day 2: Backend dashboard
  - Dashboard API với 8 metrics
  - Other summary API
  - Rating aggregation

Day 3: Frontend Redux + skeleton
  - Redux actions
  - YeuCauDashboard skeleton
  - 8 cards layout

Day 4: Frontend visualizations
  - Pie chart
  - Task list
  - Rating display

Day 5: Integration
  - Table column
  - Tab 3
  - Prefetch logic

Day 6: Testing
  - Sequential flow
  - Edge cases
  - Performance

Day 7: Polish
  - UI/UX
  - Documentation
```

## 🖥️ SERVER CONFIG

**Target:** 16 cores + 32GB RAM (NO Redis)

- Normal: 50-65% CPU, 65-75% RAM
- Peak: 75-95% CPU, 80-90% RAM

## 🎯 SUCCESS METRICS

- Count API: <100ms
- Dashboard API: <300ms (no cache), <50ms (cached)
- Tab switch: <100ms (prefetched), <500ms (not prefetched)
- Memory: <500MB for cache
- 95% rows instant display

## 📋 NEXT STEPS

Khi bắt đầu implementation:

1. Tạo simple cache service (30 mins)
2. Add compound index (15 mins)
3. Implement Count API (2 hours)
4. Test với 8 NVTQ concurrent
5. Continue theo timeline...

---

**References:**

- Existing pattern: `CongViecDashboard.js`
- Tab structure: `ChamDiemKPITable.js` lines 952-1447
- State machine: `YeuCau.js` model
