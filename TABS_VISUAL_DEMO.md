# 📊 BinhQuanBenhAn - Tab Layout Demo

## 🎨 Visual Layout

```
╔═══════════════════════════════════════════════════════════════════╗
║                    BÌNH QUÂN BỆNH ÁN                              ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║  📅 Số liệu đến: 02/10/2025 08:30:00                              ║
║  [📅 Ngày: 02/10/2025] [📅 Ngày chênh lệch: 01/10/2025]          ║
║  ℹ️ Tính chênh lệch từ 01/10/2025 đến 02/10/2025                  ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────────┐  ║
║  │ [🏥 Nội trú (12 khoa)] │ 🏥 Ngoại trú (8 khoa)  │         ║  ║ ← ACTIVE TAB
║  └─────────────────────────────────────────────────────────────┘  ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │ 📊 SUMMARY CARDS - NỘI TRÚ                                   │ ║
║  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ ║
║  │ │ Tổng khoa│ │Tổng ca VP│ │Tổng DT   │ │ BQ/ca    │        │ ║
║  │ │    12    │ │   450    │ │  15 tỷ   │ │ 33 triệu │        │ ║
║  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  🔍 Bộ lọc và xuất dữ liệu - Nội trú                              ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ [🔍 Tìm kiếm khoa...          ] [🔄 Đặt lại] [💾 Xuất CSV] │   ║
║  └────────────────────────────────────────────────────────────┘   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                    ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ BẢNG DỮ LIỆU NỘI TRÚ                                        │   ║
║  │ ┌──┬────────────────┬──────┬──────────┬────────┬──────┬───┐│   ║
║  │ │ST│ Tên Khoa       │Số ca │Doanh thu │BQ/ca   │Thuốc │VT ││   ║
║  │ ├──┼────────────────┼──────┼──────────┼────────┼──────┼───┤│   ║
║  │ │1 │Khoa Hồi sức    │  7   │182 triệu │26 triệu│ 8%   │0% ││   ║
║  │ │  │ID: 3           │      │          │        │      │   ││   ║
║  │ ├──┼────────────────┼──────┼──────────┼────────┼──────┼───┤│   ║
║  │ │2 │Khoa Ngoại      │ 45   │1.2 tỷ    │27 triệu│ 12%  │5% ││   ║
║  │ │  │ID: 5           │      │          │        │      │   ││   ║
║  │ └──┴────────────────┴──────┴──────────┴────────┴──────┴───┘│   ║
║  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   ║
║  │ Tổng (sau lọc): 52 ca | 1.38 tỷ | 26.5 triệu             │   ║
║  └────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Khi click tab "Ngoại trú"

```
╔═══════════════════════════════════════════════════════════════════╗
║  ┌─────────────────────────────────────────────────────────────┐  ║
║  │  🏥 Nội trú (12 khoa)  │ [🏥 Ngoại trú (8 khoa)] │         ║  ║ ← ACTIVE TAB
║  └─────────────────────────────────────────────────────────────┘  ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────────┐ ║
║  │ 📊 SUMMARY CARDS - NGOẠI TRÚ                                 │ ║
║  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ ║
║  │ │ Tổng khoa│ │Tổng ca VP│ │Tổng DT   │ │ BQ/ca    │        │ ║
║  │ │     8    │ │   320    │ │  8.5 tỷ  │ │ 26 triệu │        │ ║
║  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │ ║
║  └──────────────────────────────────────────────────────────────┘ ║
║                                                                    ║
║  🔍 Bộ lọc và xuất dữ liệu - Ngoại trú                            ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ [🔍 Tìm kiếm khoa...          ] [🔄 Đặt lại] [💾 Xuất CSV] │   ║
║  └────────────────────────────────────────────────────────────┘   ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                    ║
║  ┌────────────────────────────────────────────────────────────┐   ║
║  │ BẢNG DỮ LIỆU NGOẠI TRÚ                                      │   ║
║  │ ┌──┬────────────────┬──────┬──────────┬────────┬──────┬───┐│   ║
║  │ │ST│ Tên Khoa       │Số ca │Doanh thu │BQ/ca   │Thuốc │VT ││   ║
║  │ ├──┼────────────────┼──────┼──────────┼────────┼──────┼───┤│   ║
║  │ │1 │Khoa Khám bệnh  │ 150  │3.8 tỷ    │25 triệu│ 10%  │3% ││   ║
║  │ │  │ID: 10          │      │          │        │      │   ││   ║
║  │ ├──┼────────────────┼──────┼──────────┼────────┼──────┼───┤│   ║
║  │ │2 │Khoa Răng       │  80  │2.1 tỷ    │26 triệu│ 8%   │2% ││   ║
║  │ │  │ID: 12          │      │          │        │      │   ││   ║
║  │ └──┴────────────────┴──────┴──────────┴────────┴──────┴───┘│   ║
║  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   ║
║  │ Tổng (sau lọc): 230 ca | 5.9 tỷ | 25.6 triệu             │   ║
║  └────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Điểm nhấn UI

### **1. Tab Header**

