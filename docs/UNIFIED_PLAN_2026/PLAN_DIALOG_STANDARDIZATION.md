# 📱 Dialog Form Standardization - Mobile UX Plan

## 🎯 Mục Tiêu

Chuẩn hóa tất cả dialog forms trong module `QuanLyCongViec` để có trải nghiệm mobile UX nhất quán:

- **Mobile**: Bottom sheet slide-up từ dưới lên
- **Desktop**: Modal dialog ở giữa màn hình
- **Tất cả**: Safe area padding cho thiết bị có notch

---

## 📊 Tình Trạng Hiện Tại

### Component BottomSheetDialog Đã Có

**Vị trí**: `src/features/QuanLyCongViec/Ticket/components/BottomSheetDialog.jsx`

**Tính năng hiện có**:

- ✅ Responsive: Mobile = bottom sheet, Desktop = center modal
- ✅ Drag handle indicator trên mobile
- ✅ Auto full-width buttons trên mobile
- ✅ Smooth iOS scroll (-webkit-overflow-scrolling: touch)
- ✅ Slide-up animation từ bottom

**Thiếu**:

- ❌ Safe area padding cho devices có notch
- ❌ Chưa nằm trong shared components

### Thống Kê Dialogs

| Module          | Tổng Dialogs | Đã Dùng BottomSheetDialog | Cần Migrate |
| --------------- | ------------ | ------------------------- | ----------- |
| Ticket (YeuCau) | 8            | 3 (37.5%)                 | 5           |
| CongViec        | 5            | 0 (0%)                    | 4           |
| **Tổng**        | **13**       | **3 (23%)**               | **9**       |

**Lưu ý**: Không bao gồm CongViecFormDialog và CongViecDetailDialog (quá phức tạp, xử lý riêng sau).

---

## 📋 Danh Sách Chi Tiết Các Dialogs

### A. Ticket Module (`src/features/QuanLyCongViec/Ticket/`)

#### ✅ Đã Dùng BottomSheetDialog (3)

1. **TiepNhanDialog.js** - Dialog tiếp nhận yêu cầu
2. **DieuPhoiDialog.js** - Dialog điều phối yêu cầu
3. **TuChoiDialog.js** - Dialog từ chối yêu cầu

#### ❌ Cần Migrate (5)

4. **YeuCauFormDialog.js** (~4 fields) - Form tạo/sửa yêu cầu
5. **StarRatingDialog.js** (1 field) - Dialog đánh giá sao
6. **MoLaiDialog.js** (~2 fields) - Dialog mở lại yêu cầu
7. **AppealDialog.js** (~2 fields) - Dialog khiếu nại
8. **GuiVeKhoaDialog.js** (~2 fields) - Dialog gửi về khoa

### B. CongViec Module (`src/features/QuanLyCongViec/CongViec/`)

#### ❌ Cần Migrate (4)

1. **ConfirmActionDialog.jsx** - Dialog xác nhận hành động (trong `components/`)
2. **ProgressConfirmDialog.jsx** - Dialog xác nhận tiến độ (trong `components/`)
3. **ColorLegendDialog.js** - Dialog chú thích màu (trong `components/`)
4. **AdminColorSettingsDialog.js** - Dialog cài đặt màu admin (trong `components/`)

#### ⏸️ Không Xử Lý (Quá Phức Tạp)

- **CongViecFormDialog.js** (1169 lines, 15+ fields) - Giữ nguyên structure hiện tại
- **CongViecDetailDialog.js** - Giữ nguyên structure hiện tại

**Lưu ý**: File structure giữ nguyên - không di chuyển files giữa root và components/

---

## 🔧 Code Mẫu & Pattern

### BottomSheetDialog Component Hiện Tại

