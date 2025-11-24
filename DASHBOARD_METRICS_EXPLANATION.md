# 📊 Dashboard Metrics - Giải thích Logic và Ngữ nghĩa

## Tổng quan

Tab "Công việc" trong expand row của ChamDiemKPITable hiển thị **8 chỉ số thống kê** về công việc của nhân viên trong chu kỳ đánh giá. Dữ liệu được lấy từ backend API `/workmanagement/congviec/dashboard-by-nhiemvu`.

---

## 📋 Cấu trúc dữ liệu từ Backend

### Base Filter (Lọc công việc theo chu kỳ)

```javascript
{
  NhiemVuThuongQuyID: "...",        // Nhiệm vụ thường quy cụ thể
  NguoiChinhID: nhanVienID,         // Nhân viên được đánh giá
  isDeleted: { $ne: true },         // Chỉ lấy công việc chưa xóa
  createdAt: {                      // ✅ SỬ DỤNG createdAt để lọc theo chu kỳ
    $gte: chuKy.NgayBatDau,         // Từ ngày bắt đầu chu kỳ
    $lte: chuKy.NgayKetThuc          // Đến ngày kết thúc chu kỳ
  }
}
```

**⚠️ LƯU Ý QUAN TRỌNG:** Công việc được lọc theo `createdAt`, KHÔNG phải `NgayGiaoViec` (vì NgayGiaoViec có thể null).

---

## 📊 8 Chỉ số Dashboard

### Hàng 1: Chỉ số tổng quan

#### 1️⃣ **Tổng** (Total)

```
Icon: 📝
Màu: info (xanh dương)
```

**Nguồn dữ liệu:**

```javascript
// Tổng số công việc trong chu kỳ
total = Object.values(statusMap).reduce((sum, count) => sum + count, 0);
```

**Công thức:**

```
Tổng = TAO_MOI + DA_GIAO + DANG_THUC_HIEN + CHO_DUYET + HOAN_THANH
```

**Ví dụ:** `15 công việc`

---

#### 2️⃣ **Hoàn thành** (Completed)

```
Icon: ✅
Màu: success/warning/error (tùy completionRate)
```

**Nguồn dữ liệu:**

```javascript
// Số công việc ở trạng thái HOAN_THANH
completed = statusMap.HOAN_THANH;

// Tỷ lệ hoàn thành
completionRate = completed / total;
```

**Công thức phụ đề:**

```javascript
percentage = Math.round(completionRate * 100);
label = percentage >= 80 ? "Tốt" : percentage >= 60 ? "Khá" : "Cần cải thiện";
```

**Logic màu sắc:**

- `completionRate >= 0.8` (≥80%) → **success** (xanh lá)
- `completionRate >= 0.6` (≥60%) → **warning** (vàng)
- `completionRate < 0.6` (<60%) → **error** (đỏ)

**Ví dụ:** `12 • 80% • Tốt` (12 công việc hoàn thành, tỷ lệ 80%)

**🔍 GIẢI THÍCH "Cần cải thiện":**

- Xuất hiện khi `completionRate < 60%`
- Ý nghĩa: Nhân viên hoàn thành ít hơn 60% công việc được giao
- Đây là **cảnh báo về năng suất** cần quản lý can thiệp

---

#### 3️⃣ **Trễ hạn** (Late)

```
Icon: ⏰
Màu: success/warning/error (tùy lateRate)
```

**Nguồn dữ liệu:**

```javascript
// Backend aggregation - chỉ tính trong công việc HOÀN THÀNH
{
  $match: { ...baseFilter, TrangThai: "HOAN_THANH" },
  $group: {
    late: { $sum: { $cond: [{ $eq: ["$HoanThanhTreHan", true] }, 1, 0] } }
  }
}

lateRate = late / totalCompleted
```

**Công thức phụ đề:**

```javascript
percentage = Math.round(lateRate * 100);
label = lateRate < 0.1 ? "Tốt" : lateRate < 0.2 ? "Cảnh báo" : "Nghiêm trọng";
```

**Logic màu sắc:**

