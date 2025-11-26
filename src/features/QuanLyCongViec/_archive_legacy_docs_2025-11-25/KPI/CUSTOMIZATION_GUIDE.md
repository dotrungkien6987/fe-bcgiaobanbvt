# 🎨 KPI UI Customization Guide

**Quick reference cho việc tùy chỉnh giao diện KPI**

---

## 🌈 Thay Đổi Màu Sắc

### 1. Main Gradient (Header & Footer)

**File:** `ChamDiemKPIDialog.js` + `ChamDiemKPITable.js`

```jsx
// Hiện tại: Purple → Blue
background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

// Option 1: Blue → Teal
background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)";

// Option 2: Pink → Orange
background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)";

// Option 3: Green → Blue
background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)";

// Option 4: Dark Purple
background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
```

**Áp dụng ở:**

- DialogTitle (line ~153)
- Table header cells (line ~200)
- Summary footer (line ~635)

---

### 2. Progress Bar Colors

**File:** `ChamDiemKPIDialog.js` (line ~221)

```jsx
// Hiện tại
100%: "linear-gradient(90deg, #10b981 0%, #059669 100%)" // Green
50%+: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)" // Orange
<50%: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)" // Red

// Thay đổi threshold
progress.percentage >= 80  // Tăng yêu cầu từ 100% lên 80%
progress.percentage >= 60  // Tăng yêu cầu từ 50% lên 60%
```

---

### 3. Score Card Border Colors

**File:** `ChamDiemKPIDialog.js` (line ~187)

```jsx
// Hiện tại
borderColor: totalKPIScore >= 80
  ? "success.main"
  : totalKPIScore >= 60
  ? "warning.main"
  : "error.main";

// Thay đổi threshold
totalKPIScore >= 85; // Strict mode
totalKPIScore >= 70;
```

---

### 4. Table Column Header Colors

**File:** `ChamDiemKPITable.js` (line ~210)

```jsx
// TĂNG ĐIỂM column
background: "linear-gradient(135deg, #10b981 0%, #059669 100%)";

// GIẢM ĐIỂM column
background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";

// TỔNG ĐIỂM column
background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";

// Thay đổi sang flat colors
bgcolor: "success.main";
bgcolor: "error.main";
bgcolor: "warning.main";
```

---

## 📏 Thay Đổi Kích Thước

### 1. Task Name Font Size

**File:** `ChamDiemKPITable.js` (line ~350)

```jsx
// Hiện tại: 1.05rem (~17px)
fontSize: "1.05rem";

// Larger: 1.1rem (~18px)
fontSize: "1.1rem";

// Smaller: 1rem (16px)
fontSize: "1rem";

// Extra large: 1.15rem (~18.5px)
fontSize: "1.15rem";
```

---

### 2. Header Title Size

**File:** `ChamDiemKPIDialog.js` (line ~158)

```jsx
// Hiện tại: h4 (~34px)
variant = "h4";

// Larger: h3 (~48px)
variant = "h3";

// Smaller: h5 (~24px)
variant = "h5";
```

---

### 3. Progress Bar Height

**File:** `ChamDiemKPIDialog.js` (line ~215)

```jsx
// Hiện tại: 16px
height: 16;

// Thinner: 12px
height: 12;

// Thicker: 20px
height: 20;
```

---

### 4. Input Field Width

**File:** `ChamDiemKPITable.js` (line ~380)

```jsx
// Hiện tại: 110px
width: 110;

// Narrower: 100px
width: 100;

// Wider: 120px
width: 120;
```

---

### 5. Table Column Widths

**File:** `ChamDiemKPITable.js` (line ~195-210)

```jsx
// STT
width: 60; // Default, có thể giảm xuống 50

// Nhiệm vụ
minWidth: 280; // Tăng lên 300-350 nếu tên dài

// Độ khó
width: 100; // Default OK

// Tiêu chí
width: 140; // Tăng lên 160 nếu label dài

// Tổng điểm
width: 120; // Default OK
```

---

## ✨ Effects & Animations

### 1. Hover Transform Scale

**File:** `ChamDiemKPITable.js` (line ~334)

```jsx
// Hiện tại: subtle
transform: "scale(1.001)";

// More noticeable
transform: "scale(1.005)";

// Disabled
transform: "none";
```

---

### 2. Button Hover Lift

**File:** `ChamDiemKPIDialog.js` (line ~295-310)

```jsx
// Hiện tại: -2px
transform: "translateY(-2px)";

// Higher lift: -4px
transform: "translateY(-4px)";

// Lower: -1px
transform: "translateY(-1px)";
```

---

### 3. Transition Duration

```jsx
// Hiện tại: 0.2s - 0.3s
transition: "all 0.2s ease";

// Faster: 0.15s
transition: "all 0.15s ease";

// Slower: 0.4s
transition: "all 0.4s ease";
```

---

### 4. Box Shadow Intensity

**File:** `ChamDiemKPIDialog.js` (line ~301)