```jsx
// File: src/features/QuanLyCongViec/Ticket/components/BottomSheetDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function BottomSheetDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: isMobile
          ? {
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              m: 0,
              borderRadius: "16px 16px 0 0",
              maxHeight: "90vh",
            }
          : {},
      }}
      TransitionProps={{
        style: isMobile ? { transformOrigin: "bottom" } : {},
      }}
      sx={{
        "& .MuiDialog-container": isMobile ? { alignItems: "flex-end" } : {},
      }}
    >
      {/* Drag Handle for mobile */}
      {isMobile && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              backgroundColor: "grey.300",
              borderRadius: 2,
            }}
          />
        </Box>
      )}

      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={
            isMobile
              ? {
                  flexDirection: "column",
                  gap: 1,
                  p: 2,
                  "& > button": { width: "100%" },
                }
              : {}
          }
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
```

### Cách Migrate Dialog Hiện Tại

**TRƯỚC (Dialog thường)**:

```jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

function SomeDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tiêu đề</DialogTitle>
      <DialogContent>{/* Form content */}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**SAU (BottomSheetDialog)**:

```jsx
import BottomSheetDialog from "components/BottomSheetDialog";
import { Button } from "@mui/material";

function SomeDialog({ open, onClose }) {
  return (
    <BottomSheetDialog
      open={open}
      onClose={onClose}
      title="Tiêu đề"
      actions={
        <>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu
          </Button>
        </>
      }
    >
      {/* Form content - không cần DialogContent wrapper */}
    </BottomSheetDialog>
  );
}
```

---

## 📝 Kế Hoạch Triển Khai Chi Tiết

### Phase 1: Nâng Cấp & Di Chuyển BottomSheetDialog (30 phút)

#### Task 1.1: Tạo Component Mới Ở Shared Location

**File mới**: `src/components/BottomSheetDialog/index.js`

**Nâng cấp cần làm**: với fallback
<DialogActions
sx={
isMobile
? {
flexDirection: "column",
gap: 1,
p: 2,
pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)", // 👈 THÊM với fallback
"& > button": { width: "100%" },
}
: {}
}

>

````

**Props giữ nguyên** (không thêm props mới trong phase này):

```jsx
export default function BottomSheetDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullScreen = false,
  ...otherDialogProps
}) {
  // Existing implementationnst handleClose = (event, reason) => {
    if (disableBackdropClick && reason === "backdropClick") return;
    onClose(event, reason);
  };
  // ...
}
````

#### Task 1.2: Update Imports Trong 3 Dialogs Đang Dùng

```jsx
// TRƯỚC
import BottomSheetDialog from "../components/BottomSheetDialog";

// SAU
import BottomSheetDialog from "components/BottomSheetDialog";
```

**Files cần update**:

- `src/features/QuanLyCongViec/Ticket/components/TiepNhanDialog.js`
- `src/features/QuanLyCongViec/Ticket/components/DieuPhoiDialog.js`
- `src/features/QuanLyCongViec/Ticket/components/TuChoiDialog.js`

#### Task 1.3: Xóa File Cũ (Optional - sau khi test)

- `src/features/QuanLyCongViec/Ticket/components/BottomSheetDialog.jsx`

---

### Phase 2: Migrate Simple Ticket Dialogs (45 phút)

#### Task 2.1: StarRatingDialog.js

- **Độ phức tạp**: Thấp (1 field - rating stars)
- **Path**: `src/features/QuanLyCongViec/Ticket/components/StarRatingDialog.js`

#### Task 2.2: MoLaiDialog.js

- **Độ phức tạp**: Thấp (~2 fields)
- **Path**: `src/features/QuanLyCongViec/Ticket/components/MoLaiDialog.js`

#### Task 2.3: AppealDialog.js

- **Độ phức tạp**: Thấp (~2 fields)
- **Path**: `src/features/QuanLyCongViec/Ticket/components/AppealDialog.js`

#### Task 2.4: GuiVeKhoaDialog.js

- **Độ phức tạp**: Thấp (~2 fields)
- **Path**: `src/features/QuanLyCongViec/Ticket/components/GuiVeKhoaDialog.js`

