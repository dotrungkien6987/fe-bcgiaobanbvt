# 📱 BinhQuanBenhAn - Sticky Columns & Mobile Responsive

## 📅 Cập nhật: 2025-10-02

---

## ✨ Tính năng mới

### **1. Sticky Columns (2 cột đầu tiên)**

#### Cột STT và Tên Khoa được "dính" khi scroll ngang

```javascript
// Cột STT
<TableCell
  sx={{
    position: "sticky",
    left: 0,
    zIndex: 3,
    bgcolor: darkMode ? "#1D1D1D" : BLUE,
    minWidth: { xs: 40, sm: 50 },
  }}
>
  STT
</TableCell>

// Cột Tên Khoa
<TableCell
  sx={{
    position: "sticky",
    left: { xs: 40, sm: 50 },  // Offset bằng width của cột STT
    zIndex: 3,
    bgcolor: darkMode ? "#1D1D1D" : BLUE,
    minWidth: { xs: 120, sm: 200 },
  }}
>
  Tên Khoa
</TableCell>
```

**Z-index layers:**

- `zIndex: 3` - Sticky header cells
- `zIndex: 2` - Sticky body cells
- `zIndex: 1` - Table header (stickyHeader)

**Background colors:**

- Header: `bgcolor: darkMode ? "#1D1D1D" : BLUE`
- Body: `bgcolor: darkMode ? "#1D1D1D" : "#FFF"`
- Total row: `bgcolor: darkMode ? "#2a2a2a" : "#f5f5f5"`

---

### **2. Mobile Responsive Font Sizes**

#### Font sizes giảm đáng kể trên mobile

```javascript
// Breakpoint system
xs: < 600px  (Mobile)
sm: ≥ 600px  (Tablet)
md: ≥ 900px  (Desktop)
```

#### **A. Table Headers & Cells**

| Element        | Mobile (xs) | Desktop (sm+) |
| -------------- | ----------- | ------------- |
| Table header   | 0.7rem      | 0.875rem      |
| Table cell     | 0.7rem      | 0.875rem      |
| TableSortLabel | 0.7rem      | 0.875rem      |
| Caption (ID)   | 0.6rem      | 0.75rem       |
| Money amounts  | 0.65rem     | 0.875rem      |
| Percentage     | 0.6rem      | 0.75rem       |

```javascript
<TableHead>
  <TableRow
    sx={{
      "& th": {
        fontSize: { xs: "0.7rem", sm: "0.875rem" },
      },
    }}
  >
</TableHead>

<TableBody sx={{
  "& td": {
    fontSize: { xs: "0.7rem", sm: "0.875rem" }
  }
}}>
```

#### **B. Summary Cards**

| Element       | Mobile (xs) | Desktop (sm+) |
| ------------- | ----------- | ------------- |
| Card padding  | 1.5 (12px)  | 2 (16px)      |
| Overline text | 0.65rem     | 0.75rem       |
| Number (h5)   | 1.25rem     | 1.5rem        |
| Large numbers | 1.1rem      | 1.5rem        |

```javascript
<CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
  <Typography
    variant="overline"
    sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
  >
    Tổng số khoa
  </Typography>
  <Typography variant="h5" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
    {filteredNoiTru.length}
  </Typography>
</CardContent>
```

#### **C. Tab Labels & Badges**

| Element       | Mobile (xs) | Desktop (sm+) |
| ------------- | ----------- | ------------- |
| Tab font      | 0.8rem      | 1rem          |
| Tab height    | 48px        | 60px          |
| Tab padding   | 1 (8px)     | 2 (16px)      |
| Tab label     | 0.85rem     | 1.1rem        |
| Badge font    | 0.65rem     | 0.75rem       |
| Badge padding | 0.5/0.25    | 1/0.5         |

```javascript
<Tabs
  sx={{
    "& .MuiTab-root": {
      fontSize: { xs: "0.8rem", sm: "1rem" },
      minHeight: { xs: 48, sm: 60 },
      px: { xs: 1, sm: 2 },
    },
  }}
>
  <Tab
    label={
      <Typography
        variant="h6"
        sx={{ fontSize: { xs: "0.85rem", sm: "1.1rem" } }}
      >
        🏥 Nội trú
      </Typography>
    }
  />
</Tabs>
```

