# 🔄 Cập nhật: Chuyển sang Tab Layout

## 📅 Ngày cập nhật: 2025-10-02

---

## ✨ Thay đổi chính

### **Từ 2 bảng riêng biệt → 2 Tabs**

#### **Trước đây:**

```
┌────────────────────────────────┐
│  Header + DatePicker           │
├────────────────────────────────┤
│  🏥 NỘI TRÚ (Header xanh lá)   │
│  ┌──────────────────────────┐  │
│  │ 4 Summary Cards          │  │
│  │ Bảng dữ liệu             │  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│  🏥 NGOẠI TRÚ (Header vàng)    │
│  ┌──────────────────────────┐  │
│  │ 4 Summary Cards          │  │
│  │ Bảng dữ liệu             │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

#### **Hiện tại:**

```
┌────────────────────────────────┐
│  BÌNH QUÂN BỆNH ÁN             │
├────────────────────────────────┤
│  [DatePicker] [DateChenhLech]  │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │[🏥 Nội trú] [🏥 Ngoại trú]│  │ ← TABS
│  ├──────────────────────────┤  │
│  │ 4 Summary Cards          │  │
│  │ 🔍 Search + Export       │  │
│  │ ━━━━━━━━━━━━━━━━━━━━    │  │
│  │ Bảng dữ liệu             │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

---

## 🎯 Lợi ích của Tab Layout

### 1. **Tiết kiệm không gian màn hình**

- ✅ Không cần scroll dài để xem bảng thứ 2
- ✅ Tập trung vào 1 loại tại 1 thời điểm
- ✅ Phù hợp với màn hình nhỏ (mobile/tablet)

### 2. **UX tốt hơn**

- ✅ Chuyển tab nhanh chóng
- ✅ Nhìn rõ số lượng khoa ngay trên tab
- ✅ Màu sắc phân biệt:
  - Nội trú: Badge xanh lá `#00C49F`
  - Ngoại trú: Badge vàng `#FFBB28`

### 3. **Performance**

- ✅ Chỉ render tab đang active
- ✅ Giảm số lượng DOM elements cùng lúc

---

## 🔧 Chi tiết kỹ thuật

### **Thêm imports**

```javascript
import { Tabs, Tab } from "@mui/material";
```

### **State quản lý tab**

```javascript
const [currentTab, setCurrentTab] = useState(0);
// 0 = Nội trú
// 1 = Ngoại trú
```

### **Tabs Header**

```javascript
<Tabs
  value={currentTab}
  onChange={(e, newValue) => setCurrentTab(newValue)}
  sx={{
    borderBottom: 1,
    borderColor: "divider",
    bgcolor: darkMode ? "#1D1D1D" : "#f5f5f5",
    "& .MuiTab-root": {
      fontSize: "1rem",
      fontWeight: 600,
      minHeight: 60,
    },
    "& .Mui-selected": {
      color: BLUE,
    },
  }}
>
  <Tab label={...} />  // Nội trú
  <Tab label={...} />  // Ngoại trú
</Tabs>
```

### **Tab Label với Badge**

```javascript
<Tab
  label={
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="h6">🏥 Nội trú</Typography>
      <Typography
        variant="caption"
        sx={{
          bgcolor: "#00C49F",
          color: "#FFF",
          px: 1,
          py: 0.5,
          borderRadius: 1,
        }}
      >
        {rowsNoiTru.length} khoa
      </Typography>
    </Stack>
  }
/>
```

### **Conditional Rendering**

```javascript
{
  /* Tab Panel - Nội trú */
}
{
  currentTab === 0 && <Box sx={{ p: 3 }}>{/* Summary Cards + Table */}</Box>;
}

{
  /* Tab Panel - Ngoại trú */
}
{
  currentTab === 1 && <Box sx={{ p: 3 }}>{/* Summary Cards + Table */}</Box>;
}
```

---

## 🎨 Styling Details

### **Tabs Container**

```javascript
sx={{
  borderBottom: 1,
  borderColor: "divider",
  bgcolor: darkMode ? "#1D1D1D" : "#f5f5f5",
  "& .MuiTab-root": {
    fontSize: "1rem",
    fontWeight: 600,
    minHeight: 60,
  },
  "& .Mui-selected": {
    color: BLUE,  // #1939B7
  },
}}
```

### **Badge Colors**

- Nội trú: `bgcolor: "#00C49F"` (Xanh lá)
- Ngoại trú: `bgcolor: "#FFBB28"` (Vàng)

### **Tab Panel Padding**

