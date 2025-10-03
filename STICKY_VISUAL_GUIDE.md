# 📊 Sticky Columns Visual Demo

## 🎯 Sticky Behavior Demonstration

### **Normal Scroll (Before)**

```
Initial state:
┌─────┬──────────────┬───────┬───────────┬────────┬───────┬────────┐
│ STT │ Tên Khoa     │ Số ca │ Doanh thu │ BQ/ca  │ Thuốc │ Vật tư │
├─────┼──────────────┼───────┼───────────┼────────┼───────┼────────┤
│  1  │ Khoa HSCC    │   7   │ 182 triệu │ 26tr   │ 8%    │ 0%     │
└─────┴──────────────┴───────┴───────────┴────────┴───────┴────────┘

After scroll right →:
┌───────┬───────────┬────────┬───────┬────────┐
│ Số ca │ Doanh thu │ BQ/ca  │ Thuốc │ Vật tư │
├───────┼───────────┼────────┼───────┼────────┤
│   7   │ 182 triệu │ 26tr   │ 8%    │ 0%     │
└───────┴───────────┴────────┴───────┴────────┘
                 ❌ Lost context! Which row is this?
```

---

### **Sticky Scroll (After)**

```
Initial state:
┌─────┬──────────────┬───────┬───────────┬────────┬───────┬────────┐
│ STT │ Tên Khoa     │ Số ca │ Doanh thu │ BQ/ca  │ Thuốc │ Vật tư │
├─────┼──────────────┼───────┼───────────┼────────┼───────┼────────┤
│  1  │ Khoa HSCC    │   7   │ 182 triệu │ 26tr   │ 8%    │ 0%     │
│  2  │ Khoa Ngoại   │  45   │ 1.2 tỷ    │ 27tr   │ 12%   │ 5%     │
└─────┴──────────────┴───────┴───────────┴────────┴───────┴────────┘

After scroll right →:
┌─────┬──────────────┐───────┬───────────┬────────┬───────┬────────┐
│ STT │ Tên Khoa     ││ Số ca │ Doanh thu │ BQ/ca  │ Thuốc │ Vật tư │
├─────┼──────────────┤├───────┼───────────┼────────┼───────┼────────┤
│  1  │ Khoa HSCC    ││   7   │ 182 triệu │ 26tr   │ 8%    │ 0%     │
│  2  │ Khoa Ngoại   ││  45   │ 1.2 tỷ    │ 27tr   │ 12%   │ 5%     │
└─────┴──────────────┘└───────┴───────────┴────────┴───────┴────────┘
  ▲ STICKY          ▲ STICKY
       ✅ Context preserved! Always know which row you're looking at
```

---

## 📱 Mobile vs Desktop Layout

### **Desktop (≥600px)**

```
┌──────────────────────────────────────────────────────────────────┐
│ STT │ Tên Khoa              │ Số ca │ Doanh thu │ BQ/ca │ %   │  │
├─────┼───────────────────────┼───────┼───────────┼───────┼─────┼──┤
│ 1   │ Khoa Hồi sức tích cực │   7   │ 182 triệu │ 26tr  │ 8%  │  │
│     │ ID: 3                 │       │           │       │     │  │
└─────┴───────────────────────┴───────┴───────────┴───────┴─────┴──┘

Font sizes: Normal (0.875rem)
Padding: Standard (16px)
Spacing: Comfortable
```

### **Mobile (<600px)**

```
┌──────────────────────────────────────────────┐
│S│Tên Khoa       │Số│Doanh thu│BQ│% │  │
├─┼───────────────┼──┼─────────┼──┼──┼──┤
│1│K.Hồi sức tích │7 │182tr    │26│8%│  │
│ │ID:3           │  │         │  │  │  │
└─┴───────────────┴──┴─────────┴──┴──┴──┘

Font sizes: Reduced (0.7rem) 📉
Padding: Compact (8-12px)
Spacing: Tight but readable
```

---

## 🎨 Z-Index Layers

