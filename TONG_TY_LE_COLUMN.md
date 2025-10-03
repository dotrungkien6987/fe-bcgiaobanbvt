# 📊 Thêm cột "Tổng tỷ lệ (Thuốc + Vật tư)" - BinhQuanBenhAn

## 🎯 Mục đích

Thêm cột mới để hiển thị tổng tỷ lệ chi phí thuốc và vật tư so với tổng doanh thu, giúp đánh giá tổng thể chi phí vật tư y tế của từng khoa.

---

## ✨ Thay đổi chính

### 1️⃣ **Thêm header column mới**

```javascript
{
  id: "ty_le_tong",
  label: "Tổng tỷ lệ (Thuốc + VT) (%)",
  align: "center",
  minWidth: 180,
}
```

**Vị trí**: Cột cuối cùng (sau "Tỷ lệ vật tư")

---

### 2️⃣ **Logic tính toán**

#### **Nội trú:**

```javascript
Tổng tỷ lệ = Tỷ lệ thuốc + Tỷ lệ vật tư
           = (total_thuoc / total_money) + (total_vattu / total_money)
           = (total_thuoc + total_vattu) / total_money
```

#### **Ngoại trú:**

```javascript
Tổng tỷ lệ = Tỷ lệ thuốc (vì không có vật tư)
           = total_thuoc / total_money
```

---

## 📊 Cấu trúc bảng mới

### **Tab Nội trú** (9 cột):

| STT | Tên Khoa | Số ca | Tổng tiền | Thuốc | Vật tư | Bình quân/ca | Tỷ lệ thuốc | Tỷ lệ vật tư | **Tổng tỷ lệ (Thuốc + VT)** |
| --- | -------- | ----- | --------- | ----- | ------ | ------------ | ----------- | ------------ | --------------------------- |
| 1   | Khoa A   | 100   | 1,000tr   | 300tr | 200tr  | 10tr         | 30%         | 20%          | **50%** ⬅️ MỚI              |

### **Tab Ngoại trú** (8 cột - không có Vật tư):

| STT | Tên Khoa | Số ca | Tổng tiền | Thuốc | Bình quân/ca | Tỷ lệ thuốc | **Tổng tỷ lệ (Thuốc + VT)** |
| --- | -------- | ----- | --------- | ----- | ------------ | ----------- | --------------------------- |
| 1   | Khoa B   | 50    | 500tr     | 150tr | 10tr         | 30%         | **30%** ⬅️ = Tỷ lệ thuốc    |

---

## 🎨 Visual Design

### **PercentageBar Component**

Sử dụng màu **#FF6B35** (cam) để phân biệt với:

- Thuốc: `#00C49F` (xanh lá)
- Vật tư: `#FFBB28` (vàng)

### **Ví dụ hiển thị:**

```
┌────────────────────────────────┐
│ Tổng tỷ lệ (Thuốc + VT) (%)   │
├────────────────────────────────┤
│ ███████████░░░░░░░░░ 55.5%     │  ← Cam (#FF6B35)
└────────────────────────────────┘
```

---

## 💡 Công thức chi tiết

### **Data Row (từng khoa):**

```javascript
const ty_le_thuoc =
  row.total_money !== 0 ? row.total_thuoc / row.total_money : 0;

const ty_le_vattu =
  row.total_money !== 0 ? row.total_vattu / row.total_money : 0;

const ty_le_tong =
  loaiKhoa === "ngoaitru"
    ? ty_le_thuoc // Ngoại trú chỉ có thuốc
    : ty_le_thuoc + ty_le_vattu; // Nội trú có cả thuốc và vật tư
```

### **Totals Row (tổng cộng):**

```javascript
const ty_le_tong =
  totals.totalMoney !== 0
    ? loaiKhoa === "ngoaitru"
      ? totals.totalThuoc / totals.totalMoney // Ngoại trú
      : (totals.totalThuoc + totals.totalVattu) / totals.totalMoney // Nội trú
    : 0;
```

---

## 📋 Code Changes

### **1. headCells (Line ~18-44)**

**BEFORE (8 columns):**

```javascript
const headCells = [
  ...
  { id: "ty_le_thuoc", label: "Tỷ lệ thuốc (%)", ... },
  { id: "ty_le_vattu", label: "Tỷ lệ vật tư (%)", ... },
];
```