---

### Phase 3: Migrate YeuCauFormDialog (30 phút)

45 phút)

#### Task 3.1: YeuCauFormDialog.js

- **Độ phức tạp**: Trung bình (~4 fields với form validation)
- **Path**: `src/features/QuanLyCongViec/Ticket/components/YeuCauFormDialog.js`
- **Lưu ý**: Có React Hook Form + Yup validation - cần test kỹ form submission

---

### Phase 4: Migrate CongViec Simple Dialogs (30 phút)

#### Task 4.1: ConfirmActionDialog.jsx

- **Độ phức tạp**: Thấp (confirm only)
- **Path**: `src/features/QuanLyCongViec/CongViec/components/ConfirmActionDialog.jsx`

#### Task 4.2: ProgressConfirmDialog.jsx

- **Độ phức tạp**: Thấp
- **Path**: `src/features/QuanLyCongViec/CongViec/components/ProgressConfirmDialog.jsx`

#### Task 4.3: ColorLegendDialog.js

- **Độ phức tạp**: Thấp (read-only display)
- **Path**: `src/features/QuanLyCongViec/CongViec/components/ColorLegendDialog.js`

#### Task 4.4: AdminColorSettingsDialog.js

- **Độ phức tạp**: Trung bình
- **Path**: `src/features/QuanLyCongViec/CongViec/components/AdminColorSettingsDialog.js`

---

### Phase 5

#### Checklist Test

- [ ] Test trên iOS Safari (iPhone với notch)
- [ ] Test trên Android Chrome
- [ ] Test trên Desktop browsers
- [ ] Verify safe area padding hoạt động
- [ ] Verify drag handle visible trên mobile
- [ ] Verify buttons full-width trên mobile
- [ ] Verify form validation vẫn hoạt động
- [ ] Verify animations smooth

---

## ✅ Checklist Tổng Hợp

### Phase 1: Setup

- [ ] Tạo `src/components/BottomSheetDialog/index.js` với safe area padding
- [ ] Update import trong `TiepNhanDialog.js`
- [ ] Update import trong `DieuPhoiDialog.js`
- [ ] Update import trong `TuChoiDialog.js`
- [ ] Test 3 dialogs vẫn hoạt động
- [ ] Xóa file cũ `Ticket/components/BottomSheetDialog.jsx`

### Phase 2: Ticket Simple Dialogs

- [ ] Migrate `StarRatingDialog.js`
- [ ] Migrate `MoLaiDialog.js`
- [ ] Migrate `AppealDialog.js`
- [ ] Migrate `GuiVeKhoaDialog.js`

### Phase 3: Ticket Form Dialog

- [ ] Migrate `YeuCauFormDialog.js`

### Phase 4: CongViec Dialogs

- [ ] Migrate `ConfirmActionDialog.js`
- [ ] Migrate `ProgressConfirmDialog.js`
- [ ] Migrate `ProgressEditDialog.js`
- [ ] Migrate `ColorLegendDialog.js`
- [ ] Migrate `AdminColorSettingsDialog.js`

### Phase 5: Complex (Optional)

- [ ] Quyết định approach cho `CongViecFormDialog.js`
- [ ] Implement nếu cần

### Phase 6: Testing

- [ ] Test iOS mobile
- [ ] Test Android mobile
- [ ] Test Desktop
- [ ] Verify all animations
- [ ] Verify safe area padding

---

## 📁 File Structure Sau Khi Hoàn Thành

- [ ] Test form validation thoroughly

### Phase 4: CongViec Dialogs

- [ ] Migrate `ConfirmActionDialog.jsx`
- [ ] Migrate `ProgressConfirmDialog.jsx`
- [ ] Migrate `ColorLegendDialog.js`
- [ ] Migrate `AdminColorSettingsDialog.js`

### Phase 5 ├── StarRatingDialog.js # ✅ Migrated

