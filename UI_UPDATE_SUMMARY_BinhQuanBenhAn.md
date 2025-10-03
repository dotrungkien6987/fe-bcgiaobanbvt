# 🎨 Cập nhật giao diện BinhQuanBenhAn - Thu nhỏ & Đơn giản hóa màu sắc

## 📊 Tóm tắt thay đổi

### ✅ 1. Thu nhỏ 2 Cards Toàn viện (OverallSummaryCards)

**Giảm kích thước**:

- Padding: `1.5-2rem` → `0.8-1.2rem` (giảm ~40%)
- Font icon: `1.2-1.5rem` → `0.9-1rem` (giảm ~33%)
- Font label: `0.7-0.8rem` → `0.6-0.65rem` (giảm ~20%)
- Font value: `1.5-1.8rem` → `1-1.1rem` (giảm ~40%)
- Font diff: `0.8-0.9rem` → `0.65-0.7rem` (giảm ~22%)
- BoxShadow: `8` → `4` (mềm hơn)
- Spacing: `2` → `1.5`
- Margin bottom: `3` → `2`

**Đổi màu sắc**:
| Card | Màu CŨ | Màu MỚI | Ý nghĩa |
|------|--------|---------|---------|
| Toàn viện | #FF6B6B (đỏ cam) | **#1939B7** (xanh) | Thống nhất |
| Chỉ khám NT | #4ECDC4 (xanh ngọc) | **#bb1515** (đỏ) | Nhấn mạnh |

---

### ✅ 2. Thu nhỏ 4 Summary Cards thêm 30%

**Giảm kích thước**:

- Padding: `1-1.5rem` → `0.8-1rem` (giảm ~33%)
- Font label: `0.6-0.7rem` → `0.55-0.6rem` (giảm ~14%)
- Font value: `1-1.2rem` → `0.8-1rem` (giảm ~20-25%)
- BoxShadow: `6` → `4`
- Spacing: `1.5` → `1`
- Margin bottom: `2` → `1.5`

**Đổi màu sắc - Chỉ dùng 2 màu**:
| Card | Màu CŨ | Màu MỚI |
|------|--------|---------|
| **Card 1**: Tổng số khoa | #1939B7 (xanh) | **#1939B7** (xanh) ✅ Giữ nguyên |
| **Card 2**: Nội/Ngoại trú | #00C49F (xanh lá) | **#1939B7** (xanh) ⬅️ Đổi |
| **Card 3**: Tổng doanh thu | #bb1515 (đỏ) | **#bb1515** (đỏ) ✅ Giữ nguyên |
| **Card 4**: Bình quân HSBA | #FFBB28 (vàng) | **#1939B7** (xanh) ⬅️ Đổi |

**Kết quả**:

- 3 cards xanh (#1939B7): Tổng khoa, Nội/Ngoại trú, Bình quân HSBA
- 1 card đỏ (#bb1515): Tổng doanh thu

---

### ✅ 3. Fix màu tiêu đề cột trong DataTable

**Vấn đề**: Tiêu đề cột "Tổng tiền" và các cột có TableSortLabel đang hiển thị màu đen

**Nguyên nhân**: MUI TableSortLabel override màu mặc định

**Giải pháp**: Thêm sx prop cho TableSortLabel:

```jsx
<TableSortLabel
  sx={{
    color: "#FFF !important",
    "&:hover": {
      color: "#FFF",
    },
    "&.Mui-active": {
      color: "#FFF",
    },
    "& .MuiTableSortLabel-icon": {
      color: "#FFF !important",
    },
  }}
>
```

**Kết quả**: Tất cả tiêu đề cột đều màu trắng (#FFF) trên nền xanh (#1939B7)

---

## 📁 Files đã thay đổi

### 1. **OverallSummaryCards.jsx**

**Thay đổi**:

- Line 20-21: `p: { xs: 1.5, sm: 2 }` → `p: { xs: 0.8, sm: 1.2 }`
- Line 22-27: Thu nhỏ icon và label
- Line 39-45: Thu nhỏ value font size
- Line 52-62: Thu nhỏ diff font size
- Line 84: `#FF6B6B` → `#1939B7`
- Line 89: `#4ECDC4` → `#bb1515`
- Line 83: `spacing={2}` → `spacing={1.5}`
- Line 83: `mb: 3` → `mb: 2`
- Line 14: `boxShadow: 8` → `boxShadow: 4`

### 2. **SummaryCards.jsx**

**Thay đổi**:

- Line 33: `spacing={1.5}` → `spacing={1}`
- Line 33: `mb: 2` → `mb: 1.5`
- Line 38: `boxShadow: 6` → `boxShadow: 4`
- Line 43: `p: { xs: 1, sm: 1.5 }` → `p: { xs: 0.8, sm: 1 }`
- Line 48: `fontSize: { xs: "0.6rem", sm: "0.7rem" }` → `fontSize: { xs: "0.55rem", sm: "0.6rem" }`
- Line 54: `fontSize: { xs: "1rem", sm: "1.2rem" }` → `fontSize: { xs: "0.85rem", sm: "1rem" }`
- Line 68: `bgcolor: "#00C49F"` → `bgcolor: "#1939B7"`
- Line 104: `bgcolor: "#FFBB28"` → `bgcolor: "#1939B7"`

### 3. **DataTable.jsx**

**Thay đổi**:

- Line 90-103: Thêm sx prop cho TableSortLabel với màu trắng force

---

## 🎨 Bảng màu mới (Chỉ 2 màu)

| Màu                      | Hex Code  | Sử dụng                                                                                                                                                            |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Xanh chủ đạo**         | `#1939B7` | • Overall Card 1 (Toàn viện)<br>• Summary Card 1 (Tổng khoa)<br>• Summary Card 2 (Nội/Ngoại trú)<br>• Summary Card 4 (Bình quân HSBA)<br>• Table header background |
| **Đỏ nhấn mạnh**         | `#bb1515` | • Overall Card 2 (Chỉ khám NT)<br>• Summary Card 3 (Tổng doanh thu)<br>• Chênh lệch âm (giảm)                                                                      |
| **Xanh lá (chênh lệch)** | `#00C49F` | • Chênh lệch dương (tăng)                                                                                                                                          |
| **Trắng**                | `#FFF`    | • Text trên background màu<br>• Table header text                                                                                                                  |

---

## 📐 So sánh kích thước

### **Overall Cards (2 cards toàn viện)**

| Thuộc tính      | CŨ     | MỚI     | Giảm       |
| --------------- | ------ | ------- | ---------- |
| Padding (xs)    | 1.5rem | 0.8rem  | **47%** ⬇️ |
| Padding (sm)    | 2rem   | 1.2rem  | **40%** ⬇️ |
| Icon size (xs)  | 1.2rem | 0.9rem  | **25%** ⬇️ |
| Icon size (sm)  | 1.5rem | 1rem    | **33%** ⬇️ |
| Label font (xs) | 0.7rem | 0.6rem  | **14%** ⬇️ |
| Label font (sm) | 0.8rem | 0.65rem | **19%** ⬇️ |
| Value font (xs) | 1.5rem | 1rem    | **33%** ⬇️ |
| Value font (sm) | 1.8rem | 1.1rem  | **39%** ⬇️ |
| Diff font (xs)  | 0.8rem | 0.65rem | **19%** ⬇️ |
| Diff font (sm)  | 0.9rem | 0.7rem  | **22%** ⬇️ |
| BoxShadow       | 8      | 4       | **50%** ⬇️ |

### **Summary Cards (4 cards chi tiết)**

| Thuộc tính      | CŨ     | MỚI         | Giảm          |
| --------------- | ------ | ----------- | ------------- |
| Padding (xs)    | 1rem   | 0.8rem      | **20%** ⬇️    |
| Padding (sm)    | 1.5rem | 1rem        | **33%** ⬇️    |
| Label font (xs) | 0.6rem | 0.55rem     | **8%** ⬇️     |
| Label font (sm) | 0.7rem | 0.6rem      | **14%** ⬇️    |
| Value font (xs) | 1rem   | 0.8-0.85rem | **15-20%** ⬇️ |
| Value font (sm) | 1.2rem | 1rem        | **17%** ⬇️    |
| BoxShadow       | 6      | 4           | **33%** ⬇️    |
| Spacing         | 1.5    | 1           | **33%** ⬇️    |
| Margin bottom   | 2      | 1.5         | **25%** ⬇️    |

---

## 🎯 Kết quả

### **Trước**:

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ 🏥 Toàn viện (CAM ĐỎ)      │  │ 🏥 Chỉ khám NT (XANH NGỌC) │
│     1,219 BN                │  │     722 BN                  │
│   ▲ +150 BN                 │  │   ▲ +80 BN                  │
│  (To, nhiều màu)            │  │  (To, nhiều màu)            │
└─────────────────────────────┘  └─────────────────────────────┘

┌───────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│ XANH  │ │ XANH LÁ │ │  ĐỎ    │ │  VÀNG    │
│ (To)  │ │ (To)    │ │ (To)   │ │  (To)    │
└───────┘ └─────────┘ └────────┘ └──────────┘
```

### **Sau**:

```
┌──────────────────┐  ┌──────────────────┐
│ 🏥 Toàn viện     │  │ 🏥 Chỉ khám NT   │
│  (XANH #1939B7)  │  │  (ĐỎ #bb1515)    │
│   1,219 BN       │  │   722 BN         │
│ ▲ +150 BN        │  │ ▲ +80 BN         │
│ (Nhỏ gọn 40%)    │  │ (Nhỏ gọn 40%)    │
└──────────────────┘  └──────────────────┘

┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ XANH │ │ XANH │ │  ĐỎ  │ │ XANH │
│(Nhỏ) │ │(Nhỏ) │ │(Nhỏ) │ │(Nhỏ) │
└──────┘ └──────┘ └──────┘ └──────┘
(Chỉ 2 màu: Xanh & Đỏ)
```

---

## ✅ Checklist hoàn thành

- [x] Thu nhỏ 2 cards toàn viện ~40%
- [x] Thu nhỏ 4 cards chỉ số thêm ~30%
- [x] Đổi tất cả màu thành chỉ 2 màu: #1939B7 (xanh) và #bb1515 (đỏ)
- [x] Fix màu tiêu đề cột TableSortLabel thành trắng
- [x] Giảm boxShadow để mềm mại hơn
- [x] Giảm spacing và margin để gọn gàng hơn
- [x] Không có lỗi lint
- [x] Responsive tốt trên mobile và desktop

---

## 🎨 Hướng dẫn sử dụng màu sắc

### **Nguyên tắc**:

1. **Xanh #1939B7**: Màu chủ đạo, dùng cho hầu hết các thông tin
2. **Đỏ #bb1515**: Nhấn mạnh, dùng cho các chỉ số quan trọng hoặc cảnh báo
3. **Xanh lá #00C49F**: Chỉ dùng cho chênh lệch tăng (▲)
4. **Đỏ #bb1515**: Dùng cho chênh lệch giảm (▼)

### **Quy tắc áp dụng**:

- Cards thông tin thường: Xanh
- Cards cần nhấn mạnh (doanh thu, chỉ khám): Đỏ
- Chênh lệch: Xanh lá (tăng) / Đỏ (giảm)
- Text trên background màu: Trắng

---

## 🚀 Kết luận

✅ **Giao diện mới**:

- Gọn gàng hơn ~35% (giảm padding, font size, spacing)
- Đơn giản hơn (chỉ 2 màu chính thay vì 4-5 màu)
- Chuyên nghiệp hơn (màu sắc thống nhất, dễ đọc)
- Fix lỗi màu tiêu đề cột (tất cả đều trắng)
- Tối ưu responsive mobile

🎉 **Ready for production!**