**AFTER (9 columns):**

```javascript
const headCells = [
  ...
  { id: "ty_le_thuoc", label: "Tỷ lệ thuốc (%)", ... },
  { id: "ty_le_vattu", label: "Tỷ lệ vật tư (%)", ... },
  { id: "ty_le_tong", label: "Tổng tỷ lệ (Thuốc + VT) (%)", ... }, // ⬅️ MỚI
];
```

---

### **2. Data Rows (Line ~271-282)**

**BEFORE:**

```javascript
{/* Tỷ lệ vật tư */}
{loaiKhoa !== "ngoaitru" && (
  <TableCell align="center">
    <PercentageBar value={ty_le_vattu} color={COLORS.vattu} />
  </TableCell>
)}
</TableRow>
```

**AFTER:**

```javascript
{/* Tỷ lệ vật tư */}
{loaiKhoa !== "ngoaitru" && (
  <TableCell align="center">
    <PercentageBar value={ty_le_vattu} color={COLORS.vattu} />
  </TableCell>
)}

{/* Tổng tỷ lệ (Thuốc + Vật tư) */}  // ⬅️ MỚI
<TableCell align="center">
  <PercentageBar
    value={loaiKhoa === "ngoaitru" ? ty_le_thuoc : ty_le_thuoc + ty_le_vattu}
    color="#FF6B35"
  />
</TableCell>
</TableRow>
```

---

### **3. Totals Row (Line ~379-393)**

**BEFORE:**

```javascript
{/* Tỷ lệ vật tư */}
{loaiKhoa !== "ngoaitru" && (
  <TableCell align="center">
    <PercentageBar
      value={totals.totalMoney !== 0 ? totals.totalVattu / totals.totalMoney : 0}
      color={COLORS.vattu}
    />
  </TableCell>
)}
</TableRow>
```

**AFTER:**

```javascript
{/* Tỷ lệ vật tư */}
{loaiKhoa !== "ngoaitru" && (
  <TableCell align="center">
    <PercentageBar
      value={totals.totalMoney !== 0 ? totals.totalVattu / totals.totalMoney : 0}
      color={COLORS.vattu}
    />
  </TableCell>
)}

{/* Tổng tỷ lệ (Thuốc + Vật tư) */}  // ⬅️ MỚI
<TableCell align="center">
  <PercentageBar
    value={
      totals.totalMoney !== 0
        ? loaiKhoa === "ngoaitru"
          ? totals.totalThuoc / totals.totalMoney
          : (totals.totalThuoc + totals.totalVattu) / totals.totalMoney
        : 0
    }
    color="#FF6B35"
  />
</TableCell>
</TableRow>
```

---

## 🎨 Color Scheme

| Cột              | Màu     | Hex Code  | Ý nghĩa                  |
| ---------------- | ------- | --------- | ------------------------ |
| **Tỷ lệ thuốc**  | Xanh lá | `#00C49F` | Chi phí thuốc            |
| **Tỷ lệ vật tư** | Vàng    | `#FFBB28` | Chi phí vật tư           |
| **Tổng tỷ lệ**   | Cam     | `#FF6B35` | Tổng chi phí vật tư y tế |

---

## 📊 Ví dụ thực tế

### **Khoa Nội trú:**

```
Tổng tiền:    1,000,000,000 VNĐ
Thuốc:          300,000,000 VNĐ (30%)
Vật tư:         200,000,000 VNĐ (20%)
────────────────────────────────────
Tổng tỷ lệ:    500,000,000 VNĐ (50%) ⬅️
```

**Hiển thị:**

- Tỷ lệ thuốc: `████████░░░░░░░░░░░░ 30%` (xanh lá)
- Tỷ lệ vật tư: `██████░░░░░░░░░░░░░░ 20%` (vàng)
- **Tổng tỷ lệ: `██████████████░░░░░░ 50%` (cam)** ⬅️ MỚI

---

### **Khoa Ngoại trú:**

```
Tổng tiền:    500,000,000 VNĐ
Thuốc:        150,000,000 VNĐ (30%)
Vật tư:                 0 VNĐ (không có)
────────────────────────────────────
Tổng tỷ lệ:   150,000,000 VNĐ (30%) ⬅️ = Tỷ lệ thuốc
```

**Hiển thị:**