│ │ ├── MoLaiDialog.js # ✅ Migrated
│ │ ├── AppealDialog.js # ✅ Migrated
│ │ ├── GuiVeKhoaDialog.js # ✅ Migrated
│ │ └── YeuCauFormDialog.js # ✅ Migrated
│ │
│ └── CongViec/
│ └── components/
│ ├── ConfirmActionDialog.js # ✅ Migrated
│ ├── ProgressConfirmDialog.js # ✅ Migrated
│ ├── ProgressEditDialog.js # ✅ Migrated
│ ├── ColorLegendDialog.js # ✅ Migrated
│ ├── AdminColorSettingsDialog.js # ✅ Migrated
│ └── CongViecFormDialog.js # ⚠️ Optional/Keep fullScreen

````

---

## ⏱️ Ước Tính Thời Gian

| Phase                         | Công việc                      | Thời gian  |
| ----------------------------- | ------------------------------ | ---------- |
| 1                             | Setup & Move BottomSheetDialog | 30 phút    |
| 2                             | Ticket Simple Dialogs (4)      | 45 phút    |
| 3                             | YeuCauFormDialog               | 30 phút    |
| 4                             | CongViec Dialogs (5)           | 45 phút    |
| 5                             | Complex Forms (Optional)       | 1+ giờ     |
| 6                             | Testing                        | 30 phút    |
| **Tổng (không tính Phase 5)** |                                | **~3 giờ** |

---

## 🚀 Bắt Đầu

Để triển khai trong conversation mới, copy nội dung này và nói:

> "Tôi muốn triển khai kế hoạch Dialog Standardization. Hãy bắt đầu với Phase 1: Tạo shared BottomSheetDialog component với safe area padding."
├── CongViecFormDialog.js      # ⏸️ KHÔNG xử lý (quá phức tạp)
│           ├── CongViecDetailDialog.js    # ⏸️ KHÔNG xử lý (quá phức tạp)
│           └── components/
│               ├── ConfirmActionDialog.jsx    # ✅ Migrated
│               ├── ProgressConfirmDialog.jsx  # ✅ Migrated
│               ├── ColorLegendDialog.js       # ✅ Migrated
│               └── AdminColorSettingsDialog.js # ✅ Migrated
## 📝 Ghi Chú Bổ Sung

### Lý Do | Công việc                      | Thời gian  |
| ------- | ------------------------------ | ---------- |
| 1       | Setup & Move BottomSheetDialog | 30 phút    |
| 2       | Ticket Simple Dialogs (4)      | 45 phút    |
| 3       | YeuCauFormDialog               | 45 phút    |
| 4       | CongViec Dialogs (4)           | 30 phút    |
| 5       | Testing                        | 30 phút    |
| **Tổng** |                                | **~3 giờ** |

**Scope giảm**: Không bao gồm CongViecFormDialog và CongViecDetailDialog (sẽ xử lý riêng trong plan khác).
1. Form phức tạp >10 fields → Dùng `fullScreen` mode
2. Dialog chứa table/danh sách dài → Dùng fullScreen
3. Dialog cần scroll ngang → Cân nhắc fullScreen

### Mobile Breakpoint

```jsx
const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
````

---

_Tạo ngày: 16/01/2026_
_Dự án: fe-bcgiaobanbvt - Hospital Management System_

### Safe Area Padding Best Practice

```jsx
// Sử dụng fallback cho browsers không support env()
pb: "calc(env(safe-area-inset-bottom, 0px) + 16px)";

// Hoặc với max() (CSS modern)
pb: "max(env(safe-area-inset-bottom, 16px) + 16px, 16px)";
```

**Lưu ý**: Không cần thêm `viewport-fit=cover` trong HTML meta tag nếu app không yêu cầu full-bleed layout.

---

_Tạo ngày: 16/01/2026_  
_Cập nhật: 16/01/2026 - Scope adjustment sau discovery_