- `lateRate < 0.1` (<10%) → **success** (xanh lá)
- `lateRate < 0.2` (<20%) → **warning** (vàng)
- `lateRate >= 0.2` (≥20%) → **error** (đỏ)

**Ví dụ:** `2 • 17% • Cảnh báo` (2 công việc trễ hạn trong 12 hoàn thành, tỷ lệ 17%)

**🔍 GIẢI THÍCH:**

- **Trễ hạn = HoanThanhTreHan = true**
- Backend tính dựa vào: `NgayHoanThanh > NgayHetHan`
- Chỉ số này phản ánh **kỷ luật thời gian** của nhân viên
- Khác với "Đang thực hiện" (công việc chưa xong), đây là **đã xong nhưng muộn**

---

#### 4️⃣ **Đang thực hiện** (Active)

```
Icon: 🔄
Màu: warning/info (tùy có overdue không)
```

**Nguồn dữ liệu:**

```javascript
// Số công việc ở trạng thái DANG_THUC_HIEN
active = statusMap.DANG_THUC_HIEN;

// Số công việc quá hạn (chưa hoàn thành nhưng đã quá NgayHetHan)
overdue = taskList.filter(
  (task) =>
    task.TrangThai !== "HOAN_THANH" &&
    task.NgayHetHan &&
    new Date(task.NgayHetHan) < now
).length;
```

**Công thức phụ đề:**

```javascript
subtitle = `${overdue} quá hạn`;
color = overdue > 0 ? "warning" : "info";
```

**Ví dụ:** `3 • 1 quá hạn` (3 công việc đang làm, trong đó 1 quá hạn)

**🔍 GIẢI THÍCH:**

- **Đang thực hiện:** Công việc ở trạng thái `DANG_THUC_HIEN`
- **Quá hạn:** Công việc chưa xong MÀ `NgayHetHan < hiện tại`
- Khác với "Trễ hạn" (đã hoàn thành muộn), đây là **đang làm dở nhưng muộn**

---

### Hàng 2: Chỉ số chất lượng

#### 5️⃣ **Đúng tiến độ** (On-time Rate)

```
Icon: ⚡
Màu: success/warning/error (tùy giá trị %)
```

**Nguồn dữ liệu:**

```javascript
// Backend aggregation - chỉ tính trong công việc HOÀN THÀNH
{
  $match: { ...baseFilter, TrangThai: "HOAN_THANH" },
  $group: {
    onTime: { $sum: { $cond: [{ $eq: ["$HoanThanhTreHan", false] }, 1, 0] } }
  }
}

onTimeRate = (onTime / totalCompleted) * 100
```

**Công thức phụ đề:**

```javascript
label = onTimeRate >= 75 ? "Tốt" : onTimeRate >= 50 ? "Khá" : "Cần cải thiện";
```

**Logic màu sắc:**

- `onTimeRate >= 75%` → **success** (xanh lá)
- `onTimeRate >= 50%` → **warning** (vàng)
- `onTimeRate < 50%` → **error** (đỏ)

**Ví dụ:** `83% • Tốt` (83% công việc hoàn thành đúng hạn)

**🔍 GIẢI THÍCH:**

- Đây là **tỷ lệ nghịch** của "Trễ hạn"
- `Đúng tiến độ % = (1 - lateRate) * 100`
- Phản ánh **khả năng tuân thủ deadline** của nhân viên

---

#### 6️⃣ **Tiến độ TB** (Average Progress)

```
Icon: 📊
Màu: success/warning/error (tùy giá trị %)
```

**Nguồn dữ liệu:**

```javascript
// Backend aggregation - tính trung bình PhanTramTienDoTong
{
  $match: baseFilter,  // TẤT CẢ công việc (không chỉ hoàn thành)
  $group: {
    totalProgress: { $sum: "$PhanTramTienDoTong" },
    totalTasks: { $sum: 1 }
  }
}

avgProgress = totalProgress / totalTasks
```

**Công thức phụ đề:**

```javascript
label = avgProgress >= 75 ? "Tốt" : avgProgress >= 50 ? "Khá" : "Thấp";
```