- Tỷ lệ thuốc: `████████░░░░░░░░░░░░ 30%` (xanh lá)
- **Tổng tỷ lệ: `████████░░░░░░░░░░░░ 30%` (cam)** ⬅️ MỚI

---

## 🔍 Edge Cases

### **1. Tổng tiền = 0**

```javascript
value = totals.totalMoney !== 0 ? ... : 0
```

→ Hiển thị: `0%`

### **2. Ngoại trú (không có vật tư)**

```javascript
value =
  loaiKhoa === "ngoaitru"
    ? ty_le_thuoc // Chỉ tính thuốc
    : ty_le_thuoc + ty_le_vattu;
```

→ Tổng tỷ lệ = Tỷ lệ thuốc

### **3. Khoa không có thuốc và vật tư**

```javascript
Thuốc = 0, Vật tư = 0
→ Tổng tỷ lệ = 0%
```

---

## 📱 Responsive

### **Desktop (minWidth: 180px):**

```
┌──────────────────────────────────┐
│ Tổng tỷ lệ (Thuốc + VT) (%)     │
│ ███████████░░░░░░░░░ 55.5%       │
└──────────────────────────────────┘
```

### **Mobile:**

- Cột có `minWidth: 180px`
- Scroll ngang cho bảng
- PercentageBar tự động co lại

---

## ✅ Lợi ích

### **1. Đánh giá tổng thể**

- Nhìn nhanh tổng chi phí vật tư y tế
- So sánh giữa các khoa

### **2. Phát hiện bất thường**

- Khoa có tỷ lệ quá cao (>70%) cần kiểm tra
- Khoa có tỷ lệ quá thấp (<20%) cần xem xét

### **3. Quản lý chi phí**

- Theo dõi xu hướng tăng/giảm
- Đặt mục tiêu kiểm soát chi phí

### **4. Báo cáo lãnh đạo**

- Số liệu trực quan, dễ hiểu
- So sánh nhanh giữa các khoa

---

## 🎯 Business Rules

### **Tiêu chí đánh giá:**

| Tỷ lệ      | Đánh giá    | Hành động        |
| ---------- | ----------- | ---------------- |
| **< 30%**  | Tốt         | Tiếp tục duy trì |
| **30-50%** | Bình thường | Theo dõi         |
| **50-70%** | Cao         | Cần kiểm soát    |
| **> 70%**  | Rất cao     | Kiểm tra ngay    |

---

## 📊 So sánh Before/After

### **BEFORE (8 cột - Nội trú):**

| STT | Tên Khoa | Số ca | Tổng tiền | Thuốc | Vật tư | Bình quân | Tỷ lệ thuốc | Tỷ lệ vật tư |
| --- | -------- | ----- | --------- | ----- | ------ | --------- | ----------- | ------------ |
| 1   | Khoa A   | 100   | 1,000tr   | 300tr | 200tr  | 10tr      | 30%         | 20%          |

❌ **Vấn đề**: Phải tính tâm để biết tổng = 50%

---

### **AFTER (9 cột - Nội trú):**

| STT | Tên Khoa | Số ca | Tổng tiền | Thuốc | Vật tư | Bình quân | Tỷ lệ thuốc | Tỷ lệ vật tư | **Tổng tỷ lệ** |
| --- | -------- | ----- | --------- | ----- | ------ | --------- | ----------- | ------------ | -------------- |
| 1   | Khoa A   | 100   | 1,000tr   | 300tr | 200tr  | 10tr      | 30%         | 20%          | **50%** ⬅️     |

✅ **Lợi ích**: Nhìn thấy ngay tổng = 50% với màu cam nổi bật

---

## 🚀 Next Steps

Nếu muốn mở rộng:

- [ ] Thêm cảnh báo khi tỷ lệ > 70% (màu đỏ)
- [ ] Export cột này ra Excel/CSV
- [ ] Trend chart cho tổng tỷ lệ theo thời gian
- [ ] So sánh với tháng trước

---

## 🎉 Kết luận

✅ **Đã thêm thành công cột "Tổng tỷ lệ (Thuốc + VT)"**

**Features:**

- Tự động tính tổng tỷ lệ thuốc + vật tư
- Màu cam (#FF6B35) để phân biệt
- Hỗ trợ cả Nội trú và Ngoại trú
- Hiển thị trong cả data rows và totals row
- Responsive tốt

**Ready for production!** 🎉