```
┌─────────────────────────────────────┐
│         Table Container             │
│  ┌──────────────────────────────┐   │
│  │   Sticky Header (z-index: 1) │   │  ← Table header
│  │  ┌────────┬────────┬────────┐ │  │
│  │  │Z:3     │Z:3     │Z:1     │ │  │  ← Header cells
│  │  ├────────┼────────┼────────┤ │  │
│  │  │Z:2     │Z:2     │Z:0     │ │  │  ← Body cells
│  │  │STICKY  │STICKY  │SCROLL  │ │  │
│  │  │        │        │        │ │  │
│  │  ├────────┼────────┼────────┤ │  │
│  │  │Z:2     │Z:2     │Z:0     │ │  │  ← Total row
│  │  │STICKY  │STICKY  │SCROLL  │ │  │
│  │  └────────┴────────┴────────┘ │  │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘

Hierarchy:
Z-3: Sticky header cells (STT, Tên Khoa)
Z-2: Sticky body cells
Z-1: Table sticky header (stickyHeader prop)
Z-0: Normal cells (default)
```

---

## 🔄 Scroll Scenarios

### **Scenario 1: Horizontal Scroll Only**

```
Before:
┌─────┬──────────────┬───────┬───────────┬────────┐
│ STT │ Tên Khoa     │ Số ca │ Doanh thu │ BQ/ca  │
├─────┼──────────────┼───────┼───────────┼────────┤
│  1  │ Khoa A       │  10   │ 200 triệu │ 20tr   │
│  2  │ Khoa B       │  20   │ 400 triệu │ 20tr   │
└─────┴──────────────┴───────┴───────────┴────────┘
        Scroll right →

After:
┌─────┬──────────────┐─────────┬────────┬───────┐
│ STT │ Tên Khoa     ││ BQ/ca  │ Thuốc  │ Vật tư│
├─────┼──────────────┤├────────┼────────┼───────┤
│  1  │ Khoa A       ││ 20tr   │ 10%    │ 5%    │
│  2  │ Khoa B       ││ 20tr   │ 12%    │ 3%    │
└─────┴──────────────┘└────────┴────────┴───────┘
  ▲STICKY  ▲STICKY
```

### **Scenario 2: Vertical Scroll Only**

```
Before:
┌─────┬──────────────┬───────┬───────────┬────────┐
│ STT │ Tên Khoa     │ Số ca │ Doanh thu │ BQ/ca  │ ← Header sticky
├─────┼──────────────┼───────┼───────────┼────────┤
│  1  │ Khoa A       │  10   │ 200 triệu │ 20tr   │
│  2  │ Khoa B       │  20   │ 400 triệu │ 20tr   │
│  3  │ Khoa C       │  15   │ 300 triệu │ 20tr   │
└─────┴──────────────┴───────┴───────────┴────────┘
        Scroll down ↓

After:
┌─────┬──────────────┬───────┬───────────┬────────┐
│ STT │ Tên Khoa     │ Số ca │ Doanh thu │ BQ/ca  │ ← Still visible!
├─────┼──────────────┼───────┼───────────┼────────┤
│  5  │ Khoa E       │  25   │ 500 triệu │ 20tr   │
│  6  │ Khoa F       │  30   │ 600 triệu │ 20tr   │
└─────┴──────────────┴───────┴───────────┴────────┘
```

### **Scenario 3: Diagonal Scroll (Both)**

```
Before:
┌─────┬──────────────┬───────┬───────────┬────────┬───────┐
│ STT │ Tên Khoa     │ Số ca │ Doanh thu │ BQ/ca  │ Thuốc │
├─────┼──────────────┼───────┼───────────┼────────┼───────┤
│  1  │ Khoa A       │  10   │ 200 triệu │ 20tr   │ 10%   │
│  2  │ Khoa B       │  20   │ 400 triệu │ 20tr   │ 12%   │
│  3  │ Khoa C       │  15   │ 300 triệu │ 20tr   │ 8%    │
└─────┴──────────────┴───────┴───────────┴────────┴───────┘
        Scroll right → and down ↓

After:
┌─────┬──────────────┐────────┬───────┬────────┐
│ STT │ Tên Khoa     ││ BQ/ca  │ Thuốc │ Vật tư │ ← Header sticky
├─────┼──────────────┤├────────┼───────┼────────┤
│  5  │ Khoa E       ││ 20tr   │ 15%   │ 5%     │
│  6  │ Khoa F       ││ 20tr   │ 18%   │ 7%     │
└─────┴──────────────┘└────────┴───────┴────────┘
  ▲STICKY  ▲STICKY
     ✅ Both sticky columns AND sticky header work together!
```

---

## 📐 Column Width Calculation

### **Desktop**

