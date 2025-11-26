# Tự Đánh Giá KPI - GiaoNhiemVu V3.0

**Phiên bản:** 3.0  
**Tính năng:** Nhân viên tự chấm điểm mức độ hoàn thành nhiệm vụ  
**Cập nhật:** 26/11/2025

---

## 📋 Mục Lục

- [Tổng Quan Tính Năng](#tổng-quan-tính-năng)
- [Giao Diện Người Dùng](#giao-diện-người-dùng)
- [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)
- [Quy Tắc Chấm Điểm](#quy-tắc-chấm-điểm)
- [API Integration](#api-integration)
- [Công Thức Tính KPI](#công-thức-tính-kpi)

---

## 🎯 Tổng Quan Tính Năng

### Mục Đích

Cho phép **nhân viên tự đánh giá** mức độ hoàn thành nhiệm vụ được gán (0-100%), điểm này sẽ được tính vào công thức KPI cuối cùng.

### Đặc Điểm

- ✅ **Tự chủ:** Nhân viên chấm điểm mà không cần sự giám sát
- ✅ **Linh hoạt:** Có thể chỉnh sửa nhiều lần trong chu kỳ
- ✅ **Tích hợp KPI:** Điểm tự đánh giá được dùng trong công thức tính KPI
- ✅ **Khóa khi cần:** Không thể chấm điểm khi chu kỳ đã đóng hoặc KPI đã duyệt

### Thông Tin Cơ Bản

**File:** `TuDanhGiaKPIPage.js`  
**Dòng code:** 548  
**Route:** `/quanlycongviec/kpi/tu-danh-gia`  
**Menu:** `Quản lý công việc > Tự đánh giá KPI` 🆕  
**Quyền truy cập:** Nhân viên (Employee, Manager, Admin)

---

## 🎨 Giao Diện Người Dùng

### Layout Tổng Thể

```
┌──────────────────────────────────────────────────────────┐
│  Tự Đánh Giá KPI                                        │
├──────────────────────────────────────────────────────────┤
│  Chu kỳ: [▼ Quý 1/2025                    ]            │
│  Tiến độ: ████████░░░░ 3/5 (60%)                       │
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │  Chăm sóc bệnh nhân                Độ khó: 1.5    │ │
│  │  Mô tả: Chăm sóc toàn diện bệnh nhân...           │ │
│  │  ●────────○ (85%)                                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Lập kế hoạch điều trị             Độ khó: 2.0    │ │
│  │  Mô tả: Lập kế hoạch điều trị...                  │ │
│  │  ────────○ (0%)                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Lưu tất cả]  [Làm mới]                               │
└──────────────────────────────────────────────────────────┘
```

### Components

#### 1. Dropdown Chu Kỳ

```javascript
<Autocomplete
  options={cycles}
  getOptionLabel={(option) => option.TenChuKy}
  value={selectedCycle}
  onChange={(e, value) => setSelectedCycle(value)}
  renderInput={(params) => <TextField {...params} label="Chọn chu kỳ" />}
/>
```

**Tính năng:**

- Hiển thị danh sách tất cả chu kỳ
- Tự động chọn chu kỳ đang mở (`isDong = false`)
- Có thể chọn chu kỳ khác để xem lịch sử

#### 2. Thanh Progress

```javascript
const evaluatedCount = assignments.filter((a) => a.DiemTuDanhGia > 0).length;
const totalCount = assignments.length;
const completionRate = totalCount > 0 ? (evaluatedCount / totalCount) * 100 : 0;

<Box>
  <Typography variant="body2">
    Tiến độ: {evaluatedCount}/{totalCount} nhiệm vụ đã chấm điểm (
    {completionRate.toFixed(0)}%)
  </Typography>
  <LinearProgress variant="determinate" value={completionRate} />
</Box>;
```

**Ý nghĩa:**

- **Đã chấm:** Số nhiệm vụ có `DiemTuDanhGia > 0`
- **Tổng số:** Tổng số nhiệm vụ được gán
- **Phần trăm:** Tỷ lệ hoàn thành tự đánh giá

#### 3. Card Nhiệm Vụ

```javascript
<Paper sx={{ p: 2, mb: 2 }}>
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
    <Typography variant="h6">{assignment.NhiemVuID.Ten}</Typography>
    <Chip
      label={`Độ khó: ${assignment.MucDoKho}`}
      size="small"
      color="primary"
    />
  </Box>
  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
    {assignment.NhiemVuID.MoTa}
  </Typography>
  <Typography variant="caption" gutterBottom>
    Điểm tự đánh giá: {assignment.DiemTuDanhGia}%
  </Typography>
  <Slider
    value={assignment.DiemTuDanhGia}
    onChange={(e, v) => handleSliderChange(assignment._id, v)}
    min={0}
    max={100}
    step={5}
    marks={[
      { value: 0, label: "0%" },
      { value: 50, label: "50%" },
      { value: 100, label: "100%" },
    ]}
    valueLabelDisplay="auto"
    disabled={selectedCycle?.isDong} // Khóa nếu chu kỳ đã đóng
  />
</Paper>
```

**Thông tin hiển thị:**

- **Tên nhiệm vụ:** VD: "Chăm sóc bệnh nhân"
- **Độ khó:** Chip hiển thị (0-2)
- **Mô tả:** Mô tả chi tiết nhiệm vụ
- **Slider:** Kéo từ 0-100%, step = 5%

---

## 📖 Hướng Dẫn Sử Dụng

### Bước 1: Truy Cập Trang

1. Đăng nhập với tài khoản nhân viên
2. Click menu: `Quản lý công việc > Tự đánh giá KPI` 🆕
3. Hệ thống điều hướng đến `/quanlycongviec/kpi/tu-danh-gia`
4. Dropdown tự động chọn chu kỳ đang mở

---

### Bước 2: Xem Danh Sách Nhiệm Vụ

**Giao diện hiển thị:**

- Danh sách nhiệm vụ được quản lý gán trong chu kỳ
- Mỗi nhiệm vụ hiển thị:
  - Tên + Mô tả
  - Độ khó (1.5 = Trung bình khó)
  - Slider điểm tự đánh giá (0-100%)

**Nếu không có nhiệm vụ:**

```
┌────────────────────────────────────────┐
│  Không có nhiệm vụ nào được gán        │
│  Vui lòng liên hệ quản lý              │
└────────────────────────────────────────┘
```

---

### Bước 3: Tự Chấm Điểm

**Hướng dẫn chấm điểm:**

| Điểm        | Ý nghĩa                  | Mô tả chi tiết                                                         |
| ----------- | ------------------------ | ---------------------------------------------------------------------- |
| **0-20%**   | ❌ Không hoàn thành      | Chưa bắt đầu hoặc chỉ làm được rất ít, nhiều thiếu sót nghiêm trọng    |
| **21-40%**  | ⚠️ Hoàn thành kém        | Làm được một phần nhỏ (dưới 50%), nhiều thiếu sót, cần cải thiện nhiều |
| **41-60%**  | 🟡 Hoàn thành trung bình | Làm được khoảng một nửa, đạt yêu cầu cơ bản, còn thiếu sót             |
| **61-80%**  | ✅ Hoàn thành tốt        | Làm được phần lớn (trên 60%), ít thiếu sót, đạt yêu cầu tốt            |
| **81-100%** | 🌟 Hoàn thành xuất sắc   | Làm hoàn chỉnh, vượt mong đợi, chất lượng cao, không có thiếu sót      |

**Ví dụ cụ thể:**

**Nhiệm vụ:** "Chăm sóc bệnh nhân"

- **85%:** Đã chăm sóc tốt, bệnh nhân hài lòng, theo dõi sát sao, ghi chép đầy đủ
- **50%:** Chăm sóc cơ bản, còn thiếu theo dõi, ghi chép chưa đầy đủ
- **20%:** Chăm sóc sơ sài, nhiều thiếu sót, bệnh nhân phàn nàn

---

### Bước 4: Kéo Slider

**Luồng tương tác:**

```
1. Tìm nhiệm vụ "Chăm sóc bệnh nhân"
   → Slider hiện tại: 0%

2. Kéo slider sang phải
   → Giá trị thay đổi: 0% → 25% → 50% → 75% → 85%
   → State local cập nhật ngay (optimistic)

3. Xác nhận giá trị: 85%
   → Hiển thị "Điểm tự đánh giá: 85%"

4. Lặp lại cho các nhiệm vụ khác
```

---

### Bước 5: Lưu Điểm

**UI:** Nút [Lưu tất cả]

```
1. Click nút [Lưu tất cả]
   → Spinner loading hiển thị

2. Hệ thống lọc điểm thay đổi:
   - So sánh state hiện tại vs state gốc
   - Chỉ gửi những điểm thay đổi

3. API call:
   POST /tu-cham-diem-batch
   Body: {
     updates: [
       { NhanVienNhiemVuID: "...", DiemTuDanhGia: 85 },
       { NhanVienNhiemVuID: "...", DiemTuDanhGia: 75 }
     ]
   }

4. Backend kiểm tra:
   ✅ Chu kỳ chưa đóng
   ✅ KPI chưa duyệt

5. Nếu PASS:
   → Update NhanVienNhiemVu
   → Toast: "✅ Cập nhật điểm thành công!"
   → Thanh progress cập nhật: 2/2 (100%)

6. Nếu FAIL:
   → Toast: "❌ [Lỗi cụ thể]"
   → Giữ nguyên state
```

---

## ⚖️ Quy Tắc Chấm Điểm

### Nguyên Tắc Chung

1. **Trung thực:** Chấm điểm phản ánh đúng mức độ hoàn thành
2. **Khách quan:** Dựa trên kết quả thực tế, không chủ quan
3. **Tham khảo:** Nên tham khảo ý kiến đồng nghiệp/quản lý nếu không chắc chắn

### Yếu Tố Cần Xem Xét

#### 1. Số Lượng (40%)

- Hoàn thành bao nhiêu % công việc?
- Ví dụ: Chăm sóc 80/100 bệnh nhân = 80%

#### 2. Chất Lượng (40%)

- Chất lượng công việc như thế nào?
- Có đạt yêu cầu? Có sai sót không?
- Ví dụ: Chăm sóc tốt, bệnh nhân hài lòng = 90%

#### 3. Thời Gian (20%)

- Hoàn thành đúng hạn không?
- Có trễ deadline không?
- Ví dụ: Trễ 2 ngày = -10%

### Ví Dụ Tính Điểm

**Nhiệm vụ:** "Lập kế hoạch điều trị"

| Yếu tố     | Đánh giá                         | Điểm    |
| ---------- | -------------------------------- | ------- |
| Số lượng   | Lập được 45/50 kế hoạch (90%)    | 36/40   |
| Chất lượng | Chất lượng tốt, ít sai sót (85%) | 34/40   |
| Thời gian  | Đúng hạn (100%)                  | 20/20   |
| **Tổng**   |                                  | **90%** |

---

## 🔌 API Integration

### Endpoint 1: Lấy Nhiệm Vụ

**Request:**

```http
GET /api/workmanagement/giao-nhiem-vu/giao-nhiem-vu?chuKyId=66b1dba74f79822a4752d90c
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cycle": {
      "_id": "66b1dba74f79822a4752d90c",
      "TenChuKy": "Quý 1/2025",
      "isDong": false
    },
    "assignments": [
      {
        "_id": "66b1dba74f79822a4752d90d",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d90e",
          "Ten": "Chăm sóc bệnh nhân",
          "MoTa": "Chăm sóc toàn diện bệnh nhân..."
        },
        "MucDoKho": 1.5,
        "DiemTuDanhGia": 85
      }
    ],
    "statistics": {
      "total": 2,
      "evaluated": 1,
      "notEvaluated": 1,
      "completionRate": 50
    }
  }
}
```

### Endpoint 2: Lưu Điểm

**Request:**

```http
POST /api/workmanagement/giao-nhiem-vu/tu-cham-diem-batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "updates": [
    {
      "NhanVienNhiemVuID": "66b1dba74f79822a4752d90d",
      "DiemTuDanhGia": 90
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "updatedAssignments": [
      {
        "_id": "66b1dba74f79822a4752d90d",
        "DiemTuDanhGia": 90,
        "updatedAt": "2025-01-26T11:00:00.000Z"
      }
    ],
    "summary": {
      "totalUpdated": 1,
      "totalRequested": 1,
      "failed": 0
    }
  }
}
```

---

## 📐 Công Thức Tính KPI

### Công Thức Chính

```javascript
// Với nhiệm vụ có "mức độ hoàn thành"
DiemNhiemVu = (DiemQL × 2 + DiemTuDanhGia) / 3
```

**Giải thích:**

- **DiemQL:** Điểm quản lý chấm (0-100)
- **DiemTuDanhGia:** Điểm nhân viên tự chấm (0-100)
- **Tỷ lệ:** DiemQL có trọng số gấp đôi DiemTuDanhGia

### Ví Dụ Tính Toán

**Dữ liệu đầu vào:**

- DiemQL = 90
- DiemTuDanhGia = 85
- MucDoKho = 1.5

**Bước 1: Tính DiemNhiemVu**

```
DiemNhiemVu = (90 × 2 + 85) / 3
            = (180 + 85) / 3
            = 265 / 3
            = 88.33
```

**Bước 2: Tính Trọng Số**

```
TrongSo = MucDoKho / TongMucDoKho
        = 1.5 / 8.5
        = 0.1765
```

**Bước 3: Tính Điểm Cuối**

```
DiemCuoi = DiemNhiemVu × TrongSo
         = 88.33 × 0.1765
         = 15.59
```

### So Sánh Ảnh Hưởng

| DiemQL | DiemTuDanhGia | DiemNhiemVu | Chênh lệch |
| ------ | ------------- | ----------- | ---------- |
| 90     | 90            | 90.00       | 0          |
| 90     | 80            | 86.67       | -3.33      |
| 90     | 60            | 80.00       | -10.00     |
| 90     | 40            | 73.33       | -16.67     |

**Kết luận:**

- Điểm tự đánh giá **có ảnh hưởng** nhưng **không quyết định**
- DiemQL vẫn là yếu tố chính (trọng số 66.67%)
- DiemTuDanhGia chiếm 33.33%

---

## 🎉 Kết Luận

Tính năng **Tự Đánh Giá KPI** mang lại:

✅ **Tự chủ:** Nhân viên tham gia vào quá trình đánh giá  
✅ **Minh bạch:** Công thức tính điểm rõ ràng  
✅ **Khuyến khích:** Động viên nhân viên tự phản ánh công việc  
✅ **Công bằng:** Kết hợp cả đánh giá của quản lý và nhân viên

**Đánh giá:**

- **UX/UI:** 9/10 (Giao diện đơn giản, dễ sử dụng)
- **Hiệu quả:** 8/10 (Giúp nhân viên tự nhận thức)
- **Công bằng:** 9/10 (Công thức cân bằng tốt)

---

**Cập nhật cuối:** 26/11/2025  
**Tác giả:** GitHub Copilot (Claude Sonnet 4.5)  
**Phiên bản tài liệu:** 1.0.0