```
┌─────────────────────────────────────────────────────┐
│ [🏥 Nội trú ┃12 khoa] │  🏥 Ngoại trú ┃8 khoa  │   │
│  ▲ ACTIVE (màu xanh)   │  (màu xám)             │   │
└─────────────────────────────────────────────────────┘
```

- **Active tab**: Màu xanh `#1939B7`, border bottom
- **Inactive tab**: Màu xám, hover effect
- **Badge**: Số lượng khoa, màu riêng cho mỗi tab

### **2. Summary Cards Layout**

```
┌─────────────────────────────────────────────────────────┐
│  [🔵 Tổng khoa]  [🟢 Tổng ca VP]  [🔴 Tổng DT]  [🟡 BQ/ca]│
│     BLUE            GREEN           RED         YELLOW  │
└─────────────────────────────────────────────────────────┘
```

### **3. Tab Badge Colors**

- **Nội trú**: `#00C49F` (Xanh lá) - Badge hiển thị số khoa
- **Ngoại trú**: `#FFBB28` (Vàng) - Badge hiển thị số khoa

---

## 📱 Responsive Design

### **Desktop (>960px)**

```
┌─────────────────────────────────────────────┐
│ [Tab 1] [Tab 2]                             │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐    │
│ │Card 1 │ │Card 2 │ │Card 3 │ │Card 4 │    │  ← 4 cards ngang
│ └───────┘ └───────┘ └───────┘ └───────┘    │
│ Table (full width)                          │
└─────────────────────────────────────────────┘
```

### **Mobile (<600px)**

```
┌───────────────────┐
│ [Tab 1] [Tab 2]   │
│ ┌───────────────┐ │
│ │    Card 1     │ │  ← 4 cards dọc
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │    Card 2     │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │    Card 3     │ │
│ └───────────────┘ │
│ ┌───────────────┐ │
│ │    Card 4     │ │
│ └───────────────┘ │
│ Table (scroll)    │
└───────────────────┘
```

---

## 🎨 Color Palette

```javascript
// Tab System
BLUE = "#1939B7"; // Active tab, headers
GRAY = "#f5f5f5"; // Inactive tab background
DARK = "#1D1D1D"; // Dark mode background

// Badges
GREEN = "#00C49F"; // Nội trú badge
YELLOW = "#FFBB28"; // Ngoại trú badge

// Summary Cards
CARD_BLUE = "#1939B7"; // Tổng số khoa
CARD_GREEN = "#00C49F"; // Tổng ca viện phí
CARD_RED = "#bb1515"; // Tổng doanh thu
CARD_YELLOW = "#FFBB28"; // Bình quân/ca
```

---

## 🔄 State Flow

```
User Action: Click Tab
       ↓
setCurrentTab(newValue)
       ↓
Component Re-render
       ↓
Conditional Rendering
       ↓
{currentTab === 0 && <NoiTruContent />}
{currentTab === 1 && <NgoaiTruContent />}
       ↓
Display Active Tab Content
```

---

## 🚀 Performance Optimization

### **Before (2 Tables)**

```javascript
// Render cả 2 bảng cùng lúc
<NoiTruTable />    // ~500 DOM nodes
<NgoaiTruTable />  // ~500 DOM nodes
// Total: ~1000 DOM nodes
```

### **After (Tabs)**

```javascript
// Chỉ render tab active
{
  currentTab === 0 && <NoiTruTable />;
} // ~500 DOM nodes
// OR
{
  currentTab === 1 && <NgoaiTruTable />;
} // ~500 DOM nodes
// Total: ~500 DOM nodes (50% reduction)
```

**Kết quả:**

- ⚡ Giảm 50% số lượng DOM nodes
- ⚡ Tăng tốc độ render
- ⚡ Giảm memory usage

---

## 📊 User Interaction Flow

```
1. User vào trang
   ↓
2. Hiển thị tab "Nội trú" (mặc định)
   ↓
3. Load 4 summary cards + table
   ↓
4. User search/sort trong tab Nội trú
   ↓
5. User click tab "Ngoại trú"
   ↓
6. Hiển thị nội dung Ngoại trú (state mới)
   ↓
7. User click lại tab "Nội trú"
   ↓
8. State search/sort của Nội trú được giữ nguyên
```

---

## ✅ Accessibility (A11y)

```javascript
// Tab có role="tab"
<Tab
  role="tab"
  aria-selected={currentTab === 0}
  aria-controls="tabpanel-0"
/>

// TabPanel có role="tabpanel"
<Box
  role="tabpanel"
  id="tabpanel-0"
  aria-labelledby="tab-0"
/>
```

**Keyboard Navigation:**

- `Tab`: Chuyển focus giữa các tabs
- `Arrow Left/Right`: Di chuyển giữa tabs
- `Enter/Space`: Activate tab

---

## 🎉 Kết luận

Tab layout giúp:

- ✅ Giao diện gọn gàng hơn
- ✅ Dễ sử dụng hơn
- ✅ Performance tốt hơn
- ✅ Mobile-friendly
- ✅ State management rõ ràng

**Happy Coding! 🚀**
