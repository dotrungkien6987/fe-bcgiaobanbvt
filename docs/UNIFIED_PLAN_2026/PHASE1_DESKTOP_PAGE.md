# Phase 1: Desktop Page Implementation

## 🎯 Mục Tiêu

Tạo `CongViecDetailPageNew.js` để test song song với Dialog cũ.

---

## 📐 Cấu Trúc Component Mới

```jsx
// TRƯỚC: Dialog wrapper
<Dialog fullScreen open={open} onClose={onClose}>
  <DialogTitle>...</DialogTitle>
  <DialogContent>...</DialogContent>
  <DialogActions>...</DialogActions>
</Dialog>

// SAU: Page wrapper
<Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
  <AppBar>...</AppBar>           // Thay DialogTitle
  <Box sx={{ flex: 1, overflow: "auto" }}>
    <Container>...</Container>   // Thay DialogContent
  </Box>
  <Paper>...</Paper>             // Thay DialogActions
</Box>
```

---

## 🔧 Thay Đổi Chính

### 1. Props → Hooks

```jsx
// TRƯỚC
const CongViecDetailDialog = ({ open, onClose, congViecId }) => {

// SAU
const CongViecDetailPageNew = () => {
  const { id: congViecId } = useParams();
  const navigate = useNavigate();
  const handleClose = () => navigate(-1);
```

### 2. useEffect Condition

```jsx
// TRƯỚC
useEffect(() => {
  if (open && congViecId) {
    // Check 'open'
    dispatch(getCongViecDetail(congViecId));
  }
}, [open, congViecId]);

// SAU
useEffect(() => {
  if (congViecId) {
    // No 'open' check needed
    dispatch(getCongViecDetail(congViecId));
  }
}, [congViecId]);
```

### 3. SubtasksSection prop

```jsx
// TRƯỚC
<SubtasksSection
  parent={congViec}
  open={open}  // ← Remove this
  ...
/>

// SAU
<SubtasksSection
  parent={congViec}
  // No 'open' prop
  ...
/>
```

---

## 📝 Implementation Steps

### Step 1: Tạo file mới

- Copy `CongViecDetailDialog.js` → `CongViecDetailPageNew.js`
- Đổi tên component

### Step 2: Thay imports

```jsx
// Bỏ
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

// Thêm
import { AppBar, Toolbar, Container, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
```

### Step 3: Thay props → hooks

- Xóa props `open, onClose, congViecId`
- Thêm `useParams()` và `useNavigate()`

### Step 4: Thay wrapper JSX

- `<Dialog>` → `<Box>`
- `<DialogTitle>` → `<AppBar>`
- `<DialogContent>` → `<Box overflow="auto">`
- `<DialogActions>` → `<Paper>`

### Step 5: Update useEffects

- Bỏ condition `open &&`

### Step 6: Thêm route tạm

```jsx
// routes/index.js
{
  path: "congviec-new/:id",
  element: <CongViecDetailPageNew />,
}
```

---

## 🧪 Test Cases

| Test           | URL                 | Expected          |
| -------------- | ------------------- | ----------------- |
| Direct access  | `/congviec-new/123` | Load task 123     |
| F5 refresh     | `/congviec-new/123` | Same content      |
| Browser back   | Click back          | Return to list    |
| Share link     | Copy URL            | Works for others  |
| Subtasks       | Click subtask       | Opens in new tab  |
| Create subtask | Click "Thêm"        | Form opens, saves |
| Edit subtask   | Click edit          | Form opens, saves |
| Delete subtask | Click delete        | Confirms, deletes |
| Comments       | Add comment         | Saves             |
| Files          | Upload file         | Saves             |
| Progress       | Update %            | Saves             |
| Status         | Change status       | Transitions       |

---

## ⏱️ Estimated Time

| Task               | Time           |
| ------------------ | -------------- |
| Copy & rename file | 5 min          |
| Update imports     | 10 min         |
| Props → hooks      | 5 min          |
| Wrapper JSX        | 30 min         |
| Update useEffects  | 5 min          |
| Add temp route     | 5 min          |
| Testing            | 30 min         |
| **Total**          | **~1.5 hours** |

---

## 🚀 Ready to Implement

Command để bắt đầu:

```
"Tạo CongViecDetailPageNew.js - Step 1-4"
```

Hoặc:

```
"Tạo CongViecDetailPageNew.js hoàn chỉnh"
```