#### **D. Other UI Elements**

| Element      | Mobile (xs) | Desktop (sm+) |
| ------------ | ----------- | ------------- |
| Page title   | 1rem        | 1.3rem        |
| Date info    | 0.75rem     | 0.875rem      |
| Caption text | 0.65rem     | 0.75rem       |
| Box padding  | 0.5/1.5     | 1/3           |
| Progress bar | 6px         | 8px           |

```javascript
// Page title
<Typography
  sx={{ fontSize: { xs: "1rem", sm: "1.3rem" } }}
>
  Bình quân bệnh án
</Typography>

// Date info
<Typography
  variant="subtitle2"
  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
>
  Số liệu đến {formatDateTime(chisosObj.Ngay)}
</Typography>

// Progress bar
<LinearProgress
  sx={{ height: { xs: 6, sm: 8 } }}
/>
```

---

### **3. Table Improvements**

#### **A. Sticky Header**

```javascript
<TableContainer component={Paper} sx={{ maxHeight: 600 }}>
  <Table size="small" stickyHeader>
    {/* Headers luôn visible khi scroll dọc */}
  </Table>
</TableContainer>
```

#### **B. Minimum Widths**

```javascript
// Đảm bảo các cột không bị quá nhỏ
<TableCell sx={{ minWidth: { xs: 60, sm: 80 } }}>  // Số ca
<TableCell sx={{ minWidth: { xs: 80, sm: 120 } }}> // Doanh thu
<TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}> // BQ/ca
<TableCell sx={{ minWidth: { xs: 100, sm: 140 } }}> // Thuốc/VT
```

---

## 🎨 Visual Demo

### **Desktop View (≥600px)**

```
┌────────────────────────────────────────────────────┐
│ STT │ Tên Khoa         │ Số ca │ Doanh thu │ ... │
├─────┼──────────────────┼───────┼───────────┼─────┤
│ 1   │ Khoa Hồi sức    │   7   │ 182 triệu │ ... │
│     │ ID: 3            │       │           │     │
├─────┼──────────────────┼───────┼───────────┼─────┤
│ 2   │ Khoa Ngoại      │  45   │ 1.2 tỷ    │ ... │
│     │ ID: 5            │       │           │     │
└─────┴──────────────────┴───────┴───────────┴─────┘
 ▲STICKY    ▲STICKY        Scroll ngang →
```

### **Mobile View (<600px)**

```
┌──────────────────────────────────┐
│ST│Tên Khoa    │Số ca│Doanh thu│... │
├──┼────────────┼─────┼─────────┼───┤
│1 │K.Hồi sức  │  7  │182tr    │...│
│  │ID:3        │     │         │   │
├──┼────────────┼─────┼─────────┼───┤
│2 │K.Ngoại    │ 45  │1.2tỷ    │...│
│  │ID:5        │     │         │   │
└──┴────────────┴─────┴─────────┴───┘
▲STICKY ▲STICKY   Scroll →

📱 Font sizes giảm ~20-30%
📱 Padding giảm ~25-50%
```

---

## 🔧 Implementation Details

### **Sticky Position CSS**

```css
.sticky-cell-header {
  position: sticky;
  left: 0; /* or calculated offset */
  z-index: 3; /* above body cells */
  background-color: #1939b7; /* prevent transparency */
}

.sticky-cell-body {
  position: sticky;
  left: 0;
  z-index: 2; /* above normal cells */
  background-color: #fff;
}
```

### **Responsive Spacing**

```javascript
// Material-UI spacing scale
0.5 = 4px
1   = 8px
1.5 = 12px
2   = 16px
3   = 24px

// Usage
sx={{
  p: { xs: 1, sm: 2 },     // 8px mobile, 16px desktop
  px: { xs: 0.5, sm: 1 },  // 4px mobile, 8px desktop
}}
```

---

## 📊 Font Size Comparison Table