```jsx
// Hiện tại
boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)";

// Lighter
boxShadow: "0 2px 8px rgba(102, 126, 234, 0.2)";

// Stronger
boxShadow: "0 6px 24px rgba(102, 126, 234, 0.6)";

// No shadow
boxShadow: "none";
```

---

## 🎭 Visual Density

### 1. Compact Mode

```jsx
// ChamDiemKPITable.js
<Table size="small">  // Thay vì "medium"

// Giảm padding
sx={{ px: 2, py: 1.5 }}  // Thay vì px: 3, py: 3
```

---

### 2. Spacious Mode

```jsx
// Tăng padding
sx={{ px: 5, py: 4 }}

// Tăng gap
gap: 3  // Thay vì gap: 2

// Tăng margin
mb: 4  // Thay vì mb: 3
```

---

## 🎨 Theme Presets

### Preset 1: Corporate Blue

```jsx
// Headers
background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";

// Success
background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)";

// Warning
background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)";
```

### Preset 2: Modern Green

```jsx
// Headers
background: "linear-gradient(135deg, #059669 0%, #10b981 100%)";

// Success
background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)";

// Warning
background: "linear-gradient(135deg, #ca8a04 0%, #eab308 100%)";
```

### Preset 3: Bold Purple

```jsx
// Headers
background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)";

// Success
background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)";

// Warning
background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)";
```

---

## 🔧 Advanced Customizations

### 1. Remove Gradient (Flat Design)

```jsx
// Replace all gradient backgrounds with solid colors
background: "linear-gradient(...)"  →  bgcolor: "primary.main"
background: "linear-gradient(...)"  →  bgcolor: "success.main"
```

### 2. Dark Mode Support

```jsx
// Add theme mode check
sx={{
  bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : 'white',
  color: theme.palette.mode === 'dark' ? '#f1f5f9' : 'text.primary',
}}
```

### 3. Custom Icons

```jsx
// Replace emojis with MUI icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// In headers
📋 → <AssignmentIcon />
⚡ → <SpeedIcon />
🎯 → <EmojiEventsIcon />
```

### 4. Custom Fonts

```jsx
// Add to theme or inline
fontFamily: '"Inter", "Roboto", sans-serif';
fontFamily: '"Poppins", sans-serif';
fontFamily: '"Montserrat", sans-serif';
```

---

## 📐 Responsive Breakpoints

### Mobile Optimization

```jsx
// ChamDiemKPIDialog.js
<Dialog
  fullScreen={isMobile}  // Add mobile detection
  maxWidth="lg"
>

// Conditional styling
sx={{
  fontSize: { xs: '0.9rem', md: '1.05rem' },
  px: { xs: 2, md: 4 },
}}
```

---

## 🎯 Quick Tweaks

### Make Everything Bigger

```jsx
// Font sizes
fontSize: "1.1rem"; // +5%
fontSize: "1.15rem"; // +10%
fontSize: "1.2rem"; // +15%

// Padding
p: 4; // Instead of p: 3
px: 5; // Instead of px: 4

// Heights
height: 44; // Instead of 40
height: 36; // Instead of 32
```

### Make Everything Smaller

```jsx
// Font sizes
fontSize: "0.95rem"; // -5%
fontSize: "0.9rem"; // -10%

// Padding
p: 2; // Instead of p: 3
px: 3; // Instead of px: 4

// Heights
height: 36; // Instead of 40
height: 28; // Instead of 32
```

### Remove All Shadows

```jsx
// Find and replace
boxShadow: "..."  →  boxShadow: "none"
```

### Flat Borders Instead

```jsx
// Add borders
border: "1px solid";
borderColor: "divider";
```

---

## 🧪 Testing Your Changes

1. **Save file** (Ctrl+S)
2. **Check browser** (Auto-reload)
3. **Test interactions:**
   - Hover effects
   - Click buttons
   - Input fields
   - Expand rows
4. **Check responsive:**
   - Resize window
   - Test on mobile view
5. **Verify accessibility:**
   - Contrast ratios
   - Keyboard navigation

---

## 💡 Pro Tips

### Tip 1: Use CSS Variables

```jsx
const colors = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  success: "#10b981",
  // ...
};

// Then use
background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`;
```

### Tip 2: Extract to Theme

```jsx
// In theme.js
palette: {
  kpi: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    scored: '#10b981',
    // ...
  }
}

// Use
bgcolor: theme.palette.kpi.scored
```

### Tip 3: Reusable Components

```jsx
const GradientCard = ({ children }) => (
  <Box
    sx={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: 2,
      p: 3,
      // ...
    }}
  >
    {children}
  </Box>
);
```

---

## 📚 References

- **MUI Docs:** https://mui.com/material-ui/
- **Color Tool:** https://m2.material.io/design/color/
- **Gradient Generator:** https://cssgradient.io/
- **Shadow Generator:** https://shadows.brumm.af/

---

**Happy Customizing! 🎨✨**