**Ví dụ:** `68.5% • Khá` (tiến độ trung bình 68.5%)

**🔍 GIẢI THÍCH:**

- Tính **trên TẤT CẢ công việc** (kể cả đang làm dở)
- `PhanTramTienDoTong` = Tổng % hoàn thành của công việc
- Ví dụ: Công việc A (100%), B (50%), C (80%) → Trung bình = 76.7%
- Phản ánh **tiến độ thực tế** của nhân viên

---

#### 7️⃣ **Team size TB** (Average Team Size)

```
Icon: 👥
Màu: info (xanh dương)
```

**Nguồn dữ liệu:**

```javascript
// Backend aggregation - tính trung bình số người tham gia
{
  $match: baseFilter,
  $group: {
    avgTeamSize: { $avg: { $size: "$NguoiThamGia" } }
  }
}
```

**Công thức:**

```
avgTeamSize = SUM(số người tham gia mỗi công việc) / số công việc
```

**Ví dụ:** `2.3 người/cv` (trung bình mỗi công việc có 2.3 người)

**🔍 GIẢI THÍCH:**

- `NguoiThamGia` = Array các NhanVienID tham gia công việc
- Chỉ số này phản ánh **mức độ làm việc nhóm** của nhân viên
- Team size cao → Công việc phức tạp, cần phối hợp
- Team size thấp → Công việc độc lập

---

#### 8️⃣ **Tương tác TB** (Average Comments)

```
Icon: 💬
Màu: info (xanh dương)
```

**Nguồn dữ liệu:**

```javascript
// Backend aggregation - tính trung bình số comment
{
  $match: baseFilter,
  $lookup: {
    from: "binhluans",
    localField: "_id",
    foreignField: "CongViecID",
    as: "comments"
  },
  $group: {
    totalComments: { $sum: { $size: "$comments" } },
    totalTasks: { $sum: 1 }
  }
}

avgComments = totalComments / totalTasks
```

**Công thức:**

```
avgComments = SUM(số comment mỗi công việc) / số công việc
```

**Ví dụ:** `4.7 comments/cv` (trung bình mỗi công việc có 4.7 comment)

**🔍 GIẢI THÍCH:**

- Lookup từ collection `binhluans` với `CongViecID`
- Chỉ số này phản ánh **mức độ giao tiếp** của nhân viên
- Comment nhiều → Tương tác tích cực, cập nhật tiến độ thường xuyên
- Comment ít → Làm việc im lặng, ít báo cáo

---

## 🎨 Visual Representation