| Element      | Before   | Mobile (xs) | Desktop (sm) | Reduction |
| ------------ | -------- | ----------- | ------------ | --------- |
| Table header | 0.875rem | **0.7rem**  | 0.875rem     | 20%       |
| Table cell   | 0.875rem | **0.7rem**  | 0.875rem     | 20%       |
| Page title   | 1.3rem   | **1rem**    | 1.3rem       | 23%       |
| Summary card | 1.5rem   | **1.25rem** | 1.5rem       | 17%       |
| Tab label    | 1.1rem   | **0.85rem** | 1.1rem       | 23%       |
| Badge        | 0.75rem  | **0.65rem** | 0.75rem      | 13%       |
| Caption      | 0.75rem  | **0.6rem**  | 0.75rem      | 20%       |

**Average reduction on mobile: ~20%**

---

## 🎯 Benefits

### **1. Sticky Columns**

✅ STT và Tên Khoa luôn visible khi scroll ngang
✅ Dễ dàng đối chiếu dữ liệu
✅ Không bị mất context khi xem các cột bên phải
✅ UX tốt hơn cho bảng wide table

### **2. Mobile Responsive**

✅ Tiết kiệm 20-30% không gian màn hình
✅ Nhiều thông tin hơn trên 1 screen
✅ Giảm scroll cả dọc và ngang
✅ Dễ đọc hơn trên màn hình nhỏ

### **3. Performance**

✅ Sticky cells render hiệu quả với GPU
✅ Responsive values được cache bởi MUI
✅ Không ảnh hưởng đến scroll performance

---

## 📱 Responsive Breakpoints

```javascript
// Material-UI default breakpoints
xs: 0px      // Phone (portrait)
sm: 600px    // Phone (landscape) / Tablet (portrait)
md: 900px    // Tablet (landscape) / Small desktop
lg: 1200px   // Desktop
xl: 1536px   // Large desktop

// Usage in this component
xs: < 600px  → Mobile optimized
sm: ≥ 600px  → Desktop default
```

---

## ⚠️ Browser Compatibility

### **Sticky Position**

✅ Chrome 56+
✅ Firefox 59+
✅ Safari 13+
✅ Edge 16+
✅ iOS Safari 13+
✅ Chrome Android 56+

**Support: 97%+ global browsers**

### **Fallback**

No fallback needed - older browsers will show normal table (no sticky).

---

## 🧪 Testing Checklist

- [ ] Desktop (>900px): Font sizes bình thường
- [ ] Tablet (600-900px): Font sizes transition
- [ ] Mobile (<600px): Font sizes giảm 20-30%
- [ ] Sticky STT column hoạt động khi scroll ngang
- [ ] Sticky Tên Khoa column hoạt động khi scroll ngang
- [ ] Sticky header hoạt động khi scroll dọc
- [ ] Z-index layers không bị chồng lấp
- [ ] Background colors đúng cho sticky cells
- [ ] Dark mode sticky cells hoạt động đúng
- [ ] Total row sticky column hoạt động
- [ ] Summary cards responsive
- [ ] Tab labels responsive
- [ ] DatePickers responsive
- [ ] No horizontal overflow on mobile

---

## 🎉 Kết quả

### **Before**

```
❌ Mất context khi scroll ngang
❌ Font quá lớn trên mobile → ít thông tin
❌ Phải scroll nhiều để xem dữ liệu
```

### **After**

```
✅ STT & Tên Khoa luôn visible
✅ Font size tối ưu cho từng device
✅ Nhiều thông tin hơn trên mobile
✅ UX tốt hơn, dễ sử dụng hơn
```

---

## 📞 Troubleshooting

### **Issue: Sticky columns bị "nhảy" khi scroll**

**Solution:** Đảm bảo `bgcolor` được set cho sticky cells

### **Issue: Z-index không hoạt động**

**Solution:** Kiểm tra parent elements không có `overflow: hidden`

### **Issue: Font quá nhỏ trên tablet**

**Solution:** Adjust breakpoint từ `sm: 600px` lên `sm: 768px`

### **Issue: Sticky header không hoạt động**

**Solution:** Thêm `maxHeight` cho TableContainer

---

**Sticky columns + Mobile responsive = Perfect mobile experience! 📱✨**