```
STT Column:
  minWidth: 50px
  Content: "1", "2", "3"... (max 2-3 digits)
  Padding: 16px

Tên Khoa Column:
  minWidth: 200px
  Content: "Khoa Hồi sức tích cực - Chống độc"
  Sub-content: "ID: 3"
  Padding: 16px

Total sticky width: 50px + 200px = 250px
```

### **Mobile**

```
STT Column:
  minWidth: 40px
  Content: "1", "2"...
  Padding: 8px

Tên Khoa Column:
  minWidth: 120px
  Content: Truncated if needed
  Sub-content: "ID:3"
  Padding: 8px

Total sticky width: 40px + 120px = 160px
```

---

## 🎯 Sticky Position Mechanics

```css
/* STT Column (First) */
.stt-header {
  position: sticky;
  left: 0; /* Stick to left edge */
  z-index: 3;
  background: #1939b7;
}

.stt-body {
  position: sticky;
  left: 0; /* Same as header */
  z-index: 2;
  background: #fff;
}

/* Tên Khoa Column (Second) */
.tenkhoa-header {
  position: sticky;
  left: 50px; /* Offset = width of STT */
  z-index: 3;
  background: #1939b7;
}

.tenkhoa-body {
  position: sticky;
  left: 50px; /* Same offset */
  z-index: 2;
  background: #fff;
}

/* Mobile Adjustment */
@media (max-width: 600px) {
  .tenkhoa-header,
  .tenkhoa-body {
    left: 40px; /* Smaller offset for mobile */
  }
}
```

---

## 🌈 Color Scheme

### **Light Mode**

```
Sticky Header:   #1939B7 (Blue)
Sticky Body:     #FFFFFF (White)
Sticky Total:    #f5f5f5 (Light Gray)
Text:            #1939B7 (Blue)
Border:          #E5EAF2 (Light Blue Gray)
```

### **Dark Mode**

```
Sticky Header:   #1D1D1D (Dark Gray)
Sticky Body:     #1D1D1D (Dark Gray)
Sticky Total:    #2a2a2a (Darker Gray)
Text:            #FFFFFF (White)
Border:          #3a3a3a (Medium Gray)
```

---

## 🎭 Animation & Transitions

```javascript
// No transitions needed for sticky!
// Browser handles sticky positioning natively
// GPU accelerated, smooth 60fps

// Hover effect (optional)
sx={{
  "&:hover": {
    bgcolor: darkMode ? "#252525" : "#f9f9f9",
  },
}}
```

---

## 🔬 Technical Details

### **Browser Rendering**

```
1. Browser creates stacking context
2. Calculates sticky offset (left: 0, left: 50px)
3. Applies z-index layering
4. GPU renders sticky elements on top
5. Smooth scroll with transform3d
```

### **Performance**

```
✅ GPU accelerated
✅ No JavaScript scroll listeners
✅ Native browser implementation
✅ 60fps smooth scroll
✅ Low memory overhead
```

### **Accessibility**

```
✅ Screen reader friendly (normal table structure)
✅ Keyboard navigation works
✅ Focus indicators visible
✅ ARIA labels preserved
```

---

## 📊 Comparison Chart

| Feature           | No Sticky         | With Sticky       |
| ----------------- | ----------------- | ----------------- |
| Context awareness | ❌ Lost on scroll | ✅ Always visible |
| Data correlation  | ❌ Hard to match  | ✅ Easy to match  |
| User experience   | 😐 Confusing      | 😊 Intuitive      |
| Mobile usability  | 😞 Difficult      | 😃 Easy           |
| Performance       | ⚡ Good           | ⚡ Good           |
| Browser support   | 100%              | 97%+              |

---

## 🎉 Real-world Example

### **Scenario: Comparing Revenue across Departments**

**Without Sticky:**

```
User: "Khoa Ngoại có bao nhiêu ca?"
→ Scroll right to see "Số ca"
→ See number: "45"
→ Wait... which row was that? 🤔
→ Scroll back left to check
→ Oh, it's row 2... let me scroll right again
→ Frustrating! 😤
```

**With Sticky:**

```
User: "Khoa Ngoại có bao nhiêu ca?"
→ Scroll right to see "Số ca"
→ See: "Khoa Ngoại | 45 ca" ← Context always visible
→ Perfect! I know exactly what I'm looking at 😊
→ Continue to check "Doanh thu": 1.2 tỷ
→ Still see "Khoa Ngoại" label
→ Smooth experience! ✨
```

---

**Sticky columns = Game changer for wide tables! 🚀**