```
┌───────────────────────────────────────────────────────────────────┐
│                    DASHBOARD - CÔNG VIỆC                          │
├───────────────────────────────────────────────────────────────────┤
│ ROW 1: TỔNG QUAN                                                  │
│ ┌──────────┬──────────────┬──────────────┬─────────────────────┐ │
│ │ 📝 Tổng  │ ✅ Hoàn thành│ ⏰ Trễ hạn   │ 🔄 Đang thực hiện   │ │
│ │    15    │      12      │      2       │         3           │ │
│ │ công việc│  80% • Tốt   │ 17% • Cảnh báo│    1 quá hạn       │ │
│ │  (info)  │  (success)   │  (warning)   │    (warning)        │ │
│ └──────────┴──────────────┴──────────────┴─────────────────────┘ │
│                                                                   │
│ ROW 2: CHẤT LƯỢNG                                                 │
│ ┌──────────────┬──────────────┬──────────────┬─────────────────┐ │
│ │ ⚡ Đúng tiến độ│ 📊 Tiến độ TB│ 👥 Team size TB│ 💬 Tương tác TB│ │
│ │      83%     │     68.5%    │      2.3      │      4.7       │ │
│ │      Tốt     │      Khá     │   người/cv    │   comments/cv  │ │
│ │   (success)  │   (warning)  │     (info)    │     (info)     │ │
│ └──────────────┴──────────────┴──────────────┴─────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📈 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND REQUEST                         │
│  ChamDiemKPITable → dispatch(fetchCongViecDashboard)            │
│  Params: {nhiemVuThuongQuyID, nhanVienID, chuKyDanhGiaID}      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API ENDPOINT                        │
│  GET /workmanagement/congviec/dashboard-by-nhiemvu              │
│  Controller: congViecController.getDashboardByNhiemVu           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER LOGIC                         │
│  congViecService.getDashboardByNhiemVu()                        │
│                                                                 │
│  STEP 1: Lấy chu kỳ đánh giá (NgayBatDau, NgayKetThuc)         │
│  STEP 2: Tạo baseFilter                                         │
│    - NhiemVuThuongQuyID                                         │
│    - NguoiChinhID                                               │
│    - createdAt: {$gte: NgayBatDau, $lte: NgayKetThuc}          │
│  STEP 3: Chạy 5 aggregations song song                         │
│    a) statusDistribution (group by TrangThai)                   │
│    b) timeMetrics (completed tasks only)                        │
│    c) collaborationMetrics (avg team size, comments)            │
│    d) priorityBreakdown (group by MucDoUuTien)                  │
│    e) taskList (full data with populate)                        │
│  STEP 4: Xử lý kết quả và tính toán các chỉ số                 │
│  STEP 5: Trả về dashboard data                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RESPONSE STRUCTURE                          │
│  {                                                              │
│    summary: {                                                   │
│      total, completed, completionRate,                          │
│      late, lateRate, active, overdue,                           │
│      avgProgress, onTimeRate                                    │
│    },                                                           │
│    timeMetrics: {                                               │
│      avgLateHours, maxLateHours,                                │
│      avgCompletionDays, onTimeCount, lateCount                  │
│    },                                                           │
│    statusDistribution: [...],                                   │
│    priorityDistribution: [...],                                 │
│    collaboration: { avgTeamSize, avgComments },                 │
│    tasks: [...]                                                 │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     REDUX STATE UPDATE                          │
│  kpiSlice → congViecDashboard[key] = {                          │
│    data: response.data.data,                                    │
│    isLoading: false,                                            │
│    error: null                                                  │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     UI RENDERING                                │
│  CongViecDashboard Component                                    │
│    → OverviewCards (8 StatCard components)                      │
│    → StatusChart (pie chart)                                    │
│    → TaskListMini (task list)                                   │
│    → InsightsPanel (additional metrics)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Insights

### 1. "Cần cải thiện" xuất hiện khi nào?

| Chỉ số       | Điều kiện "Cần cải thiện" | Ngưỡng |
| ------------ | ------------------------- | ------ |
| Hoàn thành   | `completionRate < 0.6`    | <60%   |
| Đúng tiến độ | `onTimeRate < 50`         | <50%   |

**Ví dụ thực tế:**

- Nhân viên A: 15 công việc, hoàn thành 8 → 53% → **"Cần cải thiện"**
- Nhân viên B: 10 công việc, hoàn thành 6 nhưng 4 trễ hạn → Đúng tiến độ 33% → **"Cần cải thiện"**

### 2. Sự khác biệt giữa 3 chỉ số thời gian

| Chỉ số           | Scope                         | Điều kiện                                     | Ý nghĩa                            |
| ---------------- | ----------------------------- | --------------------------------------------- | ---------------------------------- |
| **Trễ hạn**      | Công việc **đã hoàn thành**   | `HoanThanhTreHan = true`                      | Đã xong nhưng **muộn hạn**         |
| **Quá hạn**      | Công việc **chưa hoàn thành** | `TrangThai != HOAN_THANH && NgayHetHan < now` | Đang làm nhưng **đã quá deadline** |
| **Đúng tiến độ** | Công việc **đã hoàn thành**   | `HoanThanhTreHan = false`                     | Đã xong và **đúng hạn**            |

**Công thức:**

```
Tổng hoàn thành = Đúng tiến độ + Trễ hạn
Đang thực hiện = Đúng tiến độ (đang làm) + Quá hạn
```

### 3. Vai trò của mỗi chỉ số trong đánh giá KPI

| Chỉ số       | Đánh giá khía cạnh       | Trọng số gợi ý |
| ------------ | ------------------------ | -------------- |
| Hoàn thành   | **Năng suất** (số lượng) | ⭐⭐⭐⭐⭐     |
| Trễ hạn      | **Kỷ luật thời gian**    | ⭐⭐⭐⭐       |
| Đúng tiến độ | **Tuân thủ deadline**    | ⭐⭐⭐⭐       |
| Tiến độ TB   | **Chất lượng thực hiện** | ⭐⭐⭐         |
| Team size TB | **Khả năng phối hợp**    | ⭐⭐           |
| Tương tác TB | **Giao tiếp báo cáo**    | ⭐⭐           |

---

## 🎯 Best Practices

### 1. Khi đánh giá nhân viên, nên xem xét:

**Scenario A: Nhân viên có năng suất cao nhưng trễ hạn nhiều**

```
✅ Hoàn thành: 95% • Tốt
⚠️ Trễ hạn: 30% • Nghiêm trọng
→ Kết luận: Làm được nhiều nhưng không quản lý thời gian tốt
→ Hành động: Cần đào tạo time management
```

**Scenario B: Nhân viên có ít công việc nhưng đều đúng hạn**

```
⚠️ Hoàn thành: 40% • Cần cải thiện
✅ Đúng tiến độ: 100% • Tốt
→ Kết luận: Có kỷ luật nhưng năng suất thấp
→ Hành động: Giao thêm công việc, theo dõi capacity
```

**Scenario C: Nhân viên có team size và tương tác cao**

```
✅ Team size TB: 4.5 người/cv
✅ Tương tác TB: 12.3 comments/cv
→ Kết luận: Vai trò leader, làm việc nhóm tốt
→ Hành động: Thích hợp cho dự án lớn, phức tạp
```

### 2. Sử dụng dashboard để phát hiện vấn đề

| Tình huống              | Chỉ số cảnh báo     | Nguyên nhân có thể                     |
| ----------------------- | ------------------- | -------------------------------------- |
| Nhiều công việc quá hạn | `overdue > 30%`     | Giao quá nhiều, deadline không thực tế |
| Tiến độ TB thấp         | `avgProgress < 40%` | Công việc khó, thiếu hỗ trợ            |
| Team size = 1           | `avgTeamSize = 1.0` | Làm việc độc lập, thiếu phối hợp       |
| Tương tác = 0           | `avgComments = 0`   | Không báo cáo, thiếu giao tiếp         |

---

## 📝 Code References

### Frontend Files

- **Main Component:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2/components/dashboard/CongViecDashboard.js`
- **Overview Cards:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/v2/components/dashboard/OverviewCards.js`
- **Redux Slice:** `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/kpiSlice.js` (line 1635-1677)

### Backend Files

- **Controller:** `giaobanbv-be/modules/workmanagement/controllers/congViec.controller.js` (line 513-523)
- **Service:** `giaobanbv-be/modules/workmanagement/services/congViec.service.js` (line 2826-3100)
- **Route:** `giaobanbv-be/modules/workmanagement/routes/congViec.api.js`

---

## 🚀 Future Improvements

### 1. Thêm xu hướng (Trend)

```javascript
// So sánh với chu kỳ trước
{
  completionRate: 0.8,
  trend: "+5%",  // Tăng 5% so với tháng trước
  color: "success"
}
```

### 2. Breakpoints chi tiết hơn

```javascript
// Chia nhỏ hơn cho chỉ số "Cần cải thiện"
completionRate >= 0.7
  ? "Tốt"
  : completionRate >= 0.5
  ? "Trung bình"
  : completionRate >= 0.3
  ? "Yếu"
  : "Kém";
```

### 3. Thêm chỉ số "Độ khó trung bình"

```javascript
avgDifficulty = SUM(MucDoKho) / totalTasks;
// Để hiểu context: Công việc khó → hoàn thành ít là bình thường
```

---

**Tài liệu này được tạo ngày:** 2025-11-24  
**Phiên bản:** 1.0  
**Tác giả:** GitHub Copilot