```javascript
<Box sx={{ p: 3 }}>  // 24px padding
```

---

## 📊 Dữ liệu không thay đổi

### **State quản lý vẫn độc lập**

```javascript
// Nội trú
const [searchNoiTru, setSearchNoiTru] = useState("");
const [orderNoiTru, setOrderNoiTru] = useState("desc");
const [orderByNoiTru, setOrderByNoiTru] = useState("total_money");

// Ngoại trú
const [searchNgoaiTru, setSearchNgoaiTru] = useState("");
const [orderNgoaiTru, setOrderNgoaiTru] = useState("desc");
const [orderByNgoaiTru, setOrderByNgoaiTru] = useState("total_money");
```

### **Các function không thay đổi**

- `renderTable()` - Vẫn giữ nguyên
- `exportToCSV()` - Vẫn giữ nguyên
- `TableToolbar` - Vẫn giữ nguyên
- Các handlers: `handleRequestSortNoiTru`, `handleResetNoiTru`, etc.

---

## 🚀 Hướng dẫn sử dụng

### **Chuyển tab**

1. Click vào tab "🏥 Nội trú" hoặc "🏥 Ngoại trú"
2. Nội dung tự động thay đổi
3. State (search, sort) của mỗi tab được giữ nguyên

### **Badge số lượng**

- Hiển thị số khoa trong mỗi loại
- Cập nhật real-time theo dữ liệu từ API
- VD: "12 khoa" cho Nội trú, "8 khoa" cho Ngoại trú

### **Summary Cards**

- Mỗi tab có 4 thẻ riêng
- Tính toán độc lập cho từng loại
- Không bị ảnh hưởng khi chuyển tab

---

## ⚠️ Lưu ý

### **State persistence**

- Khi chuyển tab, state search/sort của tab cũ được giữ nguyên
- VD: Search "Hồi sức" ở Nội trú → Chuyển sang Ngoại trú → Quay lại Nội trú vẫn giữ search "Hồi sức"

### **Performance**

- Chỉ 1 bảng được render tại 1 thời điểm
- Giảm tải DOM, tăng performance
- Phù hợp với danh sách lớn (nhiều khoa)

### **Responsive**

- Tab labels tự động wrap trên mobile
- Badge vẫn hiển thị đầy đủ
- Padding giảm trên màn hình nhỏ

---

## 🔄 So sánh với TaiChinh.js

| Feature          | BinhQuanBenhAn (Tabs) | TaiChinh.js                 |
| ---------------- | --------------------- | --------------------------- |
| Layout           | ✅ Tabs               | ❌ Accordion/Separate cards |
| Summary Cards    | ✅ Trong tab          | ✅ Ngoài tab                |
| State management | ✅ Độc lập            | ✅ Độc lập                  |
| Export           | ✅ Từng loại          | ✅ Tổng hợp                 |

---

## 📝 Files thay đổi

### 1. **BinhQuanBenhAn.js**

- ✅ Thêm imports: `Tabs`, `Tab`
- ✅ Thêm state: `currentTab`
- ✅ Thay đổi layout: 2 bảng → 2 tabs
- ✅ Conditional rendering: `currentTab === 0/1`

### 2. **TABS_UPDATE_BinhQuanBenhAn.md**

- ✅ Tài liệu chi tiết về update này

---

## ✅ Testing Checklist

- [ ] Tab "Nội trú" hiển thị đúng dữ liệu
- [ ] Tab "Ngoại trú" hiển thị đúng dữ liệu
- [ ] Badge hiển thị đúng số lượng khoa
- [ ] Chuyển tab mượt mà, không lag
- [ ] Search/sort của mỗi tab độc lập
- [ ] Summary cards tính toán đúng
- [ ] Export CSV hoạt động cho cả 2 tab
- [ ] Dark mode hiển thị đúng
- [ ] Responsive trên mobile/tablet
- [ ] State giữ nguyên khi chuyển tab

---

## 🎉 Kết quả

UI gọn gàng hơn, dễ sử dụng hơn, performance tốt hơn với Tab layout. Người dùng có thể dễ dàng chuyển đổi giữa Nội trú và Ngoại trú mà không cần scroll.

**Before:** 2 bảng dài → Phải scroll nhiều
**After:** 2 tabs → Click để chuyển, không scroll

---

## 📞 Support

Nếu có vấn đề với tabs:

1. Kiểm tra console log: `console.log(currentTab)`
2. Kiểm tra state: Redux DevTools
3. Kiểm tra data: `console.log(rowsNoiTru, rowsNgoaiTru)`
