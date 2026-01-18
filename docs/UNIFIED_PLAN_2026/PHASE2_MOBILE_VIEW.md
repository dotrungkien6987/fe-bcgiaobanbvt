# Phase 2: Mobile View Implementation

## 🎯 Mục Tiêu

Tạo `CongViecDetailMobile.js` với UX tối ưu cho mobile.

---

## 📱 Mobile Layout Design

```
┌─────────────────────────────────┐
│ ← Back    CV00123    ⋮ Menu    │  Sticky Header (56px)
├─────────────────────────────────┤
│ ████████████░░░░░░░ 75%        │  Progress Bar
├─────────────────────────────────┤
│ [Thông tin] [💬 12] [📎 3]     │  Tab Navigation
├─────────────────────────────────┤
│                                 │
│     Tab Content (Scrollable)    │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [Hành động 1] [✓ Hoàn thành]   │  Sticky Actions (72px)
└─────────────────────────────────┘
```

---

## 📑 Tab Structure

| Tab               | Content                                       |
| ----------------- | --------------------------------------------- |
| **Thông tin**     | Description, Warning config, Assignees, Dates |
| **Bình luận**     | CommentComposer + CommentsList                |
| **Tệp tin**       | FilesSidebar content                          |
| **Công việc con** | SubtasksSection                               |
| **Lịch sử**       | HistorySection                                |

---

## 🔧 Key Components

### 1. MobileHeader

```jsx
<AppBar position="sticky" sx={{ bgcolor: "#1939B7" }}>
  <Toolbar>
    <IconButton onClick={handleBack}>
      <ArrowBackIcon />
    </IconButton>
    <Box sx={{ flex: 1, mx: 2 }}>
      <Typography variant="subtitle2">{congViec.MaCongViec}</Typography>
      <Typography variant="caption" noWrap>
        {congViec.TieuDe}
      </Typography>
    </Box>
    <IconButton onClick={openMenu}>
      <MoreVertIcon />
    </IconButton>
  </Toolbar>
  {/* Progress bar */}
  <LinearProgress
    variant="determinate"
    value={congViec.PhanTramTienDoTong}
    sx={{ height: 6 }}
  />
</AppBar>
```

### 2. TabNavigation

```jsx
<Tabs
  value={activeTab}
  onChange={handleTabChange}
  variant="scrollable"
  scrollButtons="auto"
>
  <Tab label="Thông tin" />
  <Tab label={<Badge badgeContent={commentCount}>💬</Badge>} />
  <Tab label={<Badge badgeContent={fileCount}>📎</Badge>} />
  <Tab label="Công việc con" />
  <Tab label="Lịch sử" />
</Tabs>
```

### 3. StickyActions

```jsx
<Paper
  elevation={8}
  sx={{
    position: "fixed",
    bottom: 56, // Above bottom nav
    left: 0,
    right: 0,
    p: 2,
    pb: "calc(env(safe-area-inset-bottom) + 16px)",
    zIndex: 1200,
  }}
>
  <Stack direction="row" spacing={1}>
    {availableActions.map(action => (
      <Button key={action} ...>{ACTION_META[action].label}</Button>
    ))}
  </Stack>
</Paper>
```

---

## 📝 Implementation Steps

### Step 1: Create MobileHeader component

### Step 2: Create TabContent components

### Step 3: Create StickyActions component

### Step 4: Combine in CongViecDetailMobile.js

### Step 5: Test on real devices

---

## 🧪 Mobile Test Cases

| Test      | Action         | Expected                |
| --------- | -------------- | ----------------------- |
| Scroll    | Scroll content | Header stays sticky     |
| Tabs      | Swipe/tap tabs | Content changes         |
| Back      | Tap back       | Navigate to list        |
| Menu      | Tap ⋮          | Action menu opens       |
| Actions   | Tap action btn | Action executes         |
| Comment   | Add comment    | Keyboard + submit works |
| Safe area | iPhone notch   | Content not hidden      |

---

## ⏱️ Estimated Time

| Task          | Time           |
| ------------- | -------------- |
| MobileHeader  | 30 min         |
| TabContent    | 1 hour         |
| StickyActions | 30 min         |
| Integration   | 30 min         |
| Testing       | 1 hour         |
| **Total**     | **~3.5 hours** |

---

## 🚀 Start Command

```
"Tạo CongViecDetailMobile.js"
```
